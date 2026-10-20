import { parse } from "acorn";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
export const memoryRuleClassEvidence = [
  ["MemoryManagerImpl", 9313253],
  ["MemoryLoaderImpl", 9316053],
  ["MemoryParserImpl", 9322398],
  ["MemoryCacheImpl", 9323568],
  ["MemoryValidatorImpl", 9324564],
  ["GlobMatcherImpl", 9325634],
  ["SubdirectoryMemoryLoaderImpl", 9327165],
  ["ConditionalRulesServiceImpl", 9331562],
] as const;
/** Source classes/factories only; no installed application startup or real I/O. */
export function loadCapturedMemoryRules(source: string) {
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
  const classes = nodes.filter((n) =>
      ["ClassExpression", "ClassDeclaration"].includes(n.type),
    ),
    cls = (p: number) =>
      classes
        .filter((n) => n.start <= p && n.end > p)
        .sort((a, b) => a.end - a.start - (b.end - b.start))[0],
    text = (n: any) => source.slice(n.start, n.end);
  const mod = nodes.find(
      (n) =>
        n.type === "ObjectExpression" &&
        n.properties?.some(
          (p: any) => p.key?.value === 43519 && p.start === 16310601,
        ),
    ),
    modules = new Map<number, any>(
      mod.properties
        .filter((p: any) => typeof p.key?.value === "number")
        .map((p: any) => [p.key.value, p]),
    );
  function moduleLoader(overrides: Record<number, any> = {}) {
    const cache = new Map();
    const load: any = (id: number) => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (cache.has(id)) return cache.get(id).exports;
      const entry = modules.get(id);
      if (!entry) throw Error("Unmapped source glob module " + id);
      const m = { exports: {} };
      cache.set(id, m);
      runInNewContext("({" + text(entry) + "})[" + id + "]", {
        Error,
        process: { platform: process.platform, env: {} },
        console: { error() {}, warn() {} },
        Buffer,
      })(m, m.exports, load);
      return m.exports;
    };
    load.r = (out: any) =>
      Object.defineProperty(out, "__esModule", { value: true });
    load.d = (out: any, getters: any) => {
      for (const [k, get] of Object.entries(getters))
        Object.defineProperty(out, k, { get: get as any, enumerable: true });
    };
    load.n = (out: any) => () => (out?.__esModule ? out.default : out);
    load.o = (out: any, k: any) => Object.hasOwn(out, k);
    load.g = {};
    return load;
  }
  const constants = moduleLoader({
      78213: { PRODUCT_NAME: "CodeBuddy", PRODUCT_UPPERCASE_NAME: "CODEBUDDY" },
    })(3238),
    minimatch = moduleLoader()(70941);
  const selected = (p: number, name: string, methods: string[]) =>
    "class " +
    name +
    "{" +
    methods
      .map((k) => text(cls(p).body.body.find((n: any) => n.key?.name === k)))
      .join("\n") +
    "}";
  const markdown = runInNewContext(
    "(" +
      selected(13250070, "MarkdownUtils", [
        "extractFrontMatterWithContent",
        "parseListField",
        "splitByCommaRespectingBraces",
      ]) +
      ")",
  );
  function utilities(runtime: any) {
    return runInNewContext(
      "(function(){" +
        selected(13328570, "PathUtils", [
          "getMemoryFilePath",
          "isPathInside",
          "resolveFilePathToWorkDir",
          "normalizePathSeparators",
          "unixToWindowsPath",
        ]) +
        ";PathUtils.getWorkDir=runtime.getWorkDir;PathUtils.getHomeDir=runtime.getHomeDir;" +
        text(cls(13232650)) +
        ";" +
        text(cls(13226920)) +
        ";" +
        text(cls(13251810)) +
        ";return{PathUtils,ImportUtils,GlobUtils,MemoryLoadContextUtils,MarkdownUtils,MAX_IMPORT_DEPTH:5,FileUtils:{isDirectory:runtime.isDirectory}}})()",
      {
        runtime,
        ef: path,
        em: () => path,
        ep: runtime.fs,
        eh: { homedir: runtime.getUserHomeDir },
        eC: constants,
        e$: path,
        td: { homedir: runtime.getUserHomeDir },
        tp: { PathUtils: { getWorkDir: runtime.getWorkDir } },
        tg: /@([^\s\n]+)/g,
        e7: minimatch,
        MarkdownUtils: markdown,
        process: { platform: runtime.platform },
        Error,
      },
    );
  }
  const LRUCache = runInNewContext("(" + text(cls(9326728)) + ")"),
    sentinel = runInNewContext(
      "(" +
        source.slice(
          source.indexOf("let e4=", 9326700) + 7,
          source.indexOf(",e8=class", 9326700),
        ) +
        ")",
      { eH: constants },
    );
  return {
    nodes,
    cls,
    text,
    modules,
    constants,
    minimatch,
    markdown,
    utilities,
    LRUCache,
    construct(name: string, runtime: any) {
      const p = memoryRuleClassEvidence.find((x) => x[0] === name)?.[1];
      if (!p) throw Error(name);
      const C = runInNewContext("(" + text(cls(p + 1)) + ")", {
        eH: constants,
        eY: path,
        e$: runtime.fs,
        eJ: runtime.utilities,
        eZ: "rules",
        eK: { ContainerUtil: { get: runtime.getHookManager } },
        eV: {
          HookManager: Symbol("owned"),
          HookEvent: { INSTRUCTIONS_LOADED: "InstructionsLoaded" },
        },
        LRUCache,
        e4: sentinel,
        Error,
      });
      return Object.assign(new C(), runtime.dependencies);
    },
    interceptor(service: any, addSystemReminder: any) {
      const C = runInNewContext("(" + text(cls(7106120)) + ")", {
        A_: { AgentRunInterceptorPriority: { ConditionalRules: 1740 } },
        AH: { MessageUtils: { addSystemReminder } },
      });
      return Object.assign(new C(), { conditionalRulesService: service });
    },
    injector(
      service: any,
      PathUtils: any,
      logger: any,
      ToolResult: any,
      ToolNames: any,
    ) {
      const m = cls(11679441).body.body.find(
        (n: any) => n.key?.name === "injectConditionalRules",
      );
      const C = runInNewContext("(class{" + text(m) + "})", {
        nC: { ToolNames, ToolResult },
        nW: { PathUtils },
      });
      return Object.assign(new C(), {
        conditionalRulesService: service,
        logger,
      });
    },
  };
}
