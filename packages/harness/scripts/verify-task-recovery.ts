import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { z as z3 } from "zod3";
import { AgentTool, agentParameters } from "../src/tools/agent-tool.js";
import { TaskOutputTools, taskOutputParameters, taskStopParameters, killShellParameters, formatTaskDuration } from "../src/tools/task-output-tools.js";
import { TaskTools, taskCreateParameters, taskGetParameters, taskUpdateParameters, taskListParameters, generateActiveForm, resolveTaskSessionId } from "../src/tools/task-tools.js";
import { TaskStorageService } from "../src/tasks/task-storage-service.js";
import { FileLockService } from "../src/tasks/file-lock-service.js";
import { AgentTaskManager } from "../src/agents/agent-task-manager.js";
import { BackgroundTaskManager, BoundedOutput } from "../src/tools/core-shell-tools.js";
import { HarnessSession } from "../src/sessions/session.js";

const bundlePath = process.argv[2];
if (!bundlePath) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await fs.readFile(bundlePath, "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const directory = await fs.mkdtemp(path.join(tmpdir(), "harness-original-task-diff-"));
const logger = { debug() {}, warn() {}, info() {} };
const names = { AGENT: "Agent", TASK_CREATE: "TaskCreate", TASK_GET: "TaskGet", TASK_UPDATE: "TaskUpdate", TASK_LIST: "TaskList", TASK_OUTPUT: "TaskOutput", TASK_STOP: "TaskStop", KILL_SHELL: "KillShell", WORKFLOW: "Workflow" };
const context: any = {
  iJ: { z: z3 }, iz: { BaseTool: class {} }, nC: { ToolNames: names, getVisibleTodoItems: (items: any[]) => items.length > 0 && items.every((item) => item.status === "completed") ? [] : items },
  nz: { AgentNames: { FORK: "fork", GENERAL_PURPOSE: "general-purpose" } },
  o3: { ToolErrorCode: { AgentExecutionError: "19920", AgentMaxTurnsError: "19923" } },
  nW: { SessionUtils: { resolveTaskSessionId }, ZodUtils: { validate: (schema: any, input: any) => schema.safeParse(input).success ? undefined : "invalid" } },
  oE: { TeamManager: "team" }, oT: { SessionHookManager: "hooks" },
  nk: { ContainerUtil: { get: (name: string) => name === "team" ? { isInTeam: () => false } : {} } },
  eh: fs, ef: path, eE: { PathUtils: { getHomeDir: () => path.join(directory, "original") } }, lp: fs,
  Date, process, setTimeout, clearTimeout, setInterval, clearInterval,
};
function evaluate(text: string): any { return runInNewContext(text, context, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
function schema(name: string, start: number, endToken: string): any {
  const end = source.indexOf(endToken, start);
  assert.ok(end > start);
  return context[name] = evaluate(`(${source.slice(start + name.length + 1, end)})`);
}
schema("lE", 11878071, ";function tasksToTodos");
schema("ly", 11882628, ",lw=class");
schema("lB", 11885166, ";function task_update_tool_tasksToTodos");
schema("lb", 11889572, ";function task_list_tool_tasksToTodos");
schema("lh", 11870655, ",lf=class");
schema("lP", 11908894, ",lL=class");
schema("lO", 11907147, ",lN=class");
context.lg = new Set(["completed", "failed", "cancelled", "killed"]);
const todoStart = source.indexOf("function tasksToTodos(", 11878071), todoEnd = source.indexOf("let lC=class", todoStart);
context.tasksToTodos = evaluate(`(${source.slice(todoStart, todoEnd)})`);
context.task_update_tool_tasksToTodos = context.task_list_tool_tasksToTodos = context.tasksToTodos;
const originalTypes = [
  ["create", 11878834, 11881602, taskCreateParameters], ["get", 11882713, 11884149, taskGetParameters],
  ["update", 11886284, 11888544, taskUpdateParameters], ["list", 11889858, 11891561, taskListParameters],
  ["output", 11871294, 11877034, taskOutputParameters], ["stop", 11909163, 11911279, taskStopParameters],
  ["agent", 11853702, 11868971, agentParameters],
  ["kill", 11907242, 11908295, killShellParameters],
] as const;
const originals: Record<string, any> = {};
for (const [name, start, end] of originalTypes) { const Original = evaluate(`(${source.slice(start, end)})`); originals[name] = new Original(); originals[name].logger = logger; }
const OriginalStore = evaluate(`(${source.slice(12177331, 12180570)})`);
const originalStore = new OriginalStore();
originalStore.logger = logger;
originalStore.fileLockService = new FileLockService();
const recoveredStore = new TaskStorageService(path.join(directory, "recovered", "tasks"));
for (const tool of Object.values(originals)) tool.taskStorageService = originalStore;
const recovered = new TaskTools(recoveredStore);
let comparisons = 0;
const normalize = (value: any) => JSON.parse(JSON.stringify(value).replace(/Timestamp: [^\\]+?(?=\\n)/g, "Timestamp: <time>"));
function equal(actual: any, expected: any): void { assert.deepEqual(normalize(actual), normalize(expected)); comparisons++; }
const oldNow = Date.now;
Date.now = () => 1700000000000;
try {
  const inputs = [{}, { taskId: "1" }, { task_id: "task" }, { task_id: "task", timeout: "500" }, { task_id: "task", timeout: -1 }, { task_id: "task", timeout: 600001 }, { task_id: "task", timeout: 0 }, { shell_id: "x" },
    { subject: "Run tests", description: "Verify" }, { subject: "Run", description: "x", metadata: { a: 1 } }, { subject: 1, description: "x" },
    { description: "task", prompt: "inspect" }, { description: "task", prompt: "inspect", model: "lite", mode: "plan", max_turns: 3 }, { description: "task", prompt: "inspect", max_turns: 0 }, { description: "task", prompt: "inspect", model: "custom" }];
  for (const [name, , , recoveredSchema] of originalTypes) for (const input of inputs) {
    const before = originals[name].parameters.safeParse(input), after = recoveredSchema.safeParse(input);
    equal(after.success, before.success);
    if (before.success && after.success) equal(after.data, before.data);
  }
  for (let trial = 0; trial < 20; trial++) {
    const session = new HarnessSession(`scope-${trial}`);
    for (const [method, input] of [
      ["create", { subject: "Run tests", description: "Verify", owner: "tester", metadata: { remove: true } }],
      ["create", { subject: "Write docs", description: "Document" }],
      ["update", { taskId: "2", addBlockedBy: ["1", "1", "999"], metadata: { fixture: trial } }],
      ["get", { taskId: "2" }], ["list", {}],
      ["update", { taskId: "1", status: "completed", metadata: { remove: null } }],
      ["list", {}], ["update", { taskId: "2", status: "completed" }], ["list", {}],
      ["update", { taskId: "2", status: "deleted" }], ["get", { taskId: "2" }],
    ] as const) {
      equal(await (recovered[method] as any).call(recovered, structuredClone(input), session), await originals[method].execute(structuredClone(input), { context: session }));
    }
    equal(await recoveredStore.list(session.id), await originalStore.list(session.id));
  }
  for (const subject of ["Run tests", "Write docs", "See logs", "Test", "Do work", "Build the harness", "fix bug", "  Read file  "]) equal(generateActiveForm(subject), originals.create.generateActiveForm(subject));
  const agent = new AgentTool({} as any, new AgentTaskManager(), { createTask: () => { throw new Error("unused"); } });
  for (const prompt of ["", "inspect", "中文任务", "<user_query>test</user_query>"]) {
    equal(agent.buildForkChildPrompt(prompt), originals.agent.buildForkChildPrompt(prompt));
    for (const subagent_type of [undefined, "Explore", "fork"]) for (const mode of [undefined, "plan", "default"])
      equal(agent.toAutoClassifierInput({ prompt, ...(subagent_type ? { subagent_type } : {}), ...(mode ? { mode: mode as "plan" | "default" } : {}) }), originals.agent.toAutoClassifierInput({ prompt, subagent_type, mode }));
  }
  for (const error of ["Max turns exceeded", "MAX TURNS EXCEEDED", "max turns", "agent not found", "aborted"]) equal(agent.classifyAgentError(error), originals.agent.classifyAgentError(error));
  const manager = new AgentTaskManager(), shells = new BackgroundTaskManager(), output = new TaskOutputTools(manager, shells);
  originals.output.agentTaskManager = originals.stop.agentTaskManager = manager;
  for (const status of ["pending", "running", "completed", "failed", "cancelled", "killed"] as const) {
    const task: any = { id: `agent-${status}`, status, startTime: Date.now() - 12345, mainSessionId: "main", description: "fixture", prompt: "inspect", response: "response", result: "result", error: "error", agentType: "Explore", kill() {}, tokenUsage: { lastContextWindow: 1000 }, toolCallHistory: [] };
    manager.registerTask(task);
    equal(await output.executeAgentTask(task, task.id, false), await originals.output.executeAgentTask(task, task.id, false));
    for (const duration of [0, 999, 1000, 59999, 60000, 3600000]) equal(formatTaskDuration(duration), originals.stop.formatDuration(duration));
  }
  for (const text of ["", "one\ntwo\n", "中文\nline\n"]) {
    const stdout = new BoundedOutput(1000), stderr = new BoundedOutput(1000);
    stdout.push(text);
    const task: any = { id: "shell", title: "fixture", status: "completed", startTime: Date.now() - 100, stdout, stderr };
    for (const filter of [undefined, "one", "["]) equal(await output.executeBackgroundShellTask(task, "shell", filter, false), await originals.output.executeBackgroundShellTask(task, "shell", filter, false));
  }
} finally {
  Date.now = oldNow;
  await fs.rm(directory, { recursive: true, force: true });
}
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle" }, null, 2));
