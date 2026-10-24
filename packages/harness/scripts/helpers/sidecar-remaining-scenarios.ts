import assert from "node:assert/strict";
export const sidecarRemainingScenarios: Array<
  [string, (s: any) => Promise<void>]
> = [];
sidecarRemainingScenarios.push([
  "client identity inherits machine ID and refreshes dynamic channel",
  async (s) => {
    let reads = 0;
    const process = {
      env: {
        CLIENT_INFO_MACHINE_ID: "owned-machine",
        CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL: "one",
      },
    };
    const api = s.client({
      process,
      fs: {
        readFileSync: (file: string) => {
          reads++;
          return JSON.stringify(
            file === "product"
              ? { productName: "Owned" }
              : {
                  version: "0.0.0",
                  publishConfig: { customPackage: { version: "5.3.14" } },
                },
          );
        },
      },
    });
    const resolver = (...v: string[]) => (v.length === 1 ? "product" : "cli");
    const options = { getAppVersion: () => "1", resolveBundledAsset: resolver };
    const a = api.buildWorkbuddyClientInfoEnv(options);
    assert.equal(a.CLIENT_INFO_MACHINE_ID, "owned-machine");
    assert.equal(a.CLIENT_INFO_PRODUCT_NAME, "Owned");
    assert.equal(a.CLIENT_INFO_USER_AGENT_EXTENSION, "CLI/5.3.14");
    a.CLIENT_INFO_PRODUCT_NAME = "mutated";
    process.env.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL = "two";
    const b = api.buildWorkbuddyClientInfoEnv(options);
    assert.equal(b.CLIENT_INFO_PRODUCT_NAME, "Owned");
    assert.equal(b.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL, "two");
    assert.equal(reads, 2);
    api.buildWorkbuddyClientInfoEnv({ ...options, getAppVersion: () => "2" });
    assert.equal(reads, 4);
  },
]);
sidecarRemainingScenarios.push([
  "machine probes memoize, preserve platform fallback and do not broaden Windows fallback",
  async (s) => {
    let reads = 0;
    const linux = s.client({
      process: { env: {} },
      os: { platform: () => "linux" },
      fs: {
        readFileSync: () => {
          reads++;
          return "0123456789abcdef0123456789abcdef\n";
        },
      },
    });
    assert.equal(linux.machineIdSync(), "01234567-89ab-cdef-0123-456789abcdef");
    linux.machineIdSync();
    assert.equal(reads, 1);
    const calls: string[] = [];
    const win = s.client({
      process: { env: {} },
      os: { platform: () => "win32" },
      crypto: { randomUUID: () => "fallback" },
      childProcess: {
        execFile() {},
        execFileSync: (command: string) => {
          calls.push(command);
          return "no guid";
        },
      },
    });
    assert.equal(win.machineIdSync(), "fallback");
    assert.deepEqual(calls, ["reg"]);
    const mac = s.client({
      process: { env: {} },
      os: { platform: () => "darwin" },
      crypto: { randomUUID: () => "fallback" },
      childProcess: {
        execFile() {},
        execFileSync: () =>
          "IOPlatformUUID = 12345678-abcd-abcd-abcd-123456789abc",
      },
    });
    assert.equal(mac.machineIdSync(), "12345678-abcd-abcd-abcd-123456789abc");
  },
]);
sidecarRemainingScenarios.push([
  "original binary registry exposes complete configs and isolated environments",
  async (s) => {
    const api = s.client();
    assert.deepEqual(api.getRegisteredBinaryTypes(), ["python", "node"]);
    assert.throws(
      () => api.getBinaryTypeConfig("missing"),
      /Unknown binary type/,
    );
    const node = api.getBinaryTypeConfig("node");
    assert.equal(
      node.buildIsolatedEnv({ installPath: "/owned" }).NPM_CONFIG_CACHE,
      "/owned/.npm-cache",
    );
    assert.equal(
      typeof api.getBinaryTypeConfig("python").postInstall,
      "function",
    );
  },
]);
sidecarRemainingScenarios.push([
  "security policy retains explicit management, filtered prefixes and runtime defaults",
  async (s) => {
    const api = s.common();
    assert.deepEqual(api.translateRemoteSecurityCenter(null), {
      managed: false,
    });
    assert.deepEqual(
      api.translateRemoteSecurityCenter({ config: { sandbox: null } }),
      { managed: true },
    );
    const p = api.translateRemoteSecurityCenter({
      config: {
        sandbox: {
          enabled: true,
          networkAccess: {
            mode: "deny_all_with_whitelist",
            whitelistDomains: ["owned", 2],
          },
          commandControl: { allowPrefixes: [" git  push ", "", 4] },
        },
        dataSecurity: {
          deleteProtection: true,
          batchDeleteApprovalThreshold: 12,
        },
        runtime: { tools: { nodejs: false } },
      },
    });
    assert.equal(p.managed, true);
    assert.deepEqual(p.commandSafety, {
      allow: [{ prefix: ["git", "push"] }],
      ask: [],
    });
    assert.deepEqual(p.network, {
      allowedDomains: ["owned"],
      deniedDomains: [],
      denyAll: true,
    });
    assert.equal(p.dataSecurity.safeDeleteRuntimeEnabled, true);
    assert.deepEqual(p.bundledRuntime, {
      enabled: true,
      tools: { node: false, python: true, gitBash: true, brokeredShell: true },
    });
  },
]);
sidecarRemainingScenarios.push([
  "endpoint override initialization and explicit replacement",
  async (s) => {
    const api = s.common({
      process: { env: { WORKBUDDY_DEV_ENDPOINT_OVERRIDE: "http://owned" } },
    });
    assert.equal(api.getProductEndpointOverride().resolve(), "http://owned");
    api.setProductEndpointOverride({ resolve: () => "replacement" });
    assert.equal(api.getProductEndpointOverride().resolve(), "replacement");
    assert.equal(
      s
        .common({ process: { env: {} } })
        .getProductEndpointOverride()
        .resolve(),
      undefined,
    );
  },
]);
