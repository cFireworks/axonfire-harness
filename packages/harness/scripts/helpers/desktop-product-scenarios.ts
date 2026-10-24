import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createNativeDesktopProductMerger } from "../../src/config/native-desktop-product-merger.js";
import { createNativeProductExperimentManager } from "../../src/config/native-product-experiment-manager.js";
import { createNativeAuthProductCoordinator } from "../../src/config/native-auth-product-coordinator.js";
import { BehaviorSubject } from "rxjs";
type Factory = (runtime?: any) => any;
function provider(name: string, value: any, volatile = false) {
  return {
    constructor: { name },
    volatile,
    provide: async () => structuredClone(value),
  };
}
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-desktop-product-"));
  fs.mkdirSync(path.join(root, "cli"));
  fs.writeFileSync(
    path.join(root, "cli", "product.json"),
    JSON.stringify({
      authentication: {
        id: "owned-auth",
        attributes: { externalDomain: "owned.invalid" },
      },
      config: { disabled: true },
    }),
  );
  const scopedProcess = Object.create(process);
  Object.defineProperty(scopedProcess, "resourcesPath", { value: root });
  scopedProcess.env = {
    WORKBUDDY_CONFIG_DIR: root,
    CLIENT_INFO_PRODUCT_VERSION: "owned-version",
  };
  const logs: any[] = [],
    logger = {
      info: (...v: any[]) => logs.push(v),
      warn: (...v: any[]) => logs.push(v),
      error: (...v: any[]) => logs.push(v),
      debug: (...v: any[]) => logs.push(v),
      setContext() {},
    };
  const runtime = {
    process: scopedProcess,
    assetsRoot: root,
    os: { ...os, homedir: () => root },
    console: { ...logger, log: logger.info },
    logger,
  };
  const coordinatorApi = createNativeAuthProductCoordinator(runtime);
  const api = factory({ ...runtime, coordinatorApi });
  const manager = new api.WorkbuddyProductManager();
  const merge = createNativeDesktopProductMerger();
  const cache = new Map(),
    writes: any[] = [],
    published: any[] = [];
  manager.productMerger = Object.assign(new merge.DefaultProductMerger(), {
    productMergeStrategies: [
      new merge.OverrideProductMergeStrategy(),
      new merge.MergeProductMergeStrategy(),
      new merge.SmartMergeProductMergeStrategy(),
      new merge.DeepSmartMergeProductMergeStrategy(),
      new merge.CommandsSmartMergeProductMergeStrategy(),
    ],
  });
  manager.localStorage = {
    getSync: (key: string) => cache.get(key),
    get: async (key: string) => cache.get(key),
    set: async (key: string, value: any) => {
      cache.set(key, value);
      writes.push(key);
    },
  };
  manager.productProviderProvider = { sort: async () => [] };
  const sub = manager.configuration.subscribe((v: any) => {
    if (v) published.push(v);
  });
  try {
    await run({
      api,
      manager,
      cache,
      writes,
      published,
      root,
      env: scopedProcess.env,
      coordinatorApi,
      logger,
      runtime,
    });
  } finally {
    sub.unsubscribe();
    if (manager.proxySyncThrottleTimer)
      clearTimeout(manager.proxySyncThrottleTimer);
    manager.onDidChangeEmitter.dispose();
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const desktopProductScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "original base cache compression, version keys and bootstrap environment precedence",
    (factory) =>
      owned(factory, async ({ api, manager, cache, env }: any) => {
        const key = api.ProductManagerImpl.getCacheKey();
        assert.equal(key, "CodeBuddy-Product-Cache:owned-version");
        cache.set(
          key,
          api.GzipUtils.compress(
            JSON.stringify({
              productConfigEnv: "OWNED_BOOTSTRAP",
              models: [{ id: "cached" }],
            }),
          ),
        );
        cache.set(
          api.ProductManagerImpl.endpointCacheKey,
          "https://owned.invalid///",
        );
        cache.set(api.ProductManagerImpl.envCacheKey, "old");
        env.OWNED_BOOTSTRAP = JSON.stringify({ networkEnvironment: "fresh" });
        manager.loadFromCache();
        assert.equal(manager.dataLevel, api.DataLevel.cache);
        assert.equal(manager.configuration.getValue().models[0].id, "cached");
        assert.equal(env.CODEBUDDY_INTERNET_ENVIRONMENT, "fresh");
        assert.equal(manager.getEndpoint(), "https://owned.invalid");
        manager._stableConfiguration = { stable: true };
        await manager.saveToCache();
        assert.deepEqual(JSON.parse(api.GzipUtils.decompress(cache.get(key))), {
          stable: true,
        });
      }),
  ],
  [
    "Desktop provider exclusion, reverse order and volatile-free stable cache",
    (factory) =>
      owned(factory, async ({ manager, api, cache }: any) => {
        let excluded = 0;
        const outside = provider("CloudProductProvider", {});
        outside.provide = async () => {
          excluded++;
          return {};
        };
        manager.productProviderProvider.sort = async () => [
          provider("VolatileOwned", { runtimeOnly: true }, true),
          provider("StableOwned", {
            endpoint: "https://owned.invalid",
            stable: true,
          }),
          outside,
        ];
        await manager.sync(true);
        assert.equal(excluded, 0);
        assert.equal(manager.getLocalConfiguration().runtimeOnly, true);
        assert.equal(manager.getCurrentConfiguration().stable, true);
        const cached = JSON.parse(
          api.GzipUtils.decompress(
            cache.get(api.ProductManagerImpl.getCacheKey()),
          ),
        );
        assert.equal(cached.runtimeOnly, undefined);
        assert.equal(cached.stable, true);
        for (const name of [
          "EnvProductProvider",
          "CustomModelsProductProvider",
          "ModelsProductProvider",
          "WorkspaceProductProvider",
          "AvailableModelsFilterProvider",
        ])
          assert.equal(
            manager.isExternallyOwnedProvider(provider(name, {})),
            true,
          );
      }),
  ],
  [
    "remote then experiment then enterprise and custom model precedence",
    (factory) =>
      owned(factory, async ({ manager }: any) => {
        manager.localConfiguration = {
          models: [{ id: "m", value: "local", nested: { local: true } }],
          productFeatures: { Local: true },
          modelPromotions: [{ id: "p", value: "local" }],
        };
        manager.resolvedOverlay = {
          models: [{ id: "m", value: "remote", nested: { remote: true } }],
          modelPromotions: [{ id: "p", value: "remote" }],
        };
        manager.experimentOverlay = {
          models: [
            { id: "m", value: "experiment", nested: { experiment: true } },
            { id: "unknown" },
          ],
          productFeatures: { Experiment: true },
        };
        manager.enterpriseModelsOverride = {
          models: [
            { id: "m", value: "enterprise", nested: { enterprise: true } },
            { id: "enterprise" },
          ],
        };
        manager.customModelsOverride = {
          models: [{ id: "m", value: "custom" }, { id: "custom" }],
        };
        await manager.publishResolvedConfiguration();
        const result = manager.getCurrentConfiguration();
        assert.equal(
          result.models.find((m: any) => m.id === "m").value,
          "custom",
        );
        assert.ok(result.models.some((m: any) => m.id === "enterprise"));
        assert.ok(result.models.some((m: any) => m.id === "custom"));
        assert.ok(!result.models.some((m: any) => m.id === "unknown"));
        assert.deepEqual(result.productFeatures, {
          Local: true,
          Experiment: true,
        });
        assert.equal(result.modelPromotions[0].value, "remote");
      }),
  ],
  [
    "model availability and original feature filters retain protected prompt text",
    (factory) =>
      owned(factory, async ({ manager, published, writes }: any) => {
        manager.localConfiguration = {
          models: [{ id: "keep" }, { id: "drop" }],
          availableModels: ["keep"],
          productFeatures: {
            DisableTerminalVariable: true,
            DisableMultimodalGeneration: true,
          },
          variables: [{ type: "terminal" }, { type: "file" }],
          agents: [{ name: "default", tags: ["default"] }, { name: "other" }],
          disabledBuiltinSkills: ["disabled"],
          skills: [
            { source: "bundled", baseDirectory: "/owned/disabled/" },
            { source: "user", baseDirectory: "/owned/disabled" },
          ],
        };
        await manager.publishResolvedConfiguration();
        const result = manager.getCurrentConfiguration();
        assert.deepEqual(result.models, [{ id: "keep" }]);
        assert.deepEqual(result.variables, [{ type: "file" }]);
        assert.equal(result.skills.length, 1);
        assert.match(
          result.agents[0].appendInstructions,
          /<capability_constraints>/,
        );
        assert.equal(result.agents[1].appendInstructions, undefined);
        // Republishing the resolved configuration must remain idempotent after filters.
        manager.localConfiguration = structuredClone(result);
        const count = published.length,
          writeCount = writes.length;
        await manager.publishResolvedConfiguration();
        assert.equal(published.length, count);
        assert.equal(writes.length, writeCount);
      }),
  ],
  [
    "environment selection from auth file and logout marker",
    (factory) =>
      owned(factory, async ({ manager, api, root }: any) => {
        const authPath = path.join(
          root,
          process.platform === "darwin"
            ? "Library/Application Support/CodeBuddyExtension/Data/Public/auth"
            : ".local/share/CodeBuddyExtension/Data/Public/auth",
          "owned-auth.info",
        );
        fs.mkdirSync(path.dirname(authPath), { recursive: true });
        fs.writeFileSync(
          authPath,
          JSON.stringify({ auth: { domain: "owned.invalid" } }),
        );
        assert.equal(
          api.productConfig.resolveWorkbuddyProductEnvironmentFromSessionFile(),
          "external",
        );
        fs.writeFileSync(authPath + ".logged-out", "");
        assert.equal(
          api.productConfig.resolveWorkbuddyProductEnvironmentFromSessionFile(),
          undefined,
        );
        manager.localConfiguration = {
          networkEnvironment: "external",
          productFeatures: { Local: true },
        };
        fs.writeFileSync(
          path.join(root, "cli", "product.external.json"),
          JSON.stringify({ productFeatures: { Environment: true } }),
        );
        await manager.publishResolvedConfiguration();
        assert.equal(
          manager.getCurrentConfiguration().productFeatures.Environment,
          true,
        );
      }),
  ],
  [
    "complete Desktop manager, experiment manager and coordinator publish and clear through original subscriptions",
    (factory) =>
      owned(factory, async ({ manager, coordinatorApi, logger, env }: any) => {
        const session = { account: { uid: "owned" } },
          auth = { currentSessionSubject: new BehaviorSubject<any>(session) };
        manager.productProviderProvider.sort = async () => [
          provider("OwnedBase", {
            models: [{ id: "m", contextWindow: 32000 }],
            productFeatures: { Base: true },
            productFeatureExperiment: { enabled: true },
          }),
        ];
        await manager.sync();
        const { WorkbuddyProductExperimentManager } =
          createNativeProductExperimentManager();
        const experiment = new WorkbuddyProductExperimentManager();
        Object.assign(experiment, {
          logger,
          productManager: manager,
          authenticationManager: auth,
          restOperations: {
            post: async () => ({
              data: {
                data: {
                  exp_id: "owned",
                  value: {
                    models: [{ id: "m", contextWindow: 64000 }],
                    productFeatures: { Experiment: true },
                  },
                },
              },
            }),
          },
        });
        manager.currentEndpoint = "http://owned.invalid";
        const coordinator =
          new coordinatorApi.WorkbuddyAuthProductCoordinator();
        Object.assign(coordinator, {
          logger,
          productManager: manager,
          authenticationManager: auth,
          experimentManager: experiment,
          cloudProductManager: { reset() {} },
          productMerger: manager.productMerger,
        });
        coordinator.init();
        await experiment.refresh(
          manager.getCurrentConfiguration(),
          session,
          undefined,
        );
        await new Promise((r) => setImmediate(r));
        assert.equal(
          manager.getCurrentConfiguration().models[0].contextWindow,
          64000,
        );
        assert.equal(
          JSON.parse(env.ACC_PRODUCT_CONFIG_V3).models[0].contextWindow,
          64000,
        );
        await experiment.clear("owned-stop");
        await new Promise((r) => setImmediate(r));
        assert.equal(
          JSON.parse(env.ACC_PRODUCT_CONFIG_V3).models[0].contextWindow,
          32000,
        );
        auth.currentSessionSubject.complete();
        manager.configuration.complete();
      }),
  ],
];

export { owned as withOwnedDesktopProduct };
