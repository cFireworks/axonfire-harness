import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  OTLP_EXPORT_SHA256,
  OTLP_EXPORT_REGIONS,
  OTLP_EXPORT_MODULES,
  createNativeOtlpExport,
} from "../../src/runtime/native-otlp-export.js";
export function loadCapturedOtlpExport(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    OTLP_EXPORT_SHA256,
  );
  let output = emittedPrompt("runtime/native-otlp-export");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeOtlpExport",
    ).declaration.body.body;
  const start = body.findIndex(
    (n: any) =>
      n.type === "VariableDeclaration" && n.declarations[0].id.name === "eN",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  OTLP_EXPORT_REGIONS.forEach(([a, b], i) => {
    const raw = cli.slice(a, b),
      original: any = parse(raw, { ecmaVersion: "latest" }).body[0],
      port = body[start + i];
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  });
  const factories = body.find(
    (n: any) => n.declarations?.[0]?.id.name === "factories",
  ).declarations[0].init.properties;
  for (const [id, a, b] of OTLP_EXPORT_MODULES) {
    const raw = cli.slice(a, b),
      original: any = (
        parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
      ).expression.properties[0],
      port = factories.find((n: any) => n.key.value === id);
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeOtlpExport;",
  )() as typeof createNativeOtlpExport;
}
