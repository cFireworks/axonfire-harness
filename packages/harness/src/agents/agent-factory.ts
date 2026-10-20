import { Agent, type AgentOptions } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import { ToolArgumentRewriteService } from "../tools/tool-argument-rewrite-service.js";
import { McpToolCallContext } from "../mcp/mcp-tool-call-context.js";

export const STATE_MACHINE_BYPASS_AGENTS = new Set([
  "contentAnalyzer", "terminalTitleGenerator", "promptSuggestion", "summaryGenerator",
  "promptHookEvaluator", "insightsAnalyzer", "memorySelector", "agentInstructions", "autoModeClassifier",
]);
export function isStateMachineBypassPurpose(purpose: string | undefined): boolean { return purpose === "context_summary_pre_message"; }

/** Native Agent lifecycle wiring (7063971..7065964), not Runner hooks. */
export class AgentFactory {
  private nativeMcpApprovalResolver?: (name: string) => any;
  attachNativeMcpApprovalResolver(resolver: (name: string) => any): void { this.nativeMcpApprovalResolver = resolver; }
  constructor(
    readonly stateMachine: SessionRunStateMachine,
    readonly toolArgumentRewriteService: { process(arguments_: string): string } = new ToolArgumentRewriteService(),
    readonly toolCallContext: { enter(callId: string, name: string): void; clear(): void } = McpToolCallContext,
  ) {}
  async create(options: AgentOptions<HarnessSession>): Promise<Agent<HarnessSession>> {
    const agent = new Agent<HarnessSession>(options), bypass = STATE_MACHINE_BYPASS_AGENTS.has(agent.name);
    // The captured SDK 0.5.2 bundle forwards mcpTool.needsApproval; npm 0.5.2 does not.
    // Bridge only that descriptor field, retaining the installed SDK converter and cache.
    if (this.nativeMcpApprovalResolver) {
      const getMcpTools = agent.getMcpTools.bind(agent);
      agent.getMcpTools = async (context) => {
        const tools = await getMcpTools(context);
        for (const tool of tools) if (tool.type === "function") {
          const needsApproval = this.nativeMcpApprovalResolver?.(tool.name);
          if (typeof needsApproval === "function") tool.needsApproval = needsApproval;
        }
        return tools;
      };
    }
    const drives = (session: HarnessSession) => !bypass && !isStateMachineBypassPurpose(session.agentPurpose);
    agent.on("agent_start", (context) => {
      const session = context.context;
      if (session && drives(session)) { session.activeRunContext = context; this.stateMachine.transition(session, { type: "AGENT_STARTED" }); }
    });
    agent.on("agent_end", (context) => {
      const session = context.context;
      if (!session || !drives(session)) return;
      if (session.activeRunContext !== undefined && session.activeRunContext !== context) return;
      session.activeRunContext = undefined;
      this.stateMachine.transition(session, { type: "AGENT_ENDED" });
    });
    agent.on("agent_tool_start", (context, tool, details) => {
      const call = details?.toolCall as { arguments?: string; callId?: string; name?: string } | undefined;
      if (call?.arguments) call.arguments = this.toolArgumentRewriteService.process(call.arguments);
      const id = typeof call?.callId === "string" ? call.callId : undefined, name = tool?.name || call?.name;
      if (id && typeof name === "string" && name) this.toolCallContext.enter(id, name);
      if (context.context && drives(context.context)) this.stateMachine.transition(context.context, { type: "TOOL_STARTED", toolName: name });
    });
    agent.on("agent_tool_end", (context) => {
      this.toolCallContext.clear();
      if (context.context && drives(context.context)) this.stateMachine.transition(context.context, { type: "TOOL_ENDED" });
    });
    agent.on("agent_handoff", (context) => {
      if (context.context && drives(context.context)) this.stateMachine.transition(context.context, { type: "AGENT_HANDOFF" });
    });
    return agent;
  }
}
