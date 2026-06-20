import Home from "./home";
import Settings from "./settings";

export const pages: Record<string, React.ComponentType> = {
  home: Home,
  settings: Settings,
};

export const defaultSlug = "home";
