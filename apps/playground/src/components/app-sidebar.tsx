import {
  SidebarAside,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@lentil/ui";
import { pagesMeta } from "../lib/registry";

function SidebarNavItems({
  slug,
  collapsed,
}: {
  slug: string;
  collapsed: boolean;
}) {
  return (
    <SidebarMenu>
      {pagesMeta.map((item) => (
        <SidebarMenuItem key={item.slug}>
          <SidebarMenuButton
            asChild
            isActive={slug === item.slug}
            tooltip={item.title}
          >
            <a href={`#/${item.slug}`}>
              <item.icon />
              {!collapsed && <span>{item.title}</span>}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
  slug: string;
}

function AppSidebar({ collapsed, slug }: AppSidebarProps) {
  return (
    <SidebarAside collapsed={collapsed}>
      {!collapsed && <SidebarGroupLabel>Components</SidebarGroupLabel>}
      {!collapsed && <SidebarSeparator />}
      <SidebarNavItems slug={slug} collapsed={collapsed} />
    </SidebarAside>
  );
}

export { AppSidebar };
