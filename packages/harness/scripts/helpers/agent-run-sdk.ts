// Full original AgentService/interceptors/utility factories with full native sessions and real pinned SDK.
// Only owned model/files; external memory/context/telemetry integrations remain explicitly test-boundary adapters.
import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { Runner, Usage, withTrace, type Model } from "@openai/agents-core";
import { LocalNoopTrace } from "../../src/runtime/local-trace.js";
import { agentRunFixture, agentRunFactories } from "./agent-run-fixture.js";
import { loadProductConfiguration } from "../../src/config/product-config.js";
import { ProductPromptRenderer } from "../../src/prompts/prompt-renderer.js";
import { AgentManager } from "../../src/agents/agent-manager.js";
import { AgentFactory } from "../../src/agents/agent-factory.js";
import { McpRegistry } from "../../src/mcp/mcp-registry.js";
import { ToolManager } from "../../src/tools/tool-manager.js";
import { registerCoreFileTools } from "../../src/tools/core-file-tools.js";
import { registerDeferredRuntimeTools } from "../../src/tools/deferred-runtime.js";
import { MemoryScope } from "../../src/memory/memory-rule-constants.js";
const keys = [
  "sessionFactory",
  "sessionStore",
  "logger",
  "stateMachine",
  "userStateManager",
  "progressSyncService",
  "cronSchedulerService",
  "agentTaskManager",
  "interruptionService",
  "agentInputItemProcessorProvider",
  "sessionHookManager",
  "interceptors",
  "telemetryService",
  "galileoSessionBridge",
];
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
export const AGENT_RUN_SDK_MODES = [
  "cold",
  "state",
  "cancel",
  "one-time",
] as const;
export function agentRunSdk(
  factories = agentRunFactories,
  mode: (typeof AGENT_RUN_SDK_MODES)[number] = "cold",
  options: { runnerProvider?: (context: any) => any } = {},
) {
  return withTrace(new LocalNoopTrace(), async () => {
    const f = await agentRunFixture(factories, { emptyMeta: true }),
      additional: any[] = [],
      requests: any[] = [];
    const entered = deferred(),
      release = deferred();
    let agents: AgentManager | undefined;
    try {
      const file = path.join(f.cwd, "owned.txt"),
        rulesFile = path.join(f.cwd, "CODEBUDDY.md");
      await io.writeFile(file, "owned original AgentService Read 中文😀\n");
      await io.writeFile(rulesFile, "owned source rules 中文😀");
      const product = await loadProductConfiguration(),
        prompts = new ProductPromptRenderer(product),
        mcp = new McpRegistry(),
        tools = new ToolManager(product, prompts);
      registerCoreFileTools(tools, { workDir: f.cwd });
      registerDeferredRuntimeTools(tools, mcp, { cwd: f.cwd });
      agents = new AgentManager(
        product,
        prompts,
        tools,
        mcp,
        new AgentFactory(f.manager.stateMachine),
      );
      await agents.start();
      let turn = 0;
      const model: Model = {
        getResponse: async () => ({ output: [], usage: new Usage() }),
        async *getStreamedResponse(request) {
          requests.push(request);
          ++turn;
          yield { type: "response_started" };
          if (mode === "cancel") {
            yield {
              type: "output_text_delta",
              delta: "original cancelled partial 中文😀",
            };
            await release.promise;
            return;
          }
          const output: any[] =
            mode !== "one-time" && turn === 1
              ? [
                  {
                    type: "function_call",
                    id: "owned-read",
                    callId: "owned-read",
                    name: "Read",
                    arguments: JSON.stringify({ file_path: file }),
                    status: "completed",
                  },
                ]
              : [
                  {
                    type: "message",
                    id: "answer-" + turn,
                    role: "assistant",
                    status: "completed",
                    content: [
                      {
                        type: "output_text",
                        text:
                          mode === "one-time"
                            ? "original one-time"
                            : turn === 2
                              ? "original Read done"
                              : "original continued",
                      },
                    ],
                  },
                ];
          if (output[0].type === "message")
            yield {
              type: "output_text_delta",
              delta: output[0].content[0].text,
            };
          yield {
            type: "response_done",
            response: {
              id: "response-" + turn,
              output,
              usage: { inputTokens: 11, outputTokens: 3, totalTokens: 14 },
            },
          } as any;
        },
      };
      const runner = new Runner({
        modelProvider: { getModel: () => model },
        tracingDisabled: true,
      });
      function bind(manager: any) {
        const service: any = new f.n.AgentServiceImpl();
        const chain = [
          "UserInputAgentRunInterceptor",
          "MessageQueueAgentRunInterceptor",
          "SkipRunAgentRunInterceptor",
          "ProviderDataAgentRunInterceptor",
          "HistoryAgentRunInterceptor",
          "SystemReminderAgentRunInterceptor",
          "MessageReorganizeAgentRunInterceptor",
          "UserQueryWrapperAgentRunInterceptor",
          "ContinueAgentRunInterceptor",
          "StateAgentRunInterceptor",
          "ModelConfigAgentRunInterceptor",
          "ImageFilterAgentRunInterceptor",
          "ImageRehydrationAgentRunInterceptor",
          "TelemetryAgentRunInterceptor",
          "EnvAgentRunInterceptor",
        ]
          .map((name) => {
            const instance = f.interceptor(name);
            Object.assign(instance, {
              sessionManager: manager,
              agentManager: agents,
              productManager: { waitConfiguration: async () => product.raw },
              memoryManager: {
                get: async (query: any) =>
                  query.scope === MemoryScope.PROJECT
                    ? [
                        {
                          filePath: rulesFile,
                          content: await io.readFile(rulesFile, "utf8"),
                        },
                      ]
                    : [],
              },
              promptManager: {
                get: async (name: string) => product.promptsByName.get(name),
                render: async (template: string, options: any) =>
                  prompts.render(template, options?.variables ?? {}),
              },
              ideService: { selectionChangedSubject: { value: undefined } },
            });
            return instance;
          })
          .sort((a, b) => b.priority - a.priority);
        Object.assign(service, {
          logger: f.logger,
          authenticationManager: { initialized: Promise.resolve() },
          runnerProvider: options.runnerProvider?.({
            fixture: f,
            manager,
            agents,
            model,
            product,
          }) ?? { get: async () => runner },
          sessionManager: manager,
          stateMachine: manager.stateMachine,
          agentManager: agents,
          agentRunInterceptorProvider: { sortSync: () => chain },
          pluginRuntimeRefreshService: {
            waitForRefreshSettled: async () => {},
          },
        });
        return service;
      }
      f.di.set(f.n.getModule(69466).AgentManager, agents);
      const s = f.s;
      assert.equal(s.meta, undefined);
      await f.manager.save(s);
      f.manager.setCurrent(s);
      const service = bind(f.manager);
      if (mode === "one-time") {
        const result = await service.runOneTime("cli", "owned one-time", {
          context: s,
        });
        assert.equal(result, "original one-time");
        assert.equal(s.history.length, 0);
        assert.equal(s.resultSubject.value, undefined);
        assert.equal(s.usage.totalTokens, 14);
        return {
          mode,
          output: result,
          history: s.history.length,
          totalTokens: s.usage.totalTokens,
        };
      }
      if (mode === "cancel")
        s.modelSubject.subscribe((event: any) => {
          if (event.type === "output_text_delta") entered.resolve();
        });
      await service.runDefault("read owned file", { context: s });
      const first = s.resultSubject.value;
      if (mode === "cancel") {
        await entered.promise;
        s.abortController.abort();
        release.resolve();
        await Promise.allSettled([first.completed]);
        await f.drain();
        const partial = s.history.find(
          (item: any) => item.providerData?.isPartialAborted,
        );
        assert.ok(partial);
        assert.match(
          JSON.stringify(partial),
          /original cancelled partial 中文😀/,
        );
        assert.equal(f.errors.length, 0);
        return {
          mode,
          partial: partial.content,
          partialStatus: partial.status,
          partialFlag: partial.providerData.isPartialAborted,
          records: s.history.length,
        };
      }
      await first.completed;
      await f.drain();
      assert.equal(first.finalOutput, "original Read done");
      assert.equal(f.errors.length, 0);
      assert.ok(
        JSON.stringify(requests[0].input).includes("owned source rules 中文😀"),
        "original rules prompt must reach the actual SDK model input",
      );
      assert.ok(
        JSON.stringify(s.history).includes("owned original AgentService Read"),
      );
      assert.ok(s.meta.rootRequestId);
      let nextSession = s,
        nextService = service;
      if (mode === "cold") {
        const cold: any = new f.sessionNative.SessionManagerImpl();
        for (const key of keys) cold[key] = f.manager[key];
        additional.push(cold);
        nextSession = await cold.get(s.id);
        assert.equal(
          nextSession.meta,
          undefined,
          "source cold meta stays absent before the original interceptors",
        );
        assert.notEqual(nextSession, s);
        cold.setCurrent(nextSession);
        nextService = bind(cold);
      }
      await nextService.runDefault("continue owned conversation", {
        context: nextSession,
      });
      const second = nextSession.resultSubject.value;
      await second.completed;
      await f.drain();
      assert.equal(second.finalOutput, "original continued");
      assert.equal(f.errors.length, 0);
      assert.ok(nextSession.meta.rootRequestId);
      assert.ok(
        JSON.stringify(requests.at(-1).input).includes("original Read done"),
      );
      const disk = await io.readFile(f.store.getSessionFilePath(s.id), "utf8");
      assert.match(disk, /original continued/);
      return {
        mode,
        outputs: [first.finalOutput, second.finalOutput],
        requests: requests.length,
        historyTypes: nextSession.history.map((item: any) => item.type),
        metadataCreated: !!nextSession.meta.rootRequestId,
        totalTokens: nextSession.usage.totalTokens,
        diskRead: disk.includes("owned original AgentService Read"),
      };
    } finally {
      release.resolve();
      for (const manager of additional) {
        for (const sub of manager.resultSubscriptions.values())
          sub.unsubscribe();
        manager.resultSubscriptions.clear();
        for (const timer of manager.idleTimers.values())
          f.timers.clearTimeout(timer);
        manager.idleTimers.clear();
        manager.sessionSubject.complete();
        manager.context.disable();
        manager.skipHistoryContext.disable();
      }
      await f.close();
      await agents?.close();
    }
  });
}
