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

const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));

const execute = promisify(execFile);
const answer = "Owned UTF-8 output 中文 🧪\n".repeat(4096) + "OWNED_OUTPUT_END";

test("default CLI preserves large UTF-8 text, JSON and stream-json through stdout pipes", { timeout: 60000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-native-output-"));
  const requests = [], failures = [];
  const server = createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      const chunk = { id: `owned-${requests.length}`, object: "chat.completion.chunk", created: 1, model: "owned-model",
        choices: [{ index: 0, delta: { role: "assistant", content: answer }, finish_reason: null }] };
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`);
    } catch (error) { failures.push(String(error)); res.writeHead(500).end(); }
  });
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({
      authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
      agents: [{ name: "owned-agent", tags: ["cli", "default"], instructions: "Test assistant", tools: [], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }],
    }));
    const env = { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config };
    for (const format of ["text", "json", "stream-json"]) {
      const { stdout } = await execute(process.execPath, [launcher, "-p", "Return the owned output", "--output-format", format],
        { cwd: root, env, timeout: 20000, maxBuffer: 4 * 1024 * 1024 });
      assert.deepEqual(failures, []);
      if (format === "text") assert.equal(stdout.trimEnd(), answer);
      else if (format === "json") {
        const history = JSON.parse(stdout);
        assert.ok(Array.isArray(history));
        assert.ok(history.some(item => item.role === "assistant" && JSON.stringify(item).includes("OWNED_OUTPUT_END")));
        assert.ok(JSON.stringify(history).includes(JSON.stringify(answer).slice(1, -1)));
      } else {
        const events = stdout.trim().split("\n").map(line => JSON.parse(line));
        assert.ok(events.some(event => event.type === "system" && event.subtype === "init"));
        assert.ok(events.some(event => event.type === "result" && event.subtype === "success"));
        assert.ok(JSON.stringify(events).includes(JSON.stringify(answer).slice(1, -1)));
      }
    }
    assert.equal(requests.length, 3);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
