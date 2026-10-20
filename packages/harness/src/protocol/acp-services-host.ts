import * as sdk from "@openai/agents-core";
import { createNativeAcpServices } from "./native-acp-services.js";
import { createNativeProductEnvironment } from "../config/native-product-environment.js";
import { COMMAND_XML_TAGS } from "../commands/command-message-utils.js";
import { getActiveAgentOnlyHistory } from "../sessions/history-utils.js";
import type { createHarness } from "../runtime/create-harness.js";

export type AcpServicesHostOptions = {
  backend: Awaited<ReturnType<typeof createHarness>>;
  /** Borrowed codec/timestamps/protocol/DI module resolver, normally the ACP parent's bounded runtime. */
  getModule(id: number): any;
  modules?: Record<number, any>;
  env?: Record<string, string | undefined>;
  tty?: boolean;
  logger?: {
    info?(...args: any[]): void;
    debug?(...args: any[]): void;
    warn?(...args: any[]): void;
    error?(...args: any[]): void;
    setContext?(name: string): void;
  };
  restOperations?: { request(options: any): Promise<any> };
  eventService?: { report(name: string, payload: any): Promise<any> };
  terminalTitleUpdater?: { update(title: string): any };
  galileoService?: { addCounter(...args: any[]): any };
  /** Explicit constructor injection used by original-vs-port integration verification. */
  sourceFactory?: typeof createNativeAcpServices;
};

