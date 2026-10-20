import * as sdk from "@openai/agents-core";
import { jsonrepair } from "jsonrepair";
import { createNativeRunner } from "../../src/runner/native-runner.js";
import { agentRunFixture } from "./agent-run-fixture.js";

export async function nativeRunnerFixture(
  factory = createNativeRunner,
  patch: any = {},
) {
  const f = await agentRunFixture(undefined, patch),
    scheduled = f.scheduled,
    calls: any[] = [],
    configs: any[] = [],
    modules = { ...f.modules };
  for (const id of [67330, 40038, 3927]) delete modules[id];
  class RunnerProbe {
    constructor(public config: any) {
      configs.push(config);
    }
  }
  modules[28894] = { jsonrepair: patch.jsonrepair ?? jsonrepair };
  modules[18553] = patch.realSdk
    ? f.originalSdk
    : { ...f.originalSdk, Runner: RunnerProbe };
  const compactor = {
    compactAndSummarize: async (s: any, options: any) => {
      calls.push(["compact", s.id, options]);
      await patch.compact?.();
      return true;
    },
  };
  const assembled = f.runHost.createRunner({
    runtime: {
      modules,
      getModule: f.utilities.getModule,
      env: f.env,
      Date: f.runtime.Date,
    },
    sourceFactory: factory,
    modelProvider: { getModel: () => patch.model },
    sessionManager: f.manager,
    agentManager: f.agentManager,
    productManager: {
      waitConfiguration: async () => ({
        tokenUsageThresholds: {
          inputTokens: { emergency: 0.92, subAgentEmergency: 0.75 },
        },
        ...patch.product,
      }),
    },
    stateMachine: {
      transition: (s: any, event: any) => {
        calls.push(["state", s.id, event]);
        patch.transition?.(s, event);
      },
    },
    logger: f.logger,
    telemetryService: {
      reportUserTaskFailedCreditRefund: async (s: any, reason: string) => {
        calls.push(["refund", s.id, reason]);
        await patch.refund?.();
      },
    },
  });
  const n = assembled.native,
    runnerFactory = assembled.factory,
    provider = assembled.provider,
    loop = assembled.loop;
  f.di.set(n.getModule(67330).ContextCompactSummarizer, compactor);
  f.models.maxInputTokens = 1000;
  f.s.history.push(
    { id: "owned-question", type: "message", role: "user", content: "owned" },
    {
      id: "owned-answer",
      type: "message",
      role: "assistant",
      content: [{ type: "output_text", text: "owned answer" }],
      providerData: {
        usage: { inputTokens: 950, outputTokens: 10, totalTokens: 960 },
      },
    },
  );
  f.s.resultSubject.next({ lastAgent: f.agent });
  const activate = () => f.manager.setCurrent(f.s);
  const inputFilter = async (data: any) => {
    await runnerFactory.create({ ignored: true });
    return configs.at(-1).callModelInputFilter({ modelData: data });
  };
  return {
    ...f,
    get errors() {
      return f.errors;
    },
    n,
    runnerFactory,
    provider,
    loop,
    compactor,
    scheduled,
    calls,
    configs,
    activate,
    inputFilter,
  };
}
