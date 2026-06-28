import { useCallback, useState } from "react";
import { Button } from "@lentil/ui";
import type { ExternalDataSource } from "../lib/rpc";
import { rpc } from "../lib/rpc";
import { DatasourceList } from "../components/datasource-list";
import { DatasourceForm } from "../components/datasource-form";
import { DatasourceDeleteDialog } from "../components/datasource-delete-dialog";

/** Result of a manual connection test triggered from the list row. */
interface TestAlert {
  ok: boolean;
  message: string;
}

/**
 * Settings page — manages external data sources.
 *
 * Orchestrates three sub-components:
 *
 * - {@link DatasourceList}   — table of configured data sources
 * - {@link DatasourceForm}   — create / edit dialog
 * - {@link DatasourceDeleteDialog} — delete confirmation
 *
 * A monotonically increasing `refreshKey` is used to signal the list to
 * re-fetch after a mutation.
 */
const Settings = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalDataSource | undefined>();
  const [deleting, setDeleting] = useState<ExternalDataSource | null>(null);
  const [testAlert, setTestAlert] = useState<TestAlert | null>(null);

  /** Bump the key so {@link DatasourceList} re-fetches. */
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const handleEdit = useCallback((ds: ExternalDataSource) => {
    setEditing(ds);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((ds: ExternalDataSource) => {
    setDeleting(ds);
  }, []);

  /** Call {@link rpc.integration.test} for a standalone connection check. */
  const handleTest = useCallback(async (ds: ExternalDataSource) => {
    try {
      const result = await rpc.integration.test({
        type: ds.type,
        config: ds.config,
      });
      setTestAlert({
        ok: result.ok,
        message: result.ok
          ? `Connection to "${ds.name}" succeeded.`
          : `Connection to "${ds.name}" failed: ${result.error ?? "unknown"}`,
      });
    } catch (err) {
      setTestAlert({
        ok: false,
        message: `Error: ${err instanceof Error ? err.message : "Unknown"}`,
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Settings</h2>
        <Button onClick={handleAdd}>Add Data Source</Button>
      </div>

      {/* ── Test result alert ──────────────────────────────── */}
      {testAlert && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            testAlert.ok
              ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
          role="alert"
        >
          <div className="flex items-center justify-between gap-2">
            <span>{testAlert.message}</span>
            <button
              className="ml-2 shrink-0 font-medium underline underline-offset-2"
              onClick={() => setTestAlert(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <DatasourceList
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTest={handleTest}
      />

      <DatasourceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={refresh}
        datasource={editing}
      />

      <DatasourceDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v) setDeleting(null);
        }}
        onDeleted={refresh}
        datasource={deleting}
      />
    </div>
  );
};

export default Settings;
