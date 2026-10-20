import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { z as z3 } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  DelegateToolManagerImpl,
  delegateDescriptionVariables,
} from "../src/delegate/delegate-tool-manager.js";
import { DelegateToolsChangedHandler } from "../src/delegate/delegate-tools-changed-handler.js";
import {
  DelegateToolImpl,
  delegateToolParameters,
  delegateToolJsonSchema,
  DELEGATE_TOOL_DESCRIPTION,
} from "../src/tools/delegate-tool.js";
import { ToolManager } from "../src/tools/tool-manager.js";
import { AgentManager } from "../src/agents/agent-manager.js";
const filename = process.argv[2];
if (!filename) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
const fixedTime = 1790000000000;
class FixedDate extends Date {
  static override now() {
    return fixedTime;
  }
}
function evaluate(code: string, bindings: object = {}): any {
  return runInNewContext(
    `Object.setPrototypeOf(TypeError.prototype, Error.prototype); ${code}`,
    { Error, Date: FixedDate, Map, Set, Promise, ...bindings },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (Object.prototype.toString.call(value) === "[object Error]")
    return { name: value.name, message: value.message };
  if (
    ["[object Map]", "[object Set]"].includes(
      Object.prototype.toString.call(value),
    )
  )
    return [...value].map(normalize);
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
function originalManager(logger: any): any {
  return new (evaluate(`(${source.slice(8375029, 8377400)})`, {
    r6: { Logger: "logger", ContainerUtil: { get: () => logger } },
  }))();
}
const schemaStart = source.indexOf("let cz=", 12067000),
  schemaEnd = source.indexOf(",cW=class", schemaStart),
  schema = evaluate(source.slice(schemaStart + 7, schemaEnd), {
    iJ: { z: z3 },
  });
// Compare against the bundled converter itself, not only a re-created schema
// passed through the same host converter as the recovered implementation.
const converterStart = source.indexOf(
  'let i2=Symbol("Let zodToJsonSchema',
  11618000,
);
const converterEnd = source.indexOf(";var om=ec(22618)", converterStart);
assert.ok(converterStart > 0 && converterEnd > converterStart);
const nativeConverter = evaluate(
  `(()=>{${source.slice(converterStart, converterEnd + 1)}return zodToJsonSchema})()`,
  { iJ: z3 },
);
equal(delegateToolJsonSchema, nativeConverter(schema));
equal(delegateToolJsonSchema, zodToJsonSchema(schema));
for (const input of [
  {},
  { toolId: "tool", input: {} },
  { toolId: "", input: { any: 1 } },
  { toolId: "tool", input: [], timeout: 0 },
  { toolId: "tool", input: null },
  { toolId: "tool", input: {}, timeout: -1 },
  { toolId: "tool", input: {}, timeout: "30" },
  { toolId: "tool", input: {}, extra: true },
])
  equal(
    delegateToolParameters.safeParse(input).success,
    schema.safeParse(input).success,
  );
function originalTool(getManager: () => any, logger: any = {}): any {
  return new (evaluate(`(${source.slice(12067549, 12068556)})`, {
    iz: { BaseTool: class {} },
    cz: schema,
    nC: {
      ToolNames: { DELEGATE_TOOL: "DelegateTool" },
      ToolResult: { from: (value: any) => ({ content: value }) },
    },
    nk: {
      Logger: "logger",
      ContainerUtil: {
        get: (id: string) => (id === "logger" ? logger : getManager()),
      },
    },
    om: { DelegateToolManager: "manager" },
  }))();
}
equal(DELEGATE_TOOL_DESCRIPTION, originalTool(() => undefined).description);
for (const content of ["plain", { nested: true }]) {
  function probe(native: boolean) {
    let reads = 0;
    const result = (
      native
        ? originalTool(() => undefined)
        : new DelegateToolImpl(() => undefined)
    ).extractRawResponse({
      get content() {
        reads++;
        return content;
      },
    });
    return { result, reads };
  }
  equal(probe(false), probe(true));
}
const savedDate = globalThis.Date;
globalThis.Date = FixedDate as DateConstructor;
try {
  for (const overwritten of [false, true])
    for (const failure of [false, true])
      for (const action of [
        "none",
        "unregister",
        "missing",
        "clear-first",
        "clear-second",
        "clear-empty",
        "clear-all",
      ]) {
        async function run(native: boolean) {
          const logs: any[] = [],
            logger = { error: (...args: any[]) => logs.push(args) },
            manager = native
              ? originalManager(logger)
              : new DelegateToolManagerImpl(logger);
          let changed = 0;
          manager.setOnToolsChanged(async () => {
            changed++;
            if (failure) throw new Error("callback failed");
          });
          await manager.registerTool(
            "same",
            {
              name: "First",
              description: "description",
              inputSchema: {},
              id: "definition-id",
            },
            "first",
          );
          await manager.registerTool(
            overwritten ? "same" : "other",
            { name: "Second", description: "description", inputSchema: {} },
            "second",
          );
          if (action === "unregister") await manager.unregisterTool("same");
          if (action === "missing") await manager.unregisterTool("missing");
          if (action === "clear-first") await manager.clearTools("first");
          if (action === "clear-second") await manager.clearTools("second");
          if (action === "clear-empty") await manager.clearTools("");
          if (action === "clear-all") await manager.clearTools();
          const clone = manager.getTools();
          clone.delete("same");
          return {
            tools: manager.tools,
            providers: manager.providerTools,
            has: manager.hasTools(),
            definitions: manager.getTools(),
            available: manager.getAvailableTools("ignored"),
            changed,
            logs,
          };
        }
        equal(await run(false), await run(true));
      }
  for (const registered of [false, true])
    for (const connection of [false, true])
      for (const timeout of [undefined, 0, -1, 1, 30000])
        for (const response of [
          undefined,
          null,
          {},
          { status: "success", output: "text" },
          { status: "success", output: false },
          { status: "error", error: { message: "failed" } },
          { status: "error", error: "ignored string" },
          { status: "cancelled" },
          "throw",
        ]) {
          async function run(native: boolean) {
            const events: any[] = [],
              logger = { info: (...args: any[]) => events.push(args) },
              manager = native
                ? originalManager(logger)
                : new DelegateToolManagerImpl(logger);
            if (registered)
              await manager.registerTool(
                "tool",
                { name: "Tool", description: "description", inputSchema: {} },
                "provider",
              );
            if (connection)
              manager.setConnection({
                extMethod: async (...args: any[]) => {
                  events.push(args);
                  if (response === "throw") throw new Error("transport failed");
                  return response;
                },
              });
            const result = await manager.executeTool(
              "tool",
              { raw: "input" },
              timeout,
            );
            manager.clearConnection();
            return { result, events, connection: manager.connection };
          }
          equal(await run(false), await run(true));
        }
  for (const context of [
    undefined,
    null,
    false,
    {},
    { context: { id: "ignored" } },
  ])
    for (const response of [
      { status: "success", output: "text" },
      { status: "success", output: "" },
      { status: "success", output: false },
      { status: "error", error: "failed" },
      { output: 0 },
      "missing",
      "getter-error",
      "execute-error",
    ]) {
      async function run(native: boolean) {
        const calls: any[] = [],
          getter = () => {
            if (response === "getter-error") throw new Error("missing DI");
            if (response === "missing") return;
            return {
              executeTool: async (...args: any[]) => {
                calls.push(args);
                if (response === "execute-error") throw "thrown string";
                return response;
              },
            };
          },
          tool = native
            ? originalTool(getter)
            : new DelegateToolImpl(getter as any),
          result = await tool.execute(
            { toolId: "tool", input: { value: 2 }, timeout: 0 },
            context,
          );
        return { result, raw: tool.extractRawResponse(result), calls };
      }
      equal(await run(false), await run(true));
    }
  const changedStart = source.indexOf(
      "async handleDelegateToolsChanged(",
      6905000,
    ),
    Changed = evaluate(`(class {${source.slice(changedStart, 6906164)}})`, {
      eu: { ContainerUtil: { get: () => currentManager } },
      ez: { DelegateToolManager: "manager" },
    });
  let currentManager: any;
  for (const input of [
    null,
    {},
    { changeType: "unknown" },
    { changeType: "added", tools: [] },
    {
      changeType: "added",
      tools: [{ id: "id", name: "name", description: "d" }],
    },
    {
      changeType: "added",
      providerId: "p",
      sessionId: "s",
      tools: [{ id: "id", inputSchema: null, requiresApproval: false }, null],
    },
    { changeType: "removed", tools: ["one", { id: "two" }, null, { id: "" }] },
    { changeType: "removed", tools: [], toolIds: ["ignored"] },
    { changeType: "removed", sessionId: "s", toolIds: ["one", "", 1, null] },
  ]) {
    async function run(native: boolean) {
      const events: any[] = [],
        logger = {
          info: (...args: any[]) => events.push(args),
          error: (...args: any[]) => events.push(args),
        },
        manager = {
          registerTool: async (...args: any[]) =>
            events.push(["register", ...args]),
          unregisterTool: async (...args: any[]) =>
            events.push(["unregister", ...args]),
        };
      currentManager = manager;
      const handler = native
        ? Object.assign(new Changed(), { logger })
        : new DelegateToolsChangedHandler(() => manager as any, logger);
      return {
        result: await outcome(() => handler.handleDelegateToolsChanged(input)),
        events,
      };
    }
    equal(await run(false), await run(true));
  }
  const descriptionStart = source.indexOf(
      "if(eA===nC.ToolNames.DELEGATE_TOOL)try{",
      11665000,
    ),
    descriptionEnd = source.indexOf(
      "let ev=await this.promptRenderer.render",
      descriptionStart,
    ),
    NativeDescription = evaluate(
      `(function(manager,logger){const nk={ContainerUtil:{get:()=>manager}},om={DelegateToolManager:"manager"},nC={ToolNames:{DELEGATE_TOOL:"DelegateTool"}};const eA="DelegateTool",eI={};${source.slice(descriptionStart, descriptionEnd)}return eI})`,
    );
  for (const count of [0, 1, 3])
    for (const circular of [false, true]) {
      const logger = {},
        tools = new Map();
      for (let i = 0; i < count; i++) {
        const inputSchema: any = {
          type: "object",
          properties: { raw: { type: "string" } },
        };
        if (circular) inputSchema.self = inputSchema;
        tools.set(`tool-${i}`, {
          name: "Name",
          description: "unescaped <description>",
          inputSchema,
        });
      }
      const manager = { hasTools: () => count > 0, getTools: () => tools };
      equal(
        delegateDescriptionVariables(manager, logger),
        NativeDescription.call({ logger }, manager, logger),
      );
    }
  const callbackStart = source.indexOf(
      "setupDelegateToolManagerCallback(){",
      11679000,
    ),
    callbackEnd = source.indexOf(
      "invalidatePluginDependentToolCaches(){",
      callbackStart,
    );
  let callbackManager: any, callbackAgents: any;
  const Callback = evaluate(
    `(class {${source.slice(callbackStart, callbackEnd)}})`,
    {
      nk: {
        ContainerUtil: {
          get: (id: string) =>
            id === "manager" ? callbackManager : callbackAgents,
        },
      },
      om: { DelegateToolManager: "manager" },
      i$: { AgentManager: "agents" },
      nC: { ToolNames: { DELEGATE_TOOL: "DelegateTool" } },
    },
  );
  for (const failure of ["none", "one-agent", "get-all"]) {
    async function run(native: boolean) {
      const events: any[] = [],
        logger = {
          debug: (...args: any[]) => events.push(args),
          warn: (...args: any[]) => events.push(args),
        },
        manager = new DelegateToolManagerImpl(),
        agents = {
          getAll: async () => {
            if (failure === "get-all") throw new Error("list failed");
            return [{ name: "one" }, { name: "two" }];
          },
          refreshAgentTools: async (name: string) => {
            events.push(["refresh", name]);
            if (failure === "one-agent" && name === "one")
              throw new Error("refresh failed");
          },
        };
      callbackManager = manager;
      callbackAgents = agents;
      const host = native
        ? Object.assign(new Callback(), {
            logger,
            toolDescriptionCache: new Map(),
          })
        : new ToolManager({} as any, {} as any);
      if (native) host.setupDelegateToolManagerCallback();
      else host.attachDelegateToolManager(manager, agents, logger);
      for (const key of [
        "DelegateTool",
        "DelegateTool:cli",
        "DelegateToolOther",
        "Read",
      ])
        host.toolDescriptionCache.set(key, key);
      await manager.onToolsChanged!();
      return { events, cache: host.toolDescriptionCache };
    }
    equal(await run(false), await run(true));
  }
  const nativeGetAllStart = source.indexOf(
    "async getAll(){return Array.from(this.agentMap.values())}",
    7043000,
  );
  assert.ok(nativeGetAllStart > 0);
  const All = evaluate(
    `(class {${source.slice(nativeGetAllStart, nativeGetAllStart + "async getAll(){return Array.from(this.agentMap.values())}".length)}})`,
  );
  for (const names of [[], ["cli"], ["cli", "Explore"]]) {
    const entries = names.map((name) => [name, { name }] as const),
      before = Object.assign(new All(), { agentMap: new Map(entries) }),
      after = Object.assign(Object.create(AgentManager.prototype), {
        agentMap: new Map(entries),
      });
    equal(await after.getAll({ ignored: true }), await before.getAll());
  }
} finally {
  globalThis.Date = savedDate;
}
console.log(
  `Delegate differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`,
);
