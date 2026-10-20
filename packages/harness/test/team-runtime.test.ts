import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, access, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { TeamMailbox, type TeamMessage } from "../src/teams/team-mailbox.js";
import { TeamManager } from "../src/teams/team-manager.js";
import { TeamMember, TeamMemberRegistry } from "../src/teams/team-member.js";
import { TeamWorktreeCleanupService } from "../src/teams/team-worktree-cleanup.js";
import { ShutdownCoordinator, resolveShutdownTimeoutMs } from "../src/teams/shutdown-coordinator.js";
import { InProcessTeammateBackend } from "../src/teams/in-process-teammate-backend.js";
import { TeamTools, TeamCreateSchema } from "../src/tools/team-tools.js";
import { SendMessageTool, SendMessageSchema } from "../src/tools/send-message-tool.js";
import { TeamContextInterceptor } from "../src/agents/team-context-interceptor.js";
import { TeamLeadInboxPoller } from "../src/teams/team-lead-inbox-poller.js";
import { TeamAgentSpawner } from "../src/teams/team-agent-spawner.js";
import { AgentTaskManager } from "../src/agents/agent-task-manager.js";
import { MessageQueueManager } from "../src/sessions/message-queue-manager.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { HarnessSession } from "../src/sessions/session.js";
import { createHarness } from "../src/runtime/create-harness.js";
import type { TeamMemberInfo } from "../src/teams/team-types.js";
const exportedTraces: string[] = [];
setTraceProcessors([{ async onTraceStart() { exportedTraces.push("trace"); }, async onTraceEnd() {}, async onSpanStart() { exportedTraces.push("span"); }, async onSpanEnd() {}, async forceFlush() {}, async shutdown() {} }]);
const runtimeClosers = new WeakMap<object, Array<() => unknown>>();
function afterRuntime(t: object, close: () => unknown): void { const closers = runtimeClosers.get(t); if (!closers) throw new Error("Create the owned fixture directory before registering runtime teardown"); closers.push(close); }
async function directory(t: { after(fn: () => any): void }) { const root = await mkdtemp(join(tmpdir(), "harness-team-")); const closers: Array<() => unknown> = []; runtimeClosers.set(t, closers); t.after(async () => { for (const close of closers.reverse()) await close(); await rm(root, { recursive: true, force: true }); }); return root; }
async function until(predicate: () => boolean | Promise<boolean>, ms = 5000) { const start = Date.now(); while (!await predicate()) { if (Date.now() - start > ms) throw new Error("team fixture timeout"); await new Promise((done) => setTimeout(done, 2)); } }
const info = (name: string, team = "fixture"): TeamMemberInfo => ({ agentId: `${name}@${team}`, name, agentType: "general-purpose", joinedAt: 1, tmuxPaneId: "in-process", cwd: "/fixture", subscriptions: ["*"], color: "blue" });
const message = (text: string, from = "team-lead"): TeamMessage => ({ from, text, timestamp: new Date().toISOString(), summary: "fixture message" });
const call = (name: string, input: object, id: string) => [{ type: "function_call", name, id, callId: id, arguments: JSON.stringify(input), status: "completed" }];
const answer = (text: string) => [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text }] }];
function modelFixture(output: (request: any) => any[] | Promise<any[]>): Model { let count = 0; return { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse(request) { const items = await output(request); yield { type: "response_started" }; yield { type: "response_done", response: { id: `r-${++count}`, output: items, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any; } }; }
function pollFixture(mailbox: TeamMailbox) { const callbacks = new Map<string, (messages: TeamMessage[]) => void | Promise<void>>(); mailbox.startPolling = (team, member, handler) => { const key = `${team}/${member}`; callbacks.set(key, handler); return () => { callbacks.delete(key); }; }; return { callbacks, async poll(team: string, member: string) { const messages = await mailbox.getUnread(team, member); if (messages.length) { await callbacks.get(`${team}/${member}`)?.(messages); await mailbox.markAllAsRead(team, member); } } }; }
async function fixture(t: { after(fn: () => any): void }) {
  const root = await directory(t), mailbox = new TeamMailbox(root), manager = new TeamManager(root, mailbox, () => root, { cleanupTeamWorktrees: async () => ({ cleaned: [], preserved: [], failed: [] }) }), registry = new TeamMemberRegistry(), state = new SessionRunStateMachine(), queue = new MessageQueueManager(), shutdown = new ShutdownCoordinator(), taskManager = new AgentTaskManager();
  const polling = pollFixture(mailbox), runs: any[] = [], poller = new TeamLeadInboxPoller(mailbox, registry, shutdown, queue, state, { isDeferredDispatchEnabled: () => true, runInput: async (session, input) => { runs.push([session.id, input]); } });
  const session = new HarnessSession("lead"), tools = new TeamTools(manager, registry, poller), send = new SendMessageTool(manager, mailbox, registry, shutdown); session.meta.cwd = root;
  t.after(() => { poller.stopTeamLeadPoller(); mailbox.stopAll(); shutdown.cancelAll("fixture cleanup"); taskManager.stopCleanup(); });
  return { root, mailbox, manager, registry, state, queue, shutdown, taskManager, polling, runs, poller, session, tools, send };
}

test("team schemas and exact env gates preserve source advertised optional request/approval fields", async (t) => {
  const f = await fixture(t); assert.deepEqual(TeamCreateSchema.parse({ team_name: "x", extra: true }), { team_name: "x" }); assert.equal(SendMessageSchema.safeParse({ type: "shutdown_response" }).success, true); assert.equal(SendMessageSchema.safeParse({ type: "message" }).success, true);
  const previous = process.env.CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS;
  try { for (const [value, enabled] of [["0", false], ["false", true], ["1", true], ["", true]] as const) { process.env.CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS = value; assert.equal(f.manager.isEnabled(), enabled); } } finally { if (previous === undefined) delete process.env.CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS; else process.env.CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS = previous; }
});
test("team worktree cleanup preserves dirty paths and applies source force fallback only to known fixture directories", async (t) => {
  const root = await directory(t), dirty = join(root, "dirty"), clean = join(root, "clean"), failed = join(root, "failed"); for (const directory of [dirty, clean, failed]) await mkdir(directory);
  const removed: any[] = [], cleanup = new TeamWorktreeCleanupService({ remove: async (...args: any[]) => { removed.push(args); } } as any, { detect: async (directory) => { if (directory === failed) throw new Error("probe failed"); return { hasChanges: directory === dirty, uncommittedFiles: directory === dirty ? 1 : 0, unpushedCommits: 0, changedFiles: [], modifiedFiles: [], stagedFiles: [] }; } });
  const result = await cleanup.cleanupTeamWorktrees([{ ...info("dirty"), worktreePath: dirty }, { ...info("clean"), worktreePath: clean }, { ...info("failed"), worktreePath: failed }, info("no-worktree")]);
  assert.deepEqual(result, { cleaned: ["clean", "failed"], preserved: ["dirty"], failed: [] }); assert.deepEqual(removed, [[clean, { force: true, deleteBranch: true }]]); await access(dirty); await assert.rejects(access(failed));
});
test("TeamManager persists exact leader/config/inbox/task paths, updates, reloads and refuses invalid member mutations", async (t) => {
  const f = await fixture(t), team = await f.manager.createTeam("fixture", f.session, "purpose", "researcher"); assert.equal(team.leadAgentId, "team-lead@fixture"); assert.equal(team.members[0]!.agentType, "researcher"); assert.equal(team.isAutoTeam, undefined); assert.deepEqual(JSON.parse(await readFile(join(f.root, "teams/fixture/inboxes/team-lead.json"), "utf8")), []);
  await f.manager.addMember(info("worker")); await f.manager.updateMember("worker", { color: "red" }); assert.equal(f.manager.getMember("worker@fixture")?.color, "red");
  await assert.rejects(f.manager.addMember(info("worker")), /already exists/); await assert.rejects(f.manager.removeMember("team-lead"), /Cannot remove/); await assert.rejects(f.manager.removeMember("missing"), /not found/); await assert.rejects(f.manager.createTeam("another", f.session), /Already in a team/);
  const loaded = new TeamManager(f.root, f.mailbox, () => f.root, f.manager.cleanupService); assert.equal((await loaded.loadTeam("fixture"))?.members.length, 2); await f.manager.removeMember("worker"); await loaded.refreshFromDisk(); assert.equal(loaded.getMembers().length, 1);
  await f.manager.deleteTeam(); assert.equal(f.manager.isInTeam(), false); await assert.rejects(access(join(f.root, "tasks/fixture"))); await assert.rejects(access(join(f.root, "teams/fixture")));
});
test("TeamManager renames colliding explicit teams, replaces only stale auto-team paths and tracks session cleanup", async (t) => {
  const f = await fixture(t); await mkdir(join(f.root, "teams/fixture"), { recursive: true }); await writeFile(join(f.root, "teams/fixture/preserved"), "existing"); const created = await f.manager.createTeam("fixture", f.session); assert.match(created.name, /^fixture-/); assert.equal(await readFile(join(f.root, "teams/fixture/preserved"), "utf8"), "existing"); await f.manager.cleanupSessionTeams(); await assert.rejects(access(join(f.root, "teams", created.name)));
  const auto = new TeamManager(f.root, f.mailbox, () => f.root, f.manager.cleanupService); await mkdir(join(f.root, "teams/_auto_lead")); await writeFile(join(f.root, "teams/_auto_lead/stale"), "stale"); const team = await auto.autoCreateTeam("lead", f.session); assert.equal(team.isAutoTeam, true); await assert.rejects(access(join(f.root, "teams/_auto_lead/stale"))); await auto.cleanupSessionTeams();
});
test("Team create/delete preserve meta, renamed text, active-member refusal and exact removal envelope", async (t) => {
  const f = await fixture(t), context = { context: f.session } as any; assert.match((await f.tools.delete({}, context)).content, /Nothing to delete/); const result = await f.tools.create({ team_name: "fixture", description: "purpose" }, context); assert.equal(result.renderer.type, "team-created"); assert.equal(f.session.meta.isTeamLead, true); assert.match((await f.tools.create({ team_name: "second" }, context)).content, /Already in team/);
  const member = { teamName: "fixture", info: info("busy"), isActive: () => true } as any; f.registry.register(member); assert.match((await f.tools.delete({}, context)).content, /still active: busy/); f.registry.remove("busy", "fixture"); assert.match((await f.tools.delete({}, context)).content, new RegExp(`${f.root}/teams/fixture/`)); assert.equal(f.session.meta.teamName, undefined);
});
test("SendMessage resolves main alias, pending recipients, broadcast, strict sender identity and runtime required-field wording", async (t) => {
  const f = await fixture(t); await f.manager.createTeam("fixture", f.session); await f.manager.addMember(info("worker")); const context = { context: f.session } as any;
  assert.match((await f.send.execute({ type: "message" }, context)).content, /recipient/); assert.match((await f.send.execute({ type: "message", recipient: "worker", content: "hello" }, context)).content, /summary/);
  const delivered = await f.send.execute({ type: "message", recipient: "worker", content: "hello", summary: "five word summary" }, context); assert.equal(JSON.parse(delivered.content).routing.targetColor, "blue"); assert.equal((await f.mailbox.getUnread("fixture", "worker"))[0]!.from, "team-lead");
  assert.match(JSON.parse((await f.send.execute({ type: "message", recipient: "pending", content: "later", summary: "preview" }, context)).content).notice, /not yet registered/);
  assert.equal(JSON.parse((await f.send.execute({ type: "broadcast", content: "all", summary: "preview" }, context)).content).recipients.length, 1);
  const child = new HarnessSession("child"); assert.match((await f.send.execute({ type: "message", recipient: "main", content: "bad", summary: "preview" }, { context: child } as any)).content, /Cannot resolve sender identity/);
  child.meta.teamContext = { memberName: "worker", teamName: "fixture" }; await f.send.execute({ type: "message", recipient: "main", content: "reply", summary: "preview" }, { context: child } as any); assert.equal((await f.mailbox.getUnread("fixture", "team-lead"))[0]!.from, "worker");
});
test("SendMessage preserves shutdown/default-approve/plan routing payloads and source classifier difference for absent approve", async (t) => {
  const f = await fixture(t); await f.manager.createTeam("fixture", f.session); const child = new HarnessSession("child"); child.meta.teamContext = { memberName: "worker", teamName: "fixture" }; let killed = false; f.registry.register({ teamName: "fixture", info: info("worker"), forceKill: async (options: any) => { assert.equal(options.keepWakeable, false); killed = true; } } as any);
  assert.equal(f.send.toAutoClassifierInput({ type: "shutdown_response" }), "shutdown response: reject");
  const response = await f.send.execute({ type: "shutdown_response", request_id: "request" }, { context: child } as any); assert.equal(killed, true); assert.match(response.content, /shutting down/); assert.equal(f.registry.size, 0); assert.equal(JSON.parse((await f.mailbox.getUnread("fixture", "team-lead"))[0]!.text).approve, true);
  await f.send.execute({ type: "plan_approval_response", recipient: "main", approve: false, content: "revise" }, { context: child } as any); const plan = JSON.parse((await f.mailbox.getUnread("fixture", "team-lead")).at(-1)!.text); assert.equal(plan.feedback, "revise"); assert.equal(plan.approve, false);
});
test("ShutdownCoordinator covers env parsing, approval/rejection, timeout/send failure force kill and timeout=0 cancellation", async () => {
  const previous = process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS;
  try { for (const [value, expected] of [["0", 0], ["-1", 15000], ["bad", 15000], ["23x", 23]] as const) { process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS = value; assert.equal(resolveShutdownTimeoutMs(), expected); } } finally { if (previous === undefined) delete process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS; else process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS = previous; }
  const coordinator = new ShutdownCoordinator(); let id = "", kills = 0; const member = { teamName: "fixture", info: { name: "worker" }, isActive: () => true, sendMessage: async (_from: string, text: string) => { id = JSON.parse(text).request_id; }, forceKill: async () => { kills++; } };
  const approved = coordinator.shutdown(member, { timeoutMs: 0 }); await until(() => !!id); assert.equal(coordinator.fulfillResponse(id, true), true); assert.equal(await approved, "approved"); assert.equal(coordinator.fulfillResponse(id, true), false);
  id = ""; const rejected = coordinator.shutdown(member, { timeoutMs: 0 }); await until(() => !!id); coordinator.fulfillResponse(id, false); assert.equal(await rejected, "rejected"); assert.equal(await coordinator.shutdown(member, { timeoutMs: 5 }), "forced"); assert.equal(kills, 1);
  assert.equal(await coordinator.shutdown({ ...member, sendMessage: async () => { throw new Error("delivery failure"); } }), "forced"); assert.equal(kills, 2); const cancelled = coordinator.shutdown(member, { timeoutMs: 0 }); coordinator.cancelAll("test"); assert.equal(await cancelled, "timeout"); assert.equal(await coordinator.shutdown({ ...member, isActive: () => false }), "not-alive");
});
test("InProcess backend wraps assignments, registers detached formal tasks and preserves availability/liveness", async () => {
  let config: any, started = false, killed = false; const task: any = { id: "agent-fixture", status: "running", execute: async () => { started = true; return {}; }, kill: async () => { killed = true; task.status = "killed"; }, mainSessionId: "lead", startTime: 1 }, tasks = new AgentTaskManager();
  const backend = new InProcessTeammateBackend((value) => { config = value; return task; }, tasks), session = new HarnessSession("lead"); const result = await backend.spawn({ name: "worker", teamName: "fixture", prompt: "work", agentType: "Explore", cwd: "/fixture", mainSession: session, parentSessionId: session.id, memberIndex: 1 }); assert.equal(started, true); assert.equal(config.detached, true); assert.equal(config.isFormalTeamMember, true); assert.equal(config.teamContext.color, "green"); assert.match(config.prompt, /Initial task assignment for worker/); assert.equal(result.agentId, "worker@fixture"); assert.equal(await backend.isAlive(task.id), true); assert.equal(await backend.kill(task.id), true); assert.equal(killed, true); assert.equal(await backend.isAlive(task.id), false); assert.equal(await backend.kill(task.id), false);
});
test("TeamMember handles busy enqueue, idle wake, finished respawn and shutdown-only auto approval without respawn", async (t) => {
  const f = await fixture(t); await f.manager.createTeam("fixture", f.session); const child = new HarnessSession("child"), runs: any[] = [];
  const runtime: any = { mailbox: f.mailbox, manager: f.manager, registry: f.registry, messageQueue: f.queue, stateMachine: f.state, backend: {}, taskManager: f.taskManager, createTask: () => { throw new Error("unexpected"); }, runDefault: async (...args: any[]) => { runs.push(args); } };
  const member = new TeamMember("fixture", info("worker"), runtime), task: any = { id: "task", status: "running", getSubAgentSession: () => child, kill: async () => undefined }; member.setAgentTask(task); child.status = "model_streaming";
  await member.handleIncomingMessages([message("busy")]); assert.equal(child.queue.length, 1); child.status = "idle"; await member.handleIncomingMessages([message("idle")]); await until(() => runs.length === 1);
  task.status = "completed"; let respawns = 0; member.respawn = async () => { respawns++; }; await member.handleIncomingMessages([message("followup")]); assert.equal(respawns, 1); await until(async () => (await f.mailbox.getUnread("fixture", "team-lead")).length === 1);
  await member.handleIncomingMessages([message(JSON.stringify({ type: "shutdown_request", request_id: "shutdown" }))]); assert.equal(respawns, 1); assert.equal(JSON.parse((await f.mailbox.getUnread("fixture", "team-lead")).at(-1)!.text).approve, true);
});
test("lead poller preserves paused retry, busy queue, teammate metadata and fulfilled shutdown suppression", async (t) => {
  const f = await fixture(t); await f.manager.createTeam("fixture", f.session); f.poller.startTeamLeadInboxPolling("fixture", f.session); f.poller.setLeadInboxPaused(f.session, true); await assert.rejects(Promise.resolve(f.polling.callbacks.get("fixture/team-lead")!([message("hello", "worker")])), /lead inbox paused/);
  f.poller.setLeadInboxPaused(f.session, false); f.session.status = "model_streaming"; await f.polling.callbacks.get("fixture/team-lead")!([message("hello", "worker")]); assert.equal((f.session.queue[0] as any).providerData.teammateMessage.from, "worker"); f.session.status = "idle"; await f.polling.callbacks.get("fixture/team-lead")!([message("idle", "worker")]); await until(() => f.runs.length === 1);
});
test("Team context uses exact product templates and roster-change reinjection for lead and teammate", async (t) => {
  const root = await directory(t), runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => modelFixture(() => answer("done")) } }); afterRuntime(t, () => runtime.close()); const session = await runtime.openSession(); await runtime.teamManager.createTeam("fixture", session); await runtime.teamManager.addMember(info("worker"));
  const interceptor = new TeamContextInterceptor(runtime.teamManager, runtime.tools["prompts"] as any), context = { session, skipRun: false, input: [{ type: "message", role: "user", content: "question" }] } as any; await interceptor.intercept(context); assert.match(JSON.stringify(context.input), /Agent Team Communication/); assert.equal(session.meta.__lastInjectedTeammates, "worker");
  context.input.push({ type: "message", role: "user", content: "next" }); assert.equal(interceptor.shouldInjectTeamPrompt(context, "Agent Team Communication", "worker"), false); await runtime.teamManager.addMember(info("new")); await interceptor.intercept(context); assert.equal(session.meta.__lastInjectedTeammates, "new|worker");
});
test("real SDK non-deferred TeamCreate/SendMessage/TaskCreate/TeamDelete uses original allowlist and shared team task files", async (t) => {
  const root = await directory(t); let step = 0, taskScope = "";
  const model = modelFixture(() => { switch (step++) { case 0: return call("TeamCreate", { team_name: "sdk-team" }, "create"); case 1: return call("SendMessage", { type: "message", recipient: "pending", content: "mail", summary: "preview" }, "message"); case 2: return call("TaskCreate", { subject: "Shared task", description: "team scope" }, "task"); case 3: return call("TeamDelete", {}, "delete"); default: return answer("team deleted"); } });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); afterRuntime(t, () => runtime.close()); const original = runtime.taskStorage.create.bind(runtime.taskStorage); runtime.taskStorage.create = async (scope, ...args) => { taskScope = scope; return original(scope, ...args); };
  const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "create/message/task/delete team"), "team deleted"); assert.equal(taskScope, "sdk-team", JSON.stringify(session.history.filter((item) => item.type === "function_call_result"))); assert.equal(runtime.teamManager.isInTeam(), false); assert.match(JSON.stringify(session.history), /Recipient.*not yet registered/); await assert.rejects(access(join(root, ".workbuddy-harness/teams/sdk-team")));
});
test("real SDK named teammate runs detached, sends to main and wakes lead through recovered mailbox/queue", async (t) => {
  const root = await directory(t), visible: string[] = []; let parent = 0, child = 0;
  const model = modelFixture((request) => { const text = JSON.stringify(request.input); if (text.includes("Initial task assignment for worker")) return child++ === 0 ? call("SendMessage", { type: "message", recipient: "main", content: "child result", summary: "child completed requested work" }, "child-message") : answer("child finished"); return parent++ === 0 ? call("Agent", { description: "teammate work", prompt: "do fixture", name: "worker", subagent_type: "Explore" }, "spawn") : answer(parent === 2 ? "spawned" : "lead received child"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true, onScheduledOutput: (text) => visible.push(text) }); afterRuntime(t, () => runtime.close()); const polling = pollFixture(runtime.teamMailbox), session = await runtime.openSession(); await runtime.teamTools.create({ team_name: "sdk-team" }, { context: session } as any);
  assert.equal(await runtime.prompt(session, "spawn named teammate"), "spawned"); const member = runtime.teamMembers.get("worker", "sdk-team")!; assert.ok(member); await until(() => member.getAgentTask()?.status === "completed"); const inbox = await runtime.teamMailbox.getUnread("sdk-team", "team-lead"); assert.ok(inbox[0], JSON.stringify(member.getAgentTask()?.getSubAgentSession()?.history.filter((item) => item.type === "function_call_result"))); assert.equal(inbox[0].text, "child result"); await polling.poll("sdk-team", "team-lead"); await until(() => visible.length === 1); assert.equal(visible[0], "lead received child"); assert.match(JSON.stringify(session.history), /child result/);
});
test("background Agent auto-creates a team; completed member respawns with original child transcript and identity", async (t) => {
  const root = await directory(t); let parent = 0, child = 0; const childInputs: any[] = [];
  const model = modelFixture((request) => { const text = JSON.stringify(request.input); if (text.includes("Initial task assignment for Explore-1")) { childInputs.push(request.input); return answer(++child === 1 ? "first child output" : "resumed child output"); } return parent++ === 0 ? call("Agent", { description: "background task", prompt: "do fixture", subagent_type: "Explore", run_in_background: true }, "background") : answer("background started"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); afterRuntime(t, () => runtime.close()); pollFixture(runtime.teamMailbox); const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "background"), "background started"); const team = runtime.teamManager.getTeam()!; assert.equal(team.isAutoTeam, true); assert.equal(team.name, `_auto_${session.id}`); const member = runtime.teamMembers.get("Explore-1", team.name)!; await until(() => member.getAgentTask()?.status === "completed"); const original = member.getTaskId(); await member.handleIncomingMessages([message("second instruction", "user")]); await until(() => member.getTaskId() !== original && member.getAgentTask()?.status === "completed"); assert.match(JSON.stringify(childInputs[1]), /first child output/); assert.match(JSON.stringify(childInputs[1]), /second instruction/); assert.equal(member.getAgentTask()?.getSubAgentSession()?.meta.teamContext && (member.getAgentTask()!.getSubAgentSession()!.meta.teamContext as any).memberName, "Explore-1");
});
test("harness close aborts and awaits an active detached SDK teammate before deleting its session-owned team", async (t) => {
  assert.deepEqual(exportedTraces, [], "background and external-context respawns must not export traces");
  const root = await directory(t); let parent = 0, entered = false, aborted = false;
  const model = modelFixture(async (request) => { if (JSON.stringify(request.input).includes("Initial task assignment for worker")) { entered = true; await new Promise<void>((_done, reject) => request.signal.addEventListener("abort", () => { aborted = true; reject(new Error("fixture aborted")); }, { once: true })); } return parent++ === 0 ? call("Agent", { description: "blocked teammate", prompt: "block", name: "worker", subagent_type: "Explore" }, "blocked") : answer("started"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); afterRuntime(t, () => runtime.close()); pollFixture(runtime.teamMailbox); const session = await runtime.openSession(); await runtime.teamTools.create({ team_name: "closing" }, { context: session } as any); await runtime.prompt(session, "spawn"); await until(() => entered); await runtime.close(); assert.equal(aborted, true); assert.equal(runtime.teamMembers.size, 0); await assert.rejects(access(join(root, ".workbuddy-harness/teams/closing")));
});

test("parallel SDK Agent calls serialize teammate registration and preserve case-insensitive rename/colors", async (t) => {
  const root = await directory(t); let parent = 0;
  const model = modelFixture((request) => { if (JSON.stringify(request.input).includes("Initial task assignment for ")) return answer("member done"); if (parent++ === 0) return [...call("Agent", { description: "first worker", name: "worker", subagent_type: "Explore", prompt: "first" }, "first-worker"), ...call("Agent", { description: "second worker", name: "WORKER", subagent_type: "Explore", prompt: "second" }, "second-worker")]; return answer("both spawned"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); afterRuntime(t, () => runtime.close()); pollFixture(runtime.teamMailbox); const session = await runtime.openSession(); await runtime.teamTools.create({ team_name: "parallel" }, { context: session } as any);
  assert.equal(await runtime.prompt(session, "spawn two"), "both spawned"); assert.equal(runtime.teamMembers.get("worker", "parallel")?.info.color, "blue"); assert.equal(runtime.teamMembers.get("WORKER-2", "parallel")?.info.color, "green"); assert.match(JSON.stringify(session.history), /Renamed to/); await until(() => runtime.teamMembers.getAll().every((member) => member.getAgentTask()?.status === "completed"));
});

test("busy teammate mailbox input waits for its active SDK response and drains without overlapping model requests", async (t) => {
  const root = await directory(t); let parent = 0, child = 0, entered = false, simultaneous = 0, maximum = 0, release!: () => void; const gate = new Promise<void>((done) => { release = done; }), inputs: string[] = [];
  const model = modelFixture(async (request) => {
    const text = JSON.stringify(request.input); if (text.includes("Initial task assignment for worker")) { inputs.push(text); simultaneous++; maximum = Math.max(maximum, simultaneous); if (++child === 1) { entered = true; await gate; } simultaneous--; return answer(child === 1 ? "initial response" : "queued response"); }
    return parent++ === 0 ? call("Agent", { description: "queue test", prompt: "initial assignment", name: "worker", subagent_type: "Explore" }, "queue-worker") : answer("spawned");
  });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); afterRuntime(t, () => { release(); return runtime.close(); }); pollFixture(runtime.teamMailbox); const session = await runtime.openSession(); await runtime.teamTools.create({ team_name: "queued" }, { context: session } as any); await runtime.prompt(session, "spawn"); await until(() => entered);
  const member = runtime.teamMembers.get("worker", "queued")!; await member.handleIncomingMessages([message("follow-up while busy", "user")]); assert.equal(child, 1); assert.equal(member.getAgentTask()!.getSubAgentSession()!.queue.length, 1); release(); await until(() => child === 2 && member.getAgentTask()?.getSubAgentSession()?.status === "idle"); assert.equal(maximum, 1); assert.match(inputs[1]!, /follow-up while busy/);
});
