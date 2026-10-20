import { randomUUID } from "node:crypto";
import { NativeHistoryInputUtils } from "./input-processor-utils.js";
export function createContentFilterInputUtils(
  generateUUUID: () => string = randomUUID,
) {
  const eu = { generateUUUID },
    ep = { AgentNames: { COMPACT: "compact" } };
  class InputItemUtils extends NativeHistoryInputUtils {
    static CONTENT_FILTER_NOTICE_TEXT =
      "This topic is currently outside the scope of my capabilities, so I'm unable to discuss it further.";
    static isContentFilterCandidateUserMessage(eA: any): any {
      return (
        this.isRealUserMessageItem(eA) &&
        eA.providerData?.agent !== ep.AgentNames.COMPACT &&
        !eA.providerData?.isAdditionalData &&
        !eA.providerData?.isCompactInternal
      );
    }
    static findLatestContentFilterCandidateUserMessageId(
      eA: any,
      el: any,
    ): any {
      if (el) {
        let ec: any = eA.find((eA: any) => eA.id === el);
        if (ec && this.isContentFilterCandidateUserMessage(ec)) return el;
      }
      for (let el: any = eA.length - 1; el >= 0; el--) {
        let ec: any = eA[el];
        if (this.isContentFilterCandidateUserMessage(ec)) return ec.id;
      }
    }
    static isContentFilterNoticeItem(eA: any): any {
      return !!eA.providerData?.contentFilterNotice;
    }
    static createContentFilterNoticeMessage(eA: any, el: any, ec: any): any {
      return {
        id: (0, eu.generateUUUID)(),
        type: "message",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: InputItemUtils.CONTENT_FILTER_NOTICE_TEXT,
          },
        ],
        status: "completed",
        parentId: el,
        providerData: {
          skipRun: !0,
          contentFilterNotice: !0,
          messageId: eA,
          strippedUserMessageId: ec,
        },
      };
    }
  }
  return InputItemUtils;
}
