import { test } from "node:test";
import { OTEL_ENVIRONMENT_CASES } from "../scripts/helpers/otel-environment-scenarios.js";
import { createNativeOtelEnvironment } from "../src/runtime/native-otel-environment.js";
for (const c of OTEL_ENVIRONMENT_CASES)
  test(c.name, () => c.run(createNativeOtelEnvironment));
