import { createNativeProductRuntime } from "./native-product-runtime.js";
import * as fs from "node:fs";
import { BehaviorSubject } from "rxjs";
import { createNativeProductWatchers } from "./native-product-watchers.js";
import { ProductProviderPriority } from "./native-product-constants.js";
import {
  createNativeCloudProductHost,
  type NativeCloudProductOptions,
} from "./native-cloud-product-host.js";
import {
  createNativeProductSourceHost,
  type NativeProductSourceOptions,
} from "./native-product-source-host.js";

export type NativeProductHostOptions = {
  initialConfiguration: any;
  getWorkDir(): string;
  getHomeDir(): string;
  providers?: any[];
  strategies?: any[];
  storage?: any;
  env?: NodeJS.ProcessEnv;
  sdkInitializeState?: any;
  cliOptions?: () => Record<string, any>;
  plugins?: { getActivePlugins(): Promise<any[]> };
  mcpManager?: any;
  skillProvider?: any;
  logger?: any;
  onConfiguration?(configuration: any): void | Promise<void>;
  runtime?: Record<string, any>;
  watch?: boolean;
  cwdService?: any;
  serverModelManager?: any;
  watchDependencies?: Record<string, any>;
  sources?: NativeProductSourceOptions;
  cloud?: NativeCloudProductOptions | false;
};
/** Owns DI, publication and shutdown only; provider/merge/cache decisions remain native. */
export function createNativeProductHost(options: NativeProductHostOptions) {
  let closed = false,
    started = false,
    closing: Promise<void> | undefined;
  const timers = new Set<any>(),
    pending = new Set<Promise<any>>(),
    subscriptions = new Set<any>();
  const publications = new Set<Promise<any>>();
  let publicationError: unknown;
  let publicationRevision = 0;
  const logger: any = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext", "time", "timeEnd"].map(
      (key) => [key, (...args: any[]) => options.logger?.[key]?.(...args)],
    ),
  );
  const schedule = options.runtime?.setTimeout ?? setTimeout,
    cancel = options.runtime?.clearTimeout ?? clearTimeout;
  const runtime: any = {
    getWorkDir: options.getWorkDir,
    getHomeDir: options.getHomeDir,
    env: options.env ?? {},
    fs,
    ...options.runtime,
    dependencies: { logger },
    setTimeout(callback: () => void, ms: number) {
      const handle = schedule(() => {
        timers.delete(handle);
        if (!closed) callback();
      }, ms);
      timers.add(handle);
      return handle;
    },
    clearTimeout(handle: any) {
      timers.delete(handle);
      cancel(handle);
    },
  };
  const baseFs = runtime.fs;
  runtime.fs = new Proxy(baseFs, {
    get(target, key) {
      if (key === "watch")
        return (...args: any[]) => {
          if (closed) throw Error("Product host is closed");
          const last = args.length - 1,
            callback = args[last];
          if (typeof callback === "function")
            args[last] = (...values: any[]) => {
              if (!closed) callback(...values);
            };
          return target.watch(...args);
        };
      return Reflect.get(target, key);
    },
  });
  const classes = createNativeProductRuntime(runtime),
    merger = Object.assign(new classes.DefaultProductMerger(), {
      productMergeStrategies: options.strategies ?? [
        new classes.OverrideProductMergeStrategy(),
        new classes.MergeProductMergeStrategy(),
        new classes.SmartMergeProductMergeStrategy(),
        new classes.DeepSmartMergeProductMergeStrategy(),
        new classes.CommandsSmartMergeProductMergeStrategy(),
      ],
    }),
    manager = new classes.ProductManagerImpl(),
    storage = options.storage ?? new classes.MemoryLocalStorage();
  const client = Object.assign(new classes.ClientProductProvider(), {
      logger,
      cachedProductConfiguration: options.initialConfiguration,
    }),
    environment = Object.assign(new classes.EnvProductProvider(), {
      logger,
      productMerger: merger,
      fs: runtime.fs,
    }),
    cli = Object.assign(new classes.CliOptionsProductProvider(), {
      logger,
      cliProvider: {
        parseOpts: () => ({ opts: options.cliOptions?.() ?? {} }),
      },
    }),
    sdk = Object.assign(new classes.SdkInitializeProductProvider(), {
      logger,
      sdkInitializeState: options.sdkInitializeState ?? { get: () => ({}) },
    }),
    plugins = Object.assign(new classes.PluginsProductProvider(), {
      logger,
      productMerger: merger,
      pluginManager: options.plugins ?? {
        async getActivePlugins() {
          return [];
        },
      },
    }),
    mcp = Object.assign(new classes.McpPromptProductProvider(), {
      logger,
      mcpManager: options.mcpManager ?? {
        async getConnectedServers() {
          return [];
        },
      },
    }),
    mcpPromptRenderer = Object.assign(new classes.McpPromptRendererImpl(), {
      logger,
      mcpManager: options.mcpManager,
    });
  const providers: any[] = [
    client,
    environment,
    cli,
    sdk,
    plugins,
    mcp,
    new classes.DefaultProductProvider(),
    ...(options.providers ?? []),
  ];
  if (options.skillProvider) {
    // Retain the captured anonymous class name (eS=eu=class), not the readable port name.
    const skill = {
      priority: ProductProviderPriority.WORKSPACE,
      volatile: true,
      provide: (input: any) => options.skillProvider.provide(input),
    };
    Object.defineProperty(skill, "constructor", { value: { name: "eu" } });
    providers.push(skill);
  }
  Object.assign(manager, {
    localStorage: storage,
    productMerger: merger,
    productProviderProvider: {
      async sort() {
        const prioritized = await Promise.all(
          providers.map(async (value) => ({
            value,
            priority: await (value
              ? "priority" in value
                ? value.priority
                : "order" in value
                  ? value.order
                  : 0
              : undefined),
          })),
        );
        return prioritized
          .filter((row) => row.priority > 0)
          .sort((a, b) => b.priority - a.priority)
          .map((row) => row.value);
      },
    },
  });
  function observe<T>(promise: Promise<T>): Promise<T> {
    pending.add(promise);
    void promise.then(
      () => pending.delete(promise),
      () => pending.delete(promise),
    );
    return promise;
  }
  for (const key of [
    "sync",
    "syncVolatileProviders",
    "saveToCache",
    "loadFromCacheAsync",
  ]) {
    const native = manager[key].bind(manager);
    manager[key] = (...args: any[]) => observe(native(...args));
  }
  const subscribe = manager.configuration.subscribe.bind(manager.configuration);
  manager.configuration.subscribe = (...args: any[]) => {
    const sub = subscribe(...args);
    subscriptions.add(sub);
    return sub;
  };
  const published = manager.configuration.subscribe((configuration: any) => {
    if (!configuration || closed) return;
    const revision = ++publicationRevision;
    publicationError = undefined;
    try {
      const result = options.onConfiguration?.(configuration);
      if (result && typeof result.then === "function") {
        publications.add(result);
        void result.then(
          () => publications.delete(result),
          (error) => {
            if (revision === publicationRevision) publicationError = error;
            publications.delete(result);
          },
        );
      }
    } catch (error) {
      publicationError = error;
    }
  });
  const facade = {
    async sync(force?: boolean) {
      if (closed) throw Error("Product host is closed");
      await manager.sync(force);
      await flushPublications();
    },
    async syncVolatileProviders(force?: boolean) {
      if (closed) throw Error("Product host is closed");
      await manager.syncVolatileProviders(force);
      await flushPublications();
    },
    async waitConfiguration(force = false) {
      if (closed) throw Error("Product host is closed");
      return manager.waitConfiguration(force);
    },
    getCurrentConfiguration: () => manager.getCurrentConfiguration(),
    getEndpoint: () => manager.getEndpoint(),
    onDidChange: (listener: () => void) => manager.onDidChange(listener),
  };
  Object.assign(runtime.dependencies, {
    productManager: facade,
    skills: options.skillProvider,
    plugins: options.plugins,
    ...options.watchDependencies,
  });
  const sourceHost = createNativeProductSourceHost({
    runtime,
    productManager: facade,
    productMerger: merger,
    logger,
    watch: options.watch,
    sources: options.sources,
  });
  providers.push(...sourceHost.providers);
  const cloudHost =
    options.cloud === false
      ? undefined
      : createNativeCloudProductHost({
          productManager: facade,
          storage,
          logger,
          authenticationManager: sourceHost.authentication,
          env: options.env,
          ...(options.cloud ? { configuration: options.cloud } : {}),
        });
  if (cloudHost) providers.push(...cloudHost.providers);
  const watcherClasses = createNativeProductWatchers(runtime),
    configWatch = Object.assign(new watcherClasses.ConfigWatchServiceImpl(), {
      logger,
      cwdService: options.cwdService ?? {
        onDidChangeCwd: new BehaviorSubject(options.getWorkDir()),
      },
    }),
    mcpWatch = Object.assign(new watcherClasses.McpWatchServiceImpl(), {
      logger,
      serverModelManager: options.serverModelManager,
    });
  for (const key of ["rebindWatchers", "setupWatchers", "watchPath"]) {
    const native = configWatch[key].bind(configWatch);
    configWatch[key] = (...args: any[]) =>
      closed ? Promise.resolve() : observe(native(...args));
  }
  let watchesStarted = false;
  return {
    manager,
    facade,
    merger,
    classes,
    storage,
    providers,
    runtime,
    mcpPromptRenderer,
    configWatch,
    mcpWatch,
    watcherClasses,
    sourceHost,
    cloudHost,
    async start() {
      if (closed) throw Error("Product host is closed");
      if (!started) {
        started = true;
        manager.init();
        sourceHost.start();
        cloudHost?.start();
      }
      await manager.promise;
      await flushPublications();
      if (!closed && !watchesStarted && options.watch !== false) {
        watchesStarted = true;
        configWatch.initialize();
        if (options.serverModelManager) mcpWatch.initialize();
      }
    },
    async flush() {
      await drain();
      await sourceHost.flush();
      await cloudHost?.flush();
      await drain();
      await flushPublications();
    },
    close() {
      if (closing) return closing;
      closed = true;
      configWatch.cleanup();
      mcpWatch.cleanup();
      configWatch.onDidHotReloadEmitter.dispose();
      published.unsubscribe();
      for (const sub of subscriptions) sub.unsubscribe();
      subscriptions.clear();
      manager.onDidChangeEmitter.dispose();
      for (const timer of timers) cancel(timer);
      timers.clear();
      const sourceClosing = sourceHost.close();
      const cloudClosing = cloudHost?.close();
      closing = (async () => {
        await sourceClosing;
        await cloudClosing;
        await drain();
        manager.configuration.complete();
        if (!options.storage) storage.emitter?.dispose();
      })();
      return closing;
    },
    get started() {
      return started;
    },
    get closed() {
      return closed;
    },
    get ownedTimerCount() {
      return timers.size;
    },
  };
  async function flushPublications() {
    while (publications.size) await Promise.allSettled([...publications]);
    if (publicationError) throw publicationError;
  }
  async function drain() {
    for (;;) {
      const tail = manager.promise;
      await Promise.allSettled([tail, ...pending]);
      if (!pending.size && tail === manager.promise) return;
    }
  }
}
