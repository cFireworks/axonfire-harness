import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createNativeAuthProductCoordinator } from "../../src/config/native-auth-product-coordinator.js";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { BehaviorSubject } from "rxjs";
type Factory = (runtime?: any) => any;
const gate = {
  productFeatureExperiment: {
    enabled: true,
    pollingEnabled: true,
    pollingIntervalMs: 60000,
  },
};
const defer = () => {
  let resolve!: (v: any) => void;
  const promise = new Promise<any>((r) => (resolve = r));
  return { promise, resolve };
};
function owned(factory: Factory) {
  const timers: any[] = [],
    cleared: any[] = [],
    writes: any[] = [],
    logs: any[] = [],
    calls: any[] = [];
  const api = factory({
    setInterval: (callback: any, ms: number) => {
      const timer = {
        callback,
        ms,
        unrefs: 0,
        unref() {
          this.unrefs++;
        },
      };
      timers.push(timer);
      return timer;
    },
    clearInterval: (timer: any) => cleared.push(timer),
  });
  const manager = new api.WorkbuddyProductExperimentManager();
  const session = { account: { uid: "owned" } };
  const auth = new BehaviorSubject<any>(session);
  Object.assign(manager, {
    logger: {
      setContext: (v: any) => logs.push(v),
      info: (v: any) => logs.push(v),
      warn: (v: any) => logs.push(v),
    },
    authenticationManager: { currentSessionSubject: auth },
    productManager: {
      waitConfiguration: async () => gate,
      getEndpoint: () => "http://owned.invalid",
      setExperimentOverlay: async (v: any) => {
        writes.push(v);
      },
    },
    restOperations: {
      post: async (...args: any[]) => {
        calls.push(args);
        return {
          data: {
            data: {
              exp_id: "owned-exp",
              value: { productFeatures: { Owned: true } },
            },
          },
        };
      },
    },
  });
  return { api, manager, session, auth, timers, cleared, writes, logs, calls };
}
export const productExperimentScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "strict gate, interval normalization and empty experiment identifiers",
    async (factory) => {
      const { api, manager, writes, calls } = owned(factory);
      manager.init();
      assert.deepEqual(
        manager.normalizeOptions({
          enabled: 1,
          pollingEnabled: "true",
          pollingIntervalMs: 1,
        }),
        { enabled: false, pollingEnabled: false, pollingIntervalMs: 60000 },
      );
      for (const n of [NaN, Infinity, undefined, "1"])
        assert.equal(
          manager.normalizeOptions({ pollingIntervalMs: n }).pollingIntervalMs,
          900000,
        );
      assert.equal(
        manager.normalizeOptions({ pollingIntervalMs: 120000 })
          .pollingIntervalMs,
        120000,
      );
      for (const exp_id of [undefined, null, "", "  "])
        assert.equal(api.hasExperimentId({ exp_id }), false);
      for (const exp_id of [0, false, "x"])
        assert.equal(api.hasExperimentId({ exp_id }), true);
      await manager.refresh({}, undefined);
      assert.equal(calls.length, 0);
      assert.equal(writes.length, 0);
    },
  ],
  [
    "request contract, overlay publication and timer reuse/restart",
    async (factory) => {
      const { manager, session, calls, writes, timers, cleared } =
        owned(factory);
      manager.gitInfoCollector = {
        collect: async () => ({
          repositories: [{ url: "https://owned.invalid/repo" }],
        }),
      };
      await manager.refresh(gate, session);
      assert.deepEqual(calls[0], [
        "/v2/feature-flag/api/product-config",
        undefined,
        {
          timeout: 5000,
          baseURL: "http://owned.invalid",
          params: { repos: ["https://owned.invalid/repo"] },
        },
      ]);
      assert.deepEqual(manager.getOverlay(), {
        productFeatures: { Owned: true },
      });
      assert.equal(writes.length, 1);
      assert.equal(timers[0].unrefs, 1);
      await manager.refresh(gate, session, { force: true });
      assert.equal(timers.length, 1);
      await manager.refresh(
        {
          productFeatureExperiment: {
            ...gate.productFeatureExperiment,
            pollingIntervalMs: 120000,
          },
        },
        session,
      );
      assert.equal(timers.length, 2);
      assert.equal(cleared[0], timers[0]);
      await manager.clear("owned-close");
      assert.equal(manager.getOverlay(), undefined);
      assert.equal(writes.at(-1), undefined);
      assert.equal(cleared.length, 2);
    },
  ],
  [
    "missing experiment ID clears while transport failure retains prior overlay",
    async (factory) => {
      const { manager, session, writes, timers } = owned(factory);
      await manager.refresh(gate, session);
      manager.restOperations.post = async () => {
        throw Error("owned-network");
      };
      await manager.refresh(gate, session);
      assert.deepEqual(manager.getOverlay(), {
        productFeatures: { Owned: true },
      });
      assert.equal(writes.length, 1);
      manager.restOperations.post = async () => ({
        data: { data: { value: { productFeatures: { Unassigned: true } } } },
      });
      await manager.refresh(gate, session);
      assert.equal(manager.getOverlay(), undefined);
      assert.equal(writes.at(-1), undefined);
      assert.equal(timers.length, 1);
      await manager.clear();
    },
  ],
  [
    "clear and identity changes invalidate in-flight responses",
    async (factory) => {
      for (const mode of ["clear", "identity"]) {
        const { manager, session, auth, writes, timers } = owned(factory),
          started = defer(),
          reply = defer();
        manager.restOperations.post = async () => {
          started.resolve(true);
          return reply.promise;
        };
        const pending = manager.refresh(gate, session);
        await started.promise;
        if (mode === "clear") await manager.clear("logout");
        else auth.next({ account: { uid: "other" } });
        reply.resolve({
          data: {
            data: {
              exp_id: "late",
              value: { productFeatures: { Late: true } },
            },
          },
        });
        await pending;
        assert.equal(manager.getOverlay(), undefined);
        assert.equal(writes.length, 0);
        assert.equal(timers.length, 0);
      }
    },
  ],
  [
    "identity change during publication rolls back and refresh queue remains serialized",
    async (factory) => {
      const s = owned(factory);
      let active = 0,
        max = 0;
      const reply = defer(),
        started = defer();
      s.manager.restOperations.post = async () => {
        active++;
        max = Math.max(max, active);
        started.resolve(true);
        await reply.promise;
        active--;
        return {
          data: {
            data: { exp_id: 1, value: { productFeatures: { Owned: true } } },
          },
        };
      };
      const first = s.manager.refresh(gate, s.session);
      await started.promise;
      const second = s.manager.refresh(gate, s.session);
      reply.resolve(true);
      await Promise.all([first, second]);
      assert.equal(max, 1);
      s.manager.productManager.setExperimentOverlay = async (v: any) => {
        s.writes.push(v);
        if (v) s.auth.next({ account: { uid: "changed" } });
      };
      await s.manager.refresh(gate, s.session);
      assert.equal(s.manager.getOverlay(), undefined);
      assert.equal(s.writes.at(-1), undefined);
      assert.equal(s.manager.pollingTimer, undefined);
    },
  ],
  [
    "polling uses current state and absent repository collector degrades without request loss",
    async (factory) => {
      const { manager, session, timers, calls } = owned(factory);
      manager.gitInfoCollector = {
        collect: async () => {
          throw Error("owned-git");
        },
      };
      await manager.refresh(gate, session);
      assert.deepEqual(calls[0][2].params, { repos: [] });
      timers[0].callback();
      await new Promise((r) => setImmediate(r));
      await manager.waitReady();
      assert.equal(calls.length, 2);
      manager.productManager.getEndpoint = () => undefined;
      await manager.refresh(gate, session);
      assert.equal(calls.length, 2);
      assert.equal(manager.getOverlay(), undefined);
      await manager.clear();
    },
  ],
  [
    "real loopback experiment response propagates through the complete snapshot coordinator",
    async (factory) => {
      const { manager, session } = owned(factory),
        requests: any[] = [];
      const root = fs.mkdtempSync(
        path.join(os.tmpdir(), "axon-experiment-chain-"),
      );
      const base = {
        config: { disabled: true },
        models: [{ id: "owned-model", contextWindow: 32000 }],
        productFeatures: { Base: true },
      };
      fs.mkdirSync(path.join(root, "cli"));
      fs.writeFileSync(
        path.join(root, "cli", "product.json"),
        JSON.stringify(base),
      );
      const scopedProcess = Object.create(process);
      Object.defineProperty(scopedProcess, "resourcesPath", { value: root });
      scopedProcess.env = { WORKBUDDY_CONFIG_DIR: root };
      const { WorkbuddyAuthProductCoordinator } =
        createNativeAuthProductCoordinator({
          process: scopedProcess,
          assetsRoot: root,
          os: { ...os, homedir: () => root },
          console: { log() {}, warn() {} },
        });
      const coordinator = new WorkbuddyAuthProductCoordinator();
      Object.assign(coordinator, {
        logger: manager.logger,
        authenticationManager: manager.authenticationManager,
        experimentManager: manager,
      });
      manager.productManager.setExperimentOverlay = async () =>
        coordinator.publishResolvedSnapshot(session, base, "owned-experiment");
      const server = createServer((req, res) => {
        requests.push({ method: req.method, url: req.url });
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            data: {
              exp_id: "loopback",
              value: {
                models: [{ id: "owned-model", contextWindow: 64000 }],
                productFeatures: { Owned: true },
              },
            },
          }),
        );
      });
      await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
      try {
        const address = server.address();
        assert.ok(address && typeof address !== "string");
        manager.productManager.getEndpoint = () =>
          `http://127.0.0.1:${address.port}`;
        // Explicit HTTP transport boundary; this does not impersonate the live authenticated RestOperations provider.
        manager.restOperations.post = async (
          route: string,
          _body: any,
          options: any,
        ) => ({
          data: await (
            await fetch(new URL(route, options.baseURL), {
              method: "POST",
              signal: AbortSignal.timeout(options.timeout),
            })
          ).json(),
        });
        await manager.refresh(
          { productFeatureExperiment: { enabled: true } },
          session,
        );
        assert.deepEqual(requests, [
          { method: "POST", url: "/v2/feature-flag/api/product-config" },
        ]);
        assert.equal(manager.getOverlay().models[0].contextWindow, 64000);
        assert.equal(manager.pollingTimer, undefined);
        const snapshot = JSON.parse(scopedProcess.env.ACC_PRODUCT_CONFIG_V3);
        assert.equal(snapshot.models[0].contextWindow, 64000);
        assert.deepEqual(snapshot.productFeatures, { Base: true, Owned: true });
        await manager.clear("owned-logout");
        const cleared = JSON.parse(scopedProcess.env.ACC_PRODUCT_CONFIG_V3);
        assert.equal(cleared.models[0].contextWindow, 32000);
        assert.deepEqual(cleared.productFeatures, { Base: true });
      } finally {
        await manager.clear();
        server.closeAllConnections();
        await new Promise<void>((r, j) =>
          server.close((e) => (e ? j(e) : r())),
        );
        fs.rmSync(root, { recursive: true, force: true });
      }
    },
  ],
];
