import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
export const CDN_BASE_URL = "https://novac2c.cdn.weixin.qq.com/c2c";
export function createWechatMediaService(
  runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
) {
  const eu = runtime.crypto,
    ed = runtime.fs,
    ep = runtime.os,
    eg = runtime.path;
  let eh: any = "https://novac2c.cdn.weixin.qq.com/c2c";
  function encryptAesEcb(eA: any, el: any): any {
    let ec: any = (0, eu.createCipheriv)("aes-128-ecb", el, null);
    return Buffer.concat([ec.update(eA), ec.final()]);
  }
  function decryptAesEcb(eA: any, el: any): any {
    let ec: any = (0, eu.createDecipheriv)("aes-128-ecb", el, null);
    return Buffer.concat([ec.update(eA), ec.final()]);
  }
  function aesEcbPaddedSize(eA: any): any {
    return 16 * Math.ceil((eA + 1) / 16);
  }
  function parseAesKey(eA: any): any {
    let el: any = Buffer.from(eA, "base64");
    if (16 === el.length) return el;
    if (32 === el.length && /^[0-9a-fA-F]{32}$/.test(el.toString("ascii")))
      return Buffer.from(el.toString("ascii"), "hex");
    throw Error(
      `aes_key must decode to 16 raw bytes or 32-char hex string, got ${el.length} bytes`,
    );
  }
  function buildCdnDownloadUrl(eA: any, el: any = eh): any {
    return `${el}/download?encrypted_query_param=${encodeURIComponent(eA)}`;
  }
  function buildCdnUploadUrl(eA: any, el: any, ec: any): any {
    return `${eA}/upload?encrypted_query_param=${encodeURIComponent(el)}&filekey=${encodeURIComponent(ec)}`;
  }
  function getTempDir(): any {
    let eA: any = eg.join(ep.tmpdir(), "codebuddy-wechat-media");
    return (ed.existsSync(eA) || ed.mkdirSync(eA, { recursive: !0 }), eA);
  }
  function tempFilePath(eA: any): any {
    let el: any = `${runtime.now()}-${(0, eu.randomBytes)(4).toString("hex")}${eA}`;
    return eg.join(getTempDir(), el);
  }
  async function downloadMedia(eA: any, el: any, ec?: any): Promise<any> {
    let eu: any;
    if (!eA.aes_key) throw Error("Missing CDN media aes_key");
    let ep: any = parseAesKey(eA.aes_key);
    if (eA.full_url) eu = eA.full_url;
    else if (eA.encrypt_query_param)
      eu = buildCdnDownloadUrl(eA.encrypt_query_param, ec);
    else
      throw Error(`Missing CDN media URL (keys: ${Object.keys(eA).join(",")})`);
    let eg: any = await runtime.fetch(eu);
    if (!eg.ok) {
      let eA: any = await eg.text().catch(() => "");
      throw Error(
        `CDN download failed: HTTP ${eg.status}, url=${eu.substring(0, 120)}..., body=${eA.substring(0, 200)}`,
      );
    }
    let eh: any = decryptAesEcb(Buffer.from(await eg.arrayBuffer()), ep),
      ef: any = tempFilePath(el);
    return (ed.writeFileSync(ef, eh), ef);
  }
  async function uploadMedia(
    eA: any,
    el: any,
    ec: any,
    ep: any,
    eg: any = eh,
  ): Promise<any> {
    let ef: any,
      em: any = ed.readFileSync(el),
      eE: any = em.length,
      eC: any = (0, eu.createHash)("md5").update(em).digest("hex"),
      ey: any = aesEcbPaddedSize(eE),
      ew: any = (0, eu.randomBytes)(16).toString("hex"),
      eB: any = (0, eu.randomBytes)(16),
      e_: any = await eA.getUploadUrl({
        filekey: ew,
        media_type: ep,
        to_user_id: ec,
        rawsize: eE,
        rawfilemd5: eC,
        filesize: ey,
        no_need_thumb: !0,
        aeskey: eB.toString("hex"),
      });
    if (0 !== e_.ret && void 0 !== e_.ret)
      throw Error(`getUploadUrl failed: ${JSON.stringify(e_)}`);
    if (e_.upload_full_url) ef = e_.upload_full_url;
    else if (e_.upload_param) ef = buildCdnUploadUrl(eg, e_.upload_param, ew);
    else
      throw Error(
        `getUploadUrl returned no upload_param or upload_full_url: ${JSON.stringify(e_)}`,
      );
    let eI: any = encryptAesEcb(em, eB),
      ev: any = await runtime.fetch(ef, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: new Uint8Array(eI),
      });
    if (!ev.ok) {
      let eA: any = ev.headers.get("x-error-message") ?? `status ${ev.status}`;
      throw Error(`CDN upload failed: ${eA}`);
    }
    let eS: any = ev.headers.get("x-encrypted-param");
    if (!eS)
      throw Error("CDN upload response missing x-encrypted-param header");
    return {
      downloadEncryptedQueryParam: eS,
      aeskey: eB.toString("hex"),
      fileSize: eE,
      fileSizeCiphertext: ey,
    };
  }
  function extensionForType(eA: any): any {
    switch (eA) {
      case 1:
        return ".txt";
      case 2:
        return ".jpg";
      case 3:
        return ".silk";
      case 4:
      default:
        return "";
      case 5:
        return ".mp4";
    }
  }
  return {
    CDN_BASE_URL: eh,
    encryptAesEcb,
    decryptAesEcb,
    aesEcbPaddedSize,
    parseAesKey,
    buildCdnDownloadUrl,
    buildCdnUploadUrl,
    getTempDir,
    tempFilePath,
    downloadMedia,
    uploadMedia,
    extensionForType,
  };
}
export const{downloadMedia,extensionForType,uploadMedia}=createWechatMediaService();
