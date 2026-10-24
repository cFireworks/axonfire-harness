import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { createRequire, isBuiltin } from "node:module";
import { once } from "node:events";
import { galileoSetupFixture } from "./galileo-setup-scenarios.js";
import { createNativeGalileoSetup } from "../../src/runtime/native-galileo-setup.js";
import { createNativeGalileoFetch } from "../../src/runtime/native-galileo-fetch.js";
import { createNativeGalileoConfig } from "../../src/runtime/native-galileo-config.js";
import { createNativeGalileoHttpInstrumentation } from "../../src/runtime/native-galileo-http-instrumentation.js";
const nodeRequire = createRequire(import.meta.url);
export const GALILEO_HTTP_INSTRUMENTATION_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoHttpInstrumentation): Promise<any>;
}[] = [
  {
    name: "SetupGalileo uses real Config HTTP and Fetch instrumentation with linked client/server spans and restores Node HTTP methods",
    async run(factory) {
      const packets: any[] = [],
        requests: any[] = [],
        hooks: any[] = [],
        instruments: any[] = [],
        configs: any[] = [];
      let pulls = 0;
      const collector = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        let raw = Buffer.concat(chunks);
        if (req.headers["content-encoding"] === "gzip") raw = gunzipSync(raw);
        const body = JSON.parse(raw.toString());
        res.setHeader("content-type", "application/json");
        if (body.object_name) {
          pulls++;
          res.end(
            JSON.stringify({
              traces_config: { processor: { sampler: { dyeing: [] } } },
              metrics_config: { processor: { histogram_buckets: [] } },
            }),
          );
          return;
        }
        packets.push(body);
        res.end("{}");
      });
      collector.listen(0, "127.0.0.1");
      await once(collector, "listening");
      const app = http.createServer((req, res) => {
        requests.push({
          path: req.url,
          traced: typeof req.headers.traceparent === "string",
        });
        res.setHeader("content-type", "application/json");
        res.end('{"ok":true}');
      });
      app.listen(0);
      await once(app, "listening");
      const f = galileoSetupFixture(
          createNativeGalileoSetup,
          `http://127.0.0.1:${(collector.address() as any).port}/otlp`,
        ),
        globals = Object.create(globalThis);
      globals.fetch = globalThis.fetch;
      const originalFetch = globalThis.fetch,
        originalModule = nodeRequire("http"),
        originalRequest = originalModule.request,
        originalGet = originalModule.get,
        originalEmit = originalModule.Server.prototype.emit;
      const requireBuiltin = (id: string) => {
        assert.ok(isBuiltin(id));
        return nodeRequire(id);
      };
      const fetchNative: any = createNativeGalileoFetch({
        globals,
        require: requireBuiltin,
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
          throw Error("missing instrumentation parent " + id);
        },
      });
      const n: any = factory({
          globals,
          getModule: (id: number) =>
            id === 24434 ? nodeRequire("events") : fetchNative.getModule(id),
        }),
        hookModule = fetchNative.getModule(2385),
        OriginalHook = hookModule.Hook;
      hookModule.Hook = function (...a: any[]) {
        const h = new OriginalHook(...a);
        hooks.push(h);
        return h;
      };
      const ownedProcess = Object.create(process);
      Object.defineProperty(ownedProcess, "env", { value: {} });
      const remote: any = createNativeGalileoConfig({
        require: requireBuiltin,
        process: ownedProcess,
      });
      f.instrumentationModules[86097] = {
        Config: class extends remote.Config {
          constructor(o: any) {
            super(o);
            configs.push(this);
          }
        },
      };
      f.instrumentationModules[9808] = {
        HttpInstrumentation: class extends n.HttpInstrumentation {
          constructor(o: any) {
            super(o);
            instruments.push(this);
          }
        },
      };
      f.instrumentationModules[8009] = {
        FetchInstrumentation: class extends fetchNative.FetchInstrumentation {
          constructor(o: any) {
            super(o);
            instruments.push(this);
          }
        },
      };
      try {
        await f.n.SetupGalileo({
          app: "owned",
          server: "server",
          platform: "local",
          namespace: "Development",
          enableHTTP: true,
          enableTRPC: false,
          enableFetch: true,
          isEncrypted: false,
          filterIncomingRequest: (req: any) => req.url === "/otlp",
          traceConfig: {
            enable: true,
            processor: {
              enableTraceBody: false,
              sampler: { fraction: 1, enableParentSample: true },
            },
          },
        });
        assert.equal(pulls, 1);
        assert.equal(instruments.length, 2);
        const patched = nodeRequire("http");
        assert.notEqual(patched.request, originalRequest);
        const origin = `http://localhost:${(app.address() as any).port}`;
        const body = await new Promise<string>((resolve, reject) => {
          const req = patched.get(origin + "/node", (res: any) => {
            let out = "";
            res.setEncoding("utf8");
            res.on("data", (c: string) => (out += c));
            res.on("end", () => resolve(out));
          });
          req.on("error", reject);
        });
        assert.equal(body, '{"ok":true}');
        assert.deepEqual(
          await (await globals.fetch(origin + "/fetch")).json(),
          { ok: true },
        );
        await Promise.all(f.owned.map((p) => p.forceFlush()));
        const spans = packets.flatMap((p) =>
          (p.resourceSpans ?? []).flatMap((r: any) =>
            r.scopeSpans.flatMap((s: any) => s.spans),
          ),
        );
        assert.equal(spans.length, 4);
        const clients = spans.filter((s: any) => s.kind === 3),
          servers = spans.filter((s: any) => s.kind === 2);
        assert.equal(clients.length, 2);
        assert.equal(servers.length, 2);
        for (const s of servers)
          assert.ok(
            clients.some(
              (c: any) =>
                c.traceId === s.traceId && c.spanId === s.parentSpanId,
            ),
          );
        assert.deepEqual(requests, [
          { path: "/node", traced: true },
          { path: "/fetch", traced: true },
        ]);
        assert.equal(globalThis.fetch, originalFetch);
        return { pulls, requests, kinds: spans.map((s: any) => s.kind).sort() };
      } finally {
        for (const i of instruments.reverse()) {
          i.disable();
          for (const h of i._hooks ?? []) h.unhook?.();
        }
        for (const h of hooks) h.unhook();
        hookModule.Hook = OriginalHook;
        for (const c of configs) c.stopPull();
        await f.close();
        assert.equal(originalModule.request, originalRequest);
        assert.equal(originalModule.get, originalGet);
        assert.equal(originalModule.Server.prototype.emit, originalEmit);
        assert.equal(globalThis.fetch, originalFetch);
        app.close();
        collector.close();
        await Promise.all([once(app, "close"), once(collector, "close")]);
      }
    },
  },
];
