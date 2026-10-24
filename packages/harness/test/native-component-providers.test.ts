import test from "node:test";
import { COMPONENT_PROVIDER_CASES } from "../scripts/helpers/component-provider-scenarios.js";
import { createNativeComponentProviders } from "../src/di/native-component-providers.js";
for (const scenario of COMPONENT_PROVIDER_CASES)
  test(scenario.name, () => scenario.run(createNativeComponentProviders));
