import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "@lentil/rpc";
import type {
  ConnectionTest,
  CreateDatasourceInput,
  ExternalDataSource,
  SaveDatasourceResult,
  ScrapeCache,
  ScrapeExecuteInput,
  UpdateDatasourceInput,
} from "@lentil/rpc";

export type { ExternalDataSource, ScrapeCache } from "@lentil/rpc";

/**
 * Typed RPC client shape — mirrors the procedures defined in
 * {@link contract} from `@lentil/rpc`.
 *
 * Each contract procedure becomes a callable method.  When adding or removing
 * a procedure in `packages/rpc/src/`, update this interface so the dashboard
 * gets compile-time type-checking on `rpc.*` calls.
 */
interface RPCClient {
  general: {
    health(): Promise<{ status: string }>;
  };
  integration: {
    list(): Promise<ExternalDataSource[]>;
    get(input: { id: string }): Promise<ExternalDataSource>;
    create(input: CreateDatasourceInput): Promise<SaveDatasourceResult>;
    update(input: UpdateDatasourceInput): Promise<SaveDatasourceResult>;
    remove(input: { id: string }): Promise<void>;
    test(input: {
      type: string;
      config: Record<string, unknown>;
    }): Promise<ConnectionTest>;
  };
  scrape: {
    execute(input: ScrapeExecuteInput): Promise<ScrapeCache>;
    list(): Promise<ScrapeCache[]>;
    get(input: { id: string }): Promise<ScrapeCache>;
    remove(input: { id: string }): Promise<void>;
  };
}

/** Total request timeout in ms (browser fetch does not expose per-phase timing). */
const RPC_TIMEOUT_MS = 30_000;

// In dev (Vite), backend runs on 3990. In prod (served by backend), relative path works.
const rpcUrl = import.meta.env.DEV ? "http://localhost:3990/rpc" : "/rpc";

const link = new OpenAPILink(contract, {
  url: rpcUrl,
  fetch(request, init, options) {
    const timeoutSignal = AbortSignal.timeout(RPC_TIMEOUT_MS);
    const signal = options.signal
      ? AbortSignal.any([timeoutSignal, options.signal])
      : timeoutSignal;

    return fetch(request, { ...init, signal });
  },
});

/** Typed RPC client — call signatures are validated by {@link RPCClient}. */
export const rpc: RPCClient = createORPCClient(link) as unknown as RPCClient;
