import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createNativeDi } from "../../src/di/native-di.js";
const require = createRequire(import.meta.url);
export const diRuntime = () => ({
  globals: globalThis,
  process,
  console,
  require,
});
type Factory = typeof createNativeDi;
export const DI_CASES = [
  {
    name: "original DI binds singleton aliases, optional properties, providers and isolated metadata",
    async run(factory: Factory) {
      const before = (Reflect as any).getMetadata,
        n = factory(diRuntime()),
        token = Symbol("dependency"),
        alias = Symbol("alias"),
        consumer = Symbol("consumer"),
        absent = Symbol("absent");
      class Dependency {
        priority = 3;
      }
      class Consumer {
        dep: any;
        missing: any;
      }
      n.Component(token, alias)(Dependency);
      n.Autowired(token)(Consumer.prototype, "dep");
      n.Autowired(absent)(Consumer.prototype, "missing");
      n.Optional()(Consumer.prototype, "missing");
      n.Component(consumer)(Consumer);
      const container = n.ContainerFactory.create(n.autoBind());
      n.ContainerProvider.set(container);
      const result = container.get(consumer),
        dep = container.get(token);
      assert.equal(result.dep, dep);
      assert.equal(container.get(alias), dep);
      assert.equal(result.missing, undefined);
      assert.equal(n.ContainerUtil.get(consumer), result);
      const provider = container
        .get(n.ProviderCreator)
        .create(token, container);
      assert.deepEqual(provider.get(), [dep]);
      const second = factory(diRuntime());
      assert.notEqual(n.Reflect, second.Reflect);
      assert.equal((Reflect as any).getMetadata, before);
      const other = second.ContainerFactory.create(second.autoBind());
      assert.equal(other.isBound(token), false);
      await container.unbindAllAsync();
      await other.unbindAllAsync();
      return {
        singleton: true,
        alias: true,
        optional: true,
        provider: provider.get().map((x: any) => x.priority),
        isolated: true,
      };
    },
  },
  {
    name: "original DI lifecycle initializes before starting and isolates synchronous failures",
    async run(factory: Factory) {
      const n = factory(diRuntime()),
        events: string[] = [],
        errors: string[] = [];
      const a = {
        initialize() {
          events.push("init:a");
          throw Error("owned");
        },
        async onStart() {
          events.push("start:a");
        },
        onStop() {
          events.push("stop:a");
          throw Error("owned");
        },
      };
      const b = {
        initialize() {
          events.push("init:b");
        },
        async onStart() {
          events.push("start:b");
        },
        onStop() {
          events.push("stop:b");
        },
      };
      class App extends n.AbstractApplication {}
      n.Component(n.Application)(App);
      const container = n.ContainerFactory.create(
        n.autoBind((bind: any, _isBound: any, _unbind: any, rebind: any) => {
          bind(n.ApplicationLifecycle).toConstantValue(a);
          bind(n.ApplicationLifecycle).toConstantValue(b);
          rebind(n.Logger).toConstantValue({
            error: (message: string) => errors.push(message),
          });
        }),
      );
      n.ContainerProvider.set(container);
      const app = container.get(n.Application);
      await app.doStart();
      app.doStop();
      assert.deepEqual(events, [
        "init:a",
        "init:b",
        "start:a",
        "start:b",
        "stop:a",
        "stop:b",
      ]);
      assert.deepEqual(errors, [
        "Could not initialize lifecycle",
        "Could not stop lifecycle",
      ]);
      await container.unbindAllAsync();
      return { events, errors };
    },
  },
  {
    name: "original application state resolves reached-state waiters and emits transitions once",
    async run(factory: Factory) {
      const n = factory(diRuntime()),
        state = new n.AbstractApplicationStateService(),
        events: string[] = [];
      const disposable = state.onStateChanged((value: string) =>
        events.push(value),
      );
      let reached = false;
      const wait = state.reachedState("ready").then(() => {
        reached = true;
      });
      await Promise.resolve();
      assert.equal(reached, false);
      state.state = "ready";
      await wait;
      state.state = "ready";
      const stop = state.reachedAnyState("stopped", "failed");
      state.state = "stopped";
      await stop;
      assert.deepEqual(events, ["ready", "stopped"]);
      assert.equal(state.state, "stopped");
      disposable.dispose();
      return { events, reached };
    },
  },
];
