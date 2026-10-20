import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import * as path from "node:path";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import { BlobStoreImpl } from "../src/blobs/blob-store-impl.js";
import { ImageBlobServiceImpl } from "../src/blobs/image-blob-service-impl.js";
import { ToolResultBlobServiceImpl } from "../src/blobs/tool-result-blob-service-impl.js";
import { createBlobRuntime } from "../src/blobs/blob-runtime.js";
import {
  BlobPathUtils,
  BlobImageMime,
  formatBlobFileSize,
} from "../src/blobs/blob-utils.js";
import { SessionStore } from "../src/sessions/session-store.js";
const source = await readFile(
  process.argv[2] ??
    new URL(
      "../../../work/workbuddy-app/cli/dist/codebuddy.js",
      import.meta.url,
    ),
  "utf8",
);
assert.equal(
  crypto.createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
const classes: any[] = [],
  assignments: any[] = [];
function visit(n: any) {
  if (!n || typeof n !== "object") return;
  if (["ClassDeclaration", "ClassExpression"].includes(n.type)) classes.push(n);
  if (n.type === "AssignmentExpression") assignments.push(n);
  for (const [k, v] of Object.entries(n))
    if (!["start", "end"].includes(k)) {
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === "object") visit(v);
    }
}
visit(parse(source, { ecmaVersion: "latest" }));
function methods(anchor: number, names: string[]) {
  const c = classes
    .filter((c) => c.start <= anchor && c.end > anchor)
    .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
  return (
    "class{" +
    names
      .map((name) => {
        const m = c.body.body.find((m: any) => m.key?.name === name);
        assert.ok(m, name);
        return source.slice(m.start, m.end);
      })
      .join("\n") +
    "}"
  );
}
const pathsNative = runInNewContext(
  "(" + methods(13331149, ["getBlobsDir", "getBlobPath", "mimeToExt"]) + ")",
  { ef: path },
);
pathsNative.getHomeDir = () => "/owned";
pathsNative.MIME_EXT_MAP = runInNewContext(
  "(" +
    source.slice(
      13339557,
      source.indexOf(",PathUtils.getWin32Paths", 13339557),
    ) +
    ")",
);
const sizeAssignment = assignments.find(
  (n) =>
    n.left?.property?.name === "formatFileSize" &&
    n.start < 13094790 &&
    n.end > 13094790,
);
assert.ok(sizeAssignment);
const nativeSize = runInNewContext(
  "(" +
    source.slice(sizeAssignment.right.start, sizeAssignment.right.end) +
    ")",
);
const imageNative = runInNewContext(
  "(" +
    methods(13203887, ["getImageMimeTypeAsync", "detectMimeFromMagicBytes"]) +
    ")",
  { ef: path },
);
const mimeAssignment = assignments.find(
  (n) =>
    n.left?.property?.name === "IMAGE_MIME_TYPE_MAP" &&
    n.start > 13208900 &&
    n.start < 13209700,
);
imageNative.IMAGE_MIME_TYPE_MAP = runInNewContext(
  "(" +
    source.slice(mimeAssignment.right.start, mimeAssignment.right.end) +
    ")",
);
let comparisons = 0;
function norm(v: any): any {
  if (v === undefined) return "[undefined]";
  if (Object.prototype.toString.call(v) === "[object Error]")
    return {
      error: v.name,
      message: v.name === "TypeError" ? "[TypeError]" : v.message,
    };
  if (v instanceof Map) return [...v].map(norm);
  if (v instanceof Set) return [...v].map(norm);
  if (ArrayBuffer.isView(v)) return Array.from(v as any);
  if (Array.isArray(v)) return Array.from(v, norm);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, norm(v[k])]),
    );
  return v;
}
function eq(a: any, b: any, label: string) {
  assert.deepEqual(norm(a), norm(b), label);
  comparisons++;
}
async function result(fn: () => any) {
  try {
    return { value: await fn() };
  } catch (error) {
    return { error };
  }
}
function fixture(native = false, threshold?: string, fail?: string) {
  const files = new Map<string, Buffer>(),
    events: any[] = [];
  const fs: any = {
    async mkdir(...args: any[]) {
      events.push(["mkdir", ...args]);
      if (fail === "mkdir") throw Error("mkdir failed");
    },
    async writeFile(file: string, data: any, encoding?: any) {
      events.push(["write", file, data, encoding]);
      if (fail === "write") throw Error("write failed");
      files.set(file, Buffer.from(data));
    },
    async readFile(file: string, encoding?: any) {
      events.push(["read", file, encoding]);
      if (fail === "read" || !files.has(file)) throw Error("not found");
      const data = files.get(file)!;
      return typeof encoding === "string" ? data.toString() : data;
    },
    async access(file: string) {
      events.push(["access", file]);
      if (!files.has(file)) throw Error("not found");
    },
    async rm(file: string, args: any) {
      events.push(["rm", file, args]);
      if (fail === "rm") throw Error("rm failed");
      for (const key of files.keys())
        if (key.startsWith(file + "/")) files.delete(key);
    },
  };
  const logger: any = Object.fromEntries(
    ["setContext", "debug", "warn", "info"].map((k) => [
      k,
      (...args: any[]) => events.push([k, ...args]),
    ]),
  );
  const runtime = createBlobRuntime("/owned", "/owned/project", {
    fs,
    existsSync: (file: any) => files.has(String(file)),
    logger,
    env:
      threshold === undefined
        ? {}
        : { CODEBUDDY_TOOL_RESULT_THRESHOLD_KB: threshold },
  });
  let store: any, image: any, tool: any;
  if (native) {
    const globals = { Buffer, Error, Map, Set, JSON };
    const Store = runInNewContext("(" + source.slice(7343391, 7344212) + ")", {
      ...globals,
      ef: crypto,
      em: { existsSync: runtime.existsSync },
      eE: fs,
      eC: path,
      ey: { PathUtils: pathsNative },
    });
    const Image = runInNewContext(
      "let ed=(" +
        source.slice(7345147, 7353749) +
        ");ed.MAX_VERSIONS_PER_SOURCE=3;ed",
      {
        ...globals,
        eE: fs,
        ey: {
          FileUtils: { formatFileSize: nativeSize },
          ImageUtils: imageNative,
        },
      },
    );
    const Tool = runInNewContext("(" + source.slice(7355182, 7356920) + ")", {
      ...globals,
      process: { env: runtime.env },
      em: 50,
      eE: 2048,
      ep: fs,
      eg: path,
      eh: { PathUtils: { getHomeProjectDir: () => "/owned/project" } },
    });
    store = new Store();
    image = new Image();
    tool = new Tool();
    Object.assign(store, { logger });
    Object.assign(image, { blobStore: store, logger });
    Object.assign(tool, { logger });
  } else {
    store = new BlobStoreImpl(runtime);
    image = new ImageBlobServiceImpl(runtime, { blobStore: store });
    tool = new ToolResultBlobServiceImpl(runtime);
  }
  store.init();
  image.init();
  tool.init();
  return { store, image, tool, files, events, runtime };
}
async function pair(
  label: string,
  fn: (f: ReturnType<typeof fixture>) => any,
  threshold?: string,
  fail?: string,
) {
  const a = fixture(false, threshold, fail),
    b = fixture(true, threshold, fail);
  eq(await result(() => fn(a)), await result(() => fn(b)), label + " result");
  eq(a.files, b.files, label + " files");
  eq(a.events, b.events, label + " effects");
}
for (const mime of [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/unknown",
  "",
])
  for (const payload of ["b3duZWQ=", "", "!!bad-base64!!", "a".repeat(100)])
    await pair("store/read/exists", async (f) => {
      const ref = await f.store.store(payload, mime, "owned-source", "own.png");
      const again = await f.store.store(payload, mime);
      return [
        ref,
        again,
        await f.store.read(ref.blob_id, mime),
        await f.store.exists(ref.blob_id, mime),
        await f.store.exists("missing", mime),
      ];
    });
