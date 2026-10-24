import { test } from "node:test";
import { GALILEO_LOGGER_CASES } from "../scripts/helpers/galileo-logger-scenarios.js";
import { createNativeGalileoLogger } from "../src/runtime/native-galileo-logger.js";
for (const c of GALILEO_LOGGER_CASES)
  test(c.name, () => c.run(createNativeGalileoLogger));
