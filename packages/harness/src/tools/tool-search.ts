import MiniSearch from "minisearch";
import { z } from "zod";
import type { HarnessSession } from "../sessions/session.js";
import {
  ToolDeferOverlay,
  type ToolDeferOverlayValue,
} from "./tool-defer-overlay.js";

export const TOOL_SEARCH_DEFAULT_TOP_K = 5;
export const TOOL_SEARCH_FULL_DETAILS_DEFAULT = 3;
export const TOOL_SEARCH_MAX_TOP_K = 20;
export const TOOL_SEARCH_ADDITIONAL_DETAIL_LIMIT = 10;
export const TOOL_SEARCH_DEFAULT_MAX_OUTPUT_CHARS = 30_000;
export const TOOL_SEARCH_MAX_OUTPUT_ENV =
  "CODEBUDDY_TOOL_SEARCH_MAX_OUTPUT_CHARS";

export type JsonSchema = Record<string, unknown>;

export type DeferredToolDefinition = {
  name: string;
  description: string;
  summary?: string;
  parameters?: JsonSchema;
  defer_loading?: boolean;
  isBare?: boolean;
  serverName?: string;
  rawToolName?: string;
  shouldShow?: () => boolean;
};

export type ToolSearchHit = {
  name: string;
  description: string;
  score: number;
};

export type ToolSearchOptions = {
  allowedTools?: readonly string[];
  overlay?: ToolDeferOverlay | ToolDeferOverlayValue;
};

export type ToolSearchExecutionContext = {
  session: HarnessSession;
  allowedTools?: readonly string[];
  agentOverlay?: ToolDeferOverlay | ToolDeferOverlayValue;
  ensureBuiltinDeferIndexed?: (name: string) => void | Promise<void>;
};

const stringArrayFromString = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // WorkBuddy deliberately falls through and treats malformed JSON as text.
    }
  }
  return [trimmed];
};

export const toolSearchParameters = z.object({
  queries: z
    .preprocess(stringArrayFromString, z.array(z.string()))
    .optional()
    .describe(
      'Keyword-based search query using MiniSearch full-text search engine. Supports prefix matching, fuzzy matching, and relevance ranking. Must be an array of keyword strings.For better results, include BOTH Chinese and English keywords (e.g., ["获取时间", "get time"] or ["文件搜索", "file search", "glob"]).',
    ),
  tool_names: z
    .preprocess(stringArrayFromString, z.array(z.string()))
    .optional()
    .describe(
      'Exact, fully-qualified tool name(s) to look up — e.g., ["mcp__time__current_time", "LSP", "mcp__cnb__cnb_create_pull"]. Do NOT use partial names, descriptions, or keywords.',
    ),
  top_k: z
    .coerce.number()
    .int()
    .positive()
    .max(TOOL_SEARCH_MAX_TOP_K)
    .default(TOOL_SEARCH_FULL_DETAILS_DEFAULT)
    .describe(
      'Maximum number of tools to return with full details (default: 3, max: 20). Only applies when using "queries". Ignored when using "tool_names". Additional matching tools beyond this limit are shown as additional candidates.',
    ),
});

export type ToolSearchInput = z.infer<typeof toolSearchParameters>;

export class ToolSearchService {
  private readonly deferredTools = new Map<string, DeferredToolDefinition>();
  private readonly toolVisibilityChecks = new Map<string, () => boolean>();
  private readonly miniSearch = new MiniSearch<{
    id: string;
    name: string;
    description: string;
  }>({
    fields: ["name", "description"],
    storeFields: ["name", "description"],
  });
  private initialized = false;

  async initialize(): Promise<void> {
    if (!this.initialized) this.initialized = true;
  }

  isReady(): boolean {
    return this.initialized;
  }

  async indexTool(tool: DeferredToolDefinition): Promise<void> {
    if (!tool.defer_loading) return;
    await this.initialize();
    try {
      if (this.deferredTools.has(tool.name)) this.miniSearch.discard(tool.name);
      this.miniSearch.add({
        id: tool.name,
        name: tool.name,
        description: tool.description,
      });
      this.deferredTools.set(tool.name, {
        name: tool.name,
        description: tool.description,
        ...(tool.summary === undefined ? {} : { summary: tool.summary }),
        ...(tool.parameters === undefined ? {} : { parameters: tool.parameters }),
        ...(tool.isBare === undefined ? {} : { isBare: tool.isBare }),
        ...(tool.serverName === undefined ? {} : { serverName: tool.serverName }),
        ...(tool.rawToolName === undefined
          ? {}
          : { rawToolName: tool.rawToolName }),
        defer_loading: true,
      });
      if (tool.shouldShow) this.toolVisibilityChecks.set(tool.name, tool.shouldShow);
    } catch {
      // Original implementation logs and leaves the rest of the index usable.
    }
  }

