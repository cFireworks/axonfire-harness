import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EventEmitter } from "node:events";
import { setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { z } from "zod";
import { createHarness } from "../src/runtime/create-harness.js";
import { HarnessSession } from "../src/sessions/session.js";
import { TaskStorageService } from "../src/tasks/task-storage-service.js";
import { FileLockService } from "../src/tasks/file-lock-service.js";
import { AgentTaskManager, shouldDeliverFrameworkNotification, type ManagedAgentTask } from "../src/agents/agent-task-manager.js";
import { TaskTools, generateActiveForm, tasksToTodos, resolveTaskSessionId } from "../src/tools/task-tools.js";
import { AgentTool, agentParameters } from "../src/tools/agent-tool.js";
import { TaskOutputTools, taskOutputParameters, taskStopParameters, formatTaskDuration } from "../src/tools/task-output-tools.js";
import { BackgroundTaskManager, BoundedOutput } from "../src/tools/core-shell-tools.js";

setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) { const path = await mkdtemp(join(tmpdir(), "harness-task-recovery-")); t.after(() => rm(path, { recursive: true, force: true })); return path; }

test("task storage preserves numeric/preferred ids, atomic file shape and metadata merge/delete", async (t) => {
  const path = await directory(t);
  const storage = new TaskStorageService(join(path, "tasks"));
  const input = { subject: "Run tests", description: "Verify", status: "pending" as const, metadata: { a: 1, remove: true } };
  const created = await Promise.all(Array.from({ length: 20 }, () => storage.create("session", input)));
  assert.deepEqual(created.map((task) => task.id), Array.from({ length: 20 }, (_, index) => String(index + 1)));
  assert.equal((await storage.create("session", input, 30)).id, "30");
  assert.equal((await storage.create("session", input, 30)).id, "31");
  const update = { addBlocks: ["2", "2"], addBlockedBy: ["3"], metadata: { remove: null, b: 2 } };
  const changed = await storage.update("session", "1", update);
  assert.deepEqual(changed?.blocks, ["2"]);
  assert.deepEqual(changed?.metadata, { a: 1, b: 2 });
  assert.deepEqual(update, {});
  await writeFile(join(path, "tasks", "session", "broken.json"), "{");
  await writeFile(join(path, "tasks", "session", "99.tmp.ignore.json"), "{}");
  const restored = new TaskStorageService(join(path, "tasks"));
  assert.equal((await restored.list("session")).length, 22);
  assert.equal((await restored.get("session", "1"))?.id, "1");
  assert.equal(await restored.delete("session", "1"), true);
  assert.equal(await restored.delete("session", "1"), false);
});

