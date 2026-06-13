import { Module, OnModuleInit, Inject } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MikroORM } from "@mikro-orm/core";
import { ORPCModule } from "@orpc/nest";
import { GeneralModule } from "./modules/general/general.module";
import { DatabaseModule } from "@lentil/db";
import { ProvidersModule, APP_LOGGER } from "./modules/providers";
import pino from "pino";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.dev", ".env.test", ".env.prod"],
    }),
    ORPCModule.forRoot({}),
    DatabaseModule,
    ProvidersModule,
    GeneralModule,
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
