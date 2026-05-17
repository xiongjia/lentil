import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("should apply default variant and size", () => {
    const { container } = render(<Button>Default</Button>);
    expect(container.firstChild).toHaveClass("inline-flex");
    expect(container.firstChild).toHaveClass("h-9");
    expect(container.firstChild).toHaveClass("px-4");
  });

  it("should apply destructive variant", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass("bg-destructive");
  });

  it("should apply outline variant", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.firstChild).toHaveClass("border");
    expect(container.firstChild).toHaveClass("border-input");
  });

  it("should apply secondary variant", () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild).toHaveClass("bg-secondary");
  });

  it("should apply ghost variant", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.firstChild).toHaveClass("hover:bg-accent");
  });

  it("should apply link variant", () => {
    const { container } = render(<Button variant="link">Link</Button>);
    expect(container.firstChild).toHaveClass("text-primary");
    expect(container.firstChild).toHaveClass("underline-offset-4");
  });

  it("should apply small size", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toHaveClass("h-8");
    expect(container.firstChild).toHaveClass("px-3");
    expect(container.firstChild).toHaveClass("text-xs");
  });

  it("should apply large size", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild).toHaveClass("h-10");
    expect(container.firstChild).toHaveClass("px-8");
  });

  it("should apply icon size", () => {
    const { container } = render(<Button size="icon">Icon</Button>);
    expect(container.firstChild).toHaveClass("h-9");
    expect(container.firstChild).toHaveClass("w-9");
  });

  it("should be disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("should forward ref to button element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should apply custom className", () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should render with asChild and forward to Slot", () => {
    render(
      <Button asChild>
        <span>Child</span>
      </Button>
    );
    expect(screen.getByText("Child")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(Button.displayName).toBe("Button");
  });
});