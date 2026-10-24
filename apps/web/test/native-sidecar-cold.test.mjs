import { createNativeAppServerStop } from "../../../packages/harness/dist/src/sessions/native-app-server-stop.js";
import { createNativeSessionReplayTransport } from "../../../packages/harness/dist/src/sessions/native-session-replay-transport.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createNativeSidecarManager } from "../../../packages/harness/dist/src/terminal/native-sidecar-manager.js";
import { createNativeSidecarEnvironment } from "../../../packages/harness/dist/src/terminal/native-sidecar-environment.js";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";

test(
  "original AppServer stop handles manager close race after real daemon cold start",
  { skip: process.platform === "win32", timeout: 60000 },
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
    scopedProcess.env = {
      ...process.env,
      ...nativeFixtureEnv,
      WORKBUDDY_CONFIG_DIR: root,
      ACC_PRODUCT_CONFIG_PATH: product,
      CLIENT_INFO_MACHINE_ID: "owned-host-machine",
    };
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
    const { SidecarManager, getHostedCliCwd, bindSidecarCrashWatcher } =
      createNativeSidecarManager({
        process: scopedProcess,
        gateway,
        environment,
        console: logger,
      });
    let daemon, daemonExit;
    bindSidecarCrashWatcher((child) => {
      daemon = child;
      daemonExit = new Promise((resolve) => child.once("exit", resolve));
    });
    const client = new SidecarManager({
      getRuntimeAppVersion: () => "owned",
      getRuntimeAppPath: () => root,
      getRuntimeConfigDir: () => root,
      getRuntimeUserDataDir: () => join(root, "app"),
      resolveBundledAsset: (...parts) =>
        parts[0] === "cli"
          ? fileURLToPath(new URL("../../cli/native.mjs", import.meta.url))
          : undefined,
      resolveProxyEnv: async () => ({}),
      getAgentExtraEnv: () => ({
        ...nativeFixtureEnv,
        HOME: root,
        SHELL: "/bin/sh",
        AXONFIRE_STATE_DIR: join(root, "state"),
        AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
      }),
    });
    const runtimeDirs = new Set();
    let acp, created;
    try {
      await assert.rejects(stat(environment.pidFilePath()), { code: "ENOENT" });
      await client.ensureStarted();
      assert.ok(daemon?.pid);
      const [origin, joined] = await Promise.all([
        client.getHostEndpoint(),
        client.getHostEndpoint(),
      ]);
      assert.equal(origin, joined);
      created = { pid: client.hostRuntimePid, sessionId: client.hostSessionId };
      runtimeDirs.add(getHostedCliCwd(created.sessionId));
      const changes = [];
      client.onHostEndpointChanged((endpoint) => changes.push(endpoint));
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
      await client.rotateHostRuntime("owned-config-change");
      const nextOrigin = await client.getHostEndpoint();
      assert.notEqual(nextOrigin, origin);
      assert.notEqual(client.hostRuntimePid, created.pid);
      runtimeDirs.add(getHostedCliCwd(client.hostSessionId));
      assert.deepEqual(changes, [nextOrigin]);
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
      assert.equal((await client.listSessions()).length, 1);
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
      if (client.client?.isConnected)
        for (const item of await client.listSessions().catch(() => []))
          runtimeDirs.add(getHostedCliCwd(item.sessionId));
      let cleanupFailure;
      try {
        const order = [];
        const lifecycle = createNativeAppServerStop({
          pluginRecommendationRegistry: {
            cancelAll: (reason) => {
              assert.equal(reason, "daemon stopped");
              order.push("cancel");
            },
          },
          sessionRuntimeHandleRef: {
            current: { stop: () => order.push("runtime") },
          },
          sessionEventsHandle: { dispose: () => order.push("events") },
          powerManager: { cleanup: () => order.push("power") },
          appServerServices: {
            docsService: { dispose: async () => order.push("docs") },
          },
          bootstrapInstance: {
            handlerDeps: {
              hostServices: Promise.resolve({
                memory: { dispose: async () => order.push("memory") },
              }),
            },
            stop: async () => order.push("bootstrap"),
          },
          runtimeManager: client,
          cliPrewarmPool: { stop: async () => order.push("pool") },
        });
        await lifecycle.stop();
        assert.deepEqual(order, [
          "cancel",
          "runtime",
          "events",
          "power",
          "docs",
          "memory",
          "bootstrap",
          "pool",
        ]);
        if (daemon) {
          const timer = setTimeout(() => daemon.kill("SIGKILL"), 3000);
          try {
            await daemonExit;
          } finally {
            clearTimeout(timer);
          }
          assert.equal(daemon.exitCode, 0);
          assert.throws(() => process.kill(daemon.pid, 0), { code: "ESRCH" });
        }
        await assert.rejects(stat(environment.controlSocketPath()), {
          code: "ENOENT",
        });
        await assert.rejects(stat(environment.pidFilePath()), {
          code: "ENOENT",
        });
      } catch (error) {
        cleanupFailure = error;
      }
      for (const dir of runtimeDirs)
        await rm(dir, { recursive: true, force: true });
      model.closeAllConnections();
      await new Promise((r) => model.close(r));
      await rm(environment.sidecarRuntimeDir(), {
        recursive: true,
        force: true,
      });
      await rm(root, { recursive: true, force: true });
      if (cleanupFailure) throw cleanupFailure;
    }
  },
);
