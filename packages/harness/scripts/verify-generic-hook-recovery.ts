import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import {
  loadCapturedGenericHooks,
  genericHookEvidence,
  hookShellNames,
  promptProtocolNames,
} from "./helpers/captured-generic-hooks.js";
import { genericHookFixture } from "./helpers/generic-hook-fixtures.js";
import {
  HookEvent,
  HookPriority,
  NotificationType,
} from "../src/hooks/hook-constants.js";
import { createHookEventMetadata } from "../src/hooks/hook-event-metadata.js";
import { runInNewContext } from "node:vm";
const source = await readFile(
  getCapturedBundlePath(),
  "utf8",
);
const native = loadCapturedGenericHooks(source);
let comparisons = 0,
  methods = 0;
const norm = (v: any): any =>
  v === undefined
    ? "[undefined]"
    : typeof v === "function"
      ? "[function]"
      : Object.prototype.toString.call(v) === "[object Error]"
        ? { name: v.name, message: v.message }
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
function ast(code: string) {
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
  visit(parse(code, { ecmaVersion: "latest", sourceType: "module" }));
  return nodes;
}
const ports = new Map<string, any[]>();
async function port(file: string) {
  if (!ports.has(file))
    ports.set(
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
  return ports.get(file)!;
}
const environment = (s: string) =>
  s
    .replaceAll("process.env", "this.runtime.env")
    .replaceAll("Date.now()", "this.runtime.now()")
    .replaceAll("setTimeout(", "this.runtime.setTimeout(")
    .replaceAll("clearTimeout(", "this.runtime.clearTimeout(");
const transform = (name: string, s: string) => {
  if (name === "HookExecutorImpl") {
    s = environment(s)
      .replaceAll("oK.", "this.runtime.shell.")
      .replaceAll("iJ.spawn", "this.runtime.spawn")
      .replaceAll(
        "nB.InputItemUtils.",
        "this.runtime.utilities.InputItemUtils.",
      )
      .replaceAll("??o$", "??60000");
    for (const key of hookShellNames)
      s = s.replaceAll(key + "(", "this.runtime.shellHelpers." + key + "(");
    return s;
  }
  if (name === "HookManagerImpl")
    return environment(s)
      .replaceAll("nB.PathUtils.", "this.runtime.utilities.PathUtils.")
      .replaceAll("oK.", "this.runtime.shell.")
      .replaceAll("oJ.", "this.runtime.pluginUtilities.")
      .replaceAll("oV.", "this.runtime.ifRule.")
      .replaceAll("await fetch(", "await this.runtime.fetch(");
  if (name === "PromptHookServiceImpl")
    return s
      .replaceAll(
        "r6.ContainerUtil.get(r4.AgentService)",
        "this.runtime.getAgentService()",
      )
      .replaceAll(
        "r6.ContainerUtil.get(r4.RunnerProvider)",
        "this.runnerProvider",
      )
      .replaceAll("r6.ContainerUtil.get(r4.AgentManager)", "this.agentManager")
      .replaceAll("nB.", "this.runtime.utilities.")
      .replaceAll(
        "parsePromptHookResponse(",
        "this.runtime.promptProtocol.parsePromptHookResponse(",
      )
      .replaceAll(
        "buildPromptHookArgumentsJson(",
        "this.runtime.promptProtocol.buildPromptHookArgumentsJson(",
      );
  return s;
};
for (const [name, anchor] of genericHookEvidence) {
  const file = {
    HookExecutorImpl: "native-hook-executor",
    HookManagerImpl: "native-hook-manager",
    PromptHookServiceImpl: "native-prompt-hook-service",
    ScopedHookRegistryImpl: "native-scoped-hook-registry",
  }[name]!;
  const restored = (await port("hooks/" + file + ".ts")).find(
    (n) => n.type === "ClassDeclaration" && n.id?.name === name,
  );
  for (const method of native.cls(anchor + 1).body.body) {
    const expected = ast(
      "class Owned{" + transform(name, native.text(method)) + "}",
    ).find((n) => n.type === "MethodDefinition");
    const actual = restored.body.body.find(
      (n: any) =>
        n.type === "MethodDefinition" && n.key.name === method.key.name,
    );
    if (method.kind === "constructor")
      eq(
        strip(actual.value.body.body.at(-1)),
        strip(expected.value.body.body.at(-1)),
        name + " native fields",
      );
    else {
      eq(
        strip(actual),
        strip(expected),
        name + "." + method.key.name + " full AST",
      );
      methods++;
    }
  }
}
for (const [file, names, min, max] of [
  ["hooks/hook-shell-helpers.ts", hookShellNames, 8444000, 8446794],
  [
    "hooks/hook-shell-helpers.ts",
    ["windowsPathToUnix", "parseCommandLine"],
    11310000,
    11320000,
  ],
  ["hooks/prompt-hook-protocol.ts", promptProtocolNames, 8470000, 8474520],
  ["hooks/hook-rule-matcher.ts", ["toPluginOptionEnvKey"], 9815000, 9815500],
] as const)
  for (const name of names) {
    eq(
      strip(
        (await port(file)).find(
          (n) => n.type === "FunctionDeclaration" && n.id.name === name,
        ),
      ),
      strip(native.fn(name, min, max)),
      name + " full AST",
    );
    methods++;
  }
const originalRule = native.nodes.find(
  (n) =>
    n.type === "VariableDeclarator" &&
    n.id.name === "oV" &&
    n.start > 8453000 &&
    n.end < 8454850,
);
const portRule = (await port("hooks/hook-rule-matcher.ts")).find(
  (n) => n.type === "VariableDeclarator" && n.id.name === "oV",
);
eq(strip(portRule.init), strip(originalRule.init), "if rule full AST");
methods += 2;
const hookMessage = native
  .cls(13266827)
  .body.body.find((m: any) => m.key.name === "createHookMessage");
eq(
  strip(
    (await port("hooks/hook-runtime.ts")).find(
      (n) =>
        n.type === "MethodDefinition" && n.key.name === "createHookMessage",
    ),
  ),
  strip(hookMessage),
  "createHookMessage full AST",
);
methods++;
const eventPairs = [
  ...source.slice(8128377, 8130500).matchAll(/eA\.([A-Z_]+)="([^" ]+)"/g),
];
eq(
  HookEvent,
  Object.fromEntries(eventPairs.slice(4).map((m) => [m[1], m[2]])),
  "28 native events",
);
eq(
  NotificationType,
  Object.fromEntries(eventPairs.slice(0, 4).map((m) => [m[1], m[2]])),
  "notification enum",
);
const metadataNodes = ["eh", "ef", "em"].map((name) =>
  native.nodes.find(
    (n) =>
      n.type === "VariableDeclarator" &&
      n.id.name === name &&
      n.start > 8128377 &&
      n.end < 8137900,
  ),
);
for (const item of metadataNodes)
  eq(
    strip(
      (await port("hooks/hook-event-metadata.ts")).find(
        (n) => n.type === "VariableDeclarator" && n.id.name === item.id.name,
      ).init,
    ),
    strip(item.init),
    "event metadata full AST " + item.id.name,
  );
