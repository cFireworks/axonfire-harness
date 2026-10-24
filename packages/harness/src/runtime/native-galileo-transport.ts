// @ts-nocheck
// Captured encryption, key cache and HTTP transport statements from module 92763.
export const GALILEO_TRANSPORT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_TRANSPORT_REGIONS = [
  [7974757, 7975008],
  [7975008, 7975207],
  [7975207, 7975297],
  [7975297, 7975438],
  [7975438, 7975649],
  [7975649, 7975776],
  [7975776, 7975955],
  [7975955, 7976612],
  [7976612, 7977458],
  [7977458, 7977478],
  [7977478, 7978337],
  [7978337, 7978487],
  [7978487, 7978625],
  [7979368, 7982274],
  [7982395, 7982829],
  [7982829, 7982972],
  [7982972, 7983061],
  [7983061, 7983129],
  [7983129, 7983354],
  [7983354, 7983454],
  [7983454, 7983515],
] as const;
export function createNativeGalileoTransport(runtime: any) {
  const t4 = runtime.crypto,
    eH = runtime.http,
    eK = runtime.https,
    e$ = runtime.zlib,
    eG = runtime.sdk,
    Buffer = runtime.Buffer ?? globalThis.Buffer,
    Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math,
    URL = runtime.URL ?? globalThis.URL,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  if (!t4 || !eH || !eK || !e$ || !eG)
    throw Error("Explicit Galileo crypto, HTTP, HTTPS, zlib and SDK required");
  function aesEcbPkcs5EncryptBase64(eA, el) {
    let ec = Buffer.from(el, "utf8"),
      eu = getAesEcbAlgorithm(ec.length),
      ed = (0, t4.createCipheriv)(eu, ec, null);
    return (
      ed.setAutoPadding(!0),
      Buffer.concat([ed.update(Buffer.from(eA, "utf8")), ed.final()]).toString(
        "base64",
      )
    );
  }
  function getAesEcbAlgorithm(eA) {
    if (16 === eA) return "aes-128-ecb";
    if (24 === eA) return "aes-192-ecb";
    if (32 === eA) return "aes-256-ecb";
    throw Error(`invalid AES key length ${eA}; expected 16, 24, or 32 bytes`);
  }
  let t8 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    t5 = 30,
    t6 = 31,
    t9 = 63;
  function galileoBase62Encode(eA) {
    return "string" == typeof eA
      ? /^[a-zA-Z0-9_]*$/.test(eA)
        ? eA
        : encodeBytes(Buffer.from(eA, "utf8"))
      : encodeBytes(eA);
  }
  function encodeBytes(eA) {
    let el = Array.from(eA, (eA) => 255 & eA),
      ec = 8 * el.length,
      eu = "";
    for (; ec > 0; ) {
      let eA = 6,
        ed = getByte(el, ec) & t9;
      ((ed & t5) === t5 && ((ec > 6 || ed > t6) && (eA = 5), (ed &= t6)),
        (eu += t8.charAt(ed)),
        (ec -= eA));
    }
    return `base62${eu}`;
  }
  function getByte(eA, el) {
    let ec = 7 & el,
      eu = el >> 3;
    0 === ec && ((eu -= 1), (ec = 8));
    let ed = eA[eu] >> (8 - ec);
    return (ec < 6 && eu > 0 && (ed |= eA[eu - 1] << ec), ed);
  }
  let t7 = {
    "https://galileotelemetry.tencent.com":
      "https://galileotelemetry.tencent.com/kms/generateDataKey",
    "https://sg.tgalileo.com": "https://sg.tgalileo.com/kms/generateDataKey",
  };
  async function fetchDEK(eA, el) {
    let { publicKey: ec, privateKey: eu } = (0, t4.generateKeyPairSync)("rsa", {
        modulusLength: 2048,
      }),
      ed = ec.export({ type: "spki", format: "der" }).toString("base64"),
      ep = await postJson(eA, { encryption_public_key: ed }, el);
    if (
      "string" != typeof ep.plaintext ||
      "string" != typeof ep.ciphertext_blob
    )
      throw Error(
        "invalid KMS response: expected plaintext and ciphertext_blob",
      );
    let eg = (0, t4.privateDecrypt)(
      { key: eu, padding: t4.constants.RSA_PKCS1_PADDING },
      Buffer.from(ep.plaintext, "base64"),
    ).toString("utf8");
    if (!eg || !ep.ciphertext_blob)
      throw Error("invalid KMS response: empty plaintext or ciphertext_blob");
    return { plaintext: eg, ciphertext: ep.ciphertext_blob };
  }
  function postJson(eA, el, ec) {
    return new Promise((eu, ed) => {
      let ep = new URL(eA),
        eg = Buffer.from(JSON.stringify(el), "utf8"),
        eh = "https:" === ep.protocol,
        ef = (eh ? eK.request : eH.request)(
          {
            hostname: ep.hostname,
            port: ep.port || (eh ? 443 : 80),
            path: `${ep.pathname}${ep.search}`,
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Content-Length": eg.length,
            },
            timeout: ec,
          },
          (eA) => {
            let el = [];
            (eA.on("data", (eA) => el.push(Buffer.from(eA))),
              eA.on("end", () => {
                let ec = Buffer.concat(el).toString("utf8");
                if (
                  !eA.statusCode ||
                  eA.statusCode < 200 ||
                  eA.statusCode >= 300
                )
                  return void ed(Error(`KMS HTTP ${eA.statusCode}: ${ec}`));
                try {
                  eu(JSON.parse(ec));
                } catch (el) {
                  let eA = el instanceof Error ? el : Error(String(el));
                  ed(Error(`KMS returned invalid JSON: ${eA.message}`));
                }
              }));
          },
        );
      (ef.on("timeout", () => {
        ef.destroy(Error("KMS request timeout"));
      }),
        ef.on("error", ed),
        ef.write(eg),
        ef.end());
    });
  }
  let An = 864e5,
    Al = 6e4;
  let DEKManager = class DEKManager {
    constructor(eA, el) {
      ((this.kmsUrl = eA),
        (this.options = el),
        (this.dek = null),
        (this.nextRefreshAt = 0),
        (this.inFlight = null),
        (this.lastError = null));
    }
    async getDEK() {
      let eA = Date.now();
      if (this.dek && eA < this.nextRefreshAt) return this.dek;
      if (!this.dek && this.lastError && eA < this.nextRefreshAt)
        throw this.lastError;
      return (this.inFlight ||
        (this.inFlight = this.refreshDEK().finally(() => {
          this.inFlight = null;
        })),
      this.dek)
        ? (this.inFlight.catch(() => {}), this.dek)
        : this.inFlight;
    }
    async refreshDEK() {
      var eA, el;
      try {
        let el = await fetchDEK(this.kmsUrl, this.options.timeoutMillis);
        return (
          (this.dek = el),
          (this.lastError = null),
          (this.nextRefreshAt =
            Date.now() +
            (null != (eA = this.options.refreshIntervalMillis) ? eA : An)),
          el
        );
      } catch (eA) {
        throw (
          (this.lastError = eA instanceof Error ? eA : Error(String(eA))),
          (this.nextRefreshAt =
            Date.now() +
            (null != (el = this.options.retryIntervalMillis) ? el : Al)),
          this.lastError
        );
      }
    }
  };
  let Ac = { "User-Agent": `Galileo-Node-SDK/${eG.SDK_VERSION}` },
    Au = ["otlp.j.woa.com", "gocp.woa.com", "gotp.woa.com"],
    Ad = 5e3,
    Ap = 5,
    Ag = 1e3,
    Ah = 5e3,
    Af = 1.5,
    Am = 0.2;
  function resolveGalileoEncryptionConfig(eA, el) {
    var ec, eu;
    return {
      ...el,
      enabled:
        null ==
          (eu = null != (ec = null == el ? void 0 : el.enabled) ? ec : eA) ||
        eu,
    };
  }
  let GalileoEncryptedOtlpHttpTransport = class GalileoEncryptedOtlpHttpTransport {
    constructor(eA, el) {
      ((this.options = eA), (this.dekManagers = new Map()));
      const ec = "http:" === new URL(eA.url).protocol ? eH.Agent : eK.Agent;
      ((this.agent = new ec(eA.agentOptions)),
        (this.encryption = normalizeEncryptionConfig(el)));
    }
    async send(eA, el) {
      var ec;
      let eu = Date.now() + el,
        ed = await this.sendOnce(eA, el),
        ep = Ap,
        eg = Ag;
      for (; "retryable" === ed.status && ep > 0; ) {
        ep -= 1;
        let el = null != (ec = ed.retryInMillis) ? ec : getNextBackoff(eg);
        if (((eg *= Af), el > eu - Date.now())) break;
        (await delay(el), (ed = await this.sendOnce(eA, eu - Date.now())));
      }
      return ed;
    }
    shutdown() {
      this.agent.destroy();
    }
    async sendOnce(eA, el) {
      try {
        let ec = await this.prepareRequest(eA);
        return await this.post(ec.body, ec.headers, el);
      } catch (eA) {
        return {
          status: "failure",
          error: eA instanceof Error ? eA : Error(String(eA)),
        };
      }
    }
    async prepareRequest(eA) {
      let el = this.getEncryptionInfo();
      if (!el.encrypt) {
        let el =
            "gzip" === this.options.compression
              ? await gzip(Buffer.from(eA))
              : Buffer.from(eA),
          ec = { ...this.options.headers() };
        return (
          "gzip" === this.options.compression &&
            (ec["Content-Encoding"] = "gzip"),
          { body: el, headers: ec }
        );
      }
      let ec = Buffer.from(eA),
        eu = "gzip" === this.options.compression,
        ed = eu ? await gzip(ec) : ec,
        ep = eu
          ? galileoBase62Encode(ed)
          : galileoBase62Encode(ed.toString("utf8")),
        eg = await this.getDEK(el.kmsUrl),
        eh = aesEcbPkcs5EncryptBase64(ep, eg.plaintext),
        ef = stripContentEncoding(this.options.headers());
      return (
        (ef.Encrypted = `galileo-${eg.ciphertext}`),
        eu && (ef["Galileo-compress"] = "gzip"),
        { body: Buffer.from(eh, "utf8"), headers: ef }
      );
    }
    getEncryptionInfo() {
      if (!this.encryption.enabled) return { encrypt: !1 };
      let eA = new URL(this.options.url);
      if (this.encryption.skipHosts.has(eA.hostname)) return { encrypt: !1 };
      let el = this.encryption.endpointToKmsUrl[eA.origin];
      return el ? { encrypt: !0, kmsUrl: el } : { encrypt: !1 };
    }
    async getDEK(eA) {
      let el = this.dekManagers.get(eA);
      return (
        el ||
          ((el = new DEKManager(eA, {
            timeoutMillis: this.encryption.kmsTimeoutMillis,
            refreshIntervalMillis: this.encryption.refreshIntervalMillis,
            retryIntervalMillis: this.encryption.retryIntervalMillis,
          })),
          this.dekManagers.set(eA, el)),
        el.getDEK()
      );
    }
    post(eA, el, ec) {
      return new Promise((eu) => {
        let ed = new URL(this.options.url),
          ep = "https:" === ed.protocol,
          eg = ep ? eK.request : eH.request,
          eh = { ...el, "Content-Length": String(eA.length) },
          ef = eg(
            {
              hostname: ed.hostname,
              port: ed.port || (ep ? 443 : 80),
              path: `${ed.pathname}${ed.search}`,
              method: "POST",
              headers: eh,
              agent: this.agent,
            },
            (eA) => {
              let el = [];
              (eA.on("data", (eA) => el.push(Buffer.from(eA))),
                eA.on("end", () => {
                  let ec = Buffer.concat(el);
                  eA.statusCode && eA.statusCode >= 200 && eA.statusCode < 300
                    ? eu({ status: "success", data: ec })
                    : eA.statusCode && isExportRetryable(eA.statusCode)
                      ? eu({
                          status: "retryable",
                          retryInMillis: parseRetryAfterToMillis(
                            eA.headers["retry-after"],
                          ),
                        })
                      : eu({
                          status: "failure",
                          error: Error(
                            `HTTP ${eA.statusCode}: ${ec.toString("utf8") || eA.statusMessage || ""}`,
                          ),
                        });
                }));
            },
          );
        (ef.setTimeout(ec, () => {
          ef.destroy(Error("Request Timeout"));
        }),
          ef.on("error", (eA) => {
            eu({ status: "failure", error: eA });
          }),
          ef.write(eA),
          ef.end());
      });
    }
  };
  function normalizeEncryptionConfig(eA) {
    var el, ec;
    return {
      enabled: null == (el = null == eA ? void 0 : eA.enabled) || el,
      endpointToKmsUrl: {
        ...t7,
        ...((null == eA ? void 0 : eA.endpointToKmsUrl) || {}),
      },
      skipHosts: new Set([
        ...Au,
        ...((null == eA ? void 0 : eA.skipHosts) || []),
      ]),
      kmsTimeoutMillis:
        null != (ec = null == eA ? void 0 : eA.kmsTimeoutMillis) ? ec : Ad,
      refreshIntervalMillis: null == eA ? void 0 : eA.refreshIntervalMillis,
      retryIntervalMillis: null == eA ? void 0 : eA.retryIntervalMillis,
    };
  }
  function stripContentEncoding(eA) {
    let el = { ...eA };
    return (
      Object.keys(el).forEach((eA) => {
        "content-encoding" === eA.toLowerCase() && delete el[eA];
      }),
      el
    );
  }
  function gzip(eA) {
    return new Promise((el, ec) => {
      e$.gzip(eA, (eA, eu) => {
        eA ? ec(eA) : el(eu);
      });
    });
  }
  function isExportRetryable(eA) {
    return [429, 502, 503, 504].includes(eA);
  }
  function parseRetryAfterToMillis(eA) {
    let el = Array.isArray(eA) ? eA[0] : eA;
    if (null == el) return;
    let ec = Number.parseInt(el, 10);
    if (Number.isInteger(ec)) return ec > 0 ? 1e3 * ec : -1;
    let eu = new Date(el).getTime() - Date.now();
    return eu >= 0 ? eu : 0;
  }
  function getNextBackoff(eA) {
    let el = eA * (2 * Am * Math.random() - Am);
    return Math.max(Math.min(eA + el, Ah), 0);
  }
  function delay(eA) {
    return new Promise((el) => setTimeout(el, eA));
  }
  return {
    GalileoEncryptedOtlpHttpTransport,
    DEKManager,
    fetchDEK,
    postJson,
    aesEcbPkcs5EncryptBase64,
    galileoBase62Encode,
    normalizeEncryptionConfig,
    resolveGalileoEncryptionConfig,
    stripContentEncoding,
    isExportRetryable,
    parseRetryAfterToMillis,
    getNextBackoff,
  };
}
