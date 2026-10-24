import { test } from "node:test";
import { createNativeSessionReplayTransport } from "../src/sessions/native-session-replay-transport.js";
import { sessionReplayTransportScenarios } from "../scripts/helpers/session-replay-transport-scenarios.js";
for (const [name, run] of sessionReplayTransportScenarios)
  test("native replay transport: " + name, () =>
    run(createNativeSessionReplayTransport),
  );
