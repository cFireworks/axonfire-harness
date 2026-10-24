import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedModuleRuntime } from "./helpers/captured-module-runtime.js";
import { MODULE_RUNTIME_CASES } from "./helpers/module-runtime-scenarios.js";
import { installNativeModuleRuntime } from "../src/di/native-module-runtime.js";
const source = loadCapturedModuleRuntime(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of MODULE_RUNTIME_CASES)
  assert.deepEqual(
    await c.run(installNativeModuleRuntime),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 1,
    modules: 0,
    comparisons: MODULE_RUNTIME_CASES.length,
    bundleBootstrapExecuted: false,
    ok: true,
  }),
);
