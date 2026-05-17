import { ConfigService } from "@nestjs/config";
import pino from "pino";
import * as path from "path";

export const APP_LOGGER = "APP_LOGGER";
export type AppLogger = ReturnType<typeof pino>;

export const LOG_DEFAULTS = {
  LEVEL: "info",
  MAX_SIZE: "5M",
  MAX_FILES: 10,
  COLORIZE: true,
  ENABLE_FS_LOG: false,
  DIR: "logs",
  FILENAME: "lentil.backend.log",
} as const;

export const appLoggerProvider = {
  provide: APP_LOGGER,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<AppLogger> => {
    const logFilename = configService.get<string>("LOG_FILENAME");
    const maxSize = configService.get<string>(
      "LOG_MAX_SIZE",
      LOG_DEFAULTS.MAX_SIZE,
    );
    const maxFiles = configService.get<number>(
      "LOG_MAX_FILES",
      LOG_DEFAULTS.MAX_FILES,
    );
    const logLevel = configService.get<string>("LOG_LEVEL", LOG_DEFAULTS.LEVEL);
    const colorize = configService.get<boolean>(
      "LOG_COLORIZE",
      LOG_DEFAULTS.COLORIZE,
    );
    const enableFsLog = configService.get<boolean>(
      "LOG_ENABLE_FS_LOG",
      LOG_DEFAULTS.ENABLE_FS_LOG,
    );
    const logDir = configService.get<string>("LOG_DIR", LOG_DEFAULTS.DIR);

    const resolvedLogFile = logFilename
      ? path.isAbsolute(logFilename)
        ? logFilename
        : path.join(process.cwd(), logDir, logFilename)
      : path.join(process.cwd(), logDir, LOG_DEFAULTS.FILENAME);

    const stdoutTransport = pino.transport({
      target: "pino-pretty",
      options: { colorize: colorize },
    });

    const streams: {
      stream: ReturnType<typeof pino.transport>;
      level: string;
    }[] = [{ stream: stdoutTransport, level: logLevel }];

    if (enableFsLog) {
      const fsTransport = pino.transport({
        target: "pino-roll",
        options: {
          file: resolvedLogFile,
          size: maxSize,
          limit: { count: maxFiles },
        },
      });
      streams.unshift({ stream: fsTransport, level: logLevel });
    }

    return pino({ level: logLevel }, pino.multistream(streams));
  },
};
