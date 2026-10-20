// Fixed WorkBuddy 5.3.14 SHA; original complete methods, TS-only annotations and outer DI.
import * as fs from "node:fs";
import * as path from "node:path";
import { CapturedJsonUtils } from "../vendor/captured-jsonc.js";
export function createNativeMcpUtils(runtime: any = {}) {
  const process = {
      env: runtime.env ?? globalThis.process.env,
      pid: runtime.pid ?? globalThis.process.pid,
    },
    Date = { now: runtime.now ?? globalThis.Date.now },
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    ed = runtime.fs ?? fs,
    ep = path,
    eh = { JsonUtils: CapturedJsonUtils },
    eu = { ContainerUtil: { get: (_key?: any) => runtime.logger ?? { debug() {} } } },
    eg = { DebugService: "debug" },
    ef = 100000000;
  class McpUtils {
    [key: string]: any;
    static getMcpTimeout(): any {
      let eA: any = process.env.MCP_TIMEOUT;
      if (eA) {
        let el: any = Number.parseInt(eA, 10);
        if (!Number.isNaN(el) && el > 0) return el;
      }
    }
    static getToolTimeout(): any {
      return parseInt(process.env.MCP_TOOL_TIMEOUT || "", 10) || ef;
    }
    static raceWithTimeout(eA: any, el: any, ec: any): any {
      let eu: any = ec ?? McpUtils.getMcpTimeout() ?? 3e4;
      return Promise.race([
        eA,
        new Promise((eA: any) => {
          setTimeout(() => {
            (el(), eA());
          }, eu).unref();
        }),
      ]);
    }
    static parseToolFullName(eA: any): any {
      let el: any = eA.match(/^mcp__(.+?)__(.+)$/);
      if (!el) throw Error(`Invalid MCP tool name format: ${eA}`);
      let [, ec, eu] = el;
      return { serverName: ec, toolName: eu, fullName: eA };
    }
    static hasDeferLoadingConfig(eA: any): any {
      let el: any = "defer_loading" in eA && eA.defer_loading,
        ec: any = "tools" in eA ? eA.tools : void 0;
      return (
        !!el ||
        (!!ec && Object.values(ec).some((eA: any) => !0 === eA.defer_loading))
      );
    }
    static getRawToolName(eA: any): any {
      return eA.startsWith("mcp__") ? eA.split("__").slice(2).join("__") : eA;
    }
    static buildFullToolName(eA: any, el: any): any {
      return `mcp__${eA}__${el}`;
    }
    static buildDeferLookupNames(eA: any, el: any, ec: any): any {
      let eu: any = McpUtils.getRawToolName(el),
        ed: any = [];
      if (ec && el.startsWith("mcp__")) {
        let eA: any = McpUtils.parseToolFullName(el);
        ed.push(`${eA.serverName}_${eA.toolName}`);
      }
      return (
        ed.push(eu, `${eA}__${eu}`, McpUtils.buildFullToolName(eA, eu)),
        ed
      );
    }
    static writeConfigFileAtomic(
      eA: any,
      el: any,
      ec: any = { encoding: "utf-8" },
    ): any {
      let eh: any = eu.ContainerUtil.get(eg.DebugService),
        ef: any = eA;
      if (ed.existsSync(eA))
        try {
          let el: any = ed.readlinkSync(eA);
          ((ef = ep.isAbsolute(el) ? el : ep.join(ep.dirname(eA), el)),
            eh.debug(`Writing through symlink: ${eA} -> ${ef}`));
        } catch (el: any) {
          ef = eA;
        }
      let em: any = `${ef}.tmp.${process.pid}.${Date.now()}`;
      try {
        let eA: any;
        eh.debug(`Writing to temp file: ${em}`);
        let eu: any = ed.existsSync(ef);
        eu
          ? ((eA = ed.statSync(ef).mode),
            eh.debug(`Preserving file permissions: ${eA.toString(8)}`))
          : void 0 !== ec.mode &&
            ((eA = ec.mode),
            eh.debug(`Setting permissions for new file: ${eA.toString(8)}`));
        let ep: any = { encoding: ec.encoding, flush: !0 };
        (eu || void 0 === ec.mode || (ep.mode = ec.mode),
          ed.writeFileSync(em, el, ep),
          eh.debug(`Temp file written successfully, size: ${el.length} bytes`),
          eu &&
            void 0 !== eA &&
            (ed.chmodSync(em, eA),
            eh.debug("Applied original permissions to temp file")),
          eh.debug(`Renaming ${em} to ${ef}`),
          ed.renameSync(em, ef),
          eh.debug(`File ${ef} written atomically`));
      } catch (eA: any) {
        eh.debug(`Failed to write file atomically: ${eA}`);
        try {
          ed.existsSync(em) &&
            (eh.debug(`Cleaned up temp file: ${em}`), ed.unlinkSync(em));
        } catch (eA: any) {
          eh.debug(`Failed to clean up temp file: ${eA}`);
        }
        eh.debug(`Falling back to non-atomic write for ${ef}`);
        try {
          let eA: any = { encoding: ec.encoding, flush: !0 };
          (ed.existsSync(ef) || void 0 === ec.mode || (eA.mode = ec.mode),
            ed.writeFileSync(ef, el, eA),
            eh.debug(
              `File ${ef} written successfully with non-atomic fallback`,
            ));
        } catch (eA: any) {
          throw (eh.debug(`Non-atomic write also failed: ${eA}`), eA);
        }
      }
    }
    static parseJsonc(eA: any): any {
      return eh.JsonUtils.parse(eA);
    }
    static stringifyJsonc(eA: any, el: any = 2): any {
      return eh.JsonUtils.stringify(eA, el);
    }
  }
  return McpUtils;
}
