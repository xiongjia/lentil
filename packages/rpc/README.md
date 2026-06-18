# @lentil/rpc

Shared [oRPC](https://orpc.unnoq.com) contracts for the lentil monorepo.

## Tech Stack

- **RPC**: oRPC 1.x with `@orpc/contract`
- **Validation**: Zod 4.x with `@orpc/zod`

## Structure

```
src/
├── index.ts      # contract barrel export
└── general.ts    # general-purpose routes (health, hello)
```

## Contracts

### `generalContract`

| Route | Method | Path              | Output                         |
| ----- | ------ | ----------------- | ------------------------------ |
| health | POST  | /general/health   | `{ status: string }`           |
| hello  | POST  | /general/hello    | `{ message: string }`          |

## Usage

```ts
import { contract } from "@lentil/rpc";
import type { Contract } from "@lentil/rpc";
```

## Commands

```sh
pnpm build    # Compile TypeScript to dist/ (CJS + ESM + DTS)
pnpm dev      # Watch mode — rebuild on change
```
