import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  rm,
  writeFile,
  readFile,
  mkdir,
  copyFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { once } from "node:events";
import Jimp from "jimp";
import { setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { createImageCodecRuntime } from "../src/images/image-codec-runtime.js";
import { createNativeImageUtils } from "../src/images/native-image-utils.js";
import { NativeReadImageTool } from "../src/images/native-read-image-tool.js";
import { ReadImageErrorCode } from "../src/images/read-image-runtime.js";
import { getCurrentImageModel } from "../src/images/current-image-model.js";
import { CoreFileTools } from "../src/tools/core-file-tools.js";
import { createBlobRuntime } from "../src/blobs/blob-runtime.js";
import { BlobStoreImpl } from "../src/blobs/blob-store-impl.js";
import { ImageBlobServiceImpl } from "../src/blobs/image-blob-service-impl.js";
import { HarnessSession } from "../src/sessions/session.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
async function owned(t: any) {
  const dir = await mkdtemp(join(tmpdir(), "harness-image-codec-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
async function png(w = 12, h = 6) {
  return new Jimp(w, h, 0x2288ccff).getBufferAsync(Jimp.MIME_PNG);
}
const uri = (bytes: Buffer, mime = "image/png") =>
  "data:" + mime + ";base64," + bytes.toString("base64");
function core(dir: string, options: any = {}) {
  const runtime = createBlobRuntime(dir, join(dir, "sessions"), { env: {} }),
    store = new BlobStoreImpl(runtime),
    blob = new ImageBlobServiceImpl(runtime, { blobStore: store });
  store.init();
  blob.init();
  return {
    blob,
    tool: new CoreFileTools({
      workDir: dir,
      imageBlobService: blob,
      ...options,
    }),
  };
}
test("native compression profiles preserve env parsing, zero bypass and unsupported fallback warning", () => {
  const warnings: string[] = [],
    env: NodeJS.ProcessEnv = {},
    utils = createNativeImageUtils(
      createImageCodecRuntime({
        env,
        logger: { warn: (s) => warnings.push(s) },
      }),
    );
  assert.deepEqual(utils.getSupportedCompressionDimensions(), [0, 1080, 2000]);
  env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION = "0";
  assert.equal(utils.getCurrentImageCompressionProfile(), undefined);
  env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION = "1080junk";
  assert.equal(utils.getCurrentImageCompressionProfile().maxRawBytes, 384000);
  env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION = "42";
  assert.equal(utils.getCurrentImageCompressionProfile().maxDimension, 2000);
  assert.match(warnings[0]!, /Supported values: 0, 1080, 2000/);
  env.CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION = "-1";
  assert.equal(utils.getImageCompressionMaxDimension(), 2000);
});
test("real PNG resize and mislabeled MIME preserve original data URI behavior", async () => {
  const utils = createNativeImageUtils(),
    bytes = await png(1500, 750),
    result = await utils.compressUserImage(uri(bytes), 1080),
    decoded = await Jimp.read(Buffer.from(result.split(",")[1]!, "base64"));
  assert.equal(decoded.bitmap.width, 1080);
  assert.equal(decoded.bitmap.height, 540);
  assert.match(result, /^data:image\/png;/);
  assert.equal(
    await utils.compressImage(uri(bytes, "image/jpeg"), 2000),
    uri(bytes),
  );
  assert.equal(await utils.compressUserImage(uri(bytes), 0), uri(bytes));
});
test("real high-entropy image follows native quality fallbacks to profile size limits", async () => {
  const utils = createNativeImageUtils(),
    image = new Jimp(512, 512);
  let state = 42;
  for (let i = 0; i < image.bitmap.data.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    image.bitmap.data[i] = state >>> 24;
  }
  const input = uri(await image.getBufferAsync(Jimp.MIME_PNG));
  assert.ok(input.length > 512000);
  const output = await utils.compressUserImage(input, 1080);
  assert.match(output, /^data:image\/jpeg;/);
  assert.ok(
    utils.isWithinProfileSizeLimit(
      output.split(",")[1],
      utils.getCurrentImageCompressionProfile(1080),
    ),
  );
  assert.equal(
    (await Jimp.read(Buffer.from(output.split(",")[1]!, "base64"))).bitmap
      .width,
    512,
  );
});
test("decode failures retain warning/throwOnFailure and resolution-limit omission distinctions", async () => {
  const logger = { warn(_message: string) {} },
    utils = createNativeImageUtils(createImageCodecRuntime({ logger })),
    bad = "data:image/png;base64,bm90LWFuLWltYWdl";
  assert.equal(await utils.compressImage(bad), bad);
  await assert.rejects(
    utils.compressImage(bad, 1080, { throwOnFailure: true }),
  );
  assert.equal(await utils.compressUserImage(bad, 1080), bad);
  const limited = createNativeImageUtils(
    createImageCodecRuntime({
      codec: {
        async read() {
          throw Error("maxResolutionInMP limit exceeded");
        },
      },
      logger,
    }),
  );
  assert.equal(await limited.compressUserImage(bad, 1080), "");
});
test("Read default image path records original blob, compresses, suppresses repeated and copied images", async (t) => {
  const dir = await owned(t),
    file = join(dir, "own.png"),
    other = join(dir, "copy.png"),
    bytes = await png(1500, 750);
  await writeFile(file, bytes);
  await copyFile(file, other);
  const imageUtils = createNativeImageUtils(
      createImageCodecRuntime({
        env: { CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION: "1080" },
      }),
    ),
    { blob, tool } = core(dir, { imageUtils }),
    session = new HarnessSession("s");
  const first = await tool.read({ file_path: file }, session);
  assert.match(first.title!, /compressed/);
  const decoded = await Jimp.read(
    Buffer.from(
      JSON.parse(first.content as string)[0].image_url.url.split(",")[1],
      "base64",
    ),
  );
  assert.equal(decoded.bitmap.width, 1080);
  assert.match(
    (await tool.read({ file_path: file }, session)).content as string,
    /^\[Image unchanged\]/,
  );
  assert.match(
    (await tool.read({ file_path: other }, session)).content as string,
    /^\[Image reference\]/,
  );
  assert.equal(blob.deliveredImages.get(file), blob.deliveredImages.get(other));
  assert.ok(session.conditionalRules.pendingTriggers.has(file));
  assert.ok(tool.readFileState.hasBeenRead(file));
});
test("changed source is new again and a failed first compression still populates native dedup tracking", async (t) => {
  const dir = await owned(t),
    file = join(dir, "own.png");
  await writeFile(file, await png());
  const utils = createNativeImageUtils(),
    { tool } = core(dir, { imageUtils: utils });
  const original = utils.compressUserImage;
  utils.compressUserImage = async () => "";
  const omitted = await tool.read({ file_path: file });
  assert.equal(omitted.rawResponse?.tool_error_code, "1011");
  assert.match(
    (await tool.read({ file_path: file })).content as string,
    /Image unchanged/,
  );
  utils.compressUserImage = original;
  await writeFile(file, await png(13, 7));
  assert.match(
    (await tool.read({ file_path: file })).content as string,
    /image_url/,
  );
});
test("Read model and binary gates replace extension-only image dispatch", async (t) => {
  const dir = await owned(t),
    file = join(dir, "own.png"),
    text = join(dir, "text.png");
  await writeFile(file, await png());
  await writeFile(text, "ordinary text");
  const { tool } = core(dir, {
    getCurrentModel: async () => ({ id: "no-images", supportsImages: false }),
  });
  const denied = await tool.read({ file_path: file });
  assert.equal(denied.rawResponse?.tool_error_code, "1010");
  assert.equal(
    denied.error,
    "Current model (no-images) does not support reading images",
  );
  const plain = await tool.read({ file_path: text });
  assert.match(plain.content as string, /ordinary text/);
  assert.match(plain.title!, /lines/);
});
test("Read image helper retains numeric codes and catches blob storage failure without losing content", async (t) => {
  const dir = await owned(t),
    file = join(dir, "own.png");
  await writeFile(file, await png());
  const { tool } = core(dir, {
    imageBlobService: {
      async storeFromFile() {
        throw Error("owned store failure");
      },
    },
  });
  assert.match(
    (await tool.read({ file_path: file })).content as string,
    /image_url/,
  );
  await assert.rejects(
    tool.imageTool.readImageFile(join(dir, "missing.png")),
    (error: any) =>
      error.toolErrorCode === ReadImageErrorCode.ReadFileNotFoundError,
  );
  const folder = join(dir, "folder.png");
  await mkdir(folder);
  await assert.rejects(
    tool.imageTool.readImageFile(folder),
    (error: any) => error.toolErrorCode === "1003",
  );
});
test("model-specific formats and current model resolver retain native name/id-only lookup", async () => {
  const utils = createNativeImageUtils();
  assert.equal(
    utils.isImageSupportedByModel("/owned/own.bmp", "gemini-2"),
    true,
  );
  assert.equal(utils.isImageSupportedByModel("own.bmp", "gemini-2"), false);
  assert.equal(utils.isImageSupportedByModel("bmp", "gemini-2"), true);
  assert.equal(utils.isImageSupportedByModel("own.bmp", "gpt-5"), false);
  assert.equal(utils.isImageSupportedByModel("own.svg", "gemini-2"), false);
  const agents = {
    async getDefault() {
      return { name: "cli" };
    },
    async getModel() {
      return { id: "fallback" };
    },
    async getModels() {
      return [
        {
          id: "known",
          name: "Known",
          aliases: ["alias"],
          supportsImages: false,
        },
      ];
    },
  };
  assert.equal(
    (
      await getCurrentImageModel(agents, {
        id: "s",
        options: { model: "Known" },
      })
    ).supportsImages,
    false,
  );
  assert.deepEqual(
    await getCurrentImageModel(agents, {
      id: "s",
      options: { model: "alias" },
    }),
    { id: "alias", name: "alias" },
  );
});
test("default input interceptor uses actual codec before real SDK model request", async (t) => {
  const dir = await owned(t),
    requests: any[] = [],
    bytes = await png(1500, 750),
    model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse(request) {
        requests.push(request);
        yield { type: "response_started" };
        yield {
          type: "response_done",
          response: {
            id: "owned",
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            output: [
              {
                id: "answer",
                type: "message",
                role: "assistant",
                status: "completed",
                content: [{ type: "output_text", text: "done" }],
              },
            ],
          },
        } as any;
      },
    };
  const h = await createHarness({
    workDir: dir,
    modelProvider: { getModel: () => model },
    imageCodec: {
      env: { CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION: "1080" },
    },
  });
  t.after(() => h.close());
  for (const model of h.product.raw.models) model.supportsImages = true;
  const s = await h.openSession();
  assert.equal(
    await h.prompt(s, [
      {
        type: "message",
        role: "user",
        content: [{ type: "input_image", image: uri(bytes) }],
      },
    ] as any),
    "done",
  );
  const image = requests[0].input
    .flatMap((i: any) => (Array.isArray(i.content) ? i.content : []))
    .find((part: any) => part.type === "input_image");
  assert.equal(
    (await Jimp.read(Buffer.from(image.image.split(",")[1], "base64"))).bitmap
      .width,
    1080,
  );
});
test("real SDK and loopback HTTP carry compressed Read image then unchanged/duplicate text", async (t) => {
  const dir = await owned(t),
    file = join(dir, "own.png"),
    copy = join(dir, "copy.png"),
    bytes = await png(1500, 750);
  await writeFile(file, bytes);
  await copyFile(file, copy);
  const requests: any[] = [],
    server = createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      requests.push(JSON.parse(Buffer.concat(chunks).toString()));
      const n = requests.length;
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      const delta =
        n <= 3
          ? {
              tool_calls: [
                {
                  index: 0,
                  id: "own-call-" + n,
                  type: "function",
                  function: {
                    name: "Read",
                    arguments: JSON.stringify({
                      file_path: n === 3 ? copy : file,
                    }),
                  },
                },
              ],
            }
          : { content: "done" };
      res.write(
        "data: " +
          JSON.stringify({
            id: "owned-" + n,
            object: "chat.completion.chunk",
            choices: [{ index: 0, delta, finish_reason: null }],
          }) +
          "\n\n",
      );
      res.write(
        "data: " +
          JSON.stringify({
            id: "owned-" + n,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: n <= 3 ? "tool_calls" : "stop",
              },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          }) +
          "\n\n",
      );
      res.end("data: [DONE]\n\n");
    });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  });
  const port = (server.address() as any).port,
    h = await createHarness({
      workDir: dir,
      baseURL: `http://127.0.0.1:${port}/v1`,
      apiKey: "owned-fixture",
      model: "offline-image",
      approveTool: () => true,
      imageCodec: {
        env: { CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION: "1080" },
      },
    });
  t.after(() => h.close());
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "read own image repeatedly"), "done");
  assert.equal(requests.length, 4);
  const first = requests[1].messages.findLast((m: any) => m.role === "tool");
  assert.equal(first.content[0].type, "image_url");
  assert.equal(
    (
      await Jimp.read(
        Buffer.from(first.content[0].image_url.url.split(",")[1], "base64"),
      )
    ).bitmap.width,
    1080,
  );
  assert.match(
    JSON.stringify(requests[2].messages.at(-1).content),
    /Image unchanged/,
  );
  assert.match(
    JSON.stringify(requests[3].messages.at(-1).content),
    /Image reference/,
  );
  const transcript = await readFile(
    h.store.getSessionFilePath(session.id),
    "utf8",
  );
  assert.match(transcript, /image_blob_ref/);
  const saved = transcript
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line))
    .find(
      (item) =>
        item.type === "function_call_result" && item.callId === "own-call-1",
    );
  assert.doesNotMatch(saved.output.text, /data:image\/png;base64/);
  const ref = JSON.parse(saved.output.text)[0];
  assert.deepEqual(
    await readFile(ref.blob_path),
    Buffer.from(first.content[0].image_url.url.split(",")[1], "base64"),
  );
  // Original SessionStore does not rewrite string-valued toolResult.content.
  assert.equal(
    JSON.parse(saved.providerData.toolResult.content)[0].image_url.url,
    first.content[0].image_url.url,
  );
  assert.equal(session.conditionalRules.pendingTriggers.has(copy),false,
    "native post-tool conditional-rule consume clears pending Read triggers");
});
