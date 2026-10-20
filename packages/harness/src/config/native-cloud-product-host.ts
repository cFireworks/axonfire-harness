import { createNativeCloudProduct } from "./native-cloud-product.js";
import {
  createOwnedCloudProductHttp,
  type OwnedCloudProductHttpOptions,
} from "./owned-cloud-product-http.js";
export type NativeCloudProductOptions = {
  authenticationManager?: { currentSessionSubject: any };
  userinfoProvider?: { provide(): Promise<any> };
  localStorage?: any;
  restOperations?: { get(...args: any[]): Promise<any> };
  transport?: OwnedCloudProductHttpOptions;
  gitInfoCollector?: { collect(): Promise<any> };
  env?: NodeJS.ProcessEnv;
  runtime?: Record<string, any>;
};
/** Owns background retries, HTTP and closure only; original auth gate/cache/merge methods are unchanged. */
export function createNativeCloudProductHost(options: {
  productManager: any;
  storage: any;
  logger: any;
  authenticationManager: any;
  env?: NodeJS.ProcessEnv | undefined;
  configuration?: NativeCloudProductOptions | undefined;
}) {
  let closed = false,
    closing: Promise<void> | undefined,
    started = false;
  const pending = new Set<Promise<any>>(),
    foreground = new Set<Promise<any>>(),
    timers = new Set<{ handle: any; callback: () => void; active: boolean }>(),
    controllers = new Set<AbortController>();
  const logger = Object.fromEntries(
    ["setContext", "info", "debug", "warn", "error", "time", "timeEnd"].map(
      (key) => [key, (...args: any[]) => options.logger?.[key]?.(...args)],
    ),
  );
  const transport = options.configuration?.transport
    ? createOwnedCloudProductHttp(options.configuration.transport)
    : undefined;
  const rest = options.configuration?.restOperations ??
    transport ?? {
      async get() {
        throw Error(
          "Cloud product REST requires an explicit transport or adapter",
        );
      },
    };
  const authentication =
    options.configuration?.authenticationManager ??
    options.authenticationManager;
  const schedule = options.configuration?.runtime?.setTimeout ?? setTimeout,
    cancel = options.configuration?.runtime?.clearTimeout ?? clearTimeout;
  function own<T>(job: Promise<T>, front = false) {
    pending.add(job);
    if (front) foreground.add(job);
    void job.then(
      () => {
        pending.delete(job);
        foreground.delete(job);
      },
      () => {
        pending.delete(job);
        foreground.delete(job);
      },
    );
    return job;
  }
  const runtime: any = {
    ...options.configuration?.runtime,
    env: options.configuration?.env ?? options.env ?? {},
    dependencies: { productManager: options.productManager },
    setTimeout(callback: () => void, ms: number) {
      if (closed) {
        queueMicrotask(callback);
        return undefined;
      }
      const timer = { handle: undefined as any, callback, active: true };
      timers.add(timer);
      try {
        timer.handle = schedule(() => {
          if (!timer.active) return;
          timer.active = false;
          timers.delete(timer);
          callback();
        }, ms);
        return timer.handle;
      } catch (error) {
        timers.delete(timer);
        throw error;
      }
    },
  };
  const classes = createNativeCloudProduct(runtime),
    userInfo =
      options.configuration?.userinfoProvider ??
      Object.assign(new classes.UserinfoProviderImpl(), {
        authenticationManager: authentication,
      });
  const manager = Object.assign(new classes.CloudProductManagerImpl(), {
    logger,
    userinfoProvider: userInfo,
    localStorage: options.configuration?.localStorage ?? options.storage,
    ...(options.configuration?.gitInfoCollector
      ? { gitInfoCollector: options.configuration.gitInfoCollector }
      : {}),
    restOperations: {
      async get(url: string, config: any) {
        if (closed) throw Error("Cloud product host is closed");
        const controller = new AbortController();
        controllers.add(controller);
        try {
          const result = await rest.get(url, {
            ...config,
            signal: controller.signal,
          });
          if (closed) throw Error("Cloud product host is closed");
          return result;
        } finally {
          controllers.delete(controller);
        }
      },
    },
  });
  const pre = Object.assign(new classes.CloudPreProductProvider(), {
    authenticationManager: authentication,
  });
  const provider = Object.assign(new classes.CloudProductProvider(), {
    logger,
    cloudProductManager: manager,
  });
  for (const service of [manager, pre, provider])
    for (const name of Object.getOwnPropertyNames(
      Object.getPrototypeOf(service),
    )) {
      if (name === "constructor") continue;
      const native = service[name].bind(service),
        async = native.constructor.name === "AsyncFunction";
      service[name] = (...args: any[]) => {
        if (closed) {
          if (async || name === "sleep")
            return own(Promise.reject(Error("Cloud product host is closed")));
          throw Error("Cloud product host is closed");
        }
        const result = native(...args);
        return result?.then
          ? own(
              result,
              name === "fetch" ||
                name === "provide" ||
                name === "updateDiskCache" ||
                name === "readDiskCache",
            )
          : result;
      };
    }
  return {
    manager,
    provider,
    pre,
    userInfo,
    classes,
    runtime,
    transport,
    authentication,
    providers: [pre, provider],
    start() {
      if (closed) throw Error("Cloud product host is closed");
      if (started) return;
      started = true;
      manager.init();
      provider.init();
    },
    async flush() {
      while (foreground.size) await Promise.allSettled([...foreground]);
    },
    close() {
      return (closing ??= (async () => {
        closed = true;
        for (const controller of controllers)
          controller.abort(Error("Cloud product host is closed"));
        const transportClosing = transport?.close();
        for (const timer of [...timers]) {
          timer.active = false;
          cancel(timer.handle);
          timers.delete(timer);
          timer.callback();
        }
        await transportClosing;
        while (pending.size) await Promise.allSettled([...pending]);
      })());
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return (
        timers.size + controllers.size + (transport?.ownedHandleCount ?? 0)
      );
    },
    get closed() {
      return closed;
    },
  };
}
