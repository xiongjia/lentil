import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppHeader } from "./app-header";

function renderHeader(collapsed = false, onToggle?: () => void) {
  return render(
    <AppHeader collapsed={collapsed} onToggle={onToggle ?? vi.fn()} />,
  );
}

/** Returns toggle button + theme button, asserting both exist. */
function getButtons() {
  const buttons = screen.getAllByRole("button");
  return buttons as [HTMLElement, ...HTMLElement[]];
}

describe("AppHeader", () => {
  it("renders header with title", () => {
    renderHeader();
    expect(screen.getByText("Lentil UI")).toBeDefined();
  });

  it("shows PanelLeftClose icon when expanded", () => {
    renderHeader(false);
    const [btn] = getButtons();
    expect(btn.querySelector("svg")).toBeDefined();
  });

  it("shows PanelLeft icon when collapsed", () => {
    renderHeader(true);
    const [btn] = getButtons();
    expect(btn.querySelector("svg")).toBeDefined();
  });

  it("calls onToggle on button click", () => {
    const onToggle = vi.fn();
    renderHeader(false, onToggle);

    const [btn] = getButtons();
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("renders ThemeToggle", () => {
    renderHeader();
    const [, themeBtn] = getButtons();
    expect(themeBtn!.getAttribute("aria-label")).toMatch(/switch to/i);
  });
});
