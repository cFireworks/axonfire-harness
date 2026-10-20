import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
import { createNativePluginManager } from "./native-plugin-manager.js";
import { createNativePluginLoaders } from "./native-plugin-loaders.js";
import { createNativePluginRuntime } from "./native-plugin-runtime.js";
import { createNativePluginFrontmatter } from "./native-plugin-frontmatter.js";
import { createNativePluginConcurrency } from "./native-plugin-concurrency.js";
import { createNativeProductSourceUtilities } from "../config/native-product-source-utils.js";
import { createHookShellHelpers } from "../hooks/hook-shell-helpers.js";
import { createNativeMcpUtils } from "../mcp/native-mcp-utils.js";
import { CapturedJsonUtils } from "../vendor/captured-jsonc.js";
import { createOwnedPluginFilesystem } from "./owned-plugin-filesystem.js";
import { createMemoryRuleUtilities } from "../memory/memory-rule-utilities.js";

export type NativePluginHostOptions = {
  directories?: readonly string[];
  env?: NodeJS.ProcessEnv;
  settings?: any;
  pluginManager?: any;
  /** Full product installers/marketplace/policy/locking services remain explicit. */
  dependencies?: Record<string, any>;
  managerRuntime?: Record<string, any>;
  loaderRuntime?: Record<string, any>;
};
export function createNativePluginHost(options: {
  stateDir: string;
  getWorkDir(): string;
  productManager: any;
  promptRenderer: any;
  settings: any;
  logger?: any;
  plugins?: NativePluginHostOptions | undefined;
}) {
  let closed = false,
    started = false;
  const pending = new Set<Promise<any>>(),
    subscriptions = new Set<any>(),
    processEvents = new EventEmitter();
  const timers = new Set<any>(),
    immediates = new Map<any, () => void>();
  const settingEvents = new NativeEmitter(),
    policyEvents = new NativeEmitter();
  function ownSubscription(sub: any) {
    if (closed) {
      sub?.dispose?.();
      sub?.unsubscribe?.();
    } else if (sub) subscriptions.add(sub);
    return sub;
  }
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error", "setContext"].map((k) => [
      k,
      (...args: any[]) => options.logger?.[k]?.(...args),
    ]),
  );
  const unavailable = (name: string): never => {
    throw Error("Plugin host dependency not configured: " + name);
  };
  const env = {
    ...options.plugins?.env,
    ...(options.plugins?.directories
      ? {
          CODEBUDDY_PLUGIN_DIRS: options.plugins.directories
            .map((dir) => path.resolve(options.getWorkDir(), dir))
            .join(path.delimiter),
        }
      : {}),
  };
  const ownedSettings = options.plugins?.settings ?? {
    get: (key: string, scope?: any) => options.settings.get(key, scope),
    // The embedding settings view has no native disk cache. Forward only if supplied.
    clearCache: () => options.settings.clearCache?.(),
  };
  const sourceSettings = {
    waitUntilSettled: async () => {},
    isScopeAllowed: async () => true,
    onDidChange(fn: any) {
      return ownSubscription(settingEvents.event(fn));
    },
  };
  const productManager = new Proxy(options.productManager, {
    get(target, key) {
      if (key === "onDidChange")
        return (fn: any) => ownSubscription(target.onDidChange(fn));
      const v = Reflect.get(target, key);
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
  const runtime: any = {
    fs,
    env,
    getWorkDir: options.getWorkDir,
    getHomeDir: () => options.stateDir,
    dependencies: { productManager },
    shellHelpers: createHookShellHelpers({ shell: {}, env } as any),
    frontmatter: createNativePluginFrontmatter(),
    utilities: {
      ...createNativePluginConcurrency(env),
      McpUtils: createNativeMcpUtils({ env, fs }),
    },
  };
  const requireModule: any = (id: number) => {
    if (id === 91943) return fs.promises;
    if (id === 16928) return path;
    if (id === 2845 && options.plugins?.dependencies?.pluginOptionsStorage)
      return { PluginOptionsStorage: "pluginOptionsStorage" };
    return unavailable("dynamic module " + id);
  };
  requireModule.t = (id: number) => requireModule(id);
  runtime.require = requireModule;
  const loaderClasses = createNativePluginLoaders({
    ...runtime,
    ...options.plugins?.loaderRuntime,
  });
  const errors: any[] = [],
    errorCollector = {
      addError(e: any) {
        errors.push(e);
      },
      getErrorCount() {
        return errors.length;
      },
    };
  const loader = Object.assign(new loaderClasses.PluginLoaderManager(), {
    logger,
    errorCollector,
    pluginOptionsStorage: options.plugins?.dependencies?.pluginOptionsStorage,
    ...Object.fromEntries(
      [
        ["agentLoader", "AgentExtensionLoader"],
        ["commandLoader", "CommandExtensionLoader"],
        ["skillLoader", "SkillExtensionLoader"],
        ["hookLoader", "HookExtensionLoader"],
        ["mcpLoader", "MCPExtensionLoader"],
        ["lspLoader", "LSPExtensionLoader"],
        ["outputStyleLoader", "OutputStyleExtensionLoader"],
      ].map(([key, name]) => [
        key!,
        Object.assign(new (loaderClasses as any)[name!](), {
          logger,
          errorCollector,
        }),
      ]),
    ),
  });
  loader.init();
  for (const key of [
    "agentLoader",
    "commandLoader",
    "skillLoader",
    "hookLoader",
    "mcpLoader",
    "lspLoader",
    "outputStyleLoader",
  ])
    loader[key].init();
  const utilities = createNativeProductSourceUtilities(runtime);
  const paths = createMemoryRuleUtilities({
    getWorkDir: options.getWorkDir,
    getHomeDir: () => options.stateDir,
    getUserHomeDir: () => options.stateDir,
    platform: process.platform,
    fs,
  }).PathUtils;
  Object.assign(utilities.PathUtils, {
    resolveFilePathToWorkDir: paths.resolveFilePathToWorkDir.bind(paths),
  });
  const managerClasses = createNativePluginManager({
    ...runtime,
    process: {
      env,
      pid: process.pid,
      platform: process.platform,
      cwd: options.getWorkDir,
      uptime: process.uptime,
      once: processEvents.once.bind(processEvents),
      kill: (pid: number, signal: any) => {
        if (!Number.isInteger(pid) || pid <= 0 || signal !== 0)
          return unavailable("process mutation");
        return process.kill(pid, 0);
      },
    },
    fsExtra: createOwnedPluginFilesystem(options.stateDir),
    setTimeout(fn: () => void, ms: number) {
      if (closed) return undefined;
      const h = setTimeout(() => {
        timers.delete(h);
        if (!closed) fn();
      }, ms);
      timers.add(h);
      return h;
    },
    setImmediate(fn: () => void) {
      if (closed) {
        queueMicrotask(fn);
        return undefined;
      }
      const h = setImmediate(() => {
        const callback = immediates.get(h);
        immediates.delete(h);
        callback?.();
      });
      immediates.set(h, fn);
      return h;
    },
    bindings: {
      AP: { createHash },
      AG: { isWorkBuddyDesktop: () => false },
      A5: utilities,
      t5: { ...utilities, JsonUtils: CapturedJsonUtils },
      t8: { default: () => unavailable("git/process execution") },
      AH: {
        SETTINGS_FILENAME: "settings.json",
        SETTINGS_LOCAL_FILENAME: "settings.local.json",
      },
      An: { tmpdir: () => path.join(options.stateDir, "tmp") },
      Aj: { McpOAuthManager: "mcpOAuth" },
      MarketplaceFactory: {
        createFromJSON: () => unavailable("MarketplaceFactory"),
      },
    },
    ...options.plugins?.managerRuntime,
  });
  const pluginManager: any =
    options.plugins?.pluginManager ??
    Object.assign(new managerClasses.PluginManagerImpl(), {
      logger,
      errorCollector,
      pluginLoaderManager: loader,
      settingsManager: ownedSettings,
      consoleManager: { warn: (...args: any[]) => logger.warn?.(...args) },
      cliSettingSourcesProvider: sourceSettings,
      cliSettingsProvider: sourceSettings,
      startupProfiler: { markStart() {}, markEnd() {} },
      pluginPolicyService: {
        onDidChange(fn: any) {
          return ownSubscription(policyEvents.event(fn));
        },
        getMergedPlugins: () => [],
      },
      marketplaceStorage: {
        async getMarketplaces() {
          return [];
        },
      },
      builtInMarketplaceProvider: {
        async getBuiltInMarketplaces() {
          return [];
        },
      },
      marketplaceConfigManager: {
        async getMarketplacesToInstall() {
          const v = await ownedSettings.get("extraKnownMarketplaces");
          if (v && Object.keys(v).length)
            return unavailable("MarketplaceConfigManager");
          return [];
        },
      },
      container: {
        get: (key: string) =>
          options.plugins?.dependencies?.[key] ?? unavailable(key),
      },
      ...options.plugins?.dependencies,
    });
  if (!options.plugins?.pluginManager)
    for (const name of Object.getOwnPropertyNames(
      managerClasses.PluginManagerImpl.prototype,
    )) {
      if (name === "constructor") continue;
      const native = pluginManager[name].bind(pluginManager);
      pluginManager[name] = (...args: any[]) => {
        const value = native(...args);
        return value?.then ? observe(value) : value;
      };
    }
  const classes = createNativePluginRuntime(runtime);
  const outputStyles = Object.assign(new classes.OutputStyleManagerImpl(), {
    logger,
    productManager,
    promptRenderer: options.promptRenderer,
    pluginManager,
  });
  const refresh = Object.assign(new classes.PluginRuntimeRefreshService(), {
    logger,
    pluginManager,
    productManager,
    settingsManager: ownedSettings,
    cliSettingsProvider: sourceSettings,
    cliSettingSourcesProvider: sourceSettings,
  });
  const executor = Object.assign(new classes.ReloadPluginsCommandExecutor(), {
    logger,
    pluginManager,
    pluginRuntimeRefreshService: refresh,
  });
  executor.init();
  function observe<T>(p: Promise<T>): Promise<T> {
    pending.add(p);
    void p.then(
      () => pending.delete(p),
      () => pending.delete(p),
    );
    return p;
  }
  const nativeRefresh: any = refresh.refresh.bind(refresh);
  refresh.refresh = (...args: any[]) =>
    closed
      ? Promise.reject(Error("Plugin host is closed"))
      : observe(nativeRefresh(...args));
  return {
    pluginManager,
    loader,
    loaderClasses,
    managerClasses,
    refresh,
    executor,
    outputStyles,
    classes,
    errors,
    runtime,
    attach(dependencies: Record<string, any>) {
      Object.assign(refresh, dependencies);
      if (dependencies.mcpPluginRegistry)
        pluginManager.mcpPluginRegistry = dependencies.mcpPluginRegistry;
      if (dependencies.lspManager)
        refresh.lspManager = {
          reloadPluginServers: () =>
            observe(dependencies.lspManager.reloadPluginServers()),
        };
      Object.assign(executor, {
        sessionManager: dependencies.sessionManager,
        agentManager: dependencies.agentManager,
      });
    },
    async start() {
      if (closed) throw Error("Plugin host is closed");
      if (started) return;
      started = true;
      if (!options.plugins?.pluginManager) {
        pluginManager.init();
        await observe(pluginManager.whenReady());
      }
      await refresh.refresh("startup");
    },
    waitForRefreshSettled: () => refresh.waitForRefreshSettled(),
    async close() {
      closed = true;
      for (const s of subscriptions) {
        s.dispose?.();
        s.unsubscribe?.();
      }
      subscriptions.clear();
      for (const h of timers) clearTimeout(h);
      timers.clear();
      for (const [h, fn] of immediates) {
        clearImmediate(h);
        immediates.delete(h);
        fn();
      }
      while (pending.size) await Promise.allSettled([...pending]);
      await pluginManager.builtInMarketplaceRefreshPromise;
      await refresh.waitForRefreshSettled();
      if (!options.plugins?.pluginManager)
        pluginManager.onDidChangeEmitter.dispose();
      processEvents.emit("exit");
      processEvents.removeAllListeners();
      settingEvents.dispose();
      policyEvents.dispose();
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return timers.size + immediates.size + subscriptions.size;
    },
    get closed() {
      return closed;
    },
  };
}
