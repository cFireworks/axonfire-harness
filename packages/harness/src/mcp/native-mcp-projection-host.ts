import { BehaviorSubject } from "rxjs";
import { createNativeMcpManagerRuntime } from "./native-mcp-manager-runtime.js";
import { McpScope } from "./native-mcp-manager-constants.js";
import type { createNativeMcpHost } from "./native-mcp-host.js";
import {
  createNativeSettingsHost,
  type NativeSettingsHostOptions,
} from "../config/native-settings-host.js";

export type NativeMcpProjectionOptions = {
  serverHost: ReturnType<typeof createNativeMcpHost>;
  getWorkDir(): string;
  getHomeDir(): string;
  toolSearchService: any;
  deferToolConfigService: any;
  /** Explicit opt-in only: user/project/project-local. No installed configuration discovery. */
  filesystemScopes?: string[];
  scopes?: Record<string, Record<string, any>>;
  plugins?: { getActivePlugins(): Promise<any[]> };
  settings?: {
    list(scope: string): Promise<any>;
    set(key: string, value: any, scope: string): Promise<any>;
  };
  settingsConfiguration?: NativeSettingsHostOptions;
  cwdService?: { onDidChangeCwd: any };
  runtime?: Record<string, any>;
  dependencies?: Record<string, any>;
  logger?: any;
};

