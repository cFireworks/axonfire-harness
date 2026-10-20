import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { userPromptFixture } from "../scripts/helpers/user-prompt-fixtures.js";
import {
  createUserPromptHost,
  type UserPromptHostOptions,
} from "../src/prompts/user-prompt-host.js";
import { createResourcePromptHost } from "../src/prompts/resource-prompt-host.js";
const text = (blocks: any[]) =>
  blocks
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
async function fixture(t: any) {
  const root = await fs.mkdtemp(join(tmpdir(), "user-prompts-")),
    h = await userPromptFixture(root);
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return h;
}
async function host(t: any, patch: Partial<UserPromptHostOptions> = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), "user-prompt-host-"));
  const h = await createUserPromptHost({
    stateDir: join(root, "state"),
    getWorkDir: () => root,
    ...patch,
  });
  t.after(async () => {
    await h.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  return { h, root };
}
test("all 17 sections are lazily cached in fixed source order", async (t) => {
  const h = await fixture(t),
    sections = h.service.getSections();
  assert.equal(h.service.getSections(), sections);
  assert.deepEqual(
    sections.map((s: any) => s.constructor.name),
    [
      "UserInfoSection",
      "IdentityContextSection",
      "RulesSection",
      "ProjectContextSection",
      "AdditionalDataSection",
      "TencentDocsAdditionalSection",
      "UserCommandSection",
      "SpecialInstructionsSection",
      "SystemReminderSection",
      "ModeTransitionReminderSection",
      "CurrentExpertReminderSection",
      "WorkingMemoryReminderSection",
      "AutomationSystemReminderSection",
      "AttachedSkillsSection",
      "ArdotFileDirectiveSection",
      "ArdotDesignStyleSection",
      "ArdotImageGenSection",
    ],
  );
});
test("first-turn suppression retains every-turn data and leaves caller prompt blocks unmodified", async (t) => {
  const h = await fixture(t),
    request = h.request({
      _meta: { "codebuddy.ai": { scenarioRules: "rule" } },
    }),
    before = structuredClone(request.prompt);
  const first = text(await h.service.composeUserPrompt(request));
  assert.match(first, /<user_info>/);
  assert.match(first, /<fixture-identity\/>/);
  assert.match(first, /<rules>/);
  assert.match(first, /<project_context>/);
  const later = text(
    await h.service.composeUserPrompt({
      ...request,
      hasPriorUserMessages: true,
    }),
  );
  assert.doesNotMatch(
    later,
    /<user_info>|<fixture-identity\/>|<rules>|<project_context>/,
  );
  assert.match(later, /<current_time>/);
  assert.deepEqual(request.prompt, before);
});
test("clear-session short-circuits before connector queries and returns original array identity", async (t) => {
  const h = await fixture(t);
  h.service.connectorService = {
    getConfigs() {
      throw Error("must not query");
    },
  };
  const req = h.request({
    _meta: { "codebuddy.ai": { isClearSession: true } },
  });
  assert.equal(await h.service.composeUserPrompt(req), req.prompt);
  assert.equal(h.service.sections, undefined);
});
test("empty / invalid prompt early returns preserve reference and array metadata is accepted", async (t) => {
  const h = await fixture(t);
  for (const prompt of [[], null, "text", undefined])
    assert.equal(
      await h.service.composeUserPrompt(h.request({ prompt })),
      prompt,
    );
  const arr: any = [];
  arr.commandPrompt = " cmd ";
  assert.equal(h.native.getCodebuddyMeta({ "codebuddy.ai": arr }), arr);
  assert.equal(h.native.getCommandPrompt(arr), "cmd");
});
test("Teams uses two hidden roles and replaces todo / message chips with original occupier encoding", async (t) => {
  const h = await fixture(t),
    prompt = [
      {
        type: "resource_link",
        uri: "todo://t",
        name: "Todo",
        _meta: { mentionType: "todo", todoId: "t" },
      },
      {
        type: "resource_link",
        uri: "msg://m",
        _meta: {
          mentionType: "message",
          messageId: "m",
          author: " A\nB ",
          snippet: 'x"\\y',
        },
      },
    ];
  const out = await h.service.composeUserPrompt(
    h.request({ prompt, _meta: { "codebuddy.ai": { projectId: "p" } } }),
  );
  assert.match(out[0].text, /data-role="user-context"/);
  assert.match(out[1].text, /data-role="additional-data"/);
  assert.match(out[0].text, /<team-project-context>/);
  assert.doesNotMatch(out[0].text, /<current_time>/);
  assert.deepEqual(out.slice(-2), [
    { type: "text", text: "@todo:t Todo" },
    { type: "text", text: '@msg:A B"x\\"\\\\y"' },
  ]);
  assert.equal(prompt[0]!.type, "resource_link");
});
test("whitespace projectId is truthy in original service and references remain only paths", async (t) => {
  const h = await fixture(t),
    out = text(
      await h.service.composeUserPrompt(
        h.request({
          prompt: [
            {
              type: "resource_link",
              uri: "file://" + join(h.cwd, "missing.txt"),
            },
          ],
          _meta: { "codebuddy.ai": { projectId: " " } },
        }),
      ),
    );
  assert.match(out, /<team-project-context>/);
  assert.match(out, /<user_references>/);
  assert.match(out, /missing\.txt/);
});
test("work-summary prefers todo contents, persists every turn, and ignores empty clearing attempts", async (t) => {
  const h = await fixture(t);
  assert.match(
    h.service.resolveWorkSummary("s", { workSummary: "meta" }, [
      " first ",
      " second ",
    ]),
    /first\n\nsecond/,
  );
  assert.match(
    h.service.resolveWorkSummary("s", { workSummary: " " }),
    /first\n\nsecond/,
  );
  h.service.clearProjectCaches();
  assert.ok(h.service.resolveWorkSummary("s", {}));
  h.service.cleanup();
  assert.equal(h.service.resolveWorkSummary("s", {}), undefined);
});
test("project instruction identity is trimmed body, not version/project; empty preserves prior", async (t) => {
  const h = await fixture(t);
  let body = " first ",
    version = 1;
  h.service.setProjectInstructionsResolver(async () => ({
    instructions: body,
    version,
  }));
  const a = await h.service.resolveProjectInstructions("s", "p");
  assert.match(a, /<project-instructions>/);
  version++;
  assert.equal(await h.service.resolveProjectInstructions("s", "p"), undefined);
  body = " ";
  assert.equal(await h.service.resolveProjectInstructions("s", "p"), undefined);
  body = "next";
  assert.match(
    await h.service.resolveProjectInstructions("s", "other"),
    /previous/i,
  );
});
test("netdrive cache is keyed only by session and concurrent second call has no in-flight join", async (t) => {
  const h = await fixture(t);
  let release: any,
    count = 0;
  h.service.setProjectNetdriveRootResolver(() => {
    count++;
    return new Promise((r) => (release = r));
  });
  const first = h.service.resolveProjectNetdriveRoot("s", "p", false);
  assert.equal(
    await h.service.resolveProjectNetdriveRoot("s", "q", false),
    undefined,
  );
  release({ fileId: "f" });
  assert.deepEqual(await first, { fileId: "f" });
  assert.deepEqual(await h.service.resolveProjectNetdriveRoot("s", "q", true), {
    fileId: "f",
  });
  assert.equal(count, 1);
});
test("skipCall without cache does not mark session; ordinary failure caches null", async (t) => {
  const h = await fixture(t);
  let count = 0;
  h.service.setProjectNetdriveRootResolver(async () => {
    count++;
    throw Error("offline");
  });
  assert.equal(
    await h.service.resolveProjectNetdriveRoot("s", "p", true),
    undefined,
  );
  assert.equal(h.service.resolvedProjectNetdriveRootSessions.size, 0);
  await h.service.resolveProjectNetdriveRoot("s", "p", false);
  await h.service.resolveProjectNetdriveRoot("s", "p", false);
  assert.equal(count, 1);
  assert.equal(h.service.projectNetdriveRootCache.get("s"), null);
});
test("only original 17201/17210 codes clear project caches, not work summary / connector fingerprints", async (t) => {
  const h = await fixture(t);
  for (const code of [17201, "17210"]) {
    h.service.lastSentProjectInstructions.set("s", "x");
    h.service.workSummaryBySession.set("s", "w");
    h.service.lastSentConnectorStatus.set("s", "c");
    h.service.setProjectNetdriveRootResolver(async () => {
      throw { code };
    });
    await h.service.resolveProjectNetdriveRoot("s", "p", false);
    assert.equal(h.service.lastSentProjectInstructions.size, 0);
    assert.equal(h.service.workSummaryBySession.size, 1);
    assert.equal(h.service.lastSentConnectorStatus.size, 1);
  }
  for (const code of [404, "17201 ", "-17201", undefined])
    assert.equal(h.native.isProjectAccessError({ code }), false);
});
test("connector diff omits names and empty lists do not clear previous fingerprint", async (t) => {
  const h = await fixture(t);
  let configs = [{ id: "x", name: "A" }];
  h.service.connectorService = {
    getConfigs: async () => configs,
    getStates: async () => ({ x: { status: "connected" } }),
  };
  assert.equal(
    (await h.service.resolveConnectorStatus("s"))[0].displayName,
    "A",
  );
  configs = [{ id: "x", name: "B" }];
  assert.equal(await h.service.resolveConnectorStatus("s"), undefined);
  configs = [];
  await h.service.resolveConnectorStatus("s");
  configs = [{ id: "x", name: "B" }];
  assert.equal(await h.service.resolveConnectorStatus("s"), undefined);
});
test("virtual Agent Mail still requires ConnectorService; enterpriseId gate is independent of account type", async (t) => {
  const h = await fixture(t);
  h.product.productFeatures.AgentMail = true;
  h.account.type = "exclusive";
  assert.equal(h.service.isAgentMailEligible(), true);
  assert.equal(await h.service.resolveConnectorStatus("s"), undefined);
  h.service.connectorService = {
    getConfigs: async () => [],
    getStates: async () => ({}),
  };
  assert.equal(
    (await h.service.resolveConnectorStatus("s"))[0].configId,
    "agent-mail",
  );
  h.account.enterpriseId = "e";
  assert.equal(h.service.isAgentMailEligible(), false);
});
test("TencentDocs config selects enterprise/VPC key and accepts only strict true", async (t) => {
  const h = await fixture(t),
    fn = h.native.resolveTencentDocsAiEditConfigEnabled;
  assert.equal(fn({ TencentDocsAiEdit: true }, { type: "personal" }), true);
  assert.equal(fn({ TencentDocsAiEdit: true }, { type: "ultimate" }), false);
  assert.equal(
    fn({ TencentDocsAiEditEnterprise: true }, { type: "exclusive" }),
    true,
  );
  assert.equal(fn({ TencentDocsAiEdit: "true" }, {}), false);
});
test("Docs section static routing rules have bounded FIFO and only remember nonempty output", async (t) => {
  const h = await fixture(t),
    section = new h.native.TencentDocsAdditionalSection();
  for (let n = 0; n < 513; n++) section.rememberRoutingRulesInjected(String(n));
  assert.equal(section.routingRulesInjectedSessions.size, 512);
  assert.equal(section.routingRulesInjectedSessions.has("0"), false);
  assert.equal(await section.render({ sessionId: "empty", prompt: [] }), "");
  assert.equal(section.routingRulesInjectedSessions.has("empty"), false);
});
test("selection parser strips UI text fields and rejects local preview md5 file ids", async (t) => {
  const h = await fixture(t),
    file = join(h.cwd, "a.xlsx"),
    md5 = h.native.computeLocalPreviewGlobalPadId(file);
  const result = h.native.parseTencentDocsSelectionBlock({
    type: "resource_link",
    _meta: {
      mentionType: "tencentDocsSelection",
      filePath: file,
      fileId: md5,
      rangeId: "r",
      selectionPayload: {
        text: "badge",
        description: "UI",
        aiPrompt: "no",
        sourceApi: "ui",
        rangeId: "r",
      },
    },
  });
  assert.equal(result.fileId, undefined);
  assert.deepEqual(result.raw, { rangeId: "r" });
});
test("IMA URI malformed percent escapes retain original throw instead of silent repair", async (t) => {
  const h = await fixture(t);
  assert.throws(
    () =>
      h.native.getAttachedImaFiles([
        { type: "resource_link", uri: "ima://bad%/f" },
      ]),
    URIError,
  );
});
test("XML escaping and CDATA splitting preserve source-specific distinctions", async (t) => {
  const h = await fixture(t);
  assert.equal(
    h.native.wrapXmlTextCdata("a]]>b"),
    "<![CDATA[a]]]]><![CDATA[>b]]>",
  );
  assert.match(
    h.native
      .renderTodoReferenceXml([
        { todoId: 'x"', title: "<&", suggestions: "a<&" },
      ])
      .join("\n"),
    /x&quot;/,
  );
  assert.match(
    h.native
      .renderWechatChatHistory([
        {
          fileName: "x",
          extractedDirPath: "/owned",
          chatHistoryText: "<script>",
          mediaFiles: [],
        },
      ])
      .join("\n"),
    /&lt;script&gt;/,
  );
});
test("command section mutates metadata before SpecialInstructions, builtin commands are skipped", async (t) => {
  const h = await fixture(t),
    dir = join(h.configDir, "plugins/marketplaces/m/p/commands");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(join(dir, "cmd.md"), "---\nname: Visible\n---\nBODY");
  const meta = { "codebuddy.ai": { commandPrompt: "existing" } },
    req = h.request({
      prompt: [
        { type: "resource_link", uri: "command://m:p:/Visible" },
        { type: "resource_link", uri: "command://init" },
      ],
      _meta: meta,
    });
  const out = text(await h.service.composeUserPrompt(req));
  assert.equal(meta["codebuddy.ai"].commandPrompt, "existing\n\nBODY");
  assert.match(out, /existing\n\nBODY/);
  assert.doesNotMatch(out, /status="unresolved"/);
});
test("first existing guidance wins even if empty; truncation is source 8000 UTF16 chars", async (t) => {
  const h = await fixture(t);
  await fs.writeFile(join(h.cwd, "CODEBUDDY.md"), "");
  await fs.writeFile(join(h.cwd, "AGENTS.md"), "SECOND");
  assert.doesNotMatch(await h.native.readProjectGuidance(h.cwd), /SECOND/);
  await fs.writeFile(join(h.cwd, "CODEBUDDY.md"), "x".repeat(8001));
  const b = await h.native.readProjectGuidance(h.cwd);
  assert.match(b, /too long, omitted/);
  assert.doesNotMatch(b, /x{8001}/);
});
test("project layout hides dot entries and caps visible top-level listing at 40", async (t) => {
  const h = await fixture(t);
  await fs.writeFile(join(h.cwd, ".hidden"), "x");
  for (let n = 0; n < 42; n++)
    await fs.writeFile(join(h.cwd, String(n).padStart(2, "0") + ".ts"), "x");
  const out = await h.native.readProjectLayout(h.cwd);
  assert.doesNotMatch(out, /\.hidden|41.ts/);
  assert.match(out, /- \.\.\./);
});
test("expert switch tags complete prompt, truncates at 20000; cancellation uses previous selection", async (t) => {
  const h = await fixture(t),
    file = join(h.cwd, "expert.md");
  await fs.writeFile(file, "x".repeat(20001));
  h.service.expertPluginService = {
    resolveExpertAgentPromptSource: async () => ({
      agentName: 'A"<&',
      filePath: file,
    }),
  };
  const out = await h.service.composeUserPrompt(
    h.request({ desiredConfig: { expertId: "e" } }),
  );
  assert.equal(out[0]._meta["codebuddy.ai/expertSelection"], true);
  assert.match(out[0].text, /too long, see/);
  assert.match(out[0].text, /A&quot;&lt;&amp;/);
  assert.doesNotMatch(out[0].text, /x{20001}/);
  const cancelled = await h.service.composeUserPrompt(
    h.request({
      _meta: { "codebuddy.ai": { previousExpertSelection: { id: "e" } } },
    }),
  );
  assert.match(cancelled[0].text, /state="cancelled"/);
});
test("mode transition and plan reminders use real byte-preserved templates", async (t) => {
  const h = await fixture(t);
  for (const [mode, file] of [
    ["ask", "ask-mode-reminder.tpl"],
    ["craft", "craft-mode-reminder.tpl"],
  ]) {
    const expected = await fs.readFile(
      h.native.requirePromptTemplate(file),
      "utf8",
    );
    const section = new h.native.ModeTransitionReminderSection();
    assert.equal(
      await section.render({ codebuddyMeta: { mode, previousMode: "plan" } }),
      expected,
    );
    assert.equal(section.shouldApply({ codebuddyMeta: { mode } }), false);
  }
  const system = new h.native.SystemReminderSection();
  assert.equal(
    await system.render({ codebuddyMeta: { mode: "plan" } }),
    await fs.readFile(
      h.native.requirePromptTemplate("system-reminder.tpl"),
      "utf8",
    ),
  );
});
test("owned host composes real resource identity plus first/every-turn sections without model/network", async (t) => {
  const { h, root } = await host(t);
  const out = await h.composeUserPrompt({
    sessionId: "s",
    cwd: root,
    prompt: [{ type: "text", text: "hello" }],
  });
  assert.match(text(out), /<user_info>/);
  assert.match(text(out), /<current_time>/);
  assert.equal(out.at(-1).text, "hello");
  assert.ok(h.resourcePromptHost.service);
  const next = await h.composeUserPrompt({
    sessionId: "s",
    cwd: root,
    hasPriorUserMessages: true,
    prompt: [{ type: "text", text: "again" }],
  });
  assert.doesNotMatch(text(next), /<user_info>/);
});
test("owned host rejects new work on close while draining accepted composition and cleaning caches", async (t) => {
  let release: any, entered: any;
  const ready = new Promise((r) => (entered = r));
  const { h, root } = await host(t, {
    projectInstructionsResolver: () => {
      entered();
      return new Promise((r) => (release = r));
    },
  });
  const pending = h.composeUserPrompt({
    sessionId: "s",
    cwd: root,
    prompt: [{ type: "text", text: "x" }],
    _meta: { "codebuddy.ai": { projectId: "p" } },
  });
  await ready;
  const closing = h.close();
  assert.equal(h.closed, true);
  assert.ok(h.pendingCount > 0);
  await assert.rejects(
    h.composeUserPrompt({ sessionId: "other", prompt: [] }),
    /closed/,
  );
  release({ instructions: "finish" });
  assert.match(text(await pending), /finish/);
  await closing;
  assert.equal(h.pendingCount, 0);
  assert.equal(h.service.workSummaryBySession.size, 0);
  assert.equal(h.resourcePromptHost.closed, true);
});
test("closing borrowed-resource user host does not close resource owner", async (t) => {
  const root = await fs.mkdtemp(join(tmpdir(), "user-prompt-borrow-")),
    resource = await createResourcePromptHost({
      stateDir: join(root, "state"),
      getWorkDir: () => root,
    });
  t.after(async () => {
    await resource.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  const h = await createUserPromptHost({
    stateDir: join(root, "unused"),
    getWorkDir: () => root,
    resourcePromptHost: resource,
  });
  await h.close();
  assert.equal(resource.closed, false);
  assert.equal(
    await fs.stat(join(root, "unused")).then(
      () => true,
      () => false,
    ),
    false,
  );
});
test("plugin read roots are explicit; expert symlink escape is omitted without reading external content", async (t) => {
  const outside = await fs.mkdtemp(join(tmpdir(), "user-prompt-outside-"));
  t.after(() => fs.rm(outside, { recursive: true, force: true }));
  const file = join(outside, "secret.md");
  await fs.writeFile(file, "OUTSIDE SENTINEL");
  let target = file;
  const { h, root } = await host(t, {
    expertPluginService: {
      resolveExpertAgentPromptSource: async () => ({
        agentName: "e",
        filePath: target,
      }),
    },
  });
  const req = {
    sessionId: "s",
    cwd: root,
    desiredConfig: { expertId: "e" },
    prompt: [{ type: "text", text: "x" }],
  };
  assert.doesNotMatch(text(await h.composeUserPrompt(req)), /OUTSIDE SENTINEL/);
  target = join(root, "linked.md");
  await fs.symlink(file, target);
  assert.doesNotMatch(text(await h.composeUserPrompt(req)), /OUTSIDE SENTINEL/);
  const allowed = await createUserPromptHost({
    stateDir: join(root, "other"),
    getWorkDir: () => root,
    pluginReadRoots: [outside],
    expertPluginService: {
      resolveExpertAgentPromptSource: async () => ({
        agentName: "e",
        filePath: file,
      }),
    },
  });
  try {
    assert.match(
      text(await allowed.composeUserPrompt(req)),
      /OUTSIDE SENTINEL/,
    );
  } finally {
    await allowed.close();
  }
});
test("enabled external Docs renderer fails explicitly without adapter instead of fake context", async (t) => {
  const { h, root } = await host(t, {
    productManager: {
      getCurrentConfiguration: () => ({
        productFeatures: { TencentDocsAiEdit: true },
      }),
    },
  });
  await assert.rejects(
    h.composeUserPrompt({
      sessionId: "s",
      cwd: root,
      prompt: [{ type: "text", text: "x" }],
    }),
    /engine adapter is required/,
  );
});
test("compose promises reject after close, close is idempotent, synchronous cache APIs also stop", async (t) => {
  const { h } = await host(t);
  const a = h.close(),
    b = h.close();
  assert.equal(a, b);
  await a;
  await assert.rejects(
    h.composeUserPrompt({ sessionId: "s", prompt: [] }),
    /closed/,
  );
  assert.throws(() => h.service.clearProjectCaches(), /closed/);
});
