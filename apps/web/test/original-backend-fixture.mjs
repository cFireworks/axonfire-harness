// Test composition of recovered production classes. External account/connector services remain fixtures.
import * as os from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, rm } from "node:fs/promises";
import { createNativeSidecarManager } from "../../../packages/harness/dist/src/terminal/native-sidecar-manager.js";
import { createNativeSidecarEnvironment } from "../../../packages/harness/dist/src/terminal/native-sidecar-environment.js";
import { createNativeCodeSessionBackend } from "../../../packages/harness/dist/src/terminal/native-code-session-backend.js";
import { createNativeAppCodeBackend } from "../../../packages/harness/dist/src/terminal/native-app-code-backend.js";

export async function originalBackendFixture({ root, env, gateway }) {
  const scopedProcess = Object.create(process);
  scopedProcess.env = {
    ...process.env,
    ...env,
    ACC_PRODUCT_CONFIG_PATH: env.AXONFIRE_NATIVE_PRODUCT_CONFIG,
    WORKBUDDY_CONFIG_DIR: root,
    CODEBUDDY_CONFIG_DIR: root,
  };
  const environment = createNativeSidecarEnvironment({
    process: scopedProcess,
  });
  const logs = [];
  const logger = Object.fromEntries(
    ["log", "debug", "info", "warn", "error"].map((k) => [
      k,
      (...v) => logs.push([k, ...v]),
    ]),
  );
  const { SidecarManager, bindSidecarCrashWatcher } =
    createNativeSidecarManager({
      process: scopedProcess,
      gateway,
      environment,
      console: logger,
    });
  let daemon, exit;
  bindSidecarCrashWatcher((child) => {
    daemon = child;
    exit = new Promise((resolve) =>
      child.once("exit", (code, signal) => resolve({ code, signal })),
    );
  });
  const cliPath = fileURLToPath(
    new URL("../../cli/native.mjs", import.meta.url),
  );
  const manager = new SidecarManager({
    getRuntimeAppVersion: () => "owned",
    getRuntimeAppPath: () => root,
    getRuntimeConfigDir: () => root,
    getRuntimeUserDataDir: () => join(root, "app"),
    resolveBundledAsset: (...parts) =>
      parts[0] === "cli" ? cliPath : undefined,
    resolveProxyEnv: async () => ({}),
    getAgentExtraEnv: () => ({ ...env, ELECTRON_RUN_AS_NODE: "1" }),
  });
  const skills = join(root, "skills");
  await mkdir(skills, { recursive: true });
  const runtime = {
    process: scopedProcess,
    gateway,
    console: logger,
    os: { ...os, homedir: () => root, tmpdir: () => root },
  };
  const original = createNativeCodeSessionBackend(runtime);
  const definition = createNativeAppCodeBackend(
    runtime,
  ).createWorkbuddyAppServerCodeBackend({
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
    runtimeManager: manager,
    createBackend: (manager, dependencies) =>
      new original.CodeBuddyCodeBackend(manager, dependencies),
  });
  return {
    definition,
    manager,
    logs,
    async close() {
      const keepAlive = setInterval(() => {}, 1000);
      try {
        for (const backend of [...definition.activeSessions])
          await backend.destroy().catch(() => {});
        await manager.onStop().catch(() => {});
        let result;
        if (exit) {
          const timer = setTimeout(() => daemon.kill("SIGKILL"), 3000);
          try {
            result = await exit;
          } finally {
            clearTimeout(timer);
          }
        }
        await rm(environment.sidecarRuntimeDir(), {
          recursive: true,
          force: true,
        });
        return result;
      } finally {
        clearInterval(keepAlive);
      }
    },
  };
}
