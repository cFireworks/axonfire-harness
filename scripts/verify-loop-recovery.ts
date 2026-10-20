import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { ToolCallLoopDetectorImpl } from "../src/runner/tool-call-loop-detector.js";

// Optional evidence differential, never imports or launches the installed app.
// npm run verify:loop -- /absolute/path/to/the/captured/codebuddy.js
const path = process.argv[2];
if (!path) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await readFile(path, "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const start = source.indexOf("let nX=4,n0=40,n1=40");
assert.ok(start > 0);
const classStart = source.indexOf("n8=class{", start);
const classEnd = source.indexOf(";tool_call_loop_detector_service_decorate", classStart);
assert.ok(classEnd > classStart);
const prefix = source.slice(start, classStart).replace(/,$/, ";");
const Original = runInNewContext(`(()=>{${prefix} const nZ={LOOP_DETECTION_MARKER:"[LOOP_DETECTED]"};return ${source.slice(classStart + 3, classEnd)};})()`, {}, {
  timeout: 1000, contextCodeGeneration: { strings: false, wasm: false },
});
const original = new Original();
original.logger = { warn() {} };
const recovered = new ToolCallLoopDetectorImpl();
let cases = 0;
function compare(input: unknown): void {
  assert.deepEqual(recovered.detectLoop(input), JSON.parse(JSON.stringify(original.detectLoop(input))));
  if (Array.isArray(input)) {
    const modelData = { input, instructions: "fixture" };
    assert.deepEqual(recovered.check(modelData), JSON.parse(JSON.stringify(original.check(modelData))));
  }
  cases++;
}
for (const invalid of [undefined, null, "", {}, []]) compare(invalid);
const call = (name: string, args: string) => ({ type: "function_call", name, arguments: args });
for (const name of ["Read", "Grep", "Glob", "Write", "WebFetch", "WebSearch", "Edit", "Skill", "Bash", "Agent", "mcp__test__tool"]) {
  for (const count of [0, 1, 3, 4, 5, 39, 40, 41, 60]) {
    const input = Array.from({ length: count }, () => call(name, '{"file_path":"fixture"}'));
    compare(input);
    compare(input.flatMap((item) => [item, { type: "function_call_result" }, { type: "reasoning" }]));
    compare([...input, { type: "message", role: "assistant" }]);
    compare([{ type: "message", role: "user", content: [{ text: "[LOOP_DETECTED]" }] }, ...input]);
  }
}
for (const count of [3, 4, 39, 40, 41]) {
  compare(Array.from({ length: count }, (_, offset) => call("Read", JSON.stringify({ filePath: "fixture", offset }))));
  compare(Array.from({ length: count }, (_, offset) => call("Read", `{"file_path":"fixture","offset":${offset}`)));
}
let seed = 0x5_03_14;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 2 ** 32; };
const names = ["Read", "Bash", "Agent", "Grep", "mcp__test__tool"];
for (let trial = 0; trial < 1000; trial++) {
  const name = names[Math.floor(random() * names.length)]!;
  const length = Math.floor(random() * 65);
  const input: any[] = Array.from({ length }, () => call(name, "{}"));
  if (random() < 0.6 && input.length) input[Math.floor(random() * input.length)] = call(names[Math.floor(random() * names.length)]!, "different");
  if (random() < 0.3) input.splice(Math.floor(random() * input.length), 0, { type: "message", role: "user" });
  compare(input);
}
console.log(JSON.stringify({ bundleSHA256: createHash("sha256").update(source).digest("hex"), classStart: classStart + 3, classEnd, differentialCases: cases, passed: true }, null, 2));
