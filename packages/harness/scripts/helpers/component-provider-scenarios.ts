import assert from "node:assert/strict";
import { createNativeComponentProviders } from "../../src/di/native-component-providers.js";

type Factory = typeof createNativeComponentProviders;
export const COMPONENT_PROVIDER_CASES: {
  name: string;
  run: (factory: Factory) => any;
}[] = [
  {
    name: "original provider filters non-positive priorities, uses order fallback and stable ties",
    run(factory) {
      const n = factory();
      const items = [
        { name: "zero", priority: 0 },
        { name: "negative", priority: -1 },
        { name: "missing" },
        { name: "order", order: 5 },
        { name: "first", priority: 8 },
        { name: "second", priority: 8 },
        { name: "priority-wins", priority: 0, order: 20 },
        { name: "nan", priority: NaN },
      ];
      const p = new n.ContainerBasedProvider("owned", {
        parent: null,
        isBound: () => true,
        getAll: () => items,
        get: () => undefined,
      });
      const names = p.sortSync().map((v: any) => v.name);
      assert.deepEqual(names, ["first", "second", "order"]);
      const sorted = p.sortSync();
      assert.equal(p.get(), sorted);
      return names;
    },
  },
  {
    name: "original provider caches first lookup and sorted results without automatic refresh",
    run(factory) {
      const n = factory();
      let calls = 0;
      const items = [{ priority: 1, name: "one" }];
      const p = new n.ContainerBasedProvider("owned", {
        parent: null,
        isBound: (id: any) => id === "owned",
        getAll: () => {
          calls++;
          return items;
        },
      });
      const first = p.get();
      assert.equal(p.get(), first);
      items.push({ priority: 9, name: "late" });
      assert.deepEqual(
        p.get().map((x: any) => x.name),
        ["one"],
      );
      p.sortSync();
      assert.equal(calls, 1);
      return { calls, names: p.get().map((x: any) => x.name) };
    },
  },
  {
    name: "original provider only traverses parent on first explicit true lookup",
    run(factory) {
      const n = factory();
      const parent = {
        parent: null,
        isBound: (id: any) => id === "owned",
        getAll: () => [{ name: "parent", priority: 2 }],
      };
      const child = {
        parent,
        isBound: (id: any) => id === "owned",
        getAll: () => [{ name: "child", priority: 1 }],
      };
      const local = new n.ContainerBasedProvider("owned", child),
        inherited = new n.ContainerBasedProvider("owned", child);
      assert.deepEqual(
        local.get().map((x: any) => x.name),
        ["child"],
      );
      assert.deepEqual(
        local.get(true).map((x: any) => x.name),
        ["child"],
      );
      const names = inherited.sortSync(undefined, true).map((x: any) => x.name);
      assert.deepEqual(names, ["parent", "child"]);
      return names;
    },
  },
  {
    name: "original registry applies typed and generic filters and rejects late contributions",
    run(factory) {
      const n = factory();
      const registry = new n.ComponentFilterRegistryImpl([
        {
          registerContributionFilters(r: any) {
            r.addFilters("*", [(v: any) => v.enabled]);
            r.addFilters(["owned"], [(v: any) => v.priority < 10]);
          },
        },
      ]);
      assert.throws(
        () => registry.addFilters("*", [() => true]),
        /cannot add filters/,
      );
      const items = [
        { enabled: true, priority: 2 },
        { enabled: false, priority: 3 },
        { enabled: true, priority: 12 },
      ];
      const p = new n.ContainerBasedProvider("owned", {
        parent: null,
        isBound: () => true,
        get: () => registry,
        getAll: () => items,
      });
      assert.deepEqual(
        p.sortSync().map((x: any) => x.priority),
        [2],
      );
      return p.get();
    },
  },
  {
    name: "original provider logs getAll failure and continues parent traversal",
    run(factory) {
      const errors: any[] = [];
      const n = factory({
        console: { error: (e: any) => errors.push(e.message) },
      });
      const parent = {
        parent: null,
        isBound: (id: any) => id === "owned",
        getAll: () => [{ priority: 1 }],
      };
      const p = new n.ContainerBasedProvider("owned", {
        parent,
        isBound: (id: any) => id === "owned",
        getAll() {
          throw Error("owned missing binding");
        },
      });
      assert.equal(p.get(true).length, 1);
      assert.deepEqual(errors, ["owned missing binding"]);
      return errors;
    },
  },
  {
    name: "original asynchronous provider sorts awaited priorities and caches resolved components",
    async run(factory) {
      const n = factory();
      const items = [
        Promise.resolve({ name: "a", priority: 3 }),
        Promise.resolve({ name: "b", priority: 8 }),
      ];
      const p = new n.ContainerBasedProvider("owned", {
        parent: null,
        isBound: (id: any) => id === "owned",
        getAll: () => items,
      });
      const values = await p.sort(async (x: any) => x.priority);
      assert.equal(p.get(), values);
      const names = values.map((x: any) => x.name);
      assert.deepEqual(names, ["b", "a"]);
      return names;
    },
  },
  {
    name: "original filter failure propagates and does not create a successful cache",
    run(factory) {
      const n = factory();
      let calls = 0;
      const registry = {
        applyFilters() {
          calls++;
          throw Error("filter failed");
        },
      };
      const p = new n.ContainerBasedProvider("owned", {
        parent: null,
        isBound: () => true,
        get: () => registry,
        getAll: () => [],
      });
      assert.throws(() => p.get(), /filter failed/);
      assert.throws(() => p.get(), /filter failed/);
      assert.equal(calls, 2);
      return calls;
    },
  },
  {
    name: "original creator produces the original container provider with supplied token and container",
    run(factory) {
      const n = factory(),
        container = { parent: null, isBound: () => false };
      const p = new n.ProviderCreatorImpl().create("owned", container);
      assert.equal(p.constructor, n.ContainerBasedProvider);
      assert.equal(p.container, container);
      assert.equal(p.componentId, "owned");
      assert.deepEqual(p.get(), []);
      return true;
    },
  },
];
