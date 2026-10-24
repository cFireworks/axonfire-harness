import assert from "node:assert/strict";
import * as asyncHooks from "node:async_hooks";
import * as events from "node:events";
import { createNativeExportContext } from "../../src/runtime/native-export-context.js";
export function exportContextFixture(factory = createNativeExportContext) {
  const registry = {},
    n: any = factory({
      registry,
      modules: { 90290: asyncHooks, 24434: events },
    });
  return { n, registry };
}
export const EXPORT_CONTEXT_CASES: {
  name: string;
  run(factory: typeof createNativeExportContext): Promise<any>;
}[] = [
  {
    name: "context registry and immutable values retain no-op and ALS semantics",
    async run(factory) {
      const f = exportContextFixture(factory),
        n = f.n,
        key = n.createContextKey("owned-context"),
        root = n.ROOT_CONTEXT,
        c = root.setValue(key, "value");
      assert.equal(root.getValue(key), undefined);
      assert.equal(c.getValue(key), "value");
      assert.equal(c.deleteValue(key).getValue(key), undefined);
      assert.equal(
        n.context.with(c, () => n.context.active().getValue(key)),
        undefined,
      );
      const manager = new n.AsyncLocalStorageContextManager();
      assert.equal(n.context.setGlobalContextManager(manager.enable()), true);
      assert.equal(n.context.setGlobalContextManager(manager), false);
      try {
        const values = await n.context.with(c, async () => {
          await Promise.resolve();
          return [
            n.context.active().getValue(key),
            n.context.with(root, () => n.context.active().getValue(key)),
          ];
        });
        assert.deepEqual(values, ["value", undefined]);
        assert.equal(n.context.active(), root);
        return values;
      } finally {
        n.context.disable();
      }
    },
  },
  {
    name: "original export bridge suppresses tracing across async callback and restores caller context",
    async run(factory) {
      const { n } = exportContextFixture(factory),
        manager = new n.AsyncLocalStorageContextManager();
      n.context.setGlobalContextManager(manager.enable());
      const key = n.createContextKey("owned-export"),
        caller = n.ROOT_CONTEXT.setValue(key, "caller"),
        seen: any[] = [];
      try {
        const result = await n.context.with(caller, async () => {
          const value = await n.internal._export(
            {
              export: (_data: any, cb: any) => {
                seen.push([
                  n.isTracingSuppressed(n.context.active()),
                  n.context.active().getValue(key),
                ]);
                queueMicrotask(() => {
                  seen.push([
                    n.isTracingSuppressed(n.context.active()),
                    n.context.active().getValue(key),
                  ]);
                  cb({ code: 0 });
                });
              },
            },
            ["owned"],
          );
          seen.push([
            n.isTracingSuppressed(n.context.active()),
            n.context.active().getValue(key),
          ]);
          return value;
        });
        assert.deepEqual(seen, [
          [true, "caller"],
          [true, "caller"],
          [false, "caller"],
        ]);
        assert.deepEqual(result, { code: 0 });
        assert.equal(
          n.isTracingSuppressed(n.unsuppressTracing(n.suppressTracing(caller))),
          false,
        );
        await assert.rejects(
          n.internal._export(
            {
              export: () => {
                throw Error("owned throw");
              },
            },
            [],
          ),
          /owned throw/,
        );
        return { seen, result };
      } finally {
        n.context.disable();
      }
    },
  },
  {
    name: "ALS bind preserves function receiver arguments and EventEmitter removal behavior",
    async run(factory) {
      const { n } = exportContextFixture(factory),
        manager = new n.AsyncLocalStorageContextManager(),
        key = n.createContextKey("owned-bind"),
        ctx = n.ROOT_CONTEXT.setValue(key, "bound");
      n.context.setGlobalContextManager(manager.enable());
      try {
        const fn = n.context.bind(ctx, function (this: any, a: any, b: any) {
          return [this.name, a, b, n.context.active().getValue(key)];
        });
        assert.equal(fn.length, 2);
        assert.deepEqual(fn.call({ name: "receiver" }, 1, 2), [
          "receiver",
          1,
          2,
          "bound",
        ]);
        const emitter = n.context.bind(ctx, new events.EventEmitter()),
          out: any[] = [];
        const callback = () => out.push(n.context.active().getValue(key));
        emitter.on("owned", callback);
        emitter.emit("owned");
        emitter.removeListener("owned", callback);
        emitter.emit("owned");
        emitter.once("owned", callback);
        emitter.emit("owned");
        emitter.emit("owned");
        assert.deepEqual(out, ["bound", "bound"]);
        assert.equal(emitter.listenerCount("owned"), 0);
        return out;
      } finally {
        n.context.disable();
      }
    },
  },
  {
    name: "captured diagnostic filtering and registry compatibility stay isolated from host global",
    async run(factory) {
      const f = exportContextFixture(factory),
        n = f.n,
        out: any[] = [];
      const logger = Object.fromEntries(
        ["debug", "info", "warn", "error", "verbose"].map((k) => [
          k,
          (...a: any[]) => out.push([k, ...a]),
        ]),
      );
      assert.equal(n.diag.setLogger(logger, 50), true);
      n.diag.info("hidden");
      n.diag.warn("visible");
      n.diag.createComponentLogger({ namespace: "owned" }).error("failure");
      assert.deepEqual(out, [
        ["warn", "visible"],
        ["error", "owned", "failure"],
      ]);
      n.diag.disable();
      const registry = n.getModule(70647),
        diag = { debug: () => {}, error: () => {} };
      assert.equal(registry.registerGlobal("owned", { value: 1 }, diag), true);
      assert.equal(registry.getGlobal("owned").value, 1);
      registry.unregisterGlobal("owned", diag);
      assert.equal(registry.getGlobal("owned"), undefined);
      return out;
    },
  },
];
