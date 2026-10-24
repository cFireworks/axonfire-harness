import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { connectNativeAcp } from "../../web/native-acp-client.mjs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, readdir, access, stat, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const execute = promisify(execFile);
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const mode of ["restart", "crash", "active-crash", "partial-crash", "partial-cancel", "approval-crash", "approval-cancel", "write-crash", "post-hook-crash"]) test(`native daemon lifecycle and persisted ACP recovery: ${mode}`, { timeout: 90000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-native-daemon-"));
  const pids = new Set();
  const interruptedTurn = mode !== "restart" && mode !== "crash";
  const approvalTurn = mode.startsWith("approval-");
  const writtenTurn = mode === "write-crash";
  const hookTurn = mode === "post-hook-crash";
  const hookRequests = [];
  const toolTurn = approvalTurn || writtenTurn || hookTurn;
  let writtenStat, writtenResult;
  const cancelledTurn = mode.endsWith("-cancel");
  const approvals = [];
  const output = join(root, "pending-write.txt");
  const partialTurn = mode.startsWith("partial-");
  const partial = "Owned partial daemon answer";
  const events = [];
  let options, client, pendingOutcome, releasePending;
  const pendingGate = new Promise(resolve => { releasePending = resolve; });
  const requests = [], failures = [];
  const model = createHttpServer(async (req, res) => {
    try {
      let body = ""; for await (const chunk of req) body += chunk;
      if (req.url === "/owned-post-tool") {
        hookRequests.push(JSON.parse(body));
        await pendingGate;
        if (!res.destroyed) res.writeHead(200, { "content-type": "application/json" }).end("{}");
        return;
      }
      requests.push(JSON.parse(body));
      const turn = requests.length;
      if ((mode === "active-crash" && turn === 2) || (writtenTurn && turn === 3)) await pendingGate;
      if (res.destroyed) return;
      if (partialTurn && turn === 2) {
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.write(`data: ${JSON.stringify({ id: "owned-partial", object: "chat.completion.chunk", created: 1, model: "owned-model",
          choices: [{ index: 0, delta: { role: "assistant", content: partial }, finish_reason: null }] })}\n\n`);
        await pendingGate;
        if (!res.destroyed) res.end();
        return;
      }
      const chunk = { id: `owned-${turn}`, object: "chat.completion.chunk", created: 1, model: "owned-model",
        choices: [{ index: 0, delta: toolTurn && turn === 2
          ? { role: "assistant", tool_calls: [{ index: 0, id: "owned-pending-write", type: "function",
              function: { name: "Write", arguments: JSON.stringify({ file_path: output, content: "Owned pending write" }) } }] }
          : { role: "assistant", content: `Owned daemon answer ${turn}.` }, finish_reason: null }] };
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: toolTurn && turn === 2 ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
    } catch (error) { failures.push(String(error)); res.writeHead(500).end(); }
  });
  const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === "ESRCH") return false; throw error; } };
  async function command(...args) {
    let stdout = "";
    try { stdout = (await execute(process.execPath, [launcher, "daemon", ...args], options)).stdout; return stdout; }
    catch (error) { stdout = error.stdout ?? ""; throw error; }
    finally { for (const match of stdout.matchAll(/PID:\s*(\d+)/g)) pids.add(Number(match[1])); }
  }
  try {
    await new Promise(resolve => model.listen(0, "127.0.0.1", resolve));
    const portProbe = createServer();
    await new Promise(resolve => portProbe.listen(0, "127.0.0.1", resolve));
    const port = portProbe.address().port;
    await new Promise(resolve => portProbe.close(resolve));
    if (hookTurn) {
      await mkdir(join(root, ".codebuddy"));
      await writeFile(join(root, ".codebuddy", "settings.local.json"), JSON.stringify({ hooks: {
        PostToolUse: [{ matcher: "Write", hooks: [{ type: "http", url: `http://127.0.0.1:${model.address().port}/owned-post-tool`, timeout: 60 }] }],
      } }));
    }
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({ authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
      agents: [{ name: "owned-agent", tags: ["cli", "default"], instructions: "Test assistant", tools: toolTurn ? ["Write"] : [], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${model.address().port}/v1` }] }));
    options = { cwd: root, timeout: 30000, maxBuffer: 2 * 1024 * 1024,
      env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
        SERVER__PORT: "", SERVER__HOST: "127.0.0.1",
        CODEBUDDY_DAEMON_ALLOW_SLEEP: "1", CODEBUDDY_DAEMON_AUTO_CONNECT_CHANNELS: "0" } };
    assert.deepEqual(JSON.parse(await command("status")), { status: "stopped" });
    const started = await command("start", "--port", String(port), "--host", "127.0.0.1");
    const status = JSON.parse(await command("status"));
    assert.equal(status.status, "running", started);
    assert.ok(pids.has(status.pid));
    assert.ok(alive(status.pid));
    assert.equal(status.endpoint, `http://127.0.0.1:${port}`);
    assert.equal((await fetch(status.endpoint + "/api/v1/health", { headers: { "x-codebuddy-request": "1" } })).status, 200);
    const repeated = await command("start");
    assert.match(repeated, new RegExp(`PID: ${status.pid}\\b`));
    client = await connectNativeAcp(status.endpoint, {
      onNotification: event => events.push(event),
      async onRequest(method, params) {
        assert.equal(method, "session/request_permission");
        approvals.push(params);
        if (writtenTurn || hookTurn) return { outcome: { outcome: "selected", optionId: "allow" } };
        await pendingGate;
        return { outcome: { outcome: "cancelled" } };
      },
    });
    const session = await client.request("session/new", { cwd: root, mcpServers: [] });
    if (toolTurn) await client.request("session/set_mode", { sessionId: session.sessionId, modeId: "default" });
    const first = await client.request("session/prompt", { sessionId: session.sessionId,
      prompt: [{ type: "text", text: "Owned daemon first question" }] });
    assert.equal(first.stopReason, "end_turn");
    assert.equal(requests.length, 1);
    if (interruptedTurn) {
      pendingOutcome = client.request("session/prompt", { sessionId: session.sessionId,
        prompt: [{ type: "text", text: "Owned daemon pending question" }] }).then(
          result => ({ result }), error => ({ error }));
      const deadline = Date.now() + 10000;
      const expectedRequests = writtenTurn ? 3 : 2;
      while (requests.length < expectedRequests && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(requests.length, expectedRequests);
      if (partialTurn) {
        while (!JSON.stringify(events).includes(partial) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
        assert.ok(JSON.stringify(events).includes(partial), JSON.stringify(events).slice(-2000));
      }
    } else { await client.close(); client = undefined; }
    if (approvalTurn) {
      const deadline = Date.now() + 10000;
      while (approvals.length === 0 && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(approvals.length, 1, JSON.stringify({ requests: requests.length, tools: requests[1]?.tools?.map(tool => tool.function?.name), messages: requests.at(-1)?.messages?.slice(-3) }).slice(-3000));
      await assert.rejects(access(output), { code: "ENOENT" });
    }
    if (hookTurn) {
      const deadline = Date.now() + 10000;
      while (hookRequests.length === 0 && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(hookRequests.length, 1);
      assert.equal(hookRequests[0].hook_event_name, "PostToolUse");
      assert.equal(hookRequests[0].tool_name, "Write");
      assert.deepEqual(hookRequests[0].tool_input, { file_path: output, content: "Owned pending write" });
      assert.ok(JSON.stringify(hookRequests[0].tool_response).includes("Successfully created and wrote to new file"));
      assert.equal(await readFile(output, "utf8"), "Owned pending write");
      writtenStat = await stat(output, { bigint: true });
      assert.equal(requests.length, 2, "post-tool hook blocks model continuation");
    }
    if (writtenTurn) {
      assert.equal(approvals.length, 1);
      assert.equal(await readFile(output, "utf8"), "Owned pending write");
      writtenStat = await stat(output, { bigint: true });
      const results = requests[2].messages.filter(message => message.role === "tool" && message.tool_call_id === "owned-pending-write");
      assert.equal(results.length, 1);
      writtenResult = results[0];
      assert.ok(writtenResult.content.length > 0);
      assert.notEqual(writtenResult.skipRun, true);
    }
    if (cancelledTurn) {
      await client.notify("session/cancel", { sessionId: session.sessionId });
      releasePending();
      const outcome = await pendingOutcome;
      assert.equal(outcome.result?.stopReason, "cancelled");
      await client.close(); client = undefined;
    }
    if (mode !== "restart" && !cancelledTurn) {
      const records = (await readdir(root, { recursive: true })).filter(path => basename(path) === `${status.pid}.json`);
      assert.equal(records.length, 1, JSON.stringify(records));
      const record = join(root, records[0]);
      assert.equal(JSON.parse(await readFile(record, "utf8")).pid, status.pid);
      process.kill(status.pid, "SIGKILL");
      const deadline = Date.now() + 5000;
      while (alive(status.pid) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
      assert.equal(alive(status.pid), false);
      if (interruptedTurn) {
        if (approvalTurn) releasePending();
        let timer;
        try {
          const outcome = await Promise.race([pendingOutcome, new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("ACP request did not fail after daemon crash")), 5000);
          })]);
          assert.ok(outcome.error instanceof Error, "a killed daemon cannot report a completed pending model turn");
        } finally { clearTimeout(timer); }
        await assert.rejects(client.close(), /fetch failed|Native ACP disconnect failed/);
        client = undefined;
        releasePending();
      }
      await access(record); // SIGKILL cannot run the original exit-unregister hook.
      assert.deepEqual(JSON.parse(await command("status")), { status: "stopped" });
      await execute(process.execPath, [launcher, "ps", "--json"], options); // Original awaited stale-file cleanup.
      await assert.rejects(access(record), { code: "ENOENT" });
      await command("start", "--port", String(port), "--host", "127.0.0.1");
    } else await command("restart");
    const restarted = JSON.parse(await command("status"));
    assert.equal(restarted.status, "running");
    assert.notEqual(restarted.pid, status.pid);
    assert.ok(pids.has(restarted.pid));
    assert.equal(alive(status.pid), false);
    assert.equal(restarted.endpoint, status.endpoint);
    assert.equal((await fetch(restarted.endpoint + "/api/v1/health", { headers: { "x-codebuddy-request": "1" } })).status, 200);
    const replay = [];
    client = await connectNativeAcp(restarted.endpoint, { onNotification: event => replay.push(event) });
    await client.request("session/load", { sessionId: session.sessionId, cwd: root, mcpServers: [] });
    const second = await client.request("session/prompt", { sessionId: session.sessionId,
      prompt: [{ type: "text", text: "Owned daemon resumed question" }] });
    assert.equal(second.stopReason, "end_turn");
    assert.equal(requests.length, writtenTurn ? 4 : interruptedTurn ? 3 : 2);
    const continued = JSON.stringify(requests.at(-1).messages);
    assert.match(continued, /Owned daemon resumed question/);
    assert.match(continued, /Owned daemon first question/);
    assert.match(continued, /Owned daemon answer 1/);
    if (interruptedTurn) {
      assert.match(continued, /Owned daemon pending question/);
      assert.doesNotMatch(continued, /Owned daemon answer 2/);
    }
    if (approvalTurn) {
      await assert.rejects(access(output), { code: "ENOENT" });
      const updates = replay.map(event => event.params?.update).filter(update => update?.toolCallId === "owned-pending-write");
      assert.ok(updates.some(update => update.sessionUpdate === "tool_call" && update.status === "pending"));
      assert.ok(updates.some(update => update.sessionUpdate === "tool_call_update" && update.status === "cancelled"
        && update._meta?.["codebuddy.ai/toolCancelReason"] === "session_interrupted"));
      const messages = requests.at(-1).messages;
      const calls = messages.flatMap(message => message.tool_calls ?? []).filter(call => call.id === "owned-pending-write");
      assert.equal(calls.length, 1);
      assert.equal(calls[0].function.name, "Write");
      assert.deepEqual(JSON.parse(calls[0].function.arguments), { file_path: output, content: "Owned pending write" });
      const results = messages.filter(message => message.role === "tool" && message.tool_call_id === "owned-pending-write");
      assert.equal(results.length, 1);
      assert.equal(results[0].content, "");
      assert.equal(results[0].skipRun, true);
      assert.equal(approvals.length, 1, "loading history must not repeat the interrupted approval");
    }
    if (writtenTurn) {
      assert.equal(await readFile(output, "utf8"), "Owned pending write");
      const after = await stat(output, { bigint: true });
      assert.equal(after.ino, writtenStat.ino);
      assert.equal(after.mtimeNs, writtenStat.mtimeNs);
      assert.equal(after.ctimeNs, writtenStat.ctimeNs);
      const results = requests.at(-1).messages.filter(message => message.role === "tool" && message.tool_call_id === "owned-pending-write");
      assert.deepEqual(results, [writtenResult]);
      const updates = replay.map(event => event.params?.update).filter(update => update?.toolCallId === "owned-pending-write");
      assert.ok(updates.some(update => update.sessionUpdate === "tool_call_update" && update.status === "completed"));
      assert.equal(updates.some(update => update.status === "cancelled"), false);
      assert.ok(JSON.stringify(updates).includes("Successfully created and wrote to new file"));
      assert.equal(approvals.length, 1);
      assert.doesNotMatch(continued, /Owned daemon answer 3/);
    }
    if (hookTurn) {
      assert.equal(await readFile(output, "utf8"), "Owned pending write");
      const after = await stat(output, { bigint: true });
      assert.equal(after.ino, writtenStat.ino);
      assert.equal(after.mtimeNs, writtenStat.mtimeNs);
      assert.equal(after.ctimeNs, writtenStat.ctimeNs);
      assert.equal(hookRequests.length, 1);
      assert.equal(approvals.length, 1);
      const results = requests.at(-1).messages.filter(message => message.role === "tool" && message.tool_call_id === "owned-pending-write");
      const updates = replay.map(event => event.params?.update).filter(update => update?.toolCallId === "owned-pending-write");
      assert.equal(results.length, 1);
      assert.equal(results[0].content, "");
      assert.equal(results[0].skipRun, true);
      assert.ok(updates.some(update => update.status === "cancelled"
        && update._meta?.["codebuddy.ai/toolCancelReason"] === "session_interrupted"));
      assert.equal(updates.some(update => update.status === "completed"), false);
    }
    if (partialTurn) {
      const files = (await readdir(root, { recursive: true })).filter(path => basename(path) === `${session.sessionId}.jsonl`);
      assert.equal(files.length, 1);
      const persisted = await readFile(join(root, files[0]), "utf8");
      // Original abort handling flushes drafts; SIGKILL cannot run that path.
      const retained = mode === "partial-cancel";
      assert.equal(continued.includes(partial), retained, "model history draft retention");
      assert.equal(JSON.stringify(replay).includes(partial), retained, "ACP replay draft retention");
      assert.equal(persisted.includes(partial), retained, "disk history draft retention");
    }
    assert.deepEqual(failures, []);
    await client.close(); client = undefined;
    await command("stop");
    assert.deepEqual(JSON.parse(await command("status")), { status: "stopped" });
    assert.equal(alive(restarted.pid), false);
  } finally {
    releasePending();
    try { await client?.close(); if (options) await command("stop"); }
    finally {
      for (const pid of pids) if (pid > 0 && pid !== process.pid && alive(pid)) process.kill(pid, "SIGKILL");
      model.closeAllConnections(); await new Promise(resolve => model.close(resolve));
      await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
  }
});
