import { installNativeModuleRuntime } from "../../src/di/native-module-runtime.js";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/runtime/native-prompt-services.js";
export function loadCapturedPromptServices(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.PROMPT_SERVICES_SHA256,
  );
  let output = emittedPrompt("runtime/native-prompt-services");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativePromptServices",
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
  for (const n of tree.body.filter((n: any) => n.type === "ImportDeclaration"))
    edits.push({ start: n.start, end: n.end, text: "" });
  for (const [id, start, end] of native.PROMPT_SERVICES_MODULES) {
    const raw = cli.slice(start, end),
      original: any = (
        parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
      ).expression.properties[0],
      port = props.find((p: any) => p.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(original),
      "complete prompt services factory " + id,
    );
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    "installNativeModuleRuntime",
    output + "\nreturn createNativePromptServices;",
  )(installNativeModuleRuntime) as typeof native.createNativePromptServices;
}
