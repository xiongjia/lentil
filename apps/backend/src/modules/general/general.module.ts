import { Module } from "@nestjs/common";
import { GeneralController } from "./general.controller";
import { GeneralRPC } from "./general.rpc";
import { GeneralService } from "./general.service";

@Module({
  controllers: [GeneralController, GeneralRPC],
  providers: [GeneralService],
  exports: [GeneralService],
})
export class GeneralModule {}
