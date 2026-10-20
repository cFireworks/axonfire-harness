import * as fs from "node:fs";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import * as sdk from "@openai/agents-core";
import { Subject } from "rxjs";
import { createNativeSessionStack } from "./native-session-stack.js";
import { createNativeSessionIngress } from "./native-session-ingress.js";

export interface NativeSessionStackHostOptions {
  /** Explicit original module/DI graph, paths, environment and optional owned clock/IO.
   * No installed-home, account, argv or environment discovery is performed here.
   */
  runtime: any;
  manager: {
    logger: any;
    stateMachine: any;
    progressSyncService: any;
    cronSchedulerService: any;
    agentTaskManager: any;
    interruptionService: any;
    agentInputItemProcessorProvider: any;
    sessionHookManager: any;
    telemetryService: any;
    galileoSessionBridge: any;
    interceptors: any[];
    userStateManager?: any;
  };
  store: { logger: any; imageBlobService: any; toolResultBlobService: any };
  middleware: {
    logger: any;
    toolPermissionService: any;
    autoModePermissionService: any;
    settingsManager: any;
    directoryTrustService: any;
    sessionHookManager: any;
    channelManager?: any;
    requestMatcher?: any;
    pathResolver?: any;
  };
  controller: {
    logger: any;
    agentService: any;
    agentManager: any;
    completionWaiter?: any;
  };
  /** Release this parent's registrations only. Never call Manager.remove (which deletes disk data).
   * The owner must settle borrowed SDK/interruption/transport work before close.
   */
  closeSession(session: any): unknown;
  sourceFactory?: typeof createNativeSessionStack;
  ingressFactory?: typeof createNativeSessionIngress;
}

/** Public assembly around unchanged complete Manager/Store/Ingress classes.
 * Owns created sessions, source result observers, accepted operations and scheduling;
 * all product services and the module/DI graph are explicitly borrowed.
 */
