import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoService } from "./helpers/captured-galileo-service.js";
import { GALILEO_SERVICE_CASES } from "./helpers/galileo-service-scenarios.js";
import { createNativeGalileoService } from "../src/runtime/native-galileo-service.js";
const source = loadCapturedGalileoService(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_SERVICE_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoService),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 4,
    comparisons: GALILEO_SERVICE_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
