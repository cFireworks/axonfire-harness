import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { HarnessSession } from "../src/sessions/session.js";
import { CommandMessageUtils } from "../src/commands/command-message-utils.js";
import { CommandManager } from "../src/commands/command-manager.js";
import {
  WorkflowsCommandExecutor,
  SaveWorkflowCommandExecutor,
  formatElapsed,
} from "../src/commands/workflow-command-executors.js";
import { CommandAgentRunInterceptor } from "../src/agents/command-agent-run-interceptor.js";
import { WorkflowProgressEmitter } from "../src/workflow/workflow-progress-emitter.js";
import {
  WorkflowAcpBridge,
  WorkflowPrintModeHandler,
} from "../src/workflow/workflow-presentation.js";
import { StandaloneWorkflowRuntime } from "../src/runtime/standalone-workflow-runtime.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-workflow-presentation-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const noModel = {
  getModel() {
    throw new Error("local command must not call model");
  },
};
function text(item: any): string {
  return typeof item.content === "string"
    ? item.content
    : (item.content ?? []).map((part: any) => part.text ?? "").join("\n");
}
const output = (session: HarnessSession) =>
  session.history
    .map(text)
    .map((value) => CommandMessageUtils.parseOutput(value)?.text)
    .filter((value) => value !== undefined);
