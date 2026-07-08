# Viewer Page — Design Document

The Viewer page is a dedicated data exploration interface for cached scrape
results. It complements the existing **Scrape** page (`/scrape`), which handles
query execution and cache management (list / delete / refresh). The **Viewer**
page (`/viewer`) focuses on data browsing and visualization with three view
modes: paginated table, configurable charts, and per-column summary statistics.

---

## Architecture Overview

```
┌───────────────────────┐       ┌────────────────────────────┐
│   Scrape Page         │       │   Viewer Page              │
│   (#/scrape)          │       │   (#/viewer?id=<uuid>)     │
│                       │──────▶│                            │
│   "View" button       │  nav  │   1. Read id from URL      │
│   on a cache row      │  to   │      hash parameter        │
│                       │viewer │   2. Fetch rows via        │
│                       │       │      rpc.scrape.get()      │
│                       │       │   3. User picks view       │
│                       │       │      mode                  │
└───────────────────────┘       └────────────────────────────┘
```

**Key design decisions:**

- **No new backend endpoints** — The viewer reuses existing `rpc.scrape.get()`
  and `rpc.scrape.list()` procedures. All computation (column detection,
  aggregation, statistics) happens client-side.
- **Hash-based routing** — The page uses `#/viewer?id=<uuid>` for navigation,
  which integrates with the existing `useHashRoute` hook (modified to strip
  query parameters from the slug).

---

## Routing

| Route               | Hash                 | Entry Point                |
| ------------------- | -------------------- | -------------------------- |
| Viewer (with entry) | `#/viewer?id=<uuid>` | Navigated from Scrape page |
| Viewer (no entry)   | `#/viewer`           | Sidebar click / direct nav |

When no `id` is present, the page renders an **entry selector** — a dropdown
listing all `done` scrape caches so the user can pick one to explore. An inline
**entry switcher** in the top bar allows quick navigation between caches without
returning to the Scrape page.

### Router Modification

The `useHashRoute` hook in `apps/dashboard/src/lib/router.ts` was modified to
strip query strings from the slug:

```typescript
// Before
return hash || defaultSlug;
// After
return hash.split("?")[0] || defaultSlug;
```

This ensures `#/viewer?id=xxx` resolves to slug `"viewer"` instead of
`"viewer?id=xxx"`, which would fail the page lookup in `App.tsx`.

---

## Page Layout

```
┌───────────────────────────────────────────────────────┐
│  [← Back to Scrape]   Viewer       [Entry Switcher ▼] │
├───────────────────────────────────────────────────────┤
│  ┌─ Metadata Bar ───────────────────────────────────┐ │
│  │  Query: SELECT ... LIMIT 10000                   │ │
│  │  Rows: 1,234   Columns: 8   Updated: ...         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ View Mode Tabs ─────────────────────────────────┐ │
│  │  [ Table ]  [ Chart ]  [ Summary ]               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ Content Area ───────────────────────────────────┐ │
│  │  (renders the selected view mode)                │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

## Data Flow

The page fetches all rows upfront via `fetchAllRows()`:

```
rpc.scrape.get({ id, page: 1, pageSize: 500 })  → first page with metadata
loop p = 2..totalPages:
  rpc.scrape.get({ id, page: p, pageSize: 500 }) → remaining pages
