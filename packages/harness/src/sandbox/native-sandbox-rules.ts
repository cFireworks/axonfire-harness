// @ts-nocheck
// Original inert rule/default factories, helpers and complete class. No decorators/bootstrap.
export const SANDBOX_RULES_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SANDBOX_RULES_BLOCKS = [
  ["ev", 10531879, 10531919],
  ["expandDomainWithWildcard", 10531919, 10532009],
  ["resolveSandboxRuleProfile", 10532009, 10532110],
  ["eS", 10532110, 10533284],
  ["expandComparableConfiguredPath", 10533284, 10533678],
  ["normalizeComparableRulePath", 10533678, 10533859],
  ["isSameOrChildPath", 10533859, 10533933],
  ["isWindowsAllowWriteNoBackupPath", 10533933, 10534157],
  ["eD", 10534157, 10540008],
] as const;
export const SANDBOX_RULES_MODULES = [
  [42017, 9515655, 9520766],
  [20852, 7256611, 7260867],
  [3246, 15683683, 15684278],
  [78918, 15682893, 15683682],
] as const;
export const SANDBOX_RULES_CLASS = [10534164, 10540007, 24] as const;
export function createNativeSandboxRules(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit Sandbox rules process boundary required");
  const process = runtime.process;
  const factories = {
    42017(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          DEFAULT_SAFETY_FILTER_RULES: () => eh,
          FILE_ACTION_DELETE: () => ep,
          FILE_ACTION_EXECUTE: () => eg,
          FILE_ACTION_READ: () => eu,
          FILE_ACTION_WRITE: () => ed,
          buildSafetyFilterRules: () => buildSafetyFilterRules,
          classifySafety: () => classifySafety,
          getDefaultFileSafetyRulesForPlatform: () =>
            getDefaultFileSafetyRulesForPlatform,
          normalisePathForRuleMatch: () => normalisePathForRuleMatch,
          normalizeHomeTilde: () => normalizeHomeTilde,
        }));
      let eu = 1,
        ed = 2,
        ep = 4,
        eg = 8,
        eh = [
          { pathPattern: "~/.ssh/", level: "high" },
          { pathPattern: "~/.aws/", level: "high" },
          { pathPattern: "~/.gcp/", level: "high" },
          { pathPattern: "~/.gnupg/", level: "high" },
          { pathPattern: "~/.gpg/", level: "high" },
          { pathPattern: "~/.azure/", level: "high" },
          { pathPattern: "~/.config/gcloud/", level: "high" },
          { pathPattern: "~/.kube/config", level: "high" },
          { pathPattern: "~/.docker/config.json", level: "high" },
          { pathPattern: "~/.docker/daemon.json", level: "high" },
          { pathPattern: "~/.netrc", level: "high" },
          { pathPattern: "~/.npmrc", level: "high" },
          { pathPattern: "~/.pypirc", level: "high" },
          { pathPattern: "~/.gem/credentials", level: "high" },
          { pathPattern: "~/.config/gh/hosts.yml", level: "high" },
          { pathPattern: "~/.git-credentials", level: "high" },
          {
            pathPattern: "~/.terraform.d/credentials.tfrc.json",
            level: "high",
          },
          { pathPattern: "~/library/keychains/", level: "high" },
          {
            pathPattern:
              "~/Library/Application Support/CodeBuddyExtension/Data/Public/auth/",
            level: "high",
          },
          {
            pathPattern: "~/AppData/Local/CodeBuddyExtension/Data/Public/auth/",
            level: "high",
          },
          {
            pathPattern: "~/.local/share/CodeBuddyExtension/Data/Public/auth/",
            level: "high",
          },
          { pathPattern: "~/.codebuddy/settings.json", level: "high" },
          { pathPattern: "~/.codebuddy/settings.local.json", level: "high" },
          { pathPattern: "~/.workbuddy/settings.json", level: "high" },
          { pathPattern: "~/.workbuddy/settings.local.json", level: "high" },
        ],
        ef = [
          { pathPattern: ".codebuddy/settings.json", level: "high" },
          { pathPattern: ".codebuddy/settings.local.json", level: "high" },
        ];
      function normalizeHomeTilde(eA) {
        return eA ? eA.replace(/^[\uFF5E\u301C]/, "~") : eA;
      }
      function buildSafetyFilterRules(eA) {
        if (!eA) return eh;
        let el = [];
        for (let ec of eA.allowlist ?? [])
          el.push({
            pathPattern: normalizeHomeTilde(ec),
            level: "low",
            source: "user-allowlist",
          });
        for (let ec of eA.blocklist ?? [])
          el.push({
            pathPattern: normalizeHomeTilde(ec),
            level: "high",
            source: "user-blocklist",
          });
        return (el.push(...eh), el);
      }
      function getDefaultFileSafetyRulesForPlatform(eA) {
        let el = "win32" === eA,
          ec = "darwin" === eA,
          eu = [];
        for (let eA of eh)
          isPathApplicable(eA.pathPattern, el, ec) &&
            "low" === eA.level &&
            eu.push(eA.pathPattern);
        return { allowlist: eu, blocklist: [] };
      }
      function isPathApplicable(eA, el, ec) {
        let eu = eA.toLowerCase();
        return eu.startsWith("~/appdata/") ||
          eu.startsWith("~/documents/powershell/") ||
          eu.startsWith("~/documents/windowspowershell/")
          ? el
          : eu.startsWith("~/library/keychains/")
            ? ec
            : !(
                "~/.bashrc" === eu ||
                "~/.bash_profile" === eu ||
                "~/.zshrc" === eu ||
                "~/.zprofile" === eu ||
                "~/.profile" === eu ||
                eu.startsWith("~/.cache/") ||
                eu.startsWith("~/.local/") ||
                eu.startsWith("~/go/") ||
                eu.startsWith("~/.gnupg/") ||
                eu.startsWith("~/.gpg/")
              ) || !el;
      }
      let em =
        /^(?:\/Users\/[^/]+|\/home\/[^/]+|[A-Z]:[/\\]Users[/\\][^/\\]+)/i;
      function normalisePathForRuleMatch(eA, el) {
        let ec = eA.replace(/\\/g, "/"),
          eu = ec.match(/^(.+)\/\.!\d+!([^/]+)$/);
        if ((eu && (ec = `${eu[1]}/${eu[2]}`), el)) {
          let eA = el.replace(/\\/g, "/");
          ec.toLowerCase().startsWith(eA.toLowerCase()) &&
            (ec = "~" + ec.slice(eA.length));
        } else {
          let eA = ec.match(em);
          eA && (ec = "~" + ec.slice(eA[0].length));
        }
        return (ec = ec.replace(/\\/g, "/")).toLowerCase();
      }
      function classifyFileRisk(eA, el) {
        for (let ec of el) {
          let el = ec.pathPattern.toLowerCase();
          if (el.endsWith("*")) {
            let eu = el.slice(0, -1);
            if (eA.startsWith(eu) && !eA.slice(eu.length).includes("/"))
              return { level: ec.level, matchedRule: ec };
          } else if (el.endsWith("/")) {
            if (eA.startsWith(el)) return { level: ec.level, matchedRule: ec };
          } else if (eA === el || eA.startsWith(el + "/"))
            return { level: ec.level, matchedRule: ec };
        }
        return { level: "unknown" };
      }
      function classifyProjectSettingsRisk(eA, el) {
        let ec = eA.replace(/\\/g, "/").toLowerCase(),
          eu = el.workspacePath
            .replace(/\\/g, "/")
            .replace(/\/+$/, "")
            .toLowerCase();
        for (let eA of ef)
          if (ec === `${eu}/${eA.pathPattern}`)
            return { level: eA.level, matchedRule: eA };
      }
      function shouldAutoApprove(eA, el) {
        switch (eA) {
          case "low":
            return !0;
          case "medium":
            return "bypass" === el;
          case "unknown":
          case "high":
            return !1;
        }
      }
      function classifySafety(eA, el = eh) {
        let { fileBlocks: ec, context: eu, commandOverride: ed } = eA,
          ep = [],
          eg = [],
          ef = [];
        for (let eA of ec) {
          let { level: ec, matchedRule: ed } = classifyFileRisk(
            normalisePathForRuleMatch(eA.path),
            el,
          );
          if (ed) {
            ef.push({ record: eA, level: ec, matchedRule: ed });
            continue;
          }
          let ep = classifyProjectSettingsRisk(eA.path, eu);
          ef.push({
            record: eA,
            level: ep?.level ?? ec,
            matchedRule: ep?.matchedRule,
          });
        }
        for (let eA of ef)
          shouldAutoApprove(eA.level, eu.mode) ? ep.push(eA) : eg.push(eA);
        if ("allow" === ed && eg.length > 0) {
          let eA = eg.filter(shouldKeepApprovalWithCommandAllow),
            el = eg.filter((eA) => !shouldKeepApprovalWithCommandAllow(eA));
          return (
            ep.push(...el.map((eA) => ({ ...eA, level: "low" }))),
            {
              autoApprove: ep,
              needsApproval: eA,
              commandAllowDowngradedCount: el.length,
            }
          );
        }
        return {
          autoApprove: ep,
          needsApproval: eg,
          commandAllowDowngradedCount: 0,
        };
      }
      function shouldKeepApprovalWithCommandAllow(eA) {
        return (
          "high" === eA.level || eA.matchedRule?.source === "user-blocklist"
        );
      }
    },
    20852(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          BashSandboxManager: () => ep,
          DEFAULT_SANDBOX_CONFIG: () => eE,
          FILE_BACKUP_DEFAULT_MAX_SIZE_MB: () =>
            eu.FILE_BACKUP_DEFAULT_MAX_SIZE_MB,
          FILE_BACKUP_MAX_SIZE_MB: () => eu.FILE_BACKUP_MAX_SIZE_MB,
          FILE_BACKUP_MIN_SIZE_MB: () => eu.FILE_BACKUP_MIN_SIZE_MB,
          SANDBOX_SETTING_KEY: () => eC,
          SYSTEM_LEVEL_TOOLS: () => ed,
          SandboxDependencyError: () => SandboxDependencyError,
          WINDOWS_RECYCLE_BIN_ALLOW_WRITE_PATH: () => eh,
          getDefaultSandboxAllowWritePath: () =>
            getDefaultSandboxAllowWritePath,
          getDefaultSandboxFilesystemConfig: () =>
            getDefaultSandboxFilesystemConfig,
          isSafeDeleteRuntimeEnabledInSandboxConfig: () =>
            isSafeDeleteRuntimeEnabledInSandboxConfig,
        }));
      var eu = ec(3246);
      let ed = new Set([
        "wsl",
        "wsl.exe",
        "wslconfig",
        "wslconfig.exe",
        "wmic",
        "wmic.exe",
        "sc",
        "sc.exe",
        "reg",
        "reg.exe",
        "schtasks",
        "schtasks.exe",
      ]);
      let SandboxDependencyError = class SandboxDependencyError extends Error {
        constructor(eA, el) {
          (super(eA),
            (this.missingDependencies = el),
            (this.name = "SandboxDependencyError"));
        }
      };
      let ep = Symbol("BashSandboxManager"),
        eg = "win32" === process.platform ? "**" : "/",
        eh = "**\\$RECYCLE.BIN\\**",
        ef = [
          "~/.ssh/",
          "~/.aws/",
          "~/.gcp/",
          "~/.gnupg/",
          "~/.gpg/",
          "~/.azure/",
          "~/.config/gcloud/",
          "~/.kube/config",
          "~/.docker/config.json",
          "~/.docker/daemon.json",
          "~/.netrc",
          "~/.npmrc",
          "~/.pypirc",
          "~/.gem/credentials",
          "~/.config/gh/hosts.yml",
          "~/.git-credentials",
          "~/.terraform.d/credentials.tfrc.json",
          "~/Library/Keychains/",
          "~/Library/Application Support/CodeBuddyExtension/Data/Public/auth/",
          "~/AppData/Local/CodeBuddyExtension/Data/Public/auth/",
          "~/.local/share/CodeBuddyExtension/Data/Public/auth/",
          "~/.codebuddy/settings.json",
          "~/.codebuddy/settings.local.json",
          "~/.workbuddy/settings.json",
          "~/.workbuddy/settings.local.json",
          ".codebuddy/settings.json",
          ".codebuddy/settings.local.json",
        ],
        em = {
          denyRead: [],
          allowWrite: [
            ".",
            "/dev/stdout",
            "/dev/stderr",
            "/dev/null",
            "/dev/tty",
            "/dev/dtracehelper",
            "/dev/autofs_nowait",
            "/tmp/codebuddy",
            "/private/tmp/codebuddy",
            "~/.npm/_logs",
            "~/.codebuddy/debug",
            "~/.codebuddy/statsig",
            "~/.workbuddy/plugin-marketplace-state-new",
            "~/.workbuddy/plugins",
            "~/.workbuddy/skills",
            "~/.workbuddy/skills-marketplace",
            "~/.workbuddy/connectors",
            "~/.workbuddy/connectors-marketplace",
            "~/.workbuddy/binaries",
            "~/.workbuddy/plans",
            "~/.codebuddy/skills",
            "~/.claude",
            "~/.codex",
            "~/.openclaw",
            "~/.hermes",
            "~/.agents/skills",
            "~/library/caches",
            "~/library/python",
            "~/.Trash",
            "~/.cache",
            "~/.local/bin",
            "~/.local/lib",
            "~/.local/share/pip",
            "~/.npm/_cacache",
            "~/.npm/_npx",
            "~/.pnpm-store",
            "~/.cargo/registry",
            "~/.cargo/bin",
            "~/.rustup",
            "~/go/bin",
            "~/go/pkg/mod/cache",
            "~/.gradle/caches",
            "~/.m2/repository",
            "~/.nuget/packages",
            "~/.bun",
            "~/.deno",
            "~/.npm-global",
            ...("win32" === process.platform ? [eh] : []),
            "~/appdata/local/temp",
            "~/appdata/local/pip/cache",
            "~/appdata/roaming/python",
            "~/appdata/roaming/pip",
            "~/appdata/roaming/npm-cache",
            "~/appdata/roaming/npm",
            "~/appdata/roaming/nuget",
            "~/appdata/local/pnpm-store",
            "~/appdata/local/nuget/packages",
            "~/appdata/local/codex",
            "~/appdata/local/hermes",
            "~/appdata/local/microsoft/windowsapps",
            "~/.agent-browser",
            "~/.browser-use",
            "~/.config/browseruse",
            "~/library/caches/ms-playwright",
            "~/library/application support/google/chrome",
            "~/library/application support/google/chrome for testing",
            "~/appdata/local/ms-playwright",
            "~/appdata/local/google/chrome",
            "~/appdata/local/google/chrome for testing",
            "~/appdata/local/microsoft/windows/caches",
            "~/.python_history",
            "~/.node_repl_history",
            "~/.wget-hsts",
            "~/appdata/local/microsoft/powershell",
            "~/appdata/local/packages",
            "C:\\Windows\\System32\\lxss",
            "**\\.git\\**",
            "**\\.githooks\\**",
          ],
          denyWrite: [...ef],
        };
      function getDefaultSandboxAllowWritePath() {
        return eg;
      }
      function isSafeDeleteRuntimeEnabledInSandboxConfig(eA) {
        return eA?.safeDeleteRuntimeEnabled !== !1;
      }
      function getDefaultSandboxFilesystemConfig(eA) {
        let el = [
          ...(isSafeDeleteRuntimeEnabledInSandboxConfig(eA) ? [eg] : []),
          ...(em.allowWrite ?? []),
        ];
        return {
          denyRead: [...(em.denyRead ?? [])],
          allowWrite: el,
          denyWrite: [...(em.denyWrite ?? [])],
        };
      }
      let eE = {
          enabled: !1,
          autoAllowBashIfSandboxed: !0,
          network: {
            allowedDomains: [],
            deniedDomains: [],
            allowLocalBinding: !1,
            allowUnixSockets: [],
            allowAllUnixSockets: !1,
          },
          filesystem: getDefaultSandboxFilesystemConfig({
            safeDeleteRuntimeEnabled: !0,
          }),
          excludedCommands: [],
          allowUnsandboxedCommands: !0,
          enableWeakerNestedSandbox: !1,
        },
        eC = "sandbox";
    },
    3246(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__createBinding) ||
          (Object.create
            ? function (eA, el, ec, eu) {
                void 0 === eu && (eu = ec);
                var ed = Object.getOwnPropertyDescriptor(el, ec);
                ((!ed ||
                  ("get" in ed
                    ? !el.__esModule
                    : ed.writable || ed.configurable)) &&
                  (ed = {
                    enumerable: !0,
                    get: function () {
                      return el[ec];
                    },
                  }),
                  Object.defineProperty(eA, eu, ed));
              }
            : function (eA, el, ec, eu) {
                (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
              }),
        ed =
          (this && this.__exportStar) ||
          function (eA, el) {
            for (var ec in eA)
              "default" === ec ||
                Object.prototype.hasOwnProperty.call(el, ec) ||
                eu(el, eA, ec);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ed(ec(68331), el),
        ed(ec(78918), el));
    },
    78918(eA, el) {
      "use strict";
      function coerceFileBackupMaxSizeMB(eA) {
        if ("number" != typeof eA || !Number.isFinite(eA)) return;
        let ec = Math.round(eA);
        return Math.min(
          el.FILE_BACKUP_MAX_SIZE_MB,
          Math.max(el.FILE_BACKUP_MIN_SIZE_MB, ec),
        );
      }
      function normalizeFileBackupMaxSizeMB(eA) {
        var ec;
        return null != (ec = coerceFileBackupMaxSizeMB(eA))
          ? ec
          : el.FILE_BACKUP_DEFAULT_MAX_SIZE_MB;
      }
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.normalizeFileBackupMaxSizeMB =
          el.coerceFileBackupMaxSizeMB =
          el.FILE_BACKUP_DEFAULT_MAX_SIZE_MB =
          el.FILE_BACKUP_MIN_SIZE_MB =
          el.FILE_BACKUP_MAX_SIZE_MB =
            void 0),
        (el.FILE_BACKUP_MAX_SIZE_MB = 0x7fffffff),
        (el.FILE_BACKUP_MIN_SIZE_MB = 1e3),
        (el.FILE_BACKUP_DEFAULT_MAX_SIZE_MB = 3e3),
        (el.coerceFileBackupMaxSizeMB = coerceFileBackupMaxSizeMB),
        (el.normalizeFileBackupMaxSizeMB = normalizeFileBackupMaxSizeMB));
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id);
    if (factories[id]) {
      const exports = {};
      cache.set(id, exports);
      factories[id]({ exports }, exports, getModule);
      return exports;
    }
    const value = runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit sandbox rules dependency required: " + id);
    return value;
  }
  getModule.r = (o: any) => {
    Object.defineProperty(o, "__esModule", { value: true });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag)
      Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  getModule.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      if (!Object.prototype.hasOwnProperty.call(o, k))
        Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  const moduleDefault = (value: any) =>
    value && value.__esModule ? () => value.default : () => value;
  const eg = moduleDefault(getModule(79896)),
    ef = moduleDefault(getModule(70857)),
    eE = moduleDefault(getModule(16928)),
    eC = getModule(20852),
    ey = getModule(42017),
    ew = getModule(93039),
    e_ = getModule(74674);
  let ev = Symbol("SandboxRuleSyncService");
  function expandDomainWithWildcard(eA) {
    return 2 === eA.split(".").length ? [eA, `*.${eA}`] : [eA];
  }
  function resolveSandboxRuleProfile(eA) {
    return "fullAccess" === eA ? "fullAccess-relaxed" : "default-strict";
  }
  let eS = [
      "~/.codebuddy/debug",
      "~/.codebuddy/statsig",
      "~/.workbuddy/plugin-marketplace-state-new",
      "~/.workbuddy/plugins",
      "~/.workbuddy/skills-marketplace",
      "~/.workbuddy/connectors",
      "~/.workbuddy/connectors-marketplace",
      "~/.workbuddy/binaries",
      "~/appdata/local/codex",
      "~/appdata/local/hermes",
      "~/appdata/local/temp",
      "~/appdata/local/pip/cache",
      "~/appdata/roaming/python",
      "~/appdata/roaming/pip",
      "~/appdata/roaming/npm-cache",
      "~/appdata/roaming/npm",
      "~/appdata/roaming/nuget",
      "~/appdata/local/pnpm-store",
      "~/appdata/local/nuget/packages",
      "~/appdata/local/microsoft/windowsapps",
      "~/appdata/local/ms-playwright",
      "~/appdata/local/google/chrome",
      "~/appdata/local/google/chrome for testing",
      "~/appdata/local/microsoft/windows/caches",
      "~/appdata/local/microsoft/powershell",
      "~/appdata/local/packages",
      "C:\\Windows\\System32\\lxss",
      eC.WINDOWS_RECYCLE_BIN_ALLOW_WRITE_PATH,
      "**\\.git\\**",
      "**\\.githooks\\**",
      "~/.cache",
      "~/.npm/_logs",
      "~/.npm/_cacache",
      "~/.npm/_npx",
      "~/.pnpm-store",
      "~/.cargo/registry",
      "~/.cargo/bin",
      "~/.rustup",
      "~/.gradle/caches",
      "~/.m2/repository",
      "~/.nuget/packages",
      "~/.bun",
      "~/.deno",
      "~/.npm-global",
    ],
    eQ = ["~/.python_history", "~/.node_repl_history", "~/.wget-hsts"];
  function expandComparableConfiguredPath(eA, el = {}) {
    let ec = (0, ey.normalizeHomeTilde)(eA),
      eu = el.homeDir ?? ef().homedir(),
      ed = el.codebuddyHome ?? ew.PathUtils.getHomeDir(),
      ep = "~/.codebuddy/skills";
    return ec === ep || ec.startsWith(`${ep}/`)
      ? eE().join(eu, ec.slice(1))
      : "~/.codebuddy" === ec || ec.startsWith("~/.codebuddy/")
        ? eE().join(ed, ec.slice(12))
        : "~" === ec
          ? eu
          : ec.startsWith("~")
            ? eE().join(eu, ec.slice(1))
            : ec;
  }
  function normalizeComparableRulePath(eA, el = {}) {
    let ec = expandComparableConfiguredPath(eA, el);
    return "*" === ec || "**" === ec
      ? ec
      : ec.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase() || "/";
  }
  function isSameOrChildPath(eA, el) {
    return eA === el || eA.startsWith(`${el}/`);
  }
  function isWindowsAllowWriteNoBackupPath(eA, el = {}) {
    let ec = normalizeComparableRulePath(eA, el);
    return (
      eS.some((eA) =>
        isSameOrChildPath(ec, normalizeComparableRulePath(eA, el)),
      ) || eQ.some((eA) => ec === normalizeComparableRulePath(eA, el))
    );
  }
  let eD = class {
    async syncRulesOnTurnStart(eA, el) {
      let ec = await this.bashSandboxManager.getConfig();
      ec &&
        (await this.syncRules(
          eA,
          el ?? this.turnConfig.permissionMode,
          "turn-start",
          ec,
        ));
    }
    async syncRules(eA, el, ec, eu, ed) {
      let ep = resolveSandboxRuleProfile(el ?? this.turnConfig.permissionMode),
        eg = this.buildTurnFileRules(eu, ep),
        eh = "fullAccess-relaxed" === ep ? [] : this.buildNetworkRules(eu);
      (await this.setFileRules(eA, eg, `${ec}:${ep}`),
        await this.setNetworkRules(eA, eh, `${ec}:${ep}`));
      let ef = void 0 === ed ? "" : ` generation=${ed}`;
      this.logger.info?.(
        `[SandboxRuleSync] reason=${ec} sessionId=${eA} permissionMode=${el ?? this.turnConfig.permissionMode ?? "<unset>"} ruleProfile=${ep} platform=${this.getPlatform()} fileRules=${eg.length} networkRules=${eh.length} skippedRuleTypes=${"fullAccess-relaxed" === ep ? "read_only,no_access,network" : "<none>"}` +
          ef,
      );
    }
    buildNetworkRules(eA) {
      let el = [],
        ec = eA.network;
      if (ec && !1 !== eA.networkPolicyEnabled) {
        let eA = !0 === ec.denyAll;
        if (eA)
          for (let eA of ec.allowedDomains ?? [])
            for (let ec of expandDomainWithWildcard(eA))
              el.push({ endpoint: ec, type: "inherit_user", source: "global" });
        for (let eu of (eA &&
          el.push({ endpoint: "*", type: "no_access", source: "global" }),
        ec.deniedDomains ?? []))
          for (let eA of expandDomainWithWildcard(eu))
            el.push({ endpoint: eA, type: "no_access", source: "global" });
      }
      return el;
    }
    async setFileRules(eA, el, ec) {
      try {
        let eu = { rules: el },
          ed = await this.lifecycle
            .getClient()
            .sendRequest(eA, e_.SANDBOX_COMMANDS.SET_FILE_RULES, eu);
        return (
          this.logger.info?.(
            `[SandboxRuleSync] SetFileRules ${ec} completed | removed=${ed?.removedCount ?? "<unknown>"} added=${ed?.addedCount ?? el.length}`,
          ),
          !0
        );
      } catch (eA) {
        return (
          this.logger.info?.(
            `[SandboxRuleSync] SetFileRules ${ec} failed: ${eA?.message ?? eA}`,
          ),
          !1
        );
      }
    }
    async setNetworkRules(eA, el, ec) {
      try {
        let eu = { rules: el },
          ed = await this.lifecycle
            .getClient()
            .sendRequest(eA, e_.SANDBOX_COMMANDS.SET_NETWORK_RULES, eu);
        return (
          this.logger.info?.(
            `[SandboxRuleSync] SetNetworkRules ${ec} completed | removed=${ed?.removedCount ?? "<unknown>"} added=${ed?.addedCount ?? el.length}`,
          ),
          !0
        );
      } catch (eA) {
        return (
          this.logger.info?.(
            `[SandboxRuleSync] SetNetworkRules ${ec} failed: ${eA?.message ?? eA}`,
          ),
          !1
        );
      }
    }
    expandSecurityCenterPath(eA) {
      if ("string" != typeof eA) return eA;
      let el = (0, ey.normalizeHomeTilde)(eA);
      return "~" === el
        ? ef().homedir()
        : el.startsWith("~/")
          ? eE().join(ef().homedir(), el.slice(2))
          : el;
    }
    buildTurnFileRules(eA, el) {
      if ("fullAccess-relaxed" === el) return this.buildFullAccessFileRules(eA);
      let ec = this.buildConfiguredFileRules(eA);
      return (
        this.shouldAddRuntimeDefaultAllowWriteRule(eA) &&
          ec.push({
            path: this.getDefaultAllowWritePath(),
            type: "inherit_user",
            source: "global",
          }),
        this.isWindowsModifyBackupEnabled() &&
          ec.push(this.getWindowsModifyBackupRule()),
        ec.push(...this.getLowRiskFileRules()),
        ec
      );
    }
    buildFullAccessFileRules(eA) {
      return "win32" === this.getPlatform() && this.turnConfig.enableFileBackup
        ? [
            this.getWindowsModifyBackupRule(),
            ...this.buildConfiguredAllowWriteRules(eA, !0),
          ]
        : [
            {
              path: this.getDefaultAllowWritePath(),
              type: "inherit_user",
              source: "global",
            },
          ];
    }
    buildConfiguredFileRules(eA) {
      let el = [],
        ec = eA.filesystem;
      if (ec) {
        for (let eA of ec.denyRead ?? []) {
          let ec = this.isDirectoryRulePath(eA);
          el.push({
            path: eA,
            type: "no_access",
            source: "global",
            ...(ec ? { isDirectory: !0 } : {}),
          });
        }
        for (let eA of ec.allowWrite ?? [])
          el.push(...this.buildAllowWriteRule(eA));
        for (let eA of ec.denyWrite ?? []) {
          let ec = this.isDirectoryRulePath(eA);
          el.push({
            path: eA,
            type: "read_only",
            source: "global",
            ...(ec ? { isDirectory: !0 } : {}),
          });
        }
      }
      for (let ec of eA.fileSafety?.allowlist ?? []) {
        let eA = this.expandSecurityCenterPath(ec);
        el.push(...this.buildAllowWriteRule(eA));
      }
      return el;
    }
    buildConfiguredAllowWriteRules(eA, el) {
      let ec = [];
      for (let eu of eA.filesystem?.allowWrite ?? [])
        (!el || isWindowsAllowWriteNoBackupPath(eu)) &&
          ec.push(...this.buildAllowWriteRule(eu, !1));
      for (let eu of eA.fileSafety?.allowlist ?? []) {
        let eA = this.expandSecurityCenterPath(eu);
        (!el || isWindowsAllowWriteNoBackupPath(eA)) &&
          ec.push(...this.buildAllowWriteRule(eA, !1));
      }
      return ec;
    }
    buildAllowWriteRule(eA, el = !0) {
      if (el && !this.shouldSyncAllowWritePath(eA)) return [];
      let ec = this.isDirectoryRulePath(eA);
      return [
        {
          path: eA,
          type: "inherit_user",
          source: "global",
          ...(ec ? { isDirectory: !0 } : {}),
        },
      ];
    }
    getLowRiskFileRules() {
      let eA = ef().homedir();
      return ey.DEFAULT_SAFETY_FILTER_RULES.filter(
        (eA) => "low" === eA.level && eA.pathPattern.endsWith("/"),
      )
        .map((el) => {
          let ec = el.pathPattern;
          return ec.startsWith("~/") ? eE().join(eA, ec.slice(2)) : ec;
        })
        .filter(
          (eA) =>
            !("win32" !== process.platform && /[/\\]appdata[/\\]/i.test(eA)),
        )
        .map((eA) => ({
          path: eA.replace(/\/+$/, ""),
          type: "inherit_user",
          source: "global",
          isDirectory: !0,
        }));
    }
    isDirectoryRulePath(eA) {
      return (
        !this.hasDirectoryGlobSuffix(eA) &&
        (!!this.hasDirectoryRuleSuffix(eA) || this.isValidDirectory(eA))
      );
    }
    hasDirectoryGlobSuffix(eA) {
      return eA.replace(/\\/g, "/").endsWith("/**");
    }
    hasDirectoryRuleSuffix(eA) {
      let el = eA.replace(/\\/g, "/");
      return el.endsWith("/") || el.endsWith("/**");
    }
    isValidDirectory(eA) {
      try {
        return eg().existsSync(eA) && eg().statSync(eA).isDirectory();
      } catch {
        return !1;
      }
    }
    getWindowsModifyBackupRule() {
      return {
        path: this.getDefaultAllowWritePath(),
        type: "modify_backup",
        source: "global",
      };
    }
    getConfiguredAllowWritePaths(eA) {
      return this.uniquePaths([
        ...(eA.filesystem?.allowWrite ?? []),
        ...(eA.fileSafety?.allowlist ?? []).map((eA) =>
          this.expandSecurityCenterPath(eA),
        ),
      ]);
    }
    shouldSyncAllowWritePath(eA) {
      return (
        !this.isWindowsModifyBackupEnabled() ||
        isWindowsAllowWriteNoBackupPath(eA)
      );
    }
    shouldAddRuntimeDefaultAllowWriteRule(eA) {
      return (
        !this.isWindowsModifyBackupEnabled() &&
        !!this.turnConfig.safeDeleteRuntimeEnabled &&
        !this.getConfiguredAllowWritePaths(eA).includes(
          this.getDefaultAllowWritePath(),
        )
      );
    }
    isWindowsModifyBackupEnabled() {
      return "win32" === this.getPlatform() && this.turnConfig.enableFileBackup;
    }
    getPlatform() {
      return this.platform ?? process.platform;
    }
    getDefaultAllowWritePath() {
      return "win32" === this.getPlatform()
        ? "**"
        : (0, eC.getDefaultSandboxAllowWritePath)();
    }
    uniquePaths(eA) {
      let el = new Set(),
        ec = [];
      for (let eu of eA)
        "string" != typeof eu || el.has(eu) || (el.add(eu), ec.push(eu));
      return ec;
    }
  };
  return {
    getModule,
    SandboxRuleSyncService: ev,
    SandboxRuleSyncServiceImpl: eD,
    expandDomainWithWildcard,
    resolveSandboxRuleProfile,
    expandComparableConfiguredPath,
    normalizeComparableRulePath,
    isSameOrChildPath,
    isWindowsAllowWriteNoBackupPath,
  };
}
