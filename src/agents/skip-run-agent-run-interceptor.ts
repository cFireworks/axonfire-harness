import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";

export class SkipRunAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 1700;
  constructor(private readonly state: SessionRunStateMachine) {}
  async intercept(context: AgentRunContext): Promise<void> {
    if (!context.skipRun && Array.isArray(context.input) && context.input.length) {
      if (context.input.some((item: any) => Boolean(item.providerData?.skipRun))) context.skipRun = true;
      else this.state.transition(context.session, "run_accepted");
    }
  }
}
