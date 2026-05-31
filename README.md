# Lentil

A monorepo for UI component development with shadcn/ui + Tailwind CSS.

## Project Structure

```
lentil/
├── apps/
│   ├── backend/            # NestJS REST API server
│   └── playground/          # Vite + React playground for testing UI components
├── packages/
│   ├── config/              # Shared ESLint & TypeScript configs
│   └── ui/                  # Shared UI component library (shadcn/ui)
├── package.json             # Root workspace config (pnpm)
├── turbo.json              # Turborepo task orchestration
└── pnpm-workspace.yaml     # pnpm workspace definition
```

## Tech Stack

- **Package Manager**: pnpm 11.x (monorepo workspace)
- **Build Tool**: Turborepo 2.x (task orchestration)
- **Frontend**: React 19.x with shadcn/ui + Tailwind CSS v4
- **Backend**: NestJS 11.x with pino logger
- **TypeScript**: 5.9.x

## Getting Started

Install dependencies:

```sh
pnpm install
```

## Commands

### Development

Start the playground app to test UI components:

```sh
pnpm turbo run dev --filter=@lentil/playground
```

Start the backend API server:

```sh
pnpm turbo run dev --filter=@lentil/backend
```

Backend runs on `http://localhost:3850` with Swagger docs at `http://localhost:3850/api`.

### Build

Build all packages:

```sh
pnpm turbo run build
```

Build a specific package:

```sh
pnpm turbo run build --filter=@lentil/ui
```

### Lint

Lint all packages:

```sh
pnpm turbo run lint
```

Lint a specific package:

```sh
pnpm turbo run lint --filter=@lentil/ui
```

### Type Check

```sh
pnpm turbo run check-types
```

### Unit Tests

```sh
pnpm turbo run test              # Run all tests
pnpm turbo run test --filter=@lentil/backend  # Run backend tests only
```

### CLI

```sh
pnpm turbo run cli --filter=@lentil/backend -- health  # Run backend CLI health check
```

## Packages

### @lentil/backend

NestJS 11 REST API server with pino logger, Swagger UI, and nest-commander CLI.

- Port: `3850` (configurable via `.env.dev`)
- Swagger docs: `http://localhost:3850/api`
- Log level controlled by `LOG_LEVEL` env var (trace, debug, info, warn, error)
- Environment files: `.env.dev`, `.env.test`, `.env.prod`
- CLI: `pnpm turbo run cli --filter=@lentil/backend -- <command>` (uses nest-commander 3)

### @lentil/playground

Vite + React playground for testing UI components.

### @lentil/ui

Shared UI component library using shadcn/ui + Tailwind CSS v4.

### @lentil/config

Shared ESLint and TypeScript configurations.

## VSCode Setup

### Auto Format on Save

1. Install **Prettier - Code formatter** extension (`esbenp.prettier-vscode`)
2. Copy `.vscode/settings.json` from below or create it manually:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

Note: `.vscode/` directory is gitignored - settings are local only.

## ESLint Configuration

The `@lentil/config` package provides two ESLint configurations:

- `@lentil/config/eslint-config/base` - Base ESLint config for general projects
- `@lentil/config/eslint-config/react-internal` - ESLint config for React component libraries

Example usage in `eslint.config.mjs`:

```javascript
import { config as baseConfig } from "@lentil/config/eslint-config/base";

export default [...baseConfig];
```
