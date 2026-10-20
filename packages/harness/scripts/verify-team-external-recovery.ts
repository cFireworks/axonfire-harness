import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import { EventEmitter } from "node:events";
import { syncBuiltinESMExports } from "node:module";
import { user } from "@openai/agents-core";
import { HarnessSession } from "../src/sessions/session.js";
import { TeamMailbox, formatTeammateMessage } from "../src/teams/team-mailbox.js";
import { DaemonProcessManager, ENV_SESSION_KIND, ENV_SESSION_NAME, ENV_SESSION_LOG } from "../src/teams/daemon-process-manager.js";
import { DetachedProcessTeammateBackend } from "../src/teams/detached-process-teammate-backend.js";
import { TmuxTeammateBackend } from "../src/teams/tmux-teammate-backend.js";
import { TeammateBackendRegistry } from "../src/teams/teammate-backend-registry.js";
import { PermissionBridgeService, PermissionBridgeClient } from "../src/teams/permission-bridge.js";
import { DetachedMemberSseBridge } from "../src/teams/detached-member-sse-bridge.js";
import { TeammateRunner } from "../src/teams/teammate-runner.js";
import { HttpTransport, TeammateTransportFactory, withSecurityHeader } from "../src/teams/teammate-transport.js";
const filename = process.argv[2]; if (!filename) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(filename, "utf8"); assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const log = { info() {}, warn() {}, debug() {}, error() {}, setContext() {} }, fixedTime = 1790000000000;
class FixedDate extends Date { constructor(value?: any) { super(value ?? fixedTime); } static override now() { return fixedTime; } }
const environment = { ENV_SESSION_KIND, ENV_SESSION_NAME, ENV_SESSION_LOG };
function evaluate(code: string, bindings: object = {}): any { return runInNewContext(code, { Error, Date: FixedDate, process, URL, Buffer, setTimeout, clearTimeout, ...bindings }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
function original(start: number, end: number, bindings: object = {}): any { const code = source.slice(start, end); assert.match(code, /^class/); return evaluate(`(${code})`, bindings); }
let comparisons = 0;
function normalize(value: any): any { return JSON.parse(JSON.stringify(value, (_key, item) => item instanceof Error ? { name: item.name, message: item.message } : item) ?? "null"); }
function equal(after: any, before: any) { assert.deepEqual(normalize(after), normalize(before)); comparisons++; }
async function outcome(operation: () => unknown) { try { return { result: await operation() }; } catch (error) { return { error }; } }
const savedDate = globalThis.Date; globalThis.Date = FixedDate as DateConstructor;
try {
  const Detached = original(8401515, 8403168, { iK: environment, r6: { ContainerUtil: { get: () => mailbox } }, n$: { TeamMailbox } }); let mailbox: any;
  const base: any = { name: "w'orker", teamName: "team space", prompt: "work", cwd: "/fixture space", agentType: "Explore", parentSessionId: "lead", mainSession: new HarnessSession("lead") };
  for (const parent of [undefined, "", "lead"]) for (const color of [undefined, "", "blue"]) for (const model of [undefined, "", "custom-local:m"]) for (const leader of [undefined, "", "http://leader"]) for (const maxTurns of [undefined, 0, 4, -1]) {
    const spec = { ...base, parentSessionId: parent, color, model, leaderEndpoint: leader, maxTurns }, after = new DetachedProcessTeammateBackend({} as any, {} as any), before = new Detached(); equal(after.buildCliArgs(spec), before.buildCliArgs(spec)); equal(after.buildTeammateEnv(spec), before.buildTeammateEnv(spec));
  }
  for (const sendFails of [false, true]) for (const term of [false, true]) for (const exits of [false, true]) {
    async function run(native: boolean) { const events: any[] = [], manager: any = { forkBgSession: async (...args: any[]) => { events.push(["fork", ...args]); return { pid: 42, logPath: "/log" }; }, sendSignal: (...args: any[]) => { events.push(["signal", ...args]); return term; }, waitForExit: async (...args: any[]) => { events.push(["wait", ...args]); return exits; }, isProcessRunning: () => exits }; mailbox = { send: async (...args: any[]) => { events.push(["send", ...args]); if (sendFails) throw new Error("mailbox"); } }; const backend = native ? Object.assign(new Detached(), { processManager: manager }) : new DetachedProcessTeammateBackend(manager, mailbox); const spawn = await outcome(() => backend.spawn(base)), alive = await backend.isAlive(`${base.name}@${base.teamName}`), killed = await backend.kill(`${base.name}@${base.teamName}`); return { events, spawn, alive, killed, missing: await backend.kill("absent"), entries: [...backend.processes] }; }
    equal(await run(false), await run(true));
  }
  const Daemon = original(8975002, 8978316, { iK: environment, iD: path, iv: { mkdir: async () => undefined }, px: 200 });
  for (const startupArgs of [[], ["-y"], ["--permission-mode", "plan"], ["--permission-mode=plan"], ["--dangerously-skip-permissions"], ["--model", "m"]]) for (const permissionMode of [undefined, "", "default", "plan"]) { equal(new DaemonProcessManager({ logDir: () => "/logs" }).buildDaemonChildArgs({ startupArgs, permissionMode } as any), new Daemon().buildDaemonChildArgs({ startupArgs, permissionMode })); }
  for (const args of [[], ["--bg", "--name", "worker", "p"], ["--background", "--name=x", "--model", "m"], ["--name"], ["--name", "--bg", "kept"], ["-p", "-y"]]) { const after = new DaemonProcessManager({ logDir: () => "/logs" }), before = new Daemon(); equal(after.filterBgArgs(args), before.filterBgArgs(args)); for (const flag of ["--name", "--model", "-p"]) equal(after.hasFlagWithValue(args, flag), before.hasFlagWithValue(args, flag)); }
  for (const print of [false, true]) for (const approve of [false, true]) for (const name of [undefined, "", "worker"]) {
    async function run(native: boolean) { const backend = native ? new Daemon() : new DaemonProcessManager({ logDir: () => process.cwd() }); backend.getLogDir = () => process.cwd(); backend.forkDetached = async (...args: any[]) => args; const result = await backend.forkBgSession(["--bg", "--name=drop", "--model", "m"], { name, skipPrintMode: print, skipAutoApprove: approve, cwd: "/fixture", extraEnv: { CODEBUDDY_SESSION_KIND: "teammate" } }); return result; } equal(await run(false), await run(true));
  }
  for (const inside of [false, true]) for (const available of [false, true]) for (const fail of [false, true]) {
    async function run(native: boolean) { const events: any[] = [], service = { isInsideTmux: () => inside, isAvailable: async () => ({ available }) }, command = (...args: any[]) => { events.push(args); return { status: fail ? 1 : 0, stdout: "%42\n", stderr: "fixture error" }; }; const Tmux = original(8403979, 8407658, { iK: environment, iJ: { spawnSync: command }, r6: { ContainerUtil: { get: () => mailbox } }, n$: { TeamMailbox } }); mailbox = { send: async (...args: any[]) => { events.push(["send", ...args]); } }; const backend = native ? Object.assign(new Tmux(), { tmuxService: service, logger: log }) : new TmuxTeammateBackend(service, mailbox, log, command as any); const result = await outcome(() => backend.spawn(base)); return { result, events, available: await backend.isAvailable(), alive: await backend.isAlive(`${base.name}@${base.teamName}`), killed: await backend.kill(`${base.name}@${base.teamName}`), shell: backend.buildShellCommand({ ...base, leaderEndpoint: "http://leader", model: "m'odel", maxTurns: 5 }), quote: backend.shellEscape("a'b\nc") }; } equal(await run(false), await run(true));
  }
  const Registry = original(source.indexOf("class{async getBackend", 8408600), source.indexOf(";teammate_backend_registry_decorate", 8408600));
  for (const inProcess of [false, true]) for (const tmux of [false, true]) for (const preferred of [undefined, "in-process", "tmux", "detached-process", "unknown"]) {
    async function run(native: boolean) { const fake = (type: string, available: boolean) => ({ type, isAvailable: async () => available }), a = fake("in-process", inProcess), b = fake("detached-process", true), c = fake("tmux", tmux), registry = native ? Object.assign(new Registry(), { inProcessBackend: a, detachedBackend: b, tmuxBackend: c, logger: log }) : new TeammateBackendRegistry(a as any, b as any, c as any); return { type: (await registry.getBackend(preferred)).type, all: registry.getAllBackends().map((item: any) => item.type) }; } equal(await run(false), await run(true));
  }
  const Factory = original(source.indexOf("class{create(eA)", 8425300), source.indexOf(";i7=teammate_transport_factory_decorate", 8425300), { MailboxTransport: class { type = "mailbox"; }, HttpTransport: class { type = "http"; constructor(readonly leaderEndpoint: string) {} } });
  for (const leaderEndpoint of [undefined, "", "bad", "http://localhost", "http://127.0.0.1:7", "http://[::1]:7", "http://remote", "https://localhost", "http://127.0.0.2"]) for (const isRemote of [undefined, false, true]) { const options = { leaderEndpoint, isRemote }, after = new TeammateTransportFactory({} as any), before = new Factory(); equal(after.create(options as any).type, before.create(options).type); if (leaderEndpoint) equal(after.isLocalEndpoint(leaderEndpoint), before.isLocalEndpoint(leaderEndpoint)); }
  const Sse = original(8282427, 8289110);
  const items: any[] = [undefined, null, {}, { type: "other" }, ...["", "text", " \n ", [], [{ type: "output_text", text: "a" }, { type: "text", text: "b" }, { type: "input_text", text: "c" }]].flatMap((content) => ["user", "assistant", "system"].map((role) => ({ type: "message", role, content }))), ...[undefined, "", "native"].flatMap((call_id) => ["function_call", "function_call_output", "function_call_result"].map((type) => ({ type, call_id, id: "id", callId: "ignored", name: "Read", arguments: "{}", output: "result" })))];
  for (const item of items) equal(new DetachedMemberSseBridge(log, "lead", {} as any, () => "").convertHistoryItemToAcpUpdates(item), new Sse(log, "lead", {}).convertHistoryItemToAcpUpdates(item));
  for (const event of ["message", "", "other"]) for (const value of ["bad", "{}", '{"method":"wrong"}', ...["tool_call", "agent_message_chunk"].map((sessionUpdate) => JSON.stringify({ method: "notifications/sessionUpdate", params: { update: { sessionUpdate, toolCallId: "id" } } }))]) {
    function run(native: boolean) { const events: any[] = [], connection = { sessionUpdate: async (value: any) => { events.push(value); } }, bridge = native ? new Sse(log, "lead", connection) : new DetachedMemberSseBridge(log, "lead", connection, () => ""); bridge.setAcpAgent({ notifyToolCallSent: (id: string) => events.push(["notify", id]) }); bridge.handleSseEvent("worker", event, value); return events; } equal(run(false), run(true));
  }
  class Deferred { promise: Promise<any>; resolve!: (value: any) => void; constructor() { this.promise = new Promise((done) => { this.resolve = done; }); } }
  const Bridge = original(8418746, 8422004, { r6: { Deferred }, i8: 300000 });
  for (const decision of ["allow", "allowAll", "deny", "rejectAndExitPlan", "abort", "missing"]) {
    async function run(native: boolean) { const session = new HarnessSession("lead"), events: any[] = [], manager = { getCurrent: () => decision === "missing" ? undefined : session }, approval: any = { approve: (...args: any[]) => events.push(["fallback-approve", ...args]), reject: (...args: any[]) => events.push(["fallback-reject", ...args]) }, bridge = native ? Object.assign(new Bridge(), { sessionManager: manager, interruptionService: approval, logger: log }) : new PermissionBridgeService(manager, approval), request = { requestId: "request", teammateName: "worker", teamName: "unmatched", toolName: "Read", toolArguments: "{}", toolCallId: "call", timestamp: "fixed" }, abort = new AbortController(), result = bridge.handleRequest(request, abort.signal); const item: any = session.interruptionSubject.value; if (decision === "abort") abort.abort(); else if (decision === "allow" || decision === "allowAll") approval.approve(item, { decision }); else if (decision !== "missing") approval.reject(item, { decision }); return { result: await result, item, events, pending: bridge.pendingRequests.size, found: !!bridge.findLeaderSession("different") }; } equal(await run(false), await run(true));
  }
  const Runner = original(8412968, 8417181, { iN: { user }, n$: { formatTeammateMessage } });
  for (const from of ["user", "team-lead", "worker"]) for (const text of ["hello", "{}", '{"type":"shutdown_request"}', "null"]) for (const summary of [undefined, "", "summary"]) { const after = new TeammateRunner({} as any, {} as any, {} as any, () => "", log), before = Object.assign(new Runner(), { logger: log }), message: any = { from, text, summary }; equal(after.formatMessage(message), before.formatMessage(message)); equal(after.isShutdownRequest(message), before.isShutdownRequest(message)); }
  // Real HTTP boundaries are covered by runtime tests. This deterministic mock
  // additionally compares native headers/timeouts/envelopes/malformed JSON.
  const http = await import("node:http"), savedRequest = http.default.request, savedGet = http.default.get;
  try {
    for (const status of [200, 201, 204, 400, 500, undefined]) for (const body of ["", "bad", "{}", '{"data":{"messages":[{"text":"mail"}]}}', '{"data":false}', "null"]) for (const kind of ["mailbox-get", "mailbox-post", "permission-post"]) {
      async function run(native: boolean) {
        const events: any[] = [], network: any = {
          request: (url: any, options: any, callback: any) => {
            events.push([url, options]); const request = Object.assign(new EventEmitter(), { write: (value: string) => events.push(["write", value]), destroy: () => events.push(["destroy"]), end: () => { queueMicrotask(() => { const response = Object.assign(new EventEmitter(), { statusCode: status, setEncoding: (value: string) => events.push(["encoding", value]) }); callback(response); response.emit("data", body); response.emit("end"); }); } }); return request;
          }, get: (url: any, options: any, callback: any) => { const request = network.request(url, options, callback); request.end(); return request; },
        };
        http.default.request = network.request; http.default.get = network.get; syncBuiltinESMExports();
        const bindings = { iX: () => network, nS: { withSecurityHeader } }, start = source.indexOf("class HttpTransport", 8423280), end = source.indexOf(";var teammate_transport_factory_decorate", start), OriginalHttp = original(start, end, bindings), OriginalClient = original(8410552, 8412136, bindings);
        const transport = kind === "permission-post" ? native ? new OriginalClient("http://leader", "worker", "team") : new PermissionBridgeClient("http://leader", "worker", "team") : native ? new OriginalHttp("http://leader") : new HttpTransport("http://leader");
        const result = await outcome(() => kind === "mailbox-get" ? transport.getUnread("a b", "w/orker") : transport.post("/path", { fixture: "body" })); return { result, events };
      }
      equal(await run(false), await run(true));
    }
  } finally { http.default.request = savedRequest; http.default.get = savedGet; syncBuiltinESMExports(); }
} finally { globalThis.Date = savedDate; }
console.log(`Team external differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`);
