import { test } from "node:test";
import { createNativeFilesystemServices } from "../src/runtime/native-filesystem-services.js";
import { filesystemServicesScenario } from "../scripts/helpers/filesystem-services-scenarios.js";
test("original filesystem stages bind isolated memfs then real fs and provide workspace, systemInfo and storage events", async () => {
  await filesystemServicesScenario(createNativeFilesystemServices);
});
