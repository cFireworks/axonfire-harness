// Native codebuddy.js UTF-16 11036587..11037814; only DI construction and TS annotations changed.
import { randomUUID } from "node:crypto";
import { createInputProcessorUtilities } from "../sessions/input-processor-utils.js";
import { AgentInputItemProcessorPriority } from "../sessions/input-item-pipeline.js";
import {
  CompactType,
  SESSION_META_COMPACT_TYPE,
} from "../context/compact-config.js";
const t3 = { AgentInputItemProcessorPriority };
const A2 = {
    CUSTOM_AGENT_TAG: "custom",
    SUB_AGENT_TAG: "sub-agent",
    AgentNames: { COMPACT: "compact" },
  },
  A4 = { CompactType, SESSION_META_COMPACT_TYPE };
export class DefaultInputItemProcessor {
  [key: string]: any;
  priority: number;
  utilities = createInputProcessorUtilities();
  generateUUUID = randomUUID;
  now = Date.now;
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = t3.AgentInputItemProcessorPriority.Default;
  }
  async process(eA: any, el: any): Promise<any> {
    if (this.utilities.InputItemUtils.isCustomInputItem(eA)) return;
    (eA.providerData || (eA.providerData = {}),
      (eA.id && "FAKE_ID" !== eA.id) || (eA.id = this.generateUUUID()),
      eA.sessionId || (eA.sessionId = el.id),
      eA.timestamp || (eA.timestamp = this.now()));
    let ec: any = el.resultSubject.value?.lastAgent.name;
    if (ec) {
      eA.providerData.agent || (eA.providerData.agent = ec);
      let eu: any = (
        await this.productManager.waitConfiguration()
      ).agents?.find((eA: any) => eA.name === ec);
      ((eu?.tags?.includes(A2.CUSTOM_AGENT_TAG) ||
        eu?.tags?.includes(A2.SUB_AGENT_TAG)) &&
        ((eA.providerData.isSubAgent = !0),
        (eA.providerData.agentColor = eu?.color)),
        ec === A2.AgentNames.COMPACT &&
          this.markSuccessfulCompactAssistantSummary(eA, el));
    }
  }
  markSuccessfulCompactAssistantSummary(eA: any, el: any): any {
    var ec: any;
    let eu: any = eA;
    if ("message" !== eu.type || "assistant" !== eu.role) return;
    let ed: any = this.utilities.SummaryUtils.extractTextFromAssistantContent(
      eu.content,
    );
    this.utilities.SummaryUtils.extractCompactSummaryFromText(ed) &&
      (eA.providerData ?? (eA.providerData = {}),
      (eA.providerData.isCompactInternal = !0),
      (eA.providerData.isSummary = !0),
      (eA.providerData.isCompacted = !0),
      (ec = eA.providerData).compactType ??
        (ec.compactType =
          el.meta?.[A4.SESSION_META_COMPACT_TYPE] ??
          A4.CompactType.USER_COMMAND));
  }
}
