import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  Agent,
  Runner,
  RunState,
  RunContext,
  Usage,
  setTraceProcessors,
  type Model,
} from "@openai/agents-core";
import { genericHookFixture } from "../scripts/helpers/generic-hook-fixtures.js";
import { createGenericHookHost } from "../src/hooks/hook-runtime.js";
import {
  HookBlockedError,
  HookEvent,
  HookPriority,
} from "../src/hooks/hook-constants.js";
import { parsePromptHookResponse } from "../src/hooks/prompt-hook-protocol.js";
setTraceProcessors([]);
const fixture = (t: any) => {
  const f = genericHookFixture();
  t.after(() => f.close());
  return f;
};
test("generic Hook protocol keeps 28 events, native priorities and HookBlockedError", () => {
  assert.equal(Object.keys(HookEvent).length, 28);
  assert.equal(HookPriority.StructuredOutput, 200);
  const e = new HookBlockedError("Stop", "owned");
  assert.equal(e.message, "Stop hook error: \nowned");
  assert.equal(e.name, "HookBlockedError");
  assert.equal(e.reason, "owned");
});
test("prompt response parser preserves defensive fallback and empty-object denial", () => {
  assert.equal(parsePromptHookResponse("").ok, true);
  assert.equal(parsePromptHookResponse("null").ok, true);
  assert.equal(parsePromptHookResponse("{}").ok, false);
  assert.equal(parsePromptHookResponse("[]").ok, false);
  assert.deepEqual(
    parsePromptHookResponse('```json\n{"ok":false,"impossible":true}\n```'),
    { ok: false, impossible: true },
  );
  assert.deepEqual(parsePromptHookResponse('prefix {"ok":true} suffix'), {
    ok: true,
  });
});
test("prompt arguments whitelist fields and only replace first ARGUMENTS marker", (t) => {
  const f = fixture(t);
  const input = {
    session_id: "owned",
    session: { secret: "never serialized" },
    hook_event_name: "Stop",
    last_assistant_message: "last",
    background_tasks: ["job"],
  };
  const text = f.promptService.buildUserMessage(
    { prompt: "first $ARGUMENTS second $ARGUMENTS" },
    input,
  );
  assert.ok(text.endsWith(" second $ARGUMENTS"));
  assert.ok(!text.includes("never serialized"));
  assert.deepEqual(
    JSON.parse(f.runtime.promptProtocol.buildPromptHookArgumentsJson(input)),
    {
      session_id: "owned",
      cwd: "/owned/project",
      hook_event_name: "Stop",
      stop_hook_active: false,
      last_assistant_message: "last",
      background_tasks: ["job"],
      session_crons: [],
    },
  );
});
test("command output keeps exit-code 2 blocking and nonzero warning override", (t) => {
  const f = fixture(t);
  const body =
    '{"hookSpecificOutput":{"permissionDecision":"deny","updatedInput":{"ignored":1},"modifiedInput":{"used":1}},"stopReason":"blocked"}';
  const a = f.executor.parseHookOutput(2, body, "", "owned");
  assert.equal(a.allowed, false);
  assert.equal(a.blocking, true);
  assert.deepEqual(a.modifiedInput, { used: 1 });
  const b = f.executor.parseHookOutput(1, body, "warning", "owned");
  assert.equal(b.allowed, true);
  assert.equal(f.executor.deriveHookStatus(b), "warning");
  assert.equal(
    f.executor.parseHookOutput(null, "", "", "owned").allowed,
    false,
  );
});
test("executor strips session from stdin, clears NODE_OPTIONS, publishes native hook message", async (t) => {
  const f = fixture(t),
    messages: any[] = [];
  f.runtime.env.NODE_OPTIONS = "should not reach child";
  f.setPlan({ stdout: ["owned-message"] });
  await f.executor.execute(
    "owned",
    {
      hook_event_name: "Stop",
      session_id: "owned",
      session: { inputSubject: { next: (m: any) => messages.push(m) } },
    },
    { hookEvent: "Stop", callId: "call" },
  );
  assert.deepEqual(JSON.parse(f.events.find((e) => e[0] === "stdin")[1]), {
    hook_event_name: "Stop",
    session_id: "owned",
  });
  assert.equal(f.events.find((e) => e[0] === "spawn")[3].env.NODE_OPTIONS, "");
  assert.equal(messages[0].providerData.hookStatus, "success");
  assert.equal(messages[0].providerData.callId, "call");
  assert.equal(messages[0].providerData.skipRun, true);
});
test("executor suppresses duplicate UI messages for blocked UserPromptSubmit and PreToolUse ask", async (t) => {
  for (const [event, body] of [
    ["UserPromptSubmit", '{"continue":false,"reason":"deny"}'],
    [
      "PreToolUse",
      '{"hookSpecificOutput":{"permissionDecision":"ask"},"systemMessage":"ask"}',
    ],
  ]) {
    const f = fixture(t),
      messages: any[] = [];
    f.setPlan({ stdout: [body] });
    await f.executor.execute(
      "owned",
      { session: { inputSubject: { next: (v: any) => messages.push(v) } } },
      { hookEvent: event },
    );
    assert.deepEqual(messages, []);
  }
});
test("executor timeout preserves native TERM and killed-flag behavior", async (t) => {
  const f = fixture(t);
  f.setPlan({ hold: true });
  const pending = f.executor.execute("owned", {}, { timeout: 12 });
  await Promise.resolve();
  f.timers[0].callback();
  const result = await pending;
  assert.equal(result.allowed, false);
  assert.equal(result.exitCode, -1);
  assert.match(result.message, /12ms/);
  f.timers[1].callback();
  assert.deepEqual(
    f.events.filter((e) => e[0] === "kill"),
    [["kill", "SIGTERM"]],
  );
});
test("executor async probe handles chunks and braces in strings; timeout unit is milliseconds", async (t) => {
  const f = fixture(t);
  f.setPlan({
    hold: true,
    stdout: ['  {"async":', 'true,"asyncTimeout":321,"text":"} {"}'],
  });
  const result = await f.executor.execute(
    "owned",
    {},
    { timeout: 999, asyncRewake: true },
  );
  assert.equal(result.allowed, true);
  assert.equal(f.timers[0].cleared, true);
  assert.equal(f.timers[1].ms, 321);
  assert.equal(f.timers[1].unreferenced, true);
});
test("executor abandons async detection after over 4096 non-object characters", async (t) => {
  const f = fixture(t);
  f.setPlan({ stdout: ["x".repeat(4100), '{"async":true}'] });
  await f.executor.execute("owned", {}, {});
  assert.equal(f.timers.length, 1);
});
test("executor spawn/write failures return denial, but circular input rejects before spawn", async (t) => {
  const f = fixture(t);
  f.setPlan({ error: true });
  assert.equal((await f.executor.execute("owned", {}, {})).exitCode, -1);
  f.setPlan({ writeError: true });
  const result = await f.executor.execute("owned", {}, {});
  assert.equal(result.allowed, false);
  assert.equal(result.message, "Failed to write input to hook");
  const cycle: any = {};
  cycle.self = cycle;
  await assert.rejects(f.executor.execute("owned", cycle, {}), /circular/);
});
test("native scoped registry stamps sourceId, remaps agent Stop and merges SubagentStop", (t) => {
  const f = fixture(t);
  f.registry.register(
    "agent",
    {
      Stop: [
        {
          hooks: [
            { type: "prompt", prompt: "a" },
            { type: "prompt", prompt: "b", sourceId: "keep" },
          ],
        },
      ],
      SubagentStop: [{ hooks: [{ type: "command", command: "c" }] }],
    },
    { isAgent: true, sourceLabel: "owned" },
  );
  assert.deepEqual(f.registry.getHooks("Stop"), []);
  const hooks = f.registry.getHooks("SubagentStop");
  assert.equal(hooks.length, 2);
  assert.equal(hooks[0].hooks[0].sourceId, "agent");
  assert.equal(hooks[0].hooks[1].sourceId, "keep");
  f.registry.unregister("agent");
  assert.equal(f.registry.hasScope("agent"), false);
});
test("local, internal and SDK matcher fallbacks remain distinct", (t) => {
  const { manager } = fixture(t);
  assert.equal(manager.matchesInternalHookMatcher("Read", undefined), true);
  assert.equal(manager.matchesSdkMatcher("Read", undefined), false);
  assert.equal(manager.matchesInternalHookMatcher("[", "["), true);
  assert.equal(manager.matchesSdkMatcher("[", "["), true);
  assert.deepEqual(
    manager.findMatchingHooks([{ matcher: "[", hooks: ["invalid"] }], "["),
    [],
  );
  assert.deepEqual(
    manager.findMatchingHooks(
      [{ matcher: "[", hooks: ["all-with-no-match-value"] }],
      undefined,
    ),
    ["all-with-no-match-value"],
  );
});
test("dedupe includes source, shell and if but ignores timeout and HTTP headers", (t) => {
  const { manager } = fixture(t);
  const a = { type: "command", command: "owned" };
  assert.equal(
    manager.deduplicateHooks([
      a,
      { ...a, timeout: 1 },
      { ...a, sourceId: "different" },
      { ...a, shell: "powershell" },
      { ...a, if: "Read" },
    ]).length,
    4,
  );
  assert.equal(
    manager.deduplicateHooks([
      { type: "http", url: "owned", headers: { a: "b" } },
      { type: "http", url: "owned", headers: { a: "c" } },
    ]).length,
    1,
  );
});
test("once applies only on exit zero and object identity survives config filtering", async (t) => {
  const f = fixture(t),
    hook = { type: "command", command: "owned", once: true };
  f.settings.hooks = { Stop: [{ hooks: [hook] }] };
  f.setPlan({ exit: 1 });
  await f.manager.executeHooks("Stop", {});
  assert.equal((await f.manager.getHooks("Stop")).length, 1);
  f.setPlan({});
  await f.manager.executeHooks("Stop", {});
  assert.deepEqual(await f.manager.getHooks("Stop"), []);
  f.settings.hooks.Stop = [{ hooks: [{ ...hook }] }];
  assert.equal((await f.manager.getHooks("Stop")).length, 1);
});
test("command plugin env aliases and allow-list are not process environment isolation", async (t) => {
  const f = fixture(t);
  f.runtime.env.OTHER = "inherited";
  f.settings.hooks = {
    PreToolUse: [
      {
        hooks: [
          {
            type: "command",
            command: "owned",
            allowedEnvVars: ["PUBLIC"],
            pluginRoot: "/owned/plugin",
            pluginData: "/owned/data",
            pluginOptions: { "a-b": true },
          },
        ],
      },
    ],
  };
  await f.manager.executeHooks(
    "PreToolUse",
    { tool_name: "Read" },
    { timeout: 999 },
  );
  const env = f.events.find((e) => e[0] === "spawn")[3].env;
  assert.equal(env.PUBLIC, "owned-value");
  assert.equal(env.OTHER, "inherited");
  assert.equal(env.CODEBUDDY_PLUGIN_OPTION_A_B, "true");
  assert.equal(env.CLAUDE_PLUGIN_ROOT, "/owned/plugin");
  assert.equal(env.CODEBUDDY_SERVICE_PROXY_URL, undefined);
  assert.equal(f.timers[0].ms, 60000);
});
test("input processors precede matching, internal/local precede SDK with merged output", async (t) => {
  const f = fixture(t);
  f.processors.push({
    process: (v: any) => {
      v.tool_name = "Read";
      f.events.push(["processor"]);
    },
  });
  f.internal.push({
    event: "PreToolUse",
    execute: async () => ({
      allowed: true,
      hookSpecificOutput: { additionalContext: "internal" },
    }),
  });
  f.settings.hooks = {
    PreToolUse: [
      { matcher: "Read", hooks: [{ type: "command", command: "owned" }] },
    ],
  };
  f.setPlan({
    stdout: ['{"hookSpecificOutput":{"additionalContext":"local"}}'],
  });
  f.sdk.PreToolUse = [
    { matcher: "Read", hookCallbackIds: ["owned"], timeout: 2 },
  ];
  f.setSdkResult({
    hookSpecificOutput: { permissionDecision: "deny", updatedInput: { x: 1 } },
  });
  const input: any = {};
  const result = await f.manager.executeHooks("PreToolUse", input, {
    callId: "call",
  });
  assert.equal(input.call_id, "call");
  assert.equal(result.allowed, false);
  assert.equal(result.blocking, true);
  assert.deepEqual(result.modifiedInput, { x: 1 });
  const sdk = f.events.find((e) => e[0] === "sdk");
  assert.equal(sdk[2].hook_specific_output.additionalContext, "local");
  assert.equal(sdk[4], 2000);
  assert.ok(
    f.events.findIndex((e) => e[0] === "spawn") <
      f.events.findIndex((e) => e[0] === "sdk"),
  );
});
test("aggregate drops rejected results, shallow merges outputs and joins string-only continuation messages", async (t) => {
  const { manager } = fixture(t);
  let completed = false;
  const result = manager.aggregateSettledResults([
    { status: "rejected", reason: Error("owned") },
    {
      status: "fulfilled",
      value: {
        allowed: true,
        stdout: "hidden",
        suppressOutput: true,
        hookSpecificOutput: { additionalContext: "old" },
        continueRequest: {
          message: { type: "message", role: "user", content: "one" },
          completionPromise: Promise.resolve().then(() => {
            completed = true;
          }),
        },
      },
    },
    {
      status: "fulfilled",
      value: {
        allowed: false,
        blocking: true,
        message: "deny",
        hookSpecificOutput: { additionalContext: "new" },
        continueRequest: {
          message: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: "not merged" }],
          },
        },
      },
    },
  ]);
  assert.equal(result.stdout, undefined);
  assert.equal(result.hookSpecificOutput.additionalContext, "new");
  assert.equal(result.continueRequest.message.content, "one");
  await result.continueRequest.completionPromise;
  assert.equal(completed, true);
});
test("prompt hook impossible/onResult/continueOnBlock and defensive exceptions preserve decisions", async (t) => {
  const f = fixture(t);
  f.setResponse('{"ok":false,"impossible":true,"reason":"owned"}');
  let called = false;
  const a = await f.manager.executePromptHook(
    {
      prompt: "owned",
      treatImpossibleAsAllow: true,
      onResult: () => {
        called = true;
      },
    },
    { hook_event_name: "Stop" },
    "Stop",
  );
  assert.equal(a.allowed, true);
  assert.equal(a.hookSpecificOutput.goalImpossible, true);
  assert.equal(called, true);
  const b = await f.manager.executePromptHook(
    { prompt: "owned" },
    { hook_event_name: "Stop" },
    "Stop",
  );
  assert.equal(b.preventContinuation, true);
  const c = await f.manager.executePromptHook(
    { prompt: "owned", continueOnBlock: true },
    { hook_event_name: "Stop" },
    "Stop",
  );
  assert.equal(c.preventContinuation, false);
  f.setPlan({ promptError: true });
  assert.equal(
    (
      await f.promptService.execute(
        { prompt: "owned" },
        { hook_event_name: "Stop" },
        {},
      )
    ).ok,
    true,
  );
});
test("if rule parser delegates command/file predicates and malformed rules allow", (t) => {
  const f = fixture(t);
  assert.equal(f.runtime.ifRule.matches("invalid???", {}), true);
  assert.equal(
    f.runtime.ifRule.matches("Read(a)", {
      toolName: "Read",
      toolInput: { path: "a" },
    }),
    true,
  );
  assert.equal(
    f.runtime.ifRule.matches("Read(a)", { toolName: "Read", toolInput: {} }),
    false,
  );
  assert.equal(
    f.runtime.ifRule.matches("Bash(a)", {
      toolName: "Bash",
      toolInput: { command: "a" },
    }),
    true,
  );
  assert.equal(
    f.runtime.ifRule.matches("Custom(a)", {
      toolName: "Custom",
      toolInput: { x: 1 },
    }),
    true,
  );
});
test("Windows hook helpers preserve quoting, env expansion, and hidden PowerShell args", (t) => {
  const f = fixture(t);
  const h = f.runtime.shellHelpers;
  assert.deepEqual(
    h.parseCommandLine(
      '"C:\\owned path\\pwsh.exe" -File "C:\\owned script.ps1"',
    ),
    {
      exe: "C:\\owned path\\pwsh.exe",
      args: ["-File", "C:\\owned script.ps1"],
    },
  );
  assert.deepEqual(
    h.tryBuildDirectPowerShellHookCommand(
      '"${ROOT}/pwsh.exe" -File owned.ps1',
      { ROOT: "C:/owned path" },
    ),
    {
      executable: "C:/owned path/pwsh.exe",
      args: ["-NonInteractive", "-WindowStyle", "Hidden", "-File", "owned.ps1"],
    },
  );
  assert.equal(
    h.tryBuildDirectPowerShellHookCommand("bash -c owned", {}),
    undefined,
  );
  assert.throws(() => h.parseCommandLine('"unterminated'));
});
const shell = {
  isWindows: () => false,
  getShellConfiguration: () => ({ executable: "/bin/sh", argsPrefix: ["-c"] }),
};
const permissionUtils = {
  matchCommandRule: () => false,
  matchFileRule: () => false,
};
const quote = (s: string) => "'" + s.replaceAll("'", "'\\''") + "'";
test("real owned child reads JSON stdin and command Hook returns modifiedInput", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "harness-generic-hook-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const script = join(root, "owned-hook.cjs");
  await writeFile(
    script,
    'let text="";process.stdin.on("data",b=>text+=b);process.stdin.on("end",()=>{const input=JSON.parse(text);process.stdout.write(JSON.stringify({hookSpecificOutput:{permissionDecision:"allow",modifiedInput:{received:input.session_id,hasSession:"session" in input}}}));});',
  );
  const host = createGenericHookHost({
    workDir: () => root,
    shell,
    permissionUtils,
    env: {},
  });
  t.after(() => host.close());
  const result = await host.executor.execute(
    `exec ${quote(process.execPath)} ${quote(script)}`,
    { session_id: "owned", session: { private: true } },
    { timeout: 3000 },
  );
  assert.equal(result.allowed, true);
  assert.deepEqual(result.modifiedInput, {
    received: "owned",
    hasSession: false,
  });
});
test("real detached owned child returns early and host cleanup terminates only its tracked child", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "harness-detached-hook-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const script = join(root, "owned-detached.cjs");
  await writeFile(
    script,
    "process.stdout.write(JSON.stringify({async:true,asyncTimeout:5000}));setInterval(()=>{},1000);",
  );
  let child: any;
  const { spawn } = await import("node:child_process");
  const host = createGenericHookHost({
    workDir: () => root,
    shell,
    permissionUtils,
    env: {},
    spawn: (...args: any[]) => {
      child = (spawn as any)(...args);
      return child;
    },
  });
  t.after(() => host.close());
  const result = await host.executor.execute(
    `exec ${quote(process.execPath)} ${quote(script)}`,
    {},
    { timeout: 3000 },
  );
  assert.equal(result.allowed, true);
  assert.equal(child.exitCode, null);
  const closed = once(child, "close");
  await host.close();
  await closed;
  assert.equal(child.signalCode, "SIGTERM");
});
test("real loopback HTTP strips session, interpolates only allowed header variables, and preserves blocking", async (t) => {
  let received: any;
  const server = createServer(async (req, res) => {
    let text = "";
    for await (const part of req) text += part;
    received = { headers: req.headers, input: JSON.parse(text) };
    res.setHeader("content-type", "application/json");
    res.end(
      '{"decision":"block","reason":"owned-http","hookSpecificOutput":{"additionalContext":"owned"}}',
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const addr = server.address() as any;
  const host = createGenericHookHost({
    workDir: () => "/owned",
    shell,
    permissionUtils,
    env: { PUBLIC: "owned", OTHER: "not-allowed" },
  });
  t.after(() => host.close());
  const result = await host.manager.executeHttpHook(
    {
      url: `http://127.0.0.1:${addr.port}/owned`,
      headers: { "x-owned": "$PUBLIC/${OTHER}" },
      allowedEnvVars: ["PUBLIC"],
    },
    { session_id: "owned", session: { private: true } },
    "Stop",
  );
  assert.equal(received.headers["x-owned"], "owned/");
  assert.deepEqual(received.input, { session_id: "owned" });
  assert.equal(result.allowed, false);
  assert.equal(result.blocking, true);
  assert.equal(result.message, "owned-http");
});
test("HTTP non-2xx, text, timeout and JSON-continue-false retain defensive native behavior", async (t) => {
  const f = fixture(t);
  for (const [response, allowed, blocking] of [
    [{ status: 503, text: "unavailable" }, true, undefined],
    [{ status: 200, text: "plain" }, true, undefined],
    [{ status: 200, text: '{"continue":false}' }, false, undefined],
    [
      { error: Object.assign(Error("owned-abort"), { name: "AbortError" }) },
      true,
      undefined,
    ],
  ] as any) {
    f.setHttpResult(response);
    const r = await f.manager.executeHttpHook(
      { url: "http://127.0.0.1:1/owned", timeout: 0.2 },
      {},
      "Stop",
    );
    assert.equal(r.allowed, allowed);
    assert.equal(r.blocking, blocking);
    if (response.error) assert.match(r.systemMessage, /200ms/);
  }
});
test("real SDK PromptHook clones evaluator, repairs tool history, uses RunState1, and restores parent purpose", async (t) => {
  const requests: any[] = [];
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" };
      yield {
        type: "output_text_delta",
        delta: '{"ok":false,"reason":"sdk-owned"}',
      };
      yield {
        type: "response_done",
        response: {
          id: "owned",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: [
            {
              type: "message",
              role: "assistant",
              id: "owned",
              status: "completed",
              content: [
                {
                  type: "output_text",
                  text: '{"ok":false,"reason":"sdk-owned"}',
                },
              ],
            },
          ],
        },
      } as any;
    },
  };
  const evaluator = new Agent({
    name: "owned-evaluator",
    instructions: "fixed-owned-instructions",
    model,
  });
  const runner = new Runner({
    modelProvider: { getModel: async () => model },
    tracingDisabled: true,
  });
  let evalState: any;
  const host = createGenericHookHost({
    workDir: () => "/owned",
    shell,
    permissionUtils,
    env: {},
    agentManager: {
      get: async () => evaluator,
      getModel: async () => ({ id: "owned-model" }),
    },
    runnerProvider: {
      get: async () => ({
        run: async (agent: any, state: any, opts: any) => {
          evalState = state;
          assert.equal(opts.maxTurns, 1);
          return runner.run(agent, state, opts);
        },
      }),
    },
  });
  t.after(() => host.close());
  const parent = new RunState(
    new RunContext({ owned: true }),
    [
      { type: "message", role: "user", content: "parent history" },
      { type: "custom-title", title: "excluded" },
      {
        type: "function_call",
        callId: "owned-call",
        name: "Read",
        arguments: "{}",
      },
    ] as any,
    evaluator,
    3,
  );
  const session: any = { state: parent, agentPurpose: "main" };
  const result = await host.promptService.execute(
    { prompt: "Evaluate" },
    { session, session_id: "owned", hook_event_name: "Stop" },
    { includeHistory: true },
  );
  assert.deepEqual(result, { ok: false, reason: "sdk-owned" });
  assert.equal(session.agentPurpose, "main");
  assert.equal(evalState._context, parent._context);
  assert.notEqual(evalState, parent);
  assert.equal(parent.history.length, 3);
  assert.equal(requests.length, 1);
  assert.ok(
    requests[0].input.some((x: any) => x.type === "function_call_result"),
  );
  assert.ok(!requests[0].input.some((x: any) => x.type === "custom-title"));
});
test("PromptHook history failure restores parent purpose and falls back to allow", async (t) => {
  const f = fixture(t);
  const agent = new Agent({ name: "owned", instructions: "owned" });
  f.promptService.agentManager = {
    get: async () => agent,
    getModel: async () => ({ id: "owned" }),
  };
  f.promptService.runnerProvider = {
    get: async () => ({
      run: async () => {
        throw Error("owned-run-failed");
      },
    }),
  };
  const session: any = {
    state: new RunState(new RunContext({}), [], agent, 1),
    agentPurpose: "main",
  };
  const result = await f.promptService.execute(
    { prompt: "owned" },
    { session, hook_event_name: "Stop" },
    { includeHistory: true },
  );
  assert.equal(result.ok, true);
  assert.match(result.reason, /owned-run-failed/);
  assert.equal(session.agentPurpose, "main");
});
