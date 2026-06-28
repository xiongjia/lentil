import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceForm } from "./datasource-form";
import type { ExternalDataSource } from "../lib/rpc";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("../lib/rpc", () => ({
  rpc: {
    integration: {
      create: (input: unknown) => mockCreate(input),
      update: (input: unknown) => mockUpdate(input),
    },
  },
}));

const makeDs = (overrides: Partial<ExternalDataSource> = {}): ExternalDataSource => ({
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "test-db",
  description: null,
  type: "postgresql",
  config: { host: "localhost", port: 5432, database: "mydb", user: "pg", password: "secret" },
  enabled: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-06-01"),
  ...overrides,
});

describe("DatasourceForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create mode with empty fields", () => {
    render(
      <DatasourceForm
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByText("Add Data Source")).toBeDefined();
    expect(
      screen.getByText("Configure a new external data source."),
    ).toBeDefined();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Host") as HTMLInputElement).value).toBe("");
  });

  it("renders edit mode with pre-filled fields", () => {
    render(
      <DatasourceForm
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
        datasource={makeDs({ name: "prod-db" })}
      />,
    );

    expect(screen.getByText("Edit Data Source")).toBeDefined();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "prod-db",
    );
    expect((screen.getByLabelText("Host") as HTMLInputElement).value).toBe(
      "localhost",
    );
  });

  it("calls create RPC on submit in create mode and shows Close button", async () => {
    mockCreate.mockResolvedValue({
      ...makeDs(),
      connectionTest: { ok: true },
    });
    const onSaved = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DatasourceForm
        open={true}
        onOpenChange={onOpenChange}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "new-db" },
    });
    fireEvent.change(screen.getByLabelText("Host"), {
      target: { value: "db.example.com" },
    });
    fireEvent.change(screen.getByLabelText("Port"), {
      target: { value: "5432" },
    });
    fireEvent.change(screen.getByLabelText("Database"), {
      target: { value: "mydb" },
    });
    fireEvent.change(screen.getByLabelText("User"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByText("Create"));

    await vi.waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        type: "postgresql",
        config: {
          host: "db.example.com",
          port: 5432,
          database: "mydb",
          user: "admin",
          password: "pass123",
        },
        name: "new-db",
      });
      expect(onSaved).toHaveBeenCalledOnce();
    });

    // Dialog stays open — Cancel/Create are gone, test result & Close shown
    expect(screen.queryByText("Cancel")).toBeNull();
    expect(screen.queryByText("Create")).toBeNull();
    expect(screen.getByText("Connection test passed.")).toBeDefined();
    // Click our Close button (distinguished from Dialog's X via aria-label)
    fireEvent.click(screen.getByRole("button", { name: "Close form" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows error message on RPC failure", async () => {
    mockCreate.mockRejectedValue(new Error("Conflict"));
    const onSaved = vi.fn();

    render(
      <DatasourceForm
        open={true}
        onOpenChange={vi.fn()}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "dup" },
    });
    fireEvent.change(screen.getByLabelText("Host"), {
      target: { value: "h" },
    });
    fireEvent.change(screen.getByLabelText("Port"), {
      target: { value: "5432" },
    });
    fireEvent.change(screen.getByLabelText("Database"), {
      target: { value: "d" },
    });
    fireEvent.change(screen.getByLabelText("User"), {
      target: { value: "u" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "p" },
    });

    fireEvent.click(screen.getByText("Create"));

    await vi.waitFor(() => {
      expect(screen.getByText("Error: Conflict")).toBeDefined();
    });
    expect(onSaved).not.toHaveBeenCalled();
  });
});
