import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { BehaviorSubject } from "rxjs";
import { createNativeProductRuntime } from "../../src/config/native-product-runtime.js";
type Factory = (runtime?: any) => any;
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function owned(factory: Factory, run: (state: any) => Promise<void>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-auth-product-"));
  fs.mkdirSync(path.join(root, "cli"));
  const base = {
    authentication: { id: "base", type: "owned", attributes: { base: 1 } },
    models: [{ id: "base-model" }],
    config: { disabled: true },
  };
  fs.writeFileSync(
    path.join(root, "cli", "product.json"),
    JSON.stringify(base),
  );
  const scopedProcess = Object.create(process);
  Object.defineProperty(scopedProcess, "resourcesPath", { value: root });
  scopedProcess.env = { WORKBUDDY_CONFIG_DIR: root };
  Object.defineProperty(scopedProcess, "platform", { value: "linux" });
  const logs: any[] = [],
    notifications: any[] = [],
    overlays: any[] = [];
  const api = factory({
    process: scopedProcess,
    assetsRoot: root,
    os: { ...os, homedir: () => root },
    console: { log() {}, warn() {} },
  });
  const coordinator = new api.WorkbuddyAuthProductCoordinator();
  const auth = new BehaviorSubject<any>(undefined),
    configuration = new BehaviorSubject<any>(base);
  const native = createNativeProductRuntime({
    env: {},
    getWorkDir: () => root,
    getHomeDir: () => root,
  });
  const strategy = new native.MergeProductMergeStrategy();
  Object.assign(coordinator, {
    logger: {
      setContext() {},
      info: (...v: any[]) => logs.push(v),
      warn: (...v: any[]) => logs.push(v),
    },
    authenticationManager: { currentSessionSubject: auth },
    productManager: {
      configuration,
      getLocalConfiguration: () => configuration.getValue(),
      getCurrentConfiguration: () => configuration.getValue(),
      getEndpoint: () => "https://owned.invalid",
      setResolvedOverlay: async (value: any) => overlays.push(value),
      waitConfiguration: async () => {},
      sync: async () => {},
    },
    productMerger: strategy,
    cloudProductManager: { fetch: async () => ({}), reset() {} },
    experimentManager: {
      getOverlay: () => undefined,
      waitReady: async () => {},
      clear: async () => {},
      refresh: async () => {},
    },
  });
  try {
    await run({
      api,
      coordinator,
      auth,
      configuration,
      base,
      root,
      env: scopedProcess.env,
      logs,
      overlays,
      notifications,
    });
  } finally {
    auth.complete();
    configuration.complete();
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const authProductCoordinatorScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "stable snapshot publication and signed URL rotation filtering",
    (f) =>
      owned(f, async ({ coordinator: c, env, notifications, logs }) => {
        c.onHostedCliProductSnapshotChanged((e: any) => notifications.push(e));
        const product = {
          downloadUrl: "https://owned.invalid/tool?version=1&sign=secret-a",
          apiToken: "private-token",
          config: { disabled: true },
        };
        await c.publishResolvedSnapshot(undefined, product);
        await tick();
        assert.equal(notifications.length, 1);
        assert.ok(env.ACC_PRODUCT_CONFIG_V3.includes("secret-a"));
        await c.publishResolvedSnapshot(undefined, product);
        assert.equal(notifications.length, 1);
        await c.publishResolvedSnapshot(undefined, {
          ...product,
          downloadUrl: "https://owned.invalid/tool?version=1&sign=secret-b",
        });
        assert.equal(notifications.length, 1);
        assert.ok(env.ACC_PRODUCT_CONFIG_V3.includes("secret-b"));
        await c.publishResolvedSnapshot(undefined, {
          ...product,
          downloadUrl: "https://owned.invalid/tool?version=2&sign=secret-c",
        });
        assert.equal(notifications.length, 2);
        assert.doesNotMatch(JSON.stringify(logs), /private-token|secret-[abc]/);
      }),
  ],
  [
    "subscriber disposal and original synchronous/asynchronous failure boundaries",
    (f) =>
      owned(f, async ({ coordinator: c }) => {
        let calls = 0;
        const subscription = c.onHostedCliProductSnapshotChanged(() => calls++);
        subscription.dispose();
        await c.publishResolvedSnapshot(undefined, { name: "one" });
        assert.equal(calls, 0);
        const fail = c.onHostedCliProductSnapshotChanged(async () => {
          throw Error("async-owned");
        });
        await c.publishResolvedSnapshot(undefined, { name: "two" });
        await tick();
        assert.equal(c.lastNotifiedHostedCliSnapshotKey, undefined);
        fail.dispose();
        c.onHostedCliProductSnapshotChanged(() => {
          throw Error("sync-owned");
        });
        await assert.rejects(
          c.publishResolvedSnapshot(undefined, { name: "three" }),
          /sync-owned/,
        );
      }),
  ],
  [
    "product layers retain base auth identity, source attributes and remote model replacement",
    (f) =>
      owned(f, async ({ api, root }) => {
        fs.writeFileSync(
          path.join(root, "cli", "product.external.json"),
          JSON.stringify({
            authentication: { id: "ignored" },
            productFeatures: { env: true },
            models: [{ id: "env-model" }],
          }),
        );
        const product = {
          networkEnvironment: "external",
          authentication: { id: "source", attributes: { source: 2 } },
          productFeatures: { source: true },
          models: [{ id: "remote-model" }],
        };
        const merged =
          api.productConfig.buildWorkbuddyResolvedProductConfiguration({
            product,
          });
        assert.equal(merged.authentication.id, "base");
        assert.deepEqual(merged.authentication.attributes, {
          base: 1,
          source: 2,
        });
        assert.deepEqual(
          merged.models.map((m: any) => m.id),
          ["base-model", "env-model", "remote-model"],
        );
        assert.deepEqual(
          api.productConfig.buildWorkbuddyResolvedProductConfiguration({
            product,
            remoteHasModels: true,
          }).models,
          [{ id: "remote-model" }],
        );
      }),
  ],
  [
    "Linux large snapshot file spill and subsequent inline publication",
    (f) =>
      owned(f, async ({ api, env }) => {
        const large = JSON.stringify({ value: "x".repeat(50000) });
        api.productConfig.assignAccProductConfigV3ToProcessEnv(large);
        assert.equal(env.ACC_PRODUCT_CONFIG_V3, undefined);
        assert.equal(
          fs.readFileSync(env.ACC_PRODUCT_CONFIG_PATH, "utf8"),
          large,
        );
        api.productConfig.assignAccProductConfigV3ToProcessEnv(
          '{"small":true}',
        );
        assert.equal(env.ACC_PRODUCT_CONFIG_V3, '{"small":true}');
        assert.equal(env.ACC_PRODUCT_CONFIG_PATH, undefined);
      }),
  ],
  [
    "remote refresh TTL, forced failure preservation and identity invalidation",
    (f) =>
      owned(f, async ({ coordinator: c, configuration, overlays }) => {
        const product = {
          endpoint: "https://owned.invalid",
          config: { disabled: false },
        };
        configuration.next(product);
        let fetches = 0;
        c.cloudProductManager.fetch = async () => {
          fetches++;
          if (fetches > 1) throw Error("owned failure");
          return {
            models: [{ id: "remote" }],
            endpoint: "https://must-be-ignored.invalid",
          };
        };
        const session = {
          account: { uid: "one" },
          auth: { domain: "owned.invalid" },
        };
        await c.refreshRemoteProductIfNeeded(session, product);
        assert.equal(fetches, 1);
        assert.equal(c.remoteProductOverlay.endpoint, undefined);
        await c.refreshRemoteProductIfNeeded(session, product);
        assert.equal(fetches, 1);
        const retained = c.remoteProductOverlay;
        await c.refreshRemoteProductIfNeeded(session, product, { force: true });
        assert.equal(c.remoteProductOverlay, retained);
        await c.refreshRemoteProductIfNeeded(
          { ...session, account: { uid: "two" } },
          product,
        );
        assert.equal(c.remoteProductOverlay, undefined);
        assert.ok(overlays.includes(undefined));
      }),
  ],
  [
    "agent smart merge retains local properties and takes remote model lists",
    (f) =>
      owned(f, async ({ coordinator: c }) => {
        const local = [
          { name: "a", instructions: "local", models: ["old"] },
          { name: "b" },
        ];
        assert.deepEqual(
          c.smartMergeAgents(local, [
            { name: "a", instructions: "remote", models: ["new"], extra: 1 },
            { name: "c" },
          ]),
          [
            { name: "a", instructions: "local", models: ["new"], extra: 1 },
            { name: "b" },
            { name: "c" },
          ],
        );
        assert.deepEqual(local[0]!.models, ["old"]);
      }),
  ],
  [
    "original initializer publishes configuration updates and clears logout overlay",
    (f) =>
      owned(f, async ({ coordinator: c, configuration, auth, overlays }) => {
        c.init();
        await tick();
        assert.ok(c.lastPublishedEnv);
        configuration.next({ name: "changed" });
        await tick();
        assert.equal(JSON.parse(c.lastPublishedEnv).name, "changed");
        c.remoteProductOverlay = { models: [{ id: "remote" }] };
        auth.next(undefined);
        await tick();
        assert.equal(c.remoteProductOverlay, undefined);
        assert.ok(overlays.includes(undefined));
      }),
  ],
  [
    "development endpoint override is ignored in production and applied in development",
    (f) =>
      owned(f, async ({ api, root, env }) => {
        fs.writeFileSync(
          path.join(root, "dev-env.json"),
          JSON.stringify({ env: "staging" }),
        );
        assert.equal(api.devEnvironment.resolveEndpointOverride(), undefined);
        env.NODE_ENV = "development";
        const product =
          api.productConfig.buildWorkbuddyResolvedProductConfiguration({
            product: { endpoint: "https://owned.invalid" },
          });
        assert.equal(product.endpoint, "https://staging.codebuddy.cn");
        assert.equal(product.authentication.id, "base-dev");
      }),
  ],
];