for (const fail of ["mkdir", "write", "read"])
  await pair(
    "store failure",
    (f) => f.store.store("b3du", "image/png"),
    undefined,
    fail,
  );
for (const uri of [
  "data:image/png;base64,b3du",
  "data:image/png;base64,",
  "data:image/png;charset=utf8;base64,b3du",
  "data:application/octet-stream;base64,b3du",
  "invalid",
  "data:image/png;base64,b3\ndu",
])
  await pair("data URI", (f) =>
    f.image.storeFromDataUri(uri, "source", "own.png"),
  );
for (const filename of ["own.png", "own.JPG", "own.svg", "own.unknown"])
  for (const missing of [false, true])
    await pair("storeFromFile", async (f) => {
      if (!missing) f.files.set(filename, Buffer.from([137, 80, 78, 71, 0]));
      return f.image.storeFromFile(filename);
    });
for (const sourceKey of [undefined, "source-a", "source-b"])
  await pair("tracking", (f) => {
    const values = [];
    for (const [id, s] of [
      ["a", sourceKey],
      ["a", sourceKey],
      ["b", sourceKey],
      ["a", "other"],
      ["a", undefined],
      ["b", undefined],
    ])
      values.push(f.image.trackImageDelivered(id, s));
    f.image.resetImageTracking();
    values.push(f.image.trackImageDelivered("a", sourceKey));
    return values;
  });
