import { test } from "node:test";
import { attachNativeSessionBackendEvents } from "../src/sessions/native-session-backend-events.js";
import { sessionBackendEventsScenarios } from "../scripts/helpers/session-backend-events-scenarios.js";
for (const [name, run] of sessionBackendEventsScenarios)
  test("native session backend events: " + name, () =>
    run(attachNativeSessionBackendEvents),
  );
