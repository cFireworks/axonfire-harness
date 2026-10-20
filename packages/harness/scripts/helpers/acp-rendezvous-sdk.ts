// Complete source ACP new-session -> real internal HTTP -> source ingress/View/Agent.setSession -> original run chain + pinned SDK.
// All IO, auth configuration, model and external service adapters are owned; no installed account or production traffic.
import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import * as fs from "node:fs";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import { Subject, BehaviorSubject } from "rxjs";
import { filter, distinctUntilChanged, map } from "rxjs/operators/index.js";
import { Usage, withTrace, type Model } from "@openai/agents-core";
import { jsonrepair } from "jsonrepair";
import { LocalNoopTrace } from "../../src/runtime/local-trace.js";
import { createAcpRendezvousHost } from "../../src/protocol/acp-rendezvous-host.js";
import { createAcpServicesHost } from "../../src/protocol/acp-services-host.js";
import { createNativeAcpConnections } from "../../src/protocol/native-acp-connections.js";
import { createNativeAcpLifecycle } from "../../src/protocol/native-acp-lifecycle.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { createNativeAcpParentPrimitives } from "../../src/protocol/native-acp-parent-primitives.js";
import { createNativeAcpReplay } from "../../src/protocol/native-acp-replay.js";
import { createNativeSessionStack } from "../../src/sessions/native-session-stack.js";
import { createNativeSessionIngress } from "../../src/sessions/native-session-ingress.js";
import { createCapturedAcpSdk } from "../../src/vendor/captured-acp-sdk.js";
import { createNativeRunner } from "../../src/runner/native-runner.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";
import { createNativeAgentHttpHost } from "../../src/http/native-agent-http-host.js";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { loadProductConfiguration } from "../../src/config/product-config.js";
import { ProductPromptRenderer } from "../../src/prompts/prompt-renderer.js";
import { AgentManager } from "../../src/agents/agent-manager.js";
import { AgentFactory } from "../../src/agents/agent-factory.js";
import { McpRegistry } from "../../src/mcp/mcp-registry.js";
import { ToolManager } from "../../src/tools/tool-manager.js";
import { registerCoreFileTools } from "../../src/tools/core-file-tools.js";
import { registerDeferredRuntimeTools } from "../../src/tools/deferred-runtime.js";
import { DelegateToolManagerImpl } from "../../src/delegate/delegate-tool-manager.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import {
  createNativeInterruptionService,
  createNativeToolApprovalServices,
} from "../../src/permissions/native-interruption-service.js";
import {
  createToolPermissionHost,
  nativeToolPermissionFactories,
} from "../../src/permissions/tool-permission-host.js";
import { createNativeSettingsHost } from "../../src/config/native-settings-host.js";
import { createHookLifecycleHost } from "../../src/hooks/hook-lifecycle-runtime.js";
import { createNativeInteractionServices } from "../../src/interaction/native-interaction-services.js";
import { AskUserQuestionTool } from "../../src/tools/ask-user-question.js";
import { PlanTools } from "../../src/tools/plan-tools.js";
import { ExitPlanModeToolCallProcessor } from "../../src/sessions/exit-plan-mode-tool-call-processor.js";
import { agentRunFixture, agentRunFactories } from "./agent-run-fixture.js";
import { authenticationFixture } from "./authentication-fixture.js";
import {
  acpProtocolFixture,
  protocolFactories,
} from "./acp-protocol-fixture.js";

export const rendezvousFactories = {
  http: createNativeHttpRuntime,
  agentRun: agentRunFactories,
  runner: createNativeRunner,
  protocol: protocolFactories,
  connections: createNativeAcpConnections,
  lifecycle: createNativeAcpLifecycle,
  services: createNativeAcpServices,
  authentication: createNativeAuthenticationRuntime,
  sdk: createCapturedAcpSdk,
  parent: createNativeAcpParentPrimitives,
  interruption: createNativeInterruptionService,
  approvals: createNativeToolApprovalServices,
  permission: nativeToolPermissionFactories,
  interaction: createNativeInteractionServices,
  replay: createNativeAcpReplay,
  stack: createNativeSessionStack,
  ingress: createNativeSessionIngress,
};

export type OwnedParentScenario = {
  ownedRoot?: string;
  uuidPrefix?: string;
  modelLabel?: string;
  entrance?: {
    method: "new" | "load" | "resume" | "continue";
    sessionId?: string;
  };
  run?(parent: any): Promise<any>;
};

