import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import { parse } from "acorn";
import ts from "typescript";
import {
  loadCapturedHookLifecycle,
  hookLifecycleEvidence,
  toolPipelineMethods,
} from "./helpers/captured-hook-lifecycle.js";
import { hookLifecycleFixture } from "./helpers/hook-lifecycle-fixtures.js";
import { createHookPermissionUtils } from "../src/hooks/hook-permission-utils.js";
import { CapturedMinimatch } from "../src/vendor/captured-minimatch.js";
import {
  CapturedHookMicromatch,
  CAPTURED_HOOK_MODULE_IDS,
} from "../src/vendor/captured-hook-dependencies.js";
import * as toolErrors from "../src/tools/native-tool-errors.js";
const source = await readFile(
    process.argv[2] ??
      new URL(
        "../../../work/workbuddy-app/cli/dist/codebuddy.js",
        import.meta.url,
      ),
    "utf8",
  ),
  native = loadCapturedHookLifecycle(source);
let comparisons = 0,
  methods = 0;
const norm = (v: any): any =>
  v === undefined
    ? "[undefined]"
    : typeof v === "function"
      ? "[function]"
      : Object.prototype.toString.call(v) === "[object Error]"
        ? { name: v.name, message: v.message }
        : Object.prototype.toString.call(v) === "[object Map]"
          ? Array.from(v, ([k, v]: any) => [norm(k), norm(v)])
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
};
const strip = (v: any): any =>
  Array.isArray(v)
    ? v.map(strip)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, strip(v)]),
        )
      : v;
function ast(text: string) {
  const nodes: any[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== "object") return;
    nodes.push(n);
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  };
  visit(parse(text, { ecmaVersion: "latest", sourceType: "module" }));
  return nodes;
}
const cache = new Map<string, any[]>();
async function port(file: string) {
  if (!cache.has(file))
    cache.set(
      file,
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
      ),
    );
  return cache.get(file)!;
}
const transform = (name: string, s: string) =>
  name === "SessionHookManagerImpl"
    ? s
        .replaceAll("AB.", "this.runtime.utilities.")
        .replaceAll("AZ.", "this.runtime.trigger.")
        .replaceAll("Date.now()", "this.runtime.now()")
        .replaceAll("AV.PRODUCT_CLI_NAME", "this.runtime.productCliName")
        .replaceAll(
          "extractLastAssistantMessageText(",
          "this.runtime.helpers.extractLastAssistantMessageText(",
        )
        .replaceAll(
          "registerWatchPaths(",
          "this.runtime.helpers.registerWatchPaths(",
        )
    : name === "ToolHookManagerImpl"
      ? s
          .replaceAll("l0.", "this.runtime.trigger.")
          .replaceAll("nW.", "this.runtime.utilities.")
          .replaceAll("Date.now()", "this.runtime.now()")
          .replaceAll("o3.", "this.runtime.toolErrors.")
          .replaceAll(
            "nC.isToolExecutionError",
            "this.runtime.isToolExecutionError",
          )
      : s
          .replaceAll("Date.now()", "this.runtime.now()")
          .replaceAll("process.env", "this.runtime.env")
          .replaceAll("process.cwd()", "this.runtime.getCwd()")
          .replaceAll("console.error(", "this.runtime.consoleError(")
          .replaceAll("nW.PathUtils.", "this.runtime.utilities.PathUtils.")
          .replaceAll(
            "nk.ContainerUtil.get(oQ.PaymentInterceptor)",
            "this.runtime.getPaymentInterceptor()",
          );
async function classMethods(
  file: string,
  name: string,
  p: number,
  change = (s: string) => s,
  keys?: string[],
) {
  const restored = (await port(file)).find(
    (n) => n.type === "ClassDeclaration" && n.id?.name === name,
  );
  assert.ok(restored, name);
  for (const m of native.cls(p + 1).body.body) {
    if (keys && !keys.includes(m.key.name)) continue;
    const expected = ast(
        "class Owned extends Object{" + change(native.text(m)) + "}",
      ).find((n) => n.type === "MethodDefinition"),
      actual = restored.body.body.find(
        (n: any) => n.type === "MethodDefinition" && n.key.name === m.key.name,
      );
    if (m.kind === "constructor")
      eq(
        strip(actual.value.body.body.at(-1)),
        strip(expected.value.body.body.at(-1)),
        name + " fields",
      );
    else {
      eq(strip(actual), strip(expected), name + "." + m.key.name + " full AST");
      methods++;
    }
  }
}
for (const [name, p] of hookLifecycleEvidence)
  await classMethods(
    "hooks/" +
      (name.startsWith("Session")
        ? "native-session-hook-manager"
        : "native-tool-hook-manager") +
      ".ts",
    name,
    p,
    (s) => transform(name, s),
  );
