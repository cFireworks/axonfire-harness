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

test("default CLI resumes, continues and forks persisted sessions across processes", { timeout: 90000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-native-resume-"));
  const requests = [], failures = [];
  const server = createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      const chunk = { id: `owned-${requests.length}`, object: "chat.completion.chunk", created: 1, model: "owned-model",
        choices: [{ index: 0, delta: { role: "assistant", content: `Owned answer ${requests.length}.` }, finish_reason: null }] };
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
    async function turn(prompt, ...args) {
      const { stdout } = await execute(process.execPath, [launcher, "-p", prompt, "--output-format", "stream-json", ...args],
        { cwd: root, env, timeout: 20000, maxBuffer: 2 * 1024 * 1024 });
      assert.deepEqual(failures, []);
      const events = stdout.trim().split("\n").map(line => JSON.parse(line));
      const init = events.find(event => event.type === "system" && event.subtype === "init");
      assert.ok(init?.session_id, JSON.stringify(events).slice(-1500));
      assert.ok(events.some(event => event.type === "result"), JSON.stringify(events).slice(-1500));
      return { ...init, observedSessions: events.filter(event => event.session_id).map(event => ({ type: event.type, subtype: event.subtype, id: event.session_id })) };
    }
    const first = await turn("Owned initial question", "--session-id", "owned-resume-session");
    assert.equal(first.session_id, "owned-resume-session");
    const resumed = await turn("Owned resumed question", "--resume", first.session_id);
    assert.equal(resumed.session_id, first.session_id);
    assert.match(JSON.stringify(requests[1].messages), /Owned initial question/);
    assert.match(JSON.stringify(requests[1].messages), /Owned answer 1/);
    const continued = await turn("Owned continued question", "--continue");
    assert.equal(continued.session_id, first.session_id);
    assert.match(JSON.stringify(requests[2].messages), /Owned resumed question/);
    const forked = await turn("Owned fork-only question", "--resume", first.session_id, "--fork-session");
    assert.ok(forked.session_id);
    assert.notEqual(forked.session_id, first.session_id);
    assert.match(JSON.stringify(requests[3].messages), /Owned continued question/);
    const original = await turn("Owned original-only question", "--resume", first.session_id);
    assert.equal(original.session_id, first.session_id);
    assert.doesNotMatch(JSON.stringify(requests[4].messages), /Owned fork-only question|Owned answer 4/);
    assert.match(JSON.stringify(requests[4].messages), /Owned continued question/);
    const restoredFork = await turn("Owned restored fork question", "--resume", forked.session_id);
    // Original Store chooses the first embedded logical session ID, retaining the
    // fork filename as storeId. Preserve that alias while checking history isolation.
    assert.equal(restoredFork.session_id, first.session_id, JSON.stringify(restoredFork.observedSessions));
    assert.match(JSON.stringify(requests[5].messages), /Owned fork-only question/);
    assert.match(JSON.stringify(requests[5].messages), /Owned answer 4/);
    assert.doesNotMatch(JSON.stringify(requests[5].messages), /Owned original-only question|Owned answer 5/);
    await turn("Owned original after fork restore", "--resume", first.session_id);
    assert.doesNotMatch(JSON.stringify(requests[6].messages), /Owned restored fork question|Owned answer 6|Owned fork-only question/);
    assert.match(JSON.stringify(requests[6].messages), /Owned original-only question/);
    assert.equal(requests.length, 7);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
