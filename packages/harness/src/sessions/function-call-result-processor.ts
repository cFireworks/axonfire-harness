import { isCustomHistoryItem } from "./history-utils.js";
import { ToolResult } from "../tools/tool-result.js";
const t3 = { AgentInputItemProcessorPriority: { FunctionCallResult: 7 } },
  AB = { InputItemUtils: { isCustomInputItem: isCustomHistoryItem } },
  Aw = { ToolResult };
// Extracted from codebuddy.js UTF-16 offsets 11041906..11044215.
export class FunctionCallResultAgentInputItemProcessor {
  priority: number;
  constructor() {
    this.priority = t3.AgentInputItemProcessorPriority.FunctionCallResult;
  }
  isToolCallStructuredOutput(eA: any): any {
    return (
      "object" == typeof eA &&
      null !== eA &&
      "type" in eA &&
      (("input_text" === eA.type &&
        "text" in eA &&
        "string" == typeof eA.text) ||
        "input_image" === eA.type ||
        "input_file" === eA.type)
    );
  }
  reverseInputItemToMcpContent(eA: any): any {
    if ("object" != typeof eA || null === eA || !("type" in eA)) return eA;
    if ("input_text" === eA.type && "text" in eA) {
      let el: any = { type: "text", text: eA.text };
      return (
        "providerData" in eA &&
          eA.providerData &&
          (el.providerData = eA.providerData),
        el
      );
    }
    if ("input_image" === eA.type) {
      let el: any = { type: "image" };
      return (
        "image" in eA && eA.image && (el.image = eA.image),
        "detail" in eA && eA.detail && (el.detail = eA.detail),
        "providerData" in eA &&
          eA.providerData &&
          (el.providerData = eA.providerData),
        el
      );
    }
    if ("input_file" === eA.type) {
      let el: any = { type: "file" };
      return (
        "file" in eA && eA.file && (el.file = eA.file),
        "filename" in eA && eA.filename && (el.filename = eA.filename),
        "providerData" in eA &&
          eA.providerData &&
          (el.providerData = eA.providerData),
        el
      );
    }
    return eA;
  }
  async process(eA: any, el: any): Promise<any> {
    if (
      !AB.InputItemUtils.isCustomInputItem(eA) &&
      (eA.providerData || (eA.providerData = {}),
      "function_call_result" === eA.type)
    ) {
      if (eA.name.startsWith("mcp__")) {
        if (Array.isArray(eA.output)) {
          if (
            eA.output.length > 0 &&
            this.isToolCallStructuredOutput(eA.output[0])
          ) {
            let el: any = {
              content: eA.output.map((eA: any) =>
                this.reverseInputItemToMcpContent(eA),
              ),
            };
            eA.output = { type: "text", text: JSON.stringify(el) };
          }
        } else if (this.isToolCallStructuredOutput(eA.output)) {
          let el: any = {
            content: [this.reverseInputItemToMcpContent(eA.output)],
          };
          eA.output = { type: "text", text: JSON.stringify(el) };
        }
      }
      if (
        !("object" != typeof eA.output || Array.isArray(eA.output)) &&
        "type" in eA.output &&
        "text" === eA.output.type &&
        (eA.providerData || (eA.providerData = {}), !eA.providerData.toolResult)
      )
        try {
          let el: any = JSON.parse(eA.output.text);
          eA.name.startsWith("mcp__")
            ? (Array.isArray(el.content) &&
                (el.content = el.content.filter(
                  (eA: any) =>
                    "text" !== eA.type ||
                    "string" != typeof eA.text ||
                    eA.text.trim().length > 0,
                )),
              (eA.providerData.toolResult = {
                content: JSON.stringify(el.content),
                renderer: { type: "media" },
              }),
              (eA.output.text =
                "string" == typeof el.content
                  ? el.content
                  : JSON.stringify(el.content)))
            : Aw.ToolResult.is(el)
              ? ((eA.providerData.toolResult = el),
                (eA.output.text =
                  "string" == typeof el.content
                    ? el.content
                    : JSON.stringify(el.content)))
              : (eA.providerData.toolResult = {
                  content: el[el.type],
                  renderer: { type: "text" },
                });
        } catch (eA: any) {}
    }
  }
}