function ref(i: number, sourceKey?: string): any {
  return {
    type: "image_blob_ref",
    blob_id: crypto.createHash("sha256").update(String(i)).digest("hex"),
    mime: "image/png",
    size: i * 1024,
    source: sourceKey,
    blob_path: "/display/owned-" + i,
    original_filename: i % 2 ? "own-" + i + ".png" : undefined,
  };
}
function histories() {
  const refs = [
      ref(1, "same"),
      ref(2, "same"),
      ref(3, "same"),
      ref(4, "same"),
      ref(5),
      ref(1, "same"),
    ],
    items: any[] = [];
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    items.push({
      type: "message",
      role: "user",
      content: [
        { type: "input_text", text: "round " + i },
        i % 2 ? { type: "input_image", image: r } : r,
      ],
      providerData: i % 2 ? { skipRun: true } : {},
    });
    items.push({
      type: "function_call_result",
      output: {
        text: JSON.stringify([
          r,
          {
            type: "image_url",
            image_url: { url: JSON.stringify(r), detail: "high" },
          },
        ]),
      },
      providerData: {
        toolResult: { content: i % 2 ? JSON.stringify([r]) : [r] },
      },
    });
  }
  return items;
}
for (const rounds of [undefined, 0, -1, 1, 2, 3, 20])
  for (const present of [false, true])
    for (const variant of [0, 1, 2])
      await pair("history filtering", async (f) => {
        const items = histories();
        if (variant === 1) items.reverse();
        if (variant === 2)
          items.push({
            type: "function_call_output",
            output: JSON.stringify([ref(1, "same"), ref(5)]),
          });
        if (present)
          for (let i = 1; i <= 5; i++)
            f.files.set(
              f.store.getBlobPath(ref(i).blob_id, "image/png"),
              Buffer.from("own " + i),
            );
        const output = await f.image.processHistoryForApi(items, rounds);
        return {
          output,
          unchanged: output === items,
          original: items,
          set: [...f.image.buildRehydrateSet(items, 0)],
        };
      });
for (const malformed of [
  null,
  {},
  "x",
  { type: "image_blob_ref", blob_id: 1 },
  { type: "image_blob_ref", blob_id: "" },
  ref(1),
])
  await pair("blob predicates", (f) => [
    f.image.isImageBlobRef(malformed),
    f.image.extractBlobRefFromUrl(malformed),
    f.image.extractBlobRefFromUrl(JSON.stringify(malformed)),
  ]);
for (const content of [
  [ref(1)],
  [{ type: "image_url", image_url: { url: ref(1), detail: "high" } }],
  { content: [ref(1)] },
  [null, 1, "x"],
  [ref(1), ref(2, "path")],
])
  for (const mode of ["rehydrate", "dehydrate", "ignored"])
    await pair("content processing", async (f) => {
      const a = await f.image.processContentArray(content, mode),
        b = f.image.processContentArraySync(content, mode);
      return [a, b];
    });
