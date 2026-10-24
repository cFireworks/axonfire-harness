import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedFilesystemServices } from "./helpers/captured-filesystem-services.js";
import { createNativeFilesystemServices } from "../src/runtime/native-filesystem-services.js";
import { filesystemServicesScenario } from "./helpers/filesystem-services-scenarios.js";
const source = loadCapturedFilesystemServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await filesystemServicesScenario(createNativeFilesystemServices),
  await filesystemServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 118,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
