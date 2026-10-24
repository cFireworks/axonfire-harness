import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const execute = promisify(execFile);
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));

for (const mode of ["json", "sse-response", "tool-error", "rpc-error", "explicit-model", "legacy-sse", "legacy-sse-tool-error", "legacy-sse-rpc-error", "legacy-sse-explicit-model", "http-list-change", "legacy-sse-list-change"]) {
  const legacy = mode.startsWith("legacy-sse"), toolError = mode.endsWith("tool-error"), rpcError = mode.endsWith("rpc-error"), explicitModel = mode.endsWith("explicit-model");
  const listChange = mode.endsWith("list-change"), streamResponse = mode === "sse-response" || mode === "http-list-change";
  test(`default CLI ${legacy ? "legacy SSE" : "Streamable HTTP"} MCP: ${mode}`, { timeout: 45000 }, async () => {
    const root = await mkdtemp(join(tmpdir(), "axon-http-mcp-"));
    const requests = [], rpc = [], failures = [];
    const sessionId = "owned-mcp-session";
    const streamHeaders = [];
    let eventStream, streamClosed = false, toolsChanged = false, confirmDiscovery;
    let reindexedBeforeToolResult = false;
    async function awaitDiscovery(promise) {
      let timer;
      try {
        await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error("tools/list_changed must trigger discovery before the pending call completes")), 5000); })]);
        reindexedBeforeToolResult = true;
      } finally { clearTimeout(timer); }
    }
    const server = createServer(async (req, res) => {
      try {
        if (legacy && req.url === "/mcp" && req.method === "GET") {
          assert.equal(eventStream, undefined, "Exactly one SSE connection must be opened");
          eventStream = res;
          streamHeaders.push(req.headers);
          res.on("close", () => { streamClosed = true; });
          res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
          res.write(`event: endpoint\ndata: /mcp-message?sessionId=${sessionId}\n\n`);
          return;
        }
        if (req.url === "/mcp" && req.method !== "POST") {
          res.writeHead(405).end();
          return;
        }
        let raw = "";
        for await (const chunk of req) raw += chunk;
        const body = JSON.parse(raw);
        if (req.url === "/mcp" || req.url?.startsWith("/mcp-message")) {
          assert.equal(req.method, "POST");
          if (legacy) assert.equal(req.url, `/mcp-message?sessionId=${sessionId}`);
          rpc.push({ body, headers: req.headers });
          if (body.id === undefined) { res.writeHead(202).end(); return; }
          let result;
          if (body.method === "initialize") result = {
            protocolVersion: body.params.protocolVersion,
            capabilities: { tools: listChange ? { listChanged: true } : {} }, serverInfo: { name: "owned-http", version: "1.0.0" },
          };
          else if (body.method === "tools/list") result = { tools: [{
            name: toolsChanged ? "echo_new" : "echo", description: "Owned HTTP echo",
            inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
          }] };
          else if (body.method === "tools/call") result = {
            content: [{ type: "text", text: toolError ? "owned-http-error" : `owned-http-result:${body.params.arguments.text}` }],
            isError: toolError,
          };
          else throw Error(`Unexpected RPC ${body.method}`);
          if (body.method === "tools/list" && toolsChanged) confirmDiscovery?.();
          const notify = listChange && body.method === "tools/call" && !toolsChanged;
          let discovery;
          if (notify) {
            toolsChanged = true;
            discovery = new Promise(resolve => { confirmDiscovery = resolve; });
          }
          const notification = `event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", method: "notifications/tools/list_changed" })}\n\n`;
          const response = JSON.stringify(rpcError && body.method === "tools/call"
            ? { jsonrpc: "2.0", id: body.id, error: { code: -32603, message: "owned-http-rpc-error" } }
            : { jsonrpc: "2.0", id: body.id, result });
          if (legacy) {
            res.writeHead(202).end("Accepted");
            if (notify) {
              eventStream.write(notification);
              await awaitDiscovery(discovery);
            }
            eventStream.write(`event: message\ndata: ${response}\n\n`);
            return;
          }
          res.writeHead(200, { "content-type": streamResponse ? "text/event-stream" : "application/json", "mcp-session-id": sessionId });
          if (notify) {
            res.write(notification);
            await awaitDiscovery(discovery);
          }
          res.end(streamResponse ? `event: message\ndata: ${response}\n\n` : response);
          return;
        }
        assert.equal(req.url, "/v1/chat/completions");
        requests.push(body);
        const tool = requests.length === 1 || listChange && requests.length === 2;
        const delta = tool ? { role: "assistant", tool_calls: [{ index: 0, id: requests.length === 2 ? "owned-updated-call" : "owned-http-call", type: "function", function: {
          name: requests.length === 2 ? "mcp__owned__echo_new" : "mcp__owned__echo", arguments: JSON.stringify({ text: "owned-input" }),
        } }] } : { role: "assistant", content: "Owned HTTP MCP completed." };
        const chunk = { id: `owned-${requests.length}`, object: "chat.completion.chunk", created: 1, model: "owned-model", choices: [{ index: 0, delta, finish_reason: null }] };
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: tool ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
      } catch (error) { failures.push(String(error)); if (res.headersSent) res.destroy(error); else res.writeHead(500).end(); }
    });
    try {
      await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
      const base = `http://127.0.0.1:${server.address().port}`;
      const mcp = join(root, "mcp.json"), product = join(root, "product.json");
      // Legacy SSE requires an explicit type; omitted type follows original URL -> HTTP normalization.
      await writeFile(mcp, JSON.stringify({ mcpServers: { owned: {
        ...(legacy ? { type: "sse" } : {}), url: `${base}/mcp`, headers: { Authorization: "Bearer owned-mcp-token", "X-Owned-Fixture": "http" },
      } } }));
      await writeFile(product, JSON.stringify({ authentication: { type: "custom-token", attributes: { token: "owned-model-token" } }, config: { disabled: true },
        agents: [{ name: "owned-main", tags: ["cli", "default"], instructions: "Call the owned MCP tool.", tools: [], models: ["owned-model"] }],
        models: [{ id: "owned-model", name: "owned-model", url: `${base}/v1/chat/completions` }],
      }));
      const result = await execute(process.execPath, [launcher, "-p", "Call the owned echo tool.", "--mcp-config", mcp, "--strict-mcp-config", "--permission-mode", "default", "--allowedTools", listChange ? "mcp__owned__echo,mcp__owned__echo_new" : "mcp__owned__echo", ...(explicitModel ? ["--model", "owned-model"] : [])], {
        cwd: root, timeout: 35000, maxBuffer: 2 * 1024 * 1024,
        env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: product },
      });
      assert.match(result.stdout, /Owned HTTP MCP completed/, JSON.stringify({ stderr: result.stderr, failures, rpc, requests: requests.length }));
      assert.deepEqual(failures, []);
      assert.equal(requests.length, listChange ? 3 : 2);
      assert.ok(requests[0].tools.some(tool => tool.function.name === "mcp__owned__echo"));
      const output = requests[1].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-http-call");
      assert.match(output?.content, rpcError ? /owned-http-rpc-error/ : toolError ? /owned-http-error/ : /owned-http-result:owned-input/);
      assert.equal(rpc[0].body.method, "initialize");
      assert.ok(rpc.some(item => item.body.method === "notifications/initialized"));
      assert.ok(rpc.some(item => item.body.method === "tools/list"));
      const calls = rpc.filter(item => item.body.method === "tools/call");
      assert.equal(calls.length, listChange ? 2 : 1);
      if (listChange) {
        assert.equal(reindexedBeforeToolResult, true);
        assert.ok(requests[1].tools.some(tool => tool.function.name === "mcp__owned__echo_new"));
        assert.ok(!requests[1].tools.some(tool => tool.function.name === "mcp__owned__echo"));
        assert.equal(calls[1].body.params.name, "echo_new");
        assert.deepEqual(calls[1].body.params.arguments, { text: "owned-input" });
        assert.match(requests[2].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-updated-call")?.content, /owned-http-result:owned-input/);
        const firstCall = rpc.findIndex(item => item.body.method === "tools/call");
        assert.ok(rpc.slice(firstCall + 1).some(item => item.body.method === "tools/list"), "Notification must be followed by discovery");
      }
      assert.equal(calls[0].body.params.name, "echo");
      // The original proxy reads the request/session model override, not the agent default.
      assert.equal(calls[0].headers["x-model-id"], explicitModel ? "owned-model" : undefined);
      assert.equal(rpc[0].headers["x-model-id"], undefined);
      assert.deepEqual(calls[0].body.params.arguments, { text: "owned-input" });
      if (legacy) {
        const deadline = Date.now() + 2000;
        while (!streamClosed && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
        assert.equal(streamClosed, true, "CLI exit must close the SSE stream before fixture cleanup");
        assert.equal(streamHeaders.length, 1);
        assert.equal(streamHeaders[0].authorization, "Bearer owned-mcp-token");
        assert.equal(streamHeaders[0]["x-owned-fixture"], "http");
        assert.equal(streamHeaders[0]["x-model-id"], undefined);
      }
      for (const [index, item] of rpc.entries()) {
        assert.equal(item.headers.authorization, "Bearer owned-mcp-token");
        assert.equal(item.headers["x-owned-fixture"], "http");
        if (index > 0) {
          assert.equal(item.headers["mcp-session-id"], legacy ? undefined : sessionId);
          assert.equal(item.headers["mcp-protocol-version"], rpc[0].body.params.protocolVersion);
        }
      }
    } finally {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
      await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
  });
}
