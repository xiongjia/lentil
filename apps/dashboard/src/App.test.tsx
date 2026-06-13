import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./lib/rpc", () => ({
  rpc: {
    general: {
      health: vi.fn().mockResolvedValue({ status: "ok" }),
      hello: vi.fn().mockResolvedValue({ message: "Hello" }),
    },
  },
}));

describe("App", () => {
  it("renders Check Health button", () => {
    render(<App />);
    expect(screen.getByText("Check Health")).toBeInTheDocument();
  });
});
