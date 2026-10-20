import { Emitter } from "vscode-jsonrpc";
import { NativeAgentPermissionUtils } from "./native-agent-permission-utils.js";
import { AgentToolDeferOverlayCacheImpl } from "../tools/native-tool-specs.js";
import { ToolNames } from "../tools/tool-names.js";
export { Emitter as NativeEmitter };
/** Framework dependency boundary: native Deferred is a single promise with exposed resolvers. */
export class NativeDeferred<T = any> {
  promise: Promise<T>;
  resolve!: (value?: T) => void;
  reject!: (error?: any) => void;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve as any;
      this.reject = reject;
    });
  }
}
export const agentManagerPermissionUtils = NativeAgentPermissionUtils;
export const agentManagerConstants = {
  CLI_AGENT_TAG: "cli",
  CUSTOM_AGENT_TAG: "custom",
  PLUGIN_AGENT_TAG: "plugin",
  AGENTS_WITH_MCP_ACCESS: new Set(["general-purpose", "Explore"]),
  INTERNAL_GENERATOR_AGENTS: new Set([
    "compact",
    "contextSummary",
    "contentAnalyzer",
    "terminalTitleGenerator",
    "promptSuggestion",
    "summaryGenerator",
    "promptHookEvaluator",
    "insightsAnalyzer",
    "memorySelector",
    "agentInstructions",
    "autoModeClassifier",
  ]),
  OutputStyleType: {
    DEFAULT: "default",
    EXPLANATORY: "explanatory",
    LEARNING: "learning",
  },
  CLI_OUTPUT_STYLE_DESCRIPTION_TEMPLATE: "cli-output-style-description",
};
export const agentManagerToolNames = {
  ToolNames,
};
export function createAgentManagerPlanGates(
  env: NodeJS.ProcessEnv = process.env,
) {
  const isPlanModeDisabled = () => {
    const value = env.CODEBUDDY_DISABLE_PLAN_MODE;
    return (
      !!value && ["1", "true", "yes", "on"].includes(value.toLowerCase().trim())
    );
  };
  return {
    isPlanModeDisabled,
    isExitPlanModeVisibleForSession: (session: any) =>
      !isPlanModeDisabled() &&
      (!session.meta?.parentSessionId ||
        (session.permissionModeSubject?.value === "plan" &&
          session.meta?.subAgentPlanModeLocked === true)),
  };
}
export const agentManagerPlanGates = createAgentManagerPlanGates();
export type AgentManagerRuntime = {
  dependencies: Record<string, any>;
  env: NodeJS.ProcessEnv;
  now(): number;
  setTimeout(callback: () => void, ms: number): any;
  clearTimeout(timer: any): void;
  getProfiler(): any;
  hasDelegateTools(): boolean;
  composePluginAgent(input: any): any;
  planGates: ReturnType<typeof createAgentManagerPlanGates>;
};
export function createAgentManagerRuntime(
  dependencies: Record<string, any>,
  options: Partial<Omit<AgentManagerRuntime, "dependencies">> = {},
): AgentManagerRuntime {
  const env = options.env ?? process.env;
  return {
    dependencies: {
      logger: { debug() {}, info() {}, warn() {}, error() {} },
      agentToolDeferOverlayCache: new AgentToolDeferOverlayCacheImpl(),
      ...dependencies,
    },
    env,
    now: Date.now,
    setTimeout,
    clearTimeout,
    getProfiler: () => undefined,
    hasDelegateTools: () => false,
    composePluginAgent: () => {
      throw Error("Plugin composition requires an explicit runtime dependency");
    },
    planGates: createAgentManagerPlanGates(env),
    ...options,
  };
}
