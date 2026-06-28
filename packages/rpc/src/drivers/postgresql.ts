import { z } from "zod/v3";

const pgDriverConfigSchema = z.object({
  host: z.string().describe("Hostname or IP"),
  port: z.number().int().min(1).max(65535).default(5432).describe("Port"),
  database: z.string().describe("Database name"),
  user: z.string().describe("Username"),
  password: z.string().describe("Password"),
  max: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(5)
    .optional()
    .describe("Max pool size (default 5)"),
});

export const pgDriverSchema = z.object({
  type: z.literal("postgresql"),
  config: pgDriverConfigSchema,
});

export type PgDriverConfig = z.infer<typeof pgDriverConfigSchema>;
