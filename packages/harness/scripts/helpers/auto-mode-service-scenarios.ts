import assert from "node:assert/strict";
import * as native from "../../src/permissions/native-auto-mode-service.js";

export async function autoModeServiceScenarios(implementation = native) {
  const { AutoModeDenialTracker, ClassifierStage2Error, TranscriptTooLongError, createNativeAutoModePermissionService: create } = implementation;
  const tracker = new AutoModeDenialTracker();
  const report: any[] = [];
  for (let i = 0; i < 23; i++) tracker.recordDenial("a", { toolName: "Bash", inputKey: `${i}`, reason: "owned", timestamp: i });
  const recent = tracker.getRecentDenials("a");
  assert.equal(recent.length, 20);
  assert.equal(recent[0].inputKey, "3");
  recent.pop();
  assert.equal(tracker.getRecentDenials("a").length, 20);
  tracker.recordDenial("a", { toolName: "Bash", inputKey: "3", reason: "updated", timestamp: 99 });
  assert.equal(tracker.getRecentDenials("a").at(-1).reason, "updated");
  assert.equal(tracker.removeDenial("a", "Bash", "3"), true);
  assert.equal(tracker.removeDenial("a", "Bash", "3"), false);
  report.push(tracker.getRecentDenials("a"), tracker.getRecentDenials("other"));
  assert.deepEqual([tracker.recordClassifierFailure("a"), tracker.recordClassifierFailure("a"), tracker.recordClassifierFailure("a")], [false, false, true]);
  assert.equal(tracker.isCircuitOpen("a"), true);
  tracker.recordClassifierSuccess("a");
  assert.equal(tracker.isCircuitOpen("a"), false);
  const consecutive = [tracker.recordClassifierBlock("a"), tracker.recordClassifierBlock("a"), tracker.recordClassifierBlock("a")];
  assert.equal(consecutive[2].kind, "consecutive");
  assert.equal(tracker.recordClassifierBlock("a").totalDenials, 1);
  report.push(consecutive);
  tracker.clear("a");
  for (let i = 0; i < 20; i++) {
    tracker.resetConsecutiveDenials("a");
    const result = tracker.recordClassifierBlock("a");
    assert.equal(result.exceeded, i === 19);
    if (i === 19) { assert.equal(result.kind, "total"); report.push(result); }
  }
  tracker.clear("a");
  assert.equal(tracker.getRecentDenials("a").length, 0);
  let response: any = { decision: "block", inputKey: "owned input", reason: "owned deny" };
  const received: any[] = [];
  const service: any = create({
    denialTracker: tracker,
    settingsManager: { async get() { return {}; } },
    rulesResolver: { async resolve() { return { owned: true }; } },
    projectInstructionsResolver: { async resolve() { return "owned instructions"; } },
    classifier: { async classify(input: any) { received.push(input); if (response instanceof Error) throw response; return response; } },
  });
  const input = { sessionId: "a", toolName: "Bash", toolInput: { command: "owned" }, canPrompt: true, headless: true, transcript: ["owned history"], settingsDenyRules: ["owned deny rule"] };
  report.push(await service.isAutoModeAvailable(), await service.isSettingsAutoGrantAllowed());
  for (let i = 0; i < 3; i++) {
    const result = await service.classifyAsk(input);
    assert.equal(result.behavior, i === 2 ? "denialLimitExceeded" : "deny");
    if (i === 2) assert.equal(result.headlessAbort, true);
    report.push(result);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(received[0])), { toolName: input.toolName, toolInput: input.toolInput, rules: { owned: true }, transcript: input.transcript, settingsDenyRules: input.settingsDenyRules, projectInstructions: "owned instructions", sessionId: "a" });
  response = { decision: "allow", inputKey: "owned input", reason: "owned approval" };
  assert.equal((await service.classifyAsk(input)).behavior, "allow");
  assert.equal(tracker.findDenial("a", "Bash", "owned input"), undefined);
  response = new TranscriptTooLongError(30, 20);
  report.push(await service.classifyAsk(input), await service.classifyAsk({ ...input, headless: false }));
  assert.equal(tracker.isCircuitOpen("a"), false);
  response = new ClassifierStage2Error("owned stage two failure", undefined);
  const stageTwo = await service.classifyAsk(input);
  assert.equal(stageTwo.failClosed, true);
  assert.match(stageTwo.reason, /Stage 2/);
  response = new Error("owned unavailable");
  report.push(stageTwo, await service.classifyAsk(input));
  const opened = await service.classifyAsk(input);
  assert.equal(opened.kickOutOfAuto, true);
  assert.equal(opened.failClosed, true);
  const count = received.length;
  const fallback = await service.classifyAsk(input);
  assert.equal(fallback.failClosed, false);
  assert.equal(fallback.kickOutOfAuto, true);
  assert.equal(received.length, count);
  const headlessFallback = await service.classifyAsk({ ...input, canPrompt: false });
  assert.equal(headlessFallback.failClosed, true);
  report.push(opened, fallback, headlessFallback);
  tracker.clear("a");
  response = { decision: "allow", reason: "recovered" };
  assert.equal((await service.classifyAsk(input)).behavior, "allow");
  const disabled = create({ ...service, settingsManager: { async get(_key: string, scope?: string) { return scope === "user" ? { defaultMode: "auto" } : { disableAutoMode: "disable" }; } } });
  assert.equal((await disabled.isAutoModeAvailable()).available, false);
  assert.equal(await disabled.isSettingsAutoGrantAllowed(), true);
  report.push(service.buildDisplay("Bash", " \n" + "a".repeat(100)), await disabled.isAutoModeAvailable());
  return JSON.parse(JSON.stringify(report));
}
