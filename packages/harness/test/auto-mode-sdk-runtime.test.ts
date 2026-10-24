import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { PermissionMode } from "../src/permissions/permission.js";
setTraceProcessors([]);
for (const mode of ["fast-allow", "review-allow", "deny", "error", "host-reject"]) test(`real SDK Auto composition controls Bash: ${mode}`, async t => {
  const root = await mkdtemp(join(tmpdir(), "harness-auto-sdk-"));
  const target = join(root, "owned.txt"), command = `printf '%s' 'owned Auto SDK evidence' > '${target}'`;
  const mainRequests: any[] = [], classifierRequests: any[] = [], overrides: any[] = [], approvals: string[] = [];
  let inClassifier = false;
  const model: Model = {
    async getResponse() { return { output: [], usage: new Usage() }; },
    async *getStreamedResponse(request) {
      const classify = inClassifier;
      (classify ? classifierRequests : mainRequests).push(request);
      if (classify && mode === "error") throw Error("owned classifier failure");
      const text = classify
        ? (mode === "fast-allow" || mode === "host-reject") || mode === "review-allow" && classifierRequests.length === 2 ? "<block>no</block>" : "<block>yes</block><reason>owned denial</reason>"
        : "owned main finished";
      const output: any[] = !classify && mainRequests.length === 1
        ? [{ type: "function_call", id: "owned-bash", callId: "owned-bash", name: "Bash", arguments: JSON.stringify({ command, description: "owned-unprojected-description" }), status: "completed" }]
        : [{ type: "message", role: "assistant", id: `owned-${classify ? "classifier" : "main"}-${classifierRequests.length}`, status: "completed", content: [{ type: "output_text", text }] }];
      yield { type: "response_started" };
      if (output[0].type === "message") yield { type: "output_text_delta", delta: text };
      yield { type: "response_done", response: { id: `owned-${mainRequests.length}-${classifierRequests.length}`, usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, output } } as any;
    },
  };
  const h = await createHarness({ workDir: root, stateDir: join(root, "state"), recordReplayEnv: {}, modelProvider: { getModel: () => model },
    nativeAutoMode: true, approveTool(name) { approvals.push(name); return mode !== "host-reject"; },
  });
  t.after(async () => { await h.close(); await rm(root, { recursive: true, force: true }); });
  assert.equal((await h.tools.get("Bash"))?.toAutoClassifierInput?.({ command, description: "omitted" }), command);
  assert.ok(h.autoModeRuntime);
  assert.equal(h.nativePermissions, true);
  const runOverrides = h.service.runOneTimeWithOverrides.bind(h.service);
  h.service.runOneTimeWithOverrides = async (name, input, options) => {
    overrides.push({ name, input, options }); inClassifier = true;
    try { return await runOverrides(name, input, options); }
    finally { inClassifier = false; }
  };
  h.tools.register("OwnedLateTool", { execute: () => "unused", toAutoClassifierInput: input => `late:${input.text}` });
  const session = await h.openSession(undefined, { permissionMode: PermissionMode.Auto });
  assert.equal(await h.prompt(session, "Run the owned shell action."), "owned main finished");
  assert.equal(mainRequests.length, 2);
  assert.equal(h.autoModeRuntime.classifier.tools.find((tool: any) => tool.name === "OwnedLateTool")?.toAutoClassifierInput({ text: "projection" }), "late:projection");
  assert.equal(classifierRequests.length, ["fast-allow", "error", "host-reject"].includes(mode) ? 1 : 2);
  assert.equal(overrides[0].name, "autoModeClassifier");
  assert.equal(overrides[0].options.maxTokens, 64);
  assert.ok(overrides[0].options.systemPrompt.length > 25000);
  assert.equal(JSON.stringify(overrides[0].input).includes("owned-unprojected-description"), false);
  assert.ok(JSON.stringify(overrides[0].input).includes(command));
  assert.deepEqual(approvals, mode.endsWith("allow") || mode === "host-reject" ? ["Bash"] : []);
  if (mode.endsWith("allow")) assert.equal(await readFile(target, "utf8"), "owned Auto SDK evidence");
  else {
    await assert.rejects(readFile(target), { code: "ENOENT" });
    assert.match(JSON.stringify(mainRequests[1].input), mode === "error" ? /Classifier unavailable/ : mode === "host-reject" ? /denied|rejected|approval/i : /owned denial/);
  }
});

for (const mode of ["disabled", "explicit-service"]) test(`Auto host composition preserves ${mode}`, async t => {
  const root = await mkdtemp(join(tmpdir(), "harness-auto-options-"));
  const ownedService = { isAutoModeAvailable: async () => false, classifyAsk: async () => { throw Error("must not classify during construction"); } };
  const h = await createHarness({ workDir: root, stateDir: join(root, "state"), recordReplayEnv: {},
    modelProvider: { getModel() { throw Error("must not resolve a model during construction"); } },
    ...(mode === "explicit-service" ? { nativeAutoMode: true, permissionHost: { autoModePermissionService: ownedService } } : {}),
  });
  t.after(async () => { await h.close(); await rm(root, { recursive: true, force: true }); });
  assert.equal(h.autoModeRuntime, undefined);
  if (mode === "explicit-service") assert.equal(h.permissions.service.autoModePermissionService, ownedService);
  else assert.equal(h.nativePermissions, false);
});
