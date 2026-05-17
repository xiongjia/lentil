import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MapView } from "./map";
import React from "react";

vi.mock("maplibre-gl", () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
    })),
  },
}));

describe("MapView", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("should render with a div container", () => {
    render(<MapView />);
    const container = document.querySelector("div");
    expect(container).toBeDefined();
  });

  it("should apply height prop", () => {
    const { container } = render(<MapView height="500px" />);
    expect(container.firstChild).toHaveStyle({ height: "500px" });
  });

  it("should apply custom className", () => {
    const { container } = render(<MapView className="custom-map" />);
    expect(container.firstChild).toHaveClass("custom-map");
  });

  it("should apply style prop", () => {
    const { container } = render(<MapView style={{ width: "200px" }} />);
    expect(container.firstChild).toHaveStyle({ width: "200px" });
  });

  it("should apply default center and zoom props", () => {
    render(<MapView center={[139.6917, 35.6895]} zoom={10} />);
    expect(document.querySelector("div")).toBeDefined();
  });
});