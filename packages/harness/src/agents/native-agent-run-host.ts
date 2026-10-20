import * as sdk from "@openai/agents-core";
import { AsyncLocalStorage } from "node:async_hooks";
import { jsonrepair } from "jsonrepair";
import { createNativeAgentRun } from "./native-agent-run.js";
import { createNativeAgentRunUtilities } from "./native-agent-run-utilities.js";
import { createNativeRunner } from "../runner/native-runner.js";

export interface NativeParentRunnerOptions {
  modelProvider: any;
  sessionManager: any;
  agentManager: any;
  productManager: any;
  stateMachine: any;
  logger: any;
  telemetryService?: any;
  /** Explicit parent DI still resolves compaction and other external services. */
  runtime?: any;
  sourceFactory?: typeof createNativeRunner;
}
export interface NativeAgentRunHostOptions {
  /** Complete explicit parent module/DI graph, env, clock, OS and resource boundaries. */
  runtime: any;
  dependencies: {
    logger: any;
    authenticationManager: any;
    runnerProvider?: any;
    sessionManager: any;
    stateMachine: any;
    agentManager: any;
    agentRunInterceptorProvider: any;
    pluginRuntimeRefreshService: any;
  };
  /** Construct and attach original Factory/Provider/loop immediately when available. */
  runner?: NativeParentRunnerOptions;
  sourceFactory?: typeof createNativeAgentRun;
  utilitiesFactory?: typeof createNativeAgentRunUtilities;
}

/** Explicit public parent assembly, not original product bootstrap. The unchanged
 * service/interceptors/Runner decide execution; this bridge owns only instances,
 * admission, passive completion observations and scheduling. Sessions/auth/models/
 * module DI remain borrowed, and no SDK stream is consumed here.
 */
