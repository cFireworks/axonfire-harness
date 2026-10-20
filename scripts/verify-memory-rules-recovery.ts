import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import {
  loadCapturedMemoryRules,
  memoryRuleClassEvidence,
} from "./helpers/captured-memory-rules.js";
import { memoryRuleFixture } from "./helpers/memory-rule-fixtures.js";
import { turn } from "./helpers/session-result-fixtures.js";
import * as constants from "../src/memory/memory-rule-constants.js";
import { MemoryMarkdownUtils } from "../src/memory/native-memory-markdown.js";
import {
  CapturedMinimatch,
  CAPTURED_MINIMATCH_MODULE_IDS,
} from "../src/vendor/captured-minimatch.js";
import { ConditionalRulesAgentRunInterceptor } from "../src/agents/conditional-rules-agent-run-interceptor.js";
import { createConditionalRulesToolInjector } from "../src/memory/conditional-rules-tool-injector.js";
import { addSystemReminder } from "../src/agents/system-reminder-agent-run-interceptor.js";
import { ToolResult } from "../src/tools/tool-result.js";
import { ToolNames } from "../src/tools/tool-names.js";
const source = await readFile(
    process.argv[2] ??
      new URL(
        "../../../work/workbuddy-app/cli/dist/codebuddy.js",
        import.meta.url,
      ),
    "utf8",
  ),
  native = loadCapturedMemoryRules(source);
let comparisons = 0,
  methods = 0;
const norm = (v: any): any =>
  v === undefined
    ? "[undefined]"
    : typeof v === "function"
      ? "[function]"
      : Object.prototype.toString.call(v) === "[object Error]"
        ? { name: v.name, message: v.message, code: v.code }
        : Object.prototype.toString.call(v) === "[object Map]"
          ? Array.from(v, ([k, x]: any) => [norm(k), norm(x)])
          : Object.prototype.toString.call(v) === "[object Set]"
            ? Array.from(v, norm)
            : Array.isArray(v)
              ? Array.from(v, norm)
              : v && typeof v === "object"
                ? Object.fromEntries(
                    Object.keys(v)
                      .sort()
                      .map((k) => [k, norm(v[k])]),
                  )
                : v;
const eq = (a: any, b: any, label: string) => {
    assert.deepEqual(norm(a), norm(b), label);
    comparisons++;
  },
  outcome = async (fn: () => any) => {
    try {
      return { value: await fn() };
    } catch (error) {
      return { error };
    }
  };
const strip = (v: any): any =>
  Array.isArray(v)
    ? v.map(strip)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, x]) => [k, strip(x)]),
        )
      : v;
function ast(s: string) {
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
  visit(parse(s, { ecmaVersion: "latest", sourceType: "module" }));
  return nodes;
}
const port = async (file: string) =>
  ast(
    ts.transpileModule(
      await readFile(new URL("../src/" + file, import.meta.url), "utf8"),
      {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
        },
      },
    ).outputText,
  );
const transform = (s: string) =>
  s
    .replaceAll("eJ.", "this.runtime.utilities.")
    .replaceAll("e$.", "this.runtime.fs.")
    .replaceAll(
      "eK.ContainerUtil.get(eV.HookManager)",
      "this.runtime.getHookManager()",
    )
    .replaceAll("eV.HookEvent.INSTRUCTIONS_LOADED", "'InstructionsLoaded'");
async function classBodies(
  file: string,
  name: string,
  p: number,
  change = (s: string) => s,
  selected?: string[],
) {
  const nodes = await port(file),
    restored = nodes.find(
      (n) => n.type === "ClassDeclaration" && n.id?.name === name,
    );
  assert.ok(restored, name);
  for (const method of native.cls(p + 1).body.body) {
    if (selected && !selected.includes(method.key.name)) continue;
    const expected = ast(
        "class Owned{" + change(native.text(method)) + "}",
      ).find((n) => n.type === "MethodDefinition"),
      actual = restored.body.body.find(
        (n: any) =>
          n.type === "MethodDefinition" && n.key?.name === method.key.name,
      );
    if (method.kind === "constructor" && name !== "LRUCache")
      eq(
        strip(actual.value.body.body.at(-1)),
        strip(expected.value.body.body.at(-1)),
        name + " native constructor fields",
      );
    else {
      eq(
        strip(actual),
        strip(expected),
        name + "." + method.key.name + " complete AST",
      );
      methods++;
    }
  }
}
for (const [name, p] of memoryRuleClassEvidence)
  await classBodies("memory/native-memory-services.ts", name, p, transform);
