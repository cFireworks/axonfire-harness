import * as path from "node:path";
import { CapturedMinimatch as ed } from "../vendor/captured-minimatch.js";
import { CapturedHookMicromatch } from "../vendor/captured-hook-dependencies.js";
import { ToolArgType } from "./native-permission-policy.js";
export function createNativePermissionUtils(runtime: any) {
  const ef = () => path,
    eg = () => ({ homedir: runtime.getHomeDir }),
    eE = () => CapturedHookMicromatch,
    ev = { PathUtils: runtime.pathUtils },
    eI = { CommandUtils: runtime.commandUtils },
    e_ = { ToolArgType },
    ew = { DebugService: "debug" },
    eB = { SettingsManager: "settings" },
    ey = { ConsoleManager: "console", ConsoleOutputMode: { NATIVE: "native" } },
    eC = { CommandParserService: "parser" },
    eu = {
      isWindows: runtime.isWindows ?? false,
      ContainerUtil: {
        get: (key: string) =>
          (
            ({
              debug: runtime.debugService,
              settings: runtime.settingsManager,
              console: runtime.consoleManager ?? { error() {} },
              parser: runtime.commandParserService,
            }) as any
          )[key],
      },
    };
  class PermissionUtils {
    static getDebugService(): any {
      try {
        let eA: any = eu.ContainerUtil.get(ew.DebugService);
        return eA && "function" == typeof eA.debug ? eA : void 0;
      } catch {
        return;
      }
    }
    static checkSafeyPermission(eA: any, el: any): any {
      for (let eA of el)
        if (
          eA.type === e_.ToolArgType.Command &&
          !eI.CommandUtils.checkCommandSafety(eA.value).isSafe
        )
          return !1;
      return !0;
    }
    static matchPermissionRules(eA: any, el: any): any {
      let ec: any = this.getDebugService();
      ec?.debug(
        `permission-utils: matchPermissionRules called, permissions: ${JSON.stringify(eA)}, toolNames: ${JSON.stringify(el)}`,
      );
      let eu: any = [];
      if (!eA || 0 === eA.length) return eu;
      let ed: any = el.map((eA: any) => eA.toLowerCase());
      for (let el of eA) {
        let eA: any = el,
          ep: any = "*",
          eg: any = el.indexOf("(");
        (eg >= 0 &&
          ((eA = el.substring(0, eg)),
          (ep = el.substring(eg + 1, el.lastIndexOf(")")))),
          ed.includes(eA.toLowerCase()) &&
            (eu.push({ permission: el, rule: ep }),
            ec?.debug(
              `permission-utils: matchPermissionRules matched - permission: "${el}", tool: "${eA}", rule: "${ep}"`,
            )));
      }
      return (
        ec?.debug(
          `permission-utils: matchPermissionRules result: ${JSON.stringify(eu)}`,
        ),
        eu
      );
    }
    static matchMcpPermissionRules(eA: any, el: any): any {
      let ec: any = this.getDebugService();
      ec?.debug(
        `permission-utils: matchMcpPermissionRules called, permissions: ${JSON.stringify(eA)}, toolNames: ${JSON.stringify(el)}`,
      );
      let eu: any = [];
      if (!eA || 0 === eA.length) return eu;
      let ed: any = el.map((eA: any) => eA.toLowerCase());
      for (let el of eA) {
        let eA: any = el.toLowerCase();
        if (!eA.startsWith("mcp__")) continue;
        let ep: any = eA.endsWith("__*"),
          eg: any = "";
        if (ep) {
          let el: any = eA.split("__");
          3 === el.length && (eg = el[1]);
        }
        for (let eh of ed) {
          let ed: any = eh.toLowerCase();
          if (eA === ed) {
            (eu.push({ permission: el, rule: "*" }),
              ec?.debug(
                `permission-utils: matchMcpPermissionRules exact match - permission: "${el}", toolName: "${eh}"`,
              ));
            continue;
          }
          if (ep && eg && ed.startsWith(`mcp__${eg}__`)) {
            (eu.push({ permission: el, rule: "*" }),
              ec?.debug(
                `permission-utils: matchMcpPermissionRules wildcard match - permission: "${el}", serverName: "${eg}", toolName: "${eh}"`,
              ));
            continue;
          }
          if (!ep && ed.startsWith("mcp__")) {
            let ep: any = ed.split("__");
            if (ep.length >= 3) {
              let ed: any = `mcp__${ep[1]}`;
              eA === ed &&
                (eu.push({ permission: el, rule: "*" }),
                ec?.debug(
                  `permission-utils: matchMcpPermissionRules server-level match - permission: "${el}", serverPattern: "${ed}", toolName: "${eh}"`,
                ));
            }
          }
        }
      }
      return (
        ec?.debug(
          `permission-utils: matchMcpPermissionRules result: ${JSON.stringify(eu)}`,
        ),
        eu
      );
    }
    static checkPermissionRules(eA: any, el: any): any {
      return !!this.findMatchingPermissionRule(eA, el);
    }
    static checkAllowPermissionRules(eA: any, el: any): any {
      return !!this.findMatchingPermissionRule(eA, el, {
        requireAllSubcommands: !0,
      });
    }
    static findMatchingPermissionRule(eA: any, el: any, ec?: any): any {
      let eu: any = this.getDebugService();
      if (
        (eu?.debug(
          `permission-utils: findMatchingPermissionRule called, rules: ${JSON.stringify(eA)}, args: ${JSON.stringify(el)}`,
        ),
        !eA || 0 === eA.length)
      )
        return void eu?.debug(
          "permission-utils: findMatchingPermissionRule no rules, result: undefined",
        );
      for (let el of eA)
        if ("*" === el.rule.trim())
          return (
            eu?.debug(
              `permission-utils: findMatchingPermissionRule wildcard match, rule: "${el.rule}"`,
            ),
            { ...el }
          );
      for (let ed of eA)
        for (let eA of el)
          switch (eA.type) {
            case e_.ToolArgType.FilePath:
              if (PermissionUtils.matchFileRule(eA.value, ed.rule))
                return (
                  eu?.debug(
                    `permission-utils: findMatchingPermissionRule FilePath matched, rule: "${ed.rule}", arg: "${eA.value}"`,
                  ),
                  { ...ed, arg: eA }
                );
              break;
            case e_.ToolArgType.Command:
              if (
                ec?.requireAllSubcommands
                  ? PermissionUtils.isCommandAllowed(ed.rule, eA.value)
                  : PermissionUtils.matchCommandRule(eA.value, ed.rule)
              )
                return (
                  eu?.debug(
                    `permission-utils: findMatchingPermissionRule Command matched, rule: "${ed.rule}", arg: "${eA.value}"`,
                  ),
                  { ...ed, arg: eA }
                );
              break;
            case e_.ToolArgType.Skill:
              if (PermissionUtils.matchSkillRule(eA.value, ed.rule))
                return (
                  eu?.debug(
                    `permission-utils: findMatchingPermissionRule Skill matched, rule: "${ed.rule}", arg: "${eA.value}"`,
                  ),
                  { ...ed, arg: eA }
                );
              break;
            case e_.ToolArgType.URL:
              if (PermissionUtils.matchURLRule(eA.value, ed.rule))
                return (
                  eu?.debug(
                    `permission-utils: findMatchingPermissionRule URL matched, rule: "${ed.rule}", arg: "${eA.value}"`,
                  ),
                  { ...ed, arg: eA }
                );
          }
      eu?.debug("permission-utils: findMatchingPermissionRule no match found");
    }
    static matchFileRule(eA: any, el: any): any {
      return (
        (eA = PermissionUtils.normalizePath(eA)),
        (el = PermissionUtils.normalizeFilePathPattern(el)),
        (0, ed.minimatch)(eA, el, { dot: !0, nocase: !0, matchBase: !0 })
      );
    }
    static normalizePath(eA: any): any {
      let el: any = eA;
      return (eA.startsWith("~") &&
        (el = ef().join(eg().homedir(), eA.slice(1))),
      (el = el.replace(/\\/g, "/")),
      ef().isAbsolute(el) || (el = ef().resolve(ev.PathUtils.getWorkDir(), el)),
      eA.startsWith("//"))
        ? `/${el}`
        : el;
    }
    static normalizeFilePathPattern(eA: any): any {
      let el: any = eA;
      return (
        eA.startsWith("~") && (el = ef().join(eg().homedir(), eA.slice(1))),
        (el = el.replace(/\\/g, "/")),
        ef().isAbsolute(el) ||
          eA.startsWith("*") ||
          eA.startsWith(".") ||
          (el = ef().resolve(ev.PathUtils.getWorkDir(), el)),
        el.startsWith("//") && (el = el.substring(1)),
        el
      );
    }
    static matchCommandRule(eA: any, el: any): any {
      if (!el) return !1;
      let ec: any = this.getDebugService();
      if (this.matchSingleCommandAgainstPattern(eA, el))
        return (
          ec?.debug(
            `permission-utils: matchCommandRule exact match for full command, input: "${eA}", pattern: "${el}"`,
          ),
          !0
        );
      if (this.isComplexCommand(eA)) {
        let eu: any = this.extractSubcommandsSync(eA);
        for (let eA of (ec?.debug(
          `permission-utils: matchCommandRule complex command, extracted ${eu.length} subcommands: ${JSON.stringify(eu.map((eA: any) => eA.fullCommand))}`,
        ),
        eu))
          if (this.matchSingleCommandAgainstPattern(eA.fullCommand, el))
            return (
              ec?.debug(
                `permission-utils: matchCommandRule subcommand matched, subcommand: "${eA.fullCommand}", pattern: "${el}"`,
              ),
              !0
            );
      }
      return !1;
    }
    static isComplexCommand(eA: any): any {
      for (let el of ["&&", "||", "|", ";"]) if (eA.includes(el)) return !0;
      return !1;
    }
    static getCommandParserService(): any {
      try {
        let eA: any = eu.ContainerUtil.get(eC.CommandParserService);
        return eA && "function" == typeof eA.extractCommands ? eA : void 0;
      } catch {
        return;
      }
    }
    static extractSubcommandsSync(eA: any): any {
      let el: any = this.getCommandParserService();
      return el ? el.extractCommands(eA) : this.extractSubcommandsWithRegex(eA);
    }
    static extractSubcommandsWithRegex(eA: any): any {
      let el: any = /(&&|&|\|\||\||;)/,
        ec: any = ["&&", "&", "||", "|", ";"];
      return eA
        .split(el)
        .map((eA: any) => eA.trim())
        .filter((eA: any) => eA && !ec.includes(eA))
        .map((eA: any) => {
          let el: any = eA.replace(/\s*[<>][>&]?\s*\S+/g, "").trim(),
            ec: any = el.split(/\s+/);
          return { command: ec[0] || "", args: ec.slice(1), fullCommand: el };
        })
        .filter((eA: any) => eA.command);
    }
    static matchSingleCommandAgainstPattern(eA: any, el: any): any {
      let ec: any = eA.trim(),
        eu: any = el.trim();
      if (eu.endsWith(":*")) {
        let eA: any = eu.slice(0, -2);
        return !!(
          ec.split(/\s+/)[0] === eA ||
          ec === eA ||
          ec.startsWith(eA + " ")
        );
      }
      return eu.includes("*")
        ? eE().isMatch(ec, eu, { bash: !0, nocase: !0 })
        : ec === eu;
    }
    static matchSkillRule(eA: any, el: any): any {
      return !!el && eA === el;
    }
    static isCommandAllowed(eA: any, el: any): any {
      let ec: any = this.getDebugService();
      if ([">", "<", ">>", "<<", "&>"].some((eA: any) => el.includes(eA)))
        return eA === el;
      let eu: any = this.extractSubcommandsSync(el);
      return 0 === eu.length
        ? this.matchSingleCommandAgainstPattern(el, eA)
        : (ec?.debug(
            `permission-utils: isCommandAllowed checking ${eu.length} subcommands against pattern "${eA}"`,
          ),
          eu.every((el: any) =>
            this.matchSingleCommandAgainstPattern(el.fullCommand, eA),
          ));
    }
    static matchSingleCommand(eA: any, el: any): any {
      return this.matchSingleCommandAgainstPattern(el, eA);
    }
    static matchURLRule(eA: any, el: any): any {
      if (!el) return !1;
      let ec: any = PermissionUtils.getDomainFromUrl(eA);
      return (
        !!(ec && el.startsWith("domain:")) &&
        (0, ed.minimatch)(ec, el.substring(7), {
          dot: !0,
          nocase: !0,
          matchBase: !0,
        })
      );
    }
    static getDomainFromUrl(eA: any): any {
      try {
        return (
          eA.startsWith("http://") ||
            eA.startsWith("https://") ||
            (eA = "https://" + eA),
          new URL(eA).hostname
        );
      } catch (eA: any) {
        eu.ContainerUtil.get(ey.ConsoleManager).error("Invalid URL:", eA, {
          mode: ey.ConsoleOutputMode.NATIVE,
        });
      }
    }
    static extractWholeToolRules(eA: any): any {
      return eA && 0 !== eA.length
        ? eA
            .map((eA: any) => eA?.trim())
            .filter((eA: any) => !!eA)
            .filter((eA: any) => !eA.toLowerCase().startsWith("mcp__"))
            .filter((eA: any) => !this.isScopedPermission(eA))
            .map((eA: any) => eA.toLowerCase())
        : [];
    }
    static isScopedPermission(eA: any): any {
      let el: any = eA.indexOf("("),
        ec: any = eA.lastIndexOf(")");
      return el >= 0 && ec > el;
    }
    static async isArgsInTrustedDirectories(eA: any, el: any): Promise<any> {
      for (let ec of eA)
        if (
          ec.type === e_.ToolArgType.FilePath &&
          !(await PermissionUtils.isInTrustedDirectories(ec.value, el))
        )
          return !1;
      return !0;
    }
    static async isInTrustedDirectories(eA: any, el: any): Promise<any> {
      let ec: any = ev.PathUtils.resolveFilePathToWorkDir(eA),
        ed: any = [],
        ep: any = eu.ContainerUtil.get(eB.SettingsManager);
      return (
        ed.push(ev.PathUtils.getWorkDir()),
        ed.push(...((await ep.get("trustedDirectories")) || [])),
        el && ed.push(...(el.options?.addDir || [])),
        !!ed.find((eA: any) => PermissionUtils.isWithin(eA, ec))
      );
    }
    static isWithin(eA: any, el: any): any {
      let ec: any = el.replace(/\\/g, "/"),
        ep: any = eA.replace(/\\/g, "/");
      if (
        (eu.isWindows &&
          ((ec = ec.replace(
            /^([a-zA-Z]):/,
            (eA: any, el: any) => el.toUpperCase() + ":",
          )),
          (ep = ep.replace(
            /^([a-zA-Z]):/,
            (eA: any, el: any) => el.toUpperCase() + ":",
          ))),
        (ec = ef().posix.normalize(ec)),
        (ep = ef().posix.normalize(ep)).includes("*"))
      )
        return (0, ed.minimatch)(ec, ep, { dot: !0, nocase: eu.isWindows });
      let eg: any = ep.endsWith("/") ? ep : ep + "/";
      return ec === ep || ec.startsWith(eg);
    }
    static createDefaultToolPermissionContext(): any {
      let emptyRules: any = () => ({
        policySettings: [],
        flagSettings: [],
        userSettings: [],
        projectSettings: [],
        localSettings: [],
        cliArg: [],
        command: [],
        session: [],
        sandbox: [],
      });
      return {
        additionalWorkingDirectories: new Map(),
        allowRules: emptyRules(),
        denyRules: emptyRules(),
        askRules: emptyRules(),
        isBypassPermissionsModeAvailable: !0,
        shouldAvoidPermissionPrompts: !1,
      };
    }
    static parseRuleString(eA: any): any {
      let el: any = eA.trim(),
        ec: any = el.indexOf("(");
      if (ec >= 0) {
        let eA: any = el.lastIndexOf(")");
        return {
          toolName: el.substring(0, ec),
          ruleContent: el.substring(ec + 1, eA > ec ? eA : el.length),
        };
      }
      return { toolName: el };
    }
    static ruleValueToString(eA: any): any {
      return eA.ruleContent ? `${eA.toolName}(${eA.ruleContent})` : eA.toolName;
    }
    static mergeRulesFromAllSources(eA: any): any {
      let el: any = [];
      for (let ec of Object.keys(eA)) el.push(...eA[ec]);
      return el;
    }
    static applyPermissionUpdate(eA: any, el: any): any {
      let ec: any = { ...eA };
      switch (el.type) {
        case "setMode":
          break;
        case "addRules": {
          let eA: any = el.rules.map(PermissionUtils.ruleValueToString),
            eu: any = el.behavior,
            ed: any =
              "allow" === eu
                ? ec.allowRules
                : "deny" === eu
                  ? ec.denyRules
                  : ec.askRules;
          ec[`${eu}Rules`] = {
            ...ed,
            [el.destination]: [...ed[el.destination], ...eA],
          };
          break;
        }
        case "replaceRules": {
          let eu: any = el.rules.map(PermissionUtils.ruleValueToString),
            ed: any = el.behavior,
            ep: any = `${ed}Rules`;
          ec[ep] = { ...eA[ep], [el.destination]: eu };
          break;
        }
        case "removeRules": {
          let eu: any = new Set(
              el.rules.map(PermissionUtils.ruleValueToString),
            ),
            ed: any = el.behavior,
            ep: any = `${ed}Rules`,
            eg: any = eA[ep][el.destination];
          ec[ep] = {
            ...eA[ep],
            [el.destination]: eg.filter((eA: any) => !eu.has(eA)),
          };
          break;
        }
        case "addDirectories":
          for (let eA of el.directories)
            ec.additionalWorkingDirectories.set(eA, {
              path: eA,
              source: el.destination,
            });
          break;
        case "removeDirectories":
          for (let eA of el.directories)
            ec.additionalWorkingDirectories.delete(eA);
      }
      return ec;
    }
  }
  return PermissionUtils;
}
