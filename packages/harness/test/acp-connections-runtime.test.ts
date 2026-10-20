import test from "node:test";
import { ACP_CONNECTION_CASES } from "../scripts/helpers/acp-connections-scenarios.js";
import { ACP_SDK_CASES } from "../scripts/helpers/acp-sdk-scenarios.js";
import { createNativeAcpConnections } from "../src/protocol/native-acp-connections.js";
import { createCapturedAcpSdk } from "../src/vendor/captured-acp-sdk.js";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { Readable, Writable } from "node:stream";
import { acpConnectionsFixture } from "../scripts/helpers/acp-connections-fixture.js";
import { ACP_CONNECTION_ROUTES } from "../src/protocol/native-acp-connections.js";

for (const scenario of ACP_CONNECTION_CASES)
  test(scenario.name, { timeout: 5000 }, () =>
    scenario.run(createNativeAcpConnections),
  );
for (const scenario of ACP_SDK_CASES)
  test(scenario.name, { timeout: 5000 }, () =>
    scenario.run(createCapturedAcpSdk),
  );

test(
  "full source server and modified ACP SDK exchange UTF-8 NDJSON through owned stdio pipes",
  { timeout: 10000 },
  async (t) => {
    const h = acpConnectionsFixture(undefined, { realTimers: true });
    t.after(() => h.close());
    await h.server.start({ transport: "stdio" });
    const client = new h.sdk.ClientSideConnection(
      () => ({ sessionUpdate: async () => {} }),
      h.sdk.ndJsonStream(Writable.toWeb(h.stdin), Readable.toWeb(h.stdout)),
    );
    t.after(async () => {
      h.stdout.end();
      await client.closed;
    });
    assert.deepEqual(await client.initialize({ protocolVersion: 1 }), {
      protocolVersion: 1,
    });
    assert.equal(
      (await client.newSession({ cwd: "/owned", mcpServers: [] })).sessionId,
      "owned",
    );
    assert.equal(
      (
        await client.prompt({
          sessionId: "owned",
          prompt: [{ type: "text", text: "中文😀" }],
        })
      ).stopReason,
      "end_turn",
    );
    assert.equal(
      h.calls.find((value) => value[0] === "prompt")[2].prompt[0].text,
      "中文😀",
    );
    assert.equal(h.agents.getAll().size, 1);
  },
);

