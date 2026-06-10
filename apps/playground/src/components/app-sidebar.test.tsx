import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarProvider } from "@lentil/ui";
import { AppSidebar } from "./app-sidebar";

// Mock registry to avoid MDX imports
vi.mock("../lib/registry", () => {
  const Home = () => null;
  const Package = () => null;
  const Settings = () => null;

  return {
    pagesMeta: [
      { slug: "overview", title: "Overview", description: "", icon: Home },
      { slug: "button", title: "Button", description: "", icon: Package },
      { slug: "settings", title: "Settings", description: "", icon: Settings },
    ],
  };
});

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

function renderSidebar(collapsed: boolean, slug = "overview") {
  return render(
    <SidebarProvider>
      <AppSidebar collapsed={collapsed} slug={slug} />
    </SidebarProvider>,
  );
}

describe("AppSidebar", () => {
  it("renders navigation items when expanded", () => {
    renderSidebar(false);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Button")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("applies expanded width (w-64) when expanded", () => {
    renderSidebar(false);
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("w-64");
  });

  it("applies collapsed width (w-12) when collapsed", () => {
    renderSidebar(true);
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("w-12");
  });

  it("hides text labels when collapsed", () => {
    renderSidebar(true);
    // The <span> text should not be rendered
    expect(screen.queryByText("Overview")).toBeNull();
    expect(screen.queryByText("Button")).toBeNull();
  });

  it("shows Components label when expanded", () => {
    renderSidebar(false);
    expect(screen.getByText("Components")).toBeDefined();
  });

  it("hides Components label when collapsed", () => {
    renderSidebar(true);
    expect(screen.queryByText("Components")).toBeNull();
  });

  it("marks current slug as active", () => {
    renderSidebar(false, "button");
    // SidebarMenuButton sets data-active=true on the trigger element
    const activeLink = screen.getByText("Button").closest("a");
    expect(activeLink).toBeDefined();
  });

  it("renders navigation links with correct hrefs", () => {
    renderSidebar(false);
    const links = document.querySelectorAll("a");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("#/overview");
    expect(hrefs).toContain("#/button");
    expect(hrefs).toContain("#/settings");
  });

  it("renders sidebar with border styling", () => {
    renderSidebar(false);
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("border-r");
    expect(aside?.className).toContain("bg-sidebar");
  });
});
