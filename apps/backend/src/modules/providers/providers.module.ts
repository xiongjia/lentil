import { Module, Global } from "@nestjs/common";
import { appLoggerProvider } from "./app-logger.provider";

@Global()
@Module({
  providers: [appLoggerProvider],
  exports: [appLoggerProvider.provide],
})
export class ProvidersModule {}