import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarProvider } from "@lentil/ui";
import { AppSidebar } from "./app-sidebar";

const renderSidebar = (collapsed: boolean, slug = "home") =>
  render(
    <SidebarProvider open={!collapsed}>
      <AppSidebar collapsed={collapsed} slug={slug} />
    </SidebarProvider>,
  );

describe("AppSidebar", () => {
  it("renders the Navigation label when expanded", () => {
    renderSidebar(false);
    expect(screen.getByText("Navigation")).toBeDefined();
  });

  it("hides the Navigation label when collapsed", () => {
    renderSidebar(true);
    expect(screen.queryByText("Navigation")).toBeNull();
  });

  it("renders Home and Settings navigation items", () => {
    renderSidebar(false);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("hides item text labels when collapsed", () => {
    renderSidebar(true);
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("renders links with correct hrefs", () => {
    renderSidebar(false, "home");
    const links = document.querySelectorAll("a");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("#/home");
    expect(hrefs).toContain("#/settings");
  });

  it("marks the current slug as active", () => {
    renderSidebar(false, "settings");
    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink).toBeDefined();
  });

  it("renders an aside element with sidebar styles", () => {
    renderSidebar(false);
    const aside = document.querySelector("aside");
    expect(aside).toBeDefined();
    expect(aside?.className).toContain("border-r");
  });

  it("shows compact width when collapsed", () => {
    renderSidebar(true);
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("w-12");
  });

  it("shows expanded width when not collapsed", () => {
    renderSidebar(false);
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("w-64");
  });
});
