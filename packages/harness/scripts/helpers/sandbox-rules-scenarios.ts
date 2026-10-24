import assert from "node:assert/strict";
import * as path from "node:path";
import { createNativeSandboxRules } from "../../src/sandbox/native-sandbox-rules.js";
import { createNativeSandboxProtocol } from "../../src/sandbox/native-sandbox-protocol.js";
import { createNativeSandboxTurnConfig } from "../../src/sandbox/native-sandbox-turn-config.js";
export function sandboxRulesFixture(
  factory = createNativeSandboxRules,
  options: any = {},
) {
  const protocol = createNativeSandboxProtocol(),
    turn: any = new (createNativeSandboxTurnConfig().SandboxTurnConfigImpl)();
  Object.assign(turn, options.turn);
  const calls: any[] = [],
    logs: any[] = [];
  const runtime = {
    process: { platform: options.platform ?? "linux" },
    modules: {
      68331: protocol.getModule(68331),
      74674: protocol.getModule(74674),
      79896: {
        existsSync: (p: string) => p === "/directory" || p === "/throws",
        statSync: (p: string) => {
          if (p === "/throws") throw Error("stat failed");
          return { isDirectory: () => true };
        },
      },
      70857: { homedir: () => "/users/owned" },
      16928: path.posix,
      93039: { PathUtils: { getHomeDir: () => "/state/codebuddy" } },
      ...options.modules,
    },
  };
  const n = factory(runtime);
  const service: any = Object.assign(new n.SandboxRuleSyncServiceImpl(), {
    turnConfig: turn,
    bashSandboxManager: { getConfig: async () => options.config },
    logger: { info: (s: string) => logs.push(s) },
    lifecycle: {
      getClient: () => ({
        sendRequest: async (...args: any[]) => {
          calls.push(args);
          if (options.fail === args[1]) throw Error("owned rejection");
          return { addedCount: args[2].rules.length, removedCount: 0 };
        },
      }),
    },
  });
  return { n, service, turn, protocol, runtime, calls, logs };
}
export const SANDBOX_RULES_CASES: {
  name: string;
  run(factory: typeof createNativeSandboxRules): Promise<any>;
}[] = [
  {
    name: "default strict network order expands only two-label domains",
    async run(factory) {
      const f = sandboxRulesFixture(factory);
      const rules = f.service.buildNetworkRules({
        network: {
          denyAll: true,
          allowedDomains: ["example.com", "api.example.com"],
          deniedDomains: ["blocked.org"],
        },
      });
      assert.deepEqual(
        rules.map((r: any) => r.endpoint),
        [
          "example.com",
          "*.example.com",
          "api.example.com",
          "*",
          "blocked.org",
          "*.blocked.org",
        ],
      );
      assert.equal(rules[3].type, "no_access");
      assert.deepEqual(
        f.service.buildNetworkRules({
          networkPolicyEnabled: false,
          network: { denyAll: true },
        }),
        [],
      );
      return rules;
    },
  },
  {
    name: "configured file order preserves directory and glob distinctions",
    async run(factory) {
      const f = sandboxRulesFixture(factory);
      const result = f.service.buildConfiguredFileRules({
        filesystem: {
          denyRead: ["/private/", "/private/**"],
          allowWrite: ["/directory", "/missing", "/throws"],
          denyWrite: ["/read-only\\"],
        },
        fileSafety: { allowlist: ["～/allowed/"] },
      });
      assert.deepEqual(
        result.map((r: any) => r.type),
        [
          "no_access",
          "no_access",
          "inherit_user",
          "inherit_user",
          "inherit_user",
          "read_only",
          "inherit_user",
        ],
      );
      assert.equal(result[0].isDirectory, true);
      assert.equal(result[1].isDirectory, undefined);
      assert.equal(result[2].isDirectory, true);
      assert.equal(result[4].isDirectory, undefined);
      assert.equal(result.at(-1).path, "/users/owned/allowed/");
      return result;
    },
  },
  {
    name: "safe delete runtime default is added only when absent",
    async run(factory) {
      const f = sandboxRulesFixture(factory);
      assert.equal(
        f.service.buildTurnFileRules({}, "default-strict")[0].path,
        "/",
      );
      const once = f.service.buildTurnFileRules(
        { filesystem: { allowWrite: ["/"] } },
        "default-strict",
      );
      assert.equal(once.length, 1);
      f.turn.safeDeleteRuntimeEnabled = false;
      assert.deepEqual(f.service.buildTurnFileRules({}, "default-strict"), []);
      return once;
    },
  },
  {
    name: "fullAccess sync sends global file access and clears network rules",
    async run(factory) {
      const f = sandboxRulesFixture(factory, {
        turn: { permissionMode: "fullAccess" },
        config: {
          filesystem: { denyRead: ["/secret"] },
          network: { denyAll: true },
        },
      });
      await f.service.syncRulesOnTurnStart("s");
      assert.equal(f.calls.length, 2);
      assert.deepEqual(f.calls[0][2], {
        rules: [{ path: "/", type: "inherit_user", source: "global" }],
      });
      assert.deepEqual(f.calls[1][2], { rules: [] });
      return f.calls;
    },
  },
  {
    name: "Windows modify-backup permits only exact no-backup paths and descendants",
    async run(factory) {
      const f = sandboxRulesFixture(factory, {
        platform: "win32",
        turn: { enableFileBackup: true },
      });
      const config = {
        filesystem: {
          allowWrite: [
            "~/.cache",
            "~/.cache/sub",
            "~/.cacheevil",
            "/custom",
            "~/.python_history/child",
            "~/.python_history",
          ],
        },
      };
      const result = f.service.buildFullAccessFileRules(config);
      assert.equal(result[0].type, "modify_backup");
      assert.equal(result[0].path, "**");
      assert.deepEqual(
        result.slice(1).map((r: any) => r.path),
        ["~/.cache", "~/.cache/sub", "~/.python_history"],
      );
      return result;
    },
  },
  {
    name: "rule comparison expands original home aliases and normalizes case/slashes",
    async run(factory) {
      const f = sandboxRulesFixture(factory);
      const paths = [
        "～/.codebuddy/debug",
        "~/.codebuddy/skills/a",
        "~/APPDATA/LOCAL/TEMP/",
        "C:\\Windows\\System32\\lxss\\child",
        "~/.cacheevil",
      ];
      const expanded = paths.map((p) => f.n.expandComparableConfiguredPath(p));
      assert.equal(expanded[0], "/state/codebuddy/debug");
      assert.equal(expanded[1], "/users/owned/.codebuddy/skills/a");
      const allowed = paths.map((p) => f.n.isWindowsAllowWriteNoBackupPath(p));
      assert.deepEqual(allowed, [true, false, true, true, false]);
      return {
        expanded,
        allowed,
        normalized: f.n.normalizeComparableRulePath("C:\\Users\\Owned\\"),
      };
    },
  },
  {
    name: "file rule send failure is contained and network still follows",
    async run(factory) {
      const f = sandboxRulesFixture(factory, {
        fail: "SetFileRules",
        config: { network: { denyAll: true } },
      });
      await f.service.syncRulesOnTurnStart("s", "default");
      assert.deepEqual(
        f.calls.map((x) => x[1]),
        ["SetFileRules", "SetNetworkRules"],
      );
      assert.ok(f.logs.some((s) => s.includes("owned rejection")));
      return { calls: f.calls, logs: f.logs };
    },
  },
  {
    name: "network failure is contained and generation appears only in summary",
    async run(factory) {
      const f = sandboxRulesFixture(factory, { fail: "SetNetworkRules" });
      await f.service.syncRules("s", "default", "owned", {}, 7);
      assert.ok(f.logs.at(-1).endsWith(" generation=7"));
      return { calls: f.calls, logs: f.logs };
    },
  },
  {
    name: "absent sandbox config skips sends while config errors propagate",
    async run(factory) {
      const f = sandboxRulesFixture(factory);
      await f.service.syncRulesOnTurnStart("s");
      assert.equal(f.calls.length, 0);
      f.service.bashSandboxManager.getConfig = async () => {
        throw Error("settings unavailable");
      };
      await assert.rejects(
        f.service.syncRulesOnTurnStart("s"),
        /settings unavailable/,
      );
      return f.calls;
    },
  },
  {
    name: "permission override and shared turn configuration affect consecutive syncs",
    async run(factory) {
      const f = sandboxRulesFixture(factory, {
        config: { network: { denyAll: true } },
      });
      Object.assign(f.turn, { permissionMode: "fullAccess" });
      await f.service.syncRulesOnTurnStart("s");
      await f.service.syncRulesOnTurnStart("s", "default");
      assert.equal(f.calls[1][2].rules.length, 0);
      assert.equal(f.calls[3][2].rules[0].endpoint, "*");
      return f.calls;
    },
  },
  {
    name: "low risk rules retain process-platform filter even with instance override",
    async run(factory) {
      const f = sandboxRulesFixture(factory);
      const rules = f.n.getModule(42017).DEFAULT_SAFETY_FILTER_RULES;
      rules.push(
        { pathPattern: "~/AppData/Local/Temp/", level: "low" },
        { pathPattern: "~/cache/", level: "low" },
        { pathPattern: "~/file", level: "low" },
      );
      f.service.platform = "win32";
      const output = f.service.getLowRiskFileRules();
      assert.deepEqual(output, [
        {
          path: "/users/owned/cache",
          type: "inherit_user",
          source: "global",
          isDirectory: true,
        },
      ]);
      return output;
    },
  },
  {
    name: "original sandbox defaults retain platform paths and independent filesystem copies",
    async run(factory) {
      const f = sandboxRulesFixture(factory, { platform: "win32" }),
        n = f.n.getModule(20852);
      const a = n.getDefaultSandboxFilesystemConfig({
          safeDeleteRuntimeEnabled: false,
        }),
        b = n.getDefaultSandboxFilesystemConfig();
      assert.equal(b.allowWrite[0], "**");
      assert.equal(a.allowWrite.includes("**"), false);
      assert.ok(a.allowWrite.includes(n.WINDOWS_RECYCLE_BIN_ALLOW_WRITE_PATH));
      a.denyWrite.length = 0;
      assert.ok(b.denyWrite.length > 0);
      return {
        enabled: n.DEFAULT_SANDBOX_CONFIG.enabled,
        allowWrite: b.allowWrite,
        denyWrite: b.denyWrite,
        limits: [
          n.FILE_BACKUP_MIN_SIZE_MB,
          n.FILE_BACKUP_DEFAULT_MAX_SIZE_MB,
          n.FILE_BACKUP_MAX_SIZE_MB,
        ],
      };
    },
  },
];
SANDBOX_RULES_CASES.push(
  {
    name: "original safety classifier keeps high-risk paths despite command allow",
    async run(factory) {
      const f = sandboxRulesFixture(factory),
        n = f.n.getModule(42017);
      const result = n.classifySafety({
        fileBlocks: [
          { path: "/home/owned/.ssh/key" },
          { path: "/work/.codebuddy/settings.json" },
          { path: "/work/unclassified.txt" },
        ],
        context: { workspacePath: "/work", mode: "bypass" },
        commandOverride: "allow",
      });
      assert.equal(result.autoApprove.length, 1);
      assert.equal(result.needsApproval.length, 2);
      assert.equal(result.commandAllowDowngradedCount, 1);
      return result;
    },
  },
  {
    name: "original explicit safety rules retain precedence and wildcard depth",
    async run(factory) {
      const f = sandboxRulesFixture(factory),
        n = f.n.getModule(42017);
      const rules = n.buildSafetyFilterRules({
        allowlist: ["～/.ssh/*"],
        blocklist: ["~/blocked/"],
      });
      const result = n.classifySafety(
        {
          fileBlocks: [
            { path: "C:\\Users\\owned\\.ssh\\single" },
            { path: "/Users/owned/.ssh/nested/key" },
            { path: "/Users/owned/blocked/file" },
          ],
          context: { workspacePath: "/work", mode: "default" },
          commandOverride: "allow",
        },
        rules,
      );
      assert.equal(result.autoApprove.length, 1);
      assert.equal(result.needsApproval.length, 2);
      assert.equal(result.commandAllowDowngradedCount, 0);
      assert.equal(
        n.normalisePathForRuleMatch("/home/owned/.!123!file"),
        "~/file",
      );
      return result;
    },
  },
);

