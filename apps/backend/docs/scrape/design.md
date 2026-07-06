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

| Procedure | Method | Path              | Input                      | Output                 |
| --------- | ------ | ----------------- | -------------------------- | ---------------------- |
| `execute` | POST   | `/scrape/execute` | `{ datasourceId, query }`  | `ScrapeCache`          |
| `list`    | POST   | `/scrape/list`    | — (none)                   | `ScrapeCacheSummary[]` |
| `get`     | POST   | `/scrape/get`     | `{ id, page?, pageSize? }` | `PaginatedScrapeCache` |
| `refresh` | POST   | `/scrape/refresh` | `{ id }`                   | `ScrapeCache`          |
| `remove`  | POST   | `/scrape/remove`  | `{ id }`                   | `void`                 |

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

### Schema: `ScrapeCacheSummary`

Same as `ScrapeCache` but **omits the `rows` field**. Used by `list()` to reduce
payload size — the cache list page only displays metadata, not row data.

### Schema: `PaginationInput`

| Field      | Type            | Default | Constraint  |
| ---------- | --------------- | ------- | ----------- |
| `id`       | `string (UUID)` | —       | —           |
| `page`     | `number`        | `1`     | `.min(1)`   |
| `pageSize` | `number`        | `50`    | `.min(1)`   |
|            |                 |         | `.max(500)` |

### Schema: `PaginatedScrapeCache`

Extends `ScrapeCache` with three pagination metadata fields:

| Field        | Type     | Notes                      |
| ------------ | -------- | -------------------------- |
| `page`       | `number` | Current page (1-based)     |
| `pageSize`   | `number` | Rows per page              |
| `totalPages` | `number` | Total pages for this cache |

All other `ScrapeCache` fields remain, but `rows` only contains the current
page's slice of data — not the full result set.

### Schema: `refreshInput`

| Field | Type            | Constraint |
| ----- | --------------- | ---------- |
| `id`  | `string (UUID)` | —          |

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

### `list()` — List Cache Entries (Summary)

Returns all entries as `ScrapeCacheSummary[]` ordered by `updatedAt` descending
(most recent first). The `rows` field is excluded from the response to minimize
payload size. Only `columns`, `rowCount`, and other metadata are returned.

### `get(id)` — Single Cache Entry (Full)

Returns one entry by UUID with the complete `rows` array. Throws
`NotFoundException` if missing. Intended for programmatic access / export;
prefer `getPaginated()` for UI display.

### `getPaginated(id, page?, pageSize?)` — Paginated Row Access

Returns one entry by UUID with only the requested page slice of `rows`.

- **Pagination**: in-memory array slice (rows are stored as a single JSONB column)
- **Page clamping**: if `page` exceeds `totalPages`, it is clamped to the last
  valid page (never returns an empty page)
- **Returns**: `PaginatedScrapeCache` with `page`, `pageSize`, `totalPages`

### `remove(id)` — Delete Cache Entry

Deletes one entry by UUID. Throws `NotFoundException` if missing.

### `refresh(id)` — Async Re-execution

Re-executes an existing cached query and updates the result in the background.

```
┌────────────┐     ┌──────────────┐     ┌────────────────────┐
│  find      │────▶│  reset to    │────▶│  return DTO        │
│  entity    │     │  "running"   │     │  (status="running")│
└────────────┘     └──────┬───────┘     └─────────┬──────────┘
                          │                       │
                          │  flush                 │  (immediate)
                          ▼                       ▼
                   ┌───────────────┐        ┌───────────────┐
                   │  background   │        │  API response │
                   │  execution    │        │  returned to  │
                   │  (fire &      │        │  client       │
                   │   forget)     │        └───────────────┘
                   └──────┬────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
         ┌──────────┐          ┌──────────┐
         │ success  │          │ failure  │
         │ status=  │          │ status=  │
         │ "done"   │          │ "failed" │
         │ columns, │          │ error=   │
         │ rows,    │          │ message  │
         │ rowCount │          └──────────┘
         └──────────┘
```

**Step-by-step:**

1. **Find** — Looks up the existing cache entry by ID; throws `NotFoundException`
   if missing.
2. **Reset** — Sets `status: "running"`, clears `columns`, `rows`, `rowCount`,
   and `error`. Persists immediately.
3. **Fire** — Calls `executeRefresh()` as a fire-and-forget background task
   (`.catch()` attached to prevent unhandled promise rejections).
4. **Return** — Returns the DTO with `status: "running"` to the caller immediately.

**Background execution (`executeRefresh`):**

- Reuses the original `query` (already validated + LIMIT-appended by `execute`).
- Delegates to `IntegrationService.execute()` to run the SQL.
- On success: persists `status: "done"` with new `columns`, `rows`, `rowCount`.
- On failure: persists `status: "failed"` with the error message.
- Flush failures are logged but do not propagate (best-effort persistence).

### Dependencies

