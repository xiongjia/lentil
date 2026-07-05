import { DatabaseModule } from "@lentil/db";
import { MikroORM } from "@mikro-orm/core";
import { Inject, Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { ORPCModuleConfig } from "@orpc/nest";
import { ORPCModule } from "@orpc/nest";
import type pino from "pino";
import { createLoggingInterceptor } from "./common/config";
import { GeneralModule } from "./modules/general/general.module";
import { IntegrationModule } from "./modules/integration/integration.module";
import { APP_LOGGER, ProvidersModule } from "./modules/providers";
import { ScrapeModule } from "./modules/scrape/scrape.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.dev", ".env.test", ".env.prod"],
    }),
    ORPCModule.forRootAsync({
      inject: [APP_LOGGER],
      useFactory: (logger: pino.Logger): ORPCModuleConfig => ({
        interceptors: [createLoggingInterceptor(logger)],
      }),
    }),
    DatabaseModule,
    ProvidersModule,
    GeneralModule,
    IntegrationModule,
    ScrapeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @Inject(APP_LOGGER) private readonly logger: pino.Logger,
    private readonly orm: MikroORM,
  ) {}

  async onModuleInit() {
    await this.orm.migrator.up();

    const port = this.configService.get<number>("PORT", 3990);
    const scheme = this.configService.get<string>("APP_SCHEME", "http");
    const host = this.configService.get<string>("APP_HOST", "localhost");
    this.logger.info(`Application is running on: ${scheme}://${host}:${port}`);
    if (this.configService.get<boolean>("API_DOCS_ENABLED", true)) {
      this.logger.info(`Swagger docs: ${scheme}://${host}:${port}/api/docs`);
    }
    if (this.configService.get<boolean>("RPC_SPEC_ENABLED", true)) {
      this.logger.info(`RPC Reference: ${scheme}://${host}:${port}/reference`);
    }
  }
}
