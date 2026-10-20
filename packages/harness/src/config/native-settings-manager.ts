// Fixed WorkBuddy 5.3.14 complete SettingsManager/controller/middleware; explicit DI only.
import * as path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Mutex } from "async-mutex";
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
import { CapturedJsonUtils } from "../vendor/captured-jsonc.js";
import { createCapturedSettingsConstants } from "../vendor/captured-settings-constants.js";
import { HookEvent } from "../hooks/hook-constants.js";
export function createNativeSettingsManager(runtime: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    e_: any =
      runtime.constants ?? createCapturedSettingsConstants(runtime.platform),
    eT = { isDeepStrictEqual },
    ev = { ObjectUtils: e_.ObjectUtils },
    eS = { Mutex: runtime.Mutex ?? Mutex },
    eQ: any = runtime.fsPromises,
    eD = path,
    eR = { HookManager: "hookManager", HookEvent },
    eL = {
      ConsoleManager: "consoleManager",
      ConsoleOutputMode: { NATIVE: "native" },
    },
    Date: any = runtime.Date ?? globalThis.Date,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  const eI = {
    Emitter: NativeEmitter,
    ContainerUtil: {
      get: (key: any) => {
        if (!(key in runtime.dependencies))
          throw Error("Settings dependency not configured: " + String(key));
        return runtime.dependencies[key];
      },
    },
  };
  const ey = e_,
    ef = path;
  class PathUtils {
    static getHomeDir = runtime.getHomeDir;
    static getWorkDir = runtime.getWorkDir;
    static getProjectHomeDir =
      runtime.getProjectHomeDir ??
      (() => path.join(runtime.getWorkDir(), ".codebuddy"));
    static getSettingsFilePath(eA: any): any {
      return eA === ey.SettingsScope.USER
        ? (0, ef.join)(PathUtils.getHomeDir(), ey.SETTINGS_FILENAME)
        : eA === ey.SettingsScope.PROJECT
          ? (0, ef.join)(PathUtils.getProjectHomeDir(), ey.SETTINGS_FILENAME)
          : (0, ef.join)(
              PathUtils.getProjectHomeDir(),
              ey.SETTINGS_LOCAL_FILENAME,
            );
    }
  }
  const eM = { PathUtils, JsonUtils: CapturedJsonUtils };
  // UTF-16 11201978..11202354
  function deepDiffDefaults(eA: any, el: any): any {
    if ((0, eT.isDeepStrictEqual)(eA, el)) return;
    if (
      "object" != typeof eA ||
      null === eA ||
      "object" != typeof el ||
      null === el ||
      Array.isArray(eA) ||
      Array.isArray(el)
    )
      return eA;
    let ec: any = {},
      eu: any = !1;
    for (let ed of Object.keys(eA)) {
      let ep: any = eA[ed],
        eg: any = el[ed];
      if (ed in el) {
        let eA: any = deepDiffDefaults(ep, eg);
        void 0 !== eA && ((ec[ed] = eA), (eu = !0));
      } else ((ec[ed] = ep), (eu = !0));
    }
    return eu ? ec : void 0;
  }
  // UTF-16 11202361..11209123
  class SettingsManagerImpl {
    [key: string]: any;
    constructor() {
      ((this.onDidChangeEmitter = new eI.Emitter()),
        (this.onDidChange = this.onDidChangeEmitter.event),
        (this.cache = {}),
        (this.mergeBySubKeySettings = [
          "hooks",
          "permissions",
          "memory",
          "sandbox",
        ]),
        (this.scopeMutexes = new Map()),
        (this.corruptedScopes = new Set()));
    }
    getScopeMutex(eA: any): any {
      let el: any = this.scopeMutexes.get(eA);
      return (el || ((el = new eS.Mutex()), this.scopeMutexes.set(eA, el)), el);
    }
    async withLock(eA: any, el: any): Promise<any> {
      let ec: any = this.getScopeMutex(eA),
        eu: any = await ec.acquire();
      try {
        return await el();
      } finally {
        eu();
      }
    }
    mergeSetting(eA: any, el: any, ec: any): any {
      this.mergeBySubKeySettings.includes(ec) && el && "object" == typeof el
        ? (eA[ec] || (eA[ec] = {}), this.deepMerge(eA[ec], el))
        : Array.isArray(el) && Array.isArray(eA[ec])
          ? (eA[ec] = Array.from(new Set([...eA[ec], ...el])))
          : (eA[ec] = el);
    }
    deepMerge(eA: any, el: any): any {
      for (let [ec, eu] of Object.entries(el))
        if (Array.isArray(eu)) {
          let el: any = eA[ec];
          Array.isArray(el)
            ? (eA[ec] = Array.from(new Set([...el, ...eu])))
            : (eA[ec] = eu);
        } else
          eu && "object" == typeof eu && !Array.isArray(eu)
            ? ((eA[ec] && "object" == typeof eA[ec]) || (eA[ec] = {}),
              this.deepMerge(eA[ec], eu))
            : (eA[ec] = eu);
    }
    async readSettingsWithRetry(
      eA: any,
      el: any = 3,
      ec: any = !1,
    ): Promise<any> {
      let eu: any = eM.PathUtils.getSettingsFilePath(eA),
        ed: any = this.cache[eA];
      if (!ec && ed && ed.expires > Date.now()) return ed.settings;
      for (let ec: any = 0; ec < el; ec++)
        try {
          let ed: any = await (0, eQ.readFile)(eu, "utf-8"),
            ep: any = eM.JsonUtils.parse(ed || "{}");
          if ("object" == typeof ep && null !== ep) {
            let el: any =
              eA === e_.SettingsScope.USER
                ? Object.assign(ev.ObjectUtils.copy(e_.DEFAULT_SETTINGS), ep)
                : ep;
            return (
              this.corruptedScopes.delete(eA),
              (this.cache[eA] = { settings: el, expires: Date.now() + 6e4 }),
              el
            );
          }
          this.logger.warn(
            `Settings file content is invalid (not an object), attempt ${ec + 1}/${el}`,
          );
        } catch (ed: any) {
          if ("ENOENT" === ed.code) {
            if ("user" === eA)
              return (
                this.logger.error(
                  `Failed to read settings file for scope ${eA}: ENOENT`,
                ),
                ev.ObjectUtils.copy(e_.DEFAULT_SETTINGS)
              );
            return {};
          }
          if (ec < el - 1) {
            (this.logger.warn(
              `Failed to read settings file for scope ${eA} (attempt ${ec + 1}/${el}): ${ed.message}, retrying...`,
            ),
              await new Promise((eA: any) =>
                setTimeout(eA, 50 * Math.pow(2, ec)),
              ));
            continue;
          }
          (this.corruptedScopes.add(eA),
            this.logger.error(
              `Failed to read settings file for scope ${eA} after ${el} attempts:`,
              ed,
            ));
          let eu: any =
            eA === e_.SettingsScope.USER
              ? ev.ObjectUtils.copy(e_.DEFAULT_SETTINGS)
              : {};
          return (
            (this.cache[eA] = { settings: eu, expires: Date.now() + 6e4 }),
            eu
          );
        }
      return "user" === eA ? ev.ObjectUtils.copy(e_.DEFAULT_SETTINGS) : {};
    }
    async get(eA: any, el: any): Promise<any> {
      return (await this.list(el))[eA];
    }
    async set(eA: any, el: any, ec: any = e_.SettingsScope.USER): Promise<any> {
      await this.mutateScope(ec, (ec: any) => ((ec[eA] = el), !0));
    }
    async remove(
      eA: any,
      el: any,
      ec: any = e_.SettingsScope.USER,
    ): Promise<any> {
      await this.mutateScope(
        ec,
        (ec: any) => (
          Array.isArray(ec[eA]) && Array.isArray(el) && el.length > 0
            ? (ec[eA] = ec[eA].filter((eA: any) => !el.includes(eA)))
            : delete ec[eA],
          !0
        ),
      );
    }
    async list(eA: any): Promise<any> {
      let el: any = {};
      if (eA)
        return eA === e_.SettingsScope.CLI
          ? await this.cliSettingsProvider.getSettings()
          : await this.readSettingsWithRetry(eA);
      for (let eA of [
        ...(await this.cliSettingSourcesProvider.getSettingScopes()),
        e_.SettingsScope.CLI,
      ])
        for (let [ec, eu] of Object.entries(await this.list(eA)))
          this.mergeSetting(el, eu, ec);
      return el;
    }
    async add(eA: any, el: any, ec: any = e_.SettingsScope.USER): Promise<any> {
      await this.mutateScope(ec, (ec: any) => {
        let eu: any = ec[eA];
        if (
          (Array.isArray(eu) || ((eu = []), (ec[eA] = eu)), Array.isArray(el))
        )
          for (let eA of el)
            eA && Array.isArray(eu) && !eu.includes(eA) && eu.push(eA);
        else {
          let eA: any = el;
          el && Array.isArray(eu) && !eu.includes(eA) && eu.push(eA);
        }
        return !0;
      });
    }
    async update(
      eA: any,
      el: any,
      ec: any = e_.SettingsScope.USER,
    ): Promise<any> {
      return this.mutateScope(ec, async (ec: any) => {
        let eu: any = ec[eA],
          ed: any = void 0 === eu ? void 0 : ev.ObjectUtils.copy(eu),
          ep: any = await el(eu);
        return !(0, eT.isDeepStrictEqual)(ed, ep) && ((ec[eA] = ep), !0);
      });
    }
    async mutateScope(eA: any, el: any): Promise<any> {
      return eA === e_.SettingsScope.CLI || this.shouldSkipCorruptedScope(eA)
        ? { applied: !1, changed: !1 }
        : this.withLock(eA, () =>
            this.withSettingsFileLock(eA, async () => {
              let ec: any = ev.ObjectUtils.copy(
                await this.readScopeForWrite(eA),
              );
              return this.shouldSkipCorruptedScope(eA)
                ? { applied: !1, changed: !1 }
                : (await el(ec))
                  ? (await this.saveInternal(ec, eA, !0))
                    ? { applied: !0, changed: !0 }
                    : { applied: !1, changed: !1 }
                  : { applied: !0, changed: !1 };
            }),
          );
    }
    shouldSkipCorruptedScope(eA: any): any {
      return (
        !!this.corruptedScopes.has(eA) &&
        (this.logger.warn(
          `Skipping settings write for scope ${eA}: settings file has JSON syntax errors. Please fix the file manually.`,
        ),
        !0)
      );
    }
    async readScopeForWrite(eA: any): Promise<any> {
      return this.readSettingsWithRetry(eA, 3, !0);
    }
    getSettingsLockName(eA: any): any {
      return `settings-${eA}-${eM.PathUtils.getSettingsFilePath(eA)
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-50)}`;
    }
    async withSettingsFileLock(eA: any, el: any): Promise<any> {
      let ec: any;
      try {
        ec = await this.fileLockService.acquireFileLock(
          this.getSettingsLockName(eA),
          { maxRetries: 5, retryDelay: 500, staleTimeout: 3e5 },
        );
      } catch (el: any) {
        this.logger.warn(
          `Failed to acquire file lock for settings ${eA}, proceeding without cross-process lock: ${el}`,
        );
      }
      try {
        return await el();
      } finally {
        await ec?.().catch((el: any) => {
          this.logger.warn(
            `Failed to release file lock for settings ${eA}: ${el}`,
          );
        });
      }
    }
    async saveInternal(eA: any, el: any, ec: any = !1): Promise<any> {
      return (
        el !== e_.SettingsScope.CLI &&
        (ec
          ? this.writeSettingsFile(eA, el)
          : this.withLock(el, () =>
              this.withSettingsFileLock(el, () =>
                this.writeSettingsFile(eA, el),
              ),
            ))
      );
    }
    async writeSettingsFile(eA: any, el: any): Promise<any> {
      let ec: any,
        eu: any = ev.ObjectUtils.copy(eA);
      for (let [eA, el] of Object.entries(e_.DEFAULT_SETTINGS))
        if (eA in eu) {
          let ec: any = deepDiffDefaults(eu[eA], el);
          void 0 === ec
            ? delete eu[eA]
            : (0, eT.isDeepStrictEqual)(ec, eu[eA]) || (eu[eA] = ec);
        }
      let ed: any = eM.PathUtils.getSettingsFilePath(el),
        ep: any = ed + ".tmp";
      await (0, eQ.mkdir)((0, eD.dirname)(ed), { recursive: !0 });
      try {
        let eA: any = await (0, eQ.readFile)(ed, "utf-8");
        try {
          eM.JsonUtils.parse(eA || "{}");
        } catch (eA: any) {
          return (
            this.logger.error(
              `Refusing to write settings for scope ${el}: existing file ${ed} has invalid JSON syntax. Please fix the file manually before modifying settings.`,
            ),
            this.corruptedScopes.add(el),
            !1
          );
        }
        ec = eM.JsonUtils.updateText(eA, eu);
      } catch (eA: any) {
        if (eA?.code === "ENOENT") ec = JSON.stringify(eu, void 0, 2);
        else throw eA;
      }
      try {
        (await (0, eQ.writeFile)(ep, ec, "utf-8"),
          await (0, eQ.rename)(ep, ed));
      } catch (eA: any) {
        try {
          await (0, eQ.unlink)(ep);
        } catch {}
        throw eA;
      }
      return (
        (this.cache[el] = {
          settings: ev.ObjectUtils.copy(eA),
          expires: Date.now() + 6e4,
        }),
        this.onDidChangeEmitter.fire(),
        this.dispatchConfigChangeHook(el, ed).catch((eA: any) => {
          this.logger.warn("ConfigChange hook dispatch failed:", eA);
        }),
        !0
      );
    }
    clearCache(eA: any): any {
      eA
        ? (this.logger.debug(`Clearing settings cache for scope: ${eA}`),
          delete this.cache[eA])
        : (this.logger.debug("Clearing all settings cache"), (this.cache = {}));
    }
    mapScopeToConfigSource(eA: any): any {
      switch (eA) {
        case e_.SettingsScope.USER:
          return "user_settings";
        case e_.SettingsScope.PROJECT:
          return "project_settings";
        case e_.SettingsScope.PROJECT_LOCAL:
          return "local_settings";
        case e_.SettingsScope.CLI:
        default:
          return;
      }
    }
    async dispatchConfigChangeHook(eA: any, el: any): Promise<any> {
      let ec: any,
        eu: any = this.mapScopeToConfigSource(eA);
      if (!eu) return;
      try {
        ec = eI.ContainerUtil.get(eR.HookManager);
      } catch {
        return;
      }
      if (!ec || !(await ec.hasHooks(eR.HookEvent.CONFIG_CHANGE))) return;
      let ed: any = {
        transcript_path: "",
        cwd: eM.PathUtils.getWorkDir(),
        hook_event_name: "ConfigChange",
        source: eu,
        file_path: el,
      };
      await ec.executeHooks(eR.HookEvent.CONFIG_CHANGE, ed);
    }
  }
  // UTF-16 11210623..11211440
  class SettingsController {
    [key: string]: any;
    async set(eA: any): Promise<any> {
      await this.settingsManager.set(
        eA.key,
        eA.value,
        eA.global ? e_.SettingsScope.USER : e_.SettingsScope.PROJECT_LOCAL,
      );
    }
    async get(eA: any): Promise<any> {
      let el: any = await this.settingsManager.get(eA.key);
      return (
        eI.ContainerUtil.get(eL.ConsoleManager).log(el || "", {
          mode: eL.ConsoleOutputMode.NATIVE,
        }),
        el
      );
    }
    async add(eA: any): Promise<any> {
      await this.settingsManager.add(
        eA.key,
        eA.values,
        eA.global ? e_.SettingsScope.USER : e_.SettingsScope.PROJECT_LOCAL,
      );
    }
    async remove(eA: any): Promise<any> {
      (await this.settingsManager.remove(
        eA.key,
        eA.values,
        eA.global ? e_.SettingsScope.USER : e_.SettingsScope.PROJECT_LOCAL,
      ),
        eI.ContainerUtil.get(eL.ConsoleManager).log(`${eA.key} Removed`, {
          mode: eL.ConsoleOutputMode.NATIVE,
        }));
    }
    async list(): Promise<any> {
      let eA: any = await this.settingsManager.list();
      return (
        eI.ContainerUtil.get(eL.ConsoleManager).log(
          JSON.stringify(eA, null, 2),
          { mode: eL.ConsoleOutputMode.NATIVE },
        ),
        eA
      );
    }
  }
  // UTF-16 11213940..11214445
  class SettingsValidateMiddleWare {
    [key: string]: any;
    constructor() {
      this.priority = e_.SETTINGS_MIDDLEWARE_PRIORITY;
    }
    async handle(eA: any, el: any): Promise<any> {
      if (!(await this.canHandle())) return void (await el());
      let { global: ec, key: eu } = eA.request.body;
      if (!eu) return void (await el());
      let ed: any = [];
      if (
        !(ed = ec ? e_.GLOBAL_SETTING_KEYS : e_.PROJECT_SETTING_KEYS).includes(
          eu,
        )
      )
        throw Error(
          `Error: Cannot operate settings '${eu}'. Only these keys can be operate: ${ed.join(",")}`,
        );
      await el();
    }
    async canHandle(): Promise<any> {
      return this.requestMatcher.match(
        await this.pathResolver.resolve("/internal/config"),
      );
    }
  }
  return {
    SettingsManagerImpl,
    SettingsController,
    SettingsValidateMiddleWare,
    PathUtils,
    deepDiffDefaults,
    constants: e_,
  };
}
