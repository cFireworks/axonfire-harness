import { createNativeAcpView } from "./native-acp-view.js";
import type { createHarness } from "../runtime/create-harness.js";
import type { HarnessSession } from "../sessions/session.js";
import type { createAcpServicesHost } from "./acp-services-host.js";
import {
  setInterval,
  clearInterval,
  setTimeout,
  clearTimeout,
} from "node:timers";
import { withTrace } from "@openai/agents-core";
import { LocalNoopTrace } from "../runtime/local-trace.js";

export type AcpViewHostOptions = {
  backend: Awaited<ReturnType<typeof createHarness>>;
  session: HarnessSession;
  /** Dedicated, fully wired source Agent with a real ACP connection; never a substitute Agent implementation. */
  agent: any;
  agentManager: { get(id: string): any };
  services: ReturnType<typeof createAcpServicesHost>;
  runtime: any;
  followUpPauseState: {
    setLeadInboxPaused(session: HarnessSession, paused: boolean): void;
    isLeadInboxPaused(session: HarnessSession): boolean;
  };
  /** Borrowed HTTP Context scope with the actual acp-connection-id. */
  runInContext<T>(operation: () => T): T;
  logger: any;
  sourceFactory?: typeof createNativeAcpView;
};

/** Explicit standalone ownership adapter around the complete original render/iterator/prompt loop.
 * Owns the View, its render lifetime and approval lease. Backend, Agent, connection and source DI are borrowed.
 * New-session/auth/internal-agent routing are deliberately not fabricated by this adapter.
 */
