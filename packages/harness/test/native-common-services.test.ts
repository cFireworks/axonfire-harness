import { test } from "node:test";
import { createNativeCommonServices } from "../src/runtime/native-common-services.js";
import { commonServicesScenario } from "../scripts/helpers/common-services-scenarios.js";
test("original common services register through bootstrap, intercept real REST requests and own memory monitoring resources", async () => {
  await commonServicesScenario(createNativeCommonServices);
});
