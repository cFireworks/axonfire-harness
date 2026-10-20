import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as media from "../src/media/media-types.js";
import {
  baseImageParameters,
  imageEditExtendParameters,
  imageGenParameters,
  imageEditParameters,
  videoGenParameters,
} from "../src/media/media-schemas.js";
import { createMediaRuntime } from "../src/media/media-runtime.js";
import { ImageServiceImpl } from "../src/media/image-service-impl.js";
import { VideoServiceImpl } from "../src/media/video-service-impl.js";
import { ImageGenTool } from "../src/media/image-gen-tool.js";
import { ImageEditTool } from "../src/media/image-edit-tool.js";
import { VideoGenTool } from "../src/media/video-gen-tool.js";
import { ImageToolHookInputProcessor } from "../src/media/image-tool-hook-input-processor.js";
const filename = process.argv[2];
if (!filename) throw Error("Pass captured bundle path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
class FixedDate extends Date {
  constructor(value?: any) {
    super(value ?? "2026-10-20T01:02:03.456Z");
  }
  static override now() {
    return 1000;
  }
}
function evaluate(code: string, bindings: any = {}): any {
  return runInNewContext(
    `Object.setPrototypeOf(TypeError.prototype,Error.prototype);${code}`,
    {
      Error,
      Buffer,
      Date: FixedDate,
      Map,
      Set,
      Promise,
      setTimeout,
      clearTimeout,
      ...bindings,
    },
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
  if (value instanceof Map || value instanceof Set)
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
const toolNamesStart = source.indexOf('eA.READ="Read"', 12191000), toolNamesEnd = source.indexOf("}(eg||(eg={}))", toolNamesStart);
equal(media.ToolNames, evaluate(`(()=>{const eA={};${source.slice(toolNamesStart, toolNamesEnd)};return eA})()`));
const baseStart = source.indexOf("eV=ef.z.object(", 12196000),
  editStart = source.indexOf(",eZ=", baseStart),
  editEnd = source.indexOf(",eX=Symbol", editStart),
  base = evaluate(source.slice(baseStart + 3, editStart), { ef: { z } }),
  editExtend = evaluate(source.slice(editStart + 4, editEnd), { ef: { z } });
const genStart = source.indexOf("let cC=", 12001000),
  genEnd = source.indexOf(",cy=class", genStart),
  gen = evaluate(source.slice(genStart + 7, genEnd), {
    nC: { BaseImageParameters: base },
    iJ: { z },
  }),
  edit = base.merge(editExtend),
  videoStart = source.indexOf("let cT=", 12032500),
  videoEnd = source.indexOf(",cR=class", videoStart),
  video = evaluate(source.slice(videoStart + 7, videoEnd), { iJ: { z } });
const converterStart = source.indexOf(
    'let i2=Symbol("Let zodToJsonSchema',
    11618000,
  ),
  converterEnd = source.indexOf(";var om=ec(22618)", converterStart),
  convert = evaluate(
    `(()=>{${source.slice(converterStart, converterEnd + 1)}return zodToJsonSchema})()`,
    { iJ: z },
  );
for (const [after, before] of [
  [baseImageParameters, base],
  [imageEditExtendParameters, editExtend],
  [imageGenParameters, gen],
  [imageEditParameters, edit],
  [videoGenParameters, video],
]) {
  equal(zodToJsonSchema(after as any), convert(before));
  for (const input of [
    {},
    { prompt: "" },
    { prompt: "p", image: "x" },
    { prompt: "p", image: [] },
    { prompt: "p", image: ["a"] },
    { prompt: "p", image: ["a", "b", "c", "d"] },
    { prompt: "p", seconds: "5", resolution: "720P" },
    { prompt: "p", seconds: -1, resolution: "4K" },
    { prompt: "p", revise: "false", n: 3 },
    {
      prompt: "p",
      footnote: "more than sixteen chars accepted",
      background: "unknown",
    },
  ]) {
    const a = after!.safeParse(input),
      b = before.safeParse(input);
    equal(a.success ? a.data : "invalid", b.success ? b.data : "invalid");
  }
}
function logger(events: any[]) {
  return Object.fromEntries(
    ["info", "debug", "error", "warn"].map((method) => [
      method,
      (...args: any[]) => events.push([method, ...args]),
    ]),
  );
}
function services(native: boolean, events: any[], options: any = {}) {
  const config = options.config ?? {
      endpoint: "https://fixture.invalid",
      models: [],
    },
    authentication =
      options.authentication ?? (() => ({ accessToken: "fixture-token" })),
    settings = { get: async (key: string) => options.settings?.[key] },
    log = logger(events),
    rest = options.rest ?? {
      request: async (...args: any[]) => {
        events.push(["request", ...args]);
        return { data: options.response };
      },
    },
    runtime = createMediaRuntime({
      getWorkDir: () => "/work",
      configuration: async () => config,
      authentication,
      settings,
      logger: log as any,
      restOperations: rest,
      env: options.env ?? {},
      Date: options.Date ?? (FixedDate as any),
      ...(options.setTimeout
        ? { setTimeout: options.setTimeout, clearTimeout: options.clearTimeout }
        : {}),
    });
  if (!native)
    return {
      image: new ImageServiceImpl(runtime),
      video: new VideoServiceImpl(runtime),
      runtime,
    };
  const bindings = {
      n4: path,
      ok: fs,
      nW: { PathUtils: { getWorkDir: () => "/work" } },
      nC: media,
      iq: media,
      sF: {
        HttpHeaders: {
          CONTENT_TYPE: "Content-Type",
          AUTHORIZATION: "Authorization",
        },
      },
      process: { env: runtime.env },
      Date: runtime.Date,
      setTimeout: runtime.setTimeout,
      clearTimeout: runtime.clearTimeout,
      ck: 5000,
      cM: 600000,
      cx: "kling-v3-t2v",
      cO: "kling-v3-i2v",
    },
    Image = evaluate(`(${source.slice(12024390, 12031124)})`, bindings),
    Video = evaluate(`(${source.slice(12037069, 12041876)})`, bindings),
    deps = () => ({
      logger: log,
      restOperations: rest,
      productManager: { waitConfiguration: runtime.configuration },
      authenticationManager: {
        currentSessionSubject: { getValue: () => ({ auth: authentication() }) },
      },
      settingsManager: settings,
    });
  return {
    image: Object.assign(new Image(), deps()),
    video: Object.assign(new Video(), deps()),
    runtime,
  };
}
for (const model of [
  "hunyuan-image-v3.0",
  "gemini-image",
  "gpt-image",
  "HUNYUAN-x",
])
  for (const extras of [
    {},
    { n: 0, revise: false },
    {
      n: 2,
      quality: "high",
      style: "style",
      background: "transparent",
      footnote: "watermark",
      revise: true,
      size: "1536x1024",
    },
    { size: "", quality: "", revise: null },
  ]) {
    const a: any[] = [],
      b: any[] = [];
    equal(
      {
        body: services(false, a).image.buildBaseRequestBody(
          { prompt: " p ", ...extras },
          model,
        ),
        logs: a,
      },
      {
        body: services(true, b).image.buildBaseRequestBody(
          { prompt: " p ", ...extras },
          model,
        ),
        logs: b,
      },
    );
  }
for (const tag of [
  media.TEXT_TO_IMAGE_MODEL_TAG,
  media.IMAGE_TO_IMAGE_MODEL_TAG,
  media.TEXT_TO_VIDEO_MODEL_TAG,
  media.IMAGE_TO_VIDEO_MODEL_TAG,
])
  for (const selected of ["fallback", "config", "settings", "env", "session"]) {
    async function probe(native: boolean) {
      const events: any[] = [],
        key = {
          "text-to-image": "textToImageModel",
          "image-to-image": "imageToImageModel",
          "text-to-video": "textToVideoModel",
          "image-to-video": "imageToVideoModel",
        }[tag]!,
        envKey = {
          "text-to-image": "CODEBUDDY_TEXT_TO_IMAGE_MODEL",
          "image-to-image": "CODEBUDDY_IMAGE_TO_IMAGE_MODEL",
          "text-to-video": "CODEBUDDY_TEXT_TO_VIDEO_MODEL",
          "image-to-video": "CODEBUDDY_IMAGE_TO_VIDEO_MODEL",
        }[tag]!,
        all = services(native, events, {
          config: {
            models:
              selected !== "fallback"
                ? [{ id: "configured", tags: [tag] }]
                : [],
          },
          settings: ["settings", "env", "session"].includes(selected)
            ? { [key]: "settings" }
            : {},
          env: ["env", "session"].includes(selected) ? { [envKey]: "env" } : {},
        }),
        service = tag.includes("video") ? all.video : all.image;
      return {
        result: await service.resolveModel(
          { options: selected === "session" ? { [key]: "session" } : {} },
          tag,
        ),
        events,
      };
    }
    equal(await probe(false), await probe(true));
  }
for (const input of [
  "",
  "short",
  "A".repeat(100),
  "A".repeat(99),
  "/".repeat(120),
  "data:image/png;base64,AAA=",
  "data:text/plain;base64,AAA=",
  "data:image/png;base64,",
  "http://fixture.invalid/x",
  "HTTPS://case-sensitive/x",
]) {
  async function probe(native: boolean) {
    const s = services(native, []).image;
    s.processHttpUrl = async (value: any, signal: any) => [
      "url",
      value,
      signal,
    ];
    s.processFilePath = async (value: any) => ["file", value];
    return {
      likely: s.isLikelyBase64(input),
      data: await outcome(() => s.processDataUrl(input)),
      processed: await outcome(() => s.processImageInput(input, "signal")),
    };
  }
  equal(await probe(false), await probe(true));
}
for (const bytes of [
  [137, 80, 78, 71],
  [255, 216, 255],
  [71, 73, 70, 56],
  [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80],
  [66, 77],
  [],
  [0, 1, 2],
]) {
  const a: any[] = [],
    b: any[] = [],
    value = Buffer.from(bytes).toString("base64");
  equal(
    {
      result: services(false, a).image.detectMimeTypeFromBase64(value),
      events: a,
    },
    {
      result: services(true, b).image.detectMimeTypeFromBase64(value),
      events: b,
    },
  );
}
for (const extension of [
  "JPG",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "ico",
  "tiff",
  "tif",
  "txt",
  "",
])
  equal(
    services(false, []).image.getMimeType(`file.${extension}`),
    services(true, []).image.getMimeType(`file.${extension}`),
  );
for (const error of [
  new Error("failed"),
  "plain",
  {},
  { response: { data: { requestId: "rid" } } },
  {
    response: {
      data: {
        extError: { message: "extended" },
        msg: "fallback",
        requestId: "rid",
      },
    },
  },
  {
    response: { data: { msg: "api failed" } },
    config: { headers: { "X-Request-ID": "req" } },
  },
  Object.assign(new Error("transport"), {
    config: { headers: { "X-Request-ID": "req" } },
  }),
])
  equal(
    services(false, []).image.extractErrorMessage(error),
    services(true, []).image.extractErrorMessage(error),
  );
for (const header of [undefined, "image/webp; charset=utf-8", "text/plain"]) {
  async function probe(native: boolean) {
    const events: any[] = [],
      s = services(native, events, {
        rest: {
          request: async (...args: any[]) => {
            events.push(args);
            return {
              data: Buffer.from([137, 80, 78, 71]),
              headers: header ? { "content-type": header } : {},
            };
          },
        },
      }).image;
    return {
      result: await s.processHttpUrl("https://fixture.invalid/a", "signal"),
      events,
    };
  }
  equal(await probe(false), await probe(true));
}
for (const serviceKind of ["image", "video"])
  for (const auth of [undefined, {}, { accessToken: "token" }])
    for (const endpoint of [undefined, "", "https://fixture.invalid/"]) {
      async function probe(native: boolean) {
        const all: any = services(native, [], {
          config: { endpoint },
          authentication: () => auth,
        });
        return await outcome(() => all[serviceKind].prepareRequest());
      }
      equal(await probe(false), await probe(true));
    }
for (const method of ["generateImage", "editImage"])
  for (const response of [
    { code: 0, data: { data: [{ b64_json: "YQ==" }] } },
    { code: 0, data: { data: [] } },
    { code: 1, msg: "failed", request_id: "req" },
  ]) {
    async function probe(native: boolean) {
      const events: any[] = [],
        s = services(native, events, { response }).image;
      s.saveImage = async (...args: any[]) => {
        events.push(["saveImage", ...args]);
        return "/output/image.png";
      };
      return {
        result: await outcome(() =>
          s[method](
            {
              prompt: "p",
              image: ["data:image/png;base64,YQ=="],
              input_fidelity: "high",
              revise: false,
            },
            { context: { abortSignal: "signal" } },
          ),
        ),
        events,
      };
    }
    equal(await probe(false), await probe(true));
  }
for (const resolution of [undefined, "4K", "720P", "1080P"])
  for (const seconds of [undefined, 0, -1, "5"])
    for (const image of [undefined, "input-data"]) {
      async function probe(native: boolean) {
        const events: any[] = [],
          s = services(native, events, {
            response: { code: 0, data: { id: "task" } },
          }).video;
        return {
          result: await s.submitTask(
            "https://fixture.invalid/",
            "token",
            { prompt: "p", resolution, seconds, image, last_image: "last" },
            "model",
            "signal",
          ),
          events,
        };
      }
      equal(await probe(false), await probe(true));
    }
for (const response of [
  { code: 1, msg: "failed", requestId: "req" },
  { code: 0, data: {} },
  "throw",
]) {
  async function probe(native: boolean) {
    const events: any[] = [],
      s = services(native, events, {
        rest: {
          request: async () => {
            if (response === "throw")
              throw Object.assign(new Error("http failed"), {
                response: { status: 429, data: { msg: "quota" } },
              });
            return { data: response };
          },
        },
      }).video;
    return {
      result: await outcome(() =>
        s.submitTask("endpoint", "token", { prompt: "p" }, "model", "signal"),
      ),
      events,
    };
  }
  equal(await probe(false), await probe(true));
}
for (const ending of [
  "completed",
  "failed",
  "query-error",
  "cancelled",
  "timeout",
  "exact-limit",
]) {
  async function probe(native: boolean) {
    let time = 1000,
      calls = 0;
    class ClockDate extends FixedDate {
      static override now() {
        return time;
      }
    }
    const events: any[] = [],
      s = services(native, events, {
        Date: ClockDate,
        rest: {
          request: async (...args: any[]) => {
            events.push(args);
            calls++;
            if (ending === "query-error")
              return { data: { code: 1, msg: "failed", requestId: "req" } };
            return {
              data: {
                code: 0,
                data: {
                  status:
                    calls === 1
                      ? "pending"
                      : ending === "failed"
                        ? "failed"
                        : "completed",
                  data: [{ url: "result" }],
                },
              },
            };
          },
        },
      }).video;
    s.sleep = async (...args: any[]) => {
      events.push(["sleep", ...args]);
      time +=
        ending === "timeout"
          ? 600001
          : ending === "exact-limit"
            ? 600000
            : 5000;
    };
    return {
      result: await outcome(() =>
        s.pollTask("endpoint", "token", "task", {
          aborted: ending === "cancelled",
        }),
      ),
      events,
    };
  }
  equal(await probe(false), await probe(true));
}
const temp = await mkdtemp(path.join(tmpdir(), "media-diff-"));
try {
  for (const native of [false, true]) {
    const s = services(native, []).image;
    await s.initializeOutputDir(temp);
    const file = path.join(temp, "input.svg");
    await fs.writeFile(file, "<svg/>");
    equal(await s.processFilePath(file), "data:image/svg+xml;base64,PHN2Zy8+");
    const missing = await outcome(() =>
      s.processFilePath(path.join(temp, "missing.png")),
    );
    assert.ok("error" in missing);
    comparisons++;
  }
  for (const count of [1, 2]) {
    async function probe(native: boolean) {
      const events: any[] = [],
        all = services(native, events, {
          rest: {
            request: async (...args: any[]) => {
              events.push(args);
              return { data: Buffer.from("fixture bytes") };
            },
          },
        });
      all.image.outputDir = temp;
      all.video.outputDir = temp;
      const images = [];
      for (let i = 0; i < count; i++)
        images.push(
          await all.image.saveImage(
            i ? { url: "https://fixture.invalid/image" } : { b64_json: "YQ==" },
            "中文 /prompt",
            i,
            "signal",
          ),
        );
      const videos = await all.video.downloadVideos(
        {
          data: Array.from({ length: count }, () => ({
            url: "https://fixture.invalid/video",
          })),
        },
        "中文 /prompt",
        "signal",
      );
      return {
        images: await Promise.all(
          images.map(async (file) => [
            path.basename(file),
            (await fs.readFile(file)).toString("base64"),
          ]),
        ),
        videos: await Promise.all(
          videos.map(async (file: string) => [
            path.basename(file),
            (await fs.readFile(file)).toString("base64"),
          ]),
        ),
        events,
      };
    }
    equal(await probe(false), await probe(true));
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
const Classes = {
  ImageGen: [12001889, 12004324, ImageGenTool, gen],
  ImageEdit: [12021234, 12023170, ImageEditTool, edit],
  VideoGen: [12033776, 12035596, VideoGenTool, video],
} as const;
for (const name of ["ImageGen", "ImageEdit", "VideoGen"] as const)
  for (const env of [undefined, "", "0", "false", "true", "1", "TRUE"])
    for (const feature of [false, true])
      for (const hasModels of [false, true]) {
        async function probe(native: boolean) {
          const [start, end, After, parameters] = Classes[name],
            runtime = createMediaRuntime({
              getWorkDir: () => "/work",
              configuration: async () => ({
                productFeatures: { [name]: feature },
              }),
              env:
                env === undefined
                  ? {}
                  : {
                      [`CODEBUDDY_${name === "VideoGen" ? "VIDEO_GEN" : name === "ImageEdit" ? "IMAGE_EDIT" : "IMAGE_GEN"}_ENABLED`]:
                        env,
                    },
            }),
            image = { getModelsByTag: () => (hasModels ? [{}] : []) },
            tool = native
              ? Object.assign(
                  new (evaluate(`(${source.slice(start, end)})`, {
                    iz: { BaseTool: class {} },
                    nC: media,
                    iq: media,
                    nq: {
                      ProductFeature: {
                        ImageGen: "ImageGen",
                        ImageEdit: "ImageEdit",
                        VideoGen: "VideoGen",
                      },
                    },
                    cC: parameters,
                    cS: parameters,
                    cT: parameters,
                    process: { env: runtime.env },
                  }))(),
                  {
                    productManager: {
                      waitConfiguration: runtime.configuration,
                    },
                    imageService: image,
                  },
                )
              : new After(runtime, image);
          return {
            enabled: await tool.isEnabled({}),
            description: tool.description,
            name: tool.name,
          };
        }
        equal(await probe(false), await probe(true));
      }
for (const name of ["ImageGen", "ImageEdit", "VideoGen"] as const)
  for (const input of [
    { prompt: "" },
    { prompt: "p" },
    { prompt: "p", image: "image" },
    { prompt: "p", image: ["a", "b"] },
    { prompt: "p", image: ["a", ""] },
    { prompt: "p", last_image: "last" },
  ])
    for (const result of [[], ["/one"], ["/one", "/two"], "throw"]) {
      async function probe(native: boolean) {
        const events: any[] = [],
          log = logger(events),
          runtime = createMediaRuntime({
            getWorkDir: () => "/work",
            configuration: async () => ({}),
            logger: log as any,
            createFileHyperlink: (file) => `link:${file}`,
          }),
          image: any = {
            initializeOutputDir: async (...args: any[]) =>
              events.push(["image-dir", ...args]),
            getModelsByTag: () => [{}],
            processImageInput: async (...args: any[]) => {
              events.push(["input", ...args]);
              return "processed";
            },
            generateImage: async (...args: any[]) => {
              events.push(["generate", ...args]);
              if (result === "throw") throw Error("failed");
              return result;
            },
            editImage: async (...args: any[]) => {
              events.push(["edit", ...args]);
              if (result === "throw") throw Error("failed");
              return result;
            },
            extractErrorMessage: (error: any) => error.message,
          },
          videoService: any = {
            initializeOutputDir: async (...args: any[]) =>
              events.push(["video-dir", ...args]),
            generateVideo: async (...args: any[]) => {
              events.push(["video", ...args]);
              if (result === "throw") throw Error("failed");
              return result;
            },
          },
          [start, end, After, parameters] = Classes[name],
          tool = native
            ? Object.assign(
                new (evaluate(`(${source.slice(start, end)})`, {
                  iz: { BaseTool: class {} },
                  nC: media,
                  cC: parameters,
                  cS: parameters,
                  cT: parameters,
                  nW: {
                    AnsiUtils: {
                      createFileHyperlink: runtime.createFileHyperlink,
                    },
                  },
                }))(),
                {
                  logger: log,
                  imageService: image,
                  videoService,
                  productManager: { waitConfiguration: runtime.configuration },
                },
              )
            : new After(runtime, image, videoService);
        return {
          result: await outcome(() =>
            tool.execute(input, { context: { abortSignal: "signal" } }),
          ),
          events,
        };
      }
      equal(await probe(false), await probe(true));
    }
const hookStart = source.indexOf(
    "let aT=class{constructor(){this.priority=100}",
    8506000,
  ),
  hookEnd = source.indexOf(
    ";image_tool_hook_input_processor_decorate",
    hookStart,
  );
for (const event of ["PreToolUse", "PostToolUse"])
  for (const name of ["ImageGen", "ImageEdit", "VideoGen"])
    for (const failure of [false, true]) {
      async function probe(native: boolean) {
        const events: any[] = [],
          image = {
            resolveModel: async (...args: any[]) => {
              events.push(args);
              if (failure) throw Error("failed");
              return "model";
            },
          },
          log = logger(events),
          After = ImageToolHookInputProcessor,
          tool = native
            ? Object.assign(
                new (evaluate(`(${source.slice(hookStart + 7, hookEnd)})`, {
                  oH: { HookEvent: { POST_TOOL_USE: "PostToolUse" } },
                  aD: media,
                }))(),
                { imageService: image, logger: log },
              )
            : new After(image, log as any),
          input = {
            tool_name: name,
            tool_input: { image: ["image"] },
            session: null,
          };
        await tool.process(input, event);
        return { input, events, priority: tool.priority };
      }
      equal(await probe(false), await probe(true));
    }
console.log(
  `Media differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`,
);
