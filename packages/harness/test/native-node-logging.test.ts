import { test } from "node:test";
import { createNativeNodeLogging } from "../src/runtime/native-node-logging.js";
import { nodeLoggingScenario } from "../scripts/helpers/node-logging-scenarios.js";
test("original Node logging registration writes files and archives with FileLogger and disabled upload", async () => {
  await nodeLoggingScenario(createNativeNodeLogging);
});
