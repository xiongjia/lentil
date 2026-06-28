import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DatasourceList } from "./datasource-list";
import type { ExternalDataSource } from "../lib/rpc";

const mockList = vi.fn();

vi.mock("../lib/rpc", () => ({
  rpc: {
    integration: {
      list: () => mockList(),
    },
  },
}));

const makeDs = (
  overrides: Partial<ExternalDataSource> = {},
): ExternalDataSource => ({
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "test-db",
  description: null,
  type: "postgresql",
  config: {
    host: "localhost",
    port: 5432,
    database: "db",
    user: "u",
    password: "p",
  },
  enabled: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-06-01"),
  ...overrides,
});

const onEdit = vi.fn();
const onDelete = vi.fn();
const onTest = vi.fn();

const renderList = (refreshKey = 0) =>
  render(
    <DatasourceList
      refreshKey={refreshKey}
      onEdit={onEdit}
      onDelete={onDelete}
      onTest={onTest}
    />,
  );

describe("DatasourceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockList.mockReturnValue(new Promise(() => {})); // never resolves
    renderList();
    expect(screen.getByText("Loading data sources...")).toBeDefined();
  });

  it("shows empty state when no datasources", async () => {
    mockList.mockResolvedValue([]);
    renderList();
    await waitFor(() => {
      expect(screen.getByText("No data sources configured yet.")).toBeDefined();
    });
  });

  it("shows error state on failure", async () => {
    mockList.mockRejectedValue(new Error("Network error"));
    renderList();
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeDefined();
    });
  });

  it("renders datasource rows", async () => {
    mockList.mockResolvedValue([
      makeDs({ name: "pg-prod", type: "postgresql", enabled: true }),
      makeDs({
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        name: "pg-staging",
        type: "postgresql",
        enabled: false,
      }),
    ]);
    renderList();

    await waitFor(() => {
      expect(screen.getByText("pg-prod")).toBeDefined();
    });
    expect(screen.getByText("pg-staging")).toBeDefined();
    expect(screen.getByText("Enabled")).toBeDefined();
    expect(screen.getByText("Disabled")).toBeDefined();
  });

  it("calls onEdit when Edit button is clicked", async () => {
    mockList.mockResolvedValue([makeDs({ name: "pg-prod" })]);
    renderList();

    await waitFor(() => {
      expect(screen.getByText("pg-prod")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("calls onDelete when Delete button is clicked", async () => {
    mockList.mockResolvedValue([makeDs({ name: "pg-prod" })]);
    renderList();

    await waitFor(() => {
      expect(screen.getByText("pg-prod")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("calls onTest when Test button is clicked", async () => {
    mockList.mockResolvedValue([makeDs({ name: "pg-prod" })]);
    renderList();

    await waitFor(() => {
      expect(screen.getByText("pg-prod")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Test"));
    expect(onTest).toHaveBeenCalledOnce();
  });
});
