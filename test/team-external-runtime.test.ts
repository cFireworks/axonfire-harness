import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { TeamMailbox } from "../src/teams/team-mailbox.js";
import { HarnessSession } from "../src/sessions/session.js";
import { DetachedProcessTeammateBackend } from "../src/teams/detached-process-teammate-backend.js";
import { DaemonProcessManager } from "../src/teams/daemon-process-manager.js";
import { TmuxTeammateBackend } from "../src/teams/tmux-teammate-backend.js";
import { TeammateBackendRegistry } from "../src/teams/teammate-backend-registry.js";
import { HttpTransport, TeammateTransportFactory, withSecurityHeader } from "../src/teams/teammate-transport.js";
import { PermissionBridgeClient, PermissionBridgeService } from "../src/teams/permission-bridge.js";
import { DetachedMemberSseBridge } from "../src/teams/detached-member-sse-bridge.js";
import { TeammateRunner, getArgValue, hasArg } from "../src/teams/teammate-runner.js";
import { StandaloneTeamGateway } from "../src/runtime/standalone-team-gateway.js";
import { createHarness } from "../src/runtime/create-harness.js";

async function directory(t: { after(fn: () => any): void }) { const root = await mkdtemp(join(tmpdir(), "harness-team-external-")); t.after(() => rm(root, { recursive: true, force: true })); return root; }
async function until(check: () => unknown | Promise<unknown>, ms = 10000) { const deadline = Date.now() + ms; while (Date.now() < deadline) { if (await check()) return; await new Promise((done) => setTimeout(done, 25)); } throw new Error("External Team fixture timed out"); }
function spec() { const session = new HarnessSession("lead"); return { name: "worker", teamName: "fixture", prompt: "work", agentType: "general-purpose", cwd: "/fixture", mainSession: session, parentSessionId: session.id }; }

