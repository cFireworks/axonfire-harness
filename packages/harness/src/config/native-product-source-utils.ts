// Fixed WorkBuddy 5.3.14 SHA; complete original directory/color/variable implementations and owned dependencies.
import * as fs from "node:fs";
import * as path from "node:path";
import { createCapturedCeph } from "../vendor/captured-ceph.js";
import { createAgentMarkdownUtils } from "../agents/native-agent-markdown.js";
import { MemoryMarkdownUtils } from "../memory/native-memory-markdown.js";
import { CapturedYaml } from "../vendor/captured-yaml.js";
export function createNativeProductSourceUtilities(runtime: any) {
  const process = {
      env: runtime.env ?? {},
      platform: runtime.platform ?? globalThis.process.platform,
    },
    Object: any = globalThis.Object,
    eK = (runtime.fs ?? fs).promises,
    e$ = path,
    eJ =
      runtime.ceph ??
      createCapturedCeph({ platform: process.platform, fs: eK }),
    ef = path;
  class PathUtils {
    static getWorkDir = runtime.getWorkDir;
    static getHomeDir = runtime.getHomeDir;
    static getProjectHomeDir(): any {
      return (0, ef.join)(this.getWorkDir(), ".codebuddy");
    }
    static getProjectAgentsDir(): any {
      return (0, ef.join)(this.getWorkDir(), ".codebuddy", "agents");
    }
    static getHomeAgentsDir(): any {
      return (0, ef.join)(this.getHomeDir(), "agents");
    }
    static getHomePluginsDir(): any {
      return (0, ef.join)(this.getHomeDir(), "plugins");
    }
  }
  // UTF-16 13223474..13224875
  class DirectoryScanUtils {
    [key: string]: any;
    static async scan(eA: any, el: any = {}): Promise<any> {
      let ec: any;
      if (await (0, eJ.isCephFs)(eA))
        return (el.onError?.(Error(`Skipping CephFS path: ${eA}`), eA), []);
      let eu: any = [],
        ed: any = new Set(),
        { maxDepth: ep = 100, extension: eg, onError: eh } = el;
      try {
        ec = await (0, eK.realpath)(eA);
      } catch {
        ec = eA;
      }
      let scanRecursive: any = async (eA: any, el: any = 0) => {
        if (el > ep) {
          let el: any = Error(`Max recursion depth (${ep}) exceeded`);
          eh?.(el, eA);
          return;
        }
        try {
          let ep: any = await (0, eK.realpath)(eA);
          if (ed.has(ep)) return;
          for (let eA of (ed.add(ep),
          await (0, eK.readdir)(ep, { withFileTypes: !0 }))) {
            let ed: any = (0, e$.join)(ep, eA.name);
            try {
              let ep: any = eA.isDirectory(),
                eh: any = eA.isFile();
              if (!ep && !eh && eA.isSymbolicLink()) {
                let eA: any = await (0, eK.stat)(ed);
                ((ep = eA.isDirectory()), (eh = eA.isFile()));
              }
              if (ep) await scanRecursive(ed, el + 1);
              else if (eh && (!eg || eA.name.endsWith(eg))) {
                let el: any = (0, e$.relative)(ec, ed);
                eu.push({ fullPath: ed, fileName: eA.name, relativePath: el });
              }
            } catch (el: any) {
              let eA: any = el instanceof Error ? el : Error(String(el));
              eh?.(eA, ed);
            }
          }
        } catch (ec: any) {
          let el: any = ec instanceof Error ? ec : Error(String(ec));
          eh?.(el, eA);
        }
      };
      return (await scanRecursive(eA), eu);
    }
    static async getFilesByExtension(
      eA: any,
      el: any,
      ec: any = {},
    ): Promise<any> {
      return this.scan(eA, { ...ec, extension: el });
    }
    static async getFilesWhere(eA: any, el: any, ec: any = {}): Promise<any> {
      return (await this.scan(eA, ec)).filter(el);
    }
    static async scanDirectory(eA: any, el: any, ec: any = {}): Promise<any> {
      return (await this.scan(eA, ec))
        .map((eA: any) => el(eA))
        .filter((eA: any) => void 0 !== eA);
    }
    static async getAllFiles(eA: any, el: any): Promise<any> {
      return (await this.scan(eA, { extension: el })).map(
        (eA: any) => eA.fullPath,
      );
    }
  }
  const ColorUtils = (() => {
    const eT = {
        ContainerUtil: {
          get: (_key: any) => {
            if (!runtime.theme) throw Error("Theme service not configured");
            return runtime.theme;
          },
        },
      },
      eL = { ThemeService: "theme" }; // UTF-16 13220744..13223330
    class ColorUtils {
      [key: string]: any;
      static isDarkTheme(): any {
        try {
          let eA: any = eT.ContainerUtil.get(eL.ThemeService);
          return "dark" === eA.getCurrentTheme().name;
        } catch {
          return !0;
        }
      }
      static getTextColor(eA: any, el?: any): any {
        let ec: any, eu: any, ed: any;
        if (!eA) return ColorUtils.generateColorFromName(el);
        let ep: any = eA.trim().toLowerCase();
        if (/^[a-z]+$/.test(ep)) {
          let eA: any = ColorUtils.colorNameToHex(ep);
          return eA ? ColorUtils.getTextColor(eA) : void 0;
        }
        if (ep.startsWith("#")) {
          let eA: any = ep.substring(1),
            el: any = ColorUtils.hexToRgb(eA);
          if (!el) return;
          ((ec = el.r), (eu = el.g), (ed = el.b));
        } else if (ep.startsWith("rgb")) {
          let eA: any = ep.match(
            /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/,
          );
          if (!eA) return;
          ((ec = parseInt(eA[1])),
            (eu = parseInt(eA[2])),
            (ed = parseInt(eA[3])));
        } else {
          if (!ep.startsWith("hsl")) return;
          let eA: any = ep.match(
            /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/,
          );
          if (!eA) return;
          {
            let el: any = ColorUtils.hslToRgb(
              parseInt(eA[1]),
              parseInt(eA[2]),
              parseInt(eA[3]),
            );
            ((ec = el.r), (eu = el.g), (ed = el.b));
          }
        }
        if (
          !(isNaN(ec) || isNaN(eu) || isNaN(ed)) &&
          !(ec < 0) &&
          !(ec > 255) &&
          !(eu < 0) &&
          !(eu > 255) &&
          !(ed < 0) &&
          !(ed > 255)
        )
          return (299 * ec + 587 * eu + 114 * ed) / 1e3 > 128
            ? "#000000"
            : "#ffffff";
      }
      static hexToRgb(eA: any): any {
        return 3 === eA.length || 4 === eA.length
          ? {
              r: parseInt(eA[0] + eA[0], 16),
              g: parseInt(eA[1] + eA[1], 16),
              b: parseInt(eA[2] + eA[2], 16),
            }
          : 6 === eA.length
            ? {
                r: parseInt(eA.substr(0, 2), 16),
                g: parseInt(eA.substr(2, 2), 16),
                b: parseInt(eA.substr(4, 2), 16),
              }
            : 8 === eA.length
              ? {
                  r: parseInt(eA.substr(0, 2), 16),
                  g: parseInt(eA.substr(2, 2), 16),
                  b: parseInt(eA.substr(4, 2), 16),
                }
              : void 0;
      }
      static hslToRgb(eA: any, el: any, ec: any): any {
        let eu: any, ed: any, ep: any;
        if (((eA /= 360), (el /= 100), (ec /= 100), 0 === el))
          eu = ed = ep = ec;
        else {
          let hue2rgb: any = (eA: any, el: any, ec: any) =>
              (ec < 0 && (ec += 1), ec > 1 && (ec -= 1), ec < 1 / 6)
                ? eA + (el - eA) * 6 * ec
                : ec < 0.5
                  ? el
                  : ec < 2 / 3
                    ? eA + (el - eA) * (2 / 3 - ec) * 6
                    : eA,
            eg: any = ec < 0.5 ? ec * (1 + el) : ec + el - ec * el,
            eh: any = 2 * ec - eg;
          ((eu = hue2rgb(eh, eg, eA + 1 / 3)),
            (ed = hue2rgb(eh, eg, eA)),
            (ep = hue2rgb(eh, eg, eA - 1 / 3)));
        }
        return {
          r: Math.round(255 * eu),
          g: Math.round(255 * ed),
          b: Math.round(255 * ep),
        };
      }
      static colorNameToHex(eA: any): any {
        return (
          (
            {
              black: "#000000",
              white: "#ffffff",
              red: "#ff0000",
              green: "#008000",
              blue: "#0000ff",
              yellow: "#ffff00",
              cyan: "#00ffff",
              magenta: "#ff00ff",
              silver: "#c0c0c0",
              gray: "#808080",
              maroon: "#800000",
              olive: "#808000",
              lime: "#00ff00",
              aqua: "#00ffff",
              teal: "#008080",
              navy: "#000080",
              fuchsia: "#ff00ff",
              purple: "#800080",
              orange: "#ffa500",
              pink: "#ffc0cb",
              brown: "#a52a2a",
            } as any
          )[eA] || void 0
        );
      }
      static generateColorFromName(eA: any): any {
        let el: any, ec: any, eu: any;
        if (!eA) return;
        let ed: any = ColorUtils.isDarkTheme(),
          ep: any = 0;
        for (let el: any = 0; el < eA.length; el++)
          ((ep = (ep << 5) - ep + eA.charCodeAt(el)), (ep &= ep));
        ed
          ? ((el = (Math.abs(ep) % 136) + 120),
            (ec = (Math.abs(ep >> 8) % 136) + 120),
            (eu = (Math.abs(ep >> 16) % 136) + 120))
          : ((el = Math.abs(ep) % 120),
            (ec = Math.abs(ep >> 8) % 120),
            (eu = Math.abs(ep >> 16) % 120));
        let toHex: any = (eA: any) =>
          Math.round(eA).toString(16).padStart(2, "0");
        return `#${toHex(el)}${toHex(ec)}${toHex(eu)}`;
      }
    }
    return ColorUtils;
  })();
  const environment = (() => {
    const eu = /\$\{([A-Z_][A-Z0-9_]*)(?::-(.*?))?\}/g;
    function expandEnvVariables(eA: any): any {
      let el: any = new Set();
      return {
        expanded: eA.replace(eu, (eA: any, ec: any, eu: any) => {
          let ed: any = process.env[ec];
          return void 0 !== ed ? ed : void 0 !== eu ? eu : (el.add(ec), eA);
        }),
        missingVars: [...el],
      };
    }
    return { expandEnvVariables };
  })();
  const pluginVariables = (() => {
    const eu = eK,
      ed = path,
      ep = environment,
      eg = { PathUtils },
      eh = /\$\{(?:CLAUDE|CODEBUDDY)_PLUGIN_DATA\}/,
      ef = /\$\{user_config\.([^}]+)\}/g,
      em = /\$\{PLUGIN_OPT:([^}]+)\}/g,
      eE = new WeakMap();
    // UTF-16 9813953..9814156
    class MissingPluginUserConfigError extends Error {
      [key: string]: any;
      constructor(eA: any, el: any) {
        (super(`No value found for user_config.${el} in plugin '${eA}'`),
          (this.pluginId = eA),
          (this.key = el),
          (this.name = "MissingPluginUserConfigError"));
      }
    }
    function sanitizePluginDataId(eA: any): any {
      return eA.replace(/[^a-zA-Z0-9\-_]/g, "-");
    }
    function getPluginDataDirectory(
      eA: any,
      el: any = eg.PathUtils.getHomePluginsDir(),
    ): any {
      return (0, ed.join)(el, "data", sanitizePluginDataId(eA));
    }
    async function ensurePluginDataDirectory(eA: any, el?: any): Promise<any> {
      let ec: any = getPluginDataDirectory(eA, el);
      return (await (0, eu.mkdir)(ec, { recursive: !0 }), ec);
    }
    async function removePluginDataDirectory(eA: any, el: any): Promise<any> {
      await (0, eu.rm)(getPluginDataDirectory(eA, el), {
        recursive: !0,
        force: !0,
      });
    }
    function ensureContextDataDirectory(eA: any): any {
      let el: any = eE.get(eA);
      if (el) return el;
      let ec: any = ensurePluginDataDirectory(eA.pluginId).catch((el: any) => {
        throw (eE.delete(eA), el);
      });
      return (eE.set(eA, ec), ec);
    }
    async function ensurePluginDataDirectoryForText(
      eA: any,
      el: any,
    ): Promise<any> {
      eh.test(eA) && (await ensureContextDataDirectory(el));
    }
    function resolvePluginOptionValues(eA: any, el: any): any {
      let ec: any = {};
      for (let [el, eu] of Object.entries(eA || {}))
        void 0 !== eu.default && (ec[el] = eu.default);
      return { ...ec, ...(el || {}) };
    }
    function createPluginEnvironmentContext(
      eA: any,
      el: any,
      ec?: any,
      eu?: any,
      ed: any = eg.PathUtils.getWorkDir(),
    ): any {
      return {
        pluginId: eA,
        pluginRoot: el,
        projectDir: ed,
        options: resolvePluginOptionValues(eu, ec),
        userConfig: eu || {},
      };
    }
    function toPluginOptionEnvKey(eA: any): any {
      return eA.replace(/[^A-Za-z0-9_]/g, "_").toUpperCase();
    }
    function buildPluginOptionEnvironment(eA: any): any {
      let el: any = {};
      for (let [ec, eu] of Object.entries(eA)) {
        let eA: any = toPluginOptionEnvKey(ec),
          ed: any = String(eu);
        ((el[`CLAUDE_PLUGIN_OPTION_${eA}`] = ed),
          (el[`CODEBUDDY_PLUGIN_OPTION_${eA}`] = ed),
          (el[`PLUGIN_OPT_${eA}`] = ed));
      }
      return el;
    }
    async function buildPluginSubprocessEnvironment(
      eA: any,
      el: any = (eA: any) => eA,
    ): Promise<any> {
      let ec: any = el(eA.pluginRoot),
        eu: any = el(await ensureContextDataDirectory(eA)),
        ed: any = el(eA.projectDir);
      return {
        CLAUDE_PLUGIN_ROOT: ec,
        CODEBUDDY_PLUGIN_ROOT: ec,
        CLAUDE_PLUGIN_DATA: eu,
        CODEBUDDY_PLUGIN_DATA: eu,
        CLAUDE_PROJECT_DIR: ed,
        CODEBUDDY_PROJECT_DIR: ed,
        ...buildPluginOptionEnvironment(eA.options),
      };
    }
    function substitutePluginVariables(eA: any, el: any, ec: any = {}): any {
      let eu: any = ec.mode || "config",
        ed: any = ec.transformPath || ((eA: any) => eA),
        eg: any = ed(el.pluginRoot),
        eE: any = ed(el.projectDir),
        eC: any = eA
          .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, eg)
          .replace(/\$\{CODEBUDDY_PLUGIN_ROOT\}/g, eg)
          .replace(/\$\{CLAUDE_PROJECT_DIR\}/g, eE)
          .replace(/\$\{CODEBUDDY_PROJECT_DIR\}/g, eE);
      if (eh.test(eC)) {
        let eA: any = ed(getPluginDataDirectory(el.pluginId));
        eC = eC
          .replace(/\$\{CLAUDE_PLUGIN_DATA\}/g, eA)
          .replace(/\$\{CODEBUDDY_PLUGIN_DATA\}/g, eA);
      }
      return (
        (eC = eC.replace(ef, (eA: any, ec: any) => {
          let ed: any = el.userConfig[ec],
            ep: any = el.options[ec];
          if ("content" === eu) {
            if (!ed) return eA;
            if (!0 === ed.sensitive)
              return `[sensitive option '${ec}' not available in skill content]`;
          }
          if (void 0 === ep) {
            if ("content" === eu) return eA;
            throw new MissingPluginUserConfigError(el.pluginId, ec);
          }
          return String(ep);
        })),
        "config" === eu &&
          (eC = eC.replace(em, (eA: any, ec: any) => {
            let eu: any = el.options[ec];
            return void 0 === eu ? eA : String(eu);
          })),
        ec.expandEnvironment && (eC = (0, ep.expandEnvVariables)(eC).expanded),
        eC
      );
    }
    async function enrichPluginHookConfigs(
      eA: any,
      el: any,
      ec: any = (eA: any) => eA,
    ): Promise<any> {
      let eu: any = ec(el.pluginRoot),
        ed: any = Object.values(eA)
          .flatMap((eA: any) => eA || [])
          .flatMap((eA: any) => eA.hooks),
        ep: any = ed.some((eA: any) => "command" === eA.type),
        eg: any = ed.some((eA: any) =>
          "command" === eA.type
            ? eh.test(eA.command)
            : "prompt" === eA.type || "agent" === eA.type
              ? eh.test(eA.prompt)
              : eh.test(eA.url) ||
                Object.values(eA.headers || {}).some((eA: any) => eh.test(eA)),
        ),
        ef: any = ep || eg ? await ensureContextDataDirectory(el) : void 0,
        em: any = ep ? ec(ef) : void 0,
        enrichDefinition: any = (eA: any) => {
          switch (eA.type) {
            case "command":
              return {
                ...eA,
                command: substitutePluginVariables(eA.command, el, {
                  mode: "config",
                  transformPath: ec,
                }),
                pluginRoot: eu,
                sourceId: eA.sourceId || eu,
                pluginData: em,
                pluginOptions: el.options,
              };
            case "prompt":
            case "agent":
              return {
                ...eA,
                prompt: substitutePluginVariables(eA.prompt, el, {
                  mode: "content",
                  transformPath: ec,
                }),
                pluginRoot: eu,
                sourceId: eA.sourceId || eu,
              };
            case "http":
              return {
                ...eA,
                url: substitutePluginVariables(eA.url, el, {
                  mode: "config",
                  transformPath: ec,
                }),
                ...(eA.headers && {
                  headers: Object.fromEntries(
                    Object.entries(eA.headers).map(([eA, eu]: any) => [
                      eA,
                      substitutePluginVariables(eu, el, {
                        mode: "config",
                        transformPath: ec,
                      }),
                    ]),
                  ),
                }),
                pluginRoot: eu,
                sourceId: eA.sourceId || eu,
              };
          }
        };
      return Object.fromEntries(
        Object.entries(eA).map(([eA, el]: any) => [
          eA,
          (el || []).map((eA: any) => ({
            ...eA,
            hooks: eA.hooks.map(enrichDefinition),
          })),
        ]),
      );
    }
    return {
      MissingPluginUserConfigError,
      sanitizePluginDataId,
      getPluginDataDirectory,
      ensurePluginDataDirectory,
      removePluginDataDirectory,
      ensureContextDataDirectory,
      ensurePluginDataDirectoryForText,
      resolvePluginOptionValues,
      createPluginEnvironmentContext,
      toPluginOptionEnvKey,
      buildPluginOptionEnvironment,
      buildPluginSubprocessEnvironment,
      substitutePluginVariables,
      enrichPluginHookConfigs,
    };
  })();
  const textVariables = (() => {
    const eu = path,
      ed = pluginVariables,
      ep = environment,
      eg = ["CODEBUDDY_SESSION_ID", "CLAUDE_SESSION_ID"],
      normalize = (eA: any) =>
        "win32" === process.platform ? eA.replace(/\\/g, "/") : eA;
    function substituteLoadTimeVariables(
      eA: any,
      el: any,
      ec?: any,
      eh?: any,
    ): any {
      let ef: any = eA,
        em: any = normalize((0, eu.dirname)(el));
      if (eh)
        ef = (0, ed.substitutePluginVariables)(ef, eh, {
          mode: "content",
          transformPath: normalize,
        });
      else if (ec) {
        let eA: any = normalize(ec);
        ef = ef
          .replace(/\$\{CODEBUDDY_PLUGIN_ROOT\}/g, eA)
          .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, eA);
      }
      ef = ef
        .replace(/\$\{CODEBUDDY_SKILL_DIR\}/g, em)
        .replace(/\$\{CLAUDE_SKILL_DIR\}/g, em);
      let eE: any = new Map();
      return (
        eg.forEach((eA: any, el: any) => {
          let ec: any = `\${${eA}}`;
          if (ef.includes(ec)) {
            let eA: any = `\u0000__CBC_RT_${el}__\u0000`;
            (eE.set(eA, ec), (ef = ef.split(ec).join(eA)));
          }
        }),
        (ef = (0, ep.expandEnvVariables)(ef).expanded),
        eE.forEach((eA: any, el: any) => {
          ef = ef.split(el).join(eA);
        }),
        ef
      );
    }
    async function substitutePluginLoadTimeVariables(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): Promise<any> {
      return (
        await (0, ed.ensurePluginDataDirectoryForText)(eA, eu),
        substituteLoadTimeVariables(eA, el, ec, eu)
      );
    }
    return { substituteLoadTimeVariables, substitutePluginLoadTimeVariables };
  })();
  const agentMarkdown = createAgentMarkdownUtils(CapturedYaml.parse),
    MarkdownUtils = {
      extractFrontMatterFull: agentMarkdown.extractFrontMatterFull,
      extractFrontMatterWithContent:
        MemoryMarkdownUtils.extractFrontMatterWithContent,
      parseListField: agentMarkdown.parseListField,
    };
  return {
    PathUtils,
    DirectoryScanUtils,
    ColorUtils,
    MarkdownUtils,
    ...environment,
    ...pluginVariables,
    ...textVariables,
  };
}
