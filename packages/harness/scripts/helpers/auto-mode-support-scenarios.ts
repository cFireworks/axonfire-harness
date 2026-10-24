import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import * as native from "../../src/permissions/native-auto-mode-support.js";
export async function originalAutoPrompt() {
  const config = JSON.parse(await readFile(new URL("../../config/original/product.json", import.meta.url), "utf8"));
  return config.prompts.find((prompt: any) => prompt.name === "auto-mode-classifier-instructions").template as string;
}
export async function autoModeSupportScenarios(implementation: any = native) {
  const reports: any[] = [], scopes: string[] = [], warnings: string[] = [];
  const settings: any = {
    user: { environment: ["owned environment"], allow: ["$defaults", "$& literal", "$defaults"], soft_deny: ["owned deny"] },
    "project-local": { allow: ["owned local"], hard_deny: [] },
    cli: { environment: ["owned cli"], allow: ["owned cli allow"] },
    project: { environment: ["must not be read"] },
  };
  const resolver = implementation.createNativeAutoModeSettingsResolver({
    settingsManager: { async get(key: string, scope: string) { assert.equal(key, "autoMode"); scopes.push(scope); return settings[scope]; } },
    logger: { warn(message: string) { warnings.push(message); } },
  });
  const raw = await resolver.resolveRaw(), rules = await resolver.resolve();
  assert.deepEqual(scopes, ["user", "project-local", "cli", "user", "project-local", "cli"]);
  const norm = (value: any) => JSON.parse(JSON.stringify(value));
  assert.deepEqual(norm(rules.environment), ["owned environment", "owned cli"]);
  assert.deepEqual(norm(rules.allow), [...native.AUTO_MODE_DEFAULTS.allow, "$& literal", "owned local", "owned cli allow"]);
  assert.deepEqual(norm(rules.hard_deny), native.AUTO_MODE_DEFAULTS.hard_deny);
  assert.equal(warnings.length, 1); assert.match(warnings[0]!, /soft_deny/);
  const fallback = implementation.createNativeAutoModeSettingsResolver({ settingsManager: { async get() { throw Error("owned settings unavailable"); } } });
  assert.deepEqual(norm(await fallback.resolve()), native.AUTO_MODE_DEFAULTS);
  const template = await originalAutoPrompt();
  const builder = implementation.createNativeAutoModeSystemPromptBuilder({ promptManager: { async get(name: string) { assert.equal(name, "auto-mode-classifier-instructions"); return { template }; } } });
  const rendered = await builder.build(rules, ["Write(/owned/**)"]);
  for (const text of ["owned environment", "owned cli", "$& literal", "owned deny", "Write(/owned/**)", "User Deny Rules:"]) assert.ok(rendered.includes(text));
  for (const tag of ["user_environment_to_replace", "user_allow_rules_to_replace", "user_soft_deny_rules_to_replace", "user_hard_deny_rules_to_replace", "<settings_deny_rules>"]) assert.equal(rendered.includes(tag), false, tag);
  assert.equal(builder.renderSettingsDenyRules([]), "");
  const missing = implementation.createNativeAutoModeSystemPromptBuilder({ promptManager: { async get() {} } });
  assert.equal(await missing.build(rules, []), "");
  reports.push(raw, rules, warnings, createHash("sha256").update(rendered).digest("hex"));
  let memory: any = { user: [{ content: " user instruction " }], project: [{ content: "project instruction" }, { content: " " }] };
  const project = implementation.createNativeAutoModeProjectInstructionsResolver({ memoryManager: { async get({ scope }: any) { if (memory instanceof Error) throw memory; return memory[scope]; } } });
  assert.equal(await project.resolve(), "user instruction\n\nproject instruction");
  memory.user = [{ content: "x".repeat(20005) }]; memory.project = [];
  const truncated = await project.resolve(); assert.equal(truncated, "x".repeat(20000) + "\n... (truncated)");
  memory = Error("owned memory unavailable"); assert.equal(await project.resolve(), "");
  assert.equal(await implementation.createNativeAutoModeProjectInstructionsResolver().resolve(), "");
  let maxInputTokens: any = 128000, modelError = false, missingModel = false;
  const limit = implementation.createNativeAutoModeTranscriptLimit({
    agentManager: { async getModel(name: string) { assert.equal(name, "autoModeClassifier"); if (modelError) throw Error("owned missing model"); return { id: "owned-model" }; } },
    productManager: { async waitConfiguration() { return { models: missingModel ? [] : [{ id: "owned-model", maxInputTokens }] }; } },
  });
  assert.equal(await limit.resolveLimit(), 111808);
  for (const value of [0, -1, undefined]) { maxInputTokens = value; assert.equal(await limit.resolveLimit(), 111808); }
  maxInputTokens = 16196;
  const exact = await limit.check("a".repeat(16)), over = await limit.check("a".repeat(17));
  assert.deepEqual(norm(exact), { tooLong: false, actualTokens: 4, limitTokens: 4 });
  assert.deepEqual(norm(over), { tooLong: true, actualTokens: 5, limitTokens: 4 });
  reports.push(exact, over, await limit.check("中文".repeat(9)), await limit.check("😀a".repeat(3)));
  maxInputTokens = 1; assert.equal(await limit.resolveLimit(), 1);
  modelError = true; assert.equal(await limit.resolveLimit(), 111808);
  modelError = false; missingModel = true; assert.equal(await limit.resolveLimit(), 111808);
  return norm(reports);
}
