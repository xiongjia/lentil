# @lentil/backend

NestJS REST API server with pino logger and Swagger UI.

## Tech Stack

- **Framework**: NestJS 11.x
- **Logger**: pino with nestjs-pino
- **API Documentation**: Swagger UI
- **Validation**: class-validator + class-transformer
- **CLI**: nest-commander 3

## Environment Variables

| Variable | Default | Description |
|----------|--------|-------------|
| `PORT` | `3850` | Server port |
| `LOG_LEVEL` | `info` | Log level (trace, debug, info, warn, error) |
| `API_DOCS_ENABLED` | `true` | Enable Swagger API docs at `/api/docs` |

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

| Variable | Default | Description |
|----------|---------|-------------|
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

- Server: `http://localhost:3850`
- Swagger docs: `http://localhost:3850/api/docs`

## Modules

- **LoggerModule** (Global) - Provides `APP_LOGGER` token for DI-based logging
- **GeneralModule** - General endpoints (health check)

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
docker run --rm -p 3850:3850 lentil-backend:latest

# With file logging
docker run --rm -p 3850:3850 \
  -e LOG_ENABLE_FS_LOG=true \
  -v $(pwd)/logs:/app/logs \
  lentil-backend:latest
```

Image pushed to `ghcr.io/<repo>/backend` on tag push via CI.