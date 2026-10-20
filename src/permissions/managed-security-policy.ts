import { existsSync, readFileSync } from "node:fs";
const isObject = (value: any): boolean =>
  typeof value === "object" && value !== null;
export function toSecurityStringArray(value: any): string[] {
  return Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string")
    : [];
}
export function toPrefixRules(value: any): { prefix: string[] }[] {
  return toSecurityStringArray(value)
    .map((entry) => entry.trim().split(/\s+/).filter(Boolean))
    .filter((entry) => entry.length > 0)
    .map((prefix) => ({ prefix }));
}
/** Native module71445. Arrays count as objects; no extra schema hardening. */
export function translateRemoteSecurityCenter(value: any): any {
  if (!isObject(value)) return { managed: false };
  const config = value.config;
  if (!isObject(config)) return { managed: false };
  const result: any = {
      managed:
        "sandbox" in config || "dataSecurity" in config || "runtime" in config,
    },
    sandbox = config.sandbox;
  if (isObject(sandbox)) {
    if (typeof sandbox.enabled === "boolean")
      result.sandboxEnabled = sandbox.enabled;
    if (typeof sandbox.showDefaultPermission === "boolean")
      result.showDefaultPermission = sandbox.showDefaultPermission;
    const network = sandbox.networkAccess;
    if (isObject(network))
      result.network = {
        allowedDomains: toSecurityStringArray(network.whitelistDomains),
        deniedDomains: toSecurityStringArray(network.blacklistDomains),
        denyAll: network.mode === "deny_all_with_whitelist",
      };
    const files = sandbox.fileProtection;
    if (isObject(files))
      result.fileSafety = {
        blocklist: toSecurityStringArray(files.protectPaths),
        allowlist: toSecurityStringArray(files.whitelist),
      };
    const commands = sandbox.commandControl;
    if (isObject(commands))
      result.commandSafety = {
        allow: toPrefixRules(commands.allowPrefixes),
        ask: toPrefixRules(commands.askPrefixes),
      };
  }
  const data = config.dataSecurity;
  if (isObject(data))
    result.dataSecurity = {
      securityGatewayEnabled:
        typeof data.secureGatewayEnabled === "boolean"
          ? data.secureGatewayEnabled
          : undefined,
      transmissionEncryptionEnabled:
        typeof data.transitEncryption === "boolean"
          ? data.transitEncryption
          : undefined,
      deleteProtectionEnabled: data.deleteProtection === true,
      batchDeleteApprovalThreshold:
        typeof data.batchDeleteApprovalThreshold === "number"
          ? data.batchDeleteApprovalThreshold
          : 0,
      safeDeleteRuntimeEnabled: data.deleteProtection === true,
    };
  const runtime = config.runtime;
  if (isObject(runtime)) {
    const tools = isObject(runtime.tools) ? runtime.tools : {};
    result.bundledRuntime = {
      enabled: runtime.enabled !== false,
      tools: {
        node: tools.nodejs !== false,
        python: tools.python !== false,
        gitBash: tools.gitBash !== false,
        brokeredShell: tools.brokeredShell !== false,
      },
    };
  }
  return result;
}
export function parseSecurityCenter(value: string | undefined): any {
  if (value)
    try {
      return JSON.parse(value)?.clientSecurity;
    } catch {
      return;
    }
}
/** Native 7325800+; first non-null parsed source wins even if unmanaged. */
export function readManagedSecurityPolicyFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): any {
  for (const key of ["ACC_PRODUCT_CONFIG_V3", "ACC_PRODUCT_CONFIG_V2"]) {
    const parsed = parseSecurityCenter(env[key]);
    if (parsed != null) return translateRemoteSecurityCenter(parsed);
  }
  const path = env.ACC_PRODUCT_CONFIG_PATH;
  if (path)
    try {
      if (existsSync(path)) {
        const parsed = parseSecurityCenter(readFileSync(path, "utf-8"));
        if (parsed != null) return translateRemoteSecurityCenter(parsed);
      }
    } catch {}
  return { managed: false };
}
/** Only network projection of native BashSandboxManager.loadConfig, not its
 * filesystem expansion, platform wrapper, command safety or apply lifecycle. */
export async function loadWebNetworkConfig(
  settings: { list?(): Promise<Record<string, any>> },
  env: NodeJS.ProcessEnv = process.env,
  logger: { warn?(message: string, error?: any): void } = {},
): Promise<any> {
  const network = {
    allowedDomains: [],
    deniedDomains: [],
    allowLocalBinding: false,
    allowUnixSockets: [],
    allowAllUnixSockets: false,
  };
  try {
    const sandbox = (await settings.list?.())?.sandbox,
      config = { ...sandbox, network: { ...network, ...sandbox?.network } },
      managed = readManagedSecurityPolicyFromEnv(env);
    if (managed.managed && managed.network) {
      config.network = {
        ...config.network,
        allowedDomains: managed.network.allowedDomains,
        deniedDomains: managed.network.deniedDomains,
      };
      config.network.denyAll = managed.network.denyAll;
    }
    return config;
  } catch (error) {
    logger.warn?.("Failed to load sandbox config, using defaults", error);
    return { network };
  }
}
