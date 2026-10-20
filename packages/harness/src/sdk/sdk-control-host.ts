import {
  createNativeSdkControl,
  NativeDeferred,
  isControlSignalMessage,
} from "./native-sdk-control.js";
export type SdkControlOutput = {
  write(line: string): boolean;
  once(event: string, callback: () => void): any;
  removeListener?(event: string, callback: () => void): any;
};
export type SdkControlHostOptions = {
  stdout: SdkControlOutput;
  logger?: any;
  now?: () => number;
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (timer: any) => void;
  hooks?: Record<string, any[]>;
  capabilities?: any;
  handlers?: any[];
  initializeDependencies?: Record<string, any>;
};
/** Owned transport composition, not a replacement for the captured JSONL protocol. */
export function createSdkControlHost(options: SdkControlHostOptions) {
  let closed = false;
  const timers = new Set<any>(),
    drainListeners = new Set<() => void>(),
    schedule = options.setTimeout ?? setTimeout,
    cancel = options.clearTimeout ?? clearTimeout;
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  class OwnedDeferred extends NativeDeferred {
    constructor() {
      super();
      this.promise.catch(() => {});
    }
  }
  const classes = createNativeSdkControl({
    Deferred: OwnedDeferred,
    now: options.now ?? Date.now,
    stdout: {
      write(line) {
        if (closed) throw Error("SDK control transport is closed");
        return options.stdout.write(line);
      },
      once(event, callback) {
        const owned = () => {
          drainListeners.delete(owned);
          if (!closed) callback();
        };
        drainListeners.add(owned);
        return options.stdout.once(event, owned);
      },
    },
    setTimeout(callback, ms) {
      const timer = schedule(() => {
        timers.delete(timer);
        callback();
      }, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer) {
      timers.delete(timer);
      cancel(timer);
    },
  });
  const writer = new classes.StdoutWriter(),
    permission = Object.assign(new classes.SdkPermissionClientImpl(), {
      stdoutWriter: writer,
    }),
    hooks = Object.assign(new classes.SdkHooksManagerImpl(), {
      stdoutWriter: writer,
      logger,
    }),
    mcp = Object.assign(new classes.SdkMcpMessageClientImpl(), {
      stdoutWriter: writer,
    }),
    elicitation = Object.assign(new classes.SdkElicitationClientImpl(), {
      stdoutWriter: writer,
    }),
    initializeState = new classes.SdkInitializeStateServiceImpl();
  const control = Object.assign(new classes.ControlSignalHandlerImpl(), {
    stdoutWriter: writer,
    logger,
    sdkPermissionClient: permission,
    sdkHooksManager: hooks,
    sdkMcpMessageClient: mcp,
    sdkElicitationClient: elicitation,
    subtypeHandlers: [...(options.handlers ?? [])],
  });
  for (const [client, method] of [
    [permission, "requestPermission"],
    [hooks, "invokeCallback"],
    [mcp, "sendMcpMessage"],
    [elicitation, "createElicitation"],
  ] as const) {
    const original = client[method].bind(client);
    client[method] = (...args: any[]) =>
      closed
        ? Promise.reject(Error("SDK control transport is closed"))
        : original(...args);
  }
  if (options.hooks) hooks.setHooks(options.hooks);
  if (options.capabilities) hooks.setCapabilities(options.capabilities);
  return {
    classes,
    writer,
    permission,
    hooks,
    mcp,
    elicitation,
    control,
    initializeState,
    addHandlers(...handlers: any[]) {
      control.subtypeHandlers.push(...handlers);
    },
    async receive(message: unknown) {
      if (closed) throw Error("SDK control transport is closed");
      if (!isControlSignalMessage(message)) return false;
      await control.handleMessage(message);
      return true;
    },
    async receiveLine(line: string) {
      return this.receive(JSON.parse(line));
    },
    close(reason = "SDK disconnected") {
      if (closed) return;
      closed = true;
      permission.cancelAllPending(reason);
      mcp.cancelAllPending(reason);
      elicitation.cancelAllPending(reason);
      hooks.clearHooks();
      for (const id of [...control.pendingRequests.keys()])
        control.cancelRequest(id);
      for (const timer of timers) cancel(timer);
      timers.clear();
      for (const listener of drainListeners)
        options.stdout.removeListener?.("drain", listener);
      drainListeners.clear();
      writer._queue.length = 0;
    },
    get closed() {
      return closed;
    },
    get ownedTimerCount() {
      return timers.size;
    },
  };
}