await classMethods(
  "hooks/native-tool-execution-pipeline.ts",
  "NativeToolExecutionPipeline",
  11657350,
  (s) => transform("pipeline", s),
  toolPipelineMethods,
);
const permissionNames = [
  "matchFileRule",
  "normalizePath",
  "normalizeFilePathPattern",
  "matchCommandRule",
  "isComplexCommand",
  "extractSubcommandsSync",
  "extractSubcommandsWithRegex",
  "matchSingleCommandAgainstPattern",
];
await classMethods(
  "hooks/hook-permission-utils.ts",
  "PermissionUtils",
  13344300,
  (s) => s,
  permissionNames,
);
await classMethods(
  "hooks/hook-platform-shell.ts",
  "WindowsBashUtils",
  13407168,
);
await classMethods("tools/native-tool-errors.ts", "ToolError", 12196171);
await classMethods(
  "tools/native-tool-errors.ts",
  "PermissionDeniedError",
  12196252,
);
await classMethods(
  "hooks/hook-message-utils.ts",
  "HookMessageContentUtils",
  13310555,
  (s) => s.replaceAll("MessageContentUtils.", "HookMessageContentUtils."),
  [
    "hasVisibleContent",
    "extractTextContent",
    "stripSystemReminder",
    "isImageLocalPathBlock",
    "stripTeammateMessage",
  ],
);
await classMethods(
  "hooks/hook-message-utils.ts",
  "MessageUtils",
  13319693,
  (s) =>
    s
      .replaceAll("eA.endsWith(ep)", "eA.endsWith(eP)")
      .replaceAll("${ep}", "${eP}"),
  ["isUserQueryContent", "stripUserQueryTags"],
);
for (const [file, names, min, max] of [
  [
    "hooks/hook-lifecycle-helpers.ts",
    ["registerWatchPaths", "extractLastAssistantMessageText"],
    11015000,
    11017694,
  ],
  [
    "hooks/hook-trigger-utils.ts",
    ["buildAgentTrigger", "resolveHookSessionId"],
    8127000,
    8127812,
  ],
  [
    "hooks/hook-platform-shell.ts",
    [
      "isWindows",
      "commandExists",
      "getPowerShellArgsPrefix",
      "getPowerShellConfiguration",
      "getShellConfigByType",
      "getShellConfiguration",
      "detectShellType",
    ],
    11308000,
    11311000,
  ],
  ["tools/native-tool-errors.ts", ["getToolErrorName"], 12190200, 12190350],
] as const)
  for (const name of names) {
    let original = native.text(native.fn(name, min, max));
    if (name === "getPowerShellConfiguration")
      original = original.replaceAll(
        "eg().accessSync",
        "runtime.fs.accessSync",
      );
    eq(
      strip(
        (await port(file)).find(
          (n) => n.type === "FunctionDeclaration" && n.id.name === name,
        ),
      ),
      strip(ast(original).find((n) => n.type === "FunctionDeclaration")),
      name + " full AST",
    );
    methods++;
  }
