import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);
const adapter = new URL("../native-stdio.mjs", import.meta.url).href;

test("native stdio adapter preserves both pipe payloads and explicit exit status", async () => {
  const output = "owned-stdout 中文 🧪\n".repeat(16384);
  const error = "owned-stderr é\n".repeat(16384);
  const source = `
    import { configureNativeStdio } from ${JSON.stringify(adapter)};
    configureNativeStdio(process);
    process.stdout.write("owned-stdout 中文 🧪\\n".repeat(16384));
    process.stderr.write("owned-stderr é\\n".repeat(16384));
    process.exit(7);
  `;
  await assert.rejects(execute(process.execPath, ["--input-type=module", "-e", source], {
    timeout: 10000, maxBuffer: 2 * 1024 * 1024,
  }), failure => {
    assert.equal(failure.code, 7);
    assert.equal(failure.signal, null);
    assert.equal(failure.stdout, output);
    assert.equal(failure.stderr, error);
    return true;
  });
});
