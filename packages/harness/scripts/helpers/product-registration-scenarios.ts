import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import assert from "node:assert/strict";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeProductRegistration } from "../../src/di/native-product-registration.js";
type Factory = typeof createNativeProductRegistration;
function fixture(factory: Factory) {
  const di = createNativeDi(diRuntime()),
    core = di.getModule(78842).default,
    base = Symbol("base"),
    originalModel = Symbol("originalModel"),
    events: number[] = [],
    live = { AgentService: "initial" };
  let release: any, reject: any;
  const held = new Promise((resolve, fail) => {
    release = resolve;
    reject = fail;
  });
  class Model {}
  const registration = factory({
    di,
    getModule(id: number) {
      events.push(id);
      if (id === 34284) return held;
      if (id === 31268 || id === 78449) return Promise.resolve({});
      if (id === 74428) return live;
      if (id === 9151) return { ProductConfigBasePath: base };
      if (id === 46307) {
        di.Component()(Model);
        return { ModelProviderImpl: Model };
      }
      if (id === 26314) return { OriginalModelProvider: originalModel };
      if (id === 93039)
        return { PathUtils: { getRootPathSync: () => "/owned/root" } };
      assert.ok(
        [
          76360, 93747, 84492, 7835, 52943, 56422, 79279, 92319, 60133, 94091,
          63767, 47321,
        ].includes(id),
        "unexpected parent " + id,
      );
      return {};
    },
  });
  return {
    di,
    core,
    base,
    originalModel,
    events,
    live,
    Model,
    registration,
    release: () => release({}),
    reject,
  };
}
export const PRODUCT_REGISTRATION_CASES = [
  {
    name: "original container bootstrap loads the recovered async product registration as its final stage",
    async run(factory: Factory) {
      const original = Symbol("originalModel"),
        events: number[] = [];
      let release: any;
      const held = new Promise((resolve) => {
        release = resolve;
      });
      let registration: any;
      const f = containerBootstrapFixture(
        createNativeContainerBootstrap,
        undefined,
        ({ di, base }: any) => {
          class Model {}
          registration = factory({
            di,
            getModule(id: number) {
              events.push(id);
              if (id === 34284) return held;
              if (id === 31268 || id === 78449) return Promise.resolve({});
              if (id === 9151) return { ProductConfigBasePath: base };
              if (id === 46307) {
                di.Component()(Model);
                return { ModelProviderImpl: Model };
              }
              if (id === 26314) return { OriginalModelProvider: original };
              if (id === 93039)
                return {
                  PathUtils: { getRootPathSync: () => "/final/product" },
                };
              assert.ok(
                [
                  76360, 74428, 93747, 84492, 7835, 52943, 56422, 79279, 92319,
                  60133, 94091, 63767, 47321,
                ].includes(id),
              );
              return {};
            },
          });
          return registration.load();
        },
      );
      const pending = f.loader.start();
      let finished = false;
      pending.then(() => {
        finished = true;
      });
      await new Promise<void>((resolve) => setImmediate(resolve));
      assert.equal(f.events.at(-1), 8588);
      assert.equal(finished, false);
      release({});
      const container = await pending;
      assert.ok(container);
      f.di.ContainerProvider.set(container);
      assert.equal(container.get(f.base), "/final/product");
      assert.equal(container.get(original), container.get(original));
      assert.deepEqual(f.errors, []);
      await container.unbindAllAsync();
      return { events, root: "/final/product" };
    },
  },
  {
    name: "original async product registration waits for aggregate and retains live exports, base-path override and lazy original-model alias",
    async run(factory: Factory) {
      const f = fixture(factory);
      assert.deepEqual(f.events, []);
      const pending = f.registration.load();
      assert.equal(pending, f.registration.load());
      let done = false;
      pending.then(() => {
        done = true;
      });
      await Promise.resolve();
      assert.equal(done, false);
      f.release();
      const binding = await pending;
      const container = f.di.ContainerFactory.create(
        f.core,
        f.di.manualBind((bind: any) =>
          bind(f.base).toConstantValue("/initial"),
        ),
        binding.default,
      );
      f.di.ContainerProvider.set(container);
      assert.equal(container.get(f.base), "/owned/root");
      const model = container.get(f.originalModel);
      assert.equal(model, container.get(f.Model));
      assert.equal(container.get(f.originalModel), model);
      const exported = await f.registration.getModule(92378);
      assert.equal(exported.AgentService, "initial");
      f.live.AgentService = "updated";
      assert.equal(exported.AgentService, "updated");
      assert.ok(Object.keys(exported).length > 1000);
      assert.equal(f.events.filter((id) => id === 76360).length, 1);
      await container.unbindAllAsync();
      return {
        events: f.events,
        exportCount: Object.keys(exported).length,
        value: exported.AgentService,
      };
    },
  },
  {
    name: "original async product registration rejects when awaited aggregate dependency fails",
    async run(factory: Factory) {
      const f = fixture(factory),
        pending = f.registration.load();
      const rejected = assert.rejects(pending, /owned product failure/);
      f.reject(Error("owned product failure"));
      await rejected;
      return { events: f.events };
    },
  },
];
