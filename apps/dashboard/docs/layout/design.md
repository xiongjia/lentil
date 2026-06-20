# Dashboard Layout Design

## Overview

The dashboard layout provides the application shell for the Lentil Dashboard app. It follows a conventional admin-dashboard pattern: a fixed header at the top, a collapsible sidebar on the left for navigation, and a scrollable main content area.

The implementation reuses UI primitives from the `@lentil/ui` package (a shadcn/ui-based component library) and mirrors the layout pattern established by the `apps/playground` reference app.

## Architecture

### Page Layout

```
+----------------------------------------------------------+
|  Header (AppHeader)                                      |
|  Dashboard                        [=] [*] ThemeToggle    |
|  title                            toggle  dark/light     |
+----------------------------------------------------------+
+--------------+ +-----------------------------------------+
| Sidebar      | |                                         |
| (AppSidebar) | |  Content (scrollable)                   |
|              | |                                         |
| +----------+ | |  +-----------------------------------+  |
| |Navigation| | |  |  Page Component                   |  |
| +----------+ | |  |  (Home or Settings)               |  |
| | Home     | | |  |                                   |  |
| | Settings | | |  |  Card / Button / Dialog / ...     |  |
| +----------+ | |  +-----------------------------------+  |
|              | |                                         |
| collapsible  | |                                         |
| w-64 / w-12  | |                                         |
+--------------+ +-----------------------------------------+
```

**Zones:**

| Zone        | Component            | Description                                                          |
| ----------- | -------------------- | -------------------------------------------------------------------- |
| **Header**  | `AppHeader`          | Fixed top bar — title, sidebar toggle button, theme toggle           |
| **Sidebar** | `AppSidebar`         | Collapsible left navigation — expands to `w-64`, collapses to `w-12` |
| **Content** | `<main>` + `Content` | Scrollable area rendering the active page component                  |

### Component Hierarchy

```
<App>
  <AppLayout slug={slug}>
    <SidebarProvider>
      <AppHeader collapsed onToggle />     ← top bar
      <div.flex.flex-1>
        <AppSidebar collapsed slug />      ← left navigation
        <main>
          <Content>                         ← scrollable content area
            <PageComponent />              ← routed page (Home | Settings)
          </Content>
        </main>
      </div>
    </SidebarProvider>
  </AppLayout>
</App>
```

### File Structure

```
apps/dashboard/src/
  main.tsx                              ← entry point, imports @lentil/ui/globals.css
  App.tsx                               ← root: useHashRoute → pages map → AppLayout
  lib/
    router.ts                           ← useHashRoute hook
    rpc.ts                              ← oRPC client (pre-existing)
  layouts/
    app-layout.tsx                      ← shell: SidebarProvider + Header + Sidebar + Content
  components/
    app-header.tsx                      ← top bar with sidebar toggle + ThemeToggle
    app-sidebar.tsx                     ← collapsible nav: Home, Settings
  pages/
    home.tsx                            ← Home page with health-check demo
    settings.tsx                        ← Settings placeholder page
    index.ts                            ← page registry map + defaultSlug
```

## Routing

The dashboard uses a **hash-based routing** approach — no external router library is required.

- The `useHashRoute` hook (in `lib/router.ts`) reads `window.location.hash` and returns the current slug.
- Navigation sets `window.location.hash = "#/<slug>"`, which triggers a `hashchange` event.
- The `App` component looks up the page component from the `pages` registry map by slug.
- The default slug is `"home"`; unknown slugs show a "Page not found" message.
- This approach was chosen for its simplicity: with only two pages, a full router library (React Router, TanStack Router) would be unnecessary overhead.

### URL Scheme

| URL Hash          | Page                |
| ----------------- | ------------------- |
| `#/home`          | Home page (default) |
| `#/settings`      | Settings page       |
| `#/anything-else` | "Page not found"    |

## Components

### AppLayout (`layouts/app-layout.tsx`)

The root layout shell. It manages the `collapsed` state for the sidebar and orchestrates the three zones:

- **Top**: `AppHeader` with the sidebar toggle and theme toggle.
- **Left**: `AppSidebar` for navigation.
- **Center**: `Content` (from `@lentil/ui`) wrapping the active page.

