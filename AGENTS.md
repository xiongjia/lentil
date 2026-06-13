## Project Structure

```
lentil/
├── apps/
│   ├── backend/              # NestJS REST API server (serves dashboard SPA)
│   ├── dashboard/            # Vite + React admin dashboard UI
│   └── playground/           # Vite + React + MDX playground for UI docs
├── packages/
│   ├── config/               # Shared ESLint & TypeScript configs
│   ├── db/                   # Shared database package (entities, migrations)
│   └── ui/                   # Shared UI component library (shadcn/ui)
├── .github/workflows/ci.yml  # CI: build, test, docker push
├── package.json              # Root workspace config (pnpm)
├── turbo.json                # Turborepo task orchestration
└── pnpm-workspace.yaml       # pnpm workspace definition
```

## Tech Stack

- **Package Manager**: pnpm 11.x (monorepo workspace)
- **Build Tool**: Turborepo 2.x (task orchestration)
- **Frontend**: React 19.x with shadcn/ui + Tailwind CSS v4
- **Backend**: NestJS 11.x with pino logger + Swagger
- **Documentation**: MDX with Shiki syntax highlighting
- **Testing**: Vitest (UI), Jest (backend)
- **CI/CD**: GitHub Actions (build, test, Docker push to ghcr.io)
- **ORM**: MikroORM 6.x (libsql for dev, PostgreSQL for prod)
- **TypeScript**: 5.9.x
- **Dependency Management**: pnpm catalog (shared versions in `pnpm-workspace.yaml`)
- **Build Order**: backend depends on dashboard (`^build` ensures dashboard → backend order)

## DEV environment tips

- Install deps: `pnpm install`
- Start playground (frontend): `pnpm turbo run dev --filter=@lentil/playground`
- Start dashboard (admin UI): `pnpm turbo run dev --filter=@lentil/dashboard`
- Start backend: `pnpm turbo run dev --filter=@lentil/backend`
- Stop backend: `cd apps/backend && pnpm stop`
- Build all packages: `pnpm turbo run build`
- Lint all packages: `pnpm turbo run lint`
- Run all tests: `pnpm turbo run test`
- Run UI tests: `cd packages/ui && npx vitest --run`
- Run backend tests: `pnpm turbo run test --filter=@lentil/backend`
- Run backend CLI: `pnpm turbo run cli --filter=@lentil/backend -- health`
- Build backend Docker: `pnpm turbo run docker:build --filter=@lentil/backend`
- Run DB migrations: `cd packages/db && npx mikro-orm migration:up`
- Create DB migration: manually create `packages/db/migrations/NNN-description.ts`

## Coding Principles

1. **Code review required before push**: All changes must be reviewed and approved by a human before pushing to remote branches.
2. **Avoid `any` in TypeScript**: Use proper typing instead of `any`. If an any is truly unavoidable, use a comment to explain why.
3. **File naming conventions**: Use kebab-case (`my-component.tsx`) or lowercase with dots (`my.component.tsx`). Special exceptions like `App.tsx`, `main.tsx` are allowed to use PascalCase.
4. **Backend logging**: Use `APP_LOGGER` injection for runtime logging; use pino directly in bootstrap code. Log levels controlled by `LOG_LEVEL` env var.
5. **Tests co-located**: Test files live next to source files (`*.test.ts` / `*.test.tsx`).
6. **UI components in @lentil/ui**: Reusable components go in the UI package with exports in `src/index.ts`. Import from `@lentil/ui` directly (not subpaths). Playground uses them for documentation.
7. **Arrow functions preferred**: Use `const ... = () => {}` arrow functions instead of `function` declarations. `function` is only for special cases (generators, `this` binding, hoisting).
