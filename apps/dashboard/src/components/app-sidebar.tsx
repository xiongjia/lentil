import { Home, Settings, Download } from "lucide-react";
import {
  SidebarAside,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@lentil/ui";

/** Static navigation items rendered in the sidebar. */
const items = [
  { slug: "home", title: "Home", icon: Home },
  { slug: "scrape", title: "Scrape", icon: Download },
  { slug: "settings", title: "Settings", icon: Settings },
];

/**
 * Internal sub-component that renders the navigation menu items.
 *
 * Each item wraps an `<a>` tag pointing to the corresponding hash URL.
 * The currently-active item is highlighted via {@link SidebarMenuButton}'s
 * `isActive` prop.
 */
const SidebarNavItems = ({
  slug,
  collapsed,
}: {
  slug: string;
  collapsed: boolean;
}) => (
  <SidebarMenu>
    {items.map((item) => (
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

interface AppSidebarProps {
  collapsed: boolean;
  slug: string;
}

/**
 * Collapsible left navigation sidebar.
 *
 * - **Expanded** — shows a "Navigation" section label, separator, and
 *   icon + text menu items.
 * - **Collapsed** — icons only, compact width (`w-12` vs `w-64`).
 */
const AppSidebar = ({ collapsed, slug }: AppSidebarProps) => (
  <SidebarAside collapsed={collapsed}>
    {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
    {!collapsed && <SidebarSeparator />}
    <SidebarNavItems slug={slug} collapsed={collapsed} />
  </SidebarAside>
);

export { AppSidebar };
