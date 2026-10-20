import assert from "node:assert/strict";
import * as path from "node:path";
import { BehaviorSubject } from "rxjs";
import { createNativeInteractionServices } from "../../src/interaction/native-interaction-services.js";

function fixture(factory = createNativeInteractionServices) {
  const logs: any[] = [],
    disk = new Map<string, string>(),
    timers = new Map<any, () => void>();
  let unref = 0;
  const missing = () =>
    Object.assign(Error("owned missing"), { code: "ENOENT" });
  const native = factory({
    getPlansDir: () => "/owned/plans",
    Math: { ...Math, floor: Math.floor, random: () => 0.25 },
    modules: {
      16928: path,
      29827: { BehaviorSubject },
      91943: {
        async writeFile(p: string, text: string, encoding: string) {
          assert.equal(encoding, "utf-8");
          disk.set(p, text);
        },
        async readFile(p: string) {
          if (!disk.has(p)) throw missing();
          return disk.get(p);
        },
        async access(p: string) {
          if (!disk.has(p)) throw missing();
        },
      },
      79896: {
        readFileSync(p: string) {
          if (!disk.has(p)) throw missing();
          return disk.get(p);
        },
      },
    },
    setTimeout(fn: () => void) {
      const t = {
        unref() {
          unref++;
        },
      };
      timers.set(t, fn);
      return t;
    },
    clearTimeout(t: any) {
      timers.delete(t);
    },
  });
  const logger = Object.fromEntries(
    ["setContext", "info", "debug", "warn", "error"].map((k) => [
      k,
      (...args: any[]) =>
        logs.push([
          k,
          ...args.map((x) =>
            x instanceof Error ? { name: x.name, message: x.message } : x,
          ),
        ]),
    ]),
  );
  const ask = new native.AskServiceImpl(),
    storage = new native.PlanStorageServiceImpl();
  ask.logger = storage.logger = logger;
  ask.init();
  const item = (id: string) => ({
    rawItem: {
      type: "function_call",
      callId: id,
      id,
      name: "AskUserQuestion",
      arguments: "{}",
    },
  });
  return { native, ask, storage, logs, disk, timers, item, unref: () => unref };
}
export const INTERACTION_SERVICE_CASES = [
  {
    name: "complete native interaction tokens, Deferred and trace constants",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        d = new (f.native.getModule(8461).Deferred)();
      d.resolve("owned");
      assert.equal(await d.promise, "owned");
      return {
        ask: f.native.getModule(40348).AskService.description,
        plan: f.native.getModule(78621).PlanStorageService.description,
        span: f.native.getModule(92735).SPAN_NAME_USER_INPUT_WAIT,
        logs: f.logs,
      };
    },
  },
  {
    name: "complete original plan naming and absent-meta lazy initialization",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        s: any = { id: "owned" };
      assert.equal(
        f.storage.initializePlanFilePath(s),
        "/owned/plans/swift-thunder-curie.md",
      );
      assert.equal(f.storage.initializePlanFilePath(s), s.meta.planFilePath);
      return { meta: s.meta, logs: f.logs };
    },
  },
  {
    name: "complete original PlanStorage missing/read/write/sync/exists behavior",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        s: any = { id: "owned", meta: {} };
      assert.equal(await f.storage.read(s), undefined);
      assert.equal(f.storage.syncRead(s), undefined);
      assert.equal(await f.storage.exists(s), false);
      await assert.rejects(f.storage.write(s, "unused"), /not initialized/);
      f.storage.initializePlanFilePath(s);
      assert.equal(await f.storage.read(s), undefined);
      await f.storage.write(s, "owned plan 中文😀");
      assert.equal(await f.storage.read(s), "owned plan 中文😀");
      assert.equal(f.storage.syncRead(s), "owned plan 中文😀");
      assert.equal(await f.storage.exists(s), true);
      return { meta: s.meta, logs: f.logs, disk: [...f.disk] };
    },
  },
  {
    name: "complete original AskService early answer consumption and same-item alias",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        a = f.item("a");
      f.ask.doneAsk({ Q: "human" }, "a");
      f.ask.setAsk(a);
      const d = f.ask.getCurrentDeferred();
      f.ask.setAsk({ ...a });
      assert.equal(f.ask.getCurrentDeferred(), d);
      assert.deepEqual(await d.promise, { Q: "human" });
      // Original setAsk consumes the early answer into the legacy Deferred only.
      // A later acquireAnswers is a separate waiter, not a duplicate delivery.
      const pending = f.ask.acquireAnswers("a", undefined, 0);
      assert.deepEqual(f.ask.getRoutingState().waitingDeferredKeys, ["a"]);
      f.ask.doneAsk({ Q: "second" }, "a");
      assert.deepEqual(await pending, { Q: "second" });
      return { routing: f.ask.getRoutingState(), logs: f.logs };
    },
  },
  {
    name: "complete original AskService replacement, targeted waiter and legacy single fallback",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        first = f.ask.acquireAnswers("a", undefined, 0),
        rejected = assert.rejects(first, /Superseded/),
        next = f.ask.acquireAnswers("a", undefined, 0);
      await rejected;
      f.ask.doneAsk({ Q: "single" });
      assert.deepEqual(await next, { Q: "single" });
      f.ask.setAsk(f.item("b"));
      const old = f.ask.getCurrentDeferred();
      f.ask.setAsk(f.item("c"));
      assert.equal(await old.promise, undefined);
      const last = f.ask.acquireAnswers("c", undefined, 0),
        denied = assert.rejects(last, /declined/);
      f.ask.rejectAsk("c");
      await denied;
      return { routing: f.ask.getRoutingState(), logs: f.logs };
    },
  },
  {
    name: "complete original AskService finite timeout, unref and cleanup",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        p = f.ask.acquireAnswers("timeout", undefined, 5),
        rejected = assert.rejects(p, /timed out/);
      for (const fn of f.timers.values()) fn();
      await rejected;
      await Promise.resolve();
      assert.equal(f.timers.size, 0);
      assert.equal(f.unref(), 1);
      return { routing: f.ask.getRoutingState(), logs: f.logs };
    },
  },
  {
    name: "complete original AskService aborted-before and aborted-during waits",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        a = new AbortController();
      a.abort();
      await assert.rejects(f.ask.acquireAnswers("before", a.signal), /Aborted/);
      const b = new AbortController(),
        p = f.ask.acquireAnswers("during", b.signal),
        rejected = assert.rejects(p, /Aborted/);
      b.abort();
      await rejected;
      await Promise.resolve();
      assert.equal(f.timers.size, 0);
      return { routing: f.ask.getRoutingState(), logs: f.logs };
    },
  },
  {
    name: "complete original AskService wait span replacement and failure flush",
    async run(factory = createNativeInteractionServices) {
      const f = fixture(factory),
        spans: any[] = [],
        trace = {
          startSpan(name: string) {
            const e: any = { name };
            spans.push(e);
            return {
              setAttributes(a: any) {
                e.attributes = a;
              },
              markAsSuccessful() {
                e.success = true;
              },
              markAsFailed(reason: any) {
                e.failed = reason.message;
              },
            };
          },
        };
      f.ask.startWaitSpan("a", trace, 1);
      f.ask.startWaitSpan("a", trace, 0, "Write");
      f.ask.setAsk(f.item("a"));
      f.ask.setAsk(f.item("b"));
      f.ask.startWaitSpan("b", trace, 2);
      f.ask.flushPendingWaitSpans("owned close");
      return { spans, logs: f.logs };
    },
  },
];
