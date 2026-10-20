import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { HarnessSession } from "../src/sessions/session.js";
import { WorkflowManager } from "../src/workflow/workflow-manager.js";
import { PauseGate } from "../src/workflow/pause-gate.js";
import { StaticBuiltinWorkflowProvider } from "../src/workflow/builtin-workflow-provider.js";
import { isWorkflowDisabled } from "../src/workflow/workflow-feature.js";
import {
  WorkflowTool,
  workflowParameters,
} from "../src/tools/workflow-tool.js";
import { TruncateBuffer } from "../src/tools/truncate-buffer.js";
import {
  BackgroundTaskRegistry,
  type ProductBackgroundTask,
} from "../src/tools/background-task-registry.js";
import { BackgroundTaskNotifier } from "../src/agents/background-task-notifier.js";
import { MessageQueueManager } from "../src/sessions/message-queue-manager.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { StandaloneWorkflowRuntime } from "../src/runtime/standalone-workflow-runtime.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-workflow-control-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
async function until(check: () => unknown | Promise<unknown>) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(10);
  }
  throw new Error("Workflow control fixture timed out");
}
function task(
  overrides: Partial<ProductBackgroundTask> = {},
): ProductBackgroundTask {
  return {
    id: "task",
    toolName: "Workflow",
    title: 'a < "workflow"',
    startTime: Date.now(),
    status: "running",
    sessionId: "main",
    stdout: new TruncateBuffer(),
    stderr: new TruncateBuffer(),
    kill: async () => undefined,
    ...overrides,
  };
}
test("PauseGate preserves idempotence, abort removal and the unpaused-aborted distinction", async () => {
  const gate = new PauseGate(),
    aborted = new AbortController();
  aborted.abort();
  await gate.waitIfPaused(aborted.signal);
  assert.equal(gate.pause(), true);
  assert.equal(gate.pause(), false);
  await assert.rejects(gate.waitIfPaused(aborted.signal), /aborted/);
  const controller = new AbortController(),
    waiting = gate.waitIfPaused(controller.signal);
  controller.abort();
  await assert.rejects(waiting, /aborted/);
  assert.equal(gate.resume(), true);
  assert.equal(gate.resume(), false);
  gate.pause();
  const resumed = gate.waitIfPaused();
  gate.resume();
  await resumed;
});
test("Manager attaches real execution, pauses future spawns, records details before dispose and emits final event", async (t) => {
  const root = await directory(t),
    events: any[] = [];
  let release!: () => void,
    calls = 0;
  const runtime = new StandaloneWorkflowRuntime({
    stateDir: root,
    cwd: () => root,
    parentSessionId: "main",
    spawner: {
      spawn: async () => {
        calls++;
        if (calls === 1)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return { text: "answer", tokens: 3 };
      },
    },
  });
  t.after(() => runtime.close());
  runtime.emitter.on((event) => events.push(event.kind));
  const started = await runtime.manager.start(
    {
      script:
        'await phase("one"); await agent("first"); return agent("second");',
      args: "description",
    },
    { sessionId: "main", cwd: root },
  );
  await until(() => calls === 1);
  assert.equal(runtime.manager.pause(started.runId), true);
  release();
  await sleep(20);
  assert.equal(calls, 1);
  assert.equal(runtime.manager.listActive()[0]!.paused, true);
  assert.equal(runtime.manager.resume(started.runId), true);
  const record = await started.done;
  assert.equal(record.status, "completed");
  assert.equal(record.description, "description");
  const detail = await runtime.manager.getRunDetail(
    "ignored-session",
    started.runId,
  );
  assert.equal(detail!.agents.length, 2);
  assert.equal(runtime.manager.listActive().length, 0);
  assert.equal(runtime.manager.recent[0]!.detail.agents.length, 2);
  assert.equal(events.at(-1), "workflow_run_finished");
  assert.equal(runtime.manager.pause("missing"), false);
});
test("Manager snapshot deduplicates by content hash, saveAs refreshes registry and rejects reserved leading names", async (t) => {
  const root = await directory(t);
  let finish!: () => void;
  const runtime = new StandaloneWorkflowRuntime({
    stateDir: root,
    cwd: () => root,
    parentSessionId: "main",
    spawner: {
      spawn: () =>
        new Promise((resolve) => {
          finish = () => resolve({ text: "done" });
        }),
    },
  });
  t.after(() => runtime.close());
  const started = await runtime.manager.start(
    { script: 'return agent("wait")' },
    { sessionId: "main", cwd: root },
  );
  await until(
    () => runtime.manager.active.get(started.runId)?.record.scriptPath,
  );
  const path = runtime.manager.snapshotPath("main", started.runId);
  assert.equal((await stat(path)).mode & 0o777, 0o600);
  const result = await runtime.manager.saveAs(
    "main",
    started.runId,
    "saved",
    "project",
  );
  assert.match(await readFile(result.targetPath, "utf8"), /agent/);
  assert.ok(await runtime.registry.find("saved"));
  await assert.rejects(
    runtime.manager.saveAs("main", started.runId, "_leading", "user"),
    /Invalid workflow name/,
  );
  const hash = (
    await runtime.resolver.resolve({ script: 'return agent("wait")' })
  ).provenance.contentHash;
  assert.equal(
    await runtime.manager.findExistingScriptByHash(
      runtime.manager.paths.scriptsDir("main"),
      `inline-${hash.slice(0, 6)}`,
      hash,
    ),
    path,
  );
  finish();
  await started.done;
});
test("Manager restart invalidates without launching replacement, recent cap is 50 and description priority is native", async (t) => {
  const root = await directory(t),
    runtime = new StandaloneWorkflowRuntime({
      stateDir: root,
      cwd: () => root,
      parentSessionId: "main",
      spawner: { spawn: async () => ({ text: "unused" }) },
    });
  t.after(() => runtime.close());
  const manager = runtime.manager,
    calls: any[] = [];
  const fake: any = {
    abortAgent: (...args: any[]) => {
      calls.push(args);
      return false;
    },
    markAgentInvalidated: (...args: any[]) => calls.push(args),
  };
  manager.active.set("run", {
    record: {} as any,
    abortController: new AbortController(),
    pauseGate: new PauseGate(),
    execution: fake,
    done: undefined,
  });
  assert.equal(manager.restartAgent("run", "key"), true);
  assert.deepEqual(calls, [
    ["key", "user-restart"],
    ["key", "user-restart"],
  ]);
  manager.active.delete("run");
  for (let index = 0; index < 55; index++)
    manager.finalizeRun(String(index), {
      runId: String(index),
      name: "x",
      contentHash: "hash",
      startedAt: index,
      status: "completed",
      phaseCount: 0,
      agentCount: 0,
      cachedAgentCount: 0,
    });
  assert.equal(manager.listRecent().length, 50);
  assert.equal(manager.listRecent()[0]!.runId, "54");
  assert.equal(
    manager.deriveDescription({ description: "meta" }, "input", "script"),
    "meta",
  );
  assert.equal(
    manager.deriveDescription({}, { question: "x".repeat(201) }, "script")!
      .length,
    200,
  );
});
test("Builtin provider filters suffix, uses meta name/description, coalesces discovery and keeps a sticky cache", async (t) => {
  const root = await directory(t);
  await writeFile(
    join(root, "first.workflow.js"),
    'const meta={name:"named",description:"sample"};return 1',
  );
  await writeFile(join(root, "ignored.js"), "return 2");
  const provider = new StaticBuiltinWorkflowProvider(() => root),
    [a, b] = await Promise.all([provider.list(), provider.list()]);
  assert.equal(a, b);
  assert.equal(a[0]!.name, "named");
  await writeFile(join(root, "new.workflow.js"), "return 3");
  assert.equal((await provider.list()).length, 1);
});
test("Workflow schema locks args to string, uses strict unknown-key errors and retains native enable gate", async () => {
  assert.equal(
    workflowParameters.safeParse({ script: "return 1", args: {} }).success,
    false,
  );
  assert.equal(
    workflowParameters.safeParse({ script: "return 1", unknown: 1 }).success,
    false,
  );
  assert.equal(
    workflowParameters.safeParse({ script: "", name: "also" }).success,
    true,
  );
  const previous = process.env.CODEBUDDY_DISABLE_WORKFLOWS;
  try {
    process.env.CODEBUDDY_DISABLE_WORKFLOWS = "0";
    assert.equal(
      await isWorkflowDisabled({ get: async () => true as any }),
      true,
    );
    assert.equal(
      await isWorkflowDisabled({ get: async () => "true" as any }),
      false,
    );
    process.env.CODEBUDDY_DISABLE_WORKFLOWS = "1";
    assert.equal(
      await isWorkflowDisabled({
        get: async () => {
          throw new Error("not called");
        },
      }),
      true,
    );
  } finally {
    if (previous === undefined) delete process.env.CODEBUDDY_DISABLE_WORKFLOWS;
    else process.env.CODEBUDDY_DISABLE_WORKFLOWS = previous;
  }
});
test("TruncateBuffer keeps source head/tail marker, line count and zero-tail slicing quirk", () => {
  const buffer = new TruncateBuffer(2, 3);
  buffer.push("ab\r\ncd\ne");
  assert.equal(buffer.getHead(), "ab");
  assert.equal(buffer.getTail(), "d\ne");
  assert.equal(buffer.getTotalLines(), 2);
  assert.match(buffer.toString(), /truncated 3 bytes/);
  const zero = new TruncateBuffer(0, 0);
  zero.push("kept");
  assert.equal(zero.getTail(), "kept");
  buffer.clear();
  assert.equal(buffer.isEmpty(), true);
});
test("Generic background registry prunes only notified terminal entries after TTL and mirrors native kill status", async () => {
  const registry = new BackgroundTaskRegistry();
  try {
    const old = Date.now() - 300001;
    registry.addBackgroundTask(
      task({ id: "old", status: "completed", notified: true, startTime: old }),
    );
    registry.addBackgroundTask(
      task({ id: "unnotified", status: "completed", startTime: old }),
    );
    registry.cleanupTerminalBackgroundTasks();
    assert.equal(registry.getBackgroundTask("old"), undefined);
    assert.ok(registry.getBackgroundTask("unnotified"));
    registry.addBackgroundTask(task());
    assert.equal(await registry.killBackgroundTask("task"), true);
    assert.equal(registry.getBackgroundTask("task")!.status, "killed");
    assert.equal(await registry.killBackgroundTask("missing"), false);
  } finally {
    registry.dispose();
  }
});
test("Notifier escapes XML, assigns meta message id, deduplicates and schedules only one idle drain", async () => {
  const queue = new MessageQueueManager(),
    state = new SessionRunStateMachine(),
    session = new HarnessSession("main");
  let drains = 0;
  const notifier = new BackgroundTaskNotifier(queue, state, () => ({
      runDefault: async () => {
        drains++;
      },
    })),
    value = task({
      status: "completed",
      toolUseId: 'a<"',
      outputFilePath: "/a&b",
    });
  notifier.notifyCompletion(value, session);
  notifier.notifyCompletion(value, session);
  assert.equal(session.queue.length, 1);
  assert.ok(session.queue[0]!.id);
  assert.equal(session.queue[0]!.providerData?.isMeta, true);
  assert.match(JSON.stringify(session.queue), /&lt;|&amp;/);
  await Promise.resolve();
  assert.equal(drains, 1);
  assert.equal(
    notifier.buildSummary(task({ status: "cancelled" })),
    'Dynamic workflow "a < "workflow"" was stopped',
  );
});
test("Workflow tool starts in background, correlates callId and TaskOutput/Stop use generic registry", async (t) => {
  const root = await directory(t),
    harness = await createHarness({
      workDir: root,
      modelProvider: {
        getModel: () => {
          throw new Error("no model expected");
        },
      },
      approveTool: () => true,
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  session.status = "model_streaming";
  const response = await (await harness.tools.get("Workflow"))!.execute(
    { script: "return new Promise(() => {})", args: "input" },
    { context: session },
    { toolCall: { callId: "workflow-call" } },
  );
  const runId = JSON.parse((response as any).renderer.value).runId,
    registered = harness.tools.getBackgroundTask(runId)!;
  assert.equal(registered.toolUseId, "workflow-call");
  assert.equal(registered.status, "running");
  assert.match(
    (await harness.taskOutputTools.output({ task_id: runId }, session)).content,
    /Workflow Run ID/,
  );
  assert.match(
    (await harness.taskOutputTools.stop({ task_id: runId })).content,
    /Cleanup completed/,
  );
  await until(() => registered.status === "cancelled");
  assert.equal(registered.notified, true);
  assert.equal(session.queue.length, 0);
});
test(
  "Actual SDK original deferred path starts Workflow, child finishes, notification wakes leader and output persists",
  { timeout: 10000 },
  async (t) => {
    const root = await directory(t),
      scheduled: string[] = [];
    let parent = 0,
      child = 0,
      release!: () => void;
    const childGate = new Promise<void>((resolve) => {
        release = resolve;
      }),
      requests: any[] = [];
    const model: Model = {
      getResponse: async () => ({ output: [], usage: new Usage() }),
      async *getStreamedResponse(request) {
        requests.push(request);
        const isChild = JSON.stringify(request.input).includes("[wf-child]");
        let output: any[];
        if (isChild) {
          child++;
          await childGate;
          output = [
            {
              type: "message",
              role: "assistant",
              id: "child-answer",
              status: "completed",
              content: [{ type: "output_text", text: "child result" }],
            },
          ];
        } else if (parent++ === 0)
          output = [
            {
              type: "function_call",
              id: "workflow",
              callId: "workflow",
              name: "DeferExecuteTool",
              arguments: JSON.stringify({
                toolName: "Workflow",
                params: {
                  script: 'return agent("work", {label:"wf-child"})',
                  args: "input",
                },
              }),
              status: "completed",
            },
          ];
        else
          output = [
            {
              type: "message",
              role: "assistant",
              id: `parent-${parent}`,
              status: "completed",
              content: [
                {
                  type: "output_text",
                  text:
                    parent === 2
                      ? "background started"
                      : "workflow notification handled",
                },
              ],
            },
          ];
        yield {
          type: "response_done",
          response: {
            id: `response-${requests.length}`,
            usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
            output,
          },
        } as any;
      },
    };
    const harness = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
      approveTool: () => true,
      onScheduledOutput: (value) => scheduled.push(value),
    });
    t.after(() => harness.close());
    assert.equal(
      harness.product.defaultAgent.tools!.includes("Workflow"),
      false,
    );
    // Explicit test-only exposure; captured product files/allowlists are unchanged.
    harness.product.defaultAgent.tools!.push("Workflow");
    await harness.tools.ensureBuiltinDeferIndexed("Workflow");
    const session = await harness.openSession();
    assert.equal(
      await harness.prompt(session, "start workflow"),
      "background started",
    );
    await until(() => child === 1);
    const background = harness.tools
      .getBackgroundTasks()
      .find((entry) => entry.toolName === "Workflow")!;
    assert.equal(background.status, "running");
    release();
    await until(() => scheduled.includes("workflow notification handled"));
    assert.equal(background.status, "completed");
    assert.match(
      await readFile(background.outputFilePath!, "utf8"),
      /^child result\n\n\[Agent ID: agent-[a-f0-9]{8}\]$/,
    );
    assert.match(JSON.stringify(session.history), /task-notification/);
    assert.match(
      JSON.stringify(requests.at(-1).input),
      /IMPORTANT: Before responding/,
    );
    const runtime = await harness.createWorkflowRuntime(session);
    assert.equal(
      (await runtime.manager.getRunDetail(session.id, background.id))!.agents
        .length,
      1,
    );
    assert.equal(harness.taskManager.getTasks().length, 0);
  },
);
test("Harness closes an active Workflow tool run and flushes final output/notification without a new model turn", async (t) => {
  const root = await directory(t),
    harness = await createHarness({
      workDir: root,
      modelProvider: {
        getModel: () => {
          throw new Error("no model");
        },
      },
      approveTool: () => true,
    });
  t.after(() => harness.close());
  const session = await harness.openSession(),
    response = await harness.workflowTool.execute(
      { script: "return new Promise(() => {})" },
      { context: session } as any,
    ),
    runId = JSON.parse(response.renderer.value).runId;
  await harness.close();
  assert.equal(harness.tools.getBackgroundTask(runId)!.status, "cancelled");
  assert.ok(harness.tools.getBackgroundTask(runId)!.outputFilePath);
});
test("Disabled Workflow is denied even through direct/deferred target dispatch and does not change original allowlists", async (t) => {
  const root = await directory(t),
    harness = await createHarness({
      workDir: root,
      modelProvider: {
        getModel: () => {
          throw new Error("must not start model");
        },
      },
      approveTool: () => true,
      settings: {
        get: async (key) =>
          key === "disableWorkflows" ? (true as any) : undefined,
      },
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  assert.equal(await harness.workflowTool.isEnabled(session), false);
  await assert.rejects(
    Promise.resolve(
      (await harness.tools.get("Workflow"))!.execute(
        { script: "return 1" },
        { context: session },
      ),
    ),
    /disabled by environment or settings/,
  );
  assert.equal(harness.product.defaultAgent.tools!.includes("Workflow"), false);
  assert.equal(harness.tools.getBackgroundTasks().length, 0);
  assert.equal((harness.tools as any).handlers.size, 47);
});
test(
  "A fresh OS process resumes a saved Workflow journal without any model call",
  { timeout: 10000 },
  async (t) => {
    const root = await directory(t),
      harness = await createHarness({
        workDir: root,
        modelProvider: {
          getModel: () => {
            throw new Error("cache fixture has no model");
          },
        },
      });
    t.after(() => harness.close());
    const session = await harness.openSession(),
      runtime = await harness.createWorkflowRuntime(session);
    await harness.sessions.addHistory(session, [
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "journal fixture parent" }],
      },
    ]);
    // Seed through native runner/durability, substituting only the external model.
    runtime.factory.spawner.spawn = async () => ({
      text: "persisted",
      tokens: 2,
    });
    const script = 'return agent("same work")',
      first = await runtime.manager.start(
        { script },
        { sessionId: session.id, cwd: root },
      );
    assert.equal((await first.done).output, "persisted");
    await harness.close();
    const entry = new URL(
      `../src/runtime/create-harness.${import.meta.url.endsWith(".ts") ? "ts" : "js"}`,
      import.meta.url,
    ).href;
    const code = `import {createHarness} from ${JSON.stringify(entry)}; const h=await createHarness({workDir:${JSON.stringify(root)},modelProvider:{getModel(){throw Error("unexpected model call")}}});try{const s=await h.openSession(${JSON.stringify(session.id)}),w=await h.createWorkflowRuntime(s),r=await w.manager.start({script:${JSON.stringify(script)},resumeFromRunId:${JSON.stringify(first.runId)}},{sessionId:s.id,cwd:${JSON.stringify(root)}});const result=await r.done;process.stdout.write(JSON.stringify({status:result.status,output:result.output,cached:result.cachedAgentCount}));}finally{await h.close()}`;
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        ...(import.meta.url.endsWith(".ts")
          ? ["--import", import.meta.resolve("tsx")]
          : []),
        "--input-type=module",
        "-e",
        code,
      ],
      { cwd: root, timeout: 8000 },
    );
    assert.deepEqual(JSON.parse(stdout), {
      status: "completed",
      output: "persisted",
      cached: 1,
    });
  },
);
