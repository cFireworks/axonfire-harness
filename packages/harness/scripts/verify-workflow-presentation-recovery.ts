import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import {
  CommandMessageUtils,
  COMMAND_XML_TAGS,
  COMMAND_MESSAGE_TYPES,
  LOCAL_COMMAND_TIP,
} from "../src/commands/command-message-utils.js";
import {
  WorkflowsCommandExecutor,
  SaveWorkflowCommandExecutor,
  formatElapsed,
} from "../src/commands/workflow-command-executors.js";
import {
  WorkflowAcpBridge,
  WorkflowPrintModeHandler,
} from "../src/workflow/workflow-presentation.js";
import { CommandAgentRunInterceptor } from "../src/agents/command-agent-run-interceptor.js";
import { AgentManager } from "../src/agents/agent-manager.js";
const filename = process.argv[2];
if (!filename) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
const time = 1790000000000;
class FixedDate extends Date {
  static override now() {
    return time;
  }
}
function evaluate(code: string, bindings: object = {}): any {
  return runInNewContext(
    code,
    { Date: FixedDate, Error, Promise, Map, Set, ...bindings },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
function original(start: number, end: number, bindings: object = {}): any {
  const text = source.slice(start, end);
  assert.match(text, /^class/);
  return evaluate(`(${text})`, bindings);
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (typeof value === "string")
    return value.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "UUID",
    );
  if (Object.prototype.toString.call(value) === "[object Error]")
    return { name: value.name, message: value.message };
  if (typeof value === "function") return "[function]";
  if (Array.isArray(value)) return Array.from(value, normalize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  return value;
}
function equal(actual: any, expected: any): void {
  assert.deepEqual(normalize(actual), normalize(expected));
  comparisons++;
}
async function outcome(operation: () => unknown) {
  try {
    return { result: await operation() };
  } catch (error) {
    return { error };
  }
}
const log = { error() {}, warn() {}, debug() {} };
const Message = original(13045260, 13049605, {
  eu: COMMAND_MESSAGE_TYPES,
  ed: { CommandXmlTags: COMMAND_XML_TAGS },
  ep: {
    InputItemUtils: {
      createUserMessage: (text: string) => ({
        id: "00000000-0000-0000-0000-000000000000",
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
        providerData: { skipRun: true },
      }),
    },
  },
});
Message.regexCache = new Map();
const caveatLiteral = source.slice(13049605, 13051000).match(/CommandMessageUtils\.LOCAL_COMMAND_TIP=('(?:\\.|[^'\\])*')/)?.[1];
assert.ok(caveatLiteral, "native caveat literal is present");
Message.LOCAL_COMMAND_TIP = evaluate(caveatLiteral);
equal(LOCAL_COMMAND_TIP, Message.LOCAL_COMMAND_TIP);
for (const args of [
  undefined,
  [],
  ["one", "two"],
  [0, false, null, { a: 1 }, "x<y"],
  ["line\nnext"],
])
  for (const message of [undefined, "", "progress"])
    for (const timestamp of [undefined, 0, 17])
      equal(
        CommandMessageUtils.buildInput(
          { name: "/cmd", args, timestamp },
          { message },
        ),
        Message.buildInput({ name: "/cmd", args, timestamp }, { message }),
      );
for (const method of [
  "buildCaveat",
  "buildEmpty",
  "buildOutput",
  "buildBashInput",
  "buildBashOutput",
  "buildPlanOutput",
  "buildMemory",
] as const)
  for (const value of [
    undefined,
    "",
    "<&>\ntext",
    { fact: "fact", scope: "user" },
  ])
    equal(
      await outcome(() =>
        (CommandMessageUtils[method] as Function)(value, "second"),
      ),
      await outcome(() => Message[method](value, "second")),
    );
const texts = [
  "",
  "raw",
  "<agent-notification><summary> summary\nline </summary></agent-notification>",
  "<summary>x</summary><status> </status>",
  "<system-reminder>hidden</system-reminder>",
  "<system-reminder><user_query>x</user_query></system-reminder>",
  "<command_name> /clear </command_name>",
  LOCAL_COMMAND_TIP,
  ...Object.values(COMMAND_XML_TAGS).flatMap((tag) =>
    ["", "a\nb", "<nested>text</nested>"].map(
      (text) => `<${tag}>${text}</${tag}>`,
    ),
  ),
  "<bash-stdout>out</bash-stdout><bash-stderr>error</bash-stderr>",
];
for (const text of texts)
  for (const method of [
    "parseInput",
    "parseOutput",
    "parsePlanOutput",
    "isSystemInternalMessage",
    "parseAgentNotification",
    "isAgentNotification",
  ] as const)
    equal(CommandMessageUtils[method](text), Message[method](text));
const NativeElapsed = evaluate(
  `(${source.slice(7663499, source.indexOf("workflows_command_executor_decorate", 7663499))})`,
);
for (const ms of [-1, 0, 999.9, 1000, 59999, 60000, 3600000])
  equal(formatElapsed(ms), NativeElapsed(ms));
const Listing = original(7662202, 7663498, {
  nu: "/workflows",
  AB: { CommandMessageUtils: Message },
  formatElapsed: NativeElapsed,
});
const Save = evaluate(
  `(()=>{const t6=${source.slice(7665117, 7667019)};return t6})()`,
  { np: "/save-workflow", AB: { CommandMessageUtils: Message } },
);
const list = new WorkflowsCommandExecutor({} as any, {} as any, {} as any),
  beforeList = new Listing();
for (const records of [
  [],
  [
    {
      name: "name",
      runId: "abcdef012345",
      startedAt: time - 65000,
      endedAt: time,
      status: "completed",
      phaseCount: 2,
      agentCount: 3,
      cachedAgentCount: 1,
    },
  ],
])
  equal(
    list.renderRunningSection(records as any),
    beforeList.renderRunningSection(records),
  );
for (const description of [undefined, "", "description", "<unescaped>"])
  for (const scope of ["project", "user", "builtin"])
    equal(
      list.renderSavedSection([{ name: "name", scope, description } as any]),
      beforeList.renderSavedSection([{ name: "name", scope, description }]),
    );
const save = new SaveWorkflowCommandExecutor({} as any, {} as any),
  beforeSave = new Save();
for (const args of [
  undefined,
  [],
  [null, "", "  "],
  ["run"],
  ["run", "name"],
  ["run", "name", "extra"],
  ["--user", "r", "--project", "n", "--scope=user"],
  ["--scope=bad"],
  ["--unknown"],
  [0, false, true, {}],
])
  equal(save.parseArgs(args), beforeSave.parseArgs(args));
for (const error of [undefined, "", "bad"])
  equal(SaveWorkflowCommandExecutor.usage(error), Save.usage(error));
for (const fail of [false, true]) {
  async function run(native: boolean) {
    const calls: any[] = [],
      sessions = {
        addHistory: async (_session: any, items: any[]) => {
          calls.push(items);
        },
      },
      manager = {
        saveAs: async (...args: any[]) => {
          calls.push(args);
          if (fail) throw new Error("save failed");
          return { targetPath: "/saved/name.js" };
        },
      };
    const executor = native
      ? Object.assign(new Save(), {
          manager,
          sessionManager: sessions,
          logger: log,
        })
      : new SaveWorkflowCommandExecutor(manager as any, sessions, log);
    await executor.execute({
      name: "/save-workflow",
      session: { id: "session" },
      args: ["full-run", "name", "--user"],
    });
    return calls;
  }
  equal(await run(false), await run(true));
}
const Acp = original(8893656, 8895753),
  Print = original(8897019, 8898409, { dO: { write() {} } });
const acp = new WorkflowAcpBridge(undefined, {} as any, () => ({}) as any),
  print = new WorkflowPrintModeHandler(),
  beforeAcp = new Acp(),
  beforePrint = new Print();
const events: any[] = [{ kind: "other" }];
for (const kind of ["workflow_run_started", "workflow_run_finished"])
  for (const error of [undefined, "", "failed"])
    events.push({
      kind,
      record: {
        runId: "run",
        name: "name",
        status: "running",
        agentCount: 3,
        cachedAgentCount: 1,
        phaseCount: 2,
        error,
        output: "private output",
      },
    });
for (const kind of ["workflow_phase_started", "workflow_phase_finished"])
  events.push({ kind, runId: "run", phase: "phase" });
for (const kind of [
  "workflow_agent_started",
  "workflow_agent_finished",
  "workflow_agent_cached",
])
  for (const label of [undefined, "", "label"])
    for (const phase of [undefined, "", "phase"])
      for (const error of [undefined, "", "failed"])
        for (const tokens of [undefined, 0, 17])
          for (const cached of [false, true])
            events.push({
              kind,
              runId: "run",
              agent: {
                key: "key",
                label,
                phase,
                error,
                tokens,
                cached,
                text: "private output",
              },
            });
for (const event of events) {
  equal(acp.toMeta(event), beforeAcp.toMeta(event));
  equal(print.toJsonRecord(event), beforePrint.toJsonRecord(event));
}
let presentationSnapshot: any;
for (const native of [false, true]) {
  const lines: string[] = [],
    warnings: string[] = [];
  const emitter: any = {
    listener: undefined,
    on(listener: any) {
      this.listener = listener;
      return () => {
        this.listener = undefined;
      };
    },
  };
  const handler = native
    ? Object.assign(new Print(), {
        emitter,
        logger: { warn: (line: string) => warnings.push(line) },
      })
    : new WorkflowPrintModeHandler(emitter, {
        warn: (line) => warnings.push(line),
      });
  handler.setWriter({ write: (text: string) => lines.push(text) });
  handler.install();
  handler.install();
  emitter.listener(events[0]);
  handler.setWriter({
    write() {
      throw new Error("writer broke");
    },
  });
  emitter.listener(events[0]);
  handler.dispose();
  handler.dispose();
  const snapshot = { lines, warnings, subscribed: !!emitter.listener };
  if (native) equal(snapshot, presentationSnapshot);
  else presentationSnapshot = snapshot;
}
for (const current of ["none", "throws", "empty", "current"])
  for (const connection of [
    "di-throws",
    "missing-agent",
    "missing-connection",
    "missing-method",
    "success",
    "reject",
  ]) {
    async function run(native: boolean) {
      const calls: any[] = [],
        warnings: string[] = [],
        sessions = {
          getCurrent() {
            if (current === "throws") throw new Error("no context");
            if (current === "none") return;
            return {
              id: "current-session",
              meta: {
                acpConnectionId: current === "empty" ? "" : "connection",
              },
            };
          },
        },
        emitter: any = {
          listener: undefined,
          on(listener: any) {
            calls.push("subscribe");
            this.listener = listener;
            return () => {
              calls.push("unsubscribe");
              this.listener = undefined;
            };
          },
        },
        manager = {
          get(id: string) {
            calls.push(["get", id]);
            if (connection === "missing-agent") return;
            return {
              getConnection() {
                if (connection === "missing-connection") return;
                if (connection === "missing-method") return {};
                return {
                  async sessionUpdate(value: any) {
                    calls.push(value);
                    if (connection === "reject") throw new Error("send failed");
                  },
                };
              },
            };
          },
        },
        getManager = () => {
          if (connection === "di-throws") throw new Error("missing DI");
          return manager;
        },
        logger = { warn: (text: string) => warnings.push(text) };
      const Original = original(8893656, 8895753, {
          r6: { ContainerUtil: { get: getManager } },
          r8: { AcpAgentManager: "ACP" },
        }),
        bridge = native
          ? Object.assign(new Original(), {
              emitter,
              sessionManager: sessions,
              logger,
            })
          : new WorkflowAcpBridge(
              emitter,
              sessions as any,
              getManager as any,
              logger,
            );
      bridge.install();
      bridge.install();
      emitter.listener({
        kind: "workflow_phase_started",
        runId: "different-owner",
        phase: "phase",
      });
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      bridge.dispose();
      bridge.dispose();
      return { calls, warnings, subscribed: !!emitter.listener };
    }
    equal(await run(false), await run(true));
  }
const NativeCommands = original(7088984, 7093909, {
  A_: {
    AgentRunInterceptorPriority: { AgentSwitch: 1600 },
    AgentNames: { COMPACT: "compact" },
    AGENT_TAG_SUFFIX: "-agent",
  },
  Ak: {
    CUSTOM_COMMAND_TAG: "custom",
    WORKFLOW_COMMAND_TAG: "dynamic-workflow",
    MCP_PROMPT_COMMAND_TAG: "mcp-prompt",
  },
});
for (const prompt of [undefined, "", "template"])
  for (const tag of [undefined, "custom", "mcp-prompt", "dynamic-workflow"])
    for (const input of [
      "/name",
      "/name args",
      '/name a "quote"\nline',
      " /name args ",
      "<channel source='x'> /name arg </channel>",
      "/name\targ",
      "/names",
      "plain",
    ]) {
      async function run(native: boolean) {
        const calls: any[] = [],
          command = {
            name: "/name",
            prompt,
            tags: tag ? [tag, "compact-agent"] : [],
            model: "alias",
            allowedTools: ["Read"],
          },
          agentManager: any = {
            getCommands: async () => [command],
            get: async (name: string) => {
              calls.push(["agent", name]);
              return { name };
            },
            resolveConfiguredModelOrFallback: async (...args: any[]) => {
              calls.push(args);
              return "resolved";
            },
          },
          renderer = {
            render: async (value: any, variables?: any) => {
              calls.push(["prompt", value, variables]);
              return `render:${value}`;
            },
          },
          custom: any = {
            render: async (value: any, text: string) => {
              calls.push(["custom", value, text]);
              return "custom rendered";
            },
            processContent: async () => "skill rendered",
          },
          mcp = {
            render: async (...args: any[]) => {
              calls.push(["mcp", ...args]);
              return "mcp rendered";
            },
          },
          configuration = async () => ({
            skills: [
              { name: "name", instructions: "skill", source: "project" },
            ],
          });
        const interceptor = native
          ? Object.assign(new NativeCommands(), {
              agentManager,
              promptRenderer: renderer,
              customCommandRenderer: custom,
              mcpPromptRenderer: mcp,
              productManager: { waitConfiguration: configuration },
              logger: log,
            })
          : new CommandAgentRunInterceptor(
              agentManager,
              configuration,
              custom,
              renderer,
              mcp,
              log,
            );
        const context: any = {
          input: [{ type: "message", role: "user", content: input }],
          agent: { name: "main" },
          session: {
            id: "session",
            requestOptions: { allowedTools: ["Bash"] },
          },
          skipRun: true,
        };
        await interceptor.intercept(context);
        return { context, calls };
      }
      equal(await run(false), await run(true));
    }
for (const name of [
  "/skill",
  "skill",
  "<channel> /skill raw </channel>",
  "/nope",
])
  for (const sourceOrder of [
    ["user", "project", "project"],
    ["builtin", "user"],
    ["builtin", "other"],
  ]) {
    async function run(native: boolean) {
      const calls: any[] = [],
        skills = sourceOrder.map((source, i) => ({
          name: "skill",
          source,
          instructions: `pick:${i} \${CODEBUDDY_SESSION_ID} \${CLAUDE_SESSION_ID}`,
          model: "model",
        })),
        configuration = async () => ({ skills }),
        manager: any = {
          resolveConfiguredModelOrFallback: async (...args: any[]) => {
            calls.push(args);
            return "resolved";
          },
        },
        renderer: any = {
          processContent: async (...args: any[]) => {
            calls.push(args);
            return args[0];
          },
        },
        interceptor = native
          ? Object.assign(new NativeCommands(), {
              agentManager: manager,
              customCommandRenderer: renderer,
              productManager: { waitConfiguration: configuration },
              logger: log,
            })
          : new CommandAgentRunInterceptor(
              manager,
              configuration,
              renderer,
              {} as any,
              {} as any,
              log,
            ),
        context: any = {
          input: [{ type: "message", role: "user", content: name }],
          session: { id: "session", requestOptions: {} },
        };
      return {
        handled: await interceptor.handleSkillSlashCommand(context),
        context,
        calls,
      };
    }
    equal(await run(false), await run(true));
  }
const methodStart = source.indexOf("async getCommands(eA){", 7043200),
  methodEnd = source.indexOf("findModelByIdOrName(", methodStart),
  GetCommands = evaluate(`(class {${source.slice(methodStart, methodEnd)}})`);
for (const name of ["main", "other", "missing"]) {
  const commands = {
      get: async (id: string) => (id === "/known" ? { name: id } : undefined),
      getCustomCommands: async () => [{ name: "/custom" }],
      getMcpCommands: async () => [{ name: "/mcp" }],
    },
    config = new Map([
      ["main", { commands: ["known", "missing"] }],
      ["other", { commands: ["known"] }],
    ]),
    native = Object.assign(new GetCommands(), {
      commandManager: commands,
      agentConfigMap: config,
      defaultAgentName: "main",
    }),
    restored: any = Object.create(AgentManager.prototype);
  Object.assign(restored, {
    commandManager: commands,
    agentConfigMap: config,
    defaultAgentName: "main",
  });
  equal(await restored.getCommands(name), await native.getCommands(name));
}
console.log(
  `Workflow presentation differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`,
);
