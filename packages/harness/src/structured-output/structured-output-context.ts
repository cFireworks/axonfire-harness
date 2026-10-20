import type { AgentInputItem } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";

export const DEFAULT_STRUCTURED_OUTPUT_MAX_RETRIES = 4;
export const STRUCTURED_OUTPUT_FEEDBACK_TEMPLATE = "You MUST call the StructuredOutput tool to complete this request.\nThe tool parameters must match this JSON Schema:\n\n{schema}\n\nCall the StructuredOutput tool now with the appropriate data.";
export class StructuredOutputContext {
  enabled = true;
  retryCount = 0;
  maxRetries = DEFAULT_STRUCTURED_OUTPUT_MAX_RETRIES;
  output: unknown;
  schemaString?: string | object;
  readonly completionDeferred: { promise: Promise<void>; resolve(): void };
  constructor(schema?: string | object) { let resolve!: () => void; const promise = new Promise<void>((done) => { resolve = done; }); this.completionDeferred = { promise, resolve }; if (schema) this.schemaString = schema; }
  markComplete(): void { this.completionDeferred.resolve(); }
  setOutput(output: unknown): void { this.output = output; }
  incrementRetry(): boolean { this.retryCount++; return this.retryCount < this.maxRetries; }
  hasOutput(): boolean { return this.output !== undefined; }
}
export class StructuredOutputContextFactory {
  private readonly contexts = new WeakMap<HarnessSession, StructuredOutputContext>();
  getOrCreate(session: HarnessSession, schema?: string | object): StructuredOutputContext { let context = this.contexts.get(session); if (!context) { context = new StructuredOutputContext(schema); this.contexts.set(session, context); } return context; }
  get(session: HarnessSession): StructuredOutputContext | undefined { return this.contexts.get(session); }
  dispose(session: HarnessSession): void { const context = this.contexts.get(session); if (context) { context.markComplete(); this.contexts.delete(session); } }
}
export type StructuredOutputHookLogger = { info?(message: string): void; warn?(message: string): void; error?(message: string): void };
export class StructuredOutputSessionStartHook {
  readonly event = "SessionStart";
  readonly priority = 200;
  constructor(private readonly factory: StructuredOutputContextFactory, private readonly completionWaiter?: { registerCompletion(session: HarnessSession, completion: Promise<void>): void }, private readonly logger: StructuredOutputHookLogger = {}) {}
  async execute({ session }: { session?: HarnessSession }): Promise<{ allowed: false; message: string } | undefined> {
    if (!session) return;
    const schema = session.options.jsonSchema;
    if (!schema) return;
    const format = session.options.outputFormat;
    if (!format || !["json", "stream-json"].includes(String(format))) { this.logger.warn?.("--json-schema requires --output-format json or stream-json"); return; }
    try {
      const parsed = typeof schema === "string" ? JSON.parse(schema) : schema;
      if (typeof parsed !== "object" || parsed === null) throw new Error("Schema must be a valid JSON object");
      if (parsed.type !== "object") this.logger.warn?.('JSON Schema should have type "object" at root level');
    } catch (error) { const message = error instanceof Error ? error.message : String(error); this.logger.error?.(`Invalid JSON Schema: ${message}`); return { allowed: false, message: `Invalid JSON Schema: ${message}` }; }
    if (!this.factory.get(session)) { const context = this.factory.getOrCreate(session, schema as string | object); this.completionWaiter?.registerCompletion(session, context.completionDeferred.promise); this.logger.info?.("Structured output enabled"); }
  }
}
export class StructuredOutputStopHook {
  readonly event = "Stop";
  readonly priority = 200;
  constructor(private readonly factory: StructuredOutputContextFactory, private readonly logger: StructuredOutputHookLogger = {}) {}
  async execute({ session }: { session?: HarnessSession }): Promise<{ allowed: true; continueRequest: { message: AgentInputItem; completionPromise: Promise<void> } } | undefined> {
    if (!session) return;
    const context = this.factory.get(session);
    if (!context?.enabled) return;
    if (context.hasOutput()) { this.logger.info?.("Structured output captured successfully"); context.markComplete(); return; }
    if (!context.incrementRetry()) { this.logger.warn?.(`Structured output not captured after ${context.maxRetries} retries`); context.markComplete(); return; }
    this.logger.info?.(`Structured output not captured, retry ${context.retryCount}/${context.maxRetries}`);
    return { allowed: true, continueRequest: { message: this.buildFeedbackMessage(context.schemaString || ""), completionPromise: context.completionDeferred.promise } };
  }
  buildFeedbackMessage(schema: string | object): AgentInputItem { return { type: "message", role: "user", content: STRUCTURED_OUTPUT_FEEDBACK_TEMPLATE.replace("{schema}", schema as string), providerData: { isMeta: true } } as AgentInputItem; }
}
export { StructuredOutputContext as StructuredOutputContextImpl, StructuredOutputContextFactory as StructuredOutputContextFactoryImpl };
