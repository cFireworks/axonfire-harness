import { createNativeCloudProduct } from "../../src/config/native-cloud-product.js";
export function cloudProductFixture(
  factory: any = createNativeCloudProduct,
  options: any = {},
) {
  let now = 1700000000000,
    session: any = options.session ?? {
      account: {
        uid: "owned-user",
        nickname: "Owned",
        enterpriseId: "owned-enterprise",
        departmentFullName: "Owned unit",
      },
      auth: { accessToken: "owned-token", tokenType: "Bearer" },
    };
  const calls: any[] = [],
    logs: any[] = [],
    sleeps: number[] = [],
    data = new Map<string, any>(),
    timers = new Map<any, { callback: () => void; ms: number }>(),
    retries = new Set<Promise<any>>();
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error", "time", "timeEnd"].map(
      (k) => [
        k,
        (...args: any[]) =>
          logs.push([
            k,
            ...args.map((v) => (v instanceof Error ? v.message : v)),
          ]),
      ],
    ),
  );
  const runtime: any = {
    dependencies: {
      productManager: {
        getEndpoint: () => options.endpoint ?? "http://owned.invalid",
      },
    },
    env: options.env ?? {},
    now: () => now,
    setTimeout(callback: () => void, ms: number) {
      const handle = {};
      sleeps.push(ms);
      timers.set(handle, { callback, ms });
      return handle;
    },
  };
  const classes = factory(runtime),
    authentication = { currentSessionSubject: { getValue: () => session } },
    userinfo = Object.assign(new classes.UserinfoProviderImpl(), {
      authenticationManager: authentication,
    });
  const storage = {
    async get(key: string, fallback: any) {
      return data.has(key) ? data.get(key) : fallback;
    },
    async set(key: string, value: any) {
      data.set(key, value);
    },
  };
  const manager = Object.assign(new classes.CloudProductManagerImpl(), {
    logger,
    userinfoProvider: userinfo,
    localStorage: storage,
    restOperations: {
      async get(...args: any[]) {
        calls.push(args);
        return options.get
          ? options.get(...args)
          : { data: { data: { owned: true } } };
      },
    },
  });
  const nativeRetry = manager.fetchWithRetry.bind(manager);
  manager.fetchWithRetry = (...args: any[]) => {
    const job = nativeRetry(...args);
    retries.add(job);
    void job.then(
      () => retries.delete(job),
      () => retries.delete(job),
    );
    return job;
  };
  const provider = Object.assign(new classes.CloudProductProvider(), {
      logger,
      cloudProductManager: manager,
    }),
    pre = Object.assign(new classes.CloudPreProductProvider(), {
      authenticationManager: authentication,
    });
  return {
    runtime,
    classes,
    logger,
    logs,
    calls,
    sleeps,
    data,
    timers,
    retries,
    authentication,
    userinfo,
    storage,
    manager,
    provider,
    pre,
    setSession(value: any) {
      session = value;
    },
    advance(ms: number) {
      now += ms;
    },
    get now() {
      return now;
    },
    async nextTimer() {
      await new Promise<void>((r) => setImmediate(r));
      const entry = timers.entries().next().value;
      if (!entry) return false;
      const [handle, timer] = entry;
      timers.delete(handle);
      now += timer.ms;
      timer.callback();
      await new Promise<void>((r) => setImmediate(r));
      return true;
    },
    async drain() {
      for (let i = 0; i < 1000; i++) {
        await new Promise<void>((r) => setImmediate(r));
        if (!timers.size && !retries.size) return;
        if (timers.size) await this.nextTimer();
      }
      throw Error("Owned retry fixture did not settle");
    },
  };
}
