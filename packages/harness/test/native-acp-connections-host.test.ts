import test from "node:test";
import assert from "node:assert/strict";
import { BehaviorSubject } from "rxjs";
import {
  acpConnectionsFixture,
  AcpFixtureResponse,
} from "../scripts/helpers/acp-connections-fixture.js";

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

test("connection host constructs original classes and leaves borrowed protocol namespace intact", async () => {
  const h = acpConnectionsFixture();
  const connection = h.protocol.AgentSideConnection;
  try {
    assert.equal(h.stream.constructor, h.n.AcpStreamManagerImpl);
    assert.equal(h.server.constructor, h.n.AcpServerImpl);
    assert.equal(h.host.bindings.get(h.protocol.AcpStreamManager), h.stream);
    await h.host.start({ transport: "streamable-http" });
    await h.transports.create("owned", "streamable-http");
    assert.equal(h.endpoints[0].constructor, connection);
    assert.equal(h.protocol.AgentSideConnection, connection);
    assert.equal(h.transports.transportCreated.observers.length, 1);
    await h.host.start({ transport: "streamable-http" });
    assert.equal(h.transports.transportCreated.observers.length, 1);
    const closing = h.host.close();
    assert.equal(h.host.close(), closing);
    assert.throws(() => h.host.start(), /closing/);
    await closing;
    assert.equal(h.transports.transportCreated.observers.length, 0);
    assert.equal(h.sessions.sessionSubject.isStopped, false);
    assert.equal(h.stdout.destroyed, false);
    assert.equal(h.stream.create, h.n.AcpStreamManagerImpl.prototype.create);
  } finally {
    await h.close();
  }
});

test(
  "host closes retained SDK input even after original transport close discarded connection state",
  { timeout: 3000 },
  async () => {
    const h = acpConnectionsFixture();
    try {
      await h.host.start({ transport: "streamable-http" });
      await h.transports.create("old", "streamable-http");
      await h.transports.close("old");
      assert.equal(h.stream.connectionStates.size, 0);
      await h.host.close();
      await h.endpoints[0].closed;
      assert.equal(h.agents.getAll().size, 0);
    } finally {
      await h.close();
    }
  },
);

test(
  "shutdown waits for original SDK close history flush and preserves borrowed receiver",
  { timeout: 3000 },
  async () => {
    const flushing = deferred(),
      release = deferred();
    const session = { id: "session", meta: { acpConnectionId: "owned" } };
    const sessions = {
      sessionSubject: new BehaviorSubject(session),
      async flushHistory(value: any) {
        assert.equal(this, sessions);
        assert.equal(value, session);
        flushing.resolve();
        await release.promise;
      },
    };
    const h = acpConnectionsFixture(undefined, { sessions });
    try {
      await h.host.start({ transport: "streamable-http" });
      await h.transports.create("owned", "streamable-http");
      let done = false;
      const close = h.host.close().then(() => {
        done = true;
      });
      await flushing.promise;
      await tick();
      assert.equal(done, false);
      release.resolve();
      await close;
      assert.equal(sessions.sessionSubject.isStopped, false);
    } finally {
      release.resolve();
      await h.close();
    }
  },
);

test(
  "parent cancellation finishes before owned streams close",
  { timeout: 3000 },
  async () => {
    const entered = deferred(),
      release = deferred();
    const h = acpConnectionsFixture(undefined, {
      beforeClose: async () => {
        entered.resolve();
        await release.promise;
      },
    });
    try {
      await h.host.start({ transport: "streamable-http" });
      await h.transports.create("owned", "streamable-http");
      const close = h.host.close();
      await entered.promise;
      assert.equal(h.stream.connectionStates.has("owned"), true);
      release.resolve();
      await close;
      assert.equal(h.stream.connectionStates.size, 0);
    } finally {
      release.resolve();
      await h.close();
    }
  },
);

test("shutdown clears original SSE heartbeat, tokens and transport subscription", async () => {
  const h = acpConnectionsFixture();
  try {
    await h.host.start({ transport: "streamable-http" });
    await h.transports.create("owned", "streamable-http");
    h.guard.issueToken("owned");
    const response = new AcpFixtureResponse();
    await h.stream.handleRequest("owned", h.request("GET"), response);
    assert.ok(h.timers.size > 0);
    await h.host.close();
    assert.equal(response.writableEnded, true);
    assert.equal(h.timers.size, 0);
    assert.equal(h.guard.tokens.size, 0);
    assert.equal(h.transports.transports.size, 0);
    assert.equal(h.transports.transportCreated.isStopped, true);
  } finally {
    await h.close();
  }
});

