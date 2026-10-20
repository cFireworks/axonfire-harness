import { createHash, randomBytes } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import { Subject, BehaviorSubject, combineLatest } from "rxjs";
import {
  NativeDeferred,
  NativeEmitter,
} from "../../src/agents/native-agent-manager-runtime.js";
import { SettingsScope } from "../../src/permissions/native-permission-policy.js";
import { CapturedJsonUtils } from "../../src/vendor/captured-jsonc.js";
import { createNativeMcpUtils } from "../../src/mcp/native-mcp-utils.js";
import { createNativeMcpRuntime } from "../../src/mcp/native-mcp-runtime.js";
import { createNativeHostDetection } from "../../src/permissions/native-host-detection.js";
export const MCP_MANAGER_CLASSES = [
  ["McpManager", 9201138, 9223000],
  ["McpConfigManager", 9227386, 9235183],
  ["McpConfigStore", 9237347, 9240044],
  ["McpConnectionManager", 9240751, 9243796],
  ["McpPermissionsManager", 9277575, 9279382],
  ["McpToggleManager", 9280501, 9282018],
  ["McpLogService", 9283117, 9283188],
  ["McpServerModelImpl", 9286093, 9286776],
  ["McpServerModelManager", 9287338, 9288224],
  ["McpReadyService", 9290013, 9291502],
  ["McpCliConfigInitializer", 9292999, 9293699],
  ["McpConfigEnvExpandService", 9294448, 9295818],
  ["McpConfigDiagnosticsManager", 9296334, 9297907],
  ["McpPluginRegistry", 9301052, 9301648],
] as const;
export const MCP_MANAGER_FUNCTIONS = [
  ["stableConfigValue", 9200766, 9200997],
  ["computeProjectedConfigFingerprint", 9200997, 9201128],
  ["isTransportAlreadyStartedError", 9240666, 9240744],
  ["expandEnvVariables", 13069545, 13069734],
] as const;
export const MCP_MANAGER_PATH_METHODS = [
  ["getMcpFilePath", 13328983, 13329166],
  ["resolveMcpFilePath", 13329166, 13329658],
] as const;
export function capturedMcpManagerConstants(source: string) {
  const start = source.indexOf("73850(eA,el,ec){"),
    end = source.indexOf("},46153(eA,el,ec)", start) + 1;
  const exported: any = {},
    require = Object.assign(() => ({}), {
      r(obj: any) {
        Object.defineProperty(obj, "__esModule", { value: true });
      },
      d(obj: any, fields: any) {
        for (const [name, get] of Object.entries(fields))
          Object.defineProperty(obj, name, {
            enumerable: true,
            get: get as any,
          });
      },
    });
  runInNewContext(
    "({" + source.slice(start, end) + "})[73850]({}, exported, require)",
    { exported, require, Symbol, Object },
  );
  return exported;
}
export function loadCapturedMcpManager(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const constants = capturedMcpManagerConstants(source),
    body = MCP_MANAGER_CLASSES.map(
      ([name, start, end]) => `const ${name}=${source.slice(start, end)};`,
    ).join("\n"),
    functions = MCP_MANAGER_FUNCTIONS.map(([, start, end]) =>
      source.slice(start, end),
    ).join("\n"),
    pathMethods = MCP_MANAGER_PATH_METHODS.map(([, start, end]) =>
      source.slice(start, end),
    ).join("\n");
  return (runtime: any) => {
    const utils = runtime.mcpUtils ?? createNativeMcpUtils(runtime),
      context: any = {
        Error,
        Map,
        Set,
        Promise,
        Object,
        Reflect,
        Symbol,
        Number,
        String,
        Array,
        JSON,
        Buffer,
        Date: runtime.Date ?? Date,
        process: {
          env: runtime.env ?? {},
          argv: runtime.argv ?? [],
          stdout: { isTTY: runtime.isTTY ?? true },
        },
        tF: {
          ...Object.fromEntries(
            [
              "McpScope",
              "MERGE_SCOPE_PRIORITY",
              "McpServerStatus",
              "DefaultMcpConfig",
              "McpConfigDiagnosticSeverity",
              "TOOL_SHORT_DESCRIPTION_META_KEY",
            ].map((key) => [key, constants[key]]),
          ),
          McpCliConfigInitializer: "cliInitializer",
          McpConfigManager: "configManager",
        },
        tH: { Subject },
        tG: { BehaviorSubject },
        A0: { combineLatest },
        t5: { randomBytes: runtime.randomBytes ?? randomBytes },
        tY: createNativeHostDetection(runtime),
        tj: { Events: { McpGetPrompt: "mcp_get_prompt" } },
        tJ: { StartupPhase: { MCP_CONFIG_LOAD: "mcp_config_load" } },
        setTimeout: runtime.setTimeout ?? setTimeout,
        clearTimeout: runtime.clearTimeout ?? clearTimeout,
        setImmediate: runtime.setImmediate ?? setImmediate,
        tU: {
          Deferred: runtime.Deferred ?? NativeDeferred,
          Emitter: runtime.Emitter ?? NativeEmitter,
          Logger: "logger",
          ContainerUtil: {
            get: (key: string) => {
              if (!(key in runtime.dependencies))
                throw Error("MCP manager dependency not configured: " + key);
              return runtime.dependencies[key];
            },
          },
        },
        AT: runtime.fs,
        t7: path,
        Ap: {
          ObjectUtils: {
            copy:
              runtime.copy ??
              ((value: any) => JSON.parse(JSON.stringify(value))),
          },
        },
        AS: { SettingsScope },
        AL: { JsonUtils: CapturedJsonUtils },
        AR: "{}",
        AQ: 10000,
        ef: path,
        ep: runtime.fs,
        eh: { homedir: runtime.getPlatformHomeDir ?? runtime.getHomeDir },
        eE: constants,
        computeMcpConfigFingerprint:
          runtime.computeMcpConfigFingerprint ??
          createNativeMcpRuntime({
            ...runtime,
            dependencies: runtime.dependencies ?? {},
          }).computeMcpConfigFingerprint,
        runtime,
        utils,
      };
    return runInNewContext(
      String.raw`(()=>{let ey;const eu=/\$\{([A-Z_][A-Z0-9_]*)(?::-(.*?))?\}/g;class PathUtils{static getHomeDir(){return runtime.getHomeDir();}static getWorkDir(){return runtime.getWorkDir();}${pathMethods}}
      const t8={McpUtils:utils,JsonUtils:AL.JsonUtils,PathUtils},tW={McpUtils:utils},A8={expandEnvVariables};${functions}
      ${body}
      ey=McpManager;McpManager.UNINITIALIZED_SERVERS=[];return{${MCP_MANAGER_CLASSES.map(([name]) => name).join(",")},PathUtils,${MCP_MANAGER_FUNCTIONS.map(([name]) => name).join(",")}}})()`,
      context,
    );
  };
}
