import test from "node:test";
import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import { Subject } from "rxjs";
import { sessionStackFixture } from "../scripts/helpers/session-stack-fixture.js";
import { createNativeSessionStackHost } from "../src/sessions/native-session-stack-host.js";
import { agentRunFixture } from "../scripts/helpers/agent-run-fixture.js";
import { nativeRunnerFixture } from "../scripts/helpers/native-runner-fixture.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function stopped(session: any) {
  assert.equal(session.abortSignal.aborted, true);
  for (const value of new Set(Object.values(session)))
    if (value instanceof Subject) assert.equal(value.isStopped, true);
}

test("public native session host requires explicit dependencies and session release ownership", () => {
  assert.throws(
    () => createNativeSessionStackHost({} as any),
    /closeSession owner/,
  );
  assert.throws(
    () => createNativeSessionStackHost({ closeSession() {} } as any),
    /manager dependencies/,
  );
});
test("public native session host assembles original classes without turning create into activate/save", async () => {
  const f = await sessionStackFixture();
  try {
    assert.equal(f.manager.constructor, f.host.native.SessionManagerImpl);
    assert.equal(f.store.constructor, f.host.native.SessionStoreImpl);
    assert.equal(f.controller.constructor, f.host.ingress.AgentController);
    assert.equal(f.middleware.constructor, f.host.ingress.SessionMiddleWare);
    const session = await f.manager.create({ id: "owned-created" });
    assert.equal(f.manager.getCurrent(), undefined);
    assert.equal(f.manager.sessionSubject.value, undefined);
    assert.equal(f.manager.resultSubscriptions.size, 0);
    await assert.rejects(io.access(f.store.getSessionFilePath(session.id)), {
      code: "ENOENT",
    });
    assert.equal(f.host.sessionCount, 1);
    assert.ok(
      f.calls.some(
        (item) => item[0] === "permissions" && item[1] === session.id,
      ),
    );
    await f.host.close();
    stopped(session);
    assert.equal(f.host.sessionCount, 0);
  } finally {
    await f.close();
  }
});
test("source Store-loaded sessions belong to the same owner and all original Subjects complete", async () => {
  const f = await sessionStackFixture();
  try {
    const session = await f.manager.create({
      id: "owned-reload",
      meta: { marker: true },
    });
    await f.manager.addHistory(session, "persisted owned history");
    await f.manager.save(session);
    const loaded = await f.store.get(session.id);
    assert.notEqual(loaded, session);
    assert.equal(loaded.meta.marker, true);
    assert.equal(f.host.sessionCount, 2);
    await f.host.close();
    stopped(session);
    stopped(loaded);
    assert.equal(f.host.timerCount, 0);
    assert.equal(f.timers.pending.size, 0);
  } finally {
    await f.close();
  }
});
test("close preserves JSONL/meta bytes and never delegates to destructive Manager.remove", async () => {
  const f = await sessionStackFixture();
  try {
    const session = await f.manager.create({
      id: "owned-durable",
      meta: { note: "中文😀" },
    });
    await f.manager.addHistory(session, "owned text");
    await f.manager.save(session);
    const file = f.store.getSessionFilePath(session.id),
      meta = f.store.getSessionMetaFilePath(session.id);
    const before = await Promise.all([
      io.readFile(file, "utf8"),
      io.readFile(meta, "utf8"),
    ]);
    f.manager.remove = () => {
      throw Error("must not delete persisted sessions on close");
    };
    await f.host.close();
    assert.deepEqual(
      await Promise.all([io.readFile(file, "utf8"), io.readFile(meta, "utf8")]),
      before,
    );
  } finally {
    await f.close();
  }
});
test("accepted history IO finishes during close, including its late-created idle timer", async () => {
  const entered = deferred(),
    release = deferred();
  const f = await sessionStackFixture(undefined, {
    io: {
      async appendFile(...args: any[]) {
        entered.resolve();
        await release.promise;
        return (io.appendFile as any)(...args);
      },
    },
  });
  try {
    const session = await f.manager.create({ id: "owned-slow-append" });
    const writing = f.manager.addHistory(session, "owned final append");
    await entered.promise;
    const file = f.store.getSessionFilePath(session.id);
    let finished = false;
    const closing = f.host.close().then(() => {
      finished = true;
    });
    await tick();
    assert.equal(finished, false);
    assert.equal(session.abortSignal.aborted, true);
    release.resolve();
    await Promise.all([writing, closing]);
    assert.match(await io.readFile(file, "utf8"), /owned final append/);
    assert.equal(f.host.pendingCount, 0);
    assert.equal(f.host.timerCount, 0);
    assert.equal(f.timers.pending.size, 0);
    stopped(session);
  } finally {
    release.resolve();
    await f.close();
  }
});
test("scope ledger does not deadlock drain and an accepted scope may finish source history work while closing", async () => {
  const f = await sessionStackFixture(),
    entered = deferred(),
    release = deferred();
  try {
    const session = await f.manager.create({ id: "owned-scope" });
    const file = f.store.getSessionFilePath(session.id);
    const running = f.manager.run(session, async () => {
      entered.resolve();
      await release.promise;
      assert.equal(f.manager.getCurrent(), session);
      await f.manager.addHistory(session, "accepted scope tail");
    });
    await entered.promise;
    await f.host.drain();
    assert.equal(f.host.scopeCount, 1);
    let closed = false;
    const closing = f.host.close().then(() => {
      closed = true;
    });
    await tick();
    assert.equal(closed, false);
    await assert.rejects(
      f.manager.create({ id: "outside-admission" }),
      /host is closed/,
    );
    release.resolve();
    await Promise.all([running, closing]);
    assert.match(await io.readFile(file, "utf8"), /accepted scope tail/);
    assert.equal(f.host.scopeCount, 0);
    assert.equal(f.host.pendingCount, 0);
    assert.equal(f.host.timerCount, 0);
  } finally {
    release.resolve();
    await f.close();
  }
});
test("async original result observer is passively awaited and its subscribe descriptor is restored", async () => {
  const f = await sessionStackFixture(),
    entered = deferred(),
    release = deferred();
  try {
    const session = await f.sessionFactory.create({ id: "owned-observer" });
    assert.equal(Object.hasOwn(session.resultSubject, "subscribe"), true);
    session.resultSubject.subscribe(async (value: any) => {
      if (!value) return;
      entered.resolve();
      await release.promise;
      await f.manager.addHistory(session, "observer completed");
    });
    session.resultSubject.next({
      owned: true,
      lastAgent: { name: "owned" },
      rawResponses: [],
    });
    await entered.promise;
    assert.ok(f.host.pendingCount > 0);
    const file = f.store.getSessionFilePath(session.id);
    const closing = f.host.close();
    release.resolve();
    await closing;
    assert.match(await io.readFile(file, "utf8"), /observer completed/);
    assert.equal(Object.hasOwn(session.resultSubject, "subscribe"), false);
    stopped(session);
  } finally {
    release.resolve();
    await f.close();
  }
});
test("detached result rejection is observed without unhandled rejection and reported after cleanup", async () => {
  const f = await sessionStackFixture();
  try {
    const session = await f.sessionFactory.create({
      id: "owned-rejected-observer",
    });
    session.resultSubject.subscribe(async (value: any) => {
      if (value) throw Error("owned detached observer failed");
    });
    session.resultSubject.next({ owned: true });
    await f.host.drain();
    assert.equal(f.host.errors.length, 1);
    assert.match(String(f.host.errors[0]), /owned detached observer failed/);
    await assert.rejects(
      f.host.close(),
      (error: any) =>
        error instanceof AggregateError && error.errors.length === 1,
    );
    stopped(session);
    assert.equal(f.host.state, "closed");
    assert.equal(f.host.timerCount, 0);
    assert.equal(f.host.pendingCount, 0);
    await assert.rejects(f.close(), /Native session host close failed/);
  } finally {
    await f.close();
  }
});
test("a factory object remains owned if permission initialization rejects Manager.create", async () => {
  let captured: any;
  const f = await sessionStackFixture(undefined, {
    permissions(session: any) {
      captured = session;
      throw Error("owned permission init failure");
    },
  });
  try {
    await assert.rejects(
      f.manager.create({ id: "owned-permission-failed" }),
      /owned permission init failure/,
    );
    assert.equal(f.host.sessionCount, 1);
    assert.deepEqual(f.host.errors, []);
    await f.host.close();
    stopped(captured);
  } finally {
    await f.close();
  }
});
test("close waits a creation accepted before permissions settle and releases it once", async () => {
  const entered = deferred(),
    release = deferred(),
    released: string[] = [];
  const f = await sessionStackFixture(undefined, {
    async permissions() {
      entered.resolve();
      await release.promise;
    },
    closeSession(session: any) {
      released.push(session.id);
    },
  });
  try {
    const creating = f.manager.create({ id: "owned-creating" });
    await entered.promise;
    const closing = f.host.close();
    release.resolve();
    const session = await creating;
    await closing;
    stopped(session);
    assert.deepEqual(released, [session.id]);
    assert.equal(f.host.sessionCount, 0);
  } finally {
    release.resolve();
    await f.close();
  }
});
test("one borrowed release failure does not skip remaining sessions or owned cleanup", async () => {
  const released: string[] = [];
  const f = await sessionStackFixture(undefined, {
    closeSession(session: any) {
      released.push(session.id);
      throw Error("owned release failure " + session.id);
    },
  });
  try {
    const one = await f.sessionFactory.create({ id: "owned-release-one" }),
      two = await f.sessionFactory.create({ id: "owned-release-two" });
    const closing = f.host.close();
    assert.equal(f.host.close(), closing);
    await assert.rejects(
      closing,
      (error: any) =>
        error instanceof AggregateError && error.errors.length === 2,
    );
    assert.deepEqual(released, [one.id, two.id]);
    stopped(one);
    stopped(two);
    assert.equal(f.host.state, "closed");
    assert.equal(f.host.sessionCount, 0);
    assert.equal(f.host.immediateCount, 0);
    await assert.rejects(f.close(), /Native session host close failed/);
  } finally {
    await f.close();
  }
});
test("source Controller deferred run is owned, cancelled at close and cannot start SDK work later", async () => {
  const f = await sessionStackFixture();
  try {
    const session = await f.manager.create({ id: "owned-deferred-controller" });
    let calls = 0;
    f.controller.agentService = {
      async runDefault() {
        calls++;
      },
    };
    await f.manager.run(session, () =>
      f.controller.run({ prompt: "owned delayed run", print: false }, {}),
    );
    assert.equal(calls, 0);
    assert.equal(f.host.immediateCount, 1);
    assert.equal(f.scheduled.length, 1);
    await f.host.close();
    await f.scheduled[0]!();
    assert.equal(calls, 0);
    assert.equal(f.host.immediateCount, 0);
  } finally {
    await f.close();
  }
});
test("source Controller deferred work already running is awaited at close", async () => {
  const f = await sessionStackFixture(),
    entered = deferred(),
    release = deferred();
  try {
    const session = await f.manager.create({ id: "owned-running-controller" });
    f.controller.agentService = {
      async runDefault() {
        entered.resolve();
        await release.promise;
      },
    };
    await f.manager.run(session, () =>
      f.controller.run({ prompt: "owned running", print: false }, {}),
    );
    const running = f.scheduled[0]!();
    await entered.promise;
    let finished = false;
    const closing = f.host.close().then(() => {
      finished = true;
    });
    await tick();
    assert.equal(finished, false);
    release.resolve();
    await Promise.all([running, closing]);
    assert.equal(f.host.pendingCount, 0);
    assert.equal(f.host.immediateCount, 0);
  } finally {
    release.resolve();
    await f.close();
  }
});
test("real source idle timeout is cleared without waiting sixty seconds or changing original delay", async () => {
  const f = await sessionStackFixture(undefined, { realTimers: true });
  try {
    const session = await f.manager.create({ id: "owned-real-timer" });
    await f.manager.addHistory(session, "owned timer");
    assert.equal(f.host.timerCount, 1);
    const timer = f.manager.idleTimers.get(session.id);
    assert.equal(timer._idleTimeout, 60000);
    await f.host.close();
    assert.equal(timer._destroyed, true);
    assert.equal(f.host.timerCount, 0);
  } finally {
    await f.close();
  }
});
test("borrowed service method receivers are retained and borrowed service itself is not closed", async () => {
  const f = await sessionStackFixture();
  const progress = {
    starts: 0,
    closed: 0,
    async start() {
      this.starts++;
    },
    stop() {},
    close() {
      this.closed++;
    },
  };
  try {
    f.manager.progressSyncService = progress;
    const session = await f.manager.create({ id: "owned-borrowed" });
    f.manager.setCurrent(session);
    await f.host.drain();
    assert.equal(progress.starts, 1);
    await f.host.close();
    assert.equal(progress.closed, 0);
    assert.equal(f.manager.resultSubscriptions.size, 0);
  } finally {
    await f.close();
  }
});
test("closed facades refuse new source operations without returning a global current-session fallback", async () => {
  const f = await sessionStackFixture();
  try {
    const session = await f.manager.create({ id: "owned-closed" });
    await f.host.close();
    assert.throws(() => f.manager.getCurrent(), /host is closed/);
    assert.throws(() => f.manager.setCurrent(session), /host is closed/);
    await assert.rejects(
      f.manager.create({ id: "late-create" }),
      /host is closed/,
    );
    await assert.rejects(
      f.sessionFactory.create({ id: "late-factory" }),
      /host is closed/,
    );
    await assert.rejects(f.store.get(session.id), /host is closed/);
    assert.equal(f.host.sessionCount, 0);
  } finally {
    await f.close();
  }
});

for (const [name, create] of [
  ["AgentService", agentRunFixture],
  ["Runner", nativeRunnerFixture],
] as const)
  test(
    "composed " +
      name +
      " fixture retains live owner diagnostics instead of a spread snapshot",
    async () => {
      const f = await create();
      try {
        assert.equal(f.errors.length, 0);
        f.s.resultSubject.subscribe(async (value: any) => {
          if (value?.ownedDiagnostic)
            throw Error("owned composed observer failure");
        });
        f.s.resultSubject.next({ ownedDiagnostic: true, lastAgent: f.agent });
        await f.host.drain();
        assert.equal(f.host.errors.length, 1);
        assert.equal(f.errors.length, 1);
        assert.match(String(f.errors[0]), /owned composed observer failure/);
        await assert.rejects(f.close(), /Native session host close failed/);
      } finally {
        await f.close();
      }
    },
  );