export const ACP_RENDEZVOUS_MODES = [
  "single",
  "switch",
  "write-allow",
  "write-reject",
  "write-cancel",
  "write-always",
  "ask-answer",
  "ask-skip",
  "ask-cancel",
  "plan-allow",
  "plan-reject",
  "plan-exit-reject",
] as const;
export async function acpRendezvousSdk(
  factories = rendezvousFactories,
  mode: (typeof ACP_RENDEZVOUS_MODES)[number] = "single",
  scenario: OwnedParentScenario = {},
) {
  return withTrace(new LocalNoopTrace(), async () => {
    let initializePermissions: ((session: any) => Promise<void>) | undefined;
    const httpLogs: any[] = [],
      capability = randomUUID();
    const h = createNativeAgentHttpHost({
        sourceFactory: factories.http,
        maxBodyBytes: 8192,
        capability,
        logger: {
          info: (...args: any[]) => {
            httpLogs.push(["info", ...args]);
          },
          error: (...args: any[]) => {
            httpLogs.push(["error", ...args]);
          },
        },
        onDispatch(request, response) {
          httpRequests.push({ request, response });
        },
      }),
      f = await agentRunFixture(factories.agentRun, {
        emptyMeta: true,
        httpModule: h.native.getModule(47005),
        permissions: (session: any) => initializePermissions?.(session),
        ownedRoot: scenario.ownedRoot,
        stackFactory: factories.stack,
        ingressFactory: factories.ingress,
        uuidPrefix: scenario.uuidPrefix,
      });
    const auth = authenticationFixture(factories.authentication),
      authToken = "owned-explicit-parent-token";
    auth.env.CODEBUDDY_AUTH_TOKEN = "owned-priority-signal";
    auth.product.configuration.next({
      authentication: {
        type: "custom-token",
        attributes: { token: authToken },
      },
    });
    const custom = auth.custom();
    auth.manager.authenticationStorages = [custom.storage];
    auth.providers.splice(0, auth.providers.length, custom.provider);
    await auth.manager.doInit();
    await auth.manager.initialized;
    assert.equal(
      auth.manager.currentSessionSubject.value.auth.accessToken,
      authToken,
    );
    f.service.authenticationManager = auth.manager;
    let agents: AgentManager | undefined,
      p: ReturnType<typeof acpProtocolFixture> | undefined;
    let host: ReturnType<typeof createAcpRendezvousHost> | undefined,
      services: ReturnType<typeof createAcpServicesHost> | undefined;
    let settings: ReturnType<typeof createNativeSettingsHost> | undefined,
      hooks: ReturnType<typeof createHookLifecycleHost> | undefined,
      permissions: ReturnType<typeof createToolPermissionHost> | undefined;
    let client: any, endpoint: any;
    const toAgent = new TransformStream(),
      toClient = new TransformStream();
    const updates: any[] = [],
      modelRequests: any[] = [],
      httpRequests: any[] = [],
      restCalls: any[] = [],
      registration: any[] = [],
      errors: any[] = [],
      reviews: any[] = [],
      decisions: any[] = [],
      executedTools: string[] = [];
    const expectedProtocolDiagnostics = new Set<any>();
    const resumedStates: any[] = [];
    let reviewedState: any;
    let reviewResumeIndex = 0;
    const sourceRun = f.service.run.bind(f.service);
    f.service.run = (...args: any[]) => {
      if (args[1] instanceof f.originalSdk.RunState)
        resumedStates.push(args[1]);
      return sourceRun(...args);
    };
    const writeMode = mode.startsWith("write-"),
      writeAllowed = mode === "write-allow" || mode === "write-always";
    const askMode = mode.startsWith("ask-"),
      planMode = mode.startsWith("plan-"),
      approvalMode = writeMode || askMode || planMode;
    let asks: any, plans: any;
    const interactionTimers = new Set<ReturnType<typeof setTimeout>>();
    const interruptionSubscriptions = new Set<any>(),
      interruptionJobs = new Set<Promise<any>>();
    const modelBarriers = new Set<any>();
    const connectionId = "owned-parent-connection";
    async function checked<T>(
      label: string,
      operation: Promise<T>,
    ): Promise<T> {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          operation,
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () =>
                reject(
                  Error(
                    "Owned parent deadline: " +
                      label +
                      " " +
                      JSON.stringify({
                        http: httpRequests.map((r) => ({
                          status: r.response.statusCode,
                          ended: r.response.writableEnded,
                        })),
                        errors,
                        logs: f.logs.slice(-8),
                        acp: p?.logs.slice(-8),
                        entry: host?.getEntry(connectionId)?.ready,
                      }),
                  ),
                ),
              8000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    }
    try {
      const file = join(f.cwd, "parent-owned.txt");
      const writeFile = join(f.cwd, "parent-write.txt"),
        writeContent = "owned native parent approved Write 中文😀\n";
      await io.writeFile(file, "owned native parent Read 中文😀\n");
      const product = await loadProductConfiguration(),
        prompts = new ProductPromptRenderer(product),
        tools = new ToolManager(product, prompts),
        mcp = new McpRegistry();
      await io.mkdir(join(f.root, "plans"), { recursive: true });
      const interactions = factories.interaction({
        modules: {
          16928: { join },
          29827: { BehaviorSubject },
          91943: io,
          79896: fs,
        },
        getPlansDir: () => join(f.root, "plans"),
        setTimeout(fn: () => void, ms: number) {
          const timer = setTimeout(() => {
            interactionTimers.delete(timer);
            fn();
          }, ms);
          interactionTimers.add(timer);
          return timer;
        },
        clearTimeout(timer: ReturnType<typeof setTimeout>) {
          interactionTimers.delete(timer);
          clearTimeout(timer);
        },
      });
      asks = new interactions.AskServiceImpl();
      asks.logger = f.logger;
      asks.init();
      plans = new interactions.PlanStorageServiceImpl();
      plans.logger = f.logger;
      settings = createNativeSettingsHost({
        stateDir: join(f.root, "settings"),
        getWorkDir: () => f.cwd,
        logger: f.logger,
      });
      await settings.start();
      hooks = createHookLifecycleHost({
        workDir: () => f.cwd,
        getHomeDir: () => join(f.root, "settings"),
        sessionStore: f.store,
        settings: settings.manager,
        env: {},
        logger: f.logger,
        getAgentService: () => f.service,
      });
      const sourceExecute = hooks.pipeline.executeToolWithHooks.bind(
        hooks.pipeline,
      );
      hooks.pipeline.executeToolWithHooks = (...args: any[]) => {
        executedTools.push(args[0].name);
        return sourceExecute(...(args as [any, any, any, any, any]));
      };
      permissions = createToolPermissionHost(
        {
          getWorkDir: () => f.cwd,
          getHomeDir: () => join(f.root, "settings"),
          settingsManager: settings.manager,
          sessionStore: f.store,
          planStorageService: plans,
          sessionHookManager: hooks.sessionManager,
          toolHookManager: hooks.toolManager,
          logger: f.logger,
          commandSafety: {
            platform: process.platform,
            isWorkBuddyDesktop: () => false,
            exec: async () => {
              throw Error("Unexpected owned command availability probe");
            },
          },
          onSdkDecision(tool, context, input, callId, needsApproval) {
            decisions.push({ name: tool.name, callId, needsApproval });
          },
        },
        factories.permission,
      );
      tools.attachPermissionService(permissions);
      tools.attachHookLifecycle(hooks.pipeline);
      f.middleware.toolPermissionService = {
        initializeContext: permissions.initializeContext,
      };
      initializePermissions = permissions.initializeContext;
      f.manager.sessionHookManager = hooks.sessionManager;
      registerCoreFileTools(tools, { workDir: f.cwd });
      const deferred = registerDeferredRuntimeTools(tools, mcp, { cwd: f.cwd });
      deferred.deferExecute.attachPermissionAdapter(permissions);
      new AskUserQuestionTool(asks, {
        getAcpCapabilities: (id) =>
          id === connectionId ? p?.agent.getClientCapabilities() : undefined,
      }).register(tools);
      new PlanTools(plans, prompts, f.manager).register(tools);
      (f.processors as any[]).push(
        new ExitPlanModeToolCallProcessor({
          planStorageService: plans,
          consoleManager: f.logger,
        }),
      );
      agents = new AgentManager(
        product,
        prompts,
        tools,
        mcp,
        new AgentFactory(f.manager.stateMachine),
      );
      await agents.start();
      f.service.agentManager = agents;
      f.di.set(f.n.getModule(69466).AgentManager, agents);
      let turn = 0;
      const model: Model = {
        getResponse: async () => ({ output: [], usage: new Usage() }),
        async *getStreamedResponse(request) {
          if (planMode && turn > 0) {
            // Owned deterministic model transport, not a business interception:
            // let the sole original history consumer acknowledge the preceding
            // tool result before this test model publishes another response.
            const session = f.manager.getCurrent(),
              callId = "parent-interaction-" + turn;
            const delivered = (item: any) =>
              item.type === "function_call_result" && item.callId === callId;
            if (!session.history.some(delivered)) {
              let sub: any;
              const pending = new Promise<void>((resolve) => {
                sub = session.inputSubject.subscribe((item: any) => {
                  if (delivered(item)) resolve();
                });
                modelBarriers.add(sub);
              });
              try {
                await checked("previous model result stored", pending);
              } finally {
                sub.unsubscribe();
                modelBarriers.delete(sub);
              }
            }
          }
          modelRequests.push({
            input: request.input,
            connectionId: h.context.getRequest().get("acp-connection-id"),
            sessionId: f.manager.getCurrent().id,
          });
          ++turn;
          const current = f.manager.getCurrent();
          const call = (name: string, input: any) => [
            {
              type: "function_call",
              id: "parent-interaction-" + turn,
              callId: "parent-interaction-" + turn,
              name,
              arguments: JSON.stringify(input),
              status: "completed",
            },
          ];
          const output: any[] =
            askMode && turn === 1
              ? call("AskUserQuestion", {
                  questions: [
                    {
                      question: "Choose the parent approach?",
                      header: "Approach",
                      options: [
                        { label: "A", description: "first" },
                        { label: "B", description: "second" },
                      ],
                      multiSelect: false,
                    },
                  ],
                })
              : planMode && turn === 1
                ? call("DeferExecuteTool", {
                    toolName: "EnterPlanMode",
                    params: {},
                  })
                : planMode && turn === 2
                  ? call("Write", {
                      file_path: plans.getPlanFilePath(current),
                      content: "# Owned parent plan 中文😀\n",
                    })
                  : planMode && turn === 3
                    ? call("DeferExecuteTool", {
                        toolName: "ExitPlanMode",
                        params: {},
                      })
                    : turn === 1 || (mode === "write-always" && turn === 3)
                      ? [
                          {
                            type: "function_call",
                            id: writeMode
                              ? "parent-write-" + turn
                              : "parent-read",
                            callId: writeMode
                              ? "parent-write-" + turn
                              : "parent-read",
                            name: writeMode ? "Write" : "Read",
                            arguments: JSON.stringify(
                              writeMode
                                ? {
                                    file_path:
                                      turn === 1
                                        ? writeFile
                                        : writeFile + ".second",
                                    content: writeContent,
                                  }
                                : { file_path: file },
                            ),
                            status: "completed",
                          },
                        ]
                      : [
                          {
                            type: "message",
                            id: "parent-answer-" + turn,
                            role: "assistant",
                            status: "completed",
                            content: [
                              {
                                type: "output_text",
                                text: askMode
                                  ? "parent Ask done"
                                  : planMode
                                    ? "parent Plan done"
                                    : turn === 2
                                      ? writeMode
                                        ? "parent Write done"
                                        : "parent Read done"
                                      : "parent continued",
                              },
                            ],
                          },
                        ];
          if (scenario.modelLabel)
            for (const item of output) {
              if (item.id) item.id = scenario.modelLabel + "-" + item.id;
              if (item.callId)
                item.callId = scenario.modelLabel + "-" + item.callId;
            }
          yield { type: "response_started" };
          if (output[0]?.type === "message")
            yield {
              type: "output_text_delta",
              delta: output[0].content[0].text,
            };
          yield {
            type: "response_done",
            response: {
              id: "parent-response-" + turn,
              output,
              usage: { inputTokens: 13, outputTokens: 3, totalTokens: 16 },
            },
          } as any;
        },
      };
      const modules: any = {
        ...f.modules,
        28894: { jsonrepair },
        18553: f.originalSdk,
      };
      for (const id of [67330, 3927, 40038]) delete modules[id];
      const runnerAssembly = f.runHost.createRunner({
        sourceFactory: factories.runner,
        runtime: {
          modules,
          getModule: f.utilities.getModule,
          env: {},
          Date: f.runtime.Date,
        },
        modelProvider: { getModel: () => model },
        sessionManager: f.manager,
        agentManager: agents,
        productManager: { waitConfiguration: async () => product.raw },
        stateMachine: f.manager.stateMachine,
        logger: f.logger,
      });
      const runnerNative = runnerAssembly.native;
      f.di.set(runnerNative.getModule(67330).ContextCompactSummarizer, {
        compactAndSummarize: async () => {
          throw Error("Unexpected parent compact");
        },
      });
      f.service.runnerProvider = runnerAssembly.provider;
      for (const name of [
        "UserInputAgentRunInterceptor",
        "MessageQueueAgentRunInterceptor",
        "HistoryAgentRunInterceptor",
        "TelemetryAgentRunInterceptor",
        "StateAgentRunInterceptor",
      ]) {
        const i = f.interceptor(name);
        i.agentManager = agents;
        f.interceptors.push(i);
      }
      Object.assign(f.controller, {
        agentManager: agents,
        agentService: f.service,
      });
      Object.assign(f.middleware, {
        requestMatcher: h.matcher,
        pathResolver: h.pathResolver,
      });
      const interruption: any = factories.interruption(
        {
          service: f.service,
          getDefaultAgent: () => agents!.getDefault(),
          stateMachine: f.manager.stateMachine,
          getTasks: () => [],
          describeDeferredTool: () => undefined,
          isDeferredDispatchEnabled: () =>
            f.modules[93039].QueueDispatchUtils.isDeferredDispatchEnabledSync(),
          sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
          now: () => f.runtime.Date.now(),
          setImmediate: (callback) => setImmediate(callback),
          setTimeout: (callback, ms) => setTimeout(callback, ms),
          clearTimeout: (timer) => clearTimeout(timer),
          subscribe(session, callback) {
            const sub = session.resultSubject.subscribe((result: any) => {
              const operation = callback(result);
              interruptionJobs.add(operation);
              void operation.then(
                () => interruptionJobs.delete(operation),
                (error) => {
                  interruptionJobs.delete(operation);
                  errors.push(["interruption", error.message]);
                },
              );
              return operation;
            });
            interruptionSubscriptions.add(sub);
            return sub;
          },
          inputItemUtils: f.modules[93039].InputItemUtils,
          profiler: { markStart() {}, markEnd() {} },
          isMandatoryApprovalTarget: async () => false,
          cwd: () => f.cwd,
          logMcpUiDiag() {},
        },
        {
          logger: f.logger,
          stateMachine: f.manager.stateMachine,
          toolManager: tools,
          sessionHookManager: hooks.sessionManager,
          consoleManager: f.logger,
        },
      );
      const approvalServices = factories.approvals({
        permissions: {
          async applyUpdate(session: any, update: any) {
            await permissions!.initializeContext(session);
            return permissions!.service.applyUpdate(session, update);
          },
        },
        commands: permissions.commands.CommandUtils,
        getTasks: () => [],
        toolManager: tools,
        logger: f.logger,
        inputItemUtils: f.modules[93039].InputItemUtils,
      });
      interruption.toolAlwaysApprovalService = approvalServices.always;
      interruption.backgroundTaskToolApprovalService =
        approvalServices.background;
      f.manager.interruptionService = interruption;
      const tasks = new EventEmitter(),
        teamTokens = {
          TeamManager: Symbol("TeamManager"),
          TeamMailbox: Symbol("TeamMailbox"),
        };
      const parentModules: any = {
        ...f.modules,
        80699: { ...f.common, Deferred: h.native.common.Deferred },
        47005: h.native.getModule(47005),
        67062: {
          MediaType: {
            APPLICATION_JSON_UTF8: "application/json; charset=utf-8",
          },
          ...h.native.getModule(14516),
          ...h.native.getModule(78627),
        },
        29827: { BehaviorSubject },
        39983: { distinctUntilChanged },
        44093: { map },
        39023: { isDeepStrictEqual },
      };
      for (const id of [32917, 74183, 50744, 43533, 45654, 1562])
        delete parentModules[id];
      const parentNative = factories.parent({
        modules: parentModules,
        env: {},
        getModule: (id: number) => p!.base.getModule(id),
      });
      const placeholders: any = {
        67037: {},
        71915: {},
        7357: {},
        30654: {},
        95449: {},
        9151: { ProductManager: Symbol("ProductManager") },
        79814: { ExternalUriOpener: Symbol("ExternalUriOpener") },
        86480: { CliSettingsProvider: Symbol("CliSettingsProvider") },
        86482: auth.A,
        74183: { CliRuntimeOptions: parentNative.CliRuntimeOptions },
        32917: parentNative.endpoint,
        43533: parentNative.security,
        67062: parentModules[67062],
        68366: teamTokens,
        39983: { distinctUntilChanged },
        69745: { filter },
        47005: h.native.getModule(47005),
        54193: { getTeamMemberRegistry: () => ({ getAll: () => [] }) },
      };
      const acpSdk = factories.sdk({
        console: { error: (...args: any[]) => errors.push(["sdk", ...args]) },
      });
      class OwnedProtocolClock extends Date {
        constructor(value?: any) {
          super(value ?? f.runtime.Date.now());
        }
        static override now() {
          return f.runtime.Date.now();
        }
      }
      p = acpProtocolFixture(factories.protocol, {
        session: f.s,
        sessionManager: f.manager,
        stateMachine: f.manager.stateMachine,
        tasks,
        interruptionService: interruption,
        realTimers: true,
        Date: OwnedProtocolClock,
        modules: { ...placeholders, 38113: acpSdk },
      });
      p.setDependency(p.modules[40348].AskService, asks);
      Object.assign(p.modules[35151], {
        SettingsManager: Symbol("SettingsManager"),
        CliSettingsProvider: placeholders[86480].CliSettingsProvider,
      });
      const lifecycle = factories.lifecycle({
        getModule: p.base.getModule,
        modules: {
          ...p.modules,
          7357: undefined,
          95449: undefined,
          24618: { PermissionMode },
        },
      });
      Object.assign(
        placeholders[71915],
        lifecycle.getModule(99006),
        lifecycle.getModule(71389),
        { cancelSessionRuntimeState: lifecycle.cancelSessionRuntimeState },
      );
      Object.assign(placeholders[7357], lifecycle.getModule(7357));
      Object.assign(placeholders[30654], lifecycle.capability);
      Object.assign(placeholders[95449], lifecycle.getModule(95449));
      Object.assign(placeholders[54193], lifecycle.team);
      const protocolErrors = p.modules[93039].ErrorUtils;
      Object.assign(p.modules[93039], f.modules[93039], {
        ErrorUtils: protocolErrors,
      });
      p.setDependency(placeholders[71915].SessionManager, f.manager);
      p.setDependency(
        placeholders[71915].SessionRunStateMachine,
        f.manager.stateMachine,
      );
      p.setDependency(
        placeholders[71915].InterruptionService,
        p.interruptionService,
      );
      p.setDependency(p.base.getModule(69466).AgentManager, agents);
      p.setDependency(teamTokens.TeamManager, {
        isInTeam: () => false,
        getTeam: () => undefined,
      });
      p.setDependency(teamTokens.TeamMailbox, { getUnread: async () => [] });
      p.setDependency(
        p.p.protocol.DelegateToolManager,
        new DelegateToolManagerImpl(f.logger),
      );
      p.setDependency(p.modules[35151].SettingsManager, settings.manager);
      p.setDependency(placeholders[86480].CliSettingsProvider, settings.cli);
      p.setDependency(
        placeholders[30654].HostCapabilityProvider,
        new lifecycle.capability.HostCapabilityProvider(),
      );
      p.setDependency(placeholders[95449].ReferenceService, {
        setFileReferencesPathOnly() {},
      });
      p.setDependency(placeholders[79814].ExternalUriOpener, {
        urlSubject: new Subject(),
      });
      const productManager = { waitConfiguration: async () => product.raw };
      p.setDependency(placeholders[9151].ProductManager, productManager);
      p.setDependency(auth.A.AuthenticationManager, auth.manager);
      const commands = {
        getAll: async () => [],
        parseCommand: () => undefined,
      };
      p.setDependency(p.modules[87422].CommandManager, commands);
      services = createAcpServicesHost({
        backend: {
          stateMachine: f.manager.stateMachine,
          agents,
          service: f.service,
          sessions: f.manager,
          productManager,
        } as any,
        getModule: p.base.getModule,
        modules: p.modules,
        logger: f.logger,
        sourceFactory: factories.services,
      });
      p.modules[20881] = services.helpers.titleHelpers;
      const replayTrace = Symbol("owned replay trace"),
        replayTasks = Symbol("owned replay tasks"),
        replayCheckpoint = Symbol("owned replay checkpoint"),
        replayVersions = Symbol("owned replay versions");
      p.modules[57135] = { TaskStorageService: replayTasks };
      p.modules[6512] = {
        CheckpointService: replayCheckpoint,
        FileVersionStore: replayVersions,
      };
      p.setDependency(replayTasks, { list: async () => [] });
      p.setDependency(replayCheckpoint, {
        getLatestCheckpoint: () => undefined,
      });
      p.setDependency(replayVersions, { get: async () => undefined });
      p.setDependency(replayTrace, {
        startTrace() {
          const span: any = {
            setAttributes() {},
            markAsSuccessful() {},
            markAsFailed() {},
            startSpan() {
              return span;
            },
          };
          return span;
        },
      });
      Object.assign(
        placeholders[67037],
        factories.replay({
          ...p.runtime,
          env: {},
          Date: f.runtime.Date,
          modules: {
            ...p.modules,
            92735: {
              ...interactions.getModule(33563),
              TraceService: replayTrace,
            },
            82263: services.helpers.getModule(82263),
          },
          setTimeout(fn: () => void, ms: number) {
            const timer = setTimeout(() => {
              interactionTimers.delete(timer);
              fn();
            }, ms);
            interactionTimers.add(timer);
            return timer;
          },
        }).replay,
      );
      p.modules[76586] = {
        SessionTitleService: services.helpers.SessionTitleService,
      };
      p.setDependency(services.helpers.SessionTitleService, services.title);
      p.setDependency(
        p.p.protocol.AcpUsagePublisher,
        new Proxy(services.usage, {
          get(target, key) {
            const value = Reflect.get(target, key, target);
            if (key === "register")
              return (session: any, connection: any) => {
                registration.push({
                  session,
                  path: h.context.getRequest().path,
                });
                return value(session, connection);
              };
            return value;
          },
        }),
      );
      const connectionNative = factories.connections(p.runtime);
      const registry: any = new connectionNative.AcpAgentManagerImpl();
      registry.logger = f.logger;
      registry.init();
      registry.register(connectionId, p.agent);
      services.registerConnection(connectionId, p.agent);
      host = createAcpRendezvousHost({
        runtime: p.runtime,
        agentManager: registry,
        logger: f.logger,
        sourceFactory: factories.protocol.view,
        dependencies: {
          sessionManager: f.manager,
          stateMachine: f.manager.stateMachine,
          agentService: f.service,
          commandManager: commands,
          interruptionService: p.interruptionService,
          taskStorage: { getBySession: () => [] },
          broadcastService: services.broadcast,
          frictionAnalysisService: services.friction,
        },
      });
      endpoint = new acpSdk.AgentSideConnection(
        (connection: any) => {
          p!.agent.setConnection(connection, connectionId);
          return host!.rpcAgent(p!.agent);
        },
        { readable: toAgent.readable, writable: toClient.writable },
      );
      client = new acpSdk.ClientSideConnection(
        () => ({
          sessionUpdate: async (update: any) => updates.push(update),
          requestPermission: async (request: any) => {
            if (askMode || planMode) {
              const session = host!.getEntry(connectionId)!.session;
              const item = session.interruptionSubject.value;
              assert.equal(interruption.pending$.value.item, item);
              assert.equal(interruption.findSessionByItem(item), session);
              reviewedState = session.state;
              reviewResumeIndex = resumedStates.length;
              reviews.push({
                options: request.options,
                actualPending: true,
                tool: request.toolCall._meta["codebuddy.ai/toolName"],
              });
              if (askMode) {
                assert.equal(
                  request.toolCall._meta["codebuddy.ai/toolName"],
                  "AskUserQuestion",
                );
                assert.equal(asks.getCurrentAskItem(), item);
                if (mode === "ask-cancel") {
                  await checked(
                    "cancel Ask",
                    client.cancel({ sessionId: session.id }),
                  );
                  return { outcome: { outcome: "cancelled" } };
                }
                const resolved: any = await checked(
                  "answer through ACP extension",
                  client.extMethod("_codebuddy.ai/resolveInterruption", {
                    sessionId: session.id,
                    toolCallId: request.toolCall.toolCallId,
                    decision: mode === "ask-skip" ? "deny" : "allow",
                    ...(mode === "ask-answer"
                      ? {
                          answers: { q_0: ["owned human free text", "中文😀"] },
                        }
                      : {}),
                  }),
                );
                assert.equal(resolved.resolved, true);
                // The local extension already decided. Settle the borrowed RPC;
                // the source's localDecided race, not this fallback, owns approval.
                return { outcome: { outcome: "cancelled" } };
              }
              assert.equal(
                request.toolCall._meta["codebuddy.ai/toolName"],
                "DeferExecuteTool",
              );
              if (request.toolCall.rawInput.toolName === "EnterPlanMode") {
                assert.equal(
                  session.permissionModeSubject.value,
                  PermissionMode.Default,
                );
                assert.equal(plans.getPlanFilePath(session), undefined);
                return { outcome: { outcome: "selected", optionId: "allow" } };
              }
              assert.equal(request.toolCall.rawInput.toolName, "ExitPlanMode");
              assert.equal(
                session.permissionModeSubject.value,
                PermissionMode.Plan,
              );
              assert.equal(
                await plans.read(session),
                "# Owned parent plan 中文😀\n",
              );
              if (mode === "plan-exit-reject") {
                assert.ok(
                  !request.options.some(
                    (o: any) => o.optionId === "reject_and_exit_plan",
                  ),
                  "source only advertises the extra exit option for a direct ExitPlanMode call",
                );
                const resolved: any = await checked(
                  "reject and exit through ACP extension",
                  client.extMethod("_codebuddy.ai/resolveInterruption", {
                    sessionId: session.id,
                    toolCallId: request.toolCall.toolCallId,
                    decision: "rejectAndExitPlan",
                  }),
                );
                assert.equal(resolved.resolved, true);
                return { outcome: { outcome: "cancelled" } };
              }
              return {
                outcome: {
                  outcome: "selected",
                  optionId: mode === "plan-allow" ? "allow" : "reject",
                },
              };
            }
            assert.equal(writeMode, true, "Read must not request approval");
            assert.equal(
              request.toolCall._meta["codebuddy.ai/toolName"],
              "Write",
            );
            assert.equal(request.toolCall.toolCallId, "parent-write-1");
            assert.equal(request.toolCall.rawInput.file_path, writeFile);
            await assert.rejects(io.access(writeFile));
            const session = host!.getEntry(connectionId)!.session;
            reviewedState = session.state;
            reviewResumeIndex = resumedStates.length;
            assert.ok(reviewedState instanceof f.originalSdk.RunState);
            assert.equal(
              session.permissionModeSubject.value,
              PermissionMode.Default,
            );
            assert.equal(
              interruption.pending$.value.item,
              session.interruptionSubject.value,
            );
            assert.equal(
              interruption.findSessionByItem(session.interruptionSubject.value),
              session,
            );
            reviews.push({
              options: request.options,
              beforeWrite: false,
              actualPending: true,
            });
            if (mode === "write-cancel")
              await checked(
                "cancel during approval",
                client.cancel({ sessionId: session.id }),
              );
            return mode === "write-cancel"
              ? { outcome: { outcome: "cancelled" } }
              : {
                  outcome: {
                    outcome: "selected",
                    optionId:
                      mode === "write-always"
                        ? "allow_always"
                        : writeAllowed
                          ? "allow"
                          : "reject",
                  },
                };
          },
        }),
        { readable: toClient.readable, writable: toAgent.writable },
      );
      let origin = "";
      const restFactory = parentNative.rest.RestOperationsFactory;
      p.modules[67062].RestOperationsFactory = restFactory;
      p.modules[67062].HttpHeaders = h.native.getModule(14516).HttpHeaders;
      p.modules[67062].HttpStatus = h.native.getModule(78627).HttpStatus;
      parentModules[33584] = {
        default: {
          create: () => ({
            post(target: string, body: any, options: any) {
              restCalls.push({ body, options });
              return h.post(target, body, options);
            },
          }),
        },
      };
      const rest = new parentNative.DefaultRestOperationsFactory();
      rest.clientConfig = {};
      p.setDependency(restFactory, rest);
      const endpointProvider = new parentNative.EndpointProviderImpl();
      p.setDependency(placeholders[32917].EndpointProvider, endpointProvider);
      const cliOptions = new parentNative.CliRuntimeOptions();
      cliOptions.set({
        cwd: f.cwd,
        model: product.raw.models[0]!.id,
        print: false,
        inputFormat: "stream-json",
      });
      p.setDependency(placeholders[74183].CliRuntimeOptions, cliOptions);
      const errorHandler = new parentNative.CliServerErrorHandler();
      errorHandler.logger = f.logger;
      origin = await h.start({
        controller: f.controller,
        sessionMiddleware: f.middleware,
        views: [host.view],
        defaultViewName: "acp",
        errorHandlers: [errorHandler],
        pipeManager: { apply: async () => {} },
        endpointProvider,
      });
      const initialized: any = await checked(
        "initialize",
        client.initialize({
          protocolVersion: 1,
          clientCapabilities: { _meta: { "codebuddy.ai": { question: true } } },
        }),
      );
      assert.equal(initialized.protocolVersion, 1);
      const entrance = scenario.entrance ?? { method: "new" };
      const result: any = await checked(
        "session entrance",
        entrance.method === "load"
          ? client.loadSession({
              cwd: f.cwd,
              mcpServers: [],
              sessionId: entrance.sessionId,
            })
          : entrance.method === "resume"
            ? client.resumeSession({
                cwd: f.cwd,
                mcpServers: [],
                sessionId: entrance.sessionId,
              })
            : client.newSession({
                cwd: f.cwd,
                mcpServers: [],
                ...(entrance.method === "continue"
                  ? { _meta: { "codebuddy.ai/continue": true } }
                  : {}),
              }),
      );
      assert.equal(restCalls.length, 1);
      assert.equal(restCalls[0].body.acp, true);
      assert.equal(restCalls[0].body.interactive, false);
      assert.equal(restCalls[0].options.proxy, false);
      assert.equal(
        restCalls[0].options.headers["acp-connection-id"],
        connectionId,
      );
      assert.equal(restCalls[0].body.prompt, undefined);
      assert.equal(restCalls[0].body.cwd, undefined);
      assert.equal(restCalls[0].body.print, undefined);
      const entry = host.getEntry(connectionId);
      assert.equal(entry?.ready, true);
      const session = entry!.session;
      assert.notEqual(session, f.s);
      if (entrance.method === "new") assert.equal(session.id, result.sessionId);
      else assert.equal(session.id, entrance.sessionId);
      assert.equal(registration[0].session, session);
      assert.equal(registration[0].path, "/internal/agent");
      assert.equal(httpRequests[0].response.writableEnded, false);
      assert.equal(p.agent.getCurrentSessionId(), session.id);
      assert.equal(p.agent.getSessionRequest(), undefined);
      async function finishOwnedParent() {
        h.stopAccepting();
        await host!.close();
        await h.close();
        await Promise.allSettled([...interruptionJobs]);
        for (const sub of interruptionSubscriptions) sub.unsubscribe();
        assert.equal(httpRequests[0].response.writableEnded, true);
        assert.equal(host!.pendingCount, 0);
        assert.equal(host!.timerCount, 0);
        assert.equal(host!.rawView.activeRenderConnections.size, 0);
        assert.equal(tasks.eventNames().length, 0);
        assert.equal(host!.asynchronousErrors.length, 0);
        assert.equal(f.errors.length, 0);
        assert.deepEqual(p!.host.errors, []);
        assert.deepEqual(h.errors, []);
        assert.equal(h.pendingDispatchCount, 0);
        assert.equal(h.pendingTransportCount, 0);
        assert.equal(h.hookCount, 0);
        assert.equal(h.listening, false);
        assert.equal(
          errors.filter((e) => !expectedProtocolDiagnostics.has(e)).length,
          0,
          JSON.stringify(errors),
        );
      }
      if (scenario.run) {
        const customResult = await scenario.run({
          client,
          session,
          result,
          agent: p.agent,
          manager: f.manager,
          store: f.store,
          host,
          fixture: f,
          updates,
          modelRequests,
          httpRequests,
          restCalls,
          cliOptions,
          checked,
          async expectProtocolFailure(
            method: string,
            code: number,
            operation: () => Promise<any>,
          ) {
            const before = errors.length;
            await assert.rejects(operation(), (e: any) => e.code === code);
            assert.equal(errors.length, before + 1);
            const diagnostic = errors[before];
            assert.equal(diagnostic[0], "sdk");
            assert.equal(diagnostic[1], "Error handling request");
            assert.equal(diagnostic[2].method, method);
            assert.equal(diagnostic[3].code, code);
            expectedProtocolDiagnostics.add(diagnostic);
            return diagnostic[3];
          },
          async postInternal(body: any) {
            return rest.create().post(origin + "/internal/agent", body, {
              headers: parentNative.security.withSecurityHeader({
                "content-type": "application/json",
                "acp-connection-id": connectionId,
              }),
              proxy: false,
            });
          },
        });
        await f.drain();
        await finishOwnedParent();
        return {
          scenario: entrance.method,
          customResult,
          modelRequests: modelRequests.length,
          sourceRenderCleaned: true,
        };
      }
      assert.equal(result.modes.currentModeId, "default");
      assert.equal(result.models.currentModelId, product.raw.models[0]!.id);
      const responses: any[] = [];
      for (const text of askMode || planMode
        ? ["owned parent interaction"]
        : writeMode
          ? mode === "write-always"
            ? ["write owned parent file", "write another owned parent file"]
            : ["write owned parent file"]
          : ["read parent file", "continue parent conversation"]) {
        responses.push(
          await checked(
            "prompt",
            client.prompt({
              sessionId: session.id,
              prompt: [{ type: "text", text }],
            }),
          ),
        );
        await f.drain();
      }
      assert.ok(
        responses.every(
          (r) =>
            r.stopReason ===
            ((writeMode && !writeAllowed) ||
            mode === "ask-cancel" ||
            (planMode && mode !== "plan-allow")
              ? "cancelled"
              : "end_turn"),
        ),
        JSON.stringify({ responses, errors, logs: p.logs.slice(-8) }),
      );
      assert.equal(
        modelRequests.length,
        askMode
          ? mode === "ask-cancel"
            ? 1
            : 2
          : planMode
            ? mode === "plan-allow"
              ? 4
              : 3
            : writeMode
              ? mode === "write-always"
                ? 4
                : writeAllowed
                  ? 2
                  : 1
              : 3,
      );
      assert.ok(modelRequests.every((r) => r.connectionId === connectionId));
      if (!approvalMode)
        assert.match(
          JSON.stringify(modelRequests.at(-1).input),
          /parent Read done/,
        );
      if (writeMode) {
        assert.equal(reviews.length, 1);
        assert.ok(decisions.some((d) => d.name === "Write" && d.needsApproval));
        if (writeAllowed)
          assert.equal(await io.readFile(writeFile, "utf8"), writeContent);
        else await assert.rejects(io.access(writeFile));
        assert.equal(resumedStates.includes(reviewedState), writeAllowed);
        if (mode === "write-always") {
          await permissions.waitForUpdates();
          assert.equal(
            await io.readFile(writeFile + ".second", "utf8"),
            writeContent,
          );
          assert.ok(
            decisions.some(
              (d) =>
                d.name === "Write" &&
                d.callId === "parent-write-3" &&
                !d.needsApproval,
            ),
          );
          assert.equal(
            approvalServices.always.isApproved(session, {
              rawItem: { name: "Write" },
            }),
            true,
          );
          assert.ok(
            JSON.stringify(session.toolPermissionContext.allowRules).includes(
              "Write",
            ),
          );
          assert.equal(
            await settings.manager.get("permissions", "project"),
            undefined,
            "ACP Always Allow is session-only, not a persisted project grant",
          );
        }
        assert.equal(interruption.pending$.value, undefined);
        assert.equal(interruption.interruptionQueues.size, 0);
        assert.equal(interruption.itemToSessionMap.size, 0);
        assert.equal(session.interruptionSubject.value, undefined);
      }
      let interactionResult: any;
      if (askMode || planMode) {
        assert.equal(reviews.length, planMode ? 2 : 1);
        assert.equal(interruption.pending$.value, undefined);
        assert.equal(interruption.interruptionQueues.size, 0);
        assert.equal(interruption.itemToSessionMap.size, 0);
        assert.equal(
          resumedStates.slice(reviewResumeIndex).includes(reviewedState),
          mode === "ask-answer" || mode === "ask-skip" || mode === "plan-allow",
        );
        if (askMode && mode !== "ask-cancel") {
          const input = JSON.stringify(modelRequests.at(-1).input);
          assert.match(
            input,
            mode === "ask-skip"
              ? /chose not to answer/
              : /Choose the parent approach.*owned human free text, 中文😀/,
          );
          assert.deepEqual(asks.getRoutingState().waitingDeferredKeys, []);
          assert.deepEqual(asks.getRoutingState().earlyAnswerKeys, []);
        }
        if (askMode)
          assert.equal(
            executedTools.filter((name) => name === "AskUserQuestion").length,
            mode === "ask-cancel" ? 0 : 1,
          );
        if (planMode) {
          assert.equal(
            session.usage.totalTokens,
            modelRequests.length * 16,
            "all owned model usage is retained, not normalized out of comparison",
          );
          assert.equal(
            executedTools.filter((name) => name === "EnterPlanMode").length,
            1,
          );
          assert.equal(
            executedTools.filter((name) => name === "Write").length,
            1,
          );
          assert.equal(
            executedTools.filter((name) => name === "ExitPlanMode").length,
            mode === "plan-allow" ? 1 : 0,
          );
          assert.equal(
            session.permissionModeSubject.value,
            mode === "plan-allow" || mode === "plan-exit-reject"
              ? PermissionMode.Default
              : PermissionMode.Plan,
          );
          assert.equal(
            await plans.read(session),
            "# Owned parent plan 中文😀\n",
          );
        }
        interactionResult = {
          reviews,
          mode: session.permissionModeSubject.value,
          answersConsumed: askMode && mode !== "ask-cancel",
          planPreserved: planMode,
          sameStateResumed: resumedStates
            .slice(reviewResumeIndex)
            .includes(reviewedState),
          executedTools,
        };
      }
      assert.ok(
        modelRequests.every(
          (r) =>
            !JSON.stringify(r.input).includes(capability) &&
            !JSON.stringify(r.input).includes(authToken),
        ),
      );
      const disk = await io.readFile(
        f.store.getSessionFilePath(session.id),
        "utf8",
      );
      if (!approvalMode) {
        assert.match(disk, /owned native parent Read/);
        assert.match(disk, /parent continued/);
      } else if (writeAllowed) assert.match(disk, /parent Write done/);
      if (askMode && mode !== "ask-cancel")
        assert.match(disk, /parent Ask done/);
      if (planMode && mode === "plan-allow")
        assert.match(disk, /parent Plan done/);
      let switched: any;
      if (mode === "switch") {
        const next: any = await checked(
          "newSession switch",
          client.newSession({ cwd: f.cwd, mcpServers: [] }),
        );
        const second = host.getEntry(connectionId)!.session;
        assert.notEqual(second, session);
        assert.equal(second.id, next.sessionId);
        assert.equal(session.resultSubject.isStopped, true);
        assert.equal(httpRequests.length, 2);
        assert.equal(httpRequests[0].response.writableEnded, false);
        assert.equal(httpRequests[1].response.writableEnded, true);
        assert.equal(host.iteratorCount, 1);
        assert.equal(host.rawView.activeRenderConnections.size, 1);
        const reply: any = await checked(
          "switched prompt",
          client.prompt({
            sessionId: second.id,
            prompt: [{ type: "text", text: "fresh parent conversation" }],
          }),
        );
        await f.drain();
        assert.equal(reply.stopReason, "end_turn");
        assert.equal(modelRequests.length, 4);
        assert.equal(modelRequests.at(-1).sessionId, second.id);
        assert.ok(
          !JSON.stringify(modelRequests.at(-1).input).includes(
            "parent Read done",
          ),
        );
        assert.ok(
          !JSON.stringify(modelRequests.at(-1).input).includes(
            "owned native parent Read",
          ),
        );
        assert.equal(second.usage.totalTokens, 16);
        switched = {
          freshHistory: true,
          duplicateHttpEnded: true,
          originalHttpOpen: true,
          currentTargetUpdated: true,
        };
      }
      await finishOwnedParent();
      return {
        mode,
        newSession: true,
        nativeSession: true,
        responseBeforeHttpEnd: true,
        registrationPath: registration[0].path,
        ready: entry!.ready,
        stopReasons: responses.map((r) => r.stopReason),
        modelRequests: modelRequests.length,
        requestContexts: modelRequests.map((r) => r.connectionId),
        persistedRead: true,
        usage: session.usage.totalTokens,
        restoredCurrent: result.models.currentModelId,
        sourceRenderCleaned: true,
        switched,
        ...(interactionResult ? { interaction: interactionResult } : {}),
        ...(writeMode
          ? {
              approval: {
                reviews,
                decisions,
                wrote: writeAllowed,
                sameStateResumed: writeAllowed,
                sessionRuleReused: mode === "write-always",
                queueCleared: true,
              },
            }
          : {}),
      };
    } finally {
      await host?.close();
      await Promise.allSettled([...interruptionJobs]);
      for (const sub of interruptionSubscriptions) sub.unsubscribe();
      await h.close();
      await services?.close();
      if (client && endpoint) {
        await Promise.allSettled([
          client.connection.writeQueue,
          endpoint.connection.writeQueue,
        ]);
        const a = toAgent.writable.getWriter(),
          b = toClient.writable.getWriter();
        try {
          await Promise.allSettled([a.close(), b.close()]);
        } finally {
          a.releaseLock();
          b.releaseLock();
        }
        await Promise.all([client.closed, endpoint.closed]);
      }
      p?.agent.urlSubjectSubscription?.unsubscribe();
      await p?.close();
      if (asks) {
        for (const id of asks.getRoutingState().waitingDeferredKeys)
          asks.rejectAsk(id);
        asks.rejectAsk();
        asks.cleanup();
        asks.flushPendingWaitSpans("owned close");
        asks.currentItem$.complete();
      }
      for (const timer of interactionTimers) clearTimeout(timer);
      for (const sub of modelBarriers) sub.unsubscribe();
      await permissions?.waitForUpdates();
      await hooks?.close();
      await settings?.close();
      await auth.close();
      await h.close();
      await f.close();
      await agents?.close();
    }
  });
}
