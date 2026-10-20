import { addSystemReminder } from "./system-reminder-agent-run-interceptor.js";
const AH = { MessageUtils: { addSystemReminder } };
// Native UTF-16 7106105..7106449.
export class ConditionalRulesAgentRunInterceptor {
  declare readonly priority: number;
  [key: string]: any;
  constructor(readonly conditionalRulesService: any) {
    this.priority = 1740;
  }
  async intercept(eA: any): Promise<any> {
    if (!Array.isArray(eA.input)) return;
    let el: any = eA.session.conditionalRules;
    if (!el || 0 === el.pendingTriggers.size) return;
    let ec: any = await this.conditionalRulesService.consume(el);
    ec.content &&
      AH.MessageUtils.addSystemReminder(eA.input, ec.content, "last");
  }
}
