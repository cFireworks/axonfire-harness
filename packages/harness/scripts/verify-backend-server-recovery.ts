import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedBackendServer } from "./helpers/captured-backend-server.js";
import { BACKEND_SERVER_CASES } from "./helpers/backend-server-scenarios.js";
import { createNativeBackendServer } from "../src/http/native-backend-server.js";
const source = loadCapturedBackendServer(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of BACKEND_SERVER_CASES)
  assert.deepEqual(
    await c.run(createNativeBackendServer),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 2,
    comparisons: BACKEND_SERVER_CASES.length,
    bundleBootstrapExecuted: false,
    recoveredBackendServerExecuted: true,
    ok: true,
  }),
);
