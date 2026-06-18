import { defineConfig, type Options } from "tsup";

/**
 * Create a tsup build config with sensible defaults for the lentil monorepo.
 *
 * Defaults:
 * - entry: ["src/index.ts"]
 * - format: ["cjs", "esm"]
 * - dts: true
 * - clean: true
 *
 * Pass overrides to customize per-package.
 */
export function createTsupConfig(overrides: Partial<Options> = {}): ReturnType<typeof defineConfig> {
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    ...overrides,
  });
}
