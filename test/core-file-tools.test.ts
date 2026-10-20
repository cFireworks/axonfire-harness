import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  CoreFileTools,
  READ_MAX_LINE_LENGTH,
  applyTextReplacement,
} from "../src/tools/core-file-tools.js";

test("Read preserves WorkBuddy line numbering, paging, and truncation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-read-"));
  const path = join(directory, "sample.txt");
  await writeFile(
    path,
    `first\n${"x".repeat(READ_MAX_LINE_LENGTH + 3)}\nthird\nfourth`,
  );
  const tools = new CoreFileTools({ workDir: directory });
  const result = await tools.read({ file_path: "sample.txt", offset: 2, limit: 2 });
  assert.equal(result.title, "Read 2 lines");
  assert.match(String(result.content), /^\s+2→x+/);
  assert.match(String(result.content), /\.\.\. \[truncated\]\n\s+3→third$/);
  assert.equal(tools.readFileState.hasBeenRead(path), true);
});

test("Read returns structured errors for directories, missing files, and offsets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-read-errors-"));
  await writeFile(join(directory, "visible.ts"), "export {};\n");
  const tools = new CoreFileTools({ workDir: directory });

  const directoryResult = await tools.read({ file_path: "." });
  assert.match(String(directoryResult.content), /Path is a directory/);
  assert.match(String(directoryResult.content), /📄 visible\.ts/);
  assert.equal(
    directoryResult.rawResponse?.tool_error_code,
    "ReadFilePathError",
  );

  const missing = await tools.read({ file_path: "missing.ts" });
  assert.equal(
    missing.content,
    "<tool_use_error>File does not exist.</tool_use_error>",
  );
  assert.equal(
    missing.rawResponse?.tool_error_code,
    "ReadFileNotFoundError",
  );

  const offset = await tools.read({ file_path: "visible.ts", offset: 20 });
  assert.match(String(offset.content), /Offset 20 is beyond file end/);
  assert.equal(
    offset.rawResponse?.tool_error_code,
    "ReadFileOffsetBeyondEOFError",
  );
});

test("Edit enforces read-before-write and changed-since-read", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-edit-"));
  const path = join(directory, "sample.txt");
  await writeFile(path, "before\n");
  const tools = new CoreFileTools({ workDir: directory });

  await assert.rejects(
    () =>
      tools.edit({
        file_path: "sample.txt",
        old_string: "before",
        new_string: "after",
        replace_all: false,
      }),
    /File has not been read yet/,
  );

  await tools.read({ file_path: "sample.txt" });
  await writeFile(path, "changed externally and longer\n");
  await assert.rejects(
    () =>
      tools.edit({
        file_path: "sample.txt",
        old_string: "before",
        new_string: "after",
        replace_all: false,
      }),
    /File has been modified since read/,
  );
});

test("Edit replaces uniquely or all occurrences and can create with empty old_string", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-replace-"));
  const path = join(directory, "sample.txt");
  await writeFile(path, "same same");
  const tools = new CoreFileTools({ workDir: directory });
  await tools.read({ file_path: "sample.txt" });

  await assert.rejects(
    () =>
      tools.edit({
        file_path: "sample.txt",
        old_string: "same",
        new_string: "new",
        replace_all: false,
      }),
    /Found 2 matches/,
  );
  const result = await tools.edit({
    file_path: "sample.txt",
    old_string: "same",
    new_string: "new",
    replace_all: true,
  });
  assert.equal(result.title, "Made 2 replacements");
  assert.equal(await readFile(path, "utf8"), "new new");

  const created = await tools.edit({
    file_path: "created.txt",
    old_string: "",
    new_string: "created",
    replace_all: false,
  });
  assert.equal(created.title, "Made 1 replacement");
  assert.equal(await readFile(join(directory, "created.txt"), "utf8"), "created");
});

test("Write preserves CRLF and adds UTF-8 BOM for a new CSV", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-write-"));
  const tools = new CoreFileTools({ workDir: directory });
  await writeFile(join(directory, "existing.txt"), "a\r\nb\r\n");

  await tools.write({ file_path: "existing.txt", content: "c\nd\n" });
  assert.equal(await readFile(join(directory, "existing.txt"), "utf8"), "c\r\nd\r\n");

  const result = await tools.write({ file_path: "new.csv", content: "a,b\n1,2" });
  const bytes = await readFile(join(directory, "new.csv"));
  assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.match(String(result.content), /Successfully created/);
});

test("replacement helper rejects ambiguous and missing matches", () => {
  assert.throws(
    () => applyTextReplacement("a a", "a", "b"),
    /Found 2 matches/,
  );
  assert.throws(
    () => applyTextReplacement("a", "missing", "b"),
    /not found/,
  );
  assert.equal(applyTextReplacement("a a", "a", "b", true), "b b");
});
