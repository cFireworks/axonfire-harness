import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { createAutoMemoryUtilities } from "../src/memory/auto-memory-utilities.js";
import {
  loadCapturedAutoMemory,
  autoMemoryEvidence,
} from "./helpers/captured-auto-memory.js";
import { autoMemoryFixture } from "./helpers/auto-memory-fixtures.js";
import { loadMemoryPolicy } from "../src/memory/memory-extraction-prompts.js";
import { turn } from "./helpers/session-result-fixtures.js";
const source = await readFile(
    process.argv[2] ??
      new URL(
        "../../../work/workbuddy-app/cli/dist/codebuddy.js",
        import.meta.url,
      ),
    "utf8",
  ),
  original = loadCapturedAutoMemory(source),
  policy = await loadMemoryPolicy();
let comparisons = 0,
  fullMethodAsts = 0;
const norm = (v: any): any =>
  v === undefined
    ? "[undefined]"
    : typeof v === "function"
      ? "[function]"
      : Object.prototype.toString.call(v) === "[object Error]" ||
          v?.name === "AbortError"
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
const serviceTransform = (s: string) =>
  s
    .replaceAll("process.env", "this.runtime.env")
    .replaceAll("Date.now()", "this.runtime.now()")
    .replaceAll("process.stdout.isTTY", "this.runtime.isTTY()")
    .replaceAll("scanMemoryFiles(", "this.runtime.scanner.scanMemoryFiles(")
    .replaceAll(
      "formatMemoryManifest(",
      "this.runtime.scanner.formatMemoryManifest(",
    )
    .replaceAll(
      "buildExtractPrompt(",
      "this.runtime.prompts.buildExtractPrompt(",
    )
    .replaceAll(
      "eK.ContainerUtil.get(tE.AgentService)",
      "this.runtime.getAgentService()",
    )
    .replaceAll("(0,eK.generateUUUID)()", "this.runtime.uuid()")
    .replaceAll("eJ.", "this.runtime.utilities.")
    .replaceAll("tI.", "this.runtime.fs.")
    .replaceAll("tg.", "this.runtime.freshness.");
const contextTransform = (s: string) =>
  s
    .replaceAll("process.env", "this.runtime.env")
    .replaceAll("AH.", "this.runtime.utilities.")
    .replaceAll("A$.", "this.runtime.fs.")
    .replaceAll("nT.", "this.runtime.fsPromises.")
    .replaceAll("nR.", "this.runtime.freshness.")
    .replaceAll("nk.", "this.runtime.prompts.")
    .replaceAll("setTimeout(", "this.runtime.setTimeout(")
    .replaceAll(
      "Promise.resolve().then(ec.t.bind(ec,70857,23))",
      "Promise.resolve().then(()=>this.runtime.os)",
    )
    .replaceAll(
      "Av.ContainerUtil.get(rC.SessionManager)",
      "this.sessionManager",
    );
