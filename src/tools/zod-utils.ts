import type { z } from "zod";
const parsedType = (raw: any): string => raw === null ? "null" : Array.isArray(raw) ? "array" : typeof raw === "number" && Number.isNaN(raw) ? "nan" : raw instanceof Date ? "date" : raw instanceof Map ? "map" : raw instanceof Set ? "set" : raw && typeof raw.then === "function" && typeof raw.catch === "function" ? "promise" : typeof raw;

/** Product ZodUtils error format, with Zod 4 issue names mapped to the captured Zod 3 protocol. */
export function validateToolParameters(schema: z.ZodType, input: unknown): string | undefined {
  const result = schema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.map((issue) => {
    const field = issue.path.join(".");
    let value: any = input;
    if (!input || typeof input !== "object" || !issue.path.length) value = undefined;
    else for (const key of issue.path) { if (value == null || typeof value !== "object") { value = undefined; break; } value = value[key]; }
    const suffix = value !== undefined ? ` (value: ${JSON.stringify(value)})` : "";
    switch (issue.code) {
      case "invalid_type": {
        const raw = issue.path.length ? value : input;
        const received = parsedType(raw);
        return `Parameter "${field}" expected ${issue.expected}, but received ${received}${suffix}`;
      }
      case "too_small": return `Parameter "${field}" must be ${issue.inclusive ? ">=" : ">"} ${issue.minimum}`;
      case "too_big": return `Parameter "${field}" must be ${issue.inclusive ? "<=" : "<"} ${issue.maximum}`;
      case "unrecognized_keys": return `Unrecognized parameter(s): ${issue.keys.join(", ")}`;
      case "invalid_union": return `Parameter "${field}" does not match any of the expected types`;
      case "invalid_value": {
        const raw = issue.path.length ? value : input;
        if (issue.values.length > 1 && issue.values.every((value) => typeof value === "string") && typeof raw !== "string") return `Parameter "${field}" expected ${issue.values.map((value) => `'${value}'`).join(" | ")}, but received ${parsedType(raw)}${suffix}`;
        return issue.values.length === 1 ? `Parameter "${field}" must be ${JSON.stringify(issue.values[0])}` : `Parameter "${field}" must be one of [${issue.values.map((value) => JSON.stringify(value)).join(", ")}]${suffix}`;
      }
      default: return `Parameter "${field}": ${issue.message}`;
    }
  }).join("; ");
}