const metadataNative = (productName: string) =>
  runInNewContext(
    "(function(){" +
      metadataNodes.map((n) => "const " + native.text(n) + ";").join("") +
      "return{EVENTS_WITHOUT_MATCHER:eh,HOOK_EVENT_IO_DESCRIPTIONS:ef,HOOK_EVENT_TITLES:em}})()",
    { ed: HookEvent, eg: { PRODUCT_NAME: productName } },
  );
for (const name of ["CodeBuddy", "WorkBuddy"])
  eq(
    createHookEventMetadata(name),
    metadataNative(name),
    "event metadata " + name,
  );
const priorityStart = source.indexOf("!function(eA){eA[eA.Highest=0]");
const priorityEnd = source.indexOf("let eB=", priorityStart);
eq(
  HookPriority,
  runInNewContext("let ep;" + source.slice(priorityStart, priorityEnd) + ";ep"),
  "native numeric enum reverse mapping",
);
async function compare(
  label: string,
  run: (f: ReturnType<typeof genericHookFixture>) => any,
) {
  const a = genericHookFixture(),
    b = genericHookFixture(native);
  const [actual, expected] = await Promise.all([run(a), run(b)]);
  eq(actual, expected, label + " result");
  eq(a.events, b.events, label + " I/O");
  eq(a.logs, b.logs, label + " logs");
  eq(
    a.timers.map((t) => [t.ms, t.cleared, t.unreferenced]),
    b.timers.map((t) => [t.ms, t.cleared, t.unreferenced]),
    label + " timers",
  );
  await a.close();
  await b.close();
}
for (const code of [0, 1, 2, -1, null, undefined])
  for (const output of [
    "",
    "text",
    "null",
    "false",
    "{}",
    '{"continue":false}',
    '{"decision":"block","reason":"legacy"}',
    '{"decision":"approve"}',
    '{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"owned","modifiedInput":{"a":1}}}',
    '{"hookSpecificOutput":{"permissionDecision":"ask"},"systemMessage":"ask"}',
    '{"suppressOutput":true,"systemMessage":"system","stopReason":"stop","reason":"reason"}',
  ])
    for (const stderr of ["", " owned stderr "])
      await compare("parse " + String(code) + " " + output + stderr, (f) => {
        const result = f.executor.parseHookOutput(
          code,
          output,
          stderr,
          "owned",
        );
        return [result, f.executor.deriveHookStatus(result)];
      });
