import { describe, it, expect } from "vitest";
import { pages, defaultSlug } from "./index";

describe("pages", () => {
  it("has home and settings entries", () => {
    expect(Object.keys(pages)).toEqual(["home", "settings"]);
  });

  it("home page is a function", () => {
    expect(typeof pages.home).toBe("function");
  });

  it("settings page is a function", () => {
    expect(typeof pages.settings).toBe("function");
  });

  it("defaultSlug is 'home'", () => {
    expect(defaultSlug).toBe("home");
  });

  it("defaultSlug maps to an existing page", () => {
    expect(pages[defaultSlug]).toBeDefined();
  });
});