// Validate the XML boundary as well as the message-class delegates, independently
// from the shared utility objects used by the controlled execution fixtures.
const messagePort = await port("hooks/hook-message-utils.ts");
for (const name of ["stripSystemReminderXml", "stripUserQueryXml"]) {
  let original = native.text(native.fn(name, 15015600, 15021000));
  if (name === "stripUserQueryXml")
    original = original.replace("replace(eu,", "replace(euRegex,");
  eq(
    strip(
      messagePort.find(
        (n) => n.type === "FunctionDeclaration" && n.id.name === name,
      ),
    ),
    strip(ast(original).find((n) => n.type === "FunctionDeclaration")),
    name + " full AST",
  );
  methods++;
}
const xml = native.nodes.find(
  (n) =>
    n.type === "AssignmentExpression" &&
    n.right.type === "FunctionExpression" &&
    n.left.type === "MemberExpression" &&
    n.left.property.name === "stripPromptContextXml" &&
    n.start > 15015600 &&
    n.end < 15021000,
).right;
eq(
  strip(
    messagePort.find(
      (n) => n.type === "Property" && n.key.name === "stripPromptContextXml",
    ).value,
  ),
  strip(xml),
  "stripPromptContextXml full AST",
);
methods++;
for (const [sourceName, portName] of [
  ["ec", "ec"],
  ["eu", "euRegex"],
])
  eq(
    strip(
      messagePort.find(
        (n) => n.type === "VariableDeclarator" && n.id.name === portName,
      ).init,
    ),
    strip(
      native.nodes.find(
        (n) =>
          n.type === "VariableDeclarator" &&
          n.id.name === sourceName &&
          n.start > 15015600 &&
          n.end < 15016600,
      ).init,
    ),
    "XML regexp " + portName,
  );
const moduleMap = native.nodes.find(
    (n) =>
      n.type === "ObjectExpression" &&
      n.properties?.some(
        (p: any) => p.key?.value === 43519 && p.start === 16310601,
      ),
  ),
  modules = new Map<number, any>(
    moduleMap.properties
      .filter((p: any) => typeof p.key?.value === "number")
      .map((p: any) => [p.key.value, p]),
  );
const vendor = await readFile(
  new URL("../src/vendor/captured-hook-dependencies.ts", import.meta.url),
  "utf8",
);
for (const id of CAPTURED_HOOK_MODULE_IDS) {
  assert.ok(
    vendor.includes(native.text(modules.get(id))),
    "unchanged factory " + id,
  );
  comparisons++;
}
const errorModule = modules.get(19394),
  enumNode = native.nodes.find(
    (n) =>
      n.type === "CallExpression" &&
      n.callee.type === "FunctionExpression" &&
      n.start > errorModule.start &&
      n.end < errorModule.end &&
      native.text(n).includes("ReadFileError="),
  );
eq(
  toolErrors.ToolErrorCode,
  runInNewContext("let eu;(" + native.text(enumNode) + ");eu"),
  "all original error codes",
);
const outcome = async (fn: () => any) => {
  try {
    return { value: await fn() };
  } catch (error) {
    return { error };
  }
};
async function compare(
  label: string,
  run: (f: ReturnType<typeof hookLifecycleFixture>) => any,
) {
  const a = hookLifecycleFixture(),
    b = hookLifecycleFixture(native);
  const [actual, expected] = await Promise.all([
    outcome(() => run(a)),
    outcome(() => run(b)),
  ]);
  eq(actual, expected, label + " result");
  eq(a.events, b.events, label + " events");
  eq(a.logs, b.logs, label + " logs");
  eq(a.session.hookContexts, b.session.hookContexts, label + " contexts");
  await a.close();
  await b.close();
}
const sessionCases: any[] = [
  ["executeSessionStartHooks", "startup"],
  ["executeSessionEndHooks", "other"],
  ["executeSubagentStartHooks"],
  [
    "executeSubagentStopHooks",
    { finalOutput: [{ type: "output_text", text: "sdk-final" }] },
  ],
  ["executePreCompactHooks", "auto", "instructions"],
  ["executePostCompactHooks", "manual", "summary"],
  ["executeNotificationHooks", "owned notification", "permission_prompt"],
  [
    "executePermissionRequestHooks",
    "Read",
    { path: "a" },
    [{ behavior: "allow" }],
    "call",
  ],
  ["executePermissionDeniedHooks", "Read", { path: "a" }, "denied", "call"],
  [
    "executeElicitationHooks",
    {
      mcpServerName: "owned",
      message: "question",
      mode: "form",
      url: "owned",
      elicitationId: "owned",
      requestedSchema: { type: "object" },
    },
  ],
  [
    "executeElicitationResultHooks",
    {
      mcpServerName: "owned",
      elicitationId: "owned",
      action: "accept",
      content: { owned: true },
    },
  ],
  [
    "executeTaskCreatedHooks",
    {
      taskId: "1",
      subject: "owned",
      description: "details",
      teamName: "team",
      teammateName: "member",
    },
  ],
  ["executeTaskCompletedHooks", { taskId: "1", subject: "owned" }],
  ["executeTeammateIdleHooks", { teamName: "team", teammateName: "member" }],
  ["executeSetupHooks", "init"],
  ["executeFileChangedHooks", { filePath: "/owned/a", event: "change" }],
  ["executeCwdChangedHooks", { oldCwd: "/owned/a", newCwd: "/owned/b" }],
  ["executeFinalStopHooks", "failed"],
];
for (const [method, ...args] of sessionCases)
  for (const mode of ["none", "allow", "context", "error"])
    await compare(method + mode, async (f) => {
      if (mode !== "none")
        for (const e of Object.values(
          (await import("../src/hooks/hook-constants.js")).HookEvent,
        ))
          f.enabled.add(e);
      if (mode === "context")
        for (const e of f.enabled)
          f.outputs[e] = {
            allowed: false,
            blocking: true,
            message: "owned",
            stdout: "stdout",
            hookSpecificOutput: {
              additionalContext: "context",
              initialUserMessage: "initial",
              decision: { behavior: "allow" },
              retry: true,
              action: "accept",
              content: { owned: true },
            },
          };
      if (mode === "error")
        for (const e of f.enabled)
          f.outputs[e] = Object.assign(Error("owned-failure"), {
            stack: "owned-stack",
          });
      return (f.sessionManager as any)[method](f.session, ...args);
    });
