import { createNativeSessionReplayTransport } from "../../../packages/harness/dist/src/sessions/native-session-replay-transport.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createNativeSidecar } from "../../../packages/harness/dist/src/terminal/native-sidecar.js";
import { createNativeSidecarManager } from "../../../packages/harness/dist/src/terminal/native-sidecar-manager.js";
import { createNativeSidecarEnvironment } from "../../../packages/harness/dist/src/terminal/native-sidecar-environment.js";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";

test(
  "original sidecar manager reconnects and launches real CLI, accept native readiness and execute ACP prompt",
  { skip: process.platform === "win32", timeout: 45000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "axon-sidecar-cli-"));
    const requests = [];
    const gateway = createNativeSessionReplayTransport();
    const model = createServer(async (req, res) => {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(
        "data: " +
          JSON.stringify({
            id: "owned",
            object: "chat.completion.chunk",
            created: 1,
            model: "owned-model",
            choices: [
              {
                index: 0,
                delta: {
                  role: "assistant",
                  content: "Owned sidecar CLI answer",
                },
                finish_reason: "stop",
              },
            ],
          }) +
          "\n\ndata: [DONE]\n\n",
      );
    });
    await new Promise((r) => model.listen(0, "127.0.0.1", r));
    const product = join(root, "product.json");
    await writeFile(
      product,
      JSON.stringify({
        authentication: {
          type: "custom-token",
          attributes: { token: "owned-token" },
        },
        config: { disabled: true },
        agents: [
          {
            name: "owned-agent",
            tags: ["cli", "default"],
            instructions: "Owned base",
            tools: ["Read"],
            models: ["owned-model"],
          },
        ],
        models: [
          {
            id: "owned-model",
            name: "owned-model",
            url: `http://127.0.0.1:${model.address().port}/v1`,
          },
        ],
      }),
    );
    const scopedProcess = Object.create(process);
    scopedProcess.env = { ...process.env, WORKBUDDY_CONFIG_DIR: root };
    const environment = createNativeSidecarEnvironment({
      process: scopedProcess,
    });
    const logs = [];
    const logger = {
      log: (...v) => logs.push(v),
      error: (...v) => logs.push(v),
      info: (...v) => logs.push(v),
      warn: (...v) => logs.push(v),
    };
    const { SidecarServer } = createNativeSidecar({
      environment,
      console: logger,
    });
    const { SidecarManager } = createNativeSidecarManager({
      environment,
      console: logger,
    });
    const server = new SidecarServer("owned-instance"),
      client = new SidecarManager();
    let acp, created;
    try {
      await server.start();
      await client.ensureStarted();
      // The managed environment is the only source for blocked product variables.
      const pending = client.createSession({
        sessionId: "owned-cli",
        command: process.execPath,
        args: [
          fileURLToPath(new URL("../../cli/native.mjs", import.meta.url)),
          "--serve",
        ],
        cwd: root,
        port: 0,
        env: {
          ...nativeFixtureEnv,
          ...gateway.gatewaySecretEnv(),
          ELECTRON_RUN_AS_NODE: "1",
          HOME: root,
          SHELL: "/bin/sh",
          WORKBUDDY_CONFIG_DIR: root,
          CODEBUDDY_CONFIG_DIR: root,
          AXONFIRE_STATE_DIR: join(root, "state"),
          AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
        },
      });
      // Bound the fixture independently without shortening the original create RPC budget.
      let timer;
      try {
        created = await Promise.race([
          pending,
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(new Error("CLI sidecar readiness timed out")),
              20000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      const origin = new URL(created.acpEndpoint).origin;
      assert.equal(
        (
          await fetch(origin + "/api/v1/health", {
            headers: {
              "X-CodeBuddy-Request": "1",
              ...gateway.gatewaySecretHeaders(),
            },
          })
        ).status,
        200,
      );
      const notices = [];
      acp = await connectNativeAcp(origin, {
        onNotification: (value) => notices.push(value),
      });
      const session = await acp.request("session/new", {
        cwd: root,
        mcpServers: [],
      });
      const response = await acp.request("session/prompt", {
        sessionId: session.sessionId,
        prompt: [{ type: "text", text: "Reply with the owned answer" }],
      });
      assert.equal(response.stopReason, "end_turn");
      assert.equal(requests.length, 1);
      assert.match(JSON.stringify(notices), /Owned sidecar CLI answer/);
      assert.equal((await client.listSessions())[0].pid, created.pid);
      await acp.close();
      acp = undefined;
      await client.killSession("owned-cli");
      for (let i = 0; i < 150; i++) {
        let alive = true;
        try {
          process.kill(created.pid, 0);
        } catch {
          alive = false;
        }
        if (!alive) break;
        await new Promise((r) => setTimeout(r, 20));
      }
      assert.throws(() => process.kill(created.pid, 0));
      assert.deepEqual(await client.listSessions(), []);
      await client.resetHostRuntime();
      assert.equal(client.client, null);
      await client.ensureStarted();
      assert.deepEqual(await client.listSessions(), []);
    } catch (error) {
      // Fixture logs are owned; retain bounded diagnostics without dumping inherited environment.
      error.message +=
        "\nSidecar diagnostics: " + JSON.stringify(logs).slice(-6000);
      throw error;
    } finally {
      await acp?.close();
      client.client?.dispose();
      await server.shutdown();
      model.closeAllConnections();
      await new Promise((r) => model.close(r));
      await rm(environment.sidecarRuntimeDir(), {
        recursive: true,
        force: true,
      });
      await rm(root, { recursive: true, force: true });
    }
  },
);
