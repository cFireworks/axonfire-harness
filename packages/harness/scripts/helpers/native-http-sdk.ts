// Real loopback HTTP + original HTTP/MVC/CLS + original ingress/AgentService/sessions/Runner + pinned SDK.
// The Node request parser, pipe service, JSON view and auth/permission/hook/telemetry exteriors are owned test boundaries.
import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { createServer, type Server } from "node:http";
import { randomUUID } from "node:crypto";
import { Usage, withTrace, type Model } from "@openai/agents-core";
import { jsonrepair } from "jsonrepair";
import { LocalNoopTrace } from "../../src/runtime/local-trace.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";
import { createNativeRunner } from "../../src/runner/native-runner.js";
import { nativeHttpFixture } from "./native-http-fixture.js";
import { agentRunFixture, agentRunFactories } from "./agent-run-fixture.js";
import { loadProductConfiguration } from "../../src/config/product-config.js";
import { ProductPromptRenderer } from "../../src/prompts/prompt-renderer.js";
import { AgentManager } from "../../src/agents/agent-manager.js";
import { AgentFactory } from "../../src/agents/agent-factory.js";
import { McpRegistry } from "../../src/mcp/mcp-registry.js";
import { ToolManager } from "../../src/tools/tool-manager.js";
import { registerCoreFileTools } from "../../src/tools/core-file-tools.js";
import { registerDeferredRuntimeTools } from "../../src/tools/deferred-runtime.js";

