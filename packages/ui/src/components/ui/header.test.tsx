import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";
describe("Header", () => {
  it("should render with title", () => {
    render(<Header title="Test Header" />);
    expect(screen.getByText("Test Header")).toBeDefined();
  });

  it("should render children in right slot", () => {
    render(
      <Header title="Test">
        <button>Action</button>
      </Header>,
    );
    expect(screen.getByText("Action")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Header title="Test" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should have displayName", () => {
    expect(Header.displayName).toBe("Header");
  });
});
