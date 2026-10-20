import test from "node:test";
import assert from "node:assert/strict";
import { Subject, Subscriber } from "rxjs";
import {
  acpProtocolFixture,
  settle,
} from "../scripts/helpers/acp-protocol-fixture.js";
import { createNativeAcpProtocolHost } from "../src/protocol/native-acp-protocol-host.js";
import { createAcpRendezvousHost } from "../src/protocol/acp-rendezvous-host.js";

function deferred<T = any>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
const turn = () => new Promise<void>((done) => setImmediate(done));
const tracking = {
  requestId: "owned",
  messageId: "owned-message",
  messageRequestId: "owned-user",
};

test("public protocol host requires an explicit runtime and constructs original instances with unchanged method metadata", async () => {
  assert.throws(
    () => createNativeAcpProtocolHost({} as any),
    /explicit parent runtime/,
  );
  const f = acpProtocolFixture();
  try {
    assert.equal(f.agent.constructor, f.n.AcpAgentImpl);
    assert.equal(f.view.constructor, f.v.AcpView);
    assert.equal(f.toolInterceptor.constructor, f.p.AcpToolInterceptor);
    assert.equal(f.agent.prompt.name, f.n.AcpAgentImpl.prototype.prompt.name);
    assert.equal(
      f.agent.prompt.length,
      f.n.AcpAgentImpl.prototype.prompt.length,
    );
    assert.equal(
      f.agent.prompt,
      f.agent.prompt,
      "facade methods keep stable identity",
    );
    assert.equal(f.agent.sessionManager, f.sessionManager);
    assert.equal(f.agent.interruptionService, f.interruptionService);
    assert.equal(f.agent.logger, f.logger);
  } finally {
    await f.close();
  }
});

test("core namespace overlays preserve borrowed getters and late additions without mutating the parent", async () => {
  const f = acpProtocolFixture(),
    parent = f.modules[80699],
    before = Reflect.ownKeys(parent);
  let revision = 1;
  Object.defineProperty(parent, "ownedLiveGetter", {
    configurable: true,
    enumerable: true,
    get: () => revision,
  });
  const host = createNativeAcpProtocolHost({ runtime: f.runtime });
  try {
    assert.equal(host.modules[80699].ownedLiveGetter, 1);
    revision = 2;
    assert.equal(host.modules[80699].ownedLiveGetter, 2);
    parent.ownedLateValue = 3;
    assert.equal(host.modules[80699].ownedLateValue, 3);
    host.modules[80699].ownedLateValue = 4;
    assert.equal(parent.ownedLateValue, 3);
    assert.equal(host.modules[80699].ownedLateValue, 4);
    assert.deepEqual(Reflect.ownKeys(parent), [
      ...before,
      "ownedLiveGetter",
      "ownedLateValue",
    ]);
    assert.equal(host.modules[80699].Deferred, host.p.Deferred);
    assert.equal(f.modules[80699].Deferred, f.p.Deferred);
  } finally {
    await host.close();
    await f.close();
  }
});

test("source forwarding subscription leases restore borrowed descriptors immediately and never replace session identity", async () => {
  const controller = new AbortController(),
    f = acpProtocolFixture(undefined, {
      beforeClose: () => controller.abort(),
    });
  const subject = f.session.combineSubject,
    descriptor = Object.getOwnPropertyDescriptor(subject, "subscribe"),
    subscribe = subject.subscribe;
  const forwarding = f.agent.createEventForwardingPromise(f.session, tracking, {
    signal: controller.signal,
  });
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(subject, "subscribe"),
    descriptor,
  );
  assert.equal(subject.subscribe, subscribe);
  assert.equal(f.sessionManager.getCurrent(), f.session);
  assert.equal(f.agent.activeForwardingCleanups.size, 1);
  await f.close();
  assert.equal((await forwarding).stopReason, "cancelled");
  assert.equal(f.session.abortSignal.aborted, false);
  assert.equal(subject.isStopped, false);
  assert.equal(subject.observers.length, 0);
  assert.equal(f.tasks.eventNames().length, 0);
  assert.equal(
    f.host.pendingCount + f.host.timerCount + f.host.subscriptionCount,
    0,
  );
});

test("close waits the actual original forwarder and does not silently cancel a borrowed caller signal", async () => {
  const f = acpProtocolFixture(),
    controller = new AbortController();
  const forwarding = f.agent.createEventForwardingPromise(f.session, tracking, {
    signal: controller.signal,
  });
  let closed = false;
  const closing = f.close().then(() => {
    closed = true;
  });
  await turn();
  assert.equal(closed, false);
  assert.equal(controller.signal.aborted, false);
  assert.equal(
    f.agent.activeForwardingCleanups.size,
    1,
    "do not strand the source promise by cleaning its listener first",
  );
  controller.abort();
  await closing;
  assert.equal((await forwarding).stopReason, "cancelled");
});

