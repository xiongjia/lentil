# Scrape Module — Design Document

The Scrape module lets users execute read-only SQL queries against configured
external data sources and cache the results locally for later review.

---

## Architecture Overview

```
┌──────────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│   Dashboard (React)  │────▶│  Backend (NestJS)    │────▶│  External Data    │
│                      │     │                      │     │  Source (PG/...)  │
│  scrape.tsx          │     │  ScrapeRPC (oRPC)    │     │                   │
│                      │     │         │            │     └───────────────────┘
│  rpc.ts (client)     │     │  ScrapeService       │
│                      │     │         │            │     ┌───────────────────┐
└──────────────────────┘     │  IntegrationService  │────▶│  scrape_cache     │
                             │                      │     │  (MikroORM)       │
                             │  ScrapeCacheEntity   │     └───────────────────┘
                             └──────────────────────┘
```

**Cross-package dependency chain:**

```
packages/rpc/src/scrape.ts    ── contract + Zod schemas
packages/db/                   ── entity + migration
apps/backend/src/modules/      ── service + RPC controller
apps/dashboard/src/pages/      ── React page
```

---

## Contract Layer (`packages/rpc/src/scrape.ts`)

Defines the typed API contract using oRPC + Zod. All four procedures are
mounted under the shared `contract` object exported by `@lentil/rpc`.

### Procedures

| Procedure | Method | Path              | Input                     | Output          |
| --------- | ------ | ----------------- | ------------------------- | --------------- |
| `execute` | POST   | `/scrape/execute` | `{ datasourceId, query }` | `ScrapeCache`   |
| `list`    | POST   | `/scrape/list`    | — (none)                  | `ScrapeCache[]` |
| `get`     | POST   | `/scrape/get`     | `{ id }`                  | `ScrapeCache`   |
| `remove`  | POST   | `/scrape/remove`  | `{ id }`                  | `void`          |

### Schema: `ScrapeCache`

| Field          | Type                          | Notes                                    |
| -------------- | ----------------------------- | ---------------------------------------- |
| `id`           | `string (UUID v7)`            | Primary key                              |
| `datasourceId` | `string`                      | References an `external_datasource`      |
| `query`        | `string`                      | The executed query (with LIMIT if added) |
| `status`       | `enum: running, done, failed` | Execution lifecycle                      |
| `columns`      | `string[]`                    | Column names extracted from result       |
| `rows`         | `Record<string, unknown>[]`   | Result rows as key-value objects         |
| `rowCount`     | `number`                      | Number of rows in result                 |
| `error`        | `string \| null \| undefined` | Error message on failure                 |
| `createdAt`    | `Date`                        | Row creation timestamp                   |
| `updatedAt`    | `Date`                        | Row last-update timestamp                |

### Schema: `executeInput`

| Field          | Type            | Constraint    |
| -------------- | --------------- | ------------- |
| `datasourceId` | `string (UUID)` | —             |
| `query`        | `string`        | `.max(10000)` |

---

## Database Layer

### Entity (`packages/db/src/entities/scrape-cache.entity.ts`)

MikroORM entity mapped to the `scrape_cache` table.

| Column          | MikroORM Type  | SQL Type (PG) | SQL Type (SQLite)   | Notes                          |
| --------------- | -------------- | ------------- | ------------------- | ------------------------------ |
| `id`            | `uuid` (PK)    | `UUID`        | `TEXT`              | Generated via `uuidv7()`       |
| `datasource_id` | `string`       | `VARCHAR`     | `TEXT`              | No FK constraint (intentional) |
| `query`         | `string`       | `TEXT`        | `TEXT`              | —                              |
| `status`        | `string`       | `VARCHAR`     | `TEXT`              | Default: `'running'`           |
| `columns`       | `JsonType`     | `JSONB`       | `TEXT` (JSON)       | —                              |
| `rows`          | `JsonType`     | `JSONB`       | `TEXT` (JSON)       | —                              |
| `row_count`     | `number`       | `INTEGER`     | `INTEGER`           | Default: `0`                   |
| `error`         | `string?`      | `TEXT NULL`   | `TEXT NULL`         | —                              |
| `created_at`    | `DateTimeType` | `TIMESTAMPTZ` | `BIGINT` (epoch ms) | Default: `NOW()`               |
| `updated_at`    | `DateTimeType` | `TIMESTAMPTZ` | `BIGINT` (epoch ms) | Auto-updated on change         |

