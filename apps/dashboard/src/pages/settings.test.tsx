import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Settings from "./settings";

describe("Settings", () => {
  it("renders the Settings card with title", () => {
    render(<Settings />);
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("renders the coming soon description", () => {
    render(<Settings />);
    expect(screen.getByText("Settings panel coming soon.")).toBeDefined();
  });

  it("renders the placeholder text", () => {
    render(<Settings />);
    expect(
      screen.getByText("Configure your dashboard preferences here."),
    ).toBeDefined();
  });
});
