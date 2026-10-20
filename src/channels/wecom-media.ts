import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
export function createWecomMediaService(
  runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
) {
  const eu = runtime.crypto,
    ed = runtime.path,
    ep = () => runtime.path,
    eE = runtime.fs,
    eC = runtime.os;
  function isKnownImageFormat(eA: any): any {
    return (
      !(eA.length < 4) &&
      ((255 === eA[0] && 216 === eA[1] && 255 === eA[2]) ||
        (137 === eA[0] && 80 === eA[1] && 78 === eA[2] && 71 === eA[3]) ||
        (71 === eA[0] && 73 === eA[1] && 70 === eA[2] && 56 === eA[3]) ||
        (66 === eA[0] && 77 === eA[1]) ||
        (eA.length >= 12 &&
          82 === eA[0] &&
          73 === eA[1] &&
          70 === eA[2] &&
          70 === eA[3] &&
          87 === eA[8] &&
          69 === eA[9] &&
          66 === eA[10] &&
          80 === eA[11]) ||
        !1)
    );
  }
  function detectImageFormat(eA: any): any {
    if (!(eA.length < 4)) {
      if (255 === eA[0] && 216 === eA[1] && 255 === eA[2]) return "JPEG";
      if (137 === eA[0] && 80 === eA[1] && 78 === eA[2] && 71 === eA[3])
        return "PNG";
      if (71 === eA[0] && 73 === eA[1] && 70 === eA[2] && 56 === eA[3])
        return "GIF";
      if (66 === eA[0] && 77 === eA[1]) return "BMP";
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
        return "WEBP";
    }
  }
  let ey: any = {
    JPEG: ".jpg",
    PNG: ".png",
    GIF: ".gif",
    BMP: ".bmp",
    WEBP: ".webp",
  };
  function decryptAes256Cbc(eA: any, el: any): any {
    let ec: any = Buffer.from(el, "base64"),
      ed: any = ec.subarray(0, 16),
      ep: any = (0, eu.createDecipheriv)("aes-256-cbc", ec, ed);
    ep.setAutoPadding(!1);
    let eg: any = Buffer.concat([ep.update(eA), ep.final()]),
      eh: any = eg[eg.length - 1];
    if (eh < 1 || eh > 32 || eh > eg.length)
      throw Error(`Invalid PKCS#7 padding value: ${eh}`);
    for (let eA: any = eg.length - eh; eA < eg.length; eA++)
      if (eg[eA] !== eh)
        throw Error("Invalid PKCS#7 padding: padding bytes mismatch");
    return eg.subarray(0, eg.length - eh);
  }
  function getWecomTempDir(): any {
    let eA: any = ed.join(eC.tmpdir(), "codebuddy-wecom-media");
    return (eE.existsSync(eA) || eE.mkdirSync(eA, { recursive: !0 }), eA);
  }
  function tempFilePath(eA: any): any {
    let el: any = `${runtime.now()}-${(0, eu.randomBytes)(4).toString("hex")}${eA}`;
    return ed.join(getWecomTempDir(), el);
  }
  let ew: any = [".work.weixin.qq.com", ".qpic.cn", ".myqcloud.com"];
  function validateMediaUrl(eA: any): any {
    let el: any = new URL(eA);
    if ("https:" !== el.protocol)
      throw Error(`Insecure protocol: ${el.protocol} (only HTTPS allowed)`);
    let ec: any = el.hostname.toLowerCase();
    if (!ew.some((eA: any) => ec === eA.slice(1) || ec.endsWith(eA)))
      throw Error(`Untrusted host: ${ec}`);
  }
  async function downloadWecomBotMedia(
    eA: any,
    el: any,
    ec: any,
  ): Promise<any> {
    validateMediaUrl(eA);
    let eu: any = await runtime.fetch(eA, {
      signal: runtime.timeoutSignal(3e4),
      redirect: "error",
    });
    if (!eu.ok)
      throw Error(`Download failed: HTTP ${eu.status} ${eu.statusText}`);
    let ed: any = Buffer.from(await eu.arrayBuffer());
    if (isKnownImageFormat(ed)) {
      let eA: any = detectImageFormat(ed),
        el: any = tempFilePath((eA && ey[eA]) || ec);
      return (eE.writeFileSync(el, ed), el);
    }
    if (el) {
      let eA: any = decryptAes256Cbc(ed, el);
      if (eA.length > 0) {
        let el: any = detectImageFormat(eA),
          eu: any = tempFilePath((el && ey[el]) || ec);
        return (eE.writeFileSync(eu, eA), eu);
      }
    }
    let ep: any = tempFilePath(ec);
    return (eE.writeFileSync(ep, ed), ep);
  }
  async function resolveWebSocketCtor(eA: any): Promise<any> {
    if (runtime.isBun)
      return (
        eA?.info(
          "WebSocket implementation: globalThis.WebSocket (Bun native)",
        ),
        runtime.globalWebSocket
      );
    let el: any = await Promise.resolve().then(() =>
      runtime.loadWebSocketModule(),
    );
    return (
      eA?.info("WebSocket implementation: ws package (Node.js fallback)"),
      el.default
    );
  }
  return {
    isKnownImageFormat,
    detectImageFormat,
    decryptAes256Cbc,
    getWecomTempDir,
    tempFilePath,
    validateMediaUrl,
    downloadWecomBotMedia,
    resolveWebSocketCtor,
  };
}
