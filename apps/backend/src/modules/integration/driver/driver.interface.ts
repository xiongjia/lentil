/**
 * Every external data source type (PostgreSQL, MySQL, REST API, …)
 * implements this interface so the IntegrationsService can treat them uniformly.
 *
 * Adding a new type = one new file + one registry entry. No service changes.
 */
export interface DataSourceDriver {
  /** Create a driver-specific connection/handle from JSON config. */
  createConnection(config: Record<string, unknown>): unknown;

  /**
   * Execute a request and return rows as a uniform JSON array.
   * Each driver defines its own `input` contract:
   *   - SQL drivers:  { sql, params? }
   *   - REST drivers: { method, path, body? }
   */
  execute(
    conn: unknown,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]>;

  /**
   * Test whether the given config can establish a working connection.
   * Creates a short-lived connection, verifies it, then tears it down.
   * Returns { ok: true } on success, or { ok: false, error } on failure.
   */
  testConnection(
    config: Record<string, unknown>,
  ): Promise<{ ok: true } | { ok: false; error: string }>;

  /** Release the connection/handle. */
  end(conn: unknown): Promise<void>;
}