// This is an owned loopback test host, not an exposed ACP server or a production auth adapter.
async function httpPair(t: any, patch: any = {}) {
  const h = acpConnectionsFixture(undefined, { realTimers: true, ...patch }),
    errors: any[] = [],
    tasks: Promise<any>[] = [],
    abort = new AbortController();
  await h.server.start({ transport: "streamable-http" });
  const http = createServer((req, res) => {
    void h.runContext(req, res, async () => {
      try {
        const route = ACP_CONNECTION_ROUTES.find(
          ([method, suffix]) =>
            method === req.method && req.url === "/api/v1/acp" + suffix,
        );
        if (!route) {
          res.writeHead(404);
          res.end();
          return;
        }
        let body: any;
        if (route[2] === "post") {
          const chunks: Buffer[] = [];
          let bytes = 0;
          for await (const chunk of req) {
            bytes += chunk.length;
            if (bytes > 65536) throw Error("Owned request size exceeded");
            chunks.push(chunk);
          }
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        }
        await h.middleware.handle({ request: req, response: res }, async () =>
          h.controller[route[2]](body),
        );
      } catch (error) {
        errors.push(error);
        if (!res.headersSent) res.writeHead(500);
        res.end();
      }
    });
  });
  let receiver: ReadableStreamDefaultController<any> | undefined,
    incomingController: ReadableStreamDefaultController<any> | undefined,
    client: any;
  t.after(async () => {
    abort.abort();
    await Promise.allSettled(tasks);
    try {
      receiver?.close();
    } catch {}
    try {
      incomingController?.close();
    } catch {}
    try {
      await client?.closed;
      await h.close();
    } finally {
      http.closeAllConnections();
      if (http.listening)
        await new Promise<void>((resolve, reject) =>
          http.close((error) => (error ? reject(error) : resolve())),
        );
    }
  });
  http.listen(0, "127.0.0.1");
  await once(http, "listening");
  const address = http.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/v1/acp`;
  const connect = await fetch(url + "/connect", {
    method: "POST",
    signal: abort.signal,
  });
  assert.equal(connect.status, 200);
  const { connectionId, sessionToken } = (await connect.json()) as any;
  incomingController =
    h.stream.connectionStates.get(connectionId).incomingController;
  const headers = {
    "acp-connection-id": connectionId,
    "acp-session-token": sessionToken,
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
  };
  const readable = new ReadableStream({
    start(controller) {
      receiver = controller;
    },
  });
  const consume = async (response: Response) => {
    if (!response.body) return;
    const reader = response.body.getReader(),
      decoder = new TextDecoder();
    let pending = "";
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        pending += decoder.decode(next.value, { stream: true });
        for (;;) {
          const index = pending.indexOf("\n\n");
          if (index < 0) break;
          const block = pending.slice(0, index);
          pending = pending.slice(index + 2);
          for (const line of block.split("\n"))
            if (line.startsWith("data: "))
              receiver!.enqueue(JSON.parse(line.slice(6)));
        }
      }
    } catch (error) {
      if (!abort.signal.aborted) {
        errors.push(error);
        receiver!.error(error);
      }
    } finally {
      reader.releaseLock();
    }
  };
  const startRead = (response: Response) => tasks.push(consume(response));
  const writable = new WritableStream({
    async write(message) {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(message),
        signal: abort.signal,
      });
      if (!response.ok)
        throw Error(`Owned HTTP ${response.status}: ${await response.text()}`);
      // Return after headers. Waiting for SSE EOF here deadlocks the SDK's duplex permission reply queue.
      startRead(response);
    },
  });
  const updates: any[] = [],
    permissions: any[] = [];
  client = new h.sdk.ClientSideConnection(
    () => ({
      sessionUpdate: async (value: any) => {
        updates.push(value);
      },
      requestPermission: async (value: any) => {
        permissions.push(value);
        return { outcome: { outcome: "selected", optionId: "allow" } };
      },
    }),
    { readable, writable },
  );
  return {
    h,
    client,
    updates,
    permissions,
    headers,
    url,
    connectionId,
    errors,
    startRead,
    abort,
  };
}

test(
  "source HTTP routes and full ACP SDK support bidirectional permission, SSE updates and explicit DELETE",
  { timeout: 15000 },
  async (t) => {
    const p = await httpPair(t, {
      prompt: async (request: any, connection: any) => {
        const reply = await connection.requestPermission({
          sessionId: request.sessionId,
          toolCall: { toolCallId: "owned-call", rawInput: { text: "中文😀" } },
          options: [{ kind: "allow_once", name: "Allow", optionId: "allow" }],
        });
        assert.equal(reply.outcome.optionId, "allow");
        await connection.sessionUpdate({
          sessionId: request.sessionId,
          update: {
            sessionUpdate: "agent_message_chunk",
            content: { type: "text", text: "批准😀" },
          },
        });
        return { stopReason: "end_turn" };
      },
    });
    assert.equal(
      (await p.client.initialize({ protocolVersion: 1 })).protocolVersion,
      1,
    );
    assert.equal(
      (await p.client.newSession({ cwd: "/owned", mcpServers: [] })).sessionId,
      "owned",
    );
    assert.equal(
      (await p.client.prompt({ sessionId: "owned", prompt: [] })).stopReason,
      "end_turn",
    );
    assert.equal(p.permissions.length, 1);
    assert.equal(p.updates[0].update.content.text, "批准😀");
    const response = await fetch(p.url, {
      method: "DELETE",
      headers: p.headers,
    });
    // Original handleDelete checks the matching header, not whether controller.delete already removed state.
    assert.equal(response.status, 200);
    await response.text();
    assert.equal(
      p.h.guard.validateToken(p.headers["acp-session-token"]),
      undefined,
    );
    assert.equal(p.h.transports.transports.size, 0);
    assert.equal(p.h.stream.connectionStates.size, 0);
    assert.deepEqual(p.errors, []);
  },
);

test(
  "source standalone GET receives server notifications and closes without borrowing real stdio",
  { timeout: 10000 },
  async (t) => {
    const p = await httpPair(t);
    await p.client.initialize({ protocolVersion: 1 });
    const response = await fetch(p.url, {
      headers: p.headers,
      signal: p.abort.signal,
    });
    assert.equal(response.status, 200);
    p.startRead(response);
    const update = {
      sessionId: "owned",
      update: {
        sessionUpdate: "agent_message_chunk",
        content: { type: "text", text: "standalone" },
      },
    };
    await p.h.endpoints[0].sessionUpdate(update);
    for (let i = 0; i < 100 && !p.updates.length; i++)
      await new Promise((resolve) => setTimeout(resolve, 5));
    assert.deepEqual(p.updates, [update]);
    assert.deepEqual(p.errors, []);
  },
);
