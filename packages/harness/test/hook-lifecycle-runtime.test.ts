import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { hookLifecycleFixture } from "../scripts/helpers/hook-lifecycle-fixtures.js";
import { createHarness } from "../src/runtime/create-harness.js";
import {
  PermissionDeniedError,
  ToolErrorCode,
  getToolErrorName,
} from "../src/tools/native-tool-errors.js";
import { createHookPermissionUtils } from "../src/hooks/hook-permission-utils.js";
import { createHookPlatformShell } from "../src/hooks/hook-platform-shell.js";
import { createHookLifecycleHost } from "../src/hooks/hook-lifecycle-runtime.js";
setTraceProcessors([]);
const fixture = (t: any) => {
  const f = hookLifecycleFixture();
  t.after(() => f.close());
  return f;
};
test("native SessionStart context, initial user message and parent/store transcript semantics", async (t) => {
  const f = fixture(t);
  f.enabled.add("SessionStart");
  f.outputs.SessionStart = {
    allowed: false,
    stdout: "fallback",
    hookSpecificOutput: {
      additionalContext: "context",
      initialUserMessage: "initial",
    },
  };
  await f.sessionManager.executeSessionStartHooks(f.session, "startup");
  assert.equal(f.session.hookContexts.sessionStartContext, "context");
  assert.equal(
    f.session.hookContexts.sessionStartInitialUserMessage,
    "initial",
  );
  const payload = f.events.find((e) => e[0] === "hook")[2];
  assert.equal(payload.session_id, "owned-parent");
  assert.equal(payload.agent_id, "owned-store");
  assert.equal(payload.transcript_path, "/owned/transcripts/owned-store.jsonl");
});
test("native UserPromptSubmit filters hidden/output/image blocks and strips newline from visible prompt", async (t) => {
  const f = fixture(t);
  f.enabled.add("UserPromptSubmit");
  await f.sessionManager.executeUserPromptSubmitHooks(f.session, [
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "<system-reminder>hidden</system-reminder>",
        },
        {
          type: "input_text",
          text: "<image_local_path>/owned/a.png</image_local_path>",
        },
        { type: "input_text", text: "<user_query>one\ntwo</user_query>" },
      ],
    },
  ]);
  assert.equal(f.events.find((e) => e[0] === "hook")[2].prompt, "onetwo");
});
test("native blocked UserPromptSubmit throws HookBlockedError; failed SessionStart stays best effort", async (t) => {
  const f = fixture(t);
  f.enabled.add("UserPromptSubmit");
  f.outputs.UserPromptSubmit = { allowed: false, message: "owned deny" };
  await assert.rejects(
    f.sessionManager.executeUserPromptSubmitHooks(f.session, [
      { type: "message", role: "user", content: "owned" },
    ]),
    { name: "HookBlockedError" },
  );
  f.enabled.add("SessionStart");
  f.outputs.SessionStart = Error("owned-start-failed");
  await f.sessionManager.executeSessionStartHooks(f.session, "startup");
});
test("Stop blocking creates meta continuation only for completed non-aborted turn", async (t) => {
  for (const reason of ["completed", "failed", "cancelled"]) {
    const f = fixture(t);
    f.outputs.Stop = { allowed: false, blocking: true, message: "feedback" };
    await f.sessionManager.executeStopHooks(
      f.session,
      { finalOutput: "answer" },
      { stopReason: reason },
    );
    assert.equal(
      !!f.session.hookContexts.continueRequest,
      reason === "completed",
    );
    if (reason === "completed")
      assert.equal(
        f.session.hookContexts.continueRequest.message.content,
        "Stop hook feedback:\nfeedback",
      );
  }
});
test("Stop explicit request/policy prevention and FinalStop preserve source arbitration", async (t) => {
  const f = fixture(t);
  f.enabled.add("FinalStop");
  f.outputs.Stop = {
    allowed: true,
    continueRequest: { message: { type: "message", content: "continue" } },
  };
  await f.sessionManager.executeStopHooks(
    f.session,
    {},
    { stopReason: "completed" },
  );
  assert.ok(f.session.hookContexts.continueRequest);
  assert.ok(!f.events.some((e) => e[0] === "hook" && e[1] === "FinalStop"));
  delete f.session.hookContexts.continueRequest;
  f.outputs.Stop = {
    allowed: false,
    blocking: true,
    message: "stop",
    preventContinuation: true,
  };
  await f.sessionManager.executeStopHooks(
    f.session,
    {},
    { stopReason: "completed" },
  );
  assert.equal(f.session.hookContexts.continueRequest, undefined);
  assert.equal(
    f.events.filter((e) => e[0] === "hook" && e[1] === "FinalStop").length,
    1,
  );
});
test("Stop exception dispatches StopFailure with last assistant text, without inventing continuation", async (t) => {
  const f = fixture(t);
  f.enabled.add("StopFailure");
  f.outputs.Stop = Object.assign(Error("owned-stop-error"), {
    stack: "owned-stack",
  });
  await f.sessionManager.executeStopHooks(f.session, undefined, {
    stopReason: "completed",
  });
  const event = f.events.find((e) => e[0] === "hook" && e[1] === "StopFailure");
  assert.equal(event[2].error, "owned-stop-error");
  assert.equal(event[2].error_details, "owned-stack");
  assert.equal(event[2].last_assistant_message, "last-owned-answer");
});
test("PreCompact uses stdout only; permission and elicitation hooks expose original structured decisions", async (t) => {
  const f = fixture(t);
  f.outputs.PreCompact = { allowed: true, stdout: " instructions " };
  assert.equal(
    await f.sessionManager.executePreCompactHooks(f.session, "auto"),
    "instructions",
  );
  for (const event of ["PermissionRequest", "PermissionDenied", "Elicitation"])
    f.enabled.add(event);
  f.outputs.PermissionRequest = {
    allowed: true,
    hookSpecificOutput: { decision: { behavior: "deny", message: "owned" } },
  };
  assert.deepEqual(
    await f.sessionManager.executePermissionRequestHooks(
      f.session,
      "Read",
      {},
      undefined,
      "call",
    ),
    { decision: { behavior: "deny", message: "owned" } },
  );
  f.outputs.PermissionDenied = {
    allowed: true,
    hookSpecificOutput: { retry: true },
  };
  assert.deepEqual(
    await f.sessionManager.executePermissionDeniedHooks(
      f.session,
      "Read",
      {},
      "denied",
      "call",
    ),
    { retry: true },
  );
  f.outputs.Elicitation = {
    allowed: true,
    hookSpecificOutput: { action: "accept", content: { owned: true } },
  };
  assert.deepEqual(
    await f.sessionManager.executeElicitationHooks(f.session, {
      mcpServerName: "owned",
      message: "question",
    }),
    { action: "accept", content: { owned: true } },
  );
});
test("watchPaths classifies rename as add/unlink, recursive directories, disposes old watches and end", async (t) => {
  const f = fixture(t);
  f.files.set("/owned/project/dir", true);
  f.enabled.add("FileChanged");
  f.sessionManager.setupWatchPaths(f.session, ["dir", null, "missing"]);
  assert.deepEqual(f.watchers[0].opts, { recursive: true });
  f.watchers[0].callback("rename", "new");
  f.files.set("/owned/project/dir/new", false);
  f.watchers[0].callback("rename", "new");
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(
    f.events.filter((e) => e[0] === "hook").map((e) => e[2].event),
    ["unlink", "add"],
  );
  f.sessionManager.setupWatchPaths(f.session, ["dir"]);
  assert.equal(f.events.filter((e) => e[0] === "watch-close").length, 1);
  await f.sessionManager.executeSessionEndHooks(f.session, "other");
  assert.equal(f.events.filter((e) => e[0] === "watch-close").length, 2);
});
test("tool pre uses updatedInput and event-name gating rather than command modifiedInput", async (t) => {
  const f = fixture(t);
  f.outputs.PreToolUse = {
    allowed: false,
    modifiedInput: { ignored: true },
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      updatedInput: { path: "new" },
      permissionDecisionReason: "owned",
    },
  };
  const result = await f.toolManager.executePreToolUseHooks(
    "Read",
    { path: "old" },
    f.session,
    "transcript",
    undefined,
    "call",
  );
  assert.equal(result.allowed, true);
  assert.deepEqual(result.modifiedInput, { path: "new" });
  assert.equal(result.message, "owned");
  assert.equal(
    f.events.find((e) => e[0] === "addToolStartSpanEvent")[2].callId,
    "call",
  );
});
test("tool post distinguishes response flags and MCP-only updated output", async (t) => {
  const f = fixture(t);
  f.outputs.PostToolUse = {
    allowed: true,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: "hint",
      updatedMCPToolOutput: "updated",
    },
  };
  const result = await f.toolManager.executePostToolUseHooks(
    "Read",
    {},
    {
      is_error: true,
      content: { detail: "error" },
      tool_error_code: ToolErrorCode.ReadFileInvalidParamsError,
    },
    f.session,
    "transcript",
    undefined,
    "call",
  );
  assert.equal(result.updatedMCPToolOutput, undefined);
  const error = f.events.find((e) => e[0] === "addToolErrorSpanEvent")[2];
  assert.equal(error.durationMs, 500);
  assert.equal(error.toolErrorName, "ReadFileInvalidParamsError");
  assert.equal(error.errorSource, "response_flag");
  assert.equal(
    (
      await f.toolManager.executePostToolUseHooks(
        "mcp__owned__tool",
        {},
        "result",
        f.session,
        "transcript",
        undefined,
        "call",
      )
    ).updatedMCPToolOutput,
    "updated",
  );
});
test("tool error classification preserves exact names, custom resolver, interruption suppression", async (t) => {
  const f = fixture(t);
  assert.equal(
    f.toolManager.resolveThrownErrorCode(
      "Glob",
      Error("Search path does not exist"),
    ),
    "7101",
  );
  assert.equal(
    f.toolManager.resolveThrownErrorCode("Read", Error("Expected string")),
    "1009",
  );
  assert.equal(
    f.toolManager.resolveThrownErrorCode("Agent", Error("required")),
    "19922",
  );
  f.toolManager.registerToolErrorResolver("Read", () => "2000");
  assert.equal(
    f.toolManager.resolveThrownErrorCode("Read", Error("required")),
    "2000",
  );
  await f.toolManager.executePostToolUseFailureHooks(
    "Read",
    {},
    Error("aborted"),
    f.session,
    "path",
    undefined,
    "call",
    true,
  );
  assert.ok(!f.events.some((e) => e[0] === "addToolErrorSpanEvent"));
});
test("native tool pipeline consumes cached pre-hook once, merges wrapped inputs and attaches hints", async (t) => {
  const f = fixture(t);
  f.session.preToolUseHookResults = new Map([
    ["call", { allowed: true, modifiedInput: { path: "cached" } }],
  ]);
  f.outputs.PostToolUse = {
    allowed: true,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: "hint",
    },
  };
  const result = await f.pipeline.executeToolWithHooks(
    { name: "Read" },
    async (input: any) => {
      assert.equal(input.value.path, "cached");
      assert.equal(input.wrapper, true);
      return { content: "content" };
    },
    { value: { path: "old" }, wrapper: true },
    { context: f.session },
    { toolCall: { callId: "call" } },
  );
  assert.equal(f.session.preToolUseHookResults.size, 0);
  assert.ok(!f.events.some((e) => e[0] === "hook" && e[1] === "PreToolUse"));
  assert.equal(
    result.content,
    'content\n<system-reminder data-role="tool-hint">hint</system-reminder>',
  );
});
test("native pre-hook denial is outside execution catch and never emits PostToolUseFailure", async (t) => {
  const f = fixture(t);
  f.outputs.PreToolUse = { allowed: false, message: "denied" };
  await assert.rejects(
    f.pipeline.executeToolWithHooks(
      { name: "Read" },
      () => {
        throw Error("must not run");
      },
      {},
      { context: f.session },
      { toolCall: { callId: "call" } },
    ),
    PermissionDeniedError,
  );
  assert.ok(
    !f.events.some((e) => e[0] === "hook" && e[1] === "PostToolUseFailure"),
  );
});
test("native thrown tool error receives failure hint; falsy result has no post/conditional event", async (t) => {
  const f = fixture(t);
  f.outputs.PostToolUseFailure = {
    allowed: true,
    hookSpecificOutput: {
      hookEventName: "PostToolUseFailure",
      additionalContext: "failure hint",
    },
  };
  await assert.rejects(
    f.pipeline.executeToolWithHooks(
      { name: "Read" },
      () => {
        throw Error("owned-error");
      },
      {},
      { context: f.session },
      { toolCall: { callId: "call" } },
    ),
    /failure hint/,
  );
  f.events.length = 0;
  await f.pipeline.executeToolWithHooks(
    { name: "Read" },
    () => "",
    {},
    { context: f.session },
    { toolCall: { callId: "call" } },
  );
  assert.ok(!f.events.some((e) => e[0] === "hook" && e[1] === "PostToolUse"));
  assert.ok(!f.events.some((e) => e[0] === "conditional"));
});
test("permission helper uses original minimatch/micromatch semantics and parser service fallback", () => {
  const p = createHookPermissionUtils({
    getWorkDir: () => "/owned/project",
    getHomeDir: () => "/owned/home",
  });
  assert.equal(p.matchFileRule("src/A.TS", "**/*.ts"), true);
  assert.equal(p.matchFileRule(".hidden", "*"), true);
  assert.equal(p.matchCommandRule("git diff && node test.js", "node:*"), true);
  assert.equal(p.matchCommandRule("GIT STATUS", "git *"), true);
  assert.equal(p.matchCommandRule("GIT STATUS", "git:*"), false);
  const withParser = createHookPermissionUtils({
    getWorkDir: () => "/owned",
    getHomeDir: () => "/owned/home",
    getCommandParserService: () => ({
      extractCommands: () => [{ fullCommand: "owned parsed" }],
    }),
  });
  assert.equal(withParser.matchCommandRule("a && b", "owned parsed"), true);
});
test("platform shell restores env selection and Windows Git Bash path caching without executing commands", () => {
  let checks = 0;
  const env: any = { CODEBUDDY_CODE_SHELL: "bash" };
  const shell = createHookPlatformShell({
    env,
    getCwd: () => "/owned",
    platform: "darwin",
    fs: {},
    warn() {},
  });
  assert.equal(shell.getShellConfiguration().executable, "bash");
  env.CODEBUDDY_CODE_SHELL = "cmd";
  assert.throws(() => shell.getShellConfiguration(), /not supported/);
  const windows = createHookPlatformShell({
    env: { CODEBUDDY_CODE_GIT_BASH_PATH: "C:/owned/Git/bash.exe" },
    getCwd: () => "/owned",
    platform: "win32",
    fs: {
      existsSync: () => {
        checks++;
        return true;
      },
    },
    warn() {},
  });
  assert.equal(
    windows.WindowsBashUtils.findBashPath(),
    "C:/owned/Git/bash.exe",
  );
  windows.WindowsBashUtils.findBashPath();
  assert.equal(checks, 1);
});
test("original error enum covers source values and PermissionDeniedError retains ToolError base", () => {
  const err = new PermissionDeniedError("Read", "owned");
  assert.equal(err.isToolError(), true);
  assert.equal(err.toolName, "Read");
  assert.equal(getToolErrorName("1009"), "ReadFileInvalidParamsError");
  assert.equal(getToolErrorName("not-a-code"), "UnknownToolError");
});
const answer = (text: string): any => ({
  type: "message",
  role: "assistant",
  id: "owned-answer",
  status: "completed",
  content: [{ type: "output_text", text }],
});
async function runtime(
  t: any,
  output: (n: number, request: any) => any[] = () => [answer("owned complete")],
  extra: any = {},
) {
  const root = await mkdtemp(join(tmpdir(), "harness-hook-lifecycle-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const requests: any[] = [],
    events: any[] = [];
  let n = 0;
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      const items = output(++n, request);
      yield { type: "response_started" };
      for (const item of items)
        if (item.type === "message")
          yield { type: "output_text_delta", delta: item.content[0].text };
      yield {
        type: "response_done",
        response: {
          id: "owned-" + n,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: items,
        },
      } as any;
    },
  };
  const h = await createHarness({
    workDir: root,
    stateDir: join(root, "state"),
    modelProvider: { getModel: async () => model },
    autoMemory: { gitUserName: () => "owned" },
    hooks: {
      env: {},
      hookProvider: {
        sortSync: () => Object.values((extra as any).internal ?? {}),
      },
    },
    ...extra,
  });
  t.after(() => h.close());
  return { ...h, root, requests, events };
}
test("default runtime invokes native SessionStart/UserPromptSubmit/Stop/FinalStop/SessionEnd exactly once", async (t) => {
  const calls: any[] = [];
  const internal = [
    "SessionStart",
    "UserPromptSubmit",
    "Stop",
    "FinalStop",
    "SessionEnd",
  ].map((event) => ({
    event,
    execute: async (input: any) => {
      calls.push([event, input.session_id]);
      return { allowed: true };
    },
  }));
  const h = await runtime(t, undefined, { internal });
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "owned user"), "owned complete");
  await h.close();
  for (const event of [
    "SessionStart",
    "UserPromptSubmit",
    "Stop",
    "FinalStop",
    "SessionEnd",
  ])
    assert.equal(
      calls.filter((x) => x[0] === event && x[1] === session.id).length,
      1,
      event,
    );
});
test("default runtime injects SessionStart and UserPromptSubmit context into real SDK input", async (t) => {
  const h = await runtime(t, undefined, {
    internal: [
      {
        event: "SessionStart",
        execute: async () => ({
          allowed: true,
          hookSpecificOutput: { additionalContext: "SESSION-OWNED" },
        }),
      },
      {
        event: "UserPromptSubmit",
        execute: async () => ({
          allowed: true,
          hookSpecificOutput: { additionalContext: "USER-OWNED" },
        }),
      },
    ],
  });
  const session = await h.openSession();
  await h.prompt(session, "owned user");
  const input = JSON.stringify(h.requests[0].input);
  assert.match(input, /SESSION-OWNED/);
  assert.match(input, /USER-OWNED/);
});
test("default runtime UserPromptSubmit denial prevents any model request", async (t) => {
  const h = await runtime(t, undefined, {
    internal: [
      {
        event: "UserPromptSubmit",
        execute: async () => ({ allowed: false, message: "owned denial" }),
      },
    ],
  });
  const session = await h.openSession();
  await assert.rejects(h.prompt(session, "owned user"), /owned denial/);
  assert.equal(h.requests.length, 0);
});
test("default runtime Stop continuation reaches SDK with stop_hook_active and one terminal FinalStop", async (t) => {
  const stops: boolean[] = [],
    finals: string[] = [];
  const h = await runtime(t, (n) => [answer("answer " + n)], {
    internal: [
      {
        event: "Stop",
        priority: 300,
        execute: async (input: any) => {
          stops.push(input.stop_hook_active);
          return stops.length === 1
            ? { allowed: false, blocking: true, message: "owned feedback" }
            : { allowed: true };
        },
      },
      {
        event: "FinalStop",
        execute: async (input: any) => {
          finals.push(input.final_stop_reason);
          return { allowed: true };
        },
      },
    ],
  });
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "owned user"), "answer 2");
  assert.deepEqual(stops, [false, true]);
  assert.deepEqual(finals, ["completed"]);
  assert.match(JSON.stringify(h.requests[1].input), /Stop hook feedback/);
});
test("default runtime cached SDK tool sees rewritten input and PostToolUse hint without double freshness path", async (t) => {
  let after: any;
  const h = await runtime(
    t,
    (n) =>
      n === 1
        ? [
            {
              type: "function_call",
              callId: "owned-read",
              name: "Read",
              arguments: JSON.stringify({ file_path: "old.txt" }),
            },
          ]
        : [answer("done")],
    {
      approveTool: () => true,
      internal: [
        {
          event: "PreToolUse",
          matcher: "Read",
          execute: async () => ({
            allowed: true,
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              updatedInput: { file_path: "new.txt" },
            },
          }),
        },
        {
          event: "PostToolUse",
          matcher: "Read",
          execute: async (input: any) => {
            after = input.tool_input;
            return {
              allowed: true,
              hookSpecificOutput: {
                hookEventName: "PostToolUse",
                additionalContext: "POST-OWNED",
              },
            };
          },
        },
      ],
    },
  );
  await writeFile(join(h.root, "new.txt"), "owned rewritten file");
  const session = await h.openSession();
  await h.prompt(session, "read");
  assert.equal(after.file_path, "new.txt");
  assert.match(JSON.stringify(h.requests[1].input), /owned rewritten file/);
  assert.match(JSON.stringify(h.requests[1].input), /POST-OWNED/);
});
test("default runtime thrown host permission error dispatches native failure hint back into SDK", async (t) => {
  let failures = 0;
  const h = await runtime(
    t,
    (n) =>
      n === 1
        ? [
            {
              type: "function_call",
              callId: "owned-denied",
              name: "Read",
              arguments: JSON.stringify({ file_path: "file.txt" }),
            },
          ]
        : [answer("done")],
    {
      internal: [
        {
          event: "PostToolUseFailure",
          execute: async () => {
            failures++;
            return {
              allowed: true,
              hookSpecificOutput: {
                hookEventName: "PostToolUseFailure",
                additionalContext: "FAILURE-OWNED",
              },
            };
          },
        },
      ],
    },
  );
  const session = await h.openSession();
  await h.prompt(session, "read");
  assert.equal(failures, 1);
  assert.match(JSON.stringify(h.requests[1].input), /FAILURE-OWNED/);
});
test("default runtime task events and compact hooks use native dispatch", async (t) => {
  const seen: string[] = [];
  const h = await runtime(t, undefined, {
    internal: ["TaskCreated", "TaskCompleted", "PreCompact", "PostCompact"].map(
      (event) => ({
        event,
        execute: async () => {
          seen.push(event);
          return { allowed: true };
        },
      }),
    ),
  });
  const session = await h.openSession();
  await h.taskTools.create({ subject: "owned", description: "owned" }, session);
  assert.ok(seen.includes("TaskCreated"));
  await h.hooks!.sessionManager.executePreCompactHooks(
    session,
    "manual",
    undefined,
  );
  await h.hooks!.sessionManager.executePostCompactHooks(
    session,
    "manual",
    "summary",
  );
  assert.ok(seen.includes("PreCompact"));
  assert.ok(seen.includes("PostCompact"));
});
test("real owned fs.watch routes FileChanged and is disposed at session end", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "harness-native-watch-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = join(root, "owned.txt");
  await writeFile(file, "before");
  let changed!: () => void;
  const pending = new Promise<void>((resolve) => {
    changed = resolve;
  });
  const host = createHookLifecycleHost({
    workDir: () => root,
    sessionStore: { getSessionFilePath: () => join(root, "owned.jsonl") },
    env: {},
    hookProvider: {
      sortSync: () => [
        {
          event: "FileChanged",
          execute: async (input: any) => {
            if (input.file_path === file) changed();
            return { allowed: true };
          },
        },
      ],
    },
  });
  t.after(() => host.close());
  const session: any = { id: "owned", meta: {}, history: [] };
  host.sessionManager.setupWatchPaths(session, [file]);
  await writeFile(file, "after");
  await Promise.race([
    pending,
    new Promise((_, reject) =>
      setTimeout(() => reject(Error("owned watcher timeout")), 3000).unref(),
    ),
  ]);
  await host.sessionManager.executeSessionEndHooks(session, "other");
  assert.equal(session.hookContexts.fileWatchersDispose, undefined);
});
test("default settings command Hook runs owned node through native shell and once is shared across sessions", async (t) => {
  const command = `exec '${process.execPath.replaceAll("'", "'\\''")}' -e 'process.stdout.write(JSON.stringify({hookSpecificOutput:{additionalContext:"COMMAND-OWNED"}}))'`;
  const config = {
    SessionStart: [{ hooks: [{ type: "command", command, once: true }] }],
  };
  const h = await runtime(t, undefined, {
    settings: {
      get: async (key: string) => (key === "hooks" ? config : undefined),
    },
  });
  const session = await h.openSession();
  assert.equal(session.hookContexts?.sessionStartContext, "COMMAND-OWNED");
  await h.prompt(session, "owned user");
  assert.match(JSON.stringify(h.requests[0].input), /COMMAND-OWNED/);
  const second = await h.openSession();
  assert.equal(second.hookContexts?.sessionStartContext, undefined);
});
test("default settings Prompt Hook uses real SDK evaluator before main request without transcript pollution", async (t) => {
  const config = {
    UserPromptSubmit: [
      {
        hooks: [{ type: "prompt", prompt: "Evaluate owned input: $ARGUMENTS" }],
      },
    ],
  };
  const h = await runtime(
    t,
    (n) => [answer(n === 1 ? '{"ok":true}' : "main-owned")],
    {
      settings: {
        get: async (key: string) => (key === "hooks" ? config : undefined),
      },
    },
  );
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "owned user"), "main-owned");
  assert.equal(h.requests.length, 2);
  assert.match(JSON.stringify(h.requests[0].input), /Evaluate owned input/);
  assert.ok(!JSON.stringify(session.history).includes("Evaluate owned input"));
});
test("default AgentTask routes native SubagentStart and SubagentStop with parent session id", async (t) => {
  const events: any[] = [];
  const h = await runtime(
    t,
    (n) =>
      n === 1
        ? [
            {
              type: "function_call",
              callId: "owned-agent",
              name: "Agent",
              arguments: JSON.stringify({
                description: "owned child",
                prompt: "owned child",
                subagent_type: "Explore",
              }),
            },
          ]
        : [answer(n === 2 ? "child-owned" : "parent-owned")],
    {
      approveTool: () => true,
      internal: ["SubagentStart", "SubagentStop"].map((event) => ({
        event,
        execute: async (input: any) => {
          events.push([event, input.session_id, input.agent_type]);
          return { allowed: true };
        },
      })),
    },
  );
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "delegate owned child"), "parent-owned");
  assert.deepEqual(events, [
    ["SubagentStart", session.id, "Explore"],
    ["SubagentStop", session.id, "Explore"],
  ]);
});
