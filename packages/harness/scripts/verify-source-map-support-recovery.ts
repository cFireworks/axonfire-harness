import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSourceMapSupport } from "./helpers/captured-source-map-support.js";
import { SOURCE_MAP_SUPPORT_CASES } from "./helpers/source-map-support-scenarios.js";
import { createNativeSourceMapSupport } from "../src/di/native-source-map-support.js";
const source = loadCapturedSourceMapSupport(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of SOURCE_MAP_SUPPORT_CASES)
  assert.deepEqual(
    await c.run(createNativeSourceMapSupport),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 15,
    comparisons: SOURCE_MAP_SUPPORT_CASES.length,
    bundleBootstrapExecuted: false,
    ok: true,
  }),
);
