import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/di/native-module-runtime.js";
export function loadCapturedModuleRuntime(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.MODULE_RUNTIME_SHA256,
  );
  let output = emittedPrompt("di/native-module-runtime");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const fn = tree.body.find(
    (n: any) => n.declaration?.id?.name === "installNativeModuleRuntime",
  ).declaration;
  const statement = fn.body.body.find(
    (n: any) => n.expression?.type === "SequenceExpression",
  );
  const [start, end] = native.MODULE_RUNTIME_REGION,
    raw = cli.slice(start, end);
  const original: any = parse(raw + ";", { ecmaVersion: "latest" }).body[0];
  assert.deepEqual(
    cleanAst(statement),
    cleanAst(original),
    "complete Rspack runtime sequence",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  edits.push({ start: statement.start, end: statement.end, text: raw + ";" });
  for (const edit of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn installNativeModuleRuntime;",
  )() as typeof native.installNativeModuleRuntime;
}
