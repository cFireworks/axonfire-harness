import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  GALILEO_SERVICE_SHA256,
  GALILEO_SERVICE_REGIONS,
  createNativeGalileoService,
} from "../../src/runtime/native-galileo-service.js";
export function loadCapturedGalileoService(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    GALILEO_SERVICE_SHA256,
  );
  let output = emittedPrompt("runtime/native-galileo-service");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeGalileoService",
    ).declaration.body.body;
  const start = body.findIndex(
    (n: any) =>
      n.type === "VariableDeclaration" && n.declarations[0].id.name === "rx",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  GALILEO_SERVICE_REGIONS.forEach(([a, b], i) => {
    const raw = cli.slice(a, b),
      original: any = parse(raw, { ecmaVersion: "latest" }).body[0],
      port = body[start + i];
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  });
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeGalileoService;",
  )() as typeof createNativeGalileoService;
}
