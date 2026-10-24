import { test } from "node:test";
import { attachNativeSessionReclaim } from "../src/sessions/native-session-reclaim.js";
import { sessionReclaimScenarios } from "../scripts/helpers/session-reclaim-scenarios.js";
for (const [name, run] of sessionReclaimScenarios)
  test("native session reclaim: " + name, () =>
    run(attachNativeSessionReclaim),
  );
