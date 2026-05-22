# @lentil/ui

Shared UI component library using shadcn/ui + Tailwind CSS v4.

## Tech Stack

- **UI Foundation**: shadcn/ui components
- **Styling**: Tailwind CSS v4 with CSS variables
- **Variant System**: class-variance-authority (CVA)
- **Syntax Highlighting**: Shiki
- **Utilities**: clsx + tailwind-merge

## Components

### UI Components

| Export | Description |
|--------|-------------|
| `./button` | Button with variants (default, destructive, outline, secondary, ghost, link) |
| `./card` | Card components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) |
| `./map` | MapLibre GL map component (MapView) |
| `./theme-toggle` | Light/dark theme toggle (ThemeToggle, useTheme) |

### Shadcn Components

| Export | Description |
|--------|-------------|
| `./separator` | Visual separator (Radix) |
| `./sheet` | Slide-over panel for mobile/dialogs (Radix Dialog) |
| `./sidebar` | Full sidebar with collapsible, mobile, keyboard shortcuts |
| `./tooltip` | Hover tooltip (Radix Tooltip) |

### Documentation Components

| Export | Description |
|--------|-------------|
| `./header` | Page header with title + actions slot |
| `./content` | Scrollable content area with prose typography |
| `./code-block` | Syntax-highlighted code block (Shiki) |
| `./component-preview` | Live component demo with preview + code side-by-side |

### Utilities

| Export | Description |
|--------|-------------|
| `./utils` | `cn()` class merge helper |
| `./use-mobile` | `useIsMobile()` hook + `MobileOverrideProvider` |

## Usage

```tsx
import { Button } from '@lentil/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@lentil/ui/card'
import { Header } from '@lentil/ui/header'
import { Content } from '@lentil/ui/content'
import { CodeBlock } from '@lentil/ui/code-block'
import { ComponentPreview } from '@lentil/ui/component-preview'
import { cn } from '@lentil/ui/utils'
```

## Theming

Components use CSS custom properties for theming. Light/dark mode is controlled by adding/removing the `.dark` class on `<html>` element. Tailwind's `dark:` variant uses class-based strategy via `@custom-variant dark`.

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
pnpm lint          # Lint code
pnpm test          # Run unit tests with Vitest
pnpm check-types   # TypeScript type check
pnpm generate:component  # Generate new component (shadcn/ui style)
```

## Adding Components

1. Create component in `src/components/ui/`
2. Add test in `src/components/ui/<name>.test.tsx`
3. Export from `package.json` exports field
4. Add CSS variables to `src/globals.css` if needed
5. Test in `@lentil/playground`

## File Naming

kebab-case for component files. Tests co-located as `<name>.test.tsx`.