for (const response of [
  "",
  "garbage",
  "null",
  "false",
  "{}",
  "[]",
  '{"ok":false,"impossible":true,"reason":"owned"}',
  '{"ok":true,"impossible":true}',
  '```json\n{"ok":false}\n```',
  'prefix {"ok":true} suffix',
  'prefix {"ok":false,"reason":{"nested":true}} suffix',
])
  await compare("prompt parse " + response, (f) =>
    f.runtime.promptProtocol.parsePromptHookResponse(response),
  );
for (const event of Object.values(HookEvent))
  await compare("protocol " + event, (f) => [
    f.runtime.promptProtocol.buildPromptHookArgumentsJson({
      hook_event_name: event,
      session_id: "owned",
      session: { secret: "excluded" },
      tool_name: "Read",
      tool_input: { path: "a" },
      permission_mode: "default",
      last_assistant_message: "last",
      background_tasks: ["task"],
      session_crons: ["cron"],
      tool_response: "response",
    }),
    f.manager.convertToSdkInput(
      event,
      { session_id: "owned" },
      { additionalContext: "native" },
    ),
  ]);
for (const p of [
  { stdout: ["owned output"] },
  { exit: 2, stderr: "blocked" },
  { exit: 1, stderr: "warning" },
  {
    stdout: [
      '{"hookSpecificOutput":{"permissionDecision":"ask"},"systemMessage":"ask"}',
    ],
  },
  { error: true },
  { writeError: true },
  { stdinError: "EPIPE" },
  {
    stdout: ['{"async":', 'true,"asyncTimeout":321,"text":"} \\" {"}'],
    hold: true,
  },
  { stdout: ['{"async":true}'], hold: true },
  { stdout: ["x".repeat(4100), '{"async":true}'] },
])
  await compare("execute " + JSON.stringify(p), async (f) => {
    f.setPlan(p);
    const messages: any[] = [];
    const result = await f.executor.execute(
      "owned-command",
      {
        session_id: "owned",
        session: { inputSubject: { next: (m: any) => messages.push(m) } },
      },
      { hookEvent: "Stop", callId: "call", timeout: 250 },
    );
    return [result, messages];
  });
await compare("timeout", async (f) => {
  f.setPlan({ hold: true });
  const pending = f.executor.execute("owned-timeout", {}, { timeout: 25 });
  await Promise.resolve();
  f.timers[0].callback();
  return pending;
});
for (const event of ["Stop", "PreToolUse", "UserPromptSubmit"])
  for (const type of ["command", "prompt", "agent", "http"])
    await compare("manager " + event + type, async (f) => {
      f.settings.hooks = {
        [event]: [
          {
            matcher: "*",
            hooks: [
              {
                type,
                command: "owned",
                prompt: "Evaluate",
                url: "http://127.0.0.1:1/owned",
                once: true,
                pluginRoot: "/owned/plugin",
                pluginData: "/owned/data",
                pluginOptions: { "some-key": false },
                allowedEnvVars: ["PUBLIC"],
              },
            ],
          },
        ],
      };
      f.setPlan({ stdout: ['{"continue":false,"reason":"owned"}'], exit: 2 });
      f.setResponse('{"ok":false,"reason":"owned"}');
      f.setHttpResult({
        status: 200,
        text: '{"decision":"block","reason":"owned"}',
      });
      const input = {
        hook_event_name: event,
        tool_name: "Read",
        tool_input: { path: "a" },
        session_id: "owned",
      };
      return [
        f.manager.getMatchValue(event, input),
        await f.manager.hasHooks(event),
        await f.manager.executeHooks(event, input, { callId: "owned" }),
      ];
    });
