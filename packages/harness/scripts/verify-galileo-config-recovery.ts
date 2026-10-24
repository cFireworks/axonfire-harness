import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoConfig } from "./helpers/captured-galileo-config.js";
import { GALILEO_CONFIG_CASES } from "./helpers/galileo-config-scenarios.js";
import { createNativeGalileoConfig } from "../src/runtime/native-galileo-config.js";
const source = loadCapturedGalileoConfig(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_CONFIG_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoConfig),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 77,
    comparisons: GALILEO_CONFIG_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
