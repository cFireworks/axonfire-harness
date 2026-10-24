import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoLogger } from "./helpers/captured-galileo-logger.js";
import { GALILEO_LOGGER_CASES } from "./helpers/galileo-logger-scenarios.js";
import { createNativeGalileoLogger } from "../src/runtime/native-galileo-logger.js";
const source = loadCapturedGalileoLogger(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_LOGGER_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoLogger),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 6,
    modules: 0,
    comparisons: GALILEO_LOGGER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
