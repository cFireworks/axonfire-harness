import { createDesktopAccountProductHost } from "../../../packages/harness/dist/src/auth/desktop-account-product-host.js";
import { createNativeSessionReplayTransport } from "../../../packages/harness/dist/src/sessions/native-session-replay-transport.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createNativeSidecar } from "../../../packages/harness/dist/src/terminal/native-sidecar.js";
import { createNativeSidecarManager } from "../../../packages/harness/dist/src/terminal/native-sidecar-manager.js";
import { createNativeSidecarEnvironment } from "../../../packages/harness/dist/src/terminal/native-sidecar-environment.js";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";

test(
  "original manager provisions and rotates identity-checked real CLI host",
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
    Object.defineProperty(scopedProcess, "resourcesPath", { value: root });
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
      debug: (...v) => logs.push(v),
      setContext() {},
      time() {},
      timeEnd() {},
    };
    const { SidecarServer } = createNativeSidecar({
      environment,
      console: logger,
    });
    const { SidecarManager, getHostedCliCwd } = createNativeSidecarManager({
      process: scopedProcess,
      gateway,
      environment,
      console: logger,
    });
    let accountHost;
    const server = new SidecarServer("owned-instance"),
      client = new SidecarManager({
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
          AXONFIRE_NATIVE_PRODUCT_CONFIG: accountHost
            ? accountHost.env.ACC_PRODUCT_CONFIG_PATH
            : scopedProcess.env.ACC_PRODUCT_CONFIG_PATH,
          ACC_PRODUCT_CONFIG_V3:
            accountHost?.env.ACC_PRODUCT_CONFIG_V3 ??
            scopedProcess.env.ACC_PRODUCT_CONFIG_V3,
        }),
      });
    const runtimeDirs = new Set();
    let acp, created;
    try {
      await server.start();
      await client.ensureStarted();
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
      await mkdir(join(root, "cli"), { recursive: true });
      const baseProduct = JSON.parse(await readFile(product, "utf8"));
      await writeFile(
        join(root, "cli", "product.json"),
        JSON.stringify(baseProduct),
      );
      scopedProcess.env.WORKBUDDY_INSTALL_CHANNEL_DIR = join(
        root,
        "owned-install-channel",
      );
      const span = () => ({
        traceId: "owned",
        startSpan: span,
        markAsFailed() {},
        markAsSuccessful() {},
      });
      accountHost = createDesktopAccountProductHost({
        resourcesRoot: root,
        productDirectory: join(root, "cli"),
        configDirectory: join(root, "desktop-account"),
        env: {
          ...scopedProcess.env,
          ACC_USER_ID: "owned",
          CODEBUDDY_AUTH_TOKEN: "owned-token",
        },
        dependencies: {
          logger,
          traceService: { startTrace: span },
          eventService: { report() {} },
          notifier: { info() {}, warn() {}, error() {} },
          filePathService: { setCurrentUserId() {} },
        },
        http: { proxy: false },
      });
      await accountHost.start();
      assert.deepEqual(
        JSON.parse(await readFile(product, "utf8")),
        baseProduct,
        "snapshot publication must preserve input configuration",
      );
      const { coordinator } = accountHost.services;
      let invalidations = 0;
      const resetReasons = [];
      const lifecycleBinding = accountHost.bindHostedCliRuntime({
        runtimeManager: client,
        sessionManager: {
          invalidateAllSessionHistory() {
            invalidations++;
          },
        },
        agentBackend: {
          async resetActiveSessions(reason) {
            resetReasons.push(reason);
          },
        },
      });
      const nextProduct = {
        ...baseProduct,
        agents: baseProduct.agents.map((agent) => ({
          ...agent,
          instructions: "Owned coordinator rotated instructions",
        })),
      };
      await coordinator.publishResolvedSnapshot(
        undefined,
        nextProduct,
        "owned-live-rotation",
      );
      const rotationDeadline = Date.now() + 15000;
      while (changes.length === 0 && Date.now() < rotationDeadline)
        await new Promise((resolve) => setTimeout(resolve, 30));
      assert.equal(
        changes.length,
        1,
        "actual coordinator publication must rotate the real CLI host",
      );
      await coordinator.publishResolvedSnapshot(
        undefined,
        nextProduct,
        "owned-identical-publication",
      );
      assert.equal(changes.length, 1);
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
      acp = await connectNativeAcp(nextOrigin);
      const rotatedSession = await acp.request("session/new", {
        cwd: root,
        mcpServers: [],
      });
      const rotatedResponse = await acp.request("session/prompt", {
        sessionId: rotatedSession.sessionId,
        prompt: [{ type: "text", text: "Verify rotated product" }],
      });
      assert.equal(rotatedResponse.stopReason, "end_turn");
      assert.equal(requests.length, 2);
      assert.match(
        JSON.stringify(requests[1].messages),
        /Owned coordinator rotated instructions/,
      );
      await acp.close();
      acp = undefined;

      await accountHost.logout();
      await lifecycleBinding.stop();
      assert.equal(coordinator.hostedCliProductSnapshotChangeListeners.size, 0);
      assert.equal(invalidations, 1);
      assert.deepEqual(resetReasons, ["auth-owner-change (owned|| -> none)"]);
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
      await accountHost?.close();
      client.client?.dispose();
      for (const id of server.sessions.keys())
        runtimeDirs.add(getHostedCliCwd(id));
      await server.shutdown();
      for (const dir of runtimeDirs)
        await rm(dir, { recursive: true, force: true });
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
