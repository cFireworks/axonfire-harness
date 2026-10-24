import { test } from "node:test";
import { GALILEO_EXPORTERS_CASES } from "../scripts/helpers/galileo-exporters-scenarios.js";
import { createNativeGalileoExporters } from "../src/runtime/native-galileo-exporters.js";
for (const c of GALILEO_EXPORTERS_CASES)
  test(c.name, () => c.run(createNativeGalileoExporters));
