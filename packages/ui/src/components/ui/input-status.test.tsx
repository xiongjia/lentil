import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputStatus } from "./input-status";

describe("InputStatus", () => {
  it("should render an input", () => {
    render(<InputStatus placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  it("should display error message with AlertCircle icon", () => {
    render(<InputStatus error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
    // The error container should be visible
    const msg = screen.getByText("Something went wrong");
    expect(msg).toHaveClass("text-red-500");
  });

  it("should display success message with CheckCircle2 icon when no error", () => {
    render(<InputStatus success="Looks good" />);
    expect(screen.getByText("Looks good")).toBeDefined();
    const msg = screen.getByText("Looks good");
    expect(msg).toHaveClass("text-green-600");
  });

  it("should show error over success when both are provided", () => {
    render(<InputStatus error="Still broken" success="Looks good" />);
    expect(screen.getByText("Still broken")).toBeDefined();
    expect(screen.queryByText("Looks good")).toBeNull();
  });

  it("should apply error border class when error is set", () => {
    const { container } = render(<InputStatus error="Error" />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("border-red-500");
  });

  it("should not apply error border when no error", () => {
    const { container } = render(<InputStatus />);
    const input = container.querySelector("input");
    expect(input).not.toHaveClass("border-red-500");
  });

  it("should preserve custom className", () => {
    const { container } = render(
      <InputStatus className="my-custom" success="ok" />,
    );
    const input = container.querySelector("input");
    expect(input).toHaveClass("my-custom");
  });

  it("should forward type attribute", () => {
    const { container } = render(<InputStatus type="email" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should have displayName", () => {
    expect(InputStatus.displayName).toBe("InputStatus");
  });

  it("should render empty min-h spacer when no status messages", () => {
    const { container } = render(<InputStatus />);
    const spacer = container.querySelector(".min-h-5");
    expect(spacer).toBeDefined();
    expect(spacer?.textContent).toBe("");
  });
});
