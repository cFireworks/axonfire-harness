import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { createNativeRunner } from "../src/runner/native-runner.js";
import { loadCapturedNativeRunner } from "./helpers/captured-native-runner.js";
import { loadCapturedAgentRun } from "./helpers/captured-agent-run.js";
import { NATIVE_RUNNER_CASES } from "./helpers/native-runner-scenarios.js";
import {
  nativeRunnerSdk,
  AGENT_RUN_SDK_MODES,
} from "./helpers/native-runner-sdk.js";
const source = readFileSync(getCapturedBundlePath(), "utf8"),
  original = loadCapturedNativeRunner(source),
  agentOriginal = loadCapturedAgentRun(source);
for (const scenario of NATIVE_RUNNER_CASES)
  assert.deepEqual(
    await scenario.run(createNativeRunner),
    await scenario.run(original.factory),
    scenario.name,
  );
for (const mode of AGENT_RUN_SDK_MODES)
  assert.deepEqual(
    await nativeRunnerSdk(createNativeRunner, mode),
    await nativeRunnerSdk(original.factory, mode, agentOriginal),
    "full original Runner + AgentService SDK pair " + mode,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: NATIVE_RUNNER_CASES.length,
    realSdkPairs: AGENT_RUN_SDK_MODES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
