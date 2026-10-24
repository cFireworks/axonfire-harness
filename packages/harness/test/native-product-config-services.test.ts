import { test } from "node:test";
import { createNativeProductConfigServices } from "../src/runtime/native-product-config-services.js";
import { productConfigServicesScenario } from "../scripts/helpers/product-config-services-scenarios.js";
test("original product configuration stages bind real providers, merge owned files and env, cache client config and dispose model watchers", async () => {
  await productConfigServicesScenario(createNativeProductConfigServices);
});
