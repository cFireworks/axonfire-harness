import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Script } from "node:vm";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { autoModeSupportScenarios } from "./helpers/auto-mode-support-scenarios.js";
import { AUTO_MODE_DEFAULTS } from "../src/permissions/auto-mode-defaults.js";
import { SettingsScope } from "../src/permissions/native-permission-policy.js";
import { MemoryScope } from "../src/memory/memory-rule-constants.js";
import { TokenUtils } from "../src/context/token-utils.js";
const source = await readFile(getCapturedBundlePath(), "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const classes = [[11532061,11533443],[11534729,11535845],[11557422,11557931],[11561346,11561898]].map(([a,b]) => source.slice(a,b));
const defaultsFactory = source.slice(11508667,11530902);
const defaults = new Script(`(${defaultsFactory.slice(defaultsFactory.indexOf("let eu=") + 7, -1)})`).runInNewContext();
assert.deepEqual(JSON.parse(JSON.stringify(defaults)), AUTO_MODE_DEFAULTS);
const names = ["createNativeAutoModeSettingsResolver", "createNativeAutoModeSystemPromptBuilder", "createNativeAutoModeProjectInstructionsResolver", "createNativeAutoModeTranscriptLimit"];
const bindings = [
  `const eh={SettingsScope},ef={AUTO_MODE_DEFAULTS};const em='$defaults',eE=[eh.SettingsScope.USER,eh.SettingsScope.PROJECT_LOCAL,eh.SettingsScope.CLI];`,
  `const eh='auto-mode-classifier-instructions',ef='user_environment_to_replace',em='user_allow_rules_to_replace',eE='user_soft_deny_rules_to_replace',eC='user_hard_deny_rules_to_replace';`,
  `const nj={MemoryScope},nH=20000;`,
  `const nW={TokenUtils},nz={AgentNames:{AUTO_MODE_CLASSIFIER:'autoModeClassifier'}},nZ=8000,nX=8192,n0=128000;`,
];
const original: any = {};
for (let i=0;i<names.length;i++) original[names[i]!] = new Script(`(function(options={}){${bindings[i]}const Original=${classes[i]};return Object.assign(new Original(),options,{logger:options.logger??{}});})`).runInNewContext({ SettingsScope, MemoryScope, AUTO_MODE_DEFAULTS: defaults, TokenUtils, Error });
const transpile = (text: string) => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText;
function find(text: string, predicate: (node: any) => boolean) {
  const nodes: any[] = [];
  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (predicate(node)) nodes.push(node);
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
const port = transpile(await readFile(new URL("../src/permissions/native-auto-mode-support.ts", import.meta.url), "utf8"));
assert.deepEqual(normalize(find(port, n => n.type === "ClassExpression")), normalize(find(classes.map((c,i) => `const Original${i}=${c};`).join("\n"), n => n.type === "ClassExpression")));
const tokenSource = transpile(await readFile(new URL("../src/context/token-utils.ts", import.meta.url), "utf8"));
const start = source.indexOf("static estimateTokensRough(eA){"), end = source.indexOf("static createItemWithoutImages",start);
const method = (n: any) => n.type === "MethodDefinition" && n.key?.name === "estimateTokensRough";
assert.deepEqual(normalize(find(tokenSource,method)), normalize(find(`class Original{${source.slice(start,end)}}`,method)));
const actual = await autoModeSupportScenarios(), expected = await autoModeSupportScenarios(original);
assert.deepEqual(actual,expected);
console.log(JSON.stringify({ passed:true, completeClassAsts:4, originalTokenEstimatorAsts:1, defaultsSections:Object.keys(defaults).length, behavioralReports:actual.length },null,2));
