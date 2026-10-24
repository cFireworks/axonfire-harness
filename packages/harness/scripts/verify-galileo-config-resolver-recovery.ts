import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoConfigResolver } from "./helpers/captured-galileo-config-resolver.js";
import { GALILEO_CONFIG_RESOLVER_CASES } from "./helpers/galileo-config-resolver-scenarios.js";
import { createNativeGalileoConfigResolver } from "../src/runtime/native-galileo-config-resolver.js";
const source = loadCapturedGalileoConfigResolver(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_CONFIG_RESOLVER_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoConfigResolver),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 1,
    comparisons: GALILEO_CONFIG_RESOLVER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
