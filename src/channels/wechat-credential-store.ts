import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
import { WechatClientConstants } from "./channel-client-constants.js";
export function createWechatCredentialStore(
  runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
) {
  const eu = runtime.fs,
    ed = runtime.path,
    ep = { generateTerminalQRCode: runtime.generateTerminalQRCode },
    eg = { PathUtils: { getHomeDir: runtime.getHomeDir } },
    eh = WechatClientConstants;
  let ef: any = "instances.json";
  function getInstancesDir(): any {
    return ed.join(eg.PathUtils.getHomeDir(), eh.CREDENTIALS_DIR);
  }
  function getInstancesPath(): any {
    return ed.join(getInstancesDir(), ef);
  }
  function atomicWriteJson(eA: any, el: any): any {
    let ec: any = ed.dirname(eA);
    eu.existsSync(ec) || eu.mkdirSync(ec, { recursive: !0 });
    let ep: any = `${eA}.tmp`;
    eu.writeFileSync(ep, JSON.stringify(el, null, 2), "utf-8");
    try {
      eu.chmodSync(ep, 384);
    } catch {}
    eu.renameSync(ep, eA);
  }
  function cleanupPendingInstances(): any {
    let eA: any = getInstancesPath();
    if (eu.existsSync(eA))
      try {
        let el: any = eu.readFileSync(eA, "utf-8"),
          ec: any = JSON.parse(el);
        if (!Array.isArray(ec)) return;
        let ed: any = ec.filter(
          (eA: any) => !eA.instanceId.startsWith("_pending"),
        );
        ed.length !== ec.length && atomicWriteJson(eA, ed);
      } catch {}
  }
  function migrateFromLegacyFormat(): any {
    let eA: any = getInstancesDir();
    if (!eu.existsSync(eA)) return [];
    let el: any = eu.readdirSync(eA),
      ec: any = [];
    for (let ep of el)
      if (ep.startsWith("credentials") && ep.endsWith(".json") && ep !== ef)
        try {
          let el: any,
            eg: any = eu.readFileSync(ed.join(eA, ep), "utf-8"),
            eh: any = JSON.parse(eg);
          if (!eh.apiBaseUrl || !eh.token) continue;
          if ("credentials.json" === ep)
            el = eh.accountId
              ? eh.accountId
                  .slice(0, 8)
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "")
              : `migrated_${runtime.now().toString(36)}`;
          else {
            let eA: any = ep.match(/^credentials\.(.+)\.json$/);
            if (!eA) continue;
            el = eA[1];
          }
          if (ec.some((eA: any) => eA.instanceId === el)) continue;
          ec.push({
            instanceId: el,
            displayName: `WeChat:${el}`,
            credentials: eh,
          });
        } catch {}
    return (ec.length > 0 && atomicWriteJson(getInstancesPath(), ec), ec);
  }
  function loadAllInstances(): any {
    let eA: any = getInstancesPath();
    if (eu.existsSync(eA))
      try {
        let el: any = eu.readFileSync(eA, "utf-8"),
          ec: any = JSON.parse(el);
        if (Array.isArray(ec)) return ec;
      } catch {}
    return migrateFromLegacyFormat();
  }
  function loadCredentials(eA: any): any {
    let el: any = loadAllInstances();
    return el.find((el: any) => el.instanceId === eA)?.credentials;
  }
  function saveCredentials(eA: any, el: any, ec?: any, eu: any = !0): any {
    if (!eu) return;
    let ed: any = loadAllInstances(),
      ep: any = ed.findIndex((eA: any) => eA.instanceId === el),
      eg: any = {
        instanceId: el,
        displayName: ec || `WeChat:${el}`,
        credentials: eA,
      };
    (ep >= 0 ? (ed[ep] = eg) : ed.push(eg),
      atomicWriteJson(getInstancesPath(), ed));
  }
  function clearCredentials(eA: any): any {
    let el: any = loadAllInstances(),
      ec: any = el.filter((el: any) => el.instanceId !== eA);
    ec.length !== el.length && atomicWriteJson(getInstancesPath(), ec);
  }
  function listWechatCredentialInstances(): any {
    return loadAllInstances().map((eA: any) => eA.instanceId);
  }
  async function fetchQRCode(eA: any): Promise<any> {
    let el: any = eA.endsWith("/") ? eA : `${eA}/`,
      ec: any = `${el}ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(eh.DEFAULT_ILINK_BOT_TYPE)}`,
      eu: any = await runtime.fetch(ec);
    if (!eu.ok) {
      let eA: any = await eu.text().catch(() => "(unreadable)");
      throw Error(
        `Failed to fetch QR code: ${eu.status} ${eu.statusText} body=${eA}`,
      );
    }
    return await eu.json();
  }
  async function pollQRStatus(eA: any, el: any): Promise<any> {
    let ec: any = eA.endsWith("/") ? eA : `${eA}/`,
      eu: any = `${ec}ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(el)}`,
      ed: any = new runtime.AbortController(),
      ep: any = runtime.setTimeout(
        () => ed.abort(),
        eh.QR_LONG_POLL_TIMEOUT_MS,
      );
    try {
      let eA: any = await runtime.fetch(eu, {
        headers: { "iLink-App-ClientVersion": "1" },
        signal: ed.signal,
      });
      if ((runtime.clearTimeout(ep), !eA.ok))
        throw Error(`QR status poll failed: ${eA.status}`);
      return await eA.json();
    } catch (eA: any) {
      if ((runtime.clearTimeout(ep), "AbortError" === eA.name))
        return { status: "wait" };
      throw eA;
    }
  }
  async function performQrCodeAuth(
    eA: any,
    el: any = eh.DEFAULT_API_BASE_URL,
    ec?: any,
  ): Promise<any> {
    eA({ type: "fetching", message: "Fetching QR code..." });
    let eu: any = await fetchQRCode(el);
    eA({
      type: "qr_ready",
      message: "Scan the QR code with WeChat",
      qrText: await (0, ep.generateTerminalQRCode)(eu.qrcode_img_content),
      qrUrl: eu.qrcode_img_content,
    });
    let ed: any = 48e4,
      eg: any = runtime.now() + ed,
      ef: any = eu.qrcode,
      em: any = !1,
      eE: any = 0,
      eC: any = 3;
    for (; runtime.now() < eg; ) {
      let eu: any = await pollQRStatus(el, ef);
      switch (eu.status) {
        case "wait":
          break;
        case "scaned":
          em ||
            (eA({ type: "scanned", message: "Scanned. Confirm in WeChat..." }),
            (em = !0));
          break;
        case "expired": {
          if (++eE > eC) throw Error("QR code expired too many times");
          eA({
            type: "expired",
            message: `QR expired, refreshing... (${eE}/${eC})`,
          });
          let ec: any = await fetchQRCode(el);
          ((ef = ec.qrcode),
            (em = !1),
            eA({
              type: "qr_ready",
              message: "New QR code ready, please rescan",
              qrText: await (0, ep.generateTerminalQRCode)(
                ec.qrcode_img_content,
              ),
              qrUrl: ec.qrcode_img_content,
            }));
          break;
        }
        case "confirmed": {
          if (!eu.bot_token || !eu.ilink_bot_id)
            throw Error("Auth confirmed but server returned no credentials");
          let ed: any = {
              apiBaseUrl: eu.baseurl || el,
              token: eu.bot_token,
              accountId: eu.ilink_bot_id,
              userId: eu.ilink_user_id,
            },
            ep: any = !ec.startsWith("_pending");
          return (
            saveCredentials(ed, ec, void 0, ep),
            eA({ type: "confirmed", message: "Connected to WeChat" }),
            ed
          );
        }
      }
      await new Promise((eA: any) => runtime.setTimeout(eA, 1e3));
    }
    throw Error("Auth timed out");
  }
  return {
    getInstancesDir,
    getInstancesPath,
    atomicWriteJson,
    cleanupPendingInstances,
    migrateFromLegacyFormat,
    loadAllInstances,
    loadCredentials,
    saveCredentials,
    clearCredentials,
    listWechatCredentialInstances,
    fetchQRCode,
    pollQRStatus,
    performQrCodeAuth,
  };
}
// Preserve the original module-level API as well as isolated explicit-DI stores.
export const {
  cleanupPendingInstances,
  clearCredentials,
  listWechatCredentialInstances,
  loadAllInstances,
  loadCredentials,
  performQrCodeAuth,
  saveCredentials,
} = createWechatCredentialStore();
