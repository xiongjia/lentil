# @lentil/backend

NestJS REST API server with pino logger and Swagger UI.

## Tech Stack

- **Framework**: NestJS 11.x
- **Logger**: pino with nestjs-pino
- **API Documentation**: Swagger UI
- **Validation**: class-validator + class-transformer
- **ORM**: MikroORM 6.x
- **CLI**: nest-commander 3

## Environment Variables

| Variable               | Default             | Description                                      |
| ---------------------- | ------------------- | ------------------------------------------------ |
| `PORT`                 | `3990`              | Server port                                      |
| `LOG_LEVEL`            | `info`              | Log level (trace, debug, info, warn, error)      |
| `API_DOCS_ENABLED`     | `true`              | Enable Swagger API docs at `/api/docs`           |
| `DASHBOARD_BASE_URL`   | `/dashboard/`       | Dashboard URL prefix (set to `/` for root)       |
| `DASHBOARD_STATIC_DIR` | `../dashboard/dist` | Dashboard build output directory                 |
| `DB_TYPE`              | `libsql`            | Database type: `libsql` (SQLite) or `postgresql` |
| `PID_DIR`              | `.local`            | PID file directory                               |
| `DB_NAME`              | `.local/lentil.db`  | SQLite file path or PostgreSQL database name     |
| `DB_HOST`              | `localhost`         | PostgreSQL host (PG only)                        |
| `DB_PORT`              | `5432`              | PostgreSQL port (PG only)                        |
| `DB_USER`              | `postgres`          | PostgreSQL user (PG only)                        |
| `DB_PASSWORD`          | `postgres`          | PostgreSQL password (PG only)                    |

### Environment Files

Environment files are loaded in priority order: `.env.dev`, `.env.test`, `.env.prod`.

- `.env.dev` - Development (default)
- `.env.test` - Testing
- `.env.prod` - Production

**Do not commit `.env.dev`, `.env.test`, or `.env.prod`** - use `.env.example` as template.

## Commands

```sh
pnpm dev          # Start with watch mode
pnpm build        # Build for production
pnpm start        # Start production server
pnpm stop         # Stop the running server
pnpm lint         # Lint code
pnpm check-types  # TypeScript type check
pnpm test         # Run unit tests
pnpm cli          # Run CLI commands
pnpm docker:build # Build Docker image
```

## CLI

CLI commands are located in `src/cli/` and use nest-commander (built on Commander) for argument parsing.

```sh
pnpm cli health  # Check health status via GeneralService
```

### CLI Environment

CLI uses `.env.cli` (not committed) for configuration. Copy `.env.example.cli` to create your local config:

```sh
cp .env.example.cli .env.cli
```

| Variable    | Default | Description                                 |
| ----------- | ------- | ------------------------------------------- |
| `LOG_LEVEL` | `debug` | Log level (trace, debug, info, warn, error) |

## Testing

Unit tests use Jest with `@nestjs/testing`. Test files are named `*.spec.ts`.

### Writing Tests

Tests import modules directly and use `Test.createTestingModule()` with real `ConfigModule` and `LoggerModule`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { GeneralModule } from "./general.module";
import { GeneralService } from "./general.service";
import { LoggerModule } from "../logger/logger.module";
import { describe, beforeEach, it, expect } from "@jest/globals";

describe("GeneralService", () => {
  let service: GeneralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env.test"] }),
        LoggerModule,
        GeneralModule,
      ],
    }).compile();

    service = module.get<GeneralService>(GeneralService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
```

### Test Environment

- Uses `.env.test` for configuration
- Run `pnpm test` or `turbo run test` from root

## API

- Server: `http://localhost:3990`
- Swagger docs: `http://localhost:3990/api/docs`
- Dashboard UI: `http://localhost:3990/dashboard/` (configurable via `DASHBOARD_BASE_URL`)

The backend serves the dashboard's static build output. The dashboard is built first (turbo `^build`), then served at the configured base URL. The SPA fallback serves `index.html` for all unmatched dashboard routes, while API routes (`/health`, `/api/*`) are handled by NestJS controllers.

## Modules

- **LoggerModule** (Global) - Provides `APP_LOGGER` token for DI-based logging
- **DatabaseModule** (Global) - MikroORM connection, auto-syncs schema on startup
- **GeneralModule** - General endpoints (health check, `/db/hello`)

## Logger Usage

Inject `APP_LOGGER` using `@Inject()` decorator:

```typescript
import { APP_LOGGER } from '@/modules/logger/logger.module'

constructor(@Inject(APP_LOGGER) private readonly logger: pino.Logger) {}
```

## Path Aliases

- `@/*` maps to `src/*`

## Docker

Multi-stage Docker build with pnpm deploy for minimal production image.

```sh
# Build image
pnpm docker:build

# Run container
docker run --rm -p 3990:3990 lentil-backend:latest

# With file logging
docker run --rm -p 3990:3990 \
  -e LOG_ENABLE_FS_LOG=true \
  -v $(pwd)/logs:/app/logs \
  lentil-backend:latest
```

Image pushed to `ghcr.io/<repo>/backend` on tag push via CI.
