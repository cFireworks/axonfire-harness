import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { user } from "@openai/agents-core";
import { z as z3 } from "zod3";
import { TeamManager } from "../src/teams/team-manager.js";
import { TeamMailbox, formatTeammateMessage, formatInitialAssignmentSummary, getTeamMemberColor } from "../src/teams/team-mailbox.js";
import { TeamMember, TeamMemberRegistry } from "../src/teams/team-member.js";
import { InProcessTeammateBackend } from "../src/teams/in-process-teammate-backend.js";
import { ShutdownCoordinator, resolveShutdownTimeoutMs } from "../src/teams/shutdown-coordinator.js";
import { TeamTools, TeamCreateSchema, TeamDeleteSchema } from "../src/tools/team-tools.js";
import { SendMessageTool, SendMessageSchema } from "../src/tools/send-message-tool.js";
import { TeamAgentSpawner } from "../src/teams/team-agent-spawner.js";
import { TeamLeadInboxPoller } from "../src/teams/team-lead-inbox-poller.js";
import { TeamContextInterceptor } from "../src/agents/team-context-interceptor.js";
import { addSystemReminder } from "../src/agents/system-reminder-agent-run-interceptor.js";
import { MessageQueueManager } from "../src/sessions/message-queue-manager.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { HarnessSession } from "../src/sessions/session.js";
import { TeamWorktreeCleanupService } from "../src/teams/team-worktree-cleanup.js";

const filename = process.argv[2]; if (!filename) throw new Error("Pass captured WorkBuddy 5.3.14 codebuddy.js");
const source = await fs.readFile(filename, "utf8"); assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const root = await fs.mkdtemp(path.join(tmpdir(), "harness-team-diff-"));
const quiet: any = { setContext() {}, info() {}, warn() {}, error() {}, debug() {} };
function evaluate(code: string, context: any = {}): any { return runInNewContext(code, { Error, Date, Math, process, console: { error() {} }, Map, Set, WeakSet, setTimeout, clearTimeout, ...context }, { timeout: 10000, contextCodeGeneration: { strings: false, wasm: false } }); }
const OriginalManager = evaluate(`(${source.slice(8378071, 8383696)})`, { iv: fs });
const OriginalRegistry = evaluate(`(${source.slice(7004450, 7005055)})`);
let comparisons = 0;
const plain = (value: any): any => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function equal(actual: any, expected: any) { assert.deepEqual(plain(actual), plain(expected)); comparisons++; }
async function outcome(fn: () => any): Promise<any> { try { return { value: await fn() }; } catch (error: any) { return { error: error.message }; } }
async function settle() { for (let index = 0; index < 30; index++) await Promise.resolve(); }
const beforeRoot = path.join(root, "before"), afterRoot = path.join(root, "after");
const normalize = (value: any) => { const text = JSON.stringify(value); return text === undefined ? undefined : JSON.parse(text.replaceAll(beforeRoot, "ROOT").replaceAll(afterRoot, "ROOT")); };
function paths(home: string) { return { getWorkDir: () => "/fixture", getTeamDir: (team: string) => path.join(home, "teams", team), getTeamInboxesDir: (team: string) => path.join(home, "teams", team, "inboxes"), getTeamTasksDir: (team: string) => path.join(home, "tasks", team), getTeamInboxPath: (team: string, member: string) => path.join(home, "teams", team, "inboxes", `${member}.json`), getTeamConfigPath: (team: string) => path.join(home, "teams", team, "config.json") }; }
function managerPair() {
  const beforeMailbox = new TeamMailbox(beforeRoot), afterMailbox = new TeamMailbox(afterRoot), cleanup = { cleanupTeamWorktrees: async () => ({ cleaned: [], preserved: [], failed: [] }) };
  const Original = evaluate(`(${source.slice(8378071, 8383696)})`, { iv: fs, iS: { PathUtils: paths(beforeRoot) }, r6: { ContainerUtil: { get: () => beforeMailbox } }, n$: { TeamMailbox: "mailbox" } });
  const before = new Original(); Object.assign(before, { logger: quiet, cleanupService: cleanup }); const after = new TeamManager(afterRoot, afterMailbox, () => "/fixture", cleanup);
  return { before, after, beforeMailbox, afterMailbox };
}
function originalTools(manager: any, registry: any, mailbox: any, shutdown: any, poller: any) {
  const services: any = { manager, mailbox, shutdown, logger: quiet };
  const container = { ContainerUtil: { get: (key: string) => services[key] } }, team = { TeamManager: "manager", TeamMailbox: "mailbox" }, utility = { getTeamMemberRegistry: () => registry, stopTeamLeadPoller: () => poller.stopTeamLeadPoller() };
  const Delete = evaluate(`(${source.slice(12043568, 12045075)})`, { iz: { BaseTool: class {} }, nC: { ToolNames: { TEAM_DELETE: "TeamDelete" } }, iJ: { z: z3 }, nk: container, oE: team, lu: utility, n5: { PathUtils: { getTeamDir: (name: string) => `/home/teams/${name}`, getTeamTasksDir: (name: string) => `/home/tasks/${name}` } } });
  const Create = evaluate(`(${source.slice(12185238, 12187024)})`, { eS: { BaseTool: class {} }, eQ: { ToolNames: { TEAM_CREATE: "TeamCreate" } }, ef: { z: z3 }, eg: container, ew: team, startTeamLeadInboxPolling: (name: string, session: any) => poller.startTeamLeadInboxPolling(name, session) });
  const Send = evaluate(`(${source.slice(12045874, 12054922)})`, { iz: { BaseTool: class {} }, nC: { ToolNames: { SEND_MESSAGE: "SendMessage" } }, iJ: { z: z3 }, nk: container, oE: team, lu: utility, ec: () => ({ ShutdownCoordinator: "shutdown" }) });
  return { create: new Create(), remove: new Delete(), send: Object.assign(new Send(), { logger: quiet }) };
}
function memberFixture(original: boolean, options: { finished?: boolean; noTask?: boolean; busy?: boolean; spawnFails?: boolean; backendType?: string } = {}) {
  const events: any[] = [], registry: any = original ? new OriginalRegistry() : new TeamMemberRegistry(), main: any = { id: "lead", meta: { cwd: "/fixture" }, teamCancelled: false }, state = new SessionRunStateMachine(), queue = new MessageQueueManager(), session = new HarnessSession("child"); if (options.busy) session.status = "model_streaming";
  let nextTask = 0;
  const makeTask = (config?: any, parent?: any): any => { if (config) events.push(["task-init", { ...config, mainSession: (parent ?? config.mainSession)?.id }]); return { id: `task-${++nextTask}`, status: options.finished ? "completed" : "running", execute: async () => { events.push("execute"); }, kill: async () => { events.push("kill-task"); }, getSubAgentSession: () => session }; };
  const task = makeTask();
  const manager: any = { getMembers: () => [{ name: "team-lead", agentType: "team-lead" }, { name: "worker", agentType: "Explore" }], isInTeam: () => true, removeMember: async (name: string) => { events.push(["remove-member", name]); } };
  const mailbox: any = { send: async (...args: any[]) => { events.push(["send", ...args]); }, startPolling: (_team: string, _name: string, _handler: any, interval: number) => { events.push(["poll", interval]); return () => events.push("stop-poll"); } };
  const backend: any = { type: options.backendType ?? "in-process", spawn: async (spec: any) => { events.push(["spawn", { ...spec, mainSession: spec.mainSession.id }]); if (options.spawnFails) throw new Error("spawn failed"); return { backendId: "backend", agentId: "worker@fixture", backendType: options.backendType ?? "in-process", agentTask: options.noTask ? undefined : task }; }, kill: async (...args: any[]) => { events.push(["kill-backend", ...args]); return true; }, isAlive: async () => true };
  const idle: any = { register: (...args: any[]) => events.push(["register-idle", ...args]), unregister: (...args: any[]) => events.push(["unregister-idle", ...args]) }, tasks: any = { registerTask: (task: any) => events.push(["register-task", task.id]) }, service: any = { runDefault: async (input: any, options: any) => { events.push(["run", input, options.context.id]); } };
  const info: any = { name: "worker", agentId: "worker@fixture", agentType: "Explore", joinedAt: 1, cwd: "/fixture", subscriptions: ["*"], tmuxPaneId: "in-process", color: "blue" };
  const runtime: any = { mailbox, messageQueue: queue, stateMachine: state, manager, registry, backend, taskManager: tasks, createTask: makeTask, idleTracker: idle, runDefault: (input: any, session: any) => service.runDefault(input, { context: session }) };
  const services: any = { logger: quiet, mailbox, queue, state, manager, backend, idle, tasks, service };
  services.task = { init: (config: any) => { const task = makeTask(); events.push(["task-init", { ...config, mainSession: config.mainSession.id }]); Object.assign(services.task, task); } };
  const tokens = { TeamManager: "manager", TeamMailbox: "mailbox", getTeamMemberColor, formatTeammateMessage };
  const Original = original ? evaluate(`(${source.slice(6995005, 7004426)})`, { eu: { ContainerUtil: { get: (key: string) => services[key] } }, ed: { Logger: "logger" }, ey: tokens, ef: { MessageQueueManager: "queue" }, em: { SessionRunStateMachine: "state" }, eh: { AgentTask: "task", AgentTaskManager: "tasks" }, eC: { InProcessTeammateBackend: "backend" }, ew: { TeammateIdleTracker: "idle" }, eE: { getTeamMemberRegistry: () => registry }, eg: { user }, ep: { AgentService: "service" }, ec: () => { throw new Error("unavailable"); } }) : undefined;
  const member: any = original ? new Original("fixture", info) : new TeamMember("fixture", info, runtime);
  if (!options.noTask) member.setAgentTask(task);
  return { member, task, main, registry, events, session, runtime, manager, backend };
}
const savedDate = Date, savedRandom = Math.random, savedEnv = process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS;
const fixedTime = 1790000000000;
class FixedDate extends Date { constructor(value?: any) { super(value ?? fixedTime); } static override now() { return fixedTime; } }
globalThis.Date = FixedDate as DateConstructor; Math.random = () => .125;
try {
  const pair = managerPair(), main = new HarnessSession("lead"); main.requestOptions.model = "model";
  equal(normalize(await pair.after.createTeam("fixture", main, "description", "researcher")), normalize(await pair.before.createTeam("fixture", main, "description", "researcher")));
  for (const [method, args] of [["createTeam", ["other", main]], ["addMember", [{ name: "worker", agentId: "worker@fixture", agentType: "Explore", cwd: "/fixture", subscriptions: [], joinedAt: 1, tmuxPaneId: "" }]], ["updateMember", ["worker", { color: "red" }]], ["addMember", [{ name: "worker" }]], ["removeMember", ["team-lead"]], ["removeMember", ["missing"]], ["updateMember", ["missing", {}]], ["refreshFromDisk", []], ["removeMember", ["worker"]]] as Array<[string, any[]]>) { equal(normalize(await outcome(() => (pair.after as any)[method](...args))), normalize(await outcome(() => pair.before[method](...args)))); equal(normalize(pair.after.getTeam()), normalize(pair.before.getTeam())); equal(await fs.readFile(path.join(afterRoot, "teams/fixture/config.json"), "utf8"), await fs.readFile(path.join(beforeRoot, "teams/fixture/config.json"), "utf8")); }
  await pair.after.deleteTeam(); await pair.before.deleteTeam(); equal(pair.after.getTeam(), pair.before.getTeam());
  for (const before of [true, false]) { const home = before ? beforeRoot : afterRoot; await fs.mkdir(path.join(home, "teams/occupied"), { recursive: true }); }
  equal(normalize(await pair.after.createTeam("occupied", main)), normalize(await pair.before.createTeam("occupied", main))); await pair.after.deleteTeam(); await pair.before.deleteTeam();
  equal(normalize(await pair.after.autoCreateTeam("lead", main)), normalize(await pair.before.autoCreateTeam("lead", main))); await pair.after.cleanupSessionTeams(); await pair.before.cleanupSessionTeams(); equal(pair.after.getTeam(), pair.before.getTeam());
  for (const value of [undefined, "", "0", "1", "-1", "15.8", "30suffix", "invalid"]) { if (value === undefined) delete process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS; else process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS = value; const start = source.indexOf("function resolveShutdownTimeoutMs()"), end = source.indexOf("let eg=class", start), original = evaluate(`(${source.slice(start, end)})`); equal(resolveShutdownTimeoutMs(), original()); }
  const dummy: any = { getTeam: () => ({ name: "fixture", leadSessionId: "lead" }), isInTeam: () => true, getMembers: () => [{ name: "team-lead", color: "blue" }, { name: "worker", color: "green" }], getMember(name: string) { return this.getMembers().find((member: any) => member.name === name); }, refreshFromDisk: async () => undefined, isEnabled: () => true };
  const registry: any = new TeamMemberRegistry(), originals = originalTools(dummy, registry, {}, {}, { stopTeamLeadPoller() {}, startTeamLeadInboxPolling() {} });
  for (const [before, after] of [[originals.create.parameters, TeamCreateSchema], [originals.remove.parameters, TeamDeleteSchema], [originals.send.parameters, SendMessageSchema]]) {
    for (const input of [{}, { team_name: "fixture" }, { type: "message" }, { type: "broadcast", recipient: "worker", content: "text", summary: "preview" }, { type: "shutdown_response", approve: false }, { type: "shutdown_response", request_id: 1 }, { type: "unknown" }, { type: "plan_approval_response", approve: true, extra: 1 }]) { const left = after.safeParse(input), right = before.safeParse(input); equal(left.success, right.success); if (left.success && right.success) equal(left.data, right.data); } for (const key of Object.keys(before.shape)) equal((after.shape as any)[key].description, before.shape[key].description);
  }
  const contexts = [undefined, { context: { id: "lead", meta: {} } }, { context: { id: "wrong", meta: {} } }, { context: { id: "child", meta: { teamContext: { memberName: "worker", teamName: "fixture" } } } }];
  for (const context of contexts) for (const type of ["message", "broadcast", "shutdown_request", "shutdown_response", "plan_approval_response", "unknown"]) for (const optional of [{}, { recipient: "main" }, { recipient: "worker", content: "text" }, { recipient: "pending", content: "text", summary: "preview" }, { recipient: "worker", content: "text", summary: "preview", approve: false, request_id: "request" }, { recipient: "main", content: "", summary: "preview", approve: true, request_id: "request" }]) {
    const leftEvents: any[] = [], rightEvents: any[] = [];
    const mailbox = (events: any[]) => ({ send: async (...args: any[]) => { events.push(["send", ...args]); }, broadcast: async (...args: any[]) => { events.push(["broadcast", ...args]); return ["worker"]; } });
    const shutdown = (events: any[]) => ({ fulfillResponse: (...args: any[]) => { events.push(["fulfill", ...args]); return true; } });
    const before = originalTools(dummy, registry, mailbox(rightEvents), shutdown(rightEvents), {}).send, after = new SendMessageTool(dummy, mailbox(leftEvents) as any, registry, shutdown(leftEvents) as any), input: any = { type, ...optional };
    equal(await outcome(() => after.execute(input, context as any)), await outcome(() => before.execute(input, context))); equal(leftEvents, rightEvents); equal(after.toAutoClassifierInput(input), before.toAutoClassifierInput(input));
  }
  for (const original of [false, true]) { const registry: any = original ? new OriginalRegistry() : new TeamMemberRegistry(); for (const [team, name, active] of [["a", "worker", true], ["b", "worker", false], ["a", "other", true]] as const) registry.register({ teamName: team, info: { name }, isActive: () => active, destroy: async () => undefined }); equal(registry.size, 3); equal(registry.getActive().map((member: any) => member.teamName + ":" + member.info.name), ["a:worker", "a:other"]); equal(registry.get("worker", "b").info.name, "worker"); registry.remove("worker", "b"); equal(registry.size, 2); await registry.destroyAll(); equal(registry.size, 0); }
  for (const finished of [false, true]) for (const busy of [false, true]) for (const noTask of [false, true]) for (const batch of [[{ from: "user", text: "raw", timestamp: "time" }], [{ from: "team-lead", text: "work", summary: "summary", timestamp: "time" }], [{ from: "team-lead", text: '{"type":"shutdown_request","request_id":"request"}', timestamp: "time" }]]) {
    const before = memberFixture(true, { finished, busy, noTask }), after = memberFixture(false, { finished, busy, noTask });
    equal(after.member.isActive(), before.member.isActive()); equal(after.member.isFinished(), before.member.isFinished()); equal(after.member.formatMessageForInjection(batch[0]), before.member.formatMessageForInjection(batch[0]));
    // Finished-member respawn itself is compared in the spawn/respawn cases below.
    before.member.respawn = async (...args: any[]) => { before.events.push(["respawn", ...args]); }; after.member.respawn = async (...args: any[]) => { after.events.push(["respawn", ...args]); };
    equal(await outcome(() => after.member.handleIncomingMessages(batch)), await outcome(() => before.member.handleIncomingMessages(batch))); await settle(); equal(after.events, before.events); equal(after.session.queue, before.session.queue);
  }
  for (const backendType of ["in-process", "detached-process"]) for (const noTask of [false, true]) for (const spawnFails of [false, true]) for (const cancelled of [false, true]) {
    const before = memberFixture(true, { backendType, noTask, spawnFails }), after = memberFixture(false, { backendType, noTask, spawnFails }); before.main.teamCancelled = after.main.teamCancelled = cancelled;
    equal(await outcome(() => after.member.spawn(after.main, "prompt", "Explore", { memberIndex: 2, model: "model", permissionMode: "plan", maxTurns: 7 })), await outcome(() => before.member.spawn(before.main, "prompt", "Explore", { memberIndex: 2, model: "model", permissionMode: "plan", maxTurns: 7 }))); equal(after.member.info, before.member.info); equal(after.events, before.events);
    for (const keepWakeable of [undefined, true, false]) { equal(await outcome(() => after.member.forceKill({ keepWakeable })), await outcome(() => before.member.forceKill({ keepWakeable }))); equal(after.events, before.events); }
  }
  for (const model of [undefined, "model"]) for (const permissionMode of [undefined, "plan"]) {
    const before = memberFixture(true), after = memberFixture(false); await before.member.spawn(before.main, "initial", "Explore", { model, permissionMode, maxTurns: 7 }); await after.member.spawn(after.main, "initial", "Explore", { model, permissionMode, maxTurns: 7 });
    await before.member.respawn("follow-up", "resume task"); await after.member.respawn("follow-up", "resume task"); await settle(); equal(after.member.getTaskId(), before.member.getTaskId()); equal(after.events, before.events); equal(after.member.isActive(), before.member.isActive());
  }
  for (const [status, busy] of [["pending", false], ["running", false], ["completed", false], ["completed", true], ["failed", false], ["cancelled", false], ["killed", false]] as const) { const before = memberFixture(true, { busy }), after = memberFixture(false, { busy }); before.task.status = after.task.status = status; equal(after.member.isActive(), before.member.isActive()); equal(after.member.isFinished(), before.member.isFinished()); }
  // Teammate backend config, detached registration and kill/liveness behavior.
  for (const skipPromptWrapping of [false, true]) for (const memberIndex of [undefined, 0, 5]) {
    function build(original: boolean) {
      const events: any[] = [], task: any = { id: "task", status: "running", execute: async () => events.push("execute"), kill: async () => events.push("kill") }, taskManager: any = { registerTask: (value: any) => events.push(["register", value.id]) };
      const create = (config: any, main?: any) => { events.push(["init", { ...config, mainSession: main?.id ?? config.mainSession?.id }]); return task; };
      const initialized = { ...task, init: (config: any) => { create(config); } }, services: any = { task: initialized, tasks: taskManager };
      const Original = evaluate(`(${source.slice(6989786, 6991010)})`, { eu: { ContainerUtil: { get: (key: string) => services[key] } }, ed: { AgentTask: "task", AgentTaskManager: "tasks" }, ep: { formatTeammateMessage, formatInitialAssignmentSummary, getTeamMemberColor } });
      return { backend: original ? new Original() : new InProcessTeammateBackend(create, taskManager), events };
    }
    const before = build(true), after = build(false), spec: any = { name: "worker", teamName: "fixture", prompt: "prompt", agentType: "Explore", mainSession: { id: "lead" }, skipPromptWrapping, memberIndex };
    const left = await after.backend.spawn(spec), right = await before.backend.spawn(spec); equal({ ...left, agentTask: undefined }, { ...right, agentTask: undefined }); equal(after.events, before.events); equal(await after.backend.isAlive("task"), await before.backend.isAlive("task")); equal(await after.backend.kill("task"), await before.backend.kill("task")); equal(after.events, before.events);
  }
  // Shutdown protocol with manually fired timeout callbacks (no long waits).
  for (const active of [false, true]) for (const deliveryFails of [false, true]) for (const response of ["approve", "reject", "timeout", "cancel"] as const) {
    function build(original: boolean) {
      const events: any[] = [], member: any = { teamName: "fixture", info: { name: "worker" }, isActive: () => active, sendMessage: async (...args: any[]) => { events.push(["send", ...args]); if (deliveryFails) throw new Error("delivery failed"); }, forceKill: async () => { events.push("kill"); } };
      const Original = evaluate(`(${source.slice(6992109, 6994648)})`, { eu: { ContainerUtil: { get: () => quiet } }, ed: { Logger: "logger" }, resolveShutdownTimeoutMs });
      const coordinator = original ? new Original() : new ShutdownCoordinator(); coordinator.newRequestId = () => "request"; return { coordinator, member, events };
    }
    const before = build(true), after = build(false), left = after.coordinator.shutdown(after.member, { timeoutMs: 0 }), right = before.coordinator.shutdown(before.member, { timeoutMs: 0 }); await settle();
    if (response === "approve" || response === "reject") equal(after.coordinator.fulfillResponse("request", response === "approve", "reason"), before.coordinator.fulfillResponse("request", response === "approve", "reason")); else if (response === "timeout") { await after.coordinator.onTimeout("request"); await before.coordinator.onTimeout("request"); } else { after.coordinator.cancelAll("test"); before.coordinator.cancelAll("test"); }
    equal(await left, await right); equal(after.events, before.events);
  }
  for (const dirty of [false, true]) for (const detectFails of [false, true]) for (const removeFails of [false, true]) {
    const beforePath = path.join(root, "cleanup-before"), afterPath = path.join(root, "cleanup-after"); await fs.mkdir(beforePath, { recursive: true }); await fs.mkdir(afterPath, { recursive: true });
    function build(original: boolean) { const events: any[] = [], service: any = { remove: async (...args: any[]) => { events.push(["remove", ...args]); if (removeFails) throw new Error("remove failed"); } }, detector: any = { detect: async () => { if (detectFails) throw new Error("detect failed"); return { hasChanges: dirty, uncommittedFiles: dirty ? 1 : 0, unpushedCommits: 0 }; } }, loader: any = () => undefined; loader.t = async () => fs;
      const Original = evaluate(`(${source.slice(8388023, 8389368)})`, { ec: loader }); return { cleanup: original ? Object.assign(new Original(), { logger: quiet, worktreeService: service, changeDetector: detector }) : new TeamWorktreeCleanupService(service, detector), events };
    }
    const before = build(true), after = build(false), input = (worktreePath: string) => [{ name: "worker", worktreePath }, { name: "no-path" }]; equal(await after.cleanup.cleanupTeamWorktrees(input(afterPath) as any), await before.cleanup.cleanupTeamWorktrees(input(beforePath)));
    const normalize = (events: any[]) => JSON.parse(JSON.stringify(events).replaceAll(beforePath, "TARGET").replaceAll(afterPath, "TARGET")); equal(normalize(after.events), normalize(before.events)); equal(await fs.access(afterPath).then(() => true, () => false), await fs.access(beforePath).then(() => true, () => false));
  }
  for (const inTeam of [false, true]) for (const renamed of [false, true]) for (const fails of [false, true]) for (const hasContext of [false, true]) {
    function build(original: boolean) {
      const events: any[] = [], manager: any = { isInTeam: () => inTeam, getTeam: () => ({ name: "existing" }), createTeam: async (...args: any[]) => { events.push(["create", args[0], args[1].id, ...args.slice(2)]); if (fails) throw new Error("creation failed"); return { name: renamed ? "fixture-renamed" : "fixture", leadAgentId: "lead@fixture" }; }, teamDir: (name: string) => `/home/teams/${name}`, taskDir: (name: string) => `/home/tasks/${name}` }, registry: any = { getActive: () => [], destroyAll: async () => undefined }, poller: any = { startTeamLeadInboxPolling: (team: string, session: any) => events.push(["poll", team, session.id]), stopTeamLeadPoller() {} };
      return { tool: original ? originalTools(manager, registry, {}, {}, poller).create : new TeamTools(manager, registry, poller), events, session: { id: "lead", meta: {} } };
    }
    const before = build(true), after = build(false), input = { team_name: "fixture", description: "purpose", agent_type: "researcher" };
    equal(await outcome(() => after.tool.create(input, hasContext ? { context: after.session } : undefined)), await outcome(() => before.tool.execute(input, hasContext ? { context: before.session } : undefined))); equal(after.events, before.events); equal(after.session.meta, before.session.meta);
  }
  for (const inTeam of [false, true]) for (const active of [false, true]) for (const fails of [false, true]) {
    function build(original: boolean) { const events: any[] = [], manager: any = { isInTeam: () => inTeam, getTeam: () => ({ name: "fixture" }), deleteTeam: async () => { events.push("delete"); if (fails) throw new Error("delete failed"); }, teamDir: (name: string) => `/home/teams/${name}`, taskDir: (name: string) => `/home/tasks/${name}` }, registry: any = { getActive: () => active ? [{ info: { name: "worker" } }] : [], destroyAll: async () => { events.push("destroy"); } }, poller: any = { stopTeamLeadPoller: () => events.push("stop-poll") }; return { tool: original ? originalTools(manager, registry, {}, {}, poller).remove : new TeamTools(manager, registry, poller), events, session: { id: "lead", meta: { teamName: "fixture", isTeamLead: true } } }; }
    const before = build(true), after = build(false); equal(await after.tool.delete({}, { context: after.session }), await before.tool.execute({}, { context: before.session })); equal(after.events, before.events); equal(after.session.meta, before.session.meta);
  }
  // Spawn routing compares the captured Agent class and its captured TeamMember
  // dependency; the backend boundary is a deterministic, non-executing fixture.
  for (const background of [false, true]) for (const auto of [false, true]) for (const requested of ["worker", "team-lead", "WORKER"]) for (const fails of [false, true]) {
    function build(original: boolean) {
      const events: any[] = [], registry: any = original ? new OriginalRegistry() : new TeamMemberRegistry(), main: any = { id: "lead", meta: { cwd: "/fixture" } }; let configuration: any = auto ? undefined : { name: "fixture", members: [{ name: "team-lead", agentType: "team-lead" }, { name: "worker", agentType: "Explore" }] };
      const manager: any = { isInTeam: () => !!configuration, getTeam: () => configuration, getMembers: () => configuration?.members ?? [], autoCreateTeam: async () => { events.push("auto-create"); configuration = { name: "_auto_lead", members: [{ name: "team-lead", agentType: "team-lead" }] }; }, addMember: async (member: any) => { events.push(["add", { ...member }]); configuration.members.push(member); }, removeMember: async (name: string) => { events.push(["remove", name]); configuration.members = configuration.members.filter((member: any) => member.name !== name); } };
      const poller: any = { startTeamLeadInboxPolling: (team: string, session: any) => events.push(["lead-poll", team, session.id]) }, tasks: any = { getTasks: () => [] };
      const mailbox: any = { startPolling: (team: string, member: string, _handler: any, delay: number) => { events.push(["member-poll", team, member, delay]); return () => undefined; } }, state: any = { isBusy: () => false }, queue: any = {}, idle: any = { register: (...args: any[]) => events.push(["idle-register", ...args]) };
      const backend: any = { spawn: async (spec: any) => { events.push(["backend", { ...spec, mainSession: spec.mainSession.id }]); if (fails) throw new Error("backend failed"); return { backendId: "task", agentId: `${spec.name}@${spec.teamName}`, backendType: "in-process", agentTask: { id: "task", status: "pending" } }; } };
      const runtime: any = { mailbox, messageQueue: queue, stateMachine: state, manager, registry, backend, taskManager: tasks, idleTracker: idle };
      const services: any = { logger: quiet, manager, mailbox, state, queue, backend, idle, tasks };
      const container = { ContainerUtil: { get: (key: string) => services[key] } }, tokens = { TeamManager: "manager", TeamMailbox: "mailbox", formatTeammateMessage, getTeamMemberColor };
      const SourceMember = evaluate(`(${source.slice(6995005, 7004426)})`, { eu: container, ed: { Logger: "logger" }, ey: tokens, ef: { MessageQueueManager: "queue" }, em: { SessionRunStateMachine: "state" }, eh: { AgentTaskManager: "tasks" }, eC: { InProcessTeammateBackend: "backend" }, ew: { TeammateIdleTracker: "idle" }, eE: { getTeamMemberRegistry: () => registry } });
      const OriginalAgent = evaluate(`(${source.slice(11853702, 11868971)})`, { iz: { BaseTool: class {} }, nC: { ToolNames: { AGENT: "Agent" } }, iJ: { z: z3 }, nk: container, oE: tokens, s7: { AgentTaskManager: "tasks" }, lu: { getTeamMemberRegistry: () => registry, startTeamLeadInboxPolling: (team: string, session: any) => poller.startTeamLeadInboxPolling(team, session) }, ll: { TeamMember: SourceMember } });
      const spawner = original ? Object.assign(new OriginalAgent(), { logger: quiet, cwdService: { getCwd: () => "/fixture" } }) : new TeamAgentSpawner(manager, registry, tasks, poller, runtime, () => "/fixture");
      return { spawner, events, main, manager };
    }
    const before = build(true), after = build(false), spec = { name: requested, description: "task", prompt: "prompt", subagentType: "Explore", agentType: "Explore", permissionMode: "plan", model: "model", maxTurns: 7 };
    equal(background ? await after.spawner.spawnBackground(after.main, spec) : await after.spawner.spawnTeammate(after.main, spec), background ? await before.spawner.spawnBackgroundAgent(before.main, spec) : await before.spawner.spawnTeammate(before.main, spec)); equal(after.events, before.events); equal(after.manager.getMembers(), before.manager.getMembers()); equal(after.main.meta, before.main.meta);
    if (fails) { equal(await after.spawner.spawnBackground(after.main, spec), await before.spawner.spawnBackgroundAgent(before.main, spec)); equal(after.events, before.events); }
  }
  const leadCodeStart = source.indexOf("function stopTeamLeadPoller()"), leadCodeEnd = source.indexOf("let eT=class", leadCodeStart);
  for (const busy of [false, true]) for (const paused of [false, true]) for (const rich of [false, true]) for (const deferred of [false, true]) for (const fulfill of [false, true]) for (const batch of [[{ from: "worker", text: "hello", summary: "preview", timestamp: "time" }], [{ from: "worker", text: '{"type":"shutdown_response","request_id":"request","approve":true}', timestamp: "time" }]]) {
    function build(original: boolean) {
      const events: any[] = [], session = new HarnessSession("lead"); if (busy) session.status = "model_streaming";
      const state = new SessionRunStateMachine(), queue = new MessageQueueManager(); let handler: any;
      const registry: any = { get: () => ({ info: { name: "worker" } }), remove: (...args: any[]) => events.push(["remove", ...args]) }, shutdown: any = { fulfillResponse: (...args: any[]) => { events.push(["fulfill", ...args]); return fulfill; } }, mailbox: any = { startPolling: (_team: string, _member: string, callback: any, delay: number) => { handler = callback; events.push(["poll", delay]); return () => { events.push("stop"); }; } };
      const richQueue: any = rich ? { enqueueItem: (...args: any[]) => { events.push(["rich-enqueue", ...args]); return { items: [{ id: "item" }] }; }, sendNow: (...args: any[]) => events.push(["send-now", ...args]) } : undefined;
      const run = async (input: any, options: any) => { events.push(["run", input, options.context.id]); }, services: any = { mailbox, state, queue, rich: richQueue, shutdown, service: { run: (_agent: any, input: any, options: any) => run(input, options) }, agents: { getDefault: async () => ({ name: "cli" }) } };
      const Original = original ? evaluate(`(()=>{let ed;${source.slice(leadCodeStart, leadCodeEnd)};return{startTeamLeadInboxPolling,stopTeamLeadPoller,setLeadInboxPaused}})()`, { eg: { ContainerUtil: { get: (key: string) => services[key] } }, ew: { TeamMailbox: "mailbox", formatTeammateMessage, TeamInboxDispatchService: "dispatch" }, eC: { ShutdownCoordinator: "shutdown" }, e_: { MessageQueueManager: "queue" }, eI: { SessionRunStateMachine: "state" }, eB: { RichMessageQueueManager: "rich" }, ev: { QueueDispatchUtils: { isDeferredDispatchEnabledSync: () => deferred } }, em: { AgentService: "service", AgentManager: "agents" }, eh: { Logger: "logger" }, eE: { user }, getTeamMemberRegistry: () => registry }) : undefined;
      const poller: any = original ? Original : new TeamLeadInboxPoller(mailbox, registry, shutdown, queue, state, { isDeferredDispatchEnabled: () => deferred, richQueue, runInput: (session, input) => run(input, { context: session }) });
      return { poller, events, session, handler: () => handler };
    }
    const before = build(true), after = build(false); for (const entry of [before, after]) { entry.poller.startTeamLeadInboxPolling("fixture", entry.session); entry.poller.setLeadInboxPaused(entry.session, paused); }
    equal(await outcome(() => after.handler()(batch)), await outcome(() => before.handler()(batch))); await settle(); equal(after.events, before.events); equal(after.session.queue, before.session.queue); before.poller.stopTeamLeadPoller(); after.poller.stopTeamLeadPoller(); equal(after.events, before.events);
  }
  for (const teammate of [false, true]) for (const rosterChanged of [false, true]) for (const resume of [false, true]) for (const skipRun of [false, true]) for (const input of [[], [{ type: "message", role: "user", content: "new" }], [{ type: "message", role: "user", content: "Agent Team Communication and Agent Teammate Communication" }, { type: "message", role: "user", content: "next" }]]) {
    const manager: any = { isInTeam: () => true, refreshFromDisk: async () => undefined, getMembers: () => [{ name: "team-lead", agentType: "team-lead" }, { name: "worker", agentType: "Explore" }], getTeam: () => ({ name: "fixture" }) }, renderer: any = { has: () => true, renderAsync: async (name: string, variables: any) => `${name}:${JSON.stringify(variables)}` };
    const context = () => ({ session: { options: { continue: resume }, meta: { __lastInjectedTeammates: rosterChanged ? "old" : teammate ? "team-lead" : "worker", ...(teammate ? { teamContext: { teamName: "fixture", memberName: "worker", teamMembers: [] } } : {}) } }, input: structuredClone(input), skipRun });
    const Original = evaluate(`(${source.slice(7180171, 7183219)})`, { A_: { AgentRunInterceptorPriority: { TeamContext: 1175 } }, Av: { ContainerUtil: { get: () => manager } }, nP: { TeamManager: "manager" }, nL: { MessageUtils: { addSystemReminder } }, nF: "__lastInjectedTeammates" });
    const before = Object.assign(new Original(), { promptManager: { get: async (name: string) => ({ template: name }), render: async (template: string, options: any) => renderer.renderAsync(template, options.variables) }, logger: quiet }), after = new TeamContextInterceptor(manager, renderer), left = context(), right = context();
    await after.intercept(left as any); await before.intercept(right); equal(left, right);
  }
} finally { globalThis.Date = savedDate; Math.random = savedRandom; if (savedEnv === undefined) delete process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS; else process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS = savedEnv; await fs.rm(root, { recursive: true, force: true }); }
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle", scope: "TeamManager/CRUD/file protocol/schema/messages/identity/member/backend/shutdown/spawn/roster/lead polling/worktree cleanup; no native detached process or HTTP transport" }, null, 2));
