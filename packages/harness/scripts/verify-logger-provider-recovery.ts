import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedLoggerProvider } from "./helpers/captured-logger-provider.js";
import { LOGGER_PROVIDER_CASES } from "./helpers/logger-provider-scenarios.js";
import { createNativeLoggerProvider } from "../src/runtime/native-logger-provider.js";
const source = loadCapturedLoggerProvider(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of LOGGER_PROVIDER_CASES)
  assert.deepEqual(
    await c.run(createNativeLoggerProvider),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 6,
    modules: 14,
    comparisons: LOGGER_PROVIDER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