for (const [name, p] of autoMemoryEvidence) {
  const nodes = await port(
      name === "MemoryContextInterceptor"
        ? "agents/memory-context-interceptor.ts"
        : "memory/native-auto-memory-services.ts",
    ),
    restored = nodes.find(
      (n) => n.type === "ClassDeclaration" && n.id?.name === name,
    );
  assert.ok(restored, name);
  for (const method of original.cls(p + 1).body.body) {
    const transformed = (
        name === "MemoryContextInterceptor"
          ? contextTransform
          : serviceTransform
      )(original.text(method)),
      expected = ast("class Owned{" + transformed + "}").find(
        (n) => n.type === "MethodDefinition",
      ),
      actual = restored.body.body.find(
        (m: any) =>
          m.type === "MethodDefinition" && m.key?.name === method.key.name,
      );
    if (method.kind === "constructor")
      eq(
        strip(actual.value.body.body.at(-1)),
        strip(expected.value.body.body.at(-1)),
        name + " native fields",
      );
    else {
      eq(strip(actual), strip(expected), name + "." + method.key.name + " AST");
      fullMethodAsts++;
    }
  }
}
for (const [file, names] of [
  ["memory/native-memory-scanner.ts", original.scannerNames],
  ["memory/memory-freshness.ts", original.freshNames],
  ["memory/memory-prompt-builder.ts", original.promptNames],
] as const) {
  const nodes = await port(file);
  for (const name of names) {
    const fn = original.fn(name, 9322200, 9363300),
      changed = original
        .text(fn)
        .replaceAll("Date.now()", "runtime.now()")
        .replace(
          "await Promise.resolve().then(ec.t.bind(ec,79896,23))",
          "await Promise.resolve().then(()=>runtime.fs)",
        );
    eq(
      strip(
        nodes.find(
          (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
        ),
      ),
      strip(ast(changed).find((n) => n.type === "FunctionDeclaration")),
      name + " full function AST",
    );
    fullMethodAsts++;
  }
}
const pathNodes = await port("memory/auto-memory-utilities.ts");
for (const [className, p, names] of [
  [
    "AutoMemoryPathUtils",
    13331980,
    [
      "getCompressedWorkDir",
      "compressPath",
      "getProjectMemoryDir",
      "getGlobalMemoryDir",
      "getTeamMemoryDir",
      "getSessionHistoryDir",
      "getHomeMemoriesDir",
      "getHomeProjectsDir",
      "getProjectHomeDir",
    ],
  ],
  [
    "MemoryMessageUtils",
    13314430,
    ["findFirstUserMessage", "firstUserMessageContainsRole"],
  ],
] as const) {
  const restored = pathNodes.find(
    (n) => n.type === "ClassDeclaration" && n.id?.name === className,
  );
  for (const name of names) {
    const method = original
      .cls(p)
      .body.body.find((m: any) => m.key?.name === name);
    eq(
      strip(
        restored.body.body.find(
          (m: any) => m.type === "MethodDefinition" && m.key?.name === name,
        ),
      ),
      strip(method),
      className + "." + name + " AST",
    );
    fullMethodAsts++;
  }
}
const gitMethod = original
  .cls(13098830)
  .body.body.find((m: any) => m.key?.name === "getGitUserName");
eq(
  strip(
    pathNodes
      .find(
        (n) =>
          n.type === "ClassDeclaration" && n.id?.name === "AutoMemoryGitUtils",
      )
      .body.body.find((n: any) => n.key?.name === "getGitUserName"),
  ),
  strip(gitMethod),
  "GitUtils.getGitUserName full AST",
);
fullMethodAsts++;
for (const value of ["owned user\n", "  ", "", 42, Error("owned failure")]) {
  const run = (native: boolean) => {
    const calls: any[] = [];
    const childProcess = {
      execSync: (...args: any[]) => {
        calls.push(args);
        if (value instanceof Error) throw value;
        return value;
      },
    };
    const git = native
      ? original.git(childProcess)
      : createAutoMemoryUtilities({ childProcess }).GitUtils;
    return { value: git.getGitUserName(), calls };
  };
  eq(run(false), run(true), "Git identity extraction/timeout/failure");
}
async function both(label: string, run: (f: any) => any) {
  const a = autoMemoryFixture(policy),
    b = autoMemoryFixture(policy, original);
  eq(
    await outcome(() => run(a)),
    await outcome(() => run(b)),
    label + " return",
  );
  await turn();
  await turn();
  eq(a.events, b.events, label + " effects");
  eq(a.logs, b.logs, label + " logs");
}
for (const content of [
  "",
  " index \n",
  "x".repeat(40000),
  "x".repeat(40001),
  "💡".repeat(20001),
  Array.from({ length: 201 }, (_, i) => "line " + i).join("\n"),
  ("x".repeat(300) + "\n").repeat(210),
])
  await both("entrypoint truncation", async (f) =>
    f.runtime.prompts.truncateEntrypointContent(content),
  );
for (const typed of [true, false])
  for (const content of ["", "# index\n- owned", "long\n".repeat(220)])
    await both("complete typed/legacy prompt " + typed, async (f) => {
      f.settings.memory = { typedMemory: typed };
      f.add("/owned/memory/MEMORY.md", content);
      return {
        prompt: await f.context.generateMemoryPrompt(),
        extract: f.runtime.prompts.buildExtractPrompt(7, "- owned file"),
      };
    });
for (const disable of [undefined, "1", "0", "true", " 1 "])
  for (const enabled of [
    undefined,
    "true",
    "TRUE",
    "1",
    "false",
    "0",
    " true ",
  ])
    for (const setting of [undefined, false, true])
      await both(
        "enable precedence " + disable + "/" + enabled + "/" + setting,
        async (f) => {
          if (disable !== undefined)
            f.runtime.env.CODEBUDDY_DISABLE_AUTO_MEMORY = disable;
          if (enabled !== undefined)
            f.runtime.env.CODEBUDDY_MEMORY_ENABLED = enabled;
          f.settings.memory = { autoMemoryEnabled: setting };
          return f.context.isAutoMemoryEnabled();
        },
      );
for (const env of [undefined, "1", "0", "true", "FALSE", " false "])
  for (const value of [undefined, false, true])
    await both("typed/team gates", async (f) => {
      if (env !== undefined) {
        f.runtime.env.CODEBUDDY_TYPED_MEMORY_ENABLED = env;
        f.runtime.env.CODEBUDDY_TEAM_MEMORY_ENABLED = env;
      }
      f.settings.memory = {
        typedMemory: value,
        teamMemory: { enabled: value, userId: "setting-user" },
      };
      return {
        typed: await f.context.isTypedMemoryEnabled(),
        team: await f.context.isTeamMemoryEnabled(),
        dir: await f.context.getMemoryDir(),
      };
    });
for (const variant of ["env", "setting", "git", "os", "missing-os"])
  await both("team identity " + variant, async (f) => {
    f.settings.memory = { teamMemory: { enabled: true } };
    if (variant === "env") f.runtime.env.CODEBUDDY_USER_ID = "env-user";
    if (variant === "setting")
      f.settings.memory.teamMemory.userId = "setting-user";
    if (variant === "git")
      f.runtime.utilities.GitUtils.getGitUserName = () => "git-user";
    if (variant === "missing-os")
      f.runtime.os.userInfo = () => ({ username: "" });
    return f.context.getMemoryDir();
  });
for (const input of [
  [
    {
      role: "user",
      type: "message",
      content:
        '<system-reminder data-role="memory">old</system-reminder> question',
    },
  ],
  [
    { role: "user", type: "message", content: "a" },
    {
      role: "user",
      type: "message",
      content: '<system-reminder data-role="memory">old</system-reminder> b',
    },
  ],
  [
    {
      role: "user",
      type: "message",
      content: [
        {
          type: "input_text",
          text: "<command-name>x</command-name><system-reminder>ignore</system-reminder> query",
        },
      ],
    },
  ],
])
  await both("query extraction/injection marker", async (f) => ({
    query: f.context.extractLastUserQuery(input),
    inject: f.context.shouldInjectMemoryContext({ input, session: f.session }),
  }));
for (const days of [-2, 0, 1, 1.99, 2, 10])
  await both("freshness " + days, async (f) => {
    const t = f.now - days * 86400000;
    return [
      f.runtime.freshness.memoryAge(t),
      f.runtime.freshness.memoryFreshnessText(t),
      f.runtime.freshness.memoryFreshnessNote(t),
    ];
  });
for (const path of [
  "/owned/memory/a.md",
  "/owned/memory-other/a.md",
  "/other/a.md",
])
  await both("freshness path prefix", async (f) => {
    f.add(path, "owned");
    return f.freshnessHook.execute({ tool_input: { file_path: path } });
  });
await both("scanner bounded metadata sorts/excludes/aborts", async (f) => {
  f.add("/owned/memory/MEMORY.md", "index");
  f.add(
    "/owned/memory/a.md",
    "---\nname: Owned\ntype: project\ndescription: old\n---\n" +
      "x".repeat(6000),
  );
  f.add("/owned/memory/nested/b.md", "b", f.now);
  f.add("/owned/memory/C.MD", "skip");
  const rows = await f.runtime.scanner.scanMemoryFiles("/owned/memory");
  const abort = new AbortController();
  abort.abort();
  return {
    rows,
    manifest: f.runtime.scanner.formatMemoryManifest(rows),
    aborted: await f.runtime.scanner.scanMemoryFiles(
      "/owned/memory",
      abort.signal,
    ),
    preAbortedHead: await f.runtime.scanner.readFileHead(
      "/owned/memory/a.md",
      10,
      abort.signal,
    ),
  };
});
for (const reply of [
  "not JSON",
  '{"selected_memories":null}',
  'prefix {"selected_memories":["a.md","unknown","a.md"]} suffix',
  '{"selected_memories":["nested/b.md"]}',
  '{"selected_memories":["a.md"]} {"other":1}',
])
  await both("AI selection response " + reply, async (f) => {
    f.settings.memory = { relevanceSelection: true };
    f.selected = reply;
    f.add("/owned/memory/a.md", "---\nname: A\ntype: feedback\n---\nA");
    f.add("/owned/memory/nested/b.md", "B");
    return f.relevance.selectRelevantMemories(
      "owned query",
      "/owned/memory",
      ["Read"],
      new Set(),
      undefined,
    );
  });
await both(
  "surface marks unreadable/duplicate selections before reads",
  async (f) => {
    f.relevance.selectRelevantMemories = async () => [
      { path: "/owned/memory/missing.md", mtimeMs: f.now },
      { path: "/owned/memory/a.md", mtimeMs: f.now - 4 * 86400000 },
      { path: "/owned/memory/a.md", mtimeMs: f.now },
    ];
    f.add("/owned/memory/a.md", "owned memory");
    const first = await f.context.getRelevantMemoriesContent(
      "q",
      "/owned/memory",
      f.session,
      undefined,
    );
    return { first, surfaced: f.session.memoriesSurfacedInSession };
  },
);
await both(
  "context entrypoint then selected content with 50ms delay",
  async (f) => {
    f.settings.memory = { relevanceSelection: true };
    f.add("/owned/memory/a.md", "owned memory");
    const context = f.input();
    await f.context.intercept(context);
    return {
      input: context.input,
      skipRun: context.skipRun,
      surfaced: f.session.memoriesSurfacedInSession,
    };
  },
);
await both(
  "selection abort adds native interrupted history and forces idle",
  async (f) => {
    f.settings.memory = { relevanceSelection: true };
    f.relevance.selectRelevantMemories = async () => {
      f.session.abortController.abort();
      return [];
    };
    const context = f.input();
    await f.context.intercept(context);
    return { skipRun: context.skipRun };
  },
);
for (const enabled of [undefined, "1", "0"])
  for (const disabled of [undefined, "1"])
    for (const autoDisabled of [undefined, "1"])
      await both("extract gates", async (f) => {
        if (enabled)
          f.runtime.env.CODEBUDDY_MEMORY_EXTRACTION_ENABLED = enabled;
        if (disabled)
          f.runtime.env.CODEBUDDY_MEMORY_EXTRACTION_DISABLED = disabled;
        if (autoDisabled)
          f.runtime.env.CODEBUDDY_DISABLE_AUTO_MEMORY = autoDisabled;
        f.settings.memory = {
          memoryExtraction: true,
          autoMemoryEnabled: false,
        };
        return f.extraction.isEnabled();
      });
await both(
  "native extraction RunContext/RunState stream and cursor",
  async (f) => {
    f.settings.memory = { memoryExtraction: true };
    f.session.agentPurpose = "conversation";
    await f.extraction.doExtract(f.session);
    return {
      progress: f.extraction.inProgress,
      cursor: f.extraction.lastMemoryMessageUuid,
      purpose: f.session.agentPurpose,
      mode: f.session.permissionModeSubject.value,
    };
  },
);
await both(
  "native extraction failure restores flags without cursor advance",
  async (f) => {
    f.settings.memory = { memoryExtraction: true };
    f.runnerProvider.get = async () => ({
      run: async () => {
        throw Error("owned extraction failure");
      },
    });
    await f.extraction.doExtract(f.session);
    return {
      progress: f.extraction.inProgress,
      cursor: f.extraction.lastMemoryMessageUuid,
      purpose: f.session.agentPurpose,
      mode: f.session.permissionModeSubject.value,
    };
  },
);
for (const tty of [true, false])
  await both("Stop hook waits only nonTTY", async (f) => {
    f.runtime.isTTY = () => tty;
    f.stopHook.extractionService = {
      extractAsync: () => f.events.push(["extract-start"]),
      waitForExtraction: async () => f.events.push(["extract-wait"]),
    };
    await f.stopHook.execute({ session: f.session });
    return [
      f.stopHook.event,
      f.stopHook.priority,
      f.freshnessHook.event,
      f.freshnessHook.priority,
      f.freshnessHook.matcher,
    ];
  });
console.log(
  JSON.stringify(
    {
      passed: true,
      comparisons,
      fullMethodAsts,
      scope:
        "complete MemoryContext/Relevance/Extraction/Stop/Freshness classes; complete scanner/builders/age/path helpers; SDK 0.5.2 dependency unchanged, owned memory I/O only",
    },
    null,
    2,
  ),
);
