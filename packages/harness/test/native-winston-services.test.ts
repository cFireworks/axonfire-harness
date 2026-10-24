import { test } from "node:test";
import { createNativeWinstonServices } from "../src/runtime/native-winston-services.js";
import { winstonServicesScenario } from "../scripts/helpers/winston-services-scenarios.js";
test("original Winston registration preserves first-instance behavior and writes through a real injected shared transport", async () => {
  await winstonServicesScenario(createNativeWinstonServices);
});
