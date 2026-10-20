import { BehaviorSubject } from "rxjs";
import { createNativeProductEnvironment } from "../../src/config/native-product-environment.js";
export function productEnvironmentFixture(
  factory = createNativeProductEnvironment,
  spec: any = {},
) {
  const env: any = { ...spec.env },
    settings: any = { ...spec.settings };
  const calls: any[] = [],
    listeners: any[] = [],
    files = new Map<string, string>();
  const attributes = {
    internalDomain: ["internal.owned", "*.internal.owned"],
    iOADomain: "ioa.owned",
    cloudHostedDomain: "cloud.owned",
    externalDomain: "external.owned",
  };
  const current =
    spec.current === null
      ? undefined
      : (spec.current ?? {
          endpoint: "http://default.owned",
          stagingEndpoint: "http://staging.owned",
          authentication: { id: "owned", attributes },
        });
  files.set(
    "/resources/product.json",
    JSON.stringify(
      spec.base ?? { authentication: { id: "owned", attributes } },
    ),
  );
  for (const [name, value] of Object.entries(spec.files ?? {}))
    files.set(name, typeof value === "string" ? value : JSON.stringify(value));
  let now = 100000;
  const authentication = {
    currentSessionSubject: new BehaviorSubject(spec.session),
  };
  const productManager: any = {
    configuration: new BehaviorSubject(current),
    getCurrentConfiguration() {
      return productManager.configuration.getValue();
    },
    async waitConfiguration() {
      return productManager.configuration.getValue() ?? {};
    },
    async sync() {
      calls.push(["sync", { ...env }]);
      if (spec.syncError) throw Error("owned sync failure");
    },
  };
  const settingsManager = {
    async get(key: string) {
      calls.push(["get", key]);
      return settings[key];
    },
    onDidChange(callback: any) {
      listeners.push(callback);
      return {
        dispose() {
          listeners.splice(listeners.indexOf(callback), 1);
        },
      };
    },
  };
  const fs = {
    readFileSync(name: string) {
      calls.push(["read", name]);
      if (!files.has(name)) throw Error("owned missing: " + name);
      return files.get(name)!;
    },
    existsSync(name: string) {
      calls.push(["exists", name]);
      return files.has(name);
    },
  };
  const classes = factory({
    env,
    platform: spec.platform ?? "darwin",
    now: () => now,
    fs,
    getPlatformHomeDir: () => "/platform",
    pathUtils: {
      getHomeDir: () => "/state",
      resolveRootPathSync: (name: string) => "/resources/" + name,
    },
    dependencies: { productManager, authenticationManager: authentication },
  });
  const logger = Object.fromEntries(
    ["info", "warn", "setContext"].map((key) => [
      key,
      (...args: any[]) => calls.push([key, ...args.map(String)]),
    ]),
  );
  const service = Object.assign(new classes.ProductEnvServiceImpl(), {
    settingsManager,
    productManager,
    logger,
  });
  const internet = Object.assign(
    new classes.ClientInternetEnviromentProductProvider(),
    { settingsManager, logger, ...(spec.noFs ? {} : { fs }) },
  );
  const endpoint = Object.assign(
    new classes.SettingsEndpointProductProvider(),
    { settingsManager, logger },
  );
  return {
    classes,
    service,
    internet,
    endpoint,
    env,
    settings,
    calls,
    files,
    productManager,
    authentication,
    setNow(value: number) {
      now = value;
    },
    async fire() {
      await Promise.all(listeners.map((listener) => listener()));
    },
    snapshot(value: any) {
      return JSON.parse(
        JSON.stringify({
          value,
          env,
          calls,
          lastSwitchedEnv: service.lastSwitchedEnv,
          cached: [...internet.cachedProductConfigurations],
          endpointCache: endpoint.cachedConfig,
          lastConfig: endpoint.lastConfig,
          cachedEnv: endpoint.cachedEnv,
          cachedAt: endpoint.cachedAt,
        }),
      );
    },
    dispose() {
      productManager.configuration.complete();
      authentication.currentSessionSubject.complete();
    },
  };
}
