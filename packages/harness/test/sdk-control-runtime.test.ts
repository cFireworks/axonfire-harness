import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createSdkControlHost } from "../src/sdk/sdk-control-host.js";
import {
  isControlSignalMessage,
  HOOK_EVENTS,
} from "../src/sdk/native-sdk-control.js";
import {
  sdkControlFixture,
  sdkClientCase,
} from "../scripts/helpers/sdk-control-fixtures.js";
import {
  createHarness,
  type HarnessOptions,
} from "../src/runtime/create-harness.js";

test("native control guards accept only the three control signal kinds", () => {
  for (const x of [
    null,
    undefined,
    1,
    "control_request",
    {},
    [],
    { type: "user" },
    { type: "control_notification" },
  ])
    assert.equal(isControlSignalMessage(x), false);
  for (const type of [
    "control_request",
    "control_response",
    "control_cancel_request",
  ])
    assert.equal(isControlSignalMessage({ type }), true);
  assert.equal(HOOK_EVENTS.includes("PermissionRequest"), true);
});
test("native permission request retains exact truthy options and default has no timeout", async () => {
  const f = sdkControlFixture(),
    pending = f.permission.requestPermission(
      "Write",
      { owned: true },
      "owned-call",
    );
  const id = f.messages()[0].request_id;
  assert.equal(f.timers.size, 0);
  assert.match(id, /^perm_17_1$/);
  await f.response(id, { allowed: true });
  assert.equal((await pending).allowed, true);
});
for (const kind of ["permission", "hook", "mcp", "elicitation"] as const)
  test(`native ${kind} response errors clear pending request`, async () => {
    const out = await sdkClientCase({ kind, finish: "error" });
    assert.equal(out.result.error, "owned failure");
    assert.equal(
      Object.values(out.pending).every((n) => n === 0),
      true,
    );
  });
test("native permission/hook timeout paths reject with source messages and remove pending state", async () => {
  assert.match(
    (
      await sdkClientCase({
        kind: "permission",
        finish: "timeout",
        options: { timeout: 8 },
      })
    ).result.error,
    /Permission request timeout/,
  );
  assert.match(
    (await sdkClientCase({ kind: "hook", finish: "timeout" })).result.error,
    /Hook callback timeout/,
  );
});
test("native MCP response requires truthy mcp_response", async () => {
  assert.match(
    (await sdkClientCase({ kind: "mcp", finish: "success", missing: true }))
      .result.error,
    /missing mcp_response/,
  );
});
test("native MCP and elicitation abort before send do not write or retain requests", async () => {
  const f = sdkControlFixture(),
    a = new AbortController();
  a.abort();
  await assert.rejects(f.mcp.sendMcpMessage("owned", {}, a.signal), /aborted/);
  await assert.rejects(
    f.elicitation.createElicitation({}, { signal: a.signal }),
    /aborted/,
  );
  assert.deepEqual(f.messages(), []);
});
test("native hook aggregate preserves deny priority but retains later allow input", () => {
  const f = sdkControlFixture(),
    out = f.hooks.aggregateResults(
      [
        {
          status: "fulfilled",
          value: {
            hookSpecificOutput: {
              permissionDecision: "deny",
              permissionDecisionReason: "no",
            },
          },
        },
        {
          status: "fulfilled",
          value: {
            hookSpecificOutput: {
              permissionDecision: "allow",
              updatedInput: { owned: 1 },
            },
          },
        },
      ],
      {
        shouldContinue: true,
        systemMessages: [],
        additionalContext: [],
        suppressOutput: false,
      },
    );
  assert.equal(out.permissionDecision, "deny");
  assert.deepEqual(out.updatedInput, { owned: 1 });
});
test("native hook regex fallback, default event arrays, capabilities and clear behavior", () => {
  const f = sdkControlFixture();
  f.hooks.setHooks({ PreToolUse: [{ hookCallbackIds: [] }], Stop: [] });
  assert.equal(f.hooks.hasHooks("Stop"), false);
  assert.equal(f.hooks.matchesTool("[invalid", "[invalid"), true);
  assert.equal(f.hooks.matchesTool("Write", undefined), false);
  f.hooks.setCapabilities({ owned: true });
  f.hooks.clearHooks();
  assert.deepEqual(f.hooks.getCapabilities(), { owned: true });
});
test("native stdout writer flushes buffered lines exactly once across repeated backpressure", () => {
  const f = sdkControlFixture(),
    lines: string[] = [],
    returns = [false, false, true, true];
  f.stdout.write = (line: string) => {
    lines.push(line);
    return returns.shift() ?? true;
  };
  f.writer.write({ n: 1 });
  f.writer.write({ n: 2 });
  f.writer.write({ n: 3 });
  assert.equal(lines.length, 1);
  f.stdout.emit("drain");
  assert.equal(lines.length, 2);
  f.writer.write({ n: 4 });
  f.stdout.emit("drain");
  assert.deepEqual(
    lines.map((x) => JSON.parse(x).n),
    [1, 2, 3, 4],
  );
  assert.deepEqual(f.writer._queue, []);
});
test("native control dispatch clears timers on success and reports unknown subtype", async () => {
  const f = sdkControlFixture();
  f.control.subtypeHandlers = [
    {
      subtype: "owned",
      async handle() {
        return { owned: 1 };
      },
    },
  ];
  await f.control.handleMessage({
    type: "control_request",
    request_id: "owned",
    request: { subtype: "owned" },
  });
  await f.control.handleMessage({
    type: "control_request",
    request_id: "unknown",
    request: { subtype: "no" },
  });
  assert.deepEqual(f.messages()[0].response.response, { owned: 1 });
  assert.match(
    f.messages()[1].response.error,
    /Unknown control request subtype/,
  );
  assert.equal(f.timers.size, 0);
});
test("native initialize state fingerprint is only advanced by markSynced", () => {
  const f = sdkControlFixture(),
    s = new f.classes.SdkInitializeStateServiceImpl();
  assert.equal(s.set({ systemPrompt: "owned" }), true);
  assert.equal(s.set({ systemPrompt: "owned" }), true);
  s.markSynced();
  assert.equal(s.set({ systemPrompt: "owned" }), false);
  assert.equal(s.clear(), true);
  assert.equal(s.clear(), true);
  s.markSynced();
  assert.equal(s.clear(), false);
});
test("owned SDK control close settles clients, clears timers and ignores late drain", async () => {
  const output = new EventEmitter() as any;
  output.write = () => false;
  const host = createSdkControlHost({ stdout: output });
  const pending = [
    host.permission.requestPermission("Write", {}, "call"),
    host.hooks.invokeCallback("cb", {}),
    host.mcp.sendMcpMessage("owned", {}),
    host.elicitation.createElicitation({}),
  ].map((p) =>
    p.then(
      () => false,
      () => true,
    ),
  );
  host.close();
  assert.deepEqual(await Promise.all(pending), [true, true, true, true]);
  assert.equal(host.ownedTimerCount, 0);
  assert.equal(output.listenerCount("drain"), 0);
  output.emit("drain");
  await assert.rejects(
    host.permission.requestPermission("Write", {}, "later"),
    /closed/,
  );
  assert.equal(host.permission.pendingRequests.size, 0);
  await assert.rejects(host.receiveLine("{}"), /closed/);
});

