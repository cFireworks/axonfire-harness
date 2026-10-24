import { test } from "node:test";
import { BASIC_TRACER_CASES } from "../scripts/helpers/basic-tracer-scenarios.js";
import { createNativeBasicTracer } from "../src/runtime/native-basic-tracer.js";
for (const c of BASIC_TRACER_CASES)
  test(c.name, () => c.run(createNativeBasicTracer));