  async search(
    query: string | readonly string[],
    topK = TOOL_SEARCH_DEFAULT_TOP_K,
    options?: ToolSearchOptions,
  ): Promise<ToolSearchHit[]> {
    await this.initialize();
    if (this.deferredTools.size === 0) return [];
    try {
      let results = this.doSearch(this.getVisibleTools(), query, topK);
      if (options?.allowedTools !== undefined) {
        const allowed = new Set(options.allowedTools);
        results = results.filter((item) =>
          this.isAllowedByAgentTools(item.name, allowed),
        );
      }
      const overlay = ToolDeferOverlay.fromSnapshot(options?.overlay);
      if (!overlay.isEmpty()) {
        results = results.filter(
          (item) => !this.isHiddenByOverlay(item.name, overlay),
        );
      }
      return results;
    } catch {
      return [];
    }
  }

  isHiddenByOverlay(
    name: string,
    overlay?: ToolDeferOverlay | ToolDeferOverlayValue,
  ): boolean {
    const runtime = ToolDeferOverlay.fromSnapshot(overlay);
    return !runtime.isEmpty() && runtime.matchesForceNoDefer(name);
  }

  describe(name: string): DeferredToolDefinition | undefined {
    return this.deferredTools.get(name);
  }

  isBareTool(name: string): boolean {
    return this.deferredTools.get(name)?.isBare === true;
  }

  getDeferredToolsSummary(options?: {
    overlay?: ToolDeferOverlay | ToolDeferOverlayValue;
    filterByAgentTools?: readonly string[];
  }): Array<{ name: string; summary?: string }> {
    let tools = [...this.deferredTools.values()].filter((tool) =>
      this.isToolVisible(tool.name),
    );
    const overlay = ToolDeferOverlay.fromSnapshot(options?.overlay);
    if (!overlay.isEmpty()) {
      tools = tools.filter(
        (tool) => !this.isHiddenByOverlay(tool.name, overlay),
      );
    }
    if (!options?.filterByAgentTools) {
      return tools.map(({ name, summary }) =>
        summary === undefined ? { name } : { name, summary },
      );
    }
    const allowed = new Set(
      options.filterByAgentTools.map((name) => name.toLowerCase()),
    );
    return tools
      .filter((tool) => this.isAllowedByAgentTools(tool.name, allowed))
      .map(({ name, summary }) =>
        summary === undefined ? { name } : { name, summary },
      );
  }

  clearIndex(): void {
    this.miniSearch.removeAll();
    this.deferredTools.clear();
    this.toolVisibilityChecks.clear();
  }

  removeToolsByServer(serverName: string): void {
    const prefix = `mcp__${serverName}__`;
    const names = [...this.deferredTools].flatMap(([name, tool]) =>
      name.startsWith(prefix) || tool.serverName === serverName ? [name] : [],
    );
    for (const name of names) {
      try {
        this.miniSearch.discard(name);
      } catch {
        // Stale MiniSearch entries are harmless after the maps are cleared.
      }
      this.deferredTools.delete(name);
      this.toolVisibilityChecks.delete(name);
    }
  }

  getSessionAllowedTools(session: HarnessSession | undefined): string[] | undefined {
    const tools = session?.options?.tools;
    if (typeof tools !== "string" || tools.length === 0 || tools === "default") {
      return undefined;
    }
    const values = tools
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    return values.length > 0 ? values : undefined;
  }

  intersectAllowedTools(
    agentTools: readonly string[] | undefined,
    sessionTools: readonly string[] | undefined,
  ): string[] | undefined {
    if (!agentTools) return sessionTools ? [...sessionTools] : undefined;
    if (!sessionTools) return [...agentTools];
    const sessionSet = new Set(sessionTools.map((name) => name.toLowerCase()));
    return agentTools.filter((name) => sessionSet.has(name.toLowerCase()));
  }

  private isToolVisible(name: string): boolean {
    const check = this.toolVisibilityChecks.get(name);
    return !check || check();
  }

  private getVisibleTools(): Map<
    string,
    { name: string; description: string }
  > {
    const result = new Map<string, { name: string; description: string }>();
    for (const [name, tool] of this.deferredTools) {
      if (this.isToolVisible(name)) {
        result.set(name, { name: tool.name, description: tool.description });
      }
    }
    return result;
  }