await compare("layers", async (f) => {
  f.processors.push({
    process: (input: any) => {
      input.tool_name = "Read";
      f.events.push(["processor"]);
    },
  });
  f.internal.push({
    event: "PreToolUse",
    execute: async () => ({
      allowed: true,
      hookSpecificOutput: { additionalContext: "internal" },
      modifiedInput: { a: 1 },
    }),
  });
  f.settings.hooks = {
    PreToolUse: [
      {
        matcher: "Read",
        hooks: [
          { type: "command", command: "owned" },
          { type: "command", command: "owned" },
        ],
      },
    ],
  };
  f.plugins.push({
    plugin: { name: "owned", marketplaceName: "local" },
    components: {
      hooks: { PreToolUse: [{ hooks: [{ type: "prompt", prompt: "owned" }] }] },
    },
  });
  f.registry.register(
    "owned-scope",
    { PreToolUse: [{ hooks: [{ type: "prompt", prompt: "scoped" }] }] },
    { sourceLabel: "fixture" },
  );
  f.sdk.PreToolUse = [
    { matcher: "Read", hookCallbackIds: ["callback"], timeout: 0.01 },
  ];
  f.setSdkResult({
    hookSpecificOutput: {
      permissionDecision: "deny",
      permissionDecisionReason: "sdk",
      updatedInput: { b: 2 },
    },
  });
  return f.manager.executeHooks("PreToolUse", {}, { callId: "call" });
});
await compare("registry", (f) => {
  const shared = { type: "command", command: "owned", sourceId: "preserved" };
  f.registry.register(
    "scope",
    {
      Stop: [{ hooks: [shared, { type: "prompt", prompt: "stop" }] }],
      SubagentStop: [{ hooks: [{ type: "command", command: "sub" }] }],
    },
    { isAgent: true, sourceLabel: "agent" },
  );
  const before = [
    f.registry.hasScope("scope"),
    f.registry.getHooks("Stop"),
    f.registry.getHooks("SubagentStop"),
  ];
  f.registry.unregister("scope");
  f.registry.register("", {}, {});
  return [before, f.registry.getHooks("SubagentStop")];
});
await compare("once", async (f) => {
  const hook = { type: "command", command: "owned", once: true };
  f.settings.hooks = { Stop: [{ hooks: [hook] }] };
  await f.manager.executeHooks("Stop", {});
  const first = await f.manager.getHooks("Stop");
  f.settings.hooks.Stop = [{ hooks: [{ ...hook }] }];
  return [first, await f.manager.getHooks("Stop")];
});
for (const input of [
  {},
  { toolName: "Read", toolInput: { path: "a" } },
  { toolName: "Bash", toolInput: { command: "a" } },
  { toolName: "Custom", toolInput: { x: "a" } },
])
  for (const rule of [
    "",
    "???",
    "Read",
    "Read(a)",
    "Bash(a)",
    "Custom(a)",
    " Read( a ) ",
  ])
    await compare("if rule " + rule + JSON.stringify(input), (f) => [
      f.runtime.ifRule.parse(rule),
      f.runtime.ifRule.matches(rule, input),
    ]);
for (const event of ["Stop", "PreToolUse"])
  for (const match of [undefined, "Read", "["])
    await compare("matching " + event + String(match), async (f) => {
      f.settings.hooks = {
        [event]: [
          { matcher: "[", hooks: [{ type: "command", command: "a" }] },
          { matcher: "Read", hooks: [{ type: "command", command: "b" }] },
        ],
      };
      f.sdk[event] = [{ matcher: "Read", hookCallbackIds: ["owned"] }];
      return [
        await f.manager.hasHooks(event, match),
        f.manager.findMatchingHooks(await f.manager.getHooks(event), match),
      ];
    });
for (const failure of [
  "settings",
  "plugins",
  "internal",
  "sdk",
  "processor",
  "prompt-callback",
])
  await compare("failure " + failure, async (f) => {
    f.settings.hooks = {
      Stop: [
        {
          hooks: [
            {
              type: "prompt",
              prompt: "owned",
              onResult:
                failure === "prompt-callback"
                  ? () => {
                      throw Error("owned-callback");
                    }
                  : undefined,
            },
          ],
        },
      ],
    };
    if (failure === "settings")
      f.manager.settingsManager = {
        get: async () => {
          throw Error("owned-settings");
        },
      };
    if (failure === "plugins")
      f.manager.pluginManager = {
        getActivePlugins: async () => {
          throw Error("owned-plugins");
        },
      };
    if (failure === "internal")
      f.internal.push({
        event: "Stop",
        execute: async () => {
          throw Error("owned-internal");
        },
      });
    if (failure === "sdk") {
      f.sdk.Stop = [{ hookCallbackIds: ["owned"] }];
      f.setSdkResult(Error("owned-sdk"));
    }
    if (failure === "processor")
      f.processors.push({
        process: async () => {
          throw Error("owned-processor");
        },
      });
    return f.manager.executeHooks("Stop", { hook_event_name: "Stop" });
  });
