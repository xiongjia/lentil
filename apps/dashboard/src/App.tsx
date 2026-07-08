import { Suspense, lazy } from "react";
import { useHashRoute } from "./lib/router";
import { defaultSlug } from "./pages";
import { AppLayout } from "./layouts/app-layout";
import { ErrorBoundary } from "./components/error-boundary";

// Lazy-loaded page components — each page is a separate chunk.
const Home = lazy(() => import("./pages/home"));
const Settings = lazy(() => import("./pages/settings"));
const Scrape = lazy(() => import("./pages/scrape"));
const Viewer = lazy(() => import("./pages/viewer"));

/** Maps hash-routed slugs to their lazy-loaded page components. */
const pages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: Home,
  settings: Settings,
  scrape: Scrape,
  viewer: Viewer,
};

/**
 * Root application component.
 *
 * - Resolves the current route slug via {@link useHashRoute}.
 * - Renders the {@link AppLayout} shell with the matching page component.
 * - Wraps the page in {@link ErrorBoundary} and {@link Suspense} for
 *   error isolation and lazy-loading feedback.
 */
const App = () => {
  const [slug] = useHashRoute(defaultSlug);
  const PageComponent = pages[slug];

  return (
    <AppLayout slug={slug}>
      <ErrorBoundary>
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          {PageComponent ? (
            <PageComponent />
          ) : (
            <div className="p-8">Page not found: {slug}</div>
          )}
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default App;
