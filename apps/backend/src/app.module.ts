import { Module, OnModuleInit, Inject } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MikroORM } from "@mikro-orm/core";
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
    this.logger.info(`Application is running on: http://localhost:${port}`);
    if (this.configService.get<boolean>("API_DOCS_ENABLED", true)) {
      this.logger.info(`Swagger docs: http://localhost:${port}/api/docs`);
    }
  }
}
