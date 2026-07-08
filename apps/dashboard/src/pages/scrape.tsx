import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lentil/ui";
import type { ExternalDataSource, ScrapeCacheSummary } from "../lib/rpc";
import { rpc } from "../lib/rpc";
import { formatDateTime } from "../lib/format";

/** CSS class lookup for each execution status. */
const STATUS_CLASSES: Record<string, string> = {
  done: "text-green-600",
  failed: "text-destructive",
  running: "text-blue-600",
};

/** Minimal subset of ExternalDataSource needed for the datasource dropdown. */
interface DatasourceOption {
  id: string;
  name: string;
}

/**
 * Scrape page — execute SELECT queries against external data sources
 * and manage cached results.
 */
const Scrape = () => {
  const [datasources, setDatasources] = useState<DatasourceOption[]>([]);
  const [selectedDs, setSelectedDs] = useState<string>("");
  const [query, setQuery] = useState("SELECT 1");
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [caches, setCaches] = useState<ScrapeCacheSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dsError, setDsError] = useState<string | null>(null);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load datasources for dropdown ────────────────────────────

  useEffect(() => {
    rpc.integration
      .list()
      .then((items) => {
        setDatasources(
          items.map((ds: ExternalDataSource) => ({
            id: ds.id,
            name: ds.name,
          })),
        );
        if (items.length > 0 && !selectedDs) {
          setSelectedDs(items[0]!.id);
        }
        setDsError(null);
      })
      .catch((err) => {
        setDsError(
          err instanceof Error ? err.message : "Failed to load datasources",
        );
      });
  }, []);

  // ── Load cache list ──────────────────────────────────────────

  const loadCaches = useCallback(async (): Promise<ScrapeCacheSummary[]> => {
    setLoading(true);
    setCacheError(null);
    try {
      const data = await rpc.scrape.list();
      setCaches(data);
      return data;
    } catch (err) {
      setCacheError(
        err instanceof Error ? err.message : "Failed to load cache",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaches();
  }, [loadCaches]);

  // ── Execute query ────────────────────────────────────────────

  const handleExecute = async () => {
    if (!selectedDs || !query.trim()) return;
    setExecuting(true);
    setError(null);

    try {
      await rpc.scrape.execute({
        datasourceId: selectedDs,
        query: query.trim(),
      });
      loadCaches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setExecuting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError(null);
    try {
      await rpc.scrape.remove({ id });
      loadCaches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Refresh ───────────────────────────────────────────────────

  const handleRefresh = async (id: string) => {
    setRefreshing(id);
    setError(null);
    try {
      await rpc.scrape.refresh({ id });
      startPolling(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
      setRefreshing(null);
    }
  };

  const startPolling = (refreshId: string) => {
    const poll = async () => {
      const data = await loadCaches();
      const entry = data.find((c) => c.id === refreshId);
      if (!entry || entry.status !== "running") {
        setRefreshing(null);
        return;
      }
      pollingRef.current = setTimeout(poll, 2000);
    };
    pollingRef.current = setTimeout(poll, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Scrape</h2>

      {/* ── Execute form ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Execute Query</CardTitle>
          <CardDescription>
            Run a SELECT query against a configured data source and cache the
            result.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <select
              value={selectedDs}
              onChange={(e) => setSelectedDs(e.target.value)}
              className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Data source"
            >
              {datasources.length === 0 ? (
                <option value="" disabled>
                  No datasources available
                </option>
              ) : (
                datasources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))
              )}
            </select>

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT ..."
              className="flex-1 font-mono"
            />

            <Button
              onClick={handleExecute}
              disabled={executing || datasources.length === 0}
            >
              {executing ? "Running..." : "Execute"}
            </Button>
          </div>

          {dsError && <p className="text-sm text-destructive">{dsError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* ── Cache list ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Cached Results</CardTitle>
          <CardDescription>
            {loading
              ? "Loading..."
              : `${caches.length} result${caches.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cacheError && (
            <p className="text-sm text-destructive mb-3">{cacheError}</p>
          )}

          {caches.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No cached results yet. Execute a query above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Datasource</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caches.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span
                        className={
                          STATUS_CLASSES[c.status] ?? "text-muted-foreground"
                        }
                      >
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.datasourceId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-48 truncate">
                      {c.query}
                    </TableCell>
                    <TableCell>{c.rowCount}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(c.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.location.hash = `#/viewer?id=${c.id}`;
                          }}
                          disabled={c.status !== "done"}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefresh(c.id)}
                          disabled={
                            refreshing === c.id || c.status === "running"
                          }
                        >
                          {refreshing === c.id ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                        >
                          {deleting === c.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scrape;
