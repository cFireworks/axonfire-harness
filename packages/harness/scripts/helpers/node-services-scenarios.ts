import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeNodeServices } from "../../src/runtime/native-node-services.js";
import { Readable } from "node:stream";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createRequire } from "node:module";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeBackendServer } from "../../src/http/native-backend-server.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
const require = createRequire(import.meta.url);
export async function nodeServicesScenario(
  factory: typeof createNativeNodeServices,
) {
  const temp = await mkdtemp("/tmp/axon-node-");
  let node: any, nodeHost: any, local: any, pac: any;
  const proc: any = new EventEmitter();
  Object.setPrototypeOf(proc, process);
  proc.env = {};
  proc.exit = () => {
    throw Error("Unexpected process exit");
  };
  const borrowedExpress = createNativeExpress({ require, process: proc });
  const quiet = { ...console, log() {}, info() {}, error() {} };
  let foundation: ReturnType<typeof createNativeBackendFoundation> | undefined;
  let server: any, container: any, app: any, ready: () => void;
  const listening = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const loaded: number[] = [];
  const bootstrap = containerBootstrapFixture(
    createNativeContainerBootstrap,
    undefined,
    ({ di }) => {
      const api = foundation!.getModule(47005);
      return {
        default: di.autoBind((bind: any) => {
          bind(api.ServerAware).toConstantValue({
            async setServer(value: any) {
              server = value;
              if (!server.listening) await once(server, "listening");
              ready();
            },
          });
        }),
      };
    },
    undefined,
    (id, { di }) => {
      if (![15062, 78824, 27371, 47005, 37819, 51147, 67846].includes(id))
        return;
      foundation ??= createNativeBackendFoundation({
        di,
        globals: Object.create(globalThis),
        require,
        process: proc,
        console: quiet,
        basePath: process.cwd(),
        filename: process.cwd() + "/owned-bundle.js",
      });
      loaded.push(id);
      if (id === 67846) {
        nodeHost = factory({
          di,
          globals: Object.create(globalThis),
          http: foundation,
          common: foundation,
          express: {
            getModule(n: number) {
              return borrowedExpress.getModule(n);
            },
          },
          process: proc,
          require,
          filename: temp + "/bundle.js",
        });
        node = nodeHost.load();
        return node;
      }
      return foundation.getModule(id);
    },
  );
  bootstrap.di.ConfigUtil.getRaw().cell.logger.level = "error";
  try {
    const pending = bootstrap.loader.start();
    container = await pending;
    assert.ok(container, JSON.stringify(bootstrap.errors));
    assert.deepEqual(loaded, [15062, 78824, 27371, 47005, 37819, 51147, 67846]);
    const resolve = foundation!.getModule;
    const api = resolve(47005),
      restApi = resolve(78824),
      pathApi = resolve(27371);
    bootstrap.di.ContainerProvider.set(container);
    assert.ok(container.get(api.Dispatcher) instanceof api.DispatcherImpl);
    const rest = container.get(restApi.RestOperations);
    assert.equal(rest, container.get(restApi.RestOperations));
    assert.equal(
      await container.get(pathApi.PathResolver).resolve("owned", "child"),
      "/owned/child",
    );
    const entry = createNativeBackendServer({
      process: proc,
      console: quiet,
      getModule(id: number) {
        return id === 50984 ? { container: pending } : resolve(id);
      },
    });
    entry.start();
    await listening;
    app = container.get(bootstrap.di.Application);
    const response = await rest.get(
      `http://127.0.0.1:${server.address().port}/health`,
      { proxy: false },
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.status, "UP");
    const common = resolve(51147);
    const paths = container.get(common.FilePathService);
    paths.setCurrentUserId("owned");
    paths.setIDEType("test");
    assert.equal(paths.homePath, homedir());
    assert.ok(paths.userDataPath.endsWith(join("Data", "owned", "test")));
    assert.equal(
      container.get(common.UserHomeService).downloadsPath,
      join(homedir(), "Downloads"),
    );
    const settingsPath = join(temp, "settings.json");
    await writeFile(
      settingsPath,
      JSON.stringify({
        "http.proxy": "127.0.0.1:8800",
        "http.noProxy": ["owned.test"],
      }),
    );
    proc.env.HTTPS_PROXY = "http://127.0.0.1:9900";
    const proxy = new node.ProxyResolver({ settingsPath });
    assert.equal(proxy.resolve().source, "config");
    assert.equal(proxy.resolve().proxyUrl, "http://127.0.0.1:8800/");
    assert.equal(proxy.shouldBypassProxy("http://localhost/path"), true);
    assert.equal(
      proxy.shouldBypassProxy("http://sub.owned.test", "*.owned.test"),
      true,
    );
    proxy.setResolveForUrlHook(async () => "DIRECT");
    assert.equal(
      (await proxy.resolveForUrl("https://owned.test")).source,
      "config-direct",
    );
    proxy.setResolveForUrlHook(async () => "PROXY 127.0.0.1:7700; DIRECT");
    assert.equal(
      (await proxy.resolveForUrl("https://owned.test")).proxyUrl,
      "http://127.0.0.1:7700/",
    );
    await writeFile(
      settingsPath,
      JSON.stringify({ "http.proxySupport": "off" }),
    );
    assert.equal(proxy.resolve().source, "config-direct");
    await writeFile(settingsPath, "{}");
    assert.equal(proxy.resolve().source, "env");
    delete proc.env.HTTPS_PROXY;
    assert.equal(
      node.ensureLoopbackInNoProxy("owned.test"),
      "owned.test,localhost,127.0.0.1,::1",
    );
    const socketPath = join(temp, "pac.sock");
    pac = createServer((req, res) => {
      assert.equal(req.headers.authorization, "Bearer owned");
      assert.ok(
        req.url!.includes(encodeURIComponent("https://owned.test/path")),
      );
      res.end(" PROXY 127.0.0.1:6600 ");
    });
    await new Promise<void>((r) => pac.listen(socketPath, r));
    assert.equal(
      await node.createPacRpcHook(
        socketPath,
        "owned",
      )("https://owned.test/path"),
      "PROXY 127.0.0.1:6600",
    );
    let uploaded = "";
    local = createServer(async (req, res) => {
      if (req.url === "/info") {
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify({
            data: {
              url: "owned-result",
              bucket: "owned-1250000000",
              region: "ap-guangzhou",
              path: "owned",
              credential: {
                credentials: {
                  tmpSecretId: "owned",
                  tmpSecretKey: "owned",
                  token: "owned",
                },
                expiredTime: 2000000000,
                startTime: 1000000000,
              },
            },
          }),
        );
        return;
      }
      for await (const chunk of req) uploaded += chunk.toString();
      res.setHeader("etag", '"owned-etag"');
      res.end();
    });
    await new Promise<void>((r) => local.listen(0, "127.0.0.1", r));
    const localOrigin = `http://127.0.0.1:${local.address().port}`;
    const uploads = container.get(common.FileUploadService);
    assert.deepEqual(await uploads.upload([], { uploader: "unknown" }), {
      success: false,
      error: "No supported uploader found",
    });
    const empty = await uploads.upload([], {
      uploader: "cos",
      cosInfoPath: localOrigin + "/info",
      signal: new AbortController().signal,
    });
    assert.equal(empty.success, true);
    assert.equal(empty.result, "owned-result");
    assert.equal(empty.details.total, 0);
    // Exercise node-fetch's lazy multipart factory, including boundaries split across chunks.
    const { Response } = nodeHost.getModule(88654);
    const boundary = "owned-multipart-738";
    const binary = Buffer.from([0, 255, 13, 10, 65]);
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="tag"\r\n\r\nhéllo 世界\r\n--${boundary}\r\nContent-Disposition: form-data; name="tag"\r\n\r\nsecond\r\n--${boundary}\r\nContent-Disposition: form-data; name="upload"; filename="owned.bin"\r\nContent-Type: application/octet-stream\r\n\r\n`),
      binary,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const multipart = await new Response(
      Readable.from(Array.from(multipartBody, byte => Buffer.from([byte]))),
      { headers: { "content-type": `multipart/form-data; boundary=${boundary}` } },
    ).formData();
    assert.deepEqual(multipart.getAll("tag"), ["héllo 世界", "second"]);
    const upload = multipart.get("upload");
    assert.equal(upload.name, "owned.bin");
    assert.equal(upload.type, "application/octet-stream");
    assert.deepEqual(Buffer.from(await upload.arrayBuffer()), binary);
    await assert.rejects(new Response("invalid", {
      headers: { "content-type": "multipart/form-data" },
    }).formData(), /boundary/i);
    const urlencoded = await new Response("tag=one&tag=two", {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }).formData();
    assert.deepEqual(urlencoded.getAll("tag"), ["one", "two"]);
    const COS = nodeHost.getModule(25760);
    const sdk = new COS({
      SecretId: "owned",
      SecretKey: "owned",
      Domain: localOrigin.replace("http://", ""),
      Protocol: "http:",
    });
    await new Promise<void>((resolve, reject) =>
      sdk.putObject(
        {
          Bucket: "owned-1250000000",
          Region: "ap-guangzhou",
          Key: "owned.txt",
          Body: Buffer.from("owned upload"),
        },
        (e: any) => (e ? reject(e) : resolve()),
      ),
    );
    assert.equal(uploaded, "owned upload");
    assert.deepEqual(bootstrap.errors, []);
    await app.stop();
    return {
      loaded,
      uploaded,
      multipart: { tags: multipart.getAll("tag"), name: upload.name, bytes: Array.from(binary) },
      status: response.status,
      health: response.data.status,
      state: container.get(bootstrap.di.ApplicationStateService).state,
    };
  } finally {
    app?.removeListeners("SIGINT");
    app?.removeListeners("SIGTERM");
    if (server) {
      server.closeIdleConnections?.();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    for (const srv of [local, pac])
      if (srv) {
        srv.closeIdleConnections?.();
        await new Promise<void>((r) => srv.close(() => r()));
      }
    await rm(temp, { recursive: true, force: true });
    await foundation?.closeContext();
    await container?.unbindAllAsync();
  }
}
