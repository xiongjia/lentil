import { Module } from "@nestjs/common";
import { IntegrationService } from "./integration.service";
import { DatasourceConfigService } from "./datasource-config.service";
import { IntegrationRPC } from "./integration.rpc";

@Module({
  controllers: [IntegrationRPC],
  providers: [IntegrationService, DatasourceConfigService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
