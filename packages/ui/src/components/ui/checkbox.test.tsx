import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("should render", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(<Checkbox className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should be checkable", () => {
    const { container } = render(<Checkbox checked />);
    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("should have displayName", () => {
    expect(Checkbox.displayName).toBe("Checkbox");
  });
});
