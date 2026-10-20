import { AsyncLocalStorage } from "node:async_hooks";
import { Subject, Subscriber } from "rxjs";
import { createCapturedAcpModules } from "./captured-acp-modules.js";
import { createNativeAcpAgent } from "./native-acp-agent.js";
import { createNativeAcpView } from "./native-acp-view.js";
import { createNativeAcpPrimitives } from "./native-acp-primitives.js";

export const nativeAcpProtocolFactories = {
  agent: createNativeAcpAgent,
  view: createNativeAcpView,
  primitives: createNativeAcpPrimitives,
};
export interface NativeAcpProtocolHostOptions {
  /** Explicit parent module/DI/OS/clock graph. No fabricated auth, connection or session. */
  runtime: any;
  viewDependencies?: Record<string, any>;
  sourceFactories?: typeof nativeAcpProtocolFactories;
  /** End this parent's borrowed render/forwarding/SDK/terminal operations first.
   * In particular, background terminal continuations must have finished, not
   * merely returned the initial "started" result. Shared services are not closed here.
   */
  beforeClose?(): unknown;
}

/** Owns original protocol instances and their resources, never the protocol's
 * decisions, HTTP session handoff, transport, SDK stream or borrowed services.
 */
export function createNativeAcpProtocolHost(
  options: NativeAcpProtocolHostOptions,
) {
  if (!options.runtime)
    throw Error("Native ACP protocol host requires an explicit parent runtime");
  const input = options.runtime,
    sources = options.sourceFactories ?? nativeAcpProtocolFactories,
    admission = new AsyncLocalStorage<boolean>(),
    pending = new Set<Promise<any>>(),
    timers = new Set<any>(),
    intervals = new Set<any>(),
    subscriptions = new Set<any>(),
    deferreds = new Set<any>(),
    subjects = new Set<any>(),
    iterators = new Set<() => unknown>(),
    restorations: Array<() => void> = [],
    errors: unknown[] = [];
  let state: "open" | "closing" | "closed" = "open",
    closing: Promise<void> | undefined;
  const closedError = () =>
    Object.assign(Error("Native ACP protocol host is closed"), {
      name: "AbortError",
    });
  function assertAdmission() {
    if (state === "closed" || (state === "closing" && !admission.getStore()))
      throw closedError();
  }
  function track<T>(value: T, detached = false): T {
    if (value && typeof (value as any).then === "function") {
      const job = Promise.resolve(value);
      pending.add(job);
      void job.then(
        () => pending.delete(job),
        (error) => {
          pending.delete(job);
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
  function rememberDeferred(value: any) {
    if (
      !value?.promise ||
      typeof value.reject !== "function" ||
      deferreds.has(value)
    )
      return;
    deferreds.add(value);
    void value.promise.then(
      () => deferreds.delete(value),
      () => deferreds.delete(value),
    );
    if (state !== "open") value.reject(closedError());
  }
  function observeObserver(observer: any): any {
    // RxJS subscribe(Subscriber) returns that exact Subscriber, unlike the
    // function/Observer overload. Do not turn it into a different subscription.
    if (observer instanceof Subscriber) return observer;
    const invoke = (callback: any, receiver: any, values: any[]) =>
      accepted(() => Reflect.apply(callback, receiver, values), true);
    if (typeof observer === "function")
      return function (this: any, ...values: any[]) {
        return invoke(observer, this, values);
      };
    if (observer && typeof observer === "object")
      return {
        next:
          typeof observer.next === "function"
            ? (...values: any[]) => invoke(observer.next, observer, values)
            : undefined,
        error:
          typeof observer.error === "function"
            ? (...values: any[]) => invoke(observer.error, observer, values)
            : undefined,
        complete:
          typeof observer.complete === "function"
            ? (...values: any[]) => invoke(observer.complete, observer, values)
            : undefined,
      };
    return observer;
  }
  function observeSubscription(subject: any): () => void {
    const descriptor = Object.getOwnPropertyDescriptor(subject, "subscribe"),
      original = subject.subscribe;
    if (descriptor && !descriptor.configurable)
      throw Error(
        "ACP protocol observation requires a configurable subscribe descriptor",
      );
    Object.defineProperty(subject, "subscribe", {
      configurable: true,
      writable: true,
      value(observer: any, ...args: any[]) {
        assertAdmission();
        const sub: any = Reflect.apply(original, subject, [
          observeObserver(observer),
          ...args.map(observeObserver),
        ]);
        subscriptions.add(sub);
        // Native forwarders unsubscribe at each turn, long before the protocol
        // graph closes. Retire their ledger entries without retaining old
        // Subscriber/session closures for the lifetime of the connection.
        if (typeof sub.add === "function")
          sub.add(() => subscriptions.delete(sub));
        return sub;
      },
    });
    return () => {
      if (descriptor) Object.defineProperty(subject, "subscribe", descriptor);
      else delete subject.subscribe;
    };
  }
  function observeSessionSubscriptions<T>(session: any, operation: () => T): T {
    // The original forwarder installs these subscriptions synchronously. Observe
    // only that lease, without replacing the borrowed session or its Subjects.
    const restore: Array<() => void> = [];
    try {
      for (const subject of new Set(
        Object.values(session ?? {}).filter(
          (value) => value instanceof Subject,
        ),
      ))
        restore.push(observeSubscription(subject));
      return operation();
    } finally {
      for (const undo of restore.reverse()) undo();
    }
  }
  const schedule = input.setTimeout ?? globalThis.setTimeout,
    cancel = input.clearTimeout ?? globalThis.clearTimeout,
    scheduleInterval = input.setInterval ?? globalThis.setInterval,
    cancelInterval = input.clearInterval ?? globalThis.clearInterval;
  const modules: any = { ...input.modules };
  // Keep late additions/getters in borrowed namespaces visible, without flattening
  // or mutating them. Core overrides live in a distinct owned namespace.
  function overlay(parent: any, own: any) {
    return new Proxy(own, {
      get(target, key, receiver) {
        return Object.hasOwn(target, key)
          ? Reflect.get(target, key, receiver)
          : Reflect.get(parent, key, parent);
      },
      set(target, key, value) {
        Object.defineProperty(target, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
        return true;
      },
      ownKeys(target) {
        return [
          ...new Set([...Reflect.ownKeys(parent), ...Reflect.ownKeys(target)]),
        ];
      },
      getOwnPropertyDescriptor(target, key) {
        return (
          Reflect.getOwnPropertyDescriptor(target, key) ??
          (Object.hasOwn(parent, key)
            ? {
                configurable: true,
                enumerable: true,
                get: () => Reflect.get(parent, key, parent),
              }
            : undefined)
        );
      },
    });
  }
  const common = {},
    utilities: any = {};
  modules[80699] = overlay(
    input.modules?.[80699] ?? input.getModule?.(80699) ?? {},
    common,
  );
  modules[93039] = overlay(
    input.modules?.[93039] ?? input.getModule?.(93039) ?? {},
    utilities,
  );
  const runtime: any = {
    ...input,
    modules,
    setTimeout(callback: (...args: any[]) => any, ms: number, ...args: any[]) {
      const timer = schedule(() => {
        timers.delete(timer);
        return accepted(() => callback(...args), true);
      }, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer: any) {
      timers.delete(timer);
      cancel(timer);
    },
    setInterval(callback: (...args: any[]) => any, ms: number, ...args: any[]) {
      const timer = scheduleInterval(() => {
        if (state === "open") accepted(() => callback(...args), true);
      }, ms);
      intervals.add(timer);
      return timer;
    },
    clearInterval(timer: any) {
      intervals.delete(timer);
      cancelInterval(timer);
    },
  };
  const base = createCapturedAcpModules(runtime),
    primitiveModules = { ...modules };
  delete primitiveModules[8046];
  const p = sources.primitives({
    ...runtime,
    modules: primitiveModules,
    getModule: base.getModule,
  });
  Object.assign(common, { Deferred: p.Deferred });
  Object.assign(utilities, {
    TelemetryUtils: p.TelemetryUtils,
    ErrorUtils: p.getModule(8046).ErrorUtils,
  });
  Object.assign(modules, {
    22618: p.protocol,
    54631: p.trace,
    91364: p.history,
    66545: base.getModule(69466),
    12502: { AcpUtils: base.AcpUtils },
  });
  runtime.getModule = base.getModule;
  const n = sources.agent(runtime),
    v = sources.view(runtime);

  function instrument(target: any) {
    for (const value of Object.values(target))
      if (value instanceof Subject) {
        subjects.add(value);
        restorations.push(observeSubscription(value));
      }
    const methods = new Set<string>();
    for (
      let proto = Object.getPrototypeOf(target);
      proto && proto !== Object.prototype;
      proto = Object.getPrototypeOf(proto)
    )
      for (const name of Object.getOwnPropertyNames(proto))
        if (
          name !== "constructor" &&
          typeof Object.getOwnPropertyDescriptor(proto, name)?.value ===
            "function"
        )
          methods.add(name);
    for (const name of methods) {
      const original = target[name];
      const method = function (this: any, ...args: any[]) {
        // Native event/abort callbacks retain the actual instance as receiver
        // but may run outside ALS. Accepted callbacks may finish during closing;
        // new external calls are guarded by the facade below.
        if (state === "closed") {
          const error = closedError();
          if (original.constructor?.name === "AsyncFunction")
            return Promise.reject(error);
          throw error;
        }
        return accepted(() => {
          const result =
            name === "createEventForwardingPromise"
              ? observeSessionSubscriptions(args[0], () =>
                  Reflect.apply(original, this, args),
                )
              : Reflect.apply(original, this, args);
          if (name === "createPromptIterator") rememberIterator(result);
          return result;
        });
      };
      Object.defineProperty(method, "name", { value: original.name });
      Object.defineProperty(method, "length", { value: original.length });
      Object.defineProperty(target, name, {
        configurable: true,
        writable: true,
        value: method,
      });
    }
    const cache = new Map<PropertyKey, { member: any; method: any }>();
    return new Proxy(target, {
      get(value, key) {
        const member = Reflect.get(value, key, value);
        if (typeof member !== "function" || key === "constructor")
          return member;
        if (cache.get(key)?.member === member) return cache.get(key)!.method;
        const method = (...args: any[]) => {
          try {
            assertAdmission();
          } catch (error) {
            if (
              Object.getPrototypeOf(value)[key]?.constructor?.name ===
              "AsyncFunction"
            )
              return Promise.reject(error);
            throw error;
          }
          return Reflect.apply(member, value, args);
        };
        Object.defineProperty(method, "name", { value: member.name });
        Object.defineProperty(method, "length", { value: member.length });
        cache.set(key, { member, method });
        return method;
      },
    });
  }
  function rememberIterator(value: any) {
    const descriptor = Object.getOwnPropertyDescriptor(
        value,
        Symbol.asyncIterator,
      ),
      create = value[Symbol.asyncIterator];
    const created = new Set<any>();
    const finish = () => {
      // An unstarted iterator already has a source prompt subscription. Use its
      // real return() too; never resolve a synthetic prompt or mark a run idle.
      if (!created.size) created.add(Reflect.apply(create, value, []));
      return Promise.all([...created].map((iterator) => iterator.return?.()));
    };
    Object.defineProperty(value, Symbol.asyncIterator, {
      configurable: true,
      writable: true,
      value(...args: any[]) {
        const iterator = Reflect.apply(create, this, args);
        created.add(iterator);
        return iterator;
      },
    });
    restorations.push(() => {
      if (descriptor)
        Object.defineProperty(value, Symbol.asyncIterator, descriptor);
      else delete value[Symbol.asyncIterator];
    });
    iterators.add(finish);
    if (state !== "open") accepted(finish, true);
  }
  const agent: any = instrument(new n.AcpAgentImpl()),
    view: any = instrument(new v.AcpView()),
    toolInterceptor: any = instrument(new p.AcpToolInterceptor());
  Object.assign(view, options.viewDependencies);
  let sessionDeferred: any;
  Object.defineProperty(agent, "sessionDeferred", {
    configurable: true,
    enumerable: true,
    get: () => sessionDeferred,
    set(value) {
      sessionDeferred = value;
      rememberDeferred(value);
    },
  });
  restorations.push(() => {
    if (sessionDeferred === undefined) delete agent.sessionDeferred;
    else
      Object.defineProperty(agent, "sessionDeferred", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: sessionDeferred,
      });
  });
  const promptNextDescriptor = Object.getOwnPropertyDescriptor(
      agent.promptEvent,
      "next",
    ),
    promptNext = agent.promptEvent.next;
  Object.defineProperty(agent.promptEvent, "next", {
    configurable: true,
    writable: true,
    value(item: any) {
      if (admission.getStore()) rememberDeferred(item?.responseDeferred);
      return Reflect.apply(promptNext, this, [item]);
    },
  });
  restorations.push(() => {
    if (promptNextDescriptor)
      Object.defineProperty(agent.promptEvent, "next", promptNextDescriptor);
    else delete agent.promptEvent.next;
  });
  const toolDeferreds = agent.toolCallSentDeferreds,
    mapSet = toolDeferreds.set;
  Object.defineProperty(toolDeferreds, "set", {
    configurable: true,
    writable: true,
    value(key: any, value: any) {
      rememberDeferred(value);
      return Reflect.apply(mapSet, this, [key, value]);
    },
  });
  restorations.push(() => {
    delete toolDeferreds.set;
  });
  async function drain() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  function close(): Promise<void> {
    if (closing) return closing;
    state = "closing";
    closing = (async () => {
      const failures: unknown[] = [];
      const attempt = (operation: () => void) => {
        try {
          operation();
        } catch (error) {
          failures.push(error);
        }
      };
      for (const timer of intervals) attempt(() => cancelInterval(timer));
      intervals.clear();
      for (const value of deferreds) attempt(() => value.reject(closedError()));
      for (const finish of iterators) accepted(finish, true);
      if (options.beforeClose)
        try {
          await accepted(options.beforeClose);
        } catch (error) {
          failures.push(error);
        }
      // Original forwarding requires its caller's abort/normal terminal event.
      // Cleaning subscriptions early would strand that actual Promise forever.
      await drain();
      for (const cleanup of agent.activeForwardingCleanups.values())
        attempt(cleanup);
      agent.activeForwardingCleanups.clear();
      attempt(() => agent.urlSubjectSubscription?.unsubscribe());
      for (const subject of subjects) attempt(() => subject.complete());
      // Completing owned Subjects can itself publish accepted asynchronous
      // completion callbacks. Keep their wakeup timers until those settle too.
      await drain();
      for (const sub of subscriptions) attempt(() => sub.unsubscribe());
      subscriptions.clear();
      for (const timer of timers) attempt(() => cancel(timer));
      timers.clear();
      subjects.clear();
      for (const restore of restorations.reverse()) attempt(restore);
      restorations.length = 0;
      deferreds.clear();
      iterators.clear();
      admission.disable();
      state = "closed";
      if (failures.length || errors.length)
        throw new AggregateError(
          [...failures, ...errors],
          "Native ACP protocol host close failed",
        );
    })();
    return closing;
  }
  return {
    runtime,
    modules,
    base,
    p,
    n,
    v,
    agent,
    view,
    toolInterceptor,
    drain,
    close,
    get state() {
      return state;
    },
    get pendingCount() {
      return pending.size;
    },
    get timerCount() {
      return timers.size + intervals.size;
    },
    get subscriptionCount() {
      return subscriptions.size;
    },
    get deferredCount() {
      return deferreds.size;
    },
    get errors(): readonly unknown[] {
      return [...errors];
    },
  };
}
