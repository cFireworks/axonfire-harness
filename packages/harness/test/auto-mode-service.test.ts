import assert from "node:assert/strict";
import test from "node:test";
import { autoModeServiceScenarios } from "../scripts/helpers/auto-mode-service-scenarios.js";
import { createToolPermissionHost } from "../src/permissions/tool-permission-host.js";

test("recovered Auto service preserves denial limits, classifier failure circuit and settings", async () => {
  await autoModeServiceScenarios();
});

test("owned permission host composes explicit Auto dependencies and keeps absent configuration unavailable", async () => {
  const options = {
    getWorkDir: () => "/owned/work", getHomeDir: () => "/owned/home",
    settingsManager: { async get() { return {}; } }, sessionStore: {}, planStorageService: {}, sessionHookManager: {}, toolHookManager: {},
  };
  const absent = createToolPermissionHost(options);
  assert.equal((await absent.service.autoModePermissionService.isAutoModeAvailable()).available, false);
  let calls = 0;
  const host = createToolPermissionHost({ ...options, autoMode: {
    classifier: { async classify() { calls++; return { decision: "allow", reason: "owned" }; } },
    rulesResolver: { async resolve() { return {}; } },
    projectInstructionsResolver: { async resolve() { return ""; } },
  } });
  const result = await host.service.autoModePermissionService.classifyAsk({ sessionId: "owned", toolName: "Bash", toolInput: { command: "owned" } });
  assert.equal(result.behavior, "allow");
  assert.equal(calls, 1);
});