await classBodies("memory/native-memory-services.ts", "LRUCache", 9326727);
for (const [name, p, list] of [
  [
    "PathUtils",
    13328565,
    [
      "getMemoryFilePath",
      "isPathInside",
      "resolveFilePathToWorkDir",
      "normalizePathSeparators",
      "unixToWindowsPath",
    ],
  ],
  ["ImportUtils", 13232643, undefined],
  ["GlobUtils", 13226909, undefined],
  ["MemoryLoadContextUtils", 13251801, undefined],
] as const)
  await classBodies(
    "memory/memory-rule-utilities.ts",
    name,
    p,
    (s) => s.replaceAll("process.platform", "runtime.platform"),
    list ? [...list] : undefined,
  );
await classBodies(
  "memory/native-memory-markdown.ts",
  "MemoryMarkdownUtils",
  13249637,
  (s) => s.replaceAll("MarkdownUtils.", "MemoryMarkdownUtils."),
  [
    "extractFrontMatterWithContent",
    "parseListField",
    "splitByCommaRespectingBraces",
  ],
);
await classBodies(
  "agents/conditional-rules-agent-run-interceptor.ts",
  "ConditionalRulesAgentRunInterceptor",
  7106105,
  (s) => s.replace("A_.AgentRunInterceptorPriority.ConditionalRules", "1740"),
);
await classBodies(
  "memory/conditional-rules-tool-injector.ts",
  "ConditionalRulesToolInjector",
  11679441,
  (s) => s,
  ["injectConditionalRules"],
);
for (const [key, value] of Object.entries(constants))
  eq(value, native.constants[key], "constant " + key);
const vendor = await readFile(
    new URL("../src/vendor/captured-minimatch.ts", import.meta.url),
    "utf8",
  ),
  factories = ast(vendor).find(
    (n) => n.type === "VariableDeclarator" && n.id?.name === "modules",
  ).init.properties;
eq(
  factories.map((n: any) => n.key.value),
  CAPTURED_MINIMATCH_MODULE_IDS,
  "glob module manifest",
);
for (const entry of factories) {
  const original = native.modules.get(entry.key.value);
  eq(
    vendor.slice(entry.value.start, entry.value.end),
    source.slice(original.value.start, original.value.end),
    "exact minimatch factory " + entry.key.value,
  );
}
for (const text of [
  "no frontmatter",
  "---\npaths: a,b\nalwaysApply: false\n---\nbody",
  '---\npaths:\n  - src/**\n  - "*.ts"\nenabled: false\n---\nbody',
  "---\na: |\n  one\n\n  two\nb: >\n  three\n  four\n---\nbody",
  "---\npaths: [src/**, tests/**]\n---\nbody",
  '---\na: 1\nb: null\nc: true\nd: "false"\n---\nbody',
  "---\nonly: \n---\nbody",
])
  eq(
    await outcome(() =>
      MemoryMarkdownUtils.extractFrontMatterWithContent(text),
    ),
    await outcome(() => native.markdown.extractFrontMatterWithContent(text)),
    "small frontmatter",
  );
for (const value of [
  undefined,
  [],
  [" x ", "y"],
  "{a,b},c",
  "[a,b],c",
  "a({b,c}),d",
  true,
  2,
])
  eq(
    await outcome(() => MemoryMarkdownUtils.parseListField(value)),
    await outcome(() => native.markdown.parseListField(value)),
    "list field",
  );
