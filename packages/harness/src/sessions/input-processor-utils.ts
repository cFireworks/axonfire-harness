import * as ef from "node:path";
import { homedir } from "node:os";
import { isCustomHistoryItem } from "./history-utils.js";
const ep = { AgentNames: { COMPACT: "compact" } };
const eh = { homedir };
export class NativeHistoryInputUtils {
  static isSkipRunItem(eA: any): any {
    return !!eA.providerData?.skipRun;
  }
  static isUserMessageItem(eA: any): any {
    return "message" === eA.type && "user" === eA.role;
  }
  static isRealUserMessageItem(eA: any): any {
    return (
      this.isUserMessageItem(eA) &&
      !this.isSkipRunItem(eA) &&
      eA.providerData?.isCompactInternal !== !0 &&
      !this.isCompactUserMessage(eA) &&
      !this.isSystemTeammateMessage(eA)
    );
  }
  static isSystemTeammateMessage(eA: any): any {
    return (
      "string" == typeof eA.providerData?.teammateMessage?.from ||
      (this.isUserMessageItem(eA) && this.hasTeammateMessageContent(eA))
    );
  }
  static isCompactBoundaryMessage(eA: any): any {
    if (!this.isUserMessageItem(eA)) return !1;
    let el: any = eA.providerData ?? {};
    return (
      !0 !== el.isPtlRecovery &&
      !0 !== el.isMediaBodyRecovery &&
      (!0 === el.isCompacted ||
        !0 === el.isSummary ||
        (!0 !== el.isCompactInternal &&
          el.agent !== ep.AgentNames.COMPACT &&
          (("string" == typeof el.compactType &&
            !this.isCompactContinuePromptMessage(eA)) ||
            this.hasCompactBoundaryContent(eA))))
    );
  }
  static isReplayRecoverableCompactMessage(eA: any): any {
    return (
      !!this.isUserMessageItem(eA) &&
      (this.isCompactBoundaryMessage(eA) ||
        (eA.providerData?.isCompactInternal === !0 &&
          this.isCompactContinuePromptMessage(eA)))
    );
  }
  static isCompactUserMessage(eA: any): any {
    return (
      this.isCompactBoundaryMessage(eA) ||
      (this.isUserMessageItem(eA) &&
        eA.providerData?.agent === ep.AgentNames.COMPACT)
    );
  }
  static hasCompactBoundaryContent(eA: any): any {
    let el: any = this.getUserMessageText(eA);
    return (
      /<cb_summary\b/i.test(el) ||
      /<conversation_history_summary\b/i.test(el) ||
      /data-role=["']compact-summary["']/i.test(el)
    );
  }
  static isCompactContinuePromptMessage(eA: any): any {
    if (!this.isUserMessageItem(eA)) return !1;
    let el: any = this.getUserMessageText(eA);
    return (
      /please continue\b/i.test(el) &&
      /summarized context above/i.test(el) &&
      !this.hasCompactBoundaryContent(eA)
    );
  }
  static hasTeammateMessageContent(eA: any): any {
    return /<teammate-message\b/i.test(this.getUserMessageText(eA));
  }
  static getUserMessageText(eA: any): any {
    let el: any = eA.content;
    return "string" == typeof el
      ? el
      : el
          .map((eA: any) =>
            "input_text" === eA.type && "string" == typeof eA.text
              ? eA.text
              : "",
          )
          .join("\n");
  }
}
export class NativeHistorySummaryUtils {
  static extractSummaryContent(eA: any): any {
    if (!eA) return "";
    let el: any = eA.match(/<summary>([\s\S]*?)<\/summary>/);
    return (el?.[1] ?? eA).trim();
  }
  static hasCompactOutputStructure(eA: any): any {
    return (
      !!eA &&
      (/<summary>[\s\S]+?<\/summary>/i.test(eA) ||
        /<conversation_history_summary>[\s\S]+?<\/conversation_history_summary>/i.test(
          eA,
        ))
    );
  }
  static extractCompactSummaryFromText(eA: any): any {
    if (eA && "string" == typeof eA && this.hasCompactOutputStructure(eA))
      return this.extractSummaryContent(eA) || void 0;
  }
  static extractTextFromAssistantContent(eA: any): any {
    return "string" == typeof eA
      ? eA
      : Array.isArray(eA)
        ? eA
            .filter(
              (eA: any) =>
                (eA?.type === "output_text" || eA?.type === "text") &&
                "string" == typeof eA.text,
            )
            .map((eA: any) => eA.text)
            .join("\n")
        : "";
  }
}
export class NativeHistoryPathUtils {
  static getWorkDir: () => string = () => process.cwd();
  static getRelativePath(eA: any, el: any = this.getWorkDir()): any {
    let ec: any = (0, ef.resolve)(eA),
      eu: any = (0, ef.resolve)(el);
    return (0, ef.relative)(eu, ec) || ".";
  }
  static getDisplayPath(eA: any, el: any = this.getWorkDir()): any {
    let ec: any = (0, eh.homedir)(),
      eu: any = (0, ef.resolve)(el),
      ed: any = (0, ef.resolve)(eA);
    if (ed.startsWith(eu + ef.sep) || ed === eu)
      return this.getRelativePath(ed, el);
    let ep: any = this.getRelativePath(ed, el),
      eg: any = (ep.match(/\.\.\//g) || []).length;
    if (eg <= 2) return ep;
    if (ed.startsWith(ec + ef.sep) || ed === ec) {
      let eA: any = (0, ef.relative)(ec, ed);
      return eA ? `~/${eA}` : "~";
    }
    if (eg >= 3) {
      let el: any = [".codebuddy", ".config", ".local", ".cache"],
        ec: any = eA.split(/[/\\]/);
      for (let eA of el) {
        let el: any = ec.indexOf(eA);
        if (-1 !== el) {
          let eA: any = ec.slice(el).join("/");
          return `~/${eA}`;
        }
      }
    }
    return ep;
  }
}
export function createInputProcessorUtilities(
  getWorkDir: () => string = () => process.cwd(),
  getHomeDir: () => string = homedir,
): any {
  class PathUtils extends NativeHistoryPathUtils {
    static override getWorkDir = getWorkDir;
    static override getDisplayPath(eA: any, el: any = this.getWorkDir()): any {
      let ec: any = getHomeDir(),
        eu: any = (0, ef.resolve)(el),
        ed: any = (0, ef.resolve)(eA);
      if (ed.startsWith(eu + ef.sep) || ed === eu)
        return this.getRelativePath(ed, el);
      let ep: any = this.getRelativePath(ed, el),
        eg: any = (ep.match(/\.\.\//g) || []).length;
      if (eg <= 2) return ep;
      if (ed.startsWith(ec + ef.sep) || ed === ec) {
        let eA: any = (0, ef.relative)(ec, ed);
        return eA ? `~/${eA}` : "~";
      }
      if (eg >= 3) {
        let el: any = [".codebuddy", ".config", ".local", ".cache"],
          ec: any = eA.split(/[/\\]/);
        for (let eA of el) {
          let el: any = ec.indexOf(eA);
          if (-1 !== el) {
            let eA: any = ec.slice(el).join("/");
            return `~/${eA}`;
          }
        }
      }
      return ep;
    }
  }
  return {
    InputItemUtils: Object.assign(class extends NativeHistoryInputUtils {}, {
      isCustomInputItem: isCustomHistoryItem,
    }),
    SummaryUtils: NativeHistorySummaryUtils,
    SessionUtils: { isSubAgent: (s: any) => !!s.storeId && s.storeId !== s.id },
    PathUtils,
    UrlUtils: {
      extractUrls: (s: string) =>
        (s.match(/https?:\/\/[^\s]+/g) || []).map((s) =>
          s.endsWith(".") ? s.substring(0, s.length - 1) : s,
        ),
    },
  };
}
