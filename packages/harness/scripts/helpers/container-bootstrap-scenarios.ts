import assert from "node:assert/strict";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
type Factory = typeof createNativeContainerBootstrap;
export function containerBootstrapFixture(
  factory: Factory,
  fail?: number,
  final?: (context: any) => any,
  installer?: () => any,
  parent?: (id: number, context: any) => any,
) {
  const di = createNativeDi(diRuntime()),
    events: any[] = [],
    errors: any[] = [],
    base = Symbol("ProductConfigBasePath"),
    fsToken = Symbol("FileSystem"),
    rest = Symbol("RestOperations"),
    restFactory = Symbol("RestOperationsFactory"),
    fsInitial = { owned: "initial" },
    fsReplacement = { owned: "replacement" };
  let release: any;
  const finalModule = new Promise((resolve) => {
    release = resolve;
  });
  const imports = [
    15062, 78824, 27371, 47005, 37819, 51147, 67846, 66915, 79814, 61000, 72018,
    54463, 79896, 98776, 9151, 55762, 18629, 66467, 92735, 54834, 86482, 14931,
    23294, 83052, 24015, 8588,
  ];
  const owners = new Map<number, symbol>();
  const loader = factory({
    di,
    configBasePath: "/owned/product",
    console: {
      error: (...args: any[]) =>
        errors.push(args.map((x) => (x instanceof Error ? x.message : x))),
    },
    getModule(id: number) {
      events.push(id);
      if (id === fail) throw Error("owned failure " + id);
      if (id === 25844)
        return installer
          ? installer()
          : { install: () => events.push("install") };
      if (id === 8588) return final ? final({ di, base, events }) : finalModule;
      const supplied = parent?.(id, { di, base, events });
      if (supplied !== undefined) return supplied;
      assert.ok(imports.includes(id), "unexpected parent " + id);
      const token = Symbol("module:" + id);
      owners.set(id, token);
      class Registered {
        module = id;
      }
      di.Component(token)(Registered);
      if (id === 78824) {
        class Factory {
          create() {
            return { owned: "rest" };
          }
        }
        di.Component(restFactory)(Factory);
        return { RestOperations: rest, RestOperationsFactory: restFactory };
      }
      if (id === 61000) return { fs: fsInitial };
      if (id === 72018 || id === 98776) return { FileSystem: fsToken };
      if (id === 79896) return fsReplacement;
      if (id === 18629) return { ProductConfigBasePath: base };
      return {};
    },
  });
  return {
    loader,
    di,
    events,
    errors,
    owners,
    base,
    fsToken,
    rest,
    release: () => release({ default: di.autoBind() }),
    imports,
  };
}
export const CONTAINER_BOOTSTRAP_CASES = [
  {
    name: "original bootstrap preserves ordered imports, binding overrides, async final module and cached startup",
    async run(factory: Factory) {
      const f = containerBootstrapFixture(factory);
      assert.deepEqual(f.events, []);
      const started = f.loader.start();
      assert.equal(started, f.loader.start());
      let done = false;
      started.then(() => {
        done = true;
      });
      await new Promise<void>((resolve) => setImmediate(resolve));
      assert.equal(f.events.at(-1), 8588);
      assert.equal(done, false);
      f.release();
      const container = await started;
      f.di.ContainerProvider.set(container);
      assert.deepEqual(f.events, [25844, "install", ...f.imports]);
      for (const [id, token] of f.owners)
        assert.equal(container.get(token).module, id);
      assert.equal(container.get(f.fsToken).owned, "replacement");
      assert.deepEqual(container.get(f.fsToken).default, {
        owned: "replacement",
      });
      assert.deepEqual(container.get(f.rest), { owned: "rest" });
      assert.equal(container.get(f.base), "/owned/product");
      assert.deepEqual(f.errors, []);
      await container.unbindAllAsync();
      return { events: f.events, errors: f.errors };
    },
  },
  {
    name: "original bootstrap logs async failure and resolves undefined without loading later modules",
    async run(factory: Factory) {
      const f = containerBootstrapFixture(factory, 9151);
      const result = await f.loader.start();
      assert.equal(result, undefined);
      assert.equal(f.events.at(-1), 9151);
      assert.equal(f.events.includes(8588), false);
      assert.deepEqual(f.errors, [
        ["Failed to start the backend application."],
        ["owned failure 9151"],
      ]);
      return { events: f.events, errors: f.errors };
    },
  },
  {
    name: "original bootstrap exposes synchronous installer errors before returning a promise",
    async run(factory: Factory) {
      const f = containerBootstrapFixture(factory, 25844);
      assert.throws(() => f.loader.start(), /owned failure 25844/);
      assert.deepEqual(f.events, [25844]);
      assert.deepEqual(f.errors, []);
      return { events: f.events };
    },
  },
];
