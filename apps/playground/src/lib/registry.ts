import type { ComponentType } from "react";
import {
  AppWindow,
  BarChart3,
  CalendarDays,
  CalendarSearch,
  CheckSquare,
  Database,
  LayoutDashboard,
  Layers,
  Map,
  MessageSquareWarning,
  PanelLeft,
  PanelRight,
  RectangleEllipsis,
  Square,
  Table2,
} from "lucide-react";

import * as OverviewMod from "../pages/overview.mdx";
import * as AlertDialogMod from "../pages/alert-dialog.mdx";
import * as ButtonMod from "../pages/button.mdx";
import * as CalendarMod from "../pages/calendar.mdx";
import * as CardMod from "../pages/card.mdx";
import * as CheckboxMod from "../pages/checkbox.mdx";
import * as ChartMod from "../pages/chart.mdx";
import * as DatePickerMod from "../pages/date-picker.mdx";
import * as DialogMod from "../pages/dialog.mdx";
import * as SheetMod from "../pages/sheet.mdx";
import * as InputMod from "../pages/input.mdx";
import * as SidebarMod from "../pages/sidebar.mdx";
import * as MapMod from "../pages/map.mdx";
import * as TableMod from "../pages/table.mdx";
import * as DataTableMod from "../pages/data-table.mdx";

export interface PageMeta {
  slug: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export interface PageEntry extends PageMeta {
  Component: ComponentType;
}

interface MdxExports {
  default: ComponentType;
  frontmatter?: { title?: string; description?: string };
}

const pages: PageEntry[] = [
  {
    slug: "overview",
    title:
      (OverviewMod as unknown as MdxExports).frontmatter?.title ?? "Overview",
    description:
      (OverviewMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: LayoutDashboard,
    Component: OverviewMod.default,
  },
  {
    slug: "button",
    title: (ButtonMod as unknown as MdxExports).frontmatter?.title ?? "Button",
    description:
      (ButtonMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: Square,
    Component: ButtonMod.default,
  },
  {
    slug: "calendar",
    title:
      (CalendarMod as unknown as MdxExports).frontmatter?.title ?? "Calendar",
    description:
      (CalendarMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: CalendarDays,
    Component: CalendarMod.default,
  },
  {
    slug: "date-picker",
    title:
      (DatePickerMod as unknown as MdxExports).frontmatter?.title ??
      "Date Picker",
    description:
      (DatePickerMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: CalendarSearch,
    Component: DatePickerMod.default,
  },
  {
    slug: "card",
    title: (CardMod as unknown as MdxExports).frontmatter?.title ?? "Card",
    description:
      (CardMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: Layers,
    Component: CardMod.default,
  },
  {
    slug: "map",
    title: (MapMod as unknown as MdxExports).frontmatter?.title ?? "Map",
    description:
      (MapMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: Map,
    Component: MapMod.default,
  },
  {
    slug: "checkbox",
    title:
      (CheckboxMod as unknown as MdxExports).frontmatter?.title ?? "Checkbox",
    description:
      (CheckboxMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: CheckSquare,
    Component: CheckboxMod.default,
  },
  {
    slug: "dialog",
    title: (DialogMod as unknown as MdxExports).frontmatter?.title ?? "Dialog",
    description:
      (DialogMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: AppWindow,
    Component: DialogMod.default,
  },
  {
    slug: "alert-dialog",
    title:
      (AlertDialogMod as unknown as MdxExports).frontmatter?.title ??
      "Alert Dialog",
    description:
      (AlertDialogMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: MessageSquareWarning,
    Component: AlertDialogMod.default,
  },
  {
    slug: "sheet",
    title: (SheetMod as unknown as MdxExports).frontmatter?.title ?? "Sheet",
    description:
      (SheetMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: PanelRight,
    Component: SheetMod.default,
  },
  {
    slug: "sidebar",
    title:
      (SidebarMod as unknown as MdxExports).frontmatter?.title ?? "Sidebar",
    description:
      (SidebarMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: PanelLeft,
    Component: SidebarMod.default,
  },
  {
    slug: "chart",
    title: (ChartMod as unknown as MdxExports).frontmatter?.title ?? "Chart",
    description:
      (ChartMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: BarChart3,
    Component: ChartMod.default,
  },
  {
    slug: "table",
    title: (TableMod as unknown as MdxExports).frontmatter?.title ?? "Table",
    description:
      (TableMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: Table2,
    Component: TableMod.default,
  },
  {
    slug: "data-table",
    title:
      (DataTableMod as unknown as MdxExports).frontmatter?.title ??
      "Data Table",
    description:
      (DataTableMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: Database,
    Component: DataTableMod.default,
  },
  {
    slug: "input",
    title: (InputMod as unknown as MdxExports).frontmatter?.title ?? "Input",
    description:
      (InputMod as unknown as MdxExports).frontmatter?.description ?? "",
    icon: RectangleEllipsis,
    Component: InputMod.default,
  },
];

export function getPage(slug: string): PageEntry | undefined {
  return pages.find((p) => p.slug === slug);
}

export const pagesMeta: PageMeta[] = pages.map(
  ({ slug, title, description, icon }) => ({
    slug,
    title,
    description,
    icon,
  }),
);
