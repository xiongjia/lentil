import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./home";

const mockHealth = vi.fn();

vi.mock("../lib/rpc", () => ({
  rpc: {
    general: {
      health: () => mockHealth(),
    },
  },
}));

describe("Home", () => {
  beforeEach(() => {
    mockHealth.mockReset();
  });

  it("renders the Home card with title and description", () => {
    render(<Home />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Welcome to the Dashboard")).toBeDefined();
  });

  it("renders the Check Health button", () => {
    render(<Home />);
    expect(screen.getByText("Check Health")).toBeDefined();
  });

  it("opens the health dialog with server status on success", async () => {
    mockHealth.mockResolvedValue({ status: "ok" });
    render(<Home />);

    fireEvent.click(screen.getByText("Check Health"));

    await waitFor(() => {
      expect(screen.getByText("Health Check")).toBeDefined();
    });
    expect(screen.getByText("Server status: ok")).toBeDefined();
    expect(mockHealth).toHaveBeenCalledOnce();
  });

  it("shows error message in dialog when health check fails", async () => {
    mockHealth.mockRejectedValue(new Error("Network error"));
    render(<Home />);

    fireEvent.click(screen.getByText("Check Health"));

    await waitFor(() => {
      expect(screen.getByText("Health Check")).toBeDefined();
    });
    expect(
      screen.getByText("Server status: Error: Network error"),
    ).toBeDefined();
  });

  it("shows unknown error message for non-Error rejections", async () => {
    mockHealth.mockRejectedValue("string error");
    render(<Home />);

    fireEvent.click(screen.getByText("Check Health"));

    await waitFor(() => {
      expect(screen.getByText("Health Check")).toBeDefined();
    });
    expect(screen.getByText("Server status: Error: Unknown")).toBeDefined();
  });
});
