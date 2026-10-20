import Ajv from "ajv";
import type { ErrorObject, ValidateFunction } from "ajv";
import type { WorkflowSubagentSpec } from "./subagent-types.js";
export class StructuredOutputValidationError extends Error {
  constructor(message: string, readonly ajvErrors?: ErrorObject[] | undefined, readonly rawText?: string | undefined) { super(message); this.name = "StructuredOutputValidationError"; }
}
export class StructuredOutputRetryPolicy {
  next(spec: WorkflowSubagentSpec, attempt: number, error: StructuredOutputValidationError): WorkflowSubagentSpec | null { return !spec.schema || attempt > 2 ? null : { ...spec, prompt: this.buildCorrectionPrompt(spec.prompt, error) }; }
  buildCorrectionPrompt(prompt: string, error: StructuredOutputValidationError): string {
    const raw = error.rawText;
    return [prompt, "\n---\n\nYour previous answer did not match the required JSON schema.", (raw ? `Your previous reply was:\n\n${raw.length <= 800 ? raw : raw.slice(0, 800) + "...[truncated]"}\n\n` : "") + `Validator said: ${error.message}`, "\nPlease return ONLY a single JSON value (no prose, no markdown fences) that satisfies the schema. \nIf you believe a field is impossible to fill, return JSON `null` for it (when the schema allows null) \nrather than narrative text."].join("\n");
  }
}
export class StructuredOutputValidator {
  private readonly ajv = new (Ajv as unknown as typeof import("ajv").Ajv)({ allErrors: true, strict: false, useDefaults: true, coerceTypes: false });
  private readonly cache = new Map<string, ValidateFunction>();
  validate(text: string, schema: unknown): unknown {
    const { value, error } = StructuredOutputValidator.lenientParse(text);
    if (error || value === undefined) throw new StructuredOutputValidationError(`Subagent output is not valid JSON: ${error ?? "no parseable JSON found"}`, undefined, text);
    const validate = this.compile(schema);
    if (!validate(value)) { const errors = validate.errors ?? [], message = errors.slice(0, 5).map((item) => `${item.instancePath || "/"} ${item.message}`).join("; "); throw new StructuredOutputValidationError(`Subagent output failed schema validation: ${message || "unknown"}`, errors, text); }
    return value;
  }
  static lenientParse(text: string): { value?: unknown; error?: string } {
    if (typeof text !== "string" || text.length === 0) return { error: "empty text" };
    try { return { value: JSON.parse(text) }; } catch (error) {
      const fenced = extractFencedJson(text); if (fenced) try { return { value: JSON.parse(fenced) }; } catch {}
      const balanced = extractBalancedObject(text); if (balanced) try { return { value: JSON.parse(balanced) }; } catch {}
      return { error: (error as Error).message };
    }
  }
  compile(schema: any): ValidateFunction {
    const key = JSON.stringify(schema), cached = this.cache.get(key); if (cached) return cached;
    try { const compiled = this.ajv.compile(schema); this.cache.set(key, compiled); return compiled; }
    catch (error) { throw new StructuredOutputValidationError(`Invalid JSON Schema: ${(error as Error).message}`, undefined, undefined); }
  }
}
export function extractFencedJson(text: string): string | undefined { return text.match(/(?:```|~~~)(?:json|JSON)?\s*\n?([\s\S]*?)(?:```|~~~)/)?.[1]?.trim(); }
export function extractBalancedObject(text: string): string | undefined {
  const start = findFirstStructural(text); if (start < 0) return;
  const open = text[start], close = open === "{" ? "}" : "]"; let depth = 0, quoted = false, escaped = false;
  for (let index = start; index < text.length; index++) { const char = text[index]; if (quoted) { if (escaped) { escaped = false; continue; } if (char === "\\") { escaped = true; continue; } if (char === '"') quoted = false; continue; } if (char === '"') { quoted = true; continue; } if (char === open) { depth++; continue; } if (char === close && --depth === 0) return text.slice(start, index + 1); }
}
export function findFirstStructural(text: string): number { for (let index = 0; index < text.length; index++) if (text[index] === "{" || text[index] === "[") return index; return -1; }
