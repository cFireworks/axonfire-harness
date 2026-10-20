import { createNativeHttpHost } from "../../src/http/native-http-host.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";

export function nativeHttpFixture(factory = createNativeHttpRuntime) {
  const logs: any[] = [],
    metadata = new Map<any, Map<any, Map<any, any>>>();
  const define = (key: any, target: any, value: any, property?: any) => {
    let a = metadata.get(target);
    if (!a) metadata.set(target, (a = new Map()));
    let b = a.get(key);
    if (!b) a.set(key, (b = new Map()));
    b.set(property, value);
  };
  const reflection = {
    getOwnMetadata: (key: any, target: any, property?: any) =>
      metadata.get(target)?.get(key)?.get(property),
  };
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error"].map((name) => [
      name,
      (...args: any[]) => logs.push([name, ...args]),
    ]),
  );
  const host = createNativeHttpHost({
    sourceFactory: factory,
    Reflect: reflection,
    console: {
      ...console,
      error: (...args: any[]) => logs.push(["console-error", ...args]),
    },
  });
  const C = host.classes,
    context = host.Context;
  host.common.generateUUUID = () => "owned-trace-id";
  const pathResolver = new C.PathResolverImpl();
  pathResolver.serverPath = "/";
  const matcher = new C.RequestMatcherImpl();
  matcher.cacheSize = 8;
  const chain = new C.HandlerExecutionChainImpl();
  function request(path = "/owned", seed: any = {}) {
    const r: any = {
      path,
      method: "POST",
      headers: { "x-owned": "header" },
      body: { owned: true },
      query: { q: "owned-query" },
      ...seed,
    };
    r.get = (name: string) => r.headers[name.toLowerCase()];
    return r;
  }
  function response() {
    const headers: any = {},
      sent: any[] = [];
    return {
      headers,
      sent,
      statusCode: 200,
      writableEnded: false,
      body: undefined as any,
      setHeader(name: string, value: any) {
        headers[name.toLowerCase()] = value;
      },
      getHeader(name: string) {
        return headers[name.toLowerCase()];
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      end(body?: any) {
        sent.push(body);
        this.writableEnded = true;
      },
    };
  }
  function run<T>(
    operation: (ctx: any) => T,
    req = request(),
    res = response(),
  ): T {
    return host.run(req, res, (ctx) => {
      context.setSession({});
      return operation(ctx);
    });
  }
  function route(target: any, key = "run", extra: any = {}) {
    return {
      path: "/owned",
      methodMetadata: { target, key },
      controllerMetadata: { path: "/" },
      viewMetadata: {},
      bodyMetadata: [{ parameterIndex: 0 }],
      requestHeaderMetadata: [{ parameterIndex: 1 }],
      ...extra,
    };
  }
  function mvc(routes: any[]) {
    const mapping = new Map<any, any[]>();
    mapping.set("POST", routes);
    const match = new C.RouteMetadataMatcherImpl();
    Object.assign(match, {
      routeProvider: {
        provide: async () => ({ mapping, errorMapping: new Map() }),
      },
      requestMatcher: matcher,
    });
    const args = [
      "ResponseMethodArgsResolver",
      "RequestMethodArgsResolver",
      "SessionMethodArgsResolver",
      "CookieMethodArgsResolver",
      "QueryMethodArgsResolver",
      "ParamMethodArgsResolver",
      "HeaderMethodArgsResolver",
      "BodyMethodArgsResolver",
    ].map((name) => new C[name]());
    const adapter = new C.MvcHandlerAdapter();
    Object.assign(adapter, {
      routeMetadataMatcher: match,
      requestMatcher: matcher,
      pathResolver,
      mvcPath: "/*",
      methodArgsResolverProvider: new C.MethodArgsResolverProvider(args),
      responseResolverProvider: new C.ResponseResolverProvider([]),
      pipeManager: { apply: async () => {} },
      viewResolver: { resolve: async () => {} },
    });
    return { adapter, match, mapping, args };
  }
  const normalize = (value: any) =>
    JSON.parse(
      JSON.stringify(value, (_key, v) =>
        v instanceof Error ? { name: v.name, message: v.message } : v,
      ),
    );
  return {
    factory,
    host,
    native: host.native,
    C,
    context,
    logger,
    logs,
    define,
    reflection,
    pathResolver,
    matcher,
    chain,
    request,
    response,
    run,
    route,
    mvc,
    normalize,
    close: host.close,
  };
}
