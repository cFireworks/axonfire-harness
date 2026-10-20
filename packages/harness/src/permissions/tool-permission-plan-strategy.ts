import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { PlanStorageService } from "../plans/plan-storage-service.js";
import { PermissionMode } from "./permission.js";

export type PermissionArgument = { type: string; value?: string };
export type ClassifiedTool = { name: string; aliases?: string[]; needsApproval?: unknown; resolveToolType(names: string[]): string };
export interface ToolPermissionStrategy {
  mode: PermissionMode;
  needApproval(tool: ClassifiedTool, context: RunContext<HarnessSession>, input: unknown, args: PermissionArgument[], callId?: string): Promise<boolean>;
}
/** Source 11577909: Plan delegates to the saved mode; it is not a blanket read-only classifier. */
export class ToolPermissionPlanStrategy implements ToolPermissionStrategy {
  readonly mode = PermissionMode.Plan;
  constructor(private readonly plans: PlanStorageService, private readonly strategies: () => ToolPermissionStrategy[],
    private readonly defaultStrategy: ToolPermissionStrategy, private readonly resolveFilePath: (value: string) => string) {}
  async needApproval(tool: ClassifiedTool, context: RunContext<HarnessSession>, input: unknown, args: PermissionArgument[], callId?: string): Promise<boolean> {
    const type = tool.resolveToolType([tool.name, ...tool.aliases ?? []].map((name) => name.toLowerCase()));
    const previous = context.context?.meta.prePlanPermissionMode as PermissionMode | undefined;
    if (tool.needsApproval === true) return true;
    if (type === "edit" && this.isPlanFileEdit(context, args)) return false;
    return this.delegateToPrePlanStrategy(previous, tool, context, input, args, callId);
  }
  async delegateToPrePlanStrategy(previous: PermissionMode | undefined, tool: ClassifiedTool, context: RunContext<HarnessSession>, input: unknown, args: PermissionArgument[], callId?: string): Promise<boolean> {
    const strategy = this.strategies().find((candidate) => candidate.mode === (previous || PermissionMode.Default));
    return (strategy && strategy !== this ? strategy : this.defaultStrategy).needApproval(tool, context, input, args, callId);
  }
  isPlanFileEdit(context: RunContext<HarnessSession>, args: PermissionArgument[]): boolean {
    const session = context.context;
    if (!session) return false;
    const file = this.plans.getPlanFilePath(session);
    if (!file) return false;
    const argument = args.find((arg) => arg.type === "filePath");
    return Boolean(argument?.value && this.resolveFilePath(argument.value) === file);
  }
}
