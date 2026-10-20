import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import * as path from "node:path";
import { runInNewContext } from "node:vm";
import Jimp from "jimp";
import { loadCapturedImageModule } from "./helpers/captured-image-module.js";
import { createNativeImageUtils } from "../src/images/native-image-utils.js";
import { createImageCodecRuntime } from "../src/images/image-codec-runtime.js";
import { NativeReadImageTool } from "../src/images/native-read-image-tool.js";
import {
  ReadImageExecutionError,
  ReadImageErrorCode,
} from "../src/images/read-image-runtime.js";
import { getCurrentImageModel } from "../src/images/current-image-model.js";
const source = await readFile(
    process.argv[2] ??
      new URL(
        "../../../work/workbuddy-app/cli/dist/codebuddy.js",
        import.meta.url,
      ),
    "utf8",
  ),
  env: NodeJS.ProcessEnv = {},
  original = loadCapturedImageModule(source, env),
  logs: any[] = [],
  port = createNativeImageUtils(
    createImageCodecRuntime({
      env,
      logger: { warn: (...args: any[]) => logs.push(["warn", ...args]) },
    }),
  );
let comparisons = 0;
function norm(value: any): any {
  if (value === undefined) return "[undefined]";
  if (typeof value === "string" && value.length > 1000)
    return {
      length: value.length,
      sha256: createHash("sha256").update(value).digest("hex"),
    };
  if (Object.prototype.toString.call(value) === "[object Error]")
    return {
      name: value.name,
      message: value.name === "TypeError" ? "[TypeError]" : value.message,
      toolErrorCode: value.toolErrorCode,
    };
  if (ArrayBuffer.isView(value))
    return {
      length: (value as any).length,
      sha256: createHash("sha256")
        .update(Buffer.from(value as any))
        .digest("hex"),
    };
  if (Array.isArray(value)) return Array.from(value, norm);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, norm(value[k])]),
    );
  return value;
}
function eq(a: any, b: any, label: string) {
  assert.deepEqual(norm(a), norm(b), label);
  comparisons++;
}
async function outcome(fn: () => any) {
  try {
    return { value: await fn() };
  } catch (error) {
    return { error };
  }
}
async function compare(method: string, args: any[]) {
  logs.length = 0;
  original.events.length = 0;
  const actual = await outcome(() => (port as any)[method](...args));
  const expected = await outcome(() => original.ImageUtils[method](...args));
  if (
    [
      "compressImage",
      "compressUserImage",
      "convertToJpeg",
      "recompressImage",
    ].includes(method) &&
    typeof actual.value === "string" &&
    typeof expected.value === "string"
  )
    assert.equal(actual.value, expected.value, method + " exact encoded bytes");
  eq(actual, expected, method);
  eq(logs, original.events, method + " warnings");
}
eq(
  Object.getOwnPropertyNames(port)
    .filter((k) => !["name", "length", "prototype"].includes(k))
    .sort(),
  Object.getOwnPropertyNames(original.ImageUtils)
    .filter((k) => !["name", "length", "prototype"].includes(k))
    .sort(),
  "entire ImageUtils public surface",
);
for (const key of [
  "IMAGE_MIME_TYPE_MAP",
  "MODEL_SUPPORTED_FORMATS",
  "IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER",
])
  eq((port as any)[key], original.ImageUtils[key], key);
for (const setting of [
  undefined,
  "",
  "0",
  "-1",
  "1080",
  "2000",
  "42",
  "1.5",
  "Infinity",
  "abc",
  " 1080xyz",
]) {
  if (setting === undefined)
    delete env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION;
  else env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION = setting;
  await compare("getImageCompressionMaxDimension", []);
  await compare("getCurrentImageCompressionProfile", []);
}
for (const dimension of [undefined, 0, 1080, 2000, 42, -1, NaN, Infinity]) {
  await compare("getCurrentImageCompressionProfile", [dimension]);
  await compare("getSupportedCompressionDimensions", []);
}
for (const value of [
  "PNG",
  ".PNG",
  "own.JPG",
  "/owned/a.jpg",
  "image.avif",
  "image.svg",
  "image.bmp",
  "unknown",
  "",
])
  for (const method of [
    "getImageMimeType",
    "getImageMimeTypeSync",
    "isSupportedImageFormat",
  ])
    await compare(method, [value]);
