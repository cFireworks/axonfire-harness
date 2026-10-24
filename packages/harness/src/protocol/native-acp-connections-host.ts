import { createNativeAcpConnections } from "./native-acp-connections.js";

export interface NativeAcpConnectionsHostOptions {
  /** Original DI namespaces, explicit IO and optional clock. No installed account discovery. */
  runtime: Record<string, any>;
  dependencies: {
    logger: any;
    sessionManager: any;
    settingsManager: any;
    interruptionService: any;
    broadcastService: any;
    auditLog: any;
    requestMatcher: any;
    pathResolver: any;
    corsService: any;
    auth: any;
  };
  sourceFactory?: typeof createNativeAcpConnections;
  /** Stop parent admission and finish/cancel borrowed Agent work; end owned stdio input here. */
  beforeClose?: () => void | Promise<void>;
}

/** Explicit assembly of original connection components, not the product DI bootstrap.
 * Raw components are exposed for parent DI. The parent must stop dispatch before close.
 * Borrowed IO, Agent, sessions, authentication and settings remain parent-owned.
 */
export function createNativeAcpConnectionsHost(
  options: NativeAcpConnectionsHostOptions,
) {
  const { runtime, dependencies: d } = options;
  const pending = new Set<Promise<unknown>>(),
    endpoints = new Set<any>();
  const creating = new Set<Promise<unknown>>();
  const inputs = new Map<any, any>();
  const writingResponses = new Map<any, number>();
  const timeouts = new Set<any>(),
    intervals = new Set<any>(),
    errors: unknown[] = [];
  const restorers: (() => void)[] = [];
  let closing: Promise<void> | undefined;
  const observe = <T>(value: T, bucket = pending): T => {
    if (value && typeof (value as any).then === "function") {
      const settled = Promise.resolve(value).then(
        () => {},
        () => {},
      );
      bucket.add(settled);
      void settled.then(() => bucket.delete(settled));
    }
    return value;
  };
  const drain = async (bucket = pending) => {
    while (bucket.size) await Promise.all([...bucket]);
  };
  const moduleOf = (id: number) =>
    runtime.modules?.[id] ?? runtime.getModule?.(id);
  const protocol = moduleOf(22618);
  if (!protocol?.AgentSideConnection)
    throw Error("Explicit ACP protocol namespace required");
  // Construct the actual SDK class, preserving its prototype and constructor identity.
  const protocolOverlay = Object.create(protocol);
  Object.defineProperty(protocolOverlay, "AgentSideConnection", {
    value: new Proxy(protocol.AgentSideConnection, {
      construct(target, args, newTarget) {
        const endpoint = Reflect.construct(target, args, newTarget);
        endpoints.add(endpoint);
        const retire = () => {
          endpoints.delete(endpoint);
          inputs.delete(args[1]);
        };
        void Promise.resolve(endpoint.closed).then(retire, retire);
        return endpoint;
      },
    }),
  });
  const clearTimeoutFn = runtime.clearTimeout ?? globalThis.clearTimeout;
  const clearIntervalFn = runtime.clearInterval ?? globalThis.clearInterval;
  const timer = (
    repeat: boolean,
    callback: (...args: any[]) => any,
    ms: number,
    ...args: any[]
  ) => {
    const set = repeat ? intervals : timeouts;
    let token: any;
    const run = (...values: any[]) => {
      if (!repeat) set.delete(token);
      try {
        const result = callback(...values);
        observe(result);
        if (result && typeof result.then === "function")
          void Promise.resolve(result).catch((error) => errors.push(error));
      } catch (error) {
        errors.push(error);
      }
    };
    token = (
      repeat
        ? (runtime.setInterval ?? globalThis.setInterval)
        : (runtime.setTimeout ?? globalThis.setTimeout)
    )(run, ms, ...args);
    set.add(token);
    return token;
  };
  const n = (options.sourceFactory ?? createNativeAcpConnections)({
    ...runtime,
    modules: { ...runtime.modules, 22618: protocolOverlay },
    setTimeout: (fn: any, ms: number, ...args: any[]) =>
      timer(false, fn, ms, ...args),
    setInterval: (fn: any, ms: number, ...args: any[]) =>
      timer(true, fn, ms, ...args),
    clearTimeout: (token: any) => {
      timeouts.delete(token);
      clearTimeoutFn(token);
    },
    clearInterval: (token: any) => {
      intervals.delete(token);
      clearIntervalFn(token);
    },
  });
  const stream: any = new n.AcpStreamManagerImpl();
  const transports: any = new n.AcpTransportManagerImpl();
  const transportFactory: any = new n.AcpTransportFactoryImpl();
  const agents: any = new n.AcpAgentManagerImpl();
  const server: any = new n.AcpServerImpl();
  const acp: any = new n.AcpContextImpl();
  const guard: any = new n.AcpConnectionGuardImpl();
  const controller: any = new n.AcpController();
  const middleware: any = new n.AcpSecurityMiddleware();
  // The original server installs an async Subject observer. RxJS does not await
  // its return value, so own that callback's work without adding a consumer.
  const subject = transports.transportCreated;
  const subscribe = subject.subscribe;
  Object.defineProperty(subject, "subscribe", {
    configurable: true,
    value: function (observer: any, ...args: any[]) {
      if (typeof observer !== "function")
        return Reflect.apply(subscribe, this, [observer, ...args]);
      return Reflect.apply(subscribe, this, [
        function (this: any, ...values: any[]) {
          try {
            const result: any = Reflect.apply(observer, this, values);
            observe(result);
            if (result && typeof result.then === "function")
              void Promise.resolve(result).catch((error) => errors.push(error));
            return result;
          } catch (error) {
            errors.push(error);
          }
        },
        ...args,
      ]);
    },
  });
  restorers.push(() => {
    delete subject.subscribe;
  });
  // Observe only this host's calls, preserving the borrowed session receiver.
  const sessions = new Proxy(d.sessionManager, {
    get(target, key) {
      const value = Reflect.get(target, key, target);
      return key === "flushHistory" && typeof value === "function"
        ? (...args: any[]) => observe(Reflect.apply(value, target, args))
        : value;
    },
  });
  Object.assign(agents, { logger: d.logger });
  Object.assign(transportFactory, { streamManager: stream });
  Object.assign(transports, {
    factory: transportFactory,
    streamManager: stream,
  });
  Object.assign(server, {
    logger: d.logger,
    acpContext: acp,
    transportManager: transports,
    agentManager: agents,
    sessionManager: sessions,
  });
  Object.assign(guard, {
    logger: d.logger,
    settingsManager: d.settingsManager,
  });
  Object.assign(controller, {
    acpContext: acp,
    streamManager: stream,
    transportManager: transports,
    connectionGuard: guard,
    auditLog: d.auditLog,
  });
  Object.assign(stream, {
    interruptionService: d.interruptionService,
    broadcastService: d.broadcastService,
  });
  Object.assign(middleware, {
    logger: d.logger,
    connectionGuard: guard,
    auditLog: d.auditLog,
    requestMatcher: d.requestMatcher,
    pathResolver: d.pathResolver,
    corsService: d.corsService,
    auth: d.auth,
  });
  // Track original async method results, including detached remove/sweep work.
  // Do not rewrite original classes, Promise identities or rejection handling.
  for (const instance of [
    stream,
    transports,
    transportFactory,
    agents,
    server,
    guard,
    controller,
    middleware,
  ]) {
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(instance),
    )) {
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(instance),
        key,
      )!;
      if (key === "constructor" || typeof descriptor.value !== "function")
        continue;
      const fn = descriptor.value;
      const wrapper = function (this: any, ...args: any[]) {
        const result = Reflect.apply(fn, this, args);
        if (instance === stream && key === "writeSseEvent") {
          const response = args[0];
          writingResponses.set(
            response,
            (writingResponses.get(response) ?? 0) + 1,
          );
          const retire = () => {
            const count = writingResponses.get(response)! - 1;
            if (count) writingResponses.set(response, count);
            else writingResponses.delete(response);
          };
          void Promise.resolve(result).then(retire, retire);
        }
        if (instance === stream && key === "create") {
          const input = stream.connectionStates.get(
            args[0],
          )?.incomingController;
          if (input) inputs.set(result, input);
        }
        if (instance === transports && key === "create")
          observe(result, creating);
        return observe(result);
      };
      Object.defineProperties(wrapper, {
        name: { value: fn.name },
        length: { value: fn.length },
      });
      Object.defineProperty(instance, key, {
        configurable: true,
        writable: true,
        value: wrapper,
      });
      restorers.push(() => {
        delete instance[key];
      });
    }
  }
  const attempt = async (action: () => any) => {
    try {
      await action();
    } catch (error) {
      errors.push(error);
    }
  };
  return {
    n,
    stream,
    transports,
    transportFactory,
    agents,
    server,
    acp,
    guard,
    controller,
    middleware,
    /** Register these exact objects in the parent's DI before starting. */
    bindings: new Map<any, any>([
      [protocol.AcpStreamManager, stream],
      [protocol.AcpAgentManager, agents],
      [protocol.AcpConnectionGuard, guard],
    ]),
    start(configuration?: any) {
      if (closing) throw Error("Native ACP connections host is closing");
      return server.start(configuration);
    },
    drain: () => drain(),
    close(): Promise<void> {
      return (closing ??= Promise.resolve().then(async () => {
        await attempt(() => options.beforeClose?.());
        // Let accepted creations publish their streams first. Do not wait for
        // response writes here: SSE backpressure needs the owned response EOF.
        await drain(creating);
        // A prior original close/replacement can discard state while its
        // response is still waiting for drain. Retain pending writes separately.
        const responses = new Set<any>(writingResponses.keys());
        for (const state of stream.connectionStates.values()) {
          if (state.standaloneSse) responses.add(state.standaloneSse);
          for (const response of state.streamMapping.values())
            responses.add(response);
        }
        for (const input of inputs.values()) {
          // Original close removes state but does not close the SDK input reader.
          // This is owned transport EOF, not an invented protocol result.
          await attempt(() => {
            try {
              input.close();
            } catch (error) {
              // A peer may already have ended/cancelled this owned reader.
              if ((error as any)?.code !== "ERR_INVALID_STATE") throw error;
            }
          });
        }
        for (const id of [...transports.transports.keys()])
          await attempt(() => transports.close(id));
        for (const id of [...stream.streams.keys()])
          await attempt(() => stream.close(id));
        // Node response.end() can itself wait behind backpressure. Disconnect
        // unfinished owned responses so original close/error listeners settle.
        for (const response of responses)
          if (!response.writableFinished)
            await attempt(() => response.destroy());
        await Promise.allSettled(
          [...endpoints].map((endpoint) => endpoint.closed),
        );
        inputs.clear();
        // SDK closed reactions enqueue original history flush and Agent removal.
        await drain();
        await attempt(() => server.stop());
        await attempt(() => transports.transportCreated.complete());
        for (const id of [...guard.tokens.keys()])
          await attempt(() => guard.revokeToken(id));
        for (const token of intervals)
          await attempt(() => clearIntervalFn(token));
        for (const token of timeouts)
          await attempt(() => clearTimeoutFn(token));
        intervals.clear();
        timeouts.clear();
        for (const restore of restorers.reverse()) await attempt(restore);
        if (errors.length)
          throw new AggregateError(
            errors,
            "Native ACP connections cleanup failed",
          );
      }));
    },
  };
}
