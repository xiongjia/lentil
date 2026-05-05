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

## DEV environment tips

- Install deps: `pnpm install`
- Start the playground app to test UI components: `pnpm turbo run dev --filter=@lentil/playground`
- Build all packages: `pnpm turbo run build`
- Lint all packages: `pnpm turbo run lint`

## Coding Principles

1. **Code review required before push**: All changes must be reviewed and approved by a human before pushing to remote branches.
2. **Avoid `any` in TypeScript**: Use proper typing instead of `any`. If an any is truly unavoidable, use a comment to explain why.
