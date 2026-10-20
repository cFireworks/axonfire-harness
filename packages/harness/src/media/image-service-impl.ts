import * as n4 from "node:path";
import * as ok from "node:fs/promises";
import * as nC from "./media-types.js";
import * as iq from "./media-types.js";
import { type MediaRuntime } from "./media-runtime.js";
const sF = {
  HttpHeaders: { CONTENT_TYPE: "Content-Type", AUTHORIZATION: "Authorization" },
};
// extracted from codebuddy.js bytes 12024390..12031124; search term: "initializeOutputDir("
export class ImageServiceImpl {
  outputDir: any;
  constructor(readonly runtime: MediaRuntime) {}

  async initializeOutputDir(eA: any): Promise<any> {
    ((this.outputDir =
      eA ?? n4.join(this.runtime.getWorkDir(), "generated-images")),
      await ok.mkdir(this.outputDir, { recursive: !0 }));
  }
  async generateImage(eA: any, el: any): Promise<any> {
    let { auth: ec, endpoint: eu } = await this.prepareRequest(),
      ed: any = `${eu}/v2/images/generations`,
      ep: any = await this.resolveModel(el.context, nC.TEXT_TO_IMAGE_MODEL_TAG),
      eg: any = this.buildBaseRequestBody(eA, ep),
      eh: any = el.context.abortSignal,
      ef: any = await this.runtime.restOperations.request({
        url: ed,
        method: "POST",
        headers: {
          [sF.HttpHeaders.CONTENT_TYPE]: "application/json",
          [sF.HttpHeaders.AUTHORIZATION]: `Bearer ${ec.accessToken}`,
        },
        data: eg,
        signal: eh,
      });
    return this.processResponse(ef.data, eA.prompt, eh);
  }
  async editImage(eA: any, el: any): Promise<any> {
    let { auth: ec, endpoint: eu } = await this.prepareRequest(),
      ed: any = `${eu}/v2/images/edits`,
      ep: any = await this.resolveModel(
        el.context,
        nC.IMAGE_TO_IMAGE_MODEL_TAG,
      ),
      eg: any = this.buildBaseRequestBody(eA, ep);
    (eA.image &&
      eA.image.length > 0 &&
      (eg.image = Array.isArray(eA.image) ? eA.image : [eA.image]),
      eA.input_fidelity && (eg.input_fidelity = eA.input_fidelity));
    let eh: any = el.context.abortSignal,
      ef: any = await this.runtime.restOperations.request({
        url: ed,
        method: "POST",
        headers: {
          [sF.HttpHeaders.CONTENT_TYPE]: "application/json",
          [sF.HttpHeaders.AUTHORIZATION]: `Bearer ${ec.accessToken}`,
        },
        data: eg,
        signal: eh,
      });
    return this.processResponse(ef.data, eA.prompt, eh);
  }
  async processImageInput(eA: any, el: any): Promise<any> {
    let ec: any = eA.trim();
    return ec.startsWith("data:")
      ? this.processDataUrl(ec)
      : ec.startsWith("http://") || ec.startsWith("https://")
        ? this.processHttpUrl(ec, el)
        : this.isLikelyBase64(ec)
          ? this.processRawBase64(ec)
          : this.processFilePath(ec);
  }
  isLikelyBase64(eA: any): any {
    return (
      !(eA.includes("/") || eA.includes("\\")) &&
      !(eA.length < 100) &&
      /^[A-Za-z0-9+/]+=*$/.test(eA)
    );
  }
  processDataUrl(eA: any): any {
    let el: any = eA.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!el)
      throw Error(
        "Invalid data URL format. Expected: data:image/xxx;base64,...",
      );
    let ec: any = el[1],
      eu: any = el[2];
    if (!eu || 0 === eu.length)
      throw Error("Data URL contains empty base64 content");
    return `data:${ec};base64,${eu}`;
  }
  processRawBase64(eA: any): any {
    let el: any = this.detectMimeTypeFromBase64(eA);
    return `data:${el};base64,${eA}`;
  }
  async processHttpUrl(eA: any, el: any): Promise<any> {
    this.runtime.logger.debug(`Downloading image from URL: ${eA}`);
    try {
      let ec: any = await this.runtime.restOperations.request({
          url: eA,
          method: "GET",
          responseType: "arraybuffer",
          signal: el,
        }),
        eu: any = Buffer.from(ec.data).toString("base64"),
        ed: any = ec.headers?.["content-type"]?.split(";")[0];
      return (
        (ed && ed.startsWith("image/")) ||
          (ed = this.detectMimeTypeFromBase64(eu)),
        `data:${ed};base64,${eu}`
      );
    } catch (el: any) {
      throw Error(
        `Failed to download image from URL: ${eA}. ${this.extractErrorMessage(el)}`,
      );
    }
  }
  async processFilePath(eA: any): Promise<any> {
    try {
      await ok.access(eA);
    } catch {
      throw Error(`Image file not found: ${eA}`);
    }
    let el: any = (await ok.readFile(eA)).toString("base64"),
      ec: any = this.getMimeType(eA);
    if (!ec.startsWith("image/"))
      throw Error(
        `Unsupported file type: ${ec}. Only image files are supported.`,
      );
    return `data:${ec};base64,${el}`;
  }
  detectMimeTypeFromBase64(eA: any): any {
    try {
      let el: any = Buffer.from(eA.slice(0, 32), "base64");
      if (137 === el[0] && 80 === el[1] && 78 === el[2] && 71 === el[3])
        return "image/png";
      if (255 === el[0] && 216 === el[1] && 255 === el[2]) return "image/jpeg";
      if (71 === el[0] && 73 === el[1] && 70 === el[2] && 56 === el[3])
        return "image/gif";
      if (
        82 === el[0] &&
        73 === el[1] &&
        70 === el[2] &&
        70 === el[3] &&
        87 === el[8] &&
        69 === el[9] &&
        66 === el[10] &&
        80 === el[11]
      )
        return "image/webp";
      if (66 === el[0] && 77 === el[1]) return "image/bmp";
    } catch {}
    return (
      this.runtime.logger.debug(
        "Could not detect image type from content, defaulting to image/png",
      ),
      "image/png"
    );
  }
  getMimeType(eA: any): any {
    return (
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".tiff": "image/tiff",
        ".tif": "image/tiff",
      }[n4.extname(eA).toLowerCase()] || "application/octet-stream"
    );
  }
  async saveImage(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any = new this.runtime.Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19),
      ep: any = el.slice(0, 30).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_"),
      eg: any = ec > 0 ? `_${ec + 1}` : "",
      eh: any = `${ep}_${ed}${eg}.png`,
      ef: any = n4.join(this.outputDir, eh);
    if (eA.b64_json) await ok.writeFile(ef, Buffer.from(eA.b64_json, "base64"));
    else if (eA.url) {
      let el: any = await this.runtime.restOperations.request({
        url: eA.url,
        method: "GET",
        responseType: "arraybuffer",
        signal: eu,
      });
      await ok.writeFile(ef, Buffer.from(el.data));
    } else throw Error("Image data contains neither base64 nor URL");
    return ef;
  }
  extractErrorMessage(eA: any): any {
    let el: any = eA,
      ec: any = el?.response?.data;
    if (ec) {
      let eA: any = ec.requestId,
        el: any = eA ? ` (requestId: ${eA})` : "";
      if (ec.extError?.message) return ec.extError.message + el;
      if (ec.msg) return ec.msg + el;
      if (eA) return `Unknown error${el}`;
    }
    let eu: any = el?.config?.headers?.["X-Request-ID"],
      ed: any = eu ? ` (requestId: ${eu})` : "";
    return eA instanceof Error ? eA.message + ed : String(eA) + ed;
  }
  getModelsByTag(eA: any, el: any): any {
    return eA.models?.filter((eA: any) => eA.tags?.includes(el)) || [];
  }
  async prepareRequest(): Promise<any> {
    let eA: any = this.runtime.authentication();
    if (!eA?.accessToken)
      throw Error("Authentication required. Please login first.");
    let el: any = (await this.runtime.configuration()).endpoint;
    if (!el) throw Error("Base endpoint not configured.");
    return { auth: eA, endpoint: el };
  }
  buildBaseRequestBody(eA: any, el: any): any {
    let ec: any = el.startsWith("hunyuan-"),
      eu: any = el.startsWith("gemini-"),
      ed: any = !ec && !eu,
      ep: any = "1024x1024",
      eg: any = { model: el, prompt: eA.prompt, size: eA.size || ep };
    return (
      ed &&
        ((eg.response_format = "b64_json"),
        eA.n && (eg.n = eA.n),
        eA.quality && (eg.quality = eA.quality),
        eA.style && (eg.style = eA.style),
        eA.background && (eg.background = eA.background)),
      ec &&
        ((eg.n = eA.n || 1),
        eA.footnote && (eg.footnote = eA.footnote),
        void 0 !== eA.revise && (eg.revise = { value: eA.revise })),
      this.runtime.logger.info(
        `[ImageService] buildBaseRequestBody: model=${el}, branch=${ec ? "hunyuan" : eu ? "gemini" : "openai"}, size=${eg.size}, keys=[${Object.keys(eg).join(",")}]`,
      ),
      eg
    );
  }
  async processResponse(eA: any, el: any, ec: any): Promise<any> {
    if (0 !== eA.code)
      throw Error(
        `API error: ${eA.msg} (code: ${eA.code}, request_id: ${eA.request_id})`,
      );
    let eu: any = eA.data;
    if (!eu?.data || 0 === eu.data.length)
      throw Error("No image data returned from API");
    let ed: any = [];
    for (let eA: any = 0; eA < eu.data.length; eA++) {
      let ep: any = eu.data[eA],
        eg: any = await this.saveImage(ep, el, eA, ec);
      ed.push(eg);
    }
    return ed;
  }
  async resolveModel(eA: any, el: any): Promise<any> {
    let ec: any = await this.runtime.configuration(),
      eu: any = el === nC.TEXT_TO_IMAGE_MODEL_TAG,
      ed: any = eu ? "textToImageModel" : "imageToImageModel",
      ep: any = eu
        ? iq.ENV_KEY_CODEBUDDY_TEXT_TO_IMAGE_MODEL
        : iq.ENV_KEY_CODEBUDDY_IMAGE_TO_IMAGE_MODEL,
      eg: any = eu ? "hunyuan-image-v3.0" : "hunyuan-image-v2.0-general-edit",
      eh: any = eA?.options?.[ed];
    if (eh)
      return (
        this.runtime.logger.debug(
          `Using ${el} model from session options: ${eh}`,
        ),
        eh
      );
    let ef: any = this.runtime.env[ep];
    if (ef)
      return (
        this.runtime.logger.debug(`Using ${el} model from env: ${ef}`),
        ef
      );
    let em: any = await this.runtime.settings.get(ed);
    if (em)
      return (
        this.runtime.logger.debug(
          `Using ${el} model from merged settings: ${em}`,
        ),
        em
      );
    let eE: any = this.getModelsByTag(ec, el);
    return eE.length > 0
      ? (this.runtime.logger.debug(
          `Using first ${el} model from config: ${eE[0].id}`,
        ),
        eE[0].id)
      : (this.runtime.logger.debug(`Using fallback ${el} model: ${eg}`), eg);
  }
}
