import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lentil/ui";
import type { ExternalDataSource } from "../lib/rpc";
import { rpc } from "../lib/rpc";

interface DatasourceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful deletion so the list can refresh. */
  onDeleted: () => void;
  /** The data source to delete; `null` means nothing is selected. */
  datasource: ExternalDataSource | null;
}

/**
 * Confirmation dialog for deleting an external data source.
 *
 * Renders an {@link AlertDialog} that asks the user to confirm the deletion
 * and calls {@link rpc.integration.remove} on confirm.
 */
const DatasourceDeleteDialog = ({
  open,
  onOpenChange,
  onDeleted,
  datasource,
}: DatasourceDeleteDialogProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!datasource) return;
    setDeleting(true);
    setError(null);

    try {
      await rpc.integration.remove({ id: datasource.id });
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{datasource?.name}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-sm text-destructive">Error: {error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { DatasourceDeleteDialog };
export type { DatasourceDeleteDialogProps };
