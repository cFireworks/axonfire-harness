import assert from "node:assert/strict";
import { createServer } from "node:http";
type Factory = (runtime?: any) => any;
export function desktopInterceptorFixture(factory: Factory, env: any = {}) {
  const requests: any[] = [],
    responses: any[] = [],
    logs: any[] = [];
  let waits = 0,
    logouts = 0;
  let session: any = {
    account: {
      uid: "owned-user",
      enterpriseId: "owned-enterprise",
      departmentFullName: "owned-unit",
    },
    auth: { accessToken: "owned-token", domain: "owned-domain" },
  };
  const product = {
    getEndpoint: () => "http://owned.invalid",
    waitConfiguration: async () => {
      waits++;
      return {};
    },
    getCurrentConfiguration: () => ({ deploymentType: "Owned-Product" }),
    configuration: { getValue: () => ({ deploymentType: "Owned-Fallback" }) },
  };
  const api = factory({ env, productManager: product });
  const rest = {
    interceptors: {
      request: { use: (handler: any) => requests.push(handler) },
      response: {
        use: (accept: any, reject: any) => responses.push({ accept, reject }),
      },
    },
  };
  const endpoint = new api.ProductEndpointHttpInterceptor();
  endpoint.restOperations = rest;
  endpoint.initialize();
  const auth = new api.AuthenticationHttpInterceptor();
  Object.assign(auth, {
    restOperations: rest,
    productManager: product,
    authenticationManager: {
      currentSessionSubject: { getValue: () => session },
      logout: () => {
        logouts++;
      },
    },
    logger: { warn: (...v: any[]) => logs.push(v) },
    notifier: { warn: (...v: any[]) => logs.push(v) },
  });
  auth.initialize();
  return {
    api,
    auth,
    endpoint,
    product,
    requests,
    responses,
    logs,
    setSession: (s: any) => {
      session = s;
    },
    getSession: () => session,
    waits: () => waits,
    logouts: () => logouts,
    async request(config: any) {
      for (const handler of [...requests].reverse())
        config = await handler(config);
      return config;
    },
  };
}
export const desktopInterceptorScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "auth headers, caller overrides and skip/no-auth flags retain original semantics",
    async (factory) => {
      const f = desktopInterceptorFixture(factory);
      const config = await f.request({ url: "/owned" });
      assert.deepEqual(config.headers, {
        Authorization: "Bearer owned-token",
        "X-User-Id": "owned-user",
        "X-Enterprise-Id": "owned-enterprise",
        "X-Department-Info": "owned-unit",
        "X-Tenant-Id": "owned-enterprise",
        "X-Domain": "owned-domain",
        "X-Product": "Owned-Product",
      });
      const custom = await f.request({
        url: "/owned",
        headers: {
          Authorization: "Custom",
          "X-User-Id": "custom",
          "X-Product": "custom",
          "X-No-Enterprise-Id": true,
          "X-No-Department-Info": true,
        },
      });
      assert.equal(custom.headers.Authorization, "Custom");
      assert.equal(custom.headers["X-User-Id"], "custom");
      assert.equal(custom.headers["X-Enterprise-Id"], undefined);
      assert.equal(custom.headers["X-Tenant-Id"], "owned-enterprise");
      assert.equal(custom.headers["X-Product"], "custom");
      const skipped = await f.request({
        url: "/owned",
        headers: { "X-Skip-Auth-Interceptor": true },
      });
      assert.deepEqual(skipped.headers, { "X-Product": "Owned-Product" });
      const denied = await f.request({
        url: "/owned",
        headers: { "X-No-Authorization": true, "X-No-User-Id": true },
      });
      assert.equal(denied.headers.Authorization, undefined);
      assert.equal(denied.headers["X-User-Id"], undefined);
      assert.equal(denied.headers["X-No-Authorization"], true);
    },
  ],
  [
    "product routes bypass configuration wait; other requests replace baseURL",
    async (factory) => {
      const f = desktopInterceptorFixture(factory);
      assert.equal(
        (
          await f.request({
            url: "/v3/config",
            baseURL: "http://explicit.invalid",
          })
        ).baseURL,
        "http://explicit.invalid",
      );
      assert.equal(f.waits(), 0);
      assert.equal(
        (await f.request({ url: "/prefix/config/models/suffix" })).baseURL,
        "http://owned.invalid",
      );
      assert.equal(f.waits(), 0);
      assert.equal(
        (
          await f.request({
            url: "/normal",
            baseURL: "http://explicit.invalid",
          })
        ).baseURL,
        "http://owned.invalid",
      );
      assert.equal(f.waits(), 1);
      f.setSession(undefined);
      assert.equal(
        (await f.request({ url: "/normal" })).headers.Authorization,
        undefined,
      );
    },
  ],
  [
    "early and late environment overrides remain scoped to each factory",
    async (factory) => {
      const f = desktopInterceptorFixture(factory, {
        WORKBUDDY_DEV_ENDPOINT_OVERRIDE: "http://dev.invalid",
      });
      assert.equal(
        (await f.request({ url: "/v2/config" })).baseURL,
        "http://dev.invalid",
      );
      f.api.setProductEndpointOverride({
        resolve: () => "http://manual.invalid",
      });
      assert.equal(
        (await f.request({ url: "/normal" })).baseURL,
        "http://manual.invalid",
      );
      const lateEnv: any = {};
      const independent = desktopInterceptorFixture(factory, lateEnv);
      assert.equal(
        independent.api.getProductEndpointOverride().resolve(),
        undefined,
      );
      lateEnv.WORKBUDDY_DEV_ENDPOINT_OVERRIDE = "http://late.invalid";
      independent.endpoint.initialize();
      assert.equal(
        independent.api.getProductEndpointOverride().resolve(),
        "http://late.invalid",
      );
    },
  ],
  [
    "401 logout checks token, endpoint, override and exact/path-pattern exemptions",
    async (factory) => {
      const f = desktopInterceptorFixture(factory);
      f.auth.checkToLogout("Bearer stale", "http://owned.invalid", "/normal");
      assert.equal(f.logouts(), 0);
      f.auth.checkToLogout(
        "Bearer owned-token",
        "http://owned.invalid",
        "http://external.invalid/normal",
      );
      assert.equal(f.logouts(), 0);
      for (const path of [
        "/api/memory/profile?x=1",
        "/v2/enterprises/e/member-custom-model-policy/user-check",
        "http://owned.invalid/v2/enterprises/e/skill-upload-policy/user-check",
      ])
        f.auth.checkToLogout(
          "Bearer owned-token",
          "http://owned.invalid",
          path,
        );
      assert.equal(f.logouts(), 0);
      f.auth.checkToLogout(
        "Bearer owned-token",
        "http://owned.invalid",
        "/api/memory/profile-extra",
      );
      assert.equal(f.logouts(), 1);
      f.api.setProductEndpointOverride({ resolve: () => "http://dev.invalid" });
      f.auth.checkToLogout(
        "Bearer owned-token",
        "http://owned.invalid",
        "/normal",
      );
      assert.equal(f.logouts(), 1);
      // Preserve the captured prefix test; this is not a strict URL-origin check.
      assert.equal(
        f.auth.isEndpointMatch(
          "https://owned.invalid",
          "https://owned.invalid.example",
          undefined,
        ),
        true,
      );
    },
  ],
  [
    "business and HTTP 401 paths retain responses and reject errors without replacing them",
    async (factory) => {
      const f = desktopInterceptorFixture(factory);
      const config = await f.request({ url: "/normal" });
      const response = { data: { code: 401 }, config };
      assert.equal(await f.responses[0].accept(response), response);
      assert.equal(f.logouts(), 1);
      const error = { response: { status: 401, config } };
      await assert.rejects(f.responses[0].reject(error), (e) => e === error);
      assert.equal(f.logouts(), 2);
      f.setSession({ ...f.getSession(), auth: { accessToken: "replacement" } });
      await f.responses[0].accept(response);
      assert.equal(f.logouts(), 2);
    },
  ],
  [
    "real HTTP exchange runs original headers and both 401 response paths",
    async (factory) => {
      const seen: any[] = [];
      const server = createServer((req, res) => {
        seen.push({
          url: req.url,
          authorization: req.headers.authorization,
          product: req.headers["x-product"],
          user: req.headers["x-user-id"],
        });
        res.writeHead(req.url === "/http-401" ? 401 : 200, {
          "content-type": "application/json",
        });
        res.end(JSON.stringify({ code: 401 }));
      });
      await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
      try {
        const address = server.address();
        assert.ok(address && typeof address !== "string");
        const origin = `http://127.0.0.1:${address.port}`,
          f = desktopInterceptorFixture(factory);
        f.product.getEndpoint = () => origin;
        // Explicit HTTP executor runs the captured interceptors; it is not a CellJS REST replacement.
        async function send(url: string) {
          const config = await f.request({ url });
          const response = await fetch(new URL(url, config.baseURL), {
            headers: config.headers,
          });
          const value = {
            data: await response.json(),
            config,
            status: response.status,
          };
          return response.ok
            ? f.responses[0].accept(value)
            : f.responses[0].reject({ response: value });
        }
        await send("/business-401");
        assert.equal(f.logouts(), 1);
        await assert.rejects(send("/http-401"));
        assert.equal(f.logouts(), 2);
        await send("/api/memory/profile");
        assert.equal(f.logouts(), 2);
        assert.deepEqual(
          seen.map((x) => [x.authorization, x.product, x.user]),
          Array(3).fill(["Bearer owned-token", "Owned-Product", "owned-user"]),
        );
      } finally {
        server.closeAllConnections();
        await new Promise<void>((r, j) =>
          server.close((e) => (e ? j(e) : r())),
        );
      }
    },
  ],
];
