# @lentil/playground

Vite + React playground for testing UI components.

## Tech Stack

- **Framework**: React 19.x
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v4
- **UI Components**: @lentil/ui

## Commands

```sh
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
pnpm lint      # Lint code
```

## Usage

Import components from `@lentil/ui`:

```tsx
import { Button } from '@lentil/ui/button'
import { Card } from '@lentil/ui/card'
import { MapView } from '@lentil/ui/map'
import { ThemeToggle } from '@lentil/ui/theme-toggle'
```

## Adding New Components

1. Create component in `packages/ui/src/components/ui/`
2. Export from `packages/ui/package.json`
3. Test in playground

## Notes

- PostCSS config (`postcss.config.js`) is gitignored - local dev only
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin