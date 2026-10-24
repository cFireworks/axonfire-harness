import assert from "node:assert/strict";
import { installNativeModuleRuntime } from "../../src/di/native-module-runtime.js";
type Factory = typeof installNativeModuleRuntime;
export const MODULE_RUNTIME_CASES = [
  {
    name: "original async module runtime waits for promise and nested module exports",
    async run(factory: Factory) {
      const cache: any = {},
        require: any = (id: number) => cache[id]?.exports;
      factory({ require, moduleCache: cache });
      let release: any;
      const held = new Promise<number>((resolve) => {
        release = resolve;
      });
      const child: any = (cache[1] = { exports: {} }),
        childExports = child.exports;
      require.a(
        child,
        async (_handle: any, done: any) => {
          try {
            childExports.value = await held;
            done();
          } catch (error) {
            done(error);
          }
        },
        1,
      );
      const parent: any = (cache[2] = { exports: {} }),
        parentExports = parent.exports;
      require.a(
        parent,
        async (handle: any, done: any) => {
          try {
            let deps = handle([child.exports, { value: 4 }]);
            deps = deps.then ? (await deps)() : deps;
            parentExports.sum = deps[0].value + deps[1].value;
            done();
          } catch (error) {
            done(error);
          }
        },
        1,
      );
      assert.equal(parent.exports[require.aE], parentExports);
      let settled = false;
      parent.exports.then(() => {
        settled = true;
      });
      await Promise.resolve();
      assert.equal(settled, false);
      release(3);
      assert.deepEqual(await parent.exports, { sum: 7 });
      return { sum: parentExports.sum, settled };
    },
  },
  {
    name: "original async module runtime propagates rejected dependencies",
    async run(factory: Factory) {
      const require: any = () => {};
      factory({ require, moduleCache: {} });
      const module: any = { exports: {} };
      require.a(
        module,
        async (handle: any, done: any) => {
          try {
            const deps = handle([Promise.reject(Error("owned dependency"))]);
            if (deps.then) (await deps)();
            done();
          } catch (error) {
            done(error);
          }
        },
        1,
      );
      await assert.rejects(module.exports, /owned dependency/);
      return "owned dependency";
    },
  },
  {
    name: "original namespace helpers retain live getters and deferred namespace loading",
    async run(factory: Factory) {
      let release: any;
      const held = new Promise((resolve) => {
          release = resolve;
        }),
        calls: number[] = [],
        require: any = (id: number) => {
          calls.push(id);
          return held;
        };
      factory({ require, moduleCache: {} });
      const plain = { value: 1 },
        namespace = require.t(plain, 2);
      assert.equal(namespace.default, plain);
      plain.value = 2;
      assert.equal(namespace.value, 2);
      assert.equal(namespace.__esModule, true);
      assert.equal(require.n({ __esModule: true, default: 3 })(), 3);
      assert.equal(require.n(4)(), 4);
      const deferred: any = { value: "ready", [require.zS]: [99] },
        module: any = { exports: {} },
        exports = module.exports;
      require.a(
        module,
        async (handle: any, done: any) => {
          try {
            let deps = handle([deferred]);
            deps = deps.then ? (await deps)() : deps;
            exports.value = deps[0].value;
            done();
          } catch (error) {
            done(error);
          }
        },
        1,
      );
      assert.deepEqual(calls, [99]);
      release({});
      assert.deepEqual(await module.exports, { value: "ready" });
      return { calls, value: namespace.value, deferred: exports.value };
    },
  },
];