for (const model of [
  undefined,
  "claude-4",
  "gpt-5",
  "gemini-2",
  "Gemini-2",
  "custom",
])
  for (const image of [
    "png",
    ".jpg",
    "own.webp",
    "/owned/a.bmp",
    "a.svg",
    "avif",
  ]) {
    await compare("getSupportedImageFormats", [model]);
    await compare("isImageSupportedByModel", [image, model]);
  }
for (const value of [
  "",
  null,
  undefined,
  "data:image/jpeg;base64,b3du",
  "b3du",
  "data:application/octet-stream,x",
])
  for (const method of [
    "detectMimeFromBase64",
    "getBase64FromDataUrl",
    "getRawBytesFromBase64",
  ])
    await compare(method, [value]);
for (const size of [0, 1, 512000, 512001, 5242880, 5242881])
  for (const dimension of [1080, 2000]) {
    const profile = port.getCurrentImageCompressionProfile(dimension),
      text = "a".repeat(size);
    await compare("isWithinProfileSizeLimit", [text, profile]);
    await compare("shouldOmitAfterCompressionFailure", [
      "data:image/png;base64," + text,
      profile,
    ]);
  }
for (const error of [
  Error("maxResolutionInMP 100 exceeded"),
  Error("resolution foo limit"),
  Error("decode failed"),
  "bad",
  null,
]) {
  await compare("isJimpResolutionLimitError", [error]);
  await compare("shouldOmitAfterCompressionFailure", [
    "data:image/png;base64,YQ==",
    port.getCurrentImageCompressionProfile(1080),
    error,
  ]);
}
delete env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION;
// Actual original bundled Jimp graph versus separately installed exact Jimp 0.22.12.
const samples: string[] = [];
for (const [w, h] of [
  [1, 1],
  [8, 4],
  [31, 15],
  [2001, 2],
  [4001, 1],
]) {
  const image = new Jimp(w!, h!, 0x123456ff);
  image.scan(0, 0, w!, h!, function (x, y, index) {
    this.bitmap.data[index] = (x * 37 + y * 19) & 255;
    this.bitmap.data[index + 1] = (x * 11 + y * 23) & 255;
    this.bitmap.data[index + 2] = (x * 7 + y * 17) & 255;
    this.bitmap.data[index + 3] = (x + y) % 3 ? 255 : 128;
  });
  for (const mime of [Jimp.MIME_PNG, Jimp.MIME_JPEG, Jimp.MIME_BMP])
    samples.push(
      "data:" +
        mime +
        ";base64," +
        (await image.getBufferAsync(mime)).toString("base64"),
    );
}
for (const sample of samples) {
  for (const dimension of [1, 4, 1080, 2000])
    await compare("compressImage", [sample, dimension]);
  for (const dimension of [0, 1080, 2000])
    await compare("compressUserImage", [sample, dimension]);
  await compare("convertToJpeg", [sample, 70]);
  await compare("recompressImage", [sample, Jimp.MIME_JPEG, 40]);
}
for (const sample of [
  "invalid",
  "data:image/png;base64,bm90LWFuLWltYWdl",
  "data:image/svg+xml;base64,PHN2Zz4=",
  "data:image/png;base64,YQ==\n",
]) {
  await compare("compressImage", [sample, 1080]);
  await compare("compressUserImage", [sample, 1080]);
  await compare("convertToJpeg", [sample]);
}
// Real high-entropy image exercises profile quality fallbacks, not only resizing.
const noise = new Jimp(512, 512);
let random = 12345;
for (let i = 0; i < noise.bitmap.data.length; i++) {
  random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
  noise.bitmap.data[i] = random >>> 24;
}
const noisy =
  "data:image/png;base64," +
  (await noise.getBufferAsync(Jimp.MIME_PNG)).toString("base64");
