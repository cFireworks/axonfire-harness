import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  ACP_SDK_SHA256,
  ACP_SDK_FACTORY,
  ACP_SDK_ZOD_FACTORY,
  ACP_SDK_ZOD_VERSION,
  createCapturedAcpSdk,
} from "../../src/vendor/captured-acp-sdk.js";

/** Original SDK plus the full original inert Zod factory, not the installed npm Zod used by the port. */
export function loadCapturedAcpSdk(cli: string) {
  assert.equal(createHash("sha256").update(cli).digest("hex"), ACP_SDK_SHA256);
  const loader: any = () => {
    throw Error("Unexpected dependency in inert original ACP/Zod reference");
  };
  loader.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  loader.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      if (!Object.hasOwn(exports, key))
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: defs[key],
        });
  };
  const [, zStart, zEnd] = ACP_SDK_ZOD_FACTORY,
    zodModule = { exports: {} as any };
  const originalZod = Function(
    "navigator",
    "globalThis",
    "return ({" + cli.slice(zStart, zEnd) + "})[25223];",
  )(undefined, {});
  originalZod(zodModule, zodModule.exports, loader);
  assert.equal(
    Object.values(zodModule.exports.core.version).join("."),
    ACP_SDK_ZOD_VERSION,
  );
  let output = emittedPrompt("vendor/captured-acp-sdk");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    nodes = nodesOf(tree),
    edits: any[] = [];
  const [id, start, end] = ACP_SDK_FACTORY,
    raw: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
  const port: any = nodes.find(
    (n: any) => n.type === "Property" && n.method && n.key.value === id,
  );
  assert.deepEqual(
    cleanAst(port),
    cleanAst(raw),
    "complete modified ACP SDK factory",
  );
  edits.push({ start: port.start, end: port.end, text: cli.slice(start, end) });
  for (const node of tree.body) {
    if (node.type === "ImportDeclaration")
      edits.push({ start: node.start, end: node.end, text: "" });
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    factory: Function(
      "getAcpZodRuntime",
      output + "\nreturn createCapturedAcpSdk;",
    )(() => zodModule.exports) as typeof createCapturedAcpSdk,
    originalZod: zodModule.exports,
    classes: nodesOf(raw).filter(
      (n: any) => n.type === "ClassDeclaration" || n.type === "ClassExpression",
    ).length,
    members: nodesOf(raw).filter(
      (n: any) =>
        n.type === "MethodDefinition" || n.type === "PropertyDefinition",
    ).length,
  };
}
