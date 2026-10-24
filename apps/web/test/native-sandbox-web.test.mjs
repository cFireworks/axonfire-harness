import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWebHost } from "../server.mjs";
import { createNativeWebRuntime } from "../native-runtime.mjs";

for (const allow of [false, true]) test(`native Web sandbox approval context and execution: ${allow ? "allow once" : "reject"}`, {
  skip: process.platform !== "darwin" || process.arch !== "arm64", timeout: 45000,
}, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-sandbox-acp-"));
  const file = join(root, "owned.txt"), evidence = "owned-bash-evidence-925";
  const requests = [], approvals = [];
  let web;
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
    web = await createWebHost({
      configured: true, demo: false, createRuntime: createNativeWebRuntime,
      harness: {
        workDir: root,
        nativeSettings: { cliOptions: { settings: JSON.stringify({ sandbox: { enabled: true, filesystem: { denyRead: [file] } } }) } },
        env: { PATH: process.env.PATH, HOME: root, SHELL: "/bin/sh", AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
          AXONFIRE_STATE_DIR: join(root, "state"), DISABLE_TELEMETRY: "1", CODEBUDDY_REMOTE_CONFIG_DISABLED: "true" },
      },
    });
    const url = await web.listen(0);
    const status = await (await fetch(url + "/api/status")).json();
    const post = (path, body) => fetch(url + path, {
      method: "POST", headers: { Origin: url, "content-type": "application/json", "x-axonfire-csrf": status.csrf },
      body: JSON.stringify(body),
    });
    const response = await post("/api/prompt", { prompt: "Read the owned file" });
    assert.equal(response.status, 200);
    const events = [];
    let buffer = "";
    for await (const chunk of response.body.pipeThrough(new TextDecoderStream())) {
      buffer += chunk;
      let index;
      while ((index = buffer.indexOf("\n\n")) >= 0) {
        const packet = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        const type = packet.split("\n").find(line => line.startsWith("event: "))?.slice(7);
        const data = packet.split("\n").find(line => line.startsWith("data: "))?.slice(6);
        if (!data) continue;
        const event = { type, data: JSON.parse(data) };
        events.push(event);
        if (type === "approval") {
          approvals.push(event.data);
          assert.equal(event.data.name, "Bash");
          assert.deepEqual(event.data.context, { sandbox: true, bypass: true, target: await realpath(file) });
          const approved = await post("/api/approve", { id: event.data.id, allow });
          assert.equal(approved.status, 200);
          await approved.text();
        }
      }
    }
    assert.equal(events.at(-1).type, "done", JSON.stringify(events));
    assert.ok(events.some(event => event.type === "delta" && event.data.text === "Owned Bash turn finished."));
    assert.equal(approvals.length, 1);
    assert.equal(requests.length, 2);
    const output = requests[1].messages.find(message => message.role === "tool").content;
    if (allow) {
      assert.ok(output.includes(evidence));
      assert.match(output, /Exit Code: 0/);
      assert.match(output, /Sandbox bypassed \(escalation-approved\)/);
    } else {
      assert.ok(!output.includes(evidence));
      assert.match(output, /SANDBOX EXECUTION REJECTED BY USER/);
      assert.match(output, /Exit Code: 1/);
    }
    assert.equal(await readFile(file, "utf8"), evidence);
  } finally {
    await web?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
