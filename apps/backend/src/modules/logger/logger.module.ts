import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import pino from 'pino'

export const APP_LOGGER = 'APP_LOGGER'

export const appLoggerProvider = {
  provide: APP_LOGGER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return pino({
      level: configService.get<string>('LOG_LEVEL', 'info'),
    })
  },
}

@Global()
@Module({
  providers: [appLoggerProvider],
  exports: [APP_LOGGER],
})
export class LoggerModule {}