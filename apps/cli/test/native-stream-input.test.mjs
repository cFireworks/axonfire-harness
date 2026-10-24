import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { StringDecoder } from "node:string_decoder";
import { mkdtemp, writeFile, readFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const decision of ["allow", "reject", "disconnect"]) test(`native CLI bidirectional stream-json permissions and continuation: ${decision}`, { timeout: 40000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-stream-input-"));
  const target = join(root, "owned.txt"), content = "owned-approved-rewrite";
  const requests = [], events = [], failures = [], approvals = [];
  let child, exited, exitResult, stderr = "", pending = "";
  const server = createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      const toolTurn = requests.length === 1;
      const delta = toolTurn ? { role: "assistant", tool_calls: [{ index: 0, id: "owned-write", type: "function",
        function: { name: "Write", arguments: JSON.stringify({ file_path: target, content: "owned-original-input" }) } }] }
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
      assert.ok(Date.now() < deadline, JSON.stringify({ stderr, types: events.map(e => e.type), requests: requests.length, approvals }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({
      authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
      agents: [{ name: "owned-agent", tags: ["cli", "default"], instructions: "Test assistant", tools: ["Write"], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }],
    }));
    child = spawn(process.execPath, [launcher, "-p", "--input-format", "stream-json", "--output-format", "stream-json"], {
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
          if (event.type === "control_request" && event.request.subtype === "can_use_tool") {
            approvals.push(event);
            if (decision === "disconnect") { child.stdin.end(); continue; }
            send({ type: "control_response", response: { subtype: "success", request_id: event.request_id,
              response: decision === "allow" ? { allowed: true, updatedInput: { file_path: target, content } } : { allowed: false, message: "Owned stream rejection" } } });
          }
        } catch (error) { failures.push(String(error)); }
      }
    });
    send({ type: "control_request", request_id: "owned-init", request: { subtype: "initialize", hasPrompt: true } });
    await waitFor(() => events.some(e => e.type === "control_response" && e.response?.request_id === "owned-init"));
    const init = events.find(e => e.response?.request_id === "owned-init");
    assert.equal(init.response.subtype, "success");
    assert.ok(init.response.response.models.some(model => model.id === "owned-model"));
    assert.equal(requests.length, 0);
    send({ type: "user", message: { role: "user", content: "Owned first stream question" } });
    await waitFor(() => events.some(e => e.type === "result"));
    assert.equal(approvals.length, 1);
    assert.equal(approvals[0].request.tool_name, "Write");
    if (decision === "allow") assert.equal(await readFile(target, "utf8"), content);
    else await assert.rejects(access(target));
    assert.equal(requests.length, 2);
    if (decision === "disconnect") {
      const timer = setTimeout(() => child.kill("SIGKILL"), 5000);
      try { assert.deepEqual(await exited, [0, null]); } finally { clearTimeout(timer); }
      assert.deepEqual(failures, []);
      assert.equal(pending, "");
      return;
    }
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
