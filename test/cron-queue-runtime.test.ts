import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, stat, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Agent, Runner, Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { parseCron, getNextFireTimestamp, getRecurringFireTime, getOneShotFireTime, deterministicFraction, humanSchedule, isExpired, detectMissedTasks } from "../src/cron/cron-utils.js";
import { CRON_EXPIRY_MS, CronCreateModelSchema, SCHEDULED_TASKS_FILE, SCHEDULED_TASKS_LOCK, type ScheduledTask } from "../src/cron/cron-types.js";
import { CronStorage } from "../src/cron/cron-storage.js";
import { CronStateManager } from "../src/cron/cron-state-manager.js";
import { createCronScheduler, buildMissedNotification, dynamicBacktickFence } from "../src/cron/cron-scheduler.js";
import { CronTools } from "../src/tools/cron-tools.js";
import { MessageQueueManager, QueueDispatchUtils, isEditableQueuedMessage, extractEditableImages } from "../src/sessions/message-queue-manager.js";
import { MessageQueueAgentRunInterceptor } from "../src/agents/message-queue-agent-run-interceptor.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { createHarness } from "../src/runtime/create-harness.js";

setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) { const result = await mkdtemp(join(tmpdir(), "harness-cron-")); t.after(() => rm(result, { recursive: true, force: true })); return result; }
async function settle() { for (let index = 0; index < 12; index++) await Promise.resolve(); }
async function until(predicate: () => boolean | Promise<boolean>, timeout = 3000) { const start = Date.now(); while (!(await predicate())) { if (Date.now() - start > timeout) throw new Error("fixture timed out"); await new Promise((done) => setTimeout(done, 2)); } }
class FakeClock {
  now = Date.now();
  timers = new Map<any, { callback: () => unknown; delay: number }>();
  setInterval = (callback: () => unknown, delay: number) => { const handle = { unref() {} }; this.timers.set(handle, { callback, delay }); return handle; };
  clearInterval = (handle: any) => { this.timers.delete(handle); };
  runtime = { now: () => this.now, setInterval: this.setInterval, clearInterval: this.clearInterval };
  async tick(delay = 500) { for (const [handle, timer] of [...this.timers]) if (timer.delay === delay && this.timers.has(handle)) await timer.callback(); await settle(); }
}
function virtualStorage(initial: ScheduledTask[] = []) {
  let disk = structuredClone(initial), owner = true, released = 0, reload: (() => void) | undefined;
  const storage = { readTasks: async () => structuredClone(disk), acquireLock: async () => owner, releaseLock: async () => { released++; },
    removeTasks: async (ids: string[]) => { disk = disk.filter((task) => !ids.includes(task.id)); reload?.(); }, updateTaskLastFiredAt: async (ids: string[], time: number) => { for (const task of disk) if (ids.includes(task.id)) task.lastFiredAt = time; },
    watchTasksFile: (_dir: string, callback: () => void) => { reload = callback; return { close() { reload = undefined; } }; },
  } as unknown as typeof CronStorage;
  return { storage, disk: () => disk, owner: (value: boolean) => { owner = value; }, released: () => released };
}
function modelFixture(response: (request: any, count: number) => any[]): Model { let count = 0; return { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse(request) { yield { type: "response_started" }; yield { type: "response_done", response: { id: `r-${++count}`, output: response(request, count), usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any; } }; }
const call = (name: string, args: object, id: string) => [{ type: "function_call", name, callId: id, id, status: "completed", arguments: JSON.stringify(args) }];
const answer = (text: string) => [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text }] }];

test("cron parser preserves prefix numbers, weekday 7 alias, ranges, strict field count and nonstandard permissive cases", () => {
  assert.deepEqual(parseCron("*/15 * * * 7")?.minute, [0, 15, 30, 45]); assert.deepEqual(parseCron("*/15 * * * 7")?.dayOfWeek, [0]);
  assert.deepEqual(parseCron("1x,3/4,5-9/2 * * * *")?.minute, [1, 3, 5, 7, 9]);
  for (const value of ["", "* * * *", "* * * * * *", "60 * * * *", "*/0 * * * *", "0 0 * JAN *", "0 0 * * 5-7"]) assert.equal(parseCron(value), null);
  assert.equal(humanSchedule("*/10 * * * *"), "Every 10 minutes"); assert.equal(humanSchedule("0 */2 * * *"), "Every 2 hours"); assert.equal(humanSchedule("30 14 * * 1-5"), "Weekdays at 2:30 PM");
});