for (const pattern of [
  "*.ts",
  "**/*.ts",
  "!*.md",
  "{a,b}.ts",
  "+(a|b).ts",
  "[abc].ts",
  "**/.hidden",
  "src/**",
  "!(*.md)",
  "[",
  "**\\x",
  "",
])
  for (const filename of [
    "a.ts",
    "src/a.ts",
    ".hidden",
    "x.md",
    "b.ts",
    "src/.hidden",
  ])
    eq(
      await outcome(() =>
        CapturedMinimatch.minimatch(filename, pattern, { matchBase: true }),
      ),
      await outcome(() =>
        native.minimatch.minimatch(filename, pattern, { matchBase: true }),
      ),
      "glob " + pattern + "/" + filename,
    );
const bag = (v: any[]) =>
  v
    .map(norm)
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
async function both(label: string, run: (f: any) => any) {
  const a = memoryRuleFixture(),
    b = memoryRuleFixture(native);
  eq(
    await outcome(() => run(a)),
    await outcome(() => run(b)),
    label + " result",
  );
  await turn();
  await turn();
  eq(
    {
      files: a.files,
      events: bag(a.events),
      logs: bag(a.logs),
      hooks: bag(a.hooks),
    },
    {
      files: b.files,
      events: bag(b.events),
      logs: bag(b.logs),
      hooks: bag(b.hooks),
    },
    label + " I/O and logs",
  );
}
const ctx = (f: any) => f.runtime.utilities.MemoryLoadContextUtils.create();
await both("scope/root-to-leaf/main-file precedence and hooks", async (f) => {
  for (const [path, text] of [
    ["/owned/home/CODEBUDDY.mdc", "user"],
    ["/owned/home/rules/extra.md", "user rule"],
    ["/owned/AGENTS.md", "ancestor"],
    ["/owned/project/CODEBUDDY.md", "project ancestor"],
    ["/owned/project/work/CODEBUDDY.md", "main"],
    ["/owned/project/work/AGENTS.md", "ignored"],
    ["/owned/project/work/.codebuddy/AGENTS.md", "hidden main"],
    ["/owned/project/work/CODEBUDDY.local.md", "local"],
  ])
    f.add(path, text);
  const all = await f.manager.get({});
  return {
    all,
    user: await f.manager.get({ scope: "user" }),
    project: await f.manager.get({ scope: "project" }),
    default: await f.manager.get(),
  };
});
for (const metadata of [
  "",
  "enabled: false",
  "alwaysApply: false",
  "paths: *.ts",
  "paths: *.ts\nalwaysApply: true",
  "paths:\n - *.ts\n - src/**",
  "paths: [a,b]",
  "paths: x\nenabled: false",
])
  await both("parser/validator " + metadata, async (f) => {
    f.add("/owned/home/rules/x.md", "---\n" + metadata + "\n---\nbody");
    const rule = await f.parser.parse("/owned/home/rules/x.md", {
      scope: "user",
    });
    return {
      rule,
      normal: f.validator.validate(rule),
      imported: f.validator.validate(rule, { isImported: true }),
      subdirectory: f.validator.validate(rule, { isSubdirectory: true }),
      loaded: await f.manager.get({}),
    };
  });
