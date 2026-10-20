import { createNativePluginRuntime } from "../../src/plugins/native-plugin-runtime.js";
import { createNativePluginManager } from "../../src/plugins/native-plugin-manager.js";
export function pluginRuntimeFixture(options: any = {}, factories: any = {}) {
  const events: any[] = [],
    installed: any[] = options.installed ?? [
      {
        name: "owned",
        marketplaceName: "fixture",
        status: "enabled",
        installedPath: "/owned/plugin",
      },
    ];
  const components: any = options.components ?? {
    commands: [{ name: "owned:command", prompt: "owned" }],
    mcpServers: { owned: { type: "http", url: "http://127.0.0.1:1/mcp" } },
  };
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error", "setContext"].map((k) => [
      k,
      (...args: any[]) =>
        events.push([
          k,
          ...args.map((v) => (v instanceof Error ? v.message : v)),
        ]),
    ]),
  );
  const managerClasses = (factories.manager ?? createNativePluginManager)({
      process: { env: {} },
      dependencies: {},
    }),
    manager = new managerClasses.PluginManagerImpl();
  Object.assign(manager, {
    logger,
    errorCollector: { addError: (e: any) => events.push(["error-collect", e]) },
    getInstalledPlugins: async () => installed,
    getPlugin: async (name: string, market: string) =>
      installed.find((p) => p.name === name && p.marketplaceName === market),
    pluginLoaderManager: {
      async loadPluginComponents(plugin: any) {
        events.push(["load", plugin.name]);
        if (options.loadError) throw Error("owned load failure");
        return components;
      },
    },
    mcpPluginRegistry: {
      replace: (entries: any) => events.push(["registry", entries]),
    },
    async whenReady() {
      events.push(["ready"]);
    },
    async installMarketplacesFromSettings() {
      events.push(["marketplaces"]);
    },
    async reconcileBuiltinSeedInstalledPlugins() {
      events.push(["seed"]);
    },
    async repairEnabledPlugins(opts: any) {
      events.push(["repair-enabled", opts]);
    },
    async repairMissingPluginDependencies() {
      events.push(["repair-missing"]);
      return { installed: options.repaired ?? [] };
    },
  });
  const classes = (factories.runtime ?? createNativePluginRuntime)({
      getWorkDir: () => "/owned",
    }),
    refresh = Object.assign(new classes.PluginRuntimeRefreshService(), {
      logger,
      pluginManager: manager,
      cliSettingsProvider: {
        async waitUntilSettled() {
          events.push(["cli-settled"]);
        },
      },
      cliSettingSourcesProvider: {
        async waitUntilSettled() {
          events.push(["sources-settled"]);
        },
      },
      settingsManager: {
        clearCache() {
          events.push(["settings-clear"]);
        },
      },
      skillProductProvider: {
        clearCache() {
          events.push(["skill-clear"]);
        },
      },
      mcpManager: {
        getProjectedPluginServerNames: () => options.projected ?? [],
        async previewEffectivePluginServerNames(config: any) {
          return options.effective ?? Object.keys(config);
        },
        async reloadPluginServers() {
          events.push(["mcp-reload"]);
          if (options.mcpError) throw Error("owned MCP failure");
        },
      },
      lspManager: {
        async reloadPluginServers() {
          events.push(["lsp-reload"]);
          if (options.lspWait) await options.lspWait;
          if (options.lspError) throw Error("owned LSP failure");
        },
      },
      toolManager: {
        invalidatePluginDependentToolCaches() {
          events.push(["tool-invalidate"]);
        },
      },
      productManager: {
        async sync(force: any) {
          events.push(["product-sync", force]);
        },
        async syncVolatileProviders(force: any) {
          events.push(["product-volatile", force]);
        },
      },
      commandManager: {
        async refresh() {
          events.push(["command-refresh"]);
        },
      },
      outputStyleManager: {
        async reload() {
          events.push(["style-reload"]);
        },
      },
      agentManager: {
        async refreshAgents() {
          events.push(["agents-refresh"]);
        },
      },
    });
  return {
    manager,
    managerClasses,
    classes,
    refresh,
    events,
    installed,
    components,
  };
}
