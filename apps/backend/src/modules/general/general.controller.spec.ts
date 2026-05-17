import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { GeneralModule } from "./general.module";
import { GeneralController } from "./general.controller";
import { ProvidersModule } from "../providers";
import { describe, beforeEach, it, expect } from "@jest/globals";

describe("GeneralController", () => {
  let controller: GeneralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env.test"] }),
        ProvidersModule,
        GeneralModule,
      ],
    }).compile();

    controller = module.get<GeneralController>(GeneralController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("health", () => {
    it("should return health status", () => {
      const result = controller.health();
      expect(result).toEqual({ status: "ok" });
    });
  });
});