for (const isWindows of [false, true])
  for (const shell of [undefined, "powershell"])
    for (const command of [
      "owned-command",
      '"C:\\owned path\\pwsh.exe" -File owned.ps1',
    ])
      await compare(
        "shell execution " + String(isWindows) + String(shell) + command,
        async (f) => {
          f.runtime.shell.isWindows = () => isWindows;
          return f.executor.execute(
            command,
            {},
            {
              shell,
              env: {
                CODEBUDDY_PROJECT_DIR: "C:\\owned project",
                CLAUDE_PLUGIN_ROOT: "D:/owned/plugin",
              },
            },
          );
        },
      );
for (const response of [
  { status: 503, text: "owned-error" },
  { status: 200, text: "plain" },
  { status: 200, text: "null" },
  { status: 200, text: '{"continue":false}' },
  {
    status: 200,
    text: '{"decision":"block","suppressOutput":true,"systemMessage":"owned","reason":"reason","hookSpecificOutput":{"permissionDecision":"allow"}}',
  },
  { error: Object.assign(Error("owned-abort"), { name: "AbortError" }) },
])
  await compare("HTTP " + JSON.stringify(response), async (f) => {
    f.setHttpResult(response);
    return f.manager.executeHttpHook(
      {
        url: "http://127.0.0.1:1/owned",
        headers: { "x-vars": "$PUBLIC/${PUBLIC}/$OTHER" },
        allowedEnvVars: ["PUBLIC"],
      },
      { session_id: "owned", session: { private: true } },
      "Stop",
    );
  });
await compare("aggregate", async (f) => {
  const result = f.manager.aggregateSettledResults([
    { status: "rejected", reason: Error("owned") },
    {
      status: "fulfilled",
      value: {
        allowed: true,
        message: "allow",
        stdout: "hidden",
        suppressOutput: true,
        continueRequest: {
          message: { type: "message", content: "one" },
          completionPromise: Promise.resolve(),
        },
      },
    },
    {
      status: "fulfilled",
      value: {
        allowed: false,
        blocking: true,
        message: "deny",
        stdout: "visible",
        preventContinuation: true,
        continueRequest: {
          message: { type: "message", content: [{ text: "not-string" }] },
        },
      },
    },
  ]);
  await result.continueRequest.completionPromise;
  return result;
});
for (const fail of [false, true])
  await compare("prompt history " + fail, async (f) => {
    const { Agent, RunContext, RunState } = await import("@openai/agents-core");
    const agent = new Agent({ name: "owned", instructions: "fixed" });
    const session: any = {
      state: new RunState(
        new RunContext({ owned: true }),
        [{ type: "message", role: "user", content: "history" }],
        agent,
        3,
      ),
      agentPurpose: "main",
    };
    f.promptService.agentManager = {
      get: async () => agent,
      getModel: async () => ({ id: "owned-model" }),
    };
    f.promptService.runnerProvider = {
      get: async () => ({
        run: async (a: any, state: any, options: any) => {
          f.events.push([
            "history-run",
            a.name,
            a.instructions,
            a.model,
            state._maxTurns,
            state._originalInput,
            options,
            session.agentPurpose,
            state._context === session.state._context,
          ]);
          if (fail) throw Error("owned-run");
          return {
            async *toTextStream() {
              yield '{"ok":';
              yield "true}";
            },
          };
        },
      }),
    };
    // The captured class resolves providers through ContainerUtil; use its explicit DI namespace too.
    f.runtime.dependencies.agentManager = f.promptService.agentManager;
    f.runtime.dependencies.runnerProvider = f.promptService.runnerProvider;
    const result = await f.promptService.execute(
      { prompt: "owned" },
      { session, hook_event_name: "Stop" },
      { includeHistory: true },
    );
    return [result, session.agentPurpose, session.state.history];
  });
console.log(
  `Generic hooks recovery: ${methods} complete AST methods/functions; ${comparisons} comparisons passed.`,
);
