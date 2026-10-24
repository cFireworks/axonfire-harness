import { createNativeWorkbuddyLocalStorage } from "../../src/config/native-workbuddy-local-storage.js";
import assert from "node:assert/strict";
import { createServer, Agent } from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { createNativeDesktopAuthentication } from "../../src/auth/native-desktop-authentication.js";
import { createNativeDesktopFileAuthentication } from "../../src/auth/native-desktop-file-authentication.js";
import { createNativeDesktopCustomToken } from "../../src/auth/native-desktop-custom-token.js";
import { createNativeWorkbuddyAuthBindings } from "../../src/auth/native-workbuddy-auth-bindings.js";
import { createNativeDesktopClientProduct } from "../../src/config/native-desktop-client-product.js";
import { withOwnedDesktopAuthentication } from "./desktop-auth-scenarios.js";
import { createNativeDesktopProductManager } from "../../src/config/native-desktop-product-manager.js";
import { createNativeProductExperimentManager } from "../../src/config/native-product-experiment-manager.js";
import { createNativeCloudProduct } from "../../src/config/native-cloud-product.js";
import { createNativeDesktopRest } from "../../src/http/native-desktop-rest.js";
import { createNativeDesktopProductInterceptors } from "../../src/http/native-desktop-product-interceptors.js";
import { withOwnedDesktopProduct } from "./desktop-product-scenarios.js";
type Factory = (runtime?: any) => any;
const tick = () => new Promise<void>((r) => setImmediate(r));
function fixture(factory: Factory) {
  let now = 1700000000000,
    uid: any = "owned";
  const timers: any[] = [],
    sleeps: number[] = [],
    logs: any[] = [],
    calls: any[] = [],
    cache = new Map();
  const api = factory({
    now: () => now,
    setTimeout: (callback: any, ms: number) => {
      timers.push(callback);
      sleeps.push(ms);
      return {};
    },
    productManager: { getEndpoint: () => "http://owned.invalid" },
  });
  const manager = new api.CloudProductManagerImpl();
  const logger = Object.fromEntries(
    ["setContext", "info", "warn", "error", "time", "timeEnd"].map((name) => [
      name,
      (...v: any[]) => logs.push([name, ...v]),
    ]),
  );
  Object.assign(manager, {
    logger,
    userinfoProvider: {
      provide: async () => (uid ? { userId: uid } : undefined),
    },
    localStorage: {
      get: async (key: string, fallback: any) => cache.get(key) ?? fallback,
      set: async (key: string, value: any) => {
        cache.set(key, value);
      },
    },
    restOperations: {
      get: async (...args: any[]) => {
        calls.push(args);
        return { data: { data: { models: [{ id: "remote" }] } } };
      },
    },
  });
  return {
    api,
    manager,
    timers,
    sleeps,
    logs,
    calls,
    cache,
    advance: (ms: number) => {
      now += ms;
    },
    setUid: (v: any) => {
      uid = v;
    },
    drain: async () => {
      for (let i = 0; i < 20 && manager.retrying; i++) {
        await tick();
        timers.shift()?.();
        await tick();
      }
      assert.equal(manager.retrying, false);
    },
  };
}
export const desktopCloudScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "request contract and user-keyed L1 TTL ignore URL changes until expiry",
    async (factory) => {
      const f = fixture(factory);
      f.manager.init();
      f.manager.gitInfoCollector = {
        collect: async () => ({
          repositories: [{ url: "https://owned.invalid/repo" }],
        }),
      };
      const first = await f.manager.fetch("/one");
      await tick();
      const second = await f.manager.fetch("/two");
      assert.equal(second, first);
      assert.equal(f.calls.length, 1);
      assert.deepEqual(f.calls[0], [
        "/one",
        {
          timeout: 5000,
          baseURL: "http://owned.invalid",
          headers: { Connection: "close" },
          params: { repos: ["https://owned.invalid/repo"] },
        },
      ]);
      f.advance(480000);
      await f.manager.fetch("/two");
      assert.equal(f.calls.length, 2);
      f.setUid(undefined);
      await f.manager.fetch("/anonymous");
      await f.manager.fetch("/anonymous");
      assert.equal(f.calls.length, 4);
    },
  ],
  [
    "remote failure favors stale memory then stale disk without TTL checks",
    async (factory) => {
      const f = fixture(factory);
      await f.manager.fetch("/remote");
      await tick();
      f.advance(480001);
      f.manager.restOperations.get = async () => {
        throw Error("owned-offline");
      };
      assert.deepEqual(await f.manager.fetch("/remote"), {
        models: [{ id: "remote" }],
      });
      await f.drain();
      f.manager.reset();
      assert.deepEqual(await f.manager.fetch("/remote"), {
        models: [{ id: "remote" }],
      });
      await f.drain();
      f.cache.clear();
      f.manager.reset();
      assert.deepEqual(await f.manager.fetch("/remote"), {});
      await f.drain();
    },
  ],
  [
    "five exponential retries are coalesced and final diagnostics deduplicate",
    async (factory) => {
      const f = fixture(factory);
      f.manager.restOperations.get = async () => {
        throw Object.assign(Error("owned-failure"), {
          isAxiosError: true,
          response: {
            config: { headers: { "X-Request-ID": "owned-request" } },
            status: 503,
          },
        });
      };
      const first = f.manager.fetchWithRetry("/retry", "owned");
      await f.manager.fetchWithRetry("/ignored", "other");
      await f.drain();
      await first;
      assert.deepEqual(f.sleeps, [1000, 2000, 4000, 8000, 16000]);
      assert.equal(f.logs.filter((x) => x[0] === "error").length, 1);
      const again = f.manager.fetchWithRetry("/retry", "owned");
      await f.drain();
      await again;
      assert.equal(f.logs.filter((x) => x[0] === "error").length, 1);
      f.advance(60001);
      const later = f.manager.fetchWithRetry("/retry", "owned");
      await f.drain();
      await later;
      assert.equal(f.logs.filter((x) => x[0] === "error").length, 2);
    },
  ],
  [
    "disk LRU caps at twenty users and reset does not cancel a pending retry",
    async (factory) => {
      const f = fixture(factory);
      for (let i = 0; i < 22; i++)
        await f.manager.updateDiskCache("user-" + i, { i });
      let list = f.cache.get(f.api.CACHE_KEY);
      assert.equal(list.length, 20);
      assert.equal(list[0].userId, "user-2");
      await f.manager.readDiskCache("user-2");
      assert.equal(list.at(-1).userId, "user-2");
      const retry = f.manager.fetchWithRetry("/retry", "owned");
      await tick();
      f.manager.reset();
      assert.equal(f.manager.retrying, false);
      f.timers.shift()();
      await retry;
      assert.equal(f.manager.memCache.has("owned"), true);
      assert.ok(
        f.cache.get(f.api.CACHE_KEY).some((x: any) => x.userId === "owned"),
      );
      assert.equal(
        f.manager.briefError({ message: "x".repeat(600) }).length,
        503,
      );
      const circular: any = {};
      circular.self = circular;
      assert.equal(f.manager.safeStringify(circular), "[object Object]");
    },
  ],
  [
    "loopback cloud response flows through complete Desktop managers and logout restores local product",
    async (factory) => {
      await withOwnedDesktopProduct(
        createNativeDesktopProductManager,
        async ({
          api: productApi,
          manager,
          coordinatorApi,
          logger,
          env,
          root,
        }: any) => {
          let appApi: any, coordinator: any, authReference: any;
          await withOwnedDesktopAuthentication(
            (runtime) => {
              appApi = createNativeWorkbuddyAuthBindings({
                ...runtime,
                process: { env },
                productConfig: productApi.productConfig,
                getCoordinator: () => coordinator,
                getAuthenticationManager: () => authReference,
              });
              return {
                ...appApi.authenticationApi,
                AuthenticationManagerImpl:
                  appApi.WorkbuddyAuthenticationManager,
              };
            },
            async (authFixture) => {
              const requests: any[] = [];
              const server = createServer((req, res) => {
                requests.push({
                  method: req.method,
                  url: req.url,
                  connection: req.headers.connection,
                  authorization: req.headers.authorization,
                  user: req.headers["x-user-id"],
                });
                res.writeHead(req.url === "/owned-401" ? 401 : 200, {
                  "content-type": "application/json",
                });
                res.end(
                  JSON.stringify({
                    data: {
                      models: [{ id: "remote", contextWindow: 64000 }],
                      productFeatures: { Remote: true },
                      endpoint: "https://must-not-replace.invalid",
                      authentication: { id: "must-not-replace" },
                    },
                  }),
                );
              });
              await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
              const address = server.address();
              assert.ok(address && typeof address !== "string");
              const endpoint = `http://127.0.0.1:${address.port}`;
              const httpAgent = new Agent({ keepAlive: false });
              const { DefaultRestOperationsFactory } =
                createNativeDesktopRest();
              const restFactory: any = new DefaultRestOperationsFactory();
              restFactory.clientConfig = {
                baseURL: endpoint,
                proxy: false,
                httpAgent,
                timeout: 5000,
              };
              const transport = restFactory.create();
              const auth = (authReference = authFixture.manager);
              auth.productManager = manager;
              auth.productEnvService = Object.assign(
                new appApi.WorkbuddyProductEnvService(),
                { productManager: manager, logger },
              );
              const fileApi = createNativeDesktopFileAuthentication(),
                file = Object.assign(new fileApi.FileAuthenticationStorage(), {
                  logger,
                  filePathService: { sharedDataPath: root },
                  productManager: manager,
                });
              fileApi.setWorkbuddyAuthenticationConfigurationProvider(
                productApi.getWorkbuddyAuthenticationConfiguration,
              );
              env.ACC_USER_ID = "owned";
              const customApi: any = createNativeDesktopCustomToken({
                  process: { env },
                }),
                customStorage = Object.assign(
                  new customApi.CustomTokenAuthenticationStorageImpl(),
                  { logger, productManager: manager },
                ),
                provider = Object.assign(
                  new customApi.CustomTokenAuthenticationProvider(),
                  {
                    productManager: manager,
                    customTokenAuthenticationStorage: customStorage,
                  },
                );
              auth.authenticationStorages = [
                Object.assign(
                  new appApi.WorkbuddyBootstrapAuthenticationStorage(),
                  { fileAuthenticationStorage: file },
                ),
                file,
                customStorage,
              ];
              auth.authenticationProvider = { get: () => [provider] };
              let session: any;
              const policies = createNativeDesktopProductInterceptors({
                env: {},
                productManager: manager,
              });
              const endpointPolicy: any =
                new policies.ProductEndpointHttpInterceptor();
              endpointPolicy.restOperations = transport;
              endpointPolicy.initialize();
              const authPolicy = new policies.AuthenticationHttpInterceptor();
              Object.assign(authPolicy, {
                restOperations: transport,
                authenticationManager: auth,
                productManager: manager,
                logger,
                notifier: { warn: logger.warn },
              });
              authPolicy.initialize();
              const localStorageApi: any = createNativeWorkbuddyLocalStorage({
                process: { env },
                logger,
                productConfig: coordinatorApi.productConfig,
              });
              const localStorage =
                new localStorageApi.WorkbuddyFileLocalStorage();
              localStorage.init();
              manager.localStorage = localStorage;
              const api = factory({ productManager: manager });
              const cloud = new api.CloudProductManagerImpl();
              const userinfo = new appApi.WorkbuddyUserinfoProvider();
              userinfo.authenticationManager = auth;
              Object.assign(cloud, {
                logger: { ...logger, time() {}, timeEnd() {} },
                localStorage: manager.localStorage,
                userinfoProvider: userinfo,
                restOperations: transport,
              });
              const { WorkbuddyProductExperimentManager } =
                createNativeProductExperimentManager();
              const experiment = new WorkbuddyProductExperimentManager();
              Object.assign(experiment, {
                logger,
                productManager: manager,
                authenticationManager: auth,
              });
              coordinator =
                new coordinatorApi.WorkbuddyAuthProductCoordinator();
              Object.assign(coordinator, {
                logger,
                productManager: manager,
                productMerger: manager.productMerger,
                authenticationManager: auth,
                cloudProductManager: cloud,
                experimentManager: experiment,
              });
              appApi.setWorkbuddyAuthSessionSyncer((session: any) =>
                coordinator.syncResolvedProduct(session),
              );
              try {
                fs.writeFileSync(
                  path.join(root, "product.json"),
                  JSON.stringify({
                    endpoint,
                    config: { url: "/owned-cloud" },
                    models: [{ id: "local", contextWindow: 32000 }],
                    productFeatures: { Local: true },
                    authentication: {
                      id: "owned-auth",
                      type: customApi.AuthenticationType.CUSTOM_TOKEN,
                      attributes: {
                        token: "owned-token",
                        externalDomain: "owned.invalid",
                      },
                    },
                  }),
                );
                const clientApi = createNativeDesktopClientProduct({
                  process: { env },
                  dirname: root,
                });
                const client = Object.assign(
                  new clientApi.ClientProductProvider(),
                  { fs, configBasePath: root, logger },
                );
                manager.productProviderProvider.sort = async () => [client];
                await manager.sync();
                const persisted = authFixture.session();
                persisted.auth.domain = "owned.invalid";
                await file.store(persisted, undefined);
                const sessionPath = await file.getAuthSavePath();
                auth.productEnvService.init();
                await auth.doInit();
                await auth.initialized;
                session = auth.currentSessionSubject.getValue();
                assert.equal(session.account.uid, "owned");
                coordinator.init();
                await coordinator.refreshRemoteProduct(
                  { force: true },
                  session,
                );
                await tick();
                assert.equal(requests.length, 1);
                assert.deepEqual(requests[0], {
                  method: "GET",
                  url: "/owned-cloud",
                  connection: "close",
                  authorization: "Bearer owned-token",
                  user: "owned",
                });
                assert.equal(
                  manager.getCurrentConfiguration().models[0].id,
                  "remote",
                );
                assert.equal(
                  await file.getAuthSavePath(),
                  sessionPath,
                  "remote overlay must not move the authentication file",
                );
                const reopenedStorage =
                  new localStorageApi.WorkbuddyFileLocalStorage();
                try {
                  const reopenedCloud = new api.CloudProductManagerImpl();
                  reopenedCloud.localStorage = reopenedStorage;
                  assert.equal(
                    (await reopenedCloud.readDiskCache("owned")).models[0].id,
                    "remote",
                  );
                  assert.ok(
                    reopenedStorage.getSync(
                      productApi.ProductManagerImpl.getCacheKey(),
                    ),
                  );
                } finally {
                  reopenedStorage.emitter.dispose();
                }
                let snapshot = JSON.parse(env.ACC_PRODUCT_CONFIG_V3);
                assert.equal(snapshot.models[0].id, "remote");
                assert.equal(snapshot.endpoint, endpoint);
                assert.equal(snapshot.authentication.id, "owned-auth");
                await coordinator.refreshRemoteProduct(
                  { force: true },
                  session,
                );
                assert.equal(
                  requests.length,
                  1,
                  "coordinator force retains original cloud cache semantics",
                );
                cloud.reset();
                await coordinator.refreshRemoteProduct(
                  { force: true },
                  session,
                );
                assert.equal(requests.length, 2);
                await auth.logout();
                assert.equal(await file.restore(), undefined);
                assert.ok(
                  fs.existsSync((await file.getAuthSavePath()) + ".logged-out"),
                );
                await tick();
                await tick();
                snapshot = JSON.parse(env.ACC_PRODUCT_CONFIG_V3);
                assert.equal(snapshot.models[0].id, "local");
                assert.equal(cloud.memCache.size, 0);
                assert.equal(
                  manager.getCurrentConfiguration().models[0].id,
                  "local",
                );
                await auth.login({});
                assert.equal(
                  auth.currentSessionSubject.getValue().account.uid,
                  "owned",
                );
                assert.equal(
                  fs.existsSync((await file.getAuthSavePath()) + ".logged-out"),
                  false,
                );
                assert.equal(
                  JSON.parse(
                    fs.readFileSync(await file.getAuthSavePath(), "utf8"),
                  ).account.uid,
                  "owned",
                );
                const deadline = Date.now() + 3000;
                while (
                  JSON.parse(env.ACC_PRODUCT_CONFIG_V3).models[0].id !==
                    "remote" &&
                  Date.now() < deadline
                )
                  await new Promise((r) => setTimeout(r, 10));
                await coordinator.waitRemoteReady();
                assert.equal(
                  JSON.parse(env.ACC_PRODUCT_CONFIG_V3).models[0].id,
                  "remote",
                );
                await assert.rejects(transport.get("/owned-401"));
                await tick();
                await auth.sessionPersistenceTail;
                await tick();
                await tick();
                assert.equal(auth.currentSessionSubject.getValue(), undefined);
                assert.equal(
                  JSON.parse(env.ACC_PRODUCT_CONFIG_V3).models[0].id,
                  "local",
                );
                assert.equal(cloud.memCache.size, 0);
              } finally {
                await experiment.clear();
                await auth.sessionPersistenceTail;
                await file.dispose();
                customStorage.storeSessionSubject.complete();
                auth.currentSessionSubject.complete();
                manager.configuration.complete();
                localStorage.emitter.dispose();
                httpAgent.destroy();
                server.closeAllConnections();
                await new Promise<void>((r, j) =>
                  server.close((e) => (e ? j(e) : r())),
                );
              }
            },
          );
        },
      );
    },
  ],
];
