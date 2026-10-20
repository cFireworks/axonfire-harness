// Native codebuddy.js UTF-16 11045096..11045850; only DI construction and TS annotations changed.
import { AgentInputItemProcessorPriority } from "../sessions/input-item-pipeline.js";
const t3 = { AgentInputItemProcessorPriority };
const Aw = {
  ToolNames: {
    DEFER_EXECUTE: "DeferExecuteTool",
    WORKFLOW: "Workflow",
    EXIT_PLAN_MODE: "ExitPlanMode",
  },
};
export class ExitPlanModeInputItemProcessor {
  [key: string]: any;
  priority: number;
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = t3.AgentInputItemProcessorPriority.ExitPlanMode;
  }
  async process(eA: any, el: any): Promise<any> {
    if (
      ("function_call" === eA.type || "function_call_result" === eA.type) &&
      eA.name === Aw.ToolNames.EXIT_PLAN_MODE
    ) {
      (eA.providerData || (eA.providerData = {}),
        eA.providerData.toolResult || (eA.providerData.toolResult = {}));
      try {
        let ec: any = this.planStorageService.syncRead(el);
        ec
          ? (el.meta?.plans || (el.meta.plans = {}),
            (el.meta.plans[el.meta?.planFilePath] = ec),
            (eA.providerData.toolResult.content = ec))
          : (eA.providerData.toolResult.content =
              "Plan mode exited. Warning: Plan file was not found or empty.");
      } catch (el: any) {
        ((eA.providerData.toolResult.content =
          "Plan mode exited. Warning: Failed to read plan file."),
          this.consoleManager.error(
            "[ExitPlanModeToolCall] Failed to read plan file:",
            el,
          ));
      }
    }
  }
}
export { ExitPlanModeInputItemProcessor as ExitPlanModeToolCallProcessor };
