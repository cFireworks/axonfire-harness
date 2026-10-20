import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { interruptionControllerFixture } from "../scripts/helpers/interruption-controller-fixtures.js";
import { PermissionMode } from "../src/permissions/permission.js";
import {
  createHarness,
  type HarnessOptions,
} from "../src/runtime/create-harness.js";
import {
  SessionCompactionAbortError,
  SdkPermissionDeniedError,
} from "../src/permissions/native-interruption-service.js";

test("native approval constructor owns isolated maps, weak registration and empty subject", () => {
  const a = interruptionControllerFixture(),
    b = interruptionControllerFixture();
  assert.notEqual(a.owner.pendingInterruptions, b.owner.pendingInterruptions);
  assert.equal(a.owner.pending$.value, undefined);
  assert.ok(a.owner.waitForSubscriptions instanceof WeakSet);
  a.subscription.unsubscribe();
  b.subscription.unsubscribe();
});
test("native allow resumes the captured state once and empties pending routing", async () => {
  const f = interruptionControllerFixture(),
    out = await f.execute();
  assert.deepEqual(
    out.events.filter((e) => e[0] === "approve"),
    [["approve", "Write"]],
  );
  assert.deepEqual(
    out.events.filter((e) => e[0] === "run"),
    [["run", "Default", "STATE", "owned-controller"]],
  );
  assert.equal(out.pending, undefined);
  assert.equal(out.mapped, false);
});
test("native CLI rejection silently aborts and publishes tool-specific skipRun results", async () => {
  const out = await interruptionControllerFixture({
      decision: "reject",
    }).execute(),
    run = out.events.find((e) => e[0] === "run");
  assert.equal(out.aborted, true);
  assert.equal(out.silent, true);
  assert.equal(out.meta.userInitiatedAbort, true);
  assert.equal(run[2][0].providerData.skipRun, true);
  assert.equal(
    out.events.some((e) => e[0] === "emit"),
    true,
  );
});
test("native ACP rejection interrupts root, emits interrupted Stop and skips rejection run", async () => {
  const out = await interruptionControllerFixture({
    decision: "reject",
    acp: true,
  }).execute();
  assert.equal(out.aborted, true);
  assert.equal(
    out.events.some((e) => e[0] === "run"),
    false,
  );
  assert.deepEqual(
    out.events.find((e) => e[0] === "stop"),
    ["stop", { stopReason: "interrupted" }],
  );
  assert.ok(
    out.events.some((e) => e[0] === "combine" && e[1] === "interrupt_result"),
  );
});
test("native SDK input updates shallow-merge and hooks keep source payload and timeout", async () => {
  const out = await interruptionControllerFixture({
    sdk: true,
    hookFailure: true,
  }).execute();
  assert.equal(JSON.parse(out.input).ownedAnswer, 42);
  const hooks = out.events.filter((e) => e[0] === "hook");
  assert.equal(hooks.length, 2);
  assert.equal(hooks[0][4], 2000);
  assert.equal(hooks[0][2].cwd, "/owned/workdir");
  assert.equal(out.events.filter((e) => e[0] === "sdk").length, 1);
});
test("native missing SDK callId deliberately approves without callback, matching source", async () => {
  const out = await interruptionControllerFixture({
    sdk: true,
    missingId: true,
  }).execute();
  assert.equal(
    out.events.some((e) => e[0] === "sdk" || e[0] === "hook"),
    false,
  );
  assert.ok(out.events.some((e) => e[0] === "approve"));
});
test("native SDK interrupt denial appends exact denial entry and flushes cancellation trace", async () => {
  const out = await interruptionControllerFixture({
    sdk: true,
    decision: "reject",
    interrupt: true,
  }).execute();
  assert.equal(out.denials?.[0]?.tool_use_id, "owned-call");
  assert.equal(
    out.events.find((e) => e[0] === "trace")[2].reason,
    "permission_denied",
  );
  assert.equal(
    out.events.some((e) => e[0] === "run"),
    false,
  );
});
test("native compaction abort removes queue and preserves source state continuation quirk", async () => {
  const out = await interruptionControllerFixture({
    decision: "compact",
  }).execute();
  assert.equal(out.aborted, true);
  assert.equal(
    out.events.some((e) => e[0] === "trace"),
    false,
  );
  assert.deepEqual(
    out.events.filter((e) => e[0] === "run"),
    [["run", "Default", "STATE", "owned-controller"]],
  );
  assert.deepEqual(out.queue, []);
});
test("native dangerous Bash bypass still asks, but inherited AcceptEdits bypasses edit UI", async () => {
  const danger = await interruptionControllerFixture({
    mode: PermissionMode.BypassPermissions,
    tool: "Bash",
    input: { command: "rm -rf /owned/fixture" },
  }).execute();
  assert.ok(danger.events.some((e) => e[0] === "pending"));
  const edit = await interruptionControllerFixture({
    mode: PermissionMode.AcceptEdits,
    child: true,
  }).execute();
  assert.equal(
    edit.events.some((e) => e[0] === "pending"),
    false,
  );
});
test("native Auto ceiling suppresses background fast approval", async () => {
  const out = await interruptionControllerFixture({
    background: true,
    ceiling: PermissionMode.Auto,
  }).execute();
  assert.ok(out.events.some((e) => e[0] === "pending"));
  const background = await interruptionControllerFixture({
    background: true,
  }).execute();
  assert.equal(background.events.filter((e) => e[0] === "approve").length, 2);
});
test("native workflow preload retains provenance text before pending UI", async () => {
  const out = await interruptionControllerFixture({
    tool: "DeferExecuteTool",
    input: { toolName: "Workflow", params: { name: "owned" } },
  }).execute();
  assert.equal(out.providerData.workflowSourceText, "owned source");
});
test("native always-allow stores safe signatures and applies session rules, not high-risk Bash", async () => {
  const safe = interruptionControllerFixture({ decision: "always" });
  await safe.execute();
  assert.equal(
    safe.approvalServices.always.isApproved(safe.session, safe.item),
    true,
  );
  const danger = interruptionControllerFixture({
    decision: "always",
    tool: "Bash",
    input: { command: "rm -rf /owned/fixture" },
  });
  await danger.execute();
  assert.equal(
    danger.approvalServices.always.isApproved(danger.session, danger.item),
    false,
  );
  assert.equal(
    danger.events.some((e) => e[0] === "rules"),
    false,
  );
});
test("native sandbox global head promotes orphan queue when the first main session empties", () => {
  const f = interruptionControllerFixture();
  f.subscription.unsubscribe();
  const resolutions: any[] = [];
  const sandbox = (id: string) => ({
    rawItem: {
      type: "function_call",
      name: "Bash",
      callId: id,
      providerData: {
        _enqueuedViaQueue: true,
        _sandboxResolve: (value: any) => resolutions.push([id, value]),
      },
    },
  });
  const first = sandbox("first"),
    second = sandbox("second");
  f.owner.enqueueSandboxApproval(f.session, first);
  f.owner.enqueueSandboxApproval(f.parent, second);
  assert.equal(f.owner.pending$.value.item, first);
  f.owner.approve(first);
  assert.equal(f.owner.pending$.value.item, second);
  f.owner.reject(second);
  assert.equal(f.owner.pending$.value, undefined);
  assert.deepEqual(resolutions, [
    ["first", "allow_once"],
    ["second", false],
  ]);
});
test("native errors preserve custom names, default reason and SDK interrupt", () => {
  const compaction = new SessionCompactionAbortError(),
    denial = new SdkPermissionDeniedError();
  assert.equal(compaction.name, "SessionCompactionAbortError");
  assert.equal(compaction.message, "Session aborted by context compaction");
  assert.equal(Object.keys(compaction).includes("name"), false);
  assert.equal(denial.interrupt, false);
});

