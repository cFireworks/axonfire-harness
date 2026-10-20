import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
import { WechatClientConstants as ed } from "./channel-client-constants.js";
export function buildBaseInfo() {
  return { channel_version: "cbc-1.0.0" };
}
export function randomWechatUin(
  runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
) {
  const value = runtime.crypto.randomBytes(4).readUInt32BE(0);
  return Buffer.from(String(value), "utf-8").toString("base64");
}
// Native UTF-16 offsets 9947251..9949214.
export class WechatApi {
  [key: string]: any;
  constructor(
    eA: any,
    readonly runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
  ) {
    this.credentials = eA;
  }
  updateCredentials(eA: any): any {
    this.credentials = eA;
  }
  buildHeaders(eA: any): any {
    let el: any = {
      "Content-Type": "application/json",
      AuthorizationType: "ilink_bot_token",
      "Content-Length": String(Buffer.byteLength(eA, "utf-8")),
      "X-WECHAT-UIN": randomWechatUin(this.runtime),
    };
    return (
      this.credentials.token &&
        (el.Authorization = `Bearer ${this.credentials.token}`),
      el
    );
  }
  url(eA: any): any {
    let el: any = this.credentials.apiBaseUrl.replace(/\/$/, "");
    return `${el}/ilink/bot/${eA}`;
  }
  async post(eA: any, el: any, ec: any, eu?: any): Promise<any> {
    let ed: any = JSON.stringify({ ...el, base_info: buildBaseInfo() }),
      ep: any = new this.runtime.AbortController(),
      eg: any = this.runtime.setTimeout(() => ep.abort(), ec),
      onExternalAbort: any = () => {
        try {
          ep.abort();
        } catch {}
      };
    eu &&
      (eu.aborted
        ? ep.abort()
        : eu.addEventListener("abort", onExternalAbort, { once: !0 }));
    try {
      let el: any = await this.runtime.fetch(this.url(eA), {
        method: "POST",
        headers: this.buildHeaders(ed),
        body: ed,
        signal: ep.signal,
      });
      (this.runtime.clearTimeout(eg),
        eu?.removeEventListener("abort", onExternalAbort));
      let ec: any = await el.text();
      if (!el.ok) throw Error(`HTTP ${el.status}: ${ec}`);
      let eh: any = JSON.parse(ec);
      return (
        "object" == typeof eh &&
          null !== eh &&
          "ret" in eh &&
          0 !== eh.ret &&
          this.runtime
            .stderrWrite(`[WechatApi] ${eA} non-zero ret: ${ec.substring(0, 500)}
`),
        eh
      );
    } catch (eA: any) {
      throw (
        this.runtime.clearTimeout(eg),
        eu?.removeEventListener("abort", onExternalAbort),
        eA
      );
    }
  }
  async getUpdates(eA: any, el?: any): Promise<any> {
    try {
      return await this.post(
        "getupdates",
        { get_updates_buf: eA },
        ed.DEFAULT_POLL_TIMEOUT_MS + 1e4,
        el,
      );
    } catch (el: any) {
      if ("AbortError" === el.name)
        return { ret: 0, msgs: [], get_updates_buf: eA };
      throw el;
    }
  }
  async sendMessage(eA: any): Promise<any> {
    let el: any = await this.post("sendmessage", eA, 15e3);
    if (el.ret && 0 !== el.ret)
      throw Error(
        `WeChat sendmessage failed: ret=${el.ret}, errmsg=${el.errmsg || "unknown"}`,
      );
  }
  async getUploadUrl(eA: any): Promise<any> {
    let el: any = await this.post("getuploadurl", eA, 15e3);
    return (
      el.upload_param ||
        this.runtime
          .stderrWrite(`[WechatApi] getUploadUrl empty upload_param, full response: ${JSON.stringify(el)}
`),
      el
    );
  }
  async getConfig(eA: any, el?: any): Promise<any> {
    return this.post(
      "getconfig",
      { ilink_user_id: eA, context_token: el },
      1e4,
    );
  }
  async sendTyping(eA: any): Promise<any> {
    await this.post("sendtyping", eA, 1e4);
  }
}
