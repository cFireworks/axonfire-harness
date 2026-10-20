import { Agent } from "@openai/agents";
import type { AgentManager } from "./agent-manager.js";
import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { ProductModel } from "../config/types.js";
import type { SettingsManager } from "../models/model-provider.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { HarnessSession } from "../sessions/session.js";

export const DEFAULT_TEMPERATURE = 1;
const EFFORTS = ["minimal", "low", "medium", "high", "xhigh", "max"] as const;
export function normalizeReasoningEffort(value: unknown): typeof EFFORTS[number] | undefined {
  return typeof value === "string" && (EFFORTS as readonly string[]).includes(value) ? value as typeof EFFORTS[number] : undefined;
}
export function getMaxOutputTokens(configured?: number): number | undefined {
  const value = Number.parseInt(process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) return configured;
  const capped = Math.min(value, 100_000);
  return configured === undefined ? capped : Math.min(capped, configured);
}

/** codebuddy.js 7122560..7126281: Model priority=900, request > CLI > default. */
export class ModelConfigAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 900;
  constructor(private readonly agents: AgentManager, private readonly sessions: SessionManager, private readonly settings: SettingsManager) {}

  async intercept(context: AgentRunContext): Promise<void> {
    await this.configureModelConfig(context.agent, context.session);
  }

  async getModelByCliOptions(agent: Agent<HarnessSession>, session: HarnessSession): Promise<ProductModel | undefined> {
    const requested = session.options.model as string | undefined;
    if (!requested) return undefined;
    return await this.agents.resolveModel(requested) ?? { ...await this.agents.getModel(agent.name), id: requested, name: requested };
  }

  async getModelByRequestOptions(agent: Agent<HarnessSession>, session: HarnessSession): Promise<ProductModel> {
    const requested = session.requestOptions.model as string | undefined;
    const resolved = requested ? await this.agents.resolveModel(requested) : undefined;
    if (resolved) return resolved;
    const base = await this.agents.getModel(agent.name);
    return requested ? { ...base, id: requested, name: requested } : base;
  }

  async configureModelConfig(agent: Agent<HarnessSession>, session: HarnessSession): Promise<void> {
    const model = (session.requestOptions.model
      ? await this.getModelByRequestOptions(agent, session)
      : await this.getModelByCliOptions(agent, session)) ?? await this.getModelByRequestOptions(agent, session);
    agent.model = model.id;
    agent.modelSettings ??= {};
    const maxTokens = getMaxOutputTokens(model.maxOutputTokens);
    if (maxTokens !== undefined) agent.modelSettings.maxTokens = maxTokens;
    agent.modelSettings.temperature = model.temperature ?? DEFAULT_TEMPERATURE;
    for (const handoff of agent.handoffs) {
      await this.configureModelConfig(handoff instanceof Agent ? handoff : handoff.agent, session);
    }
    await this.configureThinkingSettings(agent, model, session);
  }

  async configureThinkingSettings(agent: Agent<HarnessSession>, model: ProductModel, session: HarnessSession): Promise<void> {
    const settings = agent.modelSettings ??= {};
    if (!model.supportsReasoning) { delete settings.reasoning; return; }
    try {
      const override = this.sessions.getOverrideThinking(session.id);
      const enabled = await this.settings.get<boolean>("alwaysThinkingEnabled");
      const globalEffort = await this.settings.get<string>("reasoningEffort");
      const parsed = Number.parseInt(process.env.MAX_THINKING_TOKENS ?? "", 10);
      const budget = parsed && !Number.isNaN(parsed) && parsed > 0 ? parsed : undefined;
      if (override?.thinkingEnabled === false || (override?.thinkingEnabled === undefined && enabled === false)) {
        delete settings.reasoning; return;
      }
      const thinking = (override?.thinkingEnabled ?? enabled ?? false) || Boolean(budget);
      if (thinking) {
        (settings.reasoning ??= {}).summary = "auto";
        (settings.text ??= {}).verbosity = "high";
        if (budget) (settings.providerData ??= {}).max_thinking_tokens = budget;
      }
      const reasoning = model.reasoning as (NonNullable<ProductModel["reasoning"]> & { defaultEffort?: string }) | undefined;
      const effort = normalizeReasoningEffort(override?.reasoningEffort) ?? normalizeReasoningEffort(globalEffort)
        ?? normalizeReasoningEffort(reasoning?.defaultEffort) ?? normalizeReasoningEffort(reasoning?.effort);
      if (effort) {
        (settings.reasoning ??= {}).effort = effort === "max" ? "xhigh" : effort;
        settings.reasoning.summary ||= reasoning?.summary ?? "auto";
      } else if (reasoning?.summary) (settings.reasoning ??= {}).summary = reasoning.summary;
      if (thinking && !settings.reasoning?.effort) (settings.reasoning ??= {}).effort = "high";
    } catch { /* Original catches settings/override failures and keeps the model usable. */ }
  }
}
