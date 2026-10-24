#!/usr/bin/env node
// Read-only fixed-sample analysis. Never executes or patches sandbox-cli.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const includeAssembly = args.includes("--include-assembly");
const paths = args.filter(value => value !== "--include-assembly");
if (paths.length > 1 || paths.some(value => value.startsWith("--"))) {
  throw Error("Usage: node scripts/inspect-sandbox-audit-native.mjs [sandbox-cli] [--include-assembly]");
}
const binary = paths[0] ? resolve(paths[0]) : fileURLToPath(new URL("../packages/harness/dist/native-product/vendor/sandbox/5.3.3/sandbox-cli", import.meta.url));
const bytes = readFileSync(binary);
const sha256 = createHash("sha256").update(bytes).digest("hex");
assert.equal(sha256, "db944b749d228b394838c7b0500e4726c5d81394c3929f3415cf80fd7f70eb41", "Analysis addresses require the fixed captured arm64 sample");
assert.equal(bytes.readUInt32LE(0), 0xfeedfacf, "thin little-endian Mach-O 64 required");
let textSegment, uuid;
for (let index = 0, offset = 32; index < bytes.readUInt32LE(16); index++) {
  const command = bytes.readUInt32LE(offset), size = bytes.readUInt32LE(offset + 4);
  assert.ok(size >= 8 && offset + size <= bytes.length);
  if (command === 0x19 && bytes.subarray(offset + 8, offset + 24).toString().replace(/\0.*$/, "") === "__TEXT") {
    textSegment = { vmAddress: Number(bytes.readBigUInt64LE(offset + 24)), fileOffset: Number(bytes.readBigUInt64LE(offset + 40)), fileSize: Number(bytes.readBigUInt64LE(offset + 48)) };
  }
  if (command === 0x1b) uuid = bytes.subarray(offset + 8, offset + 24).toString("hex");
  offset += size;
}
assert.deepEqual(textSegment, { vmAddress: 0x100000000, fileOffset: 0, fileSize: 2588672 });
function fileOffset(address, size) {
  const relative = address - textSegment.vmAddress;
  assert.ok(relative >= 0 && relative + size <= textSegment.fileSize);
  return relative + textSegment.fileOffset;
}
const hex = value => `0x${value.toString(16)}`;
const run = (program, arguments_) => execFileSync(program, arguments_, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const symbols = run("nm", ["-n", binary]).split("\n").flatMap(line => {
  const match = /^([0-9a-fA-F]+) [tT] (.+)$/.exec(line);
  return match ? [{ address: Number.parseInt(match[1], 16), name: match[2] }] : [];
});
const selectors = [
  ["start", name => name.endsWith("17SandboxLogMonitor5start")],
  ["stop_and_collect", name => name.endsWith("17SandboxLogMonitor16stop_and_collect")],
  ["initial_stdout_reader", name => name.includes("___rust_begin_short_backtrace") && name.includes("17SandboxLogMonitor5starts0_0")],
  ["deny_records_to_ipc_file_block_records", name => name.endsWith("38deny_records_to_ipc_file_block_records")],
];
const functions = selectors.map(([label, select]) => {
  const matches = symbols.filter(symbol => select(symbol.name));
  assert.equal(matches.length, 1, `Unambiguous symbol required: ${label}`);
  const symbol = matches[0], end = symbols.find(next => next.address > symbol.address)?.address;
  assert.ok(end > symbol.address);
  const offset = fileOffset(symbol.address, end - symbol.address);
  const assembly = run("xcrun", ["llvm-objdump", "--disassemble", `--start-address=${hex(symbol.address)}`, `--stop-address=${hex(end)}`, binary]);
  return { label, symbol: symbol.name, address: hex(symbol.address), endAddress: hex(end), fileOffset: offset,
    byteLength: end - symbol.address, codeSha256: createHash("sha256").update(bytes.subarray(offset, offset + end - symbol.address)).digest("hex"),
    ...(includeAssembly ? { assembly } : {}),
  };
});
const literalRanges = [[0x1002284a3, 12], [0x100226a60, 6], [0x1002284af, 7], [0x1002284b6, 6], [0x1002284bc, 6], [0x1002284c2, 7], [0x1002284c9, 11], [0x1002284d4, 60]];
const commandLiterals = literalRanges.map(([address, size]) => ({ address: hex(address), fileOffset: fileOffset(address, size), value: bytes.subarray(fileOffset(address, size), fileOffset(address, size) + size).toString("utf8") }));
const indirect = run("xcrun", ["llvm-objdump", "--macho", "--indirect-symbols", binary]);
const imports = indirect.split("\n").filter(line => /^0x00000001001d(?:1214|143c|1460|1478|113c)\s/.test(line));
assert.equal(imports.length, 5);
console.log(JSON.stringify({ binary, sha256, uuid, textSegment, functions, commandLiterals, imports,
  limitations: ["Static native disassembly is not original Rust source or a complete decompilation.", "Each code span ends at the next text symbol; cold or shared code outside that span is not claimed as covered.", "Requires macOS command-line tools (nm and xcrun llvm-objdump).", "No target process is launched; timing interpretation and intermittent audit-loss causality require separate evidence."],
}, null, 2));
