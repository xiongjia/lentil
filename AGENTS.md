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
