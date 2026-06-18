import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "./data-table";

import type { ColumnDef } from "@tanstack/react-table";

type TestRow = { name: string; value: number };

const columnHelper = createColumnHelper<TestRow>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("value", { header: "Value" }),
] as ColumnDef<TestRow, unknown>[];

const data: TestRow[] = [
  { name: "Alice", value: 100 },
  { name: "Bob", value: 200 },
  { name: "Charlie", value: 300 },
];

describe("DataTable", () => {
  it("should render rows", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("should render column headers", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Value")).toBeDefined();
  });

  it("should show empty state", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results.")).toBeDefined();
  });

  it("should show search input when searchKey is provided", () => {
    const { container } = render(
      <DataTable columns={columns} data={data} searchKeys={["name"]} />,
    );
    expect(container.querySelector("input")).toBeDefined();
  });

  it("should show row checkboxes when enableRowSelection is true", () => {
    const { container } = render(
      <DataTable columns={columns} data={data} enableRowSelection />,
    );
    expect(
      container.querySelectorAll('[role="checkbox"]').length,
    ).toBeGreaterThan(0);
  });

  it("should render pagination info", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText(/3 row\(s\) total/)).toBeDefined();
  });

  it("should show Columns dropdown", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Columns")).toBeDefined();
  });
});
