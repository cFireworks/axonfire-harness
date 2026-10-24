import { test } from "node:test";
import { attachNativeSessionReplay } from "../src/sessions/native-session-replay.js";
import { sessionReplayScenarios } from "../scripts/helpers/session-replay-scenarios.js";
for (const [name, run] of sessionReplayScenarios)
  test("native session replay: " + name, () => run(attachNativeSessionReplay));