import { sandboxCliFixture } from "./sandbox-cli-fixture.js";
import { createNativeSandboxServices } from "../../src/sandbox/native-sandbox-services.js";
SANDBOX_RULES_CASES.push({
  name: "parent rule and Bash tokens survive both module and resolver assembly",
  async run(factory) {
    const rules = sandboxRulesFixture(factory);
    const cli = sandboxCliFixture();
    const modules = {
      ...cli.runtime.modules,
      ...rules.runtime.modules,
      64187: rules.n,
      20852: rules.n.getModule(20852),
    };
    const manager = { getConfig: async () => ({}) };
    for (const resolveOnly of [false, true]) {
      const runtime = {
        ...cli.runtime,
        modules: resolveOnly ? undefined : modules,
        getModule: (id: number) => (modules as any)[id],
      };
      const services = createNativeSandboxServices({
        runtime,
        logger: {},
        turnConfig: rules.turn,
        rules: { bashSandboxManager: manager },
      });
      assert.equal(services.ruleNamespace, rules.n);
      assert.equal(services.ruleSync.turnConfig, rules.turn);
      assert.equal(services.ruleSync.lifecycle, services.lifecycle);
      assert.equal(
        services.bindings.get(rules.n.SandboxRuleSyncService),
        services.ruleSync,
      );
      assert.equal(
        services.bindings.get(rules.n.getModule(20852).BashSandboxManager),
        manager,
      );
    }
    return { paths: 2 };
  },
});