test("cron calendar uses local time, DOM/DOW OR, next minute, stable jitter and three-day expiration", () => {
  const base = new Date(2026, 0, 1, 12, 0, 0).getTime();
  assert.equal(getNextFireTimestamp("* * * * *", base), base + 60000);
  const match = new Date(getNextFireTimestamp("0 8 15 * 1", base)!); assert.ok(match.getDate() === 15 || match.getDay() === 1);
  const recurring = getRecurringFireTime("* * * * *", base, "80000000")!; assert.equal(recurring, base + 63000);
  assert.equal(deterministicFraction("invalid"), 0);
  const beforeHour = new Date(2026, 0, 1, 11, 59, 0).getTime(); assert.equal(getOneShotFireTime("0 12 * * *", beforeHour, "80000000"), beforeHour + 15000);
  const task = { id: "task", cron: "* * * * *", prompt: "p", createdAt: base, recurring: true };
  assert.equal(isExpired(task, base + CRON_EXPIRY_MS), true); assert.equal(isExpired({ ...task, permanent: true }, base + CRON_EXPIRY_MS), false);
  assert.deepEqual(detectMissedTasks([task], base + 60001), [task]); assert.deepEqual(detectMissedTasks([task], base + 60000), []);
});

test("CronStorage preserves file payload filtering, stripped flags, updates and live/stale owner locks", async (t) => {
  const root = await directory(t), task = { id: "00000001", cron: "* * * * *", prompt: "p", createdAt: 1, recurring: true, durable: true, permanent: true };
  await CronStorage.writeTasks([task], root); const payload = await readFile(join(root, SCHEDULED_TASKS_FILE), "utf8"); assert.ok(payload.endsWith("\n")); assert.ok(!payload.includes("durable")); assert.ok(!payload.includes("permanent"));
  await CronStorage.updateTaskLastFiredAt([task.id], 100, root); assert.equal((await CronStorage.readTasks(root))[0]!.lastFiredAt, 100);
  await writeFile(join(root, SCHEDULED_TASKS_FILE), JSON.stringify({ tasks: [task, { ...task, createdAt: 0 }, { ...task, prompt: "" }, { ...task, cron: "invalid" }] })); assert.equal((await CronStorage.readTasks(root)).length, 1);
  const first = { sessionId: "first", pid: process.pid }, second = { sessionId: "second", pid: process.pid };
  assert.equal(await CronStorage.acquireLock(root, first), true); assert.equal(await CronStorage.acquireLock(root, first), true); assert.equal(await CronStorage.acquireLock(root, second), false);
  await CronStorage.releaseLock(root, second); assert.equal((await stat(join(root, SCHEDULED_TASKS_LOCK))).isFile(), true);
  await writeFile(join(root, SCHEDULED_TASKS_LOCK), JSON.stringify({ sessionId: "stale", pid: 2147483647 })); assert.equal(await CronStorage.acquireLock(root, second), true);
  await CronStorage.releaseLock(root, second); await assert.rejects(stat(join(root, SCHEDULED_TASKS_LOCK)), /ENOENT/);
});

test("cron state separates volatile and durable tasks and retains the source durable-delete return-count behavior", async (t) => {
  const root = await directory(t), state = new CronStateManager(); state.setStorageDir(root);
  const volatile = await state.createTask("session", "* * * * *", "volatile", false, false), durable = await state.createTask("session", "0 * * * *", "durable", true, true);
  assert.match(volatile, /^[0-9a-f]{8}$/); assert.equal(state.isScheduledTasksEnabled(), true); assert.equal(state.getSessionTasks("other").length, 0);
  assert.equal((await state.getAllTasks("session")).length, 2); assert.equal((await state.getAllTasks("other"))[0]!.permanent, true);
  assert.equal(await state.removeTasks("session", [durable]), 0); assert.equal((await CronStorage.readTasks(root)).length, 0);
  state.clearSessionTasks("session"); assert.equal(state.getSessionTasks("session").length, 0);
});

test("Cron tools keep model scheduling session-only, enforce caps and return source list/delete envelopes", async () => {
  const state = new CronStateManager(), tools = new CronTools(state), session = new HarnessSession("tools"), context = { context: session } as any;
  assert.equal(CronCreateModelSchema.safeParse({ cron: "* * * * *", prompt: "p", durable: true }).success, false);
  assert.equal((await tools.create({ cron: "bad", prompt: "p" }, context)).error, "invalid_cron"); assert.equal((await tools.create({ cron: "* * * * *", prompt: "p" })).error, "no_session");
  const result = await tools.create({ cron: "* * * * *", prompt: "x".repeat(100), recurring: false }, context); assert.equal(result.rawResponse.durable, false); assert.equal(result.rawResponse.recurring, false);
  assert.ok(!(await tools.list({}, context)).content.includes("[session-only]"), "stored volatile tasks omit durable rather than explicitly store false");
  assert.equal((await tools.delete({ id: result.rawResponse.id }, context)).content, `Cancelled job ${result.rawResponse.id}.`);
  for (let index = 0; index < 50; index++) state.addSessionTask(session.id, { id: String(index), cron: "* * * * *", prompt: "p", createdAt: 1 });
  assert.equal((await tools.create({ cron: "* * * * *", prompt: "p" }, context)).error, "too_many_jobs");
});

