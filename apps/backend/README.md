# @lentil/backend

NestJS REST API server with pino logger and Swagger UI.

## Tech Stack

- **Framework**: NestJS 10.x
- **Logger**: pino with nestjs-pino
- **API Documentation**: Swagger UI
- **Validation**: class-validator + class-transformer

## Environment Variables

| Variable | Default | Description |
|----------|--------|-------------|
| `PORT` | `3850` | Server port |
| `LOG_LEVEL` | `info` | Log level (trace, debug, info, warn, error) |

### Environment Files

Environment files are loaded in priority order: `.env.dev`, `.env.test`, `.env.prod`.

- `.env.dev` - Development (default)
- `.env.test` - Testing
- `.env.prod` - Production

**Do not commit `.env.dev`, `.env.test`, or `.env.prod`** - use `.env.example` as template.

## Commands

```sh
pnpm dev       # Start with watch mode
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Lint code
pnpm check-types  # TypeScript type check
pnpm test      # Run unit tests
```

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
- Swagger docs: `http://localhost:3850/api`

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