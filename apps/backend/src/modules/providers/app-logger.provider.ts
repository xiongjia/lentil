import { ConfigService } from "@nestjs/config";
import pino from "pino";

export const APP_LOGGER = "APP_LOGGER";

export const appLoggerProvider = {
  provide: APP_LOGGER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return pino({
      level: configService.get<string>("LOG_LEVEL", "info"),
    });
  },
};