test("completed turn subscriptions retire from the owner without retaining old session closures until connection close", async () => {
  const f = acpProtocolFixture();
  for (let index = 0; index < 3; index++) {
    const controller = new AbortController();
    const forwarding = f.agent.createEventForwardingPromise(
      f.session,
      tracking,
      { signal: controller.signal },
    );
    assert.ok(f.host.subscriptionCount > 0);
    controller.abort();
    assert.equal((await forwarding).stopReason, "cancelled");
    await settle();
    assert.equal(f.host.subscriptionCount, 0);
    assert.equal(f.agent.activeForwardingCleanups.size, 0);
    assert.equal(f.session.combineSubject.observers.length, 0);
  }
  await f.close();
});

test("a partial borrowed Subject observation failure rolls back earlier subscribe leases before returning", async () => {
  const f = acpProtocolFixture(),
    subject = f.session.combineSubject;
  Object.defineProperty(subject, "subscribe", {
    configurable: false,
    writable: false,
    value: subject.subscribe,
  });
  const before = Object.values(f.session)
    .filter((value) => value instanceof Subject)
    .map((value: any) => [
      value,
      Object.getOwnPropertyDescriptor(value, "subscribe"),
    ]);
  assert.throws(
    () => f.agent.createEventForwardingPromise(f.session, tracking),
    /configurable subscribe/,
  );
  for (const [value, descriptor] of before)
    assert.deepEqual(
      Object.getOwnPropertyDescriptor(value, "subscribe"),
      descriptor,
    );
  assert.equal(f.agent.activeForwardingCleanups.size, 0);
  assert.equal(f.host.subscriptionCount, 0);
  await f.close();
});

test("the original caller signal can have a nonconfigurable addEventListener without being patched or replaced", async () => {
  const controller = new AbortController(),
    signal = controller.signal;
  Object.defineProperty(signal, "addEventListener", {
    configurable: false,
    writable: false,
    value: signal.addEventListener.bind(signal),
  });
  const descriptor = Object.getOwnPropertyDescriptor(
    signal,
    "addEventListener",
  );
  const f = acpProtocolFixture();
  const forwarding = f.agent.createEventForwardingPromise(f.session, tracking, {
    signal,
  });
  const closing = f.close();
  controller.abort();
  await closing;
  assert.equal((await forwarding).stopReason, "cancelled");
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(signal, "addEventListener"),
    descriptor,
  );
});

test("an owned source prompt Deferred is rejected on close without an extra prompt-event consumer", async () => {
  const f = acpProtocolFixture();
  const pending = f.agent.prompt({
    sessionId: f.session.id,
    prompt: [{ type: "text", text: "owned" }],
  });
  const rejected = assert.rejects(pending, /protocol host is closed/);
  await settle();
  assert.equal(f.agent.promptEvent.observers.length, 0);
  assert.equal(f.host.deferredCount, 1);
  await f.close();
  await rejected;
  assert.equal(f.host.pendingCount + f.host.deferredCount, 0);
  assert.deepEqual(f.host.errors, []);
});

test("all source-created session Deferred assignments are retained, including an overwritten earlier waiter", async () => {
  const f = acpProtocolFixture(),
    first = new f.p.Deferred(),
    second = new f.p.Deferred();
  const a = assert.rejects(first.promise, /protocol host is closed/),
    b = assert.rejects(second.promise, /protocol host is closed/);
  f.agent.sessionDeferred = first;
  f.agent.sessionDeferred = second;
  assert.equal(f.agent.sessionDeferred, second);
  assert.equal(f.host.deferredCount, 2);
  await f.close();
  await Promise.all([a, b]);
  assert.equal(
    Object.getOwnPropertyDescriptor(f.agent, "sessionDeferred")?.get,
    undefined,
  );
  assert.equal(f.agent.sessionDeferred, second);
});

test("rendezvous composes with a protocol-owned sessionDeferred accessor and restores that descriptor", async () => {
  const f = acpProtocolFixture(),
    descriptor = Object.getOwnPropertyDescriptor(f.agent, "sessionDeferred");
  const owner = createAcpRendezvousHost({
    runtime: f.runtime,
    agentManager: { get: () => f.agent },
    logger: f.logger,
    dependencies: {
      sessionManager: f.sessionManager,
      stateMachine: f.stateMachine,
      agentService: {},
      commandManager: {},
      interruptionService: f.interruptionService,
      taskStorage: {},
      broadcastService: {},
      frictionAnalysisService: {},
    },
  });
  owner.rpcAgent(f.agent);
  assert.throws(
    () => owner.rpcAgent(new Proxy(f.agent, {})),
    /dedicated source Agent/,
  );
  const value = new f.p.Deferred(),
    rejected = assert.rejects(value.promise, /closed/);
  f.agent.sessionDeferred = value;
  assert.equal(f.host.deferredCount, 1);
  await owner.close();
  await rejected;
  assert.equal(
    Object.getOwnPropertyDescriptor(f.agent, "sessionDeferred")?.get,
    descriptor?.get,
  );
  assert.equal(f.agent.sessionDeferred, value);
  await f.close();
});

