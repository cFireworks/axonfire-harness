import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startNativeProductProcess } from "../native-process.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";

for (const allow of [false, true]) test(`native Bash sandbox escalation through ACP: ${allow ? "allow once" : "reject"}`, {
  skip: process.platform !== "darwin" || process.arch !== "arm64", timeout: 45000,
}, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-sandbox-acp-"));
  const file = join(root, "owned.txt"), evidence = "owned-bash-evidence-925";
  const requests = [], approvals = [];
  let native, client;
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
    native = await startNativeProductProcess({
      cwd: root,
      args: ["--settings", JSON.stringify({ sandbox: { enabled: true, filesystem: { denyRead: [file] } } })],
      env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
        AXONFIRE_STATE_DIR: join(root, "state"),   },
    });
    client = await connectNativeAcp(native.origin, {
      async onRequest(method, params) {
        assert.equal(method, "session/request_permission");
        approvals.push(params);
        const meta = params.toolCall._meta;
        assert.equal(meta["codebuddy.ai/toolName"], "Bash");
        assert.equal(meta["codebuddy.ai/sandboxIntercept"], true);
        assert.equal(meta["codebuddy.ai/sandboxApprovalMode"], "post-exec");
        assert.equal(meta["codebuddy.ai/target"], await realpath(file));
        const selected = params.options.find(option => option.kind === (allow ? "allow_once" : "reject_once"));
        assert.ok(selected);
        return { outcome: { outcome: "selected", optionId: selected.optionId } };
      },
    });
    const session = await client.request("session/new", { cwd: root, mcpServers: [] });
    const result = await client.request("session/prompt", { sessionId: session.sessionId, prompt: [{ type: "text", text: "Read the owned file" }] });
    assert.equal(result.stopReason, "end_turn");
    assert.equal(approvals.length, 1);
    assert.equal(requests.length, 2);
    const output = requests[1].messages.find(message => message.role === "tool").content;
    if (allow) {
      assert.ok(output.includes(evidence));
      assert.match(output, /Exit Code: 0/);
      assert.match(output, /Sandbox bypassed \(escalation-approved\)/);
      assert.equal(result._meta["codebuddy.ai/outcome"], "SUCCESS");
    } else {
      assert.ok(!output.includes(evidence));
      assert.match(output, /SANDBOX EXECUTION REJECTED BY USER/);
      assert.match(output, /Exit Code: 1/);
      assert.equal(result._meta["codebuddy.ai/outcome"], "PARTIAL_SUCCESS");
    }
    assert.equal(await readFile(file, "utf8"), evidence);
  } finally {
    await client?.close().catch(() => {});
    await native?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
