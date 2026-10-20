// Explicit owned component-test DI. Not a production parent runtime, account manager, or telemetry transport.
import * as fs from "node:fs";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { AsyncLocalStorage } from "node:async_hooks";
import * as sdk from "@openai/agents-core";
import { sessionIngressFixture } from "./session-ingress-fixture.js";
import { createNativeSessionStack } from "../../src/sessions/native-session-stack.js";
import { manualTimers } from "./session-result-fixtures.js";
import { createInputProcessorUtilities } from "../../src/sessions/input-processor-utils.js";
import { createContentFilterInputUtils } from "../../src/sessions/content-filter-input-utils.js";
import { ModelErrorUtils } from "../../src/models/model-error-utils.js";
import { RunResultUtils } from "../../src/agents/run-result-utils.js";
import * as history from "../../src/sessions/history-utils.js";
import { DefaultInputItemProcessor } from "../../src/sessions/default-input-item-processor.js";
import { ParentIdLinkageProcessor } from "../../src/sessions/parent-id-linkage-processor.js";
import { UsageAgentInputItemProcessor } from "../../src/sessions/usage-agent-input-item-processor.js";
import { SessionRunStateMachine } from "../../src/sessions/run-state-machine.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { createAutoMemoryUtilities } from "../../src/memory/auto-memory-utilities.js";
import { createBlobRuntime } from "../../src/blobs/blob-runtime.js";
import { BlobStoreImpl } from "../../src/blobs/blob-store-impl.js";
import { ImageBlobServiceImpl } from "../../src/blobs/image-blob-service-impl.js";
import { ToolResultBlobServiceImpl } from "../../src/blobs/tool-result-blob-service-impl.js";

