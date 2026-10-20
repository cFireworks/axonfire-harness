import { createHash } from "node:crypto";
import * as path from "node:path";
import { parse } from "acorn";
import { createCapturedSettingsConstants } from "../../src/vendor/captured-settings-constants.js";
import * as constants from "../../src/config/native-product-constants.js";
import {
  PRODUCT_ENVIRONMENT_CLASSES,
  PRODUCT_ENVIRONMENT_FUNCTIONS,
} from "../../src/config/native-product-environment.js";
import { nodesOf, emittedSource } from "./captured-product-sources.js";
export { PRODUCT_ENVIRONMENT_CLASSES, PRODUCT_ENVIRONMENT_FUNCTIONS };
export const emittedEnvironment = () =>
  emittedSource("native-product-environment");
/** Complete inert native bodies only; no original module/bootstrap execution or installed account access. */
export function loadCapturedProductEnvironment(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("CLI sample hash");
  let code = emittedEnvironment();
  const tree: any = parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const edits: { start: number; end: number; text: string }[] = [];
  for (const n of tree.body) {
    if (n.type === "ImportDeclaration")
      edits.push({ start: n.start, end: n.end, text: "" });
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  }
  for (const n of nodesOf(tree)) {
    const row = (
      n.type === "ClassDeclaration"
        ? PRODUCT_ENVIRONMENT_CLASSES
        : n.type === "FunctionDeclaration"
          ? PRODUCT_ENVIRONMENT_FUNCTIONS
          : []
    ).find((r) => r[0] === n.id?.name);
    if (!row) continue;
    const raw = source.slice(row[1], row[2]);
    const original: any = (
      parse("(" + raw + ")", { ecmaVersion: "latest" }).body[0] as any
    ).expression;
    edits.push({
      start: n.body.start,
      end: n.body.end,
      text: raw.slice(original.body.start - 1, original.body.end - 1),
    });
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    code = code.slice(0, e.start) + e.text + code.slice(e.end);
  return Function(
    "path",
    "constants",
    "createCapturedSettingsConstants",
    code + "\nreturn createNativeProductEnvironment",
  )(path, constants, createCapturedSettingsConstants);
}
