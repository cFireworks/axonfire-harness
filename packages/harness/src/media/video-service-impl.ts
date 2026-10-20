import * as n4 from "node:path";
import * as ok from "node:fs/promises";
import * as nC from "./media-types.js";
import * as iq from "./media-types.js";
import { type MediaRuntime } from "./media-runtime.js";
export const VIDEO_POLL_INTERVAL_MS = 5000,
  VIDEO_MAX_POLL_MS = 600000,
  VIDEO_TEXT_FALLBACK_MODEL = "kling-v3-t2v",
  VIDEO_IMAGE_FALLBACK_MODEL = "kling-v3-i2v";
const ck = VIDEO_POLL_INTERVAL_MS,
  cM = VIDEO_MAX_POLL_MS,
  cx = VIDEO_TEXT_FALLBACK_MODEL,
  cO = VIDEO_IMAGE_FALLBACK_MODEL;
const sF = {
  HttpHeaders: { CONTENT_TYPE: "Content-Type", AUTHORIZATION: "Authorization" },
};
// extracted from codebuddy.js bytes 12037069..12041876; search term: "initializeOutputDir("
export class VideoServiceImpl {
  outputDir: any;
  constructor(readonly runtime: MediaRuntime) {}

  async initializeOutputDir(eA: any): Promise<any> {
    ((this.outputDir =
      eA ?? n4.join(this.runtime.getWorkDir(), "generated-videos")),
      await ok.mkdir(this.outputDir, { recursive: !0 }));
  }
  async generateVideo(eA: any, el: any): Promise<any> {
    let { auth: ec, endpoint: eu } = await this.prepareRequest(),
      ed: any = el.context.abortSignal,
      ep: any = eA.image
        ? nC.IMAGE_TO_VIDEO_MODEL_TAG
        : nC.TEXT_TO_VIDEO_MODEL_TAG,
      eg: any = await this.resolveModel(el.context, ep),
      eh: any = await this.submitTask(eu, ec.accessToken, eA, eg, ed);
    this.runtime.logger.info(`[VideoService] Task submitted: ${eh}`);
    let ef: any = await this.pollTask(eu, ec.accessToken, eh, ed);
    return this.downloadVideos(ef, eA.prompt, ed);
  }
  async submitTask(eA: any, el: any, ec: any, eu: any, ed: any): Promise<any> {
    let ep: any,
      eg: any = `${eA}/v2/videos/generations`,
      eh: any = { prompt: ec.prompt, model: eu, seconds: ec.seconds ?? 5 };
    ((eh.watermark = !0),
      ec.image && (eh.image_url = ec.image),
      ec.last_image && (eh.last_image_url = ec.last_image));
    let ef: any = new Set(["720P", "1080P"]),
      em: any = {
        resolution:
          ec.resolution && ef.has(ec.resolution) ? ec.resolution : "720P",
      };
    ((eh.extra_parameters = em),
      this.runtime.logger.info(
        `[VideoService] Submitting task: model=${eu}, mode=${ec.image ? "image-to-video" : "text-to-video"}, seconds=${eh.seconds}, prompt="${ec.prompt.substring(0, 50)}...", hasImage=${!!ec.image}, hasLastImage=${!!ec.last_image}`,
      ),
      this.runtime.logger.debug(
        `[VideoService] URL: ${eg}, extraParams=${JSON.stringify(em)}`,
      ));
    try {
      ep = await this.runtime.restOperations.request({
        url: eg,
        method: "POST",
        headers: {
          [sF.HttpHeaders.CONTENT_TYPE]: "application/json",
          [sF.HttpHeaders.AUTHORIZATION]: `Bearer ${el}`,
        },
        data: eh,
        signal: ed,
      });
    } catch (eu: any) {
      let eA: any = eu?.response?.data,
        el: any = eu?.response?.status,
        ec: any = eA ? JSON.stringify(eA) : eu.message;
      throw (
        this.runtime.logger.error(
          `[VideoService] Request failed: status=${el}, response=${ec}, keys=${Object.keys(eu?.response || {}).join(",")}`,
        ),
        Error(`Video API error (HTTP ${el}): ${ec}`)
      );
    }
    let eE: any = ep.data;
    if (0 !== eE.code)
      throw Error(
        `Video generation failed: ${eE.msg} (requestId: ${eE.requestId})`,
      );
    if (!eE.data?.id)
      throw Error("Video generation failed: no task ID returned");
    return eE.data.id;
  }
  async pollTask(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any = `${eA}/v2/videos/tasks`,
      ep: any = this.runtime.Date.now();
    for (;;) {
      if (eu?.aborted) throw Error("Video generation was cancelled.");
      let eA: any = this.runtime.Date.now() - ep;
      if (eA > cM)
        throw Error(
          `Video generation timed out after ${cM / 1e3}s. Task ID: ${ec}`,
        );
      let eg: any = (
        await this.runtime.restOperations.request({
          url: ed,
          method: "POST",
          headers: {
            [sF.HttpHeaders.CONTENT_TYPE]: "application/json",
            [sF.HttpHeaders.AUTHORIZATION]: `Bearer ${el}`,
          },
          data: { task_id: ec },
          signal: eu,
        })
      ).data;
      if (0 !== eg.code)
        throw Error(
          `Video task query failed: ${eg.msg} (requestId: ${eg.requestId})`,
        );
      let eh: any = eg.data.status;
      if ("completed" === eh)
        return (
          this.runtime.logger.info(
            `[VideoService] Task ${ec} completed in ${Math.round(eA / 1e3)}s`,
          ),
          eg.data
        );
      if ("failed" === eh)
        throw Error(`Video generation failed. Task ID: ${ec}`);
      (this.runtime.logger.debug(
        `[VideoService] Task ${ec}: status=${eh}, elapsed=${Math.round(eA / 1e3)}s`,
      ),
        await this.sleep(ck, eu));
    }
  }
  async downloadVideos(eA: any, el: any, ec: any): Promise<any> {
    let eu: any = eA.data;
    if (!eu || 0 === eu.length)
      throw Error("Video generation completed but no video URL returned.");
    let ed: any = [],
      ep: any = new this.runtime.Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19),
      eg: any = el.slice(0, 30).replace(/[^一-龥a-zA-Z0-9]/g, "_");
    for (let eA: any = 0; eA < eu.length; eA++) {
      let el: any = eu[eA],
        eh: any = eu.length > 1 ? `_${eA + 1}` : "",
        ef: any = `${eg}_${ep}${eh}.mp4`,
        em: any = n4.join(this.outputDir, ef);
      this.runtime.logger.info(`[VideoService] Downloading video to: ${em}`);
      let eE: any = await this.runtime.restOperations.request({
        url: el.url,
        method: "GET",
        responseType: "arraybuffer",
        signal: ec,
        timeout: 12e4,
      });
      (await ok.writeFile(em, Buffer.from(eE.data)), ed.push(em));
    }
    return ed;
  }
  async prepareRequest(): Promise<any> {
    let eA: any = this.runtime.authentication();
    if (!eA?.accessToken)
      throw Error("Authentication required. Please login first.");
    let el: any = (await this.runtime.configuration()).endpoint;
    if (!el) throw Error("Base endpoint not configured.");
    return { auth: eA, endpoint: el };
  }
  sleep(eA: any, el: any): any {
    return new Promise((ec: any, eu: any) => {
      if (el?.aborted) return void eu(Error("Aborted"));
      let ed: any = this.runtime.setTimeout(ec, eA);
      el?.addEventListener(
        "abort",
        () => {
          (this.runtime.clearTimeout(ed), eu(Error("Aborted")));
        },
        { once: !0 },
      );
    });
  }
  getModelsByTag(eA: any, el: any): any {
    return eA.models?.filter((eA: any) => eA.tags?.includes(el)) || [];
  }
  async resolveModel(eA: any, el: any): Promise<any> {
    let ec: any = await this.runtime.configuration(),
      eu: any = el === nC.TEXT_TO_VIDEO_MODEL_TAG,
      ed: any = eu ? "textToVideoModel" : "imageToVideoModel",
      ep: any = eu
        ? iq.ENV_KEY_CODEBUDDY_TEXT_TO_VIDEO_MODEL
        : iq.ENV_KEY_CODEBUDDY_IMAGE_TO_VIDEO_MODEL,
      eg: any = eu ? cx : cO,
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