test("scheduler waits while loading/killed, fires one-shot once and expires recurring only after its final fire", async () => {
  const clock = new FakeClock(), state = new CronStateManager(), disk = virtualStorage(), fired: string[] = []; let loading = true, killed = false;
  const created = clock.now - CRON_EXPIRY_MS;
  state.addSessionTask("s", { id: "00000000", cron: "* * * * *", prompt: "one", createdAt: clock.now - 120000 });
  state.addSessionTask("s", { id: "00000001", cron: "* * * * *", prompt: "recurring", createdAt: created, recurring: true }); state.setEnabled(true);
  const scheduler = createCronScheduler({ sessionId: "s", dir: "fixture", lockIdentity: { sessionId: "s", pid: process.pid }, onFire: (text) => fired.push(text), isLoading: () => loading, isKilled: () => killed }, state, { ...clock.runtime, storage: disk.storage });
  scheduler.start(); await settle(); await clock.tick(); assert.equal(fired.length, 0);
  loading = false; killed = true; await clock.tick(); assert.equal(fired.length, 0);
  killed = false; await clock.tick(); assert.deepEqual(fired, ["one", "recurring"]); assert.equal(state.getSessionTasks("s").length, 0);
  await clock.tick(); assert.equal(fired.length, 2); scheduler.stop(); await settle(); assert.equal(clock.timers.size, 0); assert.equal(disk.released(), 1);
});

test("scheduler surfaces missed durable one-shots once, retries owner locks and fences prompt backticks", async () => {
  const clock = new FakeClock(), state = new CronStateManager(), task = { id: "deadbeef", cron: "* * * * *", prompt: "unsafe ``` prompt", createdAt: clock.now - 120000 }, disk = virtualStorage([task]), fired: string[] = [];
  disk.owner(false); state.setEnabled(true);
  const scheduler = createCronScheduler({ sessionId: "s", dir: "fixture", lockIdentity: { sessionId: "s", pid: process.pid }, onFire: (text) => fired.push(text), isLoading: () => false }, state, { ...clock.runtime, storage: disk.storage });
  scheduler.start(); await settle(); await clock.tick(); assert.equal(fired.length, 0); disk.owner(true); await clock.tick(5000);
  assert.equal(fired.length, 1); assert.match(fired[0]!, /Do NOT execute this prompt yet/); assert.ok(fired[0]!.includes("````")); assert.equal(disk.disk().length, 0);
  await clock.tick(); assert.equal(fired.length, 1); assert.equal(scheduler.getNextFireTime(), null); assert.equal(dynamicBacktickFence("``"), "```"); assert.match(buildMissedNotification([task, task]), /each one/);
  scheduler.stop();
});

test("MessageQueueManager keeps meta/channel messages uneditable and preserves held text/image refill ordering", () => {
  const queue = new MessageQueueManager(), session = new HarnessSession("queue");
  const user = { type: "message", role: "user", content: [{ type: "input_text", text: "[Image #7] text" }, { type: "input_image", image: "data:image/png;base64,fixture" }], providerData: { queueHold: true } } as any;
  queue.enqueueMessage(session, user); queue.enqueueMessage(session, { type: "message", role: "user", content: "meta", providerData: { isMeta: true } } as any);
  assert.equal(isEditableQueuedMessage(session.queue[1]), false); assert.equal(isEditableQueuedMessage({ type: "message", role: "user", content: "<channel source=x>message</channel>" }), false);
  assert.deepEqual(extractEditableImages(user), [{ placeholderId: 7, dataUrl: "data:image/png;base64,fixture" }]);
  assert.equal(queue.popLastEditableQueueHold(session, "draft")?.text, "[Image #7] text\n\ndraft"); assert.equal(session.queue.length, 1); assert.equal(session.queueSubject.value.length, 1);
});

test("MessageQueue interceptor preserves legacy batching/hold behavior and deferred empty-input skip", async () => {
  const session = new HarnessSession("queue-interceptor"), queue = new MessageQueueManager(), state = new SessionRunStateMachine(); let deferred = false;
  const interceptor = new MessageQueueAgentRunInterceptor(queue, state, () => deferred);
  queue.enqueueMessage(session, { type: "message", role: "user", content: "queued" }); queue.enqueueMessage(session, { type: "message", role: "user", content: "held", providerData: { queueHold: true } } as any);
  const context = { session, input: [{ type: "message", role: "user", content: "new" }], bypassMessageQueue: false, skipRun: false } as any;
  await interceptor.intercept(context); assert.match(JSON.stringify(context.input), /queued/); assert.equal(session.queue.length, 1);
  session.status = "model_streaming"; context.input = [{ type: "message", role: "user", content: "busy" }]; await interceptor.intercept(context); assert.equal(context.skipRun, true); assert.equal(context.skipAddHistory, true);
  session.status = "idle"; deferred = true; context.input = []; context.skipRun = false; await interceptor.intercept(context); assert.equal(context.skipRun, true); assert.equal(session.queue.length, 2);
  assert.equal(QueueDispatchUtils.isDeferredDispatchEnabledSync({ MessageQueueDeferredDispatch: true }), true);
});

