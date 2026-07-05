# Design: RPC Layer

## 1. Module Structure

```
apps/backend/src/
├── app.module.ts                        # ORPCModule.forRootAsync({}) + interceptor
├── main.ts                              # Bootstrap
├── common/config/
│   ├── index.ts                         # Barrel exports
│   ├── setup.ts                         # Global NestJS config (CORS, pipes)
│   ├── setup-apidoc.ts                  # Swagger setup
│   ├── setup-dashboard.ts               # SPA fallback
│   └── orpc-interceptor.ts              # Procedure-level error logging interceptor
└── modules/
    ├── general/general.rpc.ts           # Health check + OpenAPI spec at /rpc/spec
    ├── integration/integration.rpc.ts   # Data source config CRUD
    └── scrape/scrape.rpc.ts             # Query execution & cache

packages/rpc/src/
├── index.ts                        # Merged contract export
├── general.ts                      # Health check contract
├── integration.ts                  # Integration contracts + discriminated unions
└── scrape.ts                       # Scrape contracts + Zod schemas
```

## 2. Technology Stack

| Package          | Version | Role                              |
| ---------------- | ------- | --------------------------------- |
| `@orpc/nest`     | 1.14.x  | NestJS integration (decorators)   |
| `@orpc/server`   | 1.14.x  | Procedure handling + middleware   |
| `@orpc/contract` | 1.14.x  | Contract definition + Zod binding |
| `@orpc/client`   | 1.14.x  | Client-side typed RPC calls       |
| `@orpc/openapi`  | 1.14.x  | OpenAPI spec generation           |
| `@orpc/zod`      | 1.14.x  | Zod → JSON schema converter       |
| `zod`            | catalog | Schema validation                 |

All mounted via `ORPCModule.forRootAsync({})` in `AppModule` with the
procedure-level logging interceptor wired in.

## 3. Contract Layer (`packages/rpc/src/`)

Contracts are defined using `@orpc/contract` with Zod schemas for input/output
validation. Each module has its own contract file (e.g. `scrape.ts`), and all
are merged into a single `contract` object exported from `packages/rpc/src/index.ts`.

### Design Principles

- **POST for all RPC procedures** — avoids caching & serialisation edge cases
  (GET is reserved for the OpenAPI spec page).
- **Zod schemas co-located** with the contract they validate — one file per
  module in `packages/rpc/src/`.
- **`.describe()` on every field** — feeds the OpenAPI spec generation.
- **Discriminated unions** for type-dependent configs (see `integration.ts`
  where `type: "postgresql"` determines the `config` schema shape).
- **Contracts are the single source of truth** — the NestJS controller
  implements them, the dashboard client consumes them via `@orpc/client`.

### Current Route Table

| Path                      | Method | Procedure            | Module           | Input                         | Output                 |
| ------------------------- | ------ | -------------------- | ---------------- | ----------------------------- | ---------------------- |
| `/rpc/health`             | POST   | `general.health`     | `GeneralRPC`     | —                             | `{ status }`           |
| `/rpc/spec`               | GET    | — (raw NestJS)       | `GeneralRPC`     | —                             | OpenAPI JSON           |
| `/rpc/integration/list`   | POST   | `integration.list`   | `IntegrationRPC` | —                             | `ExternalDataSource[]` |
| `/rpc/integration/get`    | POST   | `integration.get`    | `IntegrationRPC` | `{ id }`                      | `ExternalDataSource`   |
| `/rpc/integration/create` | POST   | `integration.create` | `IntegrationRPC` | `{ name, type, config, ... }` | `SaveDatasourceResult` |
| `/rpc/integration/update` | POST   | `integration.update` | `IntegrationRPC` | `{ id, name?, config?, ... }` | `SaveDatasourceResult` |
| `/rpc/integration/remove` | POST   | `integration.remove` | `IntegrationRPC` | `{ id }`                      | `void`                 |
| `/rpc/integration/test`   | POST   | `integration.test`   | `IntegrationRPC` | `{ type, config }`            | `ConnectionTest`       |
| `/rpc/scrape/execute`     | POST   | `scrape.execute`     | `ScrapeRPC`      | `{ datasourceId, query }`     | `ScrapeCache`          |
| `/rpc/scrape/list`        | POST   | `scrape.list`        | `ScrapeRPC`      | —                             | `ScrapeCache[]`        |
| `/rpc/scrape/get`         | POST   | `scrape.get`         | `ScrapeRPC`      | `{ id }`                      | `ScrapeCache`          |
| `/rpc/scrape/remove`      | POST   | `scrape.remove`      | `ScrapeRPC`      | `{ id }`                      | `void`                 |

