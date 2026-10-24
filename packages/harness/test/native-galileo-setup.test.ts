import { test } from "node:test";
import { GALILEO_SETUP_CASES } from "../scripts/helpers/galileo-setup-scenarios.js";
import { createNativeGalileoSetup } from "../src/runtime/native-galileo-setup.js";
for (const c of GALILEO_SETUP_CASES)
  test(c.name, () => c.run(createNativeGalileoSetup));
