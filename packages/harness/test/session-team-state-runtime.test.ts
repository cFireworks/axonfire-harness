import { test } from "node:test";
import { attachNativeSessionTeamState } from "../src/sessions/native-session-team-state.js";
import { sessionTeamStateScenarios } from "../scripts/helpers/session-team-state-scenarios.js";
for (const [name, run] of sessionTeamStateScenarios)
  test("native session team state: " + name, () =>
    run(attachNativeSessionTeamState),
  );
