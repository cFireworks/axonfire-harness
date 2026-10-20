import { createNativeMcpRuntime } from "./native-mcp-runtime.js";
import { createNativeMcpUtils } from "./native-mcp-utils.js";
import { createNativeMcpResultProcessor } from "./native-mcp-results.js";
import { createNativeMcpUi } from "./native-mcp-ui.js";
export type NativeMcpHostOptions = {
  getWorkDir(): string;
  getHomeProjectDir(): string;
  dependencies: Record<string, any>;
  permissionUtils: any;
  logger?: any;
  env?: NodeJS.ProcessEnv;
  endpointProvider?: any;
  oauthManager?: any;
  hostCapabilityProvider?: any;
  runtime?: Record<string, any>;
  registry?: { register(server: any): void; unregister(name: string): void };
};
/** Explicit owned composition. Never discovers installed servers, auth or configuration. */
export function createNativeMcpHost(options: NativeMcpHostOptions) {
  let closed = false;
  let closing: Promise<void> | undefined;
  const configurations = new Map<string, { config: any; scope: string }>(),
    descriptors = new Map<string, Map<string, any>>(),
    timers = new Set<any>(),
    subscriptions = new Set<any>(),
    pendingCloses = new Set<Promise<void>>();
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error", "trace", "log"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  const schedule = options.runtime?.setTimeout ?? setTimeout,
    cancel = options.runtime?.clearTimeout ?? clearTimeout;
  const dependencies: Record<string, any> = {
    logger,
    console: logger,
    ...options.dependencies,
  };
  if (dependencies.sessions) {
    const sessions = dependencies.sessions,
      subject = sessions.sessionSubject;
    const ownedSubject = subject
      ? new Proxy(subject, {
          get(target, key) {
            if (key === "subscribe")
              return (...args: any[]) => {
                const sub = target.subscribe(...args);
                subscriptions.add(sub);
                return sub;
              };
            const value = Reflect.get(target, key);
            return typeof value === "function" ? value.bind(target) : value;
          },
        })
      : undefined;
    dependencies.sessions = new Proxy(sessions, {
      get(target, key) {
        if (key === "sessionSubject") return ownedSubject;
        const value = Reflect.get(target, key);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  }
  const runtime: any = {
    getWorkDir: options.getWorkDir,
    getHomeProjectDir: options.getHomeProjectDir,
    permissionUtils: options.permissionUtils,
    dependencies,
    logger,
    env: options.env ?? process.env,
    ...options.runtime,
    setTimeout(callback: any, ms: number) {
      const timer = schedule(() => {
        timers.delete(timer);
        callback();
      }, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer: any) {
      timers.delete(timer);
      cancel(timer);
    },
  };
  const utils = createNativeMcpUtils(runtime),
    results = createNativeMcpResultProcessor(runtime),
    ui = createNativeMcpUi({
      mcpUtils: utils,
      broadcast: dependencies.broadcast,
    });
  Object.assign(runtime, {
    mcpUtils: utils,
    processMcpResult: results.processMcpResult,
    broadcastMcpUiForToolCall: ui.broadcastMcpUiForToolCall,
  });
  const classes = createNativeMcpRuntime(runtime),
    transport = Object.assign(new classes.McpTransportManager(), {
      mcpConfigManager: {
        async getByName(name: string) {
          const entry = configurations.get(name);
          return entry ? [entry] : [];
        },
      },
    });
  dependencies.transportManager = transport;
  const manager = Object.assign(new classes.McpServerManager(), {
    logger,
    consoleManager: logger,
    transportManager: transport,
    endpointProvider: options.endpointProvider ?? {
      async get() {
        throw Error(
          "MCP stdio requires an explicit hook service endpoint provider",
        );
      },
    },
    hostCapabilityProvider: options.hostCapabilityProvider ?? {
      toEnvValue: () => undefined,
    },
    mcpOAuthManager: options.oauthManager ?? {
      async getProvider() {
        return undefined;
      },
    },
  });
  const nativeProxy = manager.createServerProxy.bind(manager);
  // Preserve native fire-and-forget disposal, but own its completion at host shutdown.
  const nativeClose = manager.closeServerSafely.bind(manager);
  manager.closeServerSafely = (server: any) => {
    const pending = nativeClose(server);
    pendingCloses.add(pending);
    void pending.then(
      () => pendingCloses.delete(pending),
      () => pendingCloses.delete(pending),
    );
    return pending;
  };
  manager.createServerProxy = (name: string, config: any) => {
    const proxy = nativeProxy(name, config);
    return new Proxy(proxy, {
      get(target, key, receiver) {
        if (key === "listTools")
          return async (...args: any[]) => {
            const tools = await target.listTools(...args);
            descriptors.set(
              name,
              new Map(tools.map((tool: any) => [tool.name, tool])),
            );
            return tools;
          };
        return Reflect.get(target, key, receiver);
      },
    });
  };
  async function connect(name: string, config: any, scope = "dynamic") {
    if (closed) throw Error("MCP host is closed");
    const previous = manager.underlyingCache.get(name);
    if (
      previous &&
      manager.serverConfigFingerprint.get(name) !==
        classes.computeMcpConfigFingerprint(config)
    )
      options.registry?.unregister(name);
    configurations.set(name, { config, scope });
    const proxy = await manager.create(name, config);
    const current = manager.underlyingCache.get(name);
    if (current !== previous || !current?.connected) await proxy.connect();
    proxy.connected = true;
    proxy.nativeConfig = config;
    options.registry?.register(proxy);
    return proxy;
  }
  return {
    runtime,
    classes,
    manager,
    transport,
    utils,
    results,
    ui,
    configurations,
    connect,
    registerExternal(server: any, config: any = { type: "sdk" }) {
      if (closed) throw Error("MCP host is closed");
      configurations.set(server.name, { config, scope: "dynamic" });
      manager.underlyingCache.set(server.name, server);
      manager.configByName.set(server.name, config);
      const proxy = manager.createServerProxy(server.name, config);
      manager.serverCache.set(server.name, proxy);
      proxy.nativeConfig = config;
      options.registry?.register(proxy);
      return proxy;
    },
    resolveNeedsApproval(name: string) {
      for (const tools of descriptors.values()) {
        const tool = tools.get(name);
        if (tool) return tool.needsApproval;
      }
    },
    async delete(name: string) {
      descriptors.delete(name);
      options.registry?.unregister(name);
      const result = await manager.delete(name);
      configurations.delete(name);
      return result;
    },
    close() {
      if (closing) return closing;
      closed = true;
      closing = (async () => {
        await Promise.all(
          [...manager.creating.values()].map((p: any) => p.catch(() => {})),
        );
        for (const name of configurations.keys())
          options.registry?.unregister(name);
        await manager.clear();
        await Promise.all([...pendingCloses]);
        for (const timer of timers) cancel(timer);
        timers.clear();
        for (const sub of subscriptions) sub.unsubscribe();
        subscriptions.clear();
        descriptors.clear();
        configurations.clear();
      })();
      return closing;
    },
    get closed() {
      return closed;
    },
    get ownedTimerCount() {
      return timers.size;
    },
  };
}