await both(
  "manual imports override disabled flags, code exclusions, cycle and import depth",
  async (f) => {
    f.add(
      "/owned/project/work/CODEBUDDY.md",
      "main @./a.md\n`@ignored.md`\n```\n@ignore2.md\n```",
    );
    f.add(
      "/owned/project/work/a.md",
      "---\nenabled: false\nalwaysApply: false\n---\na @b.md",
    );
    f.add("/owned/project/work/b.md", "b @a.md @directory");
    f.dirs.add("/owned/project/work/directory");
    for (let i = 0; i < 7; i++)
      f.add(
        "/owned/project/work/depth" + i + ".md",
        "depth " + i + (i < 6 ? " @depth" + (i + 1) + ".md" : ""),
      );
    const context = ctx(f);
    await f.loader.loadFile("/owned/project/work/depth0.md", context, {
      scope: "project",
    });
    const depth = [...context.loadedMemories.keys()];
    return { all: await f.manager.get({}), depth };
  },
);
await both(
  "duplicate realpath imports accumulate provenance, missing/denied errors suppressed",
  async (f) => {
    f.add("/owned/shared.md", "shared");
    f.links.set("/owned/alias.md", "/owned/shared.md");
    const c = ctx(f);
    await f.loader.loadFile("/owned/alias.md", c, {
      scope: "project",
      importedFrom: "/owned/a.md",
    });
    await f.loader.loadFile("/owned/shared.md", c, {
      scope: "user",
      importedFrom: "/owned/b.md",
    });
    f.errors.set(
      "/owned/denied.md",
      Object.assign(Error("denied"), { code: "EACCES" }),
    );
    return {
      rules: [...c.loadedMemories],
      missing: await f.loader.loadFile("/owned/missing", c, {
        scope: "project",
      }),
      denied: await f.loader.loadFile("/owned/denied.md", c, {
        scope: "project",
      }),
    };
  },
);
await both(
  "directory recursion symbolic loops supported extensions and oversize filtering",
  async (f) => {
    f.add("/owned/home/rules/a.md", "a");
    f.add("/owned/home/rules/sub/b.mdc", "b");
    f.add("/owned/home/rules/large.md", "x".repeat(40001));
    f.add("/owned/home/rules/skip.MD", "not supported");
    f.links.set("/owned/home/rules/sub/back", "/owned/home/rules");
    f.links.set("/owned/home/rules/broken", "/owned/nope");
    return f.manager.get({});
  },
);
await both("cache coalescing/rejection retention/clear", async (f) => {
  let loads = 0;
  f.loader.loadAll = async () => {
    loads++;
    throw Error("owned failure");
  };
  const first = f.manager.get(),
    second = f.manager.get();
  const failures = await Promise.all([
    outcome(() => first),
    outcome(() => second),
  ]);
  await outcome(() => f.manager.get());
  const before = loads;
  f.manager.clear();
  await outcome(() => f.manager.get());
  return { failures, before, loads };
});
await both(
  "subdirectory first-file/relative globs/root exclusion and negative cache",
  async (f) => {
    f.add("/owned/project/work/CODEBUDDY.md", "root");
    f.add(
      "/owned/project/work/src/CODEBUDDY.md",
      "---\npaths: *.ts, !*.md\n---\nsrc",
    );
    f.add("/owned/project/work/src/AGENTS.md", "ignored");
    f.add("/owned/project/work/src/deep/CODEBUDDY.mdc", "deep");
    f.add("/owned/project/work/.codebuddy/private/CODEBUDDY.md", "excluded");
    const first = await f.subdirLoader.loadForPaths([
      "/owned/project/work/src/deep/x.ts",
      "/owned/project/work/src/x.ts",
      "/outside/file",
      "/owned/project/work/.codebuddy/private/a",
    ]);
    await f.subdirLoader.loadForPaths(["/owned/project/work/new/file"]);
    f.add("/owned/project/work/new/CODEBUDDY.md", "new");
    const stale = await f.subdirLoader.loadForPaths([
      "/owned/project/work/new/file",
    ]);
    f.subdirLoader.clear();
    return {
      first,
      stale,
      fresh: await f.subdirLoader.loadForPaths([
        "/owned/project/work/new/file",
      ]),
    };
  },
);
for (const globs of [
  undefined,
  [],
  ["../outside"],
  ["*.ts"],
  ["./*.ts", "!foo/*.md"],
  ["/absolute/*.ts"],
  ["*{a,b}*"],
  [" ", "..foo", "!"],
])
  await both("subdir glob transform " + globs, async (f) => ({
    globs: f.subdirLoader.resolveGlobs(globs, "src/deep"),
    same: f.subdirLoader.isSubPath(f.cwd, f.cwd),
    inside: f.subdirLoader.isSubPath(f.cwd + "/src", f.cwd),
  }));
