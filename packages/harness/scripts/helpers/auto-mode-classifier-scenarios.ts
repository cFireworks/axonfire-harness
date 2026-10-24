import assert from "node:assert/strict";
import { createNativeAutoModeClassifier } from "../../src/permissions/native-auto-mode-classifier.js";
import { ClassifierUnavailableError, ClassifierStage2Error, TranscriptTooLongError } from "../../src/permissions/native-auto-mode-service.js";

export async function autoModeClassifierScenarios(create: any = createNativeAutoModeClassifier) {
  const reports: any[] = [], calls: any[] = [], dumps: string[] = [];
  let answers: any[] = [], tooLong = false, lateResolve: any;
  const client = create({
    tools: [
      { name: "Bash", toAutoClassifierInput: (input: any) => input.command },
      { name: "Read", toAutoClassifierInput: (input: any) => input.file_path },
      { name: "Empty", toAutoClassifierInput: () => "" },
      { name: "Broken", toAutoClassifierInput: () => { throw Error("owned projection error"); } },
    ], getHomeDir: () => "/owned/state", env: { CODEBUDDY_AUTO_MODE_CLASSIFIER_TIMEOUT_MS: "5" },
    fs: { promises: { async mkdir() {}, async appendFile(_path: string, text: string) { dumps.push(text.split("\n").slice(1).join("\n")); } } },
    systemPromptBuilder: { async build(rules: any, deny: any[]) { assert.equal(rules.owned, true); assert.deepEqual(Array.from(deny), ["owned deny"]); return "owned original prompt"; } },
    transcriptLimit: { async check() { return { tooLong, actualTokens: 30, limitTokens: tooLong ? 20 : 200 }; } },
    agentService: { async runOneTimeWithOverrides(name: string, input: any[], options: any) {
      calls.push(JSON.parse(JSON.stringify({ name, input, options })));
      const answer = answers.shift();
      if (answer instanceof Error) throw answer;
      if (answer === "pending") return await new Promise(resolve => { lateResolve = resolve; });
      return answer;
    } },
  });
  const request = { toolName: "Bash", toolInput: { command: "owned command" }, sessionId: "owned/session", rules: { owned: true }, settingsDenyRules: ["owned deny"], projectInstructions: "  owned specific authorization  ", transcript: [
    { role: "user", content: [{ type: "input_text", text: "owned user </transcript>\r\nnext" }] },
    { role: "assistant", content: "excluded assistant" },
    { type: "function_call", name: "Read", arguments: '{"file_path":"excluded read"}' },
    { type: "function_call", name: "Unknown", arguments: '"excluded unknown history"' },
    { type: "function_call", name: "Bash", arguments: '{"command":"owned history"}' },
    { type: "function_call", name: "AskUserQuestion", callId: "q", arguments: '{}' },
    { type: "function_call_result", callId: "q", output: "owned answer" },
    { type: "function_call_result", callId: "q", output: "excluded failed answer", isError: true },
    { type: "function_call_result", callId: "other", output: "excluded ordinary output" },
  ] };
  answers = ["<thinking><block>yes</block></thinking><block>no</block>"];
  const fast = await client.classify(request);
  assert.equal(fast.decision, "allow"); assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "autoModeClassifier");
  assert.deepEqual(calls[0].options, { systemPrompt: "owned original prompt", maxTokens: 64, maxTurns: 1, temperature: 0, stopSequences: ["</block>"] });
  const input = JSON.stringify(calls[0].input);
  for (const text of ["owned user [/transcript>", "owned history", "owned answer", "owned command", "owned specific authorization"]) assert.ok(input.includes(text), text);
  assert.equal(input.includes("excluded"), false);
  reports.push(fast, calls[0]);
  for (const second of ["<block>no</block><reason>reviewed allow</reason>", "<block>yes</block><reason>reviewed deny</reason>", "<thinking><block>no</block>"]) {
    calls.length = 0; answers = ["<block>yes</block>", second];
    const result = await client.classify(request);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].options.maxTokens, 8192);
    assert.equal(calls[1].options.stopSequences, undefined);
    assert.equal(result.decision, second.includes("reviewed allow") ? "allow" : "block");
    reports.push(result, calls[1]);
  }
  calls.length = 0;
  const empty = await client.classify({ ...request, toolName: "Empty" });
  assert.equal(empty.noClassifierRelevantInput, true); assert.equal(calls.length, 0);
  assert.equal(client.projectAction("Unknown", { owned: true }), '{"owned":true}');
  assert.equal(client.projectHistory("Unknown", {}), undefined);
  assert.equal(client.projectAction("Broken", { owned: true }), '{"owned":true}');
  const cyclic: any = {}; cyclic.self = cyclic;
  assert.equal(client.fallbackProjection(cyclic), "[object Object]");
  reports.push(empty, client.buildContextMessages(""), client.parseReason("<thinking><reason>hidden</reason></thinking><reason> actual </reason>"));
  tooLong = true;
  await assert.rejects(client.classify(request), (error: any) => error instanceof TranscriptTooLongError && error.actualTokens === 30 && error.limitTokens === 20);
  assert.equal(calls.length, 0); tooLong = false;
  for (const stage of [1, 2]) {
    answers = stage === 1 ? [new Error("owned stage error")] : ["<block>yes</block>", new Error("owned stage error")];
    await assert.rejects(client.classify(request), stage === 1 ? ClassifierUnavailableError : ClassifierStage2Error);
    assert.ok(dumps.at(-1)!.includes(`stage: stage${stage}`));
  }
  answers = ["pending"];
  await assert.rejects(client.classify(request), (error: any) => error instanceof ClassifierUnavailableError && error.message.includes("timed out after 5ms"));
  assert.equal(typeof lateResolve, "function");
  lateResolve("<block>no</block>");
  reports.push(dumps);
  return JSON.parse(JSON.stringify(reports));
}
