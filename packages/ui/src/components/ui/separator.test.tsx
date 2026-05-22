import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "./separator";
import React from "react";

describe("Separator", () => {
  it("should render horizontal by default", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("h-[1px]");
    expect(container.firstChild).toHaveClass("w-full");
  });

  it("should render vertical when orientation is vertical", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.firstChild).toHaveClass("h-full");
    expect(container.firstChild).toHaveClass("w-[1px]");
  });

  it("should apply custom className", () => {
    const { container } = render(<Separator className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should have displayName", () => {
    expect(Separator.displayName).toBeDefined();
  });
});