test("original prompt iterator return wakes an accepted next and cleans an unstarted iterator too", async () => {
  const f = acpProtocolFixture();
  const source = f.view.createPromptIterator(f.agent, f.session),
    iterator = source[Symbol.asyncIterator](),
    unused = f.view.createPromptIterator(f.agent, f.session);
  const descriptor = Object.getOwnPropertyDescriptor(
    source,
    Symbol.asyncIterator,
  );
  const next = iterator.next();
  assert.equal(f.agent.promptEvent.observers.length, 2);
  await f.close();
  assert.equal((await next).done, true);
  assert.equal(f.agent.promptEvent.observers.length, 0);
  assert.notEqual(
    Object.getOwnPropertyDescriptor(source, Symbol.asyncIterator)?.value,
    descriptor?.value,
  );
  assert.equal((await unused[Symbol.asyncIterator]().next()).done, true);
});

test("close waits an already accepted ACK's actual 5000ms timeout instead of deleting its wakeup", async () => {
  const f = acpProtocolFixture();
  f.agent.connection.sessionUpdate = () => new Promise(() => {});
  const ack = f.agent.sendPromptSessionUpdate({}, f.session.id);
  let closed = false;
  const closing = f.close().then(() => {
    closed = true;
  });
  await turn();
  assert.equal(closed, false);
  await f.tick(4999);
  assert.equal(closed, false);
  await f.tick(1);
  assert.equal(await ack, false);
  await closing;
  assert.equal(f.host.timerCount, 0);
});

test("borrowed external URL subscriptions are released, but shared connection and Subjects remain open", async () => {
  const token = Symbol("owned opener"),
    urls = new Subject(),
    f = acpProtocolFixture(undefined, {
      modules: { 79814: { ExternalUriOpener: token } },
    });
  f.setDependency(token, { urlSubject: urls });
  f.agent.connection.close = () => {
    throw Error("do not close a borrowed connection");
  };
  f.agent.setupUrlSubjectSubscription();
  assert.equal(urls.observers.length, 1);
  await f.close();
  assert.equal(urls.observers.length, 0);
  assert.equal(urls.isStopped, false);
  assert.equal(f.session.resultSubject.isStopped, false);
});

test("detached callback failure is reported after subscription cleanup without escaping as an unhandled rejection", async () => {
  const f = acpProtocolFixture();
  f.agent.modelChangeEvent.subscribe(async () => {
    throw Error("owned callback failure");
  });
  f.agent.modelChangeEvent.next({});
  await settle();
  assert.equal(f.host.errors.length, 1);
  await assert.rejects(f.close(), AggregateError);
  assert.equal(f.host.state, "closed");
  assert.equal(f.host.subscriptionCount + f.host.timerCount, 0);
  assert.equal(f.agent.modelChangeEvent.isStopped, true);
});

test("owned Subject completion preserves observer receiver and close waits its asynchronous cleanup", async () => {
  const f = acpProtocolFixture(),
    pending = deferred();
  let entered = false,
    closed = false;
  const observer = {
    next() {},
    async complete(this: any) {
      assert.equal(this, observer);
      entered = true;
      await pending.promise;
    },
  };
  f.agent.modelChangeEvent.subscribe(observer);
  const closing = f.close().then(() => {
    closed = true;
  });
  await turn();
  assert.equal(entered, true);
  assert.equal(closed, false);
  pending.resolve(undefined);
  await closing;
  assert.equal(f.host.pendingCount + f.host.subscriptionCount, 0);
  assert.deepEqual(f.host.errors, []);
});

test("the RxJS Subscriber overload retains the exact caller subscription identity", async () => {
  const f = acpProtocolFixture(),
    seen: any[] = [],
    subscriber = new Subscriber((value) => seen.push(value));
  assert.equal(f.agent.modelChangeEvent.subscribe(subscriber), subscriber);
  f.agent.modelChangeEvent.next("owned");
  assert.deepEqual(seen, ["owned"]);
  await f.close();
  assert.equal(subscriber.closed, true);
});

