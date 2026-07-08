import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BarChart3, Table2, FileText } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ChartArea,
  ChartPie,
  ChartRadar,
} from "@lentil/ui";
import type { ColumnDef } from "@tanstack/react-table";
import type { PaginatedScrapeCache, ScrapeCacheSummary } from "../lib/rpc";
import { rpc } from "../lib/rpc";
import { formatDateTime } from "../lib/format";

// ── Types ──────────────────────────────────────────────────────────────

type ViewMode = "table" | "chart" | "summary";

type ChartType = "area" | "pie" | "radar";

type AggregateType = "none" | "sum" | "avg" | "count" | "min" | "max";

interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  aggregate: AggregateType;
}

interface ColumnStats {
  name: string;
  type: "number" | "string" | "other";
  count: number;
  distinct: number;
  nonNull: number;
  min?: number;
  max?: number;
  avg?: number;
}

const viewModeIcons: Record<ViewMode, React.ReactNode> = {
  table: <Table2 className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
  summary: <FileText className="h-4 w-4" />,
};

const CHART_COLORS: string[] = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210, 80%, 60%)",
  "hsl(30, 80%, 60%)",
  "hsl(150, 60%, 50%)",
  "hsl(280, 60%, 60%)",
  "hsl(0, 70%, 60%)",
];

/** Max pageSize for batch-fetching all rows from the server. */
const BATCH_PAGE_SIZE = 500;

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Fetch every page of a cache entry and return all rows.
 *
 * **Performance note**: Pages are fetched sequentially. With a 10 000-row
 * result and pageSize=500 this makes up to 20 serial requests. For large
 * datasets a future optimization could use concurrent fetches (e.g. 4 at a
 * time) via `Promise.allSettled` without overwhelming the server.
 */
async function fetchAllRows(
  id: string,
): Promise<{
  cache: PaginatedScrapeCache;
  allRows: Record<string, unknown>[];
}> {
  const firstPage = await rpc.scrape.get({
    id,
    page: 1,
    pageSize: BATCH_PAGE_SIZE,
  });
  const allRows = [...firstPage.rows];

  for (let p = 2; p <= firstPage.totalPages; p++) {
    const page = await rpc.scrape.get({
      id,
      page: p,
      pageSize: BATCH_PAGE_SIZE,
    });
    allRows.push(...page.rows);
  }

  return { cache: firstPage, allRows };
}

/** Aggregate rows by X-axis column using the specified function. */
function aggregateRows(
  rows: Record<string, unknown>[],
  xAxis: string,
  yAxis: string,
  aggregate: AggregateType,
): Record<string, unknown>[] {
  const groups = new Map<string, number[]>();

  for (const row of rows) {
    const key = String(row[xAxis] ?? "");
    const val = Number(row[yAxis] ?? 0);
    const bucket = groups.get(key) ?? [];
    bucket.push(val);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries()).map(([name, values]) => {
    let value: number;
    switch (aggregate) {
      case "sum":
        value = values.reduce((a, b) => a + b, 0);
        break;
      case "avg":
        value = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case "count":
        value = values.length;
        break;
      case "min":
        value = Math.min(...values);
        break;
      case "max":
        value = Math.max(...values);
        break;
      default:
        value = values[0] ?? 0;
    }
    return { [xAxis]: name, [yAxis]: value };
  });
}

/**
 * Detect numeric vs string columns from the first row of data.
 *
 * **Note**: Columns whose first value is a boolean, null, object, or Date
 * are classified as "string" since they cannot be used as numeric chart axes.
 */
function detectColumnTypes(
  rows: Record<string, unknown>[],
  columns: string[],
): { numericCols: string[]; stringCols: string[] } {
  const numericCols: string[] = [];
  const stringCols: string[] = [];

  if (rows.length === 0) return { numericCols, stringCols };

  const firstRow = rows[0]!;
  for (const col of columns) {
    if (typeof firstRow[col] === "number") {
      numericCols.push(col);
    } else {
      stringCols.push(col);
    }
  }

  return { numericCols, stringCols };
}

