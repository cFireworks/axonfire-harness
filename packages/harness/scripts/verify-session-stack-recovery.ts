import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSessionStack } from "./helpers/captured-session-stack.js";
import { SESSION_STACK_CASES } from "./helpers/session-stack-scenarios.js";
import { createNativeSessionStack } from "../src/sessions/native-session-stack.js";
import { sessionStackSdk } from "./helpers/session-stack-sdk.js";
const original = loadCapturedSessionStack(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of SESSION_STACK_CASES)
  assert.deepEqual(
    await scenario.run(createNativeSessionStack),
    await scenario.run(original.factory),
    scenario.name,
  );
for (const cancelled of [false, true])
  assert.deepEqual(
    await sessionStackSdk(createNativeSessionStack, cancelled),
    await sessionStackSdk(original.factory, cancelled),
    "real SDK/full original session stack pair cancelled=" + cancelled,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: SESSION_STACK_CASES.length,
    realSdkPairs: 2,
    bootstrapExecuted: false,
    ok: true,
  }),
);
