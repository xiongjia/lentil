import { Module } from '@nestjs/common'
import { GeneralController } from './general.controller'

@Module({
  controllers: [GeneralController],
  providers: [],
  exports: [],
})
export class GeneralModule {}