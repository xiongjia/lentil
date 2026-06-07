# @lentil/ui

Shared UI component library using shadcn/ui + Tailwind CSS v4.

## Tech Stack

- **UI Foundation**: shadcn/ui components
- **Styling**: Tailwind CSS v4 with CSS variables
- **Variant System**: class-variance-authority (CVA)
- **Syntax Highlighting**: Shiki
- **Utilities**: clsx + tailwind-merge

## Components

All components and utilities are available from the root `@lentil/ui` import.

### UI Components

`Button`, `buttonVariants`, `ButtonProps`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`,
`MapView`, `MapViewProps`, `ThemeToggle`, `useTheme`

### Shadcn Components

`Separator`, `Sheet`, `SheetOverlay`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`,
`Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarRail`, `SidebarSeparator`, `useSidebar`,
`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

### Documentation Components

`Header`, `Content`, `CodeBlock`, `ComponentPreview`

### Utilities

`cn`, `useIsMobile`, `MobileOverrideProvider`

## Usage

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CodeBlock,
  ComponentPreview,
  Content,
  Header,
  cn,
} from "@lentil/ui";
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
3. Export from `src/index.ts`
4. Add CSS variables to `src/globals.css` if needed
5. Test in `@lentil/playground`

## File Naming

kebab-case for component files. Tests co-located as `<name>.test.tsx`.
