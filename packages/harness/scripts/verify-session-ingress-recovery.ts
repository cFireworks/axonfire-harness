import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSessionIngress } from "./helpers/captured-session-ingress.js";
import { SESSION_INGRESS_CASES } from "./helpers/session-ingress-scenarios.js";
import { createNativeSessionIngress } from "../src/sessions/native-session-ingress.js";
const original = loadCapturedSessionIngress(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of SESSION_INGRESS_CASES)
  assert.deepEqual(
    await scenario.run(createNativeSessionIngress),
    await scenario.run(original.factory),
    scenario.name,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: SESSION_INGRESS_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
