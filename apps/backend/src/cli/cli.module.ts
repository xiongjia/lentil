import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GeneralModule } from "../modules/general/general.module";
import { ProvidersModule } from "../modules/providers";
import { HealthCommand } from "./commands/health.command";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.cli", ".env.dev", ".env.test", ".env.prod"],
    }),
    ProvidersModule,
    GeneralModule,
  ],
  providers: [HealthCommand],
})
export class CliModule {}