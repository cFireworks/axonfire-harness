// Real pinned SDK + recovered AgentService/Runner/Read, full native session classes, owned model/files only.
import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { Usage, withTrace, type Model } from "@openai/agents-core";
import { LocalNoopTrace } from "../../src/runtime/local-trace.js";
import { createNativeSessionStack } from "../../src/sessions/native-session-stack.js";
import { sessionStackFixture } from "./session-stack-fixture.js";
import { AgentManager } from "../../src/agents/agent-manager.js";
import { AgentFactory } from "../../src/agents/agent-factory.js";
import { AgentService } from "../../src/agents/agent-service.js";
import { RunnerFactory } from "../../src/runner/runner-factory.js";
import { ProductPromptRenderer } from "../../src/prompts/prompt-renderer.js";
import { loadProductConfiguration } from "../../src/config/product-config.js";
import { McpRegistry } from "../../src/mcp/mcp-registry.js";
import { ToolManager } from "../../src/tools/tool-manager.js";
import { registerCoreFileTools } from "../../src/tools/core-file-tools.js";
import { registerDeferredRuntimeTools } from "../../src/tools/deferred-runtime.js";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

export async function sessionStackSdk(
  factory = createNativeSessionStack,
  cancelled = false,
) {
  return withTrace(new LocalNoopTrace(), () =>
    runSessionStackSdk(factory, cancelled),
  );
}
async function runSessionStackSdk(
  factory: typeof createNativeSessionStack,
  cancelled: boolean,
) {
  const f = await sessionStackFixture(factory),
    additional: any[] = [],
    file = path.join(f.cwd, "owned.txt");
  let agents: AgentManager | undefined;
  const entered = deferred(),
    release = deferred(),
    requests: any[] = [];
  try {
    await io.writeFile(file, "owned real native-store Read 中文😀\n");
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
        if (cancelled) {
          yield { type: "output_text_delta", delta: "owned unfinished 中文😀" };
          await release.promise;
          return;
        }
        const output: any[] =
          turn === 1
            ? [
                {
                  type: "function_call",
                  id: "read-call",
                  callId: "read-call",
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
                        turn === 2
                          ? "native Read done"
                          : "native restored conversation",
                    },
                  ],
                },
              ];
        if (turn > 1)
          yield { type: "output_text_delta", delta: output[0].content[0].text };
        yield {
          type: "response_done",
          response: {
            id: "response-" + turn,
            output,
            usage: { inputTokens: 10, outputTokens: 3, totalTokens: 13 },
          },
        } as any;
      },
    };
    function service(manager: any) {
      // The existing standalone AgentService has this extra name. It delegates to the complete source method;
      // no extra subscription/cache/result consumer is installed, and original class bodies stay unchanged.
      const bound = new Map<PropertyKey, any>();
      const facade = new Proxy(manager, {
        get(target, key) {
          if (key === "ensureRunResultHandler") {
            if (!bound.has(key))
              bound.set(key, (s: any) => target.handleRunResult(s));
            return bound.get(key);
          }
          const value = Reflect.get(target, key, target);
          if (typeof value !== "function") return value;
          if (!bound.has(key)) bound.set(key, value.bind(target));
          return bound.get(key);
        },
      });
      const runner = new RunnerFactory(
        { getModel: () => model },
        facade,
        manager.stateMachine,
        agents!,
        product,
        { check: () => undefined },
        { compactAndSummarize: async () => false },
        undefined,
        { tracingDisabled: true },
      );
      // An owned model provider does not imply a WorkBuddy product account. No synthetic authenticated session.
      return new AgentService(
        {
          initialized: Promise.resolve(),
          current: () => undefined,
          clear() {},
        },
        { get: async () => undefined },
        runner,
        facade,
        manager.stateMachine,
        agents!,
      );
    }
    const s = await f.manager.create({
      id: "sdk-native",
      meta: { ownedModelFixture: true },
      options: { model: "fixture-model" },
    });
    await f.manager.save(s);
    f.manager.setCurrent(s);
    const run = service(f.manager);
    if (cancelled) {
      s.messageId = "cancelled-message";
      s.modelSubject.subscribe((event: any) => {
        if (event.type === "output_text_delta") entered.resolve();
      });
      await run.runDefault("owned cancel", { context: s });
      await entered.promise;
      const result = s.resultSubject.value;
      s.abortController.abort();
      release.resolve();
      await Promise.allSettled([result.completed]);
      await f.drain();
      const partial = s.history.find(
        (x: any) => x.role === "assistant" && x.providerData?.isPartialAborted,
      );
      assert.ok(
        partial,
        "full original DraftStore must persist cancelled text",
      );
      const disk = await io.readFile(f.store.getSessionFilePath(s.id), "utf8");
      assert.match(disk, /owned unfinished 中文😀/);
      assert.equal(f.errors.length, 0);
      return {
        cancelled: true,
        partial: partial.content,
        partialFlag: partial.providerData.isPartialAborted,
        historyTypes: s.history.map((x: any) => x.type),
        hasDiskPartial: disk.includes("owned unfinished 中文😀"),
      };
    }
    await run.runDefault("read owned file", { context: s });
    const first = s.resultSubject.value;
    await first.completed;
    await f.drain();
    assert.equal(first.finalOutput, "native Read done");
    assert.equal(f.errors.length, 0);
    assert.ok(
      s.history.some(
        (x: any) =>
          x.type === "function_call_result" &&
          JSON.stringify(x).includes("owned real native-store Read"),
      ),
    );
    const loaded = await f.store.get(s.id);
    assert.notEqual(loaded, s);
    // A genuinely new original manager/ALS/subscription state against the same owned store, not cached get().
    const cold: any = new f.n.SessionManagerImpl();
    additional.push(cold);
    for (const key of [
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
    ])
      cold[key] = f.manager[key];
    cold.setCurrent(loaded);
    const resumed = service(cold);
    await resumed.runDefault("what was read before restart?", {
      context: loaded,
    });
    const second = loaded.resultSubject.value;
    await second.completed;
    await f.drain();
    assert.equal(second.finalOutput, "native restored conversation");
    assert.ok(
      JSON.stringify(requests.at(-1).input).includes("native Read done"),
    );
    assert.equal(f.errors.length, 0);
    const transcript = await io.readFile(
        f.store.getSessionFilePath(s.id),
        "utf8",
      ),
      records = transcript
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
    assert.equal(records.length, loaded.history.length);
    return {
      cancelled: false,
      outputs: [first.finalOutput, second.finalOutput],
      requests: requests.length,
      historyTypes: loaded.history.map((x: any) => x.type),
      containsRead: transcript.includes("owned real native-store Read"),
      totalTokens: loaded.usage.totalTokens,
      records: records.length,
      subscriptions: [
        f.manager.resultSubscriptions.size,
        cold.resultSubscriptions.size,
      ],
    };
  } finally {
    release.resolve();
    for (const manager of additional) {
      for (const sub of manager.resultSubscriptions.values()) sub.unsubscribe();
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
}
