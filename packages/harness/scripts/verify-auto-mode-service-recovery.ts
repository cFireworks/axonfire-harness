import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Script } from "node:vm";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { autoModeServiceScenarios } from "./helpers/auto-mode-service-scenarios.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { SettingsScope } from "../src/permissions/native-permission-policy.js";
const source = await readFile(getCapturedBundlePath(), "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const errors = source.slice(11563316, source.indexOf(";let n9=64", 11563316) + 1);
const constants = source.slice(source.indexOf("let nM=3,nx=3,nO=20,nN=20"), source.indexOf(',nP=Symbol("AutoModeDenialTracker")')) + ";";
const tracker = source.slice(11555146, 11556741), service = source.slice(11570431, 11574048);
const originalCode = `${constants}${errors}const AutoModeDenialTracker=${tracker};const NativeAutoModePermissionService=${service};`;
const original = new Script(`(()=>{${originalCode}return {AutoModeDenialTracker,ClassifierUnavailableError,ClassifierStage2Error,TranscriptTooLongError,createNativeAutoModePermissionService(options){return Object.assign(new NativeAutoModePermissionService(),{...options,denialTracker:options.denialTracker??new AutoModeDenialTracker(),logger:options.logger??{}})}}})()`).runInNewContext({ ih: { PermissionMode, SettingsScope }, Error });
function classes(text: string) {
  const found: any[] = [];
  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.type === "ClassExpression") found.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(parse(text, { ecmaVersion: "latest", sourceType: "module" }));
  return found;
}
function normalize(node: any): any {
  if (Array.isArray(node)) return node.map(normalize);
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).filter(([key]) => !["start", "end", "raw"].includes(key)).map(([key, value]) => [key, normalize(value)]));
  return node;
}
const port = ts.transpileModule(await readFile(new URL("../src/permissions/native-auto-mode-service.ts", import.meta.url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText;
assert.deepEqual(normalize(classes(port)), normalize(classes(originalCode)));
const actual = await autoModeServiceScenarios(), expected = await autoModeServiceScenarios(original);
assert.deepEqual(actual, expected);
console.log(JSON.stringify({ passed: true, completeClassAsts: classes(port).length, behavioralReports: actual.length, scope: "original Auto service, denial tracker and three classifier error classes; explicit host composition" }, null, 2));
