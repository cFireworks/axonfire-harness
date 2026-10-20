import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  rm,
  access,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { createBlobRuntime } from "../src/blobs/blob-runtime.js";
import { BlobStoreImpl } from "../src/blobs/blob-store-impl.js";
import { ImageBlobServiceImpl } from "../src/blobs/image-blob-service-impl.js";
import { ToolResultBlobServiceImpl } from "../src/blobs/tool-result-blob-service-impl.js";
import { BlobPathUtils, formatBlobFileSize } from "../src/blobs/blob-utils.js";
import { SessionStore } from "../src/sessions/session-store.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
async function owned(t: any) {
  const dir = await mkdtemp(join(tmpdir(), "harness-blobs-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
function services(dir: string, env: NodeJS.ProcessEnv = {}) {
  const runtime = createBlobRuntime(dir, join(dir, "sessions"), { env }),
    store = new BlobStoreImpl(runtime),
    image = new ImageBlobServiceImpl(runtime, { blobStore: store }),
    tool = new ToolResultBlobServiceImpl(runtime);
  store.init();
  image.init();
  tool.init();
  return { runtime, store, image, tool };
}
const message = (id: string, content: any[]): any => ({
  id,
  type: "message",
  role: "user",
  content,
});
test("real blob store hashes decoded bytes, preserves native layout and deduplicates same MIME", async (t) => {
  const dir = await owned(t),
    { store } = services(dir),
    bytes = Buffer.from("owned bytes"),
    id = createHash("sha256").update(bytes).digest("hex");
  const ref = await store.store(
    bytes.toString("base64"),
    "image/png",
    "source",
    "own.png",
  );
  assert.equal(ref.blob_id, id);
  assert.equal(ref.blob_path, join(dir, "blobs", id.slice(0, 2), id + ".png"));
  assert.deepEqual(await readFile(ref.blob_path), bytes);
  await store.store(bytes.toString("base64"), "image/png");
  assert.equal((await readdir(dirname(ref.blob_path))).length, 1);
  assert.equal(await store.read(id, "image/png"), bytes.toString("base64"));
  assert.equal(await store.exists(id, "image/jpeg"), false);
  const jpeg = await store.store(bytes.toString("base64"), "image/jpeg");
  assert.equal(jpeg.blob_id, id);
  assert.notEqual(jpeg.blob_path, ref.blob_path);
});
test("existing corrupt bytes are not verified or rewritten, as in original store", async (t) => {
  const dir = await owned(t),
    { store } = services(dir),
    input = Buffer.from("owned"),
    ref = await store.store(input.toString("base64"), "image/png");
  await writeFile(ref.blob_path, "corrupt");
  const next = await store.store(input.toString("base64"), "image/png");
  assert.equal(next.size, 5);
  assert.equal(
    await store.read(ref.blob_id, "image/png"),
    Buffer.from("corrupt").toString("base64"),
  );
  assert.equal(await store.read("missing", "image/png"), undefined);
});
test("data URI grammar and MIME detection retain original error and magic-byte behavior", async (t) => {
  const dir = await owned(t),
    { image } = services(dir);
  await assert.rejects(
    image.storeFromDataUri("data:image/png;base64,"),
    /Invalid data URI format/,
  );
  await assert.rejects(
    image.storeFromDataUri("data:image/png;charset=utf8;base64,b3du"),
    /Invalid data URI format/,
  );
  const file = join(dir, "misnamed.jpg");
  await writeFile(file, Buffer.from([137, 80, 78, 71, 0, 0]));
  const ref = await image.storeFromFile(file);
  assert.equal(ref.mime, "image/png");
  assert.equal(ref.source, file);
  assert.match(await image.rehydrate(ref), /^data:image\/png;base64,/);
});
test("blob tracking preserves unchanged/new/duplicate and source-change quirks", async (t) => {
  const { image } = services(await owned(t));
  assert.equal(image.trackImageDelivered("a", "same"), "new");
  assert.equal(image.trackImageDelivered("a", "same"), "unchanged");
  assert.equal(image.trackImageDelivered("a", "other"), "duplicate");
  assert.equal(image.trackImageDelivered("b", "same"), "new");
  assert.equal(image.trackImageDelivered("a", "same"), "new");
  image.resetImageTracking();
  assert.equal(image.trackImageDelivered("a"), "new");
  assert.equal(image.trackImageDelivered("a"), "duplicate");
});
test("history keeps latest three versions per source and counts every user message", async (t) => {
  const { image } = services(await owned(t)),
    refs: any[] = [];
  for (let i = 0; i < 5; i++)
    refs.push(
      await image.storeFromDataUri(
        "data:image/png;base64," + Buffer.from("own " + i).toString("base64"),
        "same-source",
      ),
    );
  const items = refs.map((ref, index) => message("u" + index, [ref]));
  assert.deepEqual([...image.buildRehydrateSet(items, 0)], [2, 3, 4]);
  const all = await image.processHistoryForApi(items, 20);
  assert.equal(all[0].content[0].type, "input_text");
  assert.equal(all[2].content[0].type, "input_image");
  const recent = await image.processHistoryForApi(
    [
      ...items,
      message("reminder", [{ type: "input_text", text: "injected reminder" }]),
    ],
    1,
  );
  assert.equal(recent[4].content[0].type, "input_text");
  assert.equal(items[0].content[0].type, "image_blob_ref");
});
test("mixed-blob item selection retains whole items, missing and empty blobs become original placeholders", async (t) => {
  const { image, store } = services(await owned(t)),
    a = await image.storeFromDataUri("data:image/png;base64,YQ==", "a"),
    b = await image.storeFromDataUri("data:image/png;base64,Yg==", "b");
  const items = [message("mixed", [a, b]), message("repeat", [a])];
  assert.deepEqual([...image.buildRehydrateSet(items, 0)], [0, 1]);
  const output = await image.processHistoryForApi(items, 2);
  assert.equal(output[0].content[0].type, "input_image");
  const empty = await store.store("", "image/png", undefined, "empty.png");
  const missing = {
    ...a,
    blob_id: "0".repeat(64),
    blob_path: "/display-only/not-used",
  };
  for (const ref of [empty, missing]) {
    const result = await image.rehydrateItem(message("missing", [ref]));
    assert.equal(result.content[0].type, "input_text");
    assert.match(result.content[0].text, /stored at:/);
  }
});
test("tool output shapes rehydrate without mutating input and single-object JSON is not recursively expanded", async (t) => {
  const { image } = services(await owned(t)),
    ref = await image.storeFromDataUri("data:image/png;base64,b3du");
  const item: any = {
    type: "function_call_result",
    output: { type: "text", text: JSON.stringify([ref]) },
    providerData: {
      toolResult: {
        content: [
          {
            type: "image_url",
            image_url: { url: JSON.stringify(ref), detail: "high" },
          },
        ],
      },
    },
  };
  const result = await image.rehydrateItem(item);
  assert.equal(JSON.parse(result.output.text)[0].type, "image_url");
  assert.equal(
    result.providerData.toolResult.content[0].image_url.detail,
    "high",
  );
  assert.equal(
    item.providerData.toolResult.content[0].image_url.url,
    JSON.stringify(ref),
  );
  const single: any = {
    type: "function_call_result",
    output: JSON.stringify(ref),
  };
  assert.equal(await image.rehydrateItem(single), single);
});
test("tool-result threshold uses UTF-16 length and native parseInt/NaN/negative configuration", async (t) => {
  const dir = await owned(t);
  for (const [key, expected] of [
    ["1", false],
    ["0", true],
    ["-1", true],
    ["bad", false],
    ["1.5", false],
  ] as const) {
    const { tool } = services(dir, { CODEBUDDY_TOOL_RESULT_THRESHOLD_KB: key });
    assert.equal(tool.shouldExternalize("界".repeat(1000)), expected, key);
  }
  const { tool } = services(dir, { CODEBUDDY_TOOL_RESULT_THRESHOLD_KB: "1" });
  assert.equal(tool.shouldExternalize("x".repeat(1024)), false);
  assert.equal(tool.shouldExternalize("x".repeat(1025)), true);
});
test("real externalization preserves preview, child layout, spill envelope and targeted cleanup", async (t) => {
  const dir = await owned(t),
    { tool } = services(dir),
    text = "界".repeat(3000),
    output = await tool.externalize("call", text, "agent-child", "parent"),
    file = join(
      dir,
      "sessions",
      "parent",
      "subagents",
      "agent-child",
      "tool-results",
      "call.txt",
    );
  assert.equal(await readFile(file, "utf8"), text);
  assert.match(output, /Output too large \(2.9KB\)/);
  assert.match(output, /Preview \(first 2048 bytes\)/);
  assert.match(output, new RegExp("界".repeat(2048)));
  assert.equal(tool.getSpillFilePath("call", "agent-child", "parent"), file);
  assert.equal(tool.externalizeFromSpillFile("call", 3000, file, text), output);
  await tool.cleanupSession("agent-child", "parent");
  await assert.rejects(access(file));
});
test("SessionStore uses original best-effort per-element replacement and externalization catches", async (t) => {
  const dir = await owned(t),
    { image, tool } = services(dir, {
      CODEBUDDY_TOOL_RESULT_THRESHOLD_KB: "1",
    }),
    store = new SessionStore({
      storageDir: join(dir, "sessions"),
      imageBlobService: image,
      toolResultBlobService: tool,
    });
  const item: any = {
    type: "function_call_result",
    callId: "owned",
    output: [
      { type: "input_text", text: "x".repeat(2000) },
      { type: "text", text: "y".repeat(2000) },
    ],
  };
  const saved = await store.transformItemForSaveAsync(item, "s");
  assert.match(saved.output[0].text, /owned_0.txt/);
  assert.match(saved.output[1].text, /owned_1.txt/);
  const failStore = new SessionStore({
    storageDir: dir,
    toolResultBlobService: {
      shouldExternalize: () => true,
      externalize: async () => {
        throw Error("owned fail");
      },
    },
  });
  const original: any = {
    type: "function_call_result",
    callId: "owned",
    output: "original",
  };
  assert.equal(
    (await failStore.transformItemForSaveAsync(original, "s")).output,
    "original",
  );
});
test("placeholder and extension helper preserve unknown/undefined boundaries", () => {
  assert.equal(formatBlobFileSize(undefined), "");
  assert.equal(formatBlobFileSize(1024), "1.0KB");
  assert.equal(BlobPathUtils.mimeToExt("image/avif"), "bin");
  assert.equal(BlobPathUtils.mimeToExt("image/svg+xml"), "svg");
});
test("default native blob wiring persists and rehydrates real SDK history across harness restart", async (t) => {
  const dir = await owned(t),
    requests: any[] = [],
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
            id: "owned-response",
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            output: [
              {
                id: "owned-answer",
                type: "message",
                role: "assistant",
                status: "completed",
                content: [{ type: "output_text", text: "owned" }],
              },
            ],
          },
        } as any;
      },
    },
    options = { workDir: dir, modelProvider: { getModel: () => model } };
  const first = await createHarness(options),
    s = await first.openSession();
  for (const m of first.product.raw.models) m.supportsImages = true;
  await first.prompt(s, [
    message("own-image", [
      {
        type: "input_image",
        image: "data:image/png;base64,b3duZWQ=",
        original_filename: "own.png",
      },
    ]),
  ]);
  const transcript = await readFile(
    first.store.getSessionFilePath(s.id),
    "utf8",
  );
  assert.match(transcript, /image_blob_ref/);
  assert.doesNotMatch(transcript, /data:image\/png;base64/);
  await first.close();
  const second = await createHarness(options);
  t.after(() => second.close());
  for (const m of second.product.raw.models) m.supportsImages = true;
  const resumed = await second.openSession(s.id);
  assert.equal(await second.prompt(resumed, "continue"), "owned");
  assert.match(
    JSON.stringify(requests.at(-1).input),
    /data:image\/png;base64,b3duZWQ=/,
  );
  assert.doesNotMatch(JSON.stringify(requests.at(-1).input), /image_blob_ref/);
});
test("default tool externalization survives close/resume and stays within owned stateDir", async (t) => {
  const dir = await owned(t),
    model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse() {},
    };
  const h = await createHarness({
      workDir: dir,
      modelProvider: { getModel: () => model },
      blobs: { env: { CODEBUDDY_TOOL_RESULT_THRESHOLD_KB: "1" } },
    }),
    s = await h.openSession();
  const item: any = {
    type: "function_call_result",
    callId: "large",
    name: "Read",
    output: { type: "text", text: "界".repeat(1500) },
  };
  await h.sessions.addHistory(s, item);
  assert.match(item.output.text, /<persisted-output>/);
  const file = h.toolResultBlobService.getSpillFilePath(
    "large",
    s.id,
    undefined,
  );
  await h.close();
  assert.equal((await readFile(file, "utf8")).length, 1500);
  assert.ok(file.startsWith(join(dir, ".workbuddy-harness")));
});
