import assert from "node:assert/strict";
import {
  acpConnectionsFixture,
  AcpFixtureResponse,
} from "./acp-connections-fixture.js";
import { createNativeAcpConnections } from "../../src/protocol/native-acp-connections.js";
import { protocolSnapshot } from "./acp-protocol-scenarios.js";
import { settle } from "./acp-protocol-fixture.js";
type Case = {
  name: string;
  run(factory: typeof createNativeAcpConnections): Promise<any>;
};
const scenario = (
  name: string,
  run: (h: ReturnType<typeof acpConnectionsFixture>) => Promise<any>,
  patch: any = {},
): Case => ({
  name,
  async run(factory) {
    const h = acpConnectionsFixture(factory, patch);
    try {
      return protocolSnapshot(await run(h));
    } finally {
      await h.close();
    }
  },
});
const frame = (method: string, id?: any, params: any = {}) => ({
  jsonrpc: "2.0",
  method,
  ...(id === undefined ? {} : { id }),
  params,
});
async function open(h: ReturnType<typeof acpConnectionsFixture>, id = "owned") {
  const stream = h.stream.create(id, "streamable-http");
  h.stream.connectionStates.get(id).initialized = true;
  return stream;
}
async function prompt(h: ReturnType<typeof acpConnectionsFixture>, id = 1) {
  const response = new AcpFixtureResponse();
  await h.stream.handlePost(
    "owned",
    h.request(),
    response,
    frame("session/prompt", id, { sessionId: "session", prompt: [] }),
  );
  return response;
}
export const ACP_CONNECTION_CASES: Case[] = [
  scenario(
    "connection helpers retain last-header semantics and permissive original RPC predicates",
    async (h) => {
      const input = [
        null,
        [],
        {},
        { method: "initialize" },
        { method: "initialize", id: 0 },
        { method: "session/prompt" },
        { method: "session/cancel", id: 1 },
        { id: null, result: null },
      ];
      const out = input.map((x) => [
        h.n.isObject(x),
        h.n.isJsonRpcRequest(x),
        h.n.isJsonRpcResponseOrError(x),
        h.n.isInitializeRequest(x),
        h.n.isPromptRequest(x),
        h.n.isCancelNotification(x),
      ]);
      assert.equal(
        h.n.headerValue({ accept: ["first", "last"] }, "Accept"),
        "last",
      );
      assert.equal(h.n.isInitializeRequest({ method: "initialize" }), true);
      return [
        out,
        h.n.describeAcpMessage({
          method: "session/update",
          id: 0,
          params: {
            sessionId: "s",
            update: {
              sessionUpdate: "agent_message_chunk",
              content: { text: "😀" },
            },
          },
        }),
      ];
    },
  ),
  scenario(
    "loopback parser retains IPv4, expanded/mapped IPv6, scope and invalid-input boundaries",
    async (h) => {
      const values = [
        "127.0.0.1",
        "127.001.2.3",
        "127.255.255.255",
        "128.0.0.1",
        "127.0.0.256",
        "127.1",
        "localhost",
        "::1",
        "[::1]",
        "::1%lo0",
        "0:0:0:0:0:0:0:1",
        "::ffff:127.0.0.1",
        "::ffff:7f00:1",
        "::ffff:7f00:0001",
        "::ffff:192.168.1.1",
        "fe80::1%lo0",
        " ::1 ",
        "::",
        "1::1::1",
        "",
        undefined,
      ];
      const out = values.map((x) => h.n.isLoopbackAddress(x));
      assert.equal(out[0], true);
      assert.equal(out[6], false);
      assert.equal(out[12], true);
      return out;
    },
  ),
  scenario(
    "original stream statics preserve self alias and timeout/sweep constants",
    async (h) => {
      const c: any = h.n.AcpStreamManagerImpl;
      assert.equal(c.name, "eG");
      assert.equal(c.PROMPT_TIMEOUT_MS, 1800000);
      assert.equal(c.SSE_HEARTBEAT_INTERVAL_MS, 30000);
      return [
        c.PROMPT_TIMEOUT_MS,
        c.STREAM_CLOSE_DELAY_MS,
        c.CANCEL_GRACE_MS,
        c.SSE_HEARTBEAT_INTERVAL_MS,
        c.SWEEP_KIND_CANCEL,
        c.SWEEP_KIND_TIMEOUT,
      ];
    },
  ),
  scenario(
    "guard configuration gives env precedence and retains coercion/minimums",
    async (h) => {
      await h.guard.setup();
      assert.equal(h.guard.maxConnections, 2.5);
      assert.equal(h.guard.tokenTtlMs, 60000);
      return h.logs;
    },
    {
      env: {
        CODEBUDDY_ACP_MAX_CONNECTIONS: "2.5",
        CODEBUDDY_ACP_TOKEN_TTL_MS: "20",
      },
      gateway: { maxConnections: 7, tokenTtlMs: 90000 },
    },
  ),
  scenario(
    "guard uses settings when env is invalid and permits Infinity as in source",
    async (h) => {
      await h.guard.setup();
      assert.equal(h.guard.maxConnections, Infinity);
      assert.equal(h.guard.tokenTtlMs, 120000);
      return [h.guard.maxConnections, h.guard.tokenTtlMs];
    },
    {
      env: { CODEBUDDY_ACP_MAX_CONNECTIONS: "NaN" },
      gateway: { maxConnections: "Infinity", tokenTtlMs: "120000" },
    },
  ),
  scenario(
    "token expiry is strictly greater than deadline and does not slide on activity",
    async (h) => {
      const token = h.guard.issueToken("owned"),
        before = h.guard.tokens.get("owned").expiresAt;
      await h.advance(h.guard.tokenTtlMs);
      assert.equal(h.guard.validateToken(token), "owned");
      assert.equal(h.guard.tokens.get("owned").expiresAt, before);
      await h.advance(1);
      assert.equal(h.guard.validateToken(token), undefined);
      assert.equal(h.guard.tokenIndex.size, 0);
      return h.logs;
    },
  ),
  scenario(
    "guard dead eviction bypasses idle grace and revokes both indexes",
    async (h) => {
      h.guard.maxConnections = 1;
      await open(h, "old");
      const old = h.guard.issueToken("old"),
        next = h.guard.issueToken("new");
      assert.ok(next);
      assert.equal(h.guard.validateToken(old), undefined);
      assert.equal(h.stream.getConnectionId("old"), undefined);
      return [h.guard.tokens, h.guard.tokenIndex, h.calls];
    },
  ),
  scenario(
    "guard live idle grace blocks reissue at capacity, including same connection ID",
    async (h) => {
      h.guard.maxConnections = 1;
      await open(h);
      await h.stream.handleGet(
        "owned",
        h.request("GET"),
        new AcpFixtureResponse(),
      );
      h.guard.issueToken("owned");
      assert.equal(h.guard.issueToken("owned"), undefined);
      await h.advance(4999);
      assert.equal(h.guard.issueToken("new"), undefined);
      await h.advance(1);
      assert.ok(h.guard.issueToken("new"));
      return h.logs;
    },
  ),
  scenario(
    "guard refuses to evict live connections with in-flight prompts",
    async (h) => {
      h.guard.maxConnections = 1;
      await open(h);
      await h.stream.handleGet(
        "owned",
        h.request("GET"),
        new AcpFixtureResponse(),
      );
      h.guard.issueToken("owned");
      await prompt(h);
      await h.advance(6000);
      assert.equal(h.guard.issueToken("other"), undefined);
      return h.logs;
    },
  ),
  scenario(
    "agent manager snapshots Map and removal clears shared delegate without closing agent",
    async (h) => {
      let closed = false;
      const agent = {
        close: () => {
          closed = true;
        },
      };
      h.agents.register("id", agent);
      const snapshot = h.agents.getAll();
      snapshot.clear();
      assert.equal(h.agents.get("id"), agent);
      await h.agents.remove("id");
      assert.equal(closed, false);
      assert.equal(h.agents.getAll().size, 0);
      return h.calls;
    },
  ),
  scenario(
    "transport creation rejects duplicate IDs and close removes original maps",
    async (h) => {
      const events: any[] = [],
        sub = h.transports.transportCreated.subscribe((event: any) =>
          events.push(event.connectionId),
        );
      const transport = await h.transports.create("owned", "streamable-http");
      assert.equal(transport.connectionId, "owned");
      assert.equal(transport.stream, h.stream.get("owned"));
      await assert.rejects(
        h.transports.create("owned", "streamable-http"),
        /already exists/,
      );
      await h.transports.close("owned");
      sub.unsubscribe();
      return [
        events,
        h.transports.transports.size,
        h.stream.connectionStates.size,
      ];
    },
  ),
  scenario(
    "HTTP controller 404s outside ACP mode and connect exposes exact IDs/tokens",
    async (h) => {
      const off = new AcpFixtureResponse();
      await h.runContext(h.request(), off, () => h.controller.connect());
      assert.equal(off.statusCode, 404);
      h.acp.setAcpMode(true);
      const on = new AcpFixtureResponse();
      await h.runContext(
        h.request("POST", { url: "/api/v1/acp/connect" }),
        on,
        () => h.controller.connect(),
      );
      const body = JSON.parse(on.body);
      assert.equal(h.guard.validateToken(body.sessionToken), body.connectionId);
      assert.ok(h.stream.get(body.connectionId));
      return [off.statusCode, body, h.calls];
    },
  ),
  scenario(
    "HTTP controller post requires header and duplicate live GET is rejected",
    async (h) => {
      h.acp.setAcpMode(true);
      const missing = new AcpFixtureResponse();
      await h.runContext(h.request("POST", { headers: {} }), missing, () =>
        h.controller.post({}),
      );
      assert.equal(missing.statusCode, 400);
      await open(h);
      const first = new AcpFixtureResponse(),
        duplicate = new AcpFixtureResponse();
      await h.stream.handleGet("owned", h.request("GET"), first);
      await h.stream.handleGet("owned", h.request("GET"), duplicate);
      assert.equal(duplicate.statusCode, 409);
      assert.equal(first.headers["acp-connection-id"], "owned");
      return [missing.body, duplicate.body, first.headers];
    },
  ),
  scenario(
    "stream GET, POST and DELETE keep original HTTP validation statuses",
    async (h) => {
      await open(h);
      const cases: any[] = [
        ["GET", { accept: "application/json" }],
        [
          "POST",
          {
            accept: "application/json",
            "content-type": "application/json",
            "acp-connection-id": "owned",
          },
        ],
        [
          "POST",
          {
            accept: "application/json, text/event-stream",
            "content-type": "text/plain",
            "acp-connection-id": "owned",
          },
        ],
        [
          "POST",
          {
            accept: "application/json, text/event-stream",
            "content-type": "application/json",
            "acp-connection-id": "other",
          },
        ],
        ["DELETE", {}],
        ["PATCH", {}],
      ];
      const out = [];
      for (const [method, headers] of cases) {
        const response = new AcpFixtureResponse();
        await h.stream.handleRequest(
          "owned",
          h.request(method, { headers }),
          response,
          frame("owned", 1),
        );
        out.push([response.statusCode, response.body]);
      }
      assert.deepEqual(
        out.map((x) => x[0]),
        [406, 406, 415, 404, 404, 405],
      );
      return out;
    },
  ),
  scenario(
    "initialize state flips before SDK validation and repeats/batches are rejected",
    async (h) => {
      h.stream.create("owned", "streamable-http");
      const before = new AcpFixtureResponse();
      await h.stream.handlePost(
        "owned",
        h.request(),
        before,
        frame("session/prompt", 0),
      );
      assert.equal(before.statusCode, 400);
      const init = new AcpFixtureResponse();
      await h.stream.handlePost(
        "owned",
        h.request(),
        init,
        frame("initialize", 0, { protocolVersion: "invalid" }),
      );
      assert.equal(h.stream.connectionStates.get("owned").initialized, true);
      const repeat = new AcpFixtureResponse();
      await h.stream.handlePost(
        "owned",
        h.request(),
        repeat,
        frame("initialize", 1),
      );
      assert.equal(repeat.statusCode, 400);
      h.stream.create("batch", "streamable-http");
      const batch = new AcpFixtureResponse();
      await h.stream.handlePost(
        "batch",
        h.request("POST", {
          headers: { ...h.request().headers, "acp-connection-id": "batch" },
        }),
        batch,
        [frame("initialize", 1), frame("owned", 2)],
      );
      assert.equal(batch.statusCode, 400);
      return [before.body, repeat.body, batch.body];
    },
  ),
  scenario(
    "RPC id zero routes response to POST stream and closes at 0ms",
    async (h) => {
      await open(h);
      const response = await prompt(h, 0);
      await h.stream.sendToClient("owned", {
        jsonrpc: "2.0",
        id: 0,
        result: { stopReason: "end_turn" },
      });
      assert.equal(response.writableEnded, false);
      await h.advance();
      assert.equal(response.writableEnded, true);
      assert.equal(h.stream.hasInFlightPrompt("owned"), false);
      return response.messages();
    },
  ),
  scenario("batch response stream waits for all request IDs", async (h) => {
    await open(h);
    const response = new AcpFixtureResponse();
    await h.stream.handlePost("owned", h.request(), response, [
      frame("owned/a", 1),
      frame("owned/b", 2),
    ]);
    await h.stream.sendToClient("owned", { jsonrpc: "2.0", id: 1, result: {} });
    await h.advance();
    assert.equal(response.writableEnded, false);
    await h.stream.sendToClient("owned", {
      jsonrpc: "2.0",
      id: 2,
      error: { code: -1, message: "owned" },
    });
    await h.advance();
    assert.equal(response.writableEnded, true);
    return response.messages();
  }),
  scenario(
    "server permission request pauses idle timer and any client activity resumes it",
    async (h) => {
      await open(h);
      const response = await prompt(h),
        state = h.stream.connectionStates.get("owned"),
        sid = [...state.inFlightPrompts][0];
      await h.stream.sendToClient(
        "owned",
        frame("session/request_permission", 0, { sessionId: "session" }),
      );
      assert.equal(h.stream.pausedPromptStreams.has(sid), true);
      assert.equal(h.stream.promptTimeouts.size, 0);
      const reply = new AcpFixtureResponse();
      await h.stream.handlePost("owned", h.request(), reply, {
        jsonrpc: "2.0",
        id: 0,
        result: {},
      });
      assert.equal(reply.statusCode, 202);
      assert.equal(h.stream.pausedPromptStreams.size, 0);
      assert.equal(h.stream.promptTimeouts.size, 1);
      return response.messages();
    },
  ),
  scenario(
    "SSE backpressure waits for drain and removes temporary listeners",
    async (h) => {
      const response = new AcpFixtureResponse();
      response.backpressure = true;
      let done = false;
      const sent = h.stream
        .writeSseEvent(response, { owned: true })
        .then((value: any) => {
          done = true;
          return value;
        });
      await settle();
      assert.equal(done, false);
      response.emit("drain");
      assert.equal(await sent, true);
      assert.equal(response.listenerCount("close"), 0);
      assert.equal(response.listenerCount("error"), 0);
      return response.messages();
    },
  ),
  scenario(
    "SSE closed/write/flush errors return false without throwing",
    async (h) => {
      const out = [];
      for (const property of [
        "writableEnded",
        "destroyed",
        "throwWrite",
        "throwFlush",
      ]) {
        const response = new AcpFixtureResponse();
        (response as any)[property] = true;
        out.push(await h.stream.writeSseEvent(response, {}));
      }
      assert.deepEqual(out, [false, false, false, false]);
      return h.logs;
    },
  ),
  scenario(
    "POST heartbeat keeps renewing original 30-minute idle deadline",
    async (h) => {
      await open(h);
      const response = await prompt(h);
      await h.advance(1800001);
      assert.equal(response.writableEnded, false);
      assert.equal(h.stream.hasInFlightPrompt("owned"), true);
      assert.ok(response.chunks.some((value) => value.includes(": heartbeat")));
      return [response.chunks.length, h.stream.promptTimeouts.size];
    },
  ),
  scenario(
    "idle timeout without heartbeat reclaims pending RPC and calls interruption/broadcast",
    async (h) => {
      await open(h);
      const response = await prompt(h),
        sid = [...h.stream.connectionStates.get("owned").inFlightPrompts][0];
      h.stream.stopPostHeartbeat(sid);
      await h.advance(1799999);
      assert.equal(response.writableEnded, false);
      await h.advance(1);
      assert.equal(response.writableEnded, true);
      assert.equal(response.messages()[0].error.code, -32800);
      assert.ok(h.calls.some((value) => value[0] === "cancelInterruptions"));
      assert.ok(h.calls.some((value) => value[0] === "failedTools"));
      return [response.messages(), h.calls];
    },
  ),
  scenario(
    "cancel sweep waits 5000ms then emits a normal cancelled result",
    async (h) => {
      await open(h);
      const response = await prompt(h),
        cancel = new AcpFixtureResponse();
      await h.stream.handlePost(
        "owned",
        h.request(),
        cancel,
        frame("session/cancel", undefined, { sessionId: "session" }),
      );
      assert.equal(cancel.statusCode, 202);
      await h.advance(4999);
      assert.equal(response.writableEnded, false);
      await h.advance(1);
      assert.equal(response.writableEnded, true);
      assert.equal(response.messages()[0].result.stopReason, "cancelled");
      return response.messages();
    },
  ),
  scenario(
    "first orphan sweep clears other in-flight flags while leaving their streams open",
    async (h) => {
      await open(h);
      const first = await prompt(h, 1),
        second = await prompt(h, 2);
      h.stream.cancelAllInFlightPrompts("owned");
      await h.advance(5000);
      assert.equal(first.writableEnded, true);
      assert.equal(second.writableEnded, false);
      assert.equal(h.stream.hasInFlightPrompt("owned"), false);
      return [
        first.messages(),
        second.messages(),
        h.stream.connectionStates.get("owned").streamMapping.size,
      ];
    },
  ),
  scenario(
    "security middleware preserves loopback bypass, remote auth and rate-limit responses",
    async (h) => {
      const out = [];
      for (const remoteAddress of [
        "127.0.0.1",
        "::ffff:7f00:1",
        "192.0.2.10",
      ]) {
        const req = h.request("GET", { socket: { remoteAddress } }),
          res = new AcpFixtureResponse();
        let next = false;
        await h.middleware.handle({ request: req, response: res }, async () => {
          next = true;
        });
        out.push([next, res.statusCode, res.body]);
      }
      assert.equal(out[0]![0], true);
      assert.equal(out[2]![1], 401);
      return [out, h.calls];
    },
  ),
  scenario(
    "security middleware exempts OPTIONS and returns 429 at auth rate limit",
    async (h) => {
      const options = new AcpFixtureResponse();
      await h.middleware.handle(
        {
          request: h.request("OPTIONS", {
            socket: { remoteAddress: "192.0.2.1" },
          }),
          response: options,
        },
        async () => assert.fail("preflight must stop"),
      );
      assert.equal(options.statusCode, 204);
      const denied = new AcpFixtureResponse();
      await h.middleware.handle(
        {
          request: h.request("GET", { socket: { remoteAddress: "192.0.2.1" } }),
          response: denied,
        },
        async () => assert.fail("rate limit must stop"),
      );
      assert.equal(denied.statusCode, 429);
      return [denied.body, h.calls];
    },
    { rateLimited: true },
  ),
  scenario(
    "remote POST validates matching token but connect prefix is exempt",
    async (h) => {
      const token = h.guard.issueToken("owned"),
        out = [];
      for (const extra of [
        {},
        { "acp-session-token": "invalid" },
        { "acp-session-token": token, "acp-connection-id": "other" },
        { "acp-session-token": token },
      ]) {
        const req = h.request("POST", {
            socket: { remoteAddress: "192.0.2.1" },
            headers: { ...h.request().headers, ...extra },
          }),
          res = new AcpFixtureResponse();
        let next = false;
        await h.middleware.handle({ request: req, response: res }, async () => {
          next = true;
        });
        out.push([next, res.statusCode, res.body]);
      }
      assert.deepEqual(
        out.map((value) => value[1]),
        [401, 403, 403, 200],
      );
      return out;
    },
    { authValid: true },
  ),
  scenario(
    "source middleware with missing auth dependencies delegates instead of inventing a policy",
    async (h) => {
      delete h.middleware.auth;
      let next = false;
      await h.middleware.handle(
        { request: h.request(), response: new AcpFixtureResponse() },
        async () => {
          next = true;
        },
      );
      assert.equal(next, true);
      return h.calls;
    },
  ),
  scenario(
    "source server stop clears agents/mode but retains original transport subscription",
    async (h) => {
      await h.server.start({ transport: "streamable-http" });
      await h.transports.create("owned", "streamable-http");
      assert.equal(h.agents.getAll().size, 1);
      await h.server.stop();
      assert.equal(h.acp.isAcpMode(), false);
      assert.equal(h.transports.transportCreated.observers.length, 1);
      assert.equal(h.transports.transports.size, 1);
      return h.logs;
    },
  ),
];
