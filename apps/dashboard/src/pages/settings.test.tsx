import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Settings from "./settings";

const mockList = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockRemove = vi.fn();
const mockTest = vi.fn();

vi.mock("../lib/rpc", () => ({
  rpc: {
    integration: {
      list: () => mockList(),
      create: (input: unknown) => mockCreate(input),
      update: (input: unknown) => mockUpdate(input),
      remove: (input: unknown) => mockRemove(input),
      test: (input: unknown) => mockTest(input),
    },
  },
}));

const makeDs = () => ({
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "test-db",
  description: null,
  type: "postgresql",
  config: {
    host: "localhost",
    port: 5432,
    database: "mydb",
    user: "pg",
    password: "secret",
  },
  enabled: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-06-01"),
});

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([]);
  });

  it("renders page title and Add button", async () => {
    render(<Settings />);
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("Add Data Source")).toBeDefined();
  });

  it("shows empty state initially", async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText("No data sources configured yet.")).toBeDefined();
    });
  });

  it("opens form dialog on Add button click", async () => {
    render(<Settings />);

    fireEvent.click(screen.getByText("Add Data Source"));

    await waitFor(() => {
      expect(
        screen.getByText("Configure a new external data source."),
      ).toBeDefined();
    });
  });

  it("renders datasource rows and opens Edit on click", async () => {
    mockList.mockResolvedValue([makeDs()]);
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText("test-db")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Edit"));

    await waitFor(() => {
      // Edit dialog title should appear
      expect(screen.getByText("Edit Data Source")).toBeDefined();
    });
  });

  it("opens delete confirmation on Delete click", async () => {
    mockList.mockResolvedValue([makeDs()]);
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText("test-db")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(screen.getByText("Delete Data Source")).toBeDefined();
    });
  });

  it("calls rpc.integration.test on Test click and shows alert", async () => {
    mockList.mockResolvedValue([makeDs()]);
    mockTest.mockResolvedValue({ ok: true });
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText("test-db")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Test"));

    await waitFor(() => {
      expect(mockTest).toHaveBeenCalledWith({
        type: "postgresql",
        config: makeDs().config,
      });
    });

    // Alert should show success
    expect(
      screen.getByText(/Connection to "test-db" succeeded./),
    ).toBeDefined();
  });

  it("shows error alert when Test fails", async () => {
    mockList.mockResolvedValue([makeDs()]);
    mockTest.mockResolvedValue({ ok: false, error: "timeout" });
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText("test-db")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Test"));

    await waitFor(() => {
      expect(screen.getByText(/failed: timeout/)).toBeDefined();
    });
  });
});
