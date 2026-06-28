import Home from "./home";
import Settings from "./settings";

/**
 * Static page registry — maps hash-route slugs to their React components.
 * Extend this map when adding new pages.
 */
export const pages: Record<string, React.ComponentType> = {
  home: Home,
  settings: Settings,
};

/** Slug used when the URL hash is empty. */
export const defaultSlug = "home";
