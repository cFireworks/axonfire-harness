import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { StringDecoder } from "node:string_decoder";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const decision of ["success", "error", "disconnect", "unsupported-elicitation"]) test(`native CLI SDK MCP bridge: ${decision === "disconnect" ? "post-EOF request boundary (owned cleanup)" : decision}`, { timeout: 40000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-sdk-mcp-"));
  const rpcCalls = [];
  const requests = [], events = [], failures = [];
  let pendingCall, child, exited, exitResult, stderr = "", pending = "";
  const server = createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      const toolTurn = requests.length === 1;
      const delta = toolTurn ? { role: "assistant", tool_calls: [{ index: 0, id: "owned-write", type: "function",
        function: { name: "mcp__owned__echo", arguments: JSON.stringify({ text: "owned-input" }) } }] }
        : { role: "assistant", content: `Owned stream answer ${requests.length}.` };
      const chunk = { id: `owned-${requests.length}`, object: "chat.completion.chunk", created: 1, model: "owned-model",
        choices: [{ index: 0, delta, finish_reason: null }] };
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: toolTurn ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
    } catch (error) { failures.push(String(error)); res.writeHead(500).end(); }
  });
  const send = message => child.stdin.write(JSON.stringify(message) + "\n");
  async function waitFor(predicate) {
    const deadline = Date.now() + 20000;
    while (!predicate()) {
      assert.deepEqual(failures, []);
      assert.ok(!exitResult, JSON.stringify({ exitResult, stderr, types: events.map(e => e.type) }));
      assert.ok(Date.now() < deadline, JSON.stringify({ stderr, types: events.map(e => e.type), requests: requests.length, rpcCalls }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({
      authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
      agents: [{ name: "owned-agent", tags: ["cli", "default"], instructions: "Test assistant", tools: [], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }],
    }));
    child = spawn(process.execPath, [launcher, "-p", "--input-format", "stream-json", "--output-format", "stream-json", "--allowedTools", "mcp__owned__echo"], {
      cwd: root, env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config },
      stdio: ["pipe", "pipe", "pipe"],
    });
    exited = once(child, "exit").then(result => { exitResult = result; return result; });
    child.stderr.on("data", chunk => { stderr = (stderr + chunk).slice(-4096); });
    child.stdin.on("error", error => failures.push(String(error)));
    const decoder = new StringDecoder("utf8");
    child.stdout.on("data", chunk => {
      pending += decoder.write(chunk);
      let end;
      while ((end = pending.indexOf("\n")) !== -1) {
        const line = pending.slice(0, end); pending = pending.slice(end + 1);
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line); events.push(event);
          if (event.type === "control_request") {
            assert.equal(event.request.subtype, "mcp_message");
            assert.equal(event.request.server_name, "owned");
            const rpc = event.request.message;
            rpcCalls.push(rpc);
            if (child.stdin.writableEnded) continue;
            if (rpc.method === "tools/call" && decision === "disconnect") { child.stdin.end(); continue; }
            if (rpc.method === "tools/call" && decision === "unsupported-elicitation") {
              pendingCall = rpc;
              send({ type: "control_response", response: { subtype: "success", request_id: event.request_id,
                response: { mcp_response: { jsonrpc: "2.0", id: "owned-elicitation", method: "elicitation/create",
                  params: { mode: "form", message: "Owned structured input", requestedSchema: { type: "object", properties: { color: { type: "string" } } } } } } } });
              continue;
            }
            if (rpc.id === "owned-elicitation") {
              assert.equal(rpc.error?.code, -32601);
              send({ type: "control_response", response: { subtype: "success", request_id: event.request_id,
                response: { mcp_response: { jsonrpc: "2.0", id: pendingCall.id,
                  result: { content: [{ type: "text", text: "owned-mcp-result:" + pendingCall.params.arguments.text }] } } } } });
              continue;
            }
            let result;
            if (rpc.method === "initialize") result = {
              protocolVersion: rpc.params.protocolVersion,
              capabilities: { tools: { listChanged: true } },
              serverInfo: { name: "owned-sdk", version: "1.0.0" },
            };
            else if (rpc.method === "tools/list") result = { tools: [{ name: "echo", description: "Owned echo",
              inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } }] };
            else if (rpc.method === "tools/call") result = { content: [{ type: "text", text: decision === "error" ? "owned-mcp-error" : "owned-mcp-result:" + rpc.params.arguments.text }], isError: decision === "error" };
            else if (rpc.id !== undefined) throw new Error("Unexpected MCP request: " + rpc.method);
            send({ type: "control_response", response: { subtype: "success", request_id: event.request_id,
              response: { mcp_response: rpc.id === undefined
                ? { jsonrpc: "2.0", method: "notifications/tools/list_changed" }
                : { jsonrpc: "2.0", id: rpc.id, result } } } });
          }
        } catch (error) { failures.push(String(error)); }
      }
    });
    send({ type: "control_request", request_id: "owned-init", request: { subtype: "initialize", hasPrompt: true, sdkMcpServers: ["owned"], ...(decision === "unsupported-elicitation" ? { capabilities: { elicitation: { form: true } } } : {}) } });
    await waitFor(() => events.some(e => e.type === "control_response" && e.response?.request_id === "owned-init"));
    const init = events.find(e => e.response?.request_id === "owned-init");
    assert.equal(init.response.subtype, "success");
    assert.ok(init.response.response.models.some(model => model.id === "owned-model"));
    assert.equal(requests.length, 0);
    send({ type: "user", message: { role: "user", content: "Owned first stream question" } });
    if (decision === "disconnect") {
      // The captured executor cancels only currently pending requests on EOF.
      // Original MCP/model preparation can still issue a new tools/list afterward.
      await waitFor(() => {
        const call = rpcCalls.findIndex(rpc => rpc.method === "tools/call");
        return call >= 0 && rpcCalls.slice(call + 1).some(rpc => rpc.method === "tools/list");
      });
      assert.equal(child.stdin.writableEnded, true);
      assert.equal(requests.length, 1);
      assert.equal(exitResult, undefined);
      // Deliberately stop this owned probe in finally; this case does not claim graceful EOF.
      return;
    }
    await waitFor(() => events.some(e => e.type === "result"));
    assert.ok(requests[0].tools.some(tool => tool.function.name === "mcp__owned__echo"));
    const calls = rpcCalls.filter(rpc => rpc.method === "tools/call");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].params.name, "echo");
    assert.deepEqual(calls[0].params.arguments, { text: "owned-input" });
    if (decision !== "disconnect") assert.match(JSON.stringify(requests[1].messages),
      decision === "error" ? /owned-mcp-error/ : /owned-mcp-result:owned-input/);
    if (decision === "unsupported-elicitation") {
      assert.equal(rpcCalls.find(rpc => rpc.method === "initialize").params.capabilities.elicitation, undefined);
      assert.equal(rpcCalls.filter(rpc => rpc.id === "owned-elicitation" && rpc.error?.code === -32601).length, 1);
      assert.ok(!events.some(event => event.request?.subtype === "elicitation_create"));
    }
    assert.equal(requests.length, 2);
    send({ type: "user", message: { role: "user", content: "Owned second stream question" } });
    await waitFor(() => events.filter(e => e.type === "result").length === 2);
    assert.equal(requests.length, 3);
    assert.match(JSON.stringify(requests[2].messages), /Owned first stream question/);
    assert.match(JSON.stringify(requests[2].messages), /Owned stream answer 2/);
    const ids = events.filter(e => e.type === "result").map(e => e.session_id);
    assert.ok(ids[0]); assert.equal(ids[0], ids[1]);
    child.stdin.end();
    const timer = setTimeout(() => child.kill("SIGKILL"), 5000);
    try { assert.deepEqual(await exited, [0, null]); } finally { clearTimeout(timer); }
    assert.equal(pending, "");
    assert.deepEqual(failures, []);
  } finally {
    if (child && !exitResult) { child.kill("SIGKILL"); await exited; }
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
