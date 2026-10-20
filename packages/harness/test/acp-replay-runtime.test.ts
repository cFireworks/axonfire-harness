import test from "node:test";
import { ACP_REPLAY_CASES } from "../scripts/helpers/acp-replay-scenarios.js";
for (const scenario of ACP_REPLAY_CASES)
  test(scenario.name, async () => {
    await scenario.run();
  });
