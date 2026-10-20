import * as SDK from "@openai/agents-core";
import { HookEvent, HookPriority } from "./hook-constants.js";
import type { GenericHookRuntime } from "./hook-runtime.js";
const oH = { HookEvent, HookPriority };
const iN = SDK,
  oX = SDK,
  r4 = { AgentNames: { PROMPT_HOOK_EVALUATOR: "promptHookEvaluator" } },
  o0 = { AgentPurpose: { PromptHook: "prompt_hook" } };
// Native UTF-16 8474519..8476927.
export class PromptHookServiceImpl {
  [key: string]: any;
  constructor(readonly runtime: GenericHookRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  async execute(eA: any, el: any, ec: any): Promise<any> {
    if (!eA.prompt)
      return (
        this.logger.error('Prompt hook missing required "prompt" field'),
        {
          ok: !0,
          reason: 'Prompt hook configuration error: missing "prompt" field',
        }
      );
    try {
      let eu: any,
        ed: any = this.buildUserMessage(eA, el);
      if (
        (this.logger.info(
          `[PromptHookService] Executing prompt hook for event: ${el.hook_event_name}`,
        ),
        this.logger.debug(`Prompt hook user message: ${ed}`),
        ec?.includeHistory && el.session?.state)
      )
        eu = await this.runWithHistory(ed, el.session);
      else {
        ec?.includeHistory &&
          !el.session?.state &&
          this.logger.warn(
            `[PromptHookService] includeHistory=true but session.state is missing for event=${el.hook_event_name}. Falling back to runOneTime (no history context).`,
          );
        let eA: any = this.runtime.getAgentService();
        eu = await eA.runOneTime(r4.AgentNames.PROMPT_HOOK_EVALUATOR, ed);
      }
      return (
        this.logger.debug(`Prompt hook response: ${eu}`),
        this.runtime.promptProtocol.parsePromptHookResponse(eu)
      );
    } catch (eA: any) {
      return (
        this.logger.warn(
          `[PromptHookService] Prompt hook execution failed for event=${el.hook_event_name}: ${eA instanceof Error ? eA.message : String(eA)}. Hook will NOT block the operation (defensive fallback).`,
        ),
        this.logger.debug("Prompt hook error details:", eA),
        {
          ok: !0,
          reason: `Prompt hook execution failed: ${eA instanceof Error ? eA.message : String(eA)}`,
        }
      );
    }
  }
  async runWithHistory(eA: any, el: any): Promise<any> {
    let ec: any = this.runnerProvider,
      eu: any = this.agentManager,
      ed: any = await ec.get(),
      ep: any = await eu.get(r4.AgentNames.PROMPT_HOOK_EVALUATOR);
    if (!ep)
      throw Error(`Agent not found: ${r4.AgentNames.PROMPT_HOOK_EVALUATOR}`);
    let eg: any = (await eu.getModel(r4.AgentNames.PROMPT_HOOK_EVALUATOR)).id,
      eh: any = this.cloneEvaluator(ep, eg),
      ef: any = el.state,
      em: any = [
        ...this.runtime.utilities.HistoryUtils.fillFunctionCallResultHistory(
          ef.history,
        ).filter(
          (eA: any) =>
            !this.runtime.utilities.InputItemUtils.isCustomInputItem(eA),
        ),
        (0, iN.user)(eA),
      ],
      eE: any = new oX.RunState(ef._context, em, eh, 1),
      eC: any = el.agentPurpose;
    el.agentPurpose = o0.AgentPurpose.PromptHook;
    try {
      let eA: any = await ed.run(eh, eE, { stream: !0, maxTurns: 1 }),
        el: any = "";
      for await (let ec of eA.toTextStream()) el += ec;
      return el;
    } finally {
      el.agentPurpose = eC;
    }
  }
  buildUserMessage(eA: any, el: any): any {
    let { prompt: ec } = eA,
      eu: any = this.runtime.promptProtocol.buildPromptHookArgumentsJson(el);
    return ec.includes("$ARGUMENTS")
      ? ec.replace("$ARGUMENTS", eu)
      : `${ec}

ARGUMENTS:
${eu}`;
  }
  cloneEvaluator(eA: any, el: any): any {
    return new iN.Agent({
      name: `${eA.name}-stop-eval`,
      instructions: eA.instructions,
      model: el,
      modelSettings: eA.modelSettings,
      tools: eA.tools,
      handoffs: eA.handoffs,
      inputGuardrails: eA.inputGuardrails,
      outputGuardrails: eA.outputGuardrails,
    });
  }
}
