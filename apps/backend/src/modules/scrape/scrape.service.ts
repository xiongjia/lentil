import { ScrapeCacheEntity } from "@lentil/db";
import type { ScrapeCache, ScrapeExecuteInput } from "@lentil/rpc";
import { EntityManager } from "@mikro-orm/core";
import { Inject, Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/server";
import pino from "pino";
import { APP_LOGGER } from "../providers";
import { IntegrationService } from "../integration/integration.service";

/** Maximum rows a scrape query may return. */
const MAX_ROWS = 10000;

/**
 * Prepare a user-supplied SQL query for safe execution.
 *
 * - Strips SQL comments (block and line)
 * - Rejects multi-statement queries (mid-query semicolons)
 * - Ensures only SELECT or WITH … SELECT is allowed
 * - Caps the LIMIT to {@link MAX_ROWS}, preserving any OFFSET
 */
const prepareQuery = (raw: string): string => {
  // Strip SQL comments
  let q = raw.replace(/\/\*[\s\S]*?\*\//g, ""); // block comments
  q = q.replace(/--[^\n]*/g, ""); // line comments
  q = q.trim();

  // Strip trailing semicolon
  q = q.replace(/;\s*$/, "");

  // Reject multi-statement queries
  if (/;/.test(q)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Multiple SQL statements are not allowed",
    });
  }

  const upper = q.toUpperCase();

  if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Only SELECT queries are allowed",
    });
  }

  // Cap LIMIT: replace any existing LIMIT with a capped version,
  // preserving the OFFSET clause if present.
  const limitRe = /\bLIMIT\s+(\d+)(\s+OFFSET\s+(\d+))?\s*$/i;
  const match = q.match(limitRe);

  if (match) {
    const userLimit = parseInt(match[1]!, 10);
    const capped = Math.min(userLimit, MAX_ROWS);
    const offsetClause = match[3] ? ` OFFSET ${match[3]}` : "";
    const queryWithoutLimit = q.slice(0, match.index).trimEnd();
    return `${queryWithoutLimit} LIMIT ${capped}${offsetClause}`;
  }

  return `${q} LIMIT ${MAX_ROWS}`;
};

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
    const limitedQuery = prepareQuery(input.query);

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
    this.em.persist(cache);
    await this.em.flush();

    try {
      const rows = await this.integration.execute(input.datasourceId, {
        sql: limitedQuery,
      });

      const columns = rows.length > 0 ? Object.keys(rows[0]!) : [];

      this.em.assign(cache, {
        status: "done",
        columns,
        rows,
        rowCount: rows.length,
        updatedAt: new Date(),
      });
      await this.em.flush();

      this.logger.info(
        {
          id: cache.id,
          datasourceId: input.datasourceId,
          rowCount: rows.length,
        },
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

      // Best-effort persist — don't let a flush failure swallow the original error
      try {
        await this.em.flush();
      } catch (flushErr) {
        this.logger.error(
          { id: cache.id, flushError: String(flushErr) },
          "Failed to persist scrape failure status; original error preserved",
        );
      }

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
