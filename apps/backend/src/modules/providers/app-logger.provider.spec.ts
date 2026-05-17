import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import {
  appLoggerProvider,
  APP_LOGGER,
  LOG_DEFAULTS,
  type AppLogger,
} from "./app-logger.provider";
import { ProvidersModule } from "./providers.module";
import { describe, it, expect } from "@jest/globals";

describe("appLoggerProvider", () => {
  it("should be defined", () => {
    expect(appLoggerProvider).toBeDefined();
  });

  it("should have APP_LOGGER token as provide", () => {
    expect(appLoggerProvider.provide).toBe(APP_LOGGER);
  });

  it("should inject ConfigService", () => {
    expect(appLoggerProvider.inject).toContain(ConfigService);
  });

  it("should be an async factory function", () => {
    expect(appLoggerProvider.useFactory.constructor.name).toBe("AsyncFunction");
  });

  describe("with ConfigModule", () => {
    it("should create logger with debug level", async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => ({ LOG_LEVEL: "debug" })],
          }),
          ProvidersModule,
        ],
      }).compile();
      const logger = await module.get<AppLogger>(APP_LOGGER);
      expect(logger.level).toBe("debug");
    });

    it("should use default values when not configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => ({})],
          }),
          ProvidersModule,
        ],
      }).compile();
      const logger = await module.get<AppLogger>(APP_LOGGER);
      expect(logger.level).toBe(LOG_DEFAULTS.LEVEL);
    });
  });
});
