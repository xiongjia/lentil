import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lentil/ui";
import type { ExternalDataSource } from "../lib/rpc";
import { rpc } from "../lib/rpc";

/** Safely format a date-like value for display. Returns "—" for invalid dates. */
const formatDate = (d: unknown): string => {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d as string | number);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

interface DatasourceListProps {
  onEdit: (ds: ExternalDataSource) => void;
  onDelete: (ds: ExternalDataSource) => void;
  onTest: (ds: ExternalDataSource) => void;
  /** Increment this value to force a re-fetch from the server. */
  refreshKey: number;
}

/** Discriminated union for the three possible states of the list. */
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; items: ExternalDataSource[] };

/**
 * Displays configured external data sources in a table.
 *
 * Calls `rpc.integration.list()` on mount and whenever `refreshKey` changes.
 * Renders one of four states:
 *
 * 1. **loading** — spinner / placeholder
 * 2. **error**   — error message
 * 3. **empty**   — "No data sources configured yet."
 * 4. **ok**      — a {@link Table} with name, type, status, updated-at, and
 *                  action buttons (Edit, Test, Delete).
 */
const DatasourceList = ({
  onEdit,
  onDelete,
  onTest,
  refreshKey,
}: DatasourceListProps) => {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    rpc.integration
      .list()
      .then((items) => {
        if (!cancelled) setState({ status: "ok", items });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ── Loading state ──────────────────────────────────────────────

  if (state.status === "loading") {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading data sources...
        </CardContent>
      </Card>
    );
  }

  // ── Error state ────────────────────────────────────────────────

  if (state.status === "error") {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          {state.message}
        </CardContent>
      </Card>
    );
  }

  // ── Empty state ────────────────────────────────────────────────

  if (state.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>No data sources configured yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // ── Data table ─────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sources</CardTitle>
        <CardDescription>
          {state.items.length} source{state.items.length !== 1 ? "s" : ""}{" "}
          configured
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.items.map((ds) => (
              <TableRow key={ds.id}>
                <TableCell className="font-medium">{ds.name}</TableCell>
                <TableCell>{ds.type}</TableCell>
                <TableCell>
                  <span
                    className={
                      ds.enabled ? "text-green-600" : "text-muted-foreground"
                    }
                  >
                    {ds.enabled ? "Enabled" : "Disabled"}
                  </span>
                </TableCell>
                <TableCell>{formatDate(ds.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ds)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTest(ds)}
                    >
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(ds)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { DatasourceList };
export type { DatasourceListProps };
