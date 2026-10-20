// Complete initialize.js helper; native app-config/system locale priority is unchanged.
export const PROMPT_CLI_LANGUAGE_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const PROMPT_CLI_LANGUAGE_FUNCTION = [
  "resolveCliSettingsLanguage",
  5425992,
  5426506,
] as const;
export function createNativePromptCliLanguage(runtime: any) {
  const require_workbuddy_auth_product_coordinator = runtime;
  function resolveCliSettingsLanguage(deps: any = {}): any {
    let configuredLocale: any;
    try {
      const raw: any = deps.readAppConfigValue?.("locale");
      if (typeof raw === "string" && raw.trim()) configuredLocale = raw.trim();
    } catch {}
    let systemLocale: any = "";
    try {
      systemLocale = deps.getSystemLocale?.() || "";
    } catch {
      systemLocale = "";
    }
    if (!configuredLocale && !systemLocale) return;
    return require_workbuddy_auth_product_coordinator.resolveResponseLocaleIsZh(
      configuredLocale,
      systemLocale,
    )
      ? "简体中文"
      : "English";
  }
  return { resolveCliSettingsLanguage };
}
