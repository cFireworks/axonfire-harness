import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const execute = promisify(execFile);
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const mode of ["complete", "terminate"]) test(`default CLI background fork: ${mode}`, { timeout: 60000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-native-bg-"));
  const requests = [], failures = [];
  let pid, release, launchOutput = "";
  const gate = new Promise(resolve => { release = resolve; });
  const server = createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      const turn = requests.length;
      if (turn === 1) await gate;
      if (res.destroyed) return;
      const chunk = { id: `owned-${turn}`, object: "chat.completion.chunk", created: 1, model: "owned-model",
        choices: [{ index: 0, delta: { role: "assistant", content: `Owned background answer ${turn}.` }, finish_reason: null }] };
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`);
    } catch (error) { failures.push(String(error)); res.writeHead(500).end(); }
  });
  const alive = () => { if (!pid) return false; try { process.kill(pid, 0); return true; } catch (error) { if (error.code === "ESRCH") return false; throw error; } };
  async function waitFor(predicate) {
    const deadline = Date.now() + 20000;
    while (!await predicate()) {
      assert.deepEqual(failures, []);
      assert.ok(Date.now() < deadline, JSON.stringify({ pid, requests: requests.length, launchOutput }));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({ authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
      agents: [{ name: "owned-agent", tags: ["cli", "default"], instructions: "Test assistant", tools: [], models: ["owned-model"] }],
      models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }] }));
    const env = { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config };
    const options = { cwd: root, env, timeout: 20000, maxBuffer: 2 * 1024 * 1024 };
    try {
      launchOutput = (await execute(process.execPath, [launcher, "--bg", "--name", "owned-background", "--session-id", "owned-bg-session", "Owned background question"], options)).stdout;
    } catch (error) { launchOutput = error.stdout ?? ""; throw error; }
    finally { const match = launchOutput.match(/PID:\s+(\d+)/); if (match) pid = Number(match[1]); }
    assert.ok(Number.isInteger(pid) && pid > 0 && pid !== process.pid, launchOutput);
    const log = launchOutput.match(/Log:\s+([^\r\n]+)/)?.[1].trim();
    assert.ok(log, launchOutput);
    const within = relative(root, log);
    assert.ok(!within.startsWith("..") && !isAbsolute(within), log);
    await waitFor(() => requests.length === 1);
    assert.ok(alive());
    const listing = await execute(process.execPath, [launcher, "ps", "--json"], options);
    const registered = JSON.parse(listing.stdout).find(session => session.pid === pid);
    assert.equal(registered?.name, "owned-background", listing.stdout);
    assert.equal(registered.kind, "bg");
    if (mode === "terminate") {
      const stopped = await execute(process.execPath, [launcher, "kill", String(pid)], options);
      assert.match(stopped.stdout, /Session terminated/);
      assert.doesNotMatch(stopped.stdout, /forcing/);
      await waitFor(() => !alive());
      assert.equal(requests.length, 1);
      return;
    }
    const snapshot = await readFile(log, "utf8");
    assert.ok(snapshot.length > 0);
    const logs = await execute(process.execPath, [launcher, "logs", String(pid)], options);
    assert.ok(logs.stdout.includes(snapshot), "logs command must return the registered child's log prefix");
    release();
    await waitFor(() => !alive());
    assert.match(await readFile(log, "utf8"), /Owned background answer 1/);
    const resumed = await execute(process.execPath, [launcher, "-p", "Owned resumed background question", "--resume", "owned-bg-session"], options);
    assert.match(resumed.stdout, /Owned background answer 2/);
    assert.equal(requests.length, 2);
    assert.match(JSON.stringify(requests[1].messages), /Owned background question/);
    assert.match(JSON.stringify(requests[1].messages), /Owned background answer 1/);
    assert.deepEqual(failures, []);
  } finally {
    release();
    try {
      if (alive()) {
        process.kill(pid, "SIGKILL");
        const deadline = Date.now() + 5000;
        while (alive() && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
        assert.equal(alive(), false, "owned background process must exit during failed-test cleanup");
      }
    } finally {
      server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
      await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
  }
});
