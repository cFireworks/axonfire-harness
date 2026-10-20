import { createNativeAcpView } from "./native-acp-view.js";
import { withTrace } from "@openai/agents-core";
import { LocalNoopTrace } from "../runtime/local-trace.js";

export interface AcpRendezvousHostOptions {
  runtime: any;
  /** Borrowed source ACP registry, not the SDK AgentManager. */
  agentManager: { get(connectionId: string): any };
  /** Fully wired native parent services. No authentication/session/approval substitutes are created here. */
  dependencies: {
    sessionManager: any;
    stateMachine: any;
    agentService: any;
    commandManager: any;
    interruptionService: any;
    taskStorage: any;
    broadcastService: any;
    frictionAnalysisService: any;
  };
  logger: any;
  sourceFactory?: typeof createNativeAcpView;
}

/** Owns an HTTP-invoked original View, not an already-created standalone session.
 * Only the original render() calls setSession. HTTP, registry, auth, SDK backend and services are borrowed.
 */
export function createAcpRendezvousHost(options: AcpRendezvousHostOptions) {
  const pending = new Set<Promise<any>>(),
    timers = new Set<ReturnType<typeof setTimeout>>(),
    intervals = new Set<ReturnType<typeof setInterval>>();
  const agents = new Set<any>(),
    deferreds = new Set<any>(),
    iterators = new Set<any>(),
    subscriptions = new Set<any>();
  const facades = new WeakMap<object, any>(),
    observed = new WeakMap<object, any>(),
    errors: unknown[] = [];
  const entries = new Map<
    string,
    { session: any; ready: boolean; failure?: unknown; render?: Promise<any> }
  >();
  const restoreAgents = new Set<() => void>();
  const taskListeners = new Set<{ target: any; event: any; listener: any }>();
  let closed = false,
    closing: Promise<void> | undefined;
  const closedError = () =>
    Object.assign(Error("ACP rendezvous host is closed"), {
      name: "AbortError",
    });
  function track<T>(value: T): T {
    if (value && typeof (value as any).then === "function") {
      const completion = Promise.resolve(value);
      pending.add(completion);
      void completion.then(
        () => pending.delete(completion),
        () => pending.delete(completion),
      );
    }
    return value;
  }
  function observeResult(value: any) {
    track(value);
    if (value && typeof value.then === "function")
      void Promise.resolve(value).catch((error) => {
        errors.push(error);
        options.logger.error?.(
          "[ACP rendezvous] asynchronous callback failed",
          error,
        );
      });
    return value;
  }
  function observable(value: any): any {
    if (observed.has(value)) return observed.get(value);
    const proxy = new Proxy(value, {
      get(target, key) {
        if (key === "subscribe")
          return (observer: any, ...args: any[]) => {
            const next =
              typeof observer === "function"
                ? function (this: any, ...values: any[]) {
                    return observeResult(Reflect.apply(observer, this, values));
                  }
                : observer && typeof observer.next === "function"
                  ? {
                      next: (...values: any[]) =>
                        observeResult(
                          Reflect.apply(observer.next, observer, values),
                        ),
                      error: observer.error?.bind(observer),
                      complete: observer.complete?.bind(observer),
                    }
                  : observer;
            const sub = target.subscribe(next, ...args);
            subscriptions.add(sub);
            return sub;
          };
        if (key === "pipe")
          return (...args: any[]) => observable(target.pipe(...args));
        const raw = Reflect.get(target, key, target);
        return typeof raw === "function" ? raw.bind(target) : raw;
      },
    });
    observed.set(value, proxy);
    return proxy;
  }
  const eventNames = new Set([
    "modelChangeEvent",
    "modeChangeEvent",
    "configChangeEvent",
    "cancelEvent",
  ]);
  function remember(agent: any) {
    if (!agent || agents.has(agent)) return;
    const descriptor = Object.getOwnPropertyDescriptor(
      agent,
      "sessionDeferred",
    );
    if (descriptor && (!descriptor.configurable || !("value" in descriptor)))
      throw Error(
        "A dedicated source Agent with a writable sessionDeferred is required",
      );
    const setSessionDescriptor = Object.getOwnPropertyDescriptor(
        agent,
        "setSession",
      ),
      setSession = agent.setSession;
    if (
      typeof setSession !== "function" ||
      (setSessionDescriptor &&
        (!setSessionDescriptor.configurable ||
          !("value" in setSessionDescriptor)))
    )
      throw Error(
        "A dedicated source Agent with an observable setSession is required",
      );
    let value = agent.sessionDeferred;
    Object.defineProperty(agent, "sessionDeferred", {
      configurable: true,
      enumerable: descriptor?.enumerable ?? true,
      get: () => value,
      set(next) {
        value = next;
        if (next?.promise) void next.promise.catch(() => {});
        if (closed) next?.reject(closedError());
      },
    });
    restoreAgents.add(() => {
      if (descriptor)
        Object.defineProperty(agent, "sessionDeferred", {
          ...descriptor,
          value,
        });
      else if (value !== undefined)
        Object.defineProperty(agent, "sessionDeferred", {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
      else delete agent.sessionDeferred;
    });
    const observedSetSession = function (this: any, ...args: any[]) {
      const result = Reflect.apply(setSession, this, args);
      const entry = entries.get(agent.getConnectionId());
      if (entry) entry.session = args[0];
      return result;
    };
    Object.defineProperty(observedSetSession, "name", {
      value: setSession.name,
    });
    Object.defineProperty(observedSetSession, "length", {
      value: setSession.length,
    });
    Object.defineProperty(agent, "setSession", {
      configurable: true,
      writable: true,
      value: observedSetSession,
    });
    restoreAgents.add(() => {
      if (setSessionDescriptor)
        Object.defineProperty(agent, "setSession", setSessionDescriptor);
      else delete agent.setSession;
    });
    agents.add(agent);
    const sub = agent.promptEvent.subscribe((item: any) => {
      const d = item.responseDeferred;
      deferreds.add(d);
      void d.promise.then(
        () => deferreds.delete(d),
        () => deferreds.delete(d),
      );
    });
    subscriptions.add(sub);
  }
  function observedAgent(agent: any) {
    remember(agent);
    if (!facades.has(agent))
      facades.set(
        agent,
        new Proxy(agent, {
          get(target, key) {
            const raw = Reflect.get(target, key, target);
            if (eventNames.has(String(key))) return observable(raw);
            return typeof raw === "function" ? raw.bind(target) : raw;
          },
        }),
      );
    return facades.get(agent);
  }
  const borrowedCommon =
    options.runtime.modules?.[80699] ?? options.runtime.getModule?.(80699);
  const ownedServices = new WeakMap<object, any>();
  function ownedService(target: any): any {
    if (!target || typeof target !== "object") return target;
    if (ownedServices.has(target)) return ownedServices.get(target);
    const proxy = new Proxy(target, {
      get(value, key) {
        if (
          key === "on" &&
          typeof value.on === "function" &&
          typeof value.off === "function"
        )
          return (event: any, listener: any) => {
            taskListeners.add({ target: value, event, listener });
            value.on(event, listener);
            return proxy;
          };
        if (key === "off" && typeof value.off === "function")
          return (event: any, listener: any) => {
            for (const item of taskListeners)
              if (
                item.target === value &&
                item.event === event &&
                item.listener === listener
              )
                taskListeners.delete(item);
            value.off(event, listener);
            return proxy;
          };
        if (key === "getChange$" && typeof value.getChange$ === "function")
          return (...args: any[]) => observable(value.getChange$(...args));
        const raw = Reflect.get(value, key, value);
        return typeof raw === "function" ? raw.bind(value) : raw;
      },
    });
    ownedServices.set(target, proxy);
    return proxy;
  }
  const common =
    borrowedCommon &&
    new Proxy(borrowedCommon, {
      get(target, key) {
        if (key === "ContainerUtil")
          return new Proxy(target.ContainerUtil, {
            get(container, name) {
              if (name === "get")
                return (token: any) => ownedService(container.get(token));
              return Reflect.get(container, name, container);
            },
          });
        return Reflect.get(target, key, target);
      },
    });
  function stopTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
    for (const id of intervals) clearInterval(id);
    intervals.clear();
  }
  let source: any, raw: any;
  try {
    source = (options.sourceFactory ?? createNativeAcpView)({
      ...options.runtime,
      ...(common
        ? { modules: { ...options.runtime.modules, 80699: common } }
        : {}),
      setTimeout(
        callback: (...args: any[]) => any,
        ms: number,
        ...args: any[]
      ) {
        const id = setTimeout(() => {
          timers.delete(id);
          observeResult(callback(...args));
        }, ms);
        timers.add(id);
        return id;
      },
      clearTimeout(id: any) {
        timers.delete(id);
        clearTimeout(id);
      },
      setInterval(
        callback: (...args: any[]) => any,
        ms: number,
        ...args: any[]
      ) {
        const id = setInterval(() => observeResult(callback(...args)), ms);
        intervals.add(id);
        return id;
      },
      clearInterval(id: any) {
        intervals.delete(id);
        clearInterval(id);
      },
    });
    raw = new source.AcpView();
    Object.assign(raw, options.dependencies, {
      logger: options.logger,
      agentManager: {
        get(id: string) {
          const agent = options.agentManager.get(id);
          return agent ? observedAgent(agent) : undefined;
        },
      },
    });
    raw.init();
  } catch (error) {
    closed = true;
    stopTimers();
    throw error;
  }
  const createIterator = raw.createPromptIterator;
  raw.createPromptIterator = function (agent: any, session: any) {
    const iterable: any = Reflect.apply(createIterator, this, [agent, session]);
    const id = agent.getConnectionId();
    return {
      [Symbol.asyncIterator]() {
        const iterator = iterable[Symbol.asyncIterator]();
        iterators.add(iterator);
        const entry = entries.get(id);
        if (entry) {
          entry.ready = true;
          entry.session = session;
        }
        return {
          next: () => (closed ? iterator.return() : iterator.next()),
          return: () => iterator.return(),
        };
      },
    };
  };
  const dispatch = raw.dispatchQueuedPrompt;
  raw.dispatchQueuedPrompt = function (...args: any[]) {
    return observeResult(Reflect.apply(dispatch, this, args));
  };
  const render = raw.render;
  function renderRequest(model: any, metadata?: any) {
    if (closed) throw closedError();
    const id = raw.getConnectionIdFromRequest(),
      agent = id && options.agentManager.get(id);
    if (agent) remember(agent);
    const entry = id && (entries.get(id) ?? { session: model, ready: false });
    if (id && entry) entries.set(id, entry);
    const operation = withTrace(new LocalNoopTrace(), () => {
      if (closed) throw closedError();
      const before = iterators.size;
      const rendering: any = Reflect.apply(render, raw, [model, metadata]);
      if (entry && iterators.size > before) {
        entry.render = rendering;
        void rendering.then(
          () => {
            if (!closed) entry.failure = Error("ACP native render exited");
          },
          (error: any) => {
            entry.failure = error;
          },
        );
      }
      return rendering;
    });
    void operation.catch((error) => {
      if (entry) entry.failure = error;
    });
    return track(operation);
  }
  const view = new Proxy(raw, {
    get(target, key) {
      if (key === "render") return renderRequest;
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const rpc = new WeakMap<object, any>();
  function rpcAgent(agent: any) {
    if (closed) throw closedError();
    remember(agent);
    if (!rpc.has(agent)) {
      const methods = new Map<PropertyKey, { raw: any; value: any }>();
      rpc.set(
        agent,
        new Proxy(agent, {
          get(target, key) {
            const raw = Reflect.get(target, key, target);
            if (typeof raw !== "function") return raw;
            if (methods.get(key)?.raw === raw) return methods.get(key)!.value;
            const value = function (...args: any[]) {
              if (closed) throw closedError();
              const failure = entries.get(agent.getConnectionId())?.failure;
              if (failure) throw failure;
              return track(Reflect.apply(raw, target, args));
            };
            Object.defineProperty(value, "name", { value: raw.name });
            Object.defineProperty(value, "length", { value: raw.length });
            methods.set(key, { raw, value });
            return value;
          },
        }),
      );
    }
    return rpc.get(agent);
  }
  function close(): Promise<void> {
    if (closing) return closing;
    closed = true;
    closing = (async () => {
      const failures: unknown[] = [];
      try {
        for (const agent of agents) {
          const entry = entries.get(agent.getConnectionId());
          if (
            entry?.session &&
            (deferreds.size ||
              options.dependencies.stateMachine.isBusy(entry.session))
          )
            try {
              await agent.cancel({ sessionId: entry.session.id });
            } catch (error) {
              failures.push(error);
            }
          agent.sessionDeferred?.reject(closedError());
        }
        for (const iterator of iterators)
          try {
            await iterator.return();
          } catch (error) {
            failures.push(error);
          }
        for (const d of deferreds) d.reject(closedError());
        while (pending.size) await Promise.allSettled([...pending]);
      } finally {
        for (const sub of subscriptions) sub.unsubscribe();
        subscriptions.clear();
        for (const { target, event, listener } of taskListeners)
          target.off(event, listener);
        taskListeners.clear();
        stopTimers();
        iterators.clear();
        for (const restore of restoreAgents) restore();
        restoreAgents.clear();
      }
      if (failures.length)
        throw new AggregateError(failures, "ACP rendezvous cleanup failed");
    })();
    return closing;
  }
  return {
    view,
    rawView: raw,
    rpcAgent,
    close,
    get closed() {
      return closed;
    },
    get pendingCount() {
      return pending.size;
    },
    get timerCount() {
      return timers.size + intervals.size;
    },
    get iteratorCount() {
      return iterators.size;
    },
    get taskListenerCount() {
      return taskListeners.size;
    },
    get asynchronousErrors() {
      return [...errors];
    },
    getEntry(connectionId: string) {
      return entries.get(connectionId);
    },
  };
}