/** Owned composition around the complete native projection/configuration services. */
export async function createNativeMcpProjectionHost(
  options: NativeMcpProjectionOptions,
) {
  const { serverHost } = options;
  let closed = false,
    closing: Promise<void> | undefined;
  const subscriptions = new Set<any>(),
    immediates = new Map<any, () => void>(),
    pending = new Set<Promise<any>>();
  const logger: Record<string, any> = Object.fromEntries(
    ["info", "warn", "error", "debug", "log"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  const settingsHost = options.settings
    ? undefined
    : createNativeSettingsHost({
        stateDir: options.getHomeDir(),
        getWorkDir: options.getWorkDir,
        logger,
        ...(options.cwdService ? { cwdService: options.cwdService } : {}),
        ...(options.settingsConfiguration
          ? { configuration: options.settingsConfiguration }
          : {}),
      });
  const settings = options.settings ?? settingsHost!.manager;
  function ownSubject(subject: any) {
    return new Proxy(subject, {
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
    });
  }
  function observe(promise: Promise<any>) {
    pending.add(promise);
    void promise.then(
      () => pending.delete(promise),
      () => pending.delete(promise),
    );
    return promise;
  }
  const dependencies: Record<string, any> = { logger },
    scheduleImmediate = options.runtime?.setImmediate ?? setImmediate,
    cancelImmediate = options.runtime?.clearImmediate ?? clearImmediate;
  const runtime = {
    ...serverHost.runtime,
    getWorkDir: options.getWorkDir,
    getHomeDir: options.getHomeDir,
    getPlatformHomeDir: options.getHomeDir,
    computeMcpConfigFingerprint: serverHost.classes.computeMcpConfigFingerprint,
    mcpUtils: serverHost.utils,
    argv: [],
    isTTY: true,
    ...options.runtime,
    dependencies,
    setImmediate(callback: () => void) {
      let finish!: () => void;
      observe(
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
      );
      const handle = scheduleImmediate(() => {
        immediates.delete(handle);
        try {
          if (!closed) callback();
        } finally {
          finish();
        }
      });
      immediates.set(handle, finish);
      return handle;
    },
  };
  const classes = createNativeMcpManagerRuntime(runtime),
    configStore = new classes.McpConfigStore(),
    diagnostics = new classes.McpConfigDiagnosticsManager(),
    envExpand = new classes.McpConfigEnvExpandService(),
    config = new classes.McpConfigManager(),
    models = new classes.McpServerModelManager(),
    permissions = new classes.McpPermissionsManager(),
    toggle = new classes.McpToggleManager(),
    connections = new classes.McpConnectionManager(),
    ready = new classes.McpReadyService(),
    cliInitializer = new classes.McpCliConfigInitializer(),
    manager = new classes.McpManager(),
    pluginRegistry = new classes.McpPluginRegistry(),
    log = {
      log: (name: string, message: string) =>
        logger.debug(`[MCP][${name}] ${message}`),
    };
  for (const subject of [config, diagnostics, models])
    subject.changedSubject = ownSubject(subject.changedSubject);
  toggle.toggleSubject = ownSubject(toggle.toggleSubject);
  const serverManager = new Proxy(serverHost.manager, {
    get(target, key) {
      if (key === "toolsListChangedSubject")
        return ownSubject(target.toolsListChangedSubject);
      const value = Reflect.get(target, key);
      if (typeof value !== "function") return value;
      return (...args: any[]) => {
        if (closed && key === "create")
          return Promise.reject(Error("MCP projection is closed"));
        const result = value.apply(target, args);
        return result && typeof result.then === "function"
          ? observe(result)
          : result;
      };
    },
  });
  Object.assign(config, {
    configStore,
    logger,
    mcpLogService: log,
    envExpandService: envExpand,
    diagnosticsManager: diagnostics,
    cliSettingSourcesProvider: {
      getSettingScopes: async () => options.filesystemScopes ?? [],
    },
    pluginManager: options.plugins ?? {
      async getActivePlugins() {
        return [];
      },
    },
  });
  Object.assign(models, { logger });
  Object.assign(permissions, {
    settingsManager: settings,
    mcpConfigManager: config,
  });
  Object.assign(toggle, {
    mcpConfigStore: configStore,
    mcpServerModelManager: models,
  });
  Object.assign(connections, {
    mcpServerManager: serverManager,
    mcpLogService: log,
    logger,
  });
  Object.assign(manager, {
    configManager: config,
    serverManager,
    serverModelManager: models,
    permissionsManager: permissions,
    toggleManager: toggle,
    connectionManager: connections,
    mcpReadyService: ready,
    configStore,
    toolSearchService: options.toolSearchService,
    deferToolConfigService: options.deferToolConfigService,
    consoleManager: logger,
    debugService: logger,
    logger,
    oauthManager: serverHost.manager.mcpOAuthManager,
    startupProfiler: { markStart() {}, markEnd() {} },
    ...options.dependencies,
  });
  Object.assign(ready, {
    logger,
    cliRuntimeOptions: {
      onDidChange: ownSubject(new BehaviorSubject(undefined)),
    },
    cwdService: {
      onDidChangeCwd: ownSubject(
        options.cwdService?.onDidChangeCwd ??
          new BehaviorSubject(options.getWorkDir()),
      ),
    },
  });
  Object.assign(cliInitializer, { mcpManager: manager });
  Object.assign(dependencies, { configManager: config, cliInitializer });
  // Transport creation must read the same effective configuration as projection.
  serverHost.transport.mcpConfigManager = config;
  for (const name of Object.getOwnPropertyNames(
    Object.getPrototypeOf(permissions),
  )) {
    if (name === "constructor") continue;
    const native = permissions[name].bind(permissions);
    permissions[name] = (...args: any[]) =>
      closed
        ? Promise.reject(Error("MCP projection is closed"))
        : observe(native(...args));
  }
  try {
    await settingsHost?.start();
    await config.set(
      McpScope.DYNAMIC,
      options.scopes?.[McpScope.DYNAMIC] ?? {},
    );
    for (const [scope, value] of Object.entries(options.scopes ?? {}))
      if (scope !== McpScope.DYNAMIC) await config.set(scope, value);
    manager.initialize();
    ready.watchArgvAndCwdForMcpInit();
  } catch (error) {
    await closeProjection();
    throw error;
  }
  const nativeConnect = manager.connectProjectedSlot.bind(manager);
  manager.connectProjectedSlot = (slot: any) =>
    closed ? Promise.resolve() : observe(nativeConnect(slot));
  for (const key of ["connect", "disconnect", "reconnect"]) {
    const native = connections[key].bind(connections);
    connections[key] = (...args: any[]) => observe(native(...args));
  }
  return {
    manager,
    config,
    configStore,
    diagnostics,
    envExpand,
    models,
    permissions,
    settings,
    settingsHost,
    toggle,
    connections,
    ready,
    cliInitializer,
    pluginRegistry,
    classes,
    async connect(
      name: string,
      value: any,
      scope = value.type === "sdk" ? McpScope.SDK : McpScope.DYNAMIC,
    ) {
      if (closed) throw Error("MCP projection is closed");
      await manager.add(name, value, scope);
      await manager.waitForPendingServers({ names: [name], timeoutMs: 30000 });
      await manager.rebuildChain;
      const slot = manager.runtimeSlots.get(name);
      if (!slot || !slot.model.isActive())
        throw Error(slot?.model.error ?? `MCP server ${name} did not connect`);
      return serverHost.manager.get(name);
    },
    async delete(name: string) {
      if (closed) throw Error("MCP projection is closed");
      await manager.remove(name);
      await drain();
      return true;
    },
    async drain() {
      await drain();
    },
    close: closeProjection,
    get closed() {
      return closed;
    },
    get ownedSubscriptionCount() {
      return subscriptions.size;
    },
  };
  function closeProjection() {
    if (closing) return closing;
    closed = true;
    for (const [handle, finish] of immediates) {
      cancelImmediate(handle);
      finish();
    }
    immediates.clear();
    for (const sub of subscriptions) sub.unsubscribe();
    subscriptions.clear();
    closing = (async () => {
      try {
        await drain();
        for (const slot of manager.runtimeSlots.values())
          options.toolSearchService.removeToolsByServer(slot.model.name);
        manager.runtimeSlots.clear();
        manager.connectedServersCache.splice(0);
        manager.allServersCache = [];
      } finally {
        await settingsHost?.close();
      }
    })();
    return closing;
  }
  async function drain() {
    for (;;) {
      const reconcile = manager.reconcileTail,
        rebuild = manager.rebuildChain;
      await Promise.allSettled([reconcile, rebuild, ...pending]);
      if (
        !pending.size &&
        reconcile === manager.reconcileTail &&
        rebuild === manager.rebuildChain
      )
        return;
    }
  }
}