test("real SDK Cron CRUD works only when explicitly exposed and does not modify captured default tool allowlists", async (t) => {
  const root = await directory(t), clock = new FakeClock(), requests: any[] = []; let id = "";
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? call("CronCreate", { cron: "*/5 * * * *", prompt: "fixture", recurring: false }, "create") : count === 2 ? call("CronList", {}, "list") : count === 3 ? call("CronDelete", { id }, "delete") : answer("cancelled"); });
  const runtime = await createHarness({ workDir: root, cronRuntime: clock.runtime, modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => runtime.close());
  const session = await runtime.openSession(); assert.equal((await runtime.agents.getDefault()).tools.some((tool) => tool.name === "CronCreate"), false);
  const originalCreate = runtime.cronState.createTask.bind(runtime.cronState); runtime.cronState.createTask = async (...args) => { id = await originalCreate(...args); return id; };
  const tools = await runtime.tools.buildTools(["CronCreate", "CronList", "CronDelete"], { name: "cron-fixture" });
  const result = await new Runner({ modelProvider: { getModel: () => model }, tracingDisabled: true }).run(new Agent<HarnessSession>({ name: "cron-fixture", model: "fixture", tools }), "schedule then cancel", { context: session, stream: true });
  for await (const _event of result) { /* consume SDK stream */ } await result.completed;
  assert.equal(result.finalOutput, "cancelled"); assert.equal((await runtime.cronState.getAllTasks(session.id)).length, 0); assert.match(JSON.stringify(requests[3].input), /Cancelled job/);
});

test("scheduled task fires through the recovered queue into an actual SDK turn and disappears after close", async (t) => {
  const root = await directory(t), clock = new FakeClock(), outputs: string[] = [], requests: any[] = [];
  const model = modelFixture((request) => { requests.push(request); return answer("scheduled result"); });
  const runtime = await createHarness({ workDir: root, cronRuntime: clock.runtime, modelProvider: { getModel: () => model }, onScheduledOutput: (text) => outputs.push(text) });
  t.after(() => runtime.close()); const session = await runtime.openSession();
  await runtime.cronState.createTask(session.id, "* * * * *", "scheduled fixture prompt", false, false);
  await clock.tick(); await until(() => clock.timers.size > 0); await new Promise((done) => setTimeout(done, 10));
  clock.now += 120000; await clock.tick(); await until(() => outputs.length === 1);
  assert.deepEqual(outputs, ["scheduled result"]); assert.match(JSON.stringify(requests[0].input), /scheduled fixture prompt/); assert.equal(runtime.cronState.getSessionTasks(session.id).length, 0);
  await runtime.close(); assert.equal(clock.timers.size, 0); await assert.rejects(stat(join(root, ".workbuddy-harness", "cron", SCHEDULED_TASKS_LOCK)), /ENOENT/);
});

test("busy-session scheduled prompt waits for the current turn rather than overlapping or cancelling it", async (t) => {
  const root = await directory(t), clock = new FakeClock(), outputs: string[] = []; let release!: () => void, started!: () => void;
  const entered = new Promise<void>((done) => { started = done; }), gate = new Promise<void>((done) => { release = done; });
  let count = 0;
  const model: Model = { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse() { count++; if (count === 1) { started(); await gate; } yield { type: "response_started" }; yield { type: "response_done", response: { id: `r-${count}`, output: answer(count === 1 ? "normal" : "queued"), usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 } } } as any; } };
  const runtime = await createHarness({ workDir: root, cronRuntime: clock.runtime, modelProvider: { getModel: () => model }, onScheduledOutput: (text) => outputs.push(text) }); t.after(() => runtime.close());
  const session = await runtime.openSession(), main = runtime.prompt(session, "normal turn"); await entered;
  await runtime.service.runDefault([{ type: "message", role: "user", content: "queued scheduled prompt", providerData: { isMeta: true } } as any], { context: session });
  await settle(); assert.equal(count, 1); assert.equal(session.queue.length, 1); assert.equal(runtime.stateMachine.isBusy(session), true);
  release(); assert.equal(await main, "normal"); await until(() => outputs.length === 1); assert.deepEqual(outputs, ["queued"]); assert.equal(count, 2);
});
