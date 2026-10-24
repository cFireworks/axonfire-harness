import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoTransport } from "./helpers/captured-galileo-transport.js";
import { GALILEO_TRANSPORT_CASES } from "./helpers/galileo-transport-scenarios.js";
import {
  createNativeGalileoTransport,
  GALILEO_TRANSPORT_REGIONS,
} from "../src/runtime/native-galileo-transport.js";
const source = loadCapturedGalileoTransport(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_TRANSPORT_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoTransport),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: GALILEO_TRANSPORT_REGIONS.length,
    comparisons: GALILEO_TRANSPORT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
