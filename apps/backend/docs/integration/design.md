# Design: Integration Module

## 1. Module Structure

```
apps/backend/src/modules/integration/
├── integration.module.ts          # NestJS module
├── integration.service.ts         # Connection lifecycle + execute() + OnApplicationShutdown
├── integration.rpc.ts             # Thin RPC controller — input destructuring only
├── datasource-config.service.ts   # Config CRUD with logging + auto connection release
└── driver/
    ├── driver.interface.ts        # Driver interface (factory pattern)
    └── postgresql.driver.ts       # PG driver (first implementation)

packages/db/src/entities/
└── external-datasource.entity.ts  # External datasource config persistence

packages/rpc/src/
└── integration.ts                 # oRPC contract with discriminated union for type+config
```

## 2. Entity: ExternalDataSource

Flexible JSON config field so new datasource types don't require schema migrations.

```ts
// packages/db/src/entities/external-datasource.entity.ts
@Entity({ tableName: "external_datasource" })
export class ExternalDataSource {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv7();

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true, length: 500 })
  description?: string;

  @Property()
  type!: string; // "postgresql" | "mysql" | "duckdb" | "rest-api" ...

  @Property({ type: "json" })
  config!: Record<string, unknown>;

  @Property({ default: true })
  enabled!: boolean;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

Sensitive fields (e.g. `password`) live inside `config` JSON.

## 3. Driver Interface (Factory Pattern)

One interface for all datasource types. Adding a type = one file + one registry entry.

```ts
// driver/driver.interface.ts
export interface DataSourceDriver {
  createConnection(config: Record<string, unknown>): unknown;
  execute(
    conn: unknown,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]>;
  testConnection(
    config: Record<string, unknown>,
  ): Promise<{ ok: true } | { ok: false; error: string }>;
  end(conn: unknown): Promise<void>;
}
```

### PostgreSQL driver

```ts
// driver/postgresql.driver.ts
export class PostgresqlDriver implements DataSourceDriver {
  createConnection(config) {
    // Returns pg.Pool (default max 5, idle timeout 60s)
  }
  async execute(conn, input) {
    // input: { sql: string, params?: unknown[] }
    // SELECT-only enforcement. Returns result.rows.
    // Retries once on connection-level errors (SQLSTATE "08*").
  }
  async testConnection(config) {
    // Opens a short-lived pg.Client, runs SELECT 1, tears down.
    // Returns { ok: true } on success, or { ok: false, error: "..." } on failure.
    // Intentionally uses a fresh Client (not the pool).
  }
  async end(conn) {
    // await conn.end()
  }
}
```

### Driver registry (stateless, inside IntegrationService)

```ts
const drivers = new Map<string, DataSourceDriver>([
  ["postgresql", new PostgresqlDriver()],
]);
```

Multiple data sources of the same type share one driver instance but get independent connections:

```
sourceId=A ──→ { conn: pg.Pool₁, driver: PostgresqlDriver }
sourceId=B ──→ { conn: pg.Pool₂, driver: PostgresqlDriver }  ← same driver
```

## 4. Services

### DatasourceConfigService — config CRUD with logging

CRUD for `ExternalDataSource` rows. Every mutation logs the action. Update and remove automatically call `IntegrationService.release()` to tear down cached connections. Release errors are caught and logged — they never block the config mutation.

```ts
@Injectable()
export class DatasourceConfigService {
  constructor(logger, em, integration: IntegrationService) {}

  list(): Promise<ExternalDataSource[]>;
  get(id: string): Promise<ExternalDataSource>;

  // Only name, description, type, and config are accepted from input.
  // enabled, createdAt, and updatedAt are set by the service.
  // Config is always saved regardless of test outcome.
  create(input: {
    name: string;
    description?: string;
    type: string;
    config: Record<string, unknown>;
  }): Promise<SaveResult>;

  // Only name, description, and config may be updated. Type is immutable.
  update(
    id: string,
    data: Partial<Pick<ExternalDataSource, "name" | "description" | "config">>,
  ): Promise<SaveResult>;

  // Deletes config, then best-effort releases connection.
  remove(id: string): Promise<void>;
}

interface SaveResult extends ExternalDataSource {
  connectionTest: { ok: boolean; error?: string };
}
```

### IntegrationService — connection lifecycle + generic execution

Lazy connection management. Connections are created on first `execute()` and cached by sourceId. `release()` tears down a cached connection (called automatically by `DatasourceConfigService` on update/remove). `testConnection()` delegates to the driver without touching the cache. Implements `OnApplicationShutdown` to drain all cached connections on process exit.

```ts
@Injectable()
export class IntegrationService implements OnApplicationShutdown {
  constructor(logger, em: EntityManager) {}

