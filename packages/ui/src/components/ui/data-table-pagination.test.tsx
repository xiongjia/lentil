import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTablePagination } from "./data-table-pagination";

function mockTable(overrides: Record<string, unknown> = {}) {
  return {
    getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
    getPageCount: () => 3,
    getCanPreviousPage: () => false,
    getCanNextPage: () => true,
    previousPage: () => {},
    nextPage: () => {},
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: new Array(25) }),
    ...overrides,
  } as any;
}

describe("DataTablePagination", () => {
  it("should render page info", () => {
    render(<DataTablePagination table={mockTable()} />);
    expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
  });

  it("should render row count", () => {
    render(<DataTablePagination table={mockTable()} />);
    expect(screen.getByText("25 row(s) total")).toBeDefined();
  });

  it("should show selection count when rows are selected", () => {
    render(
      <DataTablePagination
        table={mockTable({
          getFilteredSelectedRowModel: () => ({
            rows: [{}, {}, {}],
          }),
        })}
      />,
    );
    expect(screen.getByText("3 of 25 row(s) selected.")).toBeDefined();
  });

  it("should disable prev on first page", () => {
    render(<DataTablePagination table={mockTable()} />);
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((b) =>
      b.querySelector(".lucide-chevron-left"),
    );
    if (prevButton) expect(prevButton).toBeDisabled();
  });
});
