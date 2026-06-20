import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  it("renders Home page by default", async () => {
    window.location.hash = "#/home";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Check Health")).toBeInTheDocument();
    });
    expect(screen.getByText("Welcome to the Dashboard")).toBeInTheDocument();
  });
});
