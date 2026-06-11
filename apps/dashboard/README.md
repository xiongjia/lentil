# @lentil/dashboard

Admin dashboard UI for the backend, built with Vite + React + Tailwind CSS v4.

## Tech Stack

- **Framework**: React 19.x
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v4
- **UI Components**: @lentil/ui
- **Testing**: Vitest + @testing-library/react

## Structure

```
src/
  App.tsx            # Root component
  main.tsx           # Entry point (imports globals.css, mounts App)
  env.d.ts           # TypeScript declarations
  test/
    setup.ts         # Test setup (jest-dom matchers)
```

## Commands

```sh
pnpm dev       # Start development server
pnpm build     # Build for production (tsc + vite)
pnpm preview   # Preview production build
pnpm lint      # Lint code
pnpm test      # Run unit tests
```

## Configuration

- `VITE_BASE` env var controls the Vite `base` URL (default `/dashboard/`). Must match the backend's `DASHBOARD_BASE_URL`.
- The production build is served by `@lentil/backend` at the configured base URL path.
