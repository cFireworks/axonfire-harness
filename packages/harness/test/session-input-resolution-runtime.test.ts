import { test } from "node:test";
import { attachNativeSessionInputResolution } from "../src/sessions/native-session-input-resolution.js";
import { sessionInputResolutionScenarios } from "../scripts/helpers/session-input-resolution-scenarios.js";
for (const [name, run] of sessionInputResolutionScenarios)
  test("native session input resolution: " + name, () =>
    run(attachNativeSessionInputResolution),
  );
