import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  GALILEO_METRIC_SHA256,
  GALILEO_METRIC_REGIONS,
  createNativeGalileoMetricExporter,
} from "../../src/runtime/native-galileo-metric-exporter.js";
export function loadCapturedGalileoMetricExporter(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    GALILEO_METRIC_SHA256,
  );
  let output = emittedPrompt("runtime/native-galileo-metric-exporter");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) =>
        n.declaration?.id?.name === "createNativeGalileoMetricExporter",
    ).declaration.body.body;
  const start = body.findIndex((n: any) => n.type === "ExpressionStatement");
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  GALILEO_METRIC_REGIONS.forEach(([a, b], i) => {
    const raw = cli.slice(a, b),
      original: any = parse(raw, { ecmaVersion: "latest" }).body[0],
      port = body[start + i];
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  });
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeGalileoMetricExporter;",
  )() as typeof createNativeGalileoMetricExporter;
}
