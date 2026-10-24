import { test } from "node:test";
import { createNativeEventServices } from "../src/runtime/native-event-services.js";
import { eventServicesScenario } from "../scripts/helpers/event-services-scenarios.js";
test("original event registration sends real HTTP batches with processors, header grouping and telemetry disable semantics", async () => {
  await eventServicesScenario(createNativeEventServices);
});
