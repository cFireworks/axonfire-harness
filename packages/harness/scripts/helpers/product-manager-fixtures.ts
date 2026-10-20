import { createNativeProductRuntime } from "../../src/config/native-product-runtime.js";
export function productManagerFixture(
  options: any = {},
  factory: any = createNativeProductRuntime,
) {
  const events: any[] = [],
    timers = new Map<any, { callback: () => void; ms: number }>(),
    data = new Map<string, any>();
  let now = 1000,
    revision = 0;
  const logger: any = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext"].map((name) => [
      name,
      (...args: any[]) =>
        events.push([
          name,
          ...args.map((v) => (v instanceof Error ? v.message : v)),
        ]),
    ]),
  );
  const runtime: any = {
    getWorkDir: () => "/owned",
    getHomeDir: () => "/owned/home",
    env: options.env ?? {},
    dependencies: { logger },
    now: () => now,
    setTimeout: (callback: () => void, ms: number) => {
      const handle = {};
      timers.set(handle, { callback, ms });
      return handle;
    },
    clearTimeout: (handle: any) => timers.delete(handle),
  };
  const classes = factory(runtime),
    merger = Object.assign(new classes.DefaultProductMerger(), {
      productMergeStrategies: [
        new classes.OverrideProductMergeStrategy(),
        new classes.MergeProductMergeStrategy(),
        new classes.SmartMergeProductMergeStrategy(),
        new classes.DeepSmartMergeProductMergeStrategy(),
        new classes.CommandsSmartMergeProductMergeStrategy(),
      ],
    }),
    manager = new classes.ProductManagerImpl();
  const initial = {
      agents: [{ name: "cli", tags: ["default"], instructions: "base" }],
      models: [],
      tools: [],
      prompts: [],
      endpoint: "http://owned.invalid/",
      config: { url: "first" },
      productFeatures: options.features ?? {},
    },
    base = {
      priority: 5000,
      async provide() {
        events.push(["provide", "base"]);
        return initial;
      },
    },
    stable = {
      priority: 10000,
      async provide() {
        events.push(["provide", "stable"]);
        if (options.error === "stable") throw Error("owned stable failure");
        return {
          mergeStrategy: "smartMerge",
          stable: "owned",
          config: { url: "next" },
        };
      },
    },
    volatile = {
      priority: 21000,
      volatile: options.volatile ?? true,
      async provide(input: any) {
        events.push(["provide", "volatile", input.force]);
        if (options.error === "volatile") throw Error("owned volatile failure");
        return {
          mergeStrategy: "smartMerge",
          agents: [{ name: "cli", appendInstructions: "revision:" + revision }],
          volatileRevision: revision,
        };
      },
    },
    storage: any = {
      async get(key: string, fallback?: any) {
        return data.has(key) ? data.get(key) : fallback;
      },
      async set(key: string, value: any) {
        data.set(key, value);
        events.push(["cache", key]);
      },
    };
  Object.defineProperty(volatile, "constructor", {
    value: { name: options.providerName ?? "owned-volatile" },
  });
  if (options.syncStorage) storage.getSync = (key: string) => data.get(key);
  Object.assign(manager, {
    productMerger: merger,
    localStorage: storage,
    productProviderProvider: {
      async sort() {
        return [volatile, stable, base];
      },
    },
  });
  manager.configuration.subscribe((value: any) => {
    if (value)
      events.push(["configuration", JSON.parse(JSON.stringify(value))]);
  });
  manager.onDidChange(() => events.push(["changed"]));
  return {
    classes,
    manager,
    merger,
    runtime,
    events,
    timers,
    data,
    initial,
    base,
    stable,
    volatile,
    storage,
    advance(ms: number) {
      now += ms;
    },
    nextRevision() {
      revision++;
    },
    async settle() {
      for (let i = 0; i < 20; i++) {
        const tail = manager.promise;
        await tail.catch(() => {});
        await Promise.resolve();
        if (tail === manager.promise) return;
      }
      throw Error("fixture did not settle");
    },
    snapshot() {
      return JSON.parse(
        JSON.stringify({
          configuration: manager._configuration,
          stable: manager._stableConfiguration,
          level: manager.dataLevel,
          endpoint: manager.getEndpoint(),
          cache: [...data].map(([key, value]) => [
            key,
            key.startsWith("CodeBuddy-Product-Cache")
              ? JSON.parse(classes.GzipUtils.decompress(value))
              : value,
          ]),
          events: [...events].sort((a, b) =>
            JSON.stringify(a).localeCompare(JSON.stringify(b)),
          ),
        }),
      );
    },
  };
}