for (const reason of ["completed", "failed", "cancelled", undefined])
  for (const aborted of [false, true])
    for (const result of [
      { allowed: true },
      { allowed: false, blocking: true, message: "block" },
      { allowed: false, message: "nonblocking" },
      {
        allowed: true,
        continueRequest: { message: { type: "message", content: "continue" } },
      },
      {
        allowed: false,
        blocking: true,
        message: "block",
        preventContinuation: true,
      },
    ])
      await compare(
        "Stop " + reason + aborted + JSON.stringify(result),
        async (f) => {
          f.enabled.add("FinalStop");
          f.outputs.Stop = result;
          if (aborted) f.session.abortController.abort();
          await f.sessionManager.executeStopHooks(
            f.session,
            { finalOutput: "last" },
            { stopReason: reason, stopHookActive: true },
          );
          return f.session.hookContexts;
        },
      );
for (const input of [
  [],
  [{ type: "message", role: "assistant", content: "not-user" }],
  [{ type: "message", role: "user", content: " first\nline " }],
  [
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "<system-reminder>hidden</system-reminder>",
        },
        { type: "input_text", text: "<user_query>actual</user_query>" },
      ],
    },
  ],
])
  for (const denied of [false, true])
    await compare("UserPrompt " + denied + JSON.stringify(input), async (f) => {
      f.enabled.add("UserPromptSubmit");
      f.outputs.UserPromptSubmit = {
        allowed: !denied,
        message: "owned",
        stdout: "append",
      };
      return f.sessionManager.executeUserPromptSubmitHooks(f.session, input);
    });
await compare("watch lifecycle", async (f) => {
  f.files.set("/owned/project/dir", true);
  f.files.set("/owned/project/file", false);
  f.enabled.add("FileChanged");
  f.enabled.add("SessionStart");
  f.outputs.SessionStart = {
    allowed: true,
    hookSpecificOutput: { watchPaths: ["dir", "missing", 7, "file"] },
  };
  await f.sessionManager.executeSessionStartHooks(f.session, "startup");
  f.watchers[0].callback("rename", "new");
  f.files.set("/owned/project/dir/new", false);
  f.watchers[0].callback("rename", "new");
  await new Promise((resolve) => setImmediate(resolve));
  await f.sessionManager.executeSessionEndHooks(f.session, "other");
});
for (const decision of [undefined, "allow", "deny", "ask"])
  await compare("tool pre " + decision, (f) => {
    f.outputs.PreToolUse = {
      allowed: false,
      message: "fallback",
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: "reason",
        updatedInput: { path: "new" },
      },
    };
    return f.toolManager.executePreToolUseHooks(
      "Read",
      { path: "old" },
      f.session,
      "owned-transcript",
      undefined,
      "call",
    );
  });
