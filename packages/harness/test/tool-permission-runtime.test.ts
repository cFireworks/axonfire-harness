import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { PermissionMode } from "../src/permissions/permission.js";
import { toolPermissionFixture } from "../scripts/helpers/tool-permission-fixtures.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { nativeToolPermissionMetadata } from "../src/permissions/native-tool-permission-metadata.js";

test("native per-tool metadata keeps constructor-owned aliases isolated between descriptors", () => {
  const first = nativeToolPermissionMetadata("Write"),
    second = nativeToolPermissionMetadata("Write");
  first.aliases.push("owned mutation");
  assert.deepEqual(second.aliases, ["edit", "write"]);
  assert.equal(second.resolveToolType(second.aliases), "edit");
});
test("native deny rules outrank trusted allows and preserve exact matching rule", async () => {
  const f = toolPermissionFixture({
    rules: {
      denyRules: { userSettings: ["Write"] },
      allowRules: { session: ["Write"] },
    },
  });
  const out = await f.run();
  assert.equal(out.result.behavior, "deny");
  assert.equal(out.result.decisionReason.rule.originalRule, "Write");
});
test("native trusted allow precedes safety but untrusted project allow does not", async () => {
  const spec = {
    tool: "Bash",
    args: [{ type: "command", value: "rm -rf /owned/fixture" }],
    rules: { allowRules: { projectSettings: ["Bash"] } },
  };
  assert.equal(
    (await toolPermissionFixture({ ...spec, trusted: true }).run()).result
      .behavior,
    "allow",
  );
  assert.equal(
    (await toolPermissionFixture({ ...spec, trusted: false }).run()).result
      .behavior,
    "ask",
  );
});
test("native command allow requires every subcommand while deny needs only one match", () => {
  const { utils } = toolPermissionFixture(),
    args = [{ type: "command", value: "echo owned && rm -rf /owned/fixture" }];
  assert.equal(
    utils.checkAllowPermissionRules(
      utils.matchPermissionRules(["Bash(echo:*)"], ["bash"]),
      args,
    ),
    false,
  );
  assert.equal(
    utils.checkPermissionRules(
      utils.matchPermissionRules(["Bash(rm:*)"], ["bash"]),
      args,
    ),
    true,
  );
  assert.equal(
    utils.isCommandAllowed("echo:*", "echo owned > /owned/file"),
    false,
  );
});
test("native MCP matching supports exact, server and server wildcard but not builtin aliases", () => {
  const { utils } = toolPermissionFixture();
  for (const rule of ["mcp__owned__tool", "mcp__owned", "mcp__owned__*"])
    assert.ok(
      utils.matchMcpPermissionRules([rule], ["mcp__owned__tool"]).length,
    );
  assert.equal(
    utils.matchMcpPermissionRules(["Read"], ["mcp__owned__Read"]).length,
    0,
  );
});
test("native dontAsk turns approval into a precise mode denial", async () => {
  const out = await toolPermissionFixture({
    mode: PermissionMode.DontAsk,
  }).run();
  assert.equal(out.result.behavior, "deny");
  assert.equal(out.result.decisionReason.type, "modeDeny");
  assert.match(out.result.message, /dontAsk mode/);
});
test("native explicit ask rule is not overridden by auto classifier", async () => {
  const out = await toolPermissionFixture({
    mode: PermissionMode.Auto,
    rules: { askRules: { userSettings: ["Write"] } },
  }).run();
  assert.equal(out.result.behavior, "ask");
  assert.equal(
    out.events.some((e) => e[0] === "classify"),
    false,
  );
});
test("native unavailable auto mode downgrades Auto or Plan pre-mode and does not fake approval", async () => {
  for (const mode of [PermissionMode.Auto, PermissionMode.Plan]) {
    const out = await toolPermissionFixture({
      mode,
      meta: { prePlanPermissionMode: PermissionMode.Auto },
      autoAvailable: false,
    }).run();
    assert.equal(out.result.behavior, "ask");
    assert.equal(
      mode === PermissionMode.Auto ? out.mode : out.meta.prePlanPermissionMode,
      PermissionMode.Default,
    );
  }
});
test("native auto headless denial limits abort, while interactive fallback remains ask", async () => {
  const out = await toolPermissionFixture({
    mode: PermissionMode.Auto,
    classification: {
      behavior: "denialLimitExceeded",
      headlessAbort: true,
      reason: "owned limit",
    },
  }).run();
  assert.equal(out.aborted, true);
  assert.equal(out.result.behavior, "deny");
});
test("native Plan permits its own plan file edit and delegates unrelated edits", async () => {
  for (const target of ["/owned/project/plan.md", "/owned/project/other.md"]) {
    const out = await toolPermissionFixture({
      mode: PermissionMode.Plan,
      args: [{ type: "filePath", value: target }],
    }).run();
    assert.equal(
      out.result.behavior,
      target.endsWith("/plan.md") ? "allow" : "ask",
    );
  }
});
test("native initializeContext merges four scoped settings and sandbox deny rules", async () => {
  const f = toolPermissionFixture({
    settings: {
      user: { allow: ["Read"], additionalDirectories: ["/owned/extra"] },
      cli: { disableBypassPermissionsMode: "disable" },
    },
    sandbox: {
      enabled: true,
      filesystem: {
        denyRead: ["/owned/private"],
        denyWrite: ["/owned/no-write"],
      },
    },
  });
  await f.service.initializeContext(f.session);
  assert.deepEqual(f.session.toolPermissionContext.allowRules.userSettings, [
    "Read",
  ]);
  assert.equal(
    f.session.toolPermissionContext.isBypassPermissionsModeAvailable,
    false,
  );
  assert.equal(f.session.toolPermissionContext.denyRules.sandbox.length, 8);
  assert.ok(
    f.session.toolPermissionContext.additionalWorkingDirectories.has(
      "/owned/extra",
    ),
  );
});
test("native updates mutate directory Map but replace rule containers and persist destination", async () => {
  const f = toolPermissionFixture();
  await f.service.initializeContext(f.session);
  const old = f.session.toolPermissionContext,
    dirs = old.additionalWorkingDirectories;
  await f.service.applyUpdate(f.session, {
    type: "addDirectories",
    directories: ["/owned/extra"],
    destination: "session",
  });
  assert.equal(
    f.session.toolPermissionContext.additionalWorkingDirectories,
    dirs,
  );
  assert.ok(dirs.has("/owned/extra"));
  await f.service.applyUpdate(f.session, {
    type: "addRules",
    rules: [{ toolName: "Read", ruleContent: "**/*.ts" }],
    behavior: "allow",
    destination: "userSettings",
  });
  assert.notEqual(f.session.toolPermissionContext.allowRules, old.allowRules);
  assert.deepEqual(f.saved.get("user\0permissions").allow, ["Read(**/*.ts)"]);
});
test("native hook allow/deny return false to SDK and cache the execution decision", async () => {
  for (const permissionDecision of ["allow", "deny"]) {
    const out = await toolPermissionFixture({
      pre: { allowed: permissionDecision === "allow", permissionDecision },
    }).run("needs");
    assert.equal(out.result, false);
    assert.equal(
      out.cache.get("owned-call").permissionDecision,
      permissionDecision,
    );
  }
});
test("native policy deny dispatches PermissionDenied before caching, no callId throws", async () => {
  const spec = { rules: { denyRules: { session: ["Write"] } } };
  const out = await toolPermissionFixture(spec).run("needs");
  assert.equal(out.result, false);
  assert.equal(out.cache.get("owned-call").permissionDecision, "deny");
  assert.ok(out.events.some((e) => e[0] === "permissionDenied"));
  assert.equal(
    (await toolPermissionFixture({ ...spec, noCallId: true }).run("needs"))
      .result.thrown,
    "PermissionDeniedError",
  );
});
test("native PermissionRequest allow shallow-caches updatedInput; hook exceptions fall back to ask", async () => {
  const out = await toolPermissionFixture({
    requestDecision: {
      behavior: "allow",
      updatedInput: { file_path: "changed" },
    },
  }).run("needs");
  assert.equal(out.result, false);
  assert.deepEqual(out.cache.get("owned-call").modifiedInput, {
    file_path: "changed",
  });
  assert.equal(
    (
      await toolPermissionFixture({ preError: true, requestError: true }).run(
        "needs",
      )
    ).result,
    true,
  );
});
test("native risk classifier keeps desktop policy, quote/redirection/heredoc handling", () => {
  const f = toolPermissionFixture(),
    cmd = f.commands.CommandUtils;
  assert.equal(
    cmd.checkCommandSafety("rm -rf /owned/fixture").riskLevel,
    "high",
  );
  assert.equal(
    cmd.checkCommandSafety("git reset --hard").riskLevel,
    "critical",
  );
  assert.equal(cmd.checkCommandSafety("echo x | xargs rm").riskLevel, "high");
  assert.equal(
    cmd.checkCommandSafety("cat <<'EOF'\nrm -rf /owned/fixture\nEOF\n")
      .riskLevel,
    "safe",
  );
});

