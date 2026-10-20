import * as node_path from "node:path";
import * as realOs from "node:os";
export const PROMPT_RUNTIME_CONTEXT_SHA256 =
  "9dc270ab82e397b64bf8984e840562236c5b46435a208e8204fc14ef6b112f43";
export const PROMPT_RUNTIME_CONTEXT_DECLARATIONS = [
  ["DEFAULT_APP_NAME", 277, 312],
  ["DEFAULT_CONFIG_DIRNAME", 313, 355],
  ["runtimeContext", 356, 380],
  ["configureWorkbuddyRuntimeContext", 381, 508],
  ["getWorkbuddyRuntimeAppName", 509, 644],
  ["getWorkbuddyRuntimeAppVersion", 645, 775],
  ["getWorkbuddyRuntimeAppPath", 776, 908],
  ["getWorkbuddyRuntimePromptTemplatesDir", 909, 1058],
  ["getWorkbuddyRuntimeLocale", 1059, 1198],
  ["getWorkbuddyRuntimeConfigDir", 1199, 1381],
  ["getWorkbuddyRuntimeUserDataDir", 1382, 1567],
  ["getWorkbuddyRuntimeLogsDir", 1568, 1697],
  ["dropUndefined", 1698, 1861],
] as const;
export function createNativePromptRuntimeContext(runtime: any) {
  const process: any = { env: runtime.env ?? {}, cwd: runtime.getWorkDir },
    node_os = runtime.os ?? realOs;
  var DEFAULT_APP_NAME: any = "WorkBuddy";
  var DEFAULT_CONFIG_DIRNAME: any = ".workbuddy";
  var runtimeContext: any = {};
  function configureWorkbuddyRuntimeContext(options: any): any {
    runtimeContext = {
      ...runtimeContext,
      ...dropUndefined(options),
    };
  }
  function getWorkbuddyRuntimeAppName(): any {
    return (
      process.env.WORKBUDDY_APP_NAME?.trim() ||
      runtimeContext.appName ||
      DEFAULT_APP_NAME
    );
  }
  function getWorkbuddyRuntimeAppVersion(): any {
    return (
      process.env.WORKBUDDY_APP_VERSION?.trim() ||
      runtimeContext.appVersion ||
      ""
    );
  }
  function getWorkbuddyRuntimeAppPath(): any {
    return (
      process.env.WORKBUDDY_APP_PATH?.trim() ||
      runtimeContext.appPath ||
      process.cwd()
    );
  }
  function getWorkbuddyRuntimePromptTemplatesDir(): any {
    return (
      process.env.WORKBUDDY_PROMPT_TEMPLATES_DIR?.trim() ||
      runtimeContext.promptTemplatesDir
    );
  }
  function getWorkbuddyRuntimeLocale(): any {
    return (
      process.env.WORKBUDDY_LOCALE?.trim() ||
      runtimeContext.locale ||
      process.env.LANG ||
      "en"
    );
  }
  function getWorkbuddyRuntimeConfigDir(): any {
    return (
      process.env.WORKBUDDY_CONFIG_DIR?.trim() ||
      runtimeContext.configDir ||
      node_path.join(node_os.homedir(), DEFAULT_CONFIG_DIRNAME)
    );
  }
  function getWorkbuddyRuntimeUserDataDir(): any {
    return (
      process.env.WORKBUDDY_USER_DATA_DIR?.trim() ||
      runtimeContext.userDataDir ||
      node_path.join(getWorkbuddyRuntimeConfigDir(), "app")
    );
  }
  function getWorkbuddyRuntimeLogsDir(...segments: any): any {
    return node_path.join(getWorkbuddyRuntimeConfigDir(), "logs", ...segments);
  }
  function dropUndefined(value: any): any {
    const result: any = {};
    for (const [key, entry] of Object.entries(value))
      if (entry !== void 0) result[key] = entry;
    return result;
  }
  return {
    configureWorkbuddyRuntimeContext,
    getWorkbuddyRuntimeAppName,
    getWorkbuddyRuntimeAppVersion,
    getWorkbuddyRuntimeAppPath,
    getWorkbuddyRuntimePromptTemplatesDir,
    getWorkbuddyRuntimeLocale,
    getWorkbuddyRuntimeConfigDir,
    getWorkbuddyRuntimeUserDataDir,
    getWorkbuddyRuntimeLogsDir,
    dropUndefined,
  };
}
