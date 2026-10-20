import { CommandMessageUtils } from "../commands/command-message-utils.js";
export function createHookMessageUtils() {
  const eg = { CommandMessageUtils },
    ep = { TOOL_NO_CONTENT: "(No content)" },
    ed = "<user_query>",
    eP = "</user_query>";
  class MessageUtils {
    static isUserQueryContent(eA: any): any {
      return "string" == typeof eA && eA.startsWith(ed) && eA.endsWith(eP);
    }
    static stripUserQueryTags(eA: any): any {
      if ("string" != typeof eA || !eA.includes(ed)) return eA;
      let el: any = RegExp(`${ed}([\\s\\S]*?)${eP}`, "g");
      return eA.replace(el, (eA: any, el: any) => el.trim()).trim();
    }
  }
  const eh = { MessageUtils };
  const ec = /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
    euRegex = /<user_query>([\s\S]*?)<\/user_query>/g;
  function stripSystemReminderXml(eA: any): any {
    return eA.replace(ec, "");
  }
  function stripUserQueryXml(eA: any): any {
    return eA.replace(euRegex, "$1");
  }
  const eu = {
    stripPromptContextXml: function (eA: any): any {
      return stripUserQueryXml(stripSystemReminderXml(eA)).trim();
    },
  };
  class HookMessageContentUtils {
    static hasVisibleContent(eA: any): any {
      if ("string" == typeof eA.content) return !0;
      for (let el of eA.content)
        if (
          !(
            "input_text" !== el.type ||
            eg.CommandMessageUtils.isSystemInternalMessage(el.text) ||
            HookMessageContentUtils.isImageLocalPathBlock(el.text)
          ) &&
          void 0 === eg.CommandMessageUtils.parseOutput(el.text)
        )
          return !0;
      return !1;
    }
    static extractTextContent(eA: any, el: any): any {
      if ("string" == typeof eA.content) {
        let ec: any = HookMessageContentUtils.stripTeammateMessage(
          HookMessageContentUtils.stripSystemReminder(eA.content),
        );
        return el ? ec : ec.replace(/\r\n|\r|\n/g, "");
      }
      let ec: any = ep.TOOL_NO_CONTENT;
      for (let el of eA.content) {
        if (
          "input_text" !== el.type ||
          eg.CommandMessageUtils.isSystemInternalMessage(el.text) ||
          HookMessageContentUtils.isImageLocalPathBlock(el.text)
        )
          continue;
        let eA: any = eg.CommandMessageUtils.parseInput(el.text);
        if (void 0 !== eA) {
          ec = eA.text;
          break;
        }
        if (el.providerData && "content" in el.providerData) {
          ec = el.providerData.content;
          break;
        }
        let eu: any = HookMessageContentUtils.stripTeammateMessage(
          HookMessageContentUtils.stripSystemReminder(el.text),
        );
        if (eh.MessageUtils.isUserQueryContent(eu)) {
          ec = eh.MessageUtils.stripUserQueryTags(eu);
          break;
        }
        ec = eu;
      }
      return el ? ec : ec.replace(/\r\n|\r|\n/g, "");
    }
    static stripSystemReminder(eA: any): any {
      return (0, eu.stripPromptContextXml)(eA);
    }
    static isImageLocalPathBlock(eA: any): any {
      return /^<image_local_path>[\s\S]*<\/image_local_path>$/.test(
        eA?.trim() ?? "",
      );
    }
    static stripTeammateMessage(eA: any): any {
      return eA
        .replace(
          /<teammate-message\s+teammate_id="([^"]+)"(?:\s+summary="([^"]*)")?[^>]*>\n?([\s\S]*?)\n?<\/teammate-message>/g,
          (eA: any, el: any, ec: any, eu: any) => {
            if (ec) return `[@${el}] ${ec}`;
            let ed: any = eu.trim();
            return ed.length > 80
              ? `[@${el}] ${ed.substring(0, 80)}...`
              : `[@${el}] ${ed}`;
          },
        )
        .trim();
    }
  }
  return HookMessageContentUtils;
}
