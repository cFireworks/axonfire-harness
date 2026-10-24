import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
type Factory = (runtime?: any) => any;
async function owned(f: Factory, run: (x: any) => Promise<void>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-app-env-"));
  try {
    const proc = Object.create(process);
    proc.env = { CLIENT_INFO_MACHINE_ID: "owned-machine", PATH: "/base" };
    const api = f({
      process: proc,
      os: { homedir: () => root },
      gateway: { gatewaySecretEnv: () => ({ OWNED_GATEWAY: "value" }) },
    });
    const opts = {
      platform: {
        configDir: root,
        dataDir: path.join(root, "app"),
        appVersion: "owned-version",
      },
      celljs: { logger: { warn() {} } },
      adapters: {
        resolveBundledAsset: () => undefined,
        requireBundledAsset: () => path.join(root, "skills"),
        getBootstrapProductConfigEnv: () => undefined,
        getRegisteredBinaryTypes: () => ["node", "python"],
      },
    };
    await run({ api, root, proc, opts });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const appCliEnvironmentScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "bundled paths win without existence validation and bin short-circuits dist",
    (f) =>
      owned(f, async ({ api, opts, root }) => {
        const calls: any[] = [];
        opts.adapters.resolveBundledAsset = (...parts: string[]) => {
          calls.push(parts);
          return path.join(root, "missing-bin");
        };
        assert.equal(
          api.resolveWorkbuddyAppServerCodeCliPath(opts),
          path.join(root, "missing-bin"),
        );
        assert.deepEqual(calls, [["cli", "bin", "codebuddy"]]);
      }),
  ],
  [
    "dist fallback, trimmed env path warning and missing CLI diagnostics",
    (f) =>
      owned(f, async ({ api, opts, proc, root }) => {
        opts.adapters.resolveBundledAsset = (...parts: string[]) =>
          parts[1] === "dist" ? "/owned/dist" : undefined;
        assert.equal(
          api.resolveWorkbuddyAppServerCodeCliPath(opts),
          "/owned/dist",
        );
        opts.adapters.resolveBundledAsset = () => undefined;
        const exe = path.join(root, "cli.js");
        fs.writeFileSync(exe, "");
        proc.env.CODEBUDDY_CODE_PATH = " " + exe + " ";
        const warnings: string[] = [];
        opts.celljs.logger.warn = (msg: string) => warnings.push(msg);
        assert.equal(api.resolveWorkbuddyAppServerCodeCliPath(opts), exe);
        assert.equal(warnings.length, 1);
        fs.unlinkSync(exe);
        assert.throws(
          () => api.resolveWorkbuddyAppServerCodeCliPath(opts),
          /CLI not found[\s\S]*CODEBUDDY_CODE_PATH/,
        );
      }),
  ],
  [
    "original baseline includes shared gateway, identity, product and selective process keys",
    (f) =>
      owned(f, async ({ api, opts, proc, root }) => {
        proc.env.ACC_PRODUCT_CONFIG_V3 = JSON.stringify({
          networkEnvironment: "internal",
        });
        proc.env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT = "70";
        proc.env.NOT_MANAGED = "do-not-copy";
        opts.adapters.getBootstrapProductConfigEnv = () => {
          throw Error("must bypass fallback");
        };
        const env = api.buildWorkbuddyAppServerCodeCliEnv(opts);
        assert.equal(env.OWNED_GATEWAY, "value");
        assert.equal(env.CLIENT_INFO_MACHINE_ID, "owned-machine");
        assert.equal(env.CODEBUDDY_CONFIG_DIR, root);
        assert.equal(env.ACC_PRODUCT_CONFIG_V3, proc.env.ACC_PRODUCT_CONFIG_V3);
        assert.equal(env.CODEBUDDY_INTERNET_ENVIRONMENT, "internal");
        assert.equal(env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT, "70");
        assert.equal(env.NOT_MANAGED, undefined);
        assert.equal(env.ELECTRON_RUN_AS_NODE, "1");
        assert.equal(env.WORKBUDDY_NODE_ENV, "production");
      }),
  ],
  [
    "file product overrides bootstrap inline while provider is still called",
    (f) =>
      owned(f, async ({ api, opts, proc, root }) => {
        const file = path.join(root, "product.json");
        fs.writeFileSync(
          file,
          JSON.stringify({ networkEnvironment: "external" }),
        );
        proc.env.ACC_PRODUCT_CONFIG_PATH = file;
        let reads = 0;
        opts.adapters.getBootstrapProductConfigEnv = () => {
          reads++;
          return '{"networkEnvironment":"internal"}';
        };
        const env = api.buildWorkbuddyAppServerCodeCliEnv(opts);
        assert.equal(reads, 1);
        assert.equal(env.ACC_PRODUCT_CONFIG_PATH, file);
        assert.equal(env.ACC_PRODUCT_CONFIG_V3, undefined);
        assert.equal(env.CODEBUDDY_INTERNET_ENVIRONMENT, "external");
      }),
  ],
  [
    "enabled plugins and managed runtimes derive from owned filesystem",
    (f) =>
      owned(f, async ({ api, opts, root }) => {
        const plugin = path.join(
          root,
          "plugins/marketplaces/owned/plugins/tool",
        );
        fs.mkdirSync(plugin, { recursive: true });
        fs.writeFileSync(
          path.join(root, "settings.json"),
          JSON.stringify({
            enabledPlugins: { "tool@owned": true, "off@owned": false },
          }),
        );
        for (const v of ["20.0.0", "22.0.0", "99.installing.temp"])
          fs.mkdirSync(
            path.join(root, ".workbuddy/binaries/node/versions", v),
            { recursive: true },
          );
        fs.mkdirSync(opts.platform.dataDir, { recursive: true });
        fs.writeFileSync(
          path.join(opts.platform.dataDir, "app-config.json"),
          JSON.stringify({ bundledRuntime: { tools: { python: false } } }),
        );
        const env = api.buildWorkbuddyAppServerCodeCliEnv(opts);
        assert.equal(env.CODEBUDDY_PLUGIN_DIRS, plugin);
        assert.equal(env.WORKBUDDY_MANAGED_RUNTIME_DISABLED, "python");
        const bin = path.join(
          root,
          ".workbuddy/binaries/node/versions/22.0.0",
          process.platform === "win32" ? "" : "bin",
        );
        assert.ok(env.PATH.startsWith(bin));
        assert.ok(!env.WORKBUDDY_EXTRA_PATHS.includes("installing"));
        assert.ok(!env.WORKBUDDY_EXTRA_PATHS.includes("python"));
      }),
  ],
  [
    "extra env wins last; proxy values filter nonstrings",
    (f) =>
      owned(f, async ({ api, opts, proc }) => {
        proc.env.NODE_ENV = "development";
        opts.adapters.getProcessProxyEnv = () => ({
          HTTPS_PROXY: "http://owned",
          BAD: 42,
        });
        const env = api.buildWorkbuddyAppServerCodeCliEnv(opts, {
          CODEBUDDY_QIMEI36: "q",
          WORKBUDDY_NODE_ENV: "override",
          CODEBUDDY_CONFIG_DIR: "/explicit",
        });
        assert.equal(env.CODEBUDDY_QIMEI36, "q");
        assert.equal(env.WORKBUDDY_NODE_ENV, "override");
        assert.equal(env.CODEBUDDY_CONFIG_DIR, "/explicit");
        assert.equal(env.HTTPS_PROXY, "http://owned");
        assert.equal(env.BAD, undefined);
      }),
  ],
  [
    "logger fallback uses original scope and asset failures propagate",
    async (f) => {
      const calls: any[] = [];
      const api = f({
        loggerModule: {
          createWorkbuddyScopedLogger: (scope: string) => ({
            warn: (msg: string) => calls.push([scope, msg]),
          }),
        },
      });
      api.warn(undefined, "owned");
      assert.deepEqual(calls, [["app-server-code-backend", "owned"]]);
      await owned(f, async ({ api, opts }) => {
        opts.adapters.requireBundledAsset = () => {
          throw Error("missing skills");
        };
        assert.throws(
          () => api.buildWorkbuddyAppServerCodeCliEnv(opts),
          /missing skills/,
        );
      });
    },
  ],
];