test("Detached backend preserves CLI/env, PID-before-mailbox ownership and force-kill fallback", async () => {
  const events: any[] = [], manager = { forkBgSession: async (...args: any[]) => { events.push(["fork", ...args]); return { pid: 321, logPath: "/log" }; }, sendSignal: (_pid: number, signal: string) => { events.push(signal); return true; }, waitForExit: async () => false, isProcessRunning: () => true };
  const backend: DetachedProcessTeammateBackend = new DetachedProcessTeammateBackend(manager, { send: async (): Promise<void> => { assert.equal(backend.processes.size, 1); } });
  assert.deepEqual(backend.buildCliArgs({ ...spec(), maxTurns: 0, model: "", color: "green" }), ["--serve", "--teammate-mode", "--team-name", "fixture", "--agent-name", "worker", "--agent-type", "general-purpose", "--parent-session-id", "lead", "--agent-color", "green"]);
  const spawned = await backend.spawn({ ...spec(), leaderEndpoint: "http://leader" }); assert.equal(spawned.pid, 321); assert.equal(events[0][2].skipAutoApprove, true); assert.equal(events[0][2].extraEnv.CODEBUDDY_SESSION_KIND, "teammate"); assert.equal(await backend.kill("worker@fixture"), true); assert.deepEqual(events.slice(1), ["SIGTERM", "SIGKILL"]); assert.equal(await backend.kill("absent"), false);
  const failed = new DetachedProcessTeammateBackend(manager, { send: async () => { throw new Error("mailbox"); } }); await assert.rejects(failed.spawn(spec()), /mailbox/); assert.equal(failed.processes.size, 1);
});
test("Daemon argument helpers retain native flag/value quirks and reject unsafe PIDs", () => {
  const manager = new DaemonProcessManager({ logDir: () => "/logs" });
  assert.deepEqual(manager.filterBgArgs(["--bg", "--name", "worker", "--name=x", "--model", "m", "prompt"]), ["--model", "m", "prompt"]);
  assert.deepEqual(manager.buildDaemonChildArgs({ startupArgs: ["-y"], permissionMode: "default" }), ["--serve", "-y", "--permission-mode", "bypassPermissions"]);
  for (const pid of [-1, 0, 1.1, NaN, process.pid]) assert.equal(manager.sendSignal(pid, "SIGTERM"), false);
  assert.equal(manager.isProcessRunning(process.pid), true);
});
test("Registry priority and tmux commands are recovered without touching real user panes", async () => {
  const fake = (type: string, available: boolean): any => ({ type, isAvailable: async () => available });
  const registry = new TeammateBackendRegistry(fake("in-process", false), fake("detached-process", true), fake("tmux", true)); assert.equal((await registry.getBackend()).type, "tmux"); assert.equal((await registry.getBackend("detached-process")).type, "detached-process");
  const commands: any[] = [], backend = new TmuxTeammateBackend({ isInsideTmux: () => true, isAvailable: async () => ({ available: true }) }, { send: async () => undefined }, {}, ((...args: any[]) => { commands.push(args); return { status: 0, stdout: "%42\n", stderr: "" }; }) as any);
  assert.equal(await backend.isAvailable(), true); assert.equal(backend.shellEscape("a'b"), "'a'\\''b'"); await backend.spawn(spec()); assert.equal(commands[0][1][0], "split-window"); assert.equal(await backend.isAlive("worker@fixture"), true); assert.equal(await backend.kill("worker@fixture"), true); assert.equal(commands.at(-1)[1][0], "kill-pane"); assert.match(backend.buildShellCommand(spec()), / -y$/);
});
test("Transport factory retains invalid-url/local and IPv6 hostname classification", async (t) => {
  const factory = new TeammateTransportFactory(new TeamMailbox(await directory(t)));
  for (const url of ["bad", "http://127.0.0.1:42", "http://localhost"]) assert.equal(factory.create({ leaderEndpoint: url }).type, "mailbox");
  assert.equal(factory.create({ leaderEndpoint: "http://[::1]:42" }).type, "http"); assert.equal(factory.create({ isRemote: true, leaderEndpoint: "http://localhost" }).type, "http"); assert.deepEqual(withSecurityHeader({ "x-codebuddy-request": "wrong" }), { "x-codebuddy-request": "1" });
});
test("Loopback gateway exercises recovered mailbox REST envelopes and approval bridge", async (t) => {
  const mailbox = new TeamMailbox(await directory(t)), session = new HarnessSession("leader"), approval: any = { approve() { throw new Error("native fallback"); }, reject() { throw new Error("native fallback"); } };
  const bridge = new PermissionBridgeService({ getCurrent: () => session }, approval), gateway = new StandaloneTeamGateway({ mailbox, permissionBridge: bridge }); const endpoint = await gateway.start(); t.after(() => gateway.close());
  const transport = new HttpTransport(endpoint), message = { from: "leader", text: "hello", timestamp: "fixture" }; await transport.send("fixture", "worker", message); assert.equal((await transport.getUnread("fixture", "worker"))[0]!.text, "hello"); await transport.markAllAsRead("fixture", "worker"); assert.deepEqual(await transport.getUnread("fixture", "worker"), []);
  const client = new PermissionBridgeClient(endpoint, "worker", "mismatching-team"); assert.equal(await client.isAvailable(), true);
  // The source's discarded team-name condition still returns this session.
  const subscription = session.interruptionSubject.subscribe((item: any) => { if (item?._bridgeRequestId) setImmediate(() => approval.approve(item, { decision: "allowAll" })); }); t.after(() => subscription.unsubscribe());
  assert.deepEqual(await client.requestPermission("Read", { file_path: "fixture" }, "call"), { decision: "allowAll", reason: undefined }); assert.equal(bridge.pendingRequests.size, 0);
  assert.equal((await fetch(`${endpoint}/api/v1/auth/status`)).status, 403);
  const invalid = await fetch(`${endpoint}/api/v1/permission-bridge/request`, { method: "POST", headers: withSecurityHeader(), body: "{}" }); assert.equal(invalid.status, 400);
  await assert.rejects(transport.send("../outside", "worker", message), /400/);
});
test("Permission bridge no leader and cancellation fail closed, preserving native approval surface", async () => {
  const request = { requestId: "request", teammateName: "worker", teamName: "fixture", toolName: "Read", toolArguments: '{"file_path":"x"}', toolCallId: "call", timestamp: "fixture" }, approval = { approve() {}, reject() {} };
  const missing = new PermissionBridgeService({ getCurrent: () => undefined }, approval); assert.equal((await missing.handleRequest(request)).reason, "Leader session not available");
  const session = new HarnessSession("leader"), bridge = new PermissionBridgeService({ getCurrent: () => session }, approval), abort = new AbortController(), pending = bridge.handleRequest(request, abort.signal); assert.equal((session.interruptionSubject.value as any).rawItem.arguments, request.toolArguments); abort.abort(); assert.equal((await pending).reason, "Request cancelled"); assert.equal(bridge.pendingRequests.size, 0);
});
test("Malformed successful HTTP JSON differs between mailbox and permission clients", async (t) => {
  const server = createServer((_req, res) => { res.end("not json"); }); await new Promise<void>((done) => server.listen(0, "127.0.0.1", done)); t.after(() => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => done()); })); const endpoint = `http://127.0.0.1:${(server.address() as any).port}`;
  assert.deepEqual(await new HttpTransport(endpoint).getUnread("x", "y"), []); const decision = await new PermissionBridgeClient(endpoint, "y", "x").requestPermission("Read", {}, "id"); assert.equal(decision.decision, "deny"); assert.match(decision.reason!, /Invalid JSON response/);
});
test("SSE replay preserves call_id precedence, member metadata and history-only connection", async (t) => {
  const root = await directory(t), path = join(root, "endpoint.json"), events: any[] = [], notifications: string[] = [], bridge = new DetachedMemberSseBridge({}, "leader", { sessionUpdate: async (event) => { events.push(event); } }, () => path); bridge.setAcpAgent({ notifyToolCallSent: (id) => notifications.push(id) });
  await writeFile(path, JSON.stringify({ endpoint: "http://unreachable.invalid", sessionId: "child", history: [{ type: "function_call", callId: "ignored", id: "id", call_id: "native", name: "Read", arguments: "{}" }, { type: "message", role: "assistant", content: "answer" }] }));
  assert.equal(await bridge.connectMember("fixture", "worker"), true); assert.equal(bridge.connections.get("worker")!.abortController, undefined); assert.equal(events[0].update.toolCallId, "native"); assert.equal(events[1].update._meta["codebuddy.ai/memberEvent"], "worker"); assert.deepEqual(notifications, ["native"]); bridge.disconnectAll(); assert.equal(bridge.isConnected("worker"), false);
});
test("Real ACP observation stream forwards persisted input events and disconnects cleanly", async (t) => {
  const root = await directory(t), path = join(root, "endpoint.json"), gateway = new StandaloneTeamGateway({ mailbox: new TeamMailbox(root) }), session = new HarnessSession("child"), events: any[] = []; gateway.observeSession(session); const endpoint = await gateway.start(); t.after(() => gateway.close());
  await writeFile(path, JSON.stringify({ endpoint, sessionId: session.id })); const bridge = new DetachedMemberSseBridge({}, "leader", { sessionUpdate: async (event) => { events.push(event); } }, () => path); t.after(() => bridge.disconnectAll()); assert.equal(await bridge.connectMember("fixture", "worker"), true);
  await until(() => (gateway as any).streams.size === 1); session.inputSubject.next({ type: "message", role: "assistant", content: "live" } as any); await until(() => events.some((event) => event.update.content?.text === "live")); bridge.disconnectAll(); await until(() => (gateway as any).streams.size === 0);
});
test("Teammate Runner consumes initial assignment, acknowledges shutdown and writes endpoint history", async (t) => {
  const root = await directory(t), session = new HarnessSession("child"), sends: any[] = [], inputs: any[] = []; let reads = 0, exit: number | undefined;
  const runner = new TeammateRunner({ getUnread: async () => ++reads === 1 ? [{ from: "user", text: "work", timestamp: "1" }] : [{ from: "team-lead", text: '{"type":"shutdown_request","request_id":"shutdown"}', timestamp: "2" }], markAllAsRead: async () => undefined, send: async (...args) => { sends.push(args); } }, { create: async () => session, initRunResultHandler() {} }, { runDefault: async (input) => { inputs.push(input); } }, () => join(root, "endpoint.json"), {}, { args: ["--parent-session-id=parent"], sleep: async () => undefined, exit: (code) => { exit = code; }, onSignal() {}, endpointProvider: { get: async () => "http://child" } });
  await runner.runService("fixture", "worker"); assert.equal(exit, 0); assert.equal(session.meta.parentSessionId, "parent"); assert.match(JSON.stringify(inputs), /work/); assert.equal(JSON.parse(sends[0][2].text).request_id, "shutdown"); const endpoint = JSON.parse(await readFile(join(root, "endpoint.json"), "utf8")); assert.equal(endpoint.sessionId, "child"); assert.equal(endpoint.history, undefined); assert.equal(getArgValue("--x", ["--x=first", "--x", "second"]), "first"); assert.equal(hasArg("--x", ["--x=yes"]), false);
});
test("Explicit detached host spawns real CLI, relays leader approval, resumes mailbox and reaps PID", { timeout: 25000 }, async (t) => {
  const root = await directory(t), path = join(root, "fixture.txt"); await writeFile(path, "external fixture\n"); const requests: any[] = [], approvals: string[] = [], events: any[] = [];
  const server = createServer(async (req, res) => {
    let text = ""; for await (const chunk of req) text += chunk; const body = JSON.parse(text); requests.push(body);
    const index = requests.length, delta = index === 1 ? { role: "assistant", tool_calls: [{ index: 0, id: "child-read", type: "function", function: { name: "Read", arguments: JSON.stringify({ file_path: path }) } }] } : { role: "assistant", content: index === 2 ? "external complete" : "mailbox followup complete" };
    const packet = (data: any, finish: string | null) => ({ id: `chat-${index}`, object: "chat.completion.chunk", created: 1, model: "offline-http", choices: [{ index: 0, delta: data, finish_reason: finish }] });
    res.writeHead(200, { "content-type": "text/event-stream" }); res.write(`data: ${JSON.stringify(packet(delta, null))}\n\n`); res.write(`data: ${JSON.stringify(packet({}, index === 1 ? "tool_calls" : "stop"))}\n\n`); res.end("data: [DONE]\n\n");
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done)); t.after(() => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => done()); }));
  const runtime = await createHarness({ workDir: root, stateDir: join(root, "state"), apiKey: "offline-key", baseURL: `http://127.0.0.1:${(server.address() as any).port}/v1`, model: "offline-http", teamBackend: "detached-process", approveTool: (name) => { approvals.push(name); return true; }, onTeamMemberUpdate: (event) => { events.push(event); } }); t.after(() => runtime.close());
  const lead = await runtime.openSession(); await runtime.teamTools.create({ team_name: "external" }, { context: lead } as any);
  const spawned = await runtime.teamSpawner.spawnTeammate(lead, { name: "worker", description: "external worker", prompt: "read fixture", subagentType: "general-purpose" }); assert.match(spawned.content, /Spawned successfully/);
  const member = runtime.teamMembers.get("worker", "external")!; assert.equal(member.info.backendType, "detached-process"); assert.equal(member.getAgentTask(), undefined); assert.equal(member.getTaskId(), ""); assert.ok(member.info.pid);
  let endpoint: any;
  try {
    await until(async () => { try { endpoint = JSON.parse(await readFile(runtime.teamMailbox.getTeamMemberEndpointPath("external", "worker"), "utf8")); return endpoint.endpoint; } catch { return false; } });
    assert.equal(await runtime.detachedTeamHost.connectMember(lead, "external", "worker"), true);
    await until(() => requests.length >= 2); await until(() => events.some((event) => event.update.content?.text === "external complete")); assert.deepEqual(approvals, ["Read"]); assert.match(JSON.stringify(requests[1].messages), /external fixture/);
    await member.sendMessage("user", "second instruction"); await until(() => requests.length >= 3); assert.match(JSON.stringify(requests[2].messages), /external complete/); assert.match(JSON.stringify(requests[2].messages), /second instruction/);
    await member.requestShutdown(); await until(() => !runtime.detachedTeamHost.processManager.isProcessRunning(member.info.pid!)); await access(runtime.teamMailbox.getTeamConfigPath("external")); endpoint = JSON.parse(await readFile(runtime.teamMailbox.getTeamMemberEndpointPath("external", "worker"), "utf8")); assert.match(JSON.stringify(endpoint.history), /mailbox followup complete/);
    // Source external isActive does not consult PID until explicitly killed.
    assert.equal(member.isActive(), true); assert.equal(await member.isAliveAsync(), false);
  } catch (error) { const log = await readFile(member.info.logPath!, "utf8").catch(() => "missing log"); throw new Error(`${String(error)}\nRequests=${requests.length}; approvals=${JSON.stringify(approvals)}; events=${JSON.stringify(events)}; endpoint=${JSON.stringify(endpoint)}\nChild log:\n${log}`); }
  await runtime.close(); assert.equal(runtime.detachedTeamHost.processManager.isProcessRunning(member.info.pid!), false); await assert.rejects(access(runtime.teamMailbox.getTeamConfigPath("external")));
});
test("Detached host close aborts an active child stream before removing the parent-owned team", { timeout: 20000 }, async (t) => {
  const root = await directory(t); let entered = false, disconnected = false;
  const server = createServer(async (req, res) => { for await (const _chunk of req) {} entered = true; res.on("close", () => { disconnected = true; }); res.writeHead(200, { "content-type": "text/event-stream" }); res.flushHeaders(); });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done)); t.after(() => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => done()); }));
  const runtime = await createHarness({ workDir: root, apiKey: "offline-key", baseURL: `http://127.0.0.1:${(server.address() as any).port}/v1`, model: "offline-http", teamBackend: "detached-process" }); t.after(() => runtime.close()); const lead = await runtime.openSession(); await runtime.teamManager.createTeam("closing", lead);
  const result = await runtime.teamSpawner.spawnTeammate(lead, { name: "worker", description: "blocked stream", prompt: "wait", subagentType: "general-purpose" }); assert.match(result.content, /Spawned successfully/); const member = runtime.teamMembers.get("worker", "closing")!;
  await until(() => entered); await runtime.close(); await until(() => disconnected); assert.equal(runtime.detachedTeamHost.processManager.isProcessRunning(member.info.pid!), false); await assert.rejects(access(runtime.teamMailbox.getTeamConfigPath("closing")));
});
test("Standalone owned-PID ledger reaps native spawn-before-mailbox failures", { timeout: 15000 }, async (t) => {
  const root = await directory(t), runtime = await createHarness({ workDir: root, apiKey: "offline-key", baseURL: "http://127.0.0.1:1/v1", model: "offline-http", teamBackend: "detached-process" }); t.after(() => runtime.close());
  const main = await runtime.openSession(); runtime.teamMailbox.send = async () => { throw new Error("fixture mailbox failure"); };
  await assert.rejects(runtime.teammateBackend.spawn({ ...spec(), cwd: root, mainSession: main, parentSessionId: main.id }), /fixture mailbox failure/);
  const pid = runtime.detachedTeamHost.detached.processes.get("worker@fixture")!.pid; assert.equal(runtime.detachedTeamHost.processManager.isProcessRunning(pid), true); await runtime.close(); assert.equal(runtime.detachedTeamHost.processManager.isProcessRunning(pid), false);
});