assert.ok(noisy.length > 512000);
await compare("compressUserImage", [noisy, 1080]);
// Instrumented codec isolates exact ordering/failure/quality-loop paths.
function fakeImageUtils(native: boolean, config: any) {
  const events: any[] = [],
    warnings: any[] = [];
  const codec: any = {
    MIME_JPEG: "image/jpeg",
    async read(buffer: Buffer) {
      events.push(["read", buffer.length]);
      if (config.readError) throw Error(config.readError);
      return {
        bitmap: { width: 3000, height: 1500 },
        getMIME() {
          return config.mime ?? "image/png";
        },
        resize(w: number, h: number) {
          events.push(["resize", w, h]);
          return this;
        },
        quality(q: number) {
          events.push(["quality", q]);
          return this;
        },
        async getBufferAsync(mime: string) {
          events.push(["buffer", mime]);
          if (config.bufferError) throw Error("encode failed");
          return Buffer.alloc(config.large ? 400000 : 8);
        },
      };
    },
  };
  let utils: any;
  if (native) {
    const constants = source
      .slice(
        source.indexOf(
          'tU="CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION"',
          13202000,
        ),
        13202774,
      )
      .replace(/^tU=/, "const tU=")
      .replace(/;let ImageUtils=$/, ";");
    utils = runInNewContext(
      `(()=>{${constants}const ImageUtils=(${source.slice(13202774, 13208907)});ImageUtils.IMAGE_MIME_TYPE_MAP={};ImageUtils.MODEL_SUPPORTED_FORMATS={};return ImageUtils})()`,
      {
        tF: codec,
        process: { env: {} },
        ep: {
          ContainerUtil: {
            get: () => ({ warn: (...args: any[]) => warnings.push(args) }),
          },
          Logger: Symbol(),
        },
        ef: path,
        Buffer,
        Error,
        JSON,
      },
    );
  } else
    utils = createNativeImageUtils(
      createImageCodecRuntime({
        codec,
        env: {},
        logger: { warn: (...args: any[]) => warnings.push(args) },
      }),
    );
  return { utils, events, warnings };
}
for (const config of [
  {},
  { large: true },
  { mime: "image/jpeg", large: true },
  { readError: "maxResolutionInMP exceeded" },
  { readError: "bad decoder" },
  { bufferError: true },
])
  for (const method of [
    "compressImage",
    "compressUserImage",
    "compressToProfileLimit",
  ]) {
    const a = fakeImageUtils(false, config),
      b = fakeImageUtils(true, config),
      input = "data:image/png;base64," + "a".repeat(512004),
      arg =
        method === "compressToProfileLimit"
          ? port.getCurrentImageCompressionProfile(1080)
          : 1080;
    eq(
      await outcome(() => a.utils[method](input, arg)),
      await outcome(() => b.utils[method](input, arg)),
      method + " fake result",
    );
    eq(a.events, b.events, method + " fake codec order");
    eq(a.warnings, b.warnings, method + " fake warnings");
  }
const readStart = source.indexOf("async isImageFile(eA,el){", 11688800),
  readEnd = source.indexOf("};read_tool_decorate", readStart),
  format = source.match(
    /formatFileSize=(function\(eA\)[^]*?),eA.isBinaryFile=/,
  )![1],
  nativeFormat = runInNewContext("(" + format + ")");
