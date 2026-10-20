import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { z as z3 } from "zod3";
import * as constants from "../src/cron/cron-types.js";
import * as utils from "../src/cron/cron-utils.js";
import { CronStorage } from "../src/cron/cron-storage.js";
import { CronStateManager } from "../src/cron/cron-state-manager.js";
import { createCronScheduler, dynamicBacktickFence, buildMissedNotification } from "../src/cron/cron-scheduler.js";
import { CronTools } from "../src/tools/cron-tools.js";
import { MessageQueueManager, extractEditableImages, isEditableQueuedMessage, mergeConsecutiveUserMessages } from "../src/sessions/message-queue-manager.js";
import { MessageQueueAgentRunInterceptor } from "../src/agents/message-queue-agent-run-interceptor.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";

const filename = process.argv[2]; if (!filename) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await fs.readFile(filename, "utf8"); assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const directory = await fs.mkdtemp(path.join(tmpdir(), "harness-original-cron-diff-"));
const logger = { info() {}, debug() {}, warn() {} };
function evaluate(code: string, context: any = {}): any { return runInNewContext(code, { Error, Date, Math, process, Map, Set, setTimeout, clearTimeout, ...context }, { timeout: 10000, contextCodeGeneration: { strings: false, wasm: false } }); }
const configStart = source.indexOf("let ed=2592e5", 7851200), configEnd = source.indexOf("},31925", configStart);
const originalConfig = evaluate(`(()=>{${source.slice(configStart, configEnd)};return{CRON_EXPIRY_MS:ed,SCHEDULER_TICK_MS:ep,LOCK_RETRY_MS:eg,MAX_SCHEDULED_JOBS:eh,DEFAULT_LOOP_INTERVAL:ef,SCHEDULED_TASKS_FILE:em,SCHEDULED_TASKS_LOCK:eE,DEFAULT_JITTER_CONFIG:eC,CronCreateFullSchema:ey,CronCreateModelSchema:ew,CronDeleteSchema:eB,CronListSchema:e_}})()`, { eu: { z: z3 } });
const helperStart = 7847494, helperEnd = source.indexOf("},23152", helperStart);
const original = evaluate(`(()=>{${source.slice(helperStart, helperEnd)};return{parseField,parseCron,getNextFireTime,getNextFireTimestamp,deterministicFraction,getRecurringFireTime,getOneShotFireTime,humanSchedule,isExpired,detectMissedTasks}})()`, { ed: [{ min: 0, max: 59 }, { min: 0, max: 23 }, { min: 1, max: 31 }, { min: 1, max: 12 }, { min: 0, max: 6 }], eu: originalConfig });
const storageStart = 7854913 + "let CronStorage=".length, storageEnd = source.indexOf("},99972", storageStart);
const OriginalStorage = evaluate(`(${source.slice(storageStart, storageEnd)})`, { eu: fs, ed: path, ep: original, eg: originalConfig, ec: () => fsSync });
let uuid = "00000000-0000-4000-8000-000000000000";
const OriginalState = evaluate(`(${source.slice(7853292, 7854715)})`, { ed: { randomUUID: () => uuid }, eg: { CronStorage: OriginalStorage } });
const toolContext = { iz: { BaseTool: class {} }, nC: { ToolNames: { CRON_CREATE: "CronCreate", CRON_DELETE: "CronDelete", CRON_LIST: "CronList" } }, cK: originalConfig, cH: original, iq: { ENV_KEY_CODEBUDDY_DISABLE_CRON: "CODEBUDDY_DISABLE_CRON" } };
const OriginalCreate = evaluate(`(${source.slice(12061370, 12063241)})`, toolContext), OriginalDelete = evaluate(`(${source.slice(12064081, 12064779)})`, toolContext), OriginalList = evaluate(`(${source.slice(12065615, 12066616)})`, toolContext);
const InputUtils = evaluate(`(${source.slice(source.indexOf("class InputItemUtils{"), source.indexOf(";InputItemUtils.", source.indexOf("class InputItemUtils{")))})`);
const MergeUtils = evaluate(`(class{${source.slice(13313318, source.indexOf("static addSystemReminder", 13313318))}})`);
const OriginalQueue = evaluate(`(${source.slice(11093993, 11096012)})`, { t5: { generateUUUID: () => "queue-id" }, AB: { InputItemUtils: InputUtils } });
let deferred = false;
const interceptorStart = source.indexOf("class{constructor(){this.priority=A_.AgentRunInterceptorPriority.MessageQueue}"), interceptorEnd = source.indexOf(";input_interceptors_decorate", interceptorStart);
const OriginalInterceptor = evaluate(`(${source.slice(interceptorStart, interceptorEnd)})`, { A_: { AgentNames: { COMPACT: "compact" }, AgentRunInterceptorPriority: { MessageQueue: 1800 } }, AH: { InputItemUtils: InputUtils, MessageUtils: MergeUtils, QueueDispatchUtils: { isDeferredDispatchEnabledSync: () => deferred } } });
const schedulerStart = 8433274, schedulerEnd = 8436873;
const notificationStart = 8432486;
const notifications = evaluate(`(()=>{${source.slice(notificationStart, schedulerStart)};return{dynamicBacktickFence,buildMissedNotification}})()`, { oR: original });
let comparisons = 0;
const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function equal(actual: any, expected: any) { assert.deepEqual(plain(actual), plain(expected)); comparisons++; }
async function settle() { for (let index = 0; index < 16; index++) await Promise.resolve(); }
class Timers {
  entries = new Map<any, { callback: () => unknown; ms: number }>();
  repeat = (callback: () => unknown, ms: number) => { const handle = { unref() {} }; this.entries.set(handle, { callback, ms }); return handle; };
  cancel = (handle: any) => { this.entries.delete(handle); };
  async tick(ms: number) { for (const [handle, timer] of [...this.entries]) if (timer.ms === ms && this.entries.has(handle)) await timer.callback(); await settle(); }
}
function memoryStorage(initial: constants.ScheduledTask[], events: unknown[]) {
  let tasks = structuredClone(initial), owner = false, reload: (() => void) | undefined;
  const storage = { readTasks: async () => { events.push("read"); return structuredClone(tasks); }, removeTasks: async (ids: string[]) => { events.push(["remove", ids]); tasks = tasks.filter((task) => !ids.includes(task.id)); reload?.(); }, updateTaskLastFiredAt: async (ids: string[], time: number) => { events.push(["update", ids, time]); for (const task of tasks) if (ids.includes(task.id)) task.lastFiredAt = time; }, acquireLock: async () => { events.push("lock"); return owner; }, releaseLock: async () => { events.push("release"); }, watchTasksFile: (_dir: string, callback: () => void) => { events.push("watch"); reload = callback; return { close() { events.push("close"); reload = undefined; } }; } } as unknown as typeof CronStorage;
  return { storage, tasks: () => tasks, owner: (value: boolean) => { owner = value; } };
}
const savedNow = Date.now; let now = new Date(2026, 0, 1, 12).getTime(); Date.now = () => now;
try {
  for (const key of ["CRON_EXPIRY_MS", "SCHEDULER_TICK_MS", "LOCK_RETRY_MS", "MAX_SCHEDULED_JOBS", "DEFAULT_LOOP_INTERVAL", "SCHEDULED_TASKS_FILE", "SCHEDULED_TASKS_LOCK", "DEFAULT_JITTER_CONFIG"] as const) equal(constants[key], originalConfig[key]);
  const cronInputs = ["", "* * * * *", "*/5 * * * *", "1x * * * *", "0 12 * * 7", "0 12 * * 5-7", "0 0 31 2 *", "0 0 29 2 *", "30 14 * * 1-5", "0 */3 * * *", "0,30 0-23/3 1,15 * 0-6", "5 * * * *", "0 * * * *", "* * * *", "* * * * * *", "-1 * * * *"];
  for (let index = 0; index < 100; index++) cronInputs.push(`${index % 67} ${index % 26} ${index % 33} ${index % 14} ${index % 9}`, `*/${index} * * * *`, `0-${index}/2 * * * *`);
  for (const expression of cronInputs) { equal(utils.parseCron(expression), original.parseCron(expression)); equal(utils.humanSchedule(expression), original.humanSchedule(expression)); }
  for (const expression of cronInputs.slice(0, 16)) for (const offset of [0, 60001, 86400000, 40 * 86400000]) { equal(utils.getNextFireTimestamp(expression, now + offset), original.getNextFireTimestamp(expression, now + offset)); for (const id of ["00000000", "80000000", "ffffffff", "invalid"]) { equal(utils.getRecurringFireTime(expression, now + offset, id), original.getRecurringFireTime(expression, now + offset, id)); equal(utils.getOneShotFireTime(expression, now + offset, id), original.getOneShotFireTime(expression, now + offset, id)); } }
  for (const value of ["", "00000000", "80000000", "ffffffff", "ffzz", "invalid", "-1"]) equal(utils.deterministicFraction(value), original.deterministicFraction(value));
  for (const [before, after] of [[originalConfig.CronCreateFullSchema, constants.CronCreateFullSchema], [originalConfig.CronCreateModelSchema, constants.CronCreateModelSchema], [originalConfig.CronDeleteSchema, constants.CronDeleteSchema], [originalConfig.CronListSchema, constants.CronListSchema]]) for (const input of [{}, { id: "job" }, { cron: "* * * * *", prompt: "p" }, { cron: "* * * * *", prompt: "p", durable: true }, { cron: "", prompt: "", recurring: false }, { cron: 1, prompt: "p" }, { id: "job", unknown: true }]) { const left = after.safeParse(input), right = before.safeParse(input); equal(left.success, right.success); if (left.success && right.success) equal(left.data, right.data); }
  const beforeDir = path.join(directory, "before"), afterDir = path.join(directory, "after");
  const tasks = [{ id: "task", cron: "* * * * *", prompt: "prompt", createdAt: now - 86400000, recurring: true, durable: true, permanent: true }, { id: "once", cron: "0 12 * * *", prompt: "one-shot", createdAt: now - 86400000 }];
  await OriginalStorage.writeTasks(tasks, beforeDir); await CronStorage.writeTasks(tasks, afterDir); equal(await fs.readFile(path.join(afterDir, constants.SCHEDULED_TASKS_FILE), "utf8"), await fs.readFile(path.join(beforeDir, constants.SCHEDULED_TASKS_FILE), "utf8"));
  for (const contents of ["invalid", "{}", JSON.stringify({ tasks }), JSON.stringify({ tasks: [...tasks, { ...tasks[0], createdAt: 0 }, { ...tasks[0], cron: {} }] })]) { await fs.writeFile(path.join(beforeDir, constants.SCHEDULED_TASKS_FILE), contents); await fs.writeFile(path.join(afterDir, constants.SCHEDULED_TASKS_FILE), contents); equal(await CronStorage.readTasks(afterDir), await OriginalStorage.readTasks(beforeDir)); }
  await OriginalStorage.writeTasks(tasks, beforeDir); await CronStorage.writeTasks(tasks, afterDir);
  await OriginalStorage.updateTaskLastFiredAt(["task"], now, beforeDir); await CronStorage.updateTaskLastFiredAt(["task"], now, afterDir); equal(await CronStorage.readTasks(afterDir), await OriginalStorage.readTasks(beforeDir));
  for (const identity of [{ sessionId: "a", pid: process.pid }, { sessionId: "a", pid: process.pid }, { sessionId: "b", pid: process.pid }]) equal(await CronStorage.acquireLock(afterDir, identity), await OriginalStorage.acquireLock(beforeDir, identity));
  await CronStorage.releaseLock(afterDir, { sessionId: "a", pid: process.pid }); await OriginalStorage.releaseLock(beforeDir, { sessionId: "a", pid: process.pid });
  const beforeState = new OriginalState(), afterState = new CronStateManager(); beforeState.setStorageDir(beforeDir); afterState.setStorageDir(afterDir);
  await OriginalStorage.writeTasks([], beforeDir); await CronStorage.writeTasks([], afterDir);
  for (const durable of [false, true]) for (const recurring of [false, true]) { const id = await afterState.createTask("s", "* * * * *", "fixture", recurring, durable); uuid = `${id}-0000-4000-8000-000000000000`; equal(id, await beforeState.createTask("s", "* * * * *", "fixture", recurring, durable)); equal(await afterState.getAllTasks("s"), await beforeState.getAllTasks("s")); }
  const create = new OriginalCreate(), remove = new OriginalDelete(), list = new OriginalList(); for (const tool of [create, remove, list]) tool.stateManager = beforeState;
  const afterTools = new CronTools(afterState), context = { context: new HarnessSession("s") } as any;
  equal(await afterTools.list({}, context), await list.execute({}, context)); equal(await afterTools.create({ cron: "invalid", prompt: "p" }, context), await create.execute({ cron: "invalid", prompt: "p" }, context)); equal(await afterTools.list({}), await list.execute({}));
  for (const task of await afterState.getAllTasks("s")) equal(await afterTools.delete({ id: task.id }, context), await remove.execute({ id: task.id }, context));
  for (const permanent of [undefined, false, true]) for (const recurring of [undefined, false, true]) for (const age of [0, constants.CRON_EXPIRY_MS - 1, constants.CRON_EXPIRY_MS, constants.CRON_EXPIRY_MS + 1]) { const task = { id: "x", cron: "* * * * *", prompt: "p", createdAt: now - age, permanent, recurring }; equal(utils.isExpired(task as any, now), original.isExpired(task, now)); }
  for (const prompt of ["text", "```nested```` code", "中文\n`\nend"]) { equal(dynamicBacktickFence(prompt), notifications.dynamicBacktickFence(prompt)); const task = { id: "x", cron: "*/5 * * * *", prompt, createdAt: now }; equal(buildMissedNotification([task]), notifications.buildMissedNotification([task])); equal(buildMissedNotification([task, task]), notifications.buildMissedNotification([task, task])); }
  for (const enabled of [false, true]) for (const loadingInitially of [false, true]) {
    let loading = loadingInitially, killed = false; const base = now;
    const volatile = [{ id: "00000000", cron: "* * * * *", prompt: "volatile", createdAt: base - 120000 }, { id: "00000001", cron: "* * * * *", prompt: "expired", createdAt: base - constants.CRON_EXPIRY_MS, recurring: true }];
    const persisted = [{ id: "00000002", cron: "* * * * *", prompt: "missed ``` task", createdAt: base - 120000 }, { id: "00000003", cron: "* * * * *", prompt: "durable recurring", createdAt: base - 60000, recurring: true }];
    const beforeEvents: unknown[] = [], afterEvents: unknown[] = [], beforeDisk = memoryStorage(persisted, beforeEvents), afterDisk = memoryStorage(persisted, afterEvents), beforeTimers = new Timers(), afterTimers = new Timers();
    const before = new OriginalState(), after = new CronStateManager(); for (const state of [before, after]) { state.setEnabled(enabled); for (const task of volatile) state.addSessionTask("s", structuredClone(task)); }
    const build = (events: unknown[]) => ({ sessionId: "s", dir: "fixture", lockIdentity: { sessionId: "s", pid: process.pid }, onFire: (prompt: string) => events.push(["fire", prompt]), isLoading: () => loading, isKilled: () => killed });
    const OriginalScheduler = evaluate(`(${source.slice(schedulerStart, schedulerEnd)})`, { oT: originalConfig, oR: original, oM: { CronStorage: beforeDisk.storage }, debugLog() {}, buildMissedNotification: notifications.buildMissedNotification, setInterval: beforeTimers.repeat, clearInterval: beforeTimers.cancel });
    const originalScheduler = OriginalScheduler(build(beforeEvents), before), scheduler = createCronScheduler(build(afterEvents), after, { storage: afterDisk.storage, now: () => now, setInterval: afterTimers.repeat, clearInterval: afterTimers.cancel });
    originalScheduler.start(); scheduler.start(); await settle();
    before.setEnabled(true); after.setEnabled(true); await beforeTimers.tick(500); await afterTimers.tick(500); equal(afterEvents, beforeEvents);
    beforeDisk.owner(true); afterDisk.owner(true); await beforeTimers.tick(5000); await afterTimers.tick(5000); equal(afterEvents, beforeEvents);
    for (const phase of [0, 1, 2, 3]) { now = base + phase * 120000; if (phase === 1) loading = false; killed = phase === 2; await beforeTimers.tick(500); await afterTimers.tick(500); equal(scheduler.getNextFireTime(), originalScheduler.getNextFireTime()); equal(after.getSessionTasks("s"), before.getSessionTasks("s")); equal(afterEvents, beforeEvents); equal(afterDisk.tasks(), beforeDisk.tasks()); }
    scheduler.stop(); originalScheduler.stop(); await settle(); equal(afterEvents, beforeEvents); equal(afterTimers.entries.size, beforeTimers.entries.size); now = base;
  }
  const messages = [{ type: "message", role: "user", content: "plain" }, { type: "message", role: "user", content: "meta", providerData: { isMeta: true } }, { type: "message", role: "user", content: "<channel x>p</channel>" }, { type: "message", role: "user", content: [{ type: "input_text", text: "[Image #3]" }, { type: "input_image", image: "data:image/png;base64,fixture" }] }, { type: "message", role: "user", content: "held", providerData: { queueHold: true } }];
  for (const message of messages) { equal(isEditableQueuedMessage(message), InputUtils.isEditableQueuedMessage(message)); equal(extractEditableImages(message), InputUtils.extractEditableImages(message)); }
  for (const method of ["popAllEditable", "popLastEditableQueueHold", "popAllEditableQueueHold"] as const) { const before = new HarnessSession("q"), after = new HarnessSession("q"), manager = new MessageQueueManager(), originalManager = new OriginalQueue(); originalManager.userStateManager = { incrementPromptQueue: async () => undefined }; originalManager.consoleManager = { error() {} }; for (const item of messages) { manager.enqueueMessage(after, structuredClone(item) as any); originalManager.enqueueMessage(before, structuredClone(item)); } equal(manager[method](after, "draft"), originalManager[method](before, "draft")); equal(after.queue, before.queue); }
  equal(mergeConsecutiveUserMessages(messages as any), MergeUtils.mergeConsecutiveUserMessages(messages));
  for (const isDeferred of [false, true]) for (const status of ["idle", "preparing", "model_streaming"] as const) for (const input of [[], [messages[0]], [{ type: "message", role: "user", content: "skip", providerData: { skipRun: true } }]]) {
    deferred = isDeferred; const before = new HarnessSession("q"), after = new HarnessSession("q"), state = new SessionRunStateMachine(), manager = new MessageQueueManager(), originalManager = new OriginalQueue(); originalManager.userStateManager = { incrementPromptQueue: async () => undefined }; originalManager.consoleManager = { error() {} }; before.queue = structuredClone(messages) as any; after.queue = structuredClone(messages) as any; before.status = after.status = status;
    const old = new OriginalInterceptor(); old.messageQueueManager = originalManager; old.stateMachine = state; old.logger = logger;
    const recovered = new MessageQueueAgentRunInterceptor(manager, state, () => deferred), run = (session: HarnessSession) => ({ session, input: structuredClone(input), skipRun: false, bypassMessageQueue: false });
    const left = run(after), right = run(before); await recovered.intercept(left as any); await old.intercept(right); equal([left.input, left.skipRun, (left as any).skipAddHistory, after.queue], [right.input, right.skipRun, (right as any).skipAddHistory, before.queue]);
  }
} finally { Date.now = savedNow; await fs.rm(directory, { recursive: true, force: true }); }
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle", scope: "cron parser/calendar/jitter/schema/storage/state/tool results/scheduler/queue; not full desktop rich-queue frontend" }, null, 2));