for (const threshold of [undefined, "", "0", "-1", "abc", "1.5", "1KB", "2"])
  for (const length of [0, 1, 1024, 2048, 2049, 51200, 51201])
    await pair(
      "tool threshold",
      async (f) => {
        const text = "界".repeat(length);
        return [
          f.tool.shouldExternalize(text),
          await f.tool.externalize("call", text, "agent-child", "parent"),
          f.tool.externalizeFromSpillFile("call", length, "/owned/spill", text),
          f.tool.getSpillFilePath("call", "session"),
          await f.tool.read("/missing"),
        ];
      },
      threshold,
    );
for (const fail of ["mkdir", "write", "rm"])
  await pair(
    "tool failures",
    async (f) => {
      if (fail === "rm") return f.tool.cleanupSession("owned");
      return f.tool.externalize("call", "owned", "owned");
    },
    undefined,
    fail,
  );
// Original SessionStore methods in isolation; no product SessionStore bootstrap.
const NativeSession = runInNewContext(
  "(" +
    methods(10983165, [
      "replaceImageDataWithBlobRef",
      "replaceImageInFunctionCallOutput",
      "externalizeToolResultIfNeeded",
      "externalizeStructuredArrayOutput",
    ]) +
    ")",
  { JSON, Error, Date },
);
const dataUri = "data:image/png;base64," + "a".repeat(1100);
const items: any[] = [
  {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_image",
        image: "data:image/png;base64,b3du",
        source: "own",
      },
    ],
  },
  ...[
    JSON.stringify([{ type: "image_url", image_url: { url: dataUri } }]),
    "{ malformed " + dataUri,
    [
      { type: "input_text", text: "x".repeat(3000) },
      { type: "text", text: "y".repeat(3000) },
    ],
    { type: "text", text: "x".repeat(3000) },
  ].map((output) => ({
    type: "function_call_result",
    callId: "owned",
    output,
    providerData: {
      toolResult: {
        content: [{ type: "image_url", image_url: { url: dataUri } }],
      },
    },
  })),
];
for (const item of items)
  for (const fail of [undefined, "write"]) {
    const a = fixture(false, "1", fail),
      b = fixture(true, "1", fail),
      p: any = new SessionStore({
        storageDir: "/owned/project",
        imageBlobService: a.image,
        toolResultBlobService: a.tool,
        logger: a.runtime.logger,
      }),
      n = new NativeSession();
    Object.assign(n, {
      imageBlobService: b.image,
      toolResultBlobService: b.tool,
      logger: b.runtime.logger,
    });
    const ai = structuredClone(item),
      bi = structuredClone(item);
    eq(
      await result(async () => {
        await p.replaceImageDataWithBlobRef(ai);
        await p.externalizeToolResultIfNeeded(ai, "session", "parent");
      }),
      await result(async () => {
        await n.replaceImageDataWithBlobRef(bi);
        await n.externalizeToolResultIfNeeded(bi, "session", "parent");
      }),
      "SessionStore errors",
    );
    eq(ai, bi, "SessionStore item");
    eq(a.files, b.files, "SessionStore files");
    eq(a.events, b.events, "SessionStore side effects");
  }
for (const size of [undefined, 0, -1, 1023, 1024, 1048576, NaN])
  eq(formatBlobFileSize(size), nativeSize(size), "size helper");
eq(BlobPathUtils.MIME_EXT_MAP, pathsNative.MIME_EXT_MAP, "path MIME map");
eq(
  BlobImageMime.IMAGE_MIME_TYPE_MAP,
  imageNative.IMAGE_MIME_TYPE_MAP,
  "image MIME map",
);
console.log(
  `Blob/image history/tool-result differential passed: ${comparisons} comparisons; fixed SHA-256; original three services, helper subsets and four SessionStore methods; memory filesystem only.`,
);
