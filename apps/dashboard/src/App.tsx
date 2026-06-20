import { Suspense, lazy } from "react";
import { useHashRoute } from "./lib/router";
import { defaultSlug } from "./pages";
import { AppLayout } from "./layouts/app-layout";
import { ErrorBoundary } from "./components/error-boundary";

const Home = lazy(() => import("./pages/home"));
const Settings = lazy(() => import("./pages/settings"));

const pages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: Home,
  settings: Settings,
};

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
