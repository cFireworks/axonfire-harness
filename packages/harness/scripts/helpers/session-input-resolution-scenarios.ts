import assert from "node:assert/strict";
type Attach = (controller: any, deps?: any) => any;
function fixture(attach: Attach) {
  const calls: any[] = [];
  const session: any = {
    sessionId: "owned",
    pendingQuestionRequests: new Map(),
    pendingElicitationRequests: new Map(),
    taskState: { runState: "working" },
    isProcessing: true,
    backend: {},
  };
  const pending: string[] = [];
  const controller = attach(
    {},
    {
      console: { log() {}, warn: (...v: any[]) => calls.push(["warn", ...v]) },
      withReadySession: async (id: string, fn: any) => {
        assert.equal(id, "owned");
        return fn(session);
      },
      settleInputRequest: (_s: any, value: any) =>
        calls.push(["settle", value]),
      syncPendingInputStateAfterMutation: () => calls.push(["sync"]),
      getPendingPermissionRequestIdsForToolCall: () => [...pending],
      logDiagnostic: () => {},
      recordSessionEvent: (_s: any, value: any) =>
        calls.push(["record", value]),
      emitOrBufferScopedEvent: (_s: any, value: any) =>
        calls.push(["scoped", value]),
      pushEvent: (...v: any[]) => calls.push(["global", ...v]),
    },
  );
  return { controller, session, pending, calls };
}
export const sessionInputResolutionScenarios: Array<
  [string, (attach: Attach) => Promise<void>]
