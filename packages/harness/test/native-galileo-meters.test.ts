import { test } from "node:test";
import { GALILEO_METERS_CASES } from "../scripts/helpers/galileo-meters-scenarios.js";
import { createNativeGalileoMeters } from "../src/runtime/native-galileo-meters.js";
for (const c of GALILEO_METERS_CASES)
  test(c.name, () => c.run(createNativeGalileoMeters));
