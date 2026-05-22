import { Suspense, useState } from "react";
import { Header } from "@lentil/ui/header";
import { Content } from "@lentil/ui/content";
import { Button } from "@lentil/ui/button";
import { Separator } from "@lentil/ui/separator";
import { ThemeToggle } from "@lentil/ui/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lentil/ui/tooltip";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@lentil/ui/utils";
import { useHashRoute } from "./lib/router";
import { getPage, pagesMeta } from "./lib/registry";

function SidebarNavItems({ slug }: { slug: string }) {
  return (
    <nav className="flex-1 overflow-auto p-2">
      {pagesMeta.map((item) => (
        <a
          key={item.slug}
          href={`#/${item.slug}`}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            slug === item.slug &&
              "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.title}</span>
        </a>
      ))}
    </nav>
  );
}

function App() {
  const [slug] = useHashRoute();
  const page = getPage(slug);
  const PageComponent = page?.Component;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col">
      <Header title="Lentil UI">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {sidebarOpen ? "Close sidebar" : "Open sidebar"}
            </TooltipContent>
          </Tooltip>
          <ThemeToggle />
        </TooltipProvider>
      </Header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground shrink-0 transition-all duration-200",
            sidebarOpen ? "w-56" : "w-0 overflow-hidden"
          )}
        >
          {sidebarOpen && (
            <>
              <div className="flex items-center px-3 py-2">
                <span className="text-sm font-medium text-sidebar-foreground/70">
                  Components
                </span>
              </div>
              <Separator />
              <SidebarNavItems slug={slug} />
            </>
          )}
        </aside>

        <div className="flex flex-1 flex-col">
          <Content>
            <Suspense
              fallback={
                <div className="text-muted-foreground">Loading...</div>
              }
            >
              {PageComponent ? (
                <PageComponent />
              ) : (
                <div>Page not found: {slug}</div>
              )}
            </Suspense>
          </Content>
        </div>
      </div>
    </div>
  );
}

export default App;