test("synchronous cleanup failures do not skip other resources or descriptor restoration", async () => {
  const f = acpProtocolFixture(undefined, {
    beforeClose: () => {
      throw Error("owned close failure");
    },
  });
  f.agent.activeForwardingCleanups.set("owned injected cleanup", () => {
    throw Error("owned cleanup failure");
  });
  await assert.rejects(f.close(), (error: any) => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(
      error.errors.map((entry: Error) => entry.message),
      ["owned close failure", "owned cleanup failure"],
    );
    return true;
  });
  assert.equal(f.host.state, "closed");
  assert.equal(f.agent.activeForwardingCleanups.size, 0);
  assert.equal(Object.hasOwn(f.agent.promptEvent, "subscribe"), false);
  assert.equal(Object.hasOwn(f.agent, "sessionDeferred"), false);
  assert.equal(f.agent.promptEvent.isStopped, true);
});

test("closed protocol methods reject new admission, with the same close promise and no new timer", async () => {
  const f = acpProtocolFixture(),
    first = f.host.close();
  assert.equal(f.host.close(), first);
  await first;
  await assert.rejects(f.agent.prompt({}), /closed/);
  assert.throws(() => f.agent.getConnectionId(), /closed/);
  assert.throws(() => f.toolInterceptor.setConnection({}), /closed/);
  await assert.rejects(
    f.view.waitForSessionUpdate(Promise.resolve(), "owned"),
    /closed/,
  );
  assert.equal(f.host.timerCount, 0);
  await f.close();
});

test("original terminal timeout is owned without changing 120000ms or issuing an extra terminal wait", async () => {
  const f = acpProtocolFixture(),
    seen: string[] = [];
  f.toolInterceptor.setConnection({
    createTerminal: async () => ({
      id: "owned-terminal",
      waitForExit: () => {
        seen.push("wait");
        return new Promise(() => {});
      },
      currentOutput: async () => ({ output: "owned output", exitStatus: null }),
      release: async () => {
        seen.push("release");
      },
    }),
    sessionUpdate: async () => {},
  });
  const running = f.toolInterceptor.callBash(
    { command: "owned-not-executed" },
    { context: f.session },
    { toolCall: { callId: "owned-call" } },
  );
  await settle();
  assert.equal(f.host.timerCount, 1);
  let closed = false;
  const closing = f.close().then(() => {
    closed = true;
  });
  await f.tick(119999);
  assert.equal(closed, false);
  await f.tick(1);
  assert.match((await running).content, /owned output/);
  await closing;
  assert.deepEqual(seen, ["wait", "release"]);
  assert.equal(f.host.timerCount, 0);
});

test("successful terminal race keeps its source loser timer until owner close, without another kill or release", async () => {
  const f = acpProtocolFixture(),
    seen: string[] = [];
  f.toolInterceptor.setConnection({
    createTerminal: async () => ({
      id: "owned-terminal",
      waitForExit: async () => ({ exitCode: 0 }),
      currentOutput: async () => ({
        output: "owned output",
        exitStatus: { exitCode: 0 },
      }),
      kill: async () => {
        seen.push("kill");
      },
      release: async () => {
        seen.push("release");
      },
    }),
    sessionUpdate: async () => {},
  });
  await f.toolInterceptor.callBash(
    { command: "owned-not-executed" },
    { context: f.session },
    { toolCall: { callId: "owned-call" } },
  );
  assert.equal(
    f.host.timerCount,
    1,
    "the source does not clear its losing timeout",
  );
  await f.close();
  assert.equal(f.timers.size, 0);
  assert.deepEqual(seen, ["release"]);
});

test("background terminal completion belongs to the explicit transport parent, not the initial started response", async () => {
  const exit = deferred(),
    released = deferred(),
    seen: string[] = [];
  const f = acpProtocolFixture(undefined, {
    beforeClose: async () => {
      exit.resolve({ exitCode: 0 });
      await released.promise;
    },
  });
  f.toolInterceptor.setConnection({
    createTerminal: async () => ({
      id: "owned-background",
      waitForExit: () => {
        seen.push("wait");
        return exit.promise;
      },
      currentOutput: async () => ({
        output: "owned background output",
        exitStatus: { exitCode: 0 },
      }),
      release: async () => {
        seen.push("release");
        released.resolve(undefined);
      },
    }),
    sessionUpdate: async () => {},
  });
  const started = await f.toolInterceptor.callBash(
    { command: "owned-not-executed", run_in_background: true },
    { context: f.session },
    { toolCall: { callId: "owned-call" } },
  );
  assert.match(started.content, /Command started in background/);
  assert.equal(
    f.toolInterceptor.backgroundTerminals["owned-background"].status,
    "started",
  );
  await f.close();
  assert.equal(
    f.toolInterceptor.backgroundTerminals["owned-background"].status,
    "exited",
  );
  assert.deepEqual(seen, ["wait", "release"]);
  assert.equal(f.host.timerCount + f.host.pendingCount, 0);
});
