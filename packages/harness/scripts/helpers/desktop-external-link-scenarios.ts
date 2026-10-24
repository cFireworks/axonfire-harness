import { createNativeDesktopProductEnvironment } from "../../src/auth/native-desktop-product-environment.js";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createNativeDesktopFileAuthentication } from "../../src/auth/native-desktop-file-authentication.js";
import { createNativeDesktopProductInterceptors } from "../../src/http/native-desktop-product-interceptors.js";
import assert from "node:assert/strict";
import { Subject, BehaviorSubject } from "rxjs";
import { createServer, Agent } from "node:http";
import { Readable } from "node:stream";
import { createNativeDesktopRest } from "../../src/http/native-desktop-rest.js";
import { createNativeDesktopAuthentication } from "../../src/auth/native-desktop-authentication.js";
import { withOwnedDesktopAuthentication } from "./desktop-auth-scenarios.js";
type Factory = (runtime?: any) => any;
const tick = () => new Promise<void>((r) => setImmediate(r));
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  let now = 1700000000000;
  const timers = new Map<any, any>(),
    opened: string[] = [],
    steps: any[] = [],
    calls: any[] = [],
    env: any = {};
  class Clock extends Date {
    static now() {
      return now;
    }
  }
  const runtime = {
    Date: Clock,
    process: { env },
    setTimeout: (fn: any, ms: number) => {
      const h = { fn, ms };
      if (ms === 1000)
        queueMicrotask(() => {
          now += ms;
          fn();
        });
      else timers.set(h, h);
      return h;
    },
    clearTimeout: (h: any) => timers.delete(h),
  };
  const api = factory(runtime),
    provider = new api.ExternalLinkAuthenticationProvider(),
    config = new BehaviorSubject<any>({
      authentication: {
        type: api.AuthenticationType.EXTERNAL_LINK,
        endpoint: "https://owned.invalid",
        attributes: { platform: "workbuddy", prefixPath: "/console" },
      },
    }),
    subject = new Subject<string>();
  const token = () => ({
    accessToken: "owned-token",
    refreshToken: "owned-refresh",
    expiresIn: 3600,
    refreshExpiresIn: 7200,
  });
  const account = { uid: "owned", type: api.Edition.Personal, lastLogin: true };
  const rest = {
    post: async (url: string, ...args: any[]) => {
      calls.push(["post", url, ...args]);
      return {
        data: {
          data: url.includes("/auth/state")
            ? { state: "owned-state", authUrl: "https://owned.invalid/login" }
            : token(),
        },
      };
    },
    get: async (url: string, ...args: any[]) => {
      calls.push(["get", url, ...args]);
      return {
        data: {
          data: url.includes("/auth/token")
            ? token()
            : url.endsWith("/accounts")
              ? {
                  accounts: [
                    {
                      ...account,
                      avatar_url: " https://owned.invalid/avatar ",
                      pluginEnabled: false,
                    },
                  ],
                }
              : account,
        },
      };
    },
  };
  const product = {
    configuration: config,
    waitConfiguration: async () => config.getValue(),
  };
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error"].map((k) => [k, () => {}]),
  );
  Object.assign(provider, {
    productManager: product,
    productEnvService: { switch: async (t: any) => calls.push(["switch", t]) },
    logger,
    restOperations: rest,
    clientInfoProvider: {
      get: async () => ({ pluginVersion: "owned-version" }),
    },
    externalUriOpener: {
      urlSubject: subject,
      open: async (url: string) => {
        opened.push(url);
        return true;
      },
    },
  });
  provider.init();
  const span: any = {
    requestHeaders: { "X-Owned-Trace": "trace" },
    startSpan: () => span,
    markAsSuccessful() {},
    markAsFailed() {},
  };
  const ctx = () => ({
    traceSpan: span,
    abortController: new AbortController(),
  });
  try {
    await run({
      api,
      provider,
      config,
      subject,
      rest,
      product,
      opened,
      steps,
      calls,
      env,
      timers,
      ctx,
      token,
      account,
      runtime,
      advance: (ms: number) => {
        now += ms;
      },
      now: () => now,
    });
  } finally {
    api.setLoginStepCallback(undefined);
    config.complete();
    subject.complete();
    assert.equal(timers.size, 0);
  }
}
export const desktopExternalLinkScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "complete login preserves browser-failure polling and WorkBuddy account metadata",
    (f) =>
      owned(f, async (s) => {
        s.env.launch_schema = "owned";
        s.provider.externalUriOpener.open = async (url: string) => {
          s.opened.push(url);
          return false;
        };
        s.api.setLoginStepCallback(
          (...v: any[]) => s.steps.push(v),
          undefined,
          "login-1",
        );
        assert.equal(await s.provider.support({ type: "external" }), true);
        const ctx = s.ctx(),
          session = await s.provider.createSession(ctx);
        assert.equal(ctx.browserOpened, false);
        assert.equal(session.account.avatarUrl, "https://owned.invalid/avatar");
        assert.equal(session.accounts.length, 0);
        assert.equal(session.allAccounts.length, 1);
        assert.equal(session.auth.expiresAt, 1700003601000);
        const url = new URL(s.opened[0]);
        assert.equal(url.searchParams.get("loginSessionId"), "login-1");
        assert.equal(url.searchParams.get("launch_schema"), "owned");
        assert.equal(url.searchParams.get("version"), "owned-version");
        assert.deepEqual(
          s.steps.map((v: any) => v[0]),
          [
            "state_request",
            "state_received",
            "browser_open",
            "polling_start",
            "token_received",
            "account_received",
            "completed",
          ],
        );
        assert.equal(
          s.calls.find((v: any) => v[1]?.includes("/auth/token"))[2].headers[
            "X-No-Authorization"
          ],
          "true",
        );
      }),
  ],
  [
    "versioned callbacks and original unversioned outer timeout boundary",
    (f) =>
      owned(f, async (s) => {
        const old: any[] = [],
          current: any[] = [];
        const v1 = s.api.setLoginStepCallback(
          (...v: any[]) => old.push(v),
          undefined,
          "old",
        );
        const v2 = s.api.setLoginStepCallback(
          (...v: any[]) => current.push(v),
          undefined,
          "new",
        );
        assert.equal(s.api.setLoginStepCallback(undefined, v1), v2);
        s.api.emitLoginStep(v1, "stale", {});
        s.api.emitLoginStep(v2, "fresh", {});
        assert.equal(old.length, 0);
        assert.equal(current[0][0], "fresh");
        let reject!: (e: any) => void;
        s.rest.post = () =>
          new Promise((_r, j) => {
            reject = j;
          });
        const pending = s.provider.createSession(s.ctx());
        s.api.setLoginStepCallback(
          (...v: any[]) => current.push(v),
          undefined,
          "newer",
        );
        [...s.timers.values()][0].fn();
        await assert.rejects(
          pending,
          (e: any) => e instanceof s.api.OpenExternalLinkError,
        );
        assert.equal(current.at(-1)[0], "polling_timeout");
        reject(new s.api.CanceledError());
        await tick();
      }),
  ],
  [
    "poll retry codes, five account authorization retries, cancellation and timeout",
    (f) =>
      owned(f, async (s) => {
        let calls = 0;
        s.rest.get = async () => {
          if (++calls < 3)
            throw { code: s.api.ServerErrorCode.RetryFetchToken };
          return { data: { data: s.token() } };
        };
        assert.equal(
          (await s.provider.loopGetToken({ state: "s" }, s.now(), s.ctx()))
            .accessToken,
          "owned-token",
        );
        assert.equal(calls, 3);
        calls = 0;
        s.rest.get = async () => {
          calls++;
          throw { response: { status: 401 } };
        };
        await assert.rejects(
          s.provider.loopGetAccount(
            { state: "s" },
            s.token(),
            s.now(),
            s.ctx(),
          ),
          (e: any) => e.response.status === 401,
        );
        assert.equal(calls, 6);
        const ctx = s.ctx();
        ctx.abortController.abort();
        await assert.rejects(
          s.provider.loopGetToken({ state: "s" }, s.now(), ctx),
          (e: any) => e instanceof s.api.CanceledError,
        );
        await assert.rejects(
          s.provider.loopGetToken({ state: "s" }, s.now() - 300000, s.ctx()),
          (e: any) => e instanceof s.api.TimeoutError,
        );
      }),
  ],
  [
    "license errors, refresh unauthorized mapping and stream IP-limit detection",
    (f) =>
      owned(f, async (s) => {
        for (const code of [12005, 11212, 11216]) {
          s.rest.post = async () => {
            throw {
              response: { status: 400, data: { code, msg: "owned-license" } },
            };
          };
          await assert.rejects(
            s.provider.fetchAuthState(s.ctx()),
            (e: any) => e instanceof s.api.SignLicenseError && e.code === code,
          );
        }
        s.rest.post = async () => {
          throw { isAxiosError: true, response: { status: 403 } };
        };
        await assert.rejects(
          s.provider.refreshSession(
            { auth: s.token(), account: s.account },
            s.ctx(),
          ),
          (e: any) => e instanceof s.api.UnauthorizedError,
        );
        assert.equal(
          await s.provider.isIpLimitError({
            response: {
              data: Readable.from([JSON.stringify({ code: 10081 })]),
            },
          }),
          true,
        );
        s.rest.post = async () => {
          throw { response: { data: { code: 10081 } } };
        };
        await assert.rejects(
          s.provider.switchAccount(
            { ...s.account, enterpriseId: "team" },
            { auth: s.token() },
            s.ctx(),
          ),
          (e: any) => e instanceof s.api.SignIpLimitError,
        );
      }),
  ],
  [
    "refresh account snapshots, enterprise switching and identity-safe merge",
    (f) =>
      owned(f, async (s) => {
        const refreshed = await s.provider.refreshSession(
          { auth: s.token(), account: s.account },
          s.ctx(),
        );
        assert.equal(
          refreshed.account.avatarUrl,
          "https://owned.invalid/avatar",
        );
        assert.equal(refreshed.allAccounts.length, 1);
        assert.equal(refreshed.accounts.length, 0);
        const switched = await s.provider.switchAccount(
          { uid: "owned", type: s.api.Edition.Ultimate, enterpriseId: "team" },
          { auth: { ...s.token(), domain: "custom.domain" } },
          s.ctx(),
        );
        assert.equal(switched.auth.domain, "custom.domain");
        const call = s.calls.find((v: any) =>
          v[1]?.includes("/login/enterprise/team"),
        );
        assert.equal(call[3].headers["X-Tenant-Id"], "team");
        const original = { uid: "same", type: "ultimate" };
        const merged = s.api.mergeCurrentAccountDetails(original, [
          { ...original, enterpriseId: "one", lastLogin: true },
          { ...original, enterpriseId: "two", lastLogin: true },
        ]);
        assert.equal(merged.enterpriseId, undefined);
        s.config.next({ authentication: { type: "other" }, platform: "other" });
        assert.equal(await s.provider.support(), false);
        const noRefresh = { auth: { accessToken: "opaque" } };
        assert.equal(
          await s.provider.refreshSession(noRefresh, s.ctx()),
          noRefresh,
        );
      }),
  ],
  [
    "real original REST login flows through complete manager and persists session",
    (f) =>
      owned(f, async (s) => {
        s.config.getValue().authentication.attributes.externalDomain =
          "owned.invalid";
        const root = await fs.mkdtemp(
          path.join(os.tmpdir(), "axon-external-login-"),
        );
        let file: any;
        const requests: any[] = [],
          server = createServer(async (req, res) => {
            for await (const _ of req) {
            }
            requests.push({ url: req.url, headers: req.headers });
            const url = req.url!;
            res.writeHead(200, { "content-type": "application/json" });
            res.end(
              JSON.stringify({
                data: url.includes("/auth/state")
                  ? {
                      state: "http-state",
                      authUrl: "https://owned.invalid/login",
                    }
                  : url.includes("/auth/token")
                    ? { ...s.token(), domain: "owned.invalid" }
                    : url.endsWith("/accounts")
                      ? { accounts: [{ ...s.account, pluginEnabled: true }] }
                      : s.account,
              }),
            );
          });
        await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
        const addr = server.address();
        assert.ok(addr && typeof addr !== "string");
        const agent = new Agent({ keepAlive: false });
        try {
          const restApi = createNativeDesktopRest(),
            restFactory = Object.assign(
              new restApi.DefaultRestOperationsFactory(),
              {
                clientConfig: {
                  baseURL: `http://127.0.0.1:${addr.port}`,
                  httpAgent: agent,
                  proxy: false,
                  timeout: 3000,
                },
              },
            );
          s.provider.restOperations = restFactory.create();
          await withOwnedDesktopAuthentication(
            createNativeDesktopAuthentication,
            async (a) => {
              const sharedApi = f({ ...s.runtime, authenticationApi: a.api });
              const provider = Object.assign(
                new sharedApi.ExternalLinkAuthenticationProvider(),
                s.provider,
              );
              a.product.configuration.next(s.config.getValue());
              a.product.getEndpoint = () => `http://127.0.0.1:${addr.port}`;
              a.product.getCurrentConfiguration = () =>
                a.product.configuration.getValue();
              const fileApi = createNativeDesktopFileAuthentication();
              file = Object.assign(new fileApi.FileAuthenticationStorage(), {
                logger: a.logger,
                filePathService: { sharedDataPath: root },
                productManager: a.product,
              });
              a.manager.authenticationStorages = [file];
              const policy = createNativeDesktopProductInterceptors({
                env: {},
                productManager: a.product,
              });
              Object.assign(new policy.ProductEndpointHttpInterceptor(), {
                restOperations: provider.restOperations,
              }).initialize();
              Object.assign(new policy.AuthenticationHttpInterceptor(), {
                restOperations: provider.restOperations,
                authenticationManager: a.manager,
                productManager: a.product,
                logger: a.logger,
                notifier: { warn() {} },
              }).initialize();
              const envApi = createNativeDesktopProductEnvironment({
                process: { env: s.env },
                authenticationManager: a.manager,
              });
              const environment = Object.assign(
                new envApi.ProductEnvServiceImpl(),
                { productManager: a.product },
              );
              a.manager.productEnvService = environment;
              provider.productEnvService = environment;
              a.manager.authenticationProvider = { get: () => [provider] };
              assert.equal(sharedApi.CanceledError, a.api.CanceledError);
              await a.manager.doInit();
              await a.manager.login({ type: "external" });
              assert.equal(
                s.env[envApi.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT],
                "external",
              );
              assert.ok(a.calls.some((c: any) => c === "sync"));
              assert.equal(
                a.manager.currentSessionSubject.getValue().account.uid,
                "owned",
              );
              assert.equal(
                JSON.parse(
                  await fs.readFile(await file.getAuthSavePath(), "utf8"),
                ).account.uid,
                "owned",
              );
              assert.ok(
                requests.some(
                  (r) =>
                    r.url.endsWith("/accounts") &&
                    r.headers.authorization === "Bearer owned-token",
                ),
              );
              await a.manager.logout();
              assert.equal(
                a.manager.currentSessionSubject.getValue(),
                undefined,
              );
              assert.equal(await file.restore(), undefined);
              await fs.stat((await file.getAuthSavePath()) + ".logged-out");
            },
          );
        } finally {
          await file?.dispose();
          await fs.rm(root, { recursive: true, force: true });
          agent.destroy();
          server.closeAllConnections();
          await new Promise<void>((r) => server.close(() => r()));
        }
      }),
  ],
];
