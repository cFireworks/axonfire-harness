// Complete source ACP new-session -> real internal HTTP -> source ingress/View/Agent.setSession -> original run chain + pinned SDK.
// All IO, auth configuration, model and external service adapters are owned; no installed account or production traffic.
import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import { join } from "node:path";
import { createServer, type Server } from "node:http";
import { EventEmitter } from "node:events";
import { isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import { Subject, BehaviorSubject } from "rxjs";
import { filter, distinctUntilChanged, map } from "rxjs/operators/index.js";
import { Usage, withTrace, type Model } from "@openai/agents-core";
import { jsonrepair } from "jsonrepair";
import { LocalNoopTrace } from "../../src/runtime/local-trace.js";
import { createAcpRendezvousHost } from "../../src/protocol/acp-rendezvous-host.js";
import { createAcpServicesHost } from "../../src/protocol/acp-services-host.js";
import { createNativeAcpConnections } from "../../src/protocol/native-acp-connections.js";
import { createNativeAcpLifecycle } from "../../src/protocol/native-acp-lifecycle.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { createNativeAcpParentPrimitives } from "../../src/protocol/native-acp-parent-primitives.js";
import { createCapturedAcpSdk } from "../../src/vendor/captured-acp-sdk.js";
import { createNativeRunner } from "../../src/runner/native-runner.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { loadProductConfiguration } from "../../src/config/product-config.js";
import { ProductPromptRenderer } from "../../src/prompts/prompt-renderer.js";
import { AgentManager } from "../../src/agents/agent-manager.js";
import { AgentFactory } from "../../src/agents/agent-factory.js";
import { McpRegistry } from "../../src/mcp/mcp-registry.js";
import { ToolManager } from "../../src/tools/tool-manager.js";
import { registerCoreFileTools } from "../../src/tools/core-file-tools.js";
import { registerDeferredRuntimeTools } from "../../src/tools/deferred-runtime.js";
import { DelegateToolManagerImpl } from "../../src/delegate/delegate-tool-manager.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import { createNativeInterruptionService } from "../../src/permissions/native-interruption-service.js";
import { agentRunFixture, agentRunFactories } from "./agent-run-fixture.js";
import { nativeHttpFixture } from "./native-http-fixture.js";
import { authenticationFixture } from "./authentication-fixture.js";
import {
  acpProtocolFixture,
  protocolFactories,
} from "./acp-protocol-fixture.js";

export const rendezvousFactories = {
  http: createNativeHttpRuntime,
  agentRun: agentRunFactories,
  runner: createNativeRunner,
  protocol: protocolFactories,
  connections: createNativeAcpConnections,
  lifecycle: createNativeAcpLifecycle,
  services: createNativeAcpServices,
  authentication: createNativeAuthenticationRuntime,
  sdk: createCapturedAcpSdk,
  parent: createNativeAcpParentPrimitives,
  interruption: createNativeInterruptionService,
};

export const ACP_RENDEZVOUS_MODES = ["single", "switch"] as const;
export async function acpRendezvousSdk(
  factories = rendezvousFactories,
  mode: (typeof ACP_RENDEZVOUS_MODES)[number] = "single",
) {
  return withTrace(new LocalNoopTrace(), async () => {
    const h = nativeHttpFixture(factories.http),
      f = await agentRunFixture(factories.agentRun, {
        emptyMeta: true,
        httpModule: h.native.getModule(47005),
      });
    const auth = authenticationFixture(factories.authentication),
      authToken = "owned-explicit-parent-token";
    auth.env.CODEBUDDY_AUTH_TOKEN = "owned-priority-signal";
    auth.product.configuration.next({
      authentication: {
        type: "custom-token",
        attributes: { token: authToken },
      },
    });
    const custom = auth.custom();
    auth.manager.authenticationStorages = [custom.storage];
    auth.providers.splice(0, auth.providers.length, custom.provider);
    await auth.manager.doInit();
    await auth.manager.initialized;
    assert.equal(
      auth.manager.currentSessionSubject.value.auth.accessToken,
      authToken,
    );
    f.service.authenticationManager = auth.manager;
    let server: Server | undefined,
      agents: AgentManager | undefined,
      p: ReturnType<typeof acpProtocolFixture> | undefined;
    let host: ReturnType<typeof createAcpRendezvousHost> | undefined,
      services: ReturnType<typeof createAcpServicesHost> | undefined;
    let client: any, endpoint: any;
    const toAgent = new TransformStream(),
      toClient = new TransformStream();
    const updates: any[] = [],
      modelRequests: any[] = [],
      httpRequests: any[] = [],
      restCalls: any[] = [],
      registration: any[] = [],
      errors: any[] = [];
    const transports = new Set<Promise<any>>();
    const interruptionSubscriptions = new Set<any>(),
      interruptionJobs = new Set<Promise<any>>();
    const capability = randomUUID(),
      connectionId = "owned-parent-connection";
    async function checked<T>(
      label: string,
      operation: Promise<T>,
    ): Promise<T> {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          operation,
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () =>
                reject(
                  Error(
                    "Owned parent deadline: " +
                      label +
                      " " +
                      JSON.stringify({
                        http: httpRequests.map((r) => ({
                          status: r.response.statusCode,
                          ended: r.response.writableEnded,
                        })),
                        errors,
                        logs: f.logs.slice(-8),
                        acp: p?.logs.slice(-8),
                        entry: host?.getEntry(connectionId)?.ready,
                      }),
                  ),
                ),
              8000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    }
    try {
      const file = join(f.cwd, "parent-owned.txt");
      await io.writeFile(file, "owned native parent Read 中文😀\n");
      const product = await loadProductConfiguration(),
        prompts = new ProductPromptRenderer(product),
        tools = new ToolManager(product, prompts),
        mcp = new McpRegistry();
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
          modelRequests.push({
            input: request.input,
            connectionId: h.context.getRequest().get("acp-connection-id"),
            sessionId: f.manager.getCurrent().id,
          });
          const output: any[] =
            ++turn === 1
              ? [
                  {
                    type: "function_call",
                    id: "parent-read",
                    callId: "parent-read",
                    name: "Read",
                    arguments: JSON.stringify({ file_path: file }),
                    status: "completed",
                  },
                ]
              : [
                  {
                    type: "message",
                    id: "parent-answer-" + turn,
                    role: "assistant",
                    status: "completed",
                    content: [
                      {
                        type: "output_text",
                        text:
                          turn === 2 ? "parent Read done" : "parent continued",
                      },
                    ],
                  },
                ];
          yield { type: "response_started" };
          if (output[0]?.type === "message")
            yield {
              type: "output_text_delta",
              delta: output[0].content[0].text,
            };
          yield {
            type: "response_done",
            response: {
              id: "parent-response-" + turn,
              output,
              usage: { inputTokens: 13, outputTokens: 3, totalTokens: 16 },
            },
          } as any;
        },
      };
      const modules: any = {
        ...f.modules,
        28894: { jsonrepair },
        18553: f.originalSdk,
      };
      for (const id of [67330, 3927, 40038]) delete modules[id];
      const runnerNative = factories.runner({
        modules,
        getModule: f.utilities.getModule,
        env: {},
        Date: f.runtime.Date,
      });
      f.di.set(runnerNative.getModule(67330).ContextCompactSummarizer, {
        compactAndSummarize: async () => {
          throw Error("Unexpected parent compact");
        },
      });
      const detector = new runnerNative.ToolCallLoopDetectorImpl();
      detector.logger = f.logger;
      const runnerFactory = new runnerNative.RunnerFactoryImpl();
      Object.assign(runnerFactory, {
        modelProvider: { getModel: () => model },
        sessionManager: f.manager,
        agentManager: agents,
        productManager: { waitConfiguration: async () => product.raw },
        stateMachine: f.manager.stateMachine,
        toolCallLoopDetector: detector,
        logger: f.logger,
      });
      const runnerProvider = new runnerNative.RunnerProviderImpl();
      runnerProvider.runnerFactory = runnerFactory;
      f.service.runnerProvider = runnerProvider;
      for (const name of [
        "UserInputAgentRunInterceptor",
        "MessageQueueAgentRunInterceptor",
        "HistoryAgentRunInterceptor",
        "TelemetryAgentRunInterceptor",
        "StateAgentRunInterceptor",
      ]) {
        const i = f.interceptor(name);
        i.agentManager = agents;
        f.interceptors.push(i);
      }
      Object.assign(f.controller, {
        agentManager: agents,
        agentService: f.service,
      });
      Object.assign(f.middleware, {
        requestMatcher: h.matcher,
        pathResolver: h.pathResolver,
      });
      const interruption: any = factories.interruption(
        {
          service: f.service,
          getDefaultAgent: () => agents!.getDefault(),
          stateMachine: f.manager.stateMachine,
          getTasks: () => [],
          describeDeferredTool: () => undefined,
          isDeferredDispatchEnabled: () =>
            f.modules[93039].QueueDispatchUtils.isDeferredDispatchEnabledSync(),
          sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
          now: () => f.runtime.Date.now(),
          setImmediate: (callback) => setImmediate(callback),
          setTimeout: (callback, ms) => setTimeout(callback, ms),
          clearTimeout: (timer) => clearTimeout(timer),
          subscribe(session, callback) {
            const sub = session.resultSubject.subscribe((result: any) => {
              const operation = callback(result);
              interruptionJobs.add(operation);
              void operation.then(
                () => interruptionJobs.delete(operation),
                (error) => {
                  interruptionJobs.delete(operation);
                  errors.push(["interruption", error.message]);
                },
              );
              return operation;
            });
            interruptionSubscriptions.add(sub);
            return sub;
          },
          inputItemUtils: f.modules[93039].InputItemUtils,
          profiler: { markStart() {}, markEnd() {} },
          isMandatoryApprovalTarget: async () => false,
          cwd: () => f.cwd,
          logMcpUiDiag() {},
        },
        {
          logger: f.logger,
          stateMachine: f.manager.stateMachine,
          toolManager: tools,
          sessionHookManager: {
            ...f.manager.sessionHookManager,
            executeStopHooks: async () => {
              f.calls.push(["stopHook"]);
            },
          },
        },
      );
      f.manager.interruptionService = interruption;
      const tasks = new EventEmitter(),
        teamTokens = {
          TeamManager: Symbol("TeamManager"),
          TeamMailbox: Symbol("TeamMailbox"),
        };
      const parentModules: any = {
        ...f.modules,
        80699: { ...f.common, Deferred: h.host.common.Deferred },
        47005: h.native.getModule(47005),
        67062: {
          MediaType: {
            APPLICATION_JSON_UTF8: "application/json; charset=utf-8",
          },
          ...h.native.getModule(14516),
          ...h.native.getModule(78627),
        },
        29827: { BehaviorSubject },
        39983: { distinctUntilChanged },
        44093: { map },
        39023: { isDeepStrictEqual },
      };
      for (const id of [32917, 74183, 50744, 43533, 45654, 1562])
        delete parentModules[id];
      const parentNative = factories.parent({
        modules: parentModules,
        env: {},
        getModule: (id: number) => p!.base.getModule(id),
      });
      const placeholders: any = {
        71915: {},
        7357: {},
        30654: {},
        95449: {},
        9151: { ProductManager: Symbol("ProductManager") },
        79814: { ExternalUriOpener: Symbol("ExternalUriOpener") },
        86480: { CliSettingsProvider: Symbol("CliSettingsProvider") },
        86482: auth.A,
        74183: { CliRuntimeOptions: parentNative.CliRuntimeOptions },
        32917: parentNative.endpoint,
        43533: parentNative.security,
        67062: parentModules[67062],
        68366: teamTokens,
        39983: { distinctUntilChanged },
        69745: { filter },
        47005: h.native.getModule(47005),
        54193: { getTeamMemberRegistry: () => ({ getAll: () => [] }) },
      };
      const acpSdk = factories.sdk({
        console: { error: (...args: any[]) => errors.push(["sdk", ...args]) },
      });
      p = acpProtocolFixture(factories.protocol, {
        session: f.s,
        sessionManager: f.manager,
        stateMachine: f.manager.stateMachine,
        tasks,
        interruptionService: interruption,
        realTimers: true,
        Date,
        modules: { ...placeholders, 38113: acpSdk },
      });
      Object.assign(p.modules[35151], {
        SettingsManager: Symbol("SettingsManager"),
        CliSettingsProvider: placeholders[86480].CliSettingsProvider,
      });
      const lifecycle = factories.lifecycle({
        getModule: p.base.getModule,
        modules: {
          ...p.modules,
          7357: undefined,
          95449: undefined,
          24618: { PermissionMode },
        },
      });
      Object.assign(
        placeholders[71915],
        lifecycle.getModule(99006),
        lifecycle.getModule(71389),
        { cancelSessionRuntimeState: lifecycle.cancelSessionRuntimeState },
      );
      Object.assign(placeholders[7357], lifecycle.getModule(7357));
      Object.assign(placeholders[30654], lifecycle.capability);
      Object.assign(placeholders[95449], lifecycle.getModule(95449));
      Object.assign(placeholders[54193], lifecycle.team);
      Object.assign(p.modules[93039], f.modules[93039]);
      p.setDependency(placeholders[71915].SessionManager, f.manager);
      p.setDependency(
        placeholders[71915].SessionRunStateMachine,
        f.manager.stateMachine,
      );
      p.setDependency(
        placeholders[71915].InterruptionService,
        p.interruptionService,
      );
      p.setDependency(p.base.getModule(69466).AgentManager, agents);
      p.setDependency(teamTokens.TeamManager, {
        isInTeam: () => false,
        getTeam: () => undefined,
      });
      p.setDependency(teamTokens.TeamMailbox, { getUnread: async () => [] });
      p.setDependency(
        p.p.protocol.DelegateToolManager,
        new DelegateToolManagerImpl(f.logger),
      );
      p.setDependency(p.modules[35151].SettingsManager, {
        get: async () => undefined,
        list: async () => ({}),
      });
      p.setDependency(placeholders[86480].CliSettingsProvider, {
        set: async () => {},
      });
      p.setDependency(
        placeholders[30654].HostCapabilityProvider,
        new lifecycle.capability.HostCapabilityProvider(),
      );
      p.setDependency(placeholders[95449].ReferenceService, {
        setFileReferencesPathOnly() {},
      });
      p.setDependency(placeholders[79814].ExternalUriOpener, {
        urlSubject: new Subject(),
      });
      const productManager = { waitConfiguration: async () => product.raw };
      p.setDependency(placeholders[9151].ProductManager, productManager);
      p.setDependency(auth.A.AuthenticationManager, auth.manager);
      const commands = {
        getAll: async () => [],
        parseCommand: () => undefined,
      };
      p.setDependency(p.modules[87422].CommandManager, commands);
      services = createAcpServicesHost({
        backend: {
          stateMachine: f.manager.stateMachine,
          agents,
          service: f.service,
          sessions: f.manager,
          productManager,
        } as any,
        getModule: p.base.getModule,
        modules: p.modules,
        logger: f.logger,
        sourceFactory: factories.services,
      });
      p.modules[20881] = services.helpers.titleHelpers;
      p.modules[76586] = {
        SessionTitleService: services.helpers.SessionTitleService,
      };
      p.setDependency(services.helpers.SessionTitleService, services.title);
      p.setDependency(
        p.p.protocol.AcpUsagePublisher,
        new Proxy(services.usage, {
          get(target, key) {
            const value = Reflect.get(target, key, target);
            if (key === "register")
              return (session: any, connection: any) => {
                registration.push({
                  session,
                  path: h.context.getRequest().path,
                });
                return value(session, connection);
              };
            return value;
          },
        }),
      );
      const connectionNative = factories.connections(p.runtime);
      const registry: any = new connectionNative.AcpAgentManagerImpl();
      registry.logger = f.logger;
      registry.init();
      registry.register(connectionId, p.agent);
      services.registerConnection(connectionId, p.agent);
      host = createAcpRendezvousHost({
        runtime: p.runtime,
        agentManager: registry,
        logger: f.logger,
        sourceFactory: factories.protocol.view,
        dependencies: {
          sessionManager: f.manager,
          stateMachine: f.manager.stateMachine,
          agentService: f.service,
          commandManager: commands,
          interruptionService: p.interruptionService,
          taskStorage: { getBySession: () => [] },
          broadcastService: services.broadcast,
          frictionAnalysisService: services.friction,
        },
      });
      endpoint = new acpSdk.AgentSideConnection(
        (connection: any) => {
          p!.agent.setConnection(connection, connectionId);
          return host!.rpcAgent(p!.agent);
        },
        { readable: toAgent.readable, writable: toClient.writable },
      );
      client = new acpSdk.ClientSideConnection(
        () => ({
          sessionUpdate: async (update: any) => updates.push(update),
          requestPermission: async () => {
            throw Error("Unexpected approval in owned Read fixture");
          },
        }),
        { readable: toClient.readable, writable: toAgent.writable },
      );
      let origin = "",
        accepting = true;
      const restFactory = parentNative.rest.RestOperationsFactory;
      p.modules[67062].RestOperationsFactory = restFactory;
      p.modules[67062].HttpHeaders = h.native.getModule(14516).HttpHeaders;
      p.modules[67062].HttpStatus = h.native.getModule(78627).HttpStatus;
      parentModules[33584] = {
        default: {
          create: () => ({
            post(target: string, body: any, options: any) {
              if (!accepting)
                return Promise.reject(Error("Owned parent REST is closed"));
              const url = new URL(target);
              assert.equal(url.origin, origin);
              restCalls.push({ body, options });
              const pending = fetch(url, {
                method: "POST",
                headers: {
                  ...options.headers,
                  authorization: "Bearer " + capability,
                },
                body: JSON.stringify(body),
              }).then(async (response) => {
                if (response.status !== 200)
                  throw Error(
                    "Owned native HTTP failed: " + (await response.text()),
                  );
                return { status: response.status, data: await response.text() };
              });
              transports.add(pending);
              void pending.then(
                () => transports.delete(pending),
                () => transports.delete(pending),
              );
              return pending;
            },
          }),
        },
      };
      const rest = new parentNative.DefaultRestOperationsFactory();
      rest.clientConfig = {};
      p.setDependency(restFactory, rest);
      const endpointProvider = new parentNative.EndpointProviderImpl();
      p.setDependency(placeholders[32917].EndpointProvider, endpointProvider);
      const cliOptions = new parentNative.CliRuntimeOptions();
      cliOptions.set({
        cwd: f.cwd,
        model: product.raw.models[0]!.id,
        print: false,
        inputFormat: "stream-json",
      });
      p.setDependency(placeholders[74183].CliRuntimeOptions, cliOptions);
      const key = h.native.getModule(90014).METADATA_KEY,
        ctor = f.controller.constructor;
      h.define(key.controller, ctor, { path: "internal/agent" });
      h.define(key.controllerMethod, ctor, [
        { key: "run", method: "POST", options: "" },
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
      const provider = new h.C.RouteProviderImpl();
      provider.routeBuilder = builder;
      provider.init();
      await provider.provide();
      const matcher = new h.C.RouteMetadataMatcherImpl();
      Object.assign(matcher, {
        routeProvider: provider,
        requestMatcher: h.matcher,
      });
      const { adapter } = h.mvc([]);
      adapter.routeMetadataMatcher = matcher;
      const resolver = new h.C.ViewResolverImpl();
      resolver.defaultViewName = "acp";
      resolver.viewProvider = new h.C.ViewProvider([host.view]);
      adapter.viewResolver = resolver;
      const http = new h.C.HttpMiddleware();
      http.logger = f.logger;
      const errorHandler = new parentNative.CliServerErrorHandler();
      errorHandler.logger = f.logger;
      const dispatcher = new h.C.DispatcherImpl();
      Object.assign(dispatcher, {
        logger: f.logger,
        handlerExecutionChain: h.chain,
        middlewareProvider: new h.C.MiddlewareProvider([http, f.middleware]),
        handlerMapping: new h.C.HandlerMappingImpl([adapter]),
        errorHandlerProvider: new h.C.ErrorHandlerProvider([errorHandler]),
      });
      server = createServer((req, res) => {
        void (async () => {
          if (
            !accepting ||
            req.headers.authorization !== "Bearer " + capability ||
            req.headers[parentNative.security.CUSTOM_REQUEST_HEADER] !== "1"
          ) {
            res.writeHead(403);
            res.end();
            return;
          }
          const chunks: Buffer[] = [];
          let bytes = 0;
          for await (const part of req) {
            bytes += part.length;
            if (bytes > 8192) {
              res.writeHead(413);
              res.end();
              return;
            }
            chunks.push(part);
          }
          const request: any = req;
          request.path = new URL(req.url!, "http://127.0.0.1").pathname;
          request.body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          request.query = {};
          request.get = (name: string) => req.headers[name.toLowerCase()];
          httpRequests.push({ request, response: res });
          await h.run((ctx) => dispatcher.dispatch(ctx), request, res as any);
        })().catch((error) => {
          errors.push(["HTTP", error.message]);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.end("owned HTTP failed");
          }
        });
      });
      await new Promise<void>((resolve, reject) => {
        server!.once("error", reject);
        server!.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address();
      assert.ok(address && typeof address !== "string");
      origin = "http://127.0.0.1:" + address.port;
      await endpointProvider.setServer(server);
      const initialized: any = await checked(
        "initialize",
        client.initialize({
          protocolVersion: 1,
          clientCapabilities: {},
        }),
      );
      assert.equal(initialized.protocolVersion, 1);
      const result: any = await checked(
        "newSession",
        client.newSession({ cwd: f.cwd, mcpServers: [] }),
      );
      assert.equal(restCalls.length, 1);
      assert.equal(restCalls[0].body.acp, true);
      assert.equal(restCalls[0].body.interactive, false);
      assert.equal(restCalls[0].options.proxy, false);
      assert.equal(
        restCalls[0].options.headers["acp-connection-id"],
        connectionId,
      );
      assert.equal(restCalls[0].body.prompt, undefined);
      assert.equal(restCalls[0].body.cwd, undefined);
      assert.equal(restCalls[0].body.print, undefined);
      const entry = host.getEntry(connectionId);
      assert.equal(entry?.ready, true);
      const session = entry!.session;
      assert.notEqual(session, f.s);
      assert.equal(session.id, result.sessionId);
      assert.equal(registration[0].session, session);
      assert.equal(registration[0].path, "/internal/agent");
      assert.equal(httpRequests[0].response.writableEnded, false);
      assert.equal(p.agent.getCurrentSessionId(), session.id);
      assert.equal(p.agent.getSessionRequest(), undefined);
      assert.equal(result.modes.currentModeId, "default");
      assert.equal(result.models.currentModelId, product.raw.models[0]!.id);
      const responses: any[] = [];
      for (const text of ["read parent file", "continue parent conversation"]) {
        responses.push(
          await checked(
            "prompt",
            client.prompt({
              sessionId: session.id,
              prompt: [{ type: "text", text }],
            }),
          ),
        );
        await f.drain();
      }
      assert.ok(
        responses.every((r) => r.stopReason === "end_turn"),
        JSON.stringify({ responses, errors, logs: p.logs.slice(-8) }),
      );
      assert.equal(modelRequests.length, 3);
      assert.ok(modelRequests.every((r) => r.connectionId === connectionId));
      assert.match(
        JSON.stringify(modelRequests.at(-1).input),
        /parent Read done/,
      );
      assert.ok(
        modelRequests.every(
          (r) =>
            !JSON.stringify(r.input).includes(capability) &&
            !JSON.stringify(r.input).includes(authToken),
        ),
      );
      const disk = await io.readFile(
        f.store.getSessionFilePath(session.id),
        "utf8",
      );
      assert.match(disk, /owned native parent Read/);
      assert.match(disk, /parent continued/);
      let switched: any;
      if (mode === "switch") {
        const next: any = await checked(
          "newSession switch",
          client.newSession({ cwd: f.cwd, mcpServers: [] }),
        );
        const second = host.getEntry(connectionId)!.session;
        assert.notEqual(second, session);
        assert.equal(second.id, next.sessionId);
        assert.equal(session.resultSubject.isStopped, true);
        assert.equal(httpRequests.length, 2);
        assert.equal(httpRequests[0].response.writableEnded, false);
        assert.equal(httpRequests[1].response.writableEnded, true);
        assert.equal(host.iteratorCount, 1);
        assert.equal(host.rawView.activeRenderConnections.size, 1);
        const reply: any = await checked(
          "switched prompt",
          client.prompt({
            sessionId: second.id,
            prompt: [{ type: "text", text: "fresh parent conversation" }],
          }),
        );
        await f.drain();
        assert.equal(reply.stopReason, "end_turn");
        assert.equal(modelRequests.length, 4);
        assert.equal(modelRequests.at(-1).sessionId, second.id);
        assert.ok(
          !JSON.stringify(modelRequests.at(-1).input).includes(
            "parent Read done",
          ),
        );
        assert.ok(
          !JSON.stringify(modelRequests.at(-1).input).includes(
            "owned native parent Read",
          ),
        );
        assert.equal(second.usage.totalTokens, 16);
        switched = {
          freshHistory: true,
          duplicateHttpEnded: true,
          originalHttpOpen: true,
          currentTargetUpdated: true,
        };
      }
      accepting = false;
      await host.close();
      await Promise.allSettled([...transports]);
      await Promise.allSettled([...interruptionJobs]);
      for (const sub of interruptionSubscriptions) sub.unsubscribe();
      assert.equal(httpRequests[0].response.writableEnded, true);
      assert.equal(host.pendingCount, 0);
      assert.equal(host.timerCount, 0);
      assert.equal(host.rawView.activeRenderConnections.size, 0);
      assert.equal(tasks.eventNames().length, 0);
      assert.equal(host.asynchronousErrors.length, 0);
      assert.equal(f.errors.length, 0);
      assert.equal(errors.length, 0, JSON.stringify(errors));
      return {
        mode,
        newSession: true,
        nativeSession: true,
        responseBeforeHttpEnd: true,
        registrationPath: registration[0].path,
        ready: entry!.ready,
        stopReasons: responses.map((r) => r.stopReason),
        modelRequests: modelRequests.length,
        requestContexts: modelRequests.map((r) => r.connectionId),
        persistedRead: true,
        usage: session.usage.totalTokens,
        restoredCurrent: result.models.currentModelId,
        sourceRenderCleaned: true,
        switched,
      };
    } finally {
      await host?.close();
      if (server) {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server!.close(() => resolve()));
      }
      await Promise.allSettled([...transports]);
      await services?.close();
      if (client && endpoint) {
        await Promise.allSettled([
          client.connection.writeQueue,
          endpoint.connection.writeQueue,
        ]);
        const a = toAgent.writable.getWriter(),
          b = toClient.writable.getWriter();
        try {
          await Promise.allSettled([a.close(), b.close()]);
        } finally {
          a.releaseLock();
          b.releaseLock();
        }
        await Promise.all([client.closed, endpoint.closed]);
      }
      p?.agent.urlSubjectSubscription?.unsubscribe();
      p?.close();
      await auth.close();
      await h.close();
      await f.close();
      await agents?.close();
    }
  });
}
