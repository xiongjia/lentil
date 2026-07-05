import { Test, TestingModule } from "@nestjs/testing";
import { EntityManager } from "@mikro-orm/core";
import { ScrapeService } from "./scrape.service";
import { IntegrationService } from "../integration/integration.service";
import { APP_LOGGER } from "../providers";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

describe("ScrapeService", () => {
  let service: ScrapeService;
  let mockEm: Record<string, jest.Mock>;
  let mockIntegration: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockEm = {
      find: jest.fn<() => Promise<unknown[]>>(),
      findOneOrFail: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => unknown>(),
      assign: jest.fn(),
      persist: jest.fn(),
      persistAndFlush: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      remove: jest.fn(),
      flush: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    // create() returns a plain object that assign() mutates in-place,
    // matching MikroORM's behaviour where EntityManager.assign mutates the entity.
    mockEm.create.mockImplementation(function (this: typeof mockEm, _entity: unknown, data: Record<string, unknown>) {
      return { ...data };
    });
    mockEm.assign.mockImplementation(function (this: typeof mockEm, target: Record<string, unknown>, data: Record<string, unknown>) {
      Object.assign(target, data);
    });

    mockIntegration = {
      execute: jest
        .fn<() => Promise<Record<string, unknown>[]>>()
        .mockResolvedValue([
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]),
      release: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapeService,
        {
          provide: APP_LOGGER,
          useValue: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        },
        { provide: EntityManager, useValue: mockEm },
        { provide: IntegrationService, useValue: mockIntegration },
      ],
    }).compile();

    service = module.get<ScrapeService>(ScrapeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── execute ─────────────────────────────────────────────────────

  describe("execute", () => {
    it("executes a query and caches the result", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT id, name FROM users",
      });

      // Query should have LIMIT appended
      expect(mockIntegration.execute).toHaveBeenCalledWith(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        { sql: "SELECT id, name FROM users LIMIT 10000" },
      );
      expect(result.status).toBe("done");
      expect(result.columns).toEqual(["id", "name"]);
      expect(result.rows).toHaveLength(2);
      expect(result.rowCount).toBe(2);
    });

    it("rejects non-SELECT queries", async () => {
      await expect(
        service.execute({
          datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          query: "DELETE FROM users",
        }),
      ).rejects.toThrow("Only SELECT queries are allowed");

      await expect(
        service.execute({
          datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          query: "DROP TABLE users",
        }),
      ).rejects.toThrow("Only SELECT queries are allowed");

      // WITH (CTE) should be allowed
      await expect(
        service.execute({
          datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          query: "WITH cte AS (SELECT 1) SELECT * FROM cte",
        }),
      ).resolves.toBeDefined();
    });

    it("sets status to failed on integration error", async () => {
      mockIntegration.execute.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT 1",
      });

      expect(result.status).toBe("failed");
      expect(result.error).toBe("Connection refused");
      expect(result.rowCount).toBe(0);
    });

    it("sets empty columns for queries with no rows", async () => {
      mockIntegration.execute.mockResolvedValueOnce([]);

      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM empty_table",
      });

      expect(result.status).toBe("done");
      expect(result.columns).toEqual([]);
      expect(result.rows).toHaveLength(0);
    });

    it("appends LIMIT to queries without a trailing semicolon", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT name FROM users",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(
        expect.any(String),
        { sql: "SELECT name FROM users LIMIT 10000" },
      );
      expect(result.status).toBe("done");
    });

    it("strips trailing semicolon before appending LIMIT", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT name FROM users;",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(
        expect.any(String),
        { sql: "SELECT name FROM users LIMIT 10000" },
      );
      expect(result.status).toBe("done");
    });

    it("does not append duplicate LIMIT when query already has one", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT name FROM users LIMIT 5",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(
        expect.any(String),
        { sql: "SELECT name FROM users LIMIT 5" },
      );
      expect(result.status).toBe("done");
    });

    it("preserves existing LIMIT when query has trailing semicolon", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM users LIMIT 100;",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(
        expect.any(String),
        { sql: "SELECT * FROM users LIMIT 100" },
      );
      expect(result.status).toBe("done");
    });

    it("preserves existing LIMIT with OFFSET clause", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM users LIMIT 5 OFFSET 10",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(
        expect.any(String),
        { sql: "SELECT * FROM users LIMIT 5 OFFSET 10" },
      );
      expect(result.status).toBe("done");
    });

    it("preserves existing LIMIT with OFFSET and trailing semicolon", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM users LIMIT 5 OFFSET 10;",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(
        expect.any(String),
        { sql: "SELECT * FROM users LIMIT 5 OFFSET 10" },
      );
      expect(result.status).toBe("done");
    });
  });

  // ── list ─────────────────────────────────────────────────────────

  describe("list", () => {
    it("returns an empty array when no cache entries exist", async () => {
      (mockEm.find as jest.Mock).mockResolvedValue([]);
      const result = await service.list();
      expect(result).toEqual([]);
    });

    it("returns all cache entries", async () => {
      const entry1 = {
        id: "a",
        datasourceId: "ds-1",
        query: "SELECT 1",
        status: "done",
        columns: ["?column?"],
        rows: [{ "?column?": 1 }],
        rowCount: 1,
        error: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const entry2 = { ...entry1, id: "b", status: "failed", error: "timeout" };
      (mockEm.find as jest.Mock).mockResolvedValue([entry1, entry2]);

      const result = await service.list();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("done");
      expect(result[1].status).toBe("failed");
    });
  });

  // ── get ──────────────────────────────────────────────────────────

  describe("get", () => {
    it("returns a single cache entry", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue({
        id: "a",
        datasourceId: "ds-1",
        query: "SELECT 1",
        status: "done",
        columns: ["?column?"],
        rows: [{ "?column?": 1 }],
        rowCount: 1,
        error: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.get("a");
      expect(result.id).toBe("a");
      expect(result.status).toBe("done");
    });
  });

  // ── remove ───────────────────────────────────────────────────────

  describe("remove", () => {
    it("deletes a cache entry", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue({ id: "a" });

      await service.remove("a");

      expect(mockEm.remove).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });
});
