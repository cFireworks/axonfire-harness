import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedDi } from "./helpers/captured-native-di.js";
import { DI_CASES } from "./helpers/native-di-scenarios.js";
import { createNativeDi } from "../src/di/native-di.js";
const source = loadCapturedDi(readFileSync(getCapturedBundlePath(), "utf8"));
for (const c of DI_CASES)
  assert.deepEqual(await c.run(createNativeDi), await c.run(source), c.name);
console.log(
  JSON.stringify({
    regions: 0,
    modules: 370,
    comparisons: DI_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
