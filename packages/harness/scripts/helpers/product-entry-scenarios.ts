import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createNativeProductEntry } from "../../src/runtime/native-product-entry.js";
type Factory = typeof createNativeProductEntry;
export const PRODUCT_ENTRY_CASES = [
  {
    name: "original entry preloads before patching and starting, filters warnings and preserves an existing File",
    run(factory: Factory) {
      const calls: any[] = [],
        warnings: string[] = [],
        emitted: string[] = [];
      const process: any = new EventEmitter();
      process.platform = "linux";
      process.emitWarning = (message: any) =>
        emitted.push(typeof message === "string" ? message : message.message);
      process.on("warning", (warning: any) => warnings.push(warning.message));
      const File = class {},
        globals: any = { File };
      const require = () => {};
      const modules: any = {
        55943: {},
        20181: { Blob },
        73339: {
          createRequire(filename: string) {
            calls.push(filename);
            return require;
          },
        },
        86355: {},
      };
      const host = factory({
        globals,
        process,
        filename: "/owned/bundle.js",
        getModule(id: number) {
          calls.push(id);
          return modules[id];
        },
      });
      assert.deepEqual(calls, []);
      const first = host.start();
      assert.equal(host.start(), first);
      assert.deepEqual(calls, [55943, 20181, 73339, "/owned/bundle.js", 86355]);
      assert.equal(globals.require, require);
      assert.equal(globals.File, File);
      process.emitWarning("NODE_TLS_REJECT_UNAUTHORIZED is set");
      process.emitWarning({ message: "NODE_TLS_REJECT_UNAUTHORIZED is set" });
      process.emitWarning("keep emit warning");
      process.emit("warning", {
        name: "MaxListenersExceededWarning",
        message: "AbortSignal listener limit",
      });
      process.emit("warning", {
        name: "MaxListenersExceededWarning",
        message: "other listener limit",
      });
      process.emit("warning", {
        name: "OtherWarning",
        message: "AbortSignal other warning",
      });
      assert.deepEqual(emitted, ["keep emit warning"]);
      assert.deepEqual(warnings, [
        "other listener limit",
        "AbortSignal other warning",
      ]);
      return { calls, warnings, emitted };
    },
  },
  {
    name: "original Windows spawn and exec patches preserve explicit options and original callback placement",
    run(factory: Factory) {
      const calls: any[] = [];
      const child: any = {};
      for (const name of [
        "spawn",
        "spawnSync",
        "execFile",
        "execFileSync",
        "fork",
        "execSync",
        "exec",
      ])
        child[name] = function (...args: any[]) {
          calls.push({ name, args, receiver: this === child });
          return 17;
        };
      const process: any = new EventEmitter();
      process.platform = "win32";
      process.emitWarning = () => {};
      const File = class {};
      const modules: any = {
        55943: {},
        20181: { File },
        73339: { createRequire: () => () => {} },
        35317: child,
        86355: {},
      };
      const globals: any = {};
      factory({
        globals,
        process,
        filename: "/owned/bundle.js",
        getModule: (id: number) => modules[id],
      }).start();
      assert.equal(globals.File, File);
      const callback = () => {};
      for (const name of [
        "spawn",
        "spawnSync",
        "execFile",
        "execFileSync",
        "fork",
      ]) {
        assert.equal(child[name]("cmd", ["arg"]), 17);
        const options = { windowsHide: false };
        child[name]("cmd", [], options);
        assert.equal(options.windowsHide, false);
      }
      child.exec("cmd", callback);
      child.execSync("cmd", { windowsHide: false });
      child.execFile("cmd", callback);
      assert.equal(calls[10].args[1].windowsHide, true);
      assert.equal(calls[10].args[2], callback);
      // Preserve the original spawn-like execFile behavior: options follow its callback.
      assert.equal(calls[12].args[1], callback);
      assert.equal(calls[12].args[2].windowsHide, true);
      for (let i = 0; i < 10; i += 2)
        assert.equal(calls[i].args[2].windowsHide, true);
      assert.ok(calls.every((call) => call.receiver));
      return calls.map((call) => ({
        ...call,
        args: call.args.map((arg: any) =>
          typeof arg === "function" ? "callback" : arg,
        ),
      }));
    },
  },
  {
    name: "original File fallback uses Blob and explicit modification time",
    async run(factory: Factory) {
      const process: any = new EventEmitter();
      process.platform = "linux";
      process.emitWarning = () => {};
      const globals: any = {},
        modules: any = {
          55943: {},
          20181: { Blob },
          73339: { createRequire: () => () => {} },
          86355: {},
        };
      factory({
        globals,
        process,
        filename: "/owned/bundle.js",
        getModule: (id: number) => modules[id],
      }).start();
      const file: Blob & { name: string; lastModified: number } =
        new globals.File(["owned"], "file.txt", {
          type: "text/plain",
          lastModified: 42,
        });
      assert.ok(file instanceof Blob);
      const result = {
        text: await file.text(),
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
      };
      assert.deepEqual(result, {
        text: "owned",
        name: "file.txt",
        type: "text/plain",
        lastModified: 42,
      });
      return result;
    },
  },
];
