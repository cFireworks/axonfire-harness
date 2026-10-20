import type { AgentInputItem } from "@openai/agents-core";
import type { HarnessSession } from "./session.js";

/** Native numeric priorities; provider.sortSync() invokes higher values first. */
export enum AgentInputItemProcessorPriority {
  Default = 10,
  ParentIdLinkage = 9,
  FunctionCall = 8,
  FunctionCallResult = 7,
  UsageProcessor = 6,
  Telemetry = 5,
  ExitPlanMode = 4,
}
export const AgentInputItemProcessor = Symbol("AgentInputItemProcessor");
export interface AgentInputItemProcessor {
  priority: number;
  process(item: any, session: any): void | Promise<void>;
}
export class AgentInputItemPipeline {
  constructor(readonly processors: AgentInputItemProcessor[]) {}
  async process(item: AgentInputItem, session: HarnessSession): Promise<void> {
    for (const processor of this.processors
      .filter((processor) => processor.priority > 0)
      .sort((a, b) => b.priority - a.priority)) {
      await processor.process(item, session);
    }
  }
}
