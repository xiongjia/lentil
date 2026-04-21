# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo using Turborepo + pnpm with the following structure:

- `apps/web` - Next.js application (port 3000)
- `apps/docs` - Next.js documentation site (port 3001)
- `packages/ui` - Shared React component library
- `packages/eslint-config` - Shared ESLint configurations (`base`, `next-js`, `react-internal`)
- `packages/typescript-config` - Shared TypeScript configurations

## Commands

### Build & Development
```sh
pnpm build          # Build all apps and packages
pnpm dev            # Run all apps in development mode
pnpm dev --filter=web    # Run specific app (web or docs)
pnpm format         # Format code with Prettier
```

### Linting & Type Checking
```sh
pnpm lint           # Lint all packages
pnpm check-types    # Type check all packages
```

### Running Tests
Tests are not yet configured in this repository.

### UI Component Generation
```sh
pnpm --filter @repo/ui generate:component   # Generate new React component in packages/ui
```

## Architecture Notes

- Apps depend on `packages/ui` via workspace protocol (`@repo/ui: workspace:*`)
- All packages use TypeScript 5.9.2
- Next.js apps use React 19.2.0 and Next.js 16.2.0
- Turborepo pipeline: `build` depends on `^build` (parent dependencies), `lint` depends on `^lint`
- `check-types` runs `next typegen && tsc --noEmit` for Next.js apps
- ESLint config uses flat config format (ESLint 9)