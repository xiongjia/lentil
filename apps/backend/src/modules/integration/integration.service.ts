import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  OnApplicationShutdown,
} from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { ExternalDataSource } from "@lentil/db";
import { APP_LOGGER } from "../providers";
import { DataSourceDriver } from "./driver/driver.interface";
import { PostgresqlDriver } from "./driver/postgresql.driver";
import pino from "pino";

// Stateless registry: maps datasource type → driver instance.
// Multiple sources of the same type share one driver but get independent connections.
const drivers = new Map<string, DataSourceDriver>([
  ["postgresql", new PostgresqlDriver()],
]);

@Injectable()
export class IntegrationService implements OnApplicationShutdown {
  // Per-source connection cache keyed by sourceId (UUID).
  // Each entry holds the driver reference + the driver-specific connection object.
  private connections = new Map<
    string,
    { conn: unknown; driver: DataSourceDriver }
  >();

  constructor(
    @Inject(APP_LOGGER) private readonly logger: pino.Logger,
    private readonly em: EntityManager,
  ) {}
  /**
   * Release all cached connections on application shutdown.
   */
  async onApplicationShutdown() {
    const ids = [...this.connections.keys()];
    await Promise.all(ids.map((id) => this.release(id)));
    this.logger.info(
      { count: ids.length },
      "All data source connections released on shutdown",
    );
  }

  /**
   * Lazily resolve a driver connection for the given data source.
   * On first access: loads config from DB, picks the right driver, creates connection.
   * Subsequent accesses return the cached connection.
   */
  private async getConnection(sourceId: string) {
    const cached = this.connections.get(sourceId);
    if (cached) return cached;

    const ds = await this.em.findOne(ExternalDataSource, {
      id: sourceId,
      enabled: true,
    });
    if (!ds) throw new NotFoundException("Data source not found or disabled");

    const driver = drivers.get(ds.type);
    if (!driver) throw new BadRequestException(`Unsupported type: ${ds.type}`);

    const conn = driver.createConnection(ds.config);
    const entry = { conn, driver };
    this.connections.set(sourceId, entry);
    this.logger.info(
      { sourceId, type: ds.type, name: ds.name },
      "Data source connection created",
    );
    return entry;
  }

  /**
   * Test a driver config without saving it.
   * Delegates to the driver's connection test — each driver validates its own config shape.
   */
  async testConnection(
    type: string,
    config: Record<string, unknown>,
  ): Promise<{ ok: boolean; error?: string }> {
    const driver = drivers.get(type);
    if (!driver) return { ok: false, error: `Unsupported type: ${type}` };
    return driver.testConnection(config);
  }

  /**
   * Release the cached connection for a datasource.
   * Called after a config update so the next execute() picks up new settings.
   */
  async release(sourceId: string) {
    const entry = this.connections.get(sourceId);
    if (!entry) return;

    await entry.driver.end(entry.conn);
    this.connections.delete(sourceId);
    this.logger.info({ sourceId }, "Data source connection released");
  }

  /**
   * Execute a request against an external data source.
   *
   * `input` shape is driver-specific and opaque to the service:
   *   - PostgreSQL driver expects { sql, params? }
   *   - Future REST driver might expect { method, path, body }
   *
   * Returns a uniform JSON array — each driver normalizes its native result.
   */
  async execute(
    sourceId: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const { conn, driver } = await this.getConnection(sourceId);
    return driver.execute(conn, input);
  }
}
