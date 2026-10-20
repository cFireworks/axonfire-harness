import { createHash } from "node:crypto";
import * as realCrypto from "node:crypto";
import * as node_path from "node:path";
import * as node_url from "node:url";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { nodesOf } from "./captured-product-sources.js";
import {
  USER_PROMPT_SHA256,
  USER_PROMPT_CLASSES,
  USER_PROMPT_FUNCTIONS,
  USER_PROMPT_CONSTANTS,
} from "../../src/prompts/native-user-prompt.js";

/** Verification only. Replace whole immediate declarations from the fixed sample; never execute app DI/bootstrap. */
export function loadCapturedUserPrompts(source: string) {
  if (createHash("sha256").update(source).digest("hex") !== USER_PROMPT_SHA256)
    throw Error("User prompt coordinator hash");
  let output = emittedPrompt("prompts/native-user-prompt");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const edits: { start: number; end: number; text: string }[] = [];
  for (const node of tree.body) {
    if (node.type === "ImportDeclaration")
      edits.push({ start: node.start, end: node.end, text: "" });
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  }
  const factory = nodesOf(tree).find(
    (n) =>
      n.type === "FunctionDeclaration" &&
      n.id?.name === "createNativeUserPrompt",
  );
  for (const node of factory.body.body) {
    const id = node.id?.name ?? node.declarations?.[0]?.id?.name;
    const cls = USER_PROMPT_CLASSES.find((row) => row[0] === id);
    const declaration = [
      ...USER_PROMPT_FUNCTIONS,
      ...USER_PROMPT_CONSTANTS,
    ].find((row) => row[0] === id);
    if (cls)
      edits.push({
        start: node.declarations[0].init.start,
        end: node.declarations[0].init.end,
        text: source.slice(cls[1], cls[2]),
      });
    else if (declaration)
      edits.push({
        start: node.start,
        end: node.end,
        text: source.slice(declaration[1], declaration[2]),
      });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    "node_path",
    "node_url",
    "realCrypto",
    output + "\nreturn createNativeUserPrompt;",
  )(node_path, node_url, realCrypto) as (runtime: any) => any;
}
