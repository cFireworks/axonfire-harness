// Explicit owned component-test DI. No production account, telemetry, bootstrap or installed resource lookup.
import * as sdk from "@openai/agents-core";
import * as fs from "node:fs";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { createNativeAgentRun } from "../../src/agents/native-agent-run.js";
import { createNativeAgentRunUtilities } from "../../src/agents/native-agent-run-utilities.js";
import { createCapturedAcpModules } from "../../src/protocol/captured-acp-modules.js";
import { WorktreeContextInterceptor } from "../../src/agents/worktree-context-interceptor.js";
import { MessageQueueManager } from "../../src/sessions/message-queue-manager.js";
import { ToolNames } from "../../src/tools/tool-names.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import { createNativeAcpPrimitives } from "../../src/protocol/native-acp-primitives.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import {
  MemoryScope,
  MemoryType,
} from "../../src/memory/memory-rule-constants.js";
import { MCP_UI_MODEL_CONTEXT } from "../../src/agents/system-reminder-agent-run-interceptor.js";
import { TokenUtils } from "../../src/context/token-utils.js";
import { sessionStackFixture } from "./session-stack-fixture.js";

export const agentRunFactories = {
  factory: createNativeAgentRun,
  utilities: createNativeAgentRunUtilities,
};
export async function agentRunFixture(
  factories = agentRunFactories,
  patch: any = {},
) {
  const f = await sessionStackFixture(),
    calls: any[] = [],
    scheduled: Array<() => Promise<any>> = [],
    env: any = { ...patch.env },
    settings: any = { ...patch.settings },
    modules: any = { ...f.modules },
    common = modules[80699];
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext"].map((key) => [
      key,
      (...args: any[]) => f.logs.push([key, ...args]),
    ]),
  ) as any;
  delete modules[18553];
  delete modules[69466];
  const cliTokens: any = {};
  Object.assign(modules, {
    25301: sdk,
    66545: cliTokens,
    59233: { WorktreeContextInterceptor },
    70857: { EOL: "\n", userInfo: () => ({ username: "owned-user" }) },
    35151: { PermissionMode },
    24618: { PermissionMode },
    6350: { ToolNames },
    53766: {
      StartupProfiler: Symbol("owned profiler"),
      StartupPhase: {
        AUTH_WAIT: "auth_wait",
        RUNNER_INIT: "runner_init",
        AGENT_INTERCEPTORS: "interceptors",
      },
    },
    71915: { ...f.modules[99006], ...f.modules[71389] },
    59502: { isWorkflowDisabled: async () => patch.workflowDisabled === true },
    25428: { MemoryScope, MemoryType },
    66805: {},
    93928: { MCP_UI_MODEL_CONTEXT },
  });
  const base = createCapturedAcpModules({
    modules,
    Date: f.runtime.Date,
    fs,
    os: { EOL: "\n" },
  });
  const utilities = factories.utilities({
    modules,
    Date: f.runtime.Date,
    env,
    platform: patch.platform ?? "linux",
    getModule: base.getModule,
  });
  const n: any = factories.factory({
    modules,
    env,
    Date: f.runtime.Date,
    platform: patch.platform ?? "linux",
    getModule: utilities.getModule,
    setTimeout: f.timers.setTimeout,
    clearTimeout: f.timers.clearTimeout,
    setImmediate: (operation: () => Promise<any>) => {
      scheduled.push(operation);
      return scheduled.length;
    },
  });
  Object.assign(cliTokens, n.getModule(69466));
  modules[69466] = n.getModule(69466);
  const primitives = createNativeAcpPrimitives({
    modules,
    Date: f.runtime.Date,
    getModule: utilities.getModule,
  });
  const services = createNativeAcpServices({
    modules,
    Date: f.runtime.Date,
    getModule: utilities.getModule,
  });
  Object.assign(modules[66805], {
    extractVisibleUserPromptFromAgentInput:
      services.extractVisibleUserPromptFromAgentInput,
  });
  const originalSdk = utilities.getModule(18553);
  Object.assign(modules[93039], {
    SessionUtils: n.getModule(7340).SessionUtils,
    InputItemUtils: utilities.getModule(58830).InputItemUtils,
    HistoryUtils: utilities.getModule(21580).HistoryUtils,
    MessageUtils: utilities.getModule(46943).MessageUtils,
    QueueDispatchUtils: {
      isDeferredDispatchEnabledSync: () => patch.deferred === true,
    },
    ModelUtils: {
      getMaxOutputTokens: (_name: string, maximum: number) => maximum,
    },
    TelemetryUtils: primitives.TelemetryUtils,
    TokenUtils,
    GitUtils: { getGitUserName: () => undefined },
  });
  // Force this source factory's AB binding to use the original 598-character product SDK wrapper.
  // The wrapped SDK itself is still the pinned npm dependency, never copied or reimplemented.
  modules[18553] = originalSdk;
  const agent: any = new sdk.Agent({
    name: "cli",
    instructions: "owned agent fixture",
  });
  const managed = new Set<any>([agent]),
    models: any = {
      id: "owned-model",
      temperature: 0.2,
      maxOutputTokens: 128,
      ...patch.modelConfig,
    };
  const agentManager: any = {
    getDefaultAgentName: () => "cli",
    getDefault: async () => agent,
    get: async (name: string) => {
      calls.push(["getAgent", name]);
      return patch.getAgent
        ? patch.getAgent(name, agent)
        : name === "cli"
          ? agent
          : undefined;
    },
    isManagedAgentInstance: (value: any) => managed.has(value),
    ensureAgentToolsFreshForRun: async (
      name: string,
      session: any,
      signal: AbortSignal,
      instance: any,
    ) =>
      calls.push([
        "fresh",
        name,
        session.id,
        signal.aborted,
        instance === agent,
      ]),
    getModel: async () => models,
    resolveModel: async (id: string) => (id === models.id ? models : undefined),
    resolveConfiguredModelOrFallback: async (id: string) => id,
    getCommands: async () => [],
    getAgentConfig: async () => ({}),
    getSettingsAgentName: () => undefined,
  };
  f.di.set(n.getModule(69466).AgentManager, agentManager);
  const fakeResult: any = {
    state: { owned: true },
    lastAgent: agent,
    rawResponses: [],
    newItems: [],
    async *toTextStream() {
      yield "owned one-time";
    },
  };
  const runner: any = {
    async run(a: any, input: any, options: any) {
      calls.push([
        "runner",
        a.name,
        input,
        {
          maxTurns: options.maxTurns,
          stream: options.stream,
          hasBypass: "bypassMessageQueue" in options,
          context: options.context?.id,
        },
      ]);
      return patch.run ? patch.run(a, input, options) : fakeResult;
    },
  };
  const service: any = new n.AgentServiceImpl();
  const interceptors: any[] = [];
  Object.assign(service, {
    logger,
    authenticationManager: {
      initialized: patch.authInitialized ?? Promise.resolve(),
    },
    runnerProvider: {
      get: async () => {
        calls.push(["runnerProvider"]);
        return runner;
      },
    },
    sessionManager: f.manager,
    stateMachine: f.manager.stateMachine,
    agentManager,
    agentRunInterceptorProvider: {
      sortSync: () => [...interceptors].sort((a, b) => b.priority - a.priority),
    },
    pluginRuntimeRefreshService: {
      waitForRefreshSettled: async () => {
        calls.push(["refresh"]);
        await patch.refresh?.();
      },
    },
  });
  function interceptor(name: string) {
    const C = n.interceptorClasses[name];
    if (typeof C !== "function")
      throw Error("Unknown original interceptor " + name);
    const instance = new C();
    Object.assign(instance, {
      logger,
      agentManager,
      sessionManager: f.manager,
      sessionStore: f.store,
      stateMachine: f.manager.stateMachine,
      settingsManager: { get: async (key: string) => settings[key] },
      productManager: {
        waitConfiguration: async () => ({ productFeatures: {}, agents: [] }),
      },
      messageQueueManager: new MessageQueueManager(),
      imageBlobService: f.imageBlobService,
      telemetryService: {
        reportChatRequestSendTelemetry: async (s: any) =>
          calls.push(["requestSend", s.id]),
      },
      frictionAnalysisService: {
        capturePrompt: (s: any, text: string) =>
          calls.push(["capture", s.id, text]),
      },
    });
    return instance;
  }
  function context(input: any, seed: any = {}) {
    return {
      input,
      agent,
      session: s,
      agentOptions: {},
      skipRun: false,
      bypassMessageQueue: false,
      ...seed,
    };
  }
  const s = await f.manager.create({
    id: "native-agent-run",
    ...(patch.emptyMeta ? {} : { meta: {} }),
    options: { model: "owned-model" },
  });
  return {
    ...f,
    sessionNative: f.n,
    n,
    utilities,
    modules,
    common,
    logger,
    env,
    settings,
    s,
    agent,
    agentManager,
    models,
    managed,
    service,
    runner,
    fakeResult,
    interceptors,
    scheduled,
    calls,
    interceptor,
    context,
    originalSdk,
  };
}
