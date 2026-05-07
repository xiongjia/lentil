import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GeneralModule } from "../modules/general/general.module";
import { LoggerModule } from "../modules/logger/logger.module";
import { HealthCommand } from "./commands/health.command";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.cli", ".env.dev", ".env.test", ".env.prod"],
    }),
    LoggerModule,
    GeneralModule,
  ],
  providers: [HealthCommand],
})
export class CliModule {}