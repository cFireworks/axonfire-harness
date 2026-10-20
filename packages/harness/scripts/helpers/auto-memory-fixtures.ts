import { EventEmitter } from "node:events";
import * as path from "node:path";
import {
  Agent,
  RunContext,
  RunState,
  setTraceProcessors,
} from "@openai/agents-core";
import { HarnessSession } from "../../src/sessions/session.js";
import * as services from "../../src/memory/native-auto-memory-services.js";
import { MemoryContextInterceptor } from "../../src/agents/memory-context-interceptor.js";
import { createMemoryFreshness } from "../../src/memory/memory-freshness.js";
import { createMemoryPromptBuilder } from "../../src/memory/memory-prompt-builder.js";
import { createNativeMemoryScanner } from "../../src/memory/native-memory-scanner.js";
import { createAutoMemoryUtilities } from "../../src/memory/auto-memory-utilities.js";
import { createResponseInputUtils } from "../../src/sessions/response-input-utils.js";
import { fillFunctionCallResultHistory } from "../../src/sessions/history-utils.js";
import { addSystemReminder } from "../../src/agents/system-reminder-agent-run-interceptor.js";
import { parseMemorySemanticType } from "../../src/memory/memory-store.js";
setTraceProcessors([]);
export function autoMemoryFixture(policy: any, captured?: any) {
  const files = new Map<string, { text: string; mtimeMs: number }>(),
    dirs = new Set(["/owned/memory"]),
    logs: any[] = [],
    events: any[] = [],
    settings: Record<string, any> = {};
  let sequence = 0,
    selected = '{"selected_memories":["a.md"]}',
    now = 1_800_000_000_000;
  const missing = (p: string) =>
    Object.assign(Error("ENOENT: " + p), { code: "ENOENT" });
  const fs: any = {
    existsSync: (p: string) => files.has(p) || dirs.has(p),
    readFileSync: (p: string) => {
      events.push(["sync-read", p]);
      if (!files.has(p)) throw missing(p);
      return files.get(p)!.text;
    },
    statSync: (p: string) => {
      if (!files.has(p)) throw missing(p);
      const f = files.get(p)!;
      return { mtimeMs: f.mtimeMs, size: Buffer.byteLength(f.text) };
    },
    createReadStream: (p: string, options: any) => {
      events.push(["stream", p, options]);
      const stream: any = new EventEmitter();
      let destroyed = false;
      stream.destroy = () => {
        destroyed = true;
        queueMicrotask(() => stream.emit("close"));
        return stream;
      };
      queueMicrotask(() => {
        if (destroyed) return;
        if (!files.has(p)) {
          stream.emit("error", missing(p));
          return;
        }
        const data = Buffer.from(files.get(p)!.text).subarray(
          options.start,
          options.end + 1,
        );
        stream.emit("data", data);
        if (!destroyed) stream.emit("end");
        stream.emit("close");
      });
      return stream;
    },
  };
  const fsPromises: any = {
    stat: async (p: string) => fs.statSync(p),
    readFile: async (p: string) => fs.readFileSync(p),
    readdir: async (p: string) => {
      if (!dirs.has(p)) throw missing(p);
      return [...files.keys()]
        .filter((k) => k.startsWith(p + "/"))
        .map((k) => k.slice(p.length + 1));
    },
  };
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error"].map((k) => [
      k,
      (...args: any[]) => logs.push([k, ...args]),
    ]),
  );
  const paths = {
    getCompressedWorkDir: () => "owned-project",
    getProjectMemoryDir: () => "/owned/memory",
    getTeamMemoryDir: (id: string) => "/owned/team/@" + id,
    getSessionHistoryDir: () => "/owned/sessions",
  };
  const message = createAutoMemoryUtilities({
    fs,
    getWorkDir: () => "/owned/project",
    getHomeDir: () => "/owned/home",
    addSystemReminder,
  }).MessageUtils;
  const sessions: any = {
    create: async () => {
      const s = new HarnessSession("selector-" + ++sequence);
      events.push(["create-session", s.id]);
      return s;
    },
    addHistory: async (s: any, items: any) =>
      events.push(["history", s.id, items]),
    runWithoutHistory: (fn: any) => {
      events.push(["without-history"]);
      return fn();
    },
  };
  const agentService: any = {
    runOneTime: async (name: string, input: string, options: any) => {
      events.push([
        "one-time",
        name,
        input,
        options.context.id,
        options.context.abortController.signal.aborted,
      ]);
      return selected;
    },
  };
  const runnerProvider = {
    get: async () => ({
      run: async (agent: any, state: any, options: any) => {
        events.push([
          "run-extract",
          agent.name,
          agent.tools.map((t: any) => t.name),
          state._maxTurns,
          state._context.context.conversationRequestId,
          options.maxTurns,
          options.stream,
          state.history.at(-1),
        ]);
        return {
          async *toTextStream() {
            yield "owned extraction";
          },
        };
      },
    }),
  };
  const runtime: any = {
    dependencies: {
      logger,
      settingsManager: { get: async (k: string) => settings[k] },
      sessionManager: sessions,
      stateMachine: {
        transition: (s: any, event: any) =>
          events.push(["transition", s.id, event]),
        forceIdle: (s: any, reason: any) => events.push(["idle", s.id, reason]),
      },
      runnerProvider,
    },
    env: {},
    fs,
    fsPromises,
    now: () => now,
    uuid: () => "owned-uuid",
    isTTY: () => false,
    setTimeout: (fn: any, ms: number) => {
      events.push(["delay", ms]);
      queueMicrotask(fn);
      return { owned: true };
    },
    os: { userInfo: () => ({ username: "owned-os-user" }) },
    utilities: {
      PathUtils: paths,
      MessageUtils: message,
      GitUtils: { getGitUserName: () => undefined },
      InputItemUtils: createResponseInputUtils(() => "owned-assistant"),
      INTERRUPTED_BY_USER_MESSAGE: "Interrupted by user",
      HistoryUtils: { fillFunctionCallResultHistory },
    },
    getAgentService: () => agentService,
  };
  runtime.scanner = captured
    ? captured.scanner({ ...runtime, warn: logger.warn })
    : createNativeMemoryScanner(
        { ...runtime, warn: logger.warn },
        parseMemorySemanticType,
      );
  runtime.freshness = captured
    ? captured.freshness(runtime)
    : createMemoryFreshness(runtime);
  runtime.prompts = captured
    ? captured.prompts(
        {
          ...runtime,
          getSessionHistoryDir: paths.getSessionHistoryDir,
          warn: logger.warn,
        },
        policy,
      )
    : createMemoryPromptBuilder(policy, {
        ...runtime,
        getSessionHistoryDir: paths.getSessionHistoryDir,
        warn: logger.warn,
      });
  const make = (name: string) =>
    captured
      ? captured.construct(name, runtime)
      : name === "MemoryContextInterceptor"
        ? new MemoryContextInterceptor(runtime)
        : new (services as any)[name](runtime);
  const relevance = make("MemoryRelevanceServiceImpl"),
    extraction = make("MemoryExtractionServiceImpl");
  Object.assign(runtime.dependencies, {
    memoryRelevanceService: relevance,
    extractionService: extraction,
  });
  const context = make("MemoryContextInterceptor"),
    freshnessHook = make("MemoryFreshnessPostToolHook"),
    stopHook = make("MemoryExtractionStopHook");
  for (const s of [relevance, extraction, context, freshnessHook, stopHook])
    Object.assign(s, runtime.dependencies);
  const session = new HarnessSession("owned-parent"),
    agent = new Agent({ name: "cli", instructions: "owned", tools: [] });
  session.state = new RunState(
    new RunContext(session),
    [
      { type: "message", role: "user", id: "u", content: "owned question" },
      {
        type: "message",
        role: "assistant",
        id: "a",
        status: "completed",
        content: [{ type: "output_text", text: "owned answer" }],
      },
    ] as any,
    agent,
    10,
  ) as any;
  return {
    runtime,
    files,
    dirs,
    logs,
    events,
    settings,
    relevance,
    extraction,
    context,
    freshnessHook,
    stopHook,
    session,
    agent,
    agentService,
    runnerProvider,
    get now() {
      return now;
    },
    set now(v: number) {
      now = v;
    },
    get selected() {
      return selected;
    },
    set selected(v: string) {
      selected = v;
    },
    add(p: string, text: string, mtime = now - 3 * 86400000) {
      files.set(p, { text, mtimeMs: mtime });
    },
    input() {
      return {
        input: [{ type: "message", role: "user", content: "owned question" }],
        agent,
        session,
        skipRun: false,
        agentOptions: {},
        bypassMessageQueue: false,
      };
    },
  };
}
