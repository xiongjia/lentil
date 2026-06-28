import type { ExternalDataSourceEntity } from "@lentil/db";
import type {
  ConnectionTest,
  CreateDatasourceInput,
  ExternalDataSource,
  SaveDatasourceResult,
  UpdateDatasourceInput,
} from "@lentil/rpc";
import { dataSourceSchema } from "@lentil/rpc";

export type ExternalDataSourceDto = ExternalDataSource;
export type ConnectionTestDto = ConnectionTest;
export type CreateDatasourceInputDto = CreateDatasourceInput;
export type UpdateDatasourceInputDto = UpdateDatasourceInput;
export type SaveDatasourceResultDto = SaveDatasourceResult;

const normalizeEntity = (
  entity: ExternalDataSourceEntity,
): Record<string, unknown> => {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    type: entity.type,
    config: entity.config ?? {},
    enabled: Boolean(entity.enabled),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

export const toDatasourceDto = (
  entity: ExternalDataSourceEntity,
): ExternalDataSourceDto => {
  return dataSourceSchema.parse(normalizeEntity(entity));
};

export const toDatasourceDtoList = (
  entities: ExternalDataSourceEntity[],
): ExternalDataSourceDto[] => {
  return entities.map(toDatasourceDto);
};
