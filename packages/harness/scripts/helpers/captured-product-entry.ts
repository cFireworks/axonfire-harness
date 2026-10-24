import { capturedBundleModuleIndex } from "./captured-bundle-module-index.js";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/runtime/native-product-entry.js";
export function loadCapturedProductEntry(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.PRODUCT_ENTRY_SHA256,
  );
  const index = capturedBundleModuleIndex(cli);
  let output = emittedPrompt("runtime/native-product-entry");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeProductEntry",
    ).declaration.body.body,
    props = body.find((n: any) => n.declarations?.[0]?.id?.name === "factories")
      .declarations[0].init.properties,
    edits = tree.body
      .filter((n: any) => n.type === "ExportNamedDeclaration")
      .map((n: any) => ({
        start: n.start,
        end: n.declaration.start,
        text: "",
      }));
  for (const [id, start, end] of native.PRODUCT_ENTRY_MODULES) {
    assert.deepEqual(index.get(id), { start, end });
    const raw = cli.slice(start, end),
      original: any = (
        parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
      ).expression.properties[0],
      port = props.find((p: any) => p.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(original),
      "complete product entry factory " + id,
    );
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeProductEntry;",
  )() as typeof native.createNativeProductEntry;
}
