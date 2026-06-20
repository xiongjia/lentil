import { Injectable, Inject } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { ExternalDataSource } from "@lentil/db";
import { APP_LOGGER } from "../providers";
import { IntegrationService } from "./integration.service";
import pino from "pino";

interface ConnectionTestResult {
  ok: boolean;
  error?: string;
}

export interface SaveResult extends ExternalDataSource {
  connectionTest: ConnectionTestResult;
}

/**
 * CRUD operations for ExternalDataSource configs.
 *
 * Every mutation logs the action + affected datasource identity.
 * Create and update run a connection test after persisting — the config
 * is always saved regardless of the test outcome. Callers receive both
 * the persisted record and the test result.
 *
 * Update and remove automatically release active runtime connections
 * so the next execute() call rebuilds with fresh (or no) config.
 */
@Injectable()
export class DatasourceConfigService {
  constructor(
    @Inject(APP_LOGGER) private readonly logger: pino.Logger,
    private readonly em: EntityManager,
    private readonly integration: IntegrationService,
  ) {}

  async list(): Promise<ExternalDataSource[]> {
    const configs = await this.em.find(ExternalDataSource, {});
    this.logger.debug({ count: configs.length }, "Listed external data sources");
    return configs;
  }

  async get(id: string): Promise<ExternalDataSource> {
    const ds = await this.em.findOneOrFail(ExternalDataSource, { id });
    this.logger.debug({ id, name: ds.name }, "Fetched external data source");
    return ds;
  }

  /**
   * Create a config, persist it, then test connectivity.
   * Config is saved regardless of test outcome — the caller
   * receives the persisted record + the test result.
   */
  async create(input: {
    name: string;
    description?: string;
    type: string;
    config: Record<string, unknown>;
  }): Promise<SaveResult> {
    const ds = this.em.create(ExternalDataSource, {
      ...input,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.em.persist(ds);
    await this.em.flush();
    this.logger.info({ id: ds.id, name: ds.name, type: ds.type }, "Created external data source");

    const connectionTest = await this.integration
      .testConnection(ds.type, ds.config)
      .catch((err) => ({ ok: false as const, error: String(err) }));

    return { ...ds, connectionTest };
  }

  /**
   * Update config, persist, release stale connection, then test connectivity.
   * Config is saved regardless of test outcome.
   */
  async update(
    id: string,
    data: Partial<Pick<ExternalDataSource, "name" | "description" | "config">>,
  ): Promise<SaveResult> {
    const ds = await this.em.findOneOrFail(ExternalDataSource, { id });
    const oldName = ds.name;
    this.em.assign(ds, data);
    this.em.persist(ds);
    await this.em.flush();

    // Best-effort: release cached connection so next execute() picks up new config.
    try {
      await this.integration.release(id);
    } catch (err) {
      this.logger.warn({ id, err }, "Failed to release connection after update");
    }

    this.logger.info({ id, oldName, newName: ds.name }, "Updated external data source");

    const connectionTest = await this.integration
      .testConnection(ds.type, ds.config)
      .catch((err) => ({ ok: false as const, error: String(err) }));

    return { ...ds, connectionTest };
  }

  /**
   * Remove config and release its runtime connection.
   * Persisted deletion happens first; connection teardown is best-effort.
   */
  async remove(id: string): Promise<void> {
    const ds = await this.em.findOneOrFail(ExternalDataSource, { id });
    this.em.remove(ds);
    await this.em.flush();
    // Best-effort connection release — must not block removal
    try {
      await this.integration.release(id);
    } catch (err) {
      this.logger.warn({ id, err }, "Failed to release connection after remove");
    }
    this.logger.info({ id, name: ds.name, type: ds.type }, "Removed external data source");
  }
}
