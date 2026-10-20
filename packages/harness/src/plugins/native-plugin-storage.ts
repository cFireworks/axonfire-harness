// Complete original options storage and error collector. No installed-account storage is accessed.
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
import { SettingsScope } from "../permissions/native-permission-policy.js";
export function createNativePluginStorage(runtime: any) {
  const Object: any = globalThis.Object,
    eg = runtime.fsExtra,
    eh = path,
    ef = { SettingsScope },
    em = { PathUtils: { getHomeDir: runtime.getHomeDir } },
    tV = { Emitter: NativeEmitter },
    r0 = { default: runtime.uuid ?? randomUUID },
    r1 = 100,
    Date: any = runtime.Date ?? globalThis.Date;
  // UTF-16 9796644..9797503
  class PluginErrorCollector {
    [key: string]: any;
    constructor() {
      ((this.errors = []),
        (this.onDidChangeEmitter = new tV.Emitter()),
        (this.onDidChange = this.onDidChangeEmitter.event));
    }
    addError(eA: any): any {
      let el: any = {
        ...eA,
        id: eA.id || (0, r0.default)(),
        timestamp: eA.timestamp || new Date(),
      };
      (this.errors.unshift(el),
        this.errors.length > r1 && (this.errors = this.errors.slice(0, r1)),
        this.onDidChangeEmitter.fire());
    }
    getErrors(): any {
      return [...this.errors].sort(
        (eA: any, el: any) => el.timestamp.getTime() - eA.timestamp.getTime(),
      );
    }
    getErrorsByType(eA: any): any {
      return this.getErrors().filter((el: any) => el.type === eA);
    }
    getErrorsByPlugin(eA: any, el: any): any {
      return this.getErrors().filter(
        (ec: any) => ec.plugin === eA && ec.source === el,
      );
    }
    getErrorCount(): any {
      return this.errors.length;
    }
    clearErrors(): any {
      ((this.errors = []), this.onDidChangeEmitter.fire());
    }
    clearPluginErrors(eA: any, el: any): any {
      let ec: any = this.errors.length;
      ((this.errors = this.errors.filter(
        (ec: any) => ec.plugin !== eA || ec.source !== el,
      )),
        this.errors.length !== ec && this.onDidChangeEmitter.fire());
    }
  }
  // UTF-16 9818861..9822846
  class PluginOptionsStorageImpl {
    [key: string]: any;
    constructor() {
      this.cache = new Map();
    }
    init(): any {
      this.logger.setContext("PluginOptionsStorage");
    }
    async loadOptions(eA: any): Promise<any> {
      let el: any = this.cache.get(eA);
      if (el) return el;
      let ec: any = await this.loadNonSensitiveOptions(eA),
        eu: any = await this.loadSensitiveOptions(eA),
        ed: any = { ...ec, ...eu };
      return (this.cache.set(eA, ed), ed);
    }
    async saveOptions(eA: any, el: any, ec: any): Promise<any> {
      let eu: any = {},
        ed: any = {};
      for (let [eA, ep] of Object.entries(el))
        ec[eA]?.sensitive === !0 ? (ed[eA] = String(ep)) : (eu[eA] = ep);
      (Object.keys(ed).length > 0 && (await this.saveSensitiveOptions(eA, ed)),
        Object.keys(eu).length > 0 &&
          (await this.saveNonSensitiveOptions(eA, eu)),
        await this.scrubSensitiveKeys(eA, Object.keys(eu)),
        await this.scrubNonSensitiveKeys(eA, Object.keys(ed)),
        this.cache.delete(eA));
    }
    async deleteOptions(eA: any): Promise<any> {
      if (this.settingsManager)
        try {
          let el: any = await this.settingsManager.list(ef.SettingsScope.USER),
            ec: any = el?.pluginConfigs;
          ec &&
            ec[eA] &&
            (delete ec[eA],
            await this.settingsManager.set(
              "pluginConfigs",
              ec,
              ef.SettingsScope.USER,
            ));
        } catch (el: any) {
          this.logger.warn(
            `Failed to delete non-sensitive options for ${eA}`,
            el,
          );
        }
      try {
        let el: any = this.getCredentialsPath();
        if (await (0, eg.pathExists)(el)) {
          let ec: any = JSON.parse(await (0, eg.readFile)(el, "utf-8"));
          ec.pluginSecrets &&
            ec.pluginSecrets[eA] &&
            (delete ec.pluginSecrets[eA],
            await (0, eg.writeFile)(el, JSON.stringify(ec, null, 2), "utf-8"));
        }
      } catch (el: any) {
        this.logger.warn(`Failed to delete sensitive options for ${eA}`, el);
      }
      this.cache.delete(eA);
    }
    async hasOptions(eA: any): Promise<any> {
      return Object.keys(await this.loadOptions(eA)).length > 0;
    }
    clearCache(): any {
      this.cache.clear();
    }
    async substituteOptions(eA: any, el: any): Promise<any> {
      if (!eA.includes("${PLUGIN_OPT:")) return eA;
      let ec: any = await this.loadOptions(el);
      return eA.replace(/\$\{PLUGIN_OPT:(\w+)\}/g, (eA: any, el: any) => {
        let eu: any = ec[el];
        return void 0 !== eu ? String(eu) : eA;
      });
    }
    async loadNonSensitiveOptions(eA: any): Promise<any> {
      if (!this.settingsManager) return {};
      try {
        let el: any = await this.settingsManager.get(
          "pluginConfigs",
          ef.SettingsScope.USER,
        );
        return el?.[eA]?.options ?? {};
      } catch {
        return {};
      }
    }
    async saveNonSensitiveOptions(eA: any, el: any): Promise<any> {
      if (this.settingsManager)
        try {
          let ec: any =
            (await this.settingsManager.get(
              "pluginConfigs",
              ef.SettingsScope.USER,
            )) || {};
          (ec[eA] || (ec[eA] = {}),
            (ec[eA].options = { ...ec[eA].options, ...el }),
            await this.settingsManager.set(
              "pluginConfigs",
              ec,
              ef.SettingsScope.USER,
            ));
        } catch (el: any) {
          throw (
            this.logger.error(
              `Failed to save non-sensitive options for ${eA}`,
              el,
            ),
            el
          );
        }
    }
    async scrubNonSensitiveKeys(eA: any, el: any): Promise<any> {
      if (this.settingsManager && 0 !== el.length)
        try {
          let ec: any =
              (await this.settingsManager.get(
                "pluginConfigs",
                ef.SettingsScope.USER,
              )) || {},
            eu: any = ec[eA]?.options;
          if (!eu) return;
          let ed: any = !1;
          for (let eA of el) eA in eu && (delete eu[eA], (ed = !0));
          ed &&
            ((ec[eA].options = eu),
            await this.settingsManager.set(
              "pluginConfigs",
              ec,
              ef.SettingsScope.USER,
            ));
        } catch (el: any) {
          this.logger.debug(`Failed to scrub non-sensitive keys for ${eA}`, el);
        }
    }
    async loadSensitiveOptions(eA: any): Promise<any> {
      try {
        let el: any = this.getCredentialsPath();
        if (!(await (0, eg.pathExists)(el))) return {};
        let ec: any = JSON.parse(await (0, eg.readFile)(el, "utf-8"));
        return ec.pluginSecrets?.[eA] ?? {};
      } catch {
        return {};
      }
    }
    async saveSensitiveOptions(eA: any, el: any): Promise<any> {
      try {
        let ec: any = this.getCredentialsPath(),
          eu: any = (0, eh.dirname)(ec);
        await (0, eg.mkdirp)(eu);
        let ed: any = {};
        if (await (0, eg.pathExists)(ec))
          try {
            ed = JSON.parse(await (0, eg.readFile)(ec, "utf-8"));
          } catch {
            ed = {};
          }
        (ed.pluginSecrets || (ed.pluginSecrets = {}),
          (ed.pluginSecrets[eA] = { ...ed.pluginSecrets[eA], ...el }),
          await (0, eg.writeFile)(ec, JSON.stringify(ed, null, 2), {
            encoding: "utf-8",
            mode: 384,
          }));
      } catch (el: any) {
        throw (
          this.logger.error(`Failed to save sensitive options for ${eA}`, el),
          Error(
            `Failed to save sensitive plugin options for ${eA} to secure storage`,
          )
        );
      }
    }
    async scrubSensitiveKeys(eA: any, el: any): Promise<any> {
      if (0 !== el.length)
        try {
          let ec: any = this.getCredentialsPath();
          if (!(await (0, eg.pathExists)(ec))) return;
          let eu: any = JSON.parse(await (0, eg.readFile)(ec, "utf-8")),
            ed: any = eu.pluginSecrets?.[eA];
          if (!ed) return;
          let ep: any = !1;
          for (let eA of el) eA in ed && (delete ed[eA], (ep = !0));
          ep &&
            ((eu.pluginSecrets[eA] = ed),
            await (0, eg.writeFile)(ec, JSON.stringify(eu, null, 2), {
              encoding: "utf-8",
              mode: 384,
            }));
        } catch (el: any) {
          this.logger.debug(`Failed to scrub sensitive keys for ${eA}`, el);
        }
    }
    getCredentialsPath(): any {
      return (0, eh.join)(em.PathUtils.getHomeDir(), "credentials.json");
    }
  }
  return { PluginErrorCollector, PluginOptionsStorageImpl };
}
