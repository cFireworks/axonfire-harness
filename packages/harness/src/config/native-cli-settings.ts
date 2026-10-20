// Complete original CLI settings and setting-source load queues.
import * as fs from "node:fs";
import { isDeepStrictEqual } from "node:util";
import {
  NativeDeferred,
  NativeEmitter,
} from "../agents/native-agent-manager-runtime.js";
import { CapturedJsonUtils } from "../vendor/captured-jsonc.js";
import { createCapturedSettingsConstants } from "../vendor/captured-settings-constants.js";
export function createNativeCliSettings(runtime: any) {
  const Promise: any = globalThis.Promise,
    c: any =
      runtime.constants ?? createCapturedSettingsConstants(runtime.platform),
    eh = { isDeepStrictEqual, ObjectUtils: c.ObjectUtils },
    ef = runtime.fs ?? fs,
    eE = c,
    ey = {
      JsonUtils: CapturedJsonUtils,
      PathUtils: { resolveFilePathToWorkDir: runtime.resolveFilePathToWorkDir },
    },
    eg = {
      Emitter: NativeEmitter,
      Deferred: NativeDeferred,
      ContainerUtil: {
        get: (key: any) => {
          if (!(key in runtime.dependencies))
            throw Error("CLI settings dependency not configured: " + key);
          return runtime.dependencies[key];
        },
      },
    },
    eC = {
      StartupProfiler: "startupProfiler",
      StartupPhase: { SETTINGS_LOAD: "settings_load" },
    },
    ew = ["minimal", "low", "medium", "high", "xhigh", "max"];
  // UTF-16 11192966..11193057
  function normalizeReasoningEffort(eA: any): any {
    return "string" == typeof eA && ew.includes(eA) ? eA : void 0;
  }
  // UTF-16 11188750..11191471
  class CliSettingSourcesProvider {
    [key: string]: any;
    constructor() {
      ((this.DEFAULT_SCOPES = [
        eE.SettingsScope.USER,
        eE.SettingsScope.PROJECT,
        eE.SettingsScope.PROJECT_LOCAL,
      ]),
        (this.settingScopes = [...this.DEFAULT_SCOPES]),
        (this.onDidChangeEmitter = new eg.Emitter()),
        (this.onDidChange = this.onDidChangeEmitter.event),
        (this.deferred = new eg.Deferred()),
        (this.loadChain = Promise.resolve()));
    }
    init(): any {
      this.logger.setContext("CliSettingSourcesProvider");
      let eA: any = !0;
      this.cliRuntimeOptions.onDidChange.subscribe(() => {
        let el: any = eA;
        ((eA = !1),
          (this.loadChain = this.loadChain
            .then(() => this.runLoad(el))
            .catch((eA: any) => {
              this.logger.warn(
                `Failed to load setting sources on CLI options change: ${String(eA)}`,
              );
            })));
      });
    }
    async runLoad(eA: any): Promise<any> {
      let el: any = this.buildSettingScopes(),
        ec: any = !(0, eh.isDeepStrictEqual)(this.settingScopes, el);
      ((this.settingScopes = el),
        eA && this.deferred.resolve(),
        this.logger.info(
          `Setting sources ${eA ? "initialized" : "reloaded"}: ${this.settingScopes.map((eA: any) => this.scopeToString(eA)).join(" -> ")}`,
        ),
        !eA && ec && this.onDidChangeEmitter.fire());
    }
    async getSettingScopes(): Promise<any> {
      return (await this.deferred.promise, [...this.settingScopes]);
    }
    async waitUntilSettled(): Promise<any> {
      await this.loadChain;
    }
    async isScopeAllowed(eA: any): Promise<any> {
      return (
        eA === eE.SettingsScope.CLI ||
        (await this.getSettingScopes()).includes(eA)
      );
    }
    buildSettingScopes(): any {
      try {
        let eA: any = this.cliProvider.parseOpts().opts;
        if (!eA.settingSources) return [...this.DEFAULT_SCOPES];
        let el: any = this.parseSourcesString(eA.settingSources);
        if (void 0 === el)
          return (
            this.logger.warn(
              "Invalid setting sources specified, using defaults",
            ),
            [...this.DEFAULT_SCOPES]
          );
        return (
          0 === el.length
            ? this.logger.info(
                "Setting sources: none (clean environment isolation)",
              )
            : this.logger.info(
                `Setting sources order: ${el.map((eA: any) => this.scopeToString(eA)).join(" -> ")}`,
              ),
          el
        );
      } catch (eA: any) {
        return (
          this.logger.error("Failed to parse setting sources:", eA),
          [...this.DEFAULT_SCOPES]
        );
      }
    }
    parseSourcesString(eA: any): any {
      try {
        let el: any = eA.trim().toLowerCase();
        if ("none" === el || "" === el) return [];
        let ec: any = eA
          .split(/[,\s]+/)
          .map((eA: any) => eA.trim())
          .filter((eA: any) => eA.length > 0);
        if (0 === ec.length) return [];
        let eu: any = [],
          ed: any = new Set(["user", "project", "local"]);
        for (let eA of ec) {
          let el: any = eA.toLowerCase();
          if (!ed.has(el)) {
            this.logger.warn(
              `Invalid setting source: "${eA}". Valid options: user, project, local, none`,
            );
            continue;
          }
          let ec: any = this.mapToScope(el);
          ec && !eu.includes(ec) && eu.push(ec);
        }
        return eu.length > 0 ? eu : void 0;
      } catch (el: any) {
        this.logger.error(`Failed to parse setting sources: ${eA}`, el);
        return;
      }
    }
    mapToScope(eA: any): any {
      switch (eA) {
        case "user":
          return eE.SettingsScope.USER;
        case "project":
          return eE.SettingsScope.PROJECT;
        case "local":
          return eE.SettingsScope.PROJECT_LOCAL;
        default:
          return;
      }
    }
    scopeToString(eA: any): any {
      switch (eA) {
        case eE.SettingsScope.USER:
          return "user";
        case eE.SettingsScope.PROJECT:
          return "project";
        case eE.SettingsScope.PROJECT_LOCAL:
          return "local";
        case eE.SettingsScope.CLI:
          return "cli";
        default:
          return "unknown";
      }
    }
  }
  // UTF-16 11193064..11196069
  class CliSettingsProvider {
    [key: string]: any;
    constructor() {
      ((this.cliSettings = {}),
        (this.deferred = new eg.Deferred()),
        (this.loadChain = Promise.resolve()));
    }
    get startupProfiler(): any {
      return eg.ContainerUtil.get(eC.StartupProfiler);
    }
    init(): any {
      this.logger.setContext("CliSettingsProvider");
      let eA: any = !0;
      this.cliRuntimeOptions.onDidChange.subscribe(() => {
        let el: any = eA;
        ((eA = !1),
          (this.loadChain = this.loadChain
            .then(() => this.runLoad(el))
            .catch((eA: any) => {
              this.logger.warn(
                `Failed to load CLI settings on CLI options change: ${String(eA)}`,
              );
            })));
      });
    }
    async runLoad(eA: any): Promise<any> {
      eA &&
        this.startupProfiler.markStart(
          eC.StartupPhase.SETTINGS_LOAD,
          "Settings Load",
        );
      let el: any = await this.buildCliSettings();
      ((this.cliSettings = el),
        eA &&
          (this.startupProfiler.markEnd(eC.StartupPhase.SETTINGS_LOAD),
          this.deferred.resolve()),
        this.logger.info(
          `CLI settings ${eA ? "initialized" : "reloaded"}: ${JSON.stringify(this.cliSettings)}`,
        ));
    }
    async getSettings(): Promise<any> {
      return (
        await this.deferred.promise,
        eh.ObjectUtils.copy(this.cliSettings)
      );
    }
    async waitUntilSettled(): Promise<any> {
      await this.loadChain;
    }
    async set(eA: any, el: any): Promise<any> {
      (await this.deferred.promise,
        (this.cliSettings[eA] = el),
        this.logger.info(`CLI setting updated: ${eA} = ${JSON.stringify(el)}`));
    }
    async buildCliSettings(): Promise<any> {
      let eA: any = {};
      try {
        let el: any = this.cliProvider.parseOpts().opts;
        if (el.settings) {
          let ec: any = await this.parseSettingsOption(el.settings);
          ec &&
            (Object.assign(eA, ec),
            this.logger.info(
              `Loaded CLI settings with ${Object.keys(ec).length} key(s)`,
            ));
        }
        if (
          (el.model &&
            ((eA.model = el.model),
            this.logger.info(`CLI --model option set: ${el.model}`)),
          el.effort)
        ) {
          let ec: any = normalizeReasoningEffort(el.effort);
          ec
            ? ((eA.reasoningEffort = ec),
              this.logger.info(`CLI --effort option set: ${ec}`))
            : this.logger.warn(
                `CLI --effort option rejected: invalid value "${el.effort}". Allowed: ${ew.join(", ")}`,
              );
        }
      } catch (eA: any) {
        this.logger.error("Failed to load CLI settings:", eA);
      }
      return eA;
    }
    async parseSettingsOption(eA: any): Promise<any> {
      return this.looksLikeJson(eA)
        ? this.parseJsonString(eA)
        : this.readSettingsFile(eA);
    }
    looksLikeJson(eA: any): any {
      let el: any = eA.trim();
      return el.startsWith("{") && el.endsWith("}");
    }
    parseJsonString(eA: any): any {
      try {
        let el: any = ey.JsonUtils.parse(eA);
        if ("object" != typeof el || null === el || Array.isArray(el))
          return void this.logger.error("--settings JSON must be an object");
        return (this.logger.debug("Parsed settings from JSON string"), el);
      } catch (eA: any) {
        this.logger.error(
          `Failed to parse --settings JSON: ${eA instanceof Error ? eA.message : eA}`,
        );
        return;
      }
    }
    async readSettingsFile(eA: any): Promise<any> {
      try {
        let el: any = ey.PathUtils.resolveFilePathToWorkDir(eA);
        await ef.promises.access(el, ef.constants.R_OK);
        let ec: any = await ef.promises.readFile(el, "utf-8"),
          eu: any = ey.JsonUtils.parse(ec);
        if ("object" != typeof eu || null === eu || Array.isArray(eu))
          return void this.logger.error(
            `Settings file ${el} must contain a JSON object`,
          );
        return (
          this.logger.info(`Successfully loaded settings from file: ${el}`),
          eu
        );
      } catch (el: any) {
        "ENOENT" === el.code
          ? this.logger.error(`Settings file not found: ${eA}`)
          : "EACCES" === el.code
            ? this.logger.error(
                `Permission denied reading settings file: ${eA}`,
              )
            : el instanceof SyntaxError
              ? this.logger.error(`Invalid JSON in settings file: ${eA}`)
              : this.logger.error(`Failed to read settings file: ${eA}`, el);
        return;
      }
    }
  }
  return {
    CliSettingSourcesProvider,
    CliSettingsProvider,
    normalizeReasoningEffort,
  };
}
