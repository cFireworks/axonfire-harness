import { parse } from "acorn";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import * as SDK from "@openai/agents-core";
import { MemoryMarkdownUtils } from "../../src/memory/native-memory-markdown.js";
import { parseMemorySemanticType } from "../../src/memory/memory-store.js";
export const autoMemoryEvidence = [
  ["MemoryContextInterceptor", 7167120],
  ["MemoryRelevanceServiceImpl", 9342347],
  ["MemoryExtractionServiceImpl", 9348849],
  ["MemoryExtractionStopHook", 9354814],
  ["MemoryFreshnessPostToolHook", 9355943],
] as const;
export function loadCapturedAutoMemory(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const nodes: any[] = [];
  function visit(n: any) {
    if (!n || typeof n !== "object") return;
    nodes.push(n);
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  }
  visit(parse(source, { ecmaVersion: "latest" }));
  const classNodes = nodes.filter((n) =>
      ["ClassExpression", "ClassDeclaration"].includes(n.type),
    ),
    functionNodes = nodes.filter((n) => n.type === "FunctionDeclaration"),
    classCache = new Map<number, any>(),
    functionCache = new Map<string, any>();
  const cls = (p: number) => {
      if (classCache.has(p)) return classCache.get(p);
      const value = classNodes
        .filter(
          (n) =>
            ["ClassExpression", "ClassDeclaration"].includes(n.type) &&
            n.start <= p &&
            n.end > p,
        )
        .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
      classCache.set(p, value);
      return value;
    },
    text = (n: any) => source.slice(n.start, n.end),
    fn = (name: string, min: number, max: number) => {
      const key = name + ":" + min + ":" + max;
      if (functionCache.has(key)) return functionCache.get(key);
      const value = functionNodes.find(
        (n) => n.id?.name === name && n.start >= min && n.end < max,
      );
      functionCache.set(key, value);
      return value;
    };
  const freshNames = [
      "memoryAgeDays",
      "memoryAge",
      "memoryFreshnessText",
      "memoryFreshnessNote",
    ],
    scannerNames = [
      "parseYamlFrontmatter",
      "readFileHead",
      "scanMemoryFiles",
      "formatMemoryManifest",
    ],
    promptNames = [
      "truncateEntrypointContent",
      "buildSearchingPastContextSection",
      "buildMemoryLines",
      "buildMemoryPrompt",
      "memory_extraction_prompts_opener",
      "buildExtractPrompt",
    ];
  return {
    git(childProcess: any) {
      const method = cls(13098830).body.body.find(
        (m: any) => m.key?.name === "getGitUserName",
      );
      return runInNewContext("(class{" + text(method) + "})", {
        ec: () => childProcess,
      });
    },
    nodes,
    cls,
    text,
    fn,
    freshNames,
    scannerNames,
    promptNames,
    freshness(runtime: any) {
      return runInNewContext(
        "(function(){" +
          freshNames.map((n) => text(fn(n, 9356800, 9357900))).join(";") +
          ";return{" +
          freshNames.join(",") +
          "}})()",
        { Date: { now: runtime.now } },
      );
    },
    scanner(runtime: any) {
      return runInNewContext(
        "(function(){" +
          scannerNames.map((n) => text(fn(n, 9322200, 9341900))).join(";") +
          ";return{" +
          scannerNames.join(",") +
          "}})()",
        {
          e$: runtime.fsPromises,
          eY: path,
          eJ: { MarkdownUtils: MemoryMarkdownUtils },
          tu: { parseMemorySemanticType },
          td: 200,
          tp: 4096,
          ec: { t: () => runtime.fs },
          console: { warn: runtime.warn },
          Buffer,
          DOMException,
          Date,
          Error,
        },
      );
    },
    prompts(runtime: any, policy: any) {
      return runInNewContext(
        "(function(){" +
          promptNames.map((n) => text(fn(n, 9344400, 9363300))).join(";") +
          ";return{" +
          promptNames.join(",") +
          "}})()",
        {
          eg: policy,
          tu: policy,
          eu: runtime.fs,
          ed: path,
          ep: {
            PathUtils: { getSessionHistoryDir: runtime.getSessionHistoryDir },
          },
          eh: "This directory already exists — write to it directly with the Write tool (do not run mkdir or check for its existence).",
          console: { warn: runtime.warn },
          Error,
        },
      );
    },
    construct(name: string, runtime: any) {
      const p = autoMemoryEvidence.find((e) => e[0] === name)?.[1];
      if (!p) throw Error(name);
      const globals = {
        process: {
          env: runtime.env,
          stdout: {
            get isTTY() {
              return runtime.isTTY();
            },
          },
        },
        Date: { now: runtime.now },
        Error,
        AbortController,
        Aq: path,
        A_: {
          AgentNames: { COMPACT: "compact" },
          AgentRunInterceptorPriority: { MemoryContext: 1150 },
        },
        rf: Object.fromEntries(
          [
            "DISABLE_AUTO_MEMORY",
            "MEMORY_ENABLED",
            "TEAM_MEMORY_ENABLED",
            "USER_ID",
            "TYPED_MEMORY_ENABLED",
          ].map((s) => ["ENV_KEY_CODEBUDDY_" + s, "CODEBUDDY_" + s]),
        ),
        AH: runtime.utilities,
        A$: runtime.fs,
        nT: runtime.fsPromises,
        nR: runtime.freshness,
        nk: runtime.prompts,
        ry: { SessionRunEventType: { AGENT_STARTED: "AGENT_STARTED" } },
        setTimeout: runtime.setTimeout,
        ec: { t: () => runtime.os },
        Av: {
          ContainerUtil: { get: () => runtime.dependencies.sessionManager },
        },
        rC: { SessionManager: Symbol("owned") },
        scanMemoryFiles: runtime.scanner.scanMemoryFiles,
        formatMemoryManifest: runtime.scanner.formatMemoryManifest,
        buildExtractPrompt: runtime.prompts.buildExtractPrompt,
        eK: {
          ContainerUtil: { get: runtime.getAgentService },
          generateUUUID: runtime.uuid,
        },
        tE: {
          AgentNames: { MEMORY_SELECTOR: "memorySelector" },
          AgentService: Symbol("owned"),
        },
        tI: runtime.fs,
        eJ: runtime.utilities,
        ty: {
          ENV_KEY_CODEBUDDY_DISABLE_AUTO_MEMORY:
            "CODEBUDDY_DISABLE_AUTO_MEMORY",
          PermissionMode: { BypassPermissions: "bypassPermissions" },
        },
        tS: { AgentPurpose: { MemoryExtraction: "memory_extraction" } },
        tQ: SDK,
        tB: SDK,
        t_: SDK,
        eV: {
          HookEvent: { POST_TOOL_USE: "PostToolUse", STOP: "Stop" },
          HookPriority: { Normal: 500, Low: 800 },
        },
        tg: runtime.freshness,
      };
      const C = runInNewContext("(" + text(cls(p + 1)) + ")", globals);
      return Object.assign(new C(), runtime.dependencies);
    },
  };
}
