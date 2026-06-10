import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppLayout } from "./app-layout";

// Mock registry to avoid MDX imports
vi.mock("../lib/registry", () => {
  const Home = () => null;
  return {
    getPage: () => ({
      slug: "overview",
      title: "Overview",
      description: "",
      icon: Home,
      Component: () => <div>Overview Page</div>,
    }),
    pagesMeta: [
      { slug: "overview", title: "Overview", description: "", icon: Home },
    ],
  };
});

// Mock router
vi.mock("../lib/router", () => ({
  useHashRoute: () => ["overview", vi.fn()],
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

const renderLayout = (children: ReactNode) => {
  return render(<AppLayout slug="overview">{children}</AppLayout>);
};

describe("AppLayout", () => {
  it("renders children", () => {
    renderLayout(<div>Main Content</div>);
    expect(screen.getByText("Main Content")).toBeDefined();
  });

  it("renders header with title", () => {
    renderLayout(<div>Content</div>);
    expect(screen.getByText("Lentil UI")).toBeDefined();
  });

  it("renders sidebar navigation", () => {
    renderLayout(<div>Content</div>);
    // Sidebar should have navigation items
    expect(screen.getByText("Overview")).toBeDefined();
  });

  it("toggles sidebar on button click", () => {
    renderLayout(<div>Content</div>);

    // Find the toggle button (first button in the header)
    const [toggleButton] = screen.getAllByRole("button");

    // Sidebar should start expanded (w-64)
    const aside = document.querySelector("aside")!;
    expect(aside.className).toContain("w-64");

    // Click toggle
    fireEvent.click(toggleButton!);

    // Sidebar should now be collapsed
    expect(aside.className).toContain("w-12");
  });

  it("renders sidebar with Components label", () => {
    renderLayout(<div>Content</div>);
    expect(screen.getByText("Components")).toBeDefined();
  });
});
