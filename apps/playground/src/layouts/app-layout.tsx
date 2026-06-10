import { type ReactNode, useCallback, useState } from "react";
import { Content, SidebarProvider } from "@lentil/ui";
import { AppHeader } from "../components/app-header";
import { AppSidebar } from "../components/app-sidebar";

interface AppLayoutProps {
  slug: string;
  children: ReactNode;
}

const AppLayout = ({ slug, children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <SidebarProvider open={!collapsed} onOpenChange={(v) => setCollapsed(!v)}>
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