  private isAllowedByAgentTools(
    name: string,
    allowedTools: ReadonlySet<string>,
  ): boolean {
    return (
      name.startsWith("mcp__") ||
      this.isBareTool(name) ||
      allowedTools.has(name) ||
      allowedTools.has(name.toLowerCase())
    );
  }

  private doSearch(
    visible: ReadonlyMap<string, { name: string; description: string }>,
    query: string | readonly string[],
    topK: number,
  ): ToolSearchHit[] {
    if (visible.size === 0) return [];
    const queries = Array.isArray(query) ? query : [query];
    const best = new Map<string, ToolSearchHit>();
    for (const value of queries) {
      if (!value || value.trim().length === 0) continue;
      for (const result of this.miniSearch.search(value, {
        prefix: true,
        combineWith: "OR",
        boost: { name: 2 },
      })) {
        const id = String(result.id);
        if (!visible.has(id)) continue;
        const previous = best.get(id);
        if (!previous || result.score > previous.score) {
          best.set(id, {
            name: id,
            description:
              (typeof result.description === "string"
                ? result.description
                : undefined) ??
              visible.get(id)?.description ??
              "",
            score: result.score,
          });
        }
      }
    }
    return [...best.values()]
      .sort((left, right) => right.score - left.score)
      .slice(0, topK);
  }
}

export class ToolSearchTool {
  readonly name = "ToolSearch";
  readonly parameters = toolSearchParameters;
  readonly needsApproval = false;
  readonly maxOutputChars: number;

  constructor(readonly service: ToolSearchService) {
    this.maxOutputChars = this.initMaxOutputChars();
  }

  async execute(
    input: ToolSearchInput,
    context: ToolSearchExecutionContext,
  ): Promise<{ content: string; error?: string }> {
    const { queries, tool_names: toolNames, top_k: topK = 3 } = input;
    await this.ensureForceDeferIndexed(context, toolNames);
    try {
      const result =
        toolNames && toolNames.length > 0
          ? await this.executeLookupMode(toolNames, context)
          : queries
            ? await this.executeSearchMode(queries, topK, context)
            : {
                content:
                  'Provide either "queries" (keywords to search) or "tool_names" (exact names to look up).',
              };
      return { ...result, content: this.truncateOutput(result.content) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: `Tool search failed: ${message}`, error: message };
    }
  }

  private async executeSearchMode(
    queries: string[],
    topK: number,
    context: ToolSearchExecutionContext,
  ): Promise<{ content: string }> {
    const allowedTools = this.service.intersectAllowedTools(
      context.allowedTools,
      this.service.getSessionAllowedTools(context.session),
    );
    const overlay = ToolDeferOverlay.fromSnapshot(
      ToolDeferOverlay.merge(
        context.session.options.toolDeferOverlay,
        context.agentOverlay,
      ),
    );
    const results = await this.service.search(queries, Infinity, {
      ...(allowedTools === undefined ? {} : { allowedTools }),
      overlay,
    });
    if (results.length === 0) {
      return {
        content:
          "No matching tools found. Try different search queries or be more specific about what you want to do.",
      };
    }
    const detailed = results.slice(0, topK).map((result) => {
      const toolInfo = this.service.describe(result.name);
      return {
        ...result,
        ...(toolInfo === undefined ? {} : { toolInfo }),
      };
    });
    return {
      content: this.formatSearchResults(detailed, results.slice(topK)),
    };
  }

  private async executeLookupMode(
    names: string[],
    context: ToolSearchExecutionContext,
  ): Promise<{ content: string }> {
    if (names.every((name) => !name.trim())) {
      return {
        content:
          'No tool names provided. Provide exact tool name(s) in the "tool_names" parameter.',
      };
    }
    const allowedTools = this.service.intersectAllowedTools(
      context.allowedTools,
      this.service.getSessionAllowedTools(context.session),
    );
    const allowed = allowedTools ? new Set(allowedTools) : undefined;
    const overlay = ToolDeferOverlay.fromSnapshot(
      ToolDeferOverlay.merge(
        context.session.options.toolDeferOverlay,
        context.agentOverlay,
      ),
    );
    const found: DeferredToolDefinition[] = [];
    const missed: string[] = [];
    for (const value of names) {
      const name = value.trim();
      if (!name) continue;
      if (this.service.isHiddenByOverlay(name, overlay)) {
        missed.push(name);
        continue;
      }
      const tool = this.service.describe(name);
      if (!tool) {
        missed.push(name);
        continue;
      }
      const bypass = name.startsWith("mcp__") || this.service.isBareTool(name);
      if (
        !allowed ||
        bypass ||
        allowed.has(name) ||
        allowed.has(name.toLowerCase())
      ) {
        found.push(tool);
      } else {
        missed.push(name);
      }
    }
    const notFound: string[] = [];
    if (missed.length > 0) {
      const namesAlreadyFound = new Set(found.map((tool) => tool.name));
      const fallbacks = await Promise.all(
        missed.map((name) =>
          this.service.search(name, 1, {
            ...(allowedTools === undefined ? {} : { allowedTools }),
            overlay,
          }),
        ),
      );
      for (let index = 0; index < missed.length; index += 1) {
        const hit = fallbacks[index]?.[0];
        if (hit && !namesAlreadyFound.has(hit.name)) {
          const tool = this.service.describe(hit.name);
          if (tool) {
            found.push(tool);
            namesAlreadyFound.add(hit.name);
          }
        } else if (!hit) {
          const value = missed[index];
          if (value !== undefined) notFound.push(value);
        }
      }
    }
    return found.length === 0
      ? {
          content: `No matching tools found for: ${notFound.join(", ")}. Try using "queries" with keywords to search for available tools.`,
        }
      : { content: this.formatLookupResults(found, notFound) };
  }

