import { Test, TestingModule } from "@nestjs/testing";
import { GeneralController } from "./general.controller";
import { GeneralService } from "./general.service";
import { APP_LOGGER } from "../providers";
import { describe, beforeEach, it, expect } from "@jest/globals";

describe("GeneralController", () => {
  let controller: GeneralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralController],
      providers: [
        GeneralService,
        { provide: APP_LOGGER, useValue: { debug: () => {} } },
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
