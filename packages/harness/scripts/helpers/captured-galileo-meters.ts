import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  GALILEO_METERS_SHA256,
  GALILEO_METERS_REGIONS,
  GALILEO_METERS_MODULES,
  createNativeGalileoMeters,
} from "../../src/runtime/native-galileo-meters.js";
export function loadCapturedGalileoMeters(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    GALILEO_METERS_SHA256,
  );
  let output = emittedPrompt("runtime/native-galileo-meters");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeGalileoMeters",
    ).declaration.body.body;
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  for (const r of GALILEO_METERS_REGIONS) {
    const raw = cli.slice(r.start, r.end);
    let original: any, port: any;
    if (r.kind === "declarator") {
      original = (
        parse("let " + raw + ";", { ecmaVersion: "latest" }).body[0] as any
      ).declarations[0];
      port = body
        .flatMap((n: any) => n.declarations ?? [])
        .find((n: any) => n.id.name === r.name);
    } else {
      original = parse(raw, { ecmaVersion: "latest" }).body[0];
      port = body.find((n: any) => n.type === "ExpressionStatement" && n.expression.type === "UnaryExpression");
    }
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  const factories = body.find(
    (n: any) => n.declarations?.[0]?.id.name === "factories",
  ).declarations[0].init.properties;
  for (const [id, a, b] of GALILEO_METERS_MODULES) {
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
    output + "\nreturn createNativeGalileoMeters;",
  )() as typeof createNativeGalileoMeters;
}
