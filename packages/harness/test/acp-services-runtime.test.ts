import test from "node:test";
import { ACP_SERVICES_CASES } from "../scripts/helpers/acp-services-scenarios.js";
import { createNativeAcpServices } from "../src/protocol/native-acp-services.js";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { createAcpServicesHost } from "../src/protocol/acp-services-host.js";
import { createNativeAcpView } from "../src/protocol/native-acp-view.js";
import { acpProtocolFixture } from "../scripts/helpers/acp-protocol-fixture.js";
import { settle } from "../scripts/helpers/acp-protocol-fixture.js";
import { PermissionMode } from "../src/permissions/permission.js";
setTraceProcessors([]);
for (const scenario of ACP_SERVICES_CASES)
  test(scenario.name, { timeout: 5000 }, () =>
    scenario.run(createNativeAcpServices),
  );

async function backendFixture(t: any, patch: any = {}, servicePatch: any = {}) {
  const dir = await mkdtemp(join(tmpdir(), "acp-services-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "owned.txt");
  await writeFile(path, "owned view file\n");
  const requests: any[] = [];
  let turn = 0;
  const text = (value: string) => [
    {
      type: "message",
      role: "assistant",
      id: "answer-" + turn,
      status: "completed",
      content: [{ type: "output_text", text: value }],
    },
  ];
  const model: Model = {
    getResponse: async (request: any) => {
      requests.push(request);
      return {
        output: text('{"title":"SDK generated title"}') as any,
        usage: new Usage(),
      };
    },
    async *getStreamedResponse(request: any) {
      requests.push(request);
      turn++;
      const output =
        turn === 1
          ? [
              {
                type: "function_call",
                callId: "owned-read",
                id: "owned-read",
                name: "Read",
                arguments: JSON.stringify({ file_path: path }),
                status: "completed",
              },
            ]
          : text(
              turn === 2
                ? "view read done"
                : turn === 3
                  ? "view replayed"
                  : '{"title":"SDK generated title"}',
            );
      yield { type: "response_started" };
      if (turn > 1)
        yield {
          type: "output_text_delta",
          delta: (output[0] as any).content[0].text,
        };
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
    ...patch,
  });
  t.after(() => backend.close());
  const session = await backend.openSession(undefined, {
    permissionMode: PermissionMode.BypassPermissions,
  });
  const f = acpProtocolFixture(undefined, {
    session,
    sessionManager: backend.sessions,
    stateMachine: backend.stateMachine,
    tasks: backend.taskManager,
    realTimers: true,
    modules: { 54193: { getTeamMemberRegistry: () => backend.teamMembers } },
  });
  t.after(() => f.close());
  const host = createAcpServicesHost({
    backend,
    getModule: f.base.getModule,
    modules: f.modules,
    logger: f.logger,
    ...servicePatch,
  });
  t.after(() => host.close());
  return { dir, path, backend, session, f, host, requests };
}

test(
  "full native View executes real SDK Read, broadcasts peer output, publishes usage and generates title",
  { timeout: 20000 },
  async (t) => {
    const { backend, session, f, host, requests } = await backendFixture(t),
      peer: any[] = [];
    f.agent.connectionId = "origin";
    f.agent.currentSessionId = session.id;
    host.registerConnection("origin", f.agent);
    host.registerConnection("peer", {
      getConnection: () => ({
        sessionUpdate: async (update: any) => {
          peer.push(update);
        },
      }),
    });
    f.setDependency(host.helpers.SessionTitleService, host.title);
    f.setDependency(f.p.protocol.AcpUsagePublisher, host.usage);
    const source = createNativeAcpView({
        modules: {
          ...f.modules,
          20881: host.helpers.titleHelpers,
          76586: { SessionTitleService: host.helpers.SessionTitleService },
        },
        getModule: f.base.getModule,
      }),
      view = new source.AcpView();
    Object.assign(view, {
      logger: f.logger,
      stateMachine: backend.stateMachine,
      sessionManager: backend.sessions,
      commandManager: backend.commandManager,
      agentService: backend.service,
      broadcastService: host.broadcast,
      frictionAnalysisService: host.friction,
    });
    host.usage.register(session, f.agent.connection);
    const providerData = { extra_vars: { owned: true } };
    session.requestOptions.providerData = providerData;
    for (const [index, prompt] of [
      "read the owned file",
      "continue from history",
    ].entries()) {
      const marker = f.base.timestamps.createAcpHistoryMarker(session.history);
      const response = await view.executePrompt(
        {
          request: {
            sessionId: session.id,
            prompt: [{ type: "text", text: prompt }],
            _meta: { "codebuddy.ai": { growthEvent: "owned-growth" } },
          },
          tracking: {
            requestId: "request-" + index,
            messageId: "message-" + index,
            messageRequestId: "user-" + index,
          },
        },
        session,
        f.agent,
        marker,
      );
      assert.equal(response.stopReason, "end_turn");
      await backend.sessions.waitForResultHandled(
        session.resultSubject.value as any,
      );
      assert.equal(session.requestOptions.providerData, providerData);
    }
    await host.flush();
    assert.ok(
      peer.some(
        (update) => update.update?.sessionUpdate === "user_message_chunk",
      ),
    );
    assert.ok(
      peer.some((update) => update.update?.content?.text === "view read done"),
    );
    assert.ok(
      peer.some(
        (update) =>
          update.update?.sessionUpdate === "session_end" &&
          update.update.stopReason === "end_turn",
      ),
    );
    assert.equal(host.broadcast.subscriptions.size, 0);
    assert.equal(view.activePromptAbortControllers.size, 0);
    await host.usage.publish(session.id, "prompt_end");
    assert.ok(
      f.updates.some(
        (update) =>
          update.update?.sessionUpdate === "usage_update" &&
          update.update.size === 4096,
      ),
    );
    host.title.setForceEnabled(true);
    await host.title.handleUserPromptSubmit("read the owned file", session);
    await host.flush();
    assert.ok(
      session.history.some(
        (item: any) =>
          item.type === "ai-title" && item.aiTitle === "SDK generated title",
      ),
    );
    assert.match(JSON.stringify(requests[2].input), /owned view file/);
    assert.equal(f.permissions.length, 0);
    await host.close();
    assert.equal(host.timerCount, 0);
    assert.equal(host.pendingCount, 0);
    assert.equal(
      await backend.prompt(session, "backend remains borrowed"),
      '{"title":"SDK generated title"}',
    );
  },
);

test(
  "services close joins unawaited borrowed title/metric callbacks without changing their receivers",
  { timeout: 10000 },
  async (t) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const updater = {
      seen: "",
      update(title: string) {
        this.seen = title;
        return held;
      },
    };
    const metric = {
      seen: 0,
      addCounter() {
        this.seen++;
        return held;
      },
    };
    const { backend, session, host } = await backendFixture(
      t,
      {},
      { terminalTitleUpdater: updater, galileoService: metric },
    );
    const run = backend.service.runOneTime.bind(backend.service);
    backend.service.runOneTime = async () => '{"title":"Callback title"}';
    try {
      session.history.push({
        type: "message",
        role: "user",
        content: "owned callback request",
      });
      host.title.setForceEnabled(true);
      await host.title.handleUserPromptSubmit(
        "owned callback request",
        session,
      );
      assert.equal(updater.seen, "Callback title");
      assert.equal(metric.seen, 1);
      let closed = false;
      const closing = host.close().then(() => {
        closed = true;
      });
      await settle();
      assert.equal(closed, false);
      release();
      await closing;
      assert.equal(host.pendingCount, 0);
    } finally {
      release();
      backend.service.runOneTime = run;
    }
  },
);

test(
  "services host joins accepted title generation, rejects new calls and leaves borrowed backend alive",
  { timeout: 10000 },
  async (t) => {
    const { backend, session, host, f } = await backendFixture(t),
      deferred = new f.p.Deferred();
    const original = backend.service.runOneTime.bind(backend.service);
    backend.service.runOneTime = async () => deferred.promise;
    session.history.push({
      type: "message",
      role: "user",
      content: "owned title request",
    });
    host.title.setForceEnabled(true);
    const accepted = host.title.handleUserPromptSubmit(
      "owned title request",
      session,
    );
    let closed = false;
    const closing = host.close().then(() => {
      closed = true;
    });
    await settle();
    assert.equal(closed, false);
    assert.throws(
      () => host.title.handleUserPromptSubmit("late", session),
      /closed/,
    );
    deferred.resolve('{"title":"Late owned title"}');
    await accepted;
    await closing;
    assert.equal(host.close(), host.close());
    assert.equal(host.timerCount, 0);
    assert.equal(host.pendingCount, 0);
    backend.service.runOneTime = original;
    assert.equal((await backend.openSession()).id.length > 0, true);
  },
);

test(
  "services host has no default remote recall/report transport and closes accepted denied recall",
  { timeout: 10000 },
  async (t) => {
    const { host, f } = await backendFixture(t);
    host.recall.productManager = {
      waitConfiguration: async () => ({
        endpoint: "https://never-contacted.invalid",
        productFeatures: { ChatPromptFrictionAnalysis: true },
      }),
    };
    assert.equal(await host.recall.recall("owned prompt"), undefined);
    assert.ok(
      f.logs.some((value) =>
        JSON.stringify(value).includes("requires explicit restOperations"),
      ),
    );
    await host.close();
    assert.throws(() => host.registerConnection("late", f.agent), /closed/);
  },
);

test(
  "services close waits for accepted broadcasts and never closes borrowed connections",
  { timeout: 10000 },
  async (t) => {
    const { session, host, f } = await backendFixture(t),
      deferred = new f.p.Deferred();
    let clientClosed = false;
    host.registerConnection("peer", {
      getConnection: () => ({
        sessionUpdate: async () => deferred.promise,
        close: () => {
          clientClosed = true;
        },
      }),
    });
    const accepted = host.broadcast.broadcastUserMessage(
      session.id,
      "owned broadcast",
      "origin",
      undefined,
      undefined,
      session,
      123,
    );
    await settle();
    assert.equal(host.timerCount, 1);
    let closed = false;
    const closing = host.close().then(() => {
      closed = true;
    });
    await settle();
    assert.equal(closed, false);
    deferred.resolve();
    await accepted;
    await closing;
    assert.equal(clientClosed, false);
    assert.equal(host.timerCount, 0);
    assert.equal(host.pendingCount, 0);
    assert.equal(host.connectionCount, 0);
  },
);

test(
  "owned service facades preserve method name/arity/identity and reject retained calls after close",
  { timeout: 10000 },
  async (t) => {
    const { host } = await backendFixture(t),
      method = host.title.handleUserPromptSubmit;
    assert.equal(method.name, "handleUserPromptSubmit");
    assert.equal(method.length, 2);
    assert.equal(method, host.title.handleUserPromptSubmit);
    await host.close();
    assert.throws(() => method("late", {}), /closed/);
  },
);
