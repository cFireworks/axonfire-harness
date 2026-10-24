import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, resolve, join } from "node:path";
function sections(b: Buffer) {
  assert.equal(b.readUInt32LE(0), 0xfeedfacf, "little endian Mach-O64");
  const out = [];
  let at = 32;
  for (let i = 0; i < b.readUInt32LE(16); i++) {
    const cmd = b.readUInt32LE(at),
      size = b.readUInt32LE(at + 4);
    assert.ok(size >= 8 && at + size <= b.length);
    if (cmd === 0x19)
      for (let j = 0; j < b.readUInt32LE(at + 64); j++) {
        const s = at + 72 + j * 80;
        assert.ok(s + 80 <= at + size);
        const name = b
            .subarray(s, s + 16)
            .toString()
            .replace(/\0.*$/, ""),
          segment = b
            .subarray(s + 16, s + 32)
            .toString()
            .replace(/\0.*$/, ""),
          length = Number(b.readBigUInt64LE(s + 40)),
          offset = b.readUInt32LE(s + 48),
          flags = b.readUInt32LE(s + 64);
        if ((flags & 255) !== 1) assert.ok(offset + length <= b.length);
        out.push({
          segment,
          name,
          length,
          flags,
          sha256:
            (flags & 255) === 1
              ? null
              : createHash("sha256")
                  .update(b.subarray(offset, offset + length))
                  .digest("hex"),
        });
      }
    at += size;
  }
  return out;
}
export function verifyPtyProvenance(bundle: string) {
  const paths = [
      new URL("../../vendor/pty-provenance.json", import.meta.url),
      new URL("../../../vendor/pty-provenance.json", import.meta.url),
    ],
    manifest = JSON.parse(
      readFileSync(paths.find((p) => existsSync(p))!, "utf8"),
    );
  const installed = resolve(
      dirname(createRequire(import.meta.url).resolve("@lydell/node-pty")),
      "../..",
    ),
    captured = resolve(dirname(bundle), "../../node_modules");
  if (process.platform + "-" + process.arch !== manifest.platform)
    return {
      verifiedAssets: 0,
      platform: process.platform + "-" + process.arch,
    };
  for (const a of manifest.assets) {
    const left = readFileSync(join(captured, a.path)),
      right = readFileSync(join(installed, a.path));
    for (const [data, key] of [
      [left, "captured"],
      [right, "npm"],
    ] as const) {
      assert.equal(data.length, a[key].bytes);
      assert.equal(
        createHash("sha256").update(data).digest("hex"),
        a[key].sha256,
      );
    }
    assert.equal(left.equals(right), a.byteIdentical);
    if (a.machOSections) {
      const l = sections(left),
        r = sections(right);
      assert.deepEqual(l, a.machOSections.captured);
      assert.deepEqual(r, a.machOSections.npm);
      assert.deepEqual(l, r);
    }
  }
  return {
    verifiedAssets: manifest.assets.length,
    platform: manifest.platform,
  };
}
