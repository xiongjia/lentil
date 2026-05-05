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
```

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