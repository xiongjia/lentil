import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHashRoute } from "./router";

describe("useHashRoute", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("returns the default slug when hash is empty", () => {
    const { result } = renderHook(() => useHashRoute("home"));
    expect(result.current[0]).toBe("home");
  });

  it("returns the hash slug when hash is set", () => {
    window.location.hash = "#/settings";
    const { result } = renderHook(() => useHashRoute("home"));
    expect(result.current[0]).toBe("settings");
  });

  it("fallbacks to default slug when hash is empty string", () => {
    window.location.hash = "#/";
    const { result } = renderHook(() => useHashRoute("home"));
    expect(result.current[0]).toBe("home");
  });

  it("navigate updates the hash", () => {
    const { result } = renderHook(() => useHashRoute("home"));

    act(() => {
      result.current[1]("settings");
    });

    expect(window.location.hash).toBe("#/settings");
  });

  it("responds to hashchange events after navigate", () => {
    const { result } = renderHook(() => useHashRoute("home"));

    act(() => {
      result.current[1]("settings");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(result.current[0]).toBe("settings");
  });

  it("strips query string from the slug", () => {
    window.location.hash = "#/viewer?id=abc123";
    const { result } = renderHook(() => useHashRoute("home"));
    expect(result.current[0]).toBe("viewer");
  });

  it("defaults to 'home' when no defaultSlug is provided", () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current[0]).toBe("home");
  });
});
