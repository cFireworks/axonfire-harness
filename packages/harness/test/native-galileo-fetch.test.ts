import { test } from "node:test";
import { GALILEO_FETCH_CASES } from "../scripts/helpers/galileo-fetch-scenarios.js";
import { createNativeGalileoFetch } from "../src/runtime/native-galileo-fetch.js";
for (const c of GALILEO_FETCH_CASES)
  test(c.name, () => c.run(createNativeGalileoFetch));
