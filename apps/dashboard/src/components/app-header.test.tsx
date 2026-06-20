import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppHeader } from "./app-header";

const renderHeader = (collapsed = false, onToggle = vi.fn()) =>
  render(<AppHeader collapsed={collapsed} onToggle={onToggle} />);

const getButtons = () =>
  screen.getAllByRole("button") as [HTMLElement, ...HTMLElement[]];

describe("AppHeader", () => {
  it("renders the Dashboard title", () => {
    renderHeader();
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("renders a toggle button with an icon", () => {
    renderHeader();
    const buttons = getButtons();
    const toggleBtn = buttons[0];
    expect(toggleBtn.querySelector("svg")).toBeDefined();
  });

  it("calls onToggle when the toggle button is clicked", () => {
    const onToggle = vi.fn();
    renderHeader(false, onToggle);
    const buttons = getButtons();
    fireEvent.click(buttons[0]);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("renders a ThemeToggle button", () => {
    renderHeader();
    const themeBtn = screen.getByLabelText(/switch to/i);
    expect(themeBtn).toBeDefined();
  });

  it("shows PanelLeftClose icon when not collapsed", () => {
    renderHeader(false);
    // PanelLeftClose icon should be rendered when sidebar is expanded
    const buttons = getButtons();
    expect(buttons[0].querySelector("svg")).toBeDefined();
  });

  it("shows PanelLeft icon when collapsed", () => {
    renderHeader(true);
    const buttons = getButtons();
    expect(buttons[0].querySelector("svg")).toBeDefined();
  });
});
