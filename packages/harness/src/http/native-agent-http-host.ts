import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createNativeHttpHost } from "./native-http-host.js";
import type { createNativeHttpRuntime } from "./native-http-runtime.js";
import {
  SESSION_INGRESS_CONTROLLER,
  SESSION_INGRESS_ROUTES,
  SESSION_INGRESS_PARAMETERS,
} from "../sessions/native-session-ingress.js";

export interface NativeAgentHttpHostOptions {
  logger: {
    info(...args: any[]): void;
    error(...args: any[]): void;
    debug?(...args: any[]): void;
    warn?(...args: any[]): void;
  };
  /** Local bridge policy, not a recovered WorkBuddy setting. Always binds IPv4 loopback. */
  port?: number;
  maxBodyBytes?: number;
  /** Optional explicit local capability; never an application account token. */
  capability?: string;
  onDispatch?(request: IncomingMessage, response: ServerResponse): void;
  sourceFactory?: typeof createNativeHttpRuntime;
}

export interface NativeAgentHttpDependencies {
  controller: any;
  sessionMiddleware: any;
  views: any[];
  defaultViewName: string;
  errorHandlers: any[];
  pipeManager: { apply(target: any, args: any[]): Promise<any> };
  endpointProvider: {
    setServer(server: ReturnType<typeof createServer>): Promise<any>;
  };
  responseResolvers?: any[];
}

/** Explicit parent assembly, not original bootstrap. Runs complete original MVC/CLS/
 * ingress/view components; owns Node listener, JSON adapter, local REST transport and
 * namespace only. Authentication, sessions, View and SDK execution remain borrowed.
 */