setTraceProcessors([]);
async function ownedHarness(
  t: any,
  decision: any = { allowed: true },
  hooks: any = {},
  extra: Partial<HarnessOptions> = {},
) {
  const root = await mkdtemp(join(tmpdir(), "harness-sdk-control-")),
    target = join(root, "owned.txt"),
    messages: any[] = [],
    failures: any[] = [];
  let turn = 0,
    h: any;
  const stdout = new EventEmitter() as any;
  stdout.write = (line: string) => {
    const message = JSON.parse(line);
    messages.push(message);
    stdout.emit("owned-message", message);
    if (message.type === "control_request")
      queueMicrotask(() => {
        const body =
          message.request.subtype === "can_use_tool"
            ? decision
            : {
                hookSpecificOutput: {
                  additionalContext: "owned callback context",
                },
              };
        if (body != null)
          void h.sdkControl
            .receive({
              type: "control_response",
              response: {
                subtype: "success",
                request_id: message.request_id,
                response: body,
              },
            })
            .catch((e: any) => failures.push(e));
      });
    return true;
  };
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse() {
      const output: any[] =
        ++turn === 1
          ? [
              {
                type: "function_call",
                id: "owned-write",
                callId: "owned-write",
                name: "Write",
                arguments: JSON.stringify({
                  file_path: target,
                  content: "owned",
                }),
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
          id: `owned-${turn}`,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
  h = await createHarness({
    workDir: root,
    stateDir: join(root, ".owned-state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model },
    sdkControl: { stdout, hooks },
    ...extra,
  });
  t.after(async () => {
    await h.close();
    assert.deepEqual(failures, []);
    await rm(root, { recursive: true, force: true });
  });
  return {
    h,
    root,
    target,
    messages,
    session: await h.openSession(),
    get turns() {
      return turn;
    },
    waitForMessage(predicate: (message: any) => boolean) {
      const existing = messages.find(predicate);
      if (existing) return Promise.resolve(existing);
      return new Promise<any>((resolve) => {
        const listener = (message: any) => {
          if (predicate(message)) {
            stdout.removeListener("owned-message", listener);
            resolve(message);
          }
        };
        stdout.on("owned-message", listener);
      });
    },
  };
}
test(
  "real SDK uses native JSONL can_use_tool response and updatedInput instead of local UI",
  { timeout: 15000 },
  async (t) => {
    let ui = 0;
    const f = await ownedHarness(
      t,
      { allowed: true, updatedInput: { content: "wire rewrite" } },
      {},
      {
        approveTool: () => {
          ui++;
          return false;
        },
      },
    );
    assert.equal(await f.h.prompt(f.session, "owned transport"), "settled");
    assert.equal(await readFile(f.target, "utf8"), "wire rewrite");
    assert.equal(ui, 0);
    assert.equal(
      f.messages.filter((m) => m.request?.subtype === "can_use_tool").length,
      1,
    );
    assert.equal(f.h.sdkControl.permission.pendingRequests.size, 0);
  },
);
test(
  "real SDK native JSONL interrupt denial records denial and never executes Write",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedHarness(t, {
      allowed: false,
      reason: "owned denial",
      interrupt: true,
    });
    assert.equal(await f.h.prompt(f.session, "owned denial"), "");
    await assert.rejects(access(f.target));
    assert.equal(f.turns, 1);
    assert.equal(f.session.permissionDenials?.[0]?.tool_use_id, "owned-write");
  },
);
test(
  "real SDK executes lifecycle callbacks through restored hook request/response transport",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedHarness(
      t,
      { allowed: true },
      {
        PreToolUse: [{ matcher: "Write", hookCallbackIds: ["owned-pre"] }],
        PostToolUse: [{ hookCallbackIds: ["owned-post"] }],
        Stop: [{ hookCallbackIds: ["owned-stop"] }],
      },
    );
    assert.equal(await f.h.prompt(f.session, "owned callbacks"), "settled");
    const callbacks = f.messages.filter(
      (m) => m.request?.subtype === "hook_callback",
    );
    assert.equal(
      callbacks.filter((m) => m.request.callback_id === "owned-pre").length,
      2,
    );
    assert.equal(
      callbacks.filter((m) => m.request.callback_id === "owned-post").length,
      1,
    );
    assert.equal(
      callbacks.filter((m) => m.request.callback_id === "owned-stop").length,
      1,
    );
    assert.equal(f.h.sdkControl.ownedTimerCount, 0);
  },
);
test(
  "real SDK control initialization reports models/modes without returning model API keys",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedHarness(t);
    await f.h.sdkControl.receive({
      type: "control_request",
      request_id: "init",
      request: { subtype: "initialize" },
    });
    const out = f.messages.find(
      (m) => m.response?.request_id === "init",
    ).response;
    assert.equal(out.subtype, "success");
    assert.equal(out.response.account, null);
    assert.ok(out.response.models.length > 0);
    await f.h.sdkControl.receive({
      type: "control_request",
      request_id: "modes",
      request: { subtype: "get_available_modes" },
    });
    assert.equal(
      f.messages.find((m) => m.response?.request_id === "modes").response
        .response.availableModes.length,
      4,
    );
    await f.h.sdkControl.receive({
      type: "control_request",
      request_id: "override",
      request: {
        subtype: "initialize",
        systemPrompt: "owned initialized prompt",
      },
    });
    assert.equal(
      f.messages.find((m) => m.response?.request_id === "override").response
        .subtype,
      "success",
    );
    assert.equal(
      (await f.h.agents.getAgentConfig(f.h.agents.getDefaultAgentName()))
        ?.instructions,
      "owned initialized prompt",
    );
  },
);
test(
  "real SDK control mode/model updates touch the matching session and reject mismatch",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedHarness(t);
    for (const [id, request] of [
      [
        "mode",
        {
          subtype: "set_permission_mode",
          session_id: f.session.id,
          mode: "acceptEdits",
        },
      ],
      [
        "model",
        {
          subtype: "set_model",
          session_id: f.session.id,
          model: "owned-model",
        },
      ],
      [
        "bad",
        { subtype: "set_model", session_id: "wrong", model: "owned-model" },
      ],
    ] as const)
      await f.h.sdkControl.receive({
        type: "control_request",
        request_id: id,
        request,
      });
    assert.equal(f.session.permissionModeSubject.value, "acceptEdits");
    assert.equal(f.session.requestOptions.model, "owned-model");
    assert.equal(
      f.messages.find((m) => m.response?.request_id === "bad").response.subtype,
      "error",
    );
  },
);
test(
  "real SDK disconnect cancels pending permission and does not start another model run",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedHarness(t, null);
    const prompt = f.h.prompt(f.session, "owned disconnect");
    await f.waitForMessage((m) => m.request?.subtype === "can_use_tool");
    assert.equal(f.h.sdkControl.permission.pendingRequests.size, 1);
    f.h.sdkControl.close();
    await prompt;
    await assert.rejects(access(f.target));
    assert.equal(f.turns, 1);
    assert.equal(f.h.sdkControl.permission.pendingRequests.size, 0);
  },
);
