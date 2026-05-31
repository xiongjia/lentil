import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeToggle, useTheme } from "./theme-toggle";
describe("ThemeToggle", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render with moon icon when dark mode is set", () => {
    localStorageMock["theme"] = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("should render with sun icon when light mode is set", () => {
    localStorageMock["theme"] = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("should render with sun icon when no theme is set", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("should toggle theme on click", () => {
    localStorageMock["theme"] = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    act(() => {
      button.click();
    });
    expect(localStorageMock["theme"]).toBe("dark");
  });

  it("should apply custom className", () => {
    localStorageMock["theme"] = "light";
    render(<ThemeToggle className="custom-toggle" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-toggle");
  });

  it("should have displayName", () => {
    expect(ThemeToggle.displayName).toBe("ThemeToggle");
  });
});

describe("useTheme", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return isDark true when theme is dark", () => {
    localStorageMock["theme"] = "dark";
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(true);
  });

  it("should return isDark false when theme is light", () => {
    localStorageMock["theme"] = "light";
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
  });

  it("should return isDark false when no theme is set", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
  });
});

function renderHook<T>(callback: () => T): { result: { current: T } } {
  let value: T;
  function TestComponent() {
    value = callback();
    return null;
  }
  render(<TestComponent />);
  return { result: { current: value! } };
}