test("file locks share the product mkdir/lock.json protocol and recover expired locks", async (t) => {
  const path = await directory(t), locks = new FileLockService(path);
  const release = await locks.acquireFileLock("task-storage-fixture", { retryDelay: 1 });
  const record = JSON.parse(await readFile(join(path, "task-storage-fixture.lock", "lock.json"), "utf8"));
  assert.equal(record.pid, process.pid);
  let acquired = false;
  const next = locks.acquireFileLock("task-storage-fixture").then((unlock) => { acquired = true; return unlock; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(acquired, false);
  await release();
  await (await next)();
  await mkdir(join(path, "expired.lock"));
  await writeFile(join(path, "expired.lock", "lock.json"), JSON.stringify({ timestamp: 1, pid: process.pid }));
  await (await locks.acquireFileLock("expired", { staleTimeout: 1 }))();
  assert.equal(locks.sanitizePath("abc/def?"), "abc-def-");
});

test("Task CRUD preserves scope, preferred ordinal, blockers, todo visibility and hook payload", async (t) => {
  const path = await directory(t), events: unknown[] = [];
  const tools = new TaskTools(new TaskStorageService(path), { executeTaskCreatedHooks: async (_session, data) => { events.push(data); } });
  const session = new HarnessSession("main");
  session.history = [{ type: "function_call", callId: "create-1", name: "TaskCreate", arguments: "{}" }, { type: "function_call", callId: "create-2", name: "TaskCreate", arguments: "{}" }] as any;
  const created = await tools.create({ subject: "Run tests", description: "Verify recovery", owner: "tester" }, session, "create-2");
  assert.match(created.content, /^Task #2 created/);
  assert.deepEqual(events, [{ taskId: "2", subject: "Run tests", description: "Verify recovery", teammateName: "tester" }]);
  await tools.create({ subject: "Write docs", description: "Document" }, session);
  await tools.update({ taskId: "3", addBlockedBy: ["2", "999"], metadata: { a: 1 } }, session);
  assert.match((await tools.list({}, session)).content, /#3 \[pending\] Write docs \[blocked by: 2\]/);
  await tools.update({ taskId: "2", status: "completed" }, session);
  assert.ok(!(await tools.list({}, session)).content.includes("blocked by"));
  const child = new HarnessSession("child", { meta: { parentSessionId: session.id } });
  assert.match((await tools.get({ taskId: "2" }, child)).content, /Subject: Run tests/);
  assert.equal((await tools.update({ taskId: "3" }, child) as any).error, "No updates");
  const completed = await tools.update({ taskId: "3", status: "completed" }, child) as any;
  assert.deepEqual(completed.rawResponse.todos, []);
  assert.equal((await tools.update({ taskId: "3", status: "deleted" }, child)).content, "Task 3 deleted successfully");
  await assert.rejects(tools.create({ subject: "  ", description: "x" }, session), /subject.*cannot be empty/);
  assert.equal((await tools.get({ taskId: "missing" }, session) as any).error, "Task not found");
  assert.equal((await tools.list({}) as any).error, "Missing session");
  assert.equal(generateActiveForm("Write docs"), "Writing docs");
  assert.equal(generateActiveForm("Run tests"), "Running tests");
  assert.equal(generateActiveForm("See logs"), "Seeing logs");
  assert.equal(resolveTaskSessionId(child), "main");
  assert.deepEqual(tasksToTodos([]), []);
});

function fakeTask(id: string, status: ManagedAgentTask["status"] = "pending"): ManagedAgentTask {
  const events = new EventEmitter();
  const task: ManagedAgentTask = { id, mainSessionId: "main", status, startTime: Date.now(), title: "fixture", agentType: "Explore", description: "Inspect files", prompt: "inspect", toolCallHistory: [],
    kill() { const oldStatus = task.status; task.status = "killed"; events.emit("status", { task, oldStatus, newStatus: task.status }); },
    cancel() { const oldStatus = task.status; task.status = "cancelled"; events.emit("status", { task, oldStatus, newStatus: task.status }); },
    onStatusChange(listener) { events.on("status", listener); } };
  return task;
}
test("AgentTaskManager resolves completion/cancel waiters, aliases, TTL and notification text", async () => {
  const manager = new AgentTaskManager();
  const task = fakeTask("agent-fixture");
  manager.registerTask(task);
  const first = manager.waitFor(task.id, 1000), second = manager.waitFor(task.id, 1000);
  await manager.cancel(task.id);
  assert.equal((await first).status, "cancelled");
  assert.equal(await second, task);
  const pending = fakeTask("pending");
  manager.registerTask(pending);
  await assert.rejects(manager.waitFor("pending", 1), /timed out after 1ms/);
  await assert.rejects(manager.waitFor("unknown"), /not found/);
  const member = { ...fakeTask("member", "completed"), teamContext: { memberName: "tester", teamName: "team" }, isTeamMember: true };
  manager.registerTask(member);
  assert.equal(manager.getTask("tester@team"), member);
  const expired = { ...fakeTask("old", "completed"), endTime: Date.now() - 300001 };
  manager.registerTask(expired);
  manager.cleanupExpiredTasks();
  assert.equal(manager.getTask("old"), undefined);
  assert.ok(manager.getTask("member"));
  assert.equal(shouldDeliverFrameworkNotification(true, true), false);
  assert.equal(shouldDeliverFrameworkNotification(false, true), true);
  assert.match(manager.buildTeamMemberNotification(member).text, /Teammate "tester" completed successfully/);
  manager.stopCleanup();
});

test("TaskOutput/Stop preserve agent/team/shell branches, schema defaults and terminal wording", async () => {
  const manager = new AgentTaskManager(), shells = new BackgroundTaskManager(), tools = new TaskOutputTools(manager, shells);
  const task = { ...fakeTask("finished", "completed"), result: "done", response: "done", endTime: Date.now() };
  manager.registerTask(task);
  const output = await tools.output({ task_id: task.id });
  assert.match(output.content, /--- RESULT ---\ndone/);
  assert.equal(output.renderer.type, "agent-output");
  assert.equal(JSON.parse(output.renderer.value).result, "done");
  const member = { ...fakeTask("member", "running"), isTeamMember: true };
  manager.registerTask(member);
  assert.match((await tools.output({ task_id: "member" })).content, /do NOT need to wait/);
  const running = fakeTask("running", "running");
  manager.registerTask(running);
  assert.match((await tools.stop({ task_id: "running" })).content, /Successfully cancelled/);
  assert.match((await tools.stop({ task_id: "finished" })).content, /not running/);
  assert.equal((await tools.output({ task_id: "unknown", block: false })).error, "Task not found");
  assert.match((await tools.stop({ shell_id: "unknown" })).content, /not found/);
  const stdout = new BoundedOutput(1000), stderr = new BoundedOutput(1000);
  stdout.push("keep line\ndrop line\n");
  const shell: any = { id: "shell", toolName: "Bash", title: "fixture", status: "completed", startTime: Date.now(), stdout, stderr, kill: async () => { shell.status = "killed"; } };
  shells.add(shell);
  assert.match((await tools.output({ task_id: "shell", filter: "keep", block: false })).content, /keep line/);
  assert.ok(!(await tools.output({ task_id: "shell", filter: "keep", block: false })).content.includes("drop line"));
  assert.match((await tools.stop({ task_id: "shell" })).content, /Cleanup completed/);
  assert.match((await tools.killShell({ shell_id: "shell" })).content, /✅ Cleanup completed for shell/);
  assert.match((await tools.killShell({ shell_id: "missing" })).content, /Background shell with ID/);
  assert.equal(taskOutputParameters.parse({ task_id: "x" }).timeout, 60000);
  assert.equal(taskOutputParameters.safeParse({ task_id: "x", timeout: -1 }).success, false);
  assert.equal(taskStopParameters.safeParse({}).success, false);
  assert.equal(formatTaskDuration(3661000), "1h 1m 1s");
});

test("real SDK Agent calls child Read, persists separate transcript, propagates usage and resumes child", { timeout: 10000 }, async (t) => {
  const path = await directory(t), file = join(path, "fixture.txt");
  await writeFile(file, "subagent evidence\n");
  let requestCount = 0;
  const requests: any[] = [];
  const message = (text: string) => [{ type: "message", role: "assistant", id: `message-${requestCount}`, status: "completed", content: [{ type: "output_text", text }] }];
  let resumedId = "";
  const model: Model = {
    async getResponse() { return { output: [], usage: new Usage() }; },
    async *getStreamedResponse(request) {
      requests.push(request);
      requestCount++;
      const output = requestCount === 1 ? [{ type: "function_call", callId: "parent-agent", id: "parent-agent", name: "Agent", status: "completed", arguments: JSON.stringify({ description: "Inspect fixture", prompt: "child read", subagent_type: "Explore" }) }]
        : requestCount === 2 ? [{ type: "function_call", callId: "child-read", id: "child-read", name: "Read", status: "completed", arguments: JSON.stringify({ file_path: file }) }]
        : requestCount === 5 ? [{ type: "function_call", callId: "resume-agent", id: "resume-agent", name: "Agent", status: "completed", arguments: JSON.stringify({ description: "Resume fixture", prompt: "child continue", subagent_type: "Explore", resume: resumedId }) }]
        : message(requestCount === 3 ? "child found evidence" : requestCount === 4 ? "main complete" : requestCount === 6 ? "child resumed" : "resume complete");
      yield { type: "response_started" };
      yield { type: "response_done", response: { id: `response-${requestCount}`, output, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any;
    },
  };
  const runtime = await createHarness({ workDir: path, model: "fixture-model", modelProvider: { getModel: () => model }, approveTool: () => true });
  t.after(() => runtime.close());
  const session = await runtime.openSession();
  const events: any[] = [];
  const subscription = session.combineSubject.subscribe((event) => events.push(event));
  t.after(() => subscription.unsubscribe());
  assert.equal(await runtime.prompt(session, "delegate"), "main complete");
  const parentResult = (session.history as any[]).find((item) => item.type === "function_call_result" && item.callId === "parent-agent");
  const serialized = JSON.stringify(parentResult);
  resumedId = serialized.match(/agent-[0-9a-f]{8}/)?.[0] ?? "";
  assert.ok(resumedId, serialized);
  assert.match(serialized, /child found evidence/);
  assert.equal(runtime.taskManager.getTasks().length, 0, "synchronous tasks are removed from manager");
  const restored = await runtime.store.get(resumedId);
  assert.ok(restored);
  assert.equal(restored.meta.parentSessionId, session.id);
  assert.ok(JSON.stringify(restored.history).includes("subagent evidence"));
  assert.ok(!JSON.stringify(session.history).includes('"callId":"child-read"'), "child items must not enter parent transcript");
  assert.ok(events.some((event) => event.parentToolUseId === "parent-agent"));
  assert.ok(session.usage.totalTokens >= 48);
  assert.equal(await runtime.prompt(session, "resume child"), "resume complete");
  assert.ok(JSON.stringify(requests[5].input).includes("child found evidence"));
  assert.equal(session.status, "idle");
});

test("Agent routing helpers preserve schema, classifier, fork boilerplate and error codes", () => {
  const tool = new AgentTool({} as any, new AgentTaskManager(), { createTask: () => { throw new Error("unused"); } });
  assert.equal(agentParameters.safeParse({ description: "task", prompt: "x", model: "custom" }).success, false);
  assert.equal(tool.classifyAgentError("Max turns exceeded"), "19923");
  assert.equal(tool.classifyAgentError("failed"), "19920");
  assert.equal(tool.toAutoClassifierInput({ prompt: "inspect", mode: "plan" }), "(general-purpose, mode=plan): inspect");
  const child = new HarnessSession("child", { history: [{ type: "message", role: "user", content: tool.buildForkChildPrompt("inspect") }] as any });
  assert.equal(tool.isInForkChild(child), true);
});

test("real SDK TaskCreate uses toolCall ordinal and CRUD persists across runtime resume", { timeout: 10000 }, async (t) => {
  const path = await directory(t);
  let count = 0;
  const requests: any[] = [];
  const model: Model = {
    async getResponse() { return { output: [], usage: new Usage() }; },
    async *getStreamedResponse(request) {
      requests.push(request);
      count++;
      const name = count === 1 ? "TaskCreate" : count === 2 ? "TaskUpdate" : count === 3 || count === 5 ? "TaskList" : undefined;
      const input = count === 1 ? { subject: "Verify task protocol", description: "Use the recovered tools" } : count === 2 ? { taskId: "2", status: "completed" } : {};
      const output = name ? [{ type: "function_call", callId: `task-call-${count}`, id: `task-call-${count}`, name, arguments: JSON.stringify(input), status: "completed" }]
        : [{ type: "message", role: "assistant", id: `answer-${count}`, status: "completed", content: [{ type: "output_text", text: "tasks settled" }] }];
      yield { type: "response_started" };
      yield { type: "response_done", response: { id: `response-${count}`, output, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any;
    },
  };
  const options = { workDir: path, modelProvider: { getModel: () => model }, approveTool: () => true };
  const first = await createHarness(options);
  const session = await first.openSession();
  await first.sessions.addHistory(session, [
    { type: "function_call", callId: "historical-create", id: "historical-create", name: "TaskCreate", arguments: "{}", status: "completed" },
    { type: "function_call_result", callId: "historical-create", name: "TaskCreate", output: { type: "text", text: "historical fixture" } },
  ] as any);
  assert.equal(await first.prompt(session, "track a task"), "tasks settled");
  const stored = await first.taskStorage.get(session.id, "2");
  assert.ok(stored, JSON.stringify(session.history));
  assert.equal(stored.status, "completed");
  await first.close();
  const second = await createHarness(options);
  t.after(() => second.close());
  const resumed = await second.openSession(session.id);
  assert.equal(await second.prompt(resumed, "list prior tasks"), "tasks settled");
  assert.match(JSON.stringify(requests.at(-1).input), /#2 \[completed\] Verify task protocol/);
});

test("child SDK approval is routed to its parent and cannot prematurely complete Agent tool", { timeout: 10000 }, async (t) => {
  const path = await directory(t);
  let count = 0, executed = 0;
  const approvals: string[] = [];
  const model: Model = {
    async getResponse() { return { output: [], usage: new Usage() }; },
    async *getStreamedResponse() {
      count++;
      const name = count === 1 ? "Agent" : count === 2 ? "Read" : undefined;
      const input = count === 1 ? { description: "Child approval", prompt: "request approval", subagent_type: "Explore" } : { file_path: "fixture" };
      const output = name ? [{ type: "function_call", callId: `call-${count}`, id: `call-${count}`, name, arguments: JSON.stringify(input), status: "completed" }]
        : [{ type: "message", role: "assistant", id: `message-${count}`, status: "completed", content: [{ type: "output_text", text: count === 3 ? "approved child result" : "approved main result" }] }];
      yield { type: "response_started" };
      yield { type: "response_done", response: { id: `response-${count}`, output, usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 } } } as any;
    },
  };
  const runtime = await createHarness({ workDir: path, modelProvider: { getModel: () => model }, approveTool: () => true });
  t.after(() => runtime.close());
  runtime.tools.register("Read", { parameters: z.object({ file_path: z.string() }), needsApproval: true, execute: () => { executed++; return "child tool evidence"; } });
  const session = await runtime.openSession();
  const subscription = runtime.interruptions.pending$.subscribe((pending) => { if (pending) approvals.push(pending.mainSessionId); });
  t.after(() => subscription.unsubscribe());
  assert.equal(await runtime.prompt(session, "delegate child approval"), "approved main result");
  assert.equal(executed, 1);
  assert.deepEqual(approvals, [session.id]);
  const parentResult = (session.history as any[]).find((item) => item.type === "function_call_result" && item.callId === "call-1");
  assert.match(JSON.stringify(parentResult), /approved child result/);
});
