import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import {
  SDK_CONTROL_CLASSES,
  loadCapturedSdkControl,
} from "./helpers/captured-sdk-control.js";
import {
  sdkControlFixture,
  sdkClientCase,
  sdkInitializeCase,
  sdkSettingsCase,
  type ClientCase,
} from "./helpers/sdk-control-fixtures.js";
import {
  HOOK_EVENTS,
  SDK_PRODUCT_ENVIRONMENT,
  DEFAULT_CONTROL_SIGNAL_CONFIG,
} from "../src/sdk/native-sdk-control.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedSdkControl(source);
const text = ts.transpileModule(
  await readFile(
    new URL("../src/sdk/native-sdk-control.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
    },
  },
).outputText;
const nodes: any[] = [];
function walk(n: any) {
  if (!n || typeof n !== "object") return;
  if (
    ["ClassExpression", "ClassDeclaration", "FunctionDeclaration"].includes(
      n.type,
    )
  )
    nodes.push(n);
  for (const [k, v] of Object.entries(n))
    if (!["start", "end"].includes(k)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") walk(v);
    }
}
walk(parse(text, { ecmaVersion: "latest", sourceType: "module" }));
const ast = (v: any): any =>
  v && typeof v === "object"
    ? Array.isArray(v)
      ? v.map(ast)
      : Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, x]) => [k, ast(x)]),
        )
    : v;
