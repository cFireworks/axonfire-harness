import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import { extname } from "node:path";
import { resolveLSPFilePath } from "../lsp/lsp-path.js";
import { URI } from "vscode-uri";
import {
  noopLSPLogger,
  type LSPLogger,
  type LSPClientService,
  type LSPPosition,
} from "../lsp/lsp-types.js";
import type { LSPManagerImpl } from "../lsp/lsp-manager.js";
import type { ToolManager } from "./tool-manager.js";
export const lspParameters = z.object({
  operation: z
    .enum([
      "goToDefinition",
      "findReferences",
      "hover",
      "documentSymbol",
      "workspaceSymbol",
      "goToImplementation",
      "prepareCallHierarchy",
      "incomingCalls",
      "outgoingCalls",
    ])
    .describe("The LSP operation to perform"),
  filePath: z.string().describe("The absolute or relative path to the file"),
  line: z.coerce
    .number()
    .int()
    .min(1)
    .describe("The line number (1-based, as shown in editors)"),
  character: z.coerce
    .number()
    .int()
    .min(1)
    .describe("The character offset (1-based, as shown in editors)"),
});
export const lspJsonSchema = zodToJsonSchema(lspParameters as any);
export type LSPToolInput = z.infer<typeof lspParameters>;
export type LSPToolResult = { content: string; error?: string; title?: string };
/** Native 11992011..11997772; line/character are subtracted here, not in the client. */
export class LSPTool {
  readonly name = "LSP";
  readonly aliases = ["lsp", "read"];
  readonly description =
    "Interact with Language Server Protocol (LSP) servers to get code intelligence features.";
  readonly parameters = lspParameters;
  readonly MAX_RESULTS = 50;
  constructor(
    readonly lspManager: Pick<LSPManagerImpl, "getClientForFile">,
    readonly getWorkDir: () => string = () => process.cwd(),
    readonly logger: LSPLogger = noopLSPLogger,
    readonly resolveFilePathToWorkDir: (file: string) => string = (file) =>
      resolveLSPFilePath(file, getWorkDir()),
  ) {}
  async execute(
    input: LSPToolInput,
    _context?: unknown,
  ): Promise<LSPToolResult> {
    try {
      const file = this.resolveFilePathToWorkDir(input.filePath),
        uri = URI.file(file).toString(),
        position = { line: input.line - 1, character: input.character - 1 },
        client = await this.lspManager.getClientForFile(file);
      if (!client)
        return {
          content: `No LSP server configured for file type: ${extname(file)}`,
          error: "LSP server not available",
        };
      return await this.performOperation(
        client,
        input.operation,
        uri,
        position,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`LSP Tool error: ${message}`);
      return { content: message, error: `LSP operation failed: ${message}` };
    }
  }
  async performOperation(
    client: LSPClientService,
    operation: string,
    uri: string,
    position: LSPPosition,
  ): Promise<LSPToolResult> {
    switch (operation) {
      case "goToDefinition":
        return await this.goToDefinition(client, uri, position);
      case "findReferences":
        return await this.findReferences(client, uri, position);
      case "hover":
        return await this.hover(client, uri, position);
      case "documentSymbol":
        return await this.documentSymbol(client, uri);
      case "workspaceSymbol":
        return await this.workspaceSymbol(client, "");
      case "goToImplementation":
        return await this.goToImplementation(client, uri, position);
      case "prepareCallHierarchy":
        return await this.prepareCallHierarchy(client, uri, position);
      case "incomingCalls":
        return await this.callHierarchy(client, uri, position, "incoming");
      case "outgoingCalls":
        return await this.callHierarchy(client, uri, position, "outgoing");
      default:
        return {
          content: `Unknown operation: ${operation}`,
          error: "Invalid operation",
        };
    }
  }
  async goToDefinition(
    client: LSPClientService,
    uri: string,
    position: LSPPosition,
  ): Promise<LSPToolResult> {
    const results = await client.goToDefinition(uri, position);
    if (results.length === 0) return { content: "No definition found" };
    return {
      title: `Found ${results.length} definition(s)`,
      content: results
        .map(
          (item) =>
            `${URI.parse(item.uri).fsPath}:${item.range.start.line + 1}:${item.range.start.character + 1}`,
        )
        .join("\n"),
    };
  }
  async findReferences(
    client: LSPClientService,
    uri: string,
    position: LSPPosition,
  ): Promise<LSPToolResult> {
    const results = await client.findReferences(uri, position);
    if (results.length === 0) return { content: "No references found" };
    const truncated = results.length > this.MAX_RESULTS,
      content = (truncated ? results.slice(0, this.MAX_RESULTS) : results)
        .map(
          (item) =>
            `${URI.parse(item.uri).fsPath}:${item.range.start.line + 1}:${item.range.start.character + 1}`,
        )
        .join("\n"),
      suffix = truncated
        ? `\n\n<system-reminder data-role="tool-hint">Results truncated: showing ${this.MAX_RESULTS} of ${results.length} references</system-reminder>`
        : "";
    return {
      title: `Found ${results.length} reference(s)`,
      content: content + suffix,
    };
  }
  async hover(
    client: LSPClientService,
    uri: string,
    position: LSPPosition,
  ): Promise<LSPToolResult> {
    const result = await client.hover(uri, position);
    return result
      ? {
          title: "Hover Information",
          content:
            typeof result.contents === "string"
              ? result.contents
              : `\`\`\`${result.contents.language}\n${result.contents.value}\n\`\`\``,
        }
      : { content: "No hover information available" };
  }
  async documentSymbol(
    client: LSPClientService,
    uri: string,
  ): Promise<LSPToolResult> {
    const results = await client.documentSymbol(uri);
    if (results.length === 0)
      return { content: "No symbols found in document" };
    const truncated = results.length > this.MAX_RESULTS,
      selected = truncated ? results.slice(0, this.MAX_RESULTS) : results,
      suffix = truncated
        ? `\n\n<system-reminder data-role="tool-hint">Results truncated: showing ${this.MAX_RESULTS} of ${results.length} symbols</system-reminder>`
        : "";
    return {
      title: `Found ${results.length} symbol(s)`,
      content: this.formatSymbols(selected) + suffix,
    };
  }
  async workspaceSymbol(
    client: LSPClientService,
    query: string,
  ): Promise<LSPToolResult> {
    const results = await client.workspaceSymbol(query);
    if (results.length === 0)
      return { content: "No symbols found in workspace" };
    const truncated = results.length > this.MAX_RESULTS,
      content = (truncated ? results.slice(0, this.MAX_RESULTS) : results)
        .map(
          (item) =>
            `${item.name} [${this.getSymbolKindName(item.kind)}] - ${URI.parse(item.location.uri).fsPath}:${item.location.range.start.line + 1}`,
        )
        .join("\n"),
      suffix = truncated
        ? `\n\n<system-reminder data-role="tool-hint">Results truncated: showing ${this.MAX_RESULTS} of ${results.length} symbols</system-reminder>`
        : "";
    return {
      title: `Found ${results.length} symbol(s)`,
      content: content + suffix,
    };
  }
  async goToImplementation(
    client: LSPClientService,
    uri: string,
    position: LSPPosition,
  ): Promise<LSPToolResult> {
    const results = await client.goToImplementation(uri, position);
    if (results.length === 0) return { content: "No implementations found" };
    return {
      title: `Found ${results.length} implementation(s)`,
      content: results
        .map(
          (item) =>
            `${URI.parse(item.uri).fsPath}:${item.range.start.line + 1}:${item.range.start.character + 1}`,
        )
        .join("\n"),
    };
  }
  async prepareCallHierarchy(
    client: LSPClientService,
    uri: string,
    position: LSPPosition,
  ): Promise<LSPToolResult> {
    const results = await client.prepareCallHierarchy(uri, position);
    return results.length === 0
      ? { content: "No call hierarchy available at this position" }
      : {
          title: "Call Hierarchy Items",
          content: results
            .map(
              (item) =>
                `${item.name} [${this.getSymbolKindName(item.kind)}] - ${URI.parse(item.uri).fsPath}:${item.range.start.line + 1}`,
            )
            .join("\n"),
        };
  }
  async callHierarchy(
    client: LSPClientService,
    uri: string,
    position: LSPPosition,
    direction: string,
  ): Promise<LSPToolResult> {
    const prepared = await client.prepareCallHierarchy(uri, position);
    if (prepared.length === 0)
      return { content: "No call hierarchy available at this position" };
    const first = prepared[0],
      results =
        direction === "incoming"
          ? await client.incomingCalls(first)
          : await client.outgoingCalls(first);
    if (results.length === 0) return { content: `No ${direction} calls found` };
    const truncated = results.length > this.MAX_RESULTS,
      content = (truncated ? results.slice(0, this.MAX_RESULTS) : results)
        .map((item) => {
          const target = direction === "incoming" ? item.from : item.to;
          return `${target.name} [${this.getSymbolKindName(target.kind)}] - ${URI.parse(target.uri).fsPath}:${target.range.start.line + 1}`;
        })
        .join("\n"),
      suffix = truncated
        ? `\n\n<system-reminder data-role="tool-hint">Results truncated: showing ${this.MAX_RESULTS} of ${results.length} ${direction} calls</system-reminder>`
        : "";
    return {
      title: `Found ${results.length} ${direction} call(s)`,
      content: content + suffix,
    };
  }
  formatSymbols(symbols: any[]): string {
    return symbols
      .map((item) => {
        if ("location" in item)
          return `${item.name} [${this.getSymbolKindName(item.kind)}] - ${URI.parse(item.location.uri).fsPath}:${item.location.range.start.line + 1}`;
        return `${item.detail ? `${item.detail} ` : ""}${item.name} [${this.getSymbolKindName(item.kind)}] - Line ${item.range.start.line + 1}`;
      })
      .join("\n");
  }
  getSymbolKindName(kind: number): string {
    return (
      [
        "File",
        "Module",
        "Namespace",
        "Package",
        "Class",
        "Method",
        "Property",
        "Field",
        "Constructor",
        "Enum",
        "Interface",
        "Function",
        "Variable",
        "Constant",
        "String",
        "Number",
        "Boolean",
        "Array",
        "Object",
        "Key",
        "Null",
        "EnumMember",
        "Struct",
        "Event",
        "Operator",
        "TypeParameter",
      ][kind - 1] || "Unknown"
    );
  }
  register(tools: ToolManager): void {
    tools.register(this.name, {
      parameters: lspJsonSchema,
      parseInput: false,
      aliases: this.aliases,
      execute: (input, context) => this.execute(input as LSPToolInput, context),
    });
  }
}
