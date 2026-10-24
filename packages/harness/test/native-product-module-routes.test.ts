import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { createNativeHttpHost } from "../src/http/native-http-host.js";
import { createNativeDi } from "../src/di/native-di.js";
import { diRuntime } from "../scripts/helpers/native-di-scenarios.js";
import { createNativeProductRuntime } from "../src/runtime/native-product-runtime.js";

test("product resolver exposes original shared namespaces and source-map constructors with stable identity", async () => {
  const proc = Object.create(process);
  proc.env = {};
  const di = createNativeDi({ ...diRuntime(), process: proc });
  const runtime = createNativeProductRuntime({
    di, process: proc, globals: Object.create(globalThis),
    require: createRequire(import.meta.url), Error: runInNewContext("Error"),
    basePath: process.cwd(), filename: process.cwd() + "/owned-bundle.js",
  });
  try {
    assert.equal(runtime.getModule(41708).version, "1.7.6");
    assert.equal(runtime.getModule(14953).version, "1.3.7");
    assert.equal(runtime.getModule(61987), runtime.getModule(63192));
    assert.equal(runtime.getModule(78842), di.getModule(78842));
    const forwarded = runtime.getModule(14590);
    assert.equal(typeof forwarded, "function");
    assert.deepEqual(forwarded({ headers: { "x-forwarded-for": "192.0.2.1, 192.0.2.2" }, socket: { remoteAddress: "127.0.0.1" } }), ["127.0.0.1", "192.0.2.2", "192.0.2.1"]);
    assert.equal(runtime.getModule(3584)("2h"), 7200000);
    const maps = runtime.getModule(74064);
    assert.ok(maps, "source-map barrel must resolve through product entry");
    assert.equal(maps.SourceMapGenerator, runtime.getModule(17280).SourceMapGenerator);
    assert.equal(maps.SourceMapConsumer, runtime.getModule(93569).SourceMapConsumer);
    assert.equal(maps.SourceNode, runtime.getModule(27748).SourceNode);
    assert.equal(runtime.getModule(74064), maps);
    const map = new maps.SourceMapGenerator({ file: "compiled.js" });
    map.addMapping({ generated: { line: 3, column: 4 }, original: { line: 8, column: 2 }, source: "original.ts", name: "owned" });
    const consumer = new maps.SourceMapConsumer(map.toJSON());
    assert.deepEqual(consumer.originalPositionFor({ line: 3, column: 4 }), { source: "original.ts", line: 8, column: 2, name: "owned" });
    assert.equal(runtime.getModule(46031)("owned").toString(), "owned");
    const backend = runtime.getModule(15062);
    assert.equal(runtime.getModule(69066).Context, backend.Context);
    assert.equal(runtime.getModule(6579).Application, backend.Application);
    assert.equal(runtime.getModule(81840).crc32, runtime.getModule(35306).crc32);
    assert.equal(runtime.getModule(81840).crc32, backend.crc32);
  } finally { await runtime.closeContext(); }
});


test("lazy shared CLS metadata and selection do not create hooks; requested contexts are cleaned up", async () => {
  const host = createNativeHttpHost({ lazy: true });
  try {
    assert.equal(host.hookCount, 0);
    assert.equal(host.native.getModule(41708).version, "1.7.6");
    assert.equal(host.native.getModule(14953).version, "1.3.7");
    assert.equal(host.native.getModule(61987), host.native.getModule(63192));
    assert.equal(host.hookCount, 0);
    const base = host.native.getModule(30805);
    assert.equal(host.hookCount, 1);
    assert.equal(base.Context, host.BaseContext);
    await host.run({}, {}, async context => {
      await Promise.resolve();
      assert.equal(base.Context.getCurrent(), context);
    });
  } finally { await host.close(); }
  assert.equal(host.hookCount, 0);
});

test("deferred HTTP construction failure releases hooks and a closed lazy host cannot initialize", async () => {
  const host = createNativeHttpHost({ lazy: true, modules: {
    7994: new Proxy({}, { get() { throw Error("owned lazy configuration failure"); } }),
  } });
  assert.equal(host.hookCount, 0);
  assert.throws(() => host.Context, /owned lazy configuration failure/);
  assert.equal(host.hookCount, 0);
  assert.equal(host.closed, true);
  assert.throws(() => host.Context, /host is closed/);
  await host.close();
  const unopened = createNativeHttpHost({ lazy: true });
  await unopened.close();
  assert.throws(() => unopened.Context, /host is closed/);
  assert.equal(unopened.hookCount, 0);
});
