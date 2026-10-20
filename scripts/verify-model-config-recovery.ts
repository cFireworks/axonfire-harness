import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { Agent } from "@openai/agents";
import type { AgentManager } from "../src/agents/agent-manager.js";
import { ModelConfigAgentRunInterceptor } from "../src/agents/model-config-agent-run-interceptor.js";
import type { ProductModel } from "../src/config/types.js";
import type { SessionManager } from "../src/sessions/session-manager.js";
import { HarnessSession } from "../src/sessions/session.js";

const path = process.argv[2];
if (!path) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await readFile(path, "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const start = source.indexOf("let rZ=class{");
const end = source.indexOf(";model_interceptors_decorate", start);
const helpers = source.slice(source.indexOf('let rW=["minimal"'), source.indexOf("let rV=class"));
const base: ProductModel = { id: "base", name: "base", maxOutputTokens: 12000, supportsReasoning: true, reasoning: { effort: "low", summary: "auto" } };
const models = new Map<string, ProductModel>([
  ["plain", { id: "plain", name: "plain", supportsReasoning: false, temperature: 0.2, maxOutputTokens: 2048 }],
  ["thinking", { id: "thinking", name: "thinking", supportsReasoning: true, reasoning: { defaultEffort: "medium" } as any }],
]);
const manager = { getModel: async () => structuredClone(base), resolveModel: (id: string) => structuredClone(models.get(id)) };
const budgets = [undefined, "1024", "bad", "0"];
const savedBudget = process.env.MAX_THINKING_TOKENS;
const savedCap = process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS;
delete process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS;
let cases = 0;
try {
  for (const budget of budgets) {
    if (budget === undefined) delete process.env.MAX_THINKING_TOKENS;
    else process.env.MAX_THINKING_TOKENS = budget;
    const Original = runInNewContext(`(()=>{${helpers}return ${source.slice(start + "let rZ=".length, end)};})()`, {
      AB: { Agent }, A_: { AgentRunInterceptorPriority: { Model: 900 }, DEFAULT_TEMPERATURE: 1 },
      AH: { ModelUtils: { getMaxOutputTokens: (_id: string, configured: number | undefined) => configured } },
      process: { env: { MAX_THINKING_TOKENS: budget } },
    }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } });
    for (const cli of [undefined, "plain", "cli-custom"]) for (const request of [undefined, "thinking", "request-custom"])
      for (const enabled of [undefined, true, false]) for (const effort of [undefined, "max", "invalid"])
        for (const override of [undefined, { thinkingEnabled: false }, { thinkingEnabled: true, reasoningEffort: "medium" }]) {
          const values: Record<string, unknown> = { alwaysThinkingEnabled: enabled, reasoningEffort: effort };
          const sessions = { getOverrideThinking: () => override };
          const settings = { get: async <T>(key: string) => values[key] as T | undefined };
          const original = new Original();
          Object.assign(original, { agentManager: manager, sessionManager: sessions, settingsManager: settings,
            logger: { debug() {}, info() {}, warn() {}, setContext() {} } });
          const recovered = new ModelConfigAgentRunInterceptor(manager as unknown as AgentManager, sessions as unknown as SessionManager, settings);
          const makeAgent = () => ({ name: "cli", model: "initial", handoffs: [], modelSettings: {
            temperature: 0.1, providerData: { existing: true }, reasoning: { effort: "high", summary: "concise" },
          } });
          const first = makeAgent(), second = makeAgent();
          const session = new HarnessSession("fixture", { options: cli ? { model: cli } : {}, requestOptions: request ? { model: request } : {} });
          await original.configureModelConfig(first, session);
          await recovered.configureModelConfig(second as unknown as Agent<HarnessSession>, session);
          assert.deepEqual(JSON.parse(JSON.stringify(second)), JSON.parse(JSON.stringify(first)), JSON.stringify({ budget, cli, request, enabled, effort, override }));
          cases++;
        }
  }
} finally {
  if (savedBudget === undefined) delete process.env.MAX_THINKING_TOKENS; else process.env.MAX_THINKING_TOKENS = savedBudget;
  if (savedCap === undefined) delete process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS; else process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS = savedCap;
}
console.log(JSON.stringify({ classStart: start + "let rZ=".length, classEnd: end, differentialCases: cases, passed: true }, null, 2));