/** Compute per-column statistics from the full result set. */
function computeStats(
  rows: Record<string, unknown>[],
  columns: string[],
): ColumnStats[] {
  return columns.map((col) => {
    const values = rows.map((r) => r[col]);
    const nonNullValues = values.filter((v) => v != null);
    const typeOfFirstNonNull = typeof nonNullValues[0];

    const stats: ColumnStats = {
      name: col,
      type:
        typeOfFirstNonNull === "number"
          ? "number"
          : typeOfFirstNonNull === "string"
            ? "string"
            : "other",
      count: values.length,
      distinct: new Set(values.map((v) => String(v))).size,
      nonNull: nonNullValues.length,
    };

    if (typeOfFirstNonNull === "number") {
      const nums = nonNullValues as number[];
      stats.min = Math.min(...nums);
      stats.max = Math.max(...nums);
      stats.avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    }

    return stats;
  });
}

/** Build dynamic DataTable columns from the cache column names. */
function createTableColumns(
  columns: string[],
): ColumnDef<Record<string, unknown>>[] {
  return columns.map((col) => ({
    accessorKey: col,
    header: col,
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const val = getValue();
      return val == null ? "" : String(val);
    },
  }));
}

// ── Hash ID hook ───────────────────────────────────────────────────────

/** Parse the `?id=xxx` parameter from the URL hash. */
function useViewerId(): string | null {
  const [id, setId] = useState<string | null>(() => {
    const hash = window.location.hash;
    const [, queryString] = hash.replace("#/", "").split("?");
    const params = new URLSearchParams(queryString || "");
    return params.get("id");
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      const [, queryString] = hash.replace("#/", "").split("?");
      const params = new URLSearchParams(queryString || "");
      setId(params.get("id"));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return id;
}

// ── Entry Selector Sub-Component ───────────────────────────────────────

/**
 * Shows a dropdown of all "done" scrape caches for the user to pick from.
 * Navigating to a cache triggers a hash change to `#/viewer?id=<uuid>`.
 */
const EntrySelector = () => {
  const [entries, setEntries] = useState<ScrapeCacheSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    rpc.scrape
      .list()
      .then((data) => {
        const done = data.filter((e) => e.status === "done");
        setEntries(done);
        if (done.length > 0) {
          const first = done[0];
          if (first) setSelected(first.id);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load entries"),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleGo = () => {
    if (selected) {
      window.location.hash = `#/viewer?id=${selected}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading cached results...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Viewer</CardTitle>
          <CardDescription>
            No cached results available yet. Go to the{" "}
            <a
              href="#/scrape"
              className="underline underline-offset-2 hover:text-primary"
            >
              Scrape page
            </a>{" "}
            to execute a query first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viewer</CardTitle>
        <CardDescription>Select a cached result to explore.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex h-9 w-80 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Cache entry"
          >
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.query.slice(0, 60)}
                {e.query.length > 60 ? "..." : ""} — {e.rowCount} rows
              </option>
            ))}
          </select>
          <Button onClick={handleGo} disabled={!selected}>
            Go
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Chart Config Panel ─────────────────────────────────────────────────

interface ChartConfigPanelProps {
  columns: string[];
  rows: Record<string, unknown>[];
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
}

const ChartConfigPanel = ({
  columns,
  rows,
  config,
  onChange,
}: ChartConfigPanelProps) => {
  const { numericCols, stringCols } = useMemo(
    () => detectColumnTypes(rows, columns),
    [rows, columns],
  );

  // Auto-select defaults when entering chart mode
  useEffect(() => {
    const xDefault = stringCols[0] ?? columns[0] ?? "";
    const yDefault = numericCols[0] ?? "";
    if (xDefault && yDefault && !config.xAxis && !config.yAxis.length) {
      onChange({
        ...config,
        xAxis: xDefault,
        yAxis: [yDefault],
      });
    }
  }, [
    stringCols,
    numericCols,
    columns,
    config.xAxis,
    config.yAxis.length,
    onChange,
  ]);

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Chart type */}
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Chart Type
        <select
          value={config.type}
          onChange={(e) =>
            onChange({ ...config, type: e.target.value as ChartType })
          }
          className="flex h-9 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground"
        >
          <option value="area">Area</option>
          <option value="pie">Pie</option>
          <option value="radar">Radar</option>
        </select>
      </label>

      {/* X-axis / Category */}
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {config.type === "pie" ? "Category" : "X-Axis"}
        <select
          value={config.xAxis}
          onChange={(e) => onChange({ ...config, xAxis: e.target.value })}
          className="flex h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </label>

      {/* Y-axis / Value */}
      {config.type !== "radar" && (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Value
          <select
            value={config.yAxis[0] ?? ""}
            onChange={(e) => onChange({ ...config, yAxis: [e.target.value] })}
            className="flex h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground"
          >
            {numericCols.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Aggregate */}
      {config.type !== "radar" && (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Aggregate
          <select
            value={config.aggregate}
            onChange={(e) =>
              onChange({
                ...config,
                aggregate: e.target.value as AggregateType,
              })
            }
            className="flex h-9 w-24 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground"
          >
            <option value="none">None</option>
            <option value="sum">Sum</option>
            <option value="avg">Avg</option>
            <option value="count">Count</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>
        </label>
      )}
    </div>
  );
};

// ── Renderers per view mode ────────────────────────────────────────────

interface TableViewProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

const TableView = ({ columns, rows }: TableViewProps) => {
  const tableColumns = useMemo(() => createTableColumns(columns), [columns]);
  return (
    <DataTable
      columns={tableColumns}
      data={rows}
      searchKeys={columns}
      searchPlaceholder="Search..."
      className="w-full"
    />
  );
};

interface ChartViewProps {
  columns: string[];
  rows: Record<string, unknown>[];
  config: ChartConfig;
}

const ChartView = ({ columns, rows, config }: ChartViewProps) => {
  const { numericCols } = useMemo(
    () => detectColumnTypes(rows, columns),
    [rows, columns],
  );

  if (config.type === "pie") {
    // Aggregate yAxis by xAxis for pie chart
    const pieData = useMemo(() => {
      if (!config.xAxis || !config.yAxis[0]) return [];
      const aggregated =
        config.aggregate !== "none"
          ? aggregateRows(rows, config.xAxis, config.yAxis[0], config.aggregate)
          : rows;
      const valueKey = config.yAxis[0];
      return aggregated.map((row, i) => ({
        name: String(row[config.xAxis] ?? ""),
        value: valueKey ? Number(row[valueKey] ?? 0) : 0,
        color: CHART_COLORS[i % CHART_COLORS.length]!,
      }));
    }, [rows, config]);

    if (pieData.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Select X-axis and Value columns to render the pie chart.
        </p>
      );
    }

    return <ChartPie data={pieData} height={400} />;
  }

  if (config.type === "radar") {
    const radarData = useMemo(() => {
      if (!config.xAxis || numericCols.length === 0) return [];
      return rows.map((row) => {
        const entry: Record<string, unknown> = {};
        entry[config.xAxis] = row[config.xAxis];
        // Include all numeric columns as radar axes
        for (const col of numericCols) {
          entry[col] = Number(row[col] ?? 0);
        }
        return entry;
      });
    }, [rows, config.xAxis, numericCols]);

    if (radarData.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Not enough numeric columns for a radar chart.
        </p>
      );
    }

    const series = numericCols.map((col, i) => ({
      key: col,
      color: CHART_COLORS[i % CHART_COLORS.length]!,
    }));

    return (
      <ChartRadar
        data={radarData}
        axes={[config.xAxis, ...numericCols]}
        series={series}
        height={400}
      />
    );
  }

  // Area chart (default)
  const { chartData, series } = useMemo(() => {
    if (!config.xAxis || !config.yAxis[0])
      return {
        chartData: [] as Record<string, unknown>[],
        series: [] as { key: string; color: string }[],
      };
    const data =
      config.aggregate !== "none"
        ? aggregateRows(rows, config.xAxis, config.yAxis[0], config.aggregate)
        : rows;
    return {
      chartData: data,
      series: config.yAxis.map((key, i) => ({
        key,
        color: CHART_COLORS[i % CHART_COLORS.length]!,
      })),
    };
  }, [rows, config]);

  if (chartData.length === 0 || series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Select X-axis and Value columns to render the chart.
      </p>
    );
  }

  return (
    <ChartArea
      data={chartData}
      xKey={config.xAxis}
      series={series}
      height={400}
    />
  );
};

interface SummaryViewProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

const SummaryView = ({ columns, rows }: SummaryViewProps) => {
  const stats = useMemo(() => computeStats(rows, columns), [rows, columns]);

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Distinct</TableHead>
            <TableHead className="text-right">Non-null</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="text-right">Max</TableHead>
            <TableHead className="text-right">Avg</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((s) => (
            <TableRow key={s.name}>
              <TableCell className="font-mono">{s.name}</TableCell>
              <TableCell className="text-muted-foreground">{s.type}</TableCell>
              <TableCell className="text-right">{s.count}</TableCell>
              <TableCell className="text-right">{s.distinct}</TableCell>
              <TableCell className="text-right">{s.nonNull}</TableCell>
              <TableCell className="text-right">
                {s.min != null ? s.min : "—"}
              </TableCell>
              <TableCell className="text-right">
                {s.max != null ? s.max : "—"}
              </TableCell>
              <TableCell className="text-right">
                {s.avg != null ? s.avg.toFixed(2) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ── Main Viewer Page ───────────────────────────────────────────────────

/**
 * Viewer page — explore and visualize cached scrape results.
 *
 * **Routing**:
 * - `#/viewer` — shows an entry selector dropdown
 * - `#/viewer?id=<uuid>` — loads the specified cache entry and shows the viewer
 *
 * **View modes**: Table (DataTable), Chart (Area / Pie / Radar), Summary
 */
const Viewer = () => {
  const cacheId = useViewerId();

  // ── Cache data state ────────────────────────────────────────────────
  const [cache, setCache] = useState<PaginatedScrapeCache | null>(null);
  const [allRows, setAllRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── View mode ──────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: "area",
    xAxis: "",
    yAxis: [],
    aggregate: "none",
  });

  // ── Status polling ─────────────────────────────────────────────────
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load cache data when id changes ────────────────────────────────
  useEffect(() => {
    if (!cacheId) {
      setCache(null);
      setAllRows([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetchAllRows(cacheId)
      .then(({ cache: c, allRows: rows }) => {
        if (cancelled) return;
        setCache(c);
        setAllRows(rows);

        // If status is running, start polling
        if (c.status === "running") {
          setPolling(true);
        }

        // Auto-detect chart defaults
        const { numericCols, stringCols } = detectColumnTypes(rows, c.columns);
        setChartConfig({
          type: "area",
          xAxis: stringCols[0] ?? c.columns[0] ?? "",
          yAxis: numericCols[0] ? [numericCols[0]] : [],
          aggregate: "none",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load cache data",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheId]);

  // ── Status polling for "running" caches ────────────────────────────
  useEffect(() => {
    if (!polling || !cacheId) return;

    const poll = async () => {
      try {
        const result = await fetchAllRows(cacheId);
        if (result.cache.status !== "running") {
          setCache(result.cache);
          setAllRows(result.allRows);
          setPolling(false);
          return;
        }
        pollRef.current = setTimeout(poll, 2000);
      } catch {
        pollRef.current = setTimeout(poll, 2000);
      }
    };

    pollRef.current = setTimeout(poll, 2000);
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [polling, cacheId]);

  // ── Reset view mode when switching entries ─────────────────────────
  useEffect(() => {
    setViewMode("table");
  }, [cacheId]);

  // ── Render ─────────────────────────────────────────────────────────

  // No id → show entry selector
  if (!cacheId) {
    return <EntrySelector />;
  }

  // Loading / error / not-found — shared card layout
  if (loading || loadError || !cache) {
    const message = loading
      ? "Loading cache data..."
      : (loadError ?? "Cache entry not found.");
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="#/scrape">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Scrape
            </a>
          </Button>
        </div>
        <Card>
          <CardContent
            className={`py-8 text-center ${loadError ? "text-destructive" : "text-muted-foreground"}`}
          >
            {message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Top bar ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="#/scrape">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Scrape
            </a>
          </Button>
          <h2 className="text-xl font-semibold">Viewer</h2>
        </div>

        {/* Entry switcher */}
        <EntrySwitcher currentId={cacheId} />
      </div>

      {/* ── Metadata bar ────────────────────────── */}
      <Card>
        <CardContent className="py-3 space-y-1">
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span
                className={
                  cache.status === "done"
                    ? "text-green-600"
                    : cache.status === "failed"
                      ? "text-destructive"
                      : "text-blue-600"
                }
              >
                {cache.status}
                {polling && " (refreshing...)"}
              </span>
            </span>
            <span>
              <span className="text-muted-foreground">Rows:</span>{" "}
              {cache.rowCount}
            </span>
            <span>
              <span className="text-muted-foreground">Columns:</span>{" "}
              {cache.columns.length}
            </span>
            <span>
              <span className="text-muted-foreground">Updated:</span>{" "}
              {formatDateTime(cache.updatedAt)}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Query:</span>{" "}
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
              {cache.query}
            </code>
          </div>
          {cache.status === "failed" && cache.error && (
            <p className="text-sm text-destructive">{cache.error}</p>
          )}
        </CardContent>
      </Card>

      {/* ── View mode tabs ──────────────────────── */}
      <div className="flex gap-1 border-b">
        {(["table", "chart", "summary"] as ViewMode[]).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode(mode)}
            className="rounded-b-none gap-1.5 capitalize"
          >
            {viewModeIcons[mode]}
            {mode}
          </Button>
        ))}
      </div>

      {/* ── Content area ────────────────────────── */}

      {/* Error state within a view */}
      {cache.status === "failed" && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            This query failed to execute:
            <br />
            {cache.error ?? "Unknown error"}
          </CardContent>
        </Card>
      )}

      {/* Running state */}
      {cache.status === "running" && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This query is currently being refreshed. Results will appear
            automatically.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {cache.status === "done" && allRows.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Query returned 0 rows.
          </CardContent>
        </Card>
      )}

      {/* Table view */}
      {cache.status === "done" &&
        allRows.length > 0 &&
        viewMode === "table" && (
          <Card>
            <CardContent className="pt-6">
              <TableView columns={cache.columns} rows={allRows} />
            </CardContent>
          </Card>
        )}

      {/* Chart view */}
      {cache.status === "done" &&
        allRows.length > 0 &&
        viewMode === "chart" && (
          <Card>
            <CardHeader>
              <CardTitle>Chart</CardTitle>
              <CardDescription>
                Configure a chart to visualize the result data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChartConfigPanel
                columns={cache.columns}
                rows={allRows}
                config={chartConfig}
                onChange={setChartConfig}
              />
              <ChartView
                columns={cache.columns}
                rows={allRows}
                config={chartConfig}
              />
            </CardContent>
          </Card>
        )}

      {/* Summary view */}
      {cache.status === "done" &&
        allRows.length > 0 &&
        viewMode === "summary" && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Per-column statistics for the {allRows.length} result rows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryView columns={cache.columns} rows={allRows} />
            </CardContent>
          </Card>
        )}
    </div>
  );
};

// ── Entry Switcher (inline dropdown in top bar) ────────────────────────

interface EntrySwitcherProps {
  currentId: string;
}

const EntrySwitcher = ({ currentId }: EntrySwitcherProps) => {
  const [entries, setEntries] = useState<ScrapeCacheSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    rpc.scrape
      .list()
      .then((data) => {
        if (!cancelled) setEntries(data.filter((e) => e.status === "done"));
      })
      .catch(() => {
        // Swallow — the main page already shows the entry list.
        // If this fails the dropdown simply stays empty between page flips.
      });
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  const handleSwitch = (id: string) => {
    window.location.hash = `#/viewer?id=${id}`;
  };

  return (
    <select
      value={currentId}
      onChange={(e) => handleSwitch(e.target.value)}
      className="flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label="Switch cache entry"
    >
      {entries.map((e) => (
        <option key={e.id} value={e.id}>
          {e.query.slice(0, 40)}
          {e.query.length > 40 ? "..." : ""}
        </option>
      ))}
    </select>
  );
};

export default Viewer;
