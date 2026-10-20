import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import * as path from "node:path";
import { sessionStackFixture } from "./session-stack-fixture.js";
import { createNativeSessionStack } from "../../src/sessions/native-session-stack.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import {
  raw,
  delta,
  done,
  assistant,
  item,
} from "./session-result-fixtures.js";
type Fixture = Awaited<ReturnType<typeof sessionStackFixture>>;
type Factory = typeof createNativeSessionStack;
type Scenario = { name: string; run(factory: Factory): Promise<any> };
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const scenario = (
  name: string,
  run: (f: Fixture) => Promise<any>,
  patch: any = {},
): Scenario => ({
  name,
  async run(factory) {
    const f = await sessionStackFixture(factory, patch);
    try {
      return f.normalize(await run(f));
    } finally {
      await f.close();
    }
  },
});
const user = (id: string, text = "owned"): any => ({
  id,
  type: "message",
  role: "user",
  content: [{ type: "input_text", text }],
});
async function transcript(f: Fixture, id: string) {
  return (await io.readFile(f.store.getSessionFilePath(id), "utf8"))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((s) => JSON.parse(s));
}
export const SESSION_STACK_CASES: Scenario[] = [
  scenario(
    "source Store append failure releases queue gate without deleting retained lock entry",
    async (f) => {
      let fail = true;
      const original = f.modules[91943].appendFile;
      f.modules[91943].appendFile = async (...args: any[]) => {
        if (fail) {
          fail = false;
          throw Error("owned append failure");
        }
        return original(...args);
      };
      await assert.rejects(
        f.store.appendHistory("retry", [user("failed")]),
        /owned append failure/,
      );
      await f.store.appendHistory("retry", [user("saved")]);
      await f.store.writeLocks.get("retry");
      assert.deepEqual(
        (await transcript(f, "retry")).map((x) => x.id),
        ["saved"],
      );
      assert.equal(f.store.writeLocks.size, 1);
      return [f.store.writeLocks.size, await transcript(f, "retry")];
    },
  ),
  scenario(
    "source full reverse reader crosses 65536-byte chunks without replacing its original separator/UTF8 algorithm",
    async (f) => {
      const values = [
        user("one", "start"),
        user("long", "中文😀".repeat(14000)),
        user("end", "final"),
      ];
      await f.store.appendHistory("long", values);
      const loaded = await f.store.get("long", { historyLimit: 3 });
      assert.deepEqual(
        loaded.history.map((x: any) => x.id),
        ["one", "long", "end"],
      );
      assert.equal(loaded.history[2].content[0].text, "final");
      return loaded.history;
    },
  ),
  scenario(
    "source Store replaces data-URI tool images in nested provider content and JSON-string output",
    async (f) => {
      const image = {
        type: "image_url",
        image_url: { url: "data:image/png;base64,b3duZWQ=" },
      };
      const value: any = {
        id: "image-call",
        type: "function_call_result",
        output: JSON.stringify([image]),
        providerData: { toolResult: { content: [image] } },
      };
      const nested = value.providerData;
      const result = await f.store.transformItemForSaveAsync(value);
      assert.equal(nested.toolResult.content[0].type, "image_blob_ref");
      assert.equal(JSON.parse(value.output)[0].type, "image_blob_ref");
      assert.equal(result.providerData, nested);
      assert.equal(
        await f.imageBlobService.rehydrate(nested.toolResult.content[0]),
        "data:image/png;base64,b3duZWQ=",
      );
      return result;
    },
  ),
  scenario(
    "source Store with empty meta creates no metadata file and reload keeps meta undefined",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "empty-meta", meta: {} });
      await f.store.save(s);
      await f.store.appendHistory(s.id, [user("u")], undefined, s);
      await assert.rejects(io.access(f.store.getSessionMetaFilePath(s.id)), {
        code: "ENOENT",
      });
      assert.equal((await f.store.get(s.id)).meta, undefined);
      return true;
    },
  ),
  scenario(
    "source full Manager create initializes context/registers without publishing current or result consumer by default",
    async (f) => {
      const a = await f.manager.create({ id: "created" });
      assert.equal(f.manager.sessionSubject.value, undefined);
      assert.equal(f.manager.getCurrent(), undefined);
      assert.equal(f.manager.resultSubscriptions.size, 0);
      assert.equal(f.manager.sessionStartTimes.get(a.id), 1700000000000);
      const b = await f.manager.create({ id: "observed" }, true);
      assert.equal(f.manager.resultSubscriptions.has(b.id), true);
      await f.drain();
      return f.calls;
    },
  ),
  scenario(
    "source getCurrent prefers async-local session over HTTP Request attributes",
    async (f) => {
      const a = await f.sessionFactory.create({ id: "http" }),
        b = await f.sessionFactory.create({ id: "als" });
      const key = f.modules[99006].CURRENT_CHAT_SESSION;
      await f.attributes.run(new Map([[key, a]]), async () => {
        assert.equal(f.manager.getCurrent(), a);
        await f.manager.run(b, async () => {
          await tick();
          assert.equal(f.manager.getCurrent(), b);
        });
        assert.equal(f.manager.getCurrent(), a);
      });
      assert.equal(f.manager.getCurrent(), undefined);
      return [a.id, b.id];
    },
  ),
  scenario(
    "source same-ID setCurrent retains original identity/history, merges options and only missing meta keys, and renews aborted signal",
    async (f) => {
      const a = await f.sessionFactory.create({
        id: "same",
        options: { model: "old", retained: 1 },
        meta: { existing: "old" },
        history: [user("old")],
      });
      let publications = 0;
      f.manager.sessionSubject.subscribe(() => publications++);
      await f.attributes.run(new Map(), async () => {
        f.manager.setCurrent(a);
        a.abortController.abort("owned reset");
        const oldAbort = a.abortController;
        const b = await f.sessionFactory.create({
          id: "same",
          options: { model: "new" },
          meta: { existing: "new", missing: 2, absent: undefined },
          history: [user("replacement")],
        });
        f.manager.setCurrent(b);
        assert.equal(f.manager.getCurrent(), a);
        assert.equal(f.manager.sessionSubject.value, a);
        assert.notEqual(a.abortController, oldAbort);
        assert.equal(a.abortSignal.aborted, false);
        assert.equal(publications, 2);
      });
      assert.equal(a.history[0].id, "old");
      assert.equal(a.lastMessageId, "old");
      assert.equal(a.meta.existing, "old");
      assert.equal("absent" in a.meta, false);
      assert.equal(f.calls.filter((x) => x[0] === "progressStart").length, 1);
      return [a.options, a.meta, a.lastMessageId, f.calls];
    },
  ),
  scenario(
    "source same-ID reverted conversation does not recompute lastMessageId",
    async (f) => {
      const a = await f.sessionFactory.create({
        id: "reverted",
        history: [user("latest")],
      });
      f.manager.setCurrent(a);
      a.lastMessageId = "reverted-target";
      a.conversationReverted = true;
      f.manager.setCurrent(await f.sessionFactory.create({ id: a.id }));
      assert.equal(a.lastMessageId, "reverted-target");
      return a.lastMessageId;
    },
  ),
  scenario(
    "source different-ID setCurrent completes exactly ten old subjects and recycles result/timer/task/cron without completing combine/run state",
    async (f) => {
      const a = await f.sessionFactory.create({
        id: "old",
        history: [user("last-user"), { type: "custom-title", id: "custom" }],
      });
      f.manager.setCurrent(a);
      assert.equal(a.lastMessageId, "last-user");
      f.manager.resetIdleTimer(a);
      const closed: any[] = [];
      for (const name of [
        "resultSubject",
        "inputSubject",
        "historyReloadSubject",
        "modelSubject",
        "backgroundTaskSubject",
        "agentStateSubject",
        "interruptionSubject",
        "localExecuteSubject",
        "permissionModeSubject",
        "queueSubject",
        "combineSubject",
        "runStateSubject",
        "phaseSubject",
        "progressSubject",
      ])
        a[name].subscribe({ complete: () => closed.push(name) });
      const b = await f.sessionFactory.create({ id: "new" });
      f.manager.setCurrent(b);
      await f.drain();
      assert.equal(f.manager.sessionSubject.value, b);
      assert.equal(f.manager.resultSubscriptions.has(a.id), false);
      assert.equal(f.manager.idleTimers.has(a.id), false);
      assert.equal(closed.length, 10);
      assert.equal(closed.includes("combineSubject"), false);
      assert.equal(closed.includes("runStateSubject"), false);
      assert.equal(a.combineSubject.isStopped, false);
      assert.ok(f.calls.some((x) => x[0] === "clearTasks" && x[1] === "old"));
      return [closed, f.calls];
    },
  ),
  scenario(
    "source Manager addHistory uses processors, publishes input before user-hook/checkpoint and appends exact parent-linked JSONL",
    async (f) => {
      const s = await f.manager.create({ id: "history" });
      await f.manager.save(s);
      s.inputSubject.subscribe((value: any) =>
        f.calls.push(["input", value.id]),
      );
      await f.manager.addHistory(s, "owned first prompt");
      await f.manager.addHistory(s, [assistant("reply")]);
      const saved = await transcript(f, s.id);
      assert.equal(saved.length, 2);
      assert.equal(saved[1].parentId, saved[0].id);
      const names = f.calls.map((x) => x[0]);
      assert.ok(names.indexOf("input") < names.indexOf("userHook"));
      assert.ok(names.indexOf("userHook") < names.indexOf("checkpoint"));
      assert.equal(saved[0].timestamp, 1700000000000);
      assert.equal(saved[0].cwd, f.cwd);
      assert.equal(s.lastMessageId, "reply");
      assert.equal(f.manager.addHistoryLocks.size, 0);
      return [saved, f.calls];
    },
  ),
  scenario(
    "source Manager runWithoutHistory is async-local and suppresses processor/publication/persistence side effects",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "skip" });
      await f.manager.runWithoutHistory(async () => {
        await tick();
        await f.manager.addHistory(s, "do not save");
      });
      assert.equal(s.history.length, 0);
      await assert.rejects(io.access(f.store.getSessionFilePath(s.id)), {
        code: "ENOENT",
      });
      await f.manager.addHistory(s, "save afterwards");
      assert.equal(s.history.length, 1);
      return await transcript(f, s.id);
    },
  ),
  scenario(
    "source Manager startup/resume emit cache remains after settlement, other reasons may replace it",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "hook-cache" });
      await f.manager.emitSessionStart(s, "startup");
      await f.manager.emitSessionStart(s, "resume");
      assert.equal(f.calls.filter((x) => x[0] === "sessionHook").length, 1);
      await f.manager.emitSessionStart(s, "compact");
      await f.manager.emitSessionStart(s, "resume");
      assert.equal(f.calls.filter((x) => x[0] === "sessionHook").length, 2);
      return f.calls;
    },
  ),
  scenario(
    "source Manager concurrent session-start joins one in-flight emit and logs hook failure",
    async (f) => {
      const wait = deferred();
      f.manager.sessionHookManager.executeSessionStartHooks = async () => {
        f.calls.push(["ownedHook"]);
        await wait.promise;
        throw Error("owned hook failed");
      };
      const s = await f.sessionFactory.create({ id: "hook" });
      const first = f.manager.emitSessionStart(s, "startup"),
        second = f.manager.emitSessionStart(s, "resume");
      await tick();
      assert.equal(f.calls.length, 1);
      wait.resolve();
      await Promise.all([first, second]);
      assert.ok(
        f.logs.some(
          (x) => x[0] === "error" && String(x[1]).includes("emitSessionStart"),
        ),
      );
      return f.calls;
    },
  ),
  scenario(
    "source Manager queued addHistory inherits predecessor rejection rather than recovering it",
    async (f) => {
      const wait = deferred();
      let first = true;
      f.manager.agentInputItemProcessorProvider.sortSync = () => [
        {
          async process() {
            if (first) {
              first = false;
              await wait.promise;
              throw Error("owned processor failure");
            }
          },
        },
      ];
      const s = await f.sessionFactory.create({ id: "serialized" });
      const a = f.manager.addHistory(s, [user("one")]),
        b = f.manager.addHistory(s, [user("two")]);
      const settled = Promise.allSettled([a, b]);
      wait.resolve();
      const results = await settled;
      assert.deepEqual(
        results.map((x) => x.status),
        ["rejected", "rejected"],
      );
      assert.equal(s.history.length, 0);
      await f.manager.addHistory(s, [user("three")]);
      assert.equal(s.history.length, 1);
      assert.equal(f.manager.addHistoryLocks.size, 0);
      return [
        results.map((x: any) => x.reason.message),
        await transcript(f, s.id),
      ];
    },
  ),
  scenario(
    "source user hook failure leaves already published history in memory and skips checkpoint/append",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "hook-failure" });
      await assert.rejects(
        f.manager.addHistory(s, [user("published")]),
        /owned user hook failure/,
      );
      assert.equal(s.history.length, 1);
      assert.equal(
        f.calls.some((x) => x[0] === "checkpoint"),
        false,
      );
      await assert.rejects(io.access(f.store.getSessionFilePath(s.id)), {
        code: "ENOENT",
      });
      return [s.history, f.calls];
    },
    {
      userHook: async () => {
        throw Error("owned user hook failure");
      },
    },
  ),
  scenario(
    "source child session suppresses UserPromptSubmit but still invokes checkpoint for real user input",
    async (f) => {
      const s = await f.sessionFactory.create({
        id: "agent-child",
        meta: { parentSessionId: "parent" },
      });
      await f.manager.addHistory(s, [user("child")]);
      assert.equal(
        f.calls.some((x) => x[0] === "userHook"),
        false,
      );
      assert.equal(
        f.calls.some((x) => x[0] === "checkpoint"),
        true,
      );
      const p = f.store.getSessionFilePath(s.id, "parent");
      assert.equal((await io.readFile(p, "utf8")).includes("child"), true);
      return f.calls;
    },
  ),
  scenario(
    "source timestamp/credit methods retain finite zero/negative numbers and stringify circular credit fallback",
    async (f) => {
      const a: any = { timestamp: 0 },
        b: any = { timestamp: NaN },
        c: any = { timestamp: -1 },
        circular: any = {};
      circular.self = circular;
      assert.equal(f.manager.ensureHistoryItemTimestamp(a), 0);
      assert.equal(f.manager.ensureHistoryItemTimestamp(b), 1700000000000);
      assert.equal(f.manager.stampModelHistoryItemTimestamp(c), -1);
      assert.equal(
        f.manager.formatCreditForLog({ credit: circular }),
        "[object Object]",
      );
      assert.equal(f.manager.formatCreditForLog({ credit: null }), "null");
      assert.equal(
        f.manager.formatCreditForLog({ credit: undefined }),
        "undefined",
      );
      assert.equal(
        f.manager.stampModelStreamEventTimestamp({ timestamp: Infinity }),
        1700000000000,
      );
      return [a, b, c];
    },
  ),
  scenario(
    "source idle timer resets on busy and emits source notification only when idle",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "idle" });
      f.manager.resetIdleTimer(s);
      s.runState = { status: "pending" };
      await f.timers.fire();
      assert.equal(
        f.calls.some((x) => x[0] === "notification"),
        false,
      );
      assert.equal(f.timers.pending.size, 1);
      s.runState = { status: "idle" };
      await f.timers.fire();
      assert.equal(f.timers.pending.size, 0);
      return f.calls;
    },
  ),
  scenario(
    "source remove clears result/timers/tasks/cron/start time but leaves override maps intact",
    async (f) => {
      const s = await f.manager.create({ id: "remove" }, true);
      await f.manager.save(s);
      f.manager.resetIdleTimer(s);
      f.manager.setOverridePermissionMode(s.id, PermissionMode.Plan);
      f.manager.setOverrideModel(s.id, "owned-model");
      f.manager.setOverrideThinking(s.id, {
        thinkingEnabled: false,
        reasoningEffort: "high",
      });
      await f.manager.remove(s.id);
      assert.equal(f.manager.resultSubscriptions.size, 0);
      assert.equal(f.manager.idleTimers.size, 0);
      assert.equal(f.manager.sessionStartTimes.size, 0);
      assert.equal(f.manager.getOverrideModel(s.id), "owned-model");
      assert.deepEqual(f.manager.getOverrideThinking(s.id), {
        thinkingEnabled: false,
      });
      await assert.rejects(io.access(f.store.getSessionFilePath(s.id)), {
        code: "ENOENT",
      });
      return [
        f.calls,
        f.manager.getOverridePermissionMode(s.id),
        f.manager.getOverrideThinking(s.id),
      ];
    },
  ),
  scenario(
    "source thinking overrides clone value, disabled drops effort, null removes, undefined is not normalized",
    async (f) => {
      const input = { thinkingEnabled: true, reasoningEffort: "high" };
      f.manager.setOverrideThinking("id", input);
      input.reasoningEffort = "low";
      assert.equal(f.manager.getOverrideThinking("id").reasoningEffort, "high");
      f.manager.setOverrideThinking("id", {
        thinkingEnabled: false,
        reasoningEffort: "high",
      });
      assert.deepEqual(f.manager.getOverrideThinking("id"), {
        thinkingEnabled: false,
      });
      f.manager.setOverrideThinking("id", null);
      assert.equal(f.manager.getOverrideThinking("id"), undefined);
      assert.throws(
        () => f.manager.setOverrideThinking("id", undefined),
        TypeError,
      );
      return true;
    },
  ),
  scenario(
    "source rename appends trimmed custom-title and updates terminal only for current session",
    async (f) => {
      const s = await f.sessionFactory.create({ id: "rename" });
      f.manager.setCurrent(s);
      await f.manager.rename(s, "  owned title  ");
      const saved = await transcript(f, s.id);
      assert.equal(saved[0].type, "custom-title");
      assert.equal(saved[0].customTitle, "owned title");
      assert.ok(
        f.calls.some((x) => x[0] === "title" && x[1] === "owned title"),
      );
      return [saved, f.calls];
    },
  ),
  scenario(
    "source Manager get does not return cached current identity; Store reconstructs a new source session",
    async (f) => {
      const s = await f.sessionFactory.create({
        id: "load",
        meta: { owned: true },
      });
      await f.manager.save(s);
      await f.manager.addHistory(s, [user("u")]);
      f.manager.setCurrent(s);
      const loaded = await f.manager.get(s.id);
      assert.notEqual(loaded, s);
      assert.equal(loaded.id, s.id);
      assert.equal(loaded.history.length, 1);
      assert.deepEqual(loaded.meta, { owned: true });
      return [loaded.id, loaded.history, loaded.meta];
    },
  ),
  scenario(
    "source Store save preserves nonempty transcript, updates nonempty meta and retains old file when meta becomes empty",
    async (f) => {
      const s = await f.sessionFactory.create({
        id: "meta",
        meta: { owned: 1 },
      });
      await f.store.save(s);
      await f.store.appendHistory(s.id, [user("u")], undefined, s);
      const before = await io.readFile(
        f.store.getSessionFilePath(s.id),
        "utf8",
      );
      s.meta = {};
      await f.store.save(s);
      assert.equal(
        await io.readFile(f.store.getSessionFilePath(s.id), "utf8"),
        before,
      );
      assert.deepEqual(
        JSON.parse(
          await io.readFile(f.store.getSessionMetaFilePath(s.id), "utf8"),
        ),
        { owned: 1 },
      );
      return JSON.parse(before);
    },
  ),
  scenario(
    "source Store saveHistory appends whole history on repeated calls instead of replacing file",
    async (f) => {
      const s = await f.sessionFactory.create({
        id: "save-history",
        history: [user("u")],
      });
      await f.store.saveHistory(s);
      await f.store.saveHistory(s);
      assert.equal((await transcript(f, s.id)).length, 2);
      return await transcript(f, s.id);
    },
  ),
  scenario(
    "source Store write lock survives success due original Promise identity check but queued writes remain serialized",
    async (f) => {
      await Promise.all([
        f.store.appendHistory("lock", [user("one")]),
        f.store.appendHistory("lock", [user("two")]),
        f.store.appendHistory("lock", [user("three")]),
      ]);
      assert.deepEqual(
        (await transcript(f, "lock")).map((x) => x.id),
        ["one", "two", "three"],
      );
      assert.equal(f.store.writeLocks.size, 1);
      await f.store.writeLocks.get("lock");
      return [
        (await transcript(f, "lock")).map((x) => x.id),
        f.store.writeLocks.size,
      ];
    },
  ),
  scenario(
    "source Store transforms usage/cache fields and shallow copy still mutates source timestamp/output/nested tool result",
    async (f) => {
      const value: any = {
        ...user("u"),
        timestamp: 0,
        providerData: {
          usage: {
            inputTokens: 3,
            output_tokens: 4,
            totalTokens: 7,
            inputTokensDetails: [{ cached_tokens: 2 }],
            cache_creation_input_tokens: 1,
          },
        },
      };
      const result = await f.store.transformItemForSaveAsync(value);
      assert.equal(value.timestamp, 1700000000000);
      assert.equal(value.cwd, undefined);
      assert.deepEqual(result.message.usage, {
        input_tokens: 3,
        output_tokens: 4,
        total_tokens: 7,
        cache_read_input_tokens: 2,
        cache_creation_input_tokens: 1,
      });
      assert.equal(result.cwd, f.cwd);
      const custom = await f.store.transformItemForSaveAsync({
        type: "summary",
        id: "custom",
      });
      assert.equal(custom.cwd, undefined);
      return [result, custom];
    },
  ),
  scenario(
    "source Store user image conversion writes real native blob and retains input content array",
    async (f) => {
      const image: any = {
        type: "input_image",
        image: "data:image/png;base64,b3duZWQ=",
        source: "owned-source",
        original_filename: "owned.png",
      };
      const value: any = { ...user("image"), content: [image] },
        result = await f.store.transformItemForSaveAsync(value);
      assert.equal(value.content[0], image);
      assert.equal(result.content[0].type, "image_blob_ref");
      assert.equal(
        await f.imageBlobService.rehydrate(result.content[0]),
        image.image,
      );
      assert.equal(
        await io.readFile(result.content[0].blob_path, "utf8"),
        "owned",
      );
      return result;
    },
  ),
  scenario(
    "source Store externalizes large string/structured outputs through real native blob service and updates original output",
    async (f) => {
      const value: any = {
        id: "result",
        callId: "call",
        type: "function_call_result",
        output: "x".repeat(1400),
      };
      const result = await f.store.transformItemForSaveAsync(value, "session");
      assert.match(result.output, /^<persisted-output>/);
      assert.equal(value.output, result.output);
      const value2: any = {
        id: "array",
        callId: "structured",
        type: "function_call_result",
        output: [
          { type: "input_text", text: "a".repeat(1400) },
          { type: "input_text", text: "short" },
        ],
      };
      await f.store.transformItemForSaveAsync(value2, "session");
      assert.match(value2.output[0].text, /^<persisted-output>/);
      assert.equal(value2.output[1].text, "short");
      assert.equal(
        await io.readFile(
          path.join(f.project, "session", "tool-results", "call.txt"),
          "utf8",
        ),
        "x".repeat(1400),
      );
      return [value.output, value2.output];
    },
  ),
  scenario(
    "source Store malformed image failures retain original data and log without rejecting save",
    async (f) => {
      const value: any = {
        ...user("invalid"),
        content: [{ type: "input_image", image: "data:image/png;broken" }],
      };
      const result = await f.store.transformItemForSaveAsync(value);
      assert.equal(result.content[0].image, value.content[0].image);
      assert.equal(f.logs.at(-1)[0], "warn");
      return result;
    },
  ),
  scenario(
    "source reverse-line reader/sanitizer restores last limited records in forward order and keeps logical session/store ID",
    async (f) => {
      const values = [
        user("one"),
        {
          ...assistant("two"),
          sessionId: "logical",
          logicalParentId: "one",
          content: [{ type: "text", text: "sanitized" }],
        },
        user("three"),
      ];
      await io.writeFile(
        f.store.getSessionFilePath("physical"),
        values.map((x) => JSON.stringify(x)).join("\n") + "\ninvalid-json\n",
      );
      const loaded = await f.store.get("physical", { historyLimit: 2 });
      assert.equal(loaded.id, "logical");
      assert.equal(loaded.storeId, "physical");
      assert.equal(loaded.hasCompactedHistory, true);
      assert.deepEqual(
        loaded.history.map((x: any) => x.id),
        ["two", "three"],
      );
      assert.equal(loaded.history[0].content[0].type, "output_text");
      return [
        loaded.id,
        loaded.storeId,
        loaded.history,
        loaded.hasCompactedHistory,
      ];
    },
  ),
  scenario(
    "source Store searches agent-prefixed nested subagent files and preserves original path shape",
    async (f) => {
      const s = await f.sessionFactory.create({
        id: "parent",
        storeId: "agent-child",
        meta: { parentSessionId: "parent" },
      });
      const value = { ...user("child-user"), sessionId: "parent" };
      await f.store.appendHistory(s.storeId, [value], "parent", s);
      await f.store.save(s);
      assert.equal(
        f.store.getSessionFilePath(s.storeId, "parent"),
        path.join(f.project, "parent", "subagents", "agent-child.jsonl"),
      );
      const loaded = await f.store.get("agent-child");
      assert.equal(loaded.id, "parent");
      assert.equal(loaded.storeId, "agent-child");
      assert.equal(f.store.isNonUserSession(loaded), true);
      return [loaded.id, loaded.storeId, loaded.meta, loaded.history];
    },
  ),
  scenario(
    "source Store explicit cwd preferred project wins current project before cross-project fallback",
    async (f) => {
      await f.store.appendHistory("shared", [user("current")]);
      const preferred = f.store.getPreferredProjectDir(f.cwd);
      await io.mkdir(preferred, { recursive: true });
      await io.writeFile(
        path.join(preferred, "shared.jsonl"),
        JSON.stringify(user("preferred")) + "\n",
      );
      const loaded = await f.store.get("shared", { cwd: "  " + f.cwd + "  " });
      assert.equal(loaded.history[0].id, "preferred");
      const current = await f.store.get("shared");
      assert.equal(current.history[0].id, "current");
      return [loaded.history, current.history];
    },
  ),
  scenario(
    "source Store listing excludes subagents/compaction, applies since filter and uses first history cwd",
    async (f) => {
      for (const [id, meta] of [
        ["user", {}],
        ["hidden", { isForkedCompactionSession: true }],
      ] as const) {
        const s = await f.sessionFactory.create({ id, meta });
        await f.store.save(s);
        await f.store.appendHistory(
          id,
          [{ ...user(id), cwd: f.cwd }],
          undefined,
          s,
        );
      }
      const all = await f.store.getAll();
      assert.deepEqual(
        all.map((s: any) => s.id),
        ["user"],
      );
      assert.deepEqual(
        (
          await f.store.getAllAcrossProjects({ sinceMs: Date.now() + 100000 })
        ).map((s: any) => s.id),
        [],
      );
      assert.deepEqual(
        (await f.store.getAllByWorkdir(f.cwd)).map((s: any) => s.id),
        ["user"],
      );
      assert.equal(
        f.store.extractCwdFromSession({
          history: [{ cwd: "first" }, { cwd: "last" }],
        }),
        "first",
      );
      return all.map((s: any) => s.id);
    },
  ),
  scenario(
    "source Store getMostRecent skips newer compaction session",
    async (f) => {
      const a = await f.sessionFactory.create({ id: "visible" }),
        b = await f.sessionFactory.create({
          id: "hidden",
          meta: { isForkedCompactionSession: true },
        });
      await f.store.save(a);
      await f.store.appendHistory(a.id, [user("u")]);
      await f.store.save(b);
      await f.store.appendHistory(b.id, [user("hidden")]);
      await io.utimes(f.store.getSessionFilePath(a.id), 1000, 1000);
      await io.utimes(f.store.getSessionFilePath(b.id), 2000, 2000);
      assert.equal((await f.store.getMostRecent()).id, a.id);
      return (await f.store.getMostRecent()).id;
    },
  ),
  scenario(
    "source Store removal swallows missing-file failures and Manager delegation retains getAllAcrossProjects argument omission",
    async (f) => {
      await f.store.remove("missing");
      const calls: any[] = [];
      f.manager.sessionStore = new Proxy(
        {},
        {
          get:
            (_target, key) =>
            (...args: any[]) => {
              calls.push([String(key), args]);
              return [];
            },
        },
      );
      f.manager.getAllAcrossProjects({ sinceMs: 42 });
      f.manager.getAllByWorkdir("*", { sinceMs: 42 });
      f.manager.getAll();
      await f.manager.get("id", { cwd: f.cwd });
      assert.deepEqual(calls[0], ["getAllAcrossProjects", []]);
      assert.deepEqual(calls[1], ["getAllByWorkdir", ["*", { sinceMs: 42 }]]);
      return calls;
    },
  ),
  scenario(
    "source full Manager non-stream result subscription processes raw SDK-like items, gates after interceptors and resets consumer idempotently",
    async (f) => {
      const s = await f.manager.create({ id: "result" }, true);
      await f.manager.handleRunResult(s);
      assert.equal(f.manager.resultSubscriptions.size, 1);
      const seen: any[] = [];
      f.manager.interceptors = [
        {
          intercept: async (context: any) => {
            seen.push(context.modelResponseMetadata);
            return true;
          },
        },
      ];
      const result = {
        state: { owned: true },
        lastAgent: { name: "owned-agent" },
        rawResponses: [],
        newItems: [{ rawItem: assistant("answer") }],
      };
      s.resultSubject.next(result);
      const gate = s.interceptorGate;
      assert.ok(gate);
      assert.equal(await gate.completed, true);
      await f.drain();
      assert.equal(s.state, result.state);
      assert.equal(s.history.length, 1);
      assert.equal(seen.length, 1);
      assert.equal(f.errors.length, 0);
      f.manager.initRunResultHandler(s);
      await f.drain();
      assert.equal(f.manager.resultSubscriptions.size, 1);
      // BehaviorSubject replay on reinitialization reprocesses the last non-nudge result in the original class.
      assert.equal(s.history.length, 2);
      return [s.history, seen, f.calls];
    },
  ),
  scenario(
    "source full Manager stream emits model/items, attaches response metadata/usage and resolves original result gate",
    async (f) => {
      const s = await f.manager.create(
        { id: "stream", options: { model: "requested" } },
        true,
      );
      s.messageId = "message";
      s.traceId = "trace";
      const output = assistant("reply"),
        usage = { inputTokens: 4, outputTokens: 2, totalTokens: 6 },
        metadata: any[] = [],
        events: any[] = [];
      f.manager.interceptors = [
        {
          intercept: async (c: any) => {
            metadata.push(c.modelResponseMetadata);
            return false;
          },
        },
      ];
      s.modelSubject.subscribe((value: any) => events.push(value));
      const result: any = {
        currentTurn: 1,
        state: {
          _context: {},
          _currentStep: { type: "next_step_final_output" },
        },
        lastAgent: { name: "owned-agent" },
        rawResponses: [{ output: [output], usage }],
        interruptions: [],
        completed: Promise.resolve(),
        async *[Symbol.asyncIterator]() {
          yield raw({
            model: "response-model",
            choices: [{ delta: { content: "owned" } }],
          });
          yield delta("owned answer");
          yield item(output);
          yield done([output], usage);
        },
      };
      s.resultSubject.next(result);
      assert.equal(await s.interceptorGate.completed, false);
      await f.drain();
      assert.equal(s.history.length, 1);
      assert.equal(s.history[0].providerData.traceId, "trace");
      assert.equal(s.history[0].providerData.requestModelId, "requested");
      assert.equal(events.length, 3);
      assert.equal(s.usage.totalTokens, 6);
      assert.equal(f.errors.length, 0);
      return [s.history, metadata, events];
    },
  ),
  scenario(
    "source full Manager cancel-nudge is ignored before state/gate changes",
    async (f) => {
      const s = await f.manager.create({ id: "nudge" }, true);
      s.resultSubject.next({
        __cancelNudge: true,
        state: { shouldNotSet: true },
      });
      await f.drain();
      assert.equal(s.state, undefined);
      assert.equal(s.interceptorGate, undefined);
      assert.equal(s.history.length, 0);
      return f.calls;
    },
  ),
];
for (const [name, patch] of [
  ["session option", {}],
  [
    "explicit process argv",
    { argv: ["owned-cli", "--no-session-persistence"] },
  ],
] as const)
  SESSION_STACK_CASES.push(
    scenario(
      "source persistence disabled by " +
        name +
        " suppresses save/append/saveHistory",
      async (f) => {
        const s = await f.sessionFactory.create({
          id: "disabled",
          options:
            name === "session option" ? { sessionPersistence: false } : {},
        });
        await f.store.save(s);
        await f.store.appendHistory(s.id, [user("u")], undefined, s);
        await f.store.saveHistory(s);
        await assert.rejects(io.access(f.store.getSessionFilePath(s.id)), {
          code: "ENOENT",
        });
        return f.n.isSessionPersistenceDisabled(s);
      },
      patch,
    ),
  );
for (const value of [undefined, "", "4", "0", "-1", "1.5", "Infinity", "bad"])
  SESSION_STACK_CASES.push(
    scenario(
      "source session max items env retains validation: " + String(value),
      async (f) => {
        const expected = value === "4" ? 4 : 1000;
        assert.equal(f.n.resolveSessionMaxItems(), expected);
        assert.equal(f.n.resolveSessionMaxItems("invalid", 7), 7);
        return expected;
      },
      { env: { CODEBUDDY_SESSION_MAX_ITEMS: value } },
    ),
  );
