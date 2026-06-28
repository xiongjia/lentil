import { oc } from "@orpc/contract";
import { z } from "zod/v3";
import { pgDriverSchema } from "./drivers/postgresql";

const datasourceType = z.discriminatedUnion("type", [pgDriverSchema]);

const connTestSchema = z.object({
  ok: z.boolean().describe("Whether the connection test succeeded"),
  error: z.string().optional().describe("Error message when `ok` is false"),
});

const extDataSourceBaseSchema = z.object({
  id: z.string().uuid().describe("Unique identifier (UUID v7)"),
  name: z.string().describe("Human-readable name, e.g. 'production-pg'"),
  description: z
    .string()
    .nullable()
    .optional()
    .describe("Optional notes about this data source"),
  enabled: z.boolean().describe("Whether the data source is active"),
  createdAt: z.coerce.date().describe("Timestamp when the record was created"),
  updatedAt: z.coerce
    .date()
    .describe("Timestamp when the record was last updated"),
});

const dataSourceBaseWithConnTestSchema = extDataSourceBaseSchema.extend({
  connectionTest: connTestSchema,
});

export const dataSourceSchema = z.discriminatedUnion("type", [
  extDataSourceBaseSchema.merge(pgDriverSchema),
]);

export const saveDatasourceResultSchema = z.discriminatedUnion("type", [
  dataSourceBaseWithConnTestSchema.merge(pgDriverSchema),
]);

const createDatasourceInputSchema = datasourceType.and(
  z.object({
    name: z
      .string()
      .describe("Human-readable name (must be unique), e.g. 'production-pg'"),
    description: z.string().optional().describe("Optional notes"),
  }),
);

const updateDatasourceInputSchema = z.object({
  id: z.string().uuid().describe("Data source UUID to update"),
  name: z
    .string()
    .optional()
    .describe("Human-readable name (must be unique), e.g. 'production-pg'"),
  description: z.string().optional().describe("Optional notes"),
  config: pgDriverSchema.shape.config
    .partial()
    .optional()
    .describe("Driver configuration (partial update)"),
});

export type ExternalDataSource = z.infer<typeof dataSourceSchema>;
export type ConnectionTest = z.infer<typeof connTestSchema>;
export type SaveDatasourceResult = z.infer<typeof saveDatasourceResultSchema>;
export type CreateDatasourceInput = z.infer<typeof createDatasourceInputSchema>;
export type UpdateDatasourceInput = z.infer<typeof updateDatasourceInputSchema>;

export const integrationContract = {
  list: oc
    .route({ method: "POST", path: "/integration/list" })
    .output(z.array(dataSourceSchema)),

  get: oc
    .route({ method: "POST", path: "/integration/get" })
    .input(
      z.object({
        id: z.string().uuid().describe("Data source UUID"),
      }),
    )
    .output(dataSourceSchema),

  create: oc
    .route({ method: "POST", path: "/integration/create" })
    .input(createDatasourceInputSchema)
    .output(saveDatasourceResultSchema),

  update: oc
    .route({ method: "POST", path: "/integration/update" })
    .input(updateDatasourceInputSchema)
    .output(saveDatasourceResultSchema),

  remove: oc
    .route({ method: "POST", path: "/integration/remove" })
    .input(
      z.object({
        id: z.string().uuid().describe("Data source UUID to delete"),
      }),
    )
    .output(z.void()),

  test: oc
    .route({ method: "POST", path: "/integration/test" })
    .input(datasourceType)
    .output(
      z.object({
        ok: z.boolean().describe("Whether the connection test succeeded"),
        error: z
          .string()
          .optional()
          .describe("Error message when `ok` is false"),
      }),
    ),
};
