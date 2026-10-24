import assert from "node:assert/strict";
import * as sdk from "@openai/agents-core";
import * as io from "node:fs/promises";
import { agentRunFixture, agentRunFactories } from "./agent-run-fixture.js";
import { PermissionMode as Mode } from "../../src/permissions/permission.js";
type Fixture = Awaited<ReturnType<typeof agentRunFixture>>;
type Factories = typeof agentRunFactories;
type Scenario = { name: string; run(factories: Factories): Promise<any> };
const user = (text = "owned", providerData: any = {}): any => ({
  type: "message",
  role: "user",
  content: text,
  providerData,
});
const scenario = (
  name: string,
  run: (f: Fixture) => Promise<any>,
  patch: any = {},
): Scenario => ({
  name,
  async run(factories) {
    const f = await agentRunFixture(factories, patch);
    try {
      return f.normalize(await run(f));
    } finally {
      await f.close();
    }
  },
});
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const text = (c: any) => JSON.stringify(c.input);
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const sandboxTelemetryCases: Scenario[] = [
  "report-once", "missing-ids", "parent-session", "reporter-throws", "optional-reporter",
].map((mode) => ({
  name: "source SandboxTurnTelemetry shares original lifecycle state: " + mode,
  async run(factories) {
    const f = await agentRunFixture(factories);
    try {
      const reports: any[] = [], warnings: string[] = [], disabledReasons: any[] = [];
      // Explicit component-test sandbox backend. No sandbox process or external
      // telemetry is started; both compared classes remain the complete source.
      const n = factories.factory({
        modules: {
          ...f.modules,
          35151: { ...f.modules[35151], SettingsScope: { USER: "user" } },
          20852: {
            isSafeDeleteRuntimeEnabledInSandboxConfig: () => false,
            getDefaultSandboxAllowWritePath: () => "/owned-workspace",
          },
          39311: {
            getSandboxTurnDisabledReason: () => undefined,
            getSandboxConfigApplicationState: () => undefined,
            setSandboxTurnDisabledReason: (_session: any, reason: any) => disabledReasons.push(reason),
          },
          74674: { SANDBOX_COMMANDS: { ENABLE_MODIFY_BACKUP: "owned-backup" } },
        },
        getModule: f.n.getModule,
        platform: "linux",
      });
      const lifecycle = Object.assign(new n.SandboxAgentRunInterceptor(), {
        logger: f.logger,
        settingsManager: { clearCache() {}, list: async () => ({ sandbox: { enabled: true } }) },
        sandboxTurnConfig: {},
        cwdService: { setCwdState() {}, getCwd: () => "/owned-workspace" },
        processManager: { isRunning: () => true },
        sandboxLifecycle: {
          getClient: () => ({ sendRequest: async () => ({ enabled: false }) }),
          getWorkdir: async () => "/owned-workspace",
        },
      });
      const telemetry = Object.assign(new n.SandboxTurnTelemetryAgentRunInterceptor(), {
        logger: { warn: (message: string) => warnings.push(message) },
        ...(mode === "optional-reporter" ? {} : {
          telemetryReporter: { reportTurnState: (report: any) => {
            reports.push(report);
            if (mode === "reporter-throws") throw Error("owned telemetry failure");
          } },
        }),
      });
      assert.equal(telemetry.priority, 550);
      const c = f.context([user("owned sandbox request")]);
      c.session.meta.rootRequestId = "owned-root";
      c.session.conversationRequestId = "owned-turn";
      // A fresh context has no pending lifecycle result to report.
      await telemetry.intercept(c);
      assert.deepEqual(reports, []);
      await lifecycle.intercept(c);
      assert.deepEqual(disabledReasons, ["unsupported-platform"]);
      if (mode === "missing-ids") delete c.session.meta.rootRequestId;
      if (mode === "parent-session") c.session.meta.parentSessionId = "owned-parent";
      await telemetry.intercept(c);
      const firstWarnings = [...warnings];
      // Consumed before parent/ID checks or reporting, including reporter failure.
      await telemetry.intercept(c);
      assert.deepEqual(warnings, firstWarnings);
      assert.equal(reports.length, ["report-once", "reporter-throws"].includes(mode) ? 1 : 0);
      if (reports.length) assert.deepEqual(reports[0], {
        rootRequestId: "owned-root", conversationRequestId: "owned-turn",
        useSandboxCli: false, disabledReason: "unsupported-platform",
      });
      assert.equal(warnings.length, ["missing-ids", "reporter-throws"].includes(mode) ? 1 : 0);
      if (mode === "missing-ids") assert.match(warnings[0]!, /turn request IDs were not initialized/);
      if (mode === "reporter-throws") assert.match(warnings[0]!, /report failed: Error: owned telemetry failure/);
      telemetry.logger.warn = () => { throw Error("owned logger failure"); };
      assert.doesNotThrow(() => telemetry._logFailure("owned failure"));
      return { reports, warnings, disabledReasons };
    } finally { await f.close(); }
  },
}));
export const AGENT_RUN_CASES: Scenario[] = [
  ...sandboxTelemetryCases,
  scenario(
    "source MemoryContext uses the original lazy namespace loader for explicit owned OS identity fallback",
    async (f) => {
      const r = f.interceptor("MemoryContextInterceptor");
      assert.equal(await r.getTeamUserId(), "owned-user");
      f.settings.memory = { teamMemory: { userId: "owned-config-user" } };
      assert.equal(await r.getTeamUserId(), "owned-config-user");
      return true;
    },
  ),
  scenario(
    "source MemoryContext explicit settings disable injection without loading memory files",
    async (f) => {
      const r = f.interceptor("MemoryContextInterceptor");
      const c = f.context([user("owned question")]);
      assert.equal(await r.isAutoMemoryEnabled(), false);
      await r.intercept(c);
      assert.deepEqual(c.input, [user("owned question")]);
      return c.input;
    },
    { settings: { memory: { autoMemoryEnabled: false } } },
  ),
  scenario(
    "source PreMessageCompact retains last summary boundary and exact error formatting",
    async (f) => {
      const r = f.interceptor("PreMessageCompactInterceptor");
      const history = [
        user("old"),
        user("summary", { isSummary: true }),
        user("new"),
      ];
      const retained = r.filterBeforeCompactBoundary(history);
      assert.deepEqual(retained, history.slice(1));
      assert.equal(r.filterBeforeCompactBoundary([history[0]])[0], history[0]);
      assert.equal(r.formatErrorMessage(undefined), "上下文压缩未完成");
      assert.equal(
        r.formatErrorMessage(new Error("owned abort")),
        "owned abort",
      );
      assert.equal(r.formatErrorMessage({ owned: true }), '{"owned":true}');
      assert.ok(r.estimateHistoryTokens(history) > 0);
      return retained;
    },
  ),
  scenario(
    "source AgentRun constructors retain all 32 name-map entries and original priorities without decorators",
    async (f) => {
      const entries = [...f.n.interceptorNames].map(
        ([C, name]: any) => {
          const instance = new C();
          assert.equal(f.n.resolveInterceptorName(instance), name);
          return [name, instance.priority];
        },
      );
      assert.equal(entries.length, 32);
      assert.equal(Object.keys(f.n.interceptorClasses).length, 33);
      assert.equal(
        f.n.interceptorClasses.SandboxTurnTelemetryAgentRunInterceptor,
        f.n.SandboxTurnTelemetryAgentRunInterceptor,
      );
      assert.equal(
        f.n.interceptorNames.has(f.n.SandboxTurnTelemetryAgentRunInterceptor),
        false,
      );
      assert.equal(new f.n.HistoryAgentRunInterceptor().priority, 1400);
      assert.equal(new f.n.UserInputAgentRunInterceptor().priority, 1900);
      assert.equal(f.n.originalModule.AgentServiceImpl, f.n.AgentServiceImpl);
      assert.equal(f.n.TEAMMATE_FAILURE_TTL_MS, 600000);
      return entries;
    },
  ),
  scenario(
    "source product SDK wrapper retains pinned SDK classes, exact custom-item set and generated user IDs",
    async (f) => {
      assert.equal(f.originalSdk.RunState, sdk.RunState);
      assert.equal(f.originalSdk.Agent, sdk.Agent);
      assert.deepEqual(f.originalSdk.CUSTOM_INPUT_ITEM_TYPES, [
        "custom-title",
        "ai-title",
        "file-history-snapshot",
        "summary",
        "topic",
        "goal-result",
        "goal-progress",
        "resend-fork-notice",
      ]);
      const a = f.originalSdk.user("owned"),
        b = f.originalSdk.user("second");
      assert.ok(a.id);
      assert.notEqual(a.id, b.id);
      const util = f.modules[93039].InputItemUtils;
      assert.equal(util.isCustomInputItem({ type: "topic" }), true);
      assert.equal(util.isCustomInputItem({ type: "message" }), false);
      return [a, b];
    },
  ),
  scenario(
    "source run publishes result and signal map without installing a second result consumer or setting state itself",
    async (f) => {
      await f.service.runDefault("owned raw input", {
        context: f.s,
        maxTurns: 3,
      });
      assert.equal(f.s.resultSubject.value, f.fakeResult);
      assert.equal(f.s.resultAbortSignalMap.get(f.fakeResult), f.s.abortSignal);
      assert.equal(f.s.state, undefined);
      assert.equal(f.manager.resultSubscriptions.size, 0);
      assert.equal(f.calls.find((x) => x[0] === "runner")[3].maxTurns, 3);
      return f.calls;
    },
  ),
  scenario(
    "source run waits authentication initialization before constructing runner",
    async (f) => {
      const wait = deferred();
      f.service.authenticationManager.initialized = wait.promise;
      const promise = f.service.run(f.agent, "owned", { context: f.s });
      await tick();
      assert.equal(f.calls.length, 0);
      wait.resolve();
      await promise;
      return f.calls;
    },
  ),
  scenario(
    "source run links new abort signal to prior controller and clears prior cancelled queue",
    async (f) => {
      const old = f.s.abortController;
      f.s.lastCancelledQueue = [user("cancelled")];
      await f.service.run(f.agent, "owned", { context: f.s });
      assert.notEqual(f.s.abortController, old);
      assert.equal(old.signal.aborted, false);
      assert.equal(f.s.lastCancelledQueue, undefined);
      f.s.abortController.abort();
      assert.equal(old.signal.aborted, true);
      return f.s.abortSignal.aborted;
    },
  ),
  scenario(
    "source bypassMessageQueue is removed from SDK options only when exactly true",
    async (f) => {
      await f.service.run(f.agent, "owned", {
        context: f.s,
        bypassMessageQueue: true,
      });
      const a = f.calls.find((x) => x[0] === "runner");
      assert.equal(a[3].hasBypass, false);
      await f.service.run(f.agent, "owned", {
        context: f.s,
        bypassMessageQueue: false,
      });
      const b = f.calls.filter((x) => x[0] === "runner").at(-1);
      assert.equal(b[3].hasBypass, true);
      return [a[3], b[3]];
    },
  ),
  scenario(
    "source History refresh barrier rebinds only managed same-name agents before subsequent interceptors",
    async (f) => {
      const replacement: any = new sdk.Agent({
        name: "cli",
        instructions: "replacement",
      });
      f.managed.add(replacement);
      let observed: any;
      f.agentManager.get = async () => replacement;
      f.interceptors.push(
        {
          priority: 1400,
          intercept: async () => f.calls.push(["historyBoundary"]),
        },
        {
          priority: 1300,
          intercept: async (c: any) => {
            observed = c.agent;
          },
        },
      );
      await f.service.run(f.agent, "owned", { context: f.s });
      assert.equal(observed, replacement);
      assert.equal(f.calls.filter((x) => x[0] === "refresh").length, 1);
      return f.calls;
    },
  ),
  scenario(
    "source plugin refresh leaves unmanaged agents unchanged",
    async (f) => {
      const unmanaged = new sdk.Agent({
          name: "custom",
          instructions: "owned",
        }),
        c = f.context([], { agent: unmanaged });
      await f.service.joinPluginRuntimeRefreshForRun(c);
      assert.equal(c.agent, unmanaged);
      assert.equal(
        f.calls.some((x) => x[0] === "getAgent"),
        false,
      );
      return f.calls;
    },
  ),
  scenario(
    "source interceptor errors mark owned span/state and prevent SDK invocation",
    async (f) => {
      const spans: any[] = [];
      f.s.conversationRequestRootSpan = {
        startSpan: (name: string) => ({
          startSpan: (child: string) => ({
            markAsFailed: (e: any) => spans.push([child, e.message]),
          }),
          markAsFailed: (e: any) => spans.push([name, e.message]),
        }),
      };
      f.interceptors.push({
        priority: 1,
        async intercept() {
          throw Error("owned intercept failure");
        },
      });
      await assert.rejects(
        f.service.run(f.agent, "owned", { context: f.s }),
        /owned intercept failure/,
      );
      assert.equal(f.s.runState.status, "idle");
      assert.equal(f.s.runState.lastTransition.event, "RUN_FAILED");
      assert.equal(
        f.calls.some((x) => x[0] === "runner"),
        false,
      );
      return spans;
    },
  ),
  scenario(
    "source skipRun only emits RUN_SKIPPED when this call acquired idle lifecycle ownership",
    async (f) => {
      f.interceptors.push({
        priority: 100,
        intercept: async (c: any) => {
          c.skipRun = true;
        },
      });
      await f.service.run(f.agent, [], { context: f.s });
      assert.equal(f.s.runState.lastTransition.event, "RUN_SKIPPED");
      f.s.runState = { status: "model_streaming" };
      await f.service.run(f.agent, [], { context: f.s });
      assert.equal(f.s.runState.status, "model_streaming");
      assert.equal(f.s.runState.lastTransition, undefined);
      return f.calls;
    },
  ),
  scenario(
    "source skipRun drains only non-held queue when idle, not previously aborted, and not deferred",
    async (f) => {
      let skip = true;
      f.interceptors.push({
        priority: 1,
        intercept: async (c: any) => {
          c.skipRun = skip;
        },
      });
      f.s.queue.push(user("held", { queueHold: true }));
      await f.service.run(f.agent, [], { context: f.s });
      assert.equal(f.scheduled.length, 0);
      f.s.queue.push(user("regular"));
      await f.service.run(f.agent, [], { context: f.s });
      assert.equal(f.scheduled.length, 1);
      // Original ContainerBasedProvider caches registrations on first lookup;
      // change this interceptor's decision, not the already-cached provider list.
      skip = false;
      f.s.queue.length = 0;
      await f.scheduled.shift()!();
      assert.ok(f.calls.some((x) => x[0] === "runner"));
      return f.calls;
    },
  ),
  scenario(
    "source resolver uses session metadata agent and falls back on unknown configured agent",
    async (f) => {
      const other = new sdk.Agent({ name: "owned-other" });
      f.agentManager.get = async (name: string) =>
        name === other.name ? other : undefined;
      assert.equal(
        await f.service.resolveAgentForSession({
          meta: { agentName: other.name },
        }),
        other,
      );
      assert.equal(
        await f.service.resolveAgentForSession({ agentName: "missing" }),
        f.agent,
      );
      return f.logs.filter((x) => x[0] === "warn").map((x) => x[1]);
    },
  ),
  scenario(
    "source runOneTime consumes text/usage and restores purpose/request id but retains new controller",
    async (f) => {
      f.s.agentPurpose = "old-purpose";
      f.s.conversationRequestId = "old-request";
      f.fakeResult.rawResponses = [
        { usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 } },
      ];
      const old = f.s.abortController;
      const result = await f.service.runOneTime("cli", "owned", {
        context: f.s,
      });
      assert.equal(result, "owned one-time");
      assert.equal(f.s.agentPurpose, "old-purpose");
      assert.equal(f.s.conversationRequestId, "old-request");
      assert.notEqual(f.s.abortController, old);
      assert.equal(f.s.usage.totalTokens, 3);
      assert.equal(f.s.resultSubject.value, undefined);
      return [result, f.s.agentPurpose, f.s.conversationRequestId, f.calls];
    },
  ),
  scenario(
    "source one-time overrides inherit agent, clone modelSettings, retain bypass mode and restore purpose on failure",
    async (f) => {
      f.s.agentPurpose = "before";
      const originalSettings = f.agent.modelSettings;
      let child: any, options: any;
      f.runner.run = async (agent: any, _input: any, opts: any) => {
        child = agent;
        options = opts;
        throw Error("owned model failure");
      };
      await assert.rejects(
        f.service.runOneTimeWithOverrides(
          "cli",
          "owned",
          {
            systemPrompt: "replacement",
            temperature: 0,
            maxTokens: 8,
            stopSequences: ["end"],
            model: "custom-model",
            bypassPermissions: true,
            maxTurns: 2,
          },
          { context: f.s },
        ),
        /owned model failure/,
      );
      assert.equal(Object.getPrototypeOf(child), f.agent);
      assert.notEqual(child.modelSettings, originalSettings);
      assert.equal(child.instructions, "replacement");
      assert.equal(child.model, "custom-model");
      assert.equal(child.modelSettings.temperature, 0);
      assert.equal(options.maxTurns, 2);
      assert.equal(f.s.permissionModeSubject.value, Mode.BypassPermissions);
      assert.equal(f.s.agentPurpose, "before");
      return [child.modelSettings, options.maxTurns, f.s.agentPurpose];
    },
  ),
  scenario(
    "source runForked trims unfinished assistant, runs a new session and restores borrowed tools even on failure",
    async (f) => {
      f.s.history = [
        user("first"),
        {
          id: "unfinished",
          type: "message",
          role: "assistant",
          status: "in_progress",
          content: [],
        },
      ];
      const tools = f.agent.tools;
      let contextId: string | undefined;
      f.runner.run = async (agent: any, _input: any, opts: any) => {
        assert.deepEqual(agent.tools, []);
        contextId = opts.context.id;
        throw Error("owned fork failure");
      };
      await assert.rejects(
        f.service.runForked("cli", "fork question", f.s, {
          disableTools: true,
        }),
        /owned fork failure/,
      );
      assert.equal(f.agent.tools, tools);
      assert.notEqual(contextId, f.s.id);
      return contextId;
    },
  ),
  scenario(
    "source full History/Telemetry chain accepts missing meta and creates it at original Telemetry stage",
    async (f) => {
      assert.equal(f.s.meta, undefined);
      f.interceptors.push(
        ...[
          "UserInputAgentRunInterceptor",
          "ProviderDataAgentRunInterceptor",
          "HistoryAgentRunInterceptor",
          "TelemetryAgentRunInterceptor",
        ].map(f.interceptor),
      );
      await f.service.runDefault("owned fresh session", { context: f.s });
      assert.equal(f.s.history.length, 1);
      assert.ok(f.s.meta.rootRequestId);
      assert.equal(f.s.telemetry.agentName, "cli");
      assert.equal(f.s.agentPurpose, "conversation");
      return [f.s.history, f.s.meta, f.s.telemetry, f.calls];
    },
    { emptyMeta: true },
  ),
  scenario(
    "source env interceptor mutates only explicitly borrowed env object, not ambient process.env",
    async (f) => {
      const before = process.env.AXONFIRE_NATIVE_AGENT_OWNED_FLAG;
      await f.interceptor("EnvAgentRunInterceptor").intercept(f.context([]));
      assert.equal(f.env.AXONFIRE_NATIVE_AGENT_OWNED_FLAG, "owned");
      assert.equal(process.env.AXONFIRE_NATIVE_AGENT_OWNED_FLAG, before);
      return f.env;
    },
    { settings: { env: { AXONFIRE_NATIVE_AGENT_OWNED_FLAG: "owned" } } },
  ),
  scenario(
    "source model interceptor retains unknown CLI/request ID, recursively configures handoffs and maps max effort to xhigh",
    async (f) => {
      f.s.requestOptions.model = "custom-model";
      f.manager.setOverrideThinking(f.s.id, {
        thinkingEnabled: true,
        reasoningEffort: "max",
      });
      await f
        .interceptor("ModelConfigAgentRunInterceptor")
        .intercept(f.context([]));
      assert.equal(f.agent.model, "custom-model");
      assert.equal(f.agent.modelSettings.maxTokens, 128);
      assert.equal(f.agent.modelSettings.reasoning.effort, "xhigh");
      assert.equal(f.agent.modelSettings.reasoning.summary, "auto");
      return f.agent.modelSettings;
    },
    { modelConfig: { supportsReasoning: true } },
  ),
  scenario(
    "source State interceptor builds real SDK RunState and preserves conversation tracking",
    async (f) => {
      const oldContext = new sdk.RunContext(f.s),
        old = new sdk.RunState(oldContext, [], f.agent, 3);
      (old as any).conversationRequestId = "old-request";
      f.s.state = old;
      f.s.conversationRequestId = "session-request";
      const c = f.context([f.originalSdk.user("next")]);
      await f.interceptor("StateAgentRunInterceptor").intercept(c);
      assert.ok(c.input instanceof sdk.RunState);
      assert.notEqual(c.input, old);
      assert.equal(c.input.conversationRequestId, "old-request");
      assert.equal(old._context.context, f.s);
      return c.input.conversationRequestId;
    },
  ),
  scenario(
    "source busy message queue clones input without adding history and retains source queue identity",
    async (f) => {
      f.s.runState = { status: "model_streaming" };
      const input = [user("queued")],
        c = f.context(input);
      await f.interceptor("MessageQueueAgentRunInterceptor").intercept(c);
      assert.equal(c.skipRun, true);
      assert.equal(c.skipAddHistory, true);
      assert.notEqual(f.s.queue[0], input[0]);
      assert.equal(f.s.history.length, 0);
      return f.s.queue;
    },
  ),
  scenario(
    "source empty queue drain preserves held items while merging regular queued input",
    async (f) => {
      f.s.queue.push(user("held", { queueHold: true }), user("regular"));
      const c = f.context([]);
      await f.interceptor("MessageQueueAgentRunInterceptor").intercept(c);
      assert.equal(f.s.queue.length, 1);
      assert.equal(f.s.queue[0].content, "held");
      assert.match(text(c), /regular/);
      return [c.input, f.s.queue];
    },
  ),
  scenario(
    "source UserQuery wrapper joins only eligible user text, preserving injected/meta and nontext blocks",
    async (f) => {
      const c = f.context([
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: "one" },
            { type: "input_image", image: "owned" },
            { type: "input_text", text: "two" },
            {
              type: "input_text",
              text: "<system-reminder>x</system-reminder>",
            },
          ],
        },
      ]);
      await f.interceptor("UserQueryWrapperAgentRunInterceptor").intercept(c);
      assert.match(text(c), /<user_query>one two/);
      assert.equal(c.input[0].content.length, 3);
      return c.input;
    },
  ),
  scenario(
    "source SystemReminder Hook barrier waits and consumes first/resume/user/Stop contexts without losing readiness ordering",
    async (f) => {
      const wait = deferred();
      f.s.hookContexts = {
        sessionStartReadyPromise: wait.promise,
        sessionStartContext: "start",
        userPromptSubmitContext: "submit",
        stopHookFeedback: "stop",
        preCompactInstructions: "compact",
      };
      const c = f.context([f.originalSdk.user("question")]),
        reminder = f.interceptor("SystemReminderAgentRunInterceptor");
      let done = false;
      const job = reminder.injectHookContexts(c).then(() => {
        done = true;
      });
      await tick();
      assert.equal(done, false);
      wait.resolve();
      await job;
      assert.match(text(c), /start/);
      assert.match(text(c), /submit/);
      assert.match(text(c), /stop/);
      assert.match(text(c), /compact/);
      assert.equal(f.s.hookContexts.sessionStartContext, undefined);
      return c.input;
    },
  ),
  scenario(
    "source SystemReminder meta input skips rules, IDE, Hook and channel injection",
    async (f) => {
      const c = f.context([user("meta", { isMeta: true })]);
      const before = text(c);
      await f.interceptor("SystemReminderAgentRunInterceptor").intercept(c);
      assert.equal(text(c), before);
      return c.input;
    },
  ),
  scenario(
    "source IDE reminder retains zero-based selection bounds and 2000-character truncation",
    async (f) => {
      const r = f.interceptor("SystemReminderAgentRunInterceptor");
      r.ideService = {
        selectionChangedSubject: {
          value: {
            filePath: "/owned/file.ts",
            text: "x".repeat(2200),
            selection: { start: { line: 3 }, end: { line: 5 } },
          },
        },
      };
      const result = await r.generateIDESelectionReminder(f.context([]));
      assert.match(result, /lines 3 to 5/);
      assert.match(result, /truncated/);
      return result;
    },
  ),
  scenario(
    "source ChannelEvent formatter escapes XML, filters invalid attribute names and keeps value type errors",
    async (f) => {
      const r = f.interceptor("ChannelEventAgentRunInterceptor");
      const output = r.formatChannelEvents([
        {
          serverName: 'a"<&',
          content: "<payload&>",
          meta: { good: '"<&', "bad key": "discard" },
        },
      ]);
      assert.match(output, /&quot;/);
      assert.match(output, /&lt;payload&amp;&gt;/);
      assert.equal(output.includes("bad key"), false);
      assert.throws(() => r.escapeXmlAttr(42), TypeError);
      return output;
    },
  ),
  scenario(
    "source DeepResearch pending reminder stops after any Workflow call and preserves literal fallback prompt",
    async (f) => {
      const r = f.interceptor("DeepResearchPendingInterceptor"),
        trigger = user(
          '<system-reminder data-role="deep-research-trigger">owned</system-reminder>',
        );
      assert.equal(r.isPending([trigger]), true);
      assert.equal(
        r.isPending([trigger, { type: "function_call", name: "Workflow" }]),
        false,
      );
      f.s.history = [trigger];
      const c = f.context([user("question")]);
      await r.intercept(c);
      assert.match(text(c), /deep-research-pending/);
      return c.input;
    },
  ),
  scenario(
    "source Ultracode keyword filters injected system text and respects workflow-disabled gate",
    async (f) => {
      const r = f.interceptor("UltracodeKeywordInterceptor");
      assert.equal(
        r.extractUserText([
          user("<system-reminder>use workflow</system-reminder>"),
        ]),
        undefined,
      );
      const c = f.context([user("use a workflow for owned task")]);
      await r.intercept(c);
      assert.match(text(c), /workflow_keyword_request/);
      return c.input;
    },
  ),
  scenario(
    "source ImageFilter drops images when unsupported while retaining normal text",
    async (f) => {
      const r = f.interceptor("ImageFilterAgentRunInterceptor");
      f.agent.model = "owned-image-model";
      r.productManager.waitConfiguration = async () => ({
        models: [{ id: f.agent.model, supportsImages: false }],
      });
      const c = f.context([
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_image", image: "owned" },
            { type: "input_text", text: "kept" },
          ],
        },
      ]);
      await r.intercept(c);
      assert.equal(c.input[0].content.length, 1);
      return c.input;
    },
  ),
  scenario(
    "source ImageRehydration uses real native blob, delivery tracking and source retain-round default",
    async (f) => {
      const ref = await f.imageBlobService.storeFromDataUri(
        "data:image/png;base64,b3duZWQ=",
      );
      const c = f.context([{ type: "message", role: "user", content: [ref] }]);
      await f.interceptor("ImageRehydrationAgentRunInterceptor").intercept(c);
      assert.match(text(c), /data:image\/png;base64,b3duZWQ=/);
      return c.input;
    },
  ),
  scenario(
    "source reference-path interceptor returns unchanged when path-only mode is selected",
    async (f) => {
      const r = f.interceptor("ReferencePathProcessorAgentRunInterceptor");
      r.referenceService = { isFileReferencesPathOnly: () => true };
      const c = f.context([user("@owned-file")]);
      await r.intercept(c);
      assert.deepEqual(c.input, [user("@owned-file")]);
      return c.input;
    },
  ),
  scenario(
    "source ConditionalRules consumes pending trigger result into original system reminder",
    async (f) => {
      f.s.conditionalRules.pendingTriggers.add("owned");
      const r = f.interceptor("ConditionalRulesAgentRunInterceptor");
      r.conditionalRulesService = {
        consume: async (value: any) => {
          assert.equal(value, f.s.conditionalRules);
          return { content: "owned rule" };
        },
      };
      const c = f.context([user("question")]);
      await r.intercept(c);
      assert.match(text(c), /owned rule/);
      return c.input;
    },
  ),
  scenario(
    "source token calculation callback runs exactly with original run context",
    async (f) => {
      const tokens = f.modules[71915],
        c = f.context([]);
      let captured: any;
      f.s.meta[tokens.META_TOKEN_CALCULATION_REQUEST] = true;
      f.s.meta[tokens.META_TOKEN_CALCULATION_CALLBACK] = (value: any) => {
        captured = value;
      };
      await f.interceptor("TokenCalculationAgentRunInterceptor").intercept(c);
      assert.equal(captured, c);
      return true;
    },
  ),
  scenario(
    "source History pipeline sanitizes resend branches and uses optional meta without standalone defaults",
    async (f) => {
      const c = f.context([f.originalSdk.user("owned")]);
      await f.interceptor("HistoryAgentRunInterceptor").intercept(c);
      assert.equal(f.s.meta, undefined);
      assert.equal(c.input.length, 1);
      const disk = await io.readFile(
        f.store.getSessionFilePath(f.s.id),
        "utf8",
      );
      assert.match(disk, /owned/);
      return c.input;
    },
    { emptyMeta: true },
  ),
];
for (const value of [undefined, "", "0", "-1", "1.5", "8", "bad"])
  AGENT_RUN_CASES.push(
    scenario(
      "source maxTurns environment Number validation retains fractional case " +
        String(value),
      async (f) => {
        await f.service.run(f.agent, [], { context: f.s });
        const options = f.calls.find((x) => x[0] === "runner")[3];
        const expected = value === "8" ? 8 : value === "1.5" ? 1.5 : 500;
        assert.equal(options.maxTurns, expected);
        return options;
      },
      { env: { CODEBUDDY_CODE_MAX_TURNS: value } },
    ),
  );
for (const platform of ["darwin", "win32", "linux"])
  AGENT_RUN_CASES.push(
    scenario(
      "source sandbox/backup platform gates: " + platform,
      async (f) => {
        const result = [
          f.n.areSandboxExperimentalFeaturesSupported(),
          f.n.isSandboxCLIPlatformSupported(),
          f.n.shouldUseSandboxCLI(true),
          f.n.shouldUseSandboxCLI(false),
          f.n.isFileBackupSupported(),
        ];
        assert.deepEqual(result, [
          false,
          platform !== "linux",
          platform !== "linux",
          false,
          platform === "win32",
        ]);
        return result;
      },
      { platform },
    ),
  );