async function until(check: () => boolean | Promise<boolean>) {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("fixture timed out");
}
function fixtureModel(requests: any[]): Model {
  return {
    async getResponse() {
      return { usage: new Usage(), output: [] };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: `r-${requests.length}`,
          usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
          output: [
            {
              type: "message",
              id: `m-${requests.length}`,
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: "ok" }],
            },
          ],
        },
      } as any;
    },
  };
}
test("native message helpers preserve empty output, unescaped tags, truthy object args and parse priority", () => {
  assert.equal(
    text(
      CommandMessageUtils.buildInput(
        { name: "/save", args: [0, false, { x: 1 }, "<&>"] },
        {},
      ),
    ),
    '<command-name>/save</command-name><command-args>  {"x":1} <&></command-args>',
  );
  assert.deepEqual(
    CommandMessageUtils.parseOutput(text(CommandMessageUtils.buildEmpty())),
    { text: "", type: "COMMAND" },
  );
  assert.deepEqual(
    CommandMessageUtils.parseOutput(
      "<bash-stdout>out</bash-stdout><bash-stderr>err</bash-stderr>",
    ),
    { text: "err", type: "BASH" },
  );
  assert.deepEqual(
    CommandMessageUtils.parsePlanOutput(
      text(CommandMessageUtils.buildPlanOutput("/a", "line\nnext")),
    ),
    { filePath: "/a", content: "line\nnext" },
  );
  assert.equal(
    CommandMessageUtils.isSystemInternalMessage(
      "<system-reminder><user_query>x</user_query></system-reminder>",
    ),
    false,
  );
  assert.equal(formatElapsed(3661000), "61m1s");
});
test("Workflows/Save executors preserve usage flags and failed-list/history behavior", async () => {
  const warnings: string[] = [],
    session = new HarnessSession("session"),
    sessions = {
      addHistory: async () => {
        throw new Error("history failed");
      },
    },
    listing = new WorkflowsCommandExecutor(
      { listActive: () => [] },
      {
        list: async () => {
          throw new Error("unavailable");
        },
      },
      sessions,
      { warn: (message) => warnings.push(message) },
    );
  assert.equal(
    await listing.buildOutput(),
    "# Workflows\n\n## Running\n_(none)_\n\n## Saved\n_(none)_",
  );
  await listing.execute({ name: listing.name, args: [], session });
  assert.deepEqual(warnings, [
    "[/workflows] failed to append history: history failed",
  ]);
  const save = new SaveWorkflowCommandExecutor({} as any, sessions);
  assert.deepEqual(save.parseArgs(["run", "name", "--user", "--project"]), {
    scope: "project",
    runId: "run",
    name: "name",
  });
  assert.deepEqual(save.parseArgs(["run", "name", "--scope=no"]), {
    scope: "project",
    error: 'Invalid scope "no"; use "project" or "user".',
  });
  assert.match(
    await save.run({ name: save.name, args: [], session }),
    /full or 8-char prefix/,
  );
});
test("saved registry injection invalidates on every refresh, preserves conflicts and reports failure", async () => {
  const calls: string[] = [],
    warnings: string[] = [];
  let fail = false;
  const manager = new CommandManager(
    async () => ({
      commands: [{ name: "same", prompt: "custom", tags: ["custom"] }],
    }),
    { addHistory: async () => undefined },
    [],
    {
      workflowRegistry: {
        invalidate() {
          calls.push("invalidate");
        },
        async list() {
          calls.push("list");
          if (fail) throw new Error("scan");
          return [
            { name: "same", scope: "user" },
            { name: "saved", scope: "project" },
          ];
        },
      },
      logger: { warn: (line) => warnings.push(line) },
    },
  );
  await manager.refresh();
  assert.equal((await manager.get("/same"))!.prompt, "custom");
  assert.equal((await manager.get("/saved"))!.prompt, "");
  assert.equal(manager.isLocalCommand("/saved"), false);
  await manager.refresh();
  assert.deepEqual(calls, ["invalidate", "list", "invalidate", "list"]);
  fail = true;
  await manager.refresh();
  assert.equal(await manager.get("/saved"), undefined);
  assert.deepEqual(warnings, [
    "[CommandManager] failed to load saved workflows: scan",
  ]);
});
test("real harness local commands list live runs, save full IDs, refresh metadata and persist native four-item history", async (t) => {
  const root = await directory(t),
    harness = await createHarness({ workDir: root, modelProvider: noModel });
  t.after(() => harness.close());
  const session = await harness.openSession(),
    runtime = await harness.createWorkflowRuntime(session);
  const started = await runtime.manager.start(
    {
      script:
        'export const meta={name:"fixture",description:"description"}; return new Promise(resolve=>setTimeout(()=>resolve("ok"),150));',
    },
    { sessionId: session.id, cwd: root },
  );
  await harness.commandManager.executeLocalCommand({
    session,
    name: "/workflows",
    args: [],
  });
  await harness.sessions.flushHistory(session);
  assert.equal(session.history.length, 4);
  assert.equal(
    session.history.filter(
      (item) => text(item) === CommandMessageUtils.LOCAL_COMMAND_TIP,
    ).length,
    2,
  );
  assert.match(output(session)[0], new RegExp(started.runId.slice(0, 8)));
  await new Promise((resolve) => setTimeout(resolve, 170));
  await started.done;
  await until(
    async () =>
      !!(await stat(
        join(
          root,
          ".workbuddy-harness",
          "sessions",
          session.id,
          "workflows",
          "scripts",
          `${started.record.name}-wf_${started.runId}.js`,
        ),
      ).catch(() => false)),
  );
  await harness.commandManager.executeLocalCommand({
    session,
    name: "/save-workflow",
    args: [started.runId.slice(0, 8), "short"],
  });
  assert.match(output(session).at(-1), /Failed to save workflow:/);
  await harness.commandManager.executeLocalCommand({
    session,
    name: "/save-workflow",
    args: [started.runId, "saved", "--scope=user"],
  });
  assert.match(output(session).at(-1), /Dynamic workflow saved to/);
  assert.match(
    await readFile(
      join(root, ".workbuddy-harness", "workflows", "saved.js"),
      "utf8",
    ),
    /description/,
  );
  const command = await harness.commandManager.get("/saved");
  assert.deepEqual(command!.tags, ["dynamic-workflow"]);
  assert.equal(command!.prompt, "");
  assert.equal(harness.commandManager.parseCommand("/saved input"), undefined);
  assert.equal(
    (
      await harness.agents.getCommands(harness.agents.getDefaultAgentName())
    ).some((entry) => entry.name === "/saved"),
    false,
  );
  await harness.commandManager.executeLocalCommand({
    session,
    name: "/workflows",
    args: [],
  });
  assert.match(
    output(session).at(-1),
    /\*\*\/saved\*\* _\(user\)_ — description/,
  );
  await harness.close();
  const reopened = await createHarness({
    workDir: root,
    modelProvider: noModel,
  });
  t.after(() => reopened.close());
  const resumed = await reopened.openSession(session.id);
  assert.equal((await reopened.commandManager.get("/saved"))!.prompt, "");
  assert.match(JSON.stringify(resumed.history), /Dynamic workflow saved to/);
});
test("real SDK command interceptor renders custom commands before history/query wrapping and preserves source input", async (t) => {
  const root = await directory(t),
    requests: any[] = [],
    model = fixtureModel(requests),
    harness = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
      commands: [
        {
          name: "review",
          prompt: "Review $ARGUMENTS",
          tags: ["custom"],
          allowedTools: ["Read"],
        },
      ],
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  assert.equal(await harness.prompt(session, '/review "two words"'), "ok");
  const input = JSON.stringify(requests[0].input);
  assert.match(input, /<command-name>\/review<\/command-name>/);
  assert.match(input, /Review two words/);
  assert.equal(session.command!.name, "/review");
  assert.ok(session.requestOptions.allowedTools!.includes("Read"));
  assert.match(JSON.stringify(session.history), /providerData/);
  assert.match(JSON.stringify(session.history), /review \\\"two words/);
});
test("explicit host executors win over defaults; command prompt failures fall back without hiding MCP errors", async (t) => {
  const root = await directory(t);
  let executions = 0;
  const harness = await createHarness({
    workDir: root,
    modelProvider: noModel,
    commandExecutors: [
      {
        name: "/workflows",
        execute: async () => {
          executions++;
        },
      },
    ],
  });
  t.after(() => harness.close());
  const session = await harness.openSession();
  await harness.commandManager.executeLocalCommand({
    session,
    name: "/workflows",
    args: [],
  });
  assert.equal(executions, 1);
  assert.equal(output(session).length, 0);
  const errors: string[] = [],
    interceptor = new CommandAgentRunInterceptor(
      {} as any,
      async () => ({}),
      { render: async () => "", processContent: async (value) => value },
      {
        render() {
          throw new Error("bad template");
        },
      },
      {
        async render() {
          throw new Error("MCP unavailable");
        },
      },
      { error: (message) => errors.push(message) },
    );
  assert.equal(await interceptor.safeRender("raw"), "raw");
  assert.deepEqual(errors, ["Failed to render prompt: raw"]);
  const items = [{ type: "message", role: "user", content: "/mcp arg" }];
  await assert.rejects(
    interceptor.handleCommands(items, [
      { name: "/mcp", prompt: "template", tags: ["mcp-prompt"] },
    ]),
    /MCP unavailable/,
  );
});
test("real SDK skill shorthand expands bare names, session variables and keeps native undefined base directory", async (t) => {
  const root = await directory(t),
    requests: any[] = [],
    model = fixtureModel(requests),
    harness = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
      skills: [
        {
          name: "inspect",
          instructions:
            "Use $ARGUMENTS ${CODEBUDDY_SESSION_ID} ${CLAUDE_SESSION_ID}",
        },
      ],
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  assert.equal(await harness.prompt(session, "inspect target"), "ok");
  const input = JSON.stringify(requests[0].input);
  assert.match(input, /Base directory for this skill: undefined/);
  assert.ok(input.includes(`Use target ${session.id} ${session.id}`));
  assert.equal(session.command, undefined);
});
test("real SDK saved metadata does not magically dispatch Workflow or become a local executor", async (t) => {
  const root = await directory(t);
  await mkdir(join(root, ".codebuddy", "workflows"), { recursive: true });
  await writeFile(
    join(root, ".codebuddy", "workflows", "saved.js"),
    'export const meta={description:"saved"}; return 1;',
  );
  const requests: any[] = [],
    model = fixtureModel(requests),
    harness = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  assert.equal(await harness.prompt(session, "/saved args"), "ok");
  assert.equal((await harness.commandManager.get("/saved"))!.prompt, "");
  assert.match(JSON.stringify(requests[0].input), /\/saved args/);
  assert.doesNotMatch(
    JSON.stringify(requests[0].input),
    /Run the saved Dynamic Workflow/,
  );
  assert.equal(harness.tools.getBackgroundTasks().length, 0);
});
test("explicit nonempty dynamic command preserves exact Workflow instruction while empty prompt stays dormant", async () => {
  const command = {
      name: "/saved",
      prompt: "present",
      tags: ["dynamic-workflow"],
    },
    interceptor = new CommandAgentRunInterceptor(
      {} as any,
      async () => ({}),
      {} as any,
      {} as any,
      {} as any,
    ),
    items = [{ type: "message", role: "user", content: '/saved a "quote"' }];
  assert.equal(
    interceptor.isCommand("/saved arg", { ...command, prompt: "" }),
    false,
  );
  await interceptor.handleCommands(items, [command]);
  assert.match(text(items[0]), /"args": "a \\"quote\\""/);
  assert.match(text(items[0]), /Do not run any other tool first/);
  assert.equal(interceptor.isCommand("/saved\targ", command), false);
});
test("print handler keeps zero/empty fields, omits private output, is idempotent and handles writer errors only", () => {
  const emitter = new WorkflowProgressEmitter(),
    lines: string[] = [],
    warnings: string[] = [],
    handler = new WorkflowPrintModeHandler(emitter, {
      warn: (line) => warnings.push(line),
    });
  handler.setWriter({ write: (line) => lines.push(line) });
  handler.install();
  handler.install();
  const event = {
    kind: "workflow_agent_cached",
    runId: "run",
    agent: {
      key: "key",
      label: "",
      phase: "",
      error: "",
      tokens: 0,
      cached: true,
      text: "private",
    },
  };
  emitter.emit(event);
  assert.deepEqual(JSON.parse(lines[0]!), {
    type: "workflow",
    kind: event.kind,
    runId: "run",
    key: "key",
    label: "",
    phase: "",
    error: "",
    tokens: 0,
    cached: true,
  });
  handler.setWriter({
    write() {
      throw new Error("write failed");
    },
  });
  handler.printEvent(event);
  assert.deepEqual(warnings, [
    "[WorkflowPrintModeHandler] write failed: write failed",
  ]);
  assert.throws(
    () =>
      handler.printEvent({ ...event, agent: { ...event.agent, tokens: 1n } }),
    /BigInt/,
  );
  handler.dispose();
  handler.dispose();
  emitter.emit(event);
  assert.equal(warnings.length, 1);
});
test("ACP bridge follows current session rather than run owner, drops missing context and catches asynchronous writes", async () => {
  const emitter = new WorkflowProgressEmitter(),
    updates: any[] = [],
    warnings: string[] = [];
  let current: HarnessSession | undefined,
    fail = false;
  const handler = new WorkflowAcpBridge(
    emitter,
    { getCurrent: () => current },
    () => ({
      get: (id) => ({
        getConnection: () => ({
          sessionUpdate: async (value) => {
            updates.push([id, value]);
            if (fail) throw new Error("send failed");
          },
        }),
      }),
    }),
    { warn: (line) => warnings.push(line) },
  );
  handler.install();
  handler.install();
  const event = {
    kind: "workflow_phase_started",
    runId: "belongs-to-other",
    phase: "phase",
  };
  emitter.emit(event);
  assert.equal(updates.length, 0);
  current = new HarnessSession("current", {
    meta: { acpConnectionId: "connection" },
  });
  emitter.emit(event);
  assert.equal(updates[0][1].sessionId, "current");
  assert.deepEqual(updates[0][1].update, {
    sessionUpdate: "session_info_update",
    _meta: {
      "codebuddy.ai/workflowEventKind": event.kind,
      "codebuddy.ai/workflowRunId": "belongs-to-other",
      "codebuddy.ai/workflowPhase": "phase",
    },
  });
  fail = true;
  emitter.emit(event);
  await until(() => warnings.length === 1);
  assert.match(warnings[0]!, /dispatch failed: send failed/);
  handler.dispose();
  emitter.emit(event);
  assert.equal(updates.length, 2);
});
test("ACP missing DI/current/connection returns silently and print subscription is not installed by default", async (t) => {
  const handler = new WorkflowAcpBridge(
    undefined,
    {
      getCurrent() {
        throw new Error("no ALS");
      },
    },
    () => {
      throw new Error("missing DI");
    },
  );
  assert.equal(handler.resolveSession(), undefined);
  await handler.send("connection", "session", {});
  handler.install();
  handler.dispose();
  const root = await directory(t),
    runtime = new StandaloneWorkflowRuntime({
      stateDir: root,
      cwd: () => root,
      parentSessionId: "session",
      spawner: {
        spawn: async () => {
          throw new Error("no spawn expected");
        },
      },
    });
  t.after(() => runtime.close());
  assert.equal(runtime.printHandler, undefined);
  assert.equal(runtime.acpBridge, undefined);
});
test("harness event writer/ACP adapters observe native execution and are disposed on close", async (t) => {
  const root = await directory(t),
    lines: string[] = [],
    updates: any[] = [],
    harness = await createHarness({
      workDir: root,
      modelProvider: noModel,
      workflowEventWriter: { write: (line) => lines.push(line) },
      getWorkflowAcpAgentManager: () => ({
        get: () => ({
          getConnection: () => ({
            sessionUpdate: (value) => updates.push(value),
          }),
        }),
      }),
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  session.meta.acpConnectionId = "connection";
  const runtime = await harness.createWorkflowRuntime(session);
  const started = await harness.sessions.run(session, () =>
    runtime.manager.start(
      { script: 'await phase("one"); return 42;' },
      { sessionId: session.id, cwd: root },
    ),
  );
  await started.done;
  assert.deepEqual(
    lines.map((line) => JSON.parse(line).kind),
    ["workflow_run_started", "workflow_phase_started", "workflow_run_finished"],
  );
  assert.equal(updates.length, 3);
  assert.ok(updates.every((value) => value.sessionId === session.id));
  await harness.close();
  runtime.emitter.emit({ kind: "unknown" });
  assert.equal(lines.length, 3);
});
test(
  "CLI print-mode local Workflow commands compile/run with no model endpoint or network request",
  { timeout: 10000 },
  async (t) => {
    const root = await directory(t),
      entry = new URL(
        `../src/cli.${import.meta.url.endsWith(".ts") ? "ts" : "js"}`,
        import.meta.url,
      ),
      args = [
        ...(import.meta.url.endsWith(".ts")
          ? ["--import", import.meta.resolve("tsx")]
          : []),
        entry.pathname,
        "--cwd",
        root,
        "--base-url",
        "http://127.0.0.1:1/v1",
        "--model",
        "fixture",
        "-p",
      ],
      options = {
        cwd: root,
        timeout: 7000,
        env: { ...process.env, CODEBUDDY_API_KEY: "fixture-not-real" },
      };
    const listing = await promisify(execFile)(
      process.execPath,
      [...args, "/workflows"],
      options,
    );
    assert.match(listing.stdout, /# Workflows\n\n## Running\n_\(none\)_/);
    assert.doesNotMatch(listing.stdout, /\[object Object\]/);
    const save = await promisify(execFile)(
      process.execPath,
      [...args, "/save-workflow"],
      options,
    );
    assert.match(save.stdout, /\*\*Usage:\*\* `/);
    assert.doesNotMatch(save.stderr, /ECONNREFUSED/);
  },
);
