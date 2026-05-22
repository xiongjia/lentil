import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Content } from "./content";
import React from "react";

describe("Content", () => {
  it("should render children", () => {
    render(
      <Content>
        <p>Hello</p>
      </Content>
    );
    expect(document.querySelector("p")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Content className="custom-class">
        <p>Hello</p>
      </Content>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should have displayName", () => {
    expect(Content.displayName).toBe("Content");
  });
});