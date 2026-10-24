import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  METRIC_READER_SHA256,
  METRIC_READER_REGIONS,
  METRIC_READER_MODULES,
  createNativeMetricReader,
} from "../../src/runtime/native-metric-reader.js";
export function loadCapturedMetricReader(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    METRIC_READER_SHA256,
  );
  let output = emittedPrompt("runtime/native-metric-reader");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeMetricReader",
    ).declaration.body.body;
  const start = body.findIndex(
    (n: any) =>
      n.type === "VariableDeclaration" && n.declarations[0].id.name === "AE",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  METRIC_READER_REGIONS.forEach(([a, b], i) => {
    const raw = cli.slice(a, b),
      original: any = parse(raw, { ecmaVersion: "latest" }).body[0],
      port = body[start + i];
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  });
  const factories = body.find(
    (n: any) => n.declarations?.[0]?.id.name === "factories",
  ).declarations[0].init.properties;
  for (const [id, a, b] of METRIC_READER_MODULES) {
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
    output + "\nreturn createNativeMetricReader;",
  )() as typeof createNativeMetricReader;
}
