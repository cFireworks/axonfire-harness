import assert from "node:assert/strict";
import { Agent } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents-core";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import type { AgentService } from "../src/agents/agent-service.js";
import { MemoryExtractionService } from "../src/memory/memory-extraction-service.js";
import { buildExtractPrompt, loadMemoryPolicy } from "../src/memory/memory-extraction-prompts.js";
import { formatMemoryManifest, parseYamlFrontmatter, scanMemoryFiles } from "../src/memory/memory-store.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { HarnessSession } from "../src/sessions/session.js";

test("memory scanner reads bounded frontmatter, excludes entrypoints, and formats target manifest", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "workbuddy-memories-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "nested"));
  await writeFile(join(root, "MEMORY.md"), "index");
  await writeFile(join(root, "nested", "testing.md"), "---\nname: Testing\ndescription: Real database\ntype: feedback\n---\nUse integration tests.");
  const files = await scanMemoryFiles(root);
  assert.equal(files.length, 1);
  assert.equal(files[0]?.filename, "nested/testing.md");
  assert.equal(files[0]?.type, "feedback");
  assert.match(formatMemoryManifest(files), /- \[feedback\] nested\/testing.md \(.+\): Testing: Real database/);
  const controller = new AbortController(); controller.abort();
  assert.deepEqual(await scanMemoryFiles(root, controller.signal), []);
});

test("memory frontmatter preserves folded text, list fields, booleans, and numeric fields", () => {
  const value = parseYamlFrontmatter("---\ndescription: >\n  first line\n  second line\ntags:\n - one\n - two\nenabled: false\nweight: 3\n---\nbody");
  assert.deepEqual(value, { description: "first line second line", tags: ["one", "two"], enabled: false, weight: 3 });
});

test("memory extraction prompt verifies original policy data and includes four semantic types", async () => {
  const policy = await loadMemoryPolicy();
  assert.equal(policy.MAX_ENTRYPOINT_LINES, 200);
  assert.equal(policy.MAX_ENTRYPOINT_BYTES, 40_000);
  const prompt = await buildExtractPrompt(6, "- existing.md");
  assert.match(prompt, /most recent ~6 messages/);
  for (const type of ["user", "feedback", "project", "reference"]) assert.ok(prompt.includes(`<name>${type}</name>`));
  assert.ok(prompt.includes("- existing.md"));
  assert.ok(prompt.includes("NO_EXTRACTION_NEEDED"));
});

test("memory cursor counts only new turns and detects the installed assistant tool-write shape", () => {
  const extraction = new MemoryExtractionService({} as AgentService);
  const history = [
    { id: "u", type: "message", role: "user", content: "remember" },
    { id: "a", type: "message", role: "assistant", content: "ok" },
  ] as AgentInputItem[];
  assert.equal(extraction.countNewMessages(history), 2);
  extraction.advanceCursor(history);
  assert.equal(extraction.countNewMessages(history), 0);
  history.push({ id: "write", type: "message", role: "assistant", content: [{ type: "tool_use", name: "Write", input: { file_path: "/memory/user.md" } }] } as any);
  assert.equal(extraction.countNewMessages(history), 1);
  assert.equal(extraction.hasMemoryWritesSince(history, "/memory"), true);
});

test("memory extractor isolates transcript and restores permission and purpose on failure", async () => {
  let observed: HarnessSession | undefined;
  const service = {
    runTransientAgent: async (_agent: unknown, _input: unknown, context: HarnessSession) => {
      observed = context;
      assert.equal(context.options.sessionPersistence, false);
      assert.equal(context.agentPurpose, "memory_extraction");
      throw new Error("model failed");
    },
  } as unknown as AgentService;
  const session = new HarnessSession("main", { agentPurpose: "conversation" });
  session.permissionModeSubject.next(PermissionMode.Plan);
  const agent = new Agent<HarnessSession>({ name: "cli", instructions: "test" });
  await assert.rejects(new MemoryExtractionService(service).extract(agent, session, [], "save"), /model failed/);
  assert.notEqual(observed, session);
  assert.equal(session.history.length, 0);
  assert.equal(session.agentPurpose, "conversation");
  assert.equal(session.permissionModeSubject.value, PermissionMode.Plan);
});
