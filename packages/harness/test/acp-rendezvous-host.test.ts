// Ownership-only stand-ins. These tests do not claim to execute original Agent/View business methods.
import test from "node:test";
import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { EventEmitter } from "node:events";
import { Subject } from "rxjs";
import { createAcpRendezvousHost } from "../src/protocol/acp-rendezvous-host.js";
const deferred = () => {
  let resolve!: (v?: any) => void, reject!: (e: any) => void;
  const promise = new Promise<any>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
async function settle() {
  for (let i = 0; i < 80; i++) await Promise.resolve();
}
function fixture(patch: any = {}) {
  const context = new AsyncLocalStorage<string>(),
    tasks = new EventEmitter(),
    agents = new Map<string, any>(),
    calls: any[] = [];
  const agent: any = {
    promptEvent: new Subject(),
    modelChangeEvent: new Subject(),
    modeChangeEvent: new Subject(),
    configChangeEvent: new Subject(),
    cancelEvent: new Subject(),
    getConnectionId() {
      return "owned";
    },
    setSession(session: any) {
      calls.push(["setSession", session.id]);
      this.currentSessionId = session.id;
      this.sessionDeferred?.resolve(session);
    },
    async newSession() {
      await patch.initialized;
      this.sessionDeferred = deferred();
      return this.sessionDeferred.promise;
    },
    async cancel() {
      calls.push(["cancel"]);
      if (patch.cancelFailure) throw Error("owned cancel failed");
    },
    async prompt() {
      const d = deferred();
      this.promptEvent.next({ responseDeferred: d });
      return d.promise;
    },
  };
  agents.set("owned", agent);
  const options: any = {
    runtime: { modules: { 80699: { ContainerUtil: { get: () => tasks } } } },
    agentManager: { get: (id: string) => agents.get(id) },
    logger: { setContext() {}, error() {} },
    dependencies: {
      sessionManager: {},
      stateMachine: { isBusy: () => !!patch.busy },
      agentService: {},
      commandManager: {},
      interruptionService: {},
      taskStorage: {},
      broadcastService: {},
      frictionAnalysisService: {},
    },
    sourceFactory(runtime: any) {
      return {
        AcpView: class {
          [key: string]: any;
          priority = 400;
          contentType = "application/json";
          activeRenderConnections = new Set<string>();
          init() {
            if (patch.initFailure) {
              runtime.setInterval(() => patch.unexpected?.(), 5);
              throw Error("owned init failed");
            }
          }
          getConnectionIdFromRequest(): any {
            return context.getStore();
          }
          async render(session: any) {
            const id = this.getConnectionIdFromRequest(),
              agent = this.agentManager.get(id);
            agent.setSession(session);
            if (this.activeRenderConnections.has(id)) return;
            this.activeRenderConnections.add(id);
            const service = runtime.modules[80699].ContainerUtil.get("tasks"),
              listener = () => {};
            service.on("owned-event", listener);
            if (patch.renderFailure) throw Error("owned render failed");
            const subscription = agent.modelChangeEvent.subscribe(
              async () => patch.eventJob?.promise,
            );
            try {
              for await (const item of this.createPromptIterator(
                agent,
                session,
              ))
                item.responseDeferred.resolve("owned reply");
            } finally {
              subscription.unsubscribe();
              service.off("owned-event", listener);
              this.activeRenderConnections.delete(id);
            }
          }
          createPromptIterator(agent: any, _session?: any): any {
            let finish: any,
              stopped = false;
            const sub = agent.promptEvent.subscribe((item: any) =>
              finish?.({ value: item, done: false }),
            );
            return {
              [Symbol.asyncIterator]() {
                return {
                  next: () =>
                    stopped
                      ? Promise.resolve({ done: true })
                      : new Promise((resolve) => {
                          finish = resolve;
                        }),
                  return: async () => {
                    stopped = true;
                    finish?.({ done: true });
                    sub.unsubscribe();
                    return { done: true };
                  },
                };
              },
            };
          }
          dispatchQueuedPrompt() {
            return Promise.resolve();
          }
        },
      };
    },
  };
  const host = createAcpRendezvousHost(options),
    rpc = host.rpcAgent(agent);
  return {
    host,
    rpc,
    agent,
    options,
    calls,
    tasks,
    async start(id = "first") {
      const loop = context.run("owned", () => host.view.render({ id }));
      await settle();
      return { loop };
    },
  };
}
test("owner delegates render without pre-setting session and restores dedicated Agent methods", async () => {
  const f = fixture(),
    original = f.agent.setSession;
  assert.equal(f.calls.length, 0);
  const { loop } = await f.start();
  assert.deepEqual(f.calls, [["setSession", "first"]]);
  assert.equal(f.host.getEntry("owned")!.ready, true);
  assert.equal(await f.rpc.prompt(), "owned reply");
  await f.host.close();
  await loop;
  assert.equal(Object.hasOwn(f.agent, "sessionDeferred"), false);
  assert.equal(Object.hasOwn(f.agent, "setSession"), true);
  assert.notEqual(f.agent.setSession, original);
  assert.equal(f.host.iteratorCount, 0);
  assert.equal(f.tasks.eventNames().length, 0);
});
test("owner duplicate render still invokes source handoff and updates current close target", async () => {
  const f = fixture({ busy: true });
  const { loop } = await f.start();
  await f.start("second");
  assert.deepEqual(f.calls, [
    ["setSession", "first"],
    ["setSession", "second"],
  ]);
  assert.equal(f.host.getEntry("owned")!.session.id, "second");
  assert.equal(f.host.iteratorCount, 1);
  await f.host.close();
  await loop;
  assert.equal(f.calls.at(-1)![0], "cancel");
});
test("owner rejects source-created Deferred even when assignment occurs after close began", async () => {
  const gate = deferred(),
    f = fixture({ initialized: gate.promise });
  const pending = f.rpc.newSession();
  const rejection = assert.rejects(pending, /closed/);
  const close = f.host.close();
  gate.resolve();
  await rejection;
  await close;
  assert.equal(f.host.pendingCount, 0);
  assert.equal(
    typeof Object.getOwnPropertyDescriptor(f.agent, "sessionDeferred")?.get,
    "undefined",
  );
});
test("owner waits async source event callbacks before disposing resources", async () => {
  const job = deferred(),
    f = fixture({ eventJob: job });
  const { loop } = await f.start();
  f.agent.modelChangeEvent.next({});
  let closed = false;
  const close = f.host.close().then(() => {
    closed = true;
  });
  await settle();
  assert.equal(closed, false);
  job.resolve();
  await close;
  await loop;
  assert.equal(f.host.timerCount, 0);
  assert.equal(f.host.asynchronousErrors.length, 0);
});
test("owner removes borrowed task listeners even if native render fails before its finally", async () => {
  const f = fixture({ renderFailure: true });
  const result = await f.start();
  await assert.rejects(result.loop, /render failed/);
  await settle();
  assert.throws(() => f.rpc.prompt(), /render failed/);
  assert.equal(f.tasks.listenerCount("owned-event"), 1);
  await f.host.close();
  assert.equal(f.tasks.eventNames().length, 0);
  assert.equal(f.host.taskListenerCount, 0);
});
test("owner cancellation failure still returns iterators, restores methods and reports aggregate", async () => {
  const f = fixture({ busy: true, cancelFailure: true }),
    { loop } = await f.start();
  await assert.rejects(f.host.close(), AggregateError);
  await loop;
  assert.equal(f.host.iteratorCount, 0);
  assert.equal(f.host.taskListenerCount, 0);
  assert.equal(f.host.timerCount, 0);
});
test("owner forbids simultaneous Agent ownership and allows reuse after close", async () => {
  const f = fixture(),
    other = createAcpRendezvousHost(f.options);
  assert.throws(() => other.rpcAgent(f.agent), /dedicated source Agent/);
  await other.close();
  await f.host.close();
  const next = createAcpRendezvousHost(f.options);
  next.rpcAgent(f.agent);
  await next.close();
  assert.throws(() => next.rpcAgent(f.agent), /closed/);
});
test("owner failed construction disables timers allocated by source initialization", async () => {
  let unexpected = 0;
  assert.throws(
    () => fixture({ initFailure: true, unexpected: () => unexpected++ }),
    /owned init failed/,
  );
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(unexpected, 0);
});
