import assert from "node:assert/strict";
import * as http from "node:http";
import { gzipSync, gunzipSync } from "node:zlib";
import { createRequire, isBuiltin } from "node:module";
import { once } from "node:events";
import { createNativeGalileoConfig } from "../../src/runtime/native-galileo-config.js";
import { createNativeGalileoSetup } from "../../src/runtime/native-galileo-setup.js";
import { galileoSetupFixture } from "./galileo-setup-scenarios.js";
const nodeRequire = createRequire(import.meta.url);
function fixture(factory: typeof createNativeGalileoConfig) {
  const errors: any[] = [],
    timers = new Map<any, any>(),
    intervals: number[] = [];
  const ownedProcess = Object.create(process);
  Object.defineProperty(ownedProcess, "env", { value: {}, enumerable: true });
  const n: any = factory({
    require: (name: string) => {
      assert.ok(isBuiltin(name));
      return nodeRequire(name);
    },
    process: ownedProcess,
    console: { error: (...args: any[]) => errors.push(args[0]) },
    setInterval: (fn: any, ms: number) => {
      const h = {};
      timers.set(h, fn);
      intervals.push(ms);
      return h;
    },
    clearInterval: (h: any) => timers.delete(h),
  });
  return { n, errors, timers, intervals };
}
const options = {
  platform: "owned",
  app: "app",
  server: "server",
  namespace: "Development",
  env: "test",
};
export const GALILEO_CONFIG_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoConfig): Promise<any>;
}[] = [
  {
    name: "real captured Config POST follows redirect, decodes gzip, polls and retains last state on HTTP failure",
    async run(factory) {
      const f = fixture(factory),
        requests: any[] = [];
      let mode = "initial";
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        requests.push({
          path: req.url,
          method: req.method,
          body: JSON.parse(Buffer.concat(chunks).toString()),
        });
        if (req.url === "/redirect") {
          res.writeHead(307, { location: "/config" });
          res.end();
          return;
        }
        if (mode === "failure") {
          res.writeHead(503);
          res.end("unavailable");
          return;
        }
        const result =
          mode === "empty"
            ? {}
            : {
                traces_config: {
                  processor: {
                    sampler: { dyeing: [{ key: "owned", values: [mode] }] },
                  },
                },
                metrics_config: {
                  processor: {
                    histogram_buckets: [
                      { name: "owned_hist", buckets: [1, 2] },
                    ],
                  },
                },
              };
        res.setHeader("content-encoding", "gzip");
        res.setHeader("content-type", "application/json");
        res.end(gzipSync(JSON.stringify(result)));
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const c = new f.n.Config({
        ...options,
        addr: `http://127.0.0.1:${(server.address() as any).port}/redirect`,
      });
      try {
        assert.equal(c.getData(), null);
        await c.startPull();
        assert.deepEqual(f.intervals, [60000]);
        assert.equal(f.timers.size, 1);
        assert.deepEqual(c.getData(), [{ key: "owned", values: ["initial"] }]);
        const tick = [...f.timers.values()][0];
        mode = "changed";
        await tick();
        assert.deepEqual(c.getData(), [{ key: "owned", values: ["changed"] }]);
        mode = "failure";
        await tick();
        assert.deepEqual(c.getData(), [{ key: "owned", values: ["changed"] }]);
        assert.deepEqual(f.errors, ["fetch config failed"]);
        mode = "empty";
        await tick();
        assert.equal(c.getData(), null);
        assert.equal(c.getMetricsConfig(), null);
        c.stopPull();
        c.stopPull();
        assert.equal(f.timers.size, 0);
        assert.equal(c.fetchInterval, null);
        assert.ok(requests.every((r) => r.method === "POST"));
        assert.deepEqual(requests[0].body, {
          platform: "owned",
          object_name: "app.server",
          resource: {
            target: "owned.app.server",
            namespace: "Development",
            env_name: "test",
          },
        });
        return { requests, errors: f.errors, intervals: f.intervals };
      } finally {
        c.stopPull();
        server.close();
        await once(server, "close");
      }
    },
  },
  {
    name: "actual remote Config replaces SetupGalileo adapter and supplies histogram buckets to real providers",
    async run(factory) {
      const config = fixture(factory),
        instances: any[] = [],
        packets: any[] = [];
      let clientName = "";
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        let raw = Buffer.concat(chunks);
        if (req.headers["content-encoding"] === "gzip") raw = gunzipSync(raw);
        const body = JSON.parse(raw.toString());
        res.setHeader("content-type", "application/json");
        if (body.object_name) {
          packets.push("config");
          res.end(
            JSON.stringify({
              traces_config: { processor: { sampler: { dyeing: [] } } },
              metrics_config: {
                processor: {
                  histogram_buckets: [{ name: clientName, buckets: [0.2, 1] }],
                },
              },
            }),
          );
          return;
        }
        packets.push(body);
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const f = galileoSetupFixture(
        createNativeGalileoSetup,
        `http://127.0.0.1:${(server.address() as any).port}/owned`,
        {
          Config: class extends config.n.Config {
            constructor(o: any) {
              super(o);
              instances.push(this);
            }
          },
        },
      );
      clientName = f.enums.ClientServerMetrics.ClientHandledSeconds;
      try {
        await f.n.SetupGalileo({
          ...options,
          enableHTTP: true,
          enableTRPC: false,
          enableFetch: false,
          isEncrypted: false,
        });
        assert.equal(instances.length, 1);
        assert.equal(config.timers.size, 1);
        assert.equal(packets[0], "config");
        f.meters.metrics
          .getMeter("remote-config")
          .createHistogram(clientName)
          .record(0.5);
        await f.owned[2].forceFlush();
        const metrics = packets
          .filter((p) => typeof p !== "string")
          .flatMap((p) =>
            (p.resourceMetrics ?? []).flatMap((r: any) =>
              r.scopeMetrics.flatMap((s: any) => s.metrics),
            ),
          );
        assert.deepEqual(
          metrics[0].histogram.dataPoints[0].explicitBounds,
          [0.2, 1],
        );
        assert.deepEqual(
          metrics[0].histogram.dataPoints[0].bucketCounts.map(Number),
          [0, 1, 0],
        );
        return {
          data: instances[0].getData(),
          buckets: instances[0].getMetricsConfig(),
          bounds: metrics[0].histogram.dataPoints[0].explicitBounds,
        };
      } finally {
        for (const c of instances) c.stopPull();
        await f.close();
        assert.equal(config.timers.size, 0);
        server.close();
        await once(server, "close");
      }
    },
  },
];
