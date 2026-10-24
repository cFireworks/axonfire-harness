import { test } from "node:test";
import { GALILEO_TRACE_CASES } from "../scripts/helpers/galileo-trace-scenarios.js";
import { createNativeGalileoTrace } from "../src/runtime/native-galileo-trace.js";
for (const c of GALILEO_TRACE_CASES)
  test(c.name, () => c.run(createNativeGalileoTrace));
