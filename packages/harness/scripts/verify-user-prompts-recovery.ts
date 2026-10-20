import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import { emittedPrompt } from "./helpers/captured-resource-prompts.js";
import { loadCapturedUserPrompts } from "./helpers/captured-user-prompts.js";
import { userPromptFixture } from "./helpers/user-prompt-fixtures.js";
import {
  USER_PROMPT_CLASSES,
  USER_PROMPT_FUNCTIONS,
  USER_PROMPT_CONSTANTS,
} from "../src/prompts/native-user-prompt.js";
const main =
  process.env.WORKBUDDY_MODE_COORDINATOR ??
  resolve(
    dirname(getCapturedBundlePath()),
    "../../main/workbuddy-auth-product-coordinator.js",
  );
const source = await readFile(main, "utf8"),
  original = loadCapturedUserPrompts(source);
function ast(value: any): any {
  return value && typeof value === "object"
    ? Array.isArray(value)
      ? value.map(ast)
      : Object.fromEntries(
          Object.entries(value)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, ast(v)]),
        )
    : value;
}
const ports = nodesOf(
  parse(emittedPrompt("prompts/native-user-prompt"), {
    ecmaVersion: "latest",
    sourceType: "module",
  }),
);
let members = 0,
  comparisons = 0;
for (const [name, start, end] of USER_PROMPT_CLASSES) {
  const raw: any = (
    parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  const port = ports.find(
    (n) =>
      n.type === "VariableDeclarator" &&
      n.id?.name === name &&
      n.init?.type === "ClassExpression",
  ).init;
  assert.deepEqual(ast(port), ast(raw), name);
  members += raw.body.body.length;
}
for (const [name, start, end] of [
  ...USER_PROMPT_FUNCTIONS,
  ...USER_PROMPT_CONSTANTS,
]) {
  const raw: any = parse(source.slice(start, end), { ecmaVersion: "latest" })
    .body[0];
  assert.ok(
    ports.some(
      (n) =>
        (n.id?.name ?? n.declarations?.[0]?.id?.name) === name &&
        JSON.stringify(ast(n)) === JSON.stringify(ast(raw)),
    ),
    name,
  );
}
// Enum seam is deliberately only these two fixed values, not an invented account policy.
const common = await readFile(resolve(dirname(main), "common.js"), "utf8");
for (const key of ["TencentDocsAiEdit", "TencentDocsAiEditEnterprise"])
  assert.ok(common.includes(`ProductFeature["${key}"] = "${key}";`));
const root = await mkdtemp(join(tmpdir(), "user-prompt-diff-"));
let sequence = 0;
async function pair(
  run: (h: Awaited<ReturnType<typeof userPromptFixture>>) => Promise<any>,
) {
  const results = [];
  for (const captured of [false, true]) {
    const h = await userPromptFixture(
      join(root, String(++sequence).padStart(6, "0")),
      captured ? original : undefined,
    );
    results.push(
      h.snapshot({ output: await run(h), logs: h.logs, calls: h.calls }),
    );
  }
  assert.deepEqual(results[0], results[1], "scenario " + comparisons);
  comparisons++;
}
try {
  for (const prior of [false, true])
    for (const injected of [false, true])
      for (const teams of [false, true])
        await pair(async (h) => {
          h.service.setProjectNetdriveRootResolver(async (id: string) => ({
            fileId: "root&1",
            dirName: "Dir",
            projectId: id,
          }));
          h.service.setProjectInstructionsResolver(async () => ({
            instructions: "body <safe>",
            version: "v1",
          }));
          return h.service.composeUserPrompt(
            h.request({
              hasPriorUserMessages: prior,
              _meta: {
                "codebuddy.ai": {
                  alreadyInjectedUserContext: injected,
                  projectId: teams ? "p" : undefined,
                  scenarioRules: "rules",
                  workSummary: "summary",
                },
              },
            }),
          );
        });
  for (const mode of [undefined, "ask", "craft", "plan", "other"])
    for (const previousMode of [undefined, "ask", "craft", "plan", ""])
      await pair(async (h) =>
        h.service.composeUserPrompt(
          h.request({
            desiredConfig: { mode },
            _meta: {
              "codebuddy.ai": {
                mode,
                previousMode,
                ardotFileAction: "create",
                imageMode: "ai",
                designStyleType: "ui",
                designStyleId: "style<",
                designStyleUrl: "https://example.invalid/visual.md?x=1&y=2",
              },
            },
          }),
        ),
      );
  for (const action of ["create", "open", "ambiguous", "none", ""])
    await pair(async (h) =>
      h.service.composeUserPrompt(
        h.request({
          _meta: {
            "codebuddy.ai": {
              ardotFileAction: action,
              commandPrompt: "command ]]> body",
              integrationPrompt: " integration ",
              automationSystemReminder: "<reminder/>",
            },
          },
        }),
      ),
    );
  await pair(async (h) => {
    const prompt = [
      { type: "text", text: "hi" },
      {
        type: "resource_link",
        uri: "todo://T",
        name: "todo",
        _meta: {
          mentionType: "todo",
          todoSuggestions: "suggest <&",
          workSummary: "todo summary",
          todoTags: ["agent:a", "invalid:x", "skill:s"],
        },
      },
      {
        type: "resource_link",
        uri: "msg://1",
        _meta: {
          mentionType: "message",
          messageId: "M",
          replyId: "R",
          author: "A\nB",
          snippet: 'say "x"\\test',
        },
      },
      { type: "resource_link", uri: "skill://abc", name: "Skill" },
      {
        type: "resource_link",
        uri: "netdrive://x",
        _meta: { fileId: "X", title: "folder", isFolder: true },
      },
      { type: "resource_link", uri: "file://" + h.cwd + "/a.md", name: "A" },
    ];
    const first = await h.service.composeUserPrompt(
      h.request({ prompt, _meta: { "codebuddy.ai": { projectId: "p" } } }),
    );
    const next = await h.service.composeUserPrompt(
      h.request({
        hasPriorUserMessages: true,
        _meta: { "codebuddy.ai": { projectId: "p" } },
      }),
    );
    return {
      first,
      next,
      prompt,
      attachments: h.native.attachmentsBySession,
      summary: h.service.workSummaryBySession,
    };
  });
  for (const type of ["personal", "ultimate", "exclusive", "", undefined])
    for (const enterpriseId of ["", "e"])
      await pair(async (h) => {
        Object.assign(h.account, { type, enterpriseId });
        Object.assign(h.product.productFeatures, {
          TencentDocsAiEdit: true,
          TencentDocsAiEditEnterprise: false,
          AgentMail: true,
        });
        h.service.connectorService = {
          getConfigs: async () => [],
          getStates: async () => ({}),
        };
        return {
          gate: h.service.resolveTencentDocsAiEditEnabled(),
          mail: h.service.isAgentMailEligible(),
          prompt: await h.service.composeUserPrompt(h.request()),
        };
      });
  await pair(async (h) => {
    Object.assign(h.product.productFeatures, { TencentDocsAiEdit: true });
    const prompt = [
      { type: "text", text: 'edit @"/owned/report.xlsx" and deck.pptx' },
      {
        type: "resource_link",
        uri: "tdoc://FID",
        name: "Doc",
        _meta: { fileUrl: "https://docs.example.invalid/x?q=1" },
      },
      {
        type: "resource_link",
        uri: "tdoc-selection://x",
        _meta: {
          mentionType: "tencentDocsSelection",
          filePath: "tdoc://FID",
          rangeId: "r",
          selectionPayload: {
            text: "UI only",
            description: "badge",
            title: "Doc",
            aiPrompt: "ignored",
            sourceApi: "ignored",
            rangeId: "r",
          },
        },
      },
    ];
    return [
      await h.service.composeUserPrompt(h.request({ prompt })),
      await h.service.composeUserPrompt(
        h.request({ prompt, hasPriorUserMessages: true }),
      ),
    ];
  });
  await pair(async (h) => {
    Object.assign(h.product.productFeatures, { TencentDocsAiEdit: true });
    h.service.sections = [
      new h.native.TencentDocsAdditionalSection(() => {
        throw Error("gate");
      }),
    ];
    return h.service.composeUserPrompt(h.request());
  });
  for (const failure of [17201, "17210", 404, "17201 ", "-17210", null])
    await pair(async (h) => {
      h.service.lastSentProjectInstructions.set("s", "old");
      h.service.workSummaryBySession.set("s", "summary");
      h.service.lastSentConnectorStatus.set("s", "fingerprint");
      h.service.setProjectNetdriveRootResolver(async () => {
        throw { code: failure };
      });
      const result = await h.service.resolveProjectNetdriveRoot(
        "s",
        "p",
        false,
      );
      return {
        result,
        resolved: h.service.resolvedProjectNetdriveRootSessions,
        roots: h.service.projectNetdriveRootCache,
        instructions: h.service.lastSentProjectInstructions,
        summary: h.service.workSummaryBySession,
        connectors: h.service.lastSentConnectorStatus,
      };
    });
  await pair(async (h) => {
    let name = "A",
      status = "connected";
    h.service.connectorService = {
      getConfigs: async () => [{ id: "netdrive__tdrive", name }],
      getStates: async () => ({ netdrive__tdrive: { status } }),
    };
    const a = await h.service.resolveConnectorStatus("s");
    name = "B";
    const b = await h.service.resolveConnectorStatus("s");
    status = "error";
    const c = await h.service.resolveConnectorStatus("s");
    h.service.connectorService.getConfigs = async () => [];
    const empty = await h.service.resolveConnectorStatus("s");
    h.service.connectorService.getConfigs = async () => [
      { id: "netdrive__tdrive", name },
    ];
    const d = await h.service.resolveConnectorStatus("s");
    return { a, b, c, empty, d };
  });
  await pair(async (h) => {
    let instructions = " first ",
      version = 1;
    h.service.setProjectInstructionsResolver(async () => ({
      instructions,
      version,
    }));
    const result = [];
    result.push(await h.service.resolveProjectInstructions("s", "p"));
    version++;
    result.push(await h.service.resolveProjectInstructions("s", "p"));
    instructions = " ";
    result.push(await h.service.resolveProjectInstructions("s", "p"));
    instructions = "next";
    result.push(await h.service.resolveProjectInstructions("s", "other"));
    return result;
  });
  await pair(async (h) => {
    let release: any;
    h.service.setProjectNetdriveRootResolver(
      () => new Promise((resolve) => (release = resolve)),
    );
    const first = h.service.resolveProjectNetdriveRoot("s", "p", false);
    const concurrent = await h.service.resolveProjectNetdriveRoot(
      "s",
      "other",
      false,
    );
    release({ fileId: "r" });
    return {
      first: await first,
      concurrent,
      cached: await h.service.resolveProjectNetdriveRoot("s", "new", true),
    };
  });
  for (const disabled of [undefined, false, true, "true"])
    await pair(async (h) => {
      h.config.disableLocalSkillsMemory = disabled;
      return h.service.composeUserPrompt(h.request());
    });
  for (const uri of [
    "command://init",
    "command://",
    "command://market:plugin:/missing",
    "command://bad:only",
  ])
    await pair(async (h) =>
      h.service.composeUserPrompt(
        h.request({ prompt: [{ type: "resource_link", uri }] }),
      ),
    );
  await pair(async (h) => {
    const dir = join(h.configDir, "plugins/marketplaces/m/p/commands");
    await h.fs.promises.mkdir(dir, { recursive: true });
    await h.fs.promises.writeFile(
      join(dir, "cmd.md"),
      "---\nname: Visible\ndescription: >-\n  a long\n  description\n---\nCOMMAND BODY",
    );
    const meta = { "codebuddy.ai": { commandPrompt: "existing" } };
    const prompt = await h.service.composeUserPrompt(
      h.request({
        prompt: [{ type: "resource_link", uri: "command://m:p:/Visible" }],
        _meta: meta,
      }),
    );
    return { prompt, meta };
  });
  for (const expertId of [undefined, "e1"])
    for (const prev of [undefined, { id: "e1" }, { id: "e0" }])
      await pair(async (h) => {
        const file = join(h.cwd, "expert.md");
        await h.fs.promises.writeFile(file, "Expert complete prompt");
        h.service.expertPluginService = {
          resolveExpertAgentPromptSource: async () => ({
            agentName: "Name<&",
            filePath: file,
          }),
        };
        return h.service.composeUserPrompt(
          h.request({
            desiredConfig: { expertId },
            _meta: {
              "codebuddy.ai": {
                previousExpertSelection: prev,
                expertName: "Current<",
                expertType: "expert_team",
              },
            },
          }),
        );
      });
  await pair(async (h) => {
    await h.fs.promises.writeFile(join(h.cwd, "CODEBUDDY.md"), "guide ]]> end");
    await h.fs.promises.mkdir(join(h.cwd, "src"));
    await h.fs.promises.writeFile(join(h.cwd, "src/a.ts"), "a");
    await h.fs.promises.writeFile(join(h.cwd, ".hidden"), "hidden");
    return h.service.composeUserPrompt(h.request());
  });
  await pair(async (h) => {
    const request = h.request({
      _meta: { "codebuddy.ai": { isClearSession: true } },
    });
    const output = await h.service.composeUserPrompt(request);
    return {
      same: output === request.prompt,
      output,
      sections: h.service.sections,
    };
  });
  await pair(async (h) => {
    for (const key of [
      "lastSentConnectorStatus",
      "projectNetdriveRootCache",
      "lastSentProjectInstructions",
      "workSummaryBySession",
    ])
      h.service[key].set("s", "value");
    h.service.resolvedProjectNetdriveRootSessions.add("s");
    h.native.rememberNetDriveAttachments("s", [{ fileId: " X " }]);
    h.service.cleanup();
    return {
      maps: [
        h.service.lastSentConnectorStatus,
        h.service.projectNetdriveRootCache,
        h.service.lastSentProjectInstructions,
        h.service.workSummaryBySession,
      ],
      resolved: h.service.resolvedProjectNetdriveRootSessions,
      attachments: h.native.attachmentsBySession,
    };
  });
  console.log(
    JSON.stringify(
      {
        completeClasses: USER_PROMPT_CLASSES.length,
        classMembers: members,
        fullFunctions: USER_PROMPT_FUNCTIONS.length,
        constantInitializers: USER_PROMPT_CONSTANTS.length,
        comparisons,
        externalDocsEngine:
          "explicit deterministic doubles; renderer not claimed",
        desktopBootstrapExecuted: false,
      },
      null,
      2,
    ),
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
