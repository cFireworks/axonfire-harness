#!/usr/bin/env node
// Host boundary for the recovered product entrypoints. Run in its own process.
import { configureNativeStdio } from "./native-stdio.mjs";
import { configureNativeApprovalTimeout } from "./native-approval-policy.mjs";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { prepareNativeProductInput } from "./native-product-input.mjs";
import { homedir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createNativeDi } from "@axonfire/harness/di/native-di.js";
import { createNativeProductRuntime } from "@axonfire/harness/runtime/native-product-runtime.js";

const args = process.argv.slice(2);
const informational =
  args.includes("--help") ||
  args.includes("-h") ||
  args.includes("--version") ||
  args.includes("-V");
try {
  configureNativeStdio(process);
  prepareNativeProductInput(process.env, { informational });

  configureNativeApprovalTimeout(args, process.env);

  // Keep the recovered product's state separate from an installed WorkBuddy.
  process.env.WORKBUDDY_CONFIG_DIR ??= resolve(
    process.env.AXONFIRE_STATE_DIR || join(homedir(), ".axonfire", "native"),
  );
  if (!informational)
    mkdirSync(process.env.WORKBUDDY_CONFIG_DIR, { recursive: true });
  const require = createRequire(import.meta.url);
  const di = createNativeDi({ globals: globalThis, require, process, console });
  if (process.env.AXONFIRE_PORT !== undefined) {
    const port = Number(process.env.AXONFIRE_PORT);
    if (!Number.isInteger(port) || port < 0 || port > 65535)
      throw new Error("AXONFIRE_PORT must be an integer from 0 to 65535");
    di.ConfigUtil.getRaw().cell.server.port = port;
  }
  const assets = process.env.AXONFIRE_NATIVE_ASSETS
    ? resolve(process.env.AXONFIRE_NATIVE_ASSETS)
    : fileURLToPath(new URL("../../packages/harness/dist/native-product/", import.meta.url));
  const filename = join(assets, "dist", "codebuddy.js");
  const runtime = createNativeProductRuntime({
    di,
    globals: globalThis,
    require,
    process,
    console,
    Error,
    fetch: globalThis.fetch,
    filename,
    basePath: dirname(filename),
  });
  runtime.start();
} catch (error) {
  process.stderr.write(
    `Axonfire native: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
