import assert from "node:assert/strict";
import { createServer, Agent } from "node:http";
import { gzipSync } from "node:zlib";
import { createNativeDesktopProductInterceptors } from "../../src/http/native-desktop-product-interceptors.js";
type Factory = (runtime?: any) => any;
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const seen: any[] = [],
    sockets = new Set<any>();
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const c of req) body += c;
    seen.push({ url: req.url, method: req.method, headers: req.headers, body });
    const pathname = new URL(req.url!, "http://owned.invalid").pathname;
    if (pathname === "/hang") return;
    if (pathname === "/redirect") {
      res.writeHead(302, { location: "/gzip" });
      res.end();
      return;
    }
    if (pathname === "/gzip") {
      res.writeHead(200, {
        "content-type": "application/json",
        "content-encoding": "gzip",
      });
      res.end(gzipSync(JSON.stringify({ owned: true })));
      return;
    }
    res.writeHead(pathname === "/http-401" ? 401 : 200, {
      "content-type": "application/json",
    });
    res.end(
      JSON.stringify(
        pathname === "/business-401" ? { code: 401 } : { owned: true, body },
      ),
    );
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const origin = `http://127.0.0.1:${address.port}`,
    agent = new Agent({ keepAlive: false }),
    api = factory();
  const instance = new api.DefaultRestOperationsFactory();
  instance.clientConfig = {
    baseURL: origin,
    proxy: false,
    httpAgent: agent,
    timeout: 2000,
  };
  const client = instance.create();
  try {
    await run({ api, instance, client, origin, seen });
  } finally {
    agent.destroy();
    for (const socket of sockets) socket.destroy();
    server.closeAllConnections();
    await new Promise<void>((r, j) => server.close((e) => (e ? j(e) : r())));
  }
}
export const desktopRestScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "captured version and factory instances preserve configuration isolation",
    (factory) =>
      owned(factory, async ({ api, instance, client }: any) => {
        assert.equal(api.axios.VERSION, "0.26.1");
        const second = instance.create();
        client.defaults.headers.common["X-Owned"] = "first";
        await client.get("/first");
        await second.get("/second");
        assert.equal(second.defaults.headers.common["X-Owned"], undefined);
        assert.notEqual(client.interceptors, second.interceptors);
      }),
  ],
  [
    "real Node adapter preserves JSON, query arrays and interceptor ordering",
    (factory) =>
      owned(factory, async ({ client, seen }: any) => {
        const order: string[] = [];
        client.interceptors.request.use((c: any) => {
          order.push("request-first");
          return c;
        });
        client.interceptors.request.use(async (c: any) => {
          order.push("request-second");
          return c;
        });
        client.interceptors.response.use((r: any) => {
          order.push("response-first");
          return r;
        });
        client.interceptors.response.use((r: any) => {
          order.push("response-second");
          return r;
        });
        const result = await client.post(
          "/echo",
          { value: "owned" },
          { params: { repos: ["one", "two"] } },
        );
        assert.deepEqual(order, [
          "request-second",
          "request-first",
          "response-first",
          "response-second",
        ]);
        assert.deepEqual(JSON.parse(seen[0].body), { value: "owned" });
        assert.equal(seen[0].url, "/echo?repos[]=one&repos[]=two");
        assert.equal(result.data.owned, true);
      }),
  ],
  [
    "original redirect and gzip dependencies execute over real sockets",
    (factory) =>
      owned(factory, async ({ client, seen }: any) => {
        const response = await client.get("/redirect");
        assert.deepEqual(response.data, { owned: true });
        assert.deepEqual(
          seen.map((r: any) => r.url),
          ["/redirect", "/gzip"],
        );
      }),
  ],
  [
    "HTTP errors, timeout and abort retain original Axios and cancellation shapes",
    (factory) =>
      owned(factory, async ({ api, client }: any) => {
        await assert.rejects(
          client.get("/http-401"),
          (e: any) =>
            e.isAxiosError === true &&
            e.response.status === 401 &&
            e.config.url === "/http-401",
        );
        await assert.rejects(
          client.get("/hang", { timeout: 20 }),
          (e: any) => e.code === "ECONNABORTED",
        );
        const controller = new AbortController();
        const pending = client.get("/hang", { signal: controller.signal });
        controller.abort();
        await assert.rejects(pending, (e: any) => api.axios.isCancel(e));
        const source = api.axios.CancelToken.source();
        source.cancel("owned-stop");
        await assert.rejects(
          client.get("/echo", { cancelToken: source.token }),
          (e: any) => api.axios.isCancel(e) && e.message === "owned-stop",
        );
      }),
  ],
  [
    "original Desktop policies run through native Axios registry and real 401 responses",
    (factory) =>
      owned(factory, async ({ client, origin, seen }: any) => {
        let logouts = 0;
        const session = {
          account: { uid: "owned-user" },
          auth: { accessToken: "owned-token" },
        };
        const product = {
          getEndpoint: () => origin,
          waitConfiguration: async () => ({}),
          getCurrentConfiguration: () => ({ deploymentType: "Owned" }),
          configuration: { getValue: () => ({}) },
        };
        const policies = createNativeDesktopProductInterceptors({
          env: {},
          productManager: product,
        });
        const endpoint: any = new policies.ProductEndpointHttpInterceptor();
        endpoint.restOperations = client;
        endpoint.initialize();
        const auth = new policies.AuthenticationHttpInterceptor();
        Object.assign(auth, {
          restOperations: client,
          productManager: product,
          authenticationManager: {
            currentSessionSubject: { getValue: () => session },
            logout: () => {
              logouts++;
            },
          },
          logger: { warn() {} },
          notifier: { warn() {} },
        });
        auth.initialize();
        await client.get("/business-401");
        assert.equal(logouts, 1);
        await assert.rejects(client.get("/http-401"));
        assert.equal(logouts, 2);
        await client.get("/echo", {
          headers: { "X-Skip-Auth-Interceptor": true },
        });
        assert.equal(seen[0].headers.authorization, "Bearer owned-token");
        assert.equal(seen[0].headers["x-product"], "Owned");
        assert.equal(seen[0].headers["x-user-id"], "owned-user");
        assert.equal(seen[2].headers.authorization, undefined);
        assert.equal(seen[2].headers["x-skip-auth-interceptor"], undefined);
      }),
  ],
];
