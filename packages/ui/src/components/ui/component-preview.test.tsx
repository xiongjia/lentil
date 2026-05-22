import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentPreview } from "./component-preview";
import React from "react";

describe("ComponentPreview", () => {
  it("should render children in preview area", () => {
    render(
      <ComponentPreview>
        <button>Test Button</button>
      </ComponentPreview>
    );
    expect(screen.getByText("Test Button")).toBeDefined();
  });

  it("should render code block when code prop is provided", () => {
    render(
      <ComponentPreview code="<Button>Hello</Button>">
        <button>Hello</button>
      </ComponentPreview>
    );
    expect(screen.getByText("<Button>Hello</Button>")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ComponentPreview className="custom-class">
        <button>Hello</button>
      </ComponentPreview>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should have displayName", () => {
    expect(ComponentPreview.displayName).toBe("ComponentPreview");
  });
});