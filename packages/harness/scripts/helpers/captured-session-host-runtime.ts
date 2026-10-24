import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as crypto from "node:crypto";
import * as path from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import { createNativeTerminalProxy } from "../../src/terminal/native-terminal-proxy.js";
import * as native from "../../src/sessions/native-session-host-runtime.js";
export function loadCapturedSessionHostRuntime(): typeof native.createNativeSessionHostRuntime {
  const main =
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
    path.resolve(
      path.dirname(getCapturedBundlePath()),
      "../../main/initialize.js",
    );
  let output = ts.transpileModule(
    readFileSync(
      new URL(
        "../../src/sessions/native-session-host-runtime.ts",
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
  });
  const all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body) {
    if (n.type === "ImportDeclaration")
      edits.push({ start: n.start, end: n.end, text: "" });
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  }
  for (const [file, hash, functions, variables] of [
    [
      main,
      native.HOST_RUNTIME_MAIN_SHA256,
      native.HOST_RUNTIME_MAIN_FUNCTIONS,
      native.HOST_RUNTIME_MAIN_VARIABLES,
    ],
    [
      path.join(path.dirname(main), "workbuddy-auth-product-coordinator.js"),
      native.HOST_RUNTIME_COORDINATOR_SHA256,
      native.HOST_RUNTIME_COORDINATOR_FUNCTIONS,
      native.HOST_RUNTIME_COORDINATOR_VARIABLES,
    ],
  ] as const) {
    const source = readFileSync(file, "utf8");
    assert.equal(
      crypto.createHash("sha256").update(source).digest("hex"),
      hash,
    );
    for (const [name, start, end] of functions) {
      const raw: any = parse(source.slice(start, end), {
        ecmaVersion: "latest",
      }).body[0];
      const port: any = all.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      );
      assert.deepEqual(cleanAst(port), cleanAst(raw), name);
      edits.push({
        start: port.start,
        end: port.end,
        text: source.slice(start, end),
      });
    }
    for (const [name, start, end] of variables) {
      const raw: any = parse("let " + source.slice(start, end), {
        ecmaVersion: "latest",
      }).body[0];
      const port: any = all.find(
        (n) => n.type === "VariableDeclarator" && n.id?.name === name,
      );
      assert.deepEqual(cleanAst(port), cleanAst(raw.declarations[0]), name);
      edits.push({
        start: port.start,
        end: port.end,
        text: source.slice(start, end),
      });
    }
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return new Function(
    "node_path",
    "node_crypto",
    "createNativeTerminalProxy",
    output + "\nreturn createNativeSessionHostRuntime;",
  )(path, crypto, createNativeTerminalProxy);
}