→ combine into single allRows array
```

This gives the chart and summary views access to the full dataset. The backend
caps results at 10 000 rows, and with pageSize = 500 this means at most 20
sequential requests.

**Performance note**: For large datasets, a future optimization could use
concurrent fetches (e.g. 4 at a time via `Promise.allSettled`) without
overwhelming the server.

---

## View Modes

### 1. Table View (default)

Renders the cached rows using the shared `DataTable` component from `@lentil/ui`.

| Feature           | Implementation                                   |
| ----------------- | ------------------------------------------------ |
| Columns           | Auto-generated from `cache.columns[]` (string[]) |
| Sorting           | Built-in DataTable sort (click column header)    |
| Per-column search | DataTable `searchKeys` with column picker        |
| Column visibility | "Columns" dropdown toggle                        |
| Pagination        | Client-side via `DataTablePagination`            |
| Loading state     | `loading` prop on DataTable                      |
| Empty state       | "No results." message                            |

Dynamic `ColumnDef` generation:

```typescript
function createTableColumns(
  columns: string[],
): ColumnDef<Record<string, unknown>>[] {
  return columns.map((col) => ({
    accessorKey: col,
    header: col,
    cell: ({ getValue }) => {
      const val = getValue();
      return val == null ? "" : String(val);
    },
  }));
}
```

### 2. Chart View

Allows the user to select columns and a chart type to visualize the data.

```
┌─ Chart Config Panel ─────────────────────────────┐
│  Chart Type:  [Area ▼]                           │
│  X-Axis:      [category ▼]                       │
│  Value:       [revenue ▼]                        │
│  Aggregate:   [Sum ▼]                            │
└──────────────────────────────────────────────────┘
┌─ Chart Canvas ───────────────────────────────────┐
│   📊 ChartArea / ChartPie / ChartRadar            │
└──────────────────────────────────────────────────┘
```

#### Chart Types

| Type  | Component  | Data Shape                           |
| ----- | ---------- | ------------------------------------ |
| Area  | ChartArea  | xKey + series [{ key, color, name }] |
| Pie   | ChartPie   | [{ name, value, color }]             |
| Radar | ChartRadar | data, axes[], series[]               |

#### Configuration State

```typescript
interface ChartConfig {
  type: "area" | "pie" | "radar";
  xAxis: string; // column name for X axis / category
  yAxis: string[]; // column names for values
  aggregate: "none" | "sum" | "avg" | "count" | "min" | "max";
}
```

#### Column Type Detection

When entering Chart mode, column types are inferred from the first row:

- **Numeric columns** (`typeof val === "number"`) → candidates for Value axis
- **String columns** → candidates for X-Axis / Category

The first detected pair is pre-selected as defaults. Boolean, null, object, and
Date columns are classified as "string" since they cannot be used as numeric
chart axes.

#### Aggregation

When an aggregate is selected, rows are grouped by the X-Axis column and the
aggregate function is applied to the Value column:

```typescript
function aggregateRows(rows, xAxis, yAxis, aggregate) {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = String(row[xAxis] ?? "");
    const val = Number(row[yAxis] ?? 0);
    const bucket = groups.get(key) ?? [];
    bucket.push(val);
    groups.set(key, bucket);
  }
  // Apply sum / avg / count / min / max per group
  return Array.from(groups.entries()).map(([name, values]) => ({
    [xAxis]: name,
    [yAxis]: computedValue,
  }));
}
```

### 3. Summary View

Displays per-column statistics computed client-side from the full rows array.

| Column    | Type   | Count | Distinct | Min  | Max    | Avg    | Non-null |
| --------- | ------ | ----- | -------- | ---- | ------ | ------ | -------- |
| `id`      | number | 1234  | 1234     | 1    | 1234   | 617.5  | 1234     |
| `name`    | string | 1234  | 980      | —    | —      | —      | 1234     |
| `revenue` | number | 1234  | 1100     | 0.00 | 999.99 | 452.10 | 1200     |

```typescript
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
```

---

## UI States & Error Handling

| State         | Condition                                         | UI                                                     |
| ------------- | ------------------------------------------------- | ------------------------------------------------------ |
| **Loading**   | Initial fetch of cache rows                       | Spinner + "Loading cache data..." text                 |
| **Not found** | `id` in URL but fetch fails                       | Error message + "Back to Scrape" link                  |
| **Running**   | Cache status is `"running"` (refresh in progress) | "This query is currently being refreshed." + auto-poll |
| **Failed**    | Cache status is `"failed"`                        | Error message with `cache.error` field                 |
| **Empty**     | Cache status is `"done"` but 0 rows               | "Query returned 0 rows." placeholder                   |
| **No entry**  | No `id` in URL hash                               | Entry selector dropdown with "Go" button               |
| **RPC error** | Network / timeout                                 | Inline error in card with descriptive message          |

### Status Polling

When a cache entry has `status: "running"` (e.g., after a refresh), the viewer
polls every 2 seconds via `setTimeout` (not `setInterval`) to avoid overlapping
requests:

```
load data → status === "running" → startPolling()
  → fetchAllRows() every 2s
  → status !== "running" → stop polling, update UI
