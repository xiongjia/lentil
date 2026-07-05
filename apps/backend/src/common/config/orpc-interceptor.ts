import type { ORPCModuleConfig } from "@orpc/nest";
import { ORPCError } from "@orpc/server";
import type pino from "pino";

/**
 * Procedure-level interceptor for oRPC error logging.
 *
 * Runs inside the oRPC procedure pipeline, before `StandardHandler` catches
 * errors and encodes them as HTTP responses. This gives access to `path` and
 * `input` for structured logging.
 *
 * - Input validation errors (ORPCError with BAD_REQUEST + Zod issues)
 *   → logged at `warn` with path and issues
 * - Output validation errors (ORPCError with INTERNAL_SERVER_ERROR + Zod issues)
 *   → logged at `error` with path and issues
 * - Other ORPCError codes → logged at `warn`
 * - Non-ORPCError exceptions → logged at `error` as unexpected
 *
 * The error is re-thrown so `StandardHandler` can encode it as an HTTP response.
 */
export const createLoggingInterceptor = (
  logger: pino.Logger,
): NonNullable<ORPCModuleConfig["interceptors"]>[number] => {
  return async (options) => {
    try {
      return await options.next();
    } catch (err: unknown) {
      const path = options.path?.join(".") ?? "unknown";

      if (err instanceof ORPCError) {
        const cause = err.cause as Record<string, unknown> | undefined;
        const hasValidationIssues =
          typeof cause?.issues === "object" && cause.issues !== null;

        if (err.code === "BAD_REQUEST" && hasValidationIssues) {
          logger.warn(
            {
              path,
              code: "BAD_REQUEST",
              issues: cause!.issues,
              input: options.input,
            },
            "RPC input validation failed",
          );
        } else if (
          err.code === "INTERNAL_SERVER_ERROR" &&
          hasValidationIssues
        ) {
          logger.error(
            {
              path,
              code: "INTERNAL_SERVER_ERROR",
              issues: cause!.issues,
            },
            "RPC output validation failed — service returned unexpected shape",
          );
        } else {
          logger.warn(
            { path, code: err.code, status: err.status },
            "RPC error: %s",
            err.message,
          );
        }
      } else {
        logger.error({ path, error: String(err) }, "RPC unexpected error");
      }

      throw err;
    }
  };
};
