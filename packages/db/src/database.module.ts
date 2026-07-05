import { Global, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ConfigService } from "@nestjs/config";
import { getMikroOrmConfig } from "./setup-db.js";
import { ExternalDataSourceEntity } from "./entities/external-datasource.entity.js";
import { ScrapeCacheEntity } from "./entities/scrape-cache.entity.js";

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getMikroOrmConfig(config),
    }),
    MikroOrmModule.forFeature([ExternalDataSourceEntity, ScrapeCacheEntity]),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}