setTraceProcessors([]);
async function ownedSdk(t: any, permissionHost: any = {}, deferred = false) {
  const root = await mkdtemp(join(tmpdir(), "harness-permission-sdk-")),
    approvals: string[] = [],
    calls: any[] = [];
  let turn = 0;
  const target = join(root, "fixture.txt");
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      calls.push(request);
      const output: any[] =
        ++turn === 1
          ? [
              {
                type: "function_call",
                name: deferred ? "DeferExecuteTool" : "Write",
                id: "owned-write",
                callId: "owned-write",
                arguments: JSON.stringify(
                  deferred
                    ? {
                        toolName: "Write",
                        params: { file_path: target, content: "original" },
                      }
                    : { file_path: target, content: "original" },
                ),
                status: "completed",
              },
            ]
          : [
              {
                type: "message",
                role: "assistant",
                id: "owned-answer",
                status: "completed",
                content: [{ type: "output_text", text: "settled" }],
              },
            ];
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: `owned-${turn}`,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
  const h = await createHarness({
    workDir: root,
    modelProvider: { getModel: () => model },
    recordReplayEnv: {},
    nativePermissions: true,
    permissionHost,
    approveTool(name) {
      approvals.push(name);
      return true;
    },
  });
  t.after(async () => {
    await h.close();
    await rm(root, { recursive: true, force: true });
  });
  if (deferred) await h.tools.ensureBuiltinDeferIndexed("Write");
  return { h, root, target, approvals, calls, session: await h.openSession() };
}
test("real SDK reevaluates native pre-hook on resume, then execution consumes the latest cached rewrite", async (t) => {
  let pre = 0;
  const f = await ownedSdk(t, {
    toolHookManager: {
      async executePreToolUseHooks() {
        pre++;
        return { allowed: true, modifiedInput: { content: "rewritten" } };
      },
    },
  });
  assert.equal(await f.h.prompt(f.session, "write owned fixture"), "settled");
  assert.equal(
    pre,
    2,
    "SDK 0.5.2 calls needsApproval before and after resume; the original method overwrites rather than short-circuits the cache",
  );
  assert.deepEqual(f.approvals, ["Write"]);
  assert.equal(await readFile(f.target, "utf8"), "rewritten");
  assert.equal(f.session.preToolUseHookResults?.size, 0);
});
test("real SDK cached deny never reaches standalone approval or filesystem", async (t) => {
  const f = await ownedSdk(t, {
    toolHookManager: {
      async executePreToolUseHooks() {
        return {
          allowed: false,
          message: "owned native block",
          permissionDecision: "deny",
        };
      },
    },
  });
  assert.equal(await f.h.prompt(f.session, "write owned fixture"), "settled");
  assert.deepEqual(f.approvals, []);
  await assert.rejects(access(f.target));
  assert.match(JSON.stringify(f.session.history), /owned native block/);
});
test("real SDK PermissionRequest callback rewrite bypasses SDK pause but retains explicit host guard", async (t) => {
  let requests = 0;
  const f = await ownedSdk(t, {
    sessionHookManager: {
      async executePermissionRequestHooks() {
        requests++;
        return {
          decision: {
            behavior: "allow",
            updatedInput: { content: "request rewrite" },
          },
        };
      },
    },
  });
  assert.equal(await f.h.prompt(f.session, "write owned fixture"), "settled");
  assert.equal(requests, 1);
  assert.equal(await readFile(f.target, "utf8"), "request rewrite");
  assert.deepEqual(
    f.approvals,
    ["Write"],
    "explicit standalone guard is still separate from the recovered classifier",
  );
});

test("real SDK native deferred outer denial caches before target hook or execution", async (t) => {
  let pre = 0;
  const f = await ownedSdk(
    t,
    {
      settingsManager: {
        async get() {
          return { deny: ["DeferExecuteTool"] };
        },
        async set() {},
      },
      toolHookManager: {
        async executePreToolUseHooks() {
          pre++;
          return { allowed: true };
        },
      },
    },
    true,
  );
  assert.equal(await f.h.prompt(f.session, "deferred owned write"), "settled");
  assert.equal(pre, 0);
  assert.deepEqual(f.approvals, []);
  await assert.rejects(access(f.target));
});
test("real SDK native deferred approval reaches builtin target through original callback", async (t) => {
  const f = await ownedSdk(t, {}, true);
  assert.equal(await f.h.prompt(f.session, "deferred owned write"), "settled");
  const result = (f.session.history as any[]).find(
    (item) => item.type === "function_call_result",
  );
  assert.ok(!JSON.stringify(result).includes("Error"), JSON.stringify(result));
  assert.equal(await readFile(f.target, "utf8"), "original");
  assert.deepEqual(f.approvals, ["Write"]);
});
