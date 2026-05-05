import { Controller, Get, Inject } from "@nestjs/common";
import pino from "pino";
import { APP_LOGGER } from "../logger/logger.module";

@Controller()
export class GeneralController {
  constructor(@Inject(APP_LOGGER) private readonly logger: pino.Logger) {}

  @Get("health")
  health() {
    this.logger.debug("Health check called");
    return { status: "ok" };
  }
}
