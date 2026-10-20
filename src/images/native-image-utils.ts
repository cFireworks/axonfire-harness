import * as ef from "node:path";
import {
  createImageCodecRuntime,
  type ImageCodecRuntime,
} from "./image-codec-runtime.js";
// Entire original ImageUtils class: UTF-16 13202774..13208907.
export function createNativeImageUtils(
  runtime: ImageCodecRuntime = createImageCodecRuntime(),
) {
  const tF = runtime.codec;
  const tU: any = "CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION",
    tj: any = 2e3,
    tG: any = [0, 1080, 2e3],
    tH: any = {
      1080: {
        maxDimension: 1080,
        maxBase64Size: 512e3,
        maxRawBytes: Math.floor(384e3),
        jpegQualities: [85, 70, 50, 30],
      },
      2e3: {
        maxDimension: 2e3,
        maxBase64Size: 5242880,
        maxRawBytes: Math.floor(3932160),
        jpegQualities: [80, 60, 40, 20],
      },
    };
  class ImageUtils {
    static IMAGE_MIME_TYPE_MAP: Record<string, string>;
    static MODEL_SUPPORTED_FORMATS: Record<string, string[]>;
    static IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER: string;
    static detectMimeFromMagicBytes(eA: any): any {
      if (!(eA.length < 2)) {
        if (137 === eA[0] && 80 === eA[1] && 78 === eA[2] && 71 === eA[3])
          return "image/png";
        if (255 === eA[0] && 216 === eA[1] && 255 === eA[2])
          return "image/jpeg";
        if (71 === eA[0] && 73 === eA[1] && 70 === eA[2] && 56 === eA[3])
          return "image/gif";
        if (
          eA.length >= 12 &&
          82 === eA[0] &&
          73 === eA[1] &&
          70 === eA[2] &&
          70 === eA[3] &&
          87 === eA[8] &&
          69 === eA[9] &&
          66 === eA[10] &&
          80 === eA[11]
        )
          return "image/webp";
        if (66 === eA[0] && 77 === eA[1]) return "image/bmp";
        if (
          (eA.length >= 4 &&
            73 === eA[0] &&
            73 === eA[1] &&
            42 === eA[2] &&
            0 === eA[3]) ||
          (eA.length >= 4 &&
            77 === eA[0] &&
            77 === eA[1] &&
            0 === eA[2] &&
            42 === eA[3])
        )
          return "image/tiff";
      }
    }
    static detectMimeFromBase64(eA: any): any {
      if ("string" != typeof eA || 0 === eA.length) return "image/png";
      let el: any = eA.match(/^data:([^;,]+)[;,]/);
      if (el) return el[1];
      try {
        let el: any = Buffer.from(eA.slice(0, 24), "base64");
        return this.detectMimeFromMagicBytes(el) || "image/png";
      } catch {
        return "image/png";
      }
    }
    static getImageMimeType(eA: any): any {
      let el: any = eA.includes(".")
        ? ef.extname(eA).toLowerCase().substring(1)
        : eA.toLowerCase();
      return this.IMAGE_MIME_TYPE_MAP[el] || "image/png";
    }
    static detectMimeFromBufferSync(eA: any): any {
      return this.detectMimeFromMagicBytes(eA) || "image/png";
    }
    static async getImageMimeTypeAsync(eA: any, el: any): Promise<any> {
      try {
        let ec: any = await el(eA, { flag: "r" }),
          eu: any = this.detectMimeFromMagicBytes(ec);
        if (eu) return eu;
        let ed: any = ef.extname(eA).toLowerCase().substring(1);
        return this.IMAGE_MIME_TYPE_MAP[ed] || "image/png";
      } catch {
        let el: any = ef.extname(eA).toLowerCase().substring(1);
        return this.IMAGE_MIME_TYPE_MAP[el] || "image/png";
      }
    }
    static getImageMimeTypeSync(eA: any, el?: any): any {
      let ec: any =
          eA.includes("/") || eA.includes("\\")
            ? ef.extname(eA).toLowerCase().substring(1)
            : eA.toLowerCase().replace(/^\./, ""),
        eu: any = this.IMAGE_MIME_TYPE_MAP[ec];
      if (eu) return eu;
      if (el)
        try {
          let ec: any = el(eA);
          return this.detectMimeFromBufferSync(ec);
        } catch {}
      return "image/png";
    }
    static isSupportedImageFormat(eA: any): any {
      return (
        (eA.includes("/") || eA.includes("\\")
          ? ef.extname(eA).toLowerCase().substring(1)
          : eA.toLowerCase().replace(/^\./, "")) in this.IMAGE_MIME_TYPE_MAP
      );
    }
    static getSupportedImageFormats(eA: any): any {
      if (!eA) return this.MODEL_SUPPORTED_FORMATS.default;
      let el: any = eA.toLowerCase().split("-")[0];
      return (
        this.MODEL_SUPPORTED_FORMATS[el] || this.MODEL_SUPPORTED_FORMATS.default
      );
    }
    static isImageSupportedByModel(eA: any, el: any): any {
      let ec: any =
        eA.includes("/") || eA.includes("\\")
          ? ef.extname(eA).toLowerCase()
          : eA.toLowerCase().startsWith(".")
            ? eA.toLowerCase()
            : `.${eA.toLowerCase()}`;
      return this.getSupportedImageFormats(el).includes(ec);
    }
    static logCompressionWarning(eA: any, el?: any): any {
      try {
        let ec: any = runtime.logger;
        if (void 0 !== el) {
          let eu: any = el instanceof Error ? el.message : String(el);
          ec.warn(`${eA} ${eu}`);
          return;
        }
        ec.warn(eA);
      } catch {}
    }
    static getImageCompressionMaxDimension(): any {
      let eA: any = runtime.env[tU];
      if (void 0 === eA || "" === eA) return tj;
      let el: any = Number.parseInt(eA, 10);
      return !Number.isFinite(el) || el < 0 ? tj : el;
    }
    static getSupportedCompressionDimensions(): any {
      return tG;
    }
    static getCurrentImageCompressionProfile(
      eA: any = this.getImageCompressionMaxDimension(),
    ): any {
      if (0 === eA) return;
      let el: any = tH[eA];
      return (
        el ||
        (this.logCompressionWarning(
          `Unsupported image compression max dimension: ${eA}. Supported values: ${[...tG].join(", ")}. Falling back to ${tj}.`,
        ),
        tH[tj])
      );
    }
    static getBase64FromDataUrl(eA: any): any {
      return eA.split(",")[1];
    }
    static getRawBytesFromBase64(eA: any): any {
      return Math.round(0.75 * eA.length);
    }
    static isWithinProfileSizeLimit(eA: any, el: any): any {
      return (
        eA.length <= el.maxBase64Size &&
        this.getRawBytesFromBase64(eA) <= el.maxRawBytes
      );
    }
    static isJimpResolutionLimitError(eA: any): any {
      let el: any = eA instanceof Error ? eA.message : String(eA);
      return /maxResolutionInMP|resolution.*limit/i.test(el);
    }
    static shouldOmitAfterCompressionFailure(eA: any, el: any, ec?: any): any {
      if (void 0 !== ec && this.isJimpResolutionLimitError(ec)) return !0;
      let eu: any = this.getBase64FromDataUrl(eA);
      return !!eu && !this.isWithinProfileSizeLimit(eu, el);
    }
    static async recompressImage(eA: any, el: any, ec: any): Promise<any> {
      let eu: any = eA.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!eu) return eA;
      let ed: any = Buffer.from(eu[2], "base64"),
        ep: any = await tF.read(ed);
      el === tF.MIME_JPEG && "number" == typeof ec && ep.quality(ec);
      let eg: any = await ep.getBufferAsync(el);
      return `data:${el};base64,${eg.toString("base64")}`;
    }
    static async compressToProfileLimit(eA: any, el: any): Promise<any> {
      let ec: any = this.getBase64FromDataUrl(eA);
      if (!ec || this.isWithinProfileSizeLimit(ec, el)) return eA;
      try {
        let ec: any = eA.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!ec) return eA;
        if (ec[1] === tF.MIME_JPEG)
          for (let ec of el.jpegQualities) {
            let eu: any = await this.recompressImage(eA, tF.MIME_JPEG, ec),
              ed: any = this.getBase64FromDataUrl(eu);
            if (ed && this.isWithinProfileSizeLimit(ed, el)) return eu;
          }
        for (let ec of el.jpegQualities) {
          let eu: any = await this.convertToJpeg(eA, ec),
            ed: any = this.getBase64FromDataUrl(eu);
          if (ed && this.isWithinProfileSizeLimit(ed, el)) return eu;
        }
        return "";
      } catch (ec: any) {
        return (
          this.logCompressionWarning(
            "ImageUtils.compressToProfileLimit failed, discarding oversized image.",
            ec,
          ),
          this.shouldOmitAfterCompressionFailure(eA, el, ec) ? "" : eA
        );
      }
    }
    static async compressImage(eA: any, el: any = tj, ec?: any): Promise<any> {
      try {
        let ec: any = eA.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!ec) return eA;
        let eu: any = ec[2],
          ed: any = Buffer.from(eu, "base64"),
          ep: any = await tF.read(ed),
          { width: eg, height: eh } = ep.bitmap,
          ef: any = ep.getMIME();
        if (eg <= el && eh <= el) return `data:${ef};base64,${eu}`;
        let em: any = Math.max(eg, eh),
          eE: any = el / em,
          eC: any = Math.round(eg * eE),
          ey: any = Math.round(eh * eE);
        ep.resize(eC, ey);
        let ew: any = (await ep.getBufferAsync(ef)).toString("base64");
        return `data:${ef};base64,${ew}`;
      } catch (el: any) {
        if (
          (this.logCompressionWarning(
            "ImageUtils.compressImage failed, using original image.",
            el,
          ),
          ec?.throwOnFailure)
        )
          throw el;
        return eA;
      }
    }
    static async convertToJpeg(eA: any, el: any = 85): Promise<any> {
      try {
        let ec: any = eA.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!ec) return eA;
        let eu: any = ec[2],
          ed: any = Buffer.from(eu, "base64"),
          ep: any = await tF.read(ed),
          eg: any = (
            await ep.quality(el).getBufferAsync(tF.MIME_JPEG)
          ).toString("base64");
        return `data:image/jpeg;base64,${eg}`;
      } catch (el: any) {
        return (
          this.logCompressionWarning(
            "ImageUtils.convertToJpeg failed, using original image.",
            el,
          ),
          eA
        );
      }
    }
    static async compressUserImage(eA: any, el?: any): Promise<any> {
      let ec: any,
        eu: any = this.getCurrentImageCompressionProfile(el);
      if (!eu) return eA;
      try {
        ec = await this.compressImage(eA, eu.maxDimension, {
          throwOnFailure: !0,
        });
      } catch (el: any) {
        return (
          this.logCompressionWarning(
            "ImageUtils.compressUserImage resize failed.",
            el,
          ),
          this.shouldOmitAfterCompressionFailure(eA, eu, el) ? "" : eA
        );
      }
      let ed: any = this.getBase64FromDataUrl(ec);
      return !ed || this.isWithinProfileSizeLimit(ed, eu)
        ? ec
        : this.compressToProfileLimit(ec, eu);
    }
  }
  ImageUtils.IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER =
    "[Image too large — omitted after compression]";
  ImageUtils.IMAGE_MIME_TYPE_MAP = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    jpe: "image/jpeg",
    jfif: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    svgz: "image/svg+xml",
    bmp: "image/bmp",
    dib: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
    ico: "image/x-icon",
    cur: "image/x-icon",
    avif: "image/avif",
    heic: "image/heic",
    heif: "image/heif",
  };
  ImageUtils.MODEL_SUPPORTED_FORMATS = {
    claude: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    gpt: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    gemini: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],
    default: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  };
  return ImageUtils;
}
export type NativeImageUtils = ReturnType<typeof createNativeImageUtils>;
export const ImageUtils = createNativeImageUtils();
