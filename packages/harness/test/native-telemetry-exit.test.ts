import test from "node:test";
import { TELEMETRY_EXIT_CASES } from "../scripts/helpers/telemetry-exit-scenarios.js";
import { createNativeTelemetryExit } from "../src/runtime/native-telemetry-exit.js";
for (const c of TELEMETRY_EXIT_CASES)
  test(c.name, () => c.run(createNativeTelemetryExit));
