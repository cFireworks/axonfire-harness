import assert from "node:assert/strict";
import * as path from "node:path";
import { createNativeBashSandboxManager } from "../../src/sandbox/native-bash-sandbox-manager.js";
import { sandboxRulesFixture } from "./sandbox-rules-scenarios.js";
export function bashSandboxFixture(
  factory = createNativeBashSandboxManager,
  patch: any = {},
) {
  const rules = sandboxRulesFixture(undefined, {
      platform: patch.platform ?? "darwin",
    }),
    logs: any[] = [],
    events: any[] = [];
  let settings = patch.settings ?? {};
  const runtime: any = {
    process: { platform: patch.platform ?? "darwin", env: patch.env ?? {} },
    modules: {
      20852: rules.n.getModule(20852),
      70857: {
        platform: () => patch.platform ?? "darwin",
        homedir: () => "/home/owned",
        tmpdir: () => "/var/tmp/owned",
      },
      16928: {
        ...path.posix,
        resolve: (x: string) => (x === "." ? "/work" : path.posix.resolve(x)),
      },
      73024: {
        existsSync: (p: string) => p === "/owned/policy",
        readFileSync: () => patch.policyFile ?? "{}",
      },
      24618: {
        SETTINGS_FILENAME: "settings.json",
        SETTINGS_LOCAL_FILENAME: "settings.local.json",
      },
      93039: {
        PathUtils: {
          getHomeDir: () => "/state/home",
          getProjectHomeDir: () => "/state/project",
        },
        CommandUtils: {
          isCommandAvailable: async (n: string) =>
            !(patch.missing ?? []).includes(n),
        },
        RipGrepUtils: {
          ensureRgConfig: async () => ({
            command: "/owned/rg",
            args: [],
            mode: "owned",
          }),
        },
      },
    },
    legacy: {
      initialize: async (c: any) => events.push(["initialize", c]),
      reset: async () => events.push(["reset"]),
      wrapWithSandbox: async (c: string) => {
        events.push(["wrap", c]);
        return "wrapped:" + c;
      },
    },
    ...patch.runtime,
  };
  const n = factory(runtime),
    turn: any = rules.turn;
  Object.assign(turn, patch.turn);
  const manager: any = Object.assign(new n.BashSandboxManagerImpl(), {
    settingsManager: {
      list: async () => {
        if (patch.settingsError) throw Error("unavailable");
        return settings;
      },
    },
    logger: Object.fromEntries(
      ["warn", "error", "info", "debug"].map((k) => [
        k,
        (...a: any[]) =>
          logs.push([k, ...a.map((x) => (x instanceof Error ? x.message : x))]),
      ]),
    ),
    sandboxTurnConfig: turn,
    execPolicy: { setUserRules: (v: any) => events.push(["policy", v]) },
    sensitiveCommandDetector: {
      setCommandSafetyRules: (v: any) => events.push(["safety", v]),
    },
  });
  return {
    n,
    manager,
    turn,
    rules,
    runtime,
    events,
    logs,
    setSettings: (s: any) => {
      settings = s;
    },
  };
}
export const BASH_SANDBOX_CASES: {
  name: string;
  run(factory: typeof createNativeBashSandboxManager): Promise<any>;
}[] = [
  {
    name: "manager merges defaults with custom paths and protects scoped settings",
    async run(factory) {
      const f = bashSandboxFixture(factory, {
        settings: {
          sandbox: {
            filesystem: {
              allowWrite: [
                "/custom",
                "/custom",
                "~/.codebuddy/skills/a",
                "~/.codebuddy/log",
              ],
              denyRead: ["/private"],
            },
            extraAllowWrite: ["~/extra"],
          },
        },
      });
      const c = await f.manager.getConfig();
      assert.equal(c.enabled, false);
      assert.equal(
        c.filesystem.allowWrite.filter((p: string) => p === "/custom").length,
        1,
      );
      assert.ok(
        c.filesystem.allowWrite.includes("/home/owned/.codebuddy/skills/a"),
      );
      assert.ok(c.filesystem.allowWrite.includes("/state/home/log"));
      assert.ok(c.filesystem.allowWrite.includes("/private/var/tmp/owned"));
      assert.ok(
        c.filesystem.denyWrite.includes("/state/project/settings.local.json"),
      );
      return c;
    },
  },
  {
    name: "turn config controls reported enabled state independently from settings",
    async run(factory) {
      const f = bashSandboxFixture(factory, {
        settings: { sandbox: { enabled: true } },
      });
      assert.equal((await f.manager.getConfig()).enabled, false);
      f.turn.useSandboxCLI = true;
      assert.equal((await f.manager.getConfig()).enabled, true);
      assert.equal((await f.manager.loadConfig()).enabled, true);
      return f.manager.getConfig();
    },
  },
  {
    name: "managed policy overrides user network and adds protected paths",
    async run(factory) {
      const policy = {
        clientSecurity: {
          config: {
            sandbox: {
              networkAccess: {
                mode: "deny_all_with_whitelist",
                whitelistDomains: ["managed.test"],
                blacklistDomains: ["blocked.test"],
              },
              fileProtection: {
                protectPaths: ["~/protected"],
                whitelist: ["~/allowed"],
              },
              commandControl: {
                allowPrefixes: ["git status"],
                askPrefixes: ["rm"],
              },
            },
            dataSecurity: { deleteProtection: true },
          },
        },
      };
      const f = bashSandboxFixture(factory, {
        env: { ACC_PRODUCT_CONFIG_V3: JSON.stringify(policy) },
        settings: { sandbox: { network: { allowedDomains: ["user.test"] } } },
      });
      const c = await f.manager.getConfig();
      assert.deepEqual(c.network.allowedDomains, ["managed.test"]);
      assert.equal(c.network.denyAll, true);
      assert.ok(c.filesystem.denyRead.includes("/home/owned/protected"));
      assert.equal(c.safeDeleteRuntimeEnabled, true);
      return { c, events: f.events };
    },
  },
  {
    name: "policy precedence skips malformed V3, reads V2 then file only as fallback",
    async run(factory) {
      const v = {
        clientSecurity: {
          config: { dataSecurity: { deleteProtection: true } },
        },
      };
      const f = bashSandboxFixture(factory, {
        env: {
          ACC_PRODUCT_CONFIG_V3: "invalid",
          ACC_PRODUCT_CONFIG_V2: JSON.stringify(v),
          ACC_PRODUCT_CONFIG_PATH: "/owned/policy",
        },
        policyFile: JSON.stringify({
          clientSecurity: {
            config: { dataSecurity: { deleteProtection: false } },
          },
        }),
      });
      assert.equal(
        f.n.readManagedSecurityPolicyFromEnv().dataSecurity
          .deleteProtectionEnabled,
        true,
      );
      delete f.runtime.process.env.ACC_PRODUCT_CONFIG_V2;
      assert.equal(
        f.n.readManagedSecurityPolicyFromEnv().dataSecurity
          .deleteProtectionEnabled,
        false,
      );
      return f.n.readManagedSecurityPolicyFromEnv();
    },
  },
  {
    name: "load failure preserves original shallow fallback and getConfig turn enabled",
    async run(factory) {
      const f = bashSandboxFixture(factory, {
        settingsError: true,
        turn: { useSandboxCLI: true },
      });
      const c = await f.manager.getConfig();
      assert.equal(c.enabled, true);
      assert.equal(
        c.filesystem,
        f.n.getModule(20852).DEFAULT_SANDBOX_CONFIG.filesystem,
      );
      return { config: c, logs: f.logs };
    },
  },
  {
    name: "Windows native directory globs expand drive paths only",
    async run(factory) {
      const f = bashSandboxFixture(factory, { platform: "win32" });
      const source = [
        "C:\\Users\\owned\\",
        "D:/folder/",
        "/posix/",
        "C:\\file.txt",
        "C:\\Users\\owned\\**",
      ];
      const result = f.n.expandWindowsNativeDirectoryGlobs(source);
      assert.ok(result.includes("D:\\folder\\**"));
      assert.equal(
        result.filter((x: string) => x === "C:\\Users\\owned\\**").length,
        1,
      );
      return result;
    },
  },
  {
    name: "original parser extracts command roots through prefixes variables and operators",
    async run(factory) {
      const f = bashSandboxFixture(factory);
      const input =
        "CMD=wmic sudo $CMD process list && cd /tmp; env A=1 /usr/bin/git status | C:\\Windows\\sc.exe query";
      const roots = f.manager.getCommandRoots(input);
      assert.deepEqual(roots, ["wmic", "git", "sc.exe"]);
      assert.equal(f.manager.isSystemLevelTool(input), true);
      return roots;
    },
  },
  {
    name: "excluded commands and disabled configs prevent sandbox wrapping",
    async run(factory) {
      const f = bashSandboxFixture(factory, {
        settings: { sandbox: { enabled: true, excludedCommands: ["git"] } },
      });
      assert.equal(await f.manager.shouldSandbox("sudo git status"), false);
      assert.equal(await f.manager.shouldSandbox("node app.js"), true);
      assert.equal(await f.manager.wrapCommand("node app.js"), "node app.js");
      assert.equal(await f.manager.wrapCommand(null), "");
      return f.events;
    },
  },
  {
    name: "Linux missing dependencies report bubblewrap without initializing backend",
    async run(factory) {
      const f = bashSandboxFixture(factory, {
        platform: "linux",
        missing: ["bwrap"],
        settings: { sandbox: { enabled: true } },
      });
      const error = await f.manager.checkDependencies();
      assert.deepEqual(error.missingDependencies, ["bwrap"]);
      assert.match(error.message, /bubblewrap/);
      await f.manager.ensureSandboxReady();
      assert.equal(f.manager.initialized, false);
      assert.equal(
        f.events.some((x) => x[0] === "initialize"),
        false,
      );
      return { message: error.message, events: f.events };
    },
  },
  {
    name: "Linux explicit engine initializes caches config and resets on change",
    async run(factory) {
      const f = bashSandboxFixture(factory, {
        platform: "linux",
        settings: { sandbox: { enabled: true } },
      });
      assert.equal(
        await f.manager.wrapCommand("node a.js"),
        "wrapped:node a.js",
      );
      await f.manager.ensureSandboxReady();
      assert.equal(f.events.filter((x) => x[0] === "initialize").length, 1);
      f.setSettings({ sandbox: { enabled: false } });
      await f.manager.ensureSandboxReady();
      assert.equal(f.manager.initialized, false);
      assert.equal(f.events.filter((x) => x[0] === "reset").length, 1);
      return f.events;
    },
  },
  {
    name: "policy and safety updates deduplicate serialization and retain object references",
    async run(factory) {
      const f = bashSandboxFixture(factory),
        p = { allow: ["git"] },
        c = { ask: ["rm"] };
      f.manager.syncExecPolicyUserRules(p);
      f.manager.syncExecPolicyUserRules({ allow: ["git"] });
      f.manager.syncCommandSafetyRules(c);
      f.manager.syncCommandSafetyRules(c);
      assert.equal(f.events.length, 2);
      assert.equal(f.events[0][1], p);
      assert.equal(f.events[1][1], c);
      return f.events;
    },
  },
  {
    name: "runtime projection preserves explicit ripgrep and search-depth options",
    async run(factory) {
      const f = bashSandboxFixture(factory);
      const rg = { command: "/chosen/rg", args: ["--hidden"] };
      const c = await f.manager.toRuntimeConfig({
        ripgrep: rg,
        mandatoryDenySearchDepth: 0,
        ignoreViolations: {},
      });
      assert.equal(c.ripgrep, rg);
      assert.equal(c.mandatoryDenySearchDepth, 0);
      assert.equal(f.manager.isConfigEqual({ a: [1] }, { a: [1] }), true);
      assert.equal(f.manager.isConfigEqual({ a: [1] }, { a: [2] }), false);
      return c;
    },
  },
];
