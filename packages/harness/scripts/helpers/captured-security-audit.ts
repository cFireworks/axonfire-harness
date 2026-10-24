import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  SECURITY_AUDIT_SHA256,
  SECURITY_AUDIT_MODULE,
  createNativeSecurityAudit,
} from "../../src/sandbox/native-security-audit.js";
export function loadCapturedSecurityAudit(
  cli: string,
): typeof createNativeSecurityAudit {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    SECURITY_AUDIT_SHA256,
  );
  let output = emittedPrompt("sandbox/native-security-audit");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const factories = nodesOf(tree).find(
    (n: any) => n.type === "VariableDeclarator" && n.id.name === "factories",
  ).init;
  const [id, start, end] = SECURITY_AUDIT_MODULE;
  const raw = cli.slice(start, end);
  const original: any = (
    parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
  ).expression.properties[0];
  const port = factories.properties.find((n: any) => n.key.value === id);
  assert.deepEqual(
    cleanAst(port),
    cleanAst(original),
    "complete audit factory48973",
  );
  const edits = [{ start: port.start, end: port.end, text: raw }];
  for (const n of tree.body)
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(output + "\nreturn createNativeSecurityAudit;")();
}
