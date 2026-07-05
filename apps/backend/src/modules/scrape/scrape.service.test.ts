import { Test, TestingModule } from "@nestjs/testing";
import { EntityManager } from "@mikro-orm/core";
import { ScrapeService } from "./scrape.service";
import { IntegrationService } from "../integration/integration.service";
import { APP_LOGGER } from "../providers";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// @orpc/server is ESM-only; provide a CJS-compatible mock for Jest.
jest.mock("@orpc/server", () => {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class ORPCError extends Error {
    code: string;
    constructor(code: string, options: { message: string }) {
      super(options.message);
      this.code = code;
      this.name = "ORPCError";
    }
  }
  return { ORPCError };
});

describe("ScrapeService", () => {
  let service: ScrapeService;
  let mockEm: Record<string, jest.Mock>;
  let mockIntegration: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockEm = {
      find: jest.fn<() => Promise<unknown[]>>(),
      findOneOrFail: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => unknown>(),
      persist: jest.fn(),
      assign: jest.fn(),
      remove: jest.fn(),
      flush: jest
        .fn<() => Promise<void>>()
        .mockImplementation(() => Promise.resolve(undefined)),
    };

    // create() returns a plain object that assign() mutates in-place,
    // matching MikroORM's behaviour where EntityManager.assign mutates the entity.
    mockEm.create.mockImplementation((_entity, data) => {
      return { ...(data as Record<string, unknown>) };
    });
    mockEm.assign.mockImplementation((target, data) => {
      Object.assign(
        target as Record<string, unknown>,
        data as Record<string, unknown>,
      );
    });

    mockIntegration = {
      execute: jest
        .fn<() => Promise<Record<string, unknown>[]>>()
        .mockImplementation(() =>
          Promise.resolve([
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ]),
        ),
      release: jest
        .fn<() => Promise<void>>()
        .mockImplementation(() => Promise.resolve(undefined)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapeService,
        {
          provide: APP_LOGGER,
          useValue: {
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
          },
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

    it("rejects multi-statement queries with mid-query semicolons", async () => {
      await expect(
        service.execute({
          datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          query: "SELECT 1; DROP TABLE users",
        }),
      ).rejects.toThrow("Multiple SQL statements are not allowed");
    });

    it("strips SQL block comments before checking the query prefix", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "/* trace_id=abc */ SELECT 1",
      });

      expect(result.status).toBe("done");
      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT 1 LIMIT 10000",
      });
    });

    it("strips SQL line comments before checking the query prefix", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "-- get users\nSELECT name FROM users",
      });

      expect(result.status).toBe("done");
    });

    it("caps LIMIT to 10000 when user specifies a larger value", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT name FROM users LIMIT 99999999",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT name FROM users LIMIT 10000",
      });
      expect(result.status).toBe("done");
    });

    it("preserves user LIMIT when it is under the cap", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT name FROM users LIMIT 5",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT name FROM users LIMIT 5",
      });
      expect(result.status).toBe("done");
    });

    it("caps user LIMIT and preserves OFFSET clause", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM users LIMIT 50000 OFFSET 100",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT * FROM users LIMIT 10000 OFFSET 100",
      });
      expect(result.status).toBe("done");
    });

    it("sets status to failed on integration error", async () => {
      mockIntegration.execute.mockImplementationOnce(() =>
        Promise.reject(new Error("Connection refused")),
      );

      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT 1",
      });

      expect(result.status).toBe("failed");
      expect(result.error).toBe("Connection refused");
      expect(result.rowCount).toBe(0);
    });

    it("sets empty columns for queries with no rows", async () => {
      mockIntegration.execute.mockImplementationOnce(() => Promise.resolve([]));

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

      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT name FROM users LIMIT 10000",
      });
      expect(result.status).toBe("done");
    });

    it("strips trailing semicolon before appending LIMIT", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT name FROM users;",
      });

      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT name FROM users LIMIT 10000",
      });
      expect(result.status).toBe("done");
    });

    it("capped LIMIT + trailing semicolon still works", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM users LIMIT 100;",
      });

      // 100 < 10000 cap, so stays at 100
      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT * FROM users LIMIT 100",
      });
      expect(result.status).toBe("done");
    });

    it("capped LIMIT with OFFSET and trailing semicolon", async () => {
      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT * FROM users LIMIT 5 OFFSET 10;",
      });

      // 5 < 10000 cap, stays at 5
      expect(mockIntegration.execute).toHaveBeenCalledWith(expect.any(String), {
        sql: "SELECT * FROM users LIMIT 5 OFFSET 10",
      });
      expect(result.status).toBe("done");
    });

    it("still returns failed result even when flush throws", async () => {
      mockIntegration.execute.mockImplementationOnce(() =>
        Promise.reject(new Error("Query timeout")),
      );
      // First flush: initial create (succeeds)
      // Second flush: error recording (fails)
      mockEm.flush.mockImplementationOnce(() => Promise.resolve(undefined));
      mockEm.flush.mockImplementationOnce(() =>
        Promise.reject(new Error("DB connection lost")),
      );

      const result = await service.execute({
        datasourceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        query: "SELECT 1",
      });

      // Original error preserved, not the flush error
      expect(result.status).toBe("failed");
      expect(result.error).toBe("Query timeout");
    });
  });

  // ── list ─────────────────────────────────────────────────────────

  describe("list", () => {
    it("returns an empty array when no cache entries exist", async () => {
      (mockEm.find as jest.Mock).mockImplementation(() => Promise.resolve([]));
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
      (mockEm.find as jest.Mock).mockImplementation(() =>
        Promise.resolve([entry1, entry2]),
      );

      const result = await service.list();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("done");
      expect(result[1].status).toBe("failed");
    });
  });

  // ── get ──────────────────────────────────────────────────────────

  describe("get", () => {
    it("returns a single cache entry", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockImplementation(() =>
        Promise.resolve({
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
        }),
      );

      const result = await service.get("a");
      expect(result.id).toBe("a");
      expect(result.status).toBe("done");
    });
  });

  // ── remove ───────────────────────────────────────────────────────

  describe("remove", () => {
    it("deletes a cache entry", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockImplementation(() =>
        Promise.resolve({ id: "a" }),
      );

      await service.remove("a");

      expect(mockEm.remove).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });
});