export function createNativeAgentRunHost(options: NativeAgentRunHostOptions) {
  if (!options.dependencies || !options.runtime)
    throw Error(
      "Native agent run host requires explicit runtime and dependencies",
    );
  if (!options.dependencies.runnerProvider && !options.runner)
    throw Error(
      "Native agent run host requires a runner provider or runner assembly",
    );
  const admission = new AsyncLocalStorage<boolean>(),
    pending = new Set<Promise<any>>(),
    settlements = new Set<Promise<any>>(),
    timers = new Set<any>(),
    immediates = new Set<{ handle?: any; active: boolean }>(),
    subscriptions = new Set<any>(),
    runnerRestorations: Array<() => void> = [],
    errors: unknown[] = [];
  const observedSessions = new WeakSet<object>(),
    ownedRunners = new WeakSet<object>(),
    leases = new WeakMap<object, Set<object>>();
  let state: "open" | "closing" | "closed" = "open",
    closing: Promise<void> | undefined;
  const runtime = options.runtime,
    modules: any = { 25301: sdk, ...runtime.modules },
    scheduleTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    cancelTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    scheduleImmediate = runtime.setImmediate ?? globalThis.setImmediate,
    cancelImmediate =
      runtime.clearImmediate ??
      (runtime.setImmediate ? undefined : globalThis.clearImmediate);
  function track<T>(value: T, detached = false, ledger = pending): T {
    if (value && typeof (value as any).then === "function") {
      const completion = Promise.resolve(value);
      ledger.add(completion);
      void completion.then(
        () => ledger.delete(completion),
        (error) => {
          ledger.delete(completion);
          if (detached) errors.push(error);
        },
      );
    }
    return value;
  }
  function accepted<T>(operation: () => T, detached = false): T {
    try {
      return admission.run(true, () => track(operation(), detached));
    } catch (error) {
      if (!detached) throw error;
      errors.push(error);
      return undefined as T;
    }
  }
  function assertAdmission() {
    if (state !== "open" && !admission.getStore())
      throw Error("Native agent run host is closed");
  }
  function facade(
    target: any,
    assignments?: (key: any, value: any) => any,
    after?: (key: any, value: any) => void,
  ) {
    const methods = new Map<any, { original: any; wrapped: any }>();
    return new Proxy(target, {
      get(value, key) {
        const member = Reflect.get(value, key, value);
        if (typeof member !== "function" || key === "constructor")
          return member;
        if (methods.get(key)?.original !== member)
          methods.set(key, {
            original: member,
            wrapped: (...args: any[]) => {
              try {
                assertAdmission();
              } catch (error) {
                if (member.constructor?.name === "AsyncFunction")
                  return Promise.reject(error);
                throw error;
              }
              const result = accepted(() => Reflect.apply(member, value, args));
              after?.(key, result);
              return result;
            },
          });
        return methods.get(key)!.wrapped;
      },
      set(value, key, member) {
        return Reflect.set(
          value,
          key,
          assignments ? assignments(key, member) : member,
          value,
        );
      },
    });
  }
  const ownedRuntime = {
    ...runtime,
    modules,
    setTimeout(callback: (...args: any[]) => any, ms: number, ...args: any[]) {
      const handle = scheduleTimeout(() => {
        timers.delete(handle);
        return accepted(() => callback(...args), true);
      }, ms);
      timers.add(handle);
      return handle;
    },
    clearTimeout(handle: any) {
      timers.delete(handle);
      cancelTimeout(handle);
    },
    setImmediate(callback: (...args: any[]) => any, ...args: any[]) {
      const entry: { handle?: any; active: boolean } = {
        active: state === "open",
      };
      if (entry.active) immediates.add(entry);
      entry.handle = scheduleImmediate(() => {
        if (!entry.active) return;
        entry.active = false;
        immediates.delete(entry);
        return accepted(() => callback(...args), true);
      });
      if (!entry.active && cancelImmediate) cancelImmediate(entry.handle);
      return entry.handle;
    },
  };
  const utilities = (options.utilitiesFactory ?? createNativeAgentRunUtilities)(
    ownedRuntime,
  );
  // This is the original small product re-export/custom-item wrapper, not a copy
  // of OpenAI SDK. Its module 25301 defaults to the pinned npm dependency above.
  const originalSdk = utilities.getModule(18553);
  modules[18553] = originalSdk;
  const native: any = (options.sourceFactory ?? createNativeAgentRun)({
    ...ownedRuntime,
    getModule: utilities.getModule,
  });
  function observeSession(session: any) {
    if (!session || observedSessions.has(session)) return;
    observedSessions.add(session);
    const sub = session.resultSubject.subscribe((result: any) => {
      if (
        !result ||
        !result.completed ||
        typeof result.completed.then !== "function"
      )
        return;
      const signal = session.resultAbortSignalMap?.get(result);
      if (
        !signal ||
        ![...(leases.get(session) ?? [])].some(
          (lease: any) => lease.signal === signal,
        )
      )
        return;
      // Expected SDK failures/interruptions remain the original controller's job.
      // Observe settlement only; no toTextStream/iterator/state/gate mutations.
      track(result.completed, false, settlements);
    });
    subscriptions.add(sub);
  }
  const managerFacades = new WeakMap<object, any>();
  function sessionManager(value: any): any {
    if (!value || typeof value !== "object")
      throw Error("Explicit native session manager required");
    if (managerFacades.has(value)) return managerFacades.get(value);
    const methods = new Map<any, { original: any; wrapped: any }>();
    const proxy = new Proxy(value, {
      get(target, key) {
        const member = Reflect.get(target, key, target);
        if (typeof member !== "function" || key === "constructor")
          return member;
        if (methods.get(key)?.original !== member)
          methods.set(key, {
            original: member,
            wrapped: (...args: any[]) => {
              if (key !== "run") return Reflect.apply(member, target, args);
              const session = args[0];
              observeSession(session);
              let active = leases.get(session);
              if (!active) leases.set(session, (active = new Set()));
              const lease = { signal: session.abortSignal };
              active.add(lease);
              try {
                const result: any = Reflect.apply(member, target, args);
                if (result && typeof result.then === "function")
                  void Promise.resolve(result).then(
                    () => active!.delete(lease),
                    () => active!.delete(lease),
                  );
                else active.delete(lease);
                return result;
              } catch (error) {
                active.delete(lease);
                throw error;
              }
            },
          });
        return methods.get(key)!.wrapped;
      },
    });
    managerFacades.set(value, proxy);
    return proxy;
  }
  const service = facade(new native.AgentServiceImpl(), (key, value) =>
    key === "sessionManager" ? sessionManager(value) : value,
  );
  Object.assign(service, options.dependencies);
  function createInterceptor(name: string, dependencies: Record<string, any>) {
    assertAdmission();
    const Constructor = native.interceptorClasses[name];
    if (typeof Constructor !== "function")
      throw Error("Unknown original interceptor " + name);
    const instance = new Constructor();
    Object.assign(instance, dependencies);
    return facade(instance);
  }
  function createRunner(configuration: NativeParentRunnerOptions) {
    assertAdmission();
    const runnerRuntime = configuration.runtime ?? {},
      runnerModules = {
        ...modules,
        28894: { jsonrepair },
        ...runnerRuntime.modules,
      };
    const runnerNative = (configuration.sourceFactory ?? createNativeRunner)({
      ...ownedRuntime,
      ...runnerRuntime,
      modules: runnerModules,
      getModule: runnerRuntime.getModule ?? utilities.getModule,
      // Keep all source Runner deferred operations under this same owner.
      setImmediate: ownedRuntime.setImmediate,
    });
    const loop: any = new runnerNative.ToolCallLoopDetectorImpl();
    loop.logger = configuration.logger;
    const factory = facade(
      new runnerNative.RunnerFactoryImpl(),
      undefined,
      (key, result) => {
        if (key === "create")
          track(
            Promise.resolve(result).then(observeOwnedRunner, () => {}),
            true,
          );
      },
    );
    Object.assign(factory, {
      modelProvider: configuration.modelProvider,
      sessionManager: configuration.sessionManager,
      agentManager: configuration.agentManager,
      productManager: configuration.productManager,
      stateMachine: configuration.stateMachine,
      logger: configuration.logger,
      telemetryService: configuration.telemetryService,
      toolCallLoopDetector: loop,
    });
    const provider = facade(new runnerNative.RunnerProviderImpl());
    provider.runnerFactory = factory;
    return { native: runnerNative, factory, provider, loop };
  }
  function observeOwnedRunner(runner: any) {
    if (!runner || ownedRunners.has(runner) || typeof runner.run !== "function")
      return;
    const descriptor = Object.getOwnPropertyDescriptor(runner, "run"),
      original = runner.run;
    if (descriptor && !descriptor.configurable)
      throw Error(
        "Native execution host requires a dedicated Runner with an observable run method",
      );
    Object.defineProperty(runner, "run", {
      configurable: true,
      writable: true,
      enumerable: descriptor?.enumerable ?? false,
      value: function (this: any, ...args: any[]) {
        assertAdmission();
        const result: any = accepted(() => Reflect.apply(original, this, args));
        // One-time source methods do not publish resultSubject. Observe their
        // private SDK completion at this newly-owned Runner boundary as well.
        track(
          Promise.resolve(result).then(
            (value) => {
              if (
                value?.completed &&
                typeof value.completed.then === "function"
              )
                track(value.completed, false, settlements);
            },
            () => {},
          ),
          true,
        );
        return result;
      },
    });
    ownedRunners.add(runner);
    runnerRestorations.push(() => {
      if (descriptor) Object.defineProperty(runner, "run", descriptor);
      else delete runner.run;
    });
  }
  const runner = options.runner ? createRunner(options.runner) : undefined;
  if (runner) service.runnerProvider = runner.provider;
  async function drain() {
    while (pending.size || settlements.size)
      await Promise.allSettled([...pending, ...settlements]);
  }
  function cancelImmediates(failures: unknown[]) {
    for (const entry of immediates) {
      entry.active = false;
      if (cancelImmediate)
        try {
          cancelImmediate(entry.handle);
        } catch (error) {
          failures.push(error);
        }
    }
    immediates.clear();
  }
  function close(): Promise<void> {
    if (closing) return closing;
    state = "closing";
    closing = (async () => {
      const failures: unknown[] = [];
      try {
        cancelImmediates(failures);
        // Poll/sleep timers may resolve Promises needed by accepted source work.
        // Do not clear those timers before that work/SDK completion settles.
        await drain();
      } catch (error) {
        failures.push(error);
      } finally {
        cancelImmediates(failures);
        for (const timer of timers)
          try {
            cancelTimeout(timer);
          } catch (error) {
            failures.push(error);
          }
        timers.clear();
        for (const sub of subscriptions) sub.unsubscribe();
        subscriptions.clear();
        for (const restore of runnerRestorations) restore();
        runnerRestorations.length = 0;
        admission.disable();
        state = "closed";
      }
      if (failures.length || errors.length)
        throw new AggregateError(
          [...failures, ...errors],
          "Native agent run host close failed",
        );
    })();
    return closing;
  }
  return {
    native,
    utilities,
    modules,
    originalSdk,
    service,
    runner,
    createInterceptor,
    createRunner,
    drain,
    close,
    get state() {
      return state;
    },
    get pendingCount() {
      return pending.size;
    },
    get settlementCount() {
      return settlements.size;
    },
    get timerCount() {
      return timers.size;
    },
    get immediateCount() {
      return immediates.size;
    },
    get subscriptionCount() {
      return subscriptions.size;
    },
    get errors(): readonly unknown[] {
      return [...errors];
    },
  };
}
