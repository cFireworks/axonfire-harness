import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoSetup } from "./helpers/captured-galileo-setup.js";
import { GALILEO_SETUP_CASES } from "./helpers/galileo-setup-scenarios.js";
import { createNativeGalileoSetup } from "../src/runtime/native-galileo-setup.js";
const source = loadCapturedGalileoSetup(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_SETUP_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoSetup),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 11,
    modules: 1,
    comparisons: GALILEO_SETUP_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