for (const name of ["Read", "mcp__owned__tool"])
  for (const response of [
    "text",
    { is_error: true, content: { error: "owned" }, tool_error_code: "1009" },
    { isError: true, message: "owned", tool_error_name: "explicit" },
  ])
    await compare("tool post " + name + JSON.stringify(response), (f) => {
      f.outputs.PostToolUse = {
        allowed: true,
        message: "message",
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: "context",
          updatedMCPToolOutput: { new: true },
        },
      };
      return f.toolManager.executePostToolUseHooks(
        name,
        { path: "a" },
        response,
        f.session,
        "transcript",
        "/owned/cwd",
        "call",
      );
    });
for (const name of ["Read", "Glob", "Agent", "Bash"])
  for (const message of [
    "unknown",
    "invalid parameters",
    "Expected string",
    "search path does not exist",
    "cannot read properties of null",
  ])
    for (const interrupt of [false, true])
      await compare("failure " + name + message + interrupt, (f) =>
        f.toolManager.executePostToolUseFailureHooks(
          name,
          {},
          Error(message),
          f.session,
          "transcript",
          undefined,
          "call",
          interrupt,
        ),
      );
for (const mode of [
  "success",
  "empty",
  "throw",
  "deny",
  "modified",
  "cached",
  "payment",
  "context",
])
  await compare("pipeline " + mode, async (f) => {
    if (mode === "deny")
      f.outputs.PreToolUse = { allowed: false, message: "denied" };
    if (mode === "modified")
      f.outputs.PreToolUse = {
        allowed: true,
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput: { path: "new" },
        },
      };
    if (mode === "cached")
      f.session.preToolUseHookResults = new Map([
        ["call", { allowed: true, modifiedInput: { path: "cached" } }],
      ]);
    if (mode === "context") {
      f.outputs.PostToolUse = {
        allowed: true,
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: "hint",
        },
      };
      f.outputs.PostToolUseFailure = {
        allowed: true,
        hookSpecificOutput: {
          hookEventName: "PostToolUseFailure",
          additionalContext: "error-hint",
        },
      };
    }
    const result = await f.pipeline.executeToolWithHooks(
      { name: "Read" },
      async (input: any) => {
        f.events.push(["execute", input]);
        if (mode === "throw") throw Error("owned-error");
        return mode === "empty"
          ? ""
          : { content: "owned result", rawResponse: { raw: true } };
      },
      { path: "old" },
      { context: f.session },
      { toolCall: { callId: "call" } },
    );
    return [result, f.session.preToolUseHookResults];
  });
const PermissionNative = runInNewContext(
  "(" +
    "class PermissionUtils{" +
    permissionNames
      .map((name) =>
        native.text(
          native.cls(13344300).body.body.find((m: any) => m.key.name === name),
        ),
      )
      .join("\n") +
    "})",
  {
    ed: CapturedMinimatch,
    ef: () => path,
    eg: () => ({ homedir: () => "/owned/home" }),
    ev: { PathUtils: { getWorkDir: () => "/owned/project" } },
    eE: () => CapturedHookMicromatch,
  },
);
PermissionNative.getDebugService = () => undefined;
PermissionNative.getCommandParserService = () => undefined;
const permission = createHookPermissionUtils({
  getWorkDir: () => "/owned/project",
  getHomeDir: () => "/owned/home",
});
for (const command of [
  "git status",
  "git diff && node test.js",
  "cat a | rg owned",
  "echo 'a;b'",
  "pwsh -File a",
  "GIT STATUS",
])
  for (const pattern of [
    "",
    "git:*",
    "git *",
    "node:*",
    "*owned*",
    "pwsh:*",
    "git status",
  ])
    eq(
      permission.matchCommandRule(command, pattern),
      PermissionNative.matchCommandRule(command, pattern),
      "command permission " + command + pattern,
    );
for (const file of [
  "a.md",
  ".hidden",
  "src/A.ts",
  "~/a.md",
  "//server/share/a",
  "C:\\owned\\a.md",
])
  for (const pattern of ["*.md", "**/*.ts", "a.md", "./a.md", "~/a.md", "**/*"])
    eq(
      permission.matchFileRule(file, pattern),
      PermissionNative.matchFileRule(file, pattern),
      "file permission " + file + pattern,
    );
console.log(
  `Hook lifecycle recovery: ${methods} complete AST methods/functions; ${comparisons} comparisons passed; ${CAPTURED_HOOK_MODULE_IDS.length} unchanged dependency factories.`,
);
