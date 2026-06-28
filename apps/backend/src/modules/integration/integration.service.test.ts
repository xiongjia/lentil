import { Test, TestingModule } from "@nestjs/testing";
import { EntityManager } from "@mikro-orm/core";
import { IntegrationService } from "./integration.service";
import { APP_LOGGER } from "../providers";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// Prevent PostgresqlDriver from making real connections during unit tests.
// The driver instantiates pg.Pool / pg.Client internally — mocking 'pg'
// ensures we never hit a real database.
jest.mock("pg", () => {
  const actualPg = jest.requireActual("pg") as Record<string, unknown>;
  return {
    ...actualPg,
    Pool: jest.fn().mockImplementation(function () {
      return {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn().mockResolvedValue(undefined as never),
      };
    }),
    Client: jest.fn().mockImplementation(function () {
      return {
        connect: jest.fn().mockResolvedValue(undefined as never),
        query: jest
          .fn()
          .mockResolvedValue({ rows: [{ "?column?": 1 }] } as never),
        end: jest.fn().mockResolvedValue(undefined as never),
      };
    }),
  };
});

describe("IntegrationService", () => {
  let service: IntegrationService;
  let mockEm: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockEm = {
      findOne: jest.fn<() => Promise<unknown>>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        {
          provide: APP_LOGGER,
          useValue: { debug: () => {}, info: () => {}, warn: () => {} },
        },
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── testConnection ─────────────────────────────────────────────

  describe("testConnection", () => {
    it("returns ok for a valid postgresql config (driver mocked)", async () => {
      // With pg.Client mocked above, the PostgresqlDriver's testConnection
      // will use our mock client — no real network call is made.
      const result = await service.testConnection("postgresql", {
        host: "localhost",
        port: 5432,
        database: "mydb",
        user: "pg",
        password: "secret",
      });

      expect(result).toEqual({ ok: true });
    });

    it("returns error for an unsupported driver type", async () => {
      const result = await service.testConnection("unknown", {});
      expect(result).toEqual({
        ok: false,
        error: "Unsupported type: unknown",
      });
    });
  });

  // ── release ────────────────────────────────────────────────────

  describe("release", () => {
    it("resolves without error when no connection is cached", async () => {
      await expect(service.release("nonexistent-id")).resolves.toBeUndefined();
    });
  });

  // ── onApplicationShutdown ──────────────────────────────────────

  describe("onApplicationShutdown", () => {
    it("resolves without error when no connections exist", async () => {
      await expect(service.onApplicationShutdown()).resolves.toBeUndefined();
    });
  });
});
