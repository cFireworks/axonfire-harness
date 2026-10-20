import test from "node:test";
import { NATIVE_RUNNER_CASES } from "../scripts/helpers/native-runner-scenarios.js";
import {
  nativeRunnerSdk,
  AGENT_RUN_SDK_MODES,
} from "../scripts/helpers/native-runner-sdk.js";
for (const scenario of NATIVE_RUNNER_CASES)
  test(scenario.name, () => scenario.run());
for (const mode of AGENT_RUN_SDK_MODES)
  test(
    "full native RunnerFactory/Provider/loop + AgentService/sessions + actual SDK: " +
      mode,
    { timeout: 20000 },
    async () => {
      await nativeRunnerSdk(undefined, mode);
    },
  );
