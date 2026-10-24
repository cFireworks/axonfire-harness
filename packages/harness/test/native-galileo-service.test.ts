import { test } from "node:test";
import { GALILEO_SERVICE_CASES } from "../scripts/helpers/galileo-service-scenarios.js";
import { createNativeGalileoService } from "../src/runtime/native-galileo-service.js";
for (const c of GALILEO_SERVICE_CASES)
  test(c.name, () => c.run(createNativeGalileoService));