### Migration (`packages/db/migrations/002-scrape-cache.ts`)

Applies to both PostgreSQL and SQLite/libsql. The `down()` method drops the
table.

---

## Service Layer (`apps/backend/src/modules/scrape/scrape.service.ts`)

### `execute(input)` — Query Execution Lifecycle

```
┌──────────┐     ┌──────────┐     ┌───────────┐
│ validate │────▶│  create  │────▶│ execute   │
│ query    │     │  entity  │     │ via       │
│ guard    │     │(running) │     │Integra-   │
└──────────┘     └──────────┘     │tionService│
                                  └────┬──────┘
                                       │
                            ┌──────────┴──────────┐
                            ▼                     ▼
                       ┌──────────┐         ┌──────────┐
                       │ success  │         │ failure  │
                       │ status=  │         │ status=  │
                       │ "done"   │         │ "failed" │
                       │ columns, │         │ error=   │
                       │ rows,    │         │ message  │
                       │ rowCount │         └──────────┘
                       └──────────┘
```

**Step-by-step:**

1. **Query validation** — Rejects non-SELECT/WITH queries via `BadRequestException`.
   - `SELECT ...` → allowed
   - `WITH ... SELECT ...` → allowed
   - `DELETE`, `DROP`, `INSERT`, `UPDATE`, `TRUNCATE` → rejected

2. **Result size capping** — Appends `LIMIT 10000` if the query doesn't already
   have a `LIMIT` clause. Detects existing `LIMIT N` and `LIMIT N OFFSET M`
   patterns to avoid duplicate clauses.

3. **Entity creation** — Creates a `ScrapeCacheEntity` with `status: "running"`
   and persists it immediately via `persistAndFlush()`.

4. **Execution** — Delegates to `IntegrationService.execute()` which resolves the
   data source connection and runs the query.

5. **Result handling**:
   - **Success**: extracts column names from the first row's keys, stores rows,
     updates status to `"done"`, flushes.
   - **Failure**: catches the error, updates status to `"failed"` with the error
     message, flushes.

6. **Logging** — Each execution outcome is logged with structured context (`id`,
   `datasourceId`, `rowCount`, `error`).

### `list()` — List Cache Entries

Returns all entries ordered by `updatedAt` descending (most recent first).

### `get(id)` — Single Cache Entry

Returns one entry by UUID. Throws `NotFoundException` if missing.

### `remove(id)` — Delete Cache Entry

Deletes one entry by UUID. Throws `NotFoundException` if missing.

### Dependencies

| Dependency           | Source            | Role                                 |
| -------------------- | ----------------- | ------------------------------------ |
| `EntityManager`      | `@mikro-orm/core` | Database CRUD                        |
| `IntegrationService` | `../integration/` | Execute SQL on external data sources |
| `APP_LOGGER`         | `../providers/`   | Pino logger injection                |
| `ScrapeCacheEntity`  | `@lentil/db`      | ORM entity                           |
| `ScrapeCache`        | `@lentil/rpc`     | DTO type (output)                    |
| `ScrapeExecuteInput` | `@lentil/rpc`     | DTO type (input)                     |

---

## RPC Controller (`apps/backend/src/modules/scrape/scrape.rpc.ts`)

Thin NestJS controller mounted at `/rpc` that wires oRPC contract procedures
to service methods. Uses the `@Implement` decorator from `@orpc/nest`.

