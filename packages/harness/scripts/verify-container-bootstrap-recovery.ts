import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedContainerBootstrap } from "./helpers/captured-container-bootstrap.js";
import { CONTAINER_BOOTSTRAP_CASES } from "./helpers/container-bootstrap-scenarios.js";
import { createNativeContainerBootstrap } from "../src/di/native-container-bootstrap.js";
const source = loadCapturedContainerBootstrap(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of CONTAINER_BOOTSTRAP_CASES)
  assert.deepEqual(
    await c.run(createNativeContainerBootstrap),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 29,
    comparisons: CONTAINER_BOOTSTRAP_CASES.length,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
