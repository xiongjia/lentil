import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "@lentil/rpc";

/**
 * Callable RPC client shape — mirror of @lentil/rpc contract procedures.
 * When adding/removing a procedure in packages/rpc/src/, update this interface
 * so the dashboard gets compile-time type-checking on rpc.* calls.
 */
interface RPCClient {
  general: {
    health(): Promise<{ status: string }>;
    hello(): Promise<{ message: string }>;
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

export const rpc = createORPCClient(link) as unknown as RPCClient;