Each method returns the result of `implement(contract.scrape.X).handler(...)`.
No business logic exists in the controller — it only destructures input and
delegates to `ScrapeService`.

---

## Module (`apps/backend/src/modules/scrape/scrape.module.ts`)

Standard NestJS module:

```typescript
@Module({
  imports: [IntegrationModule], // ← provides IntegrationService
  controllers: [ScrapeRPC],
  providers: [ScrapeService],
})
export class ScrapeModule {}
```

Registered in the root `AppModule`.

---

## Dashboard Integration (`apps/dashboard/src/pages/scrape.tsx`)

React page with three sections:

### 1. Query Execution Form

- Data source `<select>` dropdown (populated from `rpc.integration.list()`)
- SQL query `<Input>` field (monospace, placeholder `SELECT ...`)
- **Execute** button (disabled while running or when no datasources exist)
- Error display for datasource load failures and execution errors

### 2. Cached Results Table

- Columns: Status, Datasource (truncated UUID), Query (truncated), Rows, Time, Actions
- Color-coded status badges (green=done, red=failed, blue=running)
- **View** button opens result dialog (disabled unless `status === "done"`)
- **Delete** button with loading state (`deleting` set disables the button)
- Error display for cache list load failures
- Empty state: "No cached results yet"

### 3. Result View Dialog

- Modal dialog showing columns as table headers and rows as table data
- Empty result message when query returns 0 rows
- Error display when status is `"failed"`

### Error States

| Scenario              | UI Behavior                                 |
| --------------------- | ------------------------------------------- |
| Datasource list fails | Shows `dsError` in execute form             |
| Cache list fails      | Shows `cacheError` above table              |
| Execution fails       | Shows `error` in execute form               |
| Delete fails          | Shows `error` in execute form               |
| No datasources exist  | Placeholder option, Execute button disabled |

### RPC Client (`apps/dashboard/src/lib/rpc.ts`)

The `RPCClient` interface mirrors the contract. The `scrape` namespace exposes:

```typescript
scrape: {
  execute(input: ScrapeExecuteInput): Promise<ScrapeCache>;
  list(): Promise<ScrapeCache[]>;
  get(input: { id: string }): Promise<ScrapeCache>;
  remove(input: { id: string }): Promise<void>;
}
```

---

## Security Considerations

| Concern                | Mitigation                                        |
| ---------------------- | ------------------------------------------------- |
| SQL injection          | Query guard rejects non-SELECT/WITH statements    |
|                        | Zod schema enforces `.max(10000)` on query input  |
| Destructive SQL        | Only SELECT/WITH allowed at service layer         |
| Result set size        | `LIMIT 10000` appended server-side                |
| Unbounded query length | Zod `.max(10000)` on input schema                 |
| Orphaned cache rows    | No FK to `external_datasource` (known limitation) |

---

## Performance Notes

- **Flush strategy**: One `persistAndFlush` before execution, one `flush` after
  (2 DB round-trips vs 3 in the initial design).
- **Result storage**: Entire result set stored as JSON in the `rows` column.
  Large results will increase DB storage and read latency.
- **No pagination on `list()`**: Returns all cache entries. May need pagination
  as the cache grows over time.

---

## Test Coverage (`scrape.service.test.ts`)

50 tests organized by method:

| Group     | Tests | What's Covered                                                   |
| --------- | ----- | ---------------------------------------------------------------- |
| `execute` | 9     | Success path, SQL guard (DELETE/DROP/WITH), LIMIT appending,     |
|           |       | trailing semicolon, existing LIMIT, LIMIT+OFFSET, empty results, |
|           |       | error handling                                                   |
| `list`    | 2     | Empty list, multiple entries                                     |
| `get`     | 1     | Single entry lookup                                              |
| `remove`  | 1     | Deletion + flush                                                 |
| Sanity    | 1     | Service is defined                                               |
