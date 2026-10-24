import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoMeters } from "./helpers/captured-galileo-meters.js";
import { GALILEO_METERS_CASES } from "./helpers/galileo-meters-scenarios.js";
import { createNativeGalileoMeters } from "../src/runtime/native-galileo-meters.js";
const source = loadCapturedGalileoMeters(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_METERS_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoMeters),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 3,
    modules: 1,
    comparisons: GALILEO_METERS_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
