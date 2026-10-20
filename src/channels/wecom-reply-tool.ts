import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { ToolManager } from "../tools/tool-manager.js";
import type { ReplyToolRuntime } from "./channel-runtime.js";
const iJ = { z };
// extracted from codebuddy.js UTF-16 offsets 12073361..12076598; search term: "this.name=\"WeComReply\""
export class WecomReplyTool {
  [key: string]: any;

  constructor(readonly runtime: ReplyToolRuntime) {
    ((this.name = "WeComReply"),
      (this.description =
        "Send a reply to a WeCom (企业微信) user. Supports text (markdown), image_url, file_path, or file_url."),
      (this.needsApproval = !1),
      (this.isEnabled = () => {
        try {
          let el: any = this.runtime.wecomFactory;
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
          .describe("The message text to send (supports markdown formatting)"),
        image_url: iJ.z
          .string()
          .optional()
          .describe("Image URL to send (data:image/* or http*)"),
        file_path: iJ.z
          .string()
          .optional()
          .describe("Local file path to upload and send"),
        file_url: iJ.z
          .string()
          .optional()
          .describe("Remote file URL to download and send"),
      })));
  }
  async execute(eA: any, el: any): Promise<any> {
    try {
      let eu: any = this.runtime.wecomBridge();
      if (eA.file_path)
        return await this.sendMedia(eu, eA.chat_id, eA.file_path, "local");
      if (eA.file_url)
        return await this.sendMedia(eu, eA.chat_id, eA.file_url, "remote");
      if (eA.image_url)
        return await this.sendMedia(
          eu,
          eA.chat_id,
          eA.image_url,
          "data_or_url",
        );
      if (eA.text)
        return (
          await eu.sendReply(eA.chat_id, eA.text),
          {
            content: JSON.stringify({
              status: "success",
              action: "text_sent",
              chat_id: eA.chat_id,
              message: "Text message sent successfully to WeCom",
            }),
          }
        );
      return {
        content: "",
        error:
          "At least one of text, image_url, file_path, or file_url is required",
      };
    } catch (eA: any) {
      return { content: "", error: `Failed to send: ${eA.message}` };
    }
  }
  async sendMedia(eA: any, el: any, eu: any, ed: any): Promise<any> {
    try {
      let ep: any,
        { client: eg, platformData: eh } = eA.resolveClientForChat(el),
        ef: any = eh?.chatid,
        em: any = eh?.chattype,
        eE: any = "group" === em ? 2 : 1;
      if (!ef)
        return {
          content: "",
          error: "Cannot resolve chat target: missing chatid in route",
        };
      let eC: any = "file";
      if ("local" === ed) {
        let eA: any = await this.runtime.files.stat(eu);
        if (((eC = eu.split("/").pop() || "file"), eA.size > 0x1400000))
          return { content: "", error: "File size exceeds 20 MB limit" };
        let el: any = this.runtime.files;
        ep = await el.readFile(eu);
      } else
        ((ep = await this.urlToBuffer(eu)),
          (eC = eu.split("/").pop()?.split("?")[0] || "file"));
      if (!ep) return { content: "", error: `Failed to read/download: ${eu}` };
      let ey: any = this.detectMediaType(eC),
        ew: any = await eg.uploadMedia(ep, { type: ey, filename: eC });
      return (
        await eg.sendMediaMessage(ef, ey, ew.media_id, eE),
        {
          content: JSON.stringify({
            status: "success",
            action: "media_sent",
            chat_id: el,
            media_type: ey,
            filename: eC,
            message: `${ey} message sent successfully to WeCom`,
          }),
        }
      );
    } catch (eA: any) {
      return {
        content: "",
        error: `Failed to upload/send media: ${eA.message}`,
      };
    }
  }
  detectMediaType(eA: any): any {
    let el: any = eA.split(".").pop()?.toLowerCase();
    return el &&
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
        "heic",
        "heif",
      ].includes(el)
      ? "image"
      : el && ["mp4", "mov", "avi", "webm", "flv"].includes(el)
        ? "video"
        : el && ["amr", "mp3", "wav", "ogg"].includes(el)
          ? "voice"
          : "file";
  }
  async urlToBuffer(eA: any): Promise<any> {
    if (eA.startsWith("data:")) {
      let el: any = eA.match(/^data:([^;]+);base64,([\s\S]+)$/);
      if (el) return Buffer.from(el[2], "base64");
    } else if (eA.startsWith("http://") || eA.startsWith("https://")) {
      let el: any = await this.runtime.fetch(eA, {
        signal: this.runtime.timeoutSignal(3e4),
      });
      if (!el.ok) throw Error(`HTTP ${el.status} ${el.statusText}`);
      let ec: any = await el.arrayBuffer();
      return Buffer.from(ec);
    } else if (eA.startsWith("/") || eA.startsWith(".")) {
      let el: any = this.runtime.files;
      return await el.readFile(eA);
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
