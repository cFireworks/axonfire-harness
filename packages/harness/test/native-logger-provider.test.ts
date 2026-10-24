import { test } from "node:test";
import { LOGGER_PROVIDER_CASES } from "../scripts/helpers/logger-provider-scenarios.js";
import { createNativeLoggerProvider } from "../src/runtime/native-logger-provider.js";
for (const c of LOGGER_PROVIDER_CASES)
  test(c.name, () => c.run(createNativeLoggerProvider));
