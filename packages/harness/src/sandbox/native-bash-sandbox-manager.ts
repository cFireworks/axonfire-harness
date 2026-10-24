// @ts-nocheck
// Original complete manager/helpers and inert utility factories. No product bootstrap.
export const BASH_SANDBOX_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const BASH_SANDBOX_BLOCKS = [
  ["nN", 7325886, 7325972],
  ["parseSecurityCenter", 7325972, 7326077],
  ["readManagedSecurityPolicyFromEnv", 7326077, 7326439],
  ["nL", 7326947, 7326966],
  ["mergeUniqueStringArray", 7326966, 7327109],
  ["nF", 7327109, 7327154],
  ["buildWindowsNativeDirectoryGlobs", 7327154, 7327402],
  ["expandWindowsNativeDirectoryGlobs", 7327402, 7327625],
  ["nU", 7327625, 7336372],
] as const;
export const BASH_SANDBOX_MODULES = [
  [67198, 13016733, 13016840],
  [38792, 4367013, 4367800],
  [93289, 6501773, 6501840],
  [69897, 6504193, 6504557],
  [50158, 6501841, 6504192],
  [71445, 15624594, 15626590],
] as const;
export const BASH_SANDBOX_STATICS = [7336372, 7336611] as const;
export function createNativeBashSandboxManager(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit BashSandbox process boundary required");
  const process = runtime.process,
    Bun = runtime.Bun,
    Math = runtime.Math ?? globalThis.Math;
  const factories = {
    67198(eA, el, ec) {
      eA.exports = function (eA, el) {
        return "u" > typeof Bun
          ? Bun.deepEquals(eA, el, !0)
          : ec(38792)(eA, el);
      };
    },
    38792(eA) {
      "use strict";
      eA.exports = function equal(eA, el) {
        if (eA === el) return !0;
        if (eA && el && "object" == typeof eA && "object" == typeof el) {
          if (eA.constructor !== el.constructor) return !1;
          if (Array.isArray(eA)) {
            if ((ec = eA.length) != el.length) return !1;
            for (eu = ec; 0 != eu--; ) if (!equal(eA[eu], el[eu])) return !1;
            return !0;
          }
          if (eA.constructor === RegExp)
            return eA.source === el.source && eA.flags === el.flags;
          if (eA.valueOf !== Object.prototype.valueOf)
            return eA.valueOf() === el.valueOf();
          if (eA.toString !== Object.prototype.toString)
            return eA.toString() === el.toString();
          if ((ec = (ed = Object.keys(eA)).length) !== Object.keys(el).length)
            return !1;
          for (eu = ec; 0 != eu--; )
            if (!Object.prototype.hasOwnProperty.call(el, ed[eu])) return !1;
          for (eu = ec; 0 != eu--; ) {
            var ec,
              eu,
              ed,
              ep = ed[eu];
            if (!equal(eA[ep], el[ep])) return !1;
          }
          return !0;
        }
        return eA != eA && el != el;
      };
    },
    93289(eA, el, ec) {
      "use strict";
      ((el.quote = ec(69897)), (el.parse = ec(50158)));
    },
    69897(eA) {
      "use strict";
      eA.exports = function (eA) {
        return eA
          .map(function (eA) {
            return "" === eA
              ? "''"
              : eA && "object" == typeof eA
                ? eA.op.replace(/(.)/g, "\\$1")
                : /["\s\\]/.test(eA) && !/'/.test(eA)
                  ? "'" + eA.replace(/(['])/g, "\\$1") + "'"
                  : /["'\s]/.test(eA)
                    ? '"' + eA.replace(/(["\\$`!])/g, "\\$1") + '"'
                    : String(eA).replace(
                        /([A-Za-z]:)?([#!"$&'()*,:;<=>?@[\\\]^`{|}])/g,
                        "$1\\$2",
                      );
          })
          .join(" ");
      };
    },
    50158(eA) {
      "use strict";
      for (
        var el =
            "(?:\\|\\||\\&\\&|;;|\\|\\&|\\<\\(|\\<\\<\\<|>>|>\\&|<\\&|[&;()|<>])",
          ec = RegExp("^" + el + "$"),
          eu = "|&;()<> \\t",
          ed = '"((\\\\"|[^"])*?)"',
          ep = "'((\\\\'|[^'])*?)'",
          eg = /^#$/,
          eh = "'",
          ef = '"',
          em = "$",
          eE = "",
          eC = 0x100000000,
          ey = 0;
        ey < 4;
        ey++
      )
        eE += (eC * Math.random()).toString(16);
      var ew = RegExp("^" + eE);
      function matchAll(eA, el) {
        for (var ec, eu = el.lastIndex, ed = []; (ec = el.exec(eA)); )
          (ed.push(ec), el.lastIndex === ec.index && (el.lastIndex += 1));
        return ((el.lastIndex = eu), ed);
      }
      function getVar(eA, el, ec) {
        var eu = "function" == typeof eA ? eA(ec) : eA[ec];
        return (void 0 === eu && "" != ec
          ? (eu = "")
          : void 0 === eu && (eu = "$"),
        "object" == typeof eu)
          ? el + eE + JSON.stringify(eu) + eE
          : el + eu;
      }
      function parseInternal(eA, eE, eC) {
        eC || (eC = {});
        var ey = eC.escape || "\\",
          ew = matchAll(
            eA,
            RegExp(
              [
                "(" + el + ")",
                "(" +
                  ("(\\" + ey + "['\"" + eu + "]|[^\\s'\"" + eu) +
                  "])+|" +
                  ed +
                  "|" +
                  ep +
                  ")+",
              ].join("|"),
              "g",
            ),
          );
        if (0 === ew.length) return [];
        eE || (eE = {});
        var eB = !1;
        return ew
          .map(function (el) {
            var eu,
              ed = el[0];
            if (ed && !eB) {
              if (ec.test(ed)) return { op: ed };
              var ep = !1,
                eC = !1,
                ew = "",
                e_ = !1;
              for (eu = 0; eu < ed.length; eu++) {
                var eI = ed.charAt(eu);
                if (((e_ = e_ || (!ep && ("*" === eI || "?" === eI))), eC))
                  ((ew += eI), (eC = !1));
                else if (ep)
                  eI === ep
                    ? (ep = !1)
                    : ep == eh
                      ? (ew += eI)
                      : eI === ey
                        ? ((eu += 1),
                          (eI = ed.charAt(eu)) === ef || eI === ey || eI === em
                            ? (ew += eI)
                            : (ew += ey + eI))
                        : eI === em
                          ? (ew += parseEnvVar())
                          : (ew += eI);
                else if (eI === ef || eI === eh) ep = eI;
                else if (ec.test(eI)) return { op: ed };
                else if (eg.test(eI)) {
                  eB = !0;
                  var ev = { comment: eA.slice(el.index + eu + 1) };
                  if (ew.length) return [ew, ev];
                  return [ev];
                } else
                  eI === ey
                    ? (eC = !0)
                    : eI === em
                      ? (ew += parseEnvVar())
                      : (ew += eI);
              }
              return e_ ? { op: "glob", pattern: ew } : ew;
            }
            function parseEnvVar() {
              eu += 1;
              var eA,
                el,
                ec = ed.charAt(eu);
              if ("{" === ec) {
                if (((eu += 1), "}" === ed.charAt(eu)))
                  throw Error("Bad substitution: " + ed.slice(eu - 2, eu + 1));
                if ((eA = ed.indexOf("}", eu)) < 0)
                  throw Error("Bad substitution: " + ed.slice(eu));
                ((el = ed.slice(eu, eA)), (eu = eA));
              } else if (/[*@#?$!_-]/.test(ec)) ((el = ec), (eu += 1));
              else {
                var ep = ed.slice(eu);
                (eA = ep.match(/[^\w\d_]/))
                  ? ((el = ep.slice(0, eA.index)), (eu += eA.index - 1))
                  : ((el = ep), (eu = ed.length));
              }
              return getVar(eE, "", el);
            }
          })
          .reduce(function (eA, el) {
            return void 0 === el ? eA : eA.concat(el);
          }, []);
      }
      eA.exports = function (eA, el, ec) {
        var eu = parseInternal(eA, el, ec);
        return "function" != typeof el
          ? eu
          : eu.reduce(function (eA, el) {
              if ("object" == typeof el) return eA.concat(el);
              var ec = el.split(RegExp("(" + eE + ".*?" + eE + ")", "g"));
              return 1 === ec.length
                ? eA.concat(ec[0])
                : eA.concat(
                    ec.filter(Boolean).map(function (eA) {
                      return ew.test(eA) ? JSON.parse(eA.split(eE)[1]) : eA;
                    }),
                  );
            }, []);
      };
    },
    71445(eA, el) {
      "use strict";
      function isObject(eA) {
        return "object" == typeof eA && null !== eA;
      }
      function toStringArray(eA) {
        return Array.isArray(eA)
          ? eA.filter((eA) => "string" == typeof eA)
          : [];
      }
      function toPrefixRules(eA) {
        return toStringArray(eA)
          .map((eA) => eA.trim().split(/\s+/).filter(Boolean))
          .filter((eA) => eA.length > 0)
          .map((eA) => ({ prefix: eA }));
      }
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.translateRemoteSecurityCenter = void 0),
        (el.translateRemoteSecurityCenter = function (eA) {
          if (!isObject(eA)) return { managed: !1 };
          let el = eA.config;
          if (!isObject(el)) return { managed: !1 };
          let ec = "sandbox" in el,
            eu = "dataSecurity" in el,
            ed = "runtime" in el,
            ep = { managed: ec || eu || ed },
            eg = el.sandbox;
          if (isObject(eg)) {
            ("boolean" == typeof eg.enabled && (ep.sandboxEnabled = eg.enabled),
              "boolean" == typeof eg.showDefaultPermission &&
                (ep.showDefaultPermission = eg.showDefaultPermission));
            let eA = eg.networkAccess;
            isObject(eA) &&
              (ep.network = {
                allowedDomains: toStringArray(eA.whitelistDomains),
                deniedDomains: toStringArray(eA.blacklistDomains),
                denyAll: "deny_all_with_whitelist" === eA.mode,
              });
            let el = eg.fileProtection;
            isObject(el) &&
              (ep.fileSafety = {
                blocklist: toStringArray(el.protectPaths),
                allowlist: toStringArray(el.whitelist),
              });
            let ec = eg.commandControl;
            isObject(ec) &&
              (ep.commandSafety = {
                allow: toPrefixRules(ec.allowPrefixes),
                ask: toPrefixRules(ec.askPrefixes),
              });
          }
          let eh = el.dataSecurity;
          if (isObject(eh)) {
            let eA =
              "number" == typeof eh.batchDeleteApprovalThreshold
                ? eh.batchDeleteApprovalThreshold
                : 0;
            ep.dataSecurity = {
              securityGatewayEnabled:
                "boolean" == typeof eh.secureGatewayEnabled
                  ? eh.secureGatewayEnabled
                  : void 0,
              transmissionEncryptionEnabled:
                "boolean" == typeof eh.transitEncryption
                  ? eh.transitEncryption
                  : void 0,
              deleteProtectionEnabled: !0 === eh.deleteProtection,
              batchDeleteApprovalThreshold: eA,
              safeDeleteRuntimeEnabled: !0 === eh.deleteProtection,
            };
          }
          let ef = el.runtime;
          if (isObject(ef)) {
            let eA = isObject(ef.tools) ? ef.tools : {};
            ep.bundledRuntime = {
              enabled: !1 !== ef.enabled,
              tools: {
                node: !1 !== eA.nodejs,
                python: !1 !== eA.python,
                gitBash: !1 !== eA.gitBash,
                brokeredShell: !1 !== eA.brokeredShell,
              },
            };
          }
          return ep;
        }));
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const mod = { exports: {} };
      cache.set(id, mod);
      factories[id](mod, mod.exports, getModule);
      return mod.exports;
    }
    const value = runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit BashSandbox module required: " + id);
    return value;
  }
  const commonDefault = (v: any) =>
    v && v.__esModule ? () => v.default : () => v;
  const eI = getModule(20852),
    r4 = commonDefault(getModule(70857)),
    r5 = commonDefault(getModule(16928)),
    ne = commonDefault(getModule(73024)),
    nD = commonDefault(getModule(67198)),
    nM = getModule(24618),
    nx = getModule(93039),
    nO = runtime.modules?.[9151] ?? getModule(71445),
    rV = getModule(93289);
  function legacy(name: string, args: any[]) {
    if (typeof runtime.legacy?.[name] !== "function")
      throw Error("Original Linux sandbox engine boundary required: " + name);
    return runtime.legacy[name](...args);
  }
  const nf = (...a: any[]) => legacy("initialize", a),
    nm = (...a: any[]) => legacy("wrapWithSandbox", a),
    nE = (...a: any[]) => legacy("reset", a);
  let eC;
  let nN = ["ACC_PRODUCT_CONFIG_V3", "ACC_PRODUCT_CONFIG_V2"],
    nP = "ACC_PRODUCT_CONFIG_PATH";
  function parseSecurityCenter(eA) {
    if (eA)
      try {
        let el = JSON.parse(eA);
        return el?.clientSecurity;
      } catch {
        return;
      }
  }
  function readManagedSecurityPolicyFromEnv(eA = process.env) {
    for (let el of nN) {
      let ec = parseSecurityCenter(eA[el]);
      if (null != ec) return (0, nO.translateRemoteSecurityCenter)(ec);
    }
    let el = eA[nP];
    if (el)
      try {
        if (ne().existsSync(el)) {
          let eA = parseSecurityCenter(ne().readFileSync(el, "utf-8"));
          if (null != eA) return (0, nO.translateRemoteSecurityCenter)(eA);
        }
      } catch {}
    return { managed: !1 };
  }
  let nL = new Set([]);
  function mergeUniqueStringArray(...eA) {
    let el = [];
    for (let ec of eA)
      if (Array.isArray(ec)) for (let eA of ec) el.includes(eA) || el.push(eA);
    return el;
  }
  let nF = /^(?:\\\\\?\\)?([a-zA-Z]):[\\/](.*)$/;
  function buildWindowsNativeDirectoryGlobs(eA) {
    let el = eA.match(nF);
    if (!el || !/[\\/]$/.test(eA)) return [];
    let ec = el[2].replace(/[\\/]+$/, "").replace(/[\\/]+/g, "\\"),
      eu = ec ? `${el[1]}:\\${ec}` : `${el[1]}:\\`;
    return [eu.endsWith("\\") ? `${eu}**` : `${eu}\\**`];
  }
  function expandWindowsNativeDirectoryGlobs(eA, el = process.platform) {
    let ec = [...(eA ?? [])];
    if ("win32" !== el) return ec;
    for (let el of eA ?? [])
      for (let eA of buildWindowsNativeDirectoryGlobs(el))
        ec.includes(eA) || ec.push(eA);
    return ec;
  }
  let nU = (eC = class {
    constructor() {
      this.initialized = !1;
    }
    async getConfig() {
      try {
        let eA = await this.loadConfig();
        return ((eA.enabled = this.sandboxTurnConfig.useSandboxCLI), eA);
      } catch (eA) {
        return (
          this.logger.error?.("Failed to get sandbox config", eA),
          {
            ...eI.DEFAULT_SANDBOX_CONFIG,
            enabled: this.sandboxTurnConfig.useSandboxCLI,
          }
        );
      }
    }
    async wrapCommand(eA) {
      if (!eA || "string" != typeof eA)
        return (
          this.logger.warn?.("Invalid command provided to wrapCommand"),
          eA || ""
        );
      if ("linux" !== r4().platform()) return eA;
      try {
        await this.ensureSandboxReady();
        let el = this.cachedConfig;
        if (!el?.enabled || !(await this.shouldSandbox(eA))) return eA;
        let ec = await nm(eA);
        return (
          this.logger.debug?.(`Command wrapped with sandbox: ${eA} -> ${ec}`),
          ec
        );
      } catch (el) {
        return (
          this.logger.error?.("Failed to wrap command with sandbox", el),
          eA
        );
      }
    }
    async shouldSandbox(eA) {
      try {
        let el = this.cachedConfig ?? (await this.loadConfig());
        if (!el?.enabled || !eA || "string" != typeof eA) return !1;
        let ec = new Set(el.excludedCommands ?? []),
          eu = this.getCommandRoots(eA).find((eA) => ec.has(eA) || nL.has(eA));
        if (eu)
          return (
            this.logger.debug?.(`Command excluded from sandbox: ${eu}`),
            !1
          );
        return !0;
      } catch (eA) {
        return (
          this.logger.error?.(
            "Failed to determine if command should be sandboxed",
            eA,
          ),
          !1
        );
      }
    }
    isSystemLevelTool(eA) {
      return this.getCommandRoots(eA).some((eA) =>
        eI.SYSTEM_LEVEL_TOOLS.has(eA.toLowerCase()),
      );
    }
    async ensureSandboxReady() {
      let eA = await this.loadConfig(),
        el = !this.isConfigEqual(this.cachedConfig, eA);
      (el || !this.initialized) &&
        (el &&
          this.logger.info?.("Sandbox configuration changed, applying changes"),
        await this.applyConfigChange(this.cachedConfig, eA),
        (this.cachedConfig = eA));
    }
    async applyConfigChange(eA, el) {
      let ec = this.initialized && eA?.enabled,
        eu = el.enabled;
      if (!ec && !eu)
        return void this.logger.debug?.("Sandbox remains disabled");
      if (ec && !eu) {
        (this.logger.info?.("Disabling sandbox"), await this.reset());
        return;
      }
      if (!ec && eu) {
        (this.logger.info?.("Enabling sandbox"), await this.initialize(el));
        return;
      }
      (this.logger.info?.("Sandbox config changed, reinitializing"),
        await this.reset(),
        await this.initialize(el));
    }
    async checkLinuxDependencies() {
      if ("linux" !== r4().platform()) return [];
      let eA = [];
      for (let el of ["socat", "bwrap"])
        (await nx.CommandUtils.isCommandAvailable(el)) || eA.push(el);
      return eA;
    }
    async checkDependencies() {
      let eA = await this.checkLinuxDependencies();
      if (eA.length > 0) {
        let el = eA.map((eA) => ("bwrap" === eA ? "bubblewrap" : eA));
        return new eI.SandboxDependencyError(
          `Sandbox requires the following dependencies on Linux: ${el.join(", ")}. Please install these packages.`,
          eA,
        );
      }
    }
    async initialize(eA) {
      if ("linux" !== r4().platform()) {
        ((this.initialized = !0),
          this.logger.info?.(
            `[BashSandboxManager] Sandbox enabled on ${r4().platform()} — delegating to sandbox-cli backend, skipping AnthropicSandboxManager.initialize`,
          ));
        return;
      }
      try {
        let el = await this.checkLinuxDependencies();
        if (el.length > 0) {
          let eA = el.map((eA) => ("bwrap" === eA ? "bubblewrap" : eA));
          (this.logger.warn?.(
            `Sandbox disabled: missing dependencies (${eA.join(", ")}). Use /sandbox command to see details.`,
          ),
            (this.initialized = !1));
          return;
        }
        let ec = await this.toRuntimeConfig(eA);
        (await nf(ec),
          (this.initialized = !0),
          this.logger.info?.(
            "Sandbox initialized successfully (legacy Linux backend)",
          ));
      } catch (eA) {
        throw (
          this.logger.error?.("Failed to initialize sandbox", eA),
          (this.initialized = !1),
          eA
        );
      }
    }
    async reset() {
      if (this.initialized) {
        if ("linux" !== r4().platform()) {
          this.initialized = !1;
          return;
        }
        try {
          (await nE(),
            (this.initialized = !1),
            this.logger.info?.(
              "Sandbox reset successfully (legacy Linux backend)",
            ));
        } catch (eA) {
          throw (
            this.logger.error?.("Failed to reset sandbox", eA),
            (this.initialized = !1),
            eA
          );
        }
      }
    }
    async loadConfig() {
      try {
        let eA = (await this.settingsManager.list()).sandbox,
          el = eA?.filesystem || {},
          ec = (0, eI.getDefaultSandboxFilesystemConfig)(eA),
          eu = {
            ...eI.DEFAULT_SANDBOX_CONFIG,
            ...(eA || {}),
            network: {
              allowedDomains: [],
              deniedDomains: [],
              ...eI.DEFAULT_SANDBOX_CONFIG.network,
              ...(eA?.network || {}),
            },
            filesystem: {
              ...ec,
              ...el,
              denyRead: mergeUniqueStringArray(ec.denyRead, el.denyRead),
              allowWrite: mergeUniqueStringArray(ec.allowWrite, el.allowWrite),
              denyWrite: mergeUniqueStringArray(ec.denyWrite, el.denyWrite),
            },
          },
          ed = readManagedSecurityPolicyFromEnv();
        if (
          (ed.managed &&
            (ed.network &&
              ((eu.network = {
                ...eu.network,
                allowedDomains: ed.network.allowedDomains,
                deniedDomains: ed.network.deniedDomains,
              }),
              (eu.network.denyAll = ed.network.denyAll)),
            ed.commandSafety && (eu.commandSafety = ed.commandSafety),
            ed.fileSafety &&
              (eu.fileSafety = {
                allowlist: ed.fileSafety.allowlist,
                blocklist: ed.fileSafety.blocklist,
              }),
            ed.dataSecurity &&
              ((eu.deleteProtection = ed.dataSecurity.deleteProtectionEnabled),
              (eu.safeDeleteRuntimeEnabled =
                ed.dataSecurity.safeDeleteRuntimeEnabled))),
          eu.fileSafety?.blocklist?.length && eu.filesystem)
        )
          for (let eA of eu.fileSafety.blocklist)
            (eu.filesystem.denyRead &&
              !eu.filesystem.denyRead.includes(eA) &&
              eu.filesystem.denyRead.push(eA),
              eu.filesystem.denyWrite &&
                !eu.filesystem.denyWrite.includes(eA) &&
                eu.filesystem.denyWrite.push(eA));
        eu.filesystem && (eu.filesystem = this.expandPaths(eu.filesystem));
        let ep = nx.PathUtils.getHomeDir(),
          eg = r4().tmpdir(),
          eh = eg.startsWith("/var/") ? r5().join("/private", eg) : eg,
          ef = [ep, eg, ...(eh !== eg ? [eh] : [])];
        if (eu.filesystem?.allowWrite) {
          for (let eA of ef)
            eu.filesystem.allowWrite.includes(eA) ||
              eu.filesystem.allowWrite.push(eA);
          for (let eA of eu.extraAllowWrite ?? []) {
            let el = eA.startsWith("~")
              ? r5().join(r4().homedir(), eA.slice(1))
              : eA;
            eu.filesystem.allowWrite.includes(el) ||
              eu.filesystem.allowWrite.push(el);
          }
        }
        let em = nx.PathUtils.getProjectHomeDir(),
          eE = [
            r5().join(ep, nM.SETTINGS_FILENAME),
            r5().join(ep, nM.SETTINGS_LOCAL_FILENAME),
            r5().join(em, nM.SETTINGS_FILENAME),
            r5().join(em, nM.SETTINGS_LOCAL_FILENAME),
            r5().join(ep, "logs"),
          ];
        if (eu.filesystem?.denyWrite)
          for (let eA of eE)
            eu.filesystem.denyWrite.includes(eA) ||
              eu.filesystem.denyWrite.push(eA);
        return (
          eu.filesystem &&
            ((eu.filesystem.denyRead = expandWindowsNativeDirectoryGlobs(
              eu.filesystem.denyRead,
            )),
            (eu.filesystem.denyWrite = expandWindowsNativeDirectoryGlobs(
              eu.filesystem.denyWrite,
            ))),
          this.syncExecPolicyUserRules(eu.execPolicy),
          this.syncCommandSafetyRules(eu.commandSafety),
          eu
        );
      } catch (eA) {
        return (
          this.logger.warn?.(
            "Failed to load sandbox config, using defaults",
            eA,
          ),
          { ...eI.DEFAULT_SANDBOX_CONFIG }
        );
      }
    }
    isConfigEqual(eA, el) {
      if (eA === el) return !0;
      if (!eA || !el) return !1;
      try {
        return nD()(eA, el);
      } catch (eA) {
        return (
          this.logger.warn?.(
            "Failed to compare configs via JSON serialization",
            eA,
          ),
          !1
        );
      }
    }
    async toRuntimeConfig(eA) {
      let el = {
        network: eA.network ?? eI.DEFAULT_SANDBOX_CONFIG.network,
        filesystem: eA.filesystem ?? eI.DEFAULT_SANDBOX_CONFIG.filesystem,
        ignoreViolations: eA.ignoreViolations,
        enableWeakerNestedSandbox: eA.enableWeakerNestedSandbox,
      };
      if (eA.ripgrep) el.ripgrep = eA.ripgrep;
      else {
        let eA = await nx.RipGrepUtils.ensureRgConfig();
        eA &&
          ((el.ripgrep = {
            command: eA.command,
            args: eA.args.length > 0 ? eA.args : void 0,
          }),
          this.logger.debug?.(`Using ripgrep: ${eA.command} (${eA.mode})`));
      }
      return (
        void 0 !== eA.mandatoryDenySearchDepth &&
          (el.mandatoryDenySearchDepth = eA.mandatoryDenySearchDepth),
        el
      );
    }
    expandPaths(eA) {
      try {
        let el = r4().homedir(),
          ec = nx.PathUtils.getHomeDir(),
          eu = "~/.codebuddy/skills",
          expandPath = (eA) =>
            "string" != typeof eA
              ? (this.logger.warn?.(
                  `Invalid path type in filesystem config: ${typeof eA}`,
                ),
                eA)
              : "." === eA || "./" === eA
                ? r5().resolve(".")
                : eA === eu || eA.startsWith(`${eu}/`)
                  ? r5().join(el, eA.slice(1))
                  : "~/.codebuddy" === eA || eA.startsWith("~/.codebuddy/")
                    ? r5().join(ec, eA.slice(12))
                    : eA.startsWith("~")
                      ? r5().join(el, eA.slice(1))
                      : eA;
        return {
          denyRead: Array.isArray(eA.denyRead)
            ? eA.denyRead.map(expandPath)
            : [],
          allowWrite: Array.isArray(eA.allowWrite)
            ? eA.allowWrite.map(expandPath)
            : [],
          denyWrite: Array.isArray(eA.denyWrite)
            ? eA.denyWrite.map(expandPath)
            : [],
        };
      } catch (el) {
        return (
          this.logger.error?.(
            "Failed to expand paths in filesystem config",
            el,
          ),
          eA
        );
      }
    }
    syncExecPolicyUserRules(eA) {
      let el;
      if (this.execPolicy) {
        try {
          el = JSON.stringify(eA ?? null);
        } catch {
          el = "unserialisable";
        }
        el !== this.lastExecPolicyUserRulesKey &&
          ((this.lastExecPolicyUserRulesKey = el),
          this.execPolicy.setUserRules(eA));
      }
    }
    syncCommandSafetyRules(eA) {
      let el;
      if (this.sensitiveCommandDetector?.setCommandSafetyRules) {
        try {
          el = JSON.stringify(eA ?? null);
        } catch {
          el = "unserialisable";
        }
        el !== this.lastCommandSafetyRulesKey &&
          ((this.lastCommandSafetyRulesKey = el),
          this.sensitiveCommandDetector.setCommandSafetyRules(eA));
      }
    }
    getCommandRoots(eA) {
      try {
        if (!eA || "string" != typeof eA) return [];
        let el = new Map();
        for (let ec of eA.matchAll(/\b([A-Za-z_]\w*)=(\S+)/g))
          el.set(ec[1], ec[2]);
        let ec = eA;
        for (let [eA, eu] of el)
          ec = ec.replace(RegExp(`\\$\\{${eA}\\}|\\$${eA}(?=\\W|$)`, "g"), eu);
        ec = ec.replace(/[A-Za-z]:\\[^\s"';&|]*/g, (eA) =>
          eA.replace(/\\/g, "/"),
        );
        let eu = (0, rV.parse)(ec.trim()),
          ed = [],
          ep = !0;
        for (let eA of eu) {
          if ("object" == typeof eA && null !== eA && "op" in eA) {
            ep = !0;
            continue;
          }
          if (ep && "string" == typeof eA) {
            if (/^[A-Za-z_]\w*=/.test(eA) || !eA) continue;
            let el = eA.split(/[/\\]/).pop();
            if (eC.SHELL_PREFIX_COMMANDS.has(el)) continue;
            if (eC.SHELL_STANDALONE_BUILTINS.has(el)) {
              ep = !1;
              continue;
            }
            (ed.push(el), (ep = !1));
          }
        }
        return ed;
      } catch (eA) {
        return (this.logger.warn?.("Failed to extract command roots", eA), []);
      }
    }
  });
  ((nU.SHELL_PREFIX_COMMANDS = new Set([
    "export",
    "eval",
    "source",
    ".",
    "exec",
    "command",
    "builtin",
    "env",
    "sudo",
    "nohup",
    "nice",
    "time",
  ])),
    (nU.SHELL_STANDALONE_BUILTINS = new Set([
      "cd",
      "pushd",
      "popd",
      "echo",
      "printf",
      "true",
      "false",
      "set",
      "unset",
      "alias",
    ])));
  return {
    BashSandboxManagerImpl: nU,
    BashSandboxManager: eI.BashSandboxManager,
    getModule,
    parseSecurityCenter,
    readManagedSecurityPolicyFromEnv,
    mergeUniqueStringArray,
    buildWindowsNativeDirectoryGlobs,
    expandWindowsNativeDirectoryGlobs,
  };
}
