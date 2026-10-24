import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createServer, Agent } from "node:http";
import { createNativeDesktopRest } from "../../src/http/native-desktop-rest.js";
type Factory = (runtime?: any) => any;
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-env-provider-")),
    env: any = {},
    dirname = path.join(root, "nested", "main");
  fs.mkdirSync(dirname, { recursive: true });
  const api = factory({ process: { env }, dirname }),
    provider = Object.assign(
      new api.WorkbuddyInternetEnviromentProductProvider(),
      { fs, configBasePath: root, logger: { setContext() {}, debug() {} } },
    );
  provider.init();
  try {
    await run({ api, provider, root, env, dirname });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const desktopEnvironmentProvidersScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "environment precedence and JSON environment fallback",
    (f) =>
      owned(f, async (s) => {
        s.env.ONE = "{bad";
        s.env.TWO = JSON.stringify({ networkEnvironment: "cloud" });
        assert.equal(
          s.provider.resolveEnvironment({ productConfigEnv: ["ONE", "TWO"] }),
          "cloud",
        );
        assert.equal(
          s.provider.resolveEnvironment({
            networkEnvironment: "current",
            productConfigEnv: ["TWO"],
          }),
          "current",
        );
        s.env.CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT = "explicit";
        assert.equal(
          s.provider.resolveEnvironment({ networkEnvironment: "current" }),
          "explicit",
        );
        assert.equal(
          s.provider.priority,
          s.api.ProductProviderPriority.CLIENT + 5,
        );
      }),
  ],
  [
    "real product file strips authentication and caches a shared lowercase object",
    (f) =>
      owned(f, async (s) => {
        const file = path.join(s.root, "product.internal.json");
        fs.writeFileSync(
          file,
          JSON.stringify({
            endpoint: "https://internal.invalid",
            authentication: { id: "must-strip" },
            models: [{ id: "first" }],
          }),
        );
        const first = await s.provider.provide({
          current: { networkEnvironment: "INTERNAL" },
        });
        assert.equal(first.authentication, undefined);
        assert.equal(first.endpoint, "https://internal.invalid");
        fs.writeFileSync(file, JSON.stringify({ endpoint: "changed" }));
        first.models.push({ id: "mutated" });
        const second = await s.provider.provide({
          current: { networkEnvironment: "internal" },
        });
        assert.equal(first, second);
        assert.equal(second.models.length, 2);
        assert.equal(second.endpoint, "https://internal.invalid");
      }),
  ],
  [
    "search order, malformed file recovery and optional filesystem",
    (f) =>
      owned(f, async (s) => {
        const file = "product.external.json";
        fs.writeFileSync(
          path.join(s.dirname, file),
          JSON.stringify({ endpoint: "adjacent" }),
        );
        fs.writeFileSync(path.join(s.root, file), "{bad");
        assert.deepEqual(
          await s.provider.provide({
            current: { networkEnvironment: "external" },
          }),
          {},
        );
        fs.unlinkSync(path.join(s.root, file));
        assert.equal(
          (
            await s.provider.provide({
              current: { networkEnvironment: "external" },
            })
          ).endpoint,
          "adjacent",
        );
        const fallback = new s.api.WorkbuddyInternetEnviromentProductProvider();
        fallback.logger = { debug() {} };
        assert.deepEqual(
          await fallback.provide({
            current: { networkEnvironment: "external" },
          }),
          {},
        );
        assert.equal(s.provider.resolveProductPath("missing.json"), undefined);
      }),
  ],
  [
    "development resolver shares the original endpoint override and updates dynamically",
    (f) =>
      owned(f, async (s) => {
        const provider = new s.api.WorkbuddyDevEnvEndpointProductProvider();
        assert.equal(
          provider.priority,
          s.api.ProductProviderPriority.CLIENT - 1000,
        );
        assert.deepEqual(await provider.provide({}), {});
        let endpoint = "https://dev.invalid";
        const resolver = { resolve: () => endpoint };
        s.api.setDevEnvEndpointResolver(resolver);
        assert.equal(s.api.interceptors.getProductEndpointOverride(), resolver);
        assert.deepEqual(await provider.provide({}), { endpoint });
        endpoint = "";
        assert.deepEqual(await provider.provide({}), {});
      }),
  ],
  [
    "original HTTP interceptor uses developer endpoint before product sync",
    async (f) => {
      const seen: string[] = [],
        server = createServer((req, res) => {
          seen.push(req.url!);
          res.setHeader("content-type", "application/json");
          res.end("{}");
        });
      await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
      const address = server.address();
      assert.ok(address && typeof address !== "string");
      const origin = `http://127.0.0.1:${address.port}`,
        agent = new Agent({ keepAlive: false });
      try {
        const product = {
          getEndpoint: () => origin + "/stale",
          waitConfiguration: async () => ({}),
          getCurrentConfiguration: () => ({}),
          configuration: { getValue: () => ({}) },
        };
        const api = f({ process: { env: {} }, productManager: product });
        const restApi = createNativeDesktopRest(),
          rest = Object.assign(new restApi.DefaultRestOperationsFactory(), {
            clientConfig: {
              baseURL: origin + "/stale",
              httpAgent: agent,
              proxy: false,
              timeout: 2000,
            },
          }).create();
        Object.assign(new api.interceptors.ProductEndpointHttpInterceptor(), {
          restOperations: rest,
        }).initialize();
        api.setDevEnvEndpointResolver({ resolve: () => origin + "/dev" });
        await rest.get("/probe");
        assert.deepEqual(seen, ["/dev/probe"]);
        assert.equal(product.getEndpoint(), origin + "/stale");
      } finally {
        agent.destroy();
        server.closeAllConnections();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  ],
];
