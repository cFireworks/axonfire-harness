import assert from "node:assert/strict";
import { sessionIngressFixture } from "./session-ingress-fixture.js";
import { createNativeSessionIngress } from "../../src/sessions/native-session-ingress.js";
import { PermissionMode as Mode } from "../../src/permissions/permission.js";
type Fixture = ReturnType<typeof sessionIngressFixture>;
type Factory = typeof createNativeSessionIngress;
type Scenario = { name: string; run(factory: Factory): Promise<any> };
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const scenario = (
  name: string,
  run: (f: Fixture) => Promise<any>,
  patch: any = {},
): Scenario => ({
  name,
  run: async (factory) => run(sessionIngressFixture(factory, patch)),
});
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function snapshot(session: any) {
  return {
    id: session.id,
    history: session.history,
    options: session.options,
    meta: session.meta,
    runState: session.runState,
    requestOptions: session.requestOptions,
    permissionMode: session.permissionModeSubject.value,
  };
}
export const SESSION_INGRESS_CASES: Scenario[] = [
  scenario(
    "source print run remains pending until owned agent work completes",
    async (f) => {
      const wait = deferred(),
        entered = deferred();
      f.controller.agentService.runDefault = async () => {
        entered.resolve();
        await wait.promise;
      };
      const s = await f.sessionFactory.create({ id: "print-barrier" });
      f.manager.setCurrent(s);
      let done = false;
      const pending = f.controller
        .run({ prompt: "owned", print: true })
        .then((value: any) => {
          done = true;
          return value;
        });
      await entered.promise;
      await tick();
      assert.equal(done, false);
      wait.resolve();
      assert.equal(await pending, s);
      assert.equal(done, true);
      return done;
    },
  ),
  scenario(
    "source print run propagates model errors without scheduling background work",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "print-error" });
      f.manager.setCurrent(s);
      await assert.rejects(
        f.controller.run({ prompt: "owned", print: true }),
        /owned model failure/,
      );
      assert.equal(f.scheduled.length, 0);
      return f.calls;
    },
    {
      run: async () => {
        throw Error("owned model failure");
      },
    },
  ),
  scenario(
    "source permission initialization failure prevents hook, current selection and controller",
    async (f) => {
      let next = false;
      await assert.rejects(
        f.middleware.handle(
          { request: { body: { sessionId: "init-error", acp: true } } },
          async () => {
            next = true;
          },
        ),
        /owned permission initialization failure/,
      );
      assert.equal(next, false);
      assert.equal(f.manager.getCurrent(), undefined);
      assert.equal(
        f.calls.some((x) => ["setup", "start", "run"].includes(x[0])),
        false,
      );
      return f.calls;
    },
    {
      permissions: async () => {
        throw Error("owned permission initialization failure");
      },
    },
  ),
  scenario(
    "source SessionFactory owns subjects, preserves seed references and reconstructs SDK Usage",
    async (f) => {
      const history = [
          { id: "a", type: "message", role: "user", content: "a" },
          {
            id: "b",
            parentId: "a",
            type: "message",
            role: "assistant",
            content: "b",
            providerData: {
              usage: { inputTokens: 4, outputTokens: 3, totalTokens: 7 },
            },
          },
        ],
        queue = [{ type: "message", role: "user", content: "queued" }],
        options = { permissionMode: Mode.Plan },
        state = { status: "pending" },
        requestOptions = { model: "owned" };
      const s = await f.sessionFactory.create({
        history,
        queue,
        options,
        requestOptions,
        runState: state,
        createdAt: 42,
        agentState: "agent_start",
        other: "seed",
      });
      assert.equal(s.history, history);
      assert.equal(s.queue, queue);
      assert.equal(s.queueSubject.value, queue);
      assert.equal(s.options, options);
      assert.equal(s.requestOptions, requestOptions);
      assert.equal(s.runState, state);
      assert.equal(s.agentStateSubject.value, "agent_start");
      assert.equal(s.permissionModeSubject.value, Mode.Plan);
      assert.equal(s.usage.totalTokens, 7);
      assert.equal(s.createdAt, 42);
      assert.equal(s.updatedAt, 1700000000000);
      assert.equal(s.other, "seed");
      assert.equal(s.abortSignal, s.abortController.signal);
      assert.equal(s.abortSignal.aborted, false);
      assert.equal(s.toolPermissionContext.allowRules.session.length, 0);
      assert.equal(s.resultAbortSignalMap instanceof WeakMap, true);
      const recent: any[] = [];
      s.combineSubject.next("first");
      s.combineSubject.subscribe((x: any) => recent.push(x));
      assert.deepEqual(
        recent,
        ["first"],
        "source ReplaySubject(0) retains one item in pinned RxJS",
      );
      return [
        snapshot(s),
        s.usage.totalTokens,
        s.createdAt,
        s.updatedAt,
        recent,
        s.phaseSubject.value,
      ];
    },
  ),
  scenario(
    "source factory defaults are shared run-state values but isolated queues, permission maps and abort controllers",
    async (f) => {
      const a = await f.sessionFactory.create(),
        b = await f.sessionFactory.create();
      assert.equal(a.runState, b.runState);
      assert.notEqual(a.queue, b.queue);
      assert.notEqual(a.conditionalRules, b.conditionalRules);
      assert.notEqual(a.abortController, b.abortController);
      assert.notEqual(a.toolPermissionContext, b.toolPermissionContext);
      const s = await f.sessionFactory.create({
        options: { permissionMode: "invalid" },
      });
      assert.equal(s.permissionModeSubject.value, Mode.Default);
      return [snapshot(a), snapshot(b), s.permissionModeSubject.value];
    },
  ),
  scenario(
    "source runState setter suppresses identity/status/time duplicates and publishes changed transition timestamps",
    async (f) => {
      const s = await f.sessionFactory.create(),
        seen: any[] = [];
      s.runStateSubject.subscribe((x: any) => seen.push(x));
      const descriptor = Object.getOwnPropertyDescriptor(s, "runState")!;
      assert.equal(descriptor.enumerable, true);
      assert.equal(descriptor.configurable, true);
      const initial = s.runState;
      s.runState = { status: "idle", extra: "ignored" };
      assert.equal(s.runState, initial);
      s.runState = { status: "pending", lastTransition: { at: 1, event: "a" } };
      const pending = s.runState;
      s.runState = {
        status: "pending",
        lastTransition: { at: 1, event: "ignored" },
      };
      assert.equal(s.runState, pending);
      s.runState = { status: "pending", lastTransition: { at: 2 } };
      s.runState = undefined;
      assert.equal(seen.length, 4);
      assert.equal(s.runState.status, "idle");
      return seen;
    },
  ),
  scenario(
    "source sandbox approval store keys are canonical command NUL cwd and stores only session approval",
    async (f) => {
      const store = new f.n.SandboxApprovalStoreImpl(),
        key = { canonicalCommand: "owned echo", cwd: "/owned" };
      assert.equal(store.get(key), undefined);
      store.put(key);
      store.put({ ...key, other: true });
      assert.equal(store.size(), 1);
      assert.equal(store.get({ ...key }), "approved_for_session");
      assert.equal(store.get({ ...key, cwd: "/other" }), undefined);
      store.put({ canonicalCommand: "owned echo", cwd: "/other" });
      assert.equal(store.size(), 2);
      store.clear();
      assert.equal(store.size(), 0);
      return store.size();
    },
  ),
  scenario(
    "source controller removes standard auth/cookie headers case-insensitively, preserves arbitrary custom headers",
    async (f) => {
      const headers = {
        Authorization: "owned-test-value",
        COOKIE: "owned-test-cookie",
        Host: "owned.invalid",
        "X-Owned": "kept",
        "acp-connection-id": "connection",
      };
      assert.deepEqual(f.controller.filterHeaders(headers), {
        "X-Owned": "kept",
        "acp-connection-id": "connection",
      });
      const s = await f.manager.create({
        id: "headers",
        requestOptions: { headers: { old: "retained" } },
      });
      f.manager.setCurrent(s);
      await f.controller.run({}, { Authorization: "owned" });
      assert.deepEqual(s.requestOptions.headers, { old: "retained" });
      await f.controller.run({}, headers);
      return s.requestOptions.headers;
    },
  ),
  scenario(
    "source getModels strips top-level URL/API key and keeps model metadata plus credits label",
    async (f) => {
      const result = await f.controller.getModels();
      assert.equal(result.models[0].name, "id");
      assert.equal(result.models[0].description, "description · 2");
      assert.equal(result.models[0]._meta["codebuddy.ai"].apiKey, undefined);
      assert.equal(result.models[0]._meta["codebuddy.ai"].url, undefined);
      return result;
    },
    {
      models: [
        {
          id: "id",
          description: "description",
          credits: 2,
          url: "https://owned.invalid",
          apiKey: "owned-test-only",
          extra: 1,
        },
      ],
    },
  ),
  scenario(
    "source getModels errors log and return empty list",
    async (f) => {
      assert.deepEqual(await f.controller.getModels(), { models: [] });
      assert.equal(f.logs.at(-1)[0], "error");
      return f.logs.at(-1)[1];
    },
    { modelsError: true },
  ),
  scenario(
    "source print run awaits model, resets trace fields and retains unchecked Number maxTurns conversion",
    async (f) => {
      const s = await f.manager.create({
        id: "print",
        traceId: "old",
        parentSpanId: "old",
      });
      f.manager.setCurrent(s);
      const result = await f.controller.run({
        prompt: "owned prompt",
        print: true,
        maxTurns: "bad-number",
        traceId: "new",
      });
      assert.equal(result, s);
      assert.equal(s.traceId, "new");
      assert.equal(s.parentSpanId, undefined);
      const run = f.calls.find((x) => x[0] === "run");
      assert.equal(Number.isNaN(run[2].maxTurns), true);
      assert.equal(f.scheduled.length, 0);
      return [run, s.traceId, s.parentSpanId];
    },
  ),
  scenario(
    "source interactive run returns session before owned setImmediate executes agent",
    async (f) => {
      const s = await f.manager.create({ id: "async" });
      f.manager.setCurrent(s);
      assert.equal(
        await f.controller.run({ prompt: "owned prompt", maxTurns: null }),
        s,
      );
      assert.equal(
        f.calls.some((x) => x[0] === "run"),
        false,
      );
      assert.equal(f.scheduled.length, 1);
      await f.scheduled.shift()!();
      const run = f.calls.find((x) => x[0] === "run");
      assert.equal(run[2].maxTurns, 0);
      return run;
    },
  ),
  scenario(
    "source stream-json parsing rejects invalid JSON and skips non-user messages with original codec",
    async (f) => {
      const s = await f.manager.create({ id: "json" });
      f.manager.setCurrent(s);
      await assert.rejects(
        f.controller.run({
          prompt: "invalid-json",
          inputFormat: "stream-json",
          print: true,
        }),
        /Error parsing streaming input line/,
      );
      await f.controller.run({
        prompt: [
          "",
          JSON.stringify({ type: "assistant", message: { content: "ignore" } }),
          JSON.stringify({
            type: "user",
            message: { content: [{ type: "text", text: "owned" }] },
          }),
        ].join("\n"),
        inputFormat: "stream-json",
        print: true,
      });
      const run = f.calls.find((x) => x[0] === "run");
      assert.deepEqual(run[1], [
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "owned" }],
        },
      ]);
      return run;
    },
  ),
  scenario(
    "source empty prompt does not reset traces or schedule a model run",
    async (f) => {
      const s = await f.manager.create({ id: "empty", traceId: "retained" });
      f.manager.setCurrent(s);
      await f.controller.run({ prompt: "", traceId: "ignored" });
      assert.equal(s.traceId, "retained");
      assert.equal(f.scheduled.length, 0);
      return s.traceId;
    },
  ),
  scenario(
    "source explicit sessionId wins resume and exact current identity avoids store read",
    async (f) => {
      const a = await f.manager.create({ id: "current" });
      f.manager.setCurrent(a);
      const result = await f.middleware.getOrCreateSession({
        sessionId: "current",
        resume: "missing",
      });
      assert.equal(result.session, a);
      assert.equal(result.source, "resume");
      assert.equal(
        f.calls.some((x) => x[0] === "get"),
        false,
      );
      return [result.source, result.session.id];
    },
  ),
  scenario(
    "source continue prefers current over stored most recent",
    async (f) => {
      const a = await f.manager.create({ id: "first" });
      await f.manager.create({ id: "latest" });
      f.manager.setCurrent(a);
      const result = await f.middleware.getOrCreateSession({ continue: true });
      assert.equal(result.session, a);
      return [result.source, result.session.id];
    },
  ),
  scenario("source continue without current loads most recent", async (f) => {
    await f.manager.create({ id: "latest" });
    const result = await f.middleware.getOrCreateSession({ continue: true });
    assert.equal(result.session.id, "latest");
    return [result.source, result.session.id, f.calls.at(-1)];
  }),
  scenario(
    "source missing explicit ID creates and saves unless resume is a string",
    async (f) => {
      const result = await f.middleware.getOrCreateSession({
        sessionId: "New-id_1:ok",
        sessionPersistence: false,
      });
      assert.equal(result.source, "startup");
      assert.equal(result.session.id, "New-id_1:ok");
      assert.equal(result.session.options.sessionPersistence, false);
      assert.deepEqual(f.calls.at(-1), ["save", "New-id_1:ok", undefined]);
      await assert.rejects(
        f.middleware.getOrCreateSession({
          sessionId: "not-found",
          resume: "resume-id",
        }),
        /No conversation found with session ID: resume-id/,
      );
      return [snapshot(result.session), f.calls];
    },
  ),
  scenario(
    "source session IDs reject traversal, whitespace and non-alphanumeric leading characters",
    async (f) => {
      for (const id of [
        "../owned",
        "_bad",
        "-bad",
        ":bad",
        "with space",
        "owned/child",
        "中文",
      ])
        await assert.rejects(
          f.middleware.getOrCreateSession({ sessionId: id }),
          /Invalid session ID format/,
        );
      assert.equal(f.calls.length, 0);
      return true;
    },
  ),
  scenario(
    "source empty explicit sessionId shadows resume then creates empty ID without regex guard",
    async (f) => {
      const result = await f.middleware
        .getOrCreateSession({ sessionId: "", resume: "missing" })
        .catch((error: any) => error.message);
      assert.equal(result, "No conversation found with session ID: missing");
      const empty = await f.middleware.getOrCreateSession({ sessionId: "" });
      assert.equal(empty.session.id, "");
      return [result, empty.session.id];
    },
  ),
  scenario(
    "source fork with resume/new-ID shallow-copies history/meta and force saves",
    async (f) => {
      const item = { type: "message", role: "user", content: "owned" },
        nested = { value: 1 };
      const parent = await f.manager.create({
        id: "parent",
        history: [item],
        meta: { nested },
      });
      const result = await f.middleware.getOrCreateSession({
        forkSession: true,
        resume: "parent",
        sessionId: "child",
        sessionPersistence: true,
      });
      assert.equal(result.source, "startup");
      assert.equal(result.session.id, "child");
      assert.notEqual(result.session.history, parent.history);
      assert.equal(result.session.history[0], item);
      assert.notEqual(result.session.meta, parent.meta);
      assert.equal(result.session.meta.nested, nested);
      assert.equal(result.session.meta.forkedFrom, "parent");
      assert.deepEqual(f.calls.at(-1), ["save", "child", true]);
      return snapshot(result.session);
    },
  ),
  scenario(
    "source fork with only sessionId uses that ID as source and generates a fresh destination",
    async (f) => {
      await f.manager.create({ id: "parent" });
      const result = await f.middleware.getOrCreateSession({
        forkSession: true,
        sessionId: "parent",
      });
      assert.equal(result.session.id, "owned-1");
      assert.equal(result.session.meta.forkedFrom, "parent");
      return snapshot(result.session);
    },
  ),
  scenario(
    "source fork errors distinguish missing resume from absent source",
    async (f) => {
      await assert.rejects(
        f.middleware.getOrCreateSession({
          forkSession: true,
          resume: "missing",
        }),
        /No conversation found with session ID/,
      );
      await assert.rejects(
        f.middleware.getOrCreateSession({ forkSession: true }),
        /No source session found/,
      );
      await assert.rejects(
        f.middleware.getOrCreateSession({
          forkSession: true,
          sessionId: "_bad",
        }),
        /Invalid session ID/,
      );
      return f.calls;
    },
  ),
  scenario(
    "source Defer tools normalize names/overlay and append required deferred tools",
    async (f) => {
      const body: any = {
        tools: "Read, Defer(Write), NoDefer(Read),Read",
        allowedTools: ["Read(*.md)"],
      };
      f.middleware.normalizeToolSpecs(body);
      assert.equal(body.tools, "Read,Write,ToolSearch,DeferExecuteTool");
      assert.deepEqual(body.toolDeferOverlay.forceDefer.exact, ["Write"]);
      assert.ok(f.logs.some((x) => x[0] === "warn"));
      return [body, f.logs];
    },
  ),
  scenario(
    "source malformed --tools and permission Defer modifiers produce original guidance",
    async (f) => {
      const errors = [];
      for (const body of [
        { tools: "Read(*.md)" },
        { allowedTools: ["Defer(Read)"] },
        { disallowedTools: [" NoDefer(Write)"] },
      ]) {
        try {
          f.middleware.normalizeToolSpecs(body);
          assert.fail("must reject");
        } catch (error: any) {
          errors.push(error.message);
        }
      }
      assert.match(errors[0], /Invalid --tools value/);
      assert.match(errors[1], /belong in --tools/);
      const unchanged: any = { tools: "default", allowedTools: "Defer(Read)" };
      f.middleware.normalizeToolSpecs(unchanged); // source iterates a string one character at a time
      return [errors, unchanged];
    },
  ),
  scenario(
    "source non-agent middleware request only awaits next",
    async (f) => {
      let next = 0;
      await f.middleware.handle(
        { request: { body: { tools: "Read(*.md)" } } },
        async () => {
          next++;
        },
      );
      assert.equal(next, 1);
      assert.equal(f.sessions.size, 0);
      return f.calls;
    },
    { match: false },
  ),
  scenario(
    "source handle composes factory, permission initialization, hooks, override, current and controller in order",
    async (f) => {
      const body: any = {
        sessionId: "route",
        prompt: "owned",
        print: true,
        acp: true,
        channels: ["owned"],
        model: "body-model",
        permissionMode: Mode.Plan,
      };
      let result: any;
      await f.middleware.handle({ request: { body } }, async () => {
        result = await f.controller.run(body, { "X-Owned": "route" });
      });
      await tick();
      assert.equal(result, f.manager.getCurrent());
      assert.equal(result.id, "route");
      assert.equal(result.options.model, "body-model");
      assert.equal(result.requestOptions.model, undefined);
      assert.equal(result.permissionModeSubject.value, Mode.Plan);
      const names = f.calls.map((x) => x[0]);
      assert.ok(
        names.indexOf("initializePermissions") < names.indexOf("setCurrent"),
      );
      assert.ok(names.indexOf("setCurrent") < names.indexOf("run"));
      assert.equal(names.filter((n) => n === "setup").length, 1);
      assert.equal(names.filter((n) => n === "start").length, 1);
      return [snapshot(result), f.calls];
    },
  ),
  scenario(
    "source hooks do not block handle and skip trust for ACP; setup runs once across middleware instances",
    async (f) => {
      const wait = deferred();
      f.di.set(f.runtime.modules[28579].PluginRuntimeRefreshService, {
        waitForRefreshSettled: () => wait.promise,
      });
      const body = { sessionId: "pending-hooks", acp: true };
      let next = false;
      await f.middleware.handle({ request: { body } }, async () => {
        next = true;
      });
      const s = f.manager.getCurrent();
      const ready = s.hookContexts.sessionStartReadyPromise;
      assert.equal(next, true);
      assert.ok(ready);
      assert.equal(
        f.calls.some((x) => x[0] === "start"),
        false,
      );
      wait.resolve();
      await ready;
      await tick();
      assert.equal(s.hookContexts.sessionStartReadyPromise, undefined);
      const secondMiddleware: any = Object.assign(
        new f.n.SessionMiddleWare(),
        f.middleware,
      );
      await secondMiddleware.executionSessionStartHook(
        s,
        "resume",
        false,
        true,
      );
      await tick();
      assert.equal(f.calls.filter((x) => x[0] === "setup").length, 1);
      assert.equal(f.calls.filter((x) => x[0] === "start").length, 2);
      return f.calls.filter((x) => ["setup", "start"].includes(x[0]));
    },
    { trust: new Promise(() => {}) },
  ),
  scenario(
    "source interactive hook waits directory trust, while Setup failure is logged and not retried",
    async (f) => {
      const trust = deferred();
      f.middleware.directoryTrustService.isTrustDirectoryPromise =
        trust.promise;
      const s = await f.sessionFactory.create({ id: "trust" });
      await f.middleware.executionSessionStartHook(s, "startup", false, false);
      await tick();
      assert.equal(
        f.calls.some((x) => x[0] === "setup"),
        false,
      );
      trust.resolve();
      await s.hookContexts.sessionStartReadyPromise;
      await tick();
      await f.middleware.executionSessionStartHook(s, "resume", true, false);
      await tick();
      assert.equal(f.calls.filter((x) => x[0] === "setup").length, 1);
      assert.equal(f.calls.filter((x) => x[0] === "start").length, 2);
      assert.ok(
        f.logs.some(
          (x) =>
            x[0] === "warn" &&
            String(x[1]).includes("executeSetupHooks(init) failed"),
        ),
      );
      return f.calls;
    },
    {
      setup: () => {
        throw Error("owned setup failure");
      },
    },
  ),
  scenario(
    "source newer session-start barrier is not cleared by older completion",
    async (f) => {
      const first = deferred(),
        second = deferred();
      let count = 0;
      f.manager.emitSessionStart = async () => {
        await (++count === 1 ? first.promise : second.promise);
      };
      const s = await f.sessionFactory.create();
      await f.middleware.executionSessionStartHook(s, "startup", true, false);
      await tick();
      const old = s.hookContexts.sessionStartReadyPromise;
      await f.middleware.executionSessionStartHook(s, "resume", true, false);
      await tick();
      const current = s.hookContexts.sessionStartReadyPromise;
      assert.notEqual(old, current);
      first.resolve();
      await old;
      await tick();
      assert.equal(s.hookContexts.sessionStartReadyPromise, current);
      second.resolve();
      await current;
      await tick();
      assert.equal(s.hookContexts.sessionStartReadyPromise, undefined);
      return count;
    },
  ),
  scenario(
    "source model override undefined clears stale request model and explicit override wins body model",
    async (f) => {
      const s = await f.sessionFactory.create({
        id: "override",
        requestOptions: { model: "stale", headers: { owned: "kept" } },
        options: { model: "body" },
      });
      f.middleware.applyOverrideModel(s);
      assert.equal(s.requestOptions.model, undefined);
      assert.deepEqual(s.requestOptions.headers, { owned: "kept" });
      f.manager.getOverrideModel = () => "override";
      f.middleware.applyOverrideModel(s);
      assert.equal(s.requestOptions.model, "override");
      return s.requestOptions;
    },
  ),
];
for (const [name, patch, seed, expected, prePlan] of [
  [
    "override Plan does not record pre-plan mode",
    { overrideMode: Mode.Plan },
    { permissionMode: Mode.AcceptEdits },
    Mode.Plan,
    undefined,
  ],
  [
    "explicit Plan remembers existing nondefault mode",
    {},
    { current: Mode.AcceptEdits, permissionMode: Mode.Plan },
    Mode.Plan,
    Mode.AcceptEdits,
  ],
  [
    "explicit Plan honors permissionModeBeforePlan",
    {},
    {
      permissionMode: Mode.Plan,
      permissionModeBeforePlan: Mode.BypassPermissions,
    },
    Mode.Plan,
    Mode.BypassPermissions,
  ],
  [
    "Plan before-mode invalid value normalizes to default",
    {},
    { permissionMode: Mode.Plan, permissionModeBeforePlan: "invalid" },
    Mode.Plan,
    Mode.Default,
  ],
  [
    "existing Plan pre-mode is not overwritten",
    {},
    {
      permissionMode: Mode.Plan,
      meta: { prePlanPermissionMode: Mode.AcceptEdits },
      permissionModeBeforePlan: Mode.BypassPermissions,
    },
    Mode.Plan,
    Mode.AcceptEdits,
  ],
  [
    "unavailable override Auto falls back to default",
    { overrideMode: Mode.Auto, autoAvailable: false },
    {},
    Mode.Default,
    undefined,
  ],
  [
    "unavailable explicit Auto falls back to default",
    { autoAvailable: false },
    { permissionMode: Mode.Auto },
    Mode.Default,
    undefined,
  ],
  [
    "existing nondefault mode wins dangerouslySkipPermissions",
    {},
    { current: Mode.AcceptEdits, dangerouslySkipPermissions: true },
    Mode.AcceptEdits,
    undefined,
  ],
  [
    "default mode may resolve dangerouslySkipPermissions",
    {},
    { dangerouslySkipPermissions: true },
    Mode.BypassPermissions,
    undefined,
  ],
  [
    "user-granted available settings Auto is accepted",
    { settings: { defaultMode: Mode.Auto } },
    {},
    Mode.Auto,
    undefined,
  ],
  [
    "non-user settings cannot grant Auto",
    { settings: { defaultMode: Mode.Auto }, autoGrant: false },
    {},
    Mode.Default,
    undefined,
  ],
  [
    "settings Auto unavailable falls back",
    { settings: { defaultMode: Mode.Auto }, autoAvailable: false },
    {},
    Mode.Default,
    undefined,
  ],
  [
    "invalid explicit mode becomes default without settings fallback",
    { settings: { defaultMode: Mode.AcceptEdits } },
    { permissionMode: "bad" },
    Mode.Default,
    undefined,
  ],
] as const)
  SESSION_INGRESS_CASES.push(
    scenario(
      "source permission precedence: " + name,
      async (f) => {
        const value: any = seed,
          options: any = { ...value };
        delete options.current;
        delete options.meta;
        const s = await f.sessionFactory.create({
          id: "mode",
          options,
          meta: value.meta ? { ...value.meta } : undefined,
        });
        if (value.current) s.permissionModeSubject.next(value.current);
        await f.middleware.updatePermissionMode(s);
        assert.equal(s.permissionModeSubject.value, expected);
        assert.equal(s.meta?.prePlanPermissionMode, prePlan);
        return [s.permissionModeSubject.value, s.meta, f.calls, f.logs];
      },
      patch,
    ),
  );
