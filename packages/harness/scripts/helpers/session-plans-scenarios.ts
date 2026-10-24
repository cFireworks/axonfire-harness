import assert from "node:assert/strict";
import type { attachNativeSessionPlans } from "../../src/sessions/native-session-plans.js";
type Factory = typeof attachNativeSessionPlans;
function fixture(attach: Factory) {
  return {
    c: attach({}),
    s: {
      sessionId: "owned",
      toolResults: new Map(),
      planSnapshot: undefined,
    } as any,
  };
}
export const sessionPlansScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "non-plan passthrough and independent prepared/committed snapshots",
    async (attach) => {
      const { c, s } = fixture(attach);
      const other = { update: { sessionUpdate: "usage_update" } };
      assert.equal(c.preparePlanNotification(s, other).payload, other);
      const raw = {
        sessionId: "foreign",
        update: {
          sessionUpdate: "plan",
          entries: [{ content: "do", _meta: { custom: { x: 1 } } }],
        },
      };
      const p = c.preparePlanNotification(s, raw);
      assert.equal(s.planSnapshot, undefined);
      assert.equal(p.payload.sessionId, "owned");
      assert.equal(raw.sessionId, "foreign");
      assert.equal(p.snapshot.revision, 1);
      c.commitPreparedPlanSnapshot(s, p);
      p.payload.update.entries[0].content = "change";
      p.snapshot.update.entries[0].content = "different";
      assert.equal(s.planSnapshot.update.entries[0].content, "do");
      assert.equal(raw.update.entries[0]!.content, "do");
      assert.equal(
        p.payload._meta["codebuddy.ai"].planOwner,
        "session-manager",
      );
      assert.equal(
        p.payload.update._meta["codebuddy.ai"].isFullPlanSnapshot,
        true,
      );
    },
  ],
  [
    "revision precedence is monotonic and nonfinite outer metadata masks inner revision",
    async (attach) => {
      const { c, s } = fixture(attach);
      s.planSnapshot = { revision: 4 };
      const make = (outer: any, inner: any) =>
        c.preparePlanNotification(s, {
          _meta: { "codebuddy.ai": outer },
          update: {
            sessionUpdate: "plan",
            entries: [],
            _meta: { "codebuddy.ai": inner },
          },
        }).snapshot.revision;
      assert.equal(make({ revision: 2 }, { planRevision: 20 }), 5);
      assert.equal(make({ planRevision: 10, revision: 30 }, {}), 10);
      assert.equal(make({ planRevision: NaN }, { planRevision: 20 }), 5);
      assert.equal(make({ planRevision: "bad" }, { planRevision: 20 }), 20);
      assert.equal(make({ planRevision: 7.5 }, {}), 7.5);
    },
  ],
  [
    "entry metadata precedence preserves extra metadata and normalizes primitive rows",
    async (attach) => {
      const { c } = fixture(attach);
      const input = {
        content: " content ",
        status: "deleted",
        priority: "high",
        createdAt: 0,
        updatedAt: Infinity,
        id: "record",
        blockedBy: ["fallback"],
        _meta: {
          id: "outer",
          dependencies: ["outer-dep"],
          "codebuddy.ai": {
            id: " inner ",
            order: -2,
            activeForm: " acting ",
            dependencies: [" a ", "a", 4, ""],
            extra: true,
          },
        },
      };
      const [row, primitive, empty] = c.normalizePlanEntries([input, 7, null]);
      assert.equal(row.content, "content");
      assert.equal(row.status, "cancelled");
      assert.equal(row.priority, "high");
      assert.equal(row.createdAt, 0);
      assert.equal(row.updatedAt, undefined);
      assert.equal(row._meta.id, "inner");
      assert.deepEqual(row._meta.dependencies, ["a", "a"]);
      assert.equal(row._meta["codebuddy.ai"].order, -2);
      assert.equal(row._meta["codebuddy.ai"].activeForm, "acting");
      assert.equal(row._meta["codebuddy.ai"].extra, true);
      assert.equal(primitive.content, "7");
      assert.equal(primitive._meta.id, "task-1");
      assert.equal(empty.content, "");
      assert.equal(input._meta.id, "outer");
      assert.deepEqual(c.normalizePlanEntries({}), []);
    },
  ],
  [
    "case-sensitive status and priority rules retain unrecognized dependency metadata",
    async (attach) => {
      const { c } = fixture(attach);
      const rows = c.normalizePlanEntries([
        {
          subject: "one",
          status: "Completed",
          priority: "HIGH",
          _meta: { dependencies: 42, "codebuddy.ai": { dependencies: 42 } },
        },
        {
          title: "two",
          status: "in_progress",
          dependencies: [1, "  "],
          blockedBy: [" x "],
        },
      ]);
      assert.equal(rows[0].status, "pending");
      assert.equal(rows[0].priority, undefined);
      assert.equal(rows[0]._meta.dependencies, 42);
      assert.deepEqual(rows[1]._meta.dependencies, ["x"]);
      assert.equal(rows[1].content, "two");
    },
  ],
  [
    "task-tool name source precedence is exact and falls back to captured tool state",
    async (attach) => {
      const { c, s } = fixture(attach);
      s.toolResults.set("t", { toolName: "TaskList" });
      const update: any = {
        sessionUpdate: "tool_call_update",
        status: "completed",
        toolCallId: "t",
        rawOutput: { tasks: [{ subject: "one" }] },
      };
      assert.ok(c.createPlanNotificationFromTaskToolResult(s, { update }));
      update._meta = {
        "codebuddy.ai/toolName": "",
        "codebuddy.ai": { toolName: "TaskList" },
      };
      assert.equal(
        c.createPlanNotificationFromTaskToolResult(s, { update }),
        undefined,
      );
      update._meta = { "codebuddy.ai": { toolName: " TaskList " } };
      assert.equal(
        c.createPlanNotificationFromTaskToolResult(s, { update }),
        undefined,
      );
      update._meta = { "codebuddy.ai": { toolName: "TaskUpdate" } };
      const p = c.createPlanNotificationFromTaskToolResult(s, { update });
      assert.equal(p.payload._meta["codebuddy.ai"].source, "TaskUpdate");
      assert.equal(p.payload._meta["codebuddy.ai"].derivedFromToolCallId, "t");
    },
  ],
  [
    "raw task result source precedence and todos over tasks including empty arrays",
    async (attach) => {
      const { c, s } = fixture(attach);
      const update: any = {
        sessionUpdate: "tool_call_update",
        status: "completed",
        _meta: {
          "codebuddy.ai/toolName": "TaskCreate",
          "codebuddy.ai/rawResponse": { tasks: [{ subject: "meta" }] },
        },
        rawOutput: {
          rawResponse: { todos: [], tasks: [{ subject: "ignored" }] },
        },
      };
      assert.deepEqual(
        c.createPlanNotificationFromTaskToolResult(s, { update }).payload.update
          .entries,
        [],
      );
      update.rawOutput = { task: { subject: "single" } };
      assert.equal(
        c.createPlanNotificationFromTaskToolResult(s, { update }),
        undefined,
      );
      delete update.rawOutput;
      assert.equal(
        c.createPlanNotificationFromTaskToolResult(s, { update }).payload.update
          .entries[0].content,
        "meta",
      );
      delete update._meta["codebuddy.ai/rawResponse"];
      update._meta["codebuddy.ai"] = {
        rawResponse: { tasks: [{ subject: "nested" }] },
      };
      assert.equal(
        c.createPlanNotificationFromTaskToolResult(s, { update }).payload.update
          .entries[0].content,
        "nested",
      );
    },
  ],
  [
    "only completed supported task updates derive plans without committing automatically",
    async (attach) => {
      const { c, s } = fixture(attach);
      for (const name of ["TaskCreate", "TaskUpdate", "TaskList"]) {
        const update = {
          sessionUpdate: "tool_call_update",
          status: "completed",
          _meta: { "codebuddy.ai/toolName": name },
          rawOutput: { tasks: [{ subject: name }] },
        };
        const p = c.createPlanNotificationFromTaskToolResult(s, { update });
        assert.equal(p.snapshot.revision, 1);
        assert.equal(s.planSnapshot, undefined);
        assert.equal(
          c.createPlanNotificationFromTaskToolResult(s, {
            update: { ...update, status: "failed" },
          }),
          undefined,
        );
        assert.equal(
          c.createPlanNotificationFromTaskToolResult(s, {
            update: { ...update, sessionUpdate: "tool_call" },
          }),
          undefined,
        );
      }
      assert.equal(
        c.createPlanNotificationFromTaskToolResult(s, {
          update: {
            sessionUpdate: "tool_call_update",
            status: "completed",
            _meta: { "codebuddy.ai/toolName": "Write" },
            rawOutput: { tasks: [] },
          },
        }),
        undefined,
      );
    },
  ],
  [
    "snapshot cloning failures propagate without silently dropping invalid metadata",
    async (attach) => {
      const { c, s } = fixture(attach);
      assert.throws(
        () =>
          c.preparePlanNotification(s, {
            update: {
              sessionUpdate: "plan",
              entries: [],
              _meta: { invalid: () => {} },
            },
          }),
        /clone|cloned/i,
      );
      assert.equal(s.planSnapshot, undefined);
    },
  ],
];
