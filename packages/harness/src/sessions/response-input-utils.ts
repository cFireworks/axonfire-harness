import { randomUUID } from "node:crypto";
import { user } from "@openai/agents-core";
import { NativeHistoryInputUtils } from "./input-processor-utils.js";
import { CUSTOM_INPUT_ITEM_TYPES } from "./history-utils.js";
export function createResponseInputUtils(
  generateUUUID: () => string = randomUUID,
) {
  const eu = { generateUUUID },
    eg = { user, CUSTOM_INPUT_ITEM_TYPES: [...CUSTOM_INPUT_ITEM_TYPES] };
  class InputItemUtils extends NativeHistoryInputUtils {
    static createUserMessage(eA: any, el: any = {}): any {
      let { skipRun: ec = !0 } = el;
      return {
        id: (0, eu.generateUUUID)(),
        type: "message",
        role: "user",
        content: Array.isArray(eA) ? eA : [{ type: "input_text", text: eA }],
        providerData: { skipRun: ec },
      };
    }
    static createAssistantMessage(eA: any, el: any = {}): any {
      let { status: ec = "completed", skipRun: ed = !0, error: ep } = el;
      return {
        id: (0, eu.generateUUUID)(),
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: eA }],
        status: ec,
        providerData: { skipRun: ed, error: ep },
      };
    }
    static createErrorRecoveryInput(eA: any): any {
      return [(0, eg.user)(eA, { isMeta: !0 })];
    }
    static isCustomInputItem(eA: any): any {
      return !!eA.type && eg.CUSTOM_INPUT_ITEM_TYPES.includes(eA.type);
    }
  }
  return InputItemUtils;
}
