import { Module, OnModuleInit, Inject } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GeneralModule } from '@/modules/general/general.module'
import { LoggerModule, APP_LOGGER } from '@/modules/logger/logger.module'
import pino from 'pino'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env.test', '.env.prod'],
    }),
    LoggerModule,
    GeneralModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @Inject(APP_LOGGER) private readonly logger: pino.Logger,
  ) {}

  onModuleInit() {
    const port = this.configService.get<number>('PORT', 3850)
    this.logger.info(`Application is running on: http://localhost:${port}`)
    this.logger.info(`Swagger docs: http://localhost:${port}/api`)
  }
}