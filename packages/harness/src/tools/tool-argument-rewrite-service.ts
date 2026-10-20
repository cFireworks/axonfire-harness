const REWRITES = [
  { raw: ".CB/CB_PROJ_CB.md", rewrite: ".codebuddy/CB_PROJ_CB.md" },
  { raw: "CB_PROJ_CB.md", rewrite: "CODEBUDDY.md" },
];
/** Native rule table at 11892453, class at 11892571; regex dots intentionally remain unescaped. */
export class ToolArgumentRewriteService {
  process<T>(input: T): T {
    const rewriteString = (value: string) => { let result = value; for (const rule of REWRITES) result = result.replace(new RegExp(rule.raw, "g"), rule.rewrite); return result; };
    const processValue = (value: any): any => {
      if (typeof value === "string") return rewriteString(value);
      if (Array.isArray(value)) return value.map(processValue);
      if (value && typeof value === "object") { const result: Record<string, unknown> = {}; for (const [key, item] of Object.entries(value)) result[key] = processValue(item); return result; }
      return value;
    };
    return processValue(input);
  }
}
