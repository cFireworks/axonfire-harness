import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { createRequire, isBuiltin } from "node:module";
import { once } from "node:events";
import { galileoSetupFixture } from "./galileo-setup-scenarios.js";
import { createNativeGalileoSetup } from "../../src/runtime/native-galileo-setup.js";
import { createNativeGalileoFetch } from "../../src/runtime/native-galileo-fetch.js";
const nodeRequire = createRequire(import.meta.url);
export const GALILEO_FETCH_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoFetch): Promise<any>;
}[] = [
  {
    name: "real captured fetch patch creates spans metrics and propagation for success HTTP failure ignored and network failure requests",
    async run(factory) {
      const packets: any[] = [],
        requests: any[] = [],
        hooks: any[] = [];
      const server = http.createServer(async (req, res) => {
        if (req.url === "/network-failure") { req.socket.destroy(); return; }
        const chunks = [];
        for await (const c of req) chunks.push(c);
        let raw = Buffer.concat(chunks);
        if (req.url === "/otlp") {
          if (req.headers["content-encoding"] === "gzip") raw = gunzipSync(raw);
          packets.push(JSON.parse(raw.toString()));
          res.end("{}");
          return;
        }
        requests.push({
          path: req.url,
          method: req.method,
          body: raw.toString(),
          traced: typeof req.headers.traceparent === "string",
        });
        res.setHeader("content-type", "application/json");
        res.statusCode = req.url === "/fail" ? 500 : 200;
        res.end('{"ok":true}');
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const origin = `http://127.0.0.1:${(server.address() as any).port}`,
        f = galileoSetupFixture(createNativeGalileoSetup, origin + "/otlp"),
        globals = Object.create(globalThis);
      globals.fetch = globalThis.fetch;
      const hostFetch = globalThis.fetch;
      const n: any = factory({
        globals,
        require: (id: string) => {
          assert.ok(isBuiltin(id));
          return nodeRequire(id);
        },
        getModule: (id: number) => {
          if ([11447, 41437].includes(id))
            return f.runtime.serializers.getModule(id);
          if ([33835, 98902, 65890].includes(id))
            return f.context.getModule(id);
          if ([23258, 51244, 45185, 67006].includes(id))
            return f.tracerNative.getModule(id);
          if (id === 67177) return f.galileo.getModule(id);
          if (id === 15183) return f.exporters.getModule(id);
          if (id === 37366) return f.meters.getModule(id);
          if (id === 64270) return f.n.getModule(id);
          if (id === 2339) return { diag: f.context.diag };
          throw Error("missing fetch parent " + id);
        },
      });
      const hookModule = n.getModule(2385),
        OriginalHook = hookModule.Hook;
      hookModule.Hook = function (...args: any[]) {
        const h = new OriginalHook(...args);
        hooks.push(h);
        return h;
      };
      let instrument: any;
      try {
        await f.n.SetupGalileo({
          app: "owned",
          server: "server",
          platform: "local",
          namespace: "Development",
          enableHTTP: true,
          enableTRPC: false,
          enableFetch: false,
          isEncrypted: false,
          traceConfig: {
            enable: true,
            processor: {
              enableTraceBody: false,
              sampler: { fraction: 1, enableParentSample: true },
            },
          },
        });
        instrument = new n.FetchInstrumentation({
          enabled: false,
          meterProvider: f.owned[2],
          selfMeterProvider: f.owned[0],
          pluginParams: {
            target: "local.owned.server",
            namespace: "Development",
            selfMonitor: f.sdk.SELF_MONITOR,
            filter: { calleeMethod: [], callerMethod: [] },
            enableTraceBody: true,
          },
          ignoreOutgoingRequestHook: (r: any) => r.url.endsWith("/ignore"),
        });
        instrument.setTracerProvider(f.owned[1]);
        instrument.enable();
        const patched = globals.fetch;
        instrument.enable();
        assert.equal(globals.fetch, patched);
        assert.equal(globalThis.fetch, hostFetch);
        const response = await globals.fetch(
          new Request(origin + "/ok", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: '{"owned":true}',
          }),
        );
        assert.deepEqual(await response.json(), { ok: true });
        await (await globals.fetch(origin + "/fail")).text();
        await (await globals.fetch(origin + "/ignore")).text();
        await assert.rejects(
          globals.fetch(origin + "/network-failure"),
        );
        instrument.disable();
        assert.equal(globals.fetch.__galileoPatched, undefined);
        assert.equal(globalThis.fetch, hostFetch);
        await Promise.all(f.owned.map((p) => p.forceFlush()));
        const spans = packets
          .flatMap((p) =>
            (p.resourceSpans ?? []).flatMap((r: any) =>
              r.scopeSpans.flatMap((s: any) => s.spans),
            ),
          )
          .map((s: any) => ({
            name: s.name,
            status: s.status.code,
            events: s.events.map((e: any) => e.name),
          }));
        assert.equal(spans.length, 3);
        assert.deepEqual(
          requests.map((r) => r.traced),
          [true, true, false],
        );
        assert.equal(requests[0].body, '{"owned":true}');
        const metrics = packets.flatMap((p) =>
          (p.resourceMetrics ?? []).flatMap((r: any) =>
            r.scopeMetrics.flatMap((s: any) => s.metrics),
          ),
        );
        const total = metrics
          .filter(
            (m: any) =>
              m.name === f.enums.ClientServerMetrics.ClientStartedTotal,
          )
          .flatMap((m: any) => m.sum.dataPoints)
          .reduce(
            (sum: number, p: any) => sum + Number(p.asInt ?? p.asDouble),
            0,
          );
        assert.equal(total, 3);
        assert.ok(hooks.length > 0);
        return { spans, requests, total };
      } finally {
        instrument?.disable();
        for (const h of hooks) h.unhook();
        hookModule.Hook = OriginalHook;
        await f.close();
        server.close();
        await once(server, "close");
      }
    },
  },
];
