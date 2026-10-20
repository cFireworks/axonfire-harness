// Explicit component-test boundaries; no installed application, account, real stdio or remote endpoint is touched.
import { EventEmitter } from "node:events";
import { AsyncLocalStorage } from "node:async_hooks";
import * as streams from "node:stream";
import { Subject, BehaviorSubject } from "rxjs";
import { createNativeAcpConnections } from "../../src/protocol/native-acp-connections.js";
import { createNativeAcpPrimitives } from "../../src/protocol/native-acp-primitives.js";
import { createCapturedAcpSdk } from "../../src/vendor/captured-acp-sdk.js";
import { settle } from "./acp-protocol-fixture.js";

export class AcpFixtureResponse extends EventEmitter {
  statusCode = 200;
  headers: Record<string, any> = {};
  chunks: string[] = [];
  headersSent = false;
  writableEnded = false;
  destroyed = false;
  socket = { setNoDelay: (_value: boolean) => {} };
  backpressure = false;
  throwWrite = false;
  throwFlush = false;
  setHeader(name: string, value: any) {
    this.headers[name.toLowerCase()] = value;
  }
  writeHead(status: number, headers?: any) {
    this.statusCode = status;
    this.headersSent = true;
    for (const [key, value] of Object.entries(headers ?? {}))
      this.setHeader(key, value);
    return this;
  }
  flushHeaders() {
    this.headersSent = true;
  }
  flush() {
    if (this.throwFlush) throw Error("owned flush failed");
  }
  write(value: any) {
    if (this.throwWrite) throw Error("owned write failed");
    this.headersSent = true;
    this.chunks.push(String(value));
    return !this.backpressure;
  }
  end(value?: any) {
    if (value !== undefined) this.chunks.push(String(value));
    this.writableEnded = true;
    this.emit("finish");
    queueMicrotask(() => this.emit("close"));
    return this;
  }
  destroy() {
    this.destroyed = true;
    this.emit("close");
    return this;
  }
  get body() {
    return this.chunks.join("");
  }
  messages() {
    return this.chunks.flatMap((chunk) =>
      [...chunk.matchAll(/^data: (.+)$/gm)].map((match) =>
        JSON.parse(match[1]!),
      ),
    );
  }
}
export function acpConnectionsFixture(
  factory = createNativeAcpConnections,
  patch: any = {},
) {
  let now = 1700000000000,
    sequence = 0,
    tokenSequence = 0,
    timerSequence = 0;
  const logs: any[] = [],
    calls: any[] = [],
    endpoints: any[] = [],
    timers = new Map<
      any,
      { at: number; every: number; run: () => any; order: number }
    >(),
    di = new Map<any, any>(),
    context = new AsyncLocalStorage<any>();
  class Clock extends Date {
    constructor(value?: any) {
      super(value ?? now);
    }
    static override now() {
      return now;
    }
  }
  const timeout = (run: () => any, ms: number, every = 0) => {
    const token = {
      unref() {
        return this;
      },
    };
    timers.set(token, { at: now + ms, every, run, order: ++timerSequence });
    return token;
  };
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error", "setContext"].map((key) => [
      key,
      (...args: any[]) => logs.push([key, ...args]),
    ]),
  ) as any;
  const sdk = (patch.sdkFactory ?? createCapturedAcpSdk)({
    console: { error: (...args: any[]) => logs.push(["sdk", ...args]) },
  });
  const protocol = createNativeAcpPrimitives({
    modules: { 38113: sdk },
  }).protocol;
  const Logger = Symbol("FixtureLogger"),
    stdin = new streams.PassThrough(),
    stdout = new streams.PassThrough();
  const modules: Record<number, any> = {
    92537: { Subject },
    57075: streams,
    77598: {
      randomUUID: () => "stream-" + ++sequence,
      randomBytes: (length: number) => Buffer.alloc(length, ++tokenSequence),
    },
    92735: { Logger },
    22618: protocol,
    80699: {
      ContainerUtil: {
        get(key: any) {
          if (key === protocol.AcpAgent) return makeAgent();
          if (!di.has(key))
            throw Error("Fixture dependency missing: " + String(key));
          return di.get(key);
        },
      },
    },
    47005: {
      Context: {
        getCurrent() {
          const current = context.getStore();
          if (!current) throw Error("No owned request context");
          return current;
        },
        setSkipAutoEnd(value: boolean) {
          context.getStore().skipAutoEnd = value;
        },
        getRequest() {
          return context.getStore().request;
        },
      },
    },
  };
  const runtime = {
    modules,
    env: patch.env ?? {},
    Date: Clock,
    stdin,
    stdout,
    setTimeout: patch.realTimers
      ? globalThis.setTimeout
      : (run: () => any, ms: number) => timeout(run, ms),
    setInterval: patch.realTimers
      ? globalThis.setInterval
      : (run: () => any, ms: number) => timeout(run, ms, ms),
    clearTimeout: patch.realTimers
      ? globalThis.clearTimeout
      : (token: any) => timers.delete(token),
    clearInterval: patch.realTimers
      ? globalThis.clearInterval
      : (token: any) => timers.delete(token),
  };
  const n = factory(runtime),
    stream: any = new n.AcpStreamManagerImpl(),
    transports: any = new n.AcpTransportManagerImpl(),
    transportFactory: any = new n.AcpTransportFactoryImpl(),
    agents: any = new n.AcpAgentManagerImpl(),
    server: any = new n.AcpServerImpl(),
    acp: any = new n.AcpContextImpl(),
    guard: any = new n.AcpConnectionGuardImpl(),
    controller: any = new n.AcpController(),
    middleware: any = new n.AcpSecurityMiddleware();
  const audit = { log: (...args: any[]) => calls.push(["audit", ...args]) },
    sessions = patch.sessions ?? {
      sessionSubject: new BehaviorSubject(undefined),
      flushHistory: async (session: any) => calls.push(["flush", session.id]),
    };
  Object.assign(agents, { logger });
  Object.assign(transportFactory, { streamManager: stream });
  Object.assign(transports, {
    factory: transportFactory,
    streamManager: stream,
  });
  Object.assign(server, {
    logger,
    acpContext: acp,
    transportManager: transports,
    agentManager: agents,
    sessionManager: sessions,
  });
  Object.assign(guard, {
    logger,
    settingsManager: { get: async () => patch.gateway },
  });
  Object.assign(controller, {
    acpContext: acp,
    streamManager: stream,
    transportManager: transports,
    connectionGuard: guard,
    auditLog: audit,
  });
  Object.assign(stream, {
    interruptionService: {
      cancelAllForSession: (...args: any[]) =>
        calls.push(["cancelInterruptions", ...args]),
    },
    broadcastService: {
      broadcastToolCallFailedForSession: async (...args: any[]) =>
        calls.push(["failedTools", ...args]),
    },
  });
  Object.assign(middleware, {
    logger,
    connectionGuard: guard,
    auditLog: audit,
    requestMatcher: { match: () => true },
    pathResolver: { resolve: async (path: string) => path },
    corsService: {
      applyCorsHeaders: (_response: any, origin: any) =>
        calls.push(["cors", origin]),
    },
    auth: {
      isEnabled: () => patch.authEnabled ?? true,
      authenticate: (request: any) => {
        calls.push(["authenticate", request]);
        return patch.authValid ?? false;
      },
      recordFailedAttempt: () => patch.rateLimited ?? false,
    },
  });
  di.set(Logger, logger);
  di.set(protocol.AcpStreamManager, stream);
  di.set(protocol.AcpAgentManager, agents);
  di.set(protocol.AcpConnectionGuard, guard);
  di.set(protocol.DelegateToolManager, {
    clearTools: async () => {
      calls.push(["clearTools"]);
    },
    clearConnection: () => calls.push(["clearDelegateConnection"]),
  });
  function makeAgent(): any {
    let connection: any, id: string;
    return {
      setConnection(value: any, cid: string) {
        connection = value;
        id = cid;
        endpoints.push(value);
      },
      getConnection: () => connection,
      initialize: async (request: any) => {
        calls.push(["initialize", id, request]);
        return { protocolVersion: 1 };
      },
      newSession: async (request: any) => {
        calls.push(["newSession", id, request]);
        return { sessionId: "owned" };
      },
      prompt: async (request: any) => {
        calls.push(["prompt", id, request]);
        return (
          (await patch.prompt?.(request, connection)) ?? {
            stopReason: "end_turn",
          }
        );
      },
      cancel: async (request: any) => {
        calls.push(["cancel", id, request]);
        await patch.cancel?.(request, connection);
      },
      authenticate: async () => ({}),
    };
  }
  function request(method = "POST", extra: any = {}) {
    const req = new EventEmitter() as any;
    Object.assign(req, {
      method,
      url: "/api/v1/acp",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        "acp-connection-id": "owned",
      },
      socket: { remoteAddress: "127.0.0.1" },
      ...extra,
    });
    return req;
  }
  return {
    n,
    sdk,
    protocol,
    runtime,
    stream,
    transports,
    transportFactory,
    agents,
    server,
    acp,
    guard,
    controller,
    middleware,
    context,
    sessions,
    logs,
    calls,
    timers,
    stdin,
    stdout,
    endpoints,
    request,
    runContext: (req: any, res: any, action: () => any) =>
      context.run({ request: req, response: res, skipAutoEnd: false }, action),
    async advance(ms = 0) {
      const end = now + ms;
      let iterations = 0;
      for (;;) {
        const next = [...timers]
          .filter(([, value]) => value.at <= end)
          .sort((a, b) => a[1].at - b[1].at || a[1].order - b[1].order)[0];
        if (!next) break;
        if (++iterations > 10000) throw Error("Owned timer loop limit");
        const [token, value] = next;
        now = value.at;
        if (value.every) value.at += value.every;
        else timers.delete(token);
        value.run();
        await settle();
      }
      now = end;
      await settle();
    },
    async close() {
      stdin.end();
      for (const state of stream.connectionStates.values())
        try {
          state.incomingController?.close();
        } catch {}
      for (const id of [...transports.transports.keys()])
        await transports.close(id);
      for (const id of [...stream.streams.keys()]) stream.close(id);
      await server.stop();
      transports.transportCreated.complete();
      await Promise.all(endpoints.map((endpoint) => endpoint.closed));
      await settle();
      for (const id of [...guard.tokens.keys()]) guard.revokeToken(id);
      timers.clear();
      stdin.destroy();
      stdout.destroy();
    },
  };
}
