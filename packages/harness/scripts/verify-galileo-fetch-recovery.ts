import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoFetch } from "./helpers/captured-galileo-fetch.js";
import { GALILEO_FETCH_CASES } from "./helpers/galileo-fetch-scenarios.js";
import { createNativeGalileoFetch } from "../src/runtime/native-galileo-fetch.js";
const source = loadCapturedGalileoFetch(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_FETCH_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoFetch),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 88,
    comparisons: GALILEO_FETCH_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
