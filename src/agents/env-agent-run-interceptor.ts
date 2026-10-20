import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { SettingsManager } from "../models/model-provider.js";

/** The original priority-2000 interceptor intentionally applies settings.env process-wide. */
export class EnvAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 2000;
  constructor(private readonly settings: SettingsManager) {}
  async intercept(_context: AgentRunContext): Promise<void> {
    const env = await this.settings.get<Record<string, string>>("env");
    if (env) for (const key of Object.keys(env)) process.env[key] = env[key];
  }
}
