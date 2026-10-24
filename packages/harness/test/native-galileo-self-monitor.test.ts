import { test } from "node:test";
import { GALILEO_SELF_MONITOR_CASES } from "../scripts/helpers/galileo-self-monitor-scenarios.js";
import { createNativeGalileoSelfMonitor } from "../src/runtime/native-galileo-self-monitor.js";
for (const c of GALILEO_SELF_MONITOR_CASES)
  test(c.name, () => c.run(createNativeGalileoSelfMonitor));
