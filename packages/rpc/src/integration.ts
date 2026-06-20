import { oc } from "@orpc/contract";
import { z } from "zod/v3";

// ── Driver type + config (discriminated union) ──────────────────

const pgConfig = z
  .object({
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
      .optional()
      .describe("Max pool size (default 5)"),
  })
  .passthrough();

/**
 * Discriminated union: `type` determines what `config` shape is accepted.
 * Add a new entry here when implementing a new driver.
 */
const typeWithConfig = z.discriminatedUnion("type", [
  z.object({ type: z.literal("postgresql"), config: pgConfig }),
]);

// ── Shared output schemas ───────────────────────────────────────

const connectionTestSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
});

const externalDataSourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  type: z.string(),
  config: z.record(z.unknown()),
  enabled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ── Contract ────────────────────────────────────────────────────

export const integrationContract = {
  list: oc
    .route({ method: "POST", path: "/integration/list" })
    .output(z.array(externalDataSourceSchema)),

  get: oc
    .route({ method: "POST", path: "/integration/get" })
    .input(z.object({ id: z.string().uuid() }))
    .output(externalDataSourceSchema),

  create: oc
    .route({ method: "POST", path: "/integration/create" })
    .input(
      typeWithConfig.and(
        z.object({
          name: z.string().describe("Unique identifier, e.g. 'production-pg'"),
          description: z.string().optional().describe("Optional notes"),
        }),
      ),
    )
    .output(
      externalDataSourceSchema.extend({ connectionTest: connectionTestSchema }),
    ),

  update: oc
    .route({ method: "POST", path: "/integration/update" })
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        config: z.record(z.unknown()).optional(),
      }),
    )
    .output(
      externalDataSourceSchema.extend({ connectionTest: connectionTestSchema }),
    ),

  remove: oc
    .route({ method: "POST", path: "/integration/remove" })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.void()),

  test: oc
    .route({ method: "POST", path: "/integration/test" })
    .input(typeWithConfig)
    .output(
      z.object({
        ok: z.boolean(),
        error: z.string().optional(),
      }),
    ),
};
