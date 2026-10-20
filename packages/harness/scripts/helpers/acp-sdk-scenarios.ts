import assert from "node:assert/strict";
import { createCapturedAcpSdk } from "../../src/vendor/captured-acp-sdk.js";
import { settle } from "./acp-protocol-fixture.js";
type Factory = typeof createCapturedAcpSdk;
export async function acpSdkPair(factory: Factory, patch: any = {}) {
  const logs: any[] = [],
    calls: any[] = [],
    updates: any[] = [],
    toAgent = new TransformStream<any, any>(),
    toClient = new TransformStream<any, any>();
  const sdk = factory({
    console: { error: (...args: any[]) => logs.push(args) },
  });
  let agent: any;
  const client = new sdk.ClientSideConnection(
    () => ({
      sessionUpdate: async (update: any) => {
        updates.push(update);
      },
      requestPermission: async (request: any) => {
        calls.push(["permission", request]);
        return { outcome: { outcome: "selected", optionId: "allow" } };
      },
      readTextFile: async (request: any) => {
        calls.push(["read", request]);
        return { content: "owned content" };
      },
      writeTextFile: async (request: any) => {
        calls.push(["write", request]);
      },
      createTerminal: async (request: any) => {
        calls.push(["terminal", request]);
        return { terminalId: "owned-terminal" };
      },
      terminalOutput: async (request: any) => {
        calls.push(["output", request]);
        return { output: "owned output", truncated: false };
      },
      waitForTerminalExit: async (request: any) => {
        calls.push(["exit", request]);
        return { exitCode: 0 };
      },
      killTerminal: async (request: any) => {
        calls.push(["kill", request]);
      },
      releaseTerminal: async (request: any) => {
        calls.push(["release", request]);
      },
      ...patch.client,
    }),
    { readable: toClient.readable, writable: toAgent.writable },
  );
  agent = new sdk.AgentSideConnection(
    (connection: any) => ({
      initialize: async (request: any) => {
        calls.push(["initialize", request]);
        return { protocolVersion: 1 };
      },
      newSession: async (request: any) => {
        calls.push(["new", request]);
        return { sessionId: "owned" };
      },
      prompt: async (request: any) => {
        calls.push(["prompt", request]);
        return { stopReason: "end_turn" };
      },
      cancel: async (request: any) => {
        calls.push(["cancel", request]);
      },
      authenticate: async () => undefined,
      ...patch.agent?.(connection, sdk),
    }),
    { readable: toAgent.readable, writable: toClient.writable },
  );
  return {
    sdk,
    client,
    agent,
    calls,
    updates,
    logs,
    async close() {
      await Promise.allSettled([
        agent.connection.writeQueue,
        client.connection.writeQueue,
      ]);
      const a = toAgent.writable.getWriter(),
        c = toClient.writable.getWriter();
      try {
        await Promise.allSettled([a.close(), c.close()]);
      } finally {
        a.releaseLock();
        c.releaseLock();
      }
      await Promise.all([agent.closed, client.closed]);
    },
  };
}
type Case = { name: string; run(factory: Factory): Promise<any> };
const scenario = (
  name: string,
  run: (pair: Awaited<ReturnType<typeof acpSdkPair>>) => Promise<any>,
  patch: any = {},
): Case => ({
  name,
  async run(factory) {
    const pair = await acpSdkPair(factory, patch);
    try {
      return await run(pair);
    } finally {
      await pair.close();
    }
  },
});
export const ACP_SDK_CASES: Case[] = [
  scenario(
    "captured ACP initializes, creates session and parses prompt defaults without app bootstrap",
    async (p) => {
      await p.client.initialize({
        protocolVersion: 1,
        unknown: "strip",
        clientCapabilities: {
          fs: { readTextFile: true },
          _meta: { owned: true },
        },
      });
      await p.client.newSession({ cwd: "/owned", mcpServers: [] });
      assert.deepEqual(
        await p.client.prompt({
          sessionId: "owned",
          prompt: [{ type: "text", text: "hello" }],
        }),
        { stopReason: "end_turn" },
      );
      assert.equal(p.calls[0][1].unknown, undefined);
      return p.calls;
    },
  ),
  scenario(
    "captured ACP schemas retain original required/default/skip-error behavior",
    async (p) => {
      const out = [];
      for (const input of [
        { protocolVersion: 1 },
        { protocolVersion: "1" },
        { protocolVersion: -1 },
        {
          protocolVersion: 1,
          clientInfo: { name: "owned", version: "1" },
          clientCapabilities: {
            fs: { readTextFile: "invalid" },
            terminal: "bad",
          },
        },
        {
          protocolVersion: 1,
          clientCapabilities: {
            terminal: true,
            fs: { readTextFile: true, writeTextFile: false },
          },
        },
      ]) {
        try {
          out.push(await p.client.initialize(input));
        } catch (error: any) {
          out.push(error.toErrorResponse());
        }
      }
      assert.equal(out[1].code, -32602);
      return [out, p.calls];
    },
  ),
  scenario(
    "captured ACP validates prompt blocks and preserves _meta while stripping unknown fields",
    async (p) => {
      const out = [];
      for (const prompt of [
        [],
        [{ type: "text", text: "中文", extra: true, _meta: { custom: [1] } }],
        [{ type: "image", data: "aGVsbG8=", mimeType: "image/png" }],
        [{ type: "resource_link", uri: "file:///owned", name: "Owned" }],
        [{ type: "text", text: 4 }],
        [{ type: "document", data: "unsupported" }],
        "not-array",
      ]) {
        try {
          out.push(await p.client.prompt({ sessionId: "owned", prompt }));
        } catch (error: any) {
          out.push(error.toErrorResponse());
        }
      }
      assert.equal(out.at(-1).code, -32602);
      return [out, p.calls];
    },
  ),
  scenario(
    "captured ACP optional methods reject with original method-not-found payload",
    async (p) => {
      const out = [];
      for (const invoke of [
        () =>
          p.client.loadSession({
            sessionId: "owned",
            cwd: "/owned",
            mcpServers: [],
          }),
        () => p.client.extMethod("owned/missing", {}),
      ]) {
        try {
          out.push(await invoke());
        } catch (error: any) {
          out.push(error.toErrorResponse());
        }
      }
      assert.equal(out[0].code, -32601);
      assert.equal(out[1].data.method, "owned/missing");
      return out;
    },
  ),
  scenario(
    "captured ACP permission requests, notifications and file IO preserve duplex routing",
    async (p) => {
      const permission = await p.agent.requestPermission({
        sessionId: "owned",
        options: [{ kind: "allow_once", name: "Allow", optionId: "allow" }],
        toolCall: { toolCallId: "call", rawInput: { owned: true } },
      });
      const read = await p.agent.readTextFile({
        sessionId: "owned",
        path: "/owned",
        line: 1,
        limit: 10,
      });
      await p.agent.writeTextFile({
        sessionId: "owned",
        path: "/owned",
        content: "write",
      });
      await p.agent.sessionUpdate({
        sessionId: "owned",
        update: {
          sessionUpdate: "agent_message_chunk",
          content: { type: "text", text: "done" },
        },
      });
      await settle();
      assert.equal(permission.outcome.optionId, "allow");
      assert.equal(read.content, "owned content");
      assert.equal(p.updates.length, 1);
      return [permission, read, p.calls, p.updates];
    },
  ),
  scenario(
    "captured ACP terminal handle forwards original IDs and empty-response normalization",
    async (p) => {
      const handle = await p.agent.createTerminal({
        sessionId: "owned",
        command: "owned noop",
        args: [],
        outputByteLimit: 1024,
      });
      const output = await handle.currentOutput(),
        exit = await handle.waitForExit(),
        killed = await handle.kill(),
        released = await handle.release();
      assert.equal(handle.id, "owned-terminal");
      assert.deepEqual(killed, {});
      assert.deepEqual(released, {});
      return [output, exit, p.calls];
    },
  ),
  scenario(
    "captured ACP cancel is a notification and requires cooperative agent completion",
    async (p) => {
      await p.client.cancel({
        sessionId: "owned",
        _meta: { "codebuddy.ai/cancelReason": "user" },
      });
      await settle();
      assert.equal(p.calls[0][0], "cancel");
      return p.calls;
    },
  ),
  scenario(
    "captured ACP stream EOF rejects pending requests and future calls",
    async (p) => {
      const pending = p.client.prompt({ sessionId: "owned", prompt: [] });
      await settle();
      // The original compiled connection exposes close; this test owns both endpoints.
      p.client.connection.close(Error("owned EOF"));
      await assert.rejects(pending, /owned EOF/);
      await assert.rejects(
        p.client.prompt({ sessionId: "owned", prompt: [] }),
        /owned EOF/,
      );
      return [
        p.client.signal.aborted,
        p.client.connection.pendingResponses.size,
      ];
    },
    { agent: () => ({ prompt: () => new Promise(() => {}) }) },
  ),
  {
    name: "captured ACP NDJSON handles every UTF-8 split, malformed lines and EOF tail",
    async run(factory) {
      const text =
          '\n{bad}\n{"jsonrpc":"2.0","method":"owned/中文","params":{"x":"😀"}}\n{"tail":true}',
        bytes = new TextEncoder().encode(text),
        results = [];
      for (let at = 0; at <= bytes.length; at++) {
        const logs: any[] = [],
          sdk = factory({
            console: { error: (message: any) => logs.push(message) },
          }),
          source = new ReadableStream<Uint8Array>({
            start(c) {
              c.enqueue(bytes.slice(0, at));
              c.enqueue(bytes.slice(at));
              c.close();
            },
          });
        const written: Uint8Array[] = [],
          output = new WritableStream<Uint8Array>({
            write(chunk) {
              written.push(chunk);
            },
          }),
          stream = sdk.ndJsonStream(output, source),
          received = [];
        for await (const value of stream.readable) received.push(value);
        const writer = stream.writable.getWriter();
        await writer.write({ owned: "中文" });
        await writer.close();
        writer.releaseLock();
        assert.equal(received.length, 2);
        assert.equal(logs.length, 1);
        results.push([received, new TextDecoder().decode(written[0])]);
      }
      return results;
    },
  },
];
