import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  CoreSearchTools,
  formatGrepResult,
} from "../src/tools/core-search-tools.js";

async function searchFixture(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-search-"));
  await mkdir(join(directory, "src"));
  await mkdir(join(directory, "node_modules"));
  await writeFile(join(directory, "src", "a.ts"), "alpha\nneedle one\nneedle two\n");
  await writeFile(join(directory, "src", "b.ts"), "beta\nneedle three\n");
  await writeFile(join(directory, "src", "ignored.js"), "needle js\n");
  await writeFile(join(directory, "node_modules", "hidden.ts"), "needle hidden\n");
  return directory;
}

test("Glob uses WorkBuddy schema, exclusions, absolute paths, and pagination", async () => {
  const directory = await searchFixture();
  const tools = new CoreSearchTools({ workDir: directory });
  const all = await tools.glob({ pattern: "*.ts", limit: 100, offset: 0 });
  assert.equal(all.title, "Found 2 files");
  const paths = all.content as string[];
  assert.equal(paths.every((path) => path.startsWith(directory)), true);
  assert.equal(paths.some((path) => path.includes("node_modules")), false);

  const page = await tools.glob({ pattern: "*.ts", limit: 1, offset: 1 });
  assert.equal(page.title, "Found 2 files");
  assert.equal((page.content as string[]).length, 1);

  const empty = await tools.glob({ pattern: "*.go", limit: 100, offset: 0 });
  assert.deepEqual(empty, {
    title: "Found 0 files",
    content: "No files found",
    renderer: { type: "list" },
  });
});

test("Grep supports files, count, content and implicit content mode", async () => {
  const directory = await searchFixture();
  const tools = new CoreSearchTools({ workDir: directory });

  const files = await tools.grep({
    pattern: "needle",
    glob: "*.ts",
    output_mode: "files_with_matches",
  });
  assert.equal(files.title, "Found 2 files");
  assert.equal((files.content as string[]).length, 2);

  const counts = await tools.grep({
    pattern: "needle",
    glob: "*.ts",
    output_mode: "count",
  });
  assert.equal(counts.title, "Found 3 matches");

  const content = await tools.grep({
    pattern: "needle",
    glob: "*.ts",
    "-n": true,
    head_limit: 1,
  });
  assert.equal(content.title, "Found 1 lines");
  assert.match((content.content as string[])[0]!, /:\d+:needle/);
});

test("Grep result formatting preserves count aggregation and empty wording", () => {
  assert.deepEqual(formatGrepResult("a:2\nb:3\n", "count"), {
    title: "Found 5 matches",
    content: ["a:2", "b:3"],
    renderer: { type: "list" },
  });
  assert.equal(
    formatGrepResult("", "files_with_matches").content,
    "No files found",
  );
  assert.equal(formatGrepResult("", "content").content, "No matches found");
});

test("search parameter errors retain observable WorkBuddy messages", async () => {
  const directory = await searchFixture();
  const tools = new CoreSearchTools({ workDir: directory });
  await assert.rejects(
    () => tools.glob({ pattern: "", limit: 100, offset: 0 }),
    /pattern.*cannot be empty/i,
  );
  await assert.rejects(
    () => tools.grep({ pattern: "" }),
    /grep error: Pattern cannot be empty/,
  );
  await assert.rejects(
    () => tools.grep({ pattern: "[", output_mode: "content" }),
    /grep error: Error during grep search operation/,
  );
});
