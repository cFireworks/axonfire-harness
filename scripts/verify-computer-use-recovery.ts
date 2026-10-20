import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createComputerUseRuntime } from "../src/computer-use/computer-use-runtime.js";
import { createComputerUseExecutor } from "../src/computer-use/computer-use-executor.js";
import { ComputerUseTool } from "../src/computer-use/computer-use-tool.js";
import {
  computerUseParameters,
  requireCoordinate,
  validateNonCoordFields,
} from "../src/computer-use/computer-use-schema.js";
import { FunctionCallResultAgentInputItemProcessor } from "../src/sessions/function-call-result-processor.js";
import { isCustomHistoryItem } from "../src/sessions/history-utils.js";
import { ToolResult } from "../src/tools/tool-result.js";
import { ToolMessageModelRequestProcessor } from "../src/models/tool-message-request-processor.js";
import { NativeImageMime } from "../src/models/image-mime.js";
const filename = process.argv[2];
if (!filename) throw Error("Pass captured bundle path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
function evaluate(code: string, bindings: any = {}): any {
  return runInNewContext(
    `Object.setPrototypeOf(TypeError.prototype,Error.prototype);${code}`,
    { Error, Buffer, Map, Set, Promise, ...bindings },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (Object.prototype.toString.call(value) === "[object Error]")
    return {
      name: value.name,
      message:
        value.name === "TypeError" ? "[engine TypeError]" : value.message,
    };
  if (typeof value === "number" && !Number.isFinite(value))
    return String(value);
  if (Array.isArray(value)) return Array.from(value, normalize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  return value;
}
function equal(actual: any, expected: any) {
  assert.deepEqual(normalize(actual), normalize(expected));
  comparisons++;
}
async function outcome(fn: () => any) {
  try {
    return { result: await fn() };
  } catch (error) {
    return { error };
  }
}
function clone<T>(value: T): T {
  return structuredClone(value);
}
const helperStart = source.indexOf("function isDarwin(){", 12137000),
  helperEnd = source.indexOf("var computer_use_tool_decorate", helperStart);
const schemaStart = source.indexOf("let u2=", 12147600),
  schemaEnd = source.indexOf("let u4=class", schemaStart);
const nativeSchema = evaluate(
  `(()=>{${source.slice(schemaStart, schemaEnd)}return {parameters:u3,requireCoordinate,validateNonCoordFields}})()`,
  { iJ: { z } },
);
const converterStart = source.indexOf(
    'let i2=Symbol("Let zodToJsonSchema',
    11618000,
  ),
  converterEnd = source.indexOf(";var om=ec(22618)", converterStart);
const convert = evaluate(
  `(()=>{${source.slice(converterStart, converterEnd + 1)}return zodToJsonSchema})()`,
  { iJ: z },
);
equal(
  zodToJsonSchema(computerUseParameters as any),
  convert(nativeSchema.parameters),
);
for (const input of [
  {},
  { action: "screenshot", display: 2 },
  { action: "left_click" },
  { action: "left_click", coordinate: [1.1, -2] },
  { action: "left_click", coordinate: [NaN, 2] },
  { action: "type", text: "" },
  { action: "hold_key", text: "a", duration: -1 },
  { action: "scroll", scroll_direction: "south" },
  { action: "wait", duration: "2" },
  { action: "unknown" },
]) {
  const a = computerUseParameters.safeParse(input),
    b = nativeSchema.parameters.safeParse(input);
  equal(a.success ? a.data : "invalid", b.success ? b.data : "invalid");
}
for (const input of [
  {},
  { action: "type" },
  { action: "type", text: "" },
  { action: "key", text: "" },
  { action: "key", text: " " },
  { action: "key", text: 2 },
  { action: "hold_key", text: "a" },
  { action: "hold_key", text: "enter", duration: NaN },
  { action: "wait", duration: -2 },
  { action: "scroll", scroll_direction: "invalid" },
])
  equal(
    await outcome(() => validateNonCoordFields(input)),
    await outcome(() => nativeSchema.validateNonCoordFields(input)),
  );
for (const coordinate of [
  undefined,
  null,
  [],
  [1],
  [1, 2, 3],
  ["1", 2],
  [NaN, Infinity],
  [0.1, -2],
])
  equal(
    await outcome(() =>
      requireCoordinate({ action: "left_click", coordinate }, "coordinate"),
    ),
    await outcome(() =>
      nativeSchema.requireCoordinate(
        { action: "left_click", coordinate },
        "coordinate",
      ),
    ),
  );
const methods = [
  "isDarwin",
  "detectCliclick",
  "getComputerUseDir",
  "rescaleToLogical",
  "probeImageSize",
  "probeLogicalScreenSize",
  "takeScreenshot",
  "escapeAppleScriptString",
  "runAppleScript",
  "mouseAction",
  "leftClickDrag",
  "typeText",
  "buildKeyScript",
  "pressKey",
  "holdKey",
  "scrollAt",
  "getCursorPosition",
];
// Every command, file read, directory creation and timer below is fake. Never run the native desktop.
function fixture(native: boolean, options: any = {}) {
  const events: any[] = [];
  let probes = 0;
  const env = {
    CODEBUDDY_COMPUTER_USE_ENABLED: "1",
    CODEBUDDY_COMPUTER_USE_DEBUG: "0",
    ...options.env,
  };
  const runtime = createComputerUseRuntime({
    platform: options.platform ?? "darwin",
    env,
    getHomeDir: () => "/fixture-home",
    now: () => 12345,
    execFile: async (file, args, config) => {
      events.push({ file, args, config });
      if (options.failFile === file)
        throw Error(options.error ?? "fixture failure");
      if (file === "/usr/bin/which") {
        if (options.noCliclick) throw Error("not found");
        return { stdout: "/fixture/cliclick\n" };
      }
      if (file === "/usr/bin/sips" && args[0] === "-g")
        return {
          stdout: options.badDimensions
            ? "invalid"
            : ++probes === 1
              ? "pixelWidth: 3840\npixelHeight: 2160"
              : "pixelWidth: 1280\npixelHeight: 720",
        };
      if (file === "/usr/bin/sips" && options.compressFail)
        throw Error("compression failed");
      if (file === "/usr/bin/osascript") {
        if (options.osError) throw Error(options.osError);
        return {
          stdout: args[1]?.includes("Finder")
            ? "0, 0, 1920, 1080"
            : (options.cursor ?? "12,34"),
        };
      }
      if (file === "/fixture/cliclick" && args[0] === "p")
        return { stdout: options.cursor ?? "12,34" };
      return { stdout: "" };
    },
    mkdir: (async (...args: any[]) => {
      events.push({ mkdir: args });
      if (options.mkdirFail) throw Error("mkdir failed");
    }) as any,
    readFile: (async (...args: any[]) => {
      events.push({ readFile: args });
      if (options.readFail) throw Error("read failed");
      return Buffer.from("fixture bytes, not a real screenshot");
    }) as any,
    setTimeout: ((callback: () => void, delay: number) => {
      events.push({ delay });
      queueMicrotask(callback);
      return 1;
    }) as any,
    clearTimeout: ((id: any) => {
      events.push({ clearTimeout: id });
    }) as any,
    debug: (...args) => events.push({ debug: args }),
    logger: { warn: (...args) => events.push({ warn: args }) },
  });
  const bindings = {
    process: { platform: runtime.platform, env },
    uG: runtime.execFile,
    uH: {
      platformChecked: false,
      isDarwin: false,
      cliclickChecked: false,
      cliclickPath: null,
    },
    uj: { promisify: () => runtime.execFile },
    af: {
      execFile() {
        throw Error("unreachable native command");
      },
    },
    n5: { PathUtils: { getHomeDir: runtime.getHomeDir } },
    ok: { mkdir: runtime.mkdir, readFile: runtime.readFile },
    Date: { now: runtime.now },
    setTimeout: runtime.setTimeout,
    clearTimeout: runtime.clearTimeout,
    console: { error: runtime.debug },
  };
  const executor = native
    ? evaluate(
        `(()=>{${source.slice(helperStart, helperEnd)}return {${methods.join(",")},wait:computer_use_executor_wait,getState:()=>({cache:{...uH},scale:{...uX}})}})()`,
        bindings,
      )
    : createComputerUseExecutor(runtime);
  const Tool = native
    ? evaluate(`(${source.slice(12149394, 12152228)})`, {
        ...bindings,
        ...executor,
        computer_use_executor_wait: executor.wait,
        u3: nativeSchema.parameters,
        ...nativeSchema,
        nC: { ToolNames: { COMPUTER_USE: "ComputerUse" } },
        iq: {
          ENV_KEY_CODEBUDDY_COMPUTER_USE_ENABLED:
            "CODEBUDDY_COMPUTER_USE_ENABLED",
        },
        iz: { BaseTool: class {} },
      })
    : ComputerUseTool;
  const tool = native
    ? Object.assign(new Tool(), { logger: runtime.logger })
    : new ComputerUseTool(executor, runtime);
  return { executor, tool, events, runtime };
}
async function compareSequence(options: any, actions: Array<[string, any[]]>) {
  const a = fixture(false, options),
    b = fixture(true, options);
  for (const [method, args] of actions) {
    equal(
      await outcome(() => (a.executor as any)[method](...args)),
      await outcome(() => b.executor[method](...args)),
    );
    equal(a.events, b.events);
    equal(a.executor.getState(), b.executor.getState());
  }
}
for (const options of [
  {},
  { noCliclick: true },
  { platform: "linux" },
  { compressFail: true },
  { badDimensions: true },
  { osError: "screen recording" },
  { mkdirFail: true },
])
  await compareSequence(options, [
    ["isDarwin", []],
    ["detectCliclick", []],
    ["detectCliclick", []],
    ["takeScreenshot", [2]],
    ["rescaleToLogical", [12.4, -1.5]],
    ...[
      "left_click",
      "right_click",
      "middle_click",
      "double_click",
      "triple_click",
      "mouse_move",
      "unknown",
    ].map((action) => ["mouseAction", [action, 12.4, 25.8]] as [string, any[]]),
    ["leftClickDrag", [0.1, -2, 100.1, 200.9]],
    ["getCursorPosition", []],
  ]);
for (const display of [undefined, "2", NaN, Infinity, -1, 0, 1.5])
  await compareSequence({}, [["takeScreenshot", [display]]]);
for (const text of ["", "a", 'a"\\b', "a\r\nb\rc\n\n", "😀\t", "\n"])
  await compareSequence({}, [["typeText", [text]]]);
for (const key of [
  "a",
  "A",
  " CMD + shift + A ",
  "ctrl+control+F12",
  "option+fn+return",
  "escape",
  "space",
  "backspace",
  "pageup",
  "left",
  "f1",
  "f12",
  "home",
  "end",
  "+",
  "unknown",
  "😀",
  "ctrl++",
])
  await compareSequence({}, [
    ["buildKeyScript", [key]],
    ["pressKey", [key]],
    ["holdKey", [key, 1]],
  ]);
for (const duration of [-2, 0, 0.1, 30, 60, 99, NaN, Infinity])
  await compareSequence({}, [
    ["holdKey", ["enter", duration]],
    ["wait", [duration]],
  ]);
for (const direction of ["up", "down", "left", "right", "unknown"])
  for (const amount of [0, -1, 1.5, 3, NaN])
    await compareSequence({}, [["scrollAt", [10.4, 20.8, direction, amount]]]);
for (const error of [
  "not allowed to send keystrokes",
  "assistive access",
  "不允许发送按键",
  "辅助访问",
  "screen recording",
  "屏幕录制",
  "a\nb\nc\nd",
])
  await compareSequence({ osError: error }, [
    ["runAppleScript", ["fixture script"]],
  ]);
for (const error of [
  "ModuleNotFoundError: No module named 'Quartz'",
  "a\nb\nc\nd",
])
  await compareSequence({ failFile: "/usr/bin/python3", error }, [
    ["scrollAt", [1, 2, "down", 3]],
  ]);
for (const cursor of ["invalid", "1,NaN", "-1, 2", "3.5, 4.2"])
  for (const noCliclick of [true, false])
    await compareSequence({ cursor, noCliclick }, [["getCursorPosition", []]]);
for (const options of [{}, { readFail: true }, { noCliclick: true }]) {
  const a = fixture(false, options),
    b = fixture(true, options);
  equal(a.tool.name, b.tool.name);
  equal(a.tool.description, b.tool.description);
  for (const env of [undefined, "0", "false", "true", "1", "TRUE"]) {
    a.runtime.env.CODEBUDDY_COMPUTER_USE_ENABLED = env;
    b.runtime.env.CODEBUDDY_COMPUTER_USE_ENABLED = env;
    equal(await a.tool.isEnabled({}), await b.tool.isEnabled({}));
    equal(a.tool.shouldShowInToolSearch(), b.tool.shouldShowInToolSearch());
  }
  for (const input of [
    { action: "screenshot", display: 2 },
    { action: "left_click", coordinate: [1.5, 2] },
    { action: "left_click" },
    { action: "left_click_drag", start_coordinate: [1, 2], coordinate: [3, 4] },
    { action: "type", text: "fixture" },
    { action: "key", text: "cmd+a" },
    { action: "hold_key", text: "enter", duration: 0 },
    { action: "scroll", coordinate: [1, 2], scroll_direction: "down" },
    { action: "wait", duration: 0 },
    { action: "cursor_position" },
    { action: "unknown" },
    null,
  ]) {
    const aa = await a.tool.execute(input, {}),
      bb = await b.tool.execute(input, {});
    // V8's field-access TypeError names differ after renaming the caught variable.
    if (
      (aa.error?.includes("undefined") && bb.error?.includes("undefined")) ||
      (aa.error?.includes("null") && bb.error?.includes("null"))
    )
      equal(!!aa.error, !!bb.error);
    else equal(aa, bb);
    equal(a.events, b.events);
  }
}
const toolResultStart = source.indexOf(
    'eA.is=function(eA){return"object"==typeof eA&&"content"in eA}',
    12192000,
  ),
  toolResultEnd = source.indexOf("}(eu||(eu={}))", toolResultStart);
const nativeToolResult = evaluate(
  `(()=>{const eA={};${source.slice(toolResultStart, toolResultEnd)};return eA})()`,
);
for (const value of [
  null,
  undefined,
  "x",
  0,
  {},
  { content: null },
  { content: "x" },
  [],
]) {
  equal(
    await outcome(() => ToolResult.is(value)),
    await outcome(() => nativeToolResult.is(value)),
  );
  equal(ToolResult.from(value), nativeToolResult.from(value));
}
const Result = evaluate(`(${source.slice(11041906, 11044215)})`, {
  t3: { AgentInputItemProcessorPriority: { FunctionCallResult: 7 } },
  AB: { InputItemUtils: { isCustomInputItem: isCustomHistoryItem } },
  Aw: { ToolResult: nativeToolResult },
});
const resultA = new FunctionCallResultAgentInputItemProcessor(),
  resultB = new Result();
equal(resultA.priority, resultB.priority);
for (const name of ["ComputerUse", "DelegateTool", "mcp__fixture__tool"])
  for (const output of [
    null,
    undefined,
    { type: "text", text: "not JSON" },
    { type: "text", text: "null" },
    {
      type: "text",
      text: JSON.stringify({
        content: [
          {
            type: "image_url",
            image_url: { url: "data:image/jpeg;base64,Zg==" },
          },
        ],
        title: "Screenshot",
      }),
    },
    {
      type: "text",
      text: JSON.stringify({
        content: [
          { type: "text", text: " " },
          { type: "text", text: "x" },
        ],
      }),
    },
    { type: "text", text: JSON.stringify({ type: "text", text: "plain" }) },
    { type: "input_image", image: "Zg==", detail: "low" },
    [
      { type: "input_text", text: " " },
      { type: "input_file", file: "fixture", filename: "x" },
    ],
    [],
  ]) {
    const a: any = {
        type: "function_call_result",
        name,
        output: clone(output),
      },
      b = clone(a);
    equal(
      await outcome(() => resultA.process(a, {})),
      await outcome(() => resultB.process(b, {})),
    );
    equal(a, b);
    equal(
      await outcome(() => resultA.process(a, {})),
      await outcome(() => resultB.process(b, {})),
    );
    equal(a, b);
  }
for (const item of [
  { type: "message", role: "user", content: "x" },
  { type: "function_call_result", output: { type: "text", text: "x" } },
  {
    type: "function_call_result",
    name: "x",
    providerData: { toolResult: { content: "existing" } },
    output: { type: "text", text: '{"content":"new"}' },
  },
]) {
  const a = clone(item),
    b = clone(item);
  equal(
    await outcome(() => resultA.process(a, {})),
    await outcome(() => resultB.process(b, {})),
  );
  equal(a, b);
}
const mimeStart = source.indexOf("static detectMimeFromMagicBytes(", 13200000),
  mimeEnd = source.indexOf("static getImageMimeType(", mimeStart),
  Mime = evaluate(`(class {${source.slice(mimeStart, mimeEnd)}})`);
for (const bytes of [
  [],
  [137, 80, 78, 71, 13, 10, 26, 10],
  [255, 216, 255],
  [71, 73, 70, 56],
  [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80],
  [66, 77],
  [73, 73, 42, 0],
  [77, 77, 0, 42],
  [1, 2, 3],
]) {
  equal(
    NativeImageMime.detectMimeFromMagicBytes(Buffer.from(bytes)),
    Mime.detectMimeFromMagicBytes(Buffer.from(bytes)),
  );
  equal(
    NativeImageMime.detectMimeFromBase64(Buffer.from(bytes).toString("base64")),
    Mime.detectMimeFromBase64(Buffer.from(bytes).toString("base64")),
  );
}
for (const value of [
  null,
  1,
  "",
  "?",
  "data:image/custom;base64,abc",
  "data:image/jpeg,abc",
])
  equal(
    NativeImageMime.detectMimeFromBase64(value),
    Mime.detectMimeFromBase64(value),
  );
const Request = evaluate(`(${source.slice(8559013, 8561670)})`, {
  sD: { ImageUtils: Mime },
});
for (const asString of [true, false])
  for (const contents of [
    "[]",
    '[{"type":"image","image":"/9j/"}]',
    '[{"type":"image","data":"x","mediaType":"image/gif"}]',
    '[{"type":"image","image":"data:image/custom;base64,AA=="}]',
    '[{"type":"image_url","image_url":{"url":"x"}},{"type":"image_blob_ref","blob_id":"missing"}]',
    '[{"type":"image_blob_ref","blob_id":"known"}]',
    '[{"type":"image_blob_ref","blob_id":"missing"}]',
    '[{"type":"image_blob_ref","blob_id":"error"}]',
    '[{"type":"text","text":"x"}]',
    "[invalid",
    [{ type: "image", image: "already-array" }],
  ]) {
    const logA: any[] = [],
      logB: any[] = [],
      logger = (events: any[]) =>
        Object.fromEntries(
          ["setContext", "debug", "warn"].map((key) => [
            key,
            (...args: any[]) => events.push([key, ...args]),
          ]),
        ),
      blob = (events: any[]) => ({
        rehydrate: async (ref: any) => {
          events.push(["rehydrate", ref]);
          if (ref.blob_id === "error") throw Error("blob fixture error");
          return ref.blob_id === "known" ? "data:image/jpeg;base64,Zg==" : null;
        },
        createPlaceholder: (ref: any) => `[missing:${ref.blob_id}]`,
      });
    const a = new ToolMessageModelRequestProcessor(logger(logA), blob(logA)),
      b = Object.assign(new Request(), {
        logger: logger(logB),
        imageBlobService: blob(logB),
      });
    a.init();
    b.init();
    const body = {
      messages: [
        { role: "user", content: "" },
        {
          role: "assistant",
          content: "",
          tool_calls: [
            { id: "bad", type: "function", function: { arguments: "invalid" } },
            { id: "good", type: "function", function: { arguments: "{}" } },
          ],
        },
        { role: "tool", tool_call_id: "bad", content: "discard" },
        {
          role: "tool",
          tool_call_id: "good",
          content: contents,
          toolResult: { content: "private" },
        },
        { role: "assistant", content: "trailing" },
      ],
    };
    const ca: any = { data: asString ? JSON.stringify(body) : clone(body) },
      cb = clone(ca);
    await a.process(ca);
    await b.process(cb);
    equal(ca, cb);
    equal(logA, logB);
  }
for (const data of [
  undefined,
  "invalid",
  {},
  { messages: null },
  { messages: [{ role: "assistant", content: null }] },
]) {
  const a: any = { data: clone(data) },
    b = clone(a);
  await new ToolMessageModelRequestProcessor().process(a);
  await Object.assign(new Request(), {
    logger: { warn() {}, debug() {} },
  }).process(b);
  equal(a, b);
}
console.log(
  `ComputerUse, result/request processors and MIME: ${comparisons} fixed-hash comparisons passed; all desktop I/O injected, no real capture or command.`,
);
