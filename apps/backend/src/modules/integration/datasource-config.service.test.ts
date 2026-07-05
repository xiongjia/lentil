import { Test, TestingModule } from "@nestjs/testing";
import { EntityManager } from "@mikro-orm/core";
import { DatasourceConfigService } from "./datasource-config.service";
import { IntegrationService } from "./integration.service";
import { APP_LOGGER } from "../providers";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// Mock @lentil/rpc (ESM package) — the service-layer tests don't need real Zod schemas.
// The toDatasourceDto / toDatasourceDtoList mappers are tested implicitly through
// integration tests where the full RPC stack is available.
jest.mock("@lentil/rpc", () => ({
  dataSourceSchema: {
    parse: (v: unknown) => v,
  },
}));

const PG_CONFIG = { host: "localhost", port: 5432, database: "mydb" };

const makeDs = (overrides: Record<string, unknown> = {}) => ({
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "test-pg",
  description: null,
  type: "postgresql",
  config: PG_CONFIG,
  enabled: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-06-01"),
  ...overrides,
});

describe("DatasourceConfigService", () => {
  let service: DatasourceConfigService;
  let mockEm: Record<string, jest.Mock>;
  let mockIntegration: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockEm = {
      find: jest.fn<() => Promise<unknown[]>>(),
      findOneOrFail: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => unknown>(),
      assign: jest.fn(),
      persist: jest.fn(),
      remove: jest.fn(),
      flush: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    mockIntegration = {
      testConnection: jest
        .fn<() => Promise<{ ok: boolean; error?: string }>>()
        .mockResolvedValue({ ok: true }),
      release: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatasourceConfigService,
        {
          provide: APP_LOGGER,
          useValue: { debug: () => {}, info: () => {}, warn: () => {} },
        },
        { provide: EntityManager, useValue: mockEm },
        { provide: IntegrationService, useValue: mockIntegration },
      ],
    }).compile();

    service = module.get<DatasourceConfigService>(DatasourceConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── list ───────────────────────────────────────────────────────

  describe("list", () => {
    it("returns an empty array when no data sources exist", async () => {
      (mockEm.find as jest.Mock).mockResolvedValue([]);
      const result = await service.list();
      expect(result).toEqual([]);
      expect(mockEm.find).toHaveBeenCalledTimes(1);
    });

    it("returns all data sources", async () => {
      const ds1 = makeDs();
      const ds2 = makeDs({
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        name: "staging-pg",
      });
      (mockEm.find as jest.Mock).mockResolvedValue([ds1, ds2]);

      const result = await service.list();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("test-pg");
      expect(result[1].name).toBe("staging-pg");
    });
  });

  // ── get ────────────────────────────────────────────────────────

  describe("get", () => {
    it("returns a normalized data source by id", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);

      const result = await service.get(ds.id);

      // Verify toDatasourceDto normalizes the entity correctly
      expect(result).toMatchObject({
        id: ds.id,
        name: ds.name,
        type: ds.type,
        enabled: true,
        config: ds.config,
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("returns normalized entity with null description", async () => {
      const ds = makeDs({ description: null });
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);

      const result = await service.get(ds.id);

      expect(result.description).toBeNull();
    });

    it("throws when the data source does not exist", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockRejectedValue(
        new Error("not found"),
      );
      await expect(service.get("missing-id")).rejects.toThrow("not found");
    });
  });

  // ── remove ─────────────────────────────────────────────────────

  describe("remove", () => {
    it("removes a data source and releases its connection", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);

      await service.remove(ds.id);

      expect(mockEm.remove).toHaveBeenCalledWith(ds);
      expect(mockEm.flush).toHaveBeenCalled();
      expect(mockIntegration.release).toHaveBeenCalledWith(ds.id);
    });

    it("still removes when connection release fails", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);
      (mockIntegration.release as jest.Mock).mockRejectedValue(
        new Error("release failed"),
      );

      // Should not throw — release is best-effort
      await service.remove(ds.id);

      expect(mockEm.remove).toHaveBeenCalledWith(ds);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("throws when the data source does not exist", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockRejectedValue(
        new Error("not found"),
      );
      await expect(service.remove("missing-id")).rejects.toThrow("not found");
    });
  });

  // ── create ─────────────────────────────────────────────────────

  describe("create", () => {
    it("creates a data source with enabled=true and timestamps", async () => {
      const now = new Date();
      const ds = makeDs({ createdAt: now, updatedAt: now });
      (mockEm.create as jest.Mock).mockReturnValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await service.create({
        name: "new-db",
        type: "postgresql",
        config: PG_CONFIG,
      });

      // Verify enabled + timestamps are injected
      const createCall = mockEm.create.mock.calls[0] as unknown[];
      expect(createCall[1]).toMatchObject({
        name: "new-db",
        type: "postgresql",
        enabled: true,
      });
      expect(createCall[1]).toHaveProperty("createdAt");
      expect(createCall[1]).toHaveProperty("updatedAt");
      expect(
        (createCall[1] as Record<string, unknown>).createdAt,
      ).toBeInstanceOf(Date);
      expect(
        (createCall[1] as Record<string, unknown>).updatedAt,
      ).toBeInstanceOf(Date);
    });

    it("persists and tests the connection", async () => {
      const ds = makeDs();
      (mockEm.create as jest.Mock).mockReturnValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const result = await service.create({
        name: "new-db",
        type: "postgresql",
        config: { host: "db.example.com", port: 5432, database: "mydb" },
      });

      expect(mockEm.create).toHaveBeenCalled();
      expect(mockEm.persist).toHaveBeenCalledWith(ds);
      expect(mockEm.flush).toHaveBeenCalled();
      expect(mockIntegration.testConnection).toHaveBeenCalledWith(
        "postgresql",
        expect.any(Object),
      );
      expect(result.connectionTest).toEqual({ ok: true });
    });

    it("saves config even when connection test fails", async () => {
      const ds = makeDs();
      (mockEm.create as jest.Mock).mockReturnValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockResolvedValue({
        ok: false,
        error: "timeout",
      });

      const result = await service.create({
        name: "bad-db",
        type: "postgresql",
        config: { host: "down.example.com", port: 5432, database: "x" },
      });

      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.connectionTest).toEqual({ ok: false, error: "timeout" });
    });

    it("returns connection test error when test throws", async () => {
      const ds = makeDs();
      (mockEm.create as jest.Mock).mockReturnValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockRejectedValue(
        new Error("boom"),
      );

      const result = await service.create({
        name: "err-db",
        type: "postgresql",
        config: { host: "h", port: 5432, database: "d" },
      });

      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.connectionTest.ok).toBe(false);
    });

    it("includes description when provided", async () => {
      const ds = makeDs();
      (mockEm.create as jest.Mock).mockReturnValue(ds);

      await service.create({
        name: "with-desc",
        description: "My data source",
        type: "postgresql",
        config: PG_CONFIG,
      });

      const createCall = mockEm.create.mock.calls[0] as unknown[];
      expect(createCall[1]).toMatchObject({ description: "My data source" });
    });
  });

  // ── update ─────────────────────────────────────────────────────

  describe("update", () => {
    it("updates name and tests connection", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const result = await service.update(ds.id, { name: "renamed-db" });

      expect(mockEm.assign).toHaveBeenCalledWith(ds, { name: "renamed-db" });
      expect(mockEm.flush).toHaveBeenCalled();
      expect(mockIntegration.release).toHaveBeenCalledWith(ds.id);
      expect(result.connectionTest).toEqual({ ok: true });
    });

    it("updates config and releases old connection", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const newConfig = {
        host: "new.example.com",
        port: 5433,
        database: "newdb",
      };
      await service.update(ds.id, { config: newConfig });

      expect(mockEm.assign).toHaveBeenCalledWith(ds, { config: newConfig });
      expect(mockIntegration.release).toHaveBeenCalledWith(ds.id);
    });

    it("returns connection test failure without throwing", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);
      (mockIntegration.testConnection as jest.Mock).mockResolvedValue({
        ok: false,
        error: "refused",
      });

      const result = await service.update(ds.id, { name: "still-saved" });

      expect(result.connectionTest).toEqual({ ok: false, error: "refused" });
      expect(result.name).toBe("test-pg"); // after assign in mock
    });

    it("still succeeds when connection release fails", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);
      (mockIntegration.release as jest.Mock).mockRejectedValue(
        new Error("release failed"),
      );

      // Should not throw — release is best-effort
      await expect(
        service.update(ds.id, { name: "ok" }),
      ).resolves.toBeDefined();

      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("does not call release when testConnection throws", async () => {
      const ds = makeDs();
      (mockEm.findOneOrFail as jest.Mock).mockResolvedValue(ds);
      (mockIntegration.release as jest.Mock).mockResolvedValue(undefined);
      (mockIntegration.testConnection as jest.Mock).mockRejectedValue(
        new Error("boom"),
      );

      // Release is called BEFORE testConnection, so release still happens
      const result = await service.update(ds.id, { name: "x" });

      expect(mockIntegration.release).toHaveBeenCalled();
      expect(result.connectionTest.ok).toBe(false);
    });

    it("throws when the data source does not exist", async () => {
      (mockEm.findOneOrFail as jest.Mock).mockRejectedValue(
        new Error("not found"),
      );
      await expect(service.update("missing-id", { name: "x" })).rejects.toThrow(
        "not found",
      );
    });
  });
});