| Dependency             | Source            | Role                                 |
| ---------------------- | ----------------- | ------------------------------------ |
| `EntityManager`        | `@mikro-orm/core` | Database CRUD                        |
| `IntegrationService`   | `../integration/` | Execute SQL on external data sources |
| `APP_LOGGER`           | `../providers/`   | Pino logger injection                |
| `ScrapeCacheEntity`    | `@lentil/db`      | ORM entity                           |
| `ScrapeCache`          | `@lentil/rpc`     | DTO type (output)                    |
| `ScrapeCacheSummary`   | `@lentil/rpc`     | DTO type (list output)               |
| `PaginatedScrapeCache` | `@lentil/rpc`     | DTO type (paginated get output)      |
| `ScrapeExecuteInput`   | `@lentil/rpc`     | DTO type (input)                     |

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
- **Refresh** button starts async re-execution of a cached query (disabled while
  refreshing or when `status === "running"`; shows "Refreshing..." during polling)
- **View** button opens result dialog (disabled unless `status === "done"`)
- **Delete** button with loading state (`deleting` set disables the button)
- Error display for cache list load failures
- Empty state: "No cached results yet"

**Refresh polling flow**:

```
User clicks "Refresh" on a row
  → handleRefresh calls rpc.scrape.refresh({ id })
  → status set to "running" immediately
  → startPolling polls rpc.scrape.list() every 2 seconds
  → When entry.status !== "running", polling stops
  → "Refreshing..." indicator cleared
```

The polling uses `setTimeout` (not `setInterval`) to avoid overlapping requests.
A `useRef` tracks the timeout handle, and a `useEffect` cleanup clears it on
component unmount to prevent memory leaks.

### 3. Result View Dialog (Paginated)

- Modal dialog showing columns as table headers and rows as table data
- Pagination controls (Previous / Next) at the bottom when `totalPages > 1`
- **Loading state**: shows "Loading..." indicator while fetching a page
- Empty result message when query returns 0 rows
- Error display when status is `"failed"`

**Pagination flow**:

```
User clicks "View" on a row
  → handleView calls rpc.scrape.get({ id, page: 1, pageSize: 50 })
  → Dialog opens with first page of rows
User clicks "Previous" / "Next"
  → goToPage calls rpc.scrape.get({ id, page: N, pageSize: 50 })
  → Dialog shows the new page slice
```

Each page fetches a fresh request; the full rows array is never loaded client-
side. The `viewId` state tracks which cache entry is being browsed, and `viewData`
holds the latest paginated response.

### Error States

| Scenario              | UI Behavior                                 |
| --------------------- | ------------------------------------------- |
| Datasource list fails | Shows `dsError` in execute form             |
| Cache list fails      | Shows `cacheError` above table              |
| Execution fails       | Shows `error` in execute form               |
| Delete fails          | Shows `error` in execute form               |
| Refresh fails         | Shows `error` in execute form               |
| No datasources exist  | Placeholder option, Execute button disabled |

### RPC Client (`apps/dashboard/src/lib/rpc.ts`)

The `RPCClient` interface mirrors the contract. The `scrape` namespace exposes:

```typescript
import type { PaginatedScrapeCache, ScrapeCacheSummary } from "@lentil/rpc";

scrape: {
  execute(input: ScrapeExecuteInput): Promise<ScrapeCache>;
  list(): Promise<ScrapeCacheSummary[]>;
  get(input: { id: string; page?: number; pageSize?: number }): Promise<PaginatedScrapeCache>;
  refresh(input: { id: string }): Promise<ScrapeCache>;
  remove(input: { id: string }): Promise<void>;
}
```

The `list()` type was changed from `ScrapeCache[]` to `ScrapeCacheSummary[]`
(drops `rows`). The `get()` type accepts optional `page`/`pageSize` and returns
`PaginatedScrapeCache` with pagination metadata.

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
- **`list()` returns summary only**: The `rows` field is omitted from list
  responses to reduce payload size (each row can be large). Full row access is
  available via `get()` or `getPaginated()`.
- **`get()` pagination is in-memory**: Rows are stored as a single JSONB column;
  pagination slices the deserialized array. For very large result sets, a future
  optimization could store rows in a separate child table with indexed offsets.

---

## Test Coverage (`scrape.service.test.ts`)

63 tests organized by method:

| Group          | Tests | What's Covered                                                   |
| -------------- | ----- | ---------------------------------------------------------------- |
| `execute`      | 9     | Success path, SQL guard (DELETE/DROP/WITH), LIMIT appending,     |
|                |       | trailing semicolon, existing LIMIT, LIMIT+OFFSET, empty results, |
|                |       | error handling                                                   |
| `list`         | 2     | Empty list, multiple entries (returns summary without `rows`)    |
| `get`          | 1     | Single entry lookup (full rows)                                  |
| `getPaginated` | 6     | Default page, requested page, page clamping, empty rows,         |
|                |       | non-default pageSize, page === totalPages boundary               |
| `refresh`      | 2     | Reset to running + clear data, not-found throws                  |
| `remove`       | 1     | Deletion + flush                                                 |
| Sanity         | 1     | Service is defined                                               |
