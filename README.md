# Lentil

A monorepo for UI component development with shadcn/ui + Tailwind CSS.

## Project Structure

```
lentil/
├── apps/
│   └── playground/          # Vite + React playground for testing UI components
├── packages/
│   ├── config/              # Shared ESLint & TypeScript configs
│   └── ui/                  # Shared UI component library (shadcn/ui)
├── package.json             # Root workspace config (pnpm)
├── turbo.json              # Turborepo task orchestration
└── pnpm-workspace.yaml     # pnpm workspace definition
```

## Tech Stack

- **Package Manager**: pnpm 9.x (monorepo workspace)
- **Build Tool**: Turborepo 2.x (task orchestration)
- **UI Library**: React 19.x
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Playground**: Vite 6.x + React
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

## Packages

### @lentil/playground

Vite + React playground for testing UI components.

### @lentil/ui

Shared UI component library using shadcn/ui + Tailwind CSS v4.

### @lentil/config

Shared ESLint and TypeScript configurations.

## ESLint Configuration

The `@lentil/config` package provides two ESLint configurations:

- `@lentil/config/eslint-config/base` - Base ESLint config for general projects
- `@lentil/config/eslint-config/react-internal` - ESLint config for React component libraries

Example usage in `eslint.config.mjs`:

```javascript
import { config as baseConfig } from "@lentil/config/eslint-config/base";

export default [...baseConfig];
```