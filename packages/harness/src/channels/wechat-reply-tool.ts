import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { ToolManager } from "../tools/tool-manager.js";
import type { ReplyToolRuntime } from "./channel-runtime.js";
const iJ = { z };
// extracted from codebuddy.js UTF-16 offsets 12068622..12072932; search term: "this.name=\"WeChatReply\""
export class WechatReplyTool {
  [key: string]: any;

  constructor(readonly runtime: ReplyToolRuntime) {
    ((this.name = "WeChatReply"),
      (this.description =
        'Send a reply to a WeChat user. ALWAYS pass arguments as a JSON object with explicit field names. Required field: chat_id (copy verbatim from the <channel> tag, do NOT append message text to it). For a text reply, set the "text" field. For an image/file, set "file_path". You may combine "text" + "file_path" for a caption. Optional: context_token (also copied from the <channel> tag). Correct example: {"chat_id":"wechat_xxx_yyy","text":"你好","context_token":"abc..."}. WRONG: WeChatReply(chat_id="wechat_xxx_yyy 你好") — never concatenate the message into chat_id, and never use positional/XML-style arguments. The reply text MUST live in the "text" field, never inside chat_id.'),
      (this.needsApproval = !1),
      (this.isEnabled = () => {
        try {
          let el: any = this.runtime.wechatFactory;
          return (
            el?.getAll().some((eA: any) => "connected" === eA.status) ?? !1
          );
        } catch {
          return !1;
        }
      }),
      (this.parameters = iJ.z.object({
        chat_id: iJ.z
          .string()
          .describe("The chat_id from the channel message meta"),
        text: iJ.z
          .string()
          .optional()
          .describe("The message text to send (required for text replies)"),
        file_path: iJ.z
          .string()
          .optional()
          .describe("Local file path to send as image or file attachment"),
        context_token: iJ.z
          .string()
          .optional()
          .describe("The context_token from the channel message meta"),
      })));
  }
  async execute(eA: any, el: any): Promise<any> {
    if (!eA.chat_id || !eA.chat_id.trim())
      return {
        content: "",
        error:
          "Missing chat_id: You must provide the chat_id from the <channel> message attributes. It should be in format: wechat_INSTANCEID_USERID or similar. Copy it directly from the message meta data.",
      };
    if (!eA.text && !eA.file_path)
      return /\s/.test(eA.chat_id) ||
        /[\u3000-\u9fff]/.test(eA.chat_id) ||
        eA.chat_id.length > 128
        ? {
            content: "",
            error:
              'Malformed call: it looks like the reply text was concatenated into chat_id. You MUST call WeChatReply with a JSON object using explicit field names. Correct format: {"chat_id":"wechat_xxx_yyy","text":"your message","context_token":"..."}. chat_id must be ONLY the attribute value from the <channel> tag (no spaces, no message text). Put the reply text in the "text" field.',
          }
        : {
            content: "",
            error:
              'Either text or file_path is required. Provide at least one. Example: {"chat_id":"' +
              eA.chat_id +
              '","text":"your reply"}.',
          };
    try {
      let eu: any = this.runtime.wechatBridge();
      if (eA.context_token && eA.context_token.length < 10)
        return {
          content: "",
          error:
            "Invalid context_token format: The token appears too short. Ensure you copied the complete context_token from the <channel> message attributes.",
        };
      if (eA.file_path) {
        let el: any = eA.file_path.toLowerCase().split(".").pop() || "";
        ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(el)
          ? await eu.sendImageReply(
              eA.chat_id,
              eA.file_path,
              eA.text,
              eA.context_token,
            )
          : (eA.text &&
              (await eu.sendReply(eA.chat_id, eA.text, eA.context_token)),
            await eu.sendFileReply(
              eA.chat_id,
              eA.file_path,
              void 0,
              eA.context_token,
            ));
      } else
        eA.text && (await eu.sendReply(eA.chat_id, eA.text, eA.context_token));
      return { content: "sent" };
    } catch (el: any) {
      let eA: any = el.message || String(el);
      if (eA.includes("No WeChat client is connected"))
        return {
          content: "",
          error:
            "No WeChat client is currently connected. Possible causes:\n1. The WeChat bot has disconnected. Try reconnecting the WeChat client.\n2. The chat_id refers to an instance that no longer exists.\nMake sure you're using the exact chat_id from the current message context.",
        };
      if (eA.includes("invalid") || eA.includes("malformed"))
        return {
          content: "",
          error: `Invalid chat_id or context_token format: ${eA}
Ensure you copied both values exactly from the <channel> message attributes:
chat_id="..." and context_token="..."`,
        };
      if (eA.includes("file") || eA.includes("File") || eA.includes("ENOENT"))
        return {
          content: "",
          error: `File operation failed: ${eA}
Check that the file_path is a valid absolute path to an existing file.`,
        };
      if (eA.includes("timeout") || eA.includes("Timeout"))
        return {
          content: "",
          error: `WeChat API timeout: ${eA}
The WeChat service may be temporarily unavailable. Try again in a moment.`,
        };
      return {
        content: "",
        error: `Failed to send message: ${eA}
Debugging tips:
1. Verify chat_id matches the format from <channel> tags
2. Ensure context_token is complete and not truncated
3. Check that the WeChat bot is still connected
4. Try copying chat_id and context_token again from the original message`,
      };
    }
  }

  register(tools: ToolManager): void {
    tools.register(this.name, {
      parameters: zodToJsonSchema(this.parameters),
      parseInput: false,
      needsApproval: this.needsApproval,
      isEnabled: () => this.isEnabled(),
      execute: (input, context) => this.execute(input, context),
    });
  }
}
