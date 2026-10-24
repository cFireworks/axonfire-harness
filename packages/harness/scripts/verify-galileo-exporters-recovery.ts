import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoExporters } from "./helpers/captured-galileo-exporters.js";
import { GALILEO_EXPORTERS_CASES } from "./helpers/galileo-exporters-scenarios.js";
import { createNativeGalileoExporters } from "../src/runtime/native-galileo-exporters.js";
const source = loadCapturedGalileoExporters(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_EXPORTERS_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoExporters),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 4,
    modules: 2,
    comparisons: GALILEO_EXPORTERS_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
