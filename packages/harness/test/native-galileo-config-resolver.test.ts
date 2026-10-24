import { test } from "node:test";
import { GALILEO_CONFIG_RESOLVER_CASES } from "../scripts/helpers/galileo-config-resolver-scenarios.js";
import { createNativeGalileoConfigResolver } from "../src/runtime/native-galileo-config-resolver.js";
for (const c of GALILEO_CONFIG_RESOLVER_CASES)
  test(c.name, () => {
    c.run(createNativeGalileoConfigResolver);
  });
