import { test } from "node:test";
import { attachNativeSessionLoading } from "../src/sessions/native-session-loading.js";
import { sessionLoadingScenarios } from "../scripts/helpers/session-loading-scenarios.js";
for (const [name, run] of sessionLoadingScenarios)
  test("native session loading: " + name, () =>
    run(attachNativeSessionLoading),
  );
