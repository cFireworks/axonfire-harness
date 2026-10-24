import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import * as path from "node:path";
import { Script } from "node:vm";
import { parse } from "acorn";
import ts from "typescript";
import { user } from "@openai/agents-core";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { autoModeClassifierScenarios } from "./helpers/auto-mode-classifier-scenarios.js";
import { ClassifierUnavailableError, ClassifierStage2Error, TranscriptTooLongError } from "../src/permissions/native-auto-mode-service.js";
const source = await readFile(getCapturedBundlePath(), "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const raw = `${source.slice(11551330,11551801)}${source.slice(11558443,11560682)}${source.slice(11563870,11564539)};const Original=${source.slice(11564543,11568680)};`;
const create = new Script(`(function(options){
 const ny={AUTO_MODE_CLASSIFIER_TIMEOUT_ENV:'CODEBUDDY_AUTO_MODE_CLASSIFIER_TIMEOUT_MS',AUTO_MODE_CLASSIFIER_STAGE1_TIMEOUT_MS_DEFAULT:60000,AUTO_MODE_CLASSIFIER_STAGE2_TIMEOUT_MS_DEFAULT:120000};
 const nz={user,AgentNames:{AUTO_MODE_CLASSIFIER:'autoModeClassifier'}};
 const n2=options.fs,n4=path,n5={PathUtils:{getHomeDir:options.getHomeDir}},process={env:options.env??{}};
 ${raw}return Object.assign(new Original(),options,{logger:options.logger??{}});
})`).runInNewContext({ user, path, ClassifierUnavailableError, ClassifierStage2Error, TranscriptTooLongError, Error, setTimeout, clearTimeout });
function selected(text: string) {
  const nodes: any[] = [];
  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.type === "ClassExpression" || node.type === "FunctionDeclaration" && node.id.name !== "createNativeAutoModeClassifier" || node.type === "VariableDeclarator" && ["nY", "nJ", "n9", "n7", "il", "ic", "iu"].includes(node.id?.name)) nodes.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(parse(text, { ecmaVersion: "latest", sourceType: "module" })); return nodes;
}
function normalize(node: any): any {
  if (Array.isArray(node)) return node.map(normalize);
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).filter(([key]) => !["start", "end", "raw"].includes(key)).map(([key, value]) => [key, normalize(value)]));
  return node;
}
const port = ts.transpileModule(await readFile(new URL("../src/permissions/native-auto-mode-classifier.ts", import.meta.url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText;
assert.deepEqual(normalize(selected(port)), normalize(selected(raw)));
// Validate injected primitive bindings against their original factory, not
// merely against a second fixture carrying the same assumed values.
const timeoutFactory = source.match(/75798\(eA,el,ec\)\{[\s\S]*?eg="[^" ]+"\}/)?.[0];
assert.ok(timeoutFactory);
const primitiveExports: any = {};
const requirePrimitive: any = () => { throw Error("unexpected primitive dependency"); };
requirePrimitive.r = () => {};
requirePrimitive.d = (target: any, getters: any) => {
  for (const [key, get] of Object.entries(getters)) Object.defineProperty(target, key, { get: get as () => any });
};
new Script(`({${timeoutFactory}})[75798]`).runInNewContext()({}, primitiveExports, requirePrimitive);
const bindingAst: any = parse(port, { ecmaVersion: "latest", sourceType: "module" });
let binding: any;
function findBinding(node: any) {
  if (!node || typeof node !== "object") return;
  if (node.type === "VariableDeclarator" && node.id?.name === "ny") binding = node.init;
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(findBinding);
    else if (value && typeof value === "object") findBinding(value);
  }
}
findBinding(bindingAst);
assert.ok(binding);
const injected = new Script(`(${port.slice(binding.start, binding.end)})`).runInNewContext();
for (const key of Object.keys(injected)) assert.equal(injected[key], primitiveExports[key], key);
assert.ok(source.includes('eA.AUTO_MODE_CLASSIFIER="autoModeClassifier"'));

const actual = await autoModeClassifierScenarios(), expected = await autoModeClassifierScenarios(create);
assert.deepEqual(actual, expected);
console.log(JSON.stringify({ passed: true, sourceNodes: selected(port).length, behavioralReports: actual.length, scope: "complete classifier, transcript/timeout helpers and stage constants; explicit prompt/model/limit dependencies" }, null, 2));
