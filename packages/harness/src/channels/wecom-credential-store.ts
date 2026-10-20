import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
import { WecomClientConstants } from "./channel-client-constants.js";
export function createWecomCredentialStore(
  runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
) {
  const eu = runtime.fs,
    ed = runtime.path,
    ep = { PathUtils: { getHomeDir: runtime.getHomeDir } },
    eg = WecomClientConstants;
  let eh: any = "channels/wecom",
    ef: any = "instances.json";
  function getInstancesDir(): any {
    return ed.join(ep.PathUtils.getHomeDir(), eh);
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
  function migrateFromLegacyFormat(): any {
    let eA: any = getInstancesDir();
    if (!eu.existsSync(eA)) return [];
    let el: any = eu.readdirSync(eA),
      ec: any = [];
    for (let ep of el)
      if (ep.startsWith("credentials") && ep.endsWith(".json") && ep !== ef)
        try {
          let el: any,
            eh: any = eu.readFileSync(ed.join(eA, ep), "utf-8"),
            ef: any = JSON.parse(eh);
          if (!ef.botId || !ef.secret) continue;
          if ("credentials.json" === ep) el = "default";
          else {
            let eA: any = ep.match(/^credentials\.(.+)\.json$/);
            if (!eA) continue;
            el = eA[1];
          }
          if (ec.some((eA: any) => eA.instanceId === el)) continue;
          ec.push({
            instanceId: el,
            displayName: `WeCom:${el}`,
            credentials: {
              botId: ef.botId,
              secret: ef.secret,
              wsUrl: ef.wsUrl || eg.WECOM_BOT_WS_URL,
            },
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
  function loadWecomCredentials(eA: any): any {
    let el: any = loadAllInstances();
    return el.find((el: any) => el.instanceId === eA)?.credentials;
  }
  function saveWecomCredentials(eA: any, el: any, ec?: any): any {
    let eu: any = loadAllInstances(),
      ed: any = eu.findIndex((eA: any) => eA.instanceId === el),
      ep: any = {
        instanceId: el,
        displayName: ec || `WeCom:${el}`,
        credentials: eA,
      };
    (ed >= 0 ? (eu[ed] = ep) : eu.push(ep),
      atomicWriteJson(getInstancesPath(), eu));
  }
  function clearWecomCredentials(eA: any): any {
    let el: any = loadAllInstances(),
      ec: any = el.filter((el: any) => el.instanceId !== eA);
    ec.length !== el.length && atomicWriteJson(getInstancesPath(), ec);
  }
  function listWecomCredentialInstances(): any {
    return loadAllInstances().map((eA: any) => eA.instanceId);
  }
  function resolveWecomCredentials(eA: any): any {
    let el: any = `_${eA.toUpperCase()}`,
      ec: any = runtime.env[`${eg.ENV_KEY_WECOM_BOT_ID}${el}`],
      eu: any = runtime.env[`${eg.ENV_KEY_WECOM_BOT_SECRET}${el}`];
    if (ec && eu)
      return {
        botId: ec,
        secret: eu,
        wsUrl:
          runtime.env[`${eg.ENV_KEY_WECOM_BOT_WS_URL}${el}`] ||
          eg.WECOM_BOT_WS_URL,
      };
    if ("default" === eA) {
      let eA: any = runtime.env[eg.ENV_KEY_WECOM_BOT_ID],
        el: any = runtime.env[eg.ENV_KEY_WECOM_BOT_SECRET];
      if (eA && el)
        return {
          botId: eA,
          secret: el,
          wsUrl:
            runtime.env[eg.ENV_KEY_WECOM_BOT_WS_URL] || eg.WECOM_BOT_WS_URL,
        };
    }
    return loadWecomCredentials(eA);
  }
  return {
    getInstancesDir,
    getInstancesPath,
    atomicWriteJson,
    migrateFromLegacyFormat,
    loadAllInstances,
    loadWecomCredentials,
    saveWecomCredentials,
    clearWecomCredentials,
    listWecomCredentialInstances,
    resolveWecomCredentials,
  };
}
export const {
  clearWecomCredentials,
  listWecomCredentialInstances,
  loadAllInstances,
  loadWecomCredentials,
  resolveWecomCredentials,
  saveWecomCredentials,
} = createWecomCredentialStore();
