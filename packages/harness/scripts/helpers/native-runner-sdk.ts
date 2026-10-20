import assert from "node:assert/strict";
import { Runner } from "@openai/agents-core";
import { jsonrepair } from "jsonrepair";
import { createNativeRunner } from "../../src/runner/native-runner.js";
import { agentRunFactories } from "./agent-run-fixture.js";
import { agentRunSdk, AGENT_RUN_SDK_MODES } from "./agent-run-sdk.js";
export { AGENT_RUN_SDK_MODES };
export function nativeRunnerSdk(
  factory = createNativeRunner,
  mode: (typeof AGENT_RUN_SDK_MODES)[number] = "cold",
  agentFactories = agentRunFactories,
) {
  return agentRunSdk(agentFactories, mode, {
    runnerProvider({ fixture: f, manager, agents, model, product }: any) {
      const modules = {
        ...f.modules,
        28894: { jsonrepair },
        18553: f.originalSdk,
      };
      for (const id of [67330, 3927, 40038]) delete modules[id];
      const n = factory({
        modules,
        env: {},
        Date: f.runtime.Date,
        getModule: f.utilities.getModule,
      });
      f.di.set(n.getModule(67330).ContextCompactSummarizer, {
        compactAndSummarize: async () => {
          throw Error("Unexpected compaction of low-token owned conversation");
        },
      });
      const loop = new n.ToolCallLoopDetectorImpl();
      loop.logger = f.logger;
      const original = new n.RunnerFactoryImpl();
      Object.assign(original, {
        modelProvider: { getModel: () => model },
        sessionManager: manager,
        agentManager: agents,
        productManager: { waitConfiguration: async () => product.raw },
        stateMachine: manager.stateMachine,
        toolCallLoopDetector: loop,
        logger: f.logger,
        telemetryService: {
          reportUserTaskFailedCreditRefund: async () => {
            throw Error("Unexpected loop refund in owned conversation");
          },
        },
      });
      const provider = new n.RunnerProviderImpl();
      provider.runnerFactory = original;
      // Preserve the original provider object and methods. Observe, don't replace its caching policy.
      const get = provider.get.bind(provider);
      provider.get = async () => {
        const r = await get();
        assert.ok(r instanceof Runner);
        assert.equal(provider.runner, r);
        return r;
      };
      return provider;
    },
  });
}
