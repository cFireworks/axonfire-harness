import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createNativeSidecarEnvironment } from "../../src/terminal/native-sidecar-environment.js";
export const sidecarClientScenarios: Array<
  [string, (factory: any) => Promise<void>]
> = [];
function fixture(factory: any) {
  const socket: any = new EventEmitter();
  socket.writes = [];
  socket.write = (line: string) => socket.writes.push(line);
  socket.destroy = () => queueMicrotask(() => socket.emit("close"));
  const logs: any[] = [];
  const { SidecarClient } = factory({
    net: { createConnection: () => socket },
    console: {
      log: (...v: any[]) => logs.push(v),
      error: (...v: any[]) => logs.push(v),
    },
  });
  const client = new SidecarClient("/owned/control");
  return {
    client,
    socket,
    logs,
    async connect() {
      const p = client.connect();
      socket.emit("connect");
      await p;
    },
  };
}
sidecarClientScenarios.push([
  "connection, fragmented responses and notifications",
  async (factory) => {
    const f = fixture(factory);
    await assert.rejects(f.client.ping(), /Not connected/);
    await f.connect();
    const notices: any[] = [];
    f.client.onNotification((...v: any[]) => notices.push(v));
    const p = f.client.ping();
    assert.deepEqual(JSON.parse(f.socket.writes[0]), {
      jsonrpc: "2.0",
      id: 1,
      method: "sidecar.ping",
    });
    f.socket.emit("data", Buffer.from('{"id":1,"result":'));
    f.socket.emit(
      "data",
      Buffer.from(
        '{"ok":true}}\n{"method":"session.exited","params":{"sessionId":"a"}}\n',
      ),
    );
    assert.deepEqual(await p, { ok: true });
    assert.deepEqual(notices, [["session.exited", { sessionId: "a" }]]);
    assert.equal(f.client.pending.size, 0);
    f.client.dispose();
  },
]);
sidecarClientScenarios.push([
  "RPC error metadata, parse errors and unknown replies",
  async (factory) => {
    const f = fixture(factory);
    await f.connect();
    const p = f.client.ping();
    f.client.handleMessage("not json");
    f.client.handleMessage('{"id":99,"result":null}');
    assert.equal(f.client.pending.size, 1);
    f.client.handleMessage(
      '{"id":1,"error":{"code":-32000,"message":"missing","data":{"owned":true}}}',
    );
    await assert.rejects(
      p,
      (e: any) =>
        e.message === "missing" && e.code === -32000 && e.data.owned === true,
    );
    assert.equal(f.logs.length, 3);
    f.client.dispose();
  },
]);
sidecarClientScenarios.push([
  "timeout, write failure and disposal reject pending work",
  async (factory) => {
    const f = fixture(factory);
    await f.connect();
    await assert.rejects(
      f.client.sendRequest("slow", {}, 1),
      /RPC timeout: slow \(1ms\)/,
    );
    assert.equal(f.client.pending.size, 0);
    f.socket.write = () => {
      throw new Error("write failed");
    };
    await assert.rejects(f.client.ping(), /write failed/);
    assert.equal(f.client.pending.size, 0);
    f.socket.write = () => {};
    const p = f.client.ping();
    f.client.dispose();
    await assert.rejects(p, /Client disposed/);
    assert.equal(f.client.isConnected, false);
  },
]);
sidecarClientScenarios.push([
  "socket errors, remote close and guarded close callbacks",
  async (factory) => {
    const f = fixture(factory);
    await f.connect();
    const p = f.client.ping();
    f.socket.emit("error", new Error("broken"));
    await assert.rejects(p, /Socket error: broken/);
    let closed = 0;
    f.client.onClose(() => {
      closed++;
      throw new Error("callback");
    });
    const q = f.client.ping();
    f.socket.emit("close");
    await assert.rejects(q, /Socket closed/);
    assert.equal(closed, 1);
    assert.equal(f.client.isConnected, false);
    const initial = fixture(factory);
    const connection = initial.client.connect();
    initial.socket.emit("error", new Error("no listener"));
    await assert.rejects(connection, /no listener/);
  },
]);
sidecarClientScenarios.push([
  "original method parameters and lifecycle timeout budgets",
  async (factory) => {
    const f = fixture(factory),
      calls: any[] = [];
    f.client.sendRequest = async (...v: any[]) => {
      calls.push(v);
      return { text: "captured" };
    };
    await f.client.createSession({ command: "owned" });
    await f.client.reconnectSession("a", 80, 24);
    await f.client.resizeSession("a", 90, 30);
    await f.client.killSession("a");
    await f.client.listSessions();
    assert.equal(await f.client.captureSession("a", 3), "captured");
    const env = createNativeSidecarEnvironment();
    assert.deepEqual(calls, [
      [
        "session.create",
        { command: "owned" },
        env.SESSION_CREATE_RPC_TIMEOUT_MS,
      ],
      [
        "session.reconnect",
        { sessionId: "a", cols: 80, rows: 24 },
        env.SESSION_LIFECYCLE_RPC_TIMEOUT_MS,
      ],
      ["session.resize", { sessionId: "a", cols: 90, rows: 30 }],
      ["session.kill", { sessionId: "a" }],
      ["session.list"],
      ["session.capture", { sessionId: "a", lines: 3 }],
    ]);
    assert.equal(await f.client.shutdown(), true);
  },
]);
sidecarClientScenarios.push([
  "shutdown waits for control close and original chunk decoding is retained",
  async (factory) => {
    const f = fixture(factory);
    await f.connect();
    const shutdown = f.client.shutdown();
    f.client.handleMessage('{"id":1,"result":{"ok":true}}');
    await Promise.resolve();
    await Promise.resolve();
    f.socket.emit("close");
    assert.equal(await shutdown, true);
    const g = fixture(factory);
    await g.connect();
    const p = g.client.ping();
    const data = Buffer.from('{"id":1,"result":"中"}\n');
    const offset = data.indexOf(Buffer.from("中")) + 1;
    g.socket.emit("data", data.subarray(0, offset));
    g.socket.emit("data", data.subarray(offset));
    assert.equal(await p, "���");
    g.client.dispose();
  },
]);
