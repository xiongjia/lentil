import type { ComponentType } from "react";
import { LayoutDashboard, Square, Layers, Map } from "lucide-react";

import * as OverviewMod from "../pages/overview.mdx";
import * as ButtonMod from "../pages/button.mdx";
import * as CardMod from "../pages/card.mdx";
import * as MapMod from "../pages/map.mdx";

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