export function createNativeSessionStackHost(
  options: NativeSessionStackHostOptions,
) {
  if (typeof options.closeSession !== "function")
    throw Error("Native session host requires an explicit closeSession owner");
  for (const name of ["manager", "store", "middleware", "controller"] as const)
    if (!options[name])
      throw Error("Native session host requires " + name + " dependencies");
  const admission = new AsyncLocalStorage<boolean>(),
    pending = new Set<Promise<any>>(),
    scopes = new Set<Promise<any>>(),
    sessions = new Set<any>(),
    timers = new Set<any>(),
    immediates = new Set<{ handle?: any; active: boolean }>(),
    errors: unknown[] = [],
    restorations: Array<() => void> = [];
  const borrowed = new WeakMap<object, any>();
  let state: "open" | "closing" | "closed" = "open",
    closing: Promise<void> | undefined;
  const runtime = options.runtime ?? {},
    scheduleTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    cancelTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    scheduleImmediate = runtime.setImmediate ?? globalThis.setImmediate,
    cancelImmediate =
      runtime.clearImmediate ??
      (runtime.setImmediate ? undefined : globalThis.clearImmediate);
  function track<T>(value: T, detached = false, scoped = false): T {
    if (value && typeof (value as any).then === "function") {
      const completion = Promise.resolve(value);
      const ledger = scoped ? scopes : pending;
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
  function accepted<T>(
    operation: () => T,
    detached = false,
    scoped = false,
  ): T {
    return admission.run(true, () => track(operation(), detached, scoped));
  }
  function assertAdmission() {
    if (state !== "open" && !admission.getStore())
      throw Error("Native session host is closed");
  }
  function observedService(value: any): any {
    if (!value || typeof value !== "object") return value;
    if (borrowed.has(value)) return borrowed.get(value);
    const methods = new Map<any, { original: any; wrapped: any }>();
    const proxy = new Proxy(value, {
      get(target, key) {
        const member = Reflect.get(target, key, target);
        if (typeof member !== "function" || key === "constructor")
          return member;
        if (methods.get(key)?.original !== member)
          methods.set(key, {
            original: member,
            wrapped: (...args: any[]) =>
              accepted(() => Reflect.apply(member, target, args)),
          });
        return methods.get(key)!.wrapped;
      },
    });
    borrowed.set(value, proxy);
    return proxy;
  }
  function facade(
    target: any,
    observedFields: ReadonlySet<string> = new Set(),
    scopedMethods: ReadonlySet<string> = new Set(),
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
              return accepted(
                () => Reflect.apply(member, value, args),
                false,
                scopedMethods.has(String(key)),
              );
            },
          });
        return methods.get(key)!.wrapped;
      },
      set(value, key, member) {
        return Reflect.set(
          value,
          key,
          observedFields.has(String(key)) ? observedService(member) : member,
          value,
        );
      },
    });
  }
  const modules = {
    79896: fs,
    91943: io,
    16928: path,
    94317: { AsyncLocalStorage },
    18553: sdk,
    ...runtime.modules,
  };
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
      const entry: { handle?: any; active: boolean } = { active: true };
      immediates.add(entry);
      entry.handle = scheduleImmediate(() => {
        if (!entry.active) return;
        entry.active = false;
        immediates.delete(entry);
        return accepted(() => callback(...args), true);
      });
      return entry.handle;
    },
  };
  const ingress = (options.ingressFactory ?? createNativeSessionIngress)(
      ownedRuntime,
    ),
    native = (options.sourceFactory ?? createNativeSessionStack)(ownedRuntime),
    rawFactory = new ingress.SessionFactoryImpl(),
    rawManager: any = new native.SessionManagerImpl(),
    rawStore: any = new native.SessionStoreImpl(),
    rawMiddleware = new ingress.SessionMiddleWare(),
    rawController = new ingress.AgentController();
  function remember(session: any) {
    if (sessions.has(session)) return;
    sessions.add(session);
    // RX ignores the returned Promise of async next callbacks. Observe it without
    // consuming the SDK stream, replacing the Promise, or deciding the result.
    const subject = session.resultSubject,
      descriptor = Object.getOwnPropertyDescriptor(subject, "subscribe"),
      subscribe = subject.subscribe;
    Object.defineProperty(subject, "subscribe", {
      configurable: true,
      writable: true,
      value(observer: any, ...args: any[]) {
        const next =
          typeof observer === "function"
            ? function (this: any, ...values: any[]) {
                return accepted(
                  () => Reflect.apply(observer, this, values),
                  true,
                );
              }
            : observer;
        return Reflect.apply(subscribe, subject, [next, ...args]);
      },
    });
    restorations.push(() => {
      if (descriptor) Object.defineProperty(subject, "subscribe", descriptor);
      else delete subject.subscribe;
    });
  }
  const sessionFactory = {
    create(seed: any) {
      try {
        assertAdmission();
      } catch (error) {
        return Promise.reject(error);
      }
      const operation = accepted(() => rawFactory.create(seed));
      track(Promise.resolve(operation).then(remember, () => {}), true);
      return operation;
    },
  };
  const serviceFields = new Set([
    "progressSyncService",
    "cronSchedulerService",
    "agentTaskManager",
    "interruptionService",
    "sessionHookManager",
    "telemetryService",
    "galileoSessionBridge",
    "userStateManager",
  ]);
  const manager = facade(
      rawManager,
      serviceFields,
      new Set(["run", "runWithoutHistory"]),
    ),
    store = facade(rawStore),
    middleware = facade(rawMiddleware, new Set(), new Set(["handle"])),
    controller = facade(rawController, new Set(), new Set(["run"]));
  Object.assign(manager, options.manager, {
    sessionFactory,
    sessionStore: store,
  });
  Object.assign(store, options.store, { sessionFactory });
  Object.assign(middleware, options.middleware, { sessionManager: manager });
  Object.assign(controller, options.controller, { sessionManager: manager });
  // setCurrent invokes this async method without awaiting it. Preserve the original
  // method and returned Promise, but prevent an unowned detached rejection.
  const resultHandler = rawManager.handleRunResult;
  rawManager.handleRunResult = function (...args: any[]) {
    return accepted(() => Reflect.apply(resultHandler, rawManager, args), true);
  };
  async function drain() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  function clearSchedules(failures: unknown[]) {
    for (const timer of timers)
      try {
        cancelTimeout(timer);
      } catch (error) {
        failures.push(error);
      }
    timers.clear();
    rawManager.idleTimers.clear();
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
        clearSchedules(failures);
        for (const session of sessions) session.abortController.abort();
        await drain();
        while (scopes.size) await Promise.allSettled([...scopes]);
        await drain();
        // Creations accepted before close may finish while drain is waiting.
        // The original factory's objects remain owned even if permissions reject.
        for (const session of sessions) {
          session.abortController.abort();
          if (session.hookContexts?.sessionStartReadyPromise)
            await Promise.resolve(
              session.hookContexts.sessionStartReadyPromise,
            ).catch((error) => failures.push(error));
          try {
            await accepted(() => options.closeSession(session));
          } catch (error) {
            failures.push(error);
          }
        }
        await drain();
        await Promise.allSettled([
          ...rawManager.addHistoryLocks.values(),
          ...rawStore.writeLocks.values(),
        ]);
      } catch (error) {
        failures.push(error);
      } finally {
        for (const sub of rawManager.resultSubscriptions.values())
          sub.unsubscribe();
        rawManager.resultSubscriptions.clear();
        clearSchedules(failures);
        for (const session of sessions)
          for (const value of new Set(Object.values(session)))
            if (value instanceof Subject) value.complete();
        rawManager.sessionSubject.complete();
        rawManager.context.disable();
        rawManager.skipHistoryContext.disable();
        for (const restore of restorations) restore();
        restorations.length = 0;
        sessions.clear();
        admission.disable();
        state = "closed";
      }
      if (failures.length || errors.length)
        throw new AggregateError(
          [...failures, ...errors],
          "Native session host close failed",
        );
    })();
    return closing;
  }
  return {
    native,
    ingress,
    manager,
    store,
    middleware,
    controller,
    sessionFactory,
    drain,
    close,
    get state() {
      return state;
    },
    get pendingCount() {
      return pending.size;
    },
    get scopeCount() {
      return scopes.size;
    },
    get timerCount() {
      return timers.size;
    },
    get immediateCount() {
      return immediates.size;
    },
    get sessionCount() {
      return sessions.size;
    },
    get errors(): readonly unknown[] {
      return [...errors];
    },
  };
}
