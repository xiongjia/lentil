# @lentil/ui

Shared UI component library using shadcn/ui + Tailwind CSS v4.

## Tech Stack

- **UI Foundation**: shadcn/ui components
- **Styling**: Tailwind CSS v4 with CSS variables
- **Variant System**: class-variance-authority (CVA)
- **Mapping**: clsx + tailwind-merge

## Components

| Export | Description |
|--------|-------------|
| `./button` | Button with variants (default, destructive, outline, secondary, ghost, link) |
| `./card` | Card components (Card, CardHeader, CardTitle, CardDescription, CardContent) |
| `./map` | MapLibre GL map component (MapView) |
| `./theme-toggle` | Light/dark theme toggle (ThemeToggle, useTheme) |

## Usage

```tsx
import { Button } from '@lentil/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@lentil/ui/card'
import { MapView } from '@lentil/ui/map'
import { ThemeToggle, useTheme } from '@lentil/ui/theme-toggle'
```

## Theming

Components use CSS custom properties for theming. Light/dark mode is controlled by adding/removing the `.dark` class on `<html>` element.

```css
:root {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  /* ... */
}

.dark {
  --color-background: hsl(222.2 84% 4.9%);
  --color-foreground: hsl(210 40% 98%);
  /* ... */
}
```

## Commands

```sh
pnpm lint         # Lint code
pnpm test         # Run unit tests with Vitest
pnpm test:ui      # Run unit tests with UI update (watch mode)
pnpm check-types  # TypeScript type check
pnpm generate:component  # Generate new component (shadcn/ui style)
```

## Adding Components

1. Create component in `src/components/ui/`
2. Export from `package.json` exports field
3. Add component styling to `src/globals.css` if needed
4. Test in `@lentil/playground`

## File Naming

Use kebab-case or lowercase for component files. Exception: `App.tsx`, `main.tsx` style files may use PascalCase.