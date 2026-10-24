import { test } from "node:test";
import { GALILEO_TRANSPORT_CASES } from "../scripts/helpers/galileo-transport-scenarios.js";
import { createNativeGalileoTransport } from "../src/runtime/native-galileo-transport.js";
for (const c of GALILEO_TRANSPORT_CASES)
  test(c.name, () => c.run(createNativeGalileoTransport));