Props: `{ slug: string; children: ReactNode }`

### AppHeader (`components/app-header.tsx`)

A fixed top bar using the `Header` component from `@lentil/ui`. It has three slots:

| Slot    | Content                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `title` | `"Dashboard"`                                                                                                            |
| `start` | Sidebar toggle button (PanelLeftClose / PanelLeft icons) with a tooltip showing the keyboard shortcut (`⌘B` / `Ctrl+B`). |
| `end`   | `ThemeToggle` from `@lentil/ui` — toggles between light and dark mode.                                                   |

Props: `{ collapsed: boolean; onToggle: () => void }`

### AppSidebar (`components/app-sidebar.tsx`)

A collapsible vertical navigation sidebar using `SidebarAside` from `@lentil/ui`.

- **Expanded** (default): shows a "Navigation" section label, a separator, and two menu items with icon + text.
- **Collapsed**: icons only, no labels, compact width (`w-12` vs `w-64`).
- Each menu item wraps an `<a>` tag linking to the hash URL (`#/home`, `#/settings`).
- The active item is highlighted via the `isActive` prop on `SidebarMenuButton`, matching against the current slug.

Navigation items:

| Icon                | Label    | Hash         |
| ------------------- | -------- | ------------ |
| `Home` (lucide)     | Home     | `#/home`     |
| `Settings` (lucide) | Settings | `#/settings` |

Props: `{ collapsed: boolean; slug: string }`

## Pages

### Home (`pages/home.tsx`)

The landing page. Contains a `Card` with a "Check Health" button that calls the backend health endpoint via the oRPC client. Results are displayed in a `Dialog`. This preserves the existing RPC demo functionality migrated from the original bare `App.tsx`.

### Settings (`pages/settings.tsx`)

A placeholder page with a `Card` and a "coming soon" message. Ready for future configuration UI.

### Page Registry (`pages/index.ts`)

A simple `Record<string, React.ComponentType>` map that the `App` component uses to resolve slugs to page components. Also exports `defaultSlug = "home"`.

## Theme

Dark/light theme support is provided entirely by the `@lentil/ui` package:

- **CSS variables**: `globals.css` defines semantic color tokens (`--color-background`, `--color-foreground`, `--color-sidebar`, etc.) at `:root` for light mode, overridden under `.dark` for dark mode.
- **ThemeToggle**: A button in the header that toggles the `dark` class on `<html>` and persists the choice to `localStorage`.
- **useTheme hook**: Available from `@lentil/ui` for programmatic theme control.

The dashboard app does not implement any theme logic itself — it simply renders the `ThemeToggle` in the header and imports `@lentil/ui/globals.css` at the entry point.

## Dependencies

| Dependency            | Purpose                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `@lentil/ui`          | All UI primitives (Header, Sidebar\*, Content, Button, Card, Dialog, ThemeToggle, etc.) |
| `lucide-react`        | Icons (Home, Settings, PanelLeft, PanelLeftClose)                                       |
| `@lentil/rpc`         | Backend RPC client for health check                                                     |
| `react` / `react-dom` | UI framework                                                                            |

## Design Decisions

1. **Hash routing over library router**: With only two pages, a 20-line custom hook suffices and avoids an extra dependency. The approach is trivially replaceable with React Router or TanStack Router if the app grows.

2. **Static nav items over dynamic registry**: Unlike the playground (which dynamically registers MDX pages), the dashboard nav is a hardcoded array of two items. This is simpler and more appropriate for a fixed set of app pages.

3. **No page search**: The playground includes a `Cmd+K` search overlay for browsing ~15 component pages. The dashboard skips this — with two pages, search adds complexity without value.

4. **Collapsed state in AppLayout, not sidebar**: The `collapsed` state lives in `AppLayout` so both `AppHeader` (for the toggle button) and `AppSidebar` (for visual collapse) can share it via props. This is the same pattern used by the playground.

5. **All theme logic in @lentil/ui**: The dashboard doesn't own any theme code — it just wires in the `ThemeToggle` component and imports the shared CSS. This ensures visual consistency across all apps in the monorepo.
