import { describe, it, expect } from "vitest";
import { pages, defaultSlug } from "./index";

describe("pages", () => {
  it("has home, scrape, viewer, and settings entries", () => {
    expect(Object.keys(pages).sort()).toEqual([
      "home",
      "scrape",
      "settings",
      "viewer",
    ]);
  });

  it("home page is a function", () => {
    expect(typeof pages.home).toBe("function");
  });

  it("settings page is a function", () => {
    expect(typeof pages.settings).toBe("function");
  });

  it("scrape page is a function", () => {
    expect(typeof pages.scrape).toBe("function");
  });

  it("viewer page is a function", () => {
    expect(typeof pages.viewer).toBe("function");
  });

  it("defaultSlug is 'home'", () => {
    expect(defaultSlug).toBe("home");
  });

  it("defaultSlug maps to an existing page", () => {
    expect(pages[defaultSlug]).toBeDefined();
  });
});
