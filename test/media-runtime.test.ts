import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  rm,
  readFile,
  writeFile,
  readdir,
  access,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServer, type RequestListener } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getEventListeners } from "node:events";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import {
  createMediaRuntime,
  createMediaRestOperations,
} from "../src/media/media-runtime.js";
import { ImageServiceImpl } from "../src/media/image-service-impl.js";
import { VideoServiceImpl } from "../src/media/video-service-impl.js";
import { ImageGenTool } from "../src/media/image-gen-tool.js";
import { ImageEditTool } from "../src/media/image-edit-tool.js";
import { VideoGenTool } from "../src/media/video-gen-tool.js";
import { ImageToolHookInputProcessor } from "../src/media/image-tool-hook-input-processor.js";
import {
  imageGenParameters,
  imageEditParameters,
  videoGenParameters,
} from "../src/media/media-schemas.js";
setTraceProcessors([]);
const bytes = Buffer.from("protocol fixture, not generated media");
test("standalone REST adapter preserves non-JSON HTTP error data and arraybuffer downloads", async (t) => {
  const endpoint = await server(t, (req, res) => {
    res.setHeader("X-Fixture", "value");
    if (req.url === "/failed") {
      res.statusCode = 503;
      res.end("upstream plain error");
    } else res.end(bytes);
  });
  const rest = createMediaRestOperations();
  await assert.rejects(
    rest.request({ url: endpoint + "/failed", method: "GET" }),
    (error: any) => {
      assert.equal(error.response.status, 503);
      assert.equal(error.response.data, "upstream plain error");
      assert.equal(error.response.headers["x-fixture"], "value");
      return true;
    },
  );
  assert.deepEqual(
    (
      await rest.request({
        url: endpoint + "/bytes",
        method: "GET",
        responseType: "arraybuffer",
      })
    ).data,
    bytes,
  );
});
async function directory(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-media-"));
  const closers: Array<() => any> = [];
  t.after(async () => {
    try {
      for (const close of closers) await close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  return { root, closeWith: (fn: () => any) => closers.push(fn) };
}
async function server(
  t: { after(fn: () => any): void },
  handler: RequestListener,
) {
  const value = createServer(handler);
  await new Promise<void>((resolve) => value.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        value.closeAllConnections();
        value.close((error) => (error ? reject(error) : resolve()));
      }),
  );
  return `http://127.0.0.1:${(value.address() as any).port}`;
}
async function fixtureServer(
  t: { after(fn: () => any): void },
  requests: any[],
  pending = false,
) {
  let queries = 0,
    endpoint = "";
  endpoint = await server(t, async (req, res) => {
    let text = "";
    for await (const chunk of req) text += chunk;
    requests.push({
      url: req.url,
      authorization: req.headers.authorization,
      body: text ? JSON.parse(text) : undefined,
    });
    if (req.url?.startsWith("/download")) {
      res.setHeader("content-type", "image/webp; charset=utf-8");
      res.end(bytes);
      return;
    }
    res.setHeader("content-type", "application/json");
    if (req.url?.startsWith("/v2/images/"))
      res.end(
        JSON.stringify({
          code: 0,
          data: { data: [{ b64_json: bytes.toString("base64") }] },
        }),
      );
    else if (req.url === "/v2/videos/generations")
      res.end(JSON.stringify({ code: 0, data: { id: "fixture-task" } }));
    else if (req.url === "/v2/videos/tasks")
      res.end(
        JSON.stringify({
          code: 0,
          data:
            ++queries === 1 && pending
              ? { status: "pending" }
              : {
                  status: "completed",
                  data: [{ url: endpoint + "/download/video" }],
                },
        }),
      );
    else {
      res.statusCode = 404;
      res.end(JSON.stringify({ msg: "not found" }));
    }
  });
  return endpoint;
}
const call = (name: string, args: any) => [
  {
    type: "function_call",
    name,
    id: "call",
    callId: "call",
    status: "completed",
    arguments: JSON.stringify(args),
  },
];
const final = (text: string) => [
  {
    type: "message",
    id: "message",
    role: "assistant",
    status: "completed",
    content: [{ type: "output_text", text }],
  },
];
function modelFixture(
  requests: any[],
  respond: (request: any, count: number) => any[],
): Model {
  let count = 0;
  return {
    getResponse: async () => ({ output: [], usage: new Usage() }),
    async *getStreamedResponse(request) {
      requests.push(request);
      const output = respond(request, ++count);
      yield { type: "response_started" };
      for (const item of output)
        if (item.type === "message")
          yield { type: "output_text_delta", delta: item.content[0].text };
      yield {
        type: "response_done",
        response: {
          id: `r-${count}`,
          output,
          usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
        },
      } as any;
    },
  };
}
test("media schemas retain unrestricted strings, missing n and distinct image shapes", () => {
  assert.equal(
    imageGenParameters.safeParse({ prompt: "p", image: "image" }).success,
    false,
  );
  assert.equal(
    imageGenParameters.safeParse({ prompt: "p", image: ["a", "b", "c", "d"] })
      .success,
    false,
  );
  assert.equal(
    imageEditParameters.safeParse({ prompt: "p", image: ["a"] }).success,
    false,
  );
  assert.equal(
    (
      imageGenParameters.parse({
        prompt: "p",
        n: 4,
        footnote: "longer than 16 characters",
        quality: "anything",
      }) as any
    ).n,
    undefined,
  );
  assert.equal(
    videoGenParameters.parse({ prompt: "p", seconds: "-1" }).seconds,
    -1,
  );
  assert.equal(
    videoGenParameters.safeParse({ prompt: "p", resolution: "4K" }).success,
    false,
  );
});
test("image provider branches retain Hunyuan revise false wrapper and Gemini field omissions", () => {
  const runtime = createMediaRuntime({
      getWorkDir: () => "/work",
      configuration: async () => ({}),
    }),
    image = new ImageServiceImpl(runtime),
    input = {
      prompt: " p ",
      size: "",
      quality: "high",
      background: "transparent",
      n: 2,
      footnote: "note",
      revise: false,
    };
  assert.deepEqual(image.buildBaseRequestBody(input, "hunyuan-image"), {
    model: "hunyuan-image",
    prompt: " p ",
    size: "1024x1024",
    n: 2,
    footnote: "note",
    revise: { value: false },
  });
  assert.deepEqual(image.buildBaseRequestBody(input, "gemini-image"), {
    model: "gemini-image",
    prompt: " p ",
    size: "1024x1024",
  });
  assert.deepEqual(image.buildBaseRequestBody(input, "gpt-image"), {
    model: "gpt-image",
    prompt: " p ",
    size: "1024x1024",
    response_format: "b64_json",
    n: 2,
    quality: "high",
    background: "transparent",
  });
});
test("model resolution is session then env then merged settings then configured then original fallback", async () => {
  const runtime = createMediaRuntime({
      getWorkDir: () => "/work",
      configuration: async () => ({
        models: [{ id: "configured", tags: ["text-to-image"] }],
      }),
      env: { CODEBUDDY_TEXT_TO_IMAGE_MODEL: "env" },
      settings: { get: async () => "settings" },
    }),
    image = new ImageServiceImpl(runtime);
  assert.equal(
    await image.resolveModel(
      { options: { textToImageModel: "session" } },
      "text-to-image",
    ),
    "session",
  );
  assert.equal(await image.resolveModel({}, "text-to-image"), "env");
  delete runtime.env.CODEBUDDY_TEXT_TO_IMAGE_MODEL;
  assert.equal(await image.resolveModel({}, "text-to-image"), "settings");
  runtime.settings.get = async () => undefined;
  assert.equal(await image.resolveModel({}, "text-to-image"), "configured");
  assert.equal(
    await image.resolveModel({}, "image-to-image"),
    "hunyuan-image-v2.0-general-edit",
  );
  assert.equal(
    await new VideoServiceImpl(runtime).resolveModel({}, "image-to-video"),
    "kling-v3-i2v",
  );
});
test("feature gates preserve exact env override and image models versus video feature-only gate", async () => {
  const runtime = createMediaRuntime({
      getWorkDir: () => "/work",
      configuration: async () => ({
        productFeatures: { ImageGen: true, ImageEdit: true, VideoGen: true },
        models: [],
      }),
      env: {},
    }),
    image = new ImageServiceImpl(runtime),
    gen = new ImageGenTool(runtime, image),
    edit = new ImageEditTool(runtime, image),
    video = new VideoGenTool(runtime, image, new VideoServiceImpl(runtime));
  assert.equal(await gen.isEnabled({}), false);
  assert.equal(await edit.isEnabled({}), false);
  assert.equal(await video.isEnabled({}), true);
  runtime.env.CODEBUDDY_IMAGE_GEN_ENABLED = "TRUE";
  assert.equal(await gen.isEnabled({}), false);
  runtime.env.CODEBUDDY_IMAGE_GEN_ENABLED = "1";
  assert.equal(await gen.isEnabled({}), true);
});
test("output directory creation occurs before validation and outside tool catch", async (t) => {
  const { root } = await directory(t),
    runtime = createMediaRuntime({
      getWorkDir: () => root,
      configuration: async () => ({}),
    }),
    image = new ImageServiceImpl(runtime),
    tool = new ImageGenTool(runtime, image);
  const result = await tool.execute({ prompt: " " }, undefined);
  assert.equal(result.error, "Missing prompt");
  await access(join(root, "generated-images"));
  await writeFile(join(root, "blocked"), "file");
  await assert.rejects(
    tool.execute({ prompt: "p", output_dir: join(root, "blocked/child") }, {}),
    /ENOTDIR|EEXIST/,
  );
});
test("image inputs preserve data URL/raw-base64 heuristics, extension MIME and relative-file semantics", async (t) => {
  const { root } = await directory(t),
    image = new ImageServiceImpl(
      createMediaRuntime({
        getWorkDir: () => root,
        configuration: async () => ({}),
      }),
    );
  assert.equal(image.isLikelyBase64("A".repeat(100)), true);
  assert.equal(image.isLikelyBase64("/" + "A".repeat(100)), false);
  assert.equal(
    await image.processImageInput(
      "data:image/png;base64,not-validated-base64",
      undefined,
    ),
    "data:image/png;base64,not-validated-base64",
  );
  const svg = join(root, "file.SVG");
  await writeFile(svg, "<svg/>");
  assert.equal(
    await image.processFilePath(svg),
    "data:image/svg+xml;base64,PHN2Zy8+",
  );
  await assert.rejects(
    image.processFilePath("nonexistent-relative-fixture.png"),
    /Image file not found/,
  );
  await writeFile(join(root, "file.txt"), "text");
  await assert.rejects(
    image.processFilePath(join(root, "file.txt")),
    /Unsupported file type/,
  );
});
test("image API request and HTTP input/download preserve separate auth, headers and exact envelopes", async (t) => {
  const { root } = await directory(t),
    requests: any[] = [],
    endpoint = await fixtureServer(t, requests),
    runtime = createMediaRuntime({
      getWorkDir: () => root,
      configuration: async () => ({ endpoint }),
      authentication: () => ({ accessToken: "media-only" }),
    }),
    image = new ImageServiceImpl(runtime);
  await image.initializeOutputDir(undefined);
  const dataUrl = await image.processHttpUrl(
    endpoint + "/download/input",
    undefined,
  );
  assert.equal(dataUrl, `data:image/webp;base64,${bytes.toString("base64")}`);
  const files = await image.generateImage(
    { prompt: "fixture", revise: false },
    { context: { abortSignal: new AbortController().signal } },
  );
  assert.deepEqual(await readFile(files[0]), bytes);
  assert.equal(requests[0].authorization, undefined);
  assert.equal(requests[1].authorization, "Bearer media-only");
  assert.deepEqual(requests[1].body, {
    model: "hunyuan-image-v3.0",
    prompt: "fixture",
    size: "1024x1024",
    n: 1,
    revise: { value: false },
  });
});
test("shared outputDir races and second-resolution filename overwrites remain visible", async (t) => {
  const { root } = await directory(t);
  class Clock extends Date {
    constructor() {
      super("2026-10-20T01:02:03.000Z");
    }
  }
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
      release = resolve;
    }),
    runtime = createMediaRuntime({
      getWorkDir: () => root,
      configuration: async () => ({ endpoint: "fixture" }),
      authentication: () => ({ accessToken: "token" }),
      Date: Clock as any,
      restOperations: {
        request: async () => {
          await gate;
          return { data: { code: 0, data: { data: [{ b64_json: "YQ==" }] } } };
        },
      },
    }),
    image = new ImageServiceImpl(runtime);
  await image.initializeOutputDir(join(root, "first"));
  const pending = image.generateImage({ prompt: "same" }, { context: {} });
  await image.initializeOutputDir(join(root, "second"));
  release();
  const files = await pending;
  assert.equal(files[0], join(root, "second/same_2026-10-20T01-02-03.png"));
  await image.saveImage({ b64_json: "Yg==" }, "same", 0, undefined);
  assert.equal((await readFile(files[0])).toString(), "b");
  assert.deepEqual(await readdir(join(root, "first")), []);
});
test("product error extraction preserves extError/msg/requestId and HTTP header fallback", () => {
  const image = new ImageServiceImpl(
    createMediaRuntime({
      getWorkDir: () => "/work",
      configuration: async () => ({}),
    }),
  );
  assert.equal(
    image.extractErrorMessage({
      response: {
        data: {
          extError: { message: "extended" },
          msg: "other",
          requestId: "rid",
        },
      },
    }),
    "extended (requestId: rid)",
  );
  assert.equal(
    image.extractErrorMessage({ response: { data: { requestId: "rid" } } }),
    "Unknown error (requestId: rid)",
  );
  assert.equal(
    image.extractErrorMessage(
      Object.assign(new Error("failed"), {
        config: { headers: { "X-Request-ID": "request" } },
      }),
    ),
    "failed (requestId: request)",
  );
});
test("video service submits original body, polls pending then downloads without bearer forwarding", async (t) => {
  const { root } = await directory(t),
    requests: any[] = [],
    endpoint = await fixtureServer(t, requests, true),
    runtime = createMediaRuntime({
      getWorkDir: () => root,
      configuration: async () => ({ endpoint }),
      authentication: () => ({ accessToken: "video-token" }),
    }),
    video = new VideoServiceImpl(runtime),
    sleeps: any[] = [];
  video.sleep = async (...args: any[]) => sleeps.push(args);
  await video.initializeOutputDir(undefined);
  const signal = new AbortController().signal,
    files = await video.generateVideo(
      {
        prompt: "video",
        image: "image-data",
        last_image: "last-data",
        seconds: 0,
        resolution: "bad",
      },
      { context: { abortSignal: signal } },
    );
  assert.equal(files.length, 1);
  assert.deepEqual(await readFile(files[0]), bytes);
  assert.deepEqual(requests[0].body, {
    prompt: "video",
    model: "kling-v3-i2v",
    seconds: 0,
    watermark: true,
    image_url: "image-data",
    last_image_url: "last-data",
    extra_parameters: { resolution: "720P" },
  });
  assert.equal(
    requests.filter((request) => request.url === "/v2/videos/tasks").length,
    2,
  );
  assert.equal(requests.at(-1).authorization, undefined);
  assert.deepEqual(sleeps, [[5000, signal]]);
});
test("video sleep retains completed abort listener and cancellation strings differ by phase", async () => {
  const video = new VideoServiceImpl(
      createMediaRuntime({
        getWorkDir: () => "/work",
        configuration: async () => ({}),
      }),
    ),
    controller = new AbortController();
  await video.sleep(1, controller.signal);
  assert.equal(getEventListeners(controller.signal, "abort").length, 1);
  controller.abort();
  await assert.rejects(
    video.sleep(1000, controller.signal),
    /^Error: Aborted$/,
  );
  await assert.rejects(
    video.pollTask("endpoint", "token", "task", controller.signal),
    /Video generation was cancelled/,
  );
});
test("media hook records ImageGen text model even for image input and does not run for VideoGen", async () => {
  const tags: string[] = [],
    hook = new ImageToolHookInputProcessor({
      resolveModel: async (_session, tag) => {
        tags.push(tag);
        return tag;
      },
    }),
    input: any = { tool_name: "ImageGen", tool_input: { image: ["source"] } };
  await hook.process(input, "PreToolUse");
  await hook.process(input, "PostToolUse");
  assert.equal(input.tool_input.image_model, "text-to-image");
  await hook.process({ tool_name: "VideoGen", tool_input: {} }, "PostToolUse");
  assert.deepEqual(tags, ["text-to-image"]);
});
test("real SDK default deferred ImageGen reaches product protocol, saves bytes and feeds native result back", async (t) => {
  const fixture = await directory(t),
    requests: any[] = [],
    modelRequests: any[] = [],
    endpoint = await fixtureServer(t, requests),
    model = modelFixture(modelRequests, (_request, count) =>
      count === 1
        ? call("DeferExecuteTool", {
            toolName: "ImageGen",
            params: { prompt: "SDK image" },
          })
        : final("image saved"),
    ),
    approvals: string[] = [],
    h = await createHarness({
      workDir: fixture.root,
      modelProvider: { getModel: () => model },
      apiKey: "model-not-media",
      approveTool: (name) => {
        approvals.push(name);
        return true;
      },
      mediaTools: { endpoint, accessToken: "media-only" },
    });
  fixture.closeWith(() => h.close());
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "generate fixture"), "image saved");
  const outputDir = join(fixture.root, "generated-images"),
    files = await readdir(outputDir);
  assert.equal(files.length, 1);
  assert.deepEqual(await readFile(join(outputDir, files[0]!)), bytes);
  assert.equal(requests[0].authorization, "Bearer media-only");
  assert.match(JSON.stringify(modelRequests[1].input), /image_gen_tool_result/);
  assert.ok(approvals.includes("ImageGen"));
  assert.equal((h.tools as any).handlers.size, 47);
});
test("real SDK default deferred VideoGen completes task polling and local download", async (t) => {
  const fixture = await directory(t),
    requests: any[] = [],
    modelRequests: any[] = [],
    endpoint = await fixtureServer(t, requests),
    model = modelFixture(modelRequests, (_request, count) =>
      count === 1
        ? call("DeferExecuteTool", {
            toolName: "VideoGen",
            params: { prompt: "SDK video", seconds: 5 },
          })
        : final("video saved"),
    ),
    h = await createHarness({
      workDir: fixture.root,
      modelProvider: { getModel: () => model },
      approveTool: () => true,
      mediaTools: { endpoint, accessToken: "video-only" },
    });
  fixture.closeWith(() => h.close());
  assert.equal(
    await h.prompt(await h.openSession(), "video fixture"),
    "video saved",
  );
  assert.match(JSON.stringify(modelRequests[1].input), /video_gen_tool_result/);
  const files = await readdir(join(fixture.root, "generated-videos"));
  assert.equal(files.length, 1);
  assert.deepEqual(
    await readFile(join(fixture.root, "generated-videos", files[0]!)),
    bytes,
  );
  assert.equal(requests[0].body.model, "kling-v3-t2v");
});
test("ImageEdit legacy and ImageGen image branch use original image arrays without extending allowlists", async (t) => {
  const fixture = await directory(t),
    requests: any[] = [],
    endpoint = await fixtureServer(t, requests),
    product = await loadProductConfiguration(),
    runtime = createMediaRuntime({
      getWorkDir: () => fixture.root,
      configuration: async () => ({
        ...product.raw,
        endpoint,
        models: [
          ...product.raw.models,
          { id: "gpt-edit", tags: ["image-to-image"] },
        ],
      }),
      authentication: () => ({ accessToken: "edit-only" }),
      env: {},
    }),
    image = new ImageServiceImpl(runtime),
    gen = new ImageGenTool(runtime, image),
    edit = new ImageEditTool(runtime, image),
    source = `data:image/png;base64,${bytes.toString("base64")}`,
    context = { context: { abortSignal: new AbortController().signal } };
  assert.ok(
    product.raw.agents.every((agent) => !agent.tools?.includes("ImageEdit")),
  );
  assert.equal(
    (await edit.execute({ prompt: "edit", image: source }, context)).error,
    undefined,
  );
  assert.equal(requests[0].url, "/v2/images/edits");
  assert.deepEqual(requests[0].body.image, [source]);
  assert.equal(
    (
      await gen.execute(
        { prompt: "edit with gen", image: [source, source] },
        context,
      )
    ).error,
    undefined,
  );
  assert.equal(requests[1].body.image.length, 2);
  assert.equal(requests[1].body.model, "gpt-edit");
});
test("host permission denies media before creating directories; model key is never used for product authentication", async (t) => {
  const fixture = await directory(t),
    h = await createHarness({
      workDir: fixture.root,
      apiKey: "not-product-token",
      modelProvider: {
        getModel() {
          throw Error("unused");
        },
      },
    });
  fixture.closeWith(() => h.close());
  const session = await h.openSession();
  await assert.rejects(
    Promise.resolve(
      (await h.tools.get("ImageGen"))!.execute(
        { prompt: "fixture" },
        { context: session },
      ),
    ),
    /Tool permission denied/,
  );
  await assert.rejects(access(join(fixture.root, "generated-images")));
  await assert.rejects(
    h.imageService.prepareRequest(),
    /Authentication required/,
  );
  assert.equal(h.mediaRuntime.authentication(), undefined);
});
test("legacy ImageEdit executes through explicit SDK exposure with an in-memory feature/model overlay", async (t) => {
  const fixture = await directory(t),
    requests: any[] = [],
    modelRequests: any[] = [],
    endpoint = await fixtureServer(t, requests),
    product = await loadProductConfiguration(),
    source = `data:image/png;base64,${bytes.toString("base64")}`;
  const model = modelFixture(modelRequests, (_request, count) =>
    count === 1
      ? call("ImageEdit", {
          prompt: "SDK edit",
          image: source,
          input_fidelity: "high",
        })
      : final("edited fixture"),
  );
  const h = await createHarness({
    workDir: fixture.root,
    modelProvider: { getModel: () => model },
    approveTool: () => true,
    mediaTools: {
      accessToken: "edit-only",
      configuration: async () => ({
        ...product.raw,
        endpoint,
        productFeatures: {
          ...(product.raw.productFeatures as Record<string, unknown>),
          ImageEdit: true,
        },
        models: [
          ...product.raw.models,
          { id: "gpt-edit", tags: ["image-to-image"] },
        ],
      }),
    },
  });
  fixture.closeWith(() => h.close());
  assert.equal((h.product.raw.productFeatures as any).ImageEdit, false);
  assert.ok(
    h.product.raw.agents.every((agent) => !agent.tools?.includes("ImageEdit")),
  );
  const refresh = h.agents.ensureAgentToolsFreshForRun.bind(h.agents);
  h.agents.ensureAgentToolsFreshForRun = async (...args) => {
    await refresh(...args);
    const agent = (await h.agents.get(args[0]))!;
    agent.tools.push(
      ...(await h.tools.buildTools(["ImageEdit"], h.product.defaultAgent)),
    );
  };
  assert.equal(
    await h.prompt(await h.openSession(), "edit fixture"),
    "edited fixture",
  );
  assert.equal(requests[0].url, "/v2/images/edits");
  assert.equal(requests[0].body.input_fidelity, "high");
  assert.match(JSON.stringify(modelRequests[1].input), /image_gen_tool_result/);
});
test(
  "CLI replay can configure media endpoint/token and execute the original deferred image flow",
  { timeout: 10000 },
  async (t) => {
    const fixture = await directory(t),
      requests: any[] = [],
      endpoint = await fixtureServer(t, requests),
      outputs = [
        call("DeferExecuteTool", {
          toolName: "ImageGen",
          params: { prompt: "CLI image" },
        }),
        final("CLI media complete"),
      ],
      recording = [
        { type: "metadata", version: 1 },
        ...outputs.map((output, turnId) => ({
          type: "stream_response",
          modelName: "fixture",
          turnId,
          events: [
            { offsetMs: 0, event: { type: "response_started" } },
            {
              offsetMs: 0,
              event: {
                type: "response_done",
                response: {
                  id: `r-${turnId}`,
                  output,
                  usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
                },
              },
            },
          ],
        })),
      ];
    await writeFile(
      join(fixture.root, "recording.jsonl"),
      recording.map((item) => JSON.stringify(item)).join("\n") + "\n",
    );
    const env = { ...process.env };
    for (const key of [
      "CODEBUDDY_RECORD_DIR",
      "CODEBUDDY_REPLAY_DIR",
      "CODEBUDDY_API_KEY",
      "OPENAI_API_KEY",
      "CODEBUDDY_BASE_URL",
      "OPENAI_BASE_URL",
    ])
      delete env[key];
    env.CODEBUDDY_REPLAY_DIR = fixture.root;
    env.WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN = "cli-media-only";
    const result = await promisify(execFile)(
      process.execPath,
      [
        ...(import.meta.url.endsWith(".ts")
          ? ["--import", import.meta.resolve("tsx")]
          : []),
        new URL(
          `../src/cli.${import.meta.url.endsWith(".ts") ? "ts" : "js"}`,
          import.meta.url,
        ).pathname,
        "--cwd",
        fixture.root,
        "--model",
        "fixture",
        "--media-endpoint",
        endpoint,
        "--allow-tools",
        "DeferExecuteTool,ImageGen",
        "-p",
        "fixture",
      ],
      { cwd: fixture.root, env, timeout: 7000 },
    );
    assert.equal(result.stdout, "CLI media complete\n");
    assert.equal(requests[0].authorization, "Bearer cli-media-only");
    assert.equal(
      (await readdir(join(fixture.root, "generated-images"))).length,
      1,
    );
  },
);
