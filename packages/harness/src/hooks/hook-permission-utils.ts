import * as path from "node:path";
import { CapturedMinimatch as ed } from "../vendor/captured-minimatch.js";
import { CapturedHookMicromatch } from "../vendor/captured-hook-dependencies.js";
export function createHookPermissionUtils(runtime: any) {
  const ef = () => path,
    eg = () => ({ homedir: runtime.getHomeDir }),
    ev = { PathUtils: { getWorkDir: runtime.getWorkDir } },
    eE = () => CapturedHookMicromatch;
  class PermissionUtils {
    static getDebugService = runtime.getDebugService ?? (() => undefined);
    static getCommandParserService =
      runtime.getCommandParserService ?? (() => undefined);
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
  }
  return PermissionUtils;
}