### Adding a New Procedure

1. Define Zod schemas + contract in `packages/rpc/src/<module>.ts`
2. Export from `packages/rpc/src/index.ts` (contract + types)
3. Create a NestJS controller with `@Implement(contract.<module>.<procedure>)`
4. Register the controller in a NestJS `@Module()`
5. Import the module in `AppModule`
6. Add the RPC client method to the `RPCClient` interface in `apps/dashboard/src/lib/rpc.ts`

## 4. Controller Layer (`apps/backend/src/modules/*.rpc.ts`)

Controllers follow a strict thin-controller pattern:

1. Method annotated with `@Implement(contract.<module>.<procedure>)`
2. Method returns `implement(contract.<module>.<procedure>).handler(...)`
3. Handler destructures `input` and delegates to a service
4. No business logic, no direct `EntityManager` usage

```typescript
// Example: ScrapeRPC
@Controller("rpc")
export class ScrapeRPC {
  constructor(private readonly scrapeService: ScrapeService) {}

  @Implement(contract.scrape.execute)
  execute() {
    return implement(contract.scrape.execute).handler(async ({ input }) => {
      return await this.scrapeService.execute(input);
    });
  }
}
```

## 5. Error Handling

Errors are handled **inside** the oRPC pipeline, not via NestJS exception
filters. The `StandardHandler` wraps everything in a try-catch: validation
errors, handler errors, and output validation errors are all caught, encoded
as standard HTTP responses via `encodeError()`, and sent directly through the
Express response object. This means oRPC errors **never reach** NestJS's
exception filter layer.

### Error Flow

```
createProcedureClient
  └─ interceptors [logging interceptor]   ← catches & logs, then re-throws
       └─ executeProcedureInternal
            ├─ validateInput  → ORPCError('BAD_REQUEST', ...)
            ├─ middleware chain
            ├─ handler
            └─ validateOutput → ORPCError('INTERNAL_SERVER_ERROR', ...)
                                   ↓
                            StandardHandler catches it
                                   ↓
                            encodeError() → HTTP response
```

### Procedure-Level Logging Interceptor

Rather than parsing the HTTP response body (as a `sendResponseInterceptor`
would), a **procedure-level interceptor** wraps the call to
executeProcedureInternal. This gives access to `path` (the procedure path,
e.g. `"scrape.execute"`) and `input` (the decoded request body) for
structured logging, and runs **before** `StandardHandler` catches the error.

The interceptor is defined in `src/common/config/orpc-interceptor.ts` and
wired into every procedure via `ORPCModule.forRootAsync()`:

```typescript
// app.module.ts (simplified)
ORPCModule.forRootAsync({
  inject: [APP_LOGGER],
  useFactory: (logger) => ({
    interceptors: [createLoggingInterceptor(logger) as any],
  }),
});
```

