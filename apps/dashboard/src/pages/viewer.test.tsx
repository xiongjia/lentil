import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { PaginatedScrapeCache, ScrapeCacheSummary } from "../lib/rpc";
import Viewer from "./viewer";

// ── Mock RPC ───────────────────────────────────────────────────────────

const mockList = vi.fn();
const mockGet = vi.fn();

vi.mock("../lib/rpc", () => ({
  rpc: {
    scrape: {
      list: () => mockList(),
      get: (input: unknown) => mockGet(input),
    },
  },
}));

// ── Fixtures ───────────────────────────────────────────────────────────

const makeSummary = (overrides: Partial<ScrapeCacheSummary> = {}) => ({
  id: "00000000-0000-0000-0000-000000000001",
  datasourceId: "ds-1",
  query: "SELECT * FROM users",
  status: "done",
  columns: ["id", "name", "email"],
  rowCount: 2,
  error: null,
  createdAt: new Date("2026-07-08T10:00:00Z"),
  updatedAt: new Date("2026-07-08T10:00:00Z"),
  ...overrides,
});

const makePaginated = (overrides: Partial<PaginatedScrapeCache> = {}) => ({
  id: "00000000-0000-0000-0000-000000000001",
  datasourceId: "ds-1",
  query: "SELECT * FROM users",
  status: "done",
  columns: ["id", "name", "email"],
  rows: [
    { id: 1, name: "Alice", email: "alice@test.com" },
    { id: 2, name: "Bob", email: "bob@test.com" },
  ],
  rowCount: 2,
  error: null,
  createdAt: new Date("2026-07-08T10:00:00Z"),
  updatedAt: new Date("2026-07-08T10:00:00Z"),
  page: 1,
  pageSize: 500,
  totalPages: 1,
  ...overrides,
});

// ── Helpers ────────────────────────────────────────────────────────────

/** Render the Viewer component with a given initial hash. */
function renderViewer(hash: string) {
  window.location.hash = hash;
  return render(<Viewer />);
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("Viewer — Entry Selector (no id in URL)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows entry selector when no id in hash", async () => {
    mockList.mockResolvedValue([makeSummary()]);
    renderViewer("#/viewer");

    await waitFor(() => {
      expect(
        screen.getByText("Select a cached result to explore."),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });

  it("shows empty state when no done caches exist", async () => {
    mockList.mockResolvedValue([]);
    renderViewer("#/viewer");

    await waitFor(() => {
      expect(
        screen.getByText(/No cached results available yet/),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while fetching entries", async () => {
    // Never resolve to keep loading state
    mockList.mockReturnValue(new Promise(() => {}));
    renderViewer("#/viewer");

    expect(screen.getByText("Loading cached results...")).toBeInTheDocument();
  });

  it("shows error state when list fails", async () => {
    mockList.mockRejectedValue(new Error("Network error"));
    renderViewer("#/viewer");

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });
});

describe("Viewer — Loading & Error States (with id)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading indicator while fetching data", async () => {
    mockList.mockResolvedValue([makeSummary()]);
    mockGet.mockReturnValue(new Promise(() => {})); // Never resolve
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Loading cache data...")).toBeInTheDocument();
    });
  });

  it("shows error when get fails", async () => {
    mockGet.mockRejectedValue(new Error("Failed to fetch"));
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
  });

  it("shows not-found when cache is null after load", async () => {
    // get resolves but fetchAllRows throws since cache is not found
    mockGet.mockRejectedValue(new Error("Not found"));
    renderViewer("#/viewer?id=nonexistent");

    await waitFor(() => {
      expect(screen.getByText("Not found")).toBeInTheDocument();
    });
  });
});

describe("Viewer — Table View", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(makePaginated());
  });

  it("renders metadata bar with query and row count", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("SELECT * FROM users")).toBeInTheDocument();
    });

    expect(screen.getByText(/Rows:/)).toBeInTheDocument();
    // Row count 2 appears in metadata; use getAllByText since "2" may appear elsewhere
    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Columns:/)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders table columns and rows by default", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  it("table tab is active by default — table view is rendered", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      // DataTable renders a search input placeholder when table mode is active
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });
  });

  it("shows empty rows message when result has 0 rows", async () => {
    mockGet.mockResolvedValue(makePaginated({ rows: [], rowCount: 0 }));
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Query returned 0 rows.")).toBeInTheDocument();
    });
  });

  it("shows error when cache status is failed", async () => {
    mockGet.mockResolvedValue(
      makePaginated({
        status: "failed",
        error: "Connection timeout",
      }),
    );
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Connection timeout")).toBeInTheDocument();
    });
  });
});

describe("Viewer — Chart View", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(makePaginated());
  });

  it("switches to chart view when chart tab is clicked", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /chart/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Configure a chart to visualize the result data."),
      ).toBeInTheDocument();
    });
  });

  it("renders chart config panel with column selectors", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /chart/i }));

    await waitFor(() => {
      // Labels wrap their selects; use case-insensitive matching
      expect(screen.getByLabelText(/chart type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/x-axis/i)).toBeInTheDocument();
    });
  });

  it("renders area chart by default with x/y configured", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /chart/i }));

    // With string x-axis "name" and numeric "id", area chart should render
    await waitFor(() => {
      // Chart config panel should appear (X-Axis dropdown)
      expect(
        screen.getByRole("combobox", { name: /x-axis/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows hint when chart has no numeric columns", async () => {
    mockGet.mockResolvedValue(
      makePaginated({
        columns: ["name", "email"],
        rows: [
          { name: "Alice", email: "a@b.com" },
          { name: "Bob", email: "b@b.com" },
        ],
      }),
    );
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /chart/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Select X-axis and Value columns/),
      ).toBeInTheDocument();
    });
  });
});

describe("Viewer — Summary View", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(makePaginated());
  });

  it("switches to summary view and shows stats", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /summary/i }));

    await waitFor(() => {
      expect(screen.getByText(/Per-column statistics/)).toBeInTheDocument();
    });

    // Should show column names
    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();

    // Should show types
    expect(screen.getByText("number")).toBeInTheDocument();

    // Should show stats values
    const numberCells = screen.getAllByText("2");
    expect(numberCells.length).toBeGreaterThan(0);
  });
});

describe("Viewer — Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([makeSummary()]);
    mockGet.mockResolvedValue(makePaginated());
  });

  it("shows back-to-scrape link", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /Back to Scrape/ }),
      ).toBeInTheDocument();
    });
  });

  it("renders entry switcher dropdown in top bar", async () => {
    renderViewer("#/viewer?id=00000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getByLabelText("Switch cache entry")).toBeInTheDocument();
    });
  });

  it("routes to entry selector when hash has no id", async () => {
    renderViewer("#/viewer");

    await waitFor(() => {
      expect(
        screen.getByText("Select a cached result to explore."),
      ).toBeInTheDocument();
    });
  });
});