  testConnection(type, config): Promise<{ ok: boolean; error?: string }>;
  release(sourceId): Promise<void>;
  execute(sourceId, input): Promise<Record<string, unknown>[]>;
  onApplicationShutdown(): Promise<void>;
}
```

| Scenario           | Behaviour                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| First execute      | DB lookup → driver.createConnection → cache                                 |
| Subsequent execute | Use cached connection                                                       |
| Config update      | DatasourceConfigService saves → release() → test connection → return result |
| Config delete      | DatasourceConfigService deletes → release() (best-effort)                   |
| App shutdown       | Release all cached connections via Promise.all                              |

## 5. RPC Contract

All paths use POST on singular `/integration/`. Create and test endpoints use a **discriminated union** so each driver type validates its own config shape.

```ts
// packages/rpc/src/integration.ts

const pgConfig = z.object({
  host: z.string(),
  port: z.number().int().min(1).max(65535).default(5432),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  max: z.number().int().min(1).max(100).optional().describe("Max pool size (default 5)"),
}).passthrough();

// Discriminated union: type determines config shape.
// Add a new entry here when implementing a new driver.
const typeWithConfig = z.discriminatedUnion("type", [
  z.object({ type: z.literal("postgresql"), config: pgConfig }),
]);

export const integrationContract = {
  list:   POST /integration/list   → ExternalDataSource[]
  get:    POST /integration/get    → ExternalDataSource
  create: POST /integration/create → ExternalDataSource + { connectionTest }
            input: typeWithConfig & { name, description? }
  update: POST /integration/update → ExternalDataSource + { connectionTest }
            input: { id, name?, description?, config?: z.record(z.unknown()) }
  remove: POST /integration/remove → void
  test:   POST /integration/test   → { ok: boolean; error?: string }
            input: typeWithConfig
};
```

- `list` / `get` / `remove` / `test` delegate directly to `DatasourceConfigService` or `IntegrationService`.
- `create` and `update` return the persisted config **plus** a `connectionTest` field so callers can surface connectivity warnings without a separate round-trip.
- `test` is a standalone endpoint for testing a driver config without persisting.
- **Discriminated union**: `create` and `test` inputs use `z.discriminatedUnion("type", ...)` so Zod validates the config shape against the declared type. Adding a new driver type means adding an entry to the union.

## 6. Internal Usage

Other NestJS modules inject `IntegrationService` and call `execute()`. This is an internal API — not exposed via HTTP/RPC.

```ts
@Injectable()
export class SomeOtherService {
  constructor(private readonly integration: IntegrationService) {}

  async getExternalData() {
    return this.integration.execute("uuid-1", {
      sql: "SELECT * FROM users LIMIT 10",
    });
  }
}
```

## 7. Controller Principle

The RPC controller (`IntegrationRPC`) only destructures `input` and delegates to services. No `EntityManager`, no business logic.

```ts
@Controller("rpc")
export class IntegrationRPC {
  constructor(
    configService: DatasourceConfigService,
    integration: IntegrationService,
  ) {}

  @Implement(contract.integration.create)
  async create() {
    return implement(contract.integration.create).handler(async ({ input }) => {
      return this.configService.create(input);
    });
  }
  // ... same pattern for all endpoints
}
```

## 8. Error Handling

- **Config validation**: Zod discriminated union rejects unknown driver types and validates config shapes before the handler runs.
- **Connection test failures**: never block config save. Return `{ ok: false, error }` alongside the persisted record.
- **Release failures**: caught and logged as warnings; config DELETE/UPDATE always succeeds.
- **SELECT-only enforcement**: driver throws before reaching the remote database.
- **Connection-level retries**: the PG driver retries once on SQLSTATE "08\*" connection errors (e.g. stale pool connection); syntax/semantic errors are not retried.
- **Parameterised queries**: `pg` uses `$1, $2` placeholders — SQL injection safe.

## 9. Dependencies

```
apps/backend/package.json:  pg (catalog), uuid (^11)
packages/db/package.json:   uuid (^11)
pnpm-workspace.yaml:        uuid: ^11  (catalog)
```

## 10. Verification

```bash
pnpm exec turbo run build lint check-types test \
  --filter=@lentil/backend --filter=@lentil/db --filter=@lentil/rpc
```
