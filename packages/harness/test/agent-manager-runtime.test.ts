import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nunjucks from "nunjucks";
import {
  Agent,
  Usage,
  setTraceProcessors,
  type Model,
} from "@openai/agents-core";
import { agentManagerFixture } from "../scripts/helpers/agent-manager-fixtures.js";
import { turn } from "../scripts/helpers/session-result-fixtures.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { createPluginAgentComposer } from "../src/agents/plugin-agent-compose.js";
import { createAgentMarkdownUtils } from "../src/agents/native-agent-markdown.js";
import { CapturedYaml } from "../src/vendor/captured-yaml.js";
import { substituteLoadTimeVariables } from "../src/commands/skill-product-provider.js";
setTraceProcessors([]);
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "harness-agent-manager-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const ownedAnswer = (text: string): any => ({
  type: "message",
  role: "assistant",
  id: "owned-answer",
  status: "completed",
  content: [{ type: "output_text", text }],
});
function modelFixture(requests: any[], readPath?: string): Model {
  let n = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      const output =
        readPath && ++n === 1
          ? [
              {
                type: "function_call",
                id: "owned-read",
                callId: "owned-read",
                name: "Read",
                arguments: JSON.stringify({ file_path: readPath }),
                status: "completed",
              },
            ]
          : [ownedAnswer("owned complete")];
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: "owned-response",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
}
test("native startup eagerly registers only CLI configs, exposes async missing lookup and model-less SDK construction", async () => {
  const f = agentManagerFixture();
  assert.deepEqual(await f.manager.getAll(), []);
  await f.start();
  assert.equal(f.manager.ready, true);
  assert.deepEqual((await f.manager.getAll()).map((a: any) => a.name).sort(), [
    "Explore",
    "compact",
    "custom",
    "main",
  ]);
  assert.equal(await f.manager.get("missing"), undefined);
  assert.equal(await f.manager.get("hidden"), undefined);
  assert.equal(
    (await f.manager.getAgentConfig("hidden")).instructions,
    "not a CLI agent",
  );
  for (const agent of await f.manager.getAll())
    assert.ok(agent instanceof Agent);
  for (const event of f.events.filter((e) => e[0] === "factory")) {
    assert.ok(!event[2].includes("model"));
    assert.ok(!event[2].includes("modelSettings"));
  }
});
test("native fingerprint intentionally ignores same-ID model content/removal and collides on equal-length instruction suffixes", async () => {
  const f = agentManagerFixture();
  await f.start();
  await f.manager.rebuildAgents();
  const first = await f.manager.getDefault();
  f.configuration.models[0] = {
    ...f.configuration.models[0],
    name: "replacement",
  };
  f.configuration.models.pop();
  await f.manager.rebuildAgents();
  assert.equal(await f.manager.getDefault(), first);
  assert.equal(f.manager.modelMap.get("primary").name, "Primary");
  assert.equal(f.manager.modelMap.has("custom:a"), true);
  f.configuration.agents[0].instructions = "a".repeat(32) + "x";
  await f.manager.rebuildAgents();
  const changed = await f.manager.getDefault();
  f.configuration.agents[0].instructions = "a".repeat(32) + "y";
  await f.manager.rebuildAgents();
  assert.equal(await f.manager.getDefault(), changed);
  await f.manager.refreshAgents();
  assert.notEqual(await f.manager.getDefault(), changed);
  assert.equal(f.manager.isManagedAgentInstance(changed), true);
});
test("native overlapping rebuilds coalesce force flag and settle barrier after pending pass", async () => {
  const f = agentManagerFixture();
  await f.start();
  let release!: () => void,
    builds = 0;
  const gate = new Promise<void>((r) => (release = r)),
    build = f.manager.buildAgentsFromProductConfiguration.bind(f.manager);
  f.manager.buildAgentsFromProductConfiguration = async (force: boolean) => {
    if (++builds === 1) await gate;
    return build(force);
  };
  const current = f.manager.rebuildAgents();
  await f.manager.rebuildAgents();
  await f.manager.rebuildAgents(true);
  assert.equal(f.manager.pendingForceRebuild, true);
  let settled = false;
  const waiter = f.manager.waitForRebuildSettled(0).then(() => {
    settled = true;
  });
  await turn();
  assert.equal(settled, false);
  release();
  await current;
  await waiter;
  assert.equal(builds, 2);
  assert.equal(f.manager.rebuilding, false);
  assert.equal(f.manager.pendingRebuild, false);
  assert.equal(f.timers.pending.size, 0);
});
test("native initial build failure opens ready barrier but default lookup and forced refresh preserve failure", async () => {
  const f = agentManagerFixture();
  f.runtime.dependencies.factory.create = async () => {
    throw Error("owned build failed");
  };
  await f.start();
  assert.equal(f.manager.ready, true);
  await assert.rejects(
    f.manager.getDefault(),
    /default agent main is not registered/,
  );
  await assert.rejects(f.manager.refreshAgents(), /owned build failed/);
});
test("placeholder models block model lookup without blocking agent readiness until real configuration arrives", async () => {
  const f = agentManagerFixture();
  f.configuration.models = [{ id: "default-model-owned" }];
  f.configuration.agents[0].models = ["default-model-owned"];
  await f.start();
  assert.ok(await f.manager.getDefault());
  let settled = false;
  const result = f.manager.getModel("main").then((v: any) => {
    settled = true;
    return v;
  });
  await turn();
  assert.equal(settled, false);
  f.configuration.models = [{ id: "owned-real" }];
  f.configuration.agents[0].models = ["owned-real"];
  await f.manager.rebuildAgents();
  assert.equal((await result).id, "owned-real");
  assert.equal(f.manager.modelsReadyDeferred, undefined);
});
test("prewarm standby defers settings-independent build until explicit activation and then subscribes config changes", async () => {
  let activate!: () => void;
  const f = agentManagerFixture(undefined, {
    dependencies: {
      prewarmStateService: {
        isStandby: () => true,
        onActivated: (fn: () => void) => {
          activate = fn;
        },
      },
    },
  });
  f.manager.init();
  await turn();
  assert.equal(f.manager.ready, false);
  assert.equal(f.listeners.length, 0);
  assert.equal(f.events.filter((e) => e[0] === "settings-list").length, 1);
  activate();
  await f.manager.readyDeferred.promise;
  await f.manager.waitForRebuildSettled(0);
  assert.equal(f.manager.ready, true);
  assert.equal(f.listeners.length, 1);
});
test("MCP first-session prewait coalesces, deadline aborts owned wait and completed session is not retried", async () => {
  let pendingCalls = 0;
  const f = agentManagerFixture(undefined, {
    waitPending: async () => {
      pendingCalls++;
      await new Promise(() => {});
    },
  });
  await f.start();
  const session = { options: {}, meta: {} };
  const a = f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      new AbortController().signal,
    ),
    b = f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      new AbortController().signal,
    );
  await turn();
  assert.equal(pendingCalls, 1);
  assert.equal(f.timers.pending.size, 1);
  await f.timers.fire();
  assert.equal(await a, undefined);
  await b;
  assert.equal(f.manager.sessionMcpPrewaitCompleted.has(session), true);
  await f.manager.ensureAgentToolsFreshForRun(
    "main",
    session,
    new AbortController().signal,
  );
  assert.equal(pendingCalls, 1);
  assert.equal(f.timers.pending.size, 0);
});
test("external MCP cancellation remains retryable and old managed SDK instance receives fresh tools without replacement", async () => {
  const f = agentManagerFixture();
  await f.start();
  const old = await f.manager.getDefault(),
    session = { options: {}, meta: {} },
    controller = new AbortController();
  controller.abort();
  await f.manager.ensureAgentToolsFreshForRun(
    "main",
    session,
    controller.signal,
    old,
  );
  assert.equal(f.manager.sessionMcpPrewaitCompleted.has(session), false);
  await f.manager.refreshAgents();
  const current = await f.manager.getDefault();
  assert.notEqual(old, current);
  assert.equal(
    await f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      new AbortController().signal,
      old,
    ),
    undefined,
  );
  assert.equal(old.tools, current.tools);
  assert.equal(f.timers.pending.size, 0);
});
test("source tool enable gate uses exact case-insensitive allow names, scoped deny semantics and native delegate list", async () => {
  const f = agentManagerFixture();
  await f.start();
  const check = async (
    name: string,
    options: any = {},
    mode = "default",
    aliases: string[] = [],
  ) => {
    const gate = await f.manager.createIsEnabledChecker(
      { name, aliases, defer_loading: false },
      true,
    );
    return gate({
      agent: await f.manager.getDefault(),
      runContext: {
        context: { options, meta: {}, permissionModeSubject: { value: mode } },
      },
    });
  };
  assert.equal(await check("Read", { tools: "read" }), true);
  assert.equal(await check("Read", { tools: "R*" }), false);
  assert.equal(await check("Read", { disallowedTools: ["Read(*.md)"] }), true);
  assert.equal(
    await check("Read", { disallowedTools: ["alias"] }, "default", ["alias"]),
    false,
  );
  assert.equal(await check("Read", {}, "delegate"), false);
  assert.equal(await check("Agent", {}, "delegate"), true);
  assert.equal(await check("WeComReply", {}, "delegate"), true);
  f.runtime.env.CODEBUDDY_DISABLE_PLAN_MODE = " YES ";
  assert.equal(await check("EnterPlanMode"), false);
  assert.equal(await check("ExitPlanMode"), false);
});
test("plugin replace then volatile persona overlay preserves exact expert prompt and settings agent takes final precedence", async () => {
  const f = agentManagerFixture();
  f.manager.pluginManager = {
    getActivePlugins: async () => [
      {
        plugin: {
          name: "owned",
          marketplaceName: "fixture",
          status: "enabled",
        },
        components: {
          settings: { agent: "persona" },
          agents: [
            {
              name: "persona",
              tags: ["plugin", "cli"],
              instructions: "owned persona",
              tools: ["Read"],
              description: "owned description",
            },
          ],
        },
      },
    ],
  };
  await f.start();
  assert.equal(
    (await f.manager.getAgentConfig("main")).instructions,
    "owned persona",
  );
  assert.equal(await f.manager.get("persona"), undefined);
  await f.manager.setVolatilePluginAgent("persona", {
    sourcePluginId: "owned@fixture",
    internalModelRequestHeaders: { " z ": "last", a: "first", ignored: 2 },
  });
  const config = await f.manager.getAgentConfig("main");
  assert.match(config.instructions, /<expert_prompt>/);
  assert.equal(config.pluginAgentPromptTemplate, "owned persona");
  assert.deepEqual(
    f.manager.getVolatilePluginAgentState().internalModelRequestHeaders,
    { a: "first", z: "last" },
  );
  f.settings.agent = "Explore";
  await f.manager.refreshAgents();
  assert.equal(
    (await f.manager.getAgentConfig("main")).instructions,
    "owned explore",
  );
  assert.equal(
    (await f.manager.getAgentConfig("main")).pluginAgentPromptTemplate,
    undefined,
  );
});
test("native composer reads owned plugin fragments, unions tools, preserves unrelated template blocks and rejects traversal", async (t) => {
  const root = await owned(t),
    mode = join(root, "mode");
  await mkdir(join(mode, "fragments"), { recursive: true });
  await writeFile(
    join(mode, "fragments/interaction.md"),
    "---\ntools: [Read, Bash]\n---\nmode ${CODEBUDDY_PLUGIN_ROOT}",
  );
  await writeFile(join(mode, "part.md"), "---\ntools: [Glob]\n---\npart");
  const logs: any[] = [];
  const composer = createPluginAgentComposer(
    {
      readFileSync: fs.readFileSync,
      existsSync: fs.existsSync,
      markdown: createAgentMarkdownUtils(CapturedYaml.parse),
      substituteLoadTimeVariables,
    },
    nunjucks,
  );
  const plugin = {
      name: "interactionmode-edit",
      marketplaceName: "workbuddy-builtin",
      status: "enabled",
      installedPath: mode,
    },
    matchedPlugin = {
      name: "welcomemode-code",
      marketplaceName: "workbuddy-builtin",
    },
    logger = {
      warn: (s: string) => logs.push(s),
      debug: (s: string) => logs.push(s),
    };
  const result = composer.composePluginAgent({
    agentConfig: {
      name: "p",
      instructions:
        '{% if interactionMode == "edit" %}{% include "interactionmode-edit/part.md" %}{% endif %}\n{% if unrelated %}keep{% endif %}',
      tools: ["Read"],
    },
    matchedPlugin,
    enabledPlugins: [plugin],
    logger,
  });
  assert.deepEqual(result.tools, ["Read", "Glob"]);
  assert.match(result.instructions, /part/);
  assert.match(result.instructions, /{% if unrelated %}keep{% endif %}/);
  assert.doesNotMatch(result.instructions, /mode /);
  assert.equal(
    composer.resolvePluginInclude(
      "interactionmode-edit/../secret",
      new Map([[plugin.name, plugin]]),
    ),
    undefined,
  );
  const fallback = composer.composePluginAgent({
    agentConfig: { name: "p", instructions: "base" },
    matchedPlugin,
    enabledPlugins: [plugin],
    logger,
  });
  assert.deepEqual(fallback.tools, ["Read", "Bash"]);
  assert.match(
    fallback.instructions,
    new RegExp(mode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});
test("standalone eager bootstrap executes Read with real SDK and first-run refresh returns void", async (t) => {
  const root = await owned(t),
    path = join(root, "fixture.txt");
  await writeFile(path, "owned manager SDK read");
  const requests: any[] = [];
  const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      approveTool: () => true,
      modelProvider: { getModel: () => model },
    }),
    model = modelFixture(requests, path);
  t.after(() => h.close());
  assert.equal(h.agents.ready, true);
  assert.equal((await h.agents.getAll()).length, 19);
  const agent = await h.agents.getDefault(),
    session = await h.openSession();
  assert.equal(
    await h.agents.ensureAgentToolsFreshForRun(
      agent.name,
      session,
      session.abortSignal,
      agent,
    ),
    undefined,
  );
  assert.equal(await h.prompt(session, "read owned fixture"), "owned complete");
  assert.equal(await h.agents.getDefault(), agent);
  assert.match(JSON.stringify(requests.at(-1).input), /owned manager SDK read/);
});
test("standalone explicit config change rebuilds eager SDK agents and close disposes subscription", async (t) => {
  const root = await owned(t),
    loaded = await loadProductConfiguration();
  let snapshot = structuredClone(loaded.raw),
    listener!: () => void,
    disposed = 0;
  const requests: any[] = [],
    model = modelFixture(requests);
  const h = await createHarness({
    workDir: root,
    stateDir: join(root, "state"),
    modelProvider: { getModel: () => model },
    agentManager: {
      getConfiguration: async () => snapshot,
      onConfigurationChange: (fn) => {
        listener = fn;
        return {
          dispose() {
            disposed++;
          },
        };
      },
    },
  });
  t.after(() => h.close());
  const first = await h.agents.getDefault();
  snapshot = structuredClone(snapshot);
  const config = snapshot.agents.find((a) => a.tags?.includes("default"))!;
  config.instructions = "owned rebuilt system prompt";
  config.tools = ["Read"];
  listener();
  await h.agents.waitForRebuildSettled(0);
  const current = await h.agents.getDefault();
  assert.notEqual(current, first);
  assert.equal(h.agents.isManagedAgentInstance(first), true);
  assert.equal((await h.agents.getAll()).length, 19);
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "hello"), "owned complete");
  assert.match(JSON.stringify(requests[0]), /owned rebuilt system prompt/);
  await h.close();
  assert.equal(disposed, 1);
  listener();
  assert.equal(h.agents.rebuilding, false);
  assert.equal(
    await readFile(h.store.getSessionFilePath(session.id), "utf8")
      .then(() => true)
      .catch(() => false),
    true,
  );
});
test("unknown session agent resolves to default instead of throwing missing-agent exception", async (t) => {
  const root = await owned(t),
    requests: any[] = [],
    model = modelFixture(requests),
    h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      modelProvider: { getModel: () => model },
    });
  t.after(() => h.close());
  const session = await h.openSession();
  session.agentName = "owned-missing";
  assert.equal(
    await h.service.resolveAgentForSession(session),
    await h.agents.getDefault(),
  );
  assert.equal(await h.prompt(session, "fallback"), "owned complete");
  assert.equal(
    session.agentName,
    "owned-missing",
    "native resolution does not rewrite requested session metadata",
  );
});
