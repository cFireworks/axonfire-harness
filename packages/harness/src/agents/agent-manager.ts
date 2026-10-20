import type { Agent } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { ProductAgent, ProductModel } from "../config/types.js";
import type { ProductConfiguration } from "../config/product-config.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import type { ToolManager } from "../tools/tool-manager.js";
import type { McpRegistry } from "../mcp/mcp-registry.js";
import type { AgentFactory } from "./agent-factory.js";
import type { CommandManager } from "../commands/command-manager.js";
import type { ProductCommand } from "../commands/types.js";
import { AgentManagerImpl } from "./native-agent-manager.js";
import {
  StandaloneAgentManagerHost,
  type AgentManagerHostOptions,
} from "./standalone-agent-manager-host.js";
export type AgentBuildContext = {
  session?: HarnessSession;
  permissions?: { deny?: string[] };
  cliDescription?: string;
  outputStyle?: string;
  keepCodingInstructions?: boolean;
};
/** Legacy constructor convenience only; all manager decisions are the native implementation. Call start() after host registration. */
export class AgentManager extends AgentManagerImpl {
  readonly standaloneHost: StandaloneAgentManagerHost;
  constructor(
    product: ProductConfiguration,
    prompts: ProductPromptRenderer,
    tools: ToolManager,
    mcp: McpRegistry,
    factory?: AgentFactory,
    options: AgentManagerHostOptions = {},
  ) {
    const host = new StandaloneAgentManagerHost(
      product,
      prompts,
      tools,
      mcp,
      factory,
      options,
    );
    super(host.runtime);
    this.standaloneHost = host;
    host.core = this;
  }
  attachCommandManager(
    manager: Pick<
      CommandManager,
      "get" | "getCustomCommands" | "getMcpCommands"
    >,
  ): void {
    this.standaloneHost.commands = manager;
  }
  start(): Promise<void> {
    return this.standaloneHost.start();
  }
  close(): Promise<void> {
    return this.standaloneHost.close();
  }
  override getDefaultAgentName(): string {
    return super.getDefaultAgentName();
  }
  override getDefault(
    _context: AgentBuildContext = {},
  ): Promise<Agent<HarnessSession>> {
    return super.getDefault();
  }
  override get(
    name: string,
    _context: AgentBuildContext = {},
  ): Promise<Agent<HarnessSession> | undefined> {
    return super.get(name);
  }
  override getAll(
    _context: AgentBuildContext = {},
  ): Promise<Agent<HarnessSession>[]> {
    return super.getAll();
  }
  override getAgentConfig(name: string): Promise<ProductAgent | undefined> {
    return super.getAgentConfig(name);
  }
  override refreshAgentTools(
    name: string,
    _context: AgentBuildContext = {},
  ): Promise<void> {
    return super.refreshAgentTools(name);
  }
  override ensureAgentToolsFreshForRun(
    name: string,
    session: HarnessSession,
    signal?: AbortSignal,
    managed?: Agent<HarnessSession>,
  ): Promise<void> {
    return super.ensureAgentToolsFreshForRun(name, session, signal, managed);
  }
  override getModels(name: string): Promise<ProductModel[]> {
    return super.getModels(name);
  }
  override getModel(name: string): Promise<ProductModel> {
    return super.getModel(name);
  }
  override getRelatedModel(
    name: string,
    variant: "lite" | "reasoning",
  ): Promise<ProductModel> {
    return super.getRelatedModel(name, variant);
  }
  override resolveModel(value: string): Promise<ProductModel | undefined> {
    return super.resolveModel(value);
  }
  override resolveConfiguredModelOrFallback(
    value?: string,
    source?: string,
  ): Promise<string | undefined> {
    return super.resolveConfiguredModelOrFallback(value, source);
  }
  override getCommands(name: string): Promise<ProductCommand[]> {
    return super.getCommands(name);
  }
}
