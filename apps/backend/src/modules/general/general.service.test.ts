import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { GeneralModule } from "./general.module";
import { GeneralService } from "./general.service";
import { ProvidersModule } from "../providers";
import { DatabaseModule } from "@lentil/db";
import { describe, beforeEach, it, expect } from "@jest/globals";

describe("GeneralService", () => {
  let service: GeneralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env.test"] }),
        DatabaseModule,
        ProvidersModule,
        GeneralModule,
      ],
    }).compile();

    service = module.get<GeneralService>(GeneralService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("health", () => {
    it("should return status ok", () => {
      const result = service.health();
      expect(result).toEqual({ status: "ok" });
    });
  });
});
