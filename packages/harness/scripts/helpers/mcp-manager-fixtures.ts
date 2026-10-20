import { Subject } from "rxjs";
import { createNativeMcpManagerRuntime } from "../../src/mcp/native-mcp-manager-runtime.js";
import {
  McpScope,
  McpServerStatus,
  MERGE_SCOPE_PRIORITY,
} from "../../src/mcp/native-mcp-manager-constants.js";

export function mcpManagerFixture(
  options: any = {},
  factory: any = createNativeMcpManagerRuntime,
) {
  const events: any[] = [],
    scheduled: Array<() => void> = [],
    timers = new Map<any, () => void>();
  let now = 1000;
  class Clock extends Date {
    constructor(value: any = now) {
      super(value);
    }
    static now() {
      return now;
    }
  }
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error", "log"].map((name) => [
      name,
      (...args: any[]) =>
        events.push([
          name,
          ...args.map((x) => (x instanceof Error ? x.message : x)),
        ]),
    ]),
  );
  const dependencies: any = { logger };
  const runtime: any = {
    dependencies,
    env: options.env ?? {},
    argv: options.argv ?? [],
    isTTY: options.isTTY ?? true,
    getHomeDir: () => "/owned/home",
    getWorkDir: () => "/owned/project",
    Date: Clock,
    randomBytes: (size: number) => Buffer.alloc(size, 3),
    setImmediate: (fn: () => void) => {
      scheduled.push(fn);
      return fn;
    },
    setTimeout: (fn: () => void) => {
      const handle = {
        unref() {
          return this;
        },
      };
      timers.set(handle, fn);
      return handle;
    },
    clearTimeout: (handle: any) => timers.delete(handle),
    fs: {
      existsSync: () => false,
      readFileSync: () => {
        throw Object.assign(Error("owned missing"), { code: "ENOENT" });
      },
    },
  };
  const classes = factory(runtime),
    config = new classes.McpConfigManager(),
    models = new classes.McpServerModelManager(),
    permissions = new classes.McpPermissionsManager(),
    toggle = new classes.McpToggleManager(),
    connection = new classes.McpConnectionManager(),
    manager = new classes.McpManager(),
    ready = new classes.McpReadyService(),
    diagnostics = new classes.McpConfigDiagnosticsManager(),
    expander = new classes.McpConfigEnvExpandService(),
    initializer = new classes.McpCliConfigInitializer();
  const data = new Map<string, any>(
    MERGE_SCOPE_PRIORITY.map((scope) => [
      scope,
      { mcpServers: {}, disabledMcpServers: [] } as any,
    ]),
  );
  const store = {
    read(scope: string) {
      return JSON.parse(JSON.stringify(data.get(scope) ?? {}));
    },
    update(scope: string, value: any) {
      events.push(["store", scope, value]);
      data.set(scope, JSON.parse(JSON.stringify(value)));
    },
    getLocation(scope: string) {
      return {
        filePath: "/owned/" + scope + ".json",
        projectPath: "/owned/project",
      };
    },
  };
  const settingsData = new Map<string, any>([
      ["project-local", options.settings ?? {}],
      ["cli", options.cliSettings ?? {}],
    ]),
    settings = {
      async list(scope: string) {
        return { ...settingsData.get(scope) };
      },
      async set(key: string, value: any, scope: string) {
        events.push(["setting", scope, key, value]);
        settingsData.set(scope, { ...settingsData.get(scope), [key]: value });
      },
    };
  const tools = new Map<string, any>(),
    servers = new Map<string, any>(),
    toolsChanged = new Subject<string>();
  let toolGate: (() => Promise<void>) | undefined,
    createGate: (() => Promise<void>) | undefined;
  const serverManager: any = {
    toolsListChangedSubject: toolsChanged,
    async create(name: string, value: any) {
      events.push(["create", name, value]);
      await createGate?.();
      let server = servers.get(name);
      if (!server || server.url !== value.url) {
        server = {
          name,
          url: value.url,
          async connect() {
            events.push(["connect", name]);
            if (options.connectError) throw Error(options.connectError);
          },
          async close() {
            events.push(["close", name]);
          },
          async listTools() {
            events.push(["listTools", name]);
            await toolGate?.();
            return (
              options.tools ?? [
                {
                  name: "echo",
                  description: "owned echo",
                  inputSchema: { type: "object" },
                  _meta: { shortDescription: "owned summary" },
                },
              ]
            );
          },
          async listPrompts() {
            return [{ name: "native", title: "Owned title" }];
          },
          async getPrompt(name: string, args: any) {
            events.push(["getPrompt", name, args]);
            return {
              messages: [
                { role: "user", content: { type: "text", text: name } },
              ],
            };
          },
        };
        servers.set(name, server);
      }
      return server;
    },
    async get(name: string) {
      return servers.get(name);
    },
    async delete(name: string) {
      events.push(["delete", name]);
      servers.delete(name);
    },
    async waitForIdle() {},
  };
  const search: any = {
      async indexTool(tool: any) {
        events.push(["index", tool]);
        tools.set(tool.name, tool);
      },
      removeToolsByServer(name: string) {
        events.push(["removeIndex", name]);
        for (const [key, t] of tools)
          if (t.serverName === name) tools.delete(key);
      },
    },
    defer = {
      async isToolDeferLoading(value: any, ...names: string[]) {
        return (
          names.some((name) => value.tools?.[name]?.defer_loading === true) ||
          value.defer_loading === true
        );
      },
    };
  Object.assign(config, {
    logger,
    configStore: store,
    mcpLogService: {
      log: (...args: any[]) => events.push(["mcpLog", ...args]),
    },
    envExpandService: expander,
    diagnosticsManager: diagnostics,
    cliSettingSourcesProvider: {
      getSettingScopes: async () => ["user", "project", "project-local"],
    },
    pluginManager: {
      getActivePlugins: async () => [
        {
          plugin: { name: "owned-plugin", marketplaceName: "owned-market" },
          components: { mcpServers: options.scopes?.plugin ?? {} },
        },
      ],
    },
  });
  for (const scope of MERGE_SCOPE_PRIORITY) {
    const value = options.scopes?.[scope] ?? {};
    if (
      [McpScope.USER, McpScope.PROJECT, McpScope.LOCAL].includes(scope as any)
    )
      data.set(scope, {
        mcpServers: value,
        disabledMcpServers: options.disabled ?? [],
      });
    else if (scope !== McpScope.PLUGIN) config.scopeDataCache.set(scope, value);
  }
  config.dynamicConfigInitialized.resolve();
  Object.assign(models, { logger });
  Object.assign(permissions, {
    mcpConfigManager: config,
    settingsManager: settings,
  });
  Object.assign(toggle, {
    mcpConfigStore: store,
    mcpServerModelManager: models,
  });
  Object.assign(connection, {
    logger,
    mcpServerManager: serverManager,
    mcpLogService: {
      log: (...args: any[]) => events.push(["mcpLog", ...args]),
    },
  });
  Object.assign(manager, {
    logger,
    debugService: logger,
    consoleManager: logger,
    configManager: config,
    configStore: store,
    serverManager,
    serverModelManager: models,
    permissionsManager: permissions,
    toggleManager: toggle,
    connectionManager: connection,
    mcpReadyService: ready,
    toolSearchService: search,
    deferToolConfigService: defer,
    startupProfiler: {
      markStart: (...args: any[]) => events.push(["markStart", ...args]),
      markEnd: (...args: any[]) => events.push(["markEnd", ...args]),
    },
    oauthManager: {
      async getAuthorizationUrl() {
        return "https://owned.invalid/oauth";
      },
      async getProvider() {
        return { tokens: () => (options.hasTokens ? {} : undefined) };
      },
      async invalidateCredentials(...args: any[]) {
        events.push(["invalidate", ...args]);
      },
    },
    eventService: {
      report: async (...args: any[]) => {
        events.push(["report", ...args]);
      },
    },
  });
  Object.assign(ready, { logger });
  Object.assign(initializer, { mcpManager: manager });
  Object.assign(dependencies, {
    configManager: config,
    cliInitializer: initializer,
  });
  manager.initialize();
  const pending = new Set<Promise<any>>();
  for (const [target, keys] of [
    [manager, ["connectProjectedSlot"]],
    [connection, ["connect", "disconnect", "reconnect"]],
  ] as any) {
    for (const key of keys) {
      const native = target[key].bind(target);
      target[key] = (...args: any[]) => {
        const promise = native(...args);
        pending.add(promise);
        void promise.then(
          () => pending.delete(promise),
          () => pending.delete(promise),
        );
        return promise;
      };
    }
  }
  return {
    classes,
    runtime,
    manager,
    config,
    store,
    settings,
    models,
    permissions,
    toggle,
    connection,
    ready,
    diagnostics,
    initializer,
    events,
    tools,
    servers,
    scheduled,
    timers,
    toolsChanged,
    setToolGate(gate?: () => Promise<void>) {
      toolGate = gate;
    },
    setCreateGate(gate?: () => Promise<void>) {
      createGate = gate;
    },
    startScheduled() {
      for (const fn of scheduled.splice(0)) fn();
    },
    async flush() {
      for (let i = 0; i < 20; i++) {
        for (const fn of scheduled.splice(0)) fn();
        await manager.reconcileTail;
        await Promise.all([
          ...pending,
          ...[...connection.inFlightConnects.values()].map(
            (v: any) => v.promise,
          ),
        ]);
        const rebuild = manager.rebuildChain;
        await rebuild;
        await Promise.resolve();
        if (
          !scheduled.length &&
          rebuild === manager.rebuildChain &&
          connection.inFlightConnects.size === 0 &&
          pending.size === 0
        )
          return;
      }
      throw Error("fixture did not settle");
    },
    advance(ms: number) {
      now += ms;
    },
    snapshot() {
      return JSON.parse(
        JSON.stringify({
          models: manager.allServersCache.map((m: any) => ({
            name: m.name,
            scope: m.scope,
            status: m.status,
            error: m.error,
          })),
          connected: manager.connectedServersCache.map((s: any) => s.name),
          tools: [...tools],
          slots: [...manager.runtimeSlots].map(([n, s]: any) => [
            n,
            s.generation,
            s.fingerprint,
          ]),
          settings: [...settingsData],
          diagnostics: diagnostics.getDiagnostics(),
          // VM async promises may interleave independent logger calls differently.
          // Compare exact values/counts here; causal ordering has gated runtime tests.
          events: [...events].sort((a, b) =>
            JSON.stringify(a).localeCompare(JSON.stringify(b)),
          ),
        }),
      );
    },
  };
}
