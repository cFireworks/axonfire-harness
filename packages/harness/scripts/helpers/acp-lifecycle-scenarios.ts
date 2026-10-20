import assert from "node:assert/strict";
import { Subject, BehaviorSubject } from "rxjs";
import { createNativeAcpLifecycle } from "../../src/protocol/native-acp-lifecycle.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import { protocolSnapshot } from "./acp-protocol-scenarios.js";
import { settle } from "./acp-protocol-fixture.js";
type Factory = typeof createNativeAcpLifecycle;
function fixture(factory: Factory, patch: any = {}) {
  const calls: any[] = [],
    logs: any[] = [],
    queue: any = { runtime: { paused: false } },
    logger = Object.fromEntries(
      ["info", "warn", "debug", "error"].map((key) => [
        key,
        (...args: any[]) => logs.push([key, ...args]),
      ]),
    ),
    rich = {
      getQueue: (id: string) => {
        calls.push(["queue", id]);
        return queue;
      },
      pause: (...args: any[]) => calls.push(["pause", ...args]),
      resume: (...args: any[]) => calls.push(["resume", ...args]),
    };
  class Clock extends Date {
    static override now() {
      return 1700000000000;
    }
  }
  const n = factory({
    Date: Clock,
    modules: {
      92537: { Subject },
      69466: { AgentNames: { COMPACT: "compact" } },
      24618: { PermissionMode },
      80699: {
        ContainerUtil: {
          get() {
            if (patch.missingRich) throw Error("missing owned rich queue");
            return rich;
          },
        },
      },
      74272: { RichMessageQueueManager: Symbol("rich") },
      47005: { BODY_MIDDLEWARE_PRIORITY: 200 },
      93039: {
        UrlUtils: {
          openUrl: async (url: string) => {
            calls.push(["open", url]);
            if (patch.openError) throw Error("owned URI error");
            return patch.openResult ?? true;
          },
        },
      },
    },
  });
  const session: any = {
    id: "owned",
    permissionModeSubject: new BehaviorSubject(
      patch.mode ?? PermissionMode.Plan,
    ),
    meta: { ...patch.meta },
    queue: [{ owned: true }],
    progressSubject: new BehaviorSubject("busy"),
    resultSubject: new BehaviorSubject(patch.result),
    isCompressing: patch.isCompressing ?? false,
  };
  const dependencies: any = {
    logger,
    interruptionService: {
      cancelAllForSession: (...args: any[]) => {
        calls.push(["cancel", ...args]);
        if (patch.cancelError) throw Error("owned cancel error");
      },
    },
    taskStorage: {
      list: async (id: string) => {
        calls.push(["list", id]);
        if (patch.listError) throw Error("owned list error");
        return [
          { id: "running", status: "in_progress", metadata: { owned: true } },
          { id: "done", status: "completed" },
        ];
      },
      update: async (...args: any[]) => {
        calls.push(["update", ...args]);
        if (patch.updateError) throw Error("owned update error");
      },
    },
    acpBroadcastService: {
      broadcastToolCallFailedForSession: async (...args: any[]) => {
        calls.push(["tools", ...args]);
        if (patch.broadcastError) throw Error("owned broadcast error");
      },
      broadcastCompactCancelled: async (...args: any[]) => {
        calls.push(["compact", ...args]);
      },
    },
  };
  return { n, session, dependencies, calls, logs, queue, logger };
}
type Case = { name: string; run(factory: Factory): Promise<any> };
const scenario = (
  name: string,
  run: (f: ReturnType<typeof fixture>) => Promise<any>,
  patch: any = {},
): Case => ({
  name,
  async run(factory) {
    const f = fixture(factory, patch);
    return protocolSnapshot(await run(f));
  },
});
export const ACP_LIFECYCLE_CASES: Case[] = [
  scenario(
    "source capabilities deduplicate and serialize exact original names in insertion order",
    async (f) => {
      const c = new f.n.capability.HostCapabilityProvider();
      assert.equal(c.toEnvValue(), undefined);
      c.markWeixinpayInterception();
      c.markElicitationForm();
      c.markWeixinpayInterception();
      assert.equal(c.toEnvValue(), "weixinpay.interception,elicitation.form");
      return [
        f.n.capability.HOST_CAPABILITIES_ENV,
        f.n.capability.HOST_CAPABILITY,
        c.toEnvValue(),
        c.has("elicitation.form"),
        c.has("elicitationForm"),
      ];
    },
  ),
  scenario(
    "full source outcome helpers preserve all priorities and structured error parsing",
    async (f) => {
      const m = f.n.getModule(7357),
        values = [];
      for (const stop of [
        "cancelled",
        "refusal",
        "end_turn",
        "max_turn_requests",
        "other",
      ])
        for (const error of [
          undefined,
          "Permission denied for tool Write",
          "permission denied for tool Write",
          "bad JSON",
          ...[
            "network",
            "quota",
            "model_service",
            "auth",
            "custom_model_auth",
            "internal",
            "content_filter",
            "other",
          ].map((category) => JSON.stringify({ data: { category } })),
          JSON.stringify({ error: { data: { category: "auth" } } }),
        ])
          for (const counts of [
            {
              modelErrorCount: 0,
              modelSuccessAfterErrorCount: 0,
              toolErrorCount: 0,
            },
            {
              modelErrorCount: 2,
              modelSuccessAfterErrorCount: 1,
              toolErrorCount: 1,
            },
            {
              modelErrorCount: 1,
              modelSuccessAfterErrorCount: 1,
              toolErrorCount: 0,
            },
          ])
            values.push(m.resolveTaskOutcome(stop, error, counts));
      assert.equal(values[3], "PERMISSION_DENIED");
      return [
        values,
        m.extractCategoryFromErrorMessage(
          '{"error":{"data":{"category":"quota"}}}',
        ),
      ];
    },
  ),
  scenario(
    "full run-state/interface modules retain exports, enums, unknown-status and phase labels",
    async (f) => {
      const m = f.n.getModule(71389),
        i = f.n.getModule(99006);
      return [
        Object.keys(m).sort(),
        Object.keys(i).sort(),
        m.SessionRunStatus,
        m.SessionRunEventType,
        [...Object.values(m.SessionRunStatus), "unknown"].map((status) => [
          m.deriveSessionRunLifecycle(status),
          m.isSessionRunStatusBusy(status),
          m.isSessionRunStatusIdle(status),
          m.isSessionRunStatusBusyForQueue(status),
        ]),
        [
          i.SESSION_MIDDLEWARE_PRIORITY,
          i.AgentPhaseUtils.getLabel({
            phase: "tool_executing",
            toolName: "Write",
          }),
          i.AgentPhaseUtils.getLabel({
            phase: "model_streaming",
            streamingToolName: "file",
          }),
        ],
        String(i.SessionManager),
        String(f.n.getModule(95449).ReferenceService),
      ];
    },
  ),
  scenario(
    "source cancel restores saved plan mode, marks only in-progress todos and snapshots queue shallowly",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "cancelled", f.dependencies);
      await settle();
      assert.equal(
        f.session.permissionModeSubject.value,
        PermissionMode.AcceptEdits,
      );
      assert.equal(f.session.meta.prePlanPermissionMode, undefined);
      assert.notEqual(f.session.lastCancelledQueue, f.session.queue);
      assert.equal(f.session.lastCancelledQueue[0], f.session.queue[0]);
      assert.equal(f.calls.filter((x) => x[0] === "update").length, 1);
      return [
        f.calls,
        f.session.permissionModeSubject.value,
        f.session.lastCancelledQueue,
        f.session.progressSubject.value,
      ];
    },
    { meta: { prePlanPermissionMode: PermissionMode.AcceptEdits } },
  ),
  scenario(
    "source cancel restores default without saved plan mode and leaves queue present",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "owned reason", f.dependencies);
      await settle();
      assert.equal(
        f.session.permissionModeSubject.value,
        PermissionMode.Default,
      );
      assert.equal(f.session.queue.length, 1);
      return [f.calls, f.session.meta];
    },
  ),
  scenario(
    "source cancel clears stale prePlan mode outside plan without changing current mode",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "cancelled", f.dependencies);
      await settle();
      assert.equal(
        f.session.permissionModeSubject.value,
        PermissionMode.AcceptEdits,
      );
      assert.equal(f.session.meta.prePlanPermissionMode, undefined);
      return f.calls;
    },
    {
      mode: PermissionMode.AcceptEdits,
      meta: { prePlanPermissionMode: PermissionMode.Default },
    },
  ),
  scenario(
    "source cancel broadcasts compact cancellation and resets compression",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "cancelled", f.dependencies);
      await settle();
      assert.equal(f.session.isCompressing, false);
      assert.ok(f.calls.some((x) => x[0] === "compact"));
      return f.calls;
    },
    { isCompressing: true },
  ),
  scenario(
    "source cancel also detects compact by last Agent even without isCompressing",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "cancelled", f.dependencies);
      await settle();
      assert.ok(f.calls.some((x) => x[0] === "compact"));
      return f.calls;
    },
    { result: { lastAgent: { name: "compact" } } },
  ),
  scenario(
    "source cancel contains synchronous interruption and asynchronous list/broadcast failures",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "cancelled", f.dependencies);
      await settle();
      assert.equal(
        f.calls.some((x) => x[0] === "update"),
        false,
      );
      assert.equal(f.session.progressSubject.value, undefined);
      return [f.calls, f.logs];
    },
    { cancelError: true, listError: true, broadcastError: true },
  ),
  scenario(
    "source cancel task updates use allSettled and log the original attempted count",
    async (f) => {
      f.n.cancelSessionRuntimeState(f.session, "cancelled", f.dependencies);
      await settle();
      assert.ok(f.logs.some((x) => String(x[1]).includes("marked 1")));
      return [f.calls, f.logs];
    },
    { updateError: true },
  ),
  scenario(
    "source team cancellation pause/resume honors other pause reasons and per-session WeakSet",
    async (f) => {
      const a = { id: "a" },
        b = { id: "b" },
        out = [];
      for (const runtime of [
        { paused: false },
        { paused: true, pauseReason: "cancel" },
        { paused: true, pauseReason: "user" },
      ]) {
        f.queue.runtime = runtime;
        f.n.team.pauseTeamLeadFollowUpDispatch(a);
        out.push(f.n.team.isLeadInboxPaused(a));
        assert.equal(f.n.team.isLeadInboxPaused(b), false);
        f.n.team.resumeTeamLeadFollowUpDispatch(a);
        out.push(f.n.team.isLeadInboxPaused(a));
      }
      return [out, f.calls];
    },
  ),
  scenario(
    "source team pause still records WeakSet state when rich queue DI is unavailable",
    async (f) => {
      const s = { id: "owned" };
      f.n.team.pauseTeamLeadFollowUpDispatch(s);
      assert.equal(f.n.team.isLeadInboxPaused(s), true);
      f.n.team.resumeTeamLeadFollowUpDispatch(s);
      assert.equal(f.n.team.isLeadInboxPaused(s), false);
      return f.calls;
    },
    { missingRich: true },
  ),
  scenario(
    "source external URI publishes before delegating actual open operation",
    async (f) => {
      const opener: any = new f.n.CliExternalUriOpener();
      opener.logger = f.logger;
      opener.urlSubject.subscribe((url: string) =>
        f.calls.push(["notification", url]),
      );
      assert.equal(await opener.open("https://owned.invalid/auth"), true);
      assert.deepEqual(
        f.calls.map((x) => x[0]),
        ["notification", "open"],
      );
      opener.urlSubject.complete();
      return [f.calls, f.logs];
    },
  ),
  scenario(
    "source external URI failure returns false after notification and error log",
    async (f) => {
      const opener: any = new f.n.CliExternalUriOpener();
      opener.logger = f.logger;
      opener.urlSubject.subscribe((url: string) =>
        f.calls.push(["notification", url]),
      );
      assert.equal(await opener.open("owned:test"), false);
      opener.urlSubject.complete();
      return [f.calls, f.logs];
    },
    { openError: true },
  ),
];