export function createAcpViewHost(options: AcpViewHostOptions) {
  const { backend, session, agent } = options;
  if (!backend.interruptions.nativeController)
    throw Error("Full ACP View requires nativeApprovals on the backend");
  if (!backend.nativePermissions)
    throw Error("Full ACP View requires nativePermissions on the backend");
  if (!agent.getConnectionId() || !agent.getConnection())
    throw Error("A connected source ACP Agent is required");
  if (agent.interruptionService !== backend.approvalOwners.interruptionService)
    throw Error(
      "Source ACP DI must use this backend's approval-owner interruption adapter",
    );
  if (agent.activeForwardingCleanups.size)
    throw Error("ACP Agent already has an active forwarder");
  const timers = new Set<ReturnType<typeof setTimeout>>(),
    intervals = new Set<ReturnType<typeof setInterval> | number>(),
    pending = new Set<Promise<any>>(),
    deferreds = new Set<any>(),
    iterators = new Set<any>();
  const subscriptions = new Set<any>(),
    asynchronousErrors: unknown[] = [],
    observed = new WeakMap<object, any>(),
    taskListeners = new Set<{ event: any; listener: any }>();
  let closed = false,
    started = false,
    loop: Promise<any> | undefined,
    closing: Promise<void> | undefined,
    failure: unknown;
  let readyResolve!: () => void, readyReject!: (error: any) => void;
  const ready = new Promise<void>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  // A failed start is still observable even if caller only awaits close().
  void ready.catch(() => {});
  function track<T>(value: Promise<T>): Promise<T> {
    pending.add(value);
    void value.then(
      () => pending.delete(value),
      () => pending.delete(value),
    );
    return value;
  }
  function observeResult(value: any) {
    if (value && typeof value.then === "function") {
      track(value);
      void value.catch((error: unknown) => {
        asynchronousErrors.push(error);
        options.logger.error?.(
          "[ACP View host] asynchronous subscription failed",
          error,
        );
      });
    }
    return value;
  }
  function observeObservable(value: any): any {
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
            const subscription = target.subscribe(next, ...args);
            subscriptions.add(subscription);
            return subscription;
          };
        if (key === "pipe")
          return (...args: any[]) => observeObservable(target.pipe(...args));
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
  const observedAgent = new Proxy(agent, {
    get(target, key) {
      const raw = Reflect.get(target, key, target);
      if (eventNames.has(String(key))) return observeObservable(raw);
      return typeof raw === "function" ? raw.bind(target) : raw;
    },
  });
  const taskManager = new Proxy(backend.taskManager, {
    get(target, key) {
      if (key === "on")
        return (event: any, listener: any) => {
          taskListeners.add({ event, listener });
          target.on(event, listener);
          return taskManager;
        };
      if (key === "off")
        return (event: any, listener: any) => {
          for (const value of taskListeners)
            if (value.event === event && value.listener === listener)
              taskListeners.delete(value);
          target.off(event, listener);
          return taskManager;
        };
      const raw = Reflect.get(target, key, target);
      return typeof raw === "function" ? raw.bind(target) : raw;
    },
  });
  const common =
      options.runtime.modules?.[80699] ?? options.runtime.getModule(80699),
    tasksToken = (
      options.runtime.modules?.[97959] ?? options.runtime.getModule(97959)
    ).AgentTaskManager;
  const ownedCommon = new Proxy(common, {
    get(target, key) {
      if (key === "ContainerUtil")
        return new Proxy(target.ContainerUtil, {
          get(container, method) {
            if (method === "get")
              return (token: any) =>
                token === tasksToken ? taskManager : container.get(token);
            return Reflect.get(container, method, container);
          },
        });
      return Reflect.get(target, key, target);
    },
  });
  const source = (options.sourceFactory ?? createNativeAcpView)({
    ...options.runtime,
    modules: { ...options.runtime.modules, 80699: ownedCommon },
    setTimeout(run: (...args: any[]) => any, ms: number, ...args: any[]) {
      const token = setTimeout(() => {
        timers.delete(token);
        run(...args);
      }, ms);
      timers.add(token);
      return token;
    },
    clearTimeout(token: any) {
      timers.delete(token);
      clearTimeout(token);
    },
    setInterval(run: (...args: any[]) => any, ms: number, ...args: any[]) {
      const token = setInterval(run, ms, ...args);
      intervals.add(token);
      return token;
    },
    clearInterval(token: any) {
      intervals.delete(token);
      clearInterval(token);
    },
  });
  const view = new source.AcpView();
  const taskStorage = new Proxy(backend.taskStorage, {
    get(target, key) {
      const raw = Reflect.get(target, key, target);
      return typeof raw === "function"
        ? (...args: any[]) => {
            const value: any = Reflect.apply(raw, target, args);
            return value && typeof value.then === "function"
              ? track(value)
              : value;
          }
        : raw;
    },
  });
  Object.assign(view, {
    logger: options.logger,
    sessionManager: backend.sessions,
    stateMachine: backend.stateMachine,
    agentService: {
      runDefault: (...args: any[]) =>
        track(Reflect.apply(backend.service.runDefault, backend.service, args)),
    },
    commandManager: backend.commandManager,
    agentManager: options.agentManager,
    interruptionService: backend.interruptions,
    taskStorage,
    broadcastService: options.services.broadcast,
    frictionAnalysisService: options.services.friction,
  });
  if (options.runInContext(() => view.getAcpAgent()) !== agent)
    throw Error("ACP Context does not identify the supplied source Agent");
  view.agentManager = {
    get(id: string) {
      const actual = options.agentManager.get(id);
      return actual === agent ? observedAgent : actual;
    },
  };
  const lease = backend.approvalOwners.claim(session, () => {
      if (started && !closed && view.shouldDrainQueue(session))
        view.triggerDrain(session);
    }),
    previousAcp = session.options.acp;
  let releasePauseState: () => void;
  try {
    releasePauseState = backend.teamLeadPoller.borrowPauseState(
      session,
      options.followUpPauseState,
    );
  } catch (error) {
    lease.release();
    throw error;
  }
  session.options.acp = true;
  const createIterator = view.createPromptIterator;
  view.createPromptIterator = function (a: any, b: any) {
    const iterable: any = Reflect.apply(createIterator, this, [a, b]);
    return {
      [Symbol.asyncIterator]() {
        const iterator = iterable[Symbol.asyncIterator]();
        iterators.add(iterator);
        readyResolve();
        return {
          next: () => (closed ? iterator.return() : iterator.next()),
          return: () => iterator.return(),
        };
      },
    };
  };
  const approval = agent.handleToolApproval;
  agent.handleToolApproval = function (a: any, b: any) {
    return track(Reflect.apply(approval, this, [a, b]) as Promise<any>);
  };
  const dispatch = view.dispatchQueuedPrompt;
  view.dispatchQueuedPrompt = function (a: any, b: any, c: any) {
    return track(Reflect.apply(dispatch, this, [a, b, c]) as Promise<any>);
  };
  const promptSubscription = agent.promptEvent.subscribe((value: any) => {
    deferreds.add(value.responseDeferred);
    void value.responseDeferred.promise.then(
      () => deferreds.delete(value.responseDeferred),
      () => deferreds.delete(value.responseDeferred),
    );
  });
  const results = session.resultSubject.subscribe((result: any) => {
    if (result)
      track(
        (async () => {
          try {
            await result.completed;
          } finally {
            await backend.sessions.waitForResultHandled(result);
            await backend.interruptions.waitForResultHandled(result);
          }
        })(),
      );
  });
  async function prompt(request: any) {
    if (closed || !started) throw Error("ACP View host is not running");
    if (failure) throw failure;
    if (request.sessionId !== session.id)
      throw Error("ACP View host session mismatch");
    return track(agent.prompt(request));
  }
  const rpcMethods = new Map<PropertyKey, { raw: any; value: any }>();
  const rpcAgent = new Proxy(agent, {
    get(target, key) {
      const raw = Reflect.get(target, key, target);
      if (typeof raw !== "function") return raw;
      if (rpcMethods.get(key)?.raw === raw) return rpcMethods.get(key)!.value;
      const value = function (...args: any[]) {
        if (closed) throw Error("ACP View host is closed");
        return key === "prompt"
          ? prompt(args[0])
          : Reflect.apply(raw, target, args);
      };
      Object.defineProperty(value, "name", {
        value: raw.name,
        configurable: true,
      });
      Object.defineProperty(value, "length", {
        value: raw.length,
        configurable: true,
      });
      rpcMethods.set(key, { raw, value });
      return value;
    },
  });
  return {
    view,
    /** Register this gated facade with AgentSideConnection; the source Agent itself remains unchanged. */
    rpcAgent,
    get closed() {
      return closed;
    },
    get pendingCount() {
      return pending.size;
    },
    get timerCount() {
      return timers.size + intervals.size;
    },
    get taskListenerCount() {
      return taskListeners.size;
    },
    get asynchronousErrors() {
      return [...asynchronousErrors];
    },
    async start() {
      if (closed) throw Error("ACP View host is closed");
      if (!started) {
        started = true;
        agent.setSession(session);
        loop = Promise.resolve(
          options.runInContext(() =>
            withTrace(new LocalNoopTrace(), () => view.render(session)),
          ),
        );
        const fail = (error: unknown) => {
          if (closed) return;
          failure = error;
          readyReject(error);
          for (const deferred of deferreds) deferred.reject(error);
        };
        void loop.then(
          () => fail(Error("ACP render exited unexpectedly")),
          fail,
        );
      }
      await ready;
    },
    prompt,
    close(): Promise<void> {
      if (closing) return closing;
      closed = true;
      return (closing = (async () => {
        try {
          if (deferreds.size || backend.stateMachine.isBusy(session))
            await agent.cancel({ sessionId: session.id });
          for (const iterator of iterators) await iterator.return();
          // Source iterator.return does not settle parked request Deferreds. Teardown rejects only owned, unfinished requests.
          for (const deferred of deferreds)
            deferred.reject(
              Object.assign(Error("ACP View host closed"), {
                name: "AbortError",
              }),
            );
          backend.interruptions.cancelAllForSession(
            session.id,
            "ACP View host closed",
          );
          await loop;
          while (pending.size) await Promise.allSettled([...pending]);
          await backend.interruptions.waitForPermissionWrites();
          // The source cancel path can leave a settled, interrupted run in CANCELLING.
          // Normalize only at the owned teardown barrier, after SDK/approval continuations drained; never while executing.
          if (
            session.abortSignal.aborted &&
            backend.stateMachine.getSnapshot(session).status === "cancelling"
          )
            backend.stateMachine.forceIdle(
              session,
              "ACP owned cancellation drained at close",
            );
        } finally {
          promptSubscription.unsubscribe();
          results.unsubscribe();
          for (const subscription of subscriptions) subscription.unsubscribe();
          subscriptions.clear();
          for (const { event, listener } of taskListeners)
            backend.taskManager.off(event, listener);
          taskListeners.clear();
          for (const timer of timers) clearTimeout(timer);
          timers.clear();
          for (const interval of intervals) clearInterval(interval);
          intervals.clear();
          agent.activeForwardingCleanups.get(session.id)?.();
          agent.handleToolApproval = approval;
          options.services.usage.unregister(session.id);
          releasePauseState();
          session.options.acp = previousAcp;
          lease.release();
        }
      })());
    },
  };
}