export async function sessionStackFixture(
  factory = createNativeSessionStack,
  patch: any = {},
) {
  const root =
    patch.ownedRoot ??
    (await io.mkdtemp(path.join(tmpdir(), "axonfire-source-sessions-")));
  const projects = path.join(root, "projects"),
    project = path.join(projects, "owned"),
    cwd = path.join(root, "cwd");
  await io.mkdir(project, { recursive: true });
  await io.mkdir(cwd, { recursive: true });
  const ingress = sessionIngressFixture(patch.ingressFactory, {
      httpModule: patch.httpModule,
      uuidPrefix: patch.uuidPrefix,
    }),
    calls: any[] = [],
    logs = ingress.logs,
    pending = new Set<Promise<any>>(),
    errors: any[] = [],
    sessions = new Set<any>(),
    timers = manualTimers();
  let closed = false;
  function track(value: any) {
    if (value && typeof value.then === "function") {
      pending.add(value);
      value.then(
        () => pending.delete(value),
        (error: any) => {
          pending.delete(value);
          errors.push(error);
        },
      );
    }
    return value;
  }
  const utilities: any = ingress.runtime.modules[93039],
    common = ingress.runtime.modules[80699];
  const input = createInputProcessorUtilities();
  const filter = createContentFilterInputUtils(common.generateUUUID);
  Object.assign(filter, { isCustomInputItem: history.isCustomHistoryItem });
  const title = createNativeAcpServices({ getModule: () => ({}) });
  Object.assign(utilities, {
    InputItemUtils: filter,
    RunResultUtils,
    ErrorUtils: ModelErrorUtils,
    HistoryUtils: {
      ...history,
      hasRealUserMessageItem: (items: any[]) =>
        items.some((item) => filter.isRealUserMessageItem(item)),
    },
    SessionUtils: input.SessionUtils,
    PathUtils: {
      getHomeProjectDir: () => project,
      getHomeProjectsDir: () => projects,
      getWorkDir: () => cwd,
      compressPath: createAutoMemoryUtilities({}).PathUtils.compressPath,
    },
  });
  const attributes = new AsyncLocalStorage<Map<any, any>>(),
    scope = Symbol("owned request scope");
  const ToolPermissionService = Symbol("owned permission service"),
    CheckpointService = Symbol("owned checkpoint"),
    TeamInboxDispatchService = Symbol("owned inbox"),
    TerminalTitleUpdater = Symbol("owned terminal title");
  const modules: any = {
    ...ingress.runtime.modules,
    79896: fs,
    91943: { ...io, ...patch.io },
    16928: path,
    94317: { AsyncLocalStorage },
    18553: sdk,
    47005: patch.httpModule ?? {
      AttributeScope: { Request: scope },
      Context: {
        getAttr(key: any, requested: any) {
          if (requested !== scope) throw Error("unexpected attribute scope");
          return attributes.getStore()?.get(key);
        },
        setAttr(key: any, value: any, requested: any) {
          if (requested !== scope || !attributes.getStore())
            throw Error("no owned request context");
          attributes.getStore()!.set(key, value);
        },
      },
    },
    6350: { ToolPermissionService },
    15315: { CheckpointService },
    68366: { TeamInboxDispatchService },
    94460: { TerminalTitleUpdater },
    20881: title.titleHelpers,
    38195: { NotificationType: { IDLE_PROMPT: "idle_prompt" } },
    69466: { AgentNames: { COMPACT: "compact" } },
  };
  const n = factory({
    ...ingress.runtime,
    modules,
    env: patch.env ?? {},
    argv: patch.argv ?? [],
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });
  const manager: any = new n.SessionManagerImpl(),
    store: any = new n.SessionStoreImpl();
  const blobRuntime = createBlobRuntime(root, project, {
    env: { CODEBUDDY_TOOL_RESULT_THRESHOLD_KB: "1" },
    logger: { ...ingress.controller.logger, setContext() {} },
  });
  const blobStore = new BlobStoreImpl(blobRuntime),
    imageBlobService = new ImageBlobServiceImpl(blobRuntime, { blobStore }),
    toolResultBlobService = new ToolResultBlobServiceImpl(blobRuntime);
  toolResultBlobService.init();
  const sessionFactory = {
    async create(seed: any) {
      const s = await ingress.sessionFactory.create(seed);
      sessions.add(s);
      // Observe the actual RX callback, preserving its return and real subscription. No source body is replaced.
      const subscribe = s.resultSubject.subscribe.bind(s.resultSubject);
      s.resultSubject.subscribe = (callback: any, ...rest: any[]) =>
        typeof callback === "function"
          ? subscribe((value: any) => track(callback(value)), ...rest)
          : subscribe(callback, ...rest);
      return s;
    },
  };
  const initializeContext = async (s: any) => {
    calls.push(["permissions", s.id]);
    await patch.permissions?.(s);
  };
  ingress.di.set(ToolPermissionService, { initializeContext });
  ingress.di.set(CheckpointService, {
    createCheckpoint: async (s: any) => {
      calls.push(["checkpoint", s.id]);
      await patch.checkpoint?.(s);
    },
  });
  ingress.di.set(TeamInboxDispatchService, {
    register: (s: any) => calls.push(["inbox", s.id]),
  });
  ingress.di.set(modules[99006].IdleQueueDrainService, {
    register: (s: any) => calls.push(["queueDrain", s.id]),
  });
  ingress.di.set(TerminalTitleUpdater, {
    update: (value: string) => calls.push(["title", value]),
  });
  const defaultProcessor = new DefaultInputItemProcessor({
    generateUUUID: common.generateUUUID,
    now: ingress.runtime.Date.now,
    productManager: { waitConfiguration: async () => ({ agents: [] }) },
  });
  const processors = [
    defaultProcessor,
    new ParentIdLinkageProcessor(),
    new UsageAgentInputItemProcessor(),
  ];
  Object.assign(manager, {
    sessionFactory,
    sessionStore: store,
    logger: ingress.controller.logger,
    stateMachine: new SessionRunStateMachine(ingress.controller.logger),
    userStateManager: {
      incrementSession: async () => {
        calls.push(["sessionCount"]);
        await patch.increment?.();
      },
    },
    progressSyncService: {
      start: (s: any) =>
        track(
          (async () => {
            calls.push(["progressStart", s.id]);
            await patch.progressStart?.(s);
          })(),
        ),
      stop: (id: string) => {
        calls.push(["progressStop", id]);
        patch.progressStop?.(id);
      },
    },
    cronSchedulerService: {
      start: (s: any) => calls.push(["cronStart", s.id]),
      stop: (id: string) => calls.push(["cronStop", id]),
    },
    agentTaskManager: {
      clearBySession: (id: string) =>
        track(
          (async () => {
            calls.push(["clearTasks", id]);
            await patch.clearTasks?.(id);
          })(),
        ),
    },
    interruptionService: { waitFor: (s: any) => calls.push(["waitFor", s.id]) },
    agentInputItemProcessorProvider: {
      sortSync: () => patch.processors ?? processors,
    },
    sessionHookManager: {
      executeUserPromptSubmitHooks: async (s: any, items: any[]) => {
        calls.push(["userHook", s.id, items.length]);
        await patch.userHook?.(s, items);
      },
      executeSessionStartHooks: async (s: any, reason: string) => {
        calls.push(["sessionHook", s.id, reason]);
        await patch.sessionHook?.(s, reason);
      },
      executeNotificationHooks: async (s: any, message: string, type: string) =>
        calls.push(["notification", s.id, message, type]),
    },
    interceptors: patch.interceptors ?? [],
    telemetryService: Object.fromEntries(
      [
        "reportChatRequestResponseTelemetry",
        "reportChatMessageStatus",
        "reportMessageResponseTelemetryStream",
      ].map((name) => [
        name,
        async (s: any) => calls.push(["telemetry", name, s.id]),
      ]),
    ),
    galileoSessionBridge: Object.fromEntries(
      [
        "emitRequestStart",
        "emitMessageStart",
        "emitRequestSuccess",
        "addRequestSuccessSpanEvent",
        "emitRequestError",
        "addRequestErrorSpanEvent",
        "emitMessageError",
        "addMessageErrorSpanEvent",
        "emitMessageSuccess",
        "addMessageSuccessSpanEvent",
      ].map((name) => [name, (s: any) => calls.push(["galileo", name, s.id])]),
    ),
  });
  Object.assign(store, {
    sessionFactory,
    logger: ingress.controller.logger,
    imageBlobService,
    toolResultBlobService,
  });
  Object.assign(ingress.middleware, {
    sessionManager: manager,
    toolPermissionService: { initializeContext },
  });
  ingress.controller.sessionManager = manager;
  async function drain() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  function normalize(value: any): any {
    return JSON.parse(
      JSON.stringify(value, (_key, v) =>
        typeof v === "string"
          ? v.split(root).join("OWNED")
          : v instanceof Error
            ? { message: v.message }
            : v,
      ),
    );
  }
  async function close() {
    if (closed) return;
    closed = true;
    for (const s of sessions) s.abortController.abort();
    await drain();
    for (const sub of manager.resultSubscriptions.values()) sub.unsubscribe();
    manager.resultSubscriptions.clear();
    timers.pending.clear();
    for (const s of sessions)
      for (const name of [
        "resultSubject",
        "inputSubject",
        "historyReloadSubject",
        "modelSubject",
        "backgroundTaskSubject",
        "agentStateSubject",
        "interruptionSubject",
        "localExecuteSubject",
        "permissionModeSubject",
        "queueSubject",
        "combineSubject",
        "runStateSubject",
        "progressSubject",
        "phaseSubject",
        "queuedTextRefillRequest$",
      ])
        s[name]?.complete();
    manager.sessionSubject.complete();
    manager.context.disable();
    manager.skipHistoryContext.disable();
    attributes.disable();
    if (patch.ownedRoot) return;
    if (
      path.dirname(root) !== tmpdir() ||
      !path.basename(root).startsWith("axonfire-source-sessions-")
    )
      throw Error("invalid owned cleanup target");
    await io.rm(root, { recursive: true, force: true });
  }
  return {
    ...ingress,
    n,
    manager,
    store,
    sessionFactory,
    calls,
    logs,
    root,
    projects,
    project,
    cwd,
    timers,
    attributes,
    modules,
    errors,
    pending,
    processors,
    imageBlobService,
    toolResultBlobService,
    normalize,
    drain,
    close,
  };
}
