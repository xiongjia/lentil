import pg from "pg";
import { DataSourceDriver } from "./driver.interface";

const DEFAULT_POOL_SIZE = 5;
/** Release idle connections after 60 s. */
const IDLE_TIMEOUT_MS = 60_000;

/** PG error codes starting with "08" are connection exceptions (SQLSTATE). */
const isConnectionError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  typeof (err as Record<string, unknown>).code === "string"
    ? (err as { code: string }).code.startsWith("08")
    : false;

interface PGConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
}

/**
 * PostgreSQL driver — first implementation of DataSourceDriver.
 *
 * connection: pg.Pool (default max 5, lazy connect, retry-once on failure)
 * input:      { sql: string, params?: unknown[] }
 * safety:     Only SELECT statements are allowed.
 */
export class PostgresqlDriver implements DataSourceDriver {
  /** Create a pg.Pool from config JSON. Defaults to 5 max connections. */
  createConnection(config: Record<string, unknown>): pg.Pool {
    const { host, port, database, user, password, max } =
      config as unknown as PGConfig;
    return new pg.Pool({
      host,
      port,
      database,
      user,
      password,
      max: max ?? DEFAULT_POOL_SIZE,
      idleTimeoutMillis: IDLE_TIMEOUT_MS,
    });
  }

  /** Execute a read-only SQL query. Retries once on failure — the pool
   *  may hand out a stale connection; a single retry lets it reconnect. */
  async execute(
    conn: pg.Pool,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const { sql, params } = input as { sql: string; params?: unknown[] };

    // Only allow read queries — reject writes, DDL, and anything else.
    if (!sql.trim().toUpperCase().startsWith("SELECT")) {
      throw new Error("Only SELECT queries are allowed");
    }

    try {
      const result = await conn.query(sql, params);
      return result.rows;
    } catch (err) {
      // Retry once on connection-level errors (stale pool connection).
      // SQL syntax / semantic errors are not retried.
      if (!isConnectionError(err)) throw err;
      const result = await conn.query(sql, params);
      return result.rows;
    }
  }

  /**
   * Test connectivity by opening a short-lived client, running SELECT 1,
   * then releasing it. Intentionally creates a fresh client (not the pool)
   * so the pool lifecycle is unaffected.
   */
  async testConnection(
    config: Record<string, unknown>,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const { host, port, database, user, password } =
      config as unknown as PGConfig;
    const client = new pg.Client({ host, port, database, user, password });
    try {
      await client.connect();
      await client.query("SELECT 1");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      await client.end().catch(() => {});
    }
  }

  /** Drain the pool and close all connections. */
  async end(conn: pg.Pool): Promise<void> {
    await conn.end();
  }
}
