import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedBackendNamespace } from "./helpers/captured-backend-namespace.js";
import { BACKEND_NAMESPACE_CASES } from "./helpers/backend-namespace-scenarios.js";
import { createNativeBackendNamespace } from "../src/di/native-backend-namespace.js";
const source = loadCapturedBackendNamespace(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of BACKEND_NAMESPACE_CASES)
  assert.deepEqual(
    await c.run(createNativeBackendNamespace),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 6,
    comparisons: BACKEND_NAMESPACE_CASES.length,
    bundleBootstrapExecuted: false,
    recoveredBackendNamespaceExecuted: true,
    ok: true,
  }),
);