export const NATIVE_HTTP_SDK_MODES = ["new", "cold"] as const;
export async function nativeHttpSdk(
  httpFactory = createNativeHttpRuntime,
  agentFactories = agentRunFactories,
  runnerFactory = createNativeRunner,
  mode: (typeof NATIVE_HTTP_SDK_MODES)[number] = "new",
) {
  return withTrace(new LocalNoopTrace(), async () => {
    const h = nativeHttpFixture(httpFactory),
      f = await agentRunFixture(agentFactories, {
        emptyMeta: true,
        httpModule: h.native.getModule(47005),
      });
    let server: Server | undefined,
      agents: AgentManager | undefined,
      session: any;
    const additionalManagers: any[] = [];
    const requests: any[] = [],
      errors: any[] = [],
      pipes: any[] = [];
    try {
      const file = path.join(f.cwd, "owned-http.txt");
      await io.writeFile(file, "owned HTTP native Read 中文😀\n");
      const product = await loadProductConfiguration(),
        prompts = new ProductPromptRenderer(product),
        mcp = new McpRegistry(),
        tools = new ToolManager(product, prompts);
      registerCoreFileTools(tools, { workDir: f.cwd });
      registerDeferredRuntimeTools(tools, mcp, { cwd: f.cwd });
      agents = new AgentManager(
        product,
        prompts,
        tools,
        mcp,
        new AgentFactory(f.manager.stateMachine),
      );
      await agents.start();
      f.service.agentManager = agents;
      f.di.set(f.n.getModule(69466).AgentManager, agents);
      let turn = 0;
      const model: Model = {
        getResponse: async () => ({ output: [], usage: new Usage() }),
        async *getStreamedResponse(request) {
          requests.push({
            input: request.input,
            path: h.context.getRequest().path,
            turn: h.context.getRequest().get("x-owned-turn"),
          });
          ++turn;
          yield { type: "response_started" };
          const output: any[] =
            turn === 1
              ? [
                  {
                    type: "function_call",
                    id: "owned-read",
                    callId: "owned-read",
                    name: "Read",
                    arguments: JSON.stringify({ file_path: file }),
                    status: "completed",
                  },
                ]
              : [
                  {
                    type: "message",
                    id: "owned-answer-" + turn,
                    role: "assistant",
                    status: "completed",
                    content: [
                      {
                        type: "output_text",
                        text:
                          turn === 2
                            ? "owned HTTP Read done"
                            : "owned HTTP continued",
                      },
                    ],
                  },
                ];
          yield {
            type: "response_done",
            response: {
              id: "owned-response-" + turn,
              output,
              usage: { inputTokens: 11, outputTokens: 3, totalTokens: 14 },
            },
          } as any;
        },
      };
      const modules = {
        ...f.modules,
        28894: { jsonrepair },
        18553: f.originalSdk,
      };
      for (const id of [67330, 3927, 40038]) delete modules[id];
      const n = runnerFactory({
        modules,
        getModule: f.utilities.getModule,
        env: {},
        Date: f.runtime.Date,
      });
      f.di.set(n.getModule(67330).ContextCompactSummarizer, {
        compactAndSummarize: async () => {
          throw Error("Unexpected compaction in owned HTTP fixture");
        },
      });
      const loop = new n.ToolCallLoopDetectorImpl();
      loop.logger = f.logger;
      const factory = new n.RunnerFactoryImpl();
      Object.assign(factory, {
        modelProvider: { getModel: () => model },
        sessionManager: f.manager,
        agentManager: agents,
        productManager: { waitConfiguration: async () => product.raw },
        stateMachine: f.manager.stateMachine,
        toolCallLoopDetector: loop,
        logger: f.logger,
      });
      const provider = new n.RunnerProviderImpl();
      provider.runnerFactory = factory;
      f.service.runnerProvider = provider;
      f.interceptors.push(
        ...[
          "UserInputAgentRunInterceptor",
          "HistoryAgentRunInterceptor",
          "TelemetryAgentRunInterceptor",
          "StateAgentRunInterceptor",
        ].map((name) => {
          const i = f.interceptor(name);
          i.agentManager = agents;
          return i;
        }),
      );
      Object.assign(f.controller, {
        agentService: f.service,
        agentManager: agents,
      });
      Object.assign(f.middleware, {
        requestMatcher: h.matcher,
        pathResolver: h.pathResolver,
      });
      const key = h.native.getModule(90014).METADATA_KEY,
        ctor = f.controller.constructor;
      h.define(key.controller, ctor, { path: "internal/agent" });
      h.define(key.controllerMethod, ctor, [
        { key: "run", method: "POST", options: "" },
        { key: "getModels", method: "GET", options: "models" },
      ]);
      h.define(key.controllerBody, ctor, [{ parameterIndex: 0 }], "run");
      h.define(
        key.controllerRequestHeader,
        ctor,
        [{ parameterIndex: 1 }],
        "run",
      );
      const builder = new h.C.RouteBuilder();
      builder.controllers = [f.controller];
      builder.pathResolver = h.pathResolver;
      const routeProvider = new h.C.RouteProviderImpl();
      routeProvider.routeBuilder = builder;
      routeProvider.init();
      await routeProvider.provide();
      const matcher = new h.C.RouteMetadataMatcherImpl();
      Object.assign(matcher, { routeProvider, requestMatcher: h.matcher });
      const { adapter } = h.mvc([]);
      adapter.routeMetadataMatcher = matcher;
      adapter.pipeManager = {
        apply: async (meta: any) => pipes.push(meta.method),
      };
      const viewResolver = new h.C.ViewResolverImpl();
      viewResolver.defaultViewName = "owned-json";
      viewResolver.viewProvider = new h.C.ViewProvider([
        {
          priority: 1,
          contentType: "application/json",
          support: async () => true,
          render: async (model: any) => {
            if (model.id && Array.isArray(model.history)) {
              session = model;
              const result = model.resultSubject.value;
              await result.completed;
              await f.drain();
              h.context.getResponse().body = JSON.stringify({
                id: model.id,
                output: result.finalOutput,
              });
            } else h.context.getResponse().body = JSON.stringify(model);
          },
        },
      ]);
      adapter.viewResolver = viewResolver;
      const http = new h.C.HttpMiddleware();
      http.logger = h.logger;
      const traceResolver = new h.C.TraceIdResolverImpl();
      traceResolver.traceField = "x-trace";
      const trace = new h.C.TraceMiddleware();
      Object.assign(trace, {
        traceIdResolver: traceResolver,
        traceField: "x-owned-trace",
      });
      const dispatcher = new h.C.DispatcherImpl();
      Object.assign(dispatcher, {
        logger: h.logger,
        handlerExecutionChain: h.chain,
        middlewareProvider: new h.C.MiddlewareProvider([
          trace,
          http,
          f.middleware,
        ]),
        handlerMapping: new h.C.HandlerMappingImpl([adapter]),
        errorHandlerProvider: {
          provide: () => [
            {
              canHandle: async () => true,
              handle: async (ctx: any, error: any) => {
                errors.push(error.message);
                ctx.response.statusCode = 500;
                ctx.response.end("owned fixture dispatch failed");
              },
            },
          ],
        },
      });
      const capability = randomUUID();
      server = createServer((req, res) => {
        void (async () => {
          if (req.headers.authorization !== "Bearer " + capability) {
            res.writeHead(403);
            res.end();
            return;
          }
          const chunks: Buffer[] = [];
          let bytes = 0;
          for await (const chunk of req) {
            bytes += chunk.length;
            if (bytes > 8192) {
              res.writeHead(413);
              res.end();
              return;
            }
            chunks.push(chunk);
          }
          const url = new URL(req.url ?? "/", "http://127.0.0.1"),
            request: any = req;
          request.path = url.pathname;
          request.body = chunks.length
            ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
            : {};
          request.query = Object.fromEntries(url.searchParams);
          request.get = (name: string) => req.headers[name.toLowerCase()];
          await withTrace(new LocalNoopTrace(), () =>
            h.run(
              async (ctx) => {
                await dispatcher.dispatch(ctx);
              },
              request,
              res as any,
            ),
          );
        })().catch((error) => {
          errors.push(error.message);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.end("owned fixture I/O failed");
          }
        });
      });
      await new Promise<void>((resolve, reject) => {
        server!.once("error", reject);
        server!.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address();
      assert.ok(address && typeof address !== "string");
      const base = "http://127.0.0.1:" + address.port;
      const refused = await fetch(base + "/internal/agent", { method: "POST" });
      assert.equal(refused.status, 403);
      assert.equal(requests.length, 0);
      const outputs: string[] = [];
      for (const prompt of [
        "read owned HTTP file",
        "continue owned HTTP conversation",
      ]) {
        if (mode === "cold" && outputs.length === 1) {
          const cold: any = new f.sessionNative.SessionManagerImpl();
          for (const key of [
            "sessionFactory",
            "sessionStore",
            "logger",
            "stateMachine",
            "userStateManager",
            "progressSyncService",
            "cronSchedulerService",
            "agentTaskManager",
            "interruptionService",
            "agentInputItemProcessorProvider",
            "sessionHookManager",
            "interceptors",
            "telemetryService",
            "galileoSessionBridge",
          ])
            cold[key] = f.manager[key];
          additionalManagers.push(cold);
          f.service.sessionManager = cold;
          f.controller.sessionManager = cold;
          f.middleware.sessionManager = cold;
          factory.sessionManager = cold;
          assert.equal(cold.sessionSubject.value, undefined);
        }
        const response = await fetch(base + "/internal/agent", {
          method: "POST",
          headers: {
            authorization: "Bearer " + capability,
            "content-type": "application/json",
            "x-owned-marker": "owned",
            "x-owned-turn": String(outputs.length),
          },
          body: JSON.stringify({
            sessionId: f.s.id,
            prompt,
            print: true,
            acp: true,
          }),
        });
        if (response.status !== 200)
          throw Error("Owned HTTP dispatch failed: " + JSON.stringify(errors));
        outputs.push(((await response.json()) as any).output);
        assert.notEqual(
          session,
          f.s,
          "source middleware must create/load its own session, not use the precreated fixture object",
        );
      }
      assert.deepEqual(outputs, [
        "owned HTTP Read done",
        "owned HTTP continued",
      ]);
      assert.equal(errors.length, 0);
      assert.equal(f.errors.length, 0);
      assert.deepEqual(pipes, ["run", "run"]);
      assert.ok(requests.every((r) => r.path === "/internal/agent"));
      assert.deepEqual(
        requests.map((r) => r.turn),
        ["0", "0", "1"],
      );
      assert.ok(
        requests.every((r) => !JSON.stringify(r.input).includes(capability)),
        "owned transport capability is not model conversation input",
      );
      if (mode === "cold")
        assert.equal(additionalManagers[0].sessionSubject.value, session);
      assert.match(
        JSON.stringify(requests.at(-1).input),
        /owned HTTP Read done/,
      );
      const disk = await io.readFile(
        f.store.getSessionFilePath(f.s.id),
        "utf8",
      );
      assert.match(disk, /owned HTTP native Read/);
      assert.match(disk, /owned HTTP continued/);
      return {
        mode,
        outputs,
        modelRequests: requests.length,
        paths: requests.map((r) => r.path),
        historyTypes: session.history.map((i: any) => i.type),
        usage: session.usage.totalTokens,
        emptyMetaCreated: !!session.meta.rootRequestId,
        requestTurns: requests.map((r) => r.turn),
        refusedBeforeModel: true,
      };
    } finally {
      if (server) {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server!.close(() => resolve()));
      }
      await h.close();
      for (const manager of additionalManagers) {
        for (const subscription of manager.resultSubscriptions.values())
          subscription.unsubscribe();
        manager.resultSubscriptions.clear();
        for (const timer of manager.idleTimers.values())
          f.timers.clearTimeout(timer);
        manager.idleTimers.clear();
        manager.sessionSubject.complete();
        manager.context.disable();
        manager.skipHistoryContext.disable();
      }
      await f.close();
      await agents?.close();
    }
  });
}
