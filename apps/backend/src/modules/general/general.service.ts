import { Inject, Injectable } from "@nestjs/common";
import pino from "pino";
import { APP_LOGGER } from "../logger/logger.module";

@Injectable()
export class GeneralService {
  constructor(@Inject(APP_LOGGER) private readonly logger: pino.Logger) {}

  health() {
    this.logger.debug("Health check called");
    return { status: "ok" };
  }
}