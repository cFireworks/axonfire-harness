import { createNativeSidecarManager } from "../../../packages/harness/dist/src/terminal/native-sidecar-manager.js";
import { createNativeAppServerStop } from "../../../packages/harness/dist/src/sessions/native-app-server-stop.js";
import { createNativeCodeSessionBackend } from "../../../packages/harness/dist/src/terminal/native-code-session-backend.js";
import { createNativeAppCodeBackend } from "../../../packages/harness/dist/src/terminal/native-app-code-backend.js";
import { createNativeHostedCliLifecycle } from "../../../packages/harness/dist/src/terminal/native-hosted-cli-lifecycle.js";
import { createNativeSessionReplayTransport } from "../../../packages/harness/dist/src/sessions/native-session-replay-transport.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createNativeCliPrewarmPool } from "../../../packages/harness/dist/src/terminal/native-cli-prewarm-pool.js";
import { createNativeSidecarEnvironment } from "../../../packages/harness/dist/src/terminal/native-sidecar-environment.js";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";

for (const startup of ["prewarm", "cold-background"])
  test(
    `complete original code backend initializes, prompts and destroys real CLI (${startup})`,
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
      scopedProcess.env = {
        ...process.env,
        ACC_PRODUCT_CONFIG_PATH: product,
        WORKBUDDY_CONFIG_DIR: root,
        CODEBUDDY_CONFIG_DIR: root,
        WORKBUDDY_CLI_PREWARM_POOL_SIZE: "1",
      };
      const environment = createNativeSidecarEnvironment({
        process: scopedProcess,
      });
      const logs = [];
      const logger = {
        log: (...v) => logs.push(v),
        info: (...v) => logs.push(v),
        warn: (...v) => logs.push(v),
        error: (...v) => logs.push(v),
      };
      const { CliPrewarmPool, bindCliChildCrashWatcher } =
        createNativeCliPrewarmPool({ process: scopedProcess, environment });
      const children = [];
      bindCliChildCrashWatcher((child) => children.push(child));
      const fixtureEnv = {
        ...nativeFixtureEnv,
        ...gateway.gatewaySecretEnv(),
        ELECTRON_RUN_AS_NODE: "1",
        HOME: root,
        SHELL: "/bin/sh",
        WORKBUDDY_CONFIG_DIR: root,
        CODEBUDDY_CONFIG_DIR: root,
        ACC_PRODUCT_CONFIG_PATH: product,
        AXONFIRE_STATE_DIR: join(root, "state"),
        AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
      };
      Object.assign(scopedProcess.env, fixtureEnv, {
        CLIENT_INFO_MACHINE_ID: "owned-prewarm-machine",
      });
      const lifecycle = createNativeHostedCliLifecycle({
        gateway,
        os: { homedir: () => root },
        process: scopedProcess,
        prewarm: { CliPrewarmPool },
      });
      const { SidecarManager, bindSidecarCrashWatcher } =
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
      const manager = new SidecarManager({
        getRuntimeAppVersion: () => "owned",
        getRuntimeAppPath: () => root,
        getRuntimeConfigDir: () => root,
        getRuntimeUserDataDir: () => join(root, "app"),
        resolveBundledAsset: (...parts) =>
          parts[0] === "cli"
            ? fileURLToPath(new URL("../../cli/native.mjs", import.meta.url))
            : undefined,
        resolveProxyEnv: async () => ({}),
        getAgentExtraEnv: () => ({ ...fixtureEnv }),
      });
      let pool;
      const sessionId = "47b786bc-caf0-490f-bfed-252bcdb6d77c";
      async function waitIdle() {
        for (let i = 0; i < 250; i++) {
          if (pool.entries.some((e) => e.status === "idle")) return;
          await new Promise((r) => setTimeout(r, 40));
        }
        throw new Error("owned prewarm entry never became idle");
      }
      let backend, created;
      try {
        const skills = join(root, "skills");
        await mkdir(skills);
        const cliPath = fileURLToPath(
          new URL("../../cli/native.mjs", import.meta.url),
        );
        const options = {
          platform: {
            configDir: root,
            dataDir: join(root, "app"),
            appVersion: "owned",
            appLocale: () => "en-US",
          },
          celljs: {
            logger,
            configService: { get: () => undefined },
            productManager: { getCurrentConfiguration: () => ({}) },
            connectorProxyServer: {
              getPort: () => 0,
              getProxySecret: () => undefined,
            },
            connectorService: { getSkillOnlyTokenEnv: () => ({}) },
            authenticationManager: {
              currentSessionSubject: {
                getValue: () => ({ account: { uid: "owned" } }),
              },
            },
          },
          resolveProxyEnv: async () => ({}),
          agentTeamsEnvResolver: { resolveForSession: () => undefined },
          adapters: {
            resolveBundledAsset: (...parts) =>
              parts[0] === "cli" ? cliPath : undefined,
            requireBundledAsset: () => skills,
            getBootstrapProductConfigEnv: () => undefined,
            getRegisteredBinaryTypes: () => ["node", "python"],
          },
        };
        pool = await lifecycle.initializePrewarmPool({
          celljs: { configService: { get: () => 0 }, logger },
          logger,
          runtimeManager: manager,
          codeBackendFactoryOptions: options,
        });
        assert.ok(pool);
        assert.equal(manager.prewarmPool, pool);
        assert.equal(options.cliPrewarmPool, pool);
        await waitIdle();
        const original = createNativeCodeSessionBackend({
          process: scopedProcess,
          gateway,
          console: logger,
          os: {
            ...(await import("node:os")),
            homedir: () => root,
            tmpdir: () => root,
          },
        });
        const definition = createNativeAppCodeBackend({
          process: scopedProcess,
          gateway,
          console: logger,
          os: { homedir: () => root },
        }).createWorkbuddyAppServerCodeBackend({
          ...options,
          runtimeManager: manager,
          createBackend: (manager, dependencies) =>
            new original.CodeBuddyCodeBackend(manager, dependencies),
        });
        backend = definition.create({
          sessionId,
          cwd: root,
          runtimeConfig: { tools: "Read", permissionMode: "default" },
          _meta: {
            "codebuddy.ai": {
              isBackgroundAutomation: startup === "cold-background",
            },
          },
        });
        const notices = [];
        backend.onSessionUpdate = (value) => notices.push(value);
        const initialized = await backend.initialize({
          kind: "new",
          request: { cwd: root, mcpServers: [] },
        });
        assert.equal(initialized.sessionId, sessionId);
        assert.equal(backend.prewarmActivated, startup === "prewarm");
        assert.equal(Boolean(daemon), startup === "cold-background");
        created = {
          acpEndpoint: backend.acpEndpoint,
          pid:
            startup === "prewarm"
              ? pool.entries.find((e) => e.sessionId === sessionId).child.pid
              : (await manager.listSessions()).find(
                  (e) => e.sessionId === sessionId,
                ).pid,
        };
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
        const response = await backend.prompt({
          sessionId,
          prompt: [{ type: "text", text: "Reply with the owned answer" }],
        });
        assert.equal(response.stopReason, "end_turn");
        assert.equal(requests.length, 1);
        assert.match(JSON.stringify(notices), /Owned sidecar CLI answer/);
        assert.equal(
          pool.getActiveEndpointForSession(sessionId),
          startup === "prewarm" ? origin : undefined,
        );
        await waitIdle();
        assert.equal(pool.entries.filter((e) => e.status === "idle").length, 1);
        await backend.destroy();
        assert.equal(definition.activeSessions.size, 0);
        assert.equal(backend.prewarmActivated, false);
        assert.equal(backend.runtimeEverStarted, false);
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
        assert.equal(pool.getActiveEndpointForSession(sessionId), undefined);
      } catch (error) {
        // Fixture logs are owned; retain bounded diagnostics without dumping inherited environment.
        error.message +=
          "\nSidecar diagnostics: " + JSON.stringify(logs).slice(-6000);
        throw error;
      } finally {
        await backend?.destroy();
        let cleanupFailure;
        try {
          await createNativeAppServerStop({
            pluginRecommendationRegistry: { cancelAll() {} },
            sessionRuntimeHandleRef: { current: null },
            powerManager: { cleanup() {} },
            appServerServices: { docsService: {} },
            bootstrapInstance: { handlerDeps: {}, stop: async () => {} },
            runtimeManager: manager,
            cliPrewarmPool: pool,
          }).stop();
          if (daemon) {
            const timer = setTimeout(() => daemon.kill("SIGKILL"), 3000);
            try {
              await daemonExit;
            } finally {
              clearTimeout(timer);
            }
            assert.equal(daemon.exitCode, 0);
            assert.throws(() => process.kill(daemon.pid, 0), { code: "ESRCH" });
            await assert.rejects(stat(environment.controlSocketPath()), {
              code: "ENOENT",
            });
            await assert.rejects(stat(environment.pidFilePath()), {
              code: "ENOENT",
            });
          }
          for (const child of children)
            if (child.pid)
              assert.throws(() => process.kill(child.pid, 0), {
                code: "ESRCH",
              });
        } catch (error) {
          cleanupFailure ??= error;
        }
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
