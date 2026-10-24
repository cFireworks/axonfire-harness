import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as node_path from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sessions/native-session-task-state.js";
export function loadCapturedSessionTaskState(): typeof native.attachNativeSessionTaskState {
  const source = readFileSync(
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
      node_path.resolve(
        node_path.dirname(getCapturedBundlePath()),
        "../../main/initialize.js",
      ),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    native.SESSION_TASK_STATE_SHA256,
  );
  let output = ts.transpileModule(
    readFileSync(
      new URL(
        "../../src/sessions/native-session-task-state.ts",
        import.meta.url,
      ),
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
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body) {
    if (n.type === "ImportDeclaration")
      edits.push({ start: n.start, end: n.end, text: "" });
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  }
  for (const [name, start, end] of native.SESSION_TASK_STATE_FUNCTIONS) {
    const raw: any = parse(source.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
    const port: any = all.find(
      (n) =>
        (n.type === "FunctionDeclaration" && n.id?.name === name) ||
        (n.type === "VariableDeclaration" &&
          n.declarations.some((d: any) => d.id?.name === name)),
    );
    assert.deepEqual(cleanAst(port), cleanAst(raw), name);
    edits.push({
      start: port.start,
      end: port.end,
      text: source.slice(start, end),
    });
  }
  for (const [name, start, end] of native.SESSION_TASK_STATE_MEMBERS) {
    const raw: any = parse("class X{" + source.slice(start, end) + "}", {
      ecmaVersion: "latest",
    }).body[0];
    const port: any = all.find(
      (n) =>
        ["MethodDefinition", "PropertyDefinition"].includes(n.type) &&
        n.key?.name === name,
    );
    assert.deepEqual(cleanAst(port), cleanAst(raw.body.body[0]), name);
    edits.push({
      start: port.start,
      end: port.end,
      text: source.slice(start, end),
    });
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return new Function(
    "node_path",
    output + "\nreturn attachNativeSessionTaskState;",
  )(node_path);
}