let methods = 0;
for (const [name, start, end] of [
  ...SDK_CONTROL_CLASSES,
  ["NativeDeferred", 117049, 117147] as const,
]) {
  const captured: any = (
      parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression,
    recovered = nodes.find((n) => n.id?.name === name);
  assert.deepEqual(
    ast(recovered.body),
    ast(captured.body),
    "complete class " + name,
  );
  methods += captured.body.body.length;
}
// Parse one complete function rather than the remainder of the bundle module.
for (const name of [
  "isControlRequest",
  "isControlResponse",
  "isControlCancelRequest",
  "isControlSignalMessage",
  "createAbortController",
]) {
  const start = source.indexOf(
      "function " + name + "(",
      name === "createAbortController" ? 12986000 : 7791300,
    ),
    next =
      name === "createAbortController"
        ? source.indexOf("function unlimitAbortSignalListeners(", start)
        : name === "isControlSignalMessage"
          ? source.indexOf("let eh=Symbol(", start)
          : source.indexOf("function ", start + 9),
    captured = parse(source.slice(start, next), { ecmaVersion: "latest" })
      .body[0] as any;
  assert.deepEqual(
    ast(nodes.find((n) => n.id?.name === name)),
    ast(captured),
    name,
  );
  methods++;
}
const sessionPort = ts.transpileModule(
  await readFile(
    new URL("../src/sessions/session-manager.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
    },
  },
).outputText;
const sessionNodes: any[] = [];
const previousNodes = nodes.splice(0);
walk(parse(sessionPort, { ecmaVersion: "latest", sourceType: "module" }));
sessionNodes.push(...nodes);
nodes.splice(0, nodes.length, ...previousNodes);
const originalOverrides: any = (
    parse("class C{" + source.slice(10977093, 10977351) + "}", {
      ecmaVersion: "latest",
    }).body[0] as any
  ).body.body,
  recoveredSession = sessionNodes.find((n) => n.id?.name === "SessionManager");
for (const method of originalOverrides) {
  assert.deepEqual(
    ast(
      recoveredSession.body.body.find(
        (n: any) => n.key?.name === method.key.name,
      ),
    ),
    ast(method),
    "SessionManager." + method.key.name,
  );
  methods++;
}
const eventStart = source.indexOf('ep=["PreToolUse"', 7791300);
assert.deepEqual(
  HOOK_EVENTS,
  JSON.parse(source.slice(eventStart + 3, source.indexOf(",eg=", eventStart))),
);
assert.equal(DEFAULT_CONTROL_SIGNAL_CONFIG.requestTimeoutMs, 60000);
for (const [name, value] of Object.entries(SDK_PRODUCT_ENVIRONMENT))
  assert.ok(
    source
      .slice(15059400, 15059650)
      .includes("eA." + name + "=" + JSON.stringify(value)),
    name,
  );
let comparisons = 0;
const norm = (x: any) => JSON.parse(JSON.stringify(x));
async function compare(fn: (factory?: any) => Promise<any> | any) {
  assert.deepEqual(norm(await fn()), norm(await fn(original)));
  comparisons++;
}
for (const kind of ["permission", "hook", "mcp", "elicitation"] as const)
  for (const finish of [
    "success",
    "error",
    "cancel",
    "cancelAll",
    "timeout",
    "abort",
  ] as const) {
    if (
      (finish === "abort" && kind !== "mcp" && kind !== "elicitation") ||
      (finish === "timeout" && kind !== "permission" && kind !== "hook")
    )
      continue;
    for (const missing of [false, true])
      for (const options of [
        { timeout: 5 },
        {
          timeout: 0,
          agentId: "owned-agent",
          permissionSuggestions: [],
          blockedPath: "/owned",
          decisionReason: "owned reason",
        },
      ]) {
        if (kind === "permission" && finish === "timeout" && !options.timeout)
          continue;
        await compare((factory) =>
          sdkClientCase({ kind, finish, missing, options }, factory),
        );
      }
  }
const decisions = ["allow", "ask", "deny", undefined];
for (const a of decisions)
  for (const b of decisions)
    for (const c of decisions)
      for (const rejected of [false, true])
        for (const stop of [false, true])
          await compare((factory) => {
            const f = sdkControlFixture(factory),
              initial = {
                shouldContinue: true,
                systemMessages: [],
                additionalContext: [],
                suppressOutput: false,
              };
            return {
              out: f.hooks.aggregateResults(
                [a, b, c].map((decision, i) =>
                  rejected && i === 1
                    ? { status: "rejected", reason: "owned rejected" }
                    : {
                        status: "fulfilled",
                        value: {
                          continue: stop ? false : true,
                          stopReason: "stop " + i,
                          suppressOutput: i === 2,
                          systemMessage: "system " + i,
                          hookSpecificOutput: {
                            permissionDecision: decision,
                            permissionDecisionReason: "reason " + i,
                            updatedInput:
                              decision === "allow" ? { value: i } : undefined,
                            additionalContext: "context " + i,
                          },
                        },
                      },
                ),
                initial,
              ),
              events: f.events,
            };
          });
for (const matcher of [
  undefined,
  "",
  "^Write$",
  "Read|Write",
  "[invalid",
  "Write",
])
  for (const tool of [undefined, "Write", "Read", "[invalid"])
    await compare((factory) => {
      const f = sdkControlFixture(factory);
      return [
        f.hooks.matchesTool(matcher, tool),
        f.hooks.getToolName(
          tool ? { tool_name: tool } : { hook_event_name: "Stop" },
        ),
      ];
    });
for (const hookCount of [0, 1, 3])
  for (const mismatch of [false, true])
    for (const failure of [false, true])
      await compare(async (factory) => {
        const f = sdkControlFixture(factory);
        f.hooks.setHooks({
          PreToolUse: [
            {
              matcher: mismatch ? "^Read$" : "Write",
              hookCallbackIds: Array.from(
                { length: hookCount },
                (_, i) => "owned-" + i,
              ),
              timeout: 0.03,
            },
          ],
          Stop: [],
          Unknown: undefined,
        });
        const pending = f.hooks.executeHooks(
          { hook_event_name: "PreToolUse", tool_name: "Write" },
          "owned-call",
        );
        for (const [i, message] of f.messages().entries())
          await f.response(
            message.request_id,
            failure && i === 0
              ? "owned error"
              : {
                  systemMessage: "message " + i,
                  hookSpecificOutput: {
                    permissionDecision: i % 2 ? "deny" : "allow",
                    additionalContext: "ctx " + i,
                  },
                },
            failure && i === 0 ? "error" : "success",
          );
        return {
          result: await pending,
          events: f.events,
          pending: f.hooks.pendingRequests.size,
        };
      });
for (const sequence of [
  [{}, {}],
  [{ systemPrompt: "one" }, {}],
  [{ agents: { owned: { prompt: "owned" } } }, { appendSystemPrompt: "two" }],
  [{ systemPrompt: "same" }, { systemPrompt: "same" }],
])
  for (const synced of [false, true])
    await compare((factory) => {
      const f = sdkControlFixture(factory),
        state = new f.classes.SdkInitializeStateServiceImpl(),
        events: any[] = [];
      for (const v of sequence) {
        events.push(["set", state.set(v), state.get()]);
        if (synced) state.markSynced();
      }
      events.push(
        ["clear", state.clear(), state.get()],
        ["clear2", state.clear()],
      );
      return events;
    });
for (const kind of [
  "success",
  "error",
  "unknown",
  "cancel",
  "timeout",
] as const)
  await compare(async (factory) => {
    const f = sdkControlFixture(factory),
      request = {
        type: "control_request",
        request_id: "owned-control",
        request: { subtype: kind === "unknown" ? "missing" : "owned" },
      };
    let resolve: any;
    f.control.subtypeHandlers = [
      {
        subtype: "owned",
        async handle(_message: any, signal: AbortSignal) {
          f.events.push(["handler", signal.aborted]);
          if (kind === "error") throw Error("owned handler error");
          if (kind === "cancel" || kind === "timeout")
            await new Promise((r) => {
              resolve = r;
            });
          return { owned: true };
        },
      },
    ];
    const task = f.control.handleMessage(request);
    const entry = f.control.pendingRequests.get("owned-control");
    entry?.deferred.promise.catch(() => {});
    if (kind === "cancel") f.control.cancelRequest("owned-control");
    else if (kind === "timeout") f.fireTimer([...f.timers.keys()][0]!);
    resolve?.();
    await task;
    return {
      events: f.events,
      pending: f.control.pendingRequests.size,
      timers: f.timers.size,
    };
  });
for (const environment of [
  undefined,
  "external",
  "internal",
  "ioa",
  "cloudhosted",
  "unknown",
])
  for (const endpoint of [undefined, "http://owned.invalid"])
    for (const prompt of [undefined, "owned system"])
      for (const productFail of [false, true])
        for (const primaryFail of [false, true])
          for (const account of [false, true])
            await compare((factory) =>
              sdkInitializeCase(
                {
                  environment,
                  endpoint,
                  prompt,
                  productFail,
                  primaryFail,
                  account,
                },
                factory,
              ),
            );
for (const capabilities of [
  undefined,
  { elicitation: { form: false } },
  { elicitation: { form: true } },
])
  for (const servers of [undefined, [], ["owned-a", "owned-b"]])
    for (const agents of [undefined, {}, { owned: { prompt: "owned" } }])
      await compare((factory) =>
        sdkInitializeCase(
          {
            capabilities,
            servers,
            agents,
            hooks: { Stop: [{ hookCallbackIds: ["owned-callback"] }] },
            append: "owned appended",
          },
          factory,
        ),
      );
for (const kind of ["model", "permission"])
  for (const absent of [false, true])
    for (const id of [undefined, "owned-session", "wrong"])
      for (const mode of [
        "default",
        "acceptEdits",
        "plan",
        "auto",
        "dontAsk",
        "bypassPermissions",
        "fullAccess",
        "invalid",
      ])
        for (const model of [undefined, "owned-model"])
          await compare((factory) =>
            sdkSettingsCase({ kind, absent, id, mode, model }, factory),
          );
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMethodAndFunctionAsts: methods,
      constantTables: 3,
      comparisons,
      scope:
        "12 complete SDK control/initialization classes, guards and abort helper; fake I/O only",
    },
    null,
    2,
  ),
);
