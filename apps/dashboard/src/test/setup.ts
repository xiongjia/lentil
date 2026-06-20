import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia — needed by sidebar/useIsMobile
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom doesn't implement createObjectURL — needed by maplibre-gl
if (typeof window.URL.createObjectURL === "undefined") {
  Object.defineProperty(window.URL, "createObjectURL", {
    writable: true,
    value: () => "blob:mock",
  });
}
