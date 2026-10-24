import assert from "node:assert/strict";
import type { createNativeSessionHostRuntime } from "../../src/sessions/native-session-host-runtime.js";
type Factory = typeof createNativeSessionHostRuntime;
function fixture(factory: Factory) {
  const calls: any[] = [],
    handlers = new Map<string, any>();
  const state: any = {
    focused: true,
    fileWatch: undefined,
    media: undefined,
    disconnect: undefined,
    janitor: undefined,
  };
  const api = factory();
  const manager: any = {
    startRuntimeReclaimJanitor: (options: any) => {
      state.janitor = options;
      calls.push(["start"]);
    },
    stopRuntimeReclaimJanitor: () => calls.push(["stop"]),
    reclaimInactiveSessions: async (options: any) =>
      calls.push(["sweep", options]),
    createSession: async (opts: any) => {
      calls.push(["create", opts]);
      return { sessionId: opts.sessionId ?? "new" };
    },
    updateSessionConfig: async (...args: any[]) => {
      calls.push(["config", ...args]);
      return { sessionId: args[0], updated: true };
    },
    listSessions: async () => [],
    getSession: () => undefined,
    getActiveSessions: () => ["active"],
    getHistoryStoreGeneration: () => 0,
    replayStoredSessionHistory: () => ({ replayed: true, complete: true }),
    getSessionRecord: async () => null,
    replayActivePendingInputs() {},
  };
  const createConfig: any = {
    sessionManager: manager,
    claw: {
      cwd: "/claw",
      disabledTools: ["Write"],
      service: { getLatestActiveConversation: () => null },
      inFlightCreates: new Map(),
    },
  };
  const auxiliary: any = {
    sessionManager: manager,
    getFileWatchService: () => state.fileWatch,
    getMediaService: () => state.media,
    getArtifactsService: () => undefined,
    usageCache: {
      getPersisted: (id: string) => ({ id }),
      getLastEvent: () => "last",
    },
    localExperts: {
      getCustomExpertWatchPath: () => "/experts",
      getCustomExpertPluginJsonPath: (id: string) => "/experts/" + id,
    },
  };
  const options: any = {
    sessionManager: manager,
    endpoint: {
      handle: (channel: string, fn: any) => handlers.set(channel, fn),
      push() {},
      onAllClientsDisconnected: (fn: any) => {
        state.disconnect = fn;
      },
    },
    windowFocus: { isFocused: () => state.focused },
    ignoredCwd: "/ignored",
    logger: {
      info: (...args: any[]) => calls.push(["info", ...args]),
      warn: (...args: any[]) => calls.push(["warn", ...args]),
    },
    handlers: { auxiliary, createConfig, load: { sessionManager: manager } },
  };
  const invoke = (channel: string, ...args: any[]) =>
    handlers.get(channel)(...args);
  return {
    api,
    options,
    state,
    manager,
    calls,
    handlers,
    invoke,
    createConfig,
    auxiliary,
  };
}
export const sessionHostRuntimeScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "attachment registers RPCs and focused route plus ignored cwd protect reclaim",
    async (factory) => {
      const f = fixture(factory),
        attachment = f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      assert.equal(f.state.janitor.idleTimeoutMs, 900000);
      assert.equal(f.state.janitor.maxActiveSessions, 6);
      assert.equal(f.state.janitor.sweepIntervalMs, 30000);
      assert.equal(
        f.state.janitor.isSessionIgnored({
          sessionId: "s",
          cwd: " /IGNORED/child/.. ",
        }),
        true,
      );
      assert.equal(
        f.state.janitor.isSessionIgnored({ sessionId: "s", cwd: "/other" }),
        false,
      );
      assert.deepEqual(
        await f.invoke(f.api.SESSION_RUNTIME_ROUTE_STATE_CHANNEL, {
          pathname: "/task",
          taskId: "s",
          ignored: true,
        }),
        { ok: true },
      );
      assert.equal(f.state.janitor.isSessionIgnored({ sessionId: "s" }), true);
      f.state.focused = false;
      assert.equal(f.state.janitor.isSessionIgnored({ sessionId: "s" }), false);
      f.state.focused = true;
      await f.invoke(f.api.SESSION_RUNTIME_ROUTE_STATE_CHANNEL, { taskId: 9 });
      assert.equal(f.state.janitor.isSessionIgnored({ sessionId: "s" }), false);
      assert.deepEqual(
        await f.invoke(
          f.api.WORKBUDDY_SESSION_AUX_RPC_CHANNELS.GET_ACTIVE_SESSIONS,
        ),
        ["active"],
      );
      attachment.stop();
      assert.equal(f.calls.at(-1)[0], "stop");
    },
  ],
  [
    "cached LOAD uses injected scheduler or the attachment default",
    async (factory) => {
      for (const custom of [false, true]) {
        const f = fixture(factory);
        let customCalls = 0;
        if (custom)
          f.options.handlers.load.scheduleRuntimeSweep = () => customCalls++;
        f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
        assert.equal(
          (await f.invoke(f.api.SESSION_RPC_CHANNELS.LOAD, "s")).loaded,
          true,
        );
        assert.equal(customCalls, custom ? 1 : 0);
        assert.equal(
          f.calls.filter((x) => x[0] === "sweep").length,
          custom ? 0 : 1,
        );
      }
    },
  ],
  [
    "disconnect releases current file subscriptions and sweep errors are logged",
    async (factory) => {
      const f = fixture(factory),
        attachment = f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      let released = 0;
      f.state.disconnect();
      f.state.fileWatch = { releaseAllSubscriptions: () => released++ };
      f.state.disconnect();
      assert.equal(released, 1);
      f.manager.reclaimInactiveSessions = async () => {
        throw new Error("owned sweep failure");
      };
      attachment.scheduleRuntimeSweep();
      await Promise.resolve();
      await Promise.resolve();
      assert.ok(
        f.calls.some(
          (x) => x[0] === "warn" && x[2]?.error === "owned sweep failure",
        ),
      );
    },
  ],
  [
    "terminal branch forwards server, token and logger then stops owned proxy",
    async (factory) => {
      const f = fixture(factory),
        calls: any[] = [],
        server = {};
      const api = factory({
        loggerModule: {
          createWorkbuddyScopedLogger: (scope: string) => {
            calls.push(["logger", scope]);
            return { log() {}, warn() {}, error() {} };
          },
        },
        TerminalProxy: class {
          constructor(options: any) {
            calls.push(["options", options]);
          }
          start(...args: any[]) {
            calls.push(["start", ...args]);
          }
          stop() {
            calls.push(["stop"]);
          }
        },
      });
      f.options.endpoint.getHttpServer = () => server;
      f.options.endpoint.getToken = () => "owned-token";
      f.options.resolveDataSocketPath = () => "/owned/socket";
      const attachment = api.attachWorkbuddyAppServerSessionRuntime(f.options);
      assert.deepEqual(
        calls.find((x) => x[0] === "start"),
        ["start", server, "owned-token"],
      );
      const opts = calls.find((x) => x[0] === "options")[1];
      assert.equal(opts.resolveDataSocketPath(), "/owned/socket");
      opts.logger.log("message");
      assert.ok(f.calls.some((x) => x[0] === "info" && x[1] === "message"));
      attachment.stop();
      assert.equal(calls.at(-1)[0], "stop");
    },
  ],
  [
    "create preloads expert environment and registers project before creating",
    async (factory) => {
      const f = fixture(factory);
      const records: any[] = [];
      f.createConfig.expertResolver = {
        resolveExpertLocation: async () => ({
          manifest: { expertType: "team" },
        }),
      };
      f.createConfig.agentTeams = {
        envKey: "TEAM",
        resolveEnv: () => "on",
        recordSessionExpertType: (...args: any[]) => records.push(args),
      };
      f.createConfig.projectResources = {
        registerSession: async (...args: any[]) => {
          f.calls.push(["project", ...args]);
          return { PROJECT: "ready" };
        },
      };
      f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      const opts: any = {
        cwd: "/work",
        config: { expertId: "expert" },
        projectId: "p",
        projectResources: ["owned"],
        env: { ORIGINAL: "yes" },
      };
      const result = await f.invoke(f.api.SESSION_RPC_CHANNELS.CREATE, opts);
      assert.match(result.sessionId, /^[0-9a-f-]{36}$/);
      assert.equal(opts.sessionId, result.sessionId);
      assert.deepEqual(opts.env, {
        ORIGINAL: "yes",
        TEAM: "on",
        PROJECT: "ready",
      });
      assert.deepEqual(records, [[result.sessionId, "team"]]);
      assert.ok(
        f.calls.findIndex((x) => x[0] === "project") <
          f.calls.findIndex((x) => x[0] === "create"),
      );
    },
  ],
  [
    "Claw reuse selects latest backend activity and applies explicit filtered configuration",
    async (factory) => {
      const f = fixture(factory);
      f.manager.listSessions = async () => [
        {
          sessionId: "older",
          cwd: "/CLAW",
          createdAt: 99,
          lastBackendActivityAt: 1,
        },
        {
          sessionId: "newer",
          cwd: "/claw",
          createdAt: 2,
          lastBackendActivityAt: 3,
        },
      ];
      f.manager.getSession = (id: string) => ({ sessionId: id });
      f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      const opts: any = {
        cwd: "/claw",
        tools: "Read, Write",
        mode: "ask",
        config: { mode: "craft" },
      };
      const result = await f.invoke(f.api.SESSION_RPC_CHANNELS.CREATE, opts);
      assert.equal(result.sessionId, "newer");
      assert.equal(opts.tools, "Read");
      assert.deepEqual(f.calls.find((x) => x[0] === "config").slice(1), [
        "newer",
        { mode: "craft", tools: "Read" },
      ]);
      assert.equal(
        f.calls.some((x) => x[0] === "create"),
        false,
      );
    },
  ],
  [
    "Claw concurrent creates join then apply each caller's explicit patch",
    async (factory) => {
      const f = fixture(factory);
      let release!: () => void;
      const gate = new Promise<void>((r) => {
        release = r;
      });
      let creates = 0;
      f.manager.createSession = async () => {
        creates++;
        await gate;
        return { sessionId: "shared" };
      };
      f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      const first = f.invoke(f.api.SESSION_RPC_CHANNELS.CREATE, {
        cwd: "/claw",
      });
      const second = f.invoke(f.api.SESSION_RPC_CHANNELS.CREATE, {
        cwd: "/claw",
        mode: "plan",
      });
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(creates, 1);
      release();
      assert.equal((await first).sessionId, "shared");
      assert.equal((await second).sessionId, "shared");
      assert.equal(f.createConfig.claw.inFlightCreates.size, 0);
      assert.equal(f.calls.find((x) => x[0] === "config")[2].mode, "plan");
    },
  ],
  [
    "update expert type is recorded only through matched-precondition callback",
    async (factory) => {
      const f = fixture(factory),
        records: any[] = [];
      f.createConfig.expertResolver = {
        resolveExpertLocation: async () => ({
          manifest: { expertType: "team" },
        }),
      };
      f.createConfig.agentTeams = {
        recordSessionExpertType: (...args: any[]) => records.push(args),
      };
      f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      await f.invoke(
        f.api.SESSION_RPC_CHANNELS.UPDATE_CONFIG,
        "s",
        { expertId: "expert" },
        "/cwd",
        { retained: true },
      );
      assert.equal(records.length, 0);
      let options = f.calls.filter((x) => x[0] === "config").at(-1)[4];
      assert.equal(options.retained, true);
      options.onPreconditionMatched();
      assert.deepEqual(records, [["s", "team"]]);
      await f.invoke(f.api.SESSION_RPC_CHANNELS.UPDATE_CONFIG, "s", {
        expertId: null,
      });
      options = f.calls.filter((x) => x[0] === "config").at(-1)[4];
      options.onPreconditionMatched();
      assert.deepEqual(records.at(-1), ["s", undefined]);
    },
  ],
  [
    "auxiliary handlers preserve absent-service and validation boundaries",
    async (factory) => {
      const f = fixture(factory);
      f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      const ch = f.api.WORKBUDDY_SESSION_AUX_RPC_CHANNELS;
      assert.deepEqual(await f.invoke(ch.GET_SESSION_ARTIFACTS, "s"), []);
      await assert.rejects(
        f.invoke(ch.FILE_WATCH_SUBSCRIBE, "/owned"),
        /not initialized/,
      );
      assert.deepEqual(await f.invoke(ch.FILE_WATCH_UNSUBSCRIBE, "x"), {
        ok: true,
      });
      assert.deepEqual(
        await f.invoke(ch.LOCAL_EXPERTS_GET_PLUGIN_JSON_PATH, "../bad"),
        { filePath: undefined },
      );
      assert.deepEqual(
        await f.invoke(ch.LOCAL_EXPERTS_GET_PLUGIN_JSON_PATH, "good"),
        { filePath: "/experts/good" },
      );
      assert.equal(
        await f.invoke(f.api.SESSION_RPC_CHANNELS.GET_PERSISTED_USAGE, " "),
        undefined,
      );
      assert.deepEqual(
        await f.invoke(f.api.SESSION_RPC_CHANNELS.GET_PERSISTED_USAGE, "s"),
        { id: "s" },
      );
    },
  ],
  [
    "media registration and watch delegation retain exact original payloads",
    async (factory) => {
      const f = fixture(factory),
        seen: any[] = [];
      f.state.media = {
        registerExplicitMedia: (x: any) => seen.push(x),
        pushMediaForFile: async (...x: any[]) => seen.push(x),
        subscribeDirectoryWatch: (...x: any[]) => {
          seen.push(x);
          return "watch";
        },
        releaseDirectoryWatchSession: (id: string) => seen.push(id),
      };
      f.api.attachWorkbuddyAppServerSessionRuntime(f.options);
      const ch = f.api.WORKBUDDY_SESSION_AUX_RPC_CHANNELS;
      assert.deepEqual(
        await f.invoke(ch.LOCAL_DOCS_REGISTER_MEDIA_ARTIFACT, {
          sessionId: "s",
          filePath: "/owned",
        }),
        { success: true },
      );
      assert.deepEqual(seen[0], {
        sessionId: "s",
        filePath: "/owned",
        sourceType: "present_files",
      });
      assert.deepEqual(seen[1], [
        "s",
        "/owned",
        { sourceTool: "PresentFiles", allowUnknownExtension: true },
      ]);
      assert.deepEqual(
        await f.invoke(ch.DIRECTORY_WATCH_SUBSCRIBE, {
          sessionId: "s",
          dirPath: "/dir",
        }),
        { id: "watch" },
      );
      assert.deepEqual(
        await f.invoke(ch.DIRECTORY_WATCH_RELEASE_SESSION, "s"),
        { ok: true },
      );
      f.state.media.pushMediaForFile = async () => {
        throw Error("owned media failure");
      };
      assert.deepEqual(
        await f.invoke(ch.LOCAL_DOCS_REGISTER_MEDIA_ARTIFACT, {
          sessionId: "s",
          filePath: "/owned",
        }),
        { success: false, error: "owned media failure" },
      );
    },
  ],
];
