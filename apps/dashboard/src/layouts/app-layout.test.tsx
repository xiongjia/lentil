import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppLayout } from "./app-layout";

const renderLayout = (children = <p>Main Content</p>, slug = "home") =>
  render(<AppLayout slug={slug}>{children}</AppLayout>);

describe("AppLayout", () => {
  it("renders children", () => {
    renderLayout();
    expect(screen.getByText("Main Content")).toBeDefined();
  });

  it("renders the header with Dashboard title", () => {
    renderLayout();
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("renders sidebar navigation items", () => {
    renderLayout();
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("Navigation")).toBeDefined();
  });

  it("renders a ThemeToggle button", () => {
    renderLayout();
    expect(screen.getByLabelText(/switch to/i)).toBeDefined();
  });

  it("toggles sidebar when the header button is clicked", () => {
    renderLayout(<p>Content</p>);
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("w-64");

    const buttons = screen.getAllByRole("button") as [
      HTMLElement,
      ...HTMLElement[],
    ];
    fireEvent.click(buttons[0]);

    expect(aside?.className).toContain("w-12");
  });
});
