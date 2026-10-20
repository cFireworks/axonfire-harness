// Native UTF-16 11113694..11125692; method bodies + explicit DI.
import * as rB from "node:path";
import { CompactType } from "../context/compact-config.js";
import { TRUNCATION_RETRY_MARKER } from "../runner/history-repair.js";
import {
  NativeResponseInterceptor,
  MediaContentErrorType as tk,
  TEXTUAL_TOOL_CALL_RETRY_MARKER as rS,
} from "./response-interceptor-runtime.js";
const r_ = { TRUNCATION_RETRY_MARKER },
  rM = 11136;
export class MediaContentErrorInterceptor extends NativeResponseInterceptor {
  static MAX_RETRY_ATTEMPTS = 10;
  static GIF_UNSUPPORTED_ERROR_CODES = new Set([11125, 11133, 11135]);
  static GIF_UNSUPPORTED_PLACEHOLDER =
    "[GIF omitted from model context: the current model rejected image/gif input. Switch to a GIF-capable model or upload a PNG/JPEG version to analyze it.]";
  static ERROR_TYPE_PATTERNS = [
    {
      type: tk.IMAGE_SIZE_TOO_LARGE,
      patterns: [
        /image exceeds/i,
        /maximum supported size/i,
        /image dimensions exceed/i,
      ],
    },
    {
      type: tk.REQUEST_BODY_TOO_LARGE,
      patterns: [
        /request body larger than maxBodyLength/i,
        /body larger than.*limit/i,
      ],
    },
    {
      type: tk.TOO_MANY_IMAGES,
      patterns: [/too many images and documents/i, /too many images/i],
    },
    {
      type: tk.INVALID_IMAGE,
      patterns: [
        /invalid image data/i,
        /image format.*not supported/i,
        /provided image is not valid/i,
        /url sources are not supported/i,
      ],
    },
    {
      type: tk.MULTIMODAL_CONTENT_SHAPE,
      patterns: [
        /item of 'content' should be a message of a certain modal/i,
        /item of "content" should be a message of a certain modal/i,
        /content.*should be.*message.*modal/i,
        /invalid.*multimodal.*content/i,
      ],
    },
  ];
  async intercept(eA: any): Promise<any> {
    let el: any = this.runtime.utilities.ErrorUtils.extractBizCode(
      eA.result?.error ?? eA.result,
    );
    if (
      void 0 !== el &&
      MediaContentErrorInterceptor.GIF_UNSUPPORTED_ERROR_CODES.has(el)
    ) {
      let ec: any = this.replaceGifUserInputsWithPlaceholder(
        eA.session.history,
      );
      if (ec > 0)
        return void this.logger.info(
          `[MediaContentErrorInterceptor] Sanitized ${ec} GIF input(s) after model rejection code=${el}, session=${eA.session.id}`,
        );
    }
    let ec: any = this.extractErrorMessage(eA.result.error),
      eu: any = this.classifyError(ec);
    if (eu === tk.UNKNOWN) return;
    this.logger.info(
      `[MediaContentErrorInterceptor] Detected ${eu} error: ${ec?.substring(0, 100)}...`,
    );
    let ed: any = this.countRecentRetries(
      this.runtime.utilities.HistoryUtils.getActiveAgentOnlyHistory(
        eA.session.history,
      ),
    );
    if (ed >= MediaContentErrorInterceptor.MAX_RETRY_ATTEMPTS)
      return void this.logger.info(
        `[MediaContentErrorInterceptor] Max retry attempts reached in session ${eA.session.id}`,
      );
    try {
      let el: any = this.removeMediaBasedOnErrorType(eA.session.history, eu);
      if (el.removed) {
        this.logger.info(
          `[MediaContentErrorInterceptor] Removed media: ${el.removedInfo} (attempt ${ed + 1})`,
        );
        let ep: any = this.generateRetryMessage(eu, el, ec),
          eg: any = this.runtime.getAgentService();
        return (await eg.runDefault(ep, { context: eA.session }), !0);
      }
      if (
        (this.logger.info(
          `[MediaContentErrorInterceptor] No media content to remove in session ${eA.session.id}`,
        ),
        eu === tk.REQUEST_BODY_TOO_LARGE || eu === tk.MULTIMODAL_CONTENT_SHAPE)
      )
        return await this.truncateHistoryAndRetry(eA, ed);
    } catch (eA: any) {
      this.logger.warn(
        "[MediaContentErrorInterceptor] Failed to handle media content error:",
        eA,
      );
    }
  }
  async truncateHistoryAndRetry(eA: any, el: any): Promise<any> {
    let ec: any = eA.session.id,
      eu: any = this.runtime.utilities.HistoryTruncateUtils.countPtlRetries(
        eA.session.history,
      );
    if (eu >= this.runtime.utilities.MAX_PTL_RETRIES)
      return void this.logger.warn(
        `[MediaContentErrorInterceptor] truncate fallback: max PTL retries (${eu}/${this.runtime.utilities.MAX_PTL_RETRIES}) reached in session ${ec}, surfacing error to user`,
      );
    let ed: any = eA.session.history.length,
      ep: any =
        this.runtime.utilities.HistoryTruncateUtils.truncateHeadByTokenGap(
          eA.session.history,
          void 0,
        );
    if (!ep)
      return void this.logger.warn(
        `[MediaContentErrorInterceptor] truncate fallback FAILED: only one group left or history empty in session ${ec}; surfacing error to user`,
      );
    let eg: any = ed - ep.length;
    ((eA.session.history.length = 0),
      eA.session.history.push(...ep),
      this.logger.info(
        `[MediaContentErrorInterceptor] truncate fallback: session=${ec} dropped=${eg} item(s), remaining=${ep.length}, mediaRetry=${el + 1}/${MediaContentErrorInterceptor.MAX_RETRY_ATTEMPTS}`,
      ));
    let eh: any = this.stateMachine.getSnapshot(eA.session).status;
    (this.stateMachine.isBusy(eA.session) &&
      this.logger.info(
        `[MediaContentErrorInterceptor] force idling session from status='${eh}' before retry`,
      ),
      this.stateMachine.forceIdle(eA.session, "media-body-recovery"));
    let ef: any = [
        '<system-reminder data-role="error-recovery">\n## Request Body Size Recovery\n',
        `The previous request body exceeded the upstream gateway size limit even though there were no removable images. The oldest ${eg} message(s) were dropped to make room.`,
        "\nContinue with the task. If you need information that was in the dropped context, ask the user or re-read relevant files.\n",
        this.runtime.utilities.PTL_RETRY_MARKER,
        "</system-reminder>",
      ].join("\n"),
      em: any = this.runtime.utilities.InputItemUtils.createUserMessage(ef, {
        skipRun: !1,
      });
    em.providerData = {
      ...em.providerData,
      isCompactInternal: !0,
      isMediaBodyRecovery: !0,
      isPtlRetryMarker: !0,
    };
    let eE: any = this.runtime.getAgentService();
    return (await eE.runDefault([em], { context: eA.session }), !0);
  }
  classifyError(eA: any): any {
    if (!eA) return tk.UNKNOWN;
    for (let {
      type: el,
      patterns: ec,
    } of MediaContentErrorInterceptor.ERROR_TYPE_PATTERNS)
      if (ec.some((el: any) => el.test(eA))) return el;
    return tk.UNKNOWN;
  }
  generateRetryMessage(eA: any, el: any, ec: any): any {
    let eu: any = ['<system-reminder data-role="error-recovery">'];
    switch (
      (eu.push("## Media Content Error Recovery"),
      eu.push(""),
      eu.push(`**Error Type**: ${this.getErrorTypeDescription(eA)}`),
      eu.push(
        `**Action Taken**: ${el.removedInfo || "Removed problematic media content"}`,
      ),
      eu.push(""),
      eA)
    ) {
      case tk.TOO_MANY_IMAGES:
        (eu.push(
          "The conversation had too many images. The oldest image has been removed.",
        ),
          eu.push(
            "You can now continue with the task - the remaining images are still available.",
          ));
        break;
      case tk.REQUEST_BODY_TOO_LARGE:
      case tk.IMAGE_SIZE_TOO_LARGE:
        (eu.push(
          "The image was too large and has been removed from the conversation.",
        ),
          el.filePath &&
            (eu.push(`Removed image: \`${el.filePath}\``),
            eu.push(""),
            eu.push("To continue, you can compress the image and retry:"),
            eu.push(
              '- macOS: `sips -Z 1024 "image.png" --out "image_small.png"` or `sips -s format jpeg -s formatOptions 50 "image.png" --out "image.jpg"`',
            ),
            eu.push(
              '- Linux: `convert "image.png" -resize 50% -quality 70 "image_small.jpg"`',
            )));
        break;
      case tk.INVALID_IMAGE:
        (eu.push("The image format is invalid or not supported."),
          el.filePath &&
            (eu.push(`Removed image: \`${el.filePath}\``),
            eu.push(""),
            eu.push(
              "To continue, you can convert the image to a supported format:",
            ),
            eu.push(
              '- macOS: `sips -s format png "image.xxx" --out "image.png"`',
            ),
            eu.push('- Linux: `convert "image.xxx" "image.png"`')));
        break;
      case tk.MULTIMODAL_CONTENT_SHAPE:
        (eu.push(
          "The upstream model gateway rejected the multimodal content shape of a tool message.",
        ),
          eu.push(
            "The most recent image has been removed from the conversation as a recovery attempt.",
          ),
          el.filePath && eu.push(`Removed image: \`${el.filePath}\``),
          eu.push(""),
          eu.push(
            "Continue with the task using text-only context. Re-read the image with a smaller selection if needed.",
          ));
    }
    return (eu.push("</system-reminder>"), eu.join("\n"));
  }
  getErrorTypeDescription(eA: any): any {
    switch (eA) {
      case tk.TOO_MANY_IMAGES:
        return "Too many images in conversation";
      case tk.REQUEST_BODY_TOO_LARGE:
        return "Request body too large (total content exceeds limit)";
      case tk.IMAGE_SIZE_TOO_LARGE:
        return "Single image size too large";
      case tk.INVALID_IMAGE:
        return "Invalid or unsupported image format";
      case tk.MULTIMODAL_CONTENT_SHAPE:
        return "Upstream gateway rejected multimodal content shape";
      default:
        return "Unknown media error";
    }
  }
  removeMediaBasedOnErrorType(eA: any, el: any): any {
    let ec: any,
      eu: any,
      ed: any = this.findAllMediaLocations(eA);
    if (0 === ed.length) return { removed: !1 };
    switch (el) {
      case tk.TOO_MANY_IMAGES:
        ((ec = 0), (eu = "oldest"));
        break;
      case tk.REQUEST_BODY_TOO_LARGE:
      case tk.IMAGE_SIZE_TOO_LARGE:
      case tk.INVALID_IMAGE:
      case tk.MULTIMODAL_CONTENT_SHAPE:
      default:
        ((ec = ed.length - 1), (eu = "most recent"));
    }
    let ep: any = ed[ec],
      eg: any = this.extractFilePath(ep, eA);
    return (
      this.logger.info(
        `[MediaContentErrorInterceptor] Removing ${eu} media at history[${ep.historyIndex}], type: ${ep.type}`,
      ),
      this.removeMediaAtLocation(ep),
      {
        removed: !0,
        removedInfo: `Removed ${eu} image from conversation${eg ? ` (${eg})` : ""}`,
        filePath: eg,
      }
    );
  }
  findAllMediaLocations(eA: any): any {
    let el: any = [];
    for (let ec: any = 0; ec < eA.length; ec++) {
      let eu: any = eA[ec];
      if (
        ("message" === eu.type &&
          "user" === eu.role &&
          Array.isArray(eu.content) &&
          this.collectMediaLocationsFromArray(
            el,
            eu.content,
            ec,
            eu,
            "user_message",
          ),
        this.isFunctionResultItem(eu))
      ) {
        Array.isArray(eu.output) &&
          this.collectMediaLocationsFromArray(
            el,
            eu.output,
            ec,
            eu,
            "function_result",
          );
        let eA: any = this.getOutputText(eu);
        eA &&
          this.collectMediaLocationsFromJsonText(
            el,
            eA,
            ec,
            eu,
            "function_result_json",
          );
        let ed: any = eu.providerData?.toolResult?.content;
        Array.isArray(ed)
          ? this.collectMediaLocationsFromArray(
              el,
              ed,
              ec,
              eu,
              "function_result_provider_content",
            )
          : "string" == typeof ed &&
            this.collectMediaLocationsFromJsonText(
              el,
              ed,
              ec,
              eu,
              "function_result_provider_content_json",
            );
      }
    }
    return el;
  }
  collectMediaLocationsFromArray(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): any {
    for (let ep: any = 0; ep < el.length; ep++)
      this.isMediaContent(el[ep]) &&
        eA.push({
          historyIndex: ec,
          contentIndex: ep,
          type: ed,
          item: eu,
          content: el[ep],
        });
  }
  collectMediaLocationsFromJsonText(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): any {
    try {
      let ep: any = JSON.parse(el);
      Array.isArray(ep) &&
        this.collectMediaLocationsFromArray(eA, ep, ec, eu, ed);
    } catch {}
  }
  extractFilePath(eA: any, el: any): any {
    if (this.isFunctionResultItem(eA.item) && eA.item.callId)
      for (let ec: any = eA.historyIndex - 1; ec >= 0; ec--) {
        let eu: any = el[ec];
        if ("function_call" === eu.type && eu.callId === eA.item.callId) {
          try {
            let eA: any =
              "string" == typeof eu.arguments
                ? JSON.parse(eu.arguments)
                : eu.arguments;
            if (eA?.file_path) return eA.file_path;
          } catch {}
          break;
        }
      }
    if (eA.content) {
      if (
        eA.content.image_url?.url &&
        "string" == typeof eA.content.image_url.url
      ) {
        let el: any = eA.content.image_url.url;
        if (el.startsWith("file://")) return el.substring(7);
        let ec: any = this.parseImageBlobRef(el);
        if (ec?.source) return ec.source;
        if (ec?.blob_path) return ec.blob_path;
        if (!el.startsWith("data:")) return el;
      }
      let el: any = this.getImageBlobRef(eA.content);
      if (el?.source) return el.source;
      if (el?.blob_path) return el.blob_path;
      if ("string" == typeof eA.content.source) return eA.content.source;
      if (eA.content.source?.file_path) return eA.content.source.file_path;
    }
  }
  removeMediaAtLocation(eA: any): any {
    let el: any =
        "[Media removed: content exceeded model limits. See system reminder for details and alternatives.]",
      ec: any = { type: "text", text: el };
    "user_message" === eA.type && void 0 !== eA.contentIndex
      ? (eA.item.content[eA.contentIndex] = { type: "input_text", text: el })
      : "function_result" === eA.type && void 0 !== eA.contentIndex
        ? (eA.item.output[eA.contentIndex] = ec)
        : "function_result_json" === eA.type && void 0 !== eA.contentIndex
          ? this.replaceJsonArrayMediaAt(
              eA,
              this.getOutputText(eA.item),
              (el: any) => this.setOutputText(eA.item, el),
              ec,
            )
          : "function_result_provider_content" === eA.type &&
              void 0 !== eA.contentIndex
            ? (eA.item.providerData.toolResult.content[eA.contentIndex] = ec)
            : "function_result_provider_content_json" === eA.type &&
              void 0 !== eA.contentIndex &&
              this.replaceJsonArrayMediaAt(
                eA,
                eA.item.providerData?.toolResult?.content,
                (el: any) => {
                  eA.item.providerData.toolResult.content = el;
                },
                ec,
              );
  }
  replaceGifUserInputsWithPlaceholder(eA: any): any {
    let el: any = 0;
    for (let ec of eA)
      if (
        ec?.type === "message" &&
        "user" === ec.role &&
        Array.isArray(ec.content)
      )
        for (let eA: any = 0; eA < ec.content.length; eA++)
          this.isGifMediaContent(ec.content[eA]) &&
            ((ec.content[eA] = {
              type: "input_text",
              text: MediaContentErrorInterceptor.GIF_UNSUPPORTED_PLACEHOLDER,
            }),
            el++);
    return el;
  }
  isGifMediaContent(eA: any): any {
    if (!eA || "object" != typeof eA) return !1;
    let el: any = this.getImageBlobRef(eA);
    return (
      !!(
        el &&
        (this.isGifMimeType(el.mime) ||
          this.isGifValue(el.original_filename) ||
          this.isGifValue(el.source) ||
          this.isGifValue(el.blob_path))
      ) ||
      ("input_image" === eA.type
        ? this.isGifValue(eA.image) || this.isGifValue(eA.original_filename)
        : "image_url" === eA.type
          ? this.isGifValue(eA.image_url?.url)
          : "image" === eA.type &&
            (this.isGifMimeType(eA.mimeType ?? eA.media_type) ||
              this.isGifValue(eA.uri) ||
              this.isGifValue(eA.original_filename)))
    );
  }
  isGifMimeType(eA: any): any {
    return "string" == typeof eA && "image/gif" === eA.toLowerCase();
  }
  isGifValue(eA: any): any {
    if ("string" != typeof eA || !eA) return !1;
    if (/^data:image\/gif(?:;|,)/i.test(eA)) return !0;
    let el: any = eA;
    try {
      el = new URL(eA).pathname;
    } catch {
      el = eA.split(/[?#]/, 1)[0];
    }
    return ".gif" === (0, rB.extname)(el).toLowerCase();
  }
  replaceJsonArrayMediaAt(eA: any, el: any, ec: any, eu: any): any {
    if (el && void 0 !== eA.contentIndex)
      try {
        let ed: any = JSON.parse(el);
        if (!Array.isArray(ed)) return;
        ((ed[eA.contentIndex] = eu), ec(JSON.stringify(ed)));
      } catch {}
  }
  extractErrorMessage(eA: any): any {
    if (eA) {
      if (eA.error?.message) return eA.error.message;
      if (eA.message) return eA.message;
      if ("string" == typeof eA) return eA;
      try {
        let el: any = "string" == typeof eA ? eA : JSON.stringify(eA),
          ec: any = JSON.parse(el);
        return ec.error?.message || ec.message || ec.msg;
      } catch {
        return;
      }
    }
  }
  isMediaContent(eA: any): any {
    return (
      !!eA &&
      "object" == typeof eA &&
      ("image_url" === eA.type ||
        "image" === eA.type ||
        "input_image" === eA.type ||
        !!this.getImageBlobRef(eA))
    );
  }
  isFunctionResultItem(eA: any): any {
    return (
      "function_call_result" === eA.type || "function_call_output" === eA.type
    );
  }
  getOutputText(eA: any): any {
    return "string" == typeof eA.output
      ? eA.output
      : "string" == typeof eA.output?.text
        ? eA.output.text
        : void 0;
  }
  setOutputText(eA: any, el: any): any {
    "string" == typeof eA.output
      ? (eA.output = el)
      : eA.output?.text && (eA.output.text = el);
  }
  getImageBlobRef(eA: any): any {
    if (this.isImageBlobRef(eA)) return eA;
    let el: any = this.parseImageBlobRef(eA?.image);
    if (el) return el;
    let ec: any = this.parseImageBlobRef(eA?.image_url?.url);
    if (ec) return ec;
  }
  parseImageBlobRef(eA: any): any {
    if (this.isImageBlobRef(eA)) return eA;
    if ("string" == typeof eA && eA.includes("image_blob_ref"))
      try {
        let el: any = JSON.parse(eA);
        return this.isImageBlobRef(el) ? el : void 0;
      } catch {
        return;
      }
  }
  isImageBlobRef(eA: any): any {
    return (
      !!eA &&
      "object" == typeof eA &&
      "image_blob_ref" === eA.type &&
      "string" == typeof eA.blob_id
    );
  }
  countRecentRetries(eA: any): any {
    let el: any = 0;
    for (
      let ec: any = eA.length - 1;
      ec >= 0 && el < MediaContentErrorInterceptor.MAX_RETRY_ATTEMPTS;
      ec--
    ) {
      let eu: any = eA[ec];
      if ("user" === eu.role && eu.content)
        try {
          let eA: any =
            "string" == typeof eu.content
              ? eu.content
              : JSON.stringify(eu.content);
          if (eA.includes("Media Content Error Recovery")) el++;
          else if ("user" === eu.role && !eA.includes("Media removed")) break;
        } catch {}
    }
    return el;
  }
}
