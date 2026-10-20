// Explicit test-boundary adapters. None are production/default protocol services.
import { EventEmitter } from "node:events";
import { Subject, BehaviorSubject } from "rxjs";
import { ModelBehaviorError } from "@openai/agents-core";
import {
  StreamTimeoutError,
  EmptyStreamError,
} from "../../src/models/model-transport.js";
import { createNativeAcpAgent } from "../../src/protocol/native-acp-agent.js";
import { createNativeAcpView } from "../../src/protocol/native-acp-view.js";
import { createNativeAcpPrimitives } from "../../src/protocol/native-acp-primitives.js";
import { createCapturedAcpModules } from "../../src/protocol/captured-acp-modules.js";
import { HarnessSession } from "../../src/sessions/session.js";
import { SessionRunStateMachine } from "../../src/sessions/run-state-machine.js";
import { RunResultUtils } from "../../src/agents/run-result-utils.js";
import { NativeHistoryInputUtils } from "../../src/sessions/input-processor-utils.js";
import {
  CommandMessageUtils,
  COMMAND_MESSAGE_TYPES,
} from "../../src/commands/command-message-utils.js";
import { PermissionMode } from "../../src/permissions/permission.js";

export const protocolFactories = {
  agent: createNativeAcpAgent,
  view: createNativeAcpView,
  primitives: createNativeAcpPrimitives,
};
export function acpProtocolFixture(
  factories = protocolFactories,
  seed: any = {},
) {
  let now = 1700000000000,
    serial = 0;
  const timers = new Map<any, { at: number; run: () => void }>(),
    logs: any[] = [],
    updates: any[] = [],
    permissions: any[] = [],
    decisions: any[] = [],
    di = new Map<any, any>();
  class Clock extends Date {
    constructor(value?: any) {
      super(value ?? now);
    }
    static override now() {
      return now;
    }
  }
  const timer = (run: () => void, ms: number) => {
    const token = {
      unref() {
        return this;
      },
    };
    timers.set(token, { at: now + ms, run });
    return token;
  };
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext"].map((key) => [
      key,
      (...args: any[]) => logs.push([key, ...args]),
    ]),
  ) as any;
  const session: any =
    seed.session ??
    new HarnessSession("owned", {
      options: { model: "fixture-model" },
      requestOptions: { model: "fixture-model" },
      traceId: "fixture-trace",
      conversationRequestId: "request",
      meta: {},
      phaseSubject: new BehaviorSubject<any>({ phase: "idle", startedAt: now }),
    });
  const stateMachine = seed.stateMachine ?? new SessionRunStateMachine(logger),
    tasks = seed.tasks ?? new EventEmitter(),
    members: any[] = [];
  const sessionManager = seed.sessionManager ?? {
    getCurrent: () => session,
    sessionSubject: new BehaviorSubject(session),
    get: async (id: string) => (id === session.id ? session : undefined),
  };
  const common = {
    Logger: Symbol("Logger"),
    ContainerUtil: {
      get(token: any) {
        if (!di.has(token)) throw Error("Fixture DI missing: " + String(token));
        return di.get(token);
      },
    },
  };
  const modules: Record<number, any> = {
    80699: common,
    92537: { Subject },
    54601: { randomUUID: () => "fixed-uuid" },
    97903: { ModelBehaviorError },
    71915: {
      SessionManager: Symbol("SessionManager"),
      SessionRunStateMachine,
      InterruptionService: Symbol("InterruptionService"),
    },
    97959: { AgentTaskManager: Symbol("AgentTaskManager") },
    54193: { getTeamMemberRegistry: () => ({ getAll: () => members }) },
    35151: { PermissionMode },
    67062: {
      MediaType: { APPLICATION_JSON_UTF8: "application/json; charset=utf-8" },
    },
    87422: { CommandManager: Symbol("CommandManager") },
    40348: { AskService: Symbol("AskService") },
    89425: {
      AuthenticationRequiredError: class extends Error {},
      AuthenticationFailedError: class extends Error {},
      StreamTimeoutError,
      EmptyStreamError,
    },
    93039: { RunResultUtils, InputItemUtils: NativeHistoryInputUtils },
    58830: { InputItemUtils: NativeHistoryInputUtils },
    67019: { CommandMessageUtils, CommandType: COMMAND_MESSAGE_TYPES },
    8046: { INTERRUPTED_BY_USER_MESSAGE: "Interrupted by user" },
    ...seed.modules,
  };
  const base = createCapturedAcpModules({
    Date: Clock,
    modules,
    os: { EOL: "\n" },
    fs: {},
  });
  const primitiveModules = { ...modules };
  delete primitiveModules[8046];
  const p = factories.primitives({
    Date: Clock,
    modules: primitiveModules,
    getModule: base.getModule,
  });
  Object.assign(modules[93039], {
    TelemetryUtils: p.TelemetryUtils,
    ErrorUtils: p.getModule(8046).ErrorUtils,
  });
  Object.assign(common, { Deferred: p.Deferred });
  modules[22618] = p.protocol;
  modules[54631] = p.trace;
  modules[91364] = p.history;
  modules[66545] = base.getModule(69466);
  modules[12502] = { AcpUtils: base.AcpUtils };
  const runtime = {
    Date: Clock,
    setTimeout: seed.realTimers ? globalThis.setTimeout : timer,
    clearTimeout: seed.realTimers
      ? globalThis.clearTimeout
      : (token: any) => timers.delete(token),
    modules,
    getModule: base.getModule,
  };
  const n = factories.agent(runtime),
    agent = new n.AcpAgentImpl(),
    v = factories.view(runtime),
    view = new v.AcpView(),
    toolInterceptor = new p.AcpToolInterceptor();
  agent.connection = {
    sessionUpdate: async (update: any) => {
      updates.push(update);
      await seed.onUpdate?.(update);
    },
    requestPermission: async (request: any) => {
      permissions.push(request);
      return (
        (await seed.requestPermission?.(request)) ?? {
          outcome: { outcome: "selected", optionId: "allow" },
        }
      );
    },
  };
  const interruptionService = seed.interruptionService ?? {
    pending$: new BehaviorSubject(undefined),
    approve: (item: any, options: any) => {
      decisions.push(["approve", options]);
      if (session.interruptionSubject.value === item)
        session.interruptionSubject.next(undefined);
    },
    reject: (item: any, options: any) => {
      decisions.push(["reject", options]);
      if (session.interruptionSubject.value === item)
        session.interruptionSubject.next(undefined);
    },
  };
  di.set(common.Logger, logger);
  di.set(modules[71915].SessionManager, sessionManager);
  di.set(SessionRunStateMachine, stateMachine);
  di.set(modules[97959].AgentTaskManager, tasks);
  di.set(p.protocol.AcpToolInterceptor, toolInterceptor);
  di.set(modules[71915].InterruptionService, interruptionService);
  di.set(p.protocol.AcpUsagePublisher, {
    publish: async (...args: any[]) => updates.push(["usage", ...args]),
  });
  di.set(modules[40348].AskService, {
    startWaitSpan: (...args: any[]) => decisions.push(["startWait", ...args]),
    endWaitSpanExternal: (...args: any[]) =>
      decisions.push(["endWait", ...args]),
    setAsk: (...args: any[]) => decisions.push(["setAsk", ...args]),
  });
  di.set(modules[87422].CommandManager, { parseCommand: () => undefined });
  Object.assign(view, { logger, stateMachine, sessionManager });
  return {
    createPrimitives: factories.primitives,
    agent,
    view,
    n,
    v,
    p,
    base,
    modules,
    session,
    sessionManager,
    stateMachine,
    tasks,
    members,
    toolInterceptor,
    interruptionService,
    logger,
    logs,
    updates,
    permissions,
    decisions,
    timers,
    async tick(ms = 0) {
      now += ms;
      for (const [token, value] of [...timers])
        if (value.at <= now) {
          timers.delete(token);
          value.run();
        }
      await settle();
    },
    close() {
      for (const cleanup of agent.activeForwardingCleanups.values()) cleanup();
      for (const subject of [
        agent.promptEvent,
        agent.cancelEvent,
        agent.modelChangeEvent,
        agent.modeChangeEvent,
        agent.configChangeEvent,
        agent.displayModeEvent,
      ])
        subject.complete();
      timers.clear();
    },
  };
}
export async function settle() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}
