import { generalContract } from "./general";
import { integrationContract } from "./integration";

export const contract = {
  general: generalContract,
  integration: integrationContract,
};
export type Contract = typeof contract;

export type {
  ConnectionTest,
  CreateDatasourceInput,
  ExternalDataSource,
  SaveDatasourceResult,
  UpdateDatasourceInput,
} from "./integration";
export { generalContract } from "./general";
export { integrationContract, dataSourceSchema, saveDatasourceResultSchema } from "./integration";
