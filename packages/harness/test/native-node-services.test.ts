import { test } from "node:test";
import { createNativeNodeServices } from "../src/runtime/native-node-services.js";
import { nodeServicesScenario } from "../scripts/helpers/node-services-scenarios.js";
test("original Node services register paths and uploads, resolve proxies, call PAC RPC, parse multipart and send real COS SDK request", async () => {
  await nodeServicesScenario(createNativeNodeServices);
});
