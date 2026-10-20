import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { DelegateToolManagerImpl } from "../delegate/delegate-tool-manager.js";
import type { ToolManager } from "./tool-manager.js";
export const DELEGATE_TOOL_DESCRIPTION =
  "Execute a tool delegated from an external client-side tool provider (e.g., IDE extension). This tool is automatically registered when delegate tools are available.";
export const delegateToolParameters = z.object({
  toolId: z.string().describe("The ID of the delegate tool to execute"),
  input: z.record(z.any()).describe("Input parameters for the tool"),
  timeout: z.number().optional().describe("Execution timeout in milliseconds"),
});
// Alias preserves the sample's Zod 3 semantics alongside the SDK's Zod 4.
export const delegateToolJsonSchema = zodToJsonSchema(
  delegateToolParameters as any,
);
export type DelegateToolInput = z.infer<typeof delegateToolParameters>;
/** Native 12067549..12068556; ToolResult.from wraps its argument in content. */
export class DelegateToolImpl {
  readonly name = "DelegateTool";
  readonly description = DELEGATE_TOOL_DESCRIPTION;
  readonly parameters = delegateToolParameters;
  readonly needsApproval = true;
  readonly isEnabled = true;
  constructor(
    readonly getManager: () =>
      | Pick<DelegateToolManagerImpl, "executeTool">
      | undefined,
  ) {}
  async execute(input: DelegateToolInput, context?: unknown): Promise<any> {
    if (!context)
      return { content: { error: "No execution context provided" } };
    try {
      const manager = this.getManager();
      if (!manager)
        return {
          content: {
            error:
              "DelegateToolManager not available - ACP connection may be offline",
          },
        };
      const result = await manager.executeTool(
        input.toolId,
        input.input,
        input.timeout,
      );
      return { content: { content: result.output || result } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: {
          error: `Failed to execute delegate tool: ${message}`,
          content: { error: message, toolId: input.toolId },
        },
      };
    }
  }
  extractRawResponse(result: any): any {
    return (
      typeof result.content === "object" && result.content,
      result.content
    );
  }
  register(tools: ToolManager): void {
    tools.register(this.name, {
      parameters: delegateToolJsonSchema,
      parseInput: false,
      needsApproval: true,
      execute: (input, context) =>
        this.execute(input as DelegateToolInput, context),
    });
  }
}
