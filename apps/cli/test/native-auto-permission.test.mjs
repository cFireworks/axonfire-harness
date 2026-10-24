import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { once } from "node:events";
import { StringDecoder } from "node:string_decoder";
import { mkdtemp, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const mode of ["fast-allow", "review-allow", "deny", "unparseable", "write-bypass", "plain-print-deny", "stage1-error", "stage2-error", "circuit-open"]) test(`default CLI original Auto classifier: ${mode}`, { timeout: 45000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-native-auto-"));
  const target = join(root, "owned.txt"), content = "Owned Auto permission evidence 7142";
  const requests = [], failures = [];
  const circuitMode = mode === "circuit-open";
  const approvals = [];
  const failureMode = mode === "stage1-error" || mode === "stage2-error";
  const toolName = mode === "write-bypass" ? "Write" : "Bash";
  let mainTurns = 0, classifierTurns = 0, child, exited, exitResult;
  const server = createServer(async (req, res) => {
    try {
      let raw = ""; for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw); requests.push(body);
      const classify = body.model === "owned-classifier";
      let tool, answer;
      if (classify) {
        classifierTurns++;
        if (circuitMode || failureMode && mainTurns === 1 && classifierTurns === (mode === "stage1-error" ? 1 : 2)) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: { message: `Owned ${mode} failure`, type: "invalid_request_error", code: "owned_classifier_error" } }));
          return;
        }
        answer = failureMode && mainTurns > 1 || mode === "fast-allow" || classifierTurns === 2 && mode === "review-allow"
          ? "<block>no</block><reason>Owned classifier approval</reason>"
          : classifierTurns === 2 && mode === "unparseable" ? "Owned unparseable classifier response"
          : "<block>yes</block><reason>Owned classifier denial</reason>";
      } else {
        mainTurns++;
        if (mainTurns === 1 || failureMode && mainTurns === 3 || circuitMode && mainTurns % 2 === 1) tool = { name: toolName, arguments: JSON.stringify(toolName === "Write" ? { file_path: target, content } : { command: `printf '%s' '${content}' > '${target}'` }) };
        else answer = "Owned Auto turn completed.";
      }
      const message = tool ? { role: "assistant", tool_calls: [{ id: `owned-write-${mainTurns}`, type: "function", function: tool }] } : { role: "assistant", content: answer };
      const base = { id: `owned-${requests.length}`, created: 1, model: body.model };
      if (body.stream) {
        const delta = tool ? { ...message, tool_calls: message.tool_calls.map(call => ({ ...call, index: 0 })) } : message;
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(`data: ${JSON.stringify({ ...base, object: "chat.completion.chunk", choices: [{ index: 0, delta, finish_reason: null }] })}\n\ndata: ${JSON.stringify({ ...base, object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: tool ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
      } else {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ...base, object: "chat.completion", choices: [{ index: 0, message, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } }));
      }
    } catch (error) { failures.push(String(error)); res.writeHead(500).end(); }
  });
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({ authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true }, agents: [
      { name: "owned-main", tags: ["cli", "default"], instructions: "Execute the requested owned shell command.", tools: [toolName], models: ["owned-main"] },
      { name: "autoModeClassifier", tags: ["cli", "auto-mode-classifier"], instructions: "auto-mode-classifier-instructions", tools: [], models: ["owned-classifier"] },
    ], models: ["owned-main", "owned-classifier"].map(id => ({ id, name: id, url: `http://127.0.0.1:${server.address().port}/v1` })) }));
    if (mode === "plain-print-deny") {
      const result = await promisify(execFile)(process.execPath, [launcher, "-p", "Write owned evidence with Bash.", "--permission-mode", "auto"], {
        cwd: root, timeout: 30000, maxBuffer: 2 * 1024 * 1024,
        env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config },
      });
      assert.match(result.stdout, /Owned Auto turn completed/);
    } else {
      child = spawn(process.execPath, [launcher, "-p", "--permission-mode", "auto", "--input-format", "stream-json", "--output-format", "stream-json"], {
        cwd: root, stdio: ["pipe", "pipe", "pipe"],
        env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config },
      });
      exited = once(child, "exit").then(result => { exitResult = result; return result; });
      const events = [], decoder = new StringDecoder("utf8");
      let pending = "", stderr = "";
      child.stderr.on("data", chunk => { stderr = (stderr + chunk).slice(-4096); });
      child.stdin.on("error", error => failures.push(String(error)));
      const send = event => child.stdin.write(JSON.stringify(event) + "\n");
      child.stdout.on("data", chunk => {
        pending += decoder.write(chunk);
        let end;
        while ((end = pending.indexOf("\n")) !== -1) {
          const line = pending.slice(0, end); pending = pending.slice(end + 1);
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line); events.push(event);
            if (event.type === "control_request") {
              approvals.push(event);
              if (!circuitMode || classifierTurns !== 3 || mainTurns !== 7 || event.request?.subtype !== "can_use_tool") failures.push(`Unexpected approval request: ${event.request?.subtype}`);
              send({ type: "control_response", response: { subtype: "success", request_id: event.request_id, response: { allowed: false } } });
            }
          } catch (error) { failures.push(String(error)); }
        }
      });
      async function waitFor(predicate) {
        const deadline = Date.now() + 25000;
        while (!predicate()) {
          assert.deepEqual(failures, []);
          assert.ok(!exitResult && Date.now() < deadline, JSON.stringify({ exitResult, stderr, models: requests.map(r => r.model), events: events.map(e => e.type) }));
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }
      send({ type: "control_request", request_id: "owned-init", request: { subtype: "initialize", hasPrompt: true } });
      await waitFor(() => events.some(e => e.type === "control_response" && e.response?.request_id === "owned-init"));
      send({ type: "user", message: { role: "user", content: "Write the owned evidence file using the shell." } });
      await waitFor(() => events.some(e => e.type === "result"));
      assert.match(JSON.stringify(events), /Owned Auto turn completed/);
      if (circuitMode) {
        for (let turn = 1; turn <= 4; turn++) {
          if (turn > 1) {
            send({ type: "user", message: { role: "user", content: `Owned circuit action ${turn}` } });
            await waitFor(() => events.filter(e => e.type === "result").length === turn);
          }
          assert.equal(mainTurns, turn * 2);
          assert.equal(classifierTurns, Math.min(turn, 3));
          assert.equal(approvals.length, turn === 4 ? 1 : 0);
          await assert.rejects(readFile(target), { code: "ENOENT" });
          const toolResult = requests.at(-1).messages.filter(m => m.role === "tool").at(-1);
          assert.ok(toolResult);
          if (turn < 4) assert.match(toolResult.content, /Classifier unavailable - blocking for safety/);
          else assert.match(toolResult.content, /denied|rejected/i);
        }
        assert.equal(approvals[0].request.tool_name, "Bash");
        const ids = events.filter(e => e.type === "result").map(e => e.session_id);
        assert.equal(new Set(ids).size, 1);
      }
      if (failureMode) {
        assert.equal(mainTurns, 2);
        assert.equal(classifierTurns, mode === "stage1-error" ? 1 : 2);
        await assert.rejects(readFile(target), { code: "ENOENT" });
        const denied = requests.at(-1).messages.find(m => m.role === "tool" && m.tool_call_id === "owned-write-1");
        assert.ok(denied);
        assert.match(denied.content, mode === "stage1-error" ? /Classifier unavailable - blocking for safety/ : /Stage 2 classifier error - blocking based on stage 1 assessment/);
        const errorFiles = (await readdir(root, { recursive: true })).filter(path => path.includes("auto-mode-classifier-errors/") && path.endsWith(".txt"));
        assert.equal(errorFiles.length, 1);
        const errorLog = await readFile(join(root, errorFiles[0]), "utf8");
        assert.ok(errorLog.includes(mode === "stage1-error" ? "stage1" : "stage2"));
        assert.ok(errorLog.includes(target));
        send({ type: "user", message: { role: "user", content: "Retry the owned action after classifier recovery." } });
        await waitFor(() => events.filter(e => e.type === "result").length === 2);
        assert.equal(mainTurns, 4);
        assert.equal(classifierTurns, mode === "stage1-error" ? 2 : 3);
        assert.equal(await readFile(target, "utf8"), content);
        const results = events.filter(e => e.type === "result");
        assert.equal(results[0].session_id, results[1].session_id);
      }
      child.stdin.end();
      const timer = setTimeout(() => child.kill("SIGKILL"), 5000);
      try { assert.deepEqual(await exited, [0, null]); } finally { clearTimeout(timer); }
    }
    assert.equal(mainTurns, circuitMode ? 8 : failureMode ? 4 : 2);
    assert.equal(classifierTurns, circuitMode ? 3 : failureMode ? (mode === "stage1-error" ? 2 : 3) : ["write-bypass", "plain-print-deny"].includes(mode) ? 0 : mode === "fast-allow" ? 1 : 2, JSON.stringify(requests.map(r => ({ model: r.model, tools: r.tools?.map(t => t.function?.name), result: r.messages?.filter(m => m.role === "tool") }))));
    const classifierRequests = requests.filter(r => r.model === "owned-classifier");
    for (const request of classifierRequests) {
      const messages = JSON.stringify(request.messages);
      assert.ok(messages.includes(target));
      assert.ok(messages.includes(content));
      assert.equal(request.temperature, 0);
    }
    const toolResult = requests.at(-1).messages.filter(m => m.role === "tool" && m.tool_call_id === `owned-write-${mainTurns - 1}`).at(-1);
    assert.ok(toolResult);
    if (failureMode || mode.endsWith("allow") || mode === "write-bypass") {
      assert.equal(await readFile(target, "utf8"), content);
      assert.doesNotMatch(toolResult.content, /denied by.*classifier/i);
    } else {
      await assert.rejects(readFile(target), { code: "ENOENT" });
      if (circuitMode) assert.match(toolResult.content, /denied|rejected/i);
      else if (mode === "plain-print-deny") assert.match(toolResult.content, /permission prompts are not available in non-interactive mode/);
      else {
        assert.match(toolResult.content, /denied by.*auto mode classifier/i);
        assert.match(toolResult.content, mode === "deny" ? /Owned classifier denial/ : /unparseable stage 2 output/);
      }
    }
    assert.deepEqual(failures, []);
  } finally {
    if (child && !exitResult) { child.kill("SIGKILL"); await exited; }
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
