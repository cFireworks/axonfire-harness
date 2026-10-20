import { Ajv, type ValidateFunction } from "ajv";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { StructuredOutputContextFactory } from "../structured-output/structured-output-context.js";
import type { ToolManager } from "./tool-manager.js";

export const DEFAULT_STRUCTURED_OUTPUT_PARAMETERS = { type: "object", properties: { data: { type: "object", description: "The structured data object that matches the requested JSON schema.", additionalProperties: true } }, required: ["data"], additionalProperties: false };
/** Source 11998971..12000593; dynamic schema/compiled validator identity and fallback are intentional. */
export class StructuredOutputTool {
  readonly name = "StructuredOutput";
  readonly needsApproval = false;
  private readonly ajv = new Ajv({ allErrors: true });
  private compiledValidator: ValidateFunction | undefined;
  private currentSchema: unknown;
  constructor(private readonly current: () => HarnessSession | undefined, private readonly contexts: StructuredOutputContextFactory, private readonly logger: { error(message: string): void } = { error() {} }) {}
  parameters = async (): Promise<Record<string, unknown>> => {
    const raw = this.current()?.options.jsonSchema;
    if (raw) try {
      const schema = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!this.ajv.validateSchema(schema)) throw new Error(`Invalid JSON Schema: ${this.ajv.errorsText(this.ajv.errors)}`);
      if (this.currentSchema !== raw) { this.compiledValidator = this.ajv.compile(schema); this.currentSchema = raw; }
      return schema;
    } catch (error) { this.logger.error(`Failed to parse JSON Schema: ${error}`); }
    this.compiledValidator = undefined; this.currentSchema = undefined; return structuredClone(DEFAULT_STRUCTURED_OUTPUT_PARAMETERS);
  };
  isEnabled(session: HarnessSession): boolean { return Boolean(session.options.jsonSchema); }
  async execute(input: any, context?: RunContext<HarnessSession>): Promise<{ content: string; error?: string; renderer?: { type: "text" } }> {
    const session = context?.context;
    if (!session) return { content: "Error: No session context available", error: "No session context" };
    const schema = session.options.jsonSchema;
    if (schema && this.compiledValidator && !this.compiledValidator(input)) {
      const errors = this.compiledValidator.errors?.map((error) => `${error.instancePath || "root"}: ${error.message}`).join(", ");
      return { content: `Output does not match required schema: ${errors}`, error: `Schema validation failed: ${errors}` };
    }
    const output = schema ? input : input.data ?? input;
    this.contexts.get(session)?.setOutput(output); session.structuredOutput = output;
    return { content: "Structured output captured successfully", renderer: { type: "text" } };
  }
  register(manager: ToolManager): void { manager.register(this.name, { parameters: this.parameters, parseInput: false, needsApproval: this.needsApproval, isEnabled: (session) => this.isEnabled(session), execute: (input, context) => this.execute(input, context) }); }
}
