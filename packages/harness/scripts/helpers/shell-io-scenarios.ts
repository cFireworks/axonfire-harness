import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as buffer from "node:buffer";
import * as stringDecoder from "node:string_decoder";
import * as stream from "node:stream";
import * as fsPromises from "node:fs/promises";
import { createNativeShellIO } from "../../src/sandbox/native-shell-io.js";
export function shellIOFixture(
  factory = createNativeShellIO,
  root?: string,
  patch: any = {},
) {
  root ??= fs.mkdtempSync(path.join(os.tmpdir(), "axonfire-io-"));
  fs.mkdirSync(root, { recursive: true });
  const runtime = {
    process: {
      platform: process.platform,
      env: { PATH: root },
      cwd: () => root,
      getuid: process.getuid?.bind(process),
      getgid: process.getgid?.bind(process),
      getgroups: process.getgroups?.bind(process),
    },
    modules: {
      20181: require("node:buffer"),
      13193: require("node:string_decoder"),
      2203: require("node:stream"),
      79896: require("node:fs"),
      91943: require("node:fs/promises"),
      16928: require("node:path"),
    },
    ...patch,
  };
  return {
    root,
    runtime,
    n: factory(runtime),
    close: () => fs.rmSync(root!, { recursive: true, force: true }),
  };
}
export const SHELL_IO_CASES: {
  name: string;
  run(factory: typeof createNativeShellIO, root?: string): Promise<any>;
}[] = [
  {
    name: "original encoding tables round trip UTF8, UTF16, GBK, Shift-JIS and single byte text",
    async run(factory, root) {
      const f = shellIOFixture(factory, root);
      try {
        const out = [];
        for (const [encoding, text] of [
          ["utf8", "Hello 世界 😀"],
          ["utf16le", "Hello 世界 😀"],
          ["gbk", "中文测试"],
          ["shift_jis", "日本語"],
          ["windows1252", "café €"],
          ["koi8r", "Привет"],
        ]) {
          const b = f.n.iconv.encode(text, encoding);
          assert.equal(f.n.iconv.decode(b, encoding), text);
          out.push({ encoding, bytes: [...b] });
        }
        return out;
      } finally {
        f.close();
      }
    },
  },
  {
    name: "encoding alias resolution, BOM stripping and unsupported encoding preserve original behavior",
    async run(factory, root) {
      const f = shellIOFixture(factory, root);
      try {
        const b = f.n.iconv.encode("owned", "UTF-16LE", { addBOM: true });
        assert.equal(b.subarray(0, 2).toString("hex"), "fffe");
        assert.equal(f.n.iconv.decode(b, "utf16le"), "owned");
        assert.equal(
          f.n.iconv.decode(b, "utf16le", { stripBOM: false }),
          "\ufeffowned",
        );
        assert.equal(f.n.iconv.encodingExists("missing-owned"), false);
        assert.throws(
          () => f.n.iconv.encode("owned", "missing-owned"),
          /Encoding not recognized/,
        );
        return [...b];
      } finally {
        f.close();
      }
    },
  },
  {
    name: "decoder stream preserves multibyte tails across real Node stream chunks",
    async run(factory, root) {
      const f = shellIOFixture(factory, root);
      try {
        const decoder = f.n.iconv.decodeStream("utf8"),
          out: string[] = [];
        decoder.on("data", (x: string) => out.push(x));
        const done = new Promise<void>((r, j) => {
          decoder.on("end", r);
          decoder.on("error", j);
        });
        const b = Buffer.from("中😀owned");
        decoder.write(b.subarray(0, 2));
        decoder.write(b.subarray(2, 5));
        decoder.end(b.subarray(5));
        await done;
        assert.equal(out.join(""), "中😀owned");
        return out.join("");
      } finally {
        f.close();
      }
    },
  },
  {
    name: "detector retains confidence and charset results across empty, ASCII and multilingual encoded buffers",
    async run(factory, root) {
      const f = shellIOFixture(factory, root);
      try {
        const out = [];
        for (const [encoding, text] of [
          ["utf8", ""],
          ["ascii", "owned ASCII text"],
          ["utf8", "中文日本語😀".repeat(10)],
          ["gbk", "中华人民共和国中文字符编码检测测试".repeat(20)],
          [
            "shift_jis",
            "日本語の文字コードを検出するためのテストです".repeat(20),
          ],
        ]) {
          const result = f.n.detector.detect(f.n.iconv.encode(text, encoding));
          assert.equal(typeof result.confidence, "number");
          out.push(result);
        }
        assert.ok(out[2].encoding);
        return out;
      } finally {
        f.close();
      }
    },
  },
  {
    name: "which finds owned executable, respects permissions and all PATH occurrences",
    async run(factory, root) {
      const f = shellIOFixture(factory, root);
      try {
        const a = path.join(f.root, "a"),
          b = path.join(f.root, "b");
        fs.mkdirSync(a);
        fs.mkdirSync(b);
        for (const p of [a, b])
          fs.writeFileSync(path.join(p, "owned"), "#!/bin/sh\n", {
            mode: 0o700,
          });
        f.runtime.process.env.PATH = a + path.delimiter + b;
        const found = f.n.which.sync("owned", { all: true });
        assert.deepEqual(found, [path.join(a, "owned"), path.join(b, "owned")]);
        assert.equal(await f.n.which("owned"), path.join(a, "owned"));
        fs.chmodSync(path.join(a, "owned"), 0o600);
        assert.equal(f.n.which.sync("owned"), path.join(b, "owned"));
        return { found, after: f.n.which.sync("owned") };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "which wrapper maps asynchronous lookup failure to null while sync retains ENOENT",
    async run(factory, root) {
      const f = shellIOFixture(factory, root);
      try {
        assert.equal(await f.n.which("owned-missing"), null);
        assert.equal(f.n.which.sync("owned-missing", { nothrow: true }), null);
        assert.throws(() => f.n.which.sync("owned-missing"), {
          code: "ENOENT",
        });
        return { asyncMissing: null, syncThrows: true };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "Bun which branch deduplicates repeated paths and preserves nothrow",
    async run(factory, root) {
      const f = shellIOFixture(factory, root, {
        Bun: {
          which: (_name: string, o: any) =>
            o?.PATH === "a" ? "/owned/bin" : null,
        },
      });
      try {
        f.runtime.process.env.PATH =
          "a" + path.delimiter + "a" + path.delimiter + "b";
        assert.deepEqual(f.n.which.sync("owned", { all: true }), [
          "/owned/bin",
        ]);
        assert.equal(f.n.which.sync("missing", { nothrow: true }), null);
        assert.equal(await f.n.which("missing"), null);
        assert.throws(() => f.n.which.sync("missing"), /not found/);
        return f.n.which.sync("owned", { all: true });
      } finally {
        f.close();
      }
    },
  },
];
