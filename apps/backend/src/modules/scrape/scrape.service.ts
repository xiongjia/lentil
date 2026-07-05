import { ScrapeCacheEntity } from "@lentil/db";
import type { ScrapeCache, ScrapeExecuteInput } from "@lentil/rpc";
import { EntityManager } from "@mikro-orm/core";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import pino from "pino";
import { APP_LOGGER } from "../providers";
import { IntegrationService } from "../integration/integration.service";

/**
 * Executes SELECT queries against external data sources and caches results locally.
 *
 * - Delegates connection management to {@link IntegrationService}
 * - Stores results in a generic column + rows format
 * - Exposes CRUD operations for managing cached results
 */
@Injectable()
export class ScrapeService {
  constructor(
    @Inject(APP_LOGGER) private readonly logger: pino.Logger,
    private readonly em: EntityManager,
    private readonly integration: IntegrationService,
  ) {}

  /**
   * Execute a SELECT query on a data source and cache the result.
   */
  async execute(input: ScrapeExecuteInput): Promise<ScrapeCache> {
    // Security guard: only allow read-only queries
    const normalized = input.query.trimStart().toUpperCase();
    if (!normalized.startsWith("SELECT") && !normalized.startsWith("WITH")) {
      throw new BadRequestException("Only SELECT queries are allowed");
    }

    // Cap result size to prevent OOM / DB bloat.
    // If the query already has a LIMIT clause, reuse it rather than appending a duplicate.
    const sanitized = input.query.replace(/;\s*$/, "");
    const hasLimit = /\bLIMIT\s+\d+(\s+OFFSET\s+\d+)?\s*$/i.test(sanitized);
    const limitedQuery = hasLimit ? sanitized : `${sanitized} LIMIT 10000`;

    const cache = this.em.create(ScrapeCacheEntity, {
      datasourceId: input.datasourceId,
      query: limitedQuery,
      status: "running",
      columns: [],
      rows: [],
      rowCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(cache);

    try {
      const rows = await this.integration.execute(input.datasourceId, {
        sql: limitedQuery,
      });

      const columns =
        rows.length > 0 ? Object.keys(rows[0]!) : [];

      this.em.assign(cache, {
        status: "done",
        columns,
        rows,
        rowCount: rows.length,
        updatedAt: new Date(),
      });
      this.em.persist(cache);
      await this.em.flush();

      this.logger.info(
        { id: cache.id, datasourceId: input.datasourceId, rowCount: rows.length },
        "Scrape executed successfully",
      );

      return this.toDto(cache);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      this.em.assign(cache, {
        status: "failed",
        error: message,
        updatedAt: new Date(),
      });
      this.em.persist(cache);
      await this.em.flush();

      this.logger.error(
        { id: cache.id, datasourceId: input.datasourceId, error: message },
        "Scrape execution failed",
      );

      return this.toDto(cache);
    }
  }

  /** List all cached results, most recent first. */
  async list(): Promise<ScrapeCache[]> {
    const items = await this.em.find(
      ScrapeCacheEntity,
      {},
      { orderBy: { updatedAt: "DESC" } },
    );
    return items.map((item) => this.toDto(item));
  }

  /** Get a single cached result by ID. */
  async get(id: string): Promise<ScrapeCache> {
    const item = await this.em.findOneOrFail(ScrapeCacheEntity, { id });
    return this.toDto(item);
  }

  /** Delete a cached result. */
  async remove(id: string): Promise<void> {
    const item = await this.em.findOneOrFail(ScrapeCacheEntity, { id });
    this.em.remove(item);
    await this.em.flush();
    this.logger.info({ id }, "Scrape cache entry removed");
  }

  /** Map entity to DTO — strips MikroORM metadata. */
  private toDto(entity: ScrapeCacheEntity): ScrapeCache {
    return {
      id: entity.id,
      datasourceId: entity.datasourceId,
      query: entity.query,
      status: entity.status as ScrapeCache["status"],
      columns: entity.columns,
      rows: entity.rows,
      rowCount: entity.rowCount,
      error: entity.error,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
