import { ExternalDataSourceEntity } from "@lentil/db";
import { EntityManager } from "@mikro-orm/core";
import { Inject, Injectable } from "@nestjs/common";
import pino from "pino";
import { APP_LOGGER } from "../providers";
import {
  type CreateDatasourceInputDto,
  type ExternalDataSourceDto,
  type SaveDatasourceResultDto,
  toDatasourceDto,
  toDatasourceDtoList,
  type UpdateDatasourceInputDto,
} from "./datasource.dto";
import { IntegrationService } from "./integration.service";

/**
 * CRUD operations for ExternalDataSourceEntity configs.
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

  async list(): Promise<ExternalDataSourceDto[]> {
    const configItems = await this.em.find(ExternalDataSourceEntity, {});
    this.logger.debug(
      { count: configItems.length },
      "Listed external data sources",
    );
    return toDatasourceDtoList(configItems);
  }

  async get(id: string): Promise<ExternalDataSourceDto> {
    const configItem = await this.em.findOneOrFail(ExternalDataSourceEntity, {
      id,
    });
    this.logger.debug(
      { id, name: configItem.name },
      "Fetched external data source",
    );
    return toDatasourceDto(configItem);
  }

  /**
   * Create a config, persist it, then test connectivity.
   * Config is saved regardless of test outcome — the caller
   * receives the persisted record + the test result.
   */
  async create(
    input: CreateDatasourceInputDto,
  ): Promise<SaveDatasourceResultDto> {
    const ds = this.em.create(ExternalDataSourceEntity, {
      ...input,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.em.persist(ds);
    await this.em.flush();
    this.logger.info(
      { id: ds.id, name: ds.name, type: ds.type },
      "Created external data source",
    );

    const connectionTest = await this.integration
      .testConnection(ds.type, ds.config)
      .catch((err) => ({ ok: false as const, error: String(err) }));

    return { ...toDatasourceDto(ds), connectionTest };
  }

  /**
   * Update config, persist, release stale connection, then test connectivity.
   * Config is saved regardless of test outcome.
   */
  async update(
    id: string,
    data: Omit<UpdateDatasourceInputDto, "id">,
  ): Promise<SaveDatasourceResultDto> {
    const ds = await this.em.findOneOrFail(ExternalDataSourceEntity, { id });
    const oldName = ds.name;
    this.em.assign(ds, data);
    this.em.persist(ds);
    await this.em.flush();

    // Best-effort: release cached connection so next execute() picks up new config.
    try {
      await this.integration.release(id);
    } catch (err) {
      this.logger.warn(
        { id, err },
        "Failed to release connection after update",
      );
    }

    this.logger.info(
      { id, oldName, newName: ds.name },
      "Updated external data source",
    );

    const connectionTest = await this.integration
      .testConnection(ds.type, ds.config)
      .catch((err) => ({ ok: false as const, error: String(err) }));

    return { ...toDatasourceDto(ds), connectionTest };
  }

  /**
   * Remove config and release its runtime connection.
   * Persisted deletion happens first; connection teardown is best-effort.
   */
  async remove(id: string): Promise<void> {
    const ds = await this.em.findOneOrFail(ExternalDataSourceEntity, { id });
    this.em.remove(ds);
    await this.em.flush();

    // Best-effort connection release — must not block removal
    try {
      await this.integration.release(id);
    } catch (err) {
      this.logger.warn(
        { id, err },
        "Failed to release connection after remove",
      );
    }
    this.logger.info(
      { id, name: ds.name, type: ds.type },
      "Removed external data source",
    );
  }
}
