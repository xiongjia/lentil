import { Module } from "@nestjs/common";
import { IntegrationModule } from "../integration/integration.module";
import { ScrapeService } from "./scrape.service";
import { ScrapeRPC } from "./scrape.rpc";

@Module({
  imports: [IntegrationModule],
  controllers: [ScrapeRPC],
  providers: [ScrapeService],
})
export class ScrapeModule {}
