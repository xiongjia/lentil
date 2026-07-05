import { oc } from "@orpc/contract";
import { z } from "zod/v3";

const scrapeCacheSchema = z.object({
  id: z.string().uuid().describe("Unique identifier (UUID v7)"),
  datasourceId: z.string().describe("Data source UUID this cache belongs to"),
  query: z.string().describe("The SELECT query that was executed"),
  status: z.enum(["running", "done", "failed"]).describe("Execution status"),
  columns: z.array(z.string()).describe("Column names from the result set"),
  rows: z
    .array(z.record(z.unknown()))
    .describe("Result rows as generic key-value objects"),
  rowCount: z.number().int().describe("Number of cached rows"),
  error: z
    .string()
    .nullable()
    .optional()
    .describe("Error message when status is 'failed'"),
  createdAt: z.coerce.date().describe("Timestamp when the record was created"),
  updatedAt: z.coerce
    .date()
    .describe("Timestamp when the record was last updated"),
});

const executeInputSchema = z.object({
  datasourceId: z.string().uuid().describe("Data source UUID to query against"),
  query: z.string().max(10000).describe("SELECT query to execute"),
});

export type ScrapeCache = z.infer<typeof scrapeCacheSchema>;
export type ScrapeExecuteInput = z.infer<typeof executeInputSchema>;

export const scrapeContract = {
  execute: oc
    .route({ method: "POST", path: "/scrape/execute" })
    .input(executeInputSchema)
    .output(scrapeCacheSchema),

  list: oc
    .route({ method: "POST", path: "/scrape/list" })
    .output(z.array(scrapeCacheSchema)),

  get: oc
    .route({ method: "POST", path: "/scrape/get" })
    .input(
      z.object({
        id: z.string().uuid().describe("Cache entry UUID"),
      }),
    )
    .output(scrapeCacheSchema),

  remove: oc
    .route({ method: "POST", path: "/scrape/remove" })
    .input(
      z.object({
        id: z.string().uuid().describe("Cache entry UUID to delete"),
      }),
    )
    .output(z.void()),
};