> = [
  [
    "permission acceptance and rejection settle only acknowledged input",
    async (attach) => {
      for (const method of ["respondToPermission", "rejectPermission"]) {
        for (const accepted of [false, true]) {
          const f = fixture(attach);
          f.session.backend[method] = (...v: any[]) => {
            f.calls.push(["backend", ...v]);
            return accepted;
          };
          assert.equal(
            await f.controller[method]("owned", "permission", "choice"),
            accepted,
          );
          assert.deepEqual(f.calls, [
            ["backend", "permission", "choice"],
            ...(accepted
              ? [
                  ["settle", { kind: "permission", requestId: "permission" }],
                  ["sync"],
                ]
              : []),
          ]);
        }
      }
    },
  ],
  [
    "normalization and queued interruption preserve original distinction",
    async (attach) => {
      const f = fixture(attach);
      for (const [input, expected] of [
        [true, { resolved: true, queued: false }],
        [false, { resolved: false, queued: false }],
        [null, { resolved: false, queued: false }],
        [
          { resolved: 1, queued: true },
          { resolved: false, queued: true },
        ],
      ])
        assert.deepEqual(
          f.controller.normalizeInterruptionResolution(input),
          expected,
        );
      assert.equal(
        await f.controller.resolveInterruption("owned", "tool", "allow"),
        false,
      );
      f.session.backend.resolveInterruption = async () => ({
        resolved: false,
        queued: true,
      });
      assert.equal(
        await f.controller.resolveInterruption("owned", "tool", "allow"),
        false,
      );
      assert.equal(
        await f.controller.answerQuestion("owned", "tool", {}),
        true,
      );
      assert.deepEqual(f.calls, [
        ["settle", { kind: "tool", toolCallId: "tool" }],
        ["sync"],
      ]);
    },
  ],
  [
    "question resolves permissions arriving during semantic resolution",
    async (attach) => {
      const f = fixture(attach);
      f.pending.push("before");
      f.session.backend.resolveInterruption = async (...v: any[]) => {
        f.calls.push(["semantic", ...v]);
        f.pending.push("before", "after");
        f.session.pendingQuestionRequests.set("tool", {});
        return true;
      };
      f.session.backend.respondToPermission = (...v: any[]) => {
        f.calls.push(["permission", ...v]);
        return true;
      };
      f.session.backend.answerQuestion = (...v: any[]) => {
        f.calls.push(["answer", ...v]);
        return true;
      };
      assert.equal(
        await f.controller.answerQuestion("owned", "tool", { q: "yes" }),
        true,
      );
      assert.deepEqual(f.calls, [
        ["semantic", "owned", "tool", "allow", { q: "yes" }],
        ["permission", "before", "allow"],
        ["permission", "after", "allow"],
        ["answer", "tool", { q: "yes" }],
        ["settle", { kind: "tool", toolCallId: "tool" }],
        ["sync"],
      ]);
    },
  ],
  [
    "partial acknowledgment keeps pending state and attempts every permission",
    async (attach) => {
      const f = fixture(attach);
      f.pending.push("a", "b");
      f.session.pendingQuestionRequests.set("tool", {});
      f.session.backend.resolveInterruption = async () => true;
      f.session.backend.respondToPermission = (id: string) => {
        f.calls.push(["permission", id]);
        return id !== "a";
      };
      f.session.backend.answerQuestion = () => {
        f.calls.push(["answer"]);
        return true;
      };
      assert.equal(
        await f.controller.answerQuestion("owned", "tool", {}),
        false,
      );
      assert.deepEqual(f.calls, [
        ["permission", "a"],
        ["permission", "b"],
        ["answer"],
      ]);
    },
  ],
  [
    "question fallback survives absent semantic API and preserves denial gate",
    async (attach) => {
      const f = fixture(attach);
      f.session.pendingQuestionRequests.set("tool", {});
      f.session.backend.answerQuestion = () => true;
      assert.equal(
        await f.controller.answerQuestion("owned", "tool", undefined),
        true,
      );
      f.calls.length = 0;
      f.pending.push("permission");
      assert.equal(
        await f.controller.answerQuestion("owned", "tool", {}),
        false,
      );
      assert.deepEqual(f.calls, []);
    },
  ],
  [
    "cancel question records synthetic skipped history in original order",
    async (attach) => {
      const f = fixture(attach);
      f.session.pendingQuestionRequests.set("tool", {});
      f.session.backend.cancelQuestion = (...v: any[]) => {
        f.calls.push(["cancel", ...v]);
        return true;
      };
      assert.equal(
        await f.controller.cancelQuestion("owned", "tool", "user skipped"),
        true,
      );
      const payload = {
        type: "questionCancelled",
        sessionId: "owned",
        toolCallId: "tool",
        status: "executed",
        questionSkipped: true,
        reason: "user skipped",
        _meta: { "codebuddy.ai": { syntheticOwnerHistory: true } },
      };
      assert.deepEqual(f.calls, [
        ["cancel", "tool", "user skipped"],
        ["settle", { kind: "tool", toolCallId: "tool" }],
        ["record", payload],
        ["scoped", payload],
        ["global", "session:event", payload],
        ["sync"],
      ]);
    },
  ],
  [
    "sandbox response retains void result while settling accepted requests",
    async (attach) => {
      const f = fixture(attach);
      f.session.backend.respondToSandboxIntercept = () => true;
      assert.equal(
        await f.controller.respondToSandboxIntercept(
          "owned",
          "permission",
          "allow",
        ),
        undefined,
      );
      assert.deepEqual(f.calls, [
        ["settle", { kind: "permission", requestId: "permission" }],
        ["sync"],
      ]);
      f.calls.length = 0;
      delete f.session.backend.respondToSandboxIntercept;
      assert.equal(
        await f.controller.respondToSandboxIntercept(
          "owned",
          "permission",
          "deny",
        ),
        undefined,
      );
      assert.equal(f.calls[0]?.[0], "warn");
      assert.equal(f.calls.length, 1);
    },
  ],
  [
    "elicitation acknowledgment and backend rejection propagate without fabricated settlement",
    async (attach) => {
      const f = fixture(attach);
      f.session.pendingElicitationRequests.set("e", {});
      assert.equal(
        await f.controller.respondElicitation("owned", "e", "cancel"),
        false,
      );
      f.session.backend.respondElicitation = (...v: any[]) => {
        f.calls.push(["backend", ...v]);
        return true;
      };
      assert.equal(
        await f.controller.respondElicitation("owned", "e", "accept", {
          answer: 1,
        }),
        true,
      );
      assert.deepEqual(f.calls, [
        ["backend", "e", "accept", { answer: 1 }],
        ["settle", { kind: "elicitation", elicitationId: "e" }],
        ["sync"],
      ]);
      f.calls.length = 0;
      f.session.backend.resolveInterruption = async () => {
        throw new Error("owned failure");
      };
      await assert.rejects(
        f.controller.answerQuestion("owned", "tool", {}),
        /owned failure/,
      );
      assert.deepEqual(f.calls, []);
    },
  ],
];
