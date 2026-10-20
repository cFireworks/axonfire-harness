export const ENV_KEY_CODEBUDDY_DISABLE_WORKFLOWS = "CODEBUDDY_DISABLE_WORKFLOWS";
export async function isWorkflowDisabled(settings?: { get<T>(key: string): Promise<T | undefined> }): Promise<boolean> { if (process.env[ENV_KEY_CODEBUDDY_DISABLE_WORKFLOWS] === "1") return true; try { return await settings?.get("disableWorkflows") === true; } catch { return false; } }
export function isWorkflowDisabledByEnv(): boolean { return process.env[ENV_KEY_CODEBUDDY_DISABLE_WORKFLOWS] === "1"; }
