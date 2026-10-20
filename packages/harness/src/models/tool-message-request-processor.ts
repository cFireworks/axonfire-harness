import { detectMimeFromBase64 } from "./image-mime.js";
const sD = { ImageUtils: { detectMimeFromBase64 } };
// Extracted from codebuddy.js UTF-16 offsets 8559013..8561670.
export class ToolMessageModelRequestProcessor {
  constructor(
    readonly logger: any = { setContext() {}, debug() {}, warn() {} },
    readonly imageBlobService?: any,
  ) {}

  init(): any {
    this.logger.setContext("ModelRequestProcessor");
  }
  async process(eA: any): Promise<any> {
    try {
      let el: any = "string" == typeof eA.data,
        ec: any = el ? JSON.parse(eA.data) : eA.data,
        eu: any = ec.messages,
        ed: any = new Set();
      for (let eA of eu)
        if (Array.isArray(eA.tool_calls)) {
          for (let el of eA.tool_calls)
            if (el.id && "function" === el.type)
              try {
                JSON.parse(el.function.arguments);
              } catch (eA: any) {
                ed.add(el.id);
              }
        }
      let ep: any = [];
      for (let eA of eu) {
        if (Array.isArray(eA.tool_calls)) {
          let el: any = eA.tool_calls.filter((eA: any) => !ed.has(eA.id));
          if (0 === el.length) continue;
          eA.tool_calls = el;
        } else if ("tool" === eA.role && ed.has(eA.tool_call_id)) continue;
        if ("tool" === eA.role && eA.toolResult) {
          let el: any = JSON.parse(JSON.stringify(eA));
          (delete el.toolResult, ep.push(el));
          continue;
        }
        ep.push(eA);
      }
      (await this.normalizeToolMessageContent(ep),
        this.sanitizeEmptyContent(ep));
      let eg: any = ep[ep.length - 1];
      (eg?.role !== "assistant" ||
        eg.tool_calls?.length ||
        (this.logger.debug(
          `Stripped trailing assistant message without tool_calls (content length: ${"string" == typeof eg.content ? eg.content.length : 0})`,
        ),
        ep.pop()),
        (ec.messages = ep),
        (eA.data = el ? JSON.stringify(ec) : ec));
    } catch (eA: any) {
      this.logger.warn(`process error: ${eA}`);
    }
  }
  sanitizeEmptyContent(eA: any): any {
    for (let el: any = eA.length - 1; el >= 0; el--) {
      let ec: any = eA[el],
        eu: any = ec.content;
      (null == eu || (Array.isArray(eu) && 0 === eu.length) || "" === eu) &&
        ("assistant" === ec.role && ec.tool_calls?.length > 0
          ? delete ec.content
          : "assistant" === ec.role
            ? (this.logger.debug(
                `Removed assistant message at index ${el} with empty content and no tool_calls`,
              ),
              eA.splice(el, 1))
            : "user" === ec.role &&
              (this.logger.warn(
                `[sanitizeEmptyContent] Removed user message at index ${el} with empty content`,
              ),
              eA.splice(el, 1)));
    }
  }
  async normalizeToolMessageContent(eA: any): Promise<any> {
    for (let el of eA) {
      let eA: any;
      if ("tool" !== el.role || "string" != typeof el.content) continue;
      let ec: any = el.content.trim();
      if (ec.startsWith("[")) {
        try {
          eA = JSON.parse(ec);
        } catch {
          continue;
        }
        if (Array.isArray(eA)) {
          for (let el: any = 0; el < eA.length; el++) {
            let ec: any = eA[el];
            if (ec?.type !== "image") continue;
            let eu: any =
              "string" == typeof ec.image
                ? ec.image
                : "string" == typeof ec.data
                  ? ec.data
                  : void 0;
            if (!eu) continue;
            let ed: any = eu.startsWith("data:")
              ? eu
              : `data:${ec.mimeType || ec.mediaType || sD.ImageUtils.detectMimeFromBase64(eu)};base64,${eu}`;
            eA[el] = { type: "image_url", image_url: { url: ed } };
          }
          if (eA.some((eA: any) => eA?.type === "image_url")) {
            el.content = eA;
            continue;
          }
          if (eA.some((eA: any) => eA?.type === "image_blob_ref"))
            try {
              let ec: any = !1,
                eu: any = [...eA];
              for (let eA: any = 0; eA < eu.length; eA++) {
                let el: any = eu[eA];
                if (el?.type === "image_blob_ref" && el.blob_id) {
                  let ed: any = await this.imageBlobService.rehydrate(el);
                  (ed
                    ? (eu[eA] = { type: "image_url", image_url: { url: ed } })
                    : (eu[eA] = {
                        type: "text",
                        text: this.imageBlobService.createPlaceholder(el),
                      }),
                    (ec = !0));
                }
              }
              ec && (el.content = eu);
            } catch (eA: any) {
              this.logger.warn(
                `[normalizeToolMessageContent] Failed to rehydrate blob refs: ${eA}`,
              );
            }
        }
      }
    }
  }
}