  formatSearchResults(
    detailed: Array<ToolSearchHit & { toolInfo?: DeferredToolDefinition }>,
    additional: ToolSearchHit[],
  ): string {
    const lines: string[] = [];
    if (additional.length === 0) {
      lines.push(
        `Found ${detailed.length} matching tool(s). Use DeferExecuteTool to invoke them.`,
      );
    } else {
      lines.push(
        `Found ${detailed.length} tool(s) with full details and ${additional.length} additional candidate(s).`,
      );
    }
    for (const result of detailed) {
      lines.push("", `## ${result.name}`, result.description);
      if (result.toolInfo?.parameters) {
        lines.push(
          `\nParameters:\n\`\`\`json\n${JSON.stringify(result.toolInfo.parameters, null, 2)}\n\`\`\``,
        );
      }
    }
    if (additional.length > 0) {
      lines.push(
        '\nAdditional candidates (use ToolSearch with "tool_names" to get full details):',
      );
      for (let index = 0; index < additional.length; index += 1) {
        const result = additional[index];
        if (!result) continue;
        if (index < TOOL_SEARCH_ADDITIONAL_DETAIL_LIMIT) {
          const description =
            result.description.length > 80
              ? `${result.description.slice(0, 77)}...`
              : result.description;
          lines.push(`- ${result.name}: ${description}`);
        } else {
          lines.push(`- ${result.name}`);
        }
      }
    }
    return lines.join("\n");
  }

  formatLookupResults(
    tools: readonly DeferredToolDefinition[],
    notFound: readonly string[],
  ): string {
    const lines: string[] = [];
    if (tools.length > 0) {
      lines.push(
        `Found ${tools.length} tool(s). Use DeferExecuteTool to invoke them.`,
      );
      for (const tool of tools) {
        lines.push("", `## ${tool.name}`, tool.description);
        if (tool.parameters) {
          lines.push(
            `\nParameters:\n\`\`\`json\n${JSON.stringify(tool.parameters, null, 2)}\n\`\`\``,
          );
        }
      }
    }
    if (notFound.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push(
        `Not found (${notFound.length}). Ensure you are using the exact, fully-qualified tool name:`,
      );
      for (const name of notFound) lines.push(`- ${name}`);
    }
    return lines.join("\n");
  }

  private async ensureForceDeferIndexed(
    context: ToolSearchExecutionContext,
    requestedNames: string[] | undefined,
  ): Promise<void> {
    const overlay = ToolDeferOverlay.fromSnapshot(
      ToolDeferOverlay.merge(
        context.session.options.toolDeferOverlay,
        context.agentOverlay,
      ),
    );
    if (overlay.isEmpty()) return;
    const names =
      requestedNames && requestedNames.length > 0
        ? requestedNames.filter((name) =>
            overlay.matchesForceDefer(name.trim()),
          )
        : overlay.listForceDeferExact();
    for (const value of names) {
      const name = value.trim();
      if (name) await context.ensureBuiltinDeferIndexed?.(name);
    }
  }

  private initMaxOutputChars(): number {
    const value = process.env[TOOL_SEARCH_MAX_OUTPUT_ENV];
    if (value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return TOOL_SEARCH_DEFAULT_MAX_OUTPUT_CHARS;
  }

  private truncateOutput(value: string): string {
    if (value.length <= this.maxOutputChars) return value;
    return `${value.slice(0, this.maxOutputChars)}\n\n... [Output truncated: exceeded ${this.maxOutputChars} character limit. Use more specific queries or tool_names to narrow results.]`;
  }
}
