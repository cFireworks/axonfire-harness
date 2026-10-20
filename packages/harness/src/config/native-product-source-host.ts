import { BehaviorSubject } from "rxjs";
import { URI } from "vscode-uri";
import { createNativeProductSources } from "./native-product-sources.js";

/** Host boundaries, not recovered login/REST/bootstrap services. No installed account is read. */
export type NativeProductSourceOptions = {
  authenticationManager?: { currentSessionSubject: any };
  restOperations?: { get(...args: any[]): Promise<any> };
  workspace?: any;
  runtime?: Record<string, any>;
};
export function createNativeProductSourceHost(options: {
  runtime: any;
  productManager: any;
  productMerger: any;
  logger: any;
  watch?: boolean | undefined;
  sources?: NativeProductSourceOptions | undefined;
}) {
  let closed = false,
    started = false;
  const pending = new Set<Promise<any>>(),
    subscriptions = new Set<any>();
  const intervals = new Set<any>(),
    immediates = new Set<any>();
  const base = { ...options.runtime, ...options.sources?.runtime };
  const authentication = options.sources?.authenticationManager ?? {
    currentSessionSubject: new BehaviorSubject(undefined),
  };
  const subject = authentication.currentSessionSubject;
  const session = new Proxy(subject, {
    get(target, key) {
      if (key === "subscribe")
        return (...args: any[]) => {
          const sub = target.subscribe(...args);
          subscriptions.add(sub);
          return sub;
        };
      const value = Reflect.get(target, key);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const restOperations = options.sources?.restOperations ?? {
    async get() {
      throw Error("Enterprise REST requires an explicit host adapter");
    },
  };
  const runtime = {
    ...base,
    dependencies: {
      ...base.dependencies,
      productManager: options.productManager,
    },
    setInterval(callback: () => void, ms: number) {
      const h = (base.setInterval ?? setInterval)(() => {
        if (!closed) callback();
      }, ms);
      intervals.add(h);
      return h;
    },
    clearInterval(h: any) {
      intervals.delete(h);
      (base.clearInterval ?? clearInterval)(h);
    },
    setImmediate(callback: () => void) {
      const h = (base.setImmediate ?? setImmediate)(() => {
        immediates.delete(h);
        if (!closed) callback();
      });
      immediates.add(h);
      return h;
    },
    queueMicrotask(callback: () => void) {
      (base.queueMicrotask ?? queueMicrotask)(() => {
        if (!closed) callback();
      });
    },
  };
  const classes = createNativeProductSources(runtime);
  const diskCache = new classes.PolicyDiskCacheImpl();
  const policy = Object.assign(
    new classes.CliEnterpriseCustomModelPolicyServiceImpl(),
    {
      logger: options.logger,
      productManager: options.productManager,
      authenticationManager: {
        ...authentication,
        currentSessionSubject: session,
      },
      restOperations,
      diskCache,
    },
  );
  for (const name of ["getPolicy", "refresh", "writeDisk"]) {
    const native = policy[name].bind(policy);
    policy[name] = (...args: any[]) => observe(native(...args));
  }
  const models = Object.assign(new classes.ModelsProductProvider(), {
    logger: options.logger,
    authenticationManager: {
      ...authentication,
      currentSessionSubject: session,
    },
    restOperations,
  });
  const workspace = options.sources?.workspace ?? {
    get workspaceFolders() {
      return [{ uri: URI.file(base.getWorkDir()) }];
    },
  };
  const customModels = Object.assign(
    new classes.CustomModelsProductProvider(),
    {
      logger: options.logger,
      fs: base.fs,
      workspace,
      productMerger: options.productMerger,
    },
  );
  // The embedding host can disable all file watching. Keep the provider's parsing intact.
  if (options.watch === false) customModels.watchFile = () => undefined;
  const providers = [
    new classes.CustomCommandsProductProvider(),
    new classes.CustomAgentsProductProvider(),
    models,
    customModels,
    new classes.AgentModelResolverProvider(),
    new classes.AvailableModelsFilterProvider(),
    Object.assign(new classes.EnterpriseCustomModelPolicyFilterProvider(), {
      policyService: policy,
      productManager: options.productManager,
    }),
    new classes.CraftToCliAgentModelsSyncProvider(),
  ].map((provider) => Object.assign(provider, { logger: options.logger }));
  function observe<T>(p: Promise<T>): Promise<T> {
    pending.add(p);
    void p.then(
      () => pending.delete(p),
      () => pending.delete(p),
    );
    return p;
  }
  async function drain() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  return {
    classes,
    providers,
    policy,
    diskCache,
    models,
    customModels,
    authentication,
    start() {
      if (closed) throw Error("Product source host is closed");
      if (started) return;
      started = true;
      models.init();
      customModels.init();
      policy.init();
    },
    flush: drain,
    async close() {
      closed = true;
      for (const sub of subscriptions) sub.unsubscribe();
      subscriptions.clear();
      policy.dispose();
      customModels.dispose();
      for (const h of intervals) runtime.clearInterval(h);
      for (const h of immediates) (base.clearImmediate ?? clearImmediate)(h);
      immediates.clear();
      await drain();
      policy.dispose();
      customModels.dispose();
      if (!options.sources?.authenticationManager) subject.complete();
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return intervals.size + immediates.size + subscriptions.size;
    },
  };
}