export function createNativeAgentHttpHost(options: NativeAgentHttpHostOptions) {
  const port = options.port ?? 0,
    maxBodyBytes = options.maxBodyBytes ?? 1024 * 1024,
    capability = options.capability ?? randomBytes(32).toString("hex");
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw Error("Invalid native agent HTTP port");
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes < 1)
    throw Error("Invalid native agent HTTP body limit");
  if (capability.length < 32 || /[^\x21-\x7e]/.test(capability))
    throw Error(
      "Native agent HTTP capability must contain at least 32 visible ASCII characters",
    );
  const metadata = new WeakMap<object, Map<any, Map<any, any>>>();
  const http = createNativeHttpHost({
    ...(options.sourceFactory ? { sourceFactory: options.sourceFactory } : {}),
    Reflect: {
      getOwnMetadata: (key: any, target: object, property?: any) =>
        metadata.get(target)?.get(key)?.get(property),
    },
  });
  const native = http.native,
    C = http.classes,
    context = http.Context,
    pathResolver = new C.PathResolverImpl(),
    matcher = new C.RequestMatcherImpl();
  // Explicit host configuration, not inferred defaults of the original DI container.
  pathResolver.serverPath = "/";
  matcher.cacheSize = 128;
  const dispatches = new Set<Promise<any>>(),
    transports = new Set<Promise<any>>(),
    controllers = new Set<AbortController>(),
    errors: unknown[] = [];
  let origin = "",
    state: "created" | "starting" | "running" | "stopping" | "closed" =
      "created",
    starting: Promise<string> | undefined,
    closing: Promise<void> | undefined,
    dispatcher: any;
  const securityHeader = "x-codebuddy-request";
  function define(key: any, target: object, value: any, property?: any) {
    let keys = metadata.get(target);
    if (!keys) metadata.set(target, (keys = new Map()));
    let properties = keys.get(key);
    if (!properties) keys.set(key, (properties = new Map()));
    properties.set(property, value);
  }
  function track<T>(set: Set<Promise<any>>, promise: Promise<T>): Promise<T> {
    set.add(promise);
    void promise.then(
      () => set.delete(promise),
      () => set.delete(promise),
    );
    return promise;
  }
  function authorized(request: IncomingMessage) {
    const actual = request.headers.authorization,
      expected = Buffer.from("Bearer " + capability);
    if (typeof actual !== "string") return false;
    const supplied = Buffer.from(actual);
    return (
      supplied.length === expected.length && timingSafeEqual(supplied, expected)
    );
  }
  function ingressError(status: number, message: string) {
    return Object.assign(Error(message), { ingressStatus: status });
  }
  function readBody(request: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let bytes = 0;
      const cleanup = () => {
        request.off("data", data);
        request.off("end", end);
        request.off("error", error);
        request.off("aborted", aborted);
      };
      const fail = (reason: unknown) => {
        cleanup();
        request.resume();
        reject(reason);
      };
      const data = (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > maxBodyBytes)
          fail(ingressError(413, "Request body too large"));
        else chunks.push(chunk);
      };
      const end = () => {
        cleanup();
        try {
          const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if (!value || typeof value !== "object" || Array.isArray(value))
            throw Error("Expected an object");
          resolve(value);
        } catch {
          reject(ingressError(400, "Invalid JSON object"));
        }
      };
      const error = (reason: Error) => fail(reason),
        aborted = () => fail(ingressError(400, "Request aborted"));
      request.on("data", data);
      request.once("end", end);
      request.once("error", error);
      request.once("aborted", aborted);
    });
  }
  const server = createServer((request, response) => {
    const operation = (async () => {
      if (state !== "running") {
        response.writeHead(503);
        response.end("Native agent HTTP is not accepting requests");
        request.resume();
        return;
      }
      if (!authorized(request) || request.headers[securityHeader] !== "1") {
        response.writeHead(403);
        response.end();
        request.resume();
        return;
      }
      const url = new URL(request.url ?? "/", "http://127.0.0.1"),
        root = "/" + SESSION_INGRESS_CONTROLLER[0];
      if (
        !(
          (request.method === "POST" && url.pathname === root) ||
          (request.method === "GET" && url.pathname === root + "/models")
        )
      ) {
        response.writeHead(404);
        response.end();
        request.resume();
        return;
      }
      const adapted: any = request;
      if (request.method === "POST") {
        if (
          request.headers["content-type"]
            ?.split(";")[0]
            ?.trim()
            .toLowerCase() !== "application/json"
        )
          throw ingressError(415, "Expected application/json");
        adapted.body = await readBody(request);
      }
      adapted.path = url.pathname;
      adapted.query = Object.fromEntries(url.searchParams);
      adapted.get = (name: string) => request.headers[name.toLowerCase()];
      options.onDispatch?.(request, response);
      await http.run(request, response, (ctx) => {
        context.setSession({});
        return dispatcher.dispatch(ctx);
      });
    })().catch((error) => {
      if (!error.ingressStatus) {
        errors.push(error);
        options.logger.error("[Native agent HTTP] dispatch failed", error);
      }
      if (!response.writableEnded && !response.destroyed) {
        response.statusCode = error.ingressStatus ?? 500;
        response.end(
          error.ingressStatus ? error.message : "Native agent HTTP failed",
        );
      }
    });
    track(dispatches, operation);
  });
  // Listener errors after startup must be observable without crashing the process.
  server.on("error", (error) => {
    if (state === "running") {
      errors.push(error);
      options.logger.error("[Native agent HTTP] server failed", error);
    }
  });
  function assemble(deps: NativeAgentHttpDependencies) {
    const key = native.getModule(90014).METADATA_KEY,
      ctor = deps.controller.constructor;
    define(key.controller, ctor, { path: SESSION_INGRESS_CONTROLLER[0] });
    define(
      key.controllerMethod,
      ctor,
      SESSION_INGRESS_ROUTES.map(([method, path, name]) => ({
        key: name,
        method,
        options: path,
      })),
    );
    for (const [name, parameterIndex, kind] of SESSION_INGRESS_PARAMETERS)
      define(
        kind === "Body" ? key.controllerBody : key.controllerRequestHeader,
        ctor,
        [{ parameterIndex }],
        name,
      );
    const builder = new C.RouteBuilder();
    builder.controllers = [deps.controller];
    builder.pathResolver = pathResolver;
    const provider = new C.RouteProviderImpl();
    provider.routeBuilder = builder;
    const routeMatcher = new C.RouteMetadataMatcherImpl();
    Object.assign(routeMatcher, {
      routeProvider: provider,
      requestMatcher: matcher,
    });
    const resolver = new C.ViewResolverImpl();
    resolver.defaultViewName = deps.defaultViewName;
    resolver.viewProvider = new C.ViewProvider(deps.views);
    const args = [
      "Response",
      "Request",
      "Session",
      "Cookie",
      "Query",
      "Param",
      "Header",
      "Body",
    ].map((name) => new C[name + "MethodArgsResolver"]());
    const adapter = new C.MvcHandlerAdapter();
    Object.assign(adapter, {
      routeMetadataMatcher: routeMatcher,
      requestMatcher: matcher,
      pathResolver,
      mvcPath: "/*",
      methodArgsResolverProvider: new C.MethodArgsResolverProvider(args),
      responseResolverProvider: new C.ResponseResolverProvider(
        deps.responseResolvers ?? [
          new C.SessionResponseResolver(),
          new C.CookieResponseResolver(),
          new C.HeaderResponseResolver(),
        ],
      ),
      pipeManager: deps.pipeManager,
      viewResolver: resolver,
    });
    const middleware = new C.HttpMiddleware();
    middleware.logger = options.logger;
    dispatcher = new C.DispatcherImpl();
    Object.assign(dispatcher, {
      logger: options.logger,
      handlerExecutionChain: new C.HandlerExecutionChainImpl(),
      middlewareProvider: new C.MiddlewareProvider([
        middleware,
        deps.sessionMiddleware,
      ]),
      handlerMapping: new C.HandlerMappingImpl([adapter]),
      errorHandlerProvider: new C.ErrorHandlerProvider(deps.errorHandlers),
    });
    Object.assign(deps.sessionMiddleware, {
      requestMatcher: matcher,
      pathResolver,
    });
    return { builder, provider };
  }
  function stopAccepting() {
    if (state !== "closed") state = "stopping";
  }
  async function release() {
    for (const controller of controllers) controller.abort();
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((resolve) => server.close(() => resolve()));
    await Promise.allSettled([...transports]);
    while (dispatches.size) await Promise.allSettled([...dispatches]);
    await http.close();
    state = "closed";
  }
  function start(deps: NativeAgentHttpDependencies): Promise<string> {
    if (state === "starting" || state === "running") return starting!;
    if (state !== "created")
      return Promise.reject(Error("Native agent HTTP host is closed"));
    state = "starting";
    starting = (async () => {
      try {
        const { builder, provider } = assemble(deps);
        // Original provider.init() has a fire-and-forget .then with no rejection
        // handler. Await the original builder first so a failed assembly cannot
        // leave an unhandled rejection or a forever-pending provider Deferred.
        const routes = await builder.build();
        provider.routeBuilder = { build: () => Promise.resolve(routes) };
        provider.init();
        await provider.provide();
        if (state !== "starting")
          throw Error("Native agent HTTP startup cancelled");
        await new Promise<void>((resolve, reject) => {
          const error = (reason: Error) => {
            server.off("listening", listening);
            reject(reason);
          };
          const listening = () => {
            server.off("error", error);
            resolve();
          };
          server.once("error", error);
          server.once("listening", listening);
          server.listen(port, "127.0.0.1");
        });
        const address = server.address();
        if (!address || typeof address === "string")
          throw Error("Native agent HTTP address missing");
        origin = "http://127.0.0.1:" + address.port;
        await deps.endpointProvider.setServer(server);
        if (state !== "starting")
          throw Error("Native agent HTTP startup cancelled");
        state = "running";
        return origin;
      } catch (error) {
        stopAccepting();
        await release();
        throw error;
      }
    })();
    return starting;
  }
  /** Source Axios factory injection edge; only this host's internal agent URL is accepted. */
  function post(
    target: string,
    body: any,
    config: any = {},
  ): Promise<{ status: number; data: string }> {
    if (state !== "running")
      return Promise.reject(Error("Native agent HTTP host is closed"));
    let url: URL;
    try {
      url = new URL(target);
      if (
        url.origin !== origin ||
        url.pathname !== "/" + SESSION_INGRESS_CONTROLLER[0] ||
        url.username ||
        url.password ||
        url.hash ||
        url.search
      )
        throw Error(
          "Native agent HTTP transport only accepts its owned internal agent endpoint",
        );
    } catch (error) {
      return Promise.reject(error);
    }
    const controller = new AbortController();
    controllers.add(controller);
    const operation = (async () => {
      try {
        const headers = new Headers(config.headers);
        headers.set("authorization", "Bearer " + capability);
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          redirect: "error",
          signal: controller.signal,
        });
        const data = await response.text();
        if (response.status !== 200)
          throw Error("Native agent HTTP failed: " + data);
        return { status: response.status, data };
      } finally {
        controllers.delete(controller);
      }
    })();
    return track(transports, operation);
  }
  function close(): Promise<void> {
    if (closing) return closing;
    stopAccepting();
    closing = (async () => {
      if (starting) await starting.catch(() => {});
      await release();
    })();
    return closing;
  }
  return {
    native,
    context,
    pathResolver,
    matcher,
    start,
    stopAccepting,
    post,
    close,
    get origin() {
      return origin;
    },
    get state() {
      return state;
    },
    get listening() {
      return server.listening;
    },
    get pendingDispatchCount() {
      return dispatches.size;
    },
    get pendingTransportCount() {
      return transports.size;
    },
    get hookCount() {
      return http.hookCount;
    },
    get errors(): readonly unknown[] {
      return [...errors];
    },
  };
}
