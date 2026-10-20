import assert from "node:assert/strict";
import { acpServicesFixture } from "./acp-services-fixture.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { settle } from "./acp-protocol-fixture.js";
type Case = {
  name: string;
  run(factory: typeof createNativeAcpServices): Promise<any>;
};
const scenario = (
  name: string,
  run: (h: ReturnType<typeof acpServicesFixture>) => Promise<any>,
): Case => ({
  name,
  async run(factory) {
    const h = acpServicesFixture(factory);
    try {
      return await run(h);
    } finally {
      await h.close();
    }
  },
});
const record = (patch: any = {}) => ({
  user_prompt: "again",
  friction_type: "no progress / looping",
  severity: "high",
  attribution: "model runtime / model_runtime",
  score: 0.9,
  ...patch,
});
export const ACP_SERVICES_CASES: Case[] = [
  scenario(
    "title helpers preserve custom/AI/topic precedence and placeholder rejection",
    async ({ n }) => {
      assert.equal(
        n.getModule(68593).SessionTitleServiceImpl,
        n.SessionTitleServiceImpl,
      );
      assert.equal(
        n.getModule(68593).SessionTitleService,
        n.SessionTitleService,
      );
      assert.equal(
        n.getModule(18945).FrictionAnalysisServiceImpl,
        n.FrictionAnalysisServiceImpl,
      );
      assert.equal(
        n.getModule(43324).FrictionRecallClientImpl,
        n.FrictionRecallClientImpl,
      );
      assert.equal(typeof n.getModule(18945).FrictionAnalysisService, "symbol");
      assert.equal(typeof n.getModule(43324).FrictionRecallClient, "symbol");
      assert.deepEqual(
        Object.keys(n.getModule(18945)).sort(),
        [
          "CHAT_PROMPT_FRICTION_ANALYSIS_EVENT",
          "FrictionAnalysisService",
          "FrictionAnalysisServiceImpl",
          "buildFrictionTelemetryPayload",
          "extractVisibleUserPromptFromAcpPrompt",
          "extractVisibleUserPromptFromAgentInput",
        ].sort(),
      );
      const out = [];
      for (const content of [
        "hello",
        "/compact",
        "(No content)",
        "<image_local_path>x</image_local_path>",
        "x".repeat(81),
        [{ type: "input_image", image: "owned" }],
        [
          {
            type: "input_text",
            text: "<system-reminder>hidden</system-reminder><user_query>visible</user_query>",
          },
        ],
      ]) {
        const history: any[] = [{ type: "message", role: "user", content }];
        for (const extra of [
          [],
          [{ type: "topic", topic: "topic" }],
          [
            { type: "ai-title", aiTitle: " ai " },
            { type: "topic", topic: "newer" },
          ],
          [{ type: "ai-title", aiTitle: "/compact" }],
          [
            { type: "custom-title", customTitle: " custom " },
            { type: "ai-title", aiTitle: "newer" },
          ],
        ])
          out.push(
            n.titleHelpers.getEffectiveSessionTitle([...history, ...extra]),
          );
      }
      assert.equal(
        n.titleHelpers.getEffectiveSessionTitle([
          { type: "message", role: "user", content: "a".repeat(81) },
        ]),
        "a".repeat(80) + "...",
      );
      return out;
    },
  ),
  scenario(
    "title JSON parsing keeps regex fallback and trims only string titles",
    async ({ title }) => {
      const values = [
        "",
        " ",
        '{"title":" title "}',
        '{"title":0}',
        '{"title":""}',
        'prefix {"title":"first"} suffix {"title":"second"}',
        '{"nested":{"title":"nested"}}',
        "{broken",
        '[{"title":"array"}]',
      ];
      const out = values.map((value) => title.parseResponse(value));
      assert.equal(out[2], "title");
      assert.equal(out[5], "first");
      return out;
    },
  ),
  scenario(
    "title gate defaults non-TTY and retains local-command whitespace quirk",
    async ({ title }) => {
      assert.equal(title.shouldProcessPrompt("hello"), false);
      title.setForceEnabled(true);
      const out = [
        "hello",
        "",
        "<local-command-stdout>x",
        "  <local-command-stdout>x",
        " <system-reminder>x",
      ].map((value) => title.shouldProcessPrompt(value));
      assert.deepEqual(out, [true, false, false, true, false]);
      return out;
    },
  ),
  scenario(
    "title generation persists original ai-title record and exact session prompt",
    async ({ title, h, calls }) => {
      title.setForceEnabled(true);
      h.session.history = [
        { type: "message", role: "user", content: "first request" },
      ];
      await title.handleUserPromptSubmit("first request", h.session);
      assert.equal(title.getPendingTitlePromise(h.session.id), undefined);
      assert.equal(h.session.history.at(-1).aiTitle, "Owned title");
      assert.equal(calls[0][2], "<session>\nfirst request\n</session>");
      await title.handleUserPromptSubmit("again", h.session);
      assert.equal(calls.filter((c) => c[0] === "title").length, 1);
      return [calls, title.sessionStates];
    },
  ),
  scenario(
    "three failed title attempts abandon later generation",
    async ({ title, h }) => {
      let runs = 0;
      title.agentService.runOneTime = async () => {
        runs++;
        return "invalid";
      };
      title.setForceEnabled(true);
      h.session.history = [
        { type: "message", role: "user", content: "a usable request" },
      ];
      for (let i = 0; i < 5; i++)
        await title.handleUserPromptSubmit("again", h.session);
      assert.equal(runs, 3);
      assert.equal(title.sessionStates.get(h.session.id).abandoned, true);
      return title.sessionStates;
    },
  ),
  scenario(
    "title timeout is 15000 ms without cancelling the borrowed generation",
    async ({ title, h }) => {
      let done = false;
      title.agentService.runOneTime = () => new Promise(() => {});
      const pending = title
        .runGenerationWithTimeout("hello")
        .then((value: any) => {
          done = true;
          return value;
        });
      await h.tick(14999);
      assert.equal(done, false);
      await h.tick(1);
      assert.equal(await pending, null);
      assert.equal(h.timers.size, 0);
      return h.logs;
    },
  ),
  scenario(
    "a custom title added during generation prevents AI persistence",
    async ({ title, h, calls }) => {
      const deferred = new h.p.Deferred();
      title.agentService.runOneTime = () => deferred.promise;
      title.setForceEnabled(true);
      h.session.history = [
        { type: "message", role: "user", content: "request" },
      ];
      const pending = title.handleUserPromptSubmit("request", h.session);
      h.session.history.push({
        type: "custom-title",
        customTitle: "User title",
      });
      deferred.resolve('{"title":"Late AI"}');
      await pending;
      assert.equal(calls.length, 0);
      assert.equal(title.sessionStates.get(h.session.id).titled, true);
      return h.session.history;
    },
  ),
  scenario(
    "friction parser chooses highest typed score before checking label validity",
    async ({ n }) => {
      const inputs = [
        undefined,
        {},
        { results: [record()] },
        {
          data: {
            results: [
              record({ score: 0.5 }),
              record({ score: 1, friction_type: "unknown" }),
            ],
          },
        },
        {
          results: [
            record({
              attribution: "unknown / output quality / output_quality",
            }),
          ],
        },
        { results: [record({ score: NaN })] },
        {
          results: [
            record({
              severity: " Medium ",
              friction_type: " no_progress_looping ",
            }),
          ],
        },
      ];
      const out = inputs.map((v) => n.parseFrictionRecallResponse(v));
      assert.equal(out[2].frictionType, "no_progress_looping");
      assert.equal(out[3], undefined);
      assert.equal(out[4].rootCauseCandidate, "output_quality");
      return out;
    },
  ),
  scenario(
    "friction recall gate requires boolean true and preserves endpoint/path/3000ms",
    async ({ recall, configuration, calls }) => {
      const out = [];
      for (const enabled of [undefined, false, "true", 1, true]) {
        configuration.productFeatures.ChatPromptFrictionAnalysis = enabled;
        out.push(await recall.recall("normalized prompt"));
      }
      assert.equal(calls.length, 1);
      assert.deepEqual(calls[0][1], {
        url: "/agenttool/v1/intent/recall",
        method: "POST",
        baseURL: "https://owned.invalid",
        timeout: 3000,
        data: { query: "normalized prompt" },
      });
      return [out, calls];
    },
  ),
  scenario(
    "friction captures latest unscoped prompt then reports once with linked history",
    async ({ friction, recall, configuration, h, reports }) => {
      configuration.productFeatures.ChatPromptFrictionAnalysis = true;
      recall.restOperations.request = async () => ({
        data: { results: [record()] },
      });
      h.session.conversationRequestId = undefined;
      friction.capturePrompt(h.session, "old");
      friction.capturePrompt(
        h.session,
        "<user_query> latest  prompt </user_query>",
      );
      h.session.conversationRequestId = "req";
      h.session.history = [
        { requestId: "previous" },
        {
          type: "function_call_result",
          output: "error".repeat(100),
          providerData: { conversationRequestId: "another" },
        },
      ];
      friction.capturePrompt(h.session, "new");
      friction.tryReportOnRequestSend(h.session, {
        requestId: "req",
        conversationId: "conversation",
        presentAt: 123,
      });
      await settle();
      friction.tryReportOnRequestSend(h.session, { requestId: "req" });
      await settle();
      assert.equal(reports.length, 1);
      assert.equal(reports[0][1].userPrompt, "latest prompt");
      assert.equal(reports[0][1].linkedExecutionSignal.length, 300);
      assert.equal(friction.pendingAnalysisByRequest.size, 0);
      return reports;
    },
  ),
  scenario(
    "failed friction report is marked reported and not retried",
    async ({ friction, recall, configuration, h, reports }) => {
      configuration.productFeatures.ChatPromptFrictionAnalysis = true;
      recall.restOperations.request = async () => ({
        data: { results: [record()] },
      });
      friction.eventService.report = async (...args: any[]) => {
        reports.push(args);
        throw Error("report failed");
      };
      friction.capturePrompt(h.session, "hello");
      friction.tryReportOnRequestSend(h.session, { requestId: "req" });
      await settle();
      friction.capturePrompt(h.session, "again");
      friction.tryReportOnRequestSend(h.session, { requestId: "req" });
      await settle();
      assert.equal(reports.length, 1);
      assert.equal(friction.reportedKeys.size, 1);
      return [reports, h.logs];
    },
  ),
  scenario(
    "usage cache precedence normalizes positive details and aggregates raw usage",
    async ({ n }) => {
      const out = [];
      for (const detail of [
        {},
        {
          cache_read_input_tokens: -1,
          cacheReadInputTokens: 3,
          inputTokensDetails: [{ cached_tokens: 5 }],
        },
        {
          cache_read_input_tokens: 2,
          prompt_tokens_details: { cached_tokens: 9 },
        },
        { inputTokensDetails: [{ cached_tokens: 2 }, { cached_tokens: 4 }] },
      ])
        out.push([
          n.UsageUtils.getCacheReadTokens(detail),
          n.UsageUtils.getCacheCreationTokens(detail),
        ]);
      assert.deepEqual(
        out.map((x) => x[0]),
        [0, 3, 2, 6],
      );
      return [
        out,
        n.UsageUtils.getAggregatedCacheUsage([
          {
            providerData: {
              rawUsage: {
                prompt_cache_hit_tokens: 4,
                prompt_cache_miss_tokens: 7,
              },
            },
          },
        ]),
      ];
    },
  ),
  scenario(
    "usage category conserves total tokens for mixed CJK/images/hidden context/tools",
    async ({ n, h }) => {
      const builder = n.getModule(82263),
        out = [];
      for (const total of [0, 1, 20, 101, 1000]) {
        const session = h.session;
        session.history = [
          {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: '<system-reminder data-role="user-context"><first>hidden</first><second>visible</second></system-reminder>中文hello',
              },
              { type: "input_image", image: "owned" },
            ],
          },
        ];
        const value = await builder.computeSessionUsageByCategory(
          session,
          {
            getDefault: async () => ({
              instructions: "system",
              tools: [
                { name: "mcp__owned__tool", description: "owned" },
                { name: "Read", description: "read" },
              ],
            }),
          },
          total,
          h.logger,
        );
        assert.equal(
          [
            value.systemPrompt,
            value.conversation,
            value.tools,
            value.mcp,
            value.skills,
          ].reduce((a, b) => a + b, 0),
          total,
        );
        out.push(value);
      }
      return out;
    },
  ),
  scenario(
    "usage stream coalesces at 250ms and identical updates deduplicate",
    async ({ usage, h }) => {
      h.session.history = [
        {
          type: "message",
          role: "assistant",
          content: "answer",
          providerData: {
            usage: { inputTokens: 42, outputTokens: 2, totalTokens: 44 },
          },
        },
      ];
      usage.register(h.session, h.agent.connection);
      h.session.combineSubject.next({ type: "input", data: {} });
      h.session.combineSubject.next({ type: "input", data: {} });
      assert.equal(h.timers.size, 1);
      await h.tick(249);
      assert.equal(h.updates.length, 0);
      await h.tick(1);
      await settle();
      assert.equal(h.updates.length, 1);
      assert.equal(h.updates[0].update.used, 42);
      await usage.publish(h.session.id, "stream");
      assert.equal(h.updates.length, 1);
      return h.updates;
    },
  ),
  scenario(
    "team credit marks stage before send, including failed sends",
    async ({ usage, h }) => {
      let sends = 0;
      usage.register(h.session, {
        sessionUpdate: async () => {
          sends++;
          throw Error("offline");
        },
      });
      const credit = {
        leaderSessionId: h.session.id,
        leaderRequestId: "root",
        leaderMessageId: "message",
        credit: 2,
        stageId: "stage",
      };
      await usage.publishTeamMemberCredit(credit);
      await usage.publishTeamMemberCredit(credit);
      assert.equal(sends, 1);
      return [usage.states.get(h.session.id).teamCreditStageIds, h.logs];
    },
  ),
  scenario(
    "broadcast excludes origin and preserves tracking metadata",
    async ({ broadcast, connections, h }) => {
      const out: any[] = [];
      connections.set("origin", {
        getConnection: () => ({
          sessionUpdate: () => {
            throw Error("origin must be excluded");
          },
        }),
      });
      connections.set("peer", {
        getConnection: () => ({
          sessionUpdate: async (value: any) => out.push(value),
        }),
      });
      await broadcast.broadcastUserMessage(
        h.session.id,
        "hello",
        "origin",
        undefined,
        { requestId: "r", messageId: "m", messageRequestId: "u" },
        h.session,
        123,
      );
      assert.equal(out.length, 1);
      assert.equal(out[0].update.messageId, "u");
      return out;
    },
  ),
  scenario(
    "broadcast ACK timeout is 2000ms and cleans timer without rejecting",
    async ({ broadcast, h }) => {
      let done = false;
      const pending = broadcast
        .sendToConnection(
          {
            getConnection: () => ({
              sessionUpdate: () => new Promise(() => {}),
            }),
          },
          "s",
          {},
          "peer",
        )
        .then(() => {
          done = true;
        });
      await h.tick(1999);
      assert.equal(done, false);
      await h.tick(1);
      await pending;
      assert.equal(h.timers.size, 0);
      return h.logs;
    },
  ),
  scenario(
    "checkpoint detail is scoped to matching session and explicit desktop capability",
    async ({ broadcast }) => {
      const info = {
        fileChanges: {
          files: [
            { uri: "x", changeType: "modified", diff: "secret large diff" },
          ],
          count: 1,
        },
        id: "checkpoint",
      };
      assert.equal(
        broadcast.isDetailedCheckpointConsumer(
          {
            getCurrentSessionId: () => "s",
            getClientCapabilities: () => ({
              _meta: { "workbuddy.desktop": { detailedCheckpoint: true } },
            }),
          },
          "other",
        ),
        false,
      );
      return broadcast.toLightweightCheckpointInfo(info);
    },
  ),
];
