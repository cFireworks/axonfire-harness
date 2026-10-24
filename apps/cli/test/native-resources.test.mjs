import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { createNativeDi } from "@axonfire/harness/di/native-di.js";
import { createNativeProductRuntime } from "@axonfire/harness/runtime/native-product-runtime.js";

test("staged resources initialize the original tree-sitter parser through its own path resolver", async () => {
  const root = fileURLToPath(new URL("../../../packages/harness/dist/native-product/", import.meta.url));
  const source = fileURLToPath(new URL("../../../packages/harness/vendor/native-assets/", import.meta.url));
  const manifest = JSON.parse(await readFile(join(source, "manifest.json"), "utf8"));
  for (const entry of manifest.files) {
    const bytes = await readFile(join(root, entry.path));
    assert.equal(bytes.length, entry.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256);
  }
  for (const name of ["tree-sitter.wasm", "tree-sitter-bash.wasm"])
    assert.deepEqual(await readFile(join(root, name)), await readFile(join(root, "dist/wasm", name)));
  const host = {
    require: createRequire(import.meta.url), process, globals: globalThis,
    console, Error, fetch: globalThis.fetch,
    basePath: join(root, "dist"), filename: join(root, "dist/codebuddy.js"),
  };
  const runtime = createNativeProductRuntime({ ...host, di: createNativeDi(host) });
  try {
    const parser = new (runtime.getModule(41936).TreeSitterParserStrategy)();
    assert.equal(parser.getWasmDir(), root.replace(/\/$/, ""));
    await parser.ensureInitialized();
    assert.equal(parser.isAvailable(), true);
    assert.deepEqual(parser.extractCommands('echo "hello world" && git status'), [
      { command: "echo", args: ["hello world"], fullCommand: "echo hello world" },
      { command: "git", args: ["status"], fullCommand: "git status" },
    ]);
    assert.equal(parser.extractCommands('echo "unterminated'), null);
    if (process.platform === "darwin" && process.arch === "arm64") {
      const command = join(root, "vendor/ripgrep/arm64-darwin/rg");
      const workspace = await mkdtemp(join(tmpdir(), "axon-native-rg-"));
      try {
        await writeFile(join(workspace, "owned.txt"), "first\nresource-match-719\nlast\n");
        const { stdout } = await promisify(execFile)(command,
          ["--line-number", "resource-match-719", "owned.txt"], { cwd: workspace, timeout: 5000 });
        assert.equal(stdout.trim(), "2:resource-match-719");
      } finally {
        await rm(workspace, { recursive: true, force: true });
      }
    }
  } finally {
    runtime.closeContext();
  }
});
