// Explicit integration test DI. Business Agent/View, permissions, queues, tasks, teams and SDK are real recovered implementations.
import { AsyncLocalStorage } from "node:async_hooks";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { filter, distinctUntilChanged } from "rxjs/operators/index.js";
import { Usage, type Model } from "@openai/agents-core";
import { createHarness } from "../../src/runtime/create-harness.js";
import { createCapturedAcpSdk } from "../../src/vendor/captured-acp-sdk.js";
import { createNativeAcpLifecycle } from "../../src/protocol/native-acp-lifecycle.js";
import { createAcpViewHost } from "../../src/protocol/acp-view-host.js";
import { createAcpServicesHost } from "../../src/protocol/acp-services-host.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import { QueueDispatchUtils } from "../../src/sessions/message-queue-manager.js";
import { acpProtocolFixture } from "./acp-protocol-fixture.js";

export async function acpViewFixture(t: any, patch: any = {}) {
  const dir = await mkdtemp(join(tmpdir(), "acp-full-view-")),
    path = join(dir, "owned.txt"),
    localApprovals: any[] = [],
    requests: any[] = [],
    updates: any[] = [],
    permissions: any[] = [],
    wire: any[] = [],
    sdkErrors: any[] = [];
  if (patch.toolName === "Read")
    await writeFile(path, "owned readable content");
  let turn = 0;
  const model: Model = patch.model ?? {
    getResponse: async () => ({ output: [], usage: new Usage() }),
    async *getStreamedResponse(request: any) {
      requests.push(request);
      const write =
        patch.toolName === "Read"
          ? { file_path: path }
          : { file_path: path, content: "written through ACP" };
      const output: any[] =
        ++turn === 1 || (patch.repeatWrite && turn === 2)
          ? [
              {
                type: "function_call",
                id: turn === 1 ? "owned-write" : "owned-write-2",
                callId: turn === 1 ? "owned-write" : "owned-write-2",
                name: patch.deferred
                  ? "DeferExecuteTool"
                  : (patch.toolName ?? "Write"),
                arguments: JSON.stringify(
                  patch.deferred ? { toolName: "Write", params: write } : write,
                ),
                status: "completed",
              },
            ]
          : [
              {
                type: "message",
                role: "assistant",
                id: "answer-" + turn,
                status: "completed",
                content: [
                  { type: "output_text", text: "view complete 中文😀" },
                ],
              },
            ];
      yield { type: "response_started" };
      if (output[0]?.type === "message")
        yield { type: "output_text_delta", delta: "view complete 中文😀" };
      yield {
        type: "response_done",
        response: {
          id: "response-" + turn,
          output,
          usage: { inputTokens: 23, outputTokens: 4, totalTokens: 27 },
        },
      } as any;
    },
  };
  const backend = await createHarness({
    workDir: dir,
    stateDir: join(dir, "state"),
    nativePermissions: true,
    nativeApprovals: true,
    model: "fixture-model",
    modelProvider: { getModel: () => model },
    recordReplayEnv: {},
    productRuntime: {
      watch: false,
      environment: false,
      providers: [
        {
          priority: 200000,
          provide: async () => ({
            mergeStrategy: "smartMerge",
            models: [
              { id: "fixture-model", name: "Fixture", maxInputTokens: 4096 },
            ],
            agents: [{ name: "cli", models: ["fixture-model"] }],
          }),
        },
      ],
    },
    approveTool: async (...args) => {
      localApprovals.push(args);
      return false;
    },
    ...patch.backend,
  });
  const session = await backend.openSession(undefined, {
    permissionMode: PermissionMode.Default,
  });
  if (patch.deferred) await backend.tools.ensureBuiltinDeferIndexed("Write");
  let host: ReturnType<typeof createAcpViewHost> | undefined,
    services: ReturnType<typeof createAcpServicesHost> | undefined,
    f: ReturnType<typeof acpProtocolFixture> | undefined,
    client: any,
    endpoint: any;
  const toAgent = new TransformStream<any, any>(),
    toClient = new TransformStream<any, any>({
      transform(message, controller) {
        wire.push(message);
        controller.enqueue(message);
      },
    });
  t.after(async () => {
    try {
      await host?.close();
    } finally {
      try {
        await services?.close();
      } finally {
        if (client && endpoint) {
          await Promise.allSettled([
            client.connection.writeQueue,
            endpoint.connection.writeQueue,
          ]);
          const a = toAgent.writable.getWriter(),
            c = toClient.writable.getWriter();
          try {
            await Promise.allSettled([a.close(), c.close()]);
          } finally {
            a.releaseLock();
            c.releaseLock();
          }
          await Promise.all([client.closed, endpoint.closed]);
        }
        f?.agent.urlSubjectSubscription?.unsubscribe();
        f?.close();
        await backend.close();
        await rm(dir, { recursive: true, force: true });
      }
    }
  });
  const context = new AsyncLocalStorage<any>(),
    teamTokens = {
      TeamManager: Symbol("TeamManager"),
      TeamMailbox: Symbol("TeamMailbox"),
    },
    placeholders: any = {
      71915: {},
      7357: {},
      30654: {},
      95449: {},
      9151: { ProductManager: Symbol("ProductManager") },
      79814: { ExternalUriOpener: Symbol("ExternalUriOpener") },
      86480: { CliSettingsProvider: Symbol("CliSettingsProvider") },
      54193: { getTeamMemberRegistry: () => backend.teamMembers },
      68366: teamTokens,
      39983: { distinctUntilChanged },
      69745: { filter },
      47005: {
        BODY_MIDDLEWARE_PRIORITY: 200,
        Context: { getRequest: () => context.getStore().request },
      },
    };
  const sdk = (patch.sdkFactory ?? createCapturedAcpSdk)({
    console: { error: (...args: any[]) => sdkErrors.push(args) },
  });
  f = acpProtocolFixture(patch.protocolFactories, {
    session,
    sessionManager: backend.sessions,
    stateMachine: backend.stateMachine,
    tasks: backend.taskManager,
    interruptionService: backend.interruptions,
    realTimers: true,
    Date,
    modules: { ...placeholders, 38113: sdk },
  });
  Object.assign(f.modules[35151], {
    SettingsManager: Symbol("SettingsManager"),
    CliSettingsProvider: placeholders[86480].CliSettingsProvider,
  });
  const lifecycle = (patch.lifecycleFactory ?? createNativeAcpLifecycle)({
    getModule: f.base.getModule,
    modules: {
      ...f.modules,
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
  Object.assign(f.modules[93039], { QueueDispatchUtils });
  f.setDependency(placeholders[71915].SessionManager, backend.sessions);
  f.setDependency(
    placeholders[71915].SessionRunStateMachine,
    backend.stateMachine,
  );
  f.setDependency(
    placeholders[71915].InterruptionService,
    backend.approvalOwners.interruptionService,
  );
  f.setDependency(f.base.getModule(69466).AgentManager, backend.agents);
  f.setDependency(teamTokens.TeamManager, backend.teamManager);
  f.setDependency(teamTokens.TeamMailbox, backend.teamMailbox);
  f.setDependency(
    f.p.protocol.DelegateToolManager,
    backend.delegateToolManager,
  );
  f.setDependency(f.modules[35151].SettingsManager, backend.settingsManager);
  f.setDependency(
    placeholders[86480].CliSettingsProvider,
    backend.settingsHost.cli,
  );
  f.setDependency(
    placeholders[30654].HostCapabilityProvider,
    new lifecycle.capability.HostCapabilityProvider(),
  );
  f.setDependency(placeholders[95449].ReferenceService, backend.references);
  f.setDependency(f.modules[40348].AskService, backend.asks);
  f.setDependency(f.modules[87422].CommandManager, backend.commandManager);
  const external: any = new lifecycle.CliExternalUriOpener();
  external.logger = f.logger;
  f.setDependency(placeholders[79814].ExternalUriOpener, external);
  f.setDependency(placeholders[9151].ProductManager, backend.productManager);
  services = createAcpServicesHost({
    backend,
    getModule: f.base.getModule,
    modules: f.modules,
    logger: f.logger,
    ...(patch.servicesFactory ? { sourceFactory: patch.servicesFactory } : {}),
  });
  f.modules[20881] = services.helpers.titleHelpers;
  f.modules[76586] = {
    SessionTitleService: services.helpers.SessionTitleService,
  };
  f.setDependency(services.helpers.SessionTitleService, services.title);
  f.setDependency(f.p.protocol.AcpUsagePublisher, services.usage);
  endpoint = new sdk.AgentSideConnection(
    (connection: any) => {
      f!.agent.setConnection(connection, "owned-connection");
      return new Proxy(f!.agent, {
        get(target, key) {
          const actual = host?.rpcAgent ?? target,
            raw = Reflect.get(actual, key, actual);
          return typeof raw === "function" ? raw.bind(actual) : raw;
        },
      });
    },
    { readable: toAgent.readable, writable: toClient.writable },
  );
  client = new sdk.ClientSideConnection(
    () => ({
      sessionUpdate: async (update: any) => {
        updates.push(update);
      },
      requestPermission: async (request: any) => {
        permissions.push(request);
        return (
          (await patch.requestPermission?.(request)) ?? {
            outcome: { outcome: "selected", optionId: "allow" },
          }
        );
      },
    }),
    { readable: toClient.readable, writable: toAgent.writable },
  );
  const agentManager = {
    get: (id: string) => (id === "owned-connection" ? f!.agent : undefined),
  };
  host = createAcpViewHost({
    backend,
    session,
    agent: f.agent,
    agentManager,
    services,
    runtime: f.runtime,
    followUpPauseState: lifecycle.team,
    logger: f.logger,
    ...(patch.protocolFactories?.view
      ? { sourceFactory: patch.protocolFactories.view }
      : {}),
    runInContext: (operation) =>
      context.run(
        { request: { headers: { "acp-connection-id": "owned-connection" } } },
        operation,
      ),
  });
  await host.start();
  return {
    dir,
    path,
    backend,
    session,
    f,
    lifecycle,
    sdk,
    client,
    endpoint,
    host,
    services,
    updates,
    permissions,
    requests,
    localApprovals,
    wire,
    sdkErrors,
    context,
  };
}