test("cleanup reports parent failure after releasing remaining owned resources", async () => {
  const failure = Error("parent shutdown failure");
  const h = acpConnectionsFixture(undefined, {
    beforeClose: () => {
      throw failure;
    },
  });
  await h.host.start({ transport: "streamable-http" });
  await h.transports.create("owned", "streamable-http");
  await assert.rejects(h.host.close(), (error: any) => {
    assert.ok(error instanceof AggregateError);
    assert.ok(error.errors.includes(failure));
    return true;
  });
  assert.equal(h.server.isRunning(), false);
  assert.equal(h.stream.streams.size, 0);
  assert.equal(h.transports.transportCreated.isStopped, true);
  await assert.rejects(h.close(), AggregateError);
});

test("closing an unstarted host never starts ACP or destroys borrowed output", async () => {
  const h = acpConnectionsFixture();
  await h.host.close();
  assert.equal(h.acp.isAcpMode(), false);
  assert.equal(h.endpoints.length, 0);
  assert.equal(h.stdout.destroyed, false);
  await h.close();
});

test(
  "shutdown waits for accepted asynchronous transport creation",
  { timeout: 3000 },
  async () => {
    const release = deferred();
    const h = acpConnectionsFixture();
    const create = h.transportFactory.create;
    h.transportFactory.create = async (...args: any[]) => {
      await release.promise;
      return Reflect.apply(create, h.transportFactory, args);
    };
    try {
      await h.host.start({ transport: "streamable-http" });
      const accepted = h.transports.create("late", "streamable-http");
      let done = false;
      const close = h.host.close().then(() => {
        done = true;
      });
      await tick();
      assert.equal(done, false);
      release.resolve();
      await accepted;
      await close;
      assert.equal(h.transports.transports.size, 0);
      assert.equal(h.stream.connectionStates.size, 0);
    } finally {
      release.resolve();
      await h.close();
    }
  },
);

test("detached original server subscription failures are reported on shutdown", async () => {
  const h = acpConnectionsFixture();
  const failure = Error("owned agent construction failed");
  const get = h.runtime.modules[80699]!.ContainerUtil.get;
  h.runtime.modules[80699]!.ContainerUtil.get = (key: any) => {
    if (key === h.protocol.AcpAgent) throw failure;
    return get(key);
  };
  await h.host.start({ transport: "streamable-http" });
  await h.transports.create("failed", "streamable-http");
  await assert.rejects(h.host.close(), (error: any) =>
    error.errors.includes(failure),
  );
  assert.equal(h.stream.streams.size, 0);
  assert.equal(h.transports.transportCreated.observers.length, 0);
  await assert.rejects(h.close(), AggregateError);
});

test(
  "shutdown releases an SSE write blocked on backpressure before draining work",
  { timeout: 3000 },
  async () => {
    const h = acpConnectionsFixture();
    try {
      await h.host.start({ transport: "streamable-http" });
      await h.transports.create("slow", "streamable-http");
      const response = new AcpFixtureResponse();
      await h.stream.handleRequest("slow", h.request("GET"), response);
      response.backpressure = true;
      // Model Node's end() waiting for buffered writes: only destroy emits close.
      response.end = () => {
        response.writableEnded = true;
        return response;
      };
      const write = h.stream.sendToClient("slow", {
        jsonrpc: "2.0",
        method: "notification",
        params: {},
      });
      assert.equal(response.listenerCount("drain"), 1);
      await h.host.close();
      await write;
      assert.equal(response.destroyed, true);
      assert.equal(response.listenerCount("drain"), 0);
      assert.equal(h.stream.streams.size, 0);
    } finally {
      await h.close();
    }
  },
);

test(
  "shutdown disconnects a backpressured response discarded by an earlier original close",
  { timeout: 3000 },
  async () => {
    const h = acpConnectionsFixture();
    try {
      await h.host.start({ transport: "streamable-http" });
      await h.transports.create("discarded", "streamable-http");
      const response = new AcpFixtureResponse();
      await h.stream.handleRequest("discarded", h.request("GET"), response);
      response.backpressure = true;
      response.end = () => {
        response.writableEnded = true;
        return response;
      };
      const writes = [1, 2].map((id) =>
        h.stream.sendToClient("discarded", {
          jsonrpc: "2.0",
          method: "notification",
          params: { id },
        }),
      );
      assert.equal(response.listenerCount("drain"), 2);
      await h.transports.close("discarded");
      assert.equal(h.stream.connectionStates.size, 0);
      await h.host.close();
      await Promise.all(writes);
      assert.equal(response.destroyed, true);
      assert.equal(response.listenerCount("drain"), 0);
    } finally {
      await h.close();
    }
  },
);
