// Owned test-only clock/DI/network/JWT boundaries. No installed account discovery or production requests.
import * as rxjs from "rxjs";
import * as operators from "rxjs/operators/index.js";
import { URI } from "vscode-uri";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";

export function authenticationFixture(
  factory = createNativeAuthenticationRuntime,
  patch: any = {},
) {
  let now = 1700000000000,
    serial = 0;
  const timers = new Map<any, { at: number; run: () => void }>(),
    calls: any[] = [],
    logs: any[] = [],
    spans: any[] = [],
    decoded: any[] = [];
  class Clock extends Date {
    constructor(value?: any) {
      super(value ?? now);
    }
    static override now() {
      return now;
    }
  }
  const timer = (run: () => void, ms: number) => {
    const id = ++serial;
    timers.set(id, { at: now + ms, run });
    return id;
  };
  const common: any = {},
    http = createNativeHttpRuntime();
  const telemetry: any = {
    Events: { UserAuthAction: "UserAuthAction" },
    UserAuthActionType: { Login: "Login", Logout: "Logout" },
  };
  for (const key of [
    "SPAN_LOGIN",
    "SPAN_SWITCH_ACCOUNT",
    "SPAN_REFRESH_SESSION",
    "SPAN_STORAGE_SESSION",
    "SPAN_OPEN_EXTERNAL_LINK",
    "SPAN_GET_AUTH_STATE",
    "SPAN_GET_AUTH_TOKEN",
    "SPAN_GET_ACCOUNT",
    "SPAN_GET_ACCOUNT_LIST",
  ])
    telemetry[key] = key;
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext"].map((key) => [
      key,
      (...args: any[]) => logs.push([key, ...args]),
    ]),
  ) as any;
  const env = { ...patch.env },
    runtime: any = {
      process: { env },
      Date: Clock,
      Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
      setTimeout: timer,
      clearTimeout: (id: any) => timers.delete(id),
      console: logger,
      require(id: string) {
        if (id === "fs/promises")
          return {
            readFile: async (file: string) => {
              calls.push(["spilled-read", file]);
              if (!Object.hasOwn(patch.files ?? {}, file))
                throw Error("unowned file");
              return patch.files[file];
            },
          };
        if (id === "wechatide" && patch.wechatide) return patch.wechatide;
        throw Error("Explicit owned require only: " + id);
      },
      modules: {
        80699: common,
        42315: rxjs,
        51098: operators,
        22186: { URI },
        79814: {},
        92735: telemetry,
        66915: {},
        67062: http.getModule(14516),
        // JWT decode is an explicit external-library double here, never signature verification or a product login.
        94959: {
          decode: (token: string, options: any) => {
            decoded.push([token, options]);
            return patch.jwt?.[token] ?? null;
          },
        },
        ...patch.modules,
      },
    };
  const native = factory(runtime);
  Object.assign(common, native.core);
  const C = native.classes,
    A = native.constants;
  const config: any = {
    authentication: { type: "owned-provider", attributes: {} },
    productFeatures: {},
    ...patch.config,
  };
  const product = {
    configuration: new rxjs.BehaviorSubject(config),
    waitConfiguration: async (force?: boolean) => {
      calls.push(["configuration", force]);
      return product.configuration.value;
    },
    sync: async (force?: boolean) => {
      calls.push(["sync", force]);
    },
    getEndpoint: () => "http://owned.invalid",
  };
  function span(name: string): any {
    const value: any = {
      traceId: "owned-trace",
      requestHeaders: { "x-owned-trace": "1" },
      startSpan: span,
      markAsFailed: (error?: any) =>
        spans.push([name, false, error?.message ?? error]),
      markAsSuccessful: () => spans.push([name, true]),
    };
    return value;
  }
  const storage = new C.DefaultAuthenticationStorage();
  const provider: any = {
    support: async () => true,
    getAuthenticationType: async () => ["owned-provider"],
    createSession: async () => session("owned-user"),
    refreshSession: async (value: any) => value,
    removeSession: async () => {},
    switchAccount: async (_target: any, value: any) => value,
  };
  const providers: any[] = [provider];
  const manager = new C.AuthenticationManagerImpl();
  Object.assign(manager, {
    logger,
    authenticationStorages: [storage],
    authenticationProvider: { get: () => providers },
    productManager: product,
    productEnvService: {
      switchBySession: async (value: any) => {
        calls.push(["switchBySession", value?.account?.uid]);
      },
      switch: async (value: any) => calls.push(["switchEnv", value]),
    },
    eventService: {
      report: (...args: any[]) => calls.push(["event", ...args]),
    },
    traceService: { startTrace: span },
    notifier: Object.fromEntries(
      ["info", "warn", "error"].map((key) => [
        key,
        (...args: any[]) => calls.push(["notify", key, ...args]),
      ]),
    ),
    filePathService: {
      setCurrentUserId: (id: string) => calls.push(["user-root", id]),
    },
  });
  function session(uid = "owned-user", extra: any = {}) {
    return {
      auth: {
        accessToken: "owned-opaque-token",
        refreshToken: "owned-refresh",
        lastRefreshTime: now,
        expiresAt: now + 7 * 86400000,
      },
      account: { uid, nickname: "Owned user", type: "personal" },
      accounts: [],
      ...extra,
    };
  }
  function deferred<T = any>() {
    let resolve!: (value: T) => void, reject!: (error: any) => void;
    const promise = new Promise<T>((yes, no) => {
      resolve = yes;
      reject = no;
    });
    return { promise, resolve, reject };
  }
  async function settle() {
    for (let i = 0; i < 80; i++) await Promise.resolve();
  }
  function external() {
    const p = new C.ExternalLinkAuthenticationProvider();
    Object.assign(p, {
      logger,
      productManager: product,
      productEnvService: manager.productEnvService,
      clientInfoProvider: {
        get: async () => ({ pluginVersion: "owned-version" }),
      },
      externalUriOpener: {
        urlSubject: new rxjs.Subject(),
        open: async (uri: string) => {
          calls.push(["open", uri]);
          return true;
        },
      },
      restOperations: {
        post: async () => {
          throw Error("Explicit owned REST response required");
        },
        get: async () => {
          throw Error("Explicit owned REST response required");
        },
      },
    });
    p.init();
    return p;
  }
  function custom() {
    const s = new C.CustomTokenAuthenticationStorageImpl(),
      p = new C.CustomTokenAuthenticationProvider();
    Object.assign(s, { productManager: product, logger });
    Object.assign(p, {
      productManager: product,
      logger,
      customTokenAuthenticationStorage: s,
    });
    return { storage: s, provider: p };
  }
  return {
    factory,
    native,
    runtime,
    C,
    A,
    common,
    env,
    manager,
    storage,
    provider,
    providers,
    product,
    calls,
    logs,
    spans,
    decoded,
    timers,
    session,
    deferred,
    settle,
    external,
    custom,
    now: () => now,
    setNow(value: number) {
      now = value;
    },
    async tick(ms = 0) {
      now += ms;
      for (const [id, entry] of [...timers])
        if (entry.at <= now) {
          timers.delete(id);
          entry.run();
        }
      await settle();
    },
    async close() {
      manager.dispose();
      await settle();
      product.configuration.complete();
      for (const value of [storage.storeSessionSubject]) value.complete();
      timers.clear();
    },
  };
}
