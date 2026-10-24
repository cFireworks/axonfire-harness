// Web host ownership over original account/product services and sidecar lifecycle.
import { startNativeWebAccountRuntime } from "./native-account-runtime.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, resolve, delimiter } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createNativeCliPrewarmPool } from "@axonfire/harness/terminal/native-cli-prewarm-pool.js";
import { createNativeHostedCliLifecycle } from "@axonfire/harness/terminal/native-hosted-cli-lifecycle.js";
import { createNativeSidecarManager } from "@axonfire/harness/terminal/native-sidecar-manager.js";
import { createNativeSidecarEnvironment } from "@axonfire/harness/terminal/native-sidecar-environment.js";
import { createNativeSessionReplayTransport } from "@axonfire/harness/sessions/native-session-replay-transport.js";

export async function startNativeOwnedRuntime({
  cwd,
  env = process.env,
  args = [],
  nodeExecutable = process.execPath,
  timeout = 15000,
  hosted = false,
} = {}) {
  const controlRoot = await mkdtemp(join(tmpdir(), "axon-web-sidecar-"));
  const configRoot =
    env.WORKBUDDY_CONFIG_DIR ??
    resolve(
      env.AXONFIRE_STATE_DIR ||
        join(env.HOME || homedir(), ".axonfire", "native"),
    );
  const scopedProcess = Object.create(process);
  scopedProcess.env = {
    ...env,
    TMPDIR: tmpdir(),
    TMP: tmpdir(),
    TEMP: tmpdir(),
    WORKBUDDY_CONFIG_DIR: controlRoot,
    CODEBUDDY_CONFIG_DIR: controlRoot,
  };
  const environment = createNativeSidecarEnvironment({
    process: scopedProcess,
  });
  const gateway = createNativeSessionReplayTransport();
  const cliPath = fileURLToPath(new URL("../cli/native.mjs", import.meta.url));
  // Captured daemon/CLI diagnostics can contain private configuration. Keep them off browser output.
  const logger = { log() {}, debug() {}, info() {}, warn() {}, error() {} };
  const {
    SidecarManager,
    bindSidecarCrashWatcher,
    buildAgentCliRuntimeEnv,
    getProxyEnvFromProcess,
    readAgentCliAppConfigValue,
  } = createNativeSidecarManager({
    process: scopedProcess,
    environment,
    gateway,
    console: logger,
  });
  let daemon,
    daemonExit,
    closePromise,
    runtimePid,
    startup,
    prewarmPool,
    accountHost;
  bindSidecarCrashWatcher((child) => {
    daemon = child;
    daemonExit = new Promise((resolveExit) => {
      child.once("exit", (code, signal) => resolveExit({ code, signal }));
      child.once("error", () => resolveExit({ code: null, signal: null }));
    });
  });
  const cliEnv = {
    ...env,
    ...getProxyEnvFromProcess(),
    ...gateway.gatewaySecretEnv(),
    ACC_PRODUCT_CONFIG_PATH:
      env.AXONFIRE_NATIVE_PRODUCT_CONFIG ?? env.ACC_PRODUCT_CONFIG_PATH,
    WORKBUDDY_CONFIG_DIR: configRoot,
    CODEBUDDY_CONFIG_DIR: configRoot,
    AXONFIRE_PORT: "0",
    SERVER__PORT: "",
    SERVER__HOST: "127.0.0.1",
    ELECTRON_RUN_AS_NODE: "1",
  };
  const manager = new SidecarManager({
    processExecPath: nodeExecutable,
    getRuntimeConfigDir: () => controlRoot,
    getRuntimeUserDataDir: () => join(controlRoot, "app"),
    getRuntimeAppPath: () => fileURLToPath(new URL("../..", import.meta.url)),
    getRuntimeAppVersion: () => "5.3.14-reconstruction.0",
    resolveBundledAsset: (...parts) =>
      parts[0] === "cli" ? cliPath : undefined,
    getAgentExtraEnv: () => refreshCliEnv(),
  });
  function refreshCliEnv() {
    if (accountHost) {
      delete cliEnv.AXONFIRE_NATIVE_PRODUCT_CONFIG;
      cliEnv.AXONFIRE_NATIVE_ASSETS = accountHost.assetsDirectory;
      for (const key of [
        "ACC_PRODUCT_CONFIG_V3",
        "ACC_PRODUCT_CONFIG_PATH",
        "CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT",
      ]) {
        if (accountHost.env[key] === undefined) delete cliEnv[key];
        else cliEnv[key] = accountHost.env[key];
      }
    }
    return cliEnv;
  }
  const buildSessionEnv = (extra = {}) =>
    buildAgentCliRuntimeEnv({
      configDir: configRoot,
      builtinSkillsDir: cliEnv.CODEBUDDY_BUILTIN_SKILLS_DIR ?? "",
      processEnv: refreshCliEnv(),
      pathDelimiter: delimiter,
      extra: { ...cliEnv, ...extra },
    });
  const sessionId = randomUUID();
  function close() {
    return (closePromise ??= (async () => {
      // Original IPC sockets are unrefed. Keep the host alive after its HTTP server closes.
      const keepAlive = setInterval(() => {}, 1000);
      try {
        await accountHost?.close();
        // The original manager can reject when its close callback clears the client
        // during shutdown. Its original AppServer caller also catches this rejection.
        await manager.onStop().catch(() => {});
        // Drain a startup that may have crossed its async spawn boundary before stop.
        await startup?.catch(() => {});
        await manager.onStop().catch(() => {});
        await prewarmPool?.stop().catch(() => {});
        let result;
        if (daemonExit) {
          const timer = setTimeout(() => daemon.kill("SIGKILL"), 3000);
          try {
            result = await daemonExit;
          } finally {
            clearTimeout(timer);
          }
        }
        await rm(environment.sidecarRuntimeDir(), {
          recursive: true,
          force: true,
        });
        await rm(controlRoot, { recursive: true, force: true });
        return result;
      } finally {
        clearInterval(keepAlive);
      }
    })());
  }
  let timer;
  try {
    accountHost = await startNativeWebAccountRuntime({
      env,
      cwd: cwd ?? process.cwd(),
      configRoot,
      controlRoot,
      logger,
    });
    refreshCliEnv();
    if (hosted) {
      const prewarmProcess = Object.create(process);
      prewarmProcess.env = cliEnv;
      prewarmProcess.execPath = nodeExecutable;
      const prewarm = createNativeCliPrewarmPool({
        process: prewarmProcess,
        environment,
        console: logger,
      });
      const lifecycle = createNativeHostedCliLifecycle({
        process: prewarmProcess,
        gateway,
        prewarm,
      });
      prewarmPool = await lifecycle.initializePrewarmPool({
        celljs: {
          logger,
          configService: {
            get: (key) =>
              readAgentCliAppConfigValue(key, {
                userDataDir: join(configRoot, "app"),
              }),
          },
        },
        logger,
        runtimeManager: manager,
        codeBackendFactoryOptions: { adapters: {} },
        resolveWorkbuddyAppServerCodeCliPath: () => cliPath,
        buildWorkbuddyAppServerCodeCliEnv: () => ({
          ...buildSessionEnv(),
          CODEBUDDY_HOST_CAPABILITIES:
            "elicitation.form,weixinpay.interception",
          ...environment.CLI_STATIC_MANAGED_ENV,
        }),
      });
    }
    startup = hosted
      ? (async () => {
          const endpoint = await manager.getHostEndpoint();
          return { acpEndpoint: endpoint, pid: manager.hostRuntimePid };
        })()
      : manager.createSession({
          sessionId,
          command: nodeExecutable,
          args: [cliPath, "--serve", ...args],
          cwd: cwd ?? process.cwd(),
          port: 0,
          env: cliEnv,
        });
    const created = await Promise.race([
      startup,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Native product startup timed out")),
          timeout,
        );
      }),
    ]);
    runtimePid = created.pid;
    return {
      origin: new URL(created.acpEndpoint).origin,
      // Host composition handles; never serialized to browser clients.
      manager,
      gateway,
      configRoot,
      cliPath,
      cliEnv,
      buildAgentCliRuntimeEnv,
      buildSessionEnv,
      prewarmPool,
      accountHost,
      requestHeaders: gateway.gatewaySecretHeaders(),
      close,
      exit: daemonExit,
      // Host-only diagnostics for ownership verification; never serialized to browser clients.
      ownership: {
        sessionId: hosted ? manager.hostSessionId : sessionId,
        runtimePid,
        daemonPid: daemon?.pid,
        controlRoot,
        controlSocket: environment.controlSocketPath(),
        pidFile: environment.pidFilePath(),
      },
    };
  } catch (error) {
    await close();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
