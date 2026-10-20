import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { createNativeHttpRuntime } from "../src/http/native-http-runtime.js";
import { createNativeRunner } from "../src/runner/native-runner.js";
import { loadCapturedNativeHttp } from "./helpers/captured-native-http.js";
import { loadCapturedAgentRun } from "./helpers/captured-agent-run.js";
import { loadCapturedNativeRunner } from "./helpers/captured-native-runner.js";
import { NATIVE_HTTP_CASES } from "./helpers/native-http-scenarios.js";
import {
  nativeHttpSdk,
  NATIVE_HTTP_SDK_MODES,
} from "./helpers/native-http-sdk.js";
import { agentRunFactories } from "./helpers/agent-run-fixture.js";
const source = readFileSync(getCapturedBundlePath(), "utf8"),
  original = loadCapturedNativeHttp(source),
  agent = loadCapturedAgentRun(source),
  runner = loadCapturedNativeRunner(source);
for (const scenario of NATIVE_HTTP_CASES)
  assert.deepEqual(
    await scenario.run(createNativeHttpRuntime),
    await scenario.run(original.factory),
    scenario.name,
  );
for (const mode of NATIVE_HTTP_SDK_MODES)
  assert.deepEqual(
    await nativeHttpSdk(
      createNativeHttpRuntime,
      agentRunFactories,
      createNativeRunner,
      mode,
    ),
    await nativeHttpSdk(original.factory, agent, runner.factory, mode),
    "loopback HTTP/MVC/CLS + ingress + SDK source pair " + mode,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: NATIVE_HTTP_CASES.length,
    realSdkPairs: NATIVE_HTTP_SDK_MODES.length,
    originalBootstrapExecuted: false,
    productionAccountUsed: false,
    ok: true,
  }),
);
