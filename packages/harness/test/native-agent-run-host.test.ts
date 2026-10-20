import test from "node:test";
import assert from "node:assert/strict";
import * as sdk from "@openai/agents-core";
import { agentRunFixture } from "../scripts/helpers/agent-run-fixture.js";
import { nativeRunnerFixture } from "../scripts/helpers/native-runner-fixture.js";
import { createNativeAgentRunHost } from "../src/agents/native-agent-run-host.js";

function deferred() {
  let resolve!: () => void, reject!: (reason: Error) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

test("native agent run parent requires explicit dependencies and runner ownership", () => {
  assert.throws(() => createNativeAgentRunHost({} as any), /explicit runtime/);
  assert.throws(
    () => createNativeAgentRunHost({ runtime: {}, dependencies: {} } as any),
    /runner provider/,
  );
});
test("public execution host creates original service/interceptors and keeps SDK as the dependency", async () => {
  const f = await agentRunFixture();
  try {
    assert.equal(f.service.constructor, f.n.AgentServiceImpl);
    const interceptor = f.interceptor("HistoryAgentRunInterceptor");
    assert.equal(
      interceptor.constructor,
      f.n.interceptorClasses.HistoryAgentRunInterceptor,
    );
    assert.equal(f.runHost.originalSdk.Agent, sdk.Agent);
    assert.equal(f.runHost.modules[25301], sdk);
    assert.throws(
      () => f.runHost.createInterceptor("InventedInterceptor", {}),
      /Unknown original interceptor/,
    );
    await f.service.run(f.agent, [], { context: f.s });
    assert.equal(
      f.manager.resultSubscriptions.size,
      0,
      "owner did not create another stream consumer",
    );
    assert.equal(f.s.resultSubject.value, f.fakeResult);
    assert.equal(f.runHost.subscriptionCount, 1);
    await f.runHost.close();
    assert.equal(f.runHost.subscriptionCount, 0);
    assert.equal(
      f.s.resultSubject.isStopped,
      false,
      "session belongs to the borrowed session owner",
    );
    assert.equal(f.s.abortSignal.aborted, false);
  } finally {
    await f.close();
  }
});
test("publishing a source result does not imply SDK completion and owner never consumes its stream", async () => {
  const f = await agentRunFixture(),
    completion = deferred();
  try {
    f.fakeResult.completed = completion.promise;
    f.fakeResult.toTextStream = () => {
      throw Error("owner must not read SDK text");
    };
    Object.defineProperty(f.fakeResult, Symbol.asyncIterator, {
      get() {
        throw Error("owner must not iterate SDK result");
      },
    });
    await f.service.run(f.agent, [], { context: f.s });
    assert.equal(f.runHost.pendingCount, 0);
    assert.equal(f.runHost.settlementCount, 1);
    let finished = false;
    const closing = f.runHost.close().then(() => {
      finished = true;
    });
    await tick();
    assert.equal(finished, false);
    assert.equal(
      f.s.abortSignal.aborted,
      false,
      "no authority to cancel borrowed sessions",
    );
    completion.resolve();
    await closing;
    assert.equal(f.runHost.settlementCount, 0);
    assert.equal(f.runHost.state, "closed");
  } finally {
    completion.resolve();
    await f.close();
  }
});
test("expected SDK completion rejection settles the owner without replacing source error handling", async () => {
  const f = await agentRunFixture(),
    completion = deferred();
  try {
    f.fakeResult.completed = completion.promise;
    await f.service.run(f.agent, [], { context: f.s });
    const failure = Object.assign(Error("owned expected model cancellation"), {
      code: "ECONNRESET",
    });
    completion.reject(failure);
    await f.runHost.close();
    assert.deepEqual(f.runHost.errors, []);
    assert.equal(f.s.resultSubject.value, f.fakeResult);
    assert.equal(
      f.fakeResult.error,
      undefined,
      "owner did not synthesize result errors or decisions",
    );
  } finally {
    completion.resolve();
    await f.close();
  }
});
test("old BehaviorSubject replay and unrelated later results are not enrolled as this host's runs", async () => {
  const f = await agentRunFixture(),
    foreign = deferred();
  try {
    const result = { completed: foreign.promise };
    f.s.resultAbortSignalMap.set(result, new AbortController().signal);
    f.s.resultSubject.next(result);
    await f.service.run(f.agent, [], { context: f.s });
    assert.equal(f.runHost.settlementCount, 0);
    f.s.resultSubject.next(result);
    assert.equal(f.runHost.settlementCount, 0);
    await f.runHost.close();
  } finally {
    foreign.resolve();
    await f.close();
  }
});
test("an overlapping result with a different source abort signal is not captured by an active lease", async () => {
  const entered = deferred(),
    release = deferred(),
    foreign = deferred();
  let own: any;
  const f = await agentRunFixture(undefined, {
    async run() {
      entered.resolve();
      await release.promise;
      return own;
    },
  });
  try {
    own = f.fakeResult;
    const running = f.service.run(f.agent, [], { context: f.s });
    await entered.promise;
    const other = { completed: foreign.promise };
    f.s.resultAbortSignalMap.set(other, new AbortController().signal);
    f.s.resultSubject.next(other);
    assert.equal(f.runHost.settlementCount, 0);
    release.resolve();
    await running;
    await f.runHost.close();
  } finally {
    release.resolve();
    foreign.resolve();
    await f.close();
  }
});
test("accepted auth wait is awaited during close and the original run may finish after its owner releases auth", async () => {
  const auth = deferred(),
    f = await agentRunFixture(undefined, { authInitialized: auth.promise });
  try {
    const running = f.service.run(f.agent, [], { context: f.s });
    await tick();
    assert.ok(!f.calls.some((call) => call[0] === "runnerProvider"));
    let closed = false;
    const closing = f.runHost.close().then(() => {
      closed = true;
    });
    await tick();
    assert.equal(closed, false);
    auth.resolve();
    await Promise.all([running, closing]);
    assert.equal(f.s.resultSubject.value, f.fakeResult);
    assert.equal(f.runHost.pendingCount, 0);
  } finally {
    auth.resolve();
    await f.close();
  }
});
test("a caller-handled authentication failure is not reclassified as a detached owner failure", async () => {
  const auth = deferred(),
    f = await agentRunFixture(undefined, { authInitialized: auth.promise });
  try {
    const running = f.service.run(f.agent, [], { context: f.s });
    const rejected = assert.rejects(running, /owned auth rejection/);
    auth.reject(Error("owned auth rejection"));
    await rejected;
    await f.runHost.close();
    assert.deepEqual(f.runHost.errors, []);
    assert.ok(!f.calls.some((call) => call[0] === "runnerProvider"));
  } finally {
    auth.resolve();
    await f.close();
  }
});
test("source deferred queue drain cannot begin a new run after execution host close", async () => {
  const f = await agentRunFixture();
  try {
    f.interceptors.push({
      priority: 1,
      async intercept(context: any) {
        context.skipRun = true;
      },
    });
    f.s.queue.push({ type: "message", role: "user", content: "owned queue" });
    await f.service.run(f.agent, [], { context: f.s });
    assert.equal(f.scheduled.length, 1);
    assert.equal(f.runHost.immediateCount, 1);
    await f.runHost.close();
    f.interceptors.length = 0;
    f.s.queue.length = 0;
    await f.scheduled[0]!();
    assert.ok(!f.calls.some((call) => call[0] === "runner"));
    assert.equal(f.runHost.immediateCount, 0);
  } finally {
    await f.close();
  }
});
test("source reference notification timer is cancelled without publishing an invented UI update", async () => {
  const f = await agentRunFixture();
  try {
    let updates = 0;
    const interceptor = f.interceptor(
      "ReferencePathProcessorAgentRunInterceptor",
    );
    interceptor.sendNotificationToUI(
      { owned: true },
      {
        inputSubject: {
          next() {
            updates++;
          },
        },
        abortSignal: new AbortController().signal,
      },
    );
    assert.equal(f.runHost.timerCount, 1);
    assert.equal([...f.timers.pending.values()][0].ms, 100);
    await f.runHost.close();
    assert.equal(f.runHost.timerCount, 0);
    assert.equal(f.timers.pending.size, 0);
    assert.equal(updates, 0);
  } finally {
    await f.close();
  }
});
test("an accepted source fifty-ms memory sleep is not cancelled before it can resolve its awaited Promise", async () => {
  const f = await agentRunFixture();
  try {
    const interceptor = f.interceptor("MemoryContextInterceptor");
    interceptor.getMemoryDir = async () => ({ memoryDir: f.cwd });
    interceptor.memoryRelevanceService = { isEnabled: async () => true };
    interceptor.getRelevantMemoriesContent = async () => undefined;
    const working = interceptor.injectRelevantMemories(
      f.context([]),
      "owned question",
    );
    await tick();
    assert.equal(f.runHost.timerCount, 1);
    assert.equal([...f.timers.pending.values()][0].ms, 50);
    const closing = f.runHost.close();
    await tick();
    assert.equal(f.timers.pending.size, 1);
    await f.timers.fire();
    await Promise.all([working, closing]);
    assert.equal(f.runHost.pendingCount, 0);
    assert.equal(f.runHost.timerCount, 0);
  } finally {
    await f.close();
  }
});
test("detached scheduling errors are observed and reported after cleanup instead of escaping Node callbacks", async () => {
  const f = await agentRunFixture();
  try {
    const interceptor = f.interceptor(
      "ReferencePathProcessorAgentRunInterceptor",
    );
    interceptor.sendNotificationToUI(
      {},
      {
        inputSubject: {
          next() {
            throw Error("owned detached notification failure");
          },
        },
        abortSignal: new AbortController().signal,
      },
    );
    await f.timers.fire();
    assert.equal(f.runHost.errors.length, 1);
    assert.equal(f.errors.length, 1);
    await assert.rejects(
      f.runHost.close(),
      (error: any) =>
        error instanceof AggregateError && error.errors.length === 1,
    );
    assert.equal(f.runHost.timerCount, 0);
    assert.equal(f.runHost.subscriptionCount, 0);
    assert.equal(f.runHost.state, "closed");
  } finally {
    await assert.rejects(f.close(), /Native agent run host close failed/);
  }
});
test("public original Runner instances and Provider caching are not replaced by a rewritten factory", async () => {
  const f = await nativeRunnerFixture();
  try {
    assert.equal(f.runnerFactory.constructor, f.n.RunnerFactoryImpl);
    assert.equal(f.provider.constructor, f.n.RunnerProviderImpl);
    assert.equal(f.loop.constructor, f.n.ToolCallLoopDetectorImpl);
    const first = await f.provider.get(),
      second = await f.provider.get();
    assert.equal(first, second);
    assert.equal(f.provider.runner, first);
    assert.equal(f.configs.length, 1);
    await f.runHost.close();
    await assert.rejects(f.provider.get(), /host is closed/);
    await assert.rejects(f.runnerFactory.create({}), /host is closed/);
  } finally {
    await f.close();
  }
});
test("source deferred auto-compaction is cancelled before start when the parent closes", async () => {
  let compactions = 0;
  const f = await nativeRunnerFixture(undefined, {
    compact() {
      compactions++;
    },
  });
  try {
    f.activate();
    await f.runnerFactory.checkAutoCompact();
    assert.equal(f.scheduled.length, 1);
    assert.equal(f.runHost.immediateCount, 1);
    await f.runHost.close();
    await f.scheduled[0]!();
    assert.equal(compactions, 0);
    assert.equal(f.runHost.immediateCount, 0);
  } finally {
    await f.close();
  }
});
test("source auto-compaction already running is awaited without closing its borrowed compactor", async () => {
  const entered = deferred(),
    release = deferred();
  const f = await nativeRunnerFixture(undefined, {
    async compact() {
      entered.resolve();
      await release.promise;
    },
  });
  try {
    f.activate();
    await f.runnerFactory.checkAutoCompact();
    const running = f.scheduled[0]!();
    await entered.promise;
    let finished = false;
    const closing = f.runHost.close().then(() => {
      finished = true;
    });
    await tick();
    assert.equal(finished, false);
    release.resolve();
    await Promise.all([running, closing]);
    assert.equal(f.runHost.pendingCount, 0);
  } finally {
    release.resolve();
    await f.close();
  }
});
test("closed execution facades reject new calls but do not close borrowed authentication/models/sessions", async () => {
  const f = await agentRunFixture();
  try {
    let closed = 0;
    f.service.authenticationManager = {
      initialized: Promise.resolve(),
      close() {
        closed++;
      },
    };
    const interceptor = f.interceptor("HistoryAgentRunInterceptor");
    const closing = f.runHost.close();
    assert.equal(f.runHost.close(), closing);
    await closing;
    await assert.rejects(f.service.runDefault("later"), /host is closed/);
    await assert.rejects(
      interceptor.intercept(f.context([])),
      /host is closed/,
    );
    assert.throws(
      () => f.runHost.createInterceptor("HistoryAgentRunInterceptor", {}),
      /host is closed/,
    );
    assert.equal(closed, 0);
    assert.equal(f.host.state, "open");
    assert.equal(f.s.resultSubject.isStopped, false);
    assert.equal(f.runHost.pendingCount, 0);
    assert.equal(f.runHost.settlementCount, 0);
  } finally {
    await f.close();
  }
});

test("owned original Runner boundary observes private one-time completion without changing Runner identity or consuming twice", async () => {
  const f = await agentRunFixture(),
    completion = deferred();
  const result = {
    completed: completion.promise,
    rawResponses: [],
    async *toTextStream() {
      yield "owned private one-time";
    },
  };
  class OwnedSdkBoundary {
    constructor(public configuration: any) {}
    async run() {
      return result;
    }
  }
  try {
    const assembled = f.runHost.createRunner({
      runtime: {
        modules: { 18553: { ...f.originalSdk, Runner: OwnedSdkBoundary } },
      },
      modelProvider: {},
      sessionManager: f.manager,
      agentManager: f.agentManager,
      productManager: { waitConfiguration: async () => ({}) },
      stateMachine: f.manager.stateMachine,
      logger: f.logger,
    });
    f.service.runnerProvider = assembled.provider;
    const runner = await assembled.provider.get();
    assert.equal(assembled.provider.runner, runner);
    assert.equal(runner.constructor, OwnedSdkBoundary);
    assert.equal(Object.hasOwn(runner, "run"), true);
    assert.equal(
      await f.service.runOneTime("cli", "owned question", { context: f.s }),
      "owned private one-time",
    );
    assert.equal(
      f.s.resultSubject.value,
      undefined,
      "source one-time does not publish a primary result",
    );
    assert.equal(f.runHost.settlementCount, 1);
    let closed = false;
    const closing = f.runHost.close().then(() => {
      closed = true;
    });
    await tick();
    assert.equal(closed, false);
    completion.resolve();
    await closing;
    assert.equal(runner.run, OwnedSdkBoundary.prototype.run);
    assert.equal(Object.hasOwn(runner, "run"), false);
    assert.equal(f.runHost.settlementCount, 0);
  } finally {
    completion.resolve();
    await f.close();
  }
});
