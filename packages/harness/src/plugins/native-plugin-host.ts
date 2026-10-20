import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
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
import { FileLockService } from "../tasks/file-lock-service.js";
import { createNativeMarketplace } from "./native-marketplace.js";
import { createCapturedMarketplacePolicy } from "../vendor/captured-marketplace-policy.js";
import { createOwnedMarketplaceIO } from "./owned-marketplace-io.js";
import { createNativePluginInstallers } from "./native-plugin-installers.js";
import { createNativePluginStorage } from "./native-plugin-storage.js";
import { createOwnedPluginOptionSettings } from "./owned-plugin-option-settings.js";
import {
  createNativeSettingsHost,
  type NativeSettingsHostOptions,
} from "../config/native-settings-host.js";
import { createNativePluginPolicy } from "./native-plugin-policy.js";
import { createNativePluginControllerHost } from "./native-plugin-controller-host.js";
import {
  createNativeBuiltinSeedHost,
  type NativeBuiltinSeedOptions,
} from "./native-builtin-seed-host.js";

export type NativePluginHostOptions = {
  directories?: readonly string[];
  env?: NodeJS.ProcessEnv;
  settings?: any;
  pluginManager?: any;
  /** Explicit standalone profile; the installed product's remote markets are not enabled implicitly. */
  builtInMarketplaces?: Record<string, any>;
  builtinSeed?: NativeBuiltinSeedOptions;
  controllerRuntime?: Record<string, any>;
  marketplaceRuntime?: Record<string, any>;
  /** Custom installers, product policy and full persistent Settings remain injectable. */
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
  configuration?: NativeSettingsHostOptions;
  cwdService?: any;
}) {
  let closed = false,
    started = false;
  const pending = new Set<Promise<any>>(),
    subscriptions = new Set<any>(),
    processEvents = new EventEmitter();
  const timers = new Set<any>(),
    immediates = new Map<any, () => void>();
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
  const fsExtra = createOwnedPluginFilesystem(options.stateDir);
  const lockDirectory = path.join(options.stateDir, "tmp");
  const lockNative = new FileLockService(lockDirectory, { fs: fsExtra });
  const fileLockService = {
    async acquireFileLock(name: string, lockOptions?: any) {
      await fsExtra.ensureDir(lockDirectory);
      return lockNative.acquireFileLock(name, lockOptions);
    },
  };
  const settingsHost = createNativeSettingsHost({
    stateDir: options.stateDir,
    getWorkDir: options.getWorkDir,
    fileLockService,
    logger,
    ...(options.configuration ? { configuration: options.configuration } : {}),
  });
  const ownedSettings = options.plugins?.settings ?? settingsHost.manager;
  if (options.cwdService?.onDidChangeCwd)
    ownSubscription(
      options.cwdService.onDidChangeCwd.subscribe(() =>
        ownedSettings.clearCache?.(),
      ),
    );
  const storageClasses = createNativePluginStorage({
    fsExtra,
    getHomeDir: () => options.stateDir,
  });
  const errorCollector =
    options.plugins?.dependencies?.errorCollector ??
    new storageClasses.PluginErrorCollector();
  const optionSettings = createOwnedPluginOptionSettings(
    options.stateDir,
    fsExtra,
  );
  const pluginOptionsStorage =
    options.plugins?.dependencies?.pluginOptionsStorage ??
    Object.assign(new storageClasses.PluginOptionsStorageImpl(), {
      logger,
      settingsManager:
        options.plugins?.settings ??
        options.plugins?.dependencies?.pluginOptionSettings ??
        settingsHost.manager,
    });
  if (!options.plugins?.dependencies?.pluginOptionsStorage)
    pluginOptionsStorage.init();
  const sourceSettings = new Proxy(settingsHost.sources, {
    get(target, key) {
      if (key === "onDidChange")
        return (fn: any) => ownSubscription(target.onDidChange(fn));
      const value = Reflect.get(target, key);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const productManager = new Proxy(options.productManager, {
    get(target, key) {
      if (key === "onDidChange")
        return (fn: any) => ownSubscription(target.onDidChange(fn));
      const v = Reflect.get(target, key);
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
  const policyClasses = createNativePluginPolicy({
    dependencies: { productManager },
  });
  const pluginPolicyService =
    options.plugins?.dependencies?.pluginPolicyService ??
    Object.assign(new policyClasses.PluginPolicyServiceImpl(), { logger });
  if (!options.plugins?.dependencies?.pluginPolicyService) {
    const event = pluginPolicyService.onDidChange;
    pluginPolicyService.onDidChange = (fn: any) => ownSubscription(event(fn));
  }
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
    if (id === 13423) return createCapturedMarketplacePolicy();
    if (id === 91943) return fs.promises;
    if (id === 16928) return path;
    if (id === 2845) return { PluginOptionsStorage: "pluginOptionsStorage" };
    return unavailable("dynamic module " + id);
  };
  requireModule.t = (id: number) => requireModule(id);
  runtime.require = requireModule;
  const loaderClasses = createNativePluginLoaders({
    ...runtime,
    ...options.plugins?.loaderRuntime,
  });
  const loader = Object.assign(new loaderClasses.PluginLoaderManager(), {
    logger,
    errorCollector,
    pluginOptionsStorage,
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
  const marketplaceIO = createOwnedMarketplaceIO(options.stateDir, fsExtra);
  const installerExec =
    options.plugins?.marketplaceRuntime?.exec ?? marketplaceIO.exec;
  const installerClasses = createNativePluginInstallers({
    fsExtra,
    exec: installerExec,
    process: { env },
  });
  const extraInstallers = Object.values(installerClasses).map((Native: any) =>
    Object.assign(new Native(), { logger, errorCollector }),
  );
  for (const installer of extraInstallers) installer.init?.();
  const marketplaceClasses = createNativeMarketplace({
    ...marketplaceIO,
    fsExtra,
    process: { env, pid: process.pid },
    tmpdir: () => lockDirectory,
    env,
    getHomePluginsDir: () => path.join(options.stateDir, "plugins"),
    services: {
      logger,
      errorCollector,
      productManager: {
        getCurrentConfiguration() {
          return {
            ...productManager.getCurrentConfiguration(),
            builtInMarketplaces: options.plugins?.builtInMarketplaces ?? {},
          };
        },
      },
    },
    ...options.plugins?.marketplaceRuntime,
  });
  const localInstaller = Object.assign(
    new marketplaceClasses.LocalPluginInstaller(),
    { errorCollector },
  );
  marketplaceClasses.installers.push(localInstaller);
  marketplaceClasses.installers.push(...extraInstallers);
  const marketplaceStorage = Object.assign(
    new marketplaceClasses.MarketplaceStorage(),
    { logger, errorCollector, fileLockService },
  );
  const marketplaceConfigManager = Object.assign(
    new marketplaceClasses.MarketplaceConfigManager(),
    {
      logger,
      marketplaceStorage,
      settingsManager: ownedSettings,
      cliSettingSourcesProvider: sourceSettings,
    },
  );
  const builtInMarketplaceProvider = Object.assign(
    new marketplaceClasses.BuiltInMarketplaceProvider(),
    { logger },
  );
  const marketplaceUpdateChecker = Object.assign(
    new marketplaceClasses.MarketplaceUpdateChecker(),
    { logger, productManager },
  );
  marketplaceUpdateChecker.init();
  Object.assign(marketplaceClasses.services, {
    marketplaceUpdateChecker,
    builtInMarketplaceProvider,
  });
  const gitAvailabilityDetector = Object.assign(
    new marketplaceClasses.GitAvailabilityDetector(),
    { logger },
  );
  const gitToZipUrlConverter = new marketplaceClasses.GitToZipUrlConverter();
  const gitFallbackCoordinator = Object.assign(
    new marketplaceClasses.GitFallbackCoordinator(),
    {
      logger,
      detector: gitAvailabilityDetector,
      converter: gitToZipUrlConverter,
    },
  );
  marketplaceStorage.init();
  marketplaceConfigManager.init();
  builtInMarketplaceProvider.init();
  for (const service of [
    pluginOptionsStorage,
    localInstaller,
    ...extraInstallers,
    marketplaceStorage,
    marketplaceConfigManager,
    builtInMarketplaceProvider,
    marketplaceUpdateChecker,
  ]) {
    for (const name of Object.getOwnPropertyNames(
      Object.getPrototypeOf(service),
    )) {
      if (name === "constructor" || typeof service[name] !== "function")
        continue;
      const native = service[name].bind(service);
      service[name] = (...args: any[]) => {
        const value = native(...args);
        return value?.then ? observe(value) : value;
      };
    }
  }
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
    fsExtra,
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
      t8: { default: installerExec },
      AH: {
        SETTINGS_FILENAME: "settings.json",
        SETTINGS_LOCAL_FILENAME: "settings.local.json",
      },
      An: { tmpdir: () => path.join(options.stateDir, "tmp") },
      Aj: { McpOAuthManager: "mcpOAuth" },
      MarketplaceFactory: marketplaceClasses.MarketplaceFactory,
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
      cliSettingsProvider: settingsHost.cli,
      startupProfiler: { markStart() {}, markEnd() {} },
      pluginPolicyService,
      marketplaceStorage,
      builtInMarketplaceProvider,
      marketplaceConfigManager,
      fileLockService,
      installers: marketplaceClasses.installers,
      gitFallbackCoordinator,
      // Standalone telemetry sink, not the original network telemetry transport.
      pluginTelemetryService: {
        reportMarketplaceAction: (event: any) =>
          logger.debug?.("Marketplace action", event),
        reportPluginAction: (event: any) =>
          logger.debug?.("Plugin action", event),
      },
      container: {
        get: (key: string) =>
          options.plugins?.dependencies?.[key] ??
          (key === "pluginOptionsStorage"
            ? pluginOptionsStorage
            : unavailable(key)),
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
  // The original output-style import is fs/promises; loaders above use node:fs.
  const classes = createNativePluginRuntime({ ...runtime, fs: fs.promises });
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
    cliSettingsProvider: settingsHost.cli,
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
  let bootstrapped = false;
  const controllerHost = createNativePluginControllerHost({
    pluginManager,
    refresh,
    fsExtra,
    logger,
    ...(options.plugins?.dependencies?.pluginValidator
      ? { pluginValidator: options.plugins.dependencies.pluginValidator }
      : {}),
    ...(options.plugins?.dependencies?.pluginConsoleManager
      ? { consoleManager: options.plugins.dependencies.pluginConsoleManager }
      : {}),
    ...(options.plugins?.controllerRuntime
      ? { runtime: options.plugins.controllerRuntime }
      : {}),
  });
  const { controller, controllerClasses, pluginValidator, validatorClasses } =
    controllerHost;
  const builtinSeedHost = createNativeBuiltinSeedHost({
    stateDir: options.stateDir,
    getProductFeatures: () =>
      productManager.getCurrentConfiguration()?.productFeatures,
    controller,
    refresh,
    logger,
    configuration: options.plugins?.builtinSeed,
  });
  if (!options.plugins?.settings)
    ownSubscription(
      ownedSettings.onDidChange(() => {
        if (!bootstrapped || closed) return;
        void refresh
          .refresh("settings-change")
          .catch((error: any) =>
            logger.warn?.("Settings plugin refresh failed", error),
          );
      }),
    );
  return {
    pluginManager,
    loader,
    loaderClasses,
    managerClasses,
    marketplaceClasses,
    storageClasses,
    installerClasses,
    pluginOptionsStorage,
    settingsHost,
    settingsManager: ownedSettings,
    pluginPolicyService,
    policyClasses,
    controller,
    controllerHost,
    controllerClasses,
    pluginValidator,
    validatorClasses,
    builtinSeedHost,
    optionSettings,
    errorCollector,
    marketplaceIO,
    marketplaceUpdateChecker,
    gitAvailabilityDetector,
    gitToZipUrlConverter,
    marketplaceStorage,
    marketplaceConfigManager,
    builtInMarketplaceProvider,
    fileLockService,
    refresh,
    executor,
    outputStyles,
    classes,
    get errors() {
      return errorCollector.getErrors?.() ?? [];
    },
    runtime,
    attach(dependencies: Record<string, any>) {
      if (dependencies.hookManager)
        settingsHost.attach({ hookManager: dependencies.hookManager });
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
      await fsExtra.ensureDir(lockDirectory);
      await settingsHost.start();
      // Standalone compatibility only: retain the old adapter file and merge missing USER entries.
      if (
        !options.plugins?.settings &&
        !options.plugins?.dependencies?.pluginOptionSettings &&
        !options.plugins?.dependencies?.pluginOptionsStorage &&
        (await fsExtra.pathExists(optionSettings.file))
      ) {
        const legacy = await optionSettings.get("pluginConfigs", "user");
        if (legacy && typeof legacy === "object")
          await ownedSettings.update(
            "pluginConfigs",
            (current: any) => {
              const merged = { ...current };
              for (const [id, value] of Object.entries(legacy))
                if (!(id in merged)) merged[id] = value;
              return merged;
            },
            "user",
          );
      }
      if (!options.plugins?.dependencies?.pluginPolicyService)
        pluginPolicyService.init();
      if (!options.plugins?.pluginManager) {
        pluginManager.init();
        await observe(pluginManager.whenReady());
      }
      await refresh.refresh("startup");
      bootstrapped = true;
      if (options.plugins?.builtinSeed) await builtinSeedHost.seed();
    },
    waitForRefreshSettled: () => refresh.waitForRefreshSettled(),
    async close() {
      closed = true;
      const marketplaceClosing = marketplaceIO.close();
      const builtinSeedClosing = builtinSeedHost.close();
      const controllerClosing = controllerHost.close();
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
      await builtinSeedClosing;
      await controllerClosing;
      while (pending.size) await Promise.allSettled([...pending]);
      await marketplaceClosing;
      await optionSettings.close();
      await settingsHost.close();
      await pluginManager.builtInMarketplaceRefreshPromise;
      await refresh.waitForRefreshSettled();
      if (!options.plugins?.pluginManager)
        pluginManager.onDidChangeEmitter.dispose();
      processEvents.emit("exit");
      processEvents.removeAllListeners();
      if (!options.plugins?.dependencies?.pluginPolicyService)
        pluginPolicyService.onDidChangeEmitter.dispose();
      if (!options.plugins?.dependencies?.errorCollector)
        errorCollector.onDidChangeEmitter.dispose();
    },
    get pendingCount() {
      return (
        pending.size +
        controllerHost.pendingCount +
        builtinSeedHost.pendingCount +
        settingsHost.pendingCount
      );
    },
    get ownedHandleCount() {
      return (
        timers.size +
        immediates.size +
        subscriptions.size +
        marketplaceIO.ownedHandleCount +
        settingsHost.ownedHandleCount +
        controllerHost.ownedHandleCount
      );
    },
    get closed() {
      return closed;
    },
  };
}
