import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedBackendApplication } from "./helpers/captured-backend-application.js";
import { BACKEND_APPLICATION_CASES } from "./helpers/backend-application-scenarios.js";
import { createNativeBackendApplication } from "../src/runtime/native-backend-application.js";
const source = loadCapturedBackendApplication(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of BACKEND_APPLICATION_CASES)
  assert.deepEqual(
    await c.run(createNativeBackendApplication),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 2,
    comparisons: BACKEND_APPLICATION_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