function readFixture(native: boolean, config: any) {
  const events: any[] = [],
    bytes = Buffer.from("owned"),
    runtime: any = {
      fs: {
        async access(file: any) {
          events.push(["access", file]);
          if (config.error)
            throw Object.assign(Error("owned error"), { code: config.error });
        },
        async stat() {
          return { size: 5, isFile: () => !config.directory };
        },
        async readFile() {
          events.push(["read"]);
          return bytes;
        },
      },
      imageUtils: {
        isImageSupportedByModel: (file: any, id: any) => {
          events.push(["supported", file, id]);
          return !config.unsupported;
        },
        async getImageMimeTypeAsync() {
          return "image/png";
        },
        async compressUserImage(input: any, dimension: any) {
          events.push(["compress", dimension]);
          return config.omit ? "" : input;
        },
        IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER:
          "[Image too large — omitted after compression]",
      },
      async getCurrentModel() {
        events.push(["model"]);
        if (config.modelError) throw Error("model");
        return { id: "own-model" };
      },
      async isBinaryFile() {
        events.push(["binary"]);
        return !config.text;
      },
      async buildDirectoryErrorMessage() {
        return "owned directory";
      },
    };
  const blob = {
    async storeFromFile() {
      events.push(["store"]);
      if (config.blobError) throw Error("blob");
      return {
        blob_id: "own",
        mime: "image/png",
        size: 5,
        source: "/owned/a.png",
      };
    },
    trackImageDelivered() {
      events.push(["track"]);
      return config.tracking ?? "new";
    },
  };
  const state = {
      readFile() {
        events.push(["read-state"]);
      },
    },
    logger = Object.fromEntries(
      ["warn", "info"].map((key) => [
        key,
        (...args: any[]) => events.push([key, ...args]),
      ]),
    );
  let instance: any;
  if (native) {
    const Native = runInNewContext(
      "(class{" + source.slice(readStart, readEnd) + "})",
      {
        ok: runtime.fs,
        nW: {
          ImageUtils: runtime.imageUtils,
          ModelUtils: { getCurrentModel: runtime.getCurrentModel },
          FileUtils: {
            formatFileSize: nativeFormat,
            isBinaryFile: runtime.isBinaryFile,
          },
          ThemeUtils: { chalk: { primary: String } },
        },
        n8: () => path,
        nC: { ToolExecutionError: ReadImageExecutionError },
        o3: { ToolErrorCode: ReadImageErrorCode },
        buildDirectoryErrorMessage: runtime.buildDirectoryErrorMessage,
        Buffer,
        Error,
        JSON,
      },
    );
    instance = new Native();
    Object.assign(instance, {
      imageBlobService: blob,
      readFileStateService: state,
      logger,
    });
  } else
    instance = new NativeReadImageTool({
      runtime,
      imageBlobService: blob,
      readFileStateService: state,
      logger,
    });
  return { instance, events };
}
for (const config of [
  {},
  { tracking: "unchanged" },
  { tracking: "duplicate" },
  { blobError: true },
  { omit: true },
  { directory: true },
  { error: "ENOENT" },
  { error: "EACCES" },
  { modelError: true },
  { unsupported: true },
  { text: true },
])
  for (const dimension of [0, 1080]) {
    const a = readFixture(false, config),
      b = readFixture(true, config);
    eq(
      await outcome(() => a.instance.isImageFile("/owned/a.png", {})),
      await outcome(() => b.instance.isImageFile("/owned/a.png", {})),
      "Read image predicate",
    );
    eq(
      await outcome(() => a.instance.readImageFile("/owned/a.png", dimension)),
      await outcome(() => b.instance.readImageFile("/owned/a.png", dimension)),
      "Read image body",
    );
    eq(a.events, b.events, "Read image I/O/order");
  }
const modelStart = source.indexOf("static async getCurrentModel(eA){"),
  modelEnd = source.indexOf("static validateMaxTokens(", modelStart),
  NativeModel = runInNewContext(
    "(class{" + source.slice(modelStart, modelEnd) + "})",
    {
      eu: {
        ContainerUtil: {
          get: (token: any) =>
            token === "agents" ? modelServices : loggerServices,
        },
      },
      ep: { AgentManager: "agents" },
      ed: { Logger: "logger" },
    },
  );
let modelEvents: any[] = [],
  modelServices: any,
  loggerServices: any;
for (const session of [
  undefined,
  { id: "s", options: {} },
  { id: "s", options: { model: "Model name" } },
  { id: "s", requestOptions: { model: "alias" }, options: { model: "known" } },
  { id: "s", options: { model: "unknown" } },
]) {
  async function run(native: boolean) {
    modelEvents = [];
    modelServices = {
      async getDefault() {
        modelEvents.push("default");
        return { name: "cli" };
      },
      async getModel() {
        modelEvents.push("model");
        return { id: "fallback" };
      },
      async getModels() {
        modelEvents.push("models");
        return [{ id: "known", name: "Model name" }];
      },
    };
    loggerServices = Object.fromEntries(
      ["info", "debug", "warn"].map((key) => [
        key,
        (...args: any[]) => modelEvents.push([key, ...args]),
      ]),
    );
    return {
      value: await (native
        ? NativeModel.getCurrentModel(session)
        : getCurrentImageModel(modelServices, session, loggerServices)),
      events: [...modelEvents],
    };
  }
  eq(await run(false), await run(true), "ModelUtils current model");
}
console.log(
  `Image codec/Read differential passed: ${comparisons} comparisons; fixed SHA-256; original ImageUtils/Jimp graph (${original.loadedModules.length} modules), real encoded bytes and Read/model methods; no external image/file/network input.`,
);
