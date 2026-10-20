// Native codebuddy.js UTF-16 11044508..11045003; only DI construction and TS annotations changed.
import { createInputProcessorUtilities } from "../sessions/input-processor-utils.js";
import { AgentInputItemProcessorPriority } from "../sessions/input-item-pipeline.js";
const t3 = { AgentInputItemProcessorPriority };
export class UsageAgentInputItemProcessor {
  [key: string]: any;
  priority: number;
  utilities = createInputProcessorUtilities();
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = t3.AgentInputItemProcessorPriority.UsageProcessor;
  }
  async process(eA: any, el: any): Promise<any> {
    if (this.utilities.InputItemUtils.isCustomInputItem(eA)) return;
    let ec: any = el.resultSubject.value;
    if (!ec || 0 === ec.rawResponses.length) return;
    let eu: any = ec.rawResponses[ec.rawResponses.length - 1];
    (eA.providerData?._isLastResponseItem === !0 ||
      eu.output[eu.output.length - 1] === eA) &&
      (eA.providerData || (eA.providerData = {}),
      (eA.providerData.usage = eu.usage),
      delete eA.providerData._isLastResponseItem,
      el.usage.add(eu.usage));
  }
}
