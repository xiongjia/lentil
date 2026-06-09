import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement createObjectURL — needed by maplibre-gl
if (typeof window.URL.createObjectURL === "undefined") {
  Object.defineProperty(window.URL, "createObjectURL", {
    writable: true,
    value: () => "blob:mock",
  });
}
