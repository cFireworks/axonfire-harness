export const IOA_DEFAULT_DOMAIN = "tencent.sso.copilot.tencent.com";
export const IOA_DEFAULT_ENTERPRISE_ID = "etahzsqej0n4";
export const IOA_DEFAULT_STAGING_DOMAIN =
  "tencent.sso.copilot-staging.tencent.com";
export const IOA_DEFAULT_STAGING_ENTERPRISE_ID = "esoikz80kd8g";
/** Native 13282850..13283616. Extra arguments replace ContainerUtil/settings DI. */
export class IOAUtils {
  static isIOAEnvironment(
    env?: Record<string, any>,
    processEnv: NodeJS.ProcessEnv = process.env,
  ): boolean {
    const value =
      env?.CODEBUDDY_INTERNET_ENVIRONMENT ||
      processEnv.CODEBUDDY_INTERNET_ENVIRONMENT;
    return value?.toLowerCase() === "ioa";
  }
  static async applyIOADefaultHeaders(
    headers: Record<string, any>,
    env: Record<string, any> | undefined,
    options: {
      enterpriseId?: string;
      skipDefaultEnterpriseHeaders?: boolean;
    } = {},
    settings?: { get(key: string): Promise<unknown> },
    processEnv: NodeJS.ProcessEnv = process.env,
  ): Promise<void> {
    if (!this.isIOAEnvironment(env, processEnv)) return;
    if (!settings)
      throw new Error("IOA SettingsManager dependency is unavailable");
    const staging = (await settings.get("envRouteMode")) === "staging";
    headers["X-Domain"] ||= staging
      ? IOA_DEFAULT_STAGING_DOMAIN
      : IOA_DEFAULT_DOMAIN;
    const fallback = staging
        ? IOA_DEFAULT_STAGING_ENTERPRISE_ID
        : IOA_DEFAULT_ENTERPRISE_ID,
      enterprise =
        options.enterpriseId?.trim() ||
        (options.skipDefaultEnterpriseHeaders ? undefined : fallback);
    if (enterprise) {
      headers["X-Enterprise-Id"] ||= enterprise;
      headers["X-Tenant-Id"] ||= enterprise;
    }
  }
}
export function isPersonalAccount(account: any): boolean {
  return account?.type?.trim().toLowerCase() === "personal";
}
