import type { HarnessSession } from "../sessions/session.js";
import type { HookMap } from "../hooks/session-hooks.js";

export type PluginInfo = { pluginName?: string; marketplaceName?: string; [key: string]: unknown };
export type ProductSkill = {
  name: string;
  instructions: string;
  displayName?: string | undefined;
  description?: string | undefined;
  baseDirectory?: string | undefined;
  allowedTools?: string[] | undefined;
  source?: string | undefined;
  location?: string | undefined;
  color?: string | undefined;
  skillId?: string | undefined;
  skillVersion?: string | undefined;
  disableModelInvocation?: boolean | undefined;
  userInvocable?: boolean | undefined;
  agentCreated?: boolean | undefined;
  context?: string | undefined;
  agent?: string | undefined;
  model?: string | undefined;
  hooks?: HookMap;
  pluginInfo?: PluginInfo;
};
export type ProductCommand = {
  name: string;
  prompt?: string | undefined;
  description?: string;
  argumentHint?: string;
  allowedTools?: string[];
  disableModelInvocation?: boolean;
  userInvocable?: boolean;
  tags?: string[];
  [key: string]: unknown;
};
export type CommandConfiguration = { skills?: readonly ProductSkill[]; commands?: readonly ProductCommand[] };
export interface CommandHost {
  isLocalCommand(name: string): boolean;
  parseCommand(command: string): { name: string; args: string[] } | undefined;
  executeLocalCommand(input: { name: string; session: HarnessSession; args: string[] }): Promise<unknown>;
  finalizeCommandExecution(session: HarnessSession): Promise<void>;
}
export type CommandToolResult = { content: string; error?: string; renderer?: { type: string; value?: string } };
