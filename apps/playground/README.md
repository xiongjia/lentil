# @lentil/playground

Vite + React playground for testing and documenting UI components with MDX.

## Tech Stack

- **Framework**: React 19.x
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v4 + @tailwindcss/typography
- **Documentation**: MDX (@mdx-js/mdx + remark plugins)
- **Syntax Highlighting**: Shiki
- **UI Components**: @lentil/ui

## Structure

```
src/
  App.tsx            # Shell: header + sidebar + content
  lib/
    router.ts        # Hash-based routing hook
    registry.ts      # Page registry (MDX imports + metadata)
  pages/
    overview.mdx     # Welcome + component index
    button.mdx       # Button docs with API table
    card.mdx         # Card docs
    map.mdx          # MapView docs
```

## Commands

```sh
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
pnpm lint      # Lint code
```

## Adding a New Component Page

1. Create `src/pages/<name>.mdx` with frontmatter and docs
2. Add to `src/lib/registry.ts` with slug, icon, and import
3. Run `pnpm dev` to verify

## MDX Features

- **Frontmatter**: `title` and `description` auto-extracted for sidebar
- **Markdown**: headings, paragraphs, inline code, tables (via remark-gfm)
- **Components**: import and render live `@lentil/ui` components
- **Live Preview**: use ` ```tsx preview ` fenced code blocks to auto-generate live component previews with source code
- **Code blocks**: auto-highlighted via Shiki
