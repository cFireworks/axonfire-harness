import * as fs from "node:fs";
import * as path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { originalConfigPath } from "./product-config.js";
import { createNativeProductEnvironment } from "./native-product-environment.js";

export type NativeProductEnvironmentOptions = {
  /** Explicit product JSON directory, not an installation/account discovery path. */
  resourcesRoot?: string;
  /** Changes the original platform branch; platform home remains state-local. */
  platform?: NodeJS.Platform;
  runtime?: Record<string, any>;
};

/** Owned IO/DI and asynchronous lifetime only. Original environment decisions stay in the native classes. */
export function createNativeProductEnvironmentHost(options: {
  getHomeDir(): string;
  settingsManager: any;
  productManager: any;
  authenticationManager: any;
  logger: any;
  env: NodeJS.ProcessEnv;
  configuration?: NativeProductEnvironmentOptions | undefined;
}) {
  let closed = false,
    started = false,
    closing: Promise<void> | undefined;
  const pending = new Set<Promise<any>>(),
    subscriptions = new Set<any>();
  const operations = new AsyncLocalStorage<{ active: number }>();
  const logger = Object.fromEntries(
    ["info", "warn", "error", "setContext"].map((key) => [
      key,
      (...args: any[]) => options.logger?.[key]?.(...args),
    ]),
  );
  const home = path.resolve(options.getHomeDir());
  const platformHome = path.join(home, "product-environment", "platform-home");
  const resources = path.resolve(
    options.configuration?.resourcesRoot ??
      path.dirname(originalConfigPath("product.json")),
  );
  const platform = options.configuration?.platform ?? process.platform;
  const settingsPath = path.join(home, "settings.json");
  const authDirectory = path.join(
    platformHome,
    platform === "darwin"
      ? "Library/Application Support/CodeBuddyExtension"
      : platform === "win32"
        ? "AppData/Local/CodeBuddyExtension"
        : ".local/share/CodeBuddyExtension",
    "Data",
    "Public",
    "auth",
  );
  const inside = (root: string, file: string) => {
    const relative = path.relative(root, file);
    return (
      relative !== ".." &&
      !relative.startsWith(".." + path.sep) &&
      !path.isAbsolute(relative)
    );
  };
  function check(target: string) {
    const file = path.resolve(target);
    const root =
      file === settingsPath || inside(authDirectory, file) ? home : resources;
    if (
      root === resources &&
      (path.dirname(file) !== resources ||
        !/^product(?:\.[a-z0-9_-]+)?\.json$/i.test(path.basename(file)))
    )
      throw Error(
        "Product environment read is outside configured resources/state",
      );
    // No reads through state/resource symlinks into an installed account or another root.
    if (!fs.existsSync(file)) return file;
    if (!inside(fs.realpathSync(root), fs.realpathSync(file)))
      throw Error("Product environment read traverses an external symlink");
    return file;
  }
  const ownedFs = {
    readFileSync(target: string, ...args: any[]) {
      return (fs.readFileSync as any)(check(target), ...args);
    },
    existsSync(target: string) {
      try {
        return fs.existsSync(check(target));
      } catch {
        return false;
      }
    },
  };
  function run<T>(callback: () => T): T {
    let operation = operations.getStore();
    if (closed && !operation?.active)
      throw Error("Product environment host is closed");
    operation = operation?.active ? operation : { active: 0 };
    operation.active++;
    const finish = () => {
      operation!.active--;
    };
    let value: T;
    try {
      value = operations.run(operation, callback);
    } catch (error) {
      finish();
      throw error;
    }
    if (value && typeof (value as any).then === "function") {
      const job = value as unknown as Promise<any>;
      pending.add(job);
      void job.then(
        () => {
          pending.delete(job);
          finish();
        },
        () => {
          pending.delete(job);
          finish();
        },
      );
    } else finish();
    return value;
  }
  const settingsManager = {
    get: (...args: any[]) => options.settingsManager.get(...args),
    onDidChange(listener: (...args: any[]) => any) {
      const sub = options.settingsManager.onDidChange((...args: any[]) => {
        if (closed) return;
        const job = run(() => listener(...args));
        if (job?.then)
          void job.catch((error: any) =>
            logger.error?.(
              "Product environment settings callback failed",
              error,
            ),
          );
        return job;
      });
      subscriptions.add(sub);
      return sub;
    },
  };
  const productManager = new Proxy(options.productManager, {
    get(target, key) {
      if (key === "sync")
        return (...args: any[]) => run(() => target.sync(...args));
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const runtime: any = {
    ...options.configuration?.runtime,
    env: options.env,
    platform,
    fs: ownedFs,
    getPlatformHomeDir: () => platformHome,
    pathUtils: {
      getHomeDir: () => home,
      resolveRootPathSync(filename: string) {
        return check(path.resolve(resources, filename));
      },
    },
    dependencies: {
      productManager,
      authenticationManager: options.authenticationManager,
    },
  };
  const classes = createNativeProductEnvironment(runtime);
  const service = Object.assign(new classes.ProductEnvServiceImpl(), {
    productManager,
    settingsManager,
    logger,
  });
  const internet = Object.assign(
    new classes.ClientInternetEnviromentProductProvider(),
    { fs: ownedFs, settingsManager, logger },
  );
  const endpoint = Object.assign(
    new classes.SettingsEndpointProductProvider(),
    { settingsManager, logger },
  );
  for (const instance of [service, internet, endpoint])
    for (const name of Object.getOwnPropertyNames(
      Object.getPrototypeOf(instance),
    )) {
      if (name === "constructor") continue;
      const native = instance[name].bind(instance);
      instance[name] = (...args: any[]) => {
        try {
          return run(() => native(...args));
        } catch (error) {
          if (native.constructor.name === "AsyncFunction")
            return Promise.reject(error);
          throw error;
        }
      };
    }
  async function flush() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  return {
    classes,
    service,
    internet,
    endpoint,
    runtime,
    platformHome,
    authDirectory,
    providers: [internet, endpoint],
    start() {
      if (closed) throw Error("Product environment host is closed");
      if (started) return;
      started = true;
      service.earlyEnvInit();
      internet.init();
      endpoint.init();
    },
    flush,
    close() {
      if (closing) return closing;
      closed = true;
      for (const sub of subscriptions) {
        if (typeof sub === "function") sub();
        else sub?.dispose?.();
      }
      subscriptions.clear();
      closing = flush().finally(() => operations.disable());
      return closing;
    },
    get closed() {
      return closed;
    },
    get pendingCount() {
      return pending.size;
    },
    get subscriptionCount() {
      return subscriptions.size;
    },
  };
}
