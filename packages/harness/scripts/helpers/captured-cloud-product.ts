import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf, emittedSource } from "./captured-product-sources.js";
import { CLOUD_PRODUCT_CLASSES } from "../../src/config/native-cloud-product.js";
import * as constants from "../../src/config/native-product-constants.js";
export { CLOUD_PRODUCT_CLASSES };
export function emittedCloud() {
  return emittedSource("native-cloud-product");
}
/** Verification-only: complete inert class bodies, never installed bootstrap. */
export function loadCapturedCloud(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("CLI sample hash");
  let code = emittedCloud();
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
    const row = CLOUD_PRODUCT_CLASSES.find((r) => r[0] === n.id?.name);
    if (n.type === "ClassDeclaration" && row) {
      const raw = source.slice(row[1], row[2]);
      edits.push({
        start: n.body.start,
        end: n.body.end,
        text: raw.slice(raw.indexOf("{")),
      });
    }
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    code = code.slice(0, e.start) + e.text + code.slice(e.end);
  return Function(
    "constants",
    code + "\nreturn createNativeCloudProduct",
  )(constants);
}
