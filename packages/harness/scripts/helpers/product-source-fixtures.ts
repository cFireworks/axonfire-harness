import * as fs from "node:fs";
import { BehaviorSubject } from "rxjs";
import { URI } from "vscode-uri";
import { createNativeProductSources } from "../../src/config/native-product-sources.js";
import { productManagerFixture } from "./product-manager-fixtures.js";
export function productSourceFixture(
  options: any = {},
  factory: any = createNativeProductSources,
) {
  const events: any[] = [],
    timers = new Map<any, any>(),
    microtasks: (() => void)[] = [];
  let now = 1000,
    response = options.response,
    calls = 0;
  const authenticationManager = {
    currentSessionSubject: new BehaviorSubject(options.session),
  };
  const current = options.current ?? {
    endpoint: "https://owned.invalid/",
    productName: "WorkBuddy",
    models: [],
    agents: [],
    productFeatures: {
      EnableEnterpriseCustomModelPolicy: true,
      CustomModelsJSON: true,
      CustomModelIdPrefix: true,
    },
  };
  const productManager = {
    getCurrentConfiguration: () => current,
    async sync(force: boolean) {
      events.push(["sync", force]);
    },
  };
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((k) => [
      k,
      (...args: any[]) =>
        events.push([
          k,
          ...args.map((v) => (v instanceof Error ? v.message : v)),
        ]),
    ]),
  );
  const restOperations = {
    async get(...args: any[]) {
      calls++;
      events.push(["get", ...args]);
      if (response instanceof Error) throw response;
      return typeof response === "function" ? response(...args) : response;
    },
  };
  const runtime: any = {
    fs: options.fs ?? fs,
    env: options.env ?? {},
    getWorkDir: () => options.root ?? "/owned",
    getHomeDir: () => options.home ?? options.root ?? "/owned/home",
    platform: "darwin",
    now: () => now,
    dependencies: { productManager },
    setTimeout(callback: () => void, ms: number) {
      const h = { unref() {} };
      timers.set(h, { callback, ms });
      return h;
    },
    clearTimeout(h: any) {
      timers.delete(h);
    },
    setInterval(callback: () => void, ms: number) {
      const h = { unref() {} };
      timers.set(h, { callback, ms });
      return h;
    },
    clearInterval(h: any) {
      timers.delete(h);
    },
    setImmediate(callback: () => void) {
      microtasks.push(callback);
    },
    queueMicrotask(callback: () => void) {
      microtasks.push(callback);
    },
    ...options.runtime,
  };
  const classes = factory(runtime),
    merger = productManagerFixture().merger;
  const diskCache = new classes.PolicyDiskCacheImpl();
  const policy = Object.assign(
    new classes.CliEnterpriseCustomModelPolicyServiceImpl(),
    {
      authenticationManager,
      restOperations,
      productManager,
      logger,
      diskCache,
    },
  );
  const make = (name: string, extra: any = {}) =>
    Object.assign(new classes[name](), {
      logger,
      authenticationManager,
      restOperations,
      productManager,
      productMerger: merger,
      workspace: {
        workspaceFolders: [{ uri: URI.file(runtime.getWorkDir()) }],
      },
      fs: runtime.fs,
      policyService: policy,
      ...extra,
    });
  return {
    classes,
    make,
    runtime,
    current,
    policy,
    diskCache,
    logger,
    productManager,
    authenticationManager,
    timers,
    microtasks,
    events,
    input: { current, force: false },
    advance(ms: number) {
      now += ms;
    },
    setResponse(value: any) {
      response = value;
    },
    get calls() {
      return calls;
    },
  };
}
