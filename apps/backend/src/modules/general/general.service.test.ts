import { Test, TestingModule } from "@nestjs/testing";
import { GeneralService } from "./general.service";
import { APP_LOGGER } from "../providers";
import { describe, beforeEach, it, expect } from "@jest/globals";

describe("GeneralService", () => {
  let service: GeneralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralService,
        { provide: APP_LOGGER, useValue: { debug: () => {} } },
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
