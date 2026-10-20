import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { setTraceProcessors } from "@openai/agents-core";
import {
  createComputerUseRuntime,
  computerUseHomeDir,
  type ComputerUseRuntime,
} from "../src/computer-use/computer-use-runtime.js";
import { createComputerUseExecutor } from "../src/computer-use/computer-use-executor.js";
import { ComputerUseTool } from "../src/computer-use/computer-use-tool.js";
import {
  computerUseParameters,
  requireCoordinate,
  validateNonCoordFields,
} from "../src/computer-use/computer-use-schema.js";
import { ToolResult } from "../src/tools/tool-result.js";
import { FunctionCallResultAgentInputItemProcessor } from "../src/sessions/function-call-result-processor.js";
import { ToolMessageModelRequestProcessor } from "../src/models/tool-message-request-processor.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
const fixtureBytes = Buffer.from(
  "owned screenshot fixture, not a capture of the desktop",
);
function fakeRuntime(
  options: {
    cliclick?: boolean;
    compressionFailure?: boolean;
    logicalFailure?: boolean;
    osError?: string;
  } = {},
) {
  const events: any[] = [];
  let probes = 0;
  const runtime = createComputerUseRuntime({
    platform: "darwin",
    env: { CODEBUDDY_COMPUTER_USE_ENABLED: "1" },
    getHomeDir: () => "/fixture-home",
    now: () => 12345,
    execFile: async (file, args, config) => {
      events.push({ file, args, config });
      if (file === "/usr/bin/which") {
        if (options.cliclick === false) throw Error("not found");
        return { stdout: "/fixture/cliclick\n" };
      }
      if (file === "/usr/bin/sips" && args[0] === "-g")
        return {
          stdout:
            ++probes === 1
              ? "pixelWidth: 3840\npixelHeight: 2160"
              : "pixelWidth: 1280\npixelHeight: 720",
        };
      if (file === "/usr/bin/sips" && options.compressionFailure)
        throw Error("compression failed");
      if (file === "/usr/bin/osascript") {
        if (options.osError) throw Error(options.osError);
        if (args[1]?.includes("Finder")) {
          if (options.logicalFailure) throw Error("no Finder");
          return { stdout: "0, 0, 1920, 1080" };
        }
        return { stdout: "12,34" };
      }
      if (file === "/fixture/cliclick" && args[0] === "p")
        return { stdout: "12,34" };
      return { stdout: "" };
    },
    mkdir: (async (...args: any[]) => {
      events.push({ mkdir: args });
    }) as any,
    readFile: (async (...args: any[]) => {
      events.push({ readFile: args });
      return fixtureBytes;
    }) as any,
    setTimeout: ((callback: () => void, delay: number) => {
      events.push({ delay });
      queueMicrotask(callback);
      return 1;
    }) as any,
    clearTimeout: (() => {}) as any,
    debug: (...args) => events.push({ debug: args }),
    logger: { warn: (...args) => events.push({ warn: args }) },
  });
  return { runtime, executor: createComputerUseExecutor(runtime), events };
}
async function fixture(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-computer-")),
    closers: Array<() => any> = [];
  t.after(async () => {
    try {
      for (const close of closers) await close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  return { root, closeWith: (fn: () => any) => closers.push(fn) };
}
test("ComputerUse schema retains optional action-specific fields, noninteger coordinates and exact enum", () => {
  assert.equal(
    computerUseParameters.safeParse({ action: "left_click" }).success,
    true,
  );
  assert.equal(
    computerUseParameters.safeParse({
      action: "left_click",
      coordinate: [1.5, -2],
    }).success,
    true,
  );
  assert.equal(
    computerUseParameters.safeParse({
      action: "left_click",
      coordinate: ["1", 2],
    }).success,
    false,
  );
  assert.equal(
    computerUseParameters.safeParse({ action: "screenshot", display: 2 })
      .success,
    true,
  );
  assert.equal(
    "display" in
      computerUseParameters.parse({ action: "screenshot", display: 2 }),
    false,
  );
  assert.throws(
    () => requireCoordinate({ action: "left_click" }, "coordinate"),
    /requires "coordinate"/,
  );
  assert.deepEqual(
    requireCoordinate(
      { action: "left_click", coordinate: [NaN, Infinity] },
      "coordinate",
    ),
    [NaN, Infinity],
  );
});
test("gate is Darwin and exact env true/1; low-level execute does not itself enforce gate", async () => {
  const { runtime, executor } = fakeRuntime(),
    tool = new ComputerUseTool(executor, runtime);
  for (const value of [undefined, "", "0", "false", "TRUE"]) {
    if (value === undefined) delete runtime.env.CODEBUDDY_COMPUTER_USE_ENABLED;
    else runtime.env.CODEBUDDY_COMPUTER_USE_ENABLED = value;
    assert.equal(await tool.isEnabled({}), false);
    assert.equal(tool.shouldShowInToolSearch(), false);
  }
  runtime.env.CODEBUDDY_COMPUTER_USE_ENABLED = "true";
  assert.equal(await tool.isEnabled({}), true);
  const linux = createComputerUseRuntime({ ...runtime, platform: "linux" });
  assert.equal(
    new ComputerUseTool(
      createComputerUseExecutor(linux),
      linux,
    ).isComputerUseEnabled(),
    false,
  );
  runtime.env.CODEBUDDY_COMPUTER_USE_ENABLED = "0";
  assert.equal(
    (await tool.execute({ action: "wait", duration: 0 }, undefined)).error,
    undefined,
  );
});
test("native home retains raw config env value while standalone composition uses its state directory", () => {
  assert.equal(
    computerUseHomeDir({ CODEBUDDY_CONFIG_DIR: "  relative  " }),
    "  relative  ",
  );
  assert.ok(
    computerUseHomeDir({ CODEBUDDY_CONFIG_DIR: "  " }).endsWith("/.codebuddy"),
  );
});
test("screenshot commands preserve JPEG compression and shared logical scaling without capturing anything", async () => {
  const { executor, events } = fakeRuntime();
  const result = await executor.takeScreenshot(2);
  assert.deepEqual(result, {
    action: "screenshot",
    screenshot_path: "/fixture-home/computer-use/12345.jpg",
  });
  assert.deepEqual(
    events.find((event) => event.file === "/usr/sbin/screencapture").args,
    [
      "-x",
      "-t",
      "jpg",
      "-T",
      "0",
      "-D",
      "2",
      "/fixture-home/computer-use/12345.jpg",
    ],
  );
  assert.deepEqual(
    events
      .find((event) => event.file === "/usr/bin/sips" && event.args[0] === "-Z")
      .args.slice(0, 8),
    ["-Z", "1280", "-s", "format", "jpeg", "-s", "formatOptions", "75"],
  );
  assert.deepEqual(executor.getState().scale, { x: 1.5, y: 1.5 });
  assert.deepEqual(executor.rescaleToLogical(20.2, -1.5), { x: 30, y: -2 });
  await executor.mouseAction("left_click", 20.2, 30.2);
  assert.deepEqual(events.at(-1).args, ["c:30,45"]);
  assert.deepEqual(await executor.getCursorPosition(), {
    action: "cursor_position",
    x: 12,
    y: 34,
  });
});
test("compression failure is swallowed and missing logical dimensions reset scale to one", async () => {
  const first = fakeRuntime({ compressionFailure: true });
  assert.equal((await first.executor.takeScreenshot()).action, "screenshot");
  assert.deepEqual(first.executor.getState().scale, { x: 1.5, y: 1.5 });
  const second = fakeRuntime({ logicalFailure: true });
  await second.executor.takeScreenshot();
  assert.deepEqual(second.executor.getState().scale, { x: 1, y: 1 });
});
test("negative cliclick detection caches once; concurrent detection can temporarily report null", async () => {
  const missing = fakeRuntime({ cliclick: false });
  assert.equal(await missing.executor.detectCliclick(), null);
  assert.equal(await missing.executor.detectCliclick(), null);
  assert.equal(missing.events.length, 1);
  let resolve!: (value: { stdout: string }) => void;
  const runtime = createComputerUseRuntime({
      platform: "darwin",
      execFile: () =>
        new Promise((done) => {
          resolve = done;
        }),
    }),
    executor = createComputerUseExecutor(runtime),
    pending = executor.detectCliclick();
  assert.equal(await executor.detectCliclick(), null);
  resolve({ stdout: "/fixture/cliclick" });
  assert.equal(await pending, "/fixture/cliclick");
});
test("mouse fallbacks preserve AppleScript control-click and two-call double-click; unsupported actions require cliclick", async () => {
  const { executor, events } = fakeRuntime({ cliclick: false });
  await executor.mouseAction("right_click", 10, 20);
  assert.match(
    events.at(-1).args[1],
    /key down control[\s\S]*click at \{10, 20\}[\s\S]*key up control/,
  );
  const before = events.length;
  await executor.mouseAction("double_click", 10, 20);
  assert.equal(events.length - before, 2);
  for (const action of ["mouse_move", "middle_click", "triple_click"])
    await assert.rejects(
      executor.mouseAction(action, 1, 2),
      /requires cliclick/,
    );
  await assert.rejects(executor.leftClickDrag(0, 1, 2, 3), /requires cliclick/);
});
test("typing preserves CR/LF normalization, quote escaping and original UTF-16 length", async () => {
  const { executor, events } = fakeRuntime(),
    text = 'a"\\\r\nb\rc';
  assert.deepEqual(await executor.typeText(text), {
    action: "type",
    text_length: text.length,
  });
  const scripts = events
    .filter((event) => event.file === "/usr/bin/osascript")
    .map((event) => event.args[1]);
  assert.equal(scripts.length, 5);
  assert.equal(
    scripts.filter((script) => script.includes("key code 36")).length,
    2,
  );
  assert.match(scripts[0], /a\\"\\\\/);
});
test("key scripts lowercase and retain duplicate modifiers; hold/wait duration clamps are unchanged", async () => {
  const { executor, events } = fakeRuntime();
  assert.equal(
    executor.buildKeyScript(" CMD + shift + A "),
    'tell application "System Events" to keystroke "a" using {command down, shift down}',
  );
  assert.match(
    executor.buildKeyScript("ctrl+control+F12"),
    /key code 111 using \{control down, control down\}/,
  );
  assert.throws(() => executor.buildKeyScript("+"), /Invalid key sequence/);
  await assert.rejects(executor.holdKey("cmd+a", 1), /single key/);
  await executor.holdKey("enter", 99);
  assert.equal(events.at(-1).config.timeout, 33000);
  assert.match(events.at(-1).args[1], /delay 30/);
  assert.deepEqual(await executor.wait(99), { action: "wait", duration: 60 });
  assert.equal(events.at(-1).delay, 60000);
});
test("Quartz scroll script uses rescaled location and axis signs, defaults/rounding preserve source", async () => {
  const { executor, events } = fakeRuntime();
  await executor.takeScreenshot();
  const result = await executor.scrollAt(20, 30, "left", 2.7);
  assert.equal(result.scroll_amount, 3);
  const command = events.at(-1);
  assert.equal(command.file, "/usr/bin/python3");
  assert.match(command.args[1], /loc = \(30, 45\)/);
  assert.match(command.args[1], /CGScrollEventUnitLine, 2, 0, 3/);
});
test("native permission errors are classified without logging or executing real AppleScript", async () => {
  for (const [error, expected] of [
    ["not allowed to send keystrokes", "Accessibility permission required"],
    ["辅助访问", "Accessibility permission required"],
    ["screen recording", "Screen Recording permission required"],
    ["屏幕录制", "Screen Recording permission required"],
    ["line1\nline2\nline3\nline4", "AppleScript failed: line2 line3 line4"],
  ]) {
    const { executor } = fakeRuntime({ osError: error! });
    await assert.rejects(
      executor.runAppleScript("fixture"),
      new RegExp(expected!),
    );
  }
});
test("tool dispatch preserves raw invalid-action error, required fields and screenshot content shape", async () => {
  const { runtime, executor, events } = fakeRuntime(),
    tool = new ComputerUseTool(executor, runtime);
  assert.throws(
    () => validateNonCoordFields({ action: "hold_key", text: "enter" }),
    /numeric "duration"/,
  );
  assert.match(
    (await tool.execute({ action: "left_click" }, {})).error,
    /requires "coordinate"/,
  );
  assert.match(
    (await tool.execute({ action: "unknown" }, {})).error,
    /undefined/,
  );
  const screenshot = await tool.execute(
    { action: "screenshot", display: 8 },
    {},
  );
  assert.deepEqual(screenshot, {
    title: "Screenshot",
    content: [
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${fixtureBytes.toString("base64")}`,
        },
      },
    ],
    renderer: { type: "text" },
  });
  assert.equal(
    events
      .find((event) => event.file === "/usr/sbin/screencapture")
      .args.includes("-D"),
    false,
  );
  assert.equal("rawResponse" in screenshot, false);
  runtime.readFile = (async () => {
    throw Error("read failed");
  }) as any;
  assert.equal(
    (await tool.formatScreenshot("/fixture.jpg")).error,
    "Failed to read screenshot",
  );
});
test("native result processor unwraps once, retains tool metadata and preserves null-is error", async () => {
  assert.throws(() => ToolResult.is(null), TypeError);
  const processor = new FunctionCallResultAgentInputItemProcessor(),
    value: any = {
      type: "function_call_result",
      name: "DelegateTool",
      output: {
        type: "text",
        text: JSON.stringify({
          content: { content: { result: 1 } },
          renderer: { type: "text" },
        }),
      },
    };
  await processor.process(value, {});
  assert.deepEqual(JSON.parse(value.output.text), { content: { result: 1 } });
  await processor.process(value, {});
  assert.deepEqual(JSON.parse(value.output.text), { content: { result: 1 } });
  assert.equal(value.providerData.toolResult.renderer.type, "text");
  await assert.rejects(
    processor.process(
      { type: "function_call_result", output: { type: "text", text: "x" } },
      {},
    ),
    TypeError,
  );
});
test("result processor reverses structured MCP content, discards empty text, leaves partial errors in native boundary", async () => {
  const processor = new FunctionCallResultAgentInputItemProcessor(),
    value: any = {
      type: "function_call_result",
      name: "mcp__fixture__tool",
      output: [
        { type: "input_text", text: " " },
        { type: "input_image", image: "data:image/png;base64,YQ==" },
        { type: "input_text", text: "body" },
      ],
    };
  await processor.process(value, {});
  assert.deepEqual(JSON.parse(value.output.text), [
    { type: "image", image: "data:image/png;base64,YQ==" },
    { type: "text", text: "body" },
  ]);
  assert.equal(value.providerData.toolResult.renderer.type, "media");
});
test("request processor removes invalid paired tool calls, strips private toolResult and converts screenshot arrays", async () => {
  const processor = new ToolMessageModelRequestProcessor(),
    config: any = {
      data: JSON.stringify({
        messages: [
          {
            role: "assistant",
            tool_calls: [
              { id: "bad", type: "function", function: { arguments: "{" } },
              { id: "good", type: "function", function: { arguments: "{}" } },
            ],
          },
          { role: "tool", tool_call_id: "bad", content: "bad" },
          {
            role: "tool",
            tool_call_id: "good",
            content: JSON.stringify([
              {
                type: "image_url",
                image_url: { url: "data:image/jpeg;base64,YQ==" },
              },
            ]),
            toolResult: { secret: "UI-only" },
          },
          { role: "user", content: [] },
          { role: "assistant", content: "trailing" },
        ],
      }),
    };
  await processor.process(config);
  const messages = JSON.parse(config.data).messages;
  assert.equal(messages.length, 2);
  assert.equal(messages[0].tool_calls.length, 1);
  assert.equal(messages[1].tool_call_id, "good");
  assert.equal(messages[1].toolResult, undefined);
  assert.equal(messages[1].content[0].type, "image_url");
});
test("native request processor retains existing image precedence over unresolved blob refs", async () => {
  let calls = 0;
  const processor = new ToolMessageModelRequestProcessor(undefined, {
      rehydrate: async () => {
        calls++;
        return "data:image/png;base64,YQ==";
      },
      createPlaceholder: () => "missing",
    }),
    config: any = {
      data: {
        messages: [
          {
            role: "tool",
            content: JSON.stringify([
              { type: "image_url", image_url: { url: "image" } },
              { type: "image_blob_ref", blob_id: "blob" },
            ]),
          },
        ],
      },
    };
  await processor.process(config);
  assert.equal(calls, 0);
  assert.equal(config.data.messages[0].content[1].type, "image_blob_ref");
});
test("standalone preserves hidden allowlist and denies before any injected desktop command", async (t) => {
  const dir = await fixture(t),
    fake = fakeRuntime(),
    h = await createHarness({
      workDir: dir.root,
      modelProvider: {
        getModel() {
          throw Error("unused");
        },
      },
      computerUse: fake.runtime,
    });
  dir.closeWith(() => h.close());
  assert.ok(
    h.product.raw.agents.every(
      (agent) => !agent.tools?.includes("ComputerUse"),
    ),
  );
  assert.equal(
    (await h.agents.getDefault()).tools.some(
      (tool: any) => tool.name === "ComputerUse",
    ),
    false,
  );
  await assert.rejects(
    Promise.resolve(
      (await h.tools.get("ComputerUse"))!.execute(
        { action: "screenshot" },
        { context: await h.openSession() },
      ),
    ),
    /Tool permission denied/,
  );
  assert.equal(fake.events.length, 0);
  assert.equal((h.tools as any).handlers.size, 47);
});
test(
  "real SDK + real ChatCompletions transport delivers injected screenshot as multimodal tool content",
  { timeout: 10000 },
  async (t) => {
    const dir = await fixture(t),
      fake = fakeRuntime(),
      requests: any[] = [],
      server = createServer(async (req, res) => {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        requests.push(JSON.parse(raw));
        const first = requests.length === 1,
          delta = first
            ? {
                role: "assistant",
                tool_calls: [
                  {
                    index: 0,
                    id: "screen-call",
                    type: "function",
                    function: {
                      name: "ComputerUse",
                      arguments: JSON.stringify({ action: "screenshot" }),
                    },
                  },
                ],
              }
            : { role: "assistant", content: "saw fixture screenshot" };
        res.setHeader("content-type", "text/event-stream");
        const base = {
          id: `r-${requests.length}`,
          object: "chat.completion.chunk",
          model: "fixture",
          created: 1,
        };
        res.end(
          `data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta, finish_reason: null }] })}\n\ndata: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: {}, finish_reason: first ? "tool_calls" : "stop" }], usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 } })}\n\ndata: [DONE]\n\n`,
        );
      });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    t.after(
      () =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    );
    const endpoint = `http://127.0.0.1:${(server.address() as any).port}/v1`,
      h = await createHarness({
        workDir: dir.root,
        apiKey: "fixture-only",
        baseURL: endpoint,
        model: "fixture",
        approveTool: () => true,
        computerUse: fake.runtime,
      });
    dir.closeWith(() => h.close());
    const refresh = h.agents.ensureAgentToolsFreshForRun.bind(h.agents);
    h.agents.ensureAgentToolsFreshForRun = async (...args) => {
      await refresh(...args);
      const agent = (await h.agents.get(args[0]))!;
      agent.tools.push(
        ...(await h.tools.buildTools(["ComputerUse"], h.product.defaultAgent)),
      );
    };
    const session = await h.openSession();
    assert.equal(
      await h.prompt(session, "inspect fixture desktop"),
      "saw fixture screenshot",
    );
    assert.equal(requests.length, 2);
    const toolMessage = requests[1].messages.find(
      (message: any) => message.role === "tool",
    );
    assert.equal(toolMessage.toolResult, undefined);
    assert.deepEqual(toolMessage.content, [
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${fixtureBytes.toString("base64")}`,
        },
      },
    ]);
    assert.match(JSON.stringify(session.history), /Screenshot/);
    const transcript = await readFile(h.store.getSessionFilePath(session.id), "utf8");
    assert.match(transcript, /image_blob_ref/);
    assert.doesNotMatch(transcript, /data:image\/jpeg;base64/);
    const storedResult: any = session.history.find((item:any) => item.type === 'function_call_result' && item.callId === 'screen-call');
    const ref = storedResult.providerData.toolResult.content[0];
    assert.deepEqual(await readFile(ref.blob_path), fixtureBytes);
    assert.ok(
      fake.events.some((event) => event.file === "/usr/sbin/screencapture"),
    );
  },
);
