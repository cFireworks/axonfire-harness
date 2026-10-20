// Owned, explicit test-boundary services. This is not the original parent runtime or account manager.
import { BehaviorSubject, Subject, ReplaySubject } from "rxjs";
import { Usage } from "@openai/agents-core";
import { createNativeSessionIngress } from "../../src/sessions/native-session-ingress.js";
import { createNativeAcpLifecycle } from "../../src/protocol/native-acp-lifecycle.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { createCapturedAcpModules } from "../../src/protocol/captured-acp-modules.js";
import { createNativePermissionUtils } from "../../src/permissions/native-permission-utils.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import * as toolSpecs from "../../src/tools/native-tool-specs.js";
import { getActiveAgentOnlyHistory } from "../../src/sessions/history-utils.js";

export function sessionIngressFixture(
  factory = createNativeSessionIngress,
  patch: any = {},
) {
  const calls: any[] = [],
    logs: any[] = [],
    scheduled: Array<() => Promise<any>> = [],
    sessions = new Map<string, any>(),
    di = new Map<any, any>();
  let serial = 0;
  class Clock extends Date {
    static override now() {
      return 1700000000000;
    }
  }
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error"].map((name) => [
      name,
      (...args: any[]) => logs.push([name, ...args]),
    ]),
  ) as any;
  const common = {
    CustomError: class extends Error {},
    generateUUUID: () => "owned-" + ++serial,
    ContainerUtil: {
      get(token: any) {
        if (!di.has(token)) throw Error("Explicit fixture DI missing");
        return di.get(token);
      },
    },
  };
  const lifecycle = createNativeAcpLifecycle({
    modules: { 92537: { Subject }, 47005: { BODY_MIDDLEWARE_PRIORITY: 200 } },
  });
  const services = createNativeAcpServices({
    modules: {
      18553: { Usage },
      21580: { HistoryUtils: { getActiveAgentOnlyHistory } },
    },
    getModule: () => ({}),
  });
  const captured = createCapturedAcpModules({ os: {}, fs: {} });
  const runtime = {
    Date: Clock,
    setImmediate(callback: () => Promise<any>) {
      scheduled.push(callback);
      return scheduled.length;
    },
    modules: {
      53766: { StartupProfiler: Symbol("profiler") },
      28579: { PluginRuntimeRefreshService: Symbol("plugins") },
      93039: {
        createAbortController: () => new AbortController(),
        HistoryUtils: { getActiveAgentOnlyHistory },
        UsageUtils: services.UsageUtils,
        PermissionUtils: createNativePermissionUtils({}),
        StreamJsonUtils: captured.getModule(56037).StreamJsonUtils,
      },
      8844: toolSpecs,
      35151: { PermissionMode },
      92537: { Subject },
      57804: { ReplaySubject },
      29827: { BehaviorSubject },
      99006: lifecycle.getModule(99006),
      71389: lifecycle.getModule(71389),
      80699: common,
    },
  };
  const n = factory(runtime),
    sessionFactory: any = new n.SessionFactoryImpl(),
    middleware: any = new n.SessionMiddleWare(),
    controller: any = new n.AgentController();
  di.set(runtime.modules[28579].PluginRuntimeRefreshService, {
    waitForRefreshSettled: async () => {
      calls.push(["plugins"]);
      await patch.refresh?.();
    },
  });
  di.set(runtime.modules[53766].StartupProfiler, {
    markStart: (...args: any[]) => calls.push(["markStart", ...args]),
    markEnd: (...args: any[]) => calls.push(["markEnd", ...args]),
  });
  const manager = {
    sessionSubject: new BehaviorSubject<any>(undefined),
    getCurrent() {
      return this.sessionSubject.value;
    },
    setCurrent(session: any) {
      calls.push(["setCurrent", session.id]);
      this.sessionSubject.next(session);
    },
    async create(seed: any) {
      calls.push(["create", seed]);
      const s = await sessionFactory.create(seed);
      sessions.set(s.id, s);
      return s;
    },
    async get(id: string) {
      calls.push(["get", id]);
      return sessions.get(id);
    },
    async getMostRecent() {
      calls.push(["recent"]);
      return [...sessions.values()].at(-1);
    },
    async save(s: any, force?: boolean) {
      calls.push(["save", s.id, force]);
    },
    async emitSessionStart(s: any, reason: string) {
      calls.push(["start", s.id, reason]);
      await patch.sessionStart?.(s, reason);
    },
    getOverridePermissionMode(id: string) {
      return patch.overrideMode;
    },
    getOverrideModel(id: string) {
      return patch.overrideModel;
    },
  };
  const agentService = {
    async runDefault(prompt: any, options: any) {
      calls.push(["run", prompt, { ...options, context: options.context.id }]);
      await patch.run?.(prompt, options);
    },
  };
  Object.assign(middleware, {
    logger,
    sessionManager: manager,
    requestMatcher: {
      match: async (path: string) => {
        calls.push(["match", path]);
        return patch.match !== false;
      },
    },
    pathResolver: {
      resolve: async (path: string) => {
        calls.push(["resolve", path]);
        return "/owned-prefix" + path;
      },
    },
    toolPermissionService: {
      initializeContext: async (s: any) => {
        calls.push(["initializePermissions", s.id]);
        await patch.permissions?.(s);
      },
    },
    autoModePermissionService: {
      isAutoModeAvailable: async () => {
        calls.push(["autoAvailable"]);
        return { available: patch.autoAvailable !== false };
      },
      isSettingsAutoGrantAllowed: async () => {
        calls.push(["autoGrant"]);
        return patch.autoGrant !== false;
      },
    },
    settingsManager: {
      get: async (key: string) => {
        calls.push(["settings", key]);
        return patch.settings;
      },
    },
    directoryTrustService: {
      isTrustDirectoryPromise: patch.trust ?? Promise.resolve(),
    },
    sessionHookManager: {
      executeSetupHooks: async (s: any, kind: string) => {
        calls.push(["setup", s.id, kind]);
        await patch.setup?.(s);
      },
    },
    channelManager: {
      configureFromSessionOptions: (body: any) =>
        calls.push(["channels", body]),
    },
  });
  Object.assign(controller, {
    logger,
    sessionManager: manager,
    agentService,
    agentManager: {
      getDefault: async () => {
        if (patch.modelsError) throw Error("owned models error");
        return { name: "owned" };
      },
      getModels: async () => patch.models ?? [],
    },
  });
  return {
    n,
    middleware,
    controller,
    manager,
    sessionFactory,
    calls,
    logs,
    sessions,
    scheduled,
    runtime,
    di,
  };
}
