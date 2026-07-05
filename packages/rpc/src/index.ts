import { generalContract } from "./general";
import { integrationContract } from "./integration";
import { scrapeContract } from "./scrape";

export const contract = {
  general: generalContract,
  integration: integrationContract,
  scrape: scrapeContract,
};
export type Contract = typeof contract;

export type {
  ConnectionTest,
  CreateDatasourceInput,
  ExternalDataSource,
  SaveDatasourceResult,
  UpdateDatasourceInput,
} from "./integration";
export type { ScrapeCache, ScrapeExecuteInput } from "./scrape";
export { generalContract } from "./general";
export { integrationContract, dataSourceSchema, saveDatasourceResultSchema } from "./integration";
export { scrapeContract } from "./scrape";