```

---

## File Changes

### New Files

| File                                       | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `apps/dashboard/src/pages/viewer.tsx`      | Viewer page component (~645 loc) |
| `apps/dashboard/src/pages/viewer.test.tsx` | Unit tests (78 tests, 11 files)  |

### Modified Files

| File                                            | Change                                                   |
| ----------------------------------------------- | -------------------------------------------------------- |
| `apps/dashboard/src/pages/index.ts`             | Add `viewer` entry to page registry                      |
| `apps/dashboard/src/pages/scrape.tsx`           | "View" button → `#/viewer?id=<id>`; remove inline dialog |
| `apps/dashboard/src/components/app-sidebar.tsx` | Add "Viewer" nav item with `Eye` icon                    |
| `apps/dashboard/src/App.tsx`                    | Add lazy import for Viewer page                          |
| `apps/dashboard/src/lib/router.ts`              | Strip query string from hash slug                        |
| `apps/dashboard/src/lib/router.test.ts`         | Add test for query string stripping                      |
| `apps/dashboard/src/pages/index.test.ts`        | Add viewer page assertion                                |
| `apps/dashboard/package.json`                   | Add `@tanstack/react-table` dependency                   |

---

## Component Architecture

```
Viewer
├── EntrySelector         (shown when no ?id= in URL)
├── EntrySwitcher         (inline dropdown, shown in top bar)
├── MetadataBar           (status, row count, columns, query)
├── ViewModeTabs          (table / chart / summary)
└── ContentArea
    ├── TableView
    │   └── DataTable     (from @lentil/ui)
    ├── ChartView
    │   ├── ChartConfigPanel
    │   └── ChartArea / ChartPie / ChartRadar
    └── SummaryView
        └── Table          (from @lentil/ui)
```

---

## Helper Functions (client-side)

| Function               | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `fetchAllRows()`       | Fetch all pages of a cache entry                 |
| `aggregateRows()`      | Group rows by X-axis and apply aggregate         |
| `detectColumnTypes()`  | Classify columns as numeric or string            |
| `computeStats()`       | Compute per-column statistics                    |
| `createTableColumns()` | Build dynamic DataTable ColumnDefs               |
| `useViewerId()`        | Parse `?id=` from URL hash with change detection |

---

## Security Considerations

| Concern          | Mitigation                                    |
| ---------------- | --------------------------------------------- |
| SQL injection    | Not applicable — queries are already executed |
|                  | by the Scrape module; viewer is read-only     |
| Unbounded data   | Backend caps at 10 000 rows (LIMIT 10000)     |
| XSS via row data | DataTable and chart components use `String()` |
|                  | to safely render values                       |

---

## Test Coverage (`viewer.test.tsx`)

78 tests across 5 describe blocks:

| Group                       | Tests | What's Covered                                           |
| --------------------------- | ----- | -------------------------------------------------------- |
| Entry Selector (no id)      | 4     | Empty state, loading, error, selector rendering          |
| Loading & Error States (id) | 3     | Loading indicator, get failure, not-found                |
| Table View                  | 5     | Metadata bar, rows rendering, default tab, empty, failed |
| Chart View                  | 4     | Tab switch, config panel, area chart, no-numeric hint    |
| Summary View                | 1     | Tab switch, column names, type, stats values             |
| Navigation                  | 3     | Back link, entry switcher, route to selector             |