setTraceProcessors([]);
async function ownedSdk(
  t: any,
  allow = true,
  deferred = false,
  extra: Partial<HarnessOptions> = {},
) {
  const root = await mkdtemp(join(tmpdir(), "harness-native-controller-")),
    target = join(root, "owned.txt");
  let turns = 0;
  const approvals: string[] = [];
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse() {
      const output: any[] =
        ++turns === 1
          ? [
              {
                type: "function_call",
                id: "owned-write",
                callId: "owned-write",
                name: deferred ? "DeferExecuteTool" : "Write",
                arguments: JSON.stringify(
                  deferred
                    ? {
                        toolName: "Write",
                        params: { file_path: target, content: "owned" },
                      }
                    : { file_path: target, content: "owned" },
                ),
                status: "completed",
              },
            ]
          : [
              {
                type: "message",
                role: "assistant",
                id: "owned-answer",
                status: "completed",
                content: [{ type: "output_text", text: "settled" }],
              },
            ];
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: `owned-${turns}`,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
  const h = await createHarness({
    workDir: root,
    stateDir: join(root, ".owned-state"),
    modelProvider: { getModel: () => model },
    recordReplayEnv: {},
    nativePermissions: true,
    nativeApprovals: true,
    approveTool: (name) => {
      approvals.push(name);
      return allow;
    },
    ...extra,
  });
  t.after(async () => {
    await h.close();
    await rm(root, { recursive: true, force: true });
  });
  if (deferred) await h.tools.ensureBuiltinDeferIndexed("Write");
  return {
    h,
    root,
    target,
    approvals,
    session: await h.openSession(),
    get turns() {
      return turns;
    },
  };
}
test(
  "real SDK native controller approves, resumes, writes and persists once",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdk(t);
    assert.ok(f.h.interruptions.nativeController);
    assert.equal(await f.h.prompt(f.session, "owned fixture"), "settled");
    assert.equal(await readFile(f.target, "utf8"), "owned");
    assert.deepEqual(f.approvals, ["Write"]);
    assert.equal(f.turns, 2);
    assert.equal(f.h.interruptions.pending$.value, undefined);
  },
);
test(
  "real SDK native controller rejects before side effects, publishes skipRun history",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdk(t, false);
    assert.equal(await f.h.prompt(f.session, "owned fixture"), "");
    await assert.rejects(access(f.target));
    assert.equal(f.turns, 1);
    assert.equal(f.session.meta.userInitiatedAbort, true);
    assert.ok(
      f.session.history.some(
        (item: any) =>
          item.type === "function_call_result" && item.callId === "owned-write",
      ),
    );
  },
);
test(
  "real SDK native controller retains DeferExecute approval routing",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdk(t, true, true);
    assert.equal(await f.h.prompt(f.session, "owned deferred"), "settled");
    assert.equal(await readFile(f.target, "utf8"), "owned");
    assert.deepEqual(f.approvals, ["Write"]);
  },
);
test(
  "real SDK native permission client updates input, authorizes the host guard and skips UI",
  { timeout: 15000 },
  async (t) => {
    const requests: any[] = [];
    const f = await ownedSdk(t, false, false, {
      approvalController: {
        sdkPermissionClient: {
          async requestPermission(...args: any[]) {
            requests.push(args);
            return {
              allowed: true,
              updatedInput: { content: "SDK owned rewrite" },
            };
          },
        },
      },
    });
    f.session.options.inputFormat = "stream-json";
    assert.equal(await f.h.prompt(f.session, "owned SDK protocol"), "settled");
    assert.equal(await readFile(f.target, "utf8"), "SDK owned rewrite");
    assert.equal(requests.length, 1);
    assert.deepEqual(f.approvals, []);
  },
);
test(
  "real SDK native permission client interrupt-denial records exact denial without executing",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdk(t, false, false, {
      approvalController: {
        sdkPermissionClient: {
          async requestPermission() {
            return {
              allowed: false,
              reason: "owned client denial",
              interrupt: true,
            };
          },
        },
      },
    });
    f.session.options.inputFormat = "stream-json";
    assert.equal(await f.h.prompt(f.session, "owned SDK denial"), "");
    await assert.rejects(access(f.target));
    assert.equal(f.turns, 1);
    assert.deepEqual(f.approvals, []);
    assert.equal(f.session.permissionDenials?.[0]?.tool_name, "Write");
  },
);
test(
  "real SDK native approval host retains human cancellation before filesystem access",
  { timeout: 15000 },
  async (t) => {
    const abort = new AbortController();
    const f = await ownedSdk(t, true, false, {
      approveTool: () => {
        abort.abort();
        return false;
      },
    });
    await assert.rejects(
      f.h.prompt(f.session, "owned cancellation", { signal: abort.signal }),
      { name: "AbortError" },
    );
    await assert.rejects(access(f.target));
    assert.equal(f.turns, 1);
  },
);
