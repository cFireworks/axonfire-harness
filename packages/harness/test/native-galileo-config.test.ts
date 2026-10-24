import { test } from "node:test";
import { GALILEO_CONFIG_CASES } from "../scripts/helpers/galileo-config-scenarios.js";
import { createNativeGalileoConfig } from "../src/runtime/native-galileo-config.js";
for (const c of GALILEO_CONFIG_CASES)
  test(c.name, () => c.run(createNativeGalileoConfig));
