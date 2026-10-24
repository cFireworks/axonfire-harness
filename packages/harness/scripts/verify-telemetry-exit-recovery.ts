import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedTelemetryExit } from "./helpers/captured-telemetry-exit.js";
import { TELEMETRY_EXIT_CASES } from "./helpers/telemetry-exit-scenarios.js";
import { createNativeTelemetryExit } from "../src/runtime/native-telemetry-exit.js";
const source = loadCapturedTelemetryExit(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of TELEMETRY_EXIT_CASES)
  assert.deepEqual(
    await c.run(createNativeTelemetryExit),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    modules: 1,
    comparisons: TELEMETRY_EXIT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
