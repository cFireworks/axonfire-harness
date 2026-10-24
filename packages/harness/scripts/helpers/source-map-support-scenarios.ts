import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as vm from "node:vm";
import { createNativeSourceMapSupport } from "../../src/di/native-source-map-support.js";
const require = createRequire(import.meta.url);
type Factory = typeof createNativeSourceMapSupport;
export function sourceMapSupportFixture(
  factory: Factory = createNativeSourceMapSupport,
) {
  const context = vm.createContext({}),
    ErrorCtor = vm.runInContext("Error", context),
    proc: any = new EventEmitter(),
    events: any[] = [];
  proc.version = process.version;
  proc.exit = (code: number) => events.push(["exit", code]);
  proc.stderr = {
    _handle: {
      setBlocking: (value: boolean) => events.push(["blocking", value]),
    },
  };
  const console = {
    error: (...args: any[]) =>
      events.push([
        "error",
        ...args.map((x) => (typeof x === "string" ? x : String(x))),
      ]),
  };
  const native = factory({ require, process: proc, Error: ErrorCtor, console });
  return { native, context, ErrorCtor, proc, events };
}
export const SOURCE_MAP_SUPPORT_CASES = [
  {
    name: "original container bootstrap installs real source-map support before loading registration modules",
    async run(factory: Factory) {
      const f = sourceMapSupportFixture(factory),
        before = f.proc.emit,
        hostPrepare = (Error as any).prepareStackTrace;
      const bootstrap = containerBootstrapFixture(
        createNativeContainerBootstrap,
        undefined,
        undefined,
        () => f.native,
      );
      assert.equal(f.ErrorCtor.prepareStackTrace, undefined);
      const pending = bootstrap.loader.start();
      assert.equal(typeof f.ErrorCtor.prepareStackTrace, "function");
      assert.notEqual(f.proc.emit, before);
      await new Promise<void>((resolve) => setImmediate(resolve));
      bootstrap.release();
      const container = await pending;
      assert.ok(container);
      assert.equal((Error as any).prepareStackTrace, hostPrepare);
      assert.deepEqual(bootstrap.errors, []);
      await container.unbindAllAsync();
      return { installed: true, firstImport: bootstrap.events[0] };
    },
  },
  {
    name: "original source-map support maps real inline-map files and VM error stacks without changing host Error",
    async run(factory: Factory) {
      const hostPrepare = (Error as any).prepareStackTrace,
        f = sourceMapSupportFixture(factory),
        dir = fs.mkdtempSync(path.join(os.tmpdir(), "harness-map-"));
      try {
        const file = path.join(dir, "compiled.js"),
          source = path.join(dir, "original.ts"),
          generator = new (f.native.getModule(74064).SourceMapGenerator)({
            file: "compiled.js",
          });
        generator.addMapping({
          generated: { line: 1, column: 0 },
          source: "original.ts",
          original: { line: 7, column: 2 },
          name: "owned",
        });
        generator.setSourceContent(
          "original.ts",
          "\n".repeat(6) + '  throw new Error("owned")',
        );
        const code =
          '(function run(){throw new Error("owned")})()\n//# sourceMappingURL=data:application/json;base64,' +
          Buffer.from(generator.toString()).toString("base64");
        fs.writeFileSync(file, code);
        assert.equal(f.ErrorCtor.prepareStackTrace, undefined);
        f.native.install({ handleUncaughtExceptions: false });
        const mapped = f.native.mapSourcePosition({
          source: file,
          line: 1,
          column: 21,
        });
        assert.deepEqual(mapped, { source, line: 7, column: 2, name: "owned" });
        let error: any;
        try {
          vm.runInContext(code, f.context, { filename: file });
        } catch (e) {
          error = e;
        }
        assert.match(error.stack, /original\.ts:7:3/);
        assert.equal((Error as any).prepareStackTrace, hostPrepare);
        const excerpt = f.native.getErrorSource(error);
        assert.ok(excerpt?.includes('throw new Error("owned")'));
        return {
          mapped: { ...mapped, source: path.basename(mapped.source) },
          hasMappedStack: true,
          excerpt: excerpt?.replaceAll(dir, "<temp>"),
        };
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    },
  },
  {
    name: "original source-map install is idempotent and routes only unhandled errors to its owned process exit",
    async run(factory: Factory) {
      const f = sourceMapSupportFixture(factory),
        original = f.proc.emit;
      f.native.install();
      const installed = f.proc.emit;
      assert.notEqual(installed, original);
      f.native.install();
      assert.equal(f.proc.emit, installed);
      const observed: any[] = [];
      f.proc.on("uncaughtException", (error: any) =>
        observed.push(error.message),
      );
      f.proc.emit("uncaughtException", {
        message: "handled",
        stack: "Error: handled",
      });
      assert.deepEqual(observed, ["handled"]);
      assert.deepEqual(f.events, []);
      f.proc.removeAllListeners("uncaughtException");
      f.proc.emit("uncaughtException", { stack: "Error: owned" });
      assert.deepEqual(f.events, [
        ["blocking", true],
        ["error", "Error: owned"],
        ["exit", 1],
      ]);
      const before = f.events.length;
      f.proc.emit("other");
      assert.equal(f.events.length, before);
      return { observed, events: f.events };
    },
  },
  {
    name: "original source-map retrieval overrides reset and invalid environments reject",
    async run(factory: Factory) {
      const f = sourceMapSupportFixture(factory);
      assert.throws(
        () => f.native.install({ environment: "invalid" }),
        /environment invalid was unknown/,
      );
      f.native.install({
        environment: "node",
        handleUncaughtExceptions: false,
        overrideRetrieveSourceMap: true,
        retrieveSourceMap: (source: string) =>
          source === "owned.js"
            ? {
                url: source,
                map: {
                  version: 3,
                  sources: ["source.ts"],
                  names: [],
                  mappings: "AAAA",
                },
              }
            : null,
      });
      assert.equal(f.native.retrieveSourceMap("owned.js").url, "owned.js");
      f.native.resetRetrieveHandlers();
      assert.equal(f.native.retrieveSourceMap("owned.js"), null);
      return { reset: true };
    },
  },
];
