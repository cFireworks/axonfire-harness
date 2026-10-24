import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(new URL("../../../packages/harness/package.json", import.meta.url));
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));

for (const mode of ["reject-trust", "chat", "allow-read", "reject-read"]) test(
  "original interactive CLI via PTY: " + mode, {
  timeout: 60000,
  skip: process.platform === "win32" ? "POSIX PTY fixture; Windows terminal deployment is not verified" : false,
}, async () => {
  const acceptTrust = mode !== "reject-trust";
  const readTool = mode.endsWith("-read");
  const pty = require("@lydell/node-pty");
  const root = await mkdtemp(join(tmpdir(), "axon-native-interactive-"));
  const requests = [], failures = [];
  let terminal, exited, output = "", dataListener, exitListener;
  const first = readTool ? "Read owned.txt" : "Say first interactive evidence";
  const evidence = "interactive-tool-evidence-7829";
  const second = "Say second interactive evidence";
  const server = createServer(async (request, response) => {
    try {
      let body = "";
      for await (const chunk of request) body += chunk;
      requests.push({ path: request.url, body: JSON.parse(body) });
      const turn = requests.length;
      // Real completion IDs differ across turns; the original view deduplicates by message ID.
      const toolTurn = readTool && turn === 1;
      const chunk = {
        id: `owned-interactive-${turn}`, object: "chat.completion.chunk",
        created: turn, model: "owned-model",
        choices: [{ index: 0, delta: toolTurn ? {
          role: "assistant", tool_calls: [{ index: 0, id: "owned-read", type: "function", function: {
            name: "Read", arguments: JSON.stringify({ file_path: join(root, "owned.txt") }),
          } }],
        } : { role: "assistant", content: `Interactive evidence ${turn}.` }, finish_reason: null }],
      };
      response.writeHead(200, { "content-type": "text/event-stream" });
      response.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: toolTurn ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
    } catch (error) {
      failures.push(String(error));
      response.writeHead(500).end();
    }
  });
  async function waitFor(predicate, label) {
    const deadline = Date.now() + 20000;
    while (!predicate()) {
      assert.deepEqual(failures, [], label);
      assert.ok(!exited, `${label}: terminal exited ${JSON.stringify(exited)}; ${output.slice(-4000)}`);
      assert.ok(Date.now() < deadline, `${label}: timeout; ${output.slice(-4000)}`);
      await delay(50);
    }
  }
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    await writeFile(join(root, "owned.txt"), evidence);
    const configPath = join(root, "product.json");
    await writeFile(configPath, JSON.stringify({
      authentication: { type: "custom-token", attributes: { token: "owned-token" } },
      config: { disabled: true },
      agents: [{ name: "owned-agent", tags: ["cli", "default"], instructions: "Test assistant", tools: readTool ? ["Read"] : [], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }],
    }));
    terminal = pty.spawn(process.execPath, [launcher, first], {
      name: "xterm-256color", cols: 110, rows: 32, cwd: root,
      env: {
        PATH: process.env.PATH ?? "", HOME: root, SHELL: "/bin/sh", TERM: "xterm-256color",
        AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: configPath,
        DISABLE_TELEMETRY: "1", CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
      },
    });
    dataListener = terminal.onData(data => {
      output += data;
      if (output.length > 2 * 1024 * 1024) {
        failures.push("interactive output exceeded owned capture limit");
        output = output.slice(-4000);
      }
    });
    exitListener = terminal.onExit(event => { exited = event; });
    await waitFor(() => output.includes("Do you trust the files in this folder?"), "folder trust screen");
    assert.match(output, /Trust folder only/);
    assert.equal(requests.length, 0, "the initial model turn must wait for folder trust");
    await delay(200); // Let the original React input effects attach after the first frame.
    if (!acceptTrust) {
      terminal.write("\x1b");
      await waitFor(() => exited !== undefined, "reject folder trust");
      assert.equal(requests.length, 0);
      assert.equal(exited.exitCode, 0);
      assert.equal(exited.signal, 0);
      return;
    }
    terminal.write("\r");
    if (readTool) {
      await waitFor(() => output.includes("Do you want to proceed?"), "Read permission dialog");
      assert.equal(requests.length, 1, "model continuation waits for an individual approval");
      assert.match(output, /Read file/);
      await delay(200);
      terminal.write(mode === "allow-read" ? "\r" : "\x1b");
      if (mode === "reject-read") {
        await waitFor(() => output.includes("No (tell CodeBuddy what to do differently)"), "rendered Read rejection");
        await delay(300);
        assert.equal(requests.length, 1, "the original terminal returns control to the user after rejection");
        terminal.write(second);
        await waitFor(() => output.includes(second), "follow-up after rejection");
        terminal.write("\r");
      }
    } else {
      await waitFor(() => output.includes("Interactive evidence 1."), "first rendered answer");
      assert.equal(requests.length, 1);
      terminal.write(second);
      await waitFor(() => output.includes(second), "typed second prompt");
      terminal.write("\r");
    }
    await waitFor(() => output.includes("Interactive evidence 2."), "second rendered answer");
    assert.equal(requests.length, 2);
    assert.deepEqual(failures, []);
    for (const request of requests) {
      assert.equal(request.path, "/v1");
      assert.equal(request.body.stream, true);
    }
    const history = requests[1].body.messages;
    assert.ok(history.some(message => message.role === "user" && JSON.stringify(message.content).includes(first)));
    if (readTool) {
      const result = history.find(message => message.role === "tool" && message.tool_call_id === "owned-read");
      assert.ok(result, "the actual Read result must reach the next model request");
      if (mode === "allow-read") assert.ok(result.content.includes(evidence), result.content);
      else {
        assert.match(result.content, /rejected|denied/i);
        assert.ok(!result.content.includes(evidence));
      }
    } else {
      assert.ok(history.some(message => message.role === "assistant" && JSON.stringify(message.content).includes("Interactive evidence 1.")));
      assert.ok(history.some(message => message.role === "user" && JSON.stringify(message.content).includes(second)));
    }
    await delay(500); // The streamed answer may render before the session returns to idle.
    for (let attempt = 0; attempt < 4 && !exited; attempt++) {
      terminal.write("\x03");
      await delay(150);
    }
    await waitFor(() => exited !== undefined, "keyboard exit");
    assert.equal(exited.exitCode, 0);
    assert.equal(exited.signal, 0);
  } finally {
    if (terminal && !exited) {
      terminal.kill();
      for (let i = 0; i < 40 && !exited; i++) await delay(50);
      if (!exited) {
        terminal.kill("SIGKILL");
        for (let i = 0; i < 40 && !exited; i++) await delay(50);
      }
    }
    dataListener?.dispose();
    exitListener?.dispose();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});
