// Native codebuddy.js UTF-16 11039444..11041199; only DI construction and TS annotations changed.
import { createInputProcessorUtilities } from "../sessions/input-processor-utils.js";
import { AgentInputItemProcessorPriority } from "../sessions/input-item-pipeline.js";
const t3 = { AgentInputItemProcessorPriority };
const Aw = {
  ToolNames: {
    DEFER_EXECUTE: "DeferExecuteTool",
    WORKFLOW: "Workflow",
    EXIT_PLAN_MODE: "ExitPlanMode",
  },
};
export class FunctionCallAgentInputItemProcessor {
  [key: string]: any;
  priority: number;
  utilities = createInputProcessorUtilities();
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = t3.AgentInputItemProcessorPriority.FunctionCall;
  }
  parseDisplayText(eA: any, el?: any): any {
    if (Array.isArray(eA)) return;
    if (el?.formatText) {
      let ec: any = el.formatText(eA);
      if (void 0 !== ec) return ec;
    }
    let ec: any =
        (el = el ?? {}).displayProperties ??
        Object.keys(eA).map((eA: any) => ({ name: eA })),
      eu: any = [];
    for (let el of ec)
      if (el.name in eA) {
        let ec: any = eA[el.name];
        if (
          ("path" === el.type && "string" == typeof ec
            ? (ec = this.utilities.PathUtils.getDisplayPath(ec))
            : "url" === el.type &&
              "string" == typeof ec &&
              (ec = this.utilities.UrlUtils.extractUrls(ec)[0]),
          null == ec || "" === ec || "object" == typeof ec)
        )
          continue;
        eu.push({ key: el.name, value: ec });
      }
    return 1 === ec.length
      ? eu[0].value
      : eu
          .map((eA: any) =>
            "string" == typeof eA.value
              ? `${eA.key}: "${eA.value}"`
              : `${eA.key}: ${eA.value}`,
          )
          .join(", ");
  }
  async process(eA: any): Promise<any> {
    if (
      !this.utilities.InputItemUtils.isCustomInputItem(eA) &&
      (eA.providerData || (eA.providerData = {}), "function_call" === eA.type)
    ) {
      eA.providerData || (eA.providerData = {});
      try {
        let el: any = await this.toolManager.get(eA.name);
        if (el) {
          let ec: any = JSON.parse(eA.arguments);
          ("object" == typeof ec &&
            (eA.providerData.argumentsDisplayText = this.parseDisplayText(
              ec,
              el.argumentRenderer,
            )),
            await this.maybePreloadWorkflowSource(eA, ec));
          return;
        }
      } catch (el: any) {
        el instanceof SyntaxError && (eA.providerData.discard = !0);
      }
    }
  }
  async maybePreloadWorkflowSource(eA: any, el: any): Promise<any> {
    if (
      !this.workflowSourceResolver ||
      "function_call" !== eA.type ||
      eA.name !== Aw.ToolNames.DEFER_EXECUTE
    )
      return;
    let ec: any = el?.params;
    if (
      !(
        !ec ||
        "object" != typeof ec ||
        el.toolName !== Aw.ToolNames.WORKFLOW ||
        ("string" == typeof ec.script && ec.script.trim())
      ) &&
      ("string" == typeof ec.name || "string" == typeof ec.scriptPath)
    )
      try {
        let el: any = await this.workflowSourceResolver.resolve(ec);
        eA.providerData && (eA.providerData.workflowSourceText = el.text);
      } catch (eA: any) {
        this.logger.debug?.(
          `[FunctionCallAgentInputItemProcessor] preload workflow failed: ${eA?.message ?? eA}`,
        );
      }
  }
}
