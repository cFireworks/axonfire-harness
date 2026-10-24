import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sessions/native-session-restart.js";
import { createNativeSessionModes } from "../../src/sessions/native-session-modes.js";
import { createNativeSessionAddons } from "../../src/sessions/native-session-addons.js";

/** Replace every recovered declaration/member with its hash-bound original. */
export function loadCapturedSessionRestart() {
  const main =
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
    resolve(dirname(getCapturedBundlePath()), "../../main/initialize.js");
  const coordinator =
    process.env.WORKBUDDY_MODE_COORDINATOR ??
    resolve(dirname(main), "workbuddy-auth-product-coordinator.js");
  const sources = [
    readFileSync(main, "utf8"),
    readFileSync(coordinator, "utf8"),
  ];
  for (const [i, hash] of [
    native.SESSION_RESTART_SHA256,
    native.SESSION_RESTART_COORDINATOR_SHA256,
  ].entries())
    assert.equal(createHash("sha256").update(sources[i]!).digest("hex"), hash);
  let output = ts.transpileModule(
    readFileSync(
      new URL("../../src/sessions/native-session-restart.ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const all = nodesOf(tree),
    edits: { start: number; end: number; text: string }[] = [];
  for (const node of tree.body) {
    if (node.type === "ImportDeclaration")
      edits.push({ start: node.start, end: node.end, text: "" });
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  }
  for (const [name, start, end] of [
    ...native.SESSION_RESTART_FUNCTIONS,
    native.SESSION_RESTART_POLICY,
  ]) {
    const source = sources[
      name === "deriveSessionDeferredBuiltinPolicy" ? 1 : 0
    ]!.slice(start, end);
    const raw = parse(source, { ecmaVersion: "latest" }).body[0];
    const port: any = all.find(
      (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete declaration " + name,
    );
    edits.push({ start: port.start, end: port.end, text: source });
  }
  const originalMembers: string[] = [];
  for (const [name, start, end] of native.SESSION_RESTART_MEMBERS) {
    const source = sources[0]!.slice(start, end);
    const raw: any = parse("class X {\n" + source + "\n}", {
      ecmaVersion: "latest",
    }).body[0];
    const port: any = all.find(
      (n) => n.type === "MethodDefinition" && n.key?.name === name,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw.body.body[0]),
      "complete restart member " + name,
    );
    edits.push({ start: port.start, end: port.end, text: source });
    originalMembers.push(source);
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  const factory = new Function(
    "createNativeSessionModes",
    "createNativeSessionAddons",
    output + "\nreturn createNativeSessionRestart;",
  )(
    createNativeSessionModes,
    createNativeSessionAddons,
  ) as typeof native.createNativeSessionRestart;
  return { factory, declarations: 7, members: originalMembers.length };
}
