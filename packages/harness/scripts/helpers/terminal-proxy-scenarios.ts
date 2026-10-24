import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import type { createNativeTerminalProxy } from "../../src/terminal/native-terminal-proxy.js";
type Factory = typeof createNativeTerminalProxy;
function fixture(factory: Factory) {
  const logs: any[] = [],
    sockets: any[] = [],
    servers: any[] = [];
  function socket(): any {
    const s = Object.assign(new EventEmitter(), {
      writable: true,
      destroyed: false,
      writes: [] as any[],
      destroy() {
        this.destroyed = true;
      },
      write(chunk: any) {
        this.writes.push(chunk);
      },
    });
    return s;
  }
  const service = factory({
    net: {
      createConnection(path: string) {
        const s = socket();
        s.path = path;
        sockets.push(s);
        return s;
      },
    },
    WebSocket: { OPEN: 1, CONNECTING: 0 },
    WebSocketServer: class {
      clients = new Set<any>();
      upgrades: any[] = [];
      closed = false;
      constructor(public options: any) {
        servers.push(this);
      }
      handleUpgrade(req: any, s: any, head: any, callback: any) {
        this.upgrades.push([req, s, head]);
        const ws = websocket();
        this.clients.add(ws);
        callback(ws);
      }
      close() {
        this.closed = true;
      }
    },
    console: {
      log: (...a: any[]) => logs.push(a),
      warn: (...a: any[]) => logs.push(a),
      error: (...a: any[]) => logs.push(a),
    },
  });
  function websocket(): any {
    return Object.assign(new EventEmitter(), {
      readyState: 1,
      sent: [] as any[],
      closes: [] as any[],
      send(chunk: any) {
        this.sent.push(chunk);
      },
      close(...args: any[]) {
        this.closes.push(args);
      },
    });
  }
  const proxy = new service.TerminalProxy({
    resolveDataSocketPath: (id: string) => "/owned/" + id,
  });
  const http = new EventEmitter();
  return { service, proxy, http, sockets, servers, socket, websocket, logs };
}
export const terminalProxyScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "path prefix and first decoded token follow original permissive parsing",
    async (factory) => {
      const { service } = fixture(factory);
      assert.equal(service.extractSessionId(undefined), undefined);
      assert.equal(service.extractSessionId("/other/s"), undefined);
      assert.equal(service.extractSessionId("/pty/id-1_x?token=x"), "id-1_x");
      assert.equal(service.extractSessionId("/pty/id/suffix"), "id");
      assert.equal(service.extractSessionId("/pty/a%20b"), "a");
      assert.equal(
        service.extractToken("/pty/id?token=one%20two&token=second"),
        "one two",
      );
      assert.equal(service.extractToken("/pty/id"), undefined);
    },
  ],
  [
    "unrelated upgrades are untouched and invalid token is rejected before socket creation",
    async (factory) => {
      const f = fixture(factory);
      f.proxy.start(f.http, "secret");
      const unrelated = f.socket();
      f.http.emit("upgrade", { url: "/other" }, unrelated, Buffer.alloc(0));
      assert.equal(unrelated.destroyed, false);
      const bad = f.socket();
      f.http.emit(
        "upgrade",
        { url: "/pty/s?token=wrong" },
        bad,
        Buffer.alloc(0),
      );
      assert.deepEqual(bad.writes, ["HTTP/1.1 401 Unauthorized\r\n\r\n"]);
      assert.equal(bad.destroyed, true);
      assert.equal(f.sockets.length, 0);
      assert.equal(f.servers[0].upgrades.length, 0);
      f.proxy.stop();
    },
  ],
  [
    "accepted token and empty expected token bridge matched session",
    async (factory) => {
      for (const token of ["secret", ""]) {
        const f = fixture(factory);
        f.proxy.start(f.http, token);
        f.http.emit(
          "upgrade",
          { url: token ? "/pty/s?token=secret" : "/pty/s" },
          f.socket(),
          Buffer.from("head"),
        );
        assert.equal(f.sockets[0].path, "/owned/s");
        assert.equal(f.servers[0].upgrades.length, 1);
        f.proxy.stop();
      }
    },
  ],
  [
    "data frames preserve binary and all original websocket input representations",
    async (factory) => {
      const f = fixture(factory),
        ws = f.websocket();
      f.proxy.handleUpgrade("s", ws);
      const s = f.sockets[0];
      const binary = Buffer.from([0, 255, 13]);
      s.emit("data", binary);
      assert.equal(ws.sent[0], binary);
      ws.readyState = 0;
      s.emit("data", Buffer.from("drop"));
      assert.equal(ws.sent.length, 1);
      ws.emit("message", binary);
      ws.emit("message", Uint8Array.from([1, 2]).buffer);
      ws.emit("message", [Buffer.from("a"), Buffer.from("b")]);
      ws.emit("message", 42);
      assert.deepEqual(
        s.writes.map((b: Buffer) => [...b]),
        [
          [0, 255, 13],
          [1, 2],
          [97, 98],
          [52, 50],
        ],
      );
      s.writable = false;
      ws.emit("message", Buffer.from("drop"));
      assert.equal(s.writes.length, 4);
    },
  ],
  [
    "data socket failure and closure retain original websocket codes",
    async (factory) => {
      const f = fixture(factory),
        ws = f.websocket();
      f.proxy.handleUpgrade("s", ws);
      const s = f.sockets[0];
      s.emit("error", Error("owned failure"));
      assert.deepEqual(ws.closes[0], [1011, "data socket error"]);
      s.emit("close");
      assert.deepEqual(ws.closes[1], [1000, "data socket closed"]);
      ws.readyState = 0;
      s.emit("close");
      assert.equal(ws.closes.length, 3);
      ws.readyState = 3;
      s.emit("close");
      assert.equal(ws.closes.length, 3);
      assert.ok(f.logs.some((x) => x[1] === "owned failure"));
    },
  ],
  [
    "websocket failure and closure destroy the owned data socket",
    async (factory) => {
      for (const event of ["close", "error"]) {
        const f = fixture(factory),
          ws = f.websocket();
        f.proxy.handleUpgrade("s", ws);
        ws.emit(event, Error("owned failure"));
        assert.equal(f.sockets[0].destroyed, true);
      }
    },
  ],
  [
    "stop closes clients and wss but leaves the original HTTP upgrade listener installed",
    async (factory) => {
      const f = fixture(factory);
      f.proxy.start(f.http, "");
      const ws = f.websocket();
      f.servers[0].clients.add(ws);
      f.proxy.stop();
      assert.deepEqual(ws.closes, [[1001, "server shutting down"]]);
      assert.equal(f.servers[0].closed, true);
      assert.equal(f.proxy.wss, undefined);
      assert.equal(f.http.listenerCount("upgrade"), 1);
      f.proxy.stop();
      assert.equal(ws.closes.length, 1);
      assert.throws(
        () =>
          f.http.emit(
            "upgrade",
            { url: "/pty/s" },
            f.socket(),
            Buffer.alloc(0),
          ),
        TypeError,
      );
    },
  ],
];
