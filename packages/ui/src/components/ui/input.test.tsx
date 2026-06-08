import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("should render", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should support type attribute", () => {
    const { container } = render(<Input type="email" />);
    expect(container.firstChild).toHaveAttribute("type", "email");
  });

  it("should support disabled state", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should have displayName", () => {
    expect(Input.displayName).toBe("Input");
  });
});
