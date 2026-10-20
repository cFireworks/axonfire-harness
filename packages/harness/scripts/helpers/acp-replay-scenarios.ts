import assert from "node:assert/strict";
import { createNativeAcpReplay } from "../../src/protocol/native-acp-replay.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { createNativeInteractionServices } from "../../src/interaction/native-interaction-services.js";
import { createCapturedAcpModules } from "../../src/protocol/captured-acp-modules.js";
import { agentRunFixture } from "./agent-run-fixture.js";
import * as path from "node:path";
import {
  CommandMessageUtils,
  COMMAND_MESSAGE_TYPES,
} from "../../src/commands/command-message-utils.js";

async function fixture(factory: typeof createNativeAcpReplay, patch: any = {}) {
  const f = await agentRunFixture(),
    events: any[] = [],
    spans: any[] = [],
    timers = new Set<any>(),
    calls: any[] = [];
  f.modules[67019] = {
    CommandMessageUtils,
    CommandType: COMMAND_MESSAGE_TYPES,
  };
  f.modules[58830] = f.utilities.getModule(58830);
  const base = createCapturedAcpModules({
    modules: f.modules,
    Date: f.runtime.Date,
    fs: {},
    os: {},
  });
  const constants = createNativeInteractionServices({
    modules: { 16928: path },
  }).getModule(33563);
  const trace = Symbol("trace"),
    agents = Symbol("agents"),
    tasks = Symbol("tasks"),
    checkpoint = Symbol("checkpoint"),
    versions = Symbol("versions"),
    team = Symbol("team");
  const span = (name: string) => {
    const record: any = { name };
    spans.push(record);
    const value: any = {
      setAttributes(a: any) {
        record.attributes = { ...record.attributes, ...a };
      },
      markAsSuccessful() {
        record.success = true;
      },
      markAsFailed(error: any) {
        record.failed = error.message;
      },
      startSpan: span,
    };
    return value;
  };
  f.di.set(trace, { startTrace: span });
  f.di.set(agents, {
    getDefault: async () => ({
      name: "cli",
      instructions: "owned replay system",
      tools: [],
    }),
    getModels: async () => [{ id: "owned-model", maxInputTokens: 4096 }],
    getModel: async () => ({ maxInputTokens: 4096 }),
  });
  f.di.set(tasks, {
    list: async (id: string) => {
      calls.push(["tasks", id]);
      if (patch.tasksError) throw Error("owned tasks failure");
      return patch.tasks ?? [];
    },
  });
  f.di.set(checkpoint, { getLatestCheckpoint: () => patch.checkpoint });
  f.di.set(versions, {
    get: async (_id: string, name: string) => {
      calls.push(["version", name]);
      return patch.baseContent ?? "";
    },
  });
  f.di.set(team, { isInTeam: () => !!patch.team, getTeam: () => patch.team });
  const utilities = {
    ...f.modules[93039],
    FileUtils: {
      readFileWithEncodingDetection: async (file: string) => {
        calls.push(["read", file]);
        return patch.currentContent ?? "changed";
      },
    },
    FileHistorySnapshotUtils: {
      computePathHash: (file: string) => "owned-path-hash",
      formatBackupName: (hash: string, n: number) => hash + "-" + n,
    },
  };
  const serviceModules = { ...f.modules, 93039: utilities };
  delete serviceModules[20881];
  const service = createNativeAcpServices({
    modules: serviceModules,
    getModule: base.getModule,
  });
  const modules = {
    ...f.modules,
    93039: utilities,
    80699: f.common,
    92735: { ...constants, TraceService: trace },
    66545: { AgentManager: agents },
    20881: service.titleHelpers,
    12502: base.getModule(12502),
    38548: base.getModule(38548),
    82263: service.getModule(82263),
    57135: { TaskStorageService: tasks },
    6512: { CheckpointService: checkpoint, FileVersionStore: versions },
    68366: { TeamManager: team },
    54193: {
      getTeamMemberRegistry: () => ({ getAll: () => patch.members ?? [] }),
    },
  };
  const env = patch.env ?? {};
  const n = factory({
    modules,
    Date: f.runtime.Date,
    env,
    setTimeout(fn: () => void, ms: number) {
      if (patch.immediateTimeout) {
        const timer = { unref() {} };
        timers.add(timer);
        queueMicrotask(fn);
        return timer;
      }
      const timer = setTimeout(fn, ms);
      timers.add(timer);
      return timer;
    },
  });
  f.s.history = structuredClone(patch.history ?? []);
  f.s.lastMessageId = patch.lastMessageId ?? f.s.history.at(-1)?.id;
  f.s.conversationReverted = patch.reverted === true;
  f.s.hasCompactedHistory = patch.compacted === true;
  if (patch.interruption) f.s.interruptionSubject.next(patch.interruption);
  const timing: any = {};
  return {
    ...f,
    n,
    env,
    events,
    spans,
    calls,
    timers,
    timing,
    async collect(options: any = {}) {
      return n.replay.collectSessionReplayEvents(f.s, f.logger, {
        timing,
        ...options,
      });
    },
    async emit(items: any[]) {
      await n.replay.emitSessionReplayEvents(
        {
          sessionUpdate: async (value: any) => events.push(["update", value]),
          extNotification: async (method: string, params: any) =>
            events.push(["notification", method, params]),
        },
        items,
      );
    },
    async close() {
      for (const timer of timers)
        if (!patch.immediateTimeout) clearTimeout(timer);
      await f.close();
    },
  };
}
const user = (id = "u") => ({
  type: "message",
  id,
  role: "user",
  content: [{ type: "input_text", text: "owned question" }],
  timestamp: 1000,
});
const assistant = (id = "a", parentId = "u") => ({
  type: "message",
  id,
  parentId,
  role: "assistant",
  content: [{ type: "output_text", text: "owned answer" }],
  timestamp: 2000,
  providerData: {
    conversationRequestId: "owned-request",
    usage: { inputTokens: 12, outputTokens: 3, totalTokens: 15 },
  },
});
function scenario(
  name: string,
  patch: any,
  run: (f: Awaited<ReturnType<typeof fixture>>) => Promise<any>,
) {
  return {
    name,
    async run(factory = createNativeAcpReplay) {
      const f = await fixture(factory, patch);
      try {
        return await run(f);
      } finally {
        await f.close();
      }
    },
  };
}
export const ACP_REPLAY_CASES = [
  scenario("complete replay env accepts only trimmed 1/true", {}, async (f) => {
    const values: any[] = [undefined, "", "0", " 1 ", "TrUe", "yes"];
    return values.map((value) => {
      f.env.CODEBUDDY_REPLAY_SHOW_PRE_COMPACT = value;
      return { value, enabled: f.n.replay.isReplayShowPreCompactEnabled() };
    });
  }),
  scenario(
    "complete replay converts active history with original offsets, timestamps, IDs and usage",
    { history: [user(), assistant()] },
    async (f) => {
      const result = await f.collect();
      await f.emit(result);
      assert.equal(
        result[0].update._meta["codebuddy.ai/historyReplay"],
        "start",
      );
      const offsets = result
        .filter(
          (r: any) => r.update?._meta?.["codebuddy.ai"]?.mode === "history",
        )
        .map((r: any) => r.update._meta["codebuddy.ai"].offset);
      assert.deepEqual(offsets, [0, 1]);
      assert.ok(
        result.some((r: any) => r.update?.sessionUpdate === "usage_update"),
      );
      assert.match(JSON.stringify(result), /1970-01-01T00:00:01.000Z/);
      return { result, events: f.events, timing: f.timing, spans: f.spans };
    },
  ),
  scenario(
    "complete replay emits no active items when reverted without a target",
    { history: [user(), assistant()], reverted: true, lastMessageId: "" },
    async (f) => {
      const result = await f.collect();
      assert.equal(f.timing.activeItems, 0);
      return { result, timing: f.timing, spans: f.spans };
    },
  ),
  scenario(
    "complete replay cancels orphan calls but not completed or pending approvals",
    {
      history: [
        user(),
        {
          type: "function_call",
          id: "c",
          parentId: "u",
          callId: "orphan",
          name: "Write",
          arguments: '{"file_path":"/owned/a","content":"x"}',
          timestamp: 2000,
        },
        {
          type: "function_call",
          id: "c2",
          parentId: "c",
          callId: "done",
          name: "Write",
          arguments: "{}",
          timestamp: 3000,
        },
        {
          type: "function_call_result",
          id: "r",
          parentId: "c2",
          callId: "done",
          name: "Write",
          output: "owned done",
          timestamp: 4000,
        },
        {
          type: "function_call",
          id: "c3",
          parentId: "r",
          callId: "pending",
          name: "Write",
          arguments: "{}",
          timestamp: 5000,
        },
      ],
      interruption: {
        rawItem: {
          type: "function_call",
          callId: "pending",
          name: "Write",
          arguments: "{}",
        },
      },
    },
    async (f) => {
      const result = await f.collect();
      assert.deepEqual(
        result
          .filter((r: any) => r.update?.status === "cancelled")
          .map((r: any) => r.update.toolCallId),
        ["orphan"],
      );
      return result;
    },
  ),
  scenario(
    "complete replay restores tasks, changed checkpoint, team and direct Plan approval",
    {
      history: [user(), assistant()],
      tasks: [{ id: "1", subject: "owned task", status: "in_progress" }],
      checkpoint: {
        id: "owned-checkpoint",
        createdAt: 3000,
        fileSnapshots: {
          "/owned/changed.txt": { backupFileName: "owned-original" },
        },
        fileChangeStats: { additions: 2, deletions: 1 },
      },
      team: { name: "owned-team", isAutoTeam: false },
      members: [
        {
          info: { name: "member", color: "blue", prompt: "owned" },
          getAgentTask: () => ({
            status: "running",
            id: "task",
            sessionId: "child",
            toolCallHistory: [],
          }),
        },
      ],
      interruption: {
        rawItem: {
          type: "function_call",
          callId: "plan",
          name: "ExitPlanMode",
          arguments: "{}",
          providerData: { queuePosition: 1, queueTotal: 1 },
        },
      },
    },
    async (f) => {
      const result = await f.collect();
      await f.emit(result);
      assert.ok(result.some((r: any) => r.method === "_codebuddy.ai/artifact"));
      assert.ok(
        result.some((r: any) => r.method === "_codebuddy.ai/checkpoint"),
      );
      assert.ok(
        result.some((r: any) =>
          r.update?._meta?.[
            "codebuddy.ai/interruptionRequest"
          ]?.options.includes("rejectAndExitPlan"),
        ),
      );
      return { result, events: f.events, calls: f.calls, spans: f.spans };
    },
  ),
  scenario(
    "complete replay compares checkpoint contents and skips task failure best effort",
    {
      history: [user(), assistant()],
      tasksError: true,
      checkpoint: {
        id: "same",
        fileSnapshots: { "/owned/same.txt": { backupFileName: "backup" } },
      },
      baseContent: "same",
      currentContent: "same",
    },
    async (f) => {
      const result = await f.collect();
      assert.ok(
        !result.some((r: any) => r.method === "_codebuddy.ai/checkpoint"),
      );
      return { result, calls: f.calls };
    },
  ),
  scenario(
    "complete replay prefetched MCP app HTML through original result metadata",
    {
      history: [
        user(),
        {
          type: "function_call",
          id: "c",
          parentId: "u",
          callId: "mcp",
          name: "DeferExecuteTool",
          arguments: '{"toolName":"mcp__owned__show","params":{}}',
          timestamp: 2000,
        },
        {
          type: "function_call_result",
          id: "r",
          parentId: "c",
          callId: "mcp",
          name: "DeferExecuteTool",
          output: "owned app",
          timestamp: 3000,
          providerData: {
            toolResult: { mcpUi: { toolResourceUri: "ui://owned/app" } },
          },
        },
      ],
    },
    async (f) => {
      const reads: any[] = [];
      const result = await f.collect({
        mcpUiResourceReader: async (server: string, uri: string) => {
          reads.push([server, uri]);
          return [
            {
              mimeType: "text/html; profile=mcp-app",
              text: "<p>owned app</p>",
            },
          ];
        },
      });
      assert.deepEqual(reads, [["owned", "ui://owned/app"]]);
      assert.match(JSON.stringify(result), /<p>owned app<\/p>/);
      assert.equal(
        f.timers.size,
        1,
        "source retains its unref timeout after early resource success",
      );
      return { result, reads };
    },
  ),
  scenario(
    "complete replay MCP prefetch rejection propagates and marks trace failed",
    {
      history: [
        user(),
        {
          type: "function_call_result",
          id: "r",
          parentId: "u",
          callId: "mcp",
          name: "mcp__owned__show",
          output: "owned",
          timestamp: 2000,
          providerData: {
            toolResult: {
              mcpUi: {
                toolResourceUri: "ui://owned/app",
                toolName: "mcp__owned__show",
              },
            },
          },
        },
      ],
    },
    async (f) => {
      await assert.rejects(
        f.collect({
          mcpUiResourceReader: async () => {
            throw Error("owned resource failure");
          },
        }),
        /owned resource failure/,
      );
      return { spans: f.spans };
    },
  ),
  scenario(
    "complete replay MCP prefetch timeout keeps history without invented HTML",
    {
      immediateTimeout: true,
      history: [
        user(),
        {
          type: "function_call_result",
          id: "r",
          parentId: "u",
          callId: "mcp",
          name: "mcp__owned__show",
          output: "owned",
          timestamp: 2000,
          providerData: {
            toolResult: {
              mcpUi: {
                toolResourceUri: "ui://owned/app",
                toolName: "mcp__owned__show",
              },
            },
          },
        },
      ],
    },
    async (f) => {
      const result = await f.collect({
        mcpUiResourceReader: () => new Promise(() => {}),
      });
      const app = result.find(
        (r: any) => r.update?._meta?.["codebuddy.ai"]?.toolMetaData?.mcpUi,
      )?.update._meta["codebuddy.ai"].toolMetaData.mcpUi;
      assert.ok(app);
      assert.equal(app.html, undefined);
      return result;
    },
  ),
];
