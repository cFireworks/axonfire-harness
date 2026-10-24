import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
export const sidecarServiceScenarios: Array<
  [string, (services: any) => Promise<void>]
> = [];
sidecarServiceScenarios.push([
  "runtime context overlay, environment precedence and independent instances",
  async (s) => {
    const process = { env: { LANG: "en_GB" }, cwd: () => "/cwd" };
    const api = s.context({ process, os: { homedir: () => "/home/owned" } });
    assert.equal(api.getWorkbuddyRuntimeConfigDir(), "/home/owned/.workbuddy");
    api.configureWorkbuddyRuntimeContext({
      appName: "Owned",
      appPath: "/app",
      configDir: "/config",
      appVersion: "1",
      locale: "fr",
    });
    api.configureWorkbuddyRuntimeContext({
      appName: undefined,
      appVersion: "2",
    });
    assert.equal(api.getWorkbuddyRuntimeAppName(), "Owned");
    assert.equal(api.getWorkbuddyRuntimeAppVersion(), "2");
    assert.equal(api.getWorkbuddyRuntimeUserDataDir(), "/config/app");
    assert.equal(
      api.getWorkbuddyRuntimeLogsDir("daemon.log"),
      "/config/logs/daemon.log",
    );
    Object.assign(process.env, {
      WORKBUDDY_APP_NAME: " Env ",
      WORKBUDDY_CONFIG_DIR: " /explicit ",
      WORKBUDDY_LOCALE: "  ",
    });
    assert.equal(api.getWorkbuddyRuntimeAppName(), "Env");
    assert.equal(api.getWorkbuddyRuntimeConfigDir(), "/explicit");
    assert.equal(api.getWorkbuddyRuntimeLocale(), "fr");
    assert.equal(
      s
        .context({ process: { env: {}, cwd: () => "/cwd" } })
        .getWorkbuddyRuntimeAppName(),
      "WorkBuddy",
    );
  },
]);
sidecarServiceScenarios.push([
  "proxy bypass keeps original duplicates and appends loopback hosts",
  async (s) => {
    const api = s.proxy();
    assert.equal(
      api.mergeNoProxy("EXAMPLE, localhost,EXAMPLE"),
      "EXAMPLE,localhost,EXAMPLE,127.0.0.1,::1",
    );
    assert.equal(
      api.mergeNoProxy("LOCALHOST,127.0.0.1,::1"),
      "LOCALHOST,127.0.0.1,::1",
    );
    assert.equal(api.mergeNoProxy(), "localhost,127.0.0.1,::1");
  },
]);
sidecarServiceScenarios.push([
  "scoped logger selection, fallback levels and configuration lifetime",
  async (s) => {
    const calls: any[] = [];
    const console = {
      info: (...v: any[]) => calls.push(["console", ...v]),
      warn: (...v: any[]) => calls.push(["warn", ...v]),
    };
    const api = s.logger({ console });
    api.configureWorkbuddyLogger({
      info: (...v: any[]) => calls.push(["custom", ...v]),
    });
    const first = api.createWorkbuddyScopedLogger("owned");
    first.debug("hello", 3);
    api.configureWorkbuddyLogger({
      scope: () => ({ warn: (...v: any[]) => calls.push(["scoped", ...v]) }),
    });
    api.createWorkbuddyScopedLogger("scope").warn("raw");
    first.info("old");
    api.configureWorkbuddyLogger(undefined);
    api.createWorkbuddyScopedLogger("last").info("reset");
    assert.deepEqual(calls, [
      ["custom", "[owned] hello", 3],
      ["scoped", "raw"],
      ["custom", "[owned] old"],
      ["console", "[last] reset"],
    ]);
  },
]);
sidecarServiceScenarios.push([
  "product inline priority, path suppression and canonical environment values",
  async (s) => {
    const api = s.product();
    const env = {
      ACC_PRODUCT_CONFIG_V3: '{"networkEnvironment":"internal"}',
      CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT: "external",
    };
    assert.equal(
      api.resolveAgentCliProductEnv({ processEnv: env }).hostedCliInternetEnv,
      "internal",
    );
    assert.equal(
      api.resolveAgentCliProductEnv({
        processEnv: env,
        productConfigPathEnv: "/missing",
      }).productConfigEnv,
      undefined,
    );
    assert.equal(
      api.resolveAgentCliProductEnv({
        processEnv: env,
        productConfigPathEnv: "/missing",
      }).hostedCliInternetEnv,
      "external",
    );
    assert.equal(
      api.resolveAgentCliProductEnv({
        processEnv: env,
        productConfigEnv: '{"networkEnvironment":"iOA"}',
      }).hostedCliInternetEnv,
      "iOA",
    );
    assert.equal(api.isAgentCliProductEnvironment("ioa"), false);
    assert.equal(api.isAgentCliProductEnvironment("iOA"), true);
    const explicit = { CODEBUDDY_INTERNET_ENVIRONMENT: "stale" };
    api.applyAgentCliHostedProductEnvironment(explicit, {});
    assert.deepEqual(explicit, {});
  },
]);
sidecarServiceScenarios.push([
  "sync and async product files, V2 fallback and malformed input",
  async (s) => {
    const root = await mkdtemp(join(tmpdir(), "axon-product-env-"));
    try {
      const file = join(root, "product.json");
      await writeFile(file, '{"networkEnvironment":"selfhosted"}');
      const api = s.product();
      const input = { processEnv: { ACC_PRODUCT_CONFIG_PATH: file } };
      assert.deepEqual(
        await api.resolveAgentCliProductEnvAsync(input),
        api.resolveAgentCliProductEnv(input),
      );
      assert.equal(
        (await api.resolveAgentCliProductEnvAsync(input)).hostedCliInternetEnv,
        "selfhosted",
      );
      const bad = {
        processEnv: {
          ACC_PRODUCT_CONFIG_V3: "{broken",
          ACC_PRODUCT_CONFIG_V2: '{"networkEnvironment":"cloudhosted"}',
        },
      };
      assert.equal(
        (await api.resolveAgentCliProductEnvAsync(bad)).hostedCliInternetEnv,
        "cloudhosted",
      );
      assert.deepEqual(
        await api.resolveAgentCliProductEnvAsync({
          processEnv: {},
          fallbackProductConfigEnv: "{}",
        }),
        {
          productConfigEnv: "{}",
          productConfigPathEnv: undefined,
          hostedCliInternetEnv: undefined,
        },
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
]);
