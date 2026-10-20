import test from "node:test";
import { createNativeSessionStack } from "../src/sessions/native-session-stack.js";
import { SESSION_STACK_CASES } from "../scripts/helpers/session-stack-scenarios.js";
import { sessionStackSdk } from "../scripts/helpers/session-stack-sdk.js";
for (const scenario of SESSION_STACK_CASES)
  test(scenario.name, () => scenario.run(createNativeSessionStack));
test(
  "full native Manager/Store with real SDK Read and cold source-manager restore",
  { timeout: 20000 },
  async () => {
    await sessionStackSdk();
  },
);
test(
  "full native Manager/Store and original DraftStore persist actual cancelled SDK text",
  { timeout: 20000 },
  async () => {
    await sessionStackSdk(undefined, true);
  },
);
