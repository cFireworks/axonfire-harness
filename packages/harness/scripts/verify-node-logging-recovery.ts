import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedNodeLogging } from "./helpers/captured-node-logging.js";
import { createNativeNodeLogging } from "../src/runtime/native-node-logging.js";
import { nodeLoggingScenario } from "./helpers/node-logging-scenarios.js";
const source = loadCapturedNodeLogging(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await nodeLoggingScenario(createNativeNodeLogging),
  await nodeLoggingScenario(source),
);
console.log(
  JSON.stringify({
    modules: 333,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
