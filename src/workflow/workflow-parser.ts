import { parse } from "acorn";
import { WorkflowParseError } from "./workflow-errors.js";
import type { ParsedWorkflow, WorkflowSource, WorkflowMeta } from "./workflow-types.js";
const RESERVED = new Set(["__proto__", "constructor", "prototype"]);
const FIELDS = new Set(["name", "label", "description", "whenToUse", "phases", "requiredTools", "defaultModel", "defaultAgentType", "argsSchema", "budget", "defaultIsolation"]);
const ISOLATIONS = new Set(["inherit", "worktree", "remote"]);
/** Native 8846075..8851731; metadata is literalized, never evaluated. */
export class WorkflowParser {
  parse(source: WorkflowSource): ParsedWorkflow { const sourceText = stripExportKeywords(source.text), ast = this.parseAst(sourceText), declaration = this.findMetaDeclaration(ast), meta = declaration ? this.literalizeMeta(declaration.objectExpression, sourceText) : {}; this.validateMetaShape(meta); return { sourceText, ast, meta, metaLoc: declaration ? { start: declaration.objectExpression.start, end: declaration.objectExpression.end } : undefined }; }
  parseAst(source: string): ReturnType<typeof parse> { try { return parse(source, { ecmaVersion: 2022, sourceType: "script", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true, locations: true }); } catch (error) { const failure = error as any; throw new WorkflowParseError(`Workflow script syntax error: ${failure.message ?? String(error)}`, failure.loc ? { line: failure.loc.line, column: failure.loc.column, offset: failure.pos ?? 0 } : undefined); } }
  findMetaDeclaration(ast: any): { objectExpression: any } | undefined { for (const statement of ast.body) { if (statement.type === "VariableDeclaration") for (const declaration of statement.declarations) if (declaration.id.type === "Identifier" && declaration.id.name === "meta" && declaration.init?.type === "ObjectExpression") return { objectExpression: declaration.init }; if (statement.type === "ExpressionStatement" && statement.expression.type === "AssignmentExpression" && statement.expression.operator === "=" && statement.expression.left.type === "Identifier" && statement.expression.left.name === "meta" && statement.expression.right.type === "ObjectExpression") return { objectExpression: statement.expression.right }; } }
  literalizeMeta(node: any, source: string): Record<string, any> { const result = Object.create(null); for (const property of node.properties) { this.assertProperty(property, source); const key = this.extractPropertyKey(property); this.assertKeyAllowed(key, property); result[key] = this.literalizeValue(property.value, source); } return result; }
  assertProperty(property: any, _source: string): void { if (property.type !== "Property") throw this.fail("meta object must contain only plain key/value properties (no spreads).", property); if (property.kind !== "init") throw this.fail(`meta property kind '${property.kind}' is not allowed (no getters/setters).`, property); if (property.method) throw this.fail("meta property cannot be a shorthand method.", property); if (property.computed) throw this.fail("meta property keys cannot be computed.", property); }
  extractPropertyKey(property: any): string { if (property.key.type === "Identifier") return property.key.name; if (property.key.type === "Literal" && (typeof property.key.value === "string" || typeof property.key.value === "number")) return String(property.key.value); throw this.fail("meta property key must be an identifier or string/number literal.", property.key); }
  assertKeyAllowed(key: string, node: any): void { if (RESERVED.has(key)) throw this.fail(`meta property key '${key}' is reserved.`, node); }
  literalizeValue(node: any, source: string): any {
    switch (node.type) {
      case "Literal": return node.value;
      case "TemplateLiteral": if (node.expressions.length > 0) throw this.fail("Template literals with interpolation are not allowed in meta.", node); return node.quasis.map((part: any) => part.value.cooked ?? "").join("");
      case "ArrayExpression": return node.elements.map((element: any, index: number) => { if (!element) throw this.fail(`Sparse array elements are not allowed (index ${index}).`, node); if (element.type === "SpreadElement") throw this.fail("Spread elements are not allowed in meta arrays.", element); return this.literalizeValue(element, source); });
      case "ObjectExpression": return this.literalizeMeta(node, source);
      case "UnaryExpression": if (node.operator === "-" && node.argument.type === "Literal" && typeof node.argument.value === "number") return -node.argument.value; throw this.fail(`Unary operator '${node.operator}' is not allowed in meta.`, node);
      case "Identifier": if (node.name === "undefined") return; throw this.fail(`meta values must be literals; identifier '${node.name}' is not allowed.`, node);
      default: throw this.fail(`meta value of type ${node.type} is not allowed; only literals, arrays, and objects.`, node);
    }
  }
  validateMetaShape(meta: WorkflowMeta): void {
    for (const key of Object.keys(meta)) if (!FIELDS.has(key)) throw new WorkflowParseError(`Unknown meta field '${key}'. Allowed: ${[...FIELDS].join(", ")}.`);
    for (const key of ["name", "label", "description", "whenToUse"] as const) if (meta[key] !== undefined && typeof meta[key] !== "string") throw new WorkflowParseError(`meta.${key} must be a string.`);
    if (meta.phases !== undefined) { if (!Array.isArray(meta.phases)) throw new WorkflowParseError("meta.phases must be an array."); for (const phase of meta.phases) { if (typeof phase !== "object" || phase === null || Array.isArray(phase)) throw new WorkflowParseError("meta.phases entries must be plain objects."); for (const key of ["title", "detail", "model"] as const) if (phase[key] !== undefined && typeof phase[key] !== "string") throw new WorkflowParseError(`meta.phases[].${key} must be a string.`); } }
    if (meta.requiredTools !== undefined && (!Array.isArray(meta.requiredTools) || !meta.requiredTools.every((value) => typeof value === "string"))) throw new WorkflowParseError("meta.requiredTools must be an array of strings.");
    if (meta.defaultModel !== undefined && typeof meta.defaultModel !== "string") throw new WorkflowParseError("meta.defaultModel must be a string.");
    if (meta.defaultAgentType !== undefined && typeof meta.defaultAgentType !== "string") throw new WorkflowParseError("meta.defaultAgentType must be a string.");
    if (meta.budget !== undefined && (typeof meta.budget !== "number" || !Number.isFinite(meta.budget) || meta.budget <= 0)) throw new WorkflowParseError("meta.budget must be a positive number.");
    if (meta.defaultIsolation !== undefined && (typeof meta.defaultIsolation !== "string" || !ISOLATIONS.has(meta.defaultIsolation))) throw new WorkflowParseError(`meta.defaultIsolation must be one of: ${[...ISOLATIONS].join(", ")}.`);
    if (meta.argsSchema !== undefined && (typeof meta.argsSchema !== "object" || meta.argsSchema === null || Array.isArray(meta.argsSchema))) throw new WorkflowParseError("meta.argsSchema must be a plain object (JSON Schema).");
  }
  fail(message: string, node: any): WorkflowParseError { const loc = node.loc; return new WorkflowParseError(message, loc ? { line: loc.start.line, column: loc.start.column, offset: node.start } : undefined); }
}
export function stripExportKeywords(source: string): string { return source.replace(/(^|\n)([ \t]*)export(\s+default)?(\s+)/g, (_match, prefix, indent, defaultKeyword, space) => prefix + indent + " ".repeat(6 + (defaultKeyword ? defaultKeyword.length : 0)) + space); }
