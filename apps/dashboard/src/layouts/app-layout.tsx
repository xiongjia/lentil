import { type ReactNode, useCallback, useState } from "react";
import { Content, SidebarProvider } from "@lentil/ui";
import { AppHeader } from "../components/app-header";
import { AppSidebar } from "../components/app-sidebar";

interface AppLayoutProps {
  slug: string;
  children: ReactNode;
}

/**
 * Root application shell.
 *
 * Owns the `collapsed` sidebar state and composes the three layout zones:
 *
 * 1. **Header**  — {@link AppHeader} (title, toggle, theme)
 * 2. **Sidebar** — {@link AppSidebar} (collapsible navigation)
 * 3. **Content** — `<main>` wrapping {@link Content} from `@lentil/ui`
 */
const AppLayout = ({ slug, children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
    >
      <div className="flex flex-col h-screen w-full">
        <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar collapsed={collapsed} slug={slug} />

          <main className="flex-1 overflow-auto">
            <Content>{children}</Content>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export { AppLayout };
