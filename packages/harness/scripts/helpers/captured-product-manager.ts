import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import * as path from "node:path";
import * as fs from "node:fs";
import * as zlib from "node:zlib";
import { BehaviorSubject } from "rxjs";
import { NativeEmitter } from "../../src/agents/native-agent-manager-runtime.js";
import { createMemoryRuleUtilities } from "../../src/memory/memory-rule-utilities.js";
import { generateSkillColor } from "../../src/commands/skill-product-provider.js";
import * as memory from "../../src/memory/memory-rule-constants.js";
import { SettingsScope } from "../../src/permissions/native-permission-policy.js";
import { McpServerStatus } from "../../src/mcp/mcp-registry.js";
export const PRODUCT_CLASSES = [
  ["ProductManagerImpl", 15588491, 15597577],
  ["OverrideProductMergeStrategy", 15599132, 15599242],
  ["MergeProductMergeStrategy", 15599371, 15599892],
  ["SmartMergeProductMergeStrategy", 15600057, 15601365],
  ["DeepSmartMergeProductMergeStrategy", 15601498, 15602636],
  ["CommandsSmartMergeProductMergeStrategy", 15602777, 15603887],
  ["DefaultProductMerger", 15604751, 15605166],
  ["GzipUtils", 15627963, 15628249],
  ["MemoryLocalStorage", 15669496, 15669815],
  ["CliOptionsProductProvider", 9877981, 9880084],
  ["SdkInitializeProductProvider", 9881205, 9881847],
  ["PluginsProductProvider", 9912987, 9913726],
  ["McpPromptProductProvider", 9915058, 9916130],
  ["DefaultProductProvider", 15261645, 15261742],
  ["ClientProductProvider", 15628995, 15629918],
  ["EnvProductProvider", 15639250, 15640120],
  ["McpPromptRendererImpl", 7652318, 7654310],
] as const;
export const PRODUCT_WATCH_CLASSES = [
  ["ConfigWatchServiceImpl", 9893732, 9902774],
  ["McpWatchServiceImpl", 9904348, 9905553],
] as const;
export const PRODUCT_HELPERS = [
  ["convertAgentDefinitionToProductAgent", 9876813, 9877276],
  ["buildSystemPromptAgentOverride", 9877276, 9877412],
] as const;
export function loadCapturedProductWatchers(source: string) {
  return (runtime: any) =>
    runInNewContext(
      `(()=>{let eN;const ConfigWatchServiceImpl=${source.slice(9893732, 9902774)};eN=ConfigWatchServiceImpl;Object.assign(eN,{WATCH_SETUP_DELAY:2000,WINDOWS_RECURSIVE_WATCH_ENTRY_THRESHOLD:512});const McpWatchServiceImpl=${source.slice(9904348, 9905553)};return{ConfigWatchServiceImpl,McpWatchServiceImpl};})()`,
      {
        Map,
        Set,
        Array,
        Error,
        Date: { now: runtime.now ?? Date.now },
        process: {
          env: runtime.env ?? {},
          platform: runtime.platform ?? process.platform,
        },
        setTimeout: runtime.setTimeout ?? setTimeout,
        clearTimeout: runtime.clearTimeout ?? clearTimeout,
        tC: runtime.fs ?? fs,
        tS: (runtime.fs ?? fs).promises,
        tQ: path,
        e5: {
          Emitter: runtime.Emitter ?? NativeEmitter,
          ContainerUtil: {
            get: (key: string) => {
              if (!(key in runtime.dependencies))
                throw Error(
                  "Product watcher dependency not configured: " + key,
                );
              return runtime.dependencies[key];
            },
          },
        },
        tf: {
          ENV_KEY_CODEBUDDY_DISABLE_HOT_RELOAD: "CODEBUDDY_DISABLE_HOT_RELOAD",
          SETTINGS_FILENAME: "settings.json",
          SETTINGS_LOCAL_FILENAME: "settings.local.json",
          SettingsScope,
          SettingsManager: "settings",
        },
        tu: {
          PathUtils: {
            getWorkDir: runtime.getWorkDir,
            getHomeDir: runtime.getHomeDir,
            getProjectHomeDir:
              runtime.getProjectHomeDir ??
              (() => path.join(runtime.getWorkDir(), ".codebuddy")),
          },
        },
        tN: {
          ...memory,
          MemoryCache: "memoryCache",
          SubdirectoryMemoryLoader: "subdirectoryMemory",
        },
        tM: { SkillProductProvider: "skills" },
        tL: { PluginManager: "plugins" },
        tP: { McpConfigManager: "mcpConfig", McpServerStatus },
        e9: { ProductManager: "productManager" },
      },
    );
}
export function capturedProductModules(source: string) {
  const wanted = new Set([18629, 24613, 55114, 99600, 88382, 47023]),
    entries = new Map<number, any>();
  function walk(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.type === "Property" && wanted.has(node.key?.value))
      entries.set(node.key.value, node);
    for (const [k, v] of Object.entries(node))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(walk);
        else walk(v);
      }
  }
  walk(parse(source, { ecmaVersion: "latest" }));
  const cache = new Map<number, any>();
  function require(id: number): any {
    if (cache.has(id)) return cache.get(id);
    const node = entries.get(id),
      out: any = {};
    cache.set(id, out);
    if (node)
      runInNewContext(
        "({" +
          source.slice(node.start, node.end) +
          "})[" +
          id +
          "]({},exports,require)",
        { Object, Array, Promise, Symbol, exports: out, require },
      );
    return out;
  }
  return {
    constants: { ...require(18629), ...require(24613), ...require(55114) },
    prioritize: require(99600).Prioritizeable,
  };
}
export function loadCapturedProductManager(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const modules = capturedProductModules(source),
    c = modules.constants;
  const raw = (name: string) => {
    const row = PRODUCT_CLASSES.find(([n]) => n === name)!;
    return source.slice(row[1], row[2]);
  };
  const helpers = PRODUCT_HELPERS.map(([, start, end]) =>
    source.slice(start, end),
  ).join("\n");
  const statics = {
    cacheKeyPrefix: "CodeBuddy-Product-Cache",
    endpointCacheKey: "CodeBuddy-Endpoint-Cache",
    envCacheKey: "CodeBuddy-Environment-Cache",
    ENV_KEY: "CODEBUDDY_INTERNET_ENVIRONMENT",
    PRODUCT_VERSION_ENV_KEY: "CLIENT_INFO_PRODUCT_VERSION",
    MAX_CACHE_TTL: 480000,
    PROXY_SYNC_THROTTLE_MS: 2000,
  };
  return {
    constants: c,
    prioritize: modules.prioritize,
    factory: (runtime: any) => {
      const f = runtime.fs ?? fs,
        paths = createMemoryRuleUtilities({
          getWorkDir: runtime.getWorkDir,
          getHomeDir: runtime.getHomeDir ?? runtime.getWorkDir,
          getUserHomeDir: runtime.getHomeDir ?? runtime.getWorkDir,
          fs: f,
          platform: runtime.platform ?? process.platform,
        }).PathUtils;
      const context: any = {
        Error,
        Map,
        Set,
        WeakSet,
        Promise,
        Object,
        Array,
        String,
        Number,
        JSON,
        Proxy,
        Buffer,
        Symbol,
        console: runtime.console ?? console,
        process: { env: runtime.env ?? {}, cwd: runtime.getWorkDir },
        Date: { now: runtime.now ?? Date.now },
        setTimeout: runtime.setTimeout ?? setTimeout,
        clearTimeout: runtime.clearTimeout ?? clearTimeout,
        constants: c,
        statics,
        runtime,
        BehaviorSubject,
        Emitter: runtime.Emitter ?? NativeEmitter,
        fs: f,
        path,
        zlib,
        BooleanUtils: {
          isTruthy: (value: any) =>
            !!value &&
            ("boolean" === typeof value
              ? value
              : ["1", "true", "yes", "on"].includes(
                  value.toLowerCase().trim(),
                )),
        },
        ObjectUtils: {
          isChanged: (a: any, b: any) =>
            JSON.stringify(a) !== JSON.stringify(b),
        },
        paths,
        generateSkillColor,
      };
      return runInNewContext(
        `(()=>{
      const mergerClasses=(()=>{const eg=constants,em=new Set(['builtInMarketPluginsMerge']),eh=['projectId','endpoint','app','server'];
      const OverrideProductMergeStrategy=${raw("OverrideProductMergeStrategy")};const MergeProductMergeStrategy=${raw("MergeProductMergeStrategy")};const ef=MergeProductMergeStrategy;
      const SmartMergeProductMergeStrategy=${raw("SmartMergeProductMergeStrategy")};const eE=SmartMergeProductMergeStrategy;
      const DeepSmartMergeProductMergeStrategy=${raw("DeepSmartMergeProductMergeStrategy")};const CommandsSmartMergeProductMergeStrategy=${raw("CommandsSmartMergeProductMergeStrategy")};const DefaultProductMerger=${raw("DefaultProductMerger")};
      return{OverrideProductMergeStrategy,MergeProductMergeStrategy,SmartMergeProductMergeStrategy,DeepSmartMergeProductMergeStrategy,CommandsSmartMergeProductMergeStrategy,DefaultProductMerger};})();
      const GzipUtils=(()=>{const eg=runtime.gzipSync,eh=runtime.gunzipSync,getZlib=()=>runtime.zlib??zlib;return ${raw("GzipUtils")};})();
      const ProductManagerImpl=(()=>{const eh={Emitter,Logger:'logger',ContainerUtil:{get:key=>runtime.dependencies[key]}},ef={BooleanUtils,ObjectUtils},eE={BehaviorSubject},eC=constants,ey={ProductFeature:constants.ProductFeature},ew={GzipUtils},ed={none:0,cache:1,server:2};let eu=${raw("ProductManagerImpl")};Object.defineProperty(eu,'name',{value:'eu'});Object.assign(eu,statics);return eu;})();
      const providerClasses=(()=>{const e9=constants,eg=constants,em=constants,eh={...path,...constants},tC=fs,tu={PathUtils:runtime.pathUtils??paths,ColorUtils:{generateColorFromName:runtime.generateColorFromName??generateSkillColor}},tw={CLI_AGENT_TAG:'cli',CUSTOM_AGENT_TAG:'custom'},tD={MCP_PROMPT_COMMAND_TAG:'mcp-prompt'},__dirname=runtime.configBasePath??runtime.getWorkDir(),ef={stripBuiltinModelsIfDisabled:value=>{if(!BooleanUtils.isTruthy(process.env.CODEBUDDY_DISABLE_BUILTIN_MODELS)||!value.models)return value;const{models,...rest}=value;return rest;}};
      ${helpers}
      const CliOptionsProductProvider=${raw("CliOptionsProductProvider")};Object.defineProperty(CliOptionsProductProvider,'name',{value:'tB'});
      const SdkInitializeProductProvider=${raw("SdkInitializeProductProvider")};Object.defineProperty(SdkInitializeProductProvider,'name',{value:'tI'});
      const PluginsProductProvider=${raw("PluginsProductProvider")};Object.defineProperty(PluginsProductProvider,'name',{value:'tz'});
      const McpPromptProductProvider=${raw("McpPromptProductProvider")};Object.defineProperty(McpPromptProductProvider,'name',{value:'tV'});
      const DefaultProductProvider=${raw("DefaultProductProvider")};Object.defineProperty(DefaultProductProvider,'name',{value:'eh'});
      const ClientProductProvider=${raw("ClientProductProvider")};Object.defineProperty(ClientProductProvider,'name',{value:'eE'});
      const EnvProductProvider=(()=>{const eh=constants,ef='ACC_PRODUCT_CONFIG_PATH',em=['ACC_PRODUCT_CONFIG_V3','ACC_PRODUCT_CONFIG_V2','ACC_PRODUCT_CONFIG'];return ${raw("EnvProductProvider")};})();Object.defineProperty(EnvProductProvider,'name',{value:'eE'});
      const McpPromptRendererImpl=${raw("McpPromptRendererImpl")};Object.defineProperty(McpPromptRendererImpl,'name',{value:'r5'});
      return{CliOptionsProductProvider,SdkInitializeProductProvider,PluginsProductProvider,McpPromptProductProvider,DefaultProductProvider,ClientProductProvider,EnvProductProvider,McpPromptRendererImpl,convertAgentDefinitionToProductAgent,buildSystemPromptAgentOverride};})();
      const ed={Emitter},MemoryLocalStorage=${raw("MemoryLocalStorage")};return{...mergerClasses,...providerClasses,ProductManagerImpl,GzipUtils,MemoryLocalStorage};})()`,
        context,
      );
    },
  };
}