await both(
  "conditional consumed once, candidate/path order, payload prompt and clear",
  async (f) => {
    f.add(
      "/owned/project/work/.codebuddy/rules/types.md",
      "---\npaths: *.ts\n---\ntypes rule",
    );
    f.add("/owned/project/work/src/CODEBUDDY.md", "src rule");
    const state = {
      pendingTriggers: new Set([
        "/owned/project/work/src/a.ts",
        "/owned/project/work/src/b.ts",
      ]),
      processedRules: new Set(),
    };
    const first = await f.conditionalRules.consume(state);
    state.pendingTriggers.add("/owned/project/work/src/a.ts");
    return { first, second: await f.conditionalRules.consume(state), state };
  },
);
for (const content of [
  "",
  "existing",
  "existing\n",
  "existing\r\n\r\n",
  "## CodeBuddy Added Memories\n- old\n\n## Next\nnext",
  "prefix - fact already-suffixed",
])
  for (const scope of ["user", "project", "project-local", "managed"])
    await both(
      "fact insertion/duplicate/write scope " + scope + "/" + content,
      async (f) => {
        const filename = f.runtime.utilities.PathUtils.getMemoryFilePath(scope);
        f.add(filename, content);
        await f.manager.addFact("--- fact", scope);
        await f.manager.addFact("fact", scope);
        return f.files.get(filename);
      },
    );
for (const filename of [
  "a.ts",
  "@a.ts",
  "file:///owned/project/work/a.ts",
  "file:a.ts",
  "~/a.ts",
  "dir\\a.ts",
])
  await both("native file path resolution " + filename, async (f) =>
    f.runtime.utilities.PathUtils.resolveFilePathToWorkDir(filename),
  );
for (const result of [
  { content: "tool output" },
  { content: 0 },
  { other: true },
  null,
]) {
  const run = async (nativeFlag: boolean) => {
    const f = memoryRuleFixture(nativeFlag ? native : undefined);
    f.add(
      "/owned/project/work/.codebuddy/rules/x.md",
      "---\npaths: *.ts\n---\nrule",
    );
    const state = {
        pendingTriggers: new Set<string>(),
        processedRules: new Set<string>(),
      },
      injector = nativeFlag
        ? native.injector(
            f.conditionalRules,
            f.runtime.utilities.PathUtils,
            f.runtime.dependencies.logger,
            ToolResult,
            ToolNames,
          )
        : createConditionalRulesToolInjector(
            f.conditionalRules,
            f.runtime.utilities.PathUtils,
            f.runtime.dependencies.logger,
          );
    const value = structuredClone(result);
    await injector.injectConditionalRules(
      "Read",
      { file_path: "a.ts" },
      { conditionalRules: state },
      value,
    );
    return { value, state, logs: f.logs };
  };
  eq(
    await run(false),
    await run(true),
    "tool result injection " + JSON.stringify(result),
  );
}
for (const input of [
  "plain",
  [],
  [{ type: "message", role: "user", content: "owned user" }],
]) {
  const run = async (nativeFlag: boolean) => {
    const service = {
        consume: async (state: any) => {
          state.pendingTriggers.clear();
          return { content: "owned conditional reminder" };
        },
      },
      interceptor = nativeFlag
        ? native.interceptor(service, addSystemReminder)
        : new ConditionalRulesAgentRunInterceptor(service),
      context = {
        input: structuredClone(input),
        session: {
          conditionalRules: {
            pendingTriggers: new Set(["a"]),
            processedRules: new Set(),
          },
        },
      };
    await interceptor.intercept(context);
    return { context, priority: interceptor.priority };
  };
  eq(await run(false), await run(true), "conditional interceptor");
}
console.log(
  JSON.stringify(
    {
      passed: true,
      comparisons,
      fullMethodAsts: methods,
      minimatchModules: CAPTURED_MINIMATCH_MODULE_IDS.length,
      scope:
        "eight native services + LRU + Path/Import/Glob/Markdown/context helpers + tool/result and run interceptor; owned memory filesystem/hooks only; no product bootstrap",
    },
    null,
    2,
  ),
);
