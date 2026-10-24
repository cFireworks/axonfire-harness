import assert from "node:assert/strict";
import { createNativeOtelResource } from "../../src/runtime/native-otel-resource.js";
function fixture(factory: typeof createNativeOtelResource) {
  const logs: any[] = [];
  return {
    n: factory({
      process: { argv0: "owned-node" },
      diag: {
        debug: (...a: any[]) =>
          logs.push([
            "debug",
            ...a.map((v) => (v instanceof Error ? v.message : v)),
          ]),
        error: (...a: any[]) => logs.push(["error", ...a]),
      },
    }) as any,
    logs,
  };
}
export const OTEL_RESOURCE_CASES: {
  name: string;
  run(factory: typeof createNativeOtelResource): Promise<any>;
}[] = [
  {
    name: "Resource defaults retain captured SDK identity and service name",
    async run(factory) {
      const f = fixture(factory),
        R = f.n.Resource,
        out = R.default().attributes;
      assert.equal(out["service.name"], "unknown_service:owned-node");
      assert.equal(out["telemetry.sdk.version"], "1.30.1");
      assert.equal(out["telemetry.sdk.name"], "opentelemetry");
      assert.equal(out["telemetry.sdk.language"], "nodejs");
      assert.equal(R.empty(), R.empty());
      assert.deepEqual(R.empty().attributes, {});
      return out;
    },
  },
  {
    name: "async Resource attributes warn before settling then override synchronous values",
    async run(factory) {
      const f = fixture(factory);
      let resolve: any;
      const r = new f.n.Resource(
        { owned: "sync", keep: 1 },
        new Promise((v) => (resolve = v)),
      );
      assert.equal(r.asyncAttributesPending, true);
      assert.equal(r.attributes.owned, "sync");
      assert.equal(f.logs.length, 1);
      resolve({ owned: "async", added: 2 });
      await r.waitForAsyncAttributes();
      assert.equal(r.asyncAttributesPending, false);
      assert.deepEqual(r.attributes, { owned: "async", keep: 1, added: 2 });
      return { attributes: r.attributes, logs: f.logs };
    },
  },
  {
    name: "rejected async attributes preserve synchronous values without rejecting wait",
    async run(factory) {
      const f = fixture(factory),
        r = new f.n.Resource(
          { owned: true },
          Promise.reject(Error("owned rejection")),
        );
      await r.waitForAsyncAttributes();
      assert.equal(r.asyncAttributesPending, false);
      assert.deepEqual(r.attributes, { owned: true });
      assert.equal(f.logs[0][0], "debug");
      return { attributes: r.attributes, logs: f.logs };
    },
  },
  {
    name: "Resource merge keeps right-hand precedence across independent async resolution",
    async run(factory) {
      const f = fixture(factory),
        R = f.n.Resource;
      let left: any, right: any;
      const a = new R(
          { value: "left-sync", left: 1 },
          new Promise((v) => (left = v)),
        ),
        b = new R(
          { value: "right-sync", right: 1 },
          new Promise((v) => (right = v)),
        ),
        merged = a.merge(b);
      assert.equal(a.merge(undefined), a);
      assert.equal(merged.asyncAttributesPending, true);
      right({ value: "right-async", rightAsync: true });
      left({ value: "left-async", leftAsync: true });
      await merged.waitForAsyncAttributes();
      assert.deepEqual(merged.attributes, {
        value: "right-async",
        left: 1,
        leftAsync: true,
        right: 1,
        rightAsync: true,
      });
      assert.equal(a.attributes.value, "left-async");
      const plain = a.merge({ attributes: { value: "plain" } });
      await plain.waitForAsyncAttributes();
      assert.equal(plain.attributes.value, "plain");
      return merged.attributes;
    },
  },
];
