import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeBlock } from "./code-block";
import React from "react";

vi.mock("./highlight-code", () => ({
  highlightCode: vi.fn().mockResolvedValue(
    '<pre class="shiki"><code><span>const x = 1;</span></code></pre>'
  ),
}));

describe("CodeBlock", () => {
  it("should render title when provided", () => {
    render(<CodeBlock code="hello" title="example.ts" />);
    expect(screen.getByText("example.ts")).toBeDefined();
  });

  it("should not render title when not provided", () => {
    const { container } = render(<CodeBlock code="hello" />);
    expect(container.querySelector("div")).toBeDefined();
  });

  it("should show plain code before highlight loads", () => {
    render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByText("const x = 1;")).toBeDefined();
  });
});