/** Owns only these original service instances and their callbacks; never owns the SDK backend or clients. */
export function createAcpServicesHost(options: AcpServicesHostOptions) {
  let closed = false,
    closePromise: Promise<void> | undefined;
  const pending = new Set<Promise<any>>(),
    timers = new Set<ReturnType<typeof setTimeout>>(),
    connections = new Map<string, any>();
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext"].map((name) => [
      name,
      (...args: any[]) => {
        const method =
          options.logger?.[
            name as keyof NonNullable<AcpServicesHostOptions["logger"]>
          ];
        if (method) track(Reflect.apply(method, options.logger, args));
        else if (name === "warn" || name === "error")
          console.warn("[AcpServices]", ...args);
      },
    ]),
  ) as any;
  function track(value: any) {
    if (!value || typeof value.then !== "function") return value;
    pending.add(value);
    value.then(
      () => pending.delete(value),
      () => pending.delete(value),
    );
    return value;
  }
  const modules: Record<number, any> = {
    18553: sdk,
    21580: { HistoryUtils: { getActiveAgentOnlyHistory } },
    51147: { BooleanUtils: createNativeProductEnvironment({}).BooleanUtils },
    76884: { CommandXmlTags: COMMAND_XML_TAGS },
    ...options.modules,
  };
  const inheritedUtilities = modules[93039] ?? options.getModule(93039);
  const utilities = new Proxy({} as any, {
    get(_target, key) {
      if (key === "UsageUtils") return native.UsageUtils;
      if (key === "HistoryUtils") return modules[21580].HistoryUtils;
      return inheritedUtilities[key];
    },
  });
  modules[93039] = utilities;
  const native: any = (options.sourceFactory ?? createNativeAcpServices)({
    modules,
    getModule: options.getModule,
    env: options.env ?? {},
    tty: options.tty ?? false,
    setTimeout(callback: (...args: any[]) => any, ms: number, ...args: any[]) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        track(callback(...args));
      }, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer: ReturnType<typeof setTimeout>) {
      timers.delete(timer);
      clearTimeout(timer);
    },
  });
  const raw = {
    broadcast: new native.AcpBroadcastServiceImpl(),
    usage: new native.AcpUsagePublisherImpl(),
    title: new native.SessionTitleServiceImpl(),
    friction: new native.FrictionAnalysisServiceImpl(),
    recall: new native.FrictionRecallClientImpl(),
  };
  const connectionManager = { getAll: () => connections };
  Object.assign(raw.broadcast, {
    logger,
    agentManager: connectionManager,
    stateMachine: options.backend.stateMachine,
  });
  Object.assign(raw.usage, { logger, agentManager: options.backend.agents });
  Object.assign(raw.title, {
    logger,
    agentService: options.backend.service,
    sessionManager: options.backend.sessions,
    ...(options.terminalTitleUpdater
      ? {
          terminalTitleUpdater: {
            update: (title: string) =>
              track(
                Reflect.apply(
                  options.terminalTitleUpdater!.update,
                  options.terminalTitleUpdater,
                  [title],
                ),
              ),
          },
        }
      : {}),
    ...(options.galileoService
      ? {
          galileoService: {
            addCounter: (...args: any[]) =>
              track(
                Reflect.apply(
                  options.galileoService!.addCounter,
                  options.galileoService,
                  args,
                ),
              ),
          },
        }
      : {}),
  });
  Object.assign(raw.recall, {
    logger,
    productManager: options.backend.productManager,
    restOperations: options.restOperations ?? {
      async request(): Promise<never> {
        throw Error(
          "ACP friction recall requires explicit restOperations; no default network/account access",
        );
      },
    },
  });
  Object.assign(raw.friction, {
    logger,
    productManager: options.backend.productManager,
    frictionRecallClient: raw.recall,
    eventService: options.eventService ?? {
      async report(): Promise<never> {
        throw Error(
          "ACP friction reporting requires explicit eventService; no default external telemetry",
        );
      },
    },
  });
  // Instance shims observe promises from nested/fire-and-forget original calls. Class bodies remain identical.
  function own(instance: any): any {
    const methods = new Set<string>();
    const facades = new Map<string, (...args: any[]) => any>();
    for (
      let prototype = Object.getPrototypeOf(instance);
      prototype && prototype !== Object.prototype;
      prototype = Object.getPrototypeOf(prototype)
    ) {
      for (const name of Object.getOwnPropertyNames(prototype)) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (
          name !== "constructor" &&
          typeof descriptor?.value === "function" &&
          !methods.has(name)
        ) {
          methods.add(name);
          const original = descriptor.value;
          const observed = function (...args: any[]) {
            return track(Reflect.apply(original, instance, args));
          };
          Object.defineProperty(observed, "name", { value: original.name });
          Object.defineProperty(observed, "length", { value: original.length });
          Object.defineProperty(instance, name, {
            configurable: true,
            value: observed,
          });
          const facade = function (...args: any[]) {
            assertOpen();
            return Reflect.apply(observed, instance, args);
          };
          Object.defineProperty(facade, "name", { value: original.name });
          Object.defineProperty(facade, "length", { value: original.length });
          facades.set(name, facade);
        }
      }
    }
    return new Proxy(instance, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);
        return typeof key === "string" && methods.has(key)
          ? facades.get(key)
          : value;
      },
    });
  }
  const services = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, own(value)]),
  ) as typeof raw;
  raw.broadcast.init();
  raw.usage.init();
  raw.title.init();
  function assertOpen() {
    if (closed) throw Error("ACP services host is closed");
  }
  async function flush() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  function close() {
    if (closePromise) return closePromise;
    closed = true;
    raw.broadcast.dispose();
    raw.usage.dispose();
    closePromise = (async () => {
      // Keep timeout races alive while already-accepted title/broadcast work settles.
      await flush();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      connections.clear();
      raw.title.sessionStates.clear();
      raw.title.pendingTitlePromises.clear();
      raw.friction.pendingPromptBySession.clear();
      raw.friction.pendingAnalysisByRequest.clear();
      raw.friction.reportedKeys.clear();
    })();
    return closePromise;
  }
  return {
    ...services,
    helpers: {
      titleHelpers: native.titleHelpers,
      UsageUtils: native.UsageUtils,
      SessionTitleService: native.SessionTitleService,
      getModule: native.getModule,
    },
    registerConnection(id: string, agent: any) {
      assertOpen();
      if (!id || connections.has(id))
        throw Error("ACP connection ID is empty or already registered");
      if (typeof agent?.getConnection !== "function")
        throw TypeError("ACP client agent requires getConnection()");
      connections.set(id, agent);
    },
    unregisterConnection(id: string) {
      assertOpen();
      connections.delete(id);
    },
    get connectionCount() {
      return connections.size;
    },
    get pendingCount() {
      return pending.size;
    },
    get timerCount() {
      return timers.size;
    },
    flush,
    close,
  };
}
