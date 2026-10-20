// Native codebuddy.js UTF-16 11038139..11039351; only DI construction and TS annotations changed.
import { createInputProcessorUtilities } from "../sessions/input-processor-utils.js";
import { AgentInputItemProcessorPriority } from "../sessions/input-item-pipeline.js";
const t3 = { AgentInputItemProcessorPriority };
export class ParentIdLinkageProcessor {
  [key: string]: any;
  priority: number;
  utilities = createInputProcessorUtilities();
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = t3.AgentInputItemProcessorPriority.ParentIdLinkage;
  }
  async process(eA: any, el: any): Promise<any> {
    if (this.utilities.InputItemUtils.isCustomInputItem(eA)) return;
    let ec: any = this.resolveParentId(eA, el);
    (this.utilities.InputItemUtils.isReplayRecoverableCompactMessage(eA)
      ? ((eA.parentId = void 0), (eA.logicalParentId = ec))
      : (eA.parentId = ec),
      (el.lastMessageId = eA.id),
      !this.utilities.SessionUtils.isSubAgent(el) &&
        this.utilities.InputItemUtils.isRealUserMessageItem(eA) &&
        (el.lastUserMessageId = eA.id));
  }
  resolveParentId(eA: any, el: any): any {
    let ec: any = eA.parentId ?? el.lastMessageId,
      eu: any = !!eA.id && ec === eA.id,
      ed: any =
        this.utilities.InputItemUtils.isReplayRecoverableCompactMessage(eA) ||
        this.utilities.InputItemUtils.isSystemTeammateMessage(eA),
      ep: any = !!ec && ed && !this.hasHistoryItem(el, ec),
      eg: any = !!ec && ed && this.parentChainReaches(el, ec, eA.id);
    if (!eu && !ep && !eg) return ec;
    for (let ec: any = el.history.length - 1; ec >= 0; ec--) {
      let eu: any = el.history[ec];
      if (
        eu?.id &&
        eu.id !== eA.id &&
        !this.utilities.InputItemUtils.isCustomInputItem(eu) &&
        !this.parentChainReaches(el, eu.id, eA.id)
      )
        return eu.id;
    }
  }
  hasHistoryItem(eA: any, el: any): any {
    return eA.history.some((eA: any) => eA?.id === el);
  }
  parentChainReaches(eA: any, el: any, ec: any): any {
    if (!el || !ec) return !1;
    let eu: any = new Map(
        eA.history.filter((eA: any) => eA.id).map((eA: any) => [eA.id, eA]),
      ),
      ed: any = new Set(),
      ep: any = el;
    for (; ep && !ed.has(ep); ) {
      if (ep === ec) return !0;
      (ed.add(ep), (ep = eu.get(ep)?.parentId));
    }
    return !1;
  }
}