```typescript
// src/common/config/orpc-interceptor.ts
export const createLoggingInterceptor = (logger: pino.Logger) => {
  return async (options: {
    path?: string[];
    input?: unknown;
    next: (opts?: unknown) => Promise<unknown>;
  }) => {
    try {
      return await options.next();
    } catch (err: unknown) {
      const path = options.path?.join(".") ?? "unknown";

      if (err instanceof ORPCError) {
        const hasValidationCause =
          (err as Error).cause?.constructor?.name === "ValidationError";

        if (err.code === "BAD_REQUEST" && hasValidationCause) {
          // Input validation → warn with path + Zod issues
          logger.warn({ path, issues, input }, "RPC input validation failed");
        } else if (err.code === "INTERNAL_SERVER_ERROR" && hasValidationCause) {
          // Output validation → error with path (details stripped)
          logger.error({ path, issues }, "RPC output validation failed");
        } else {
          logger.warn({ path, code: err.code }, "RPC error: %s", err.message);
        }
      } else {
        logger.error({ path, error: String(err) }, "RPC unexpected error");
      }

      throw err; // re-throw — StandardHandler encodes the HTTP response
    }
  };
};
```

### Error Classification

| Scenario                    | oRPC throws                               | HTTP Status | Response Body (oRPC default)      | Log level |
| --------------------------- | ----------------------------------------- | ----------- | --------------------------------- | --------- |
| Input Zod validation fails  | `ORPCError('BAD_REQUEST', ...)`           | **400**     | `{ code, status, message, data }` | `warn`    |
| Output Zod validation fails | `ORPCError('INTERNAL_SERVER_ERROR', ...)` | **500**     | `{ code, status, message }`       | `error`   |
| Other oRPC errors           | `ORPCError(code, ...)`                    | Built-in    | `{ code, status, message }`       | `warn`    |
| NestJS built-in exceptions  | `BadRequestException`, etc.               | Built-in    | NestJS default                    | —         |

Note: the response body is the oRPC-native serialized `ORPCError.toJSON()`
format — not reformatted by the interceptor. The interceptor only handles
logging; `StandardHandler.encodeError()` is responsible for the HTTP response.

NestJS built-in exceptions are **not** handled by this interceptor — they
are still caught by NestJS's default `BaseExceptionFilter`.

### Why not a NestJS Exception Filter?

The `StandardHandler` catches all errors internally via try-catch. Errors are
converted to HTTP responses by `encodeError()` and sent directly through
Express/Fastify, bypassing NestJS's exception filter pipeline entirely. A
NestJS `@Catch()` filter would never receive these errors.

### Why not a sendResponseInterceptor?

A `sendResponseInterceptor` fires after the error has been serialised into
the response body. Parsing the JSON body to detect error types is fragile.
The procedure-level interceptor runs **before** the error is caught by
`StandardHandler`, giving direct access to the typed ORPCError object,
the procedure path, and the request input.

## 6. OpenAPI / Spec Generation

The `/rpc/spec` endpoint (GET) serves an auto-generated OpenAPI 3.0 specification
built from the oRPC contract. It is consumed by the Scalar API reference UI
hosted at `/reference`.

```typescript
// general.rpc.ts
const openapiGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

@Get("spec")
spec() {
  return openapiGenerator.generate(contract, {
    info: { title: "Lentil API", version: "1.0.0" },
    servers: [{ url: `${scheme}://${host}:${port}/rpc` }],
  });
}
```

Controlled by the `RPC_SPEC_ENABLED` environment variable (default: `true`).

## 7. Client Side (`apps/dashboard/src/lib/rpc.ts`)

The dashboard uses `@orpc/client` with an `OpenAPILink` to make typed RPC calls:

```typescript
const link = new OpenAPILink(contract, { url: "/rpc" });
export const rpc: RPCClient = createORPCClient(link);
```

The `RPCClient` interface is manually maintained to provide compile-time
type checking. It should be updated alongside the contract definitions.

### Timeout Configuration

All RPC calls use a 30-second timeout via `AbortSignal.timeout()`:

```typescript
const RPC_TIMEOUT_MS = 30_000;
const timeoutSignal = AbortSignal.timeout(RPC_TIMEOUT_MS);
```
