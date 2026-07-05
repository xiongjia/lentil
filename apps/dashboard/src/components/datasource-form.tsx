import { useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
} from "@lentil/ui";
import type { ExternalDataSource } from "../lib/rpc";
import { rpc } from "../lib/rpc";

interface DatasourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful create / update so the list can refresh. */
  onSaved: () => void;
  /** If provided, the form operates in edit mode. */
  datasource?: ExternalDataSource;
}

/** Available driver types shown in the type selector. */
const DRIVER_TYPES = [{ value: "postgresql", label: "PostgreSQL" }] as const;

/** Shared Tailwind classes for form field wrapper. */
function fieldClass(): string {
  return "space-y-1.5";
}

/** Shared Tailwind classes for `<label>` elements. */
function labelClass(): string {
  return "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
}

/**
 * Create / Edit form for an external data source.
 *
 * Renders inside a {@link Dialog}.  In **create** mode the user picks a driver
 * type and fills in the corresponding config fields; in **edit** mode the type
 * is fixed and only the name, description, and config values can be changed.
 *
 * On submit the form calls {@link rpc.integration.create} or
 * {@link rpc.integration.update} and displays the connection-test result.
 */
const DatasourceForm = ({
  open,
  onOpenChange,
  onSaved,
  datasource,
}: DatasourceFormProps) => {
  const isEdit = !!datasource;
  const [name, setName] = useState(datasource?.name ?? "");
  const [description, setDescription] = useState(datasource?.description ?? "");
  const [type, setType] = useState<"postgresql">(
    (datasource?.type as "postgresql") ?? "postgresql",
  );
  const [host, setHost] = useState<string>(
    (datasource?.config?.host as string) ?? "",
  );
  const [port, setPort] = useState<string>(
    datasource?.config?.port != null ? String(datasource.config.port) : "5432",
  );
  const [database, setDatabase] = useState<string>(
    (datasource?.config?.database as string) ?? "",
  );
  const [user, setUser] = useState<string>(
    (datasource?.config?.user as string) ?? "",
  );
  const [password, setPassword] = useState<string>(
    (datasource?.config?.password as string) ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  /** After a successful save the form stays open so the user can see the
   * connection-test result.  `saved` switches the button to "Close". */
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setTestResult(null);

    try {
      const config = { host, port: Number(port), database, user, password };

      const result = isEdit
        ? await rpc.integration.update({
            id: datasource!.id,
            name: name || undefined,
            description: description || undefined,
            config,
          })
        : await rpc.integration.create({
            type,
            config,
            name,
            description: description || undefined,
          });

      const ct = result.connectionTest;
      if (ct.ok) {
        setTestResult("Connection test passed.");
      } else {
        setTestResult(`Connection test failed: ${ct.error ?? "unknown"}`);
      }

      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Data Source" : "Add Data Source"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the data source configuration."
              : "Configure a new external data source."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Name ──────────────────────────────────────── */}
          <div className={fieldClass()}>
            <label htmlFor="ds-name" className={labelClass()}>
              Name
            </label>
            <Input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. production-pg"
              required
            />
          </div>

          {/* ── Description ───────────────────────────────── */}
          <div className={fieldClass()}>
            <label htmlFor="ds-description" className={labelClass()}>
              Description
            </label>
            <Input
              id="ds-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {/* ── Type (create only) ────────────────────────── */}
          {!isEdit && (
            <div className={fieldClass()}>
              <label htmlFor="ds-type" className={labelClass()}>
                Type
              </label>
              <select
                id="ds-type"
                value={type}
                onChange={(e) => setType(e.target.value as "postgresql")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {DRIVER_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── PostgreSQL config fields ──────────────────── */}
          {type === "postgresql" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className={fieldClass()}>
                  <label htmlFor="ds-host" className={labelClass()}>
                    Host
                  </label>
                  <Input
                    id="ds-host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost"
                    required
                  />
                </div>
                <div className={fieldClass()}>
                  <label htmlFor="ds-port" className={labelClass()}>
                    Port
                  </label>
                  <Input
                    id="ds-port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="5432"
                    min={1}
                    max={65535}
                    required
                  />
                </div>
              </div>
              <div className={fieldClass()}>
                <label htmlFor="ds-database" className={labelClass()}>
                  Database
                </label>
                <Input
                  id="ds-database"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="mydb"
                  required
                />
              </div>
              <div className={fieldClass()}>
                <label htmlFor="ds-user" className={labelClass()}>
                  User
                </label>
                <Input
                  id="ds-user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="postgres"
                  required
                />
              </div>
              <div className={fieldClass()}>
                <label htmlFor="ds-password" className={labelClass()}>
                  Password
                </label>
                <Input
                  id="ds-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {/* ── Feedback ──────────────────────────────────── */}
          {error && <p className="text-sm text-destructive">Error: {error}</p>}
          {testResult && (
            <p className="text-sm text-muted-foreground">{testResult}</p>
          )}

          {/* ── Actions ───────────────────────────────────── */}
          <div className="flex justify-end gap-2 pt-2">
            {saved ? (
              <Button
                type="button"
                aria-label="Close form"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { DatasourceForm };
export type { DatasourceFormProps };
