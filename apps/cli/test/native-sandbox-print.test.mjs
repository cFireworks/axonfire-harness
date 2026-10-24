import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

test("non-interactive native CLI settles sandbox escalation through the original timeout", {
  skip: process.platform !== "darwin" || process.arch !== "arm64", timeout: 45000,
}, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-sandbox-acp-"));
  const file = join(root, "owned.txt"), evidence = "owned-bash-evidence-925";
  const requests = [];
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    requests.push(JSON.parse(body));
    const toolTurn = requests.length === 1;
    const delta = toolTurn ? {
      role: "assistant", tool_calls: [{ index: 0, id: "owned-bash", type: "function", function: {
        name: "Bash", arguments: JSON.stringify({ command: `/bin/cat '${file}'`, description: "Read owned test file", timeout: 5000 }),
      } }],
    } : { role: "assistant", content: "Owned Bash turn finished." };
    const chunk = { id: "owned", object: "chat.completion.chunk", created: 1, model: "owned-model", choices: [{ index: 0, delta, finish_reason: null }] };
    res.writeHead(200, { "content-type": "text/event-stream" });
    res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: toolTurn ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
  });
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    await writeFile(file, evidence);
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({
      authentication: { type: "custom-token", attributes: { token: "owned" } },
      config: { disabled: true },
      agents: [{ name: "owned", tags: ["cli", "default"], instructions: "Test assistant", tools: ["Bash"], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }],
    }));
    const result = await promisify(execFile)(process.execPath, [
      fileURLToPath(new URL("../axonfire.mjs", import.meta.url)),
      "-p", "Read the owned file", "--allowedTools", "Bash",
      "--settings", JSON.stringify({ sandbox: { enabled: true, filesystem: { denyRead: [file] } } }),
    ], {
      cwd: root, timeout: 30000, maxBuffer: 1024 * 1024,
      env: { PATH: process.env.PATH, HOME: root, SHELL: "/bin/sh", AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
        AXONFIRE_STATE_DIR: join(root, "state"), DISABLE_TELEMETRY: "1", CODEBUDDY_REMOTE_CONFIG_DISABLED: "true" },
    });
    // A signal-induced exit can also return code zero; require the actual final turn.
    assert.match(result.stdout, /Owned Bash turn finished/);
    assert.equal(requests.length, 2);
    const output = requests[1].messages.find(message => message.role === "tool").content;
    assert.ok(!output.includes(evidence));
    assert.match(output, /SANDBOX EXECUTION REJECTED BY USER/);
    assert.match(output, /Exit Code: 1/);
    assert.equal(await readFile(file, "utf8"), evidence);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
