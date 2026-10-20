import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, readdir, stat, open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, Runner, Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SkillManageTool, SKILL_REGISTRY_FILENAME } from "../src/tools/skill-manage-tool.js";
import { NotebookEditTool, notebookEditParameters } from "../src/tools/notebook-edit-tool.js";
import { StructuredOutputTool } from "../src/tools/structured-output-tool.js";
import { StructuredOutputContextFactory, StructuredOutputSessionStartHook, StructuredOutputStopHook } from "../src/structured-output/structured-output-context.js";

setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) { const value = await mkdtemp(join(tmpdir(), "harness-management-notebook-")); t.after(() => rmDirectory(value)); return value; }
async function rmDirectory(directory: string) { const { rm } = await import("node:fs/promises"); await rm(directory, { recursive: true, force: true }); }
function modelFixture(response: (request: any, count: number) => any[]): Model { let count = 0; return { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse(request) { yield { type: "response_started" }; yield { type: "response_done", response: { id: `r-${++count}`, output: response(request, count), usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any; } }; }
const call = (name: string, args: object, id: string) => [{ type: "function_call", name, callId: id, id, status: "completed", arguments: JSON.stringify(args) }];
const answer = (text: string) => [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text }] }];

test("SkillManage feature gate, create/modify/delete instructions and registry never mutate the skill directory", async (t) => {
  const root = await directory(t), owned = join(root, "owned"), thirdParty = join(root, "third");
  for (const path of [owned, thirdParty]) await mkdir(path);
  await writeFile(join(owned, "SKILL.md"), "---\nname: owned\nagent_created: true\n---\nbody");
  await writeFile(join(thirdParty, "SKILL.md"), "---\nname: third\n---\nbody");
  const skills = [{ name: "owned", instructions: "body", baseDirectory: owned, location: join(owned, "SKILL.md") }, { name: "third", instructions: "body", baseDirectory: thirdParty, location: join(thirdParty, "SKILL.md") }];
  const tool = new SkillManageTool(async () => ({ skills, productFeatures: { SkillManage: false } }), () => root);
  assert.equal(await tool.isEnabled(), false);
  const before = await readdir(root);
  assert.match((await tool.execute({ action: "create", name: "fresh" })).content, /agent_created: true/);
  assert.match((await tool.execute({ action: "create", name: "owned" })).content, /already exists/);
  assert.match((await tool.execute({ action: "modify", name: "third" })).content, /cannot be modified/);
  assert.match((await tool.execute({ action: "delete", name: "owned" })).content, /Confirm with the user/);
  assert.deepEqual(await readdir(root), before); assert.equal((await stat(join(owned, "SKILL.md"))).isFile(), true);
  await writeFile(join(root, SKILL_REGISTRY_FILENAME), JSON.stringify({ skills: [{ name: "third", createdAt: "fixture", skillDir: "third" }] }));
  assert.match((await tool.execute({ action: "modify", name: "third" })).content, /Use the Read tool/);
  await writeFile(join(root, SKILL_REGISTRY_FILENAME), "invalid JSON"); assert.deepEqual(tool.readRegistry(), { skills: [] });
});

test("SkillManage list caps full entries at 30, handles ambiguous suffixes, directory limits and 30k output truncation", async (t) => {
  const root = await directory(t), skills = Array.from({ length: 32 }, (_, index) => ({ name: `skill${index}`, instructions: "", description: `description${index}`, location: `/fixture/${index}`, agentCreated: index === 31 }));
  const tool = new SkillManageTool(async () => ({ skills }), () => root);
  const list = (await tool.handleList()).content;
  assert.match(list, /Other skills \(2, names only\)/); assert.ok(!list.includes("description30")); assert.match(list, /skill31 \[agent_created\]/);
  assert.equal(tool.findSkillByName([{ name: "a:x", instructions: "" }, { name: "b:x", instructions: "" }], "x"), undefined);
  assert.equal(tool.findSkillByName([{ name: "a:x", instructions: "" }], "x")?.name, "a:x");
  await mkdir(join(root, "nested")); for (let index = 0; index < 102; index++) await writeFile(join(root, "nested", `${index}.txt`), "");
  assert.match(tool.listDirectoryContents(root), /more entries not shown/);
  assert.equal(tool.truncateOutput("x".repeat(30001)).length, 30000 + "\n... [output truncated after 30000 characters] ...".length);
});

test("NotebookEdit preserves implicit insert versus advertised replace default, normalization, fuzzy ids and notebook validation", async (t) => {
  const root = await directory(t), tool = new NotebookEditTool(), filename = join(root, "new.ipynb");
  assert.equal(notebookEditParameters.parse({ notebook_path: filename, new_source: "x" }).edit_mode, "replace");
  await assert.rejects(tool.execute({ notebook_path: filename, new_source: "x" }), /cell_type is required when edit_mode is insert/);
  await tool.execute({ notebook_path: filename, new_source: "first\n", cell_type: "markdown" });
  const notebook = await tool.readNotebookFile(filename);
  assert.equal(notebook.cells[0]!.cell_type, "code", "original new-notebook path always creates a code cell");
  assert.deepEqual(notebook.cells[0]!.source, ["first\n", ""]);
  assert.deepEqual(tool.normalizeSource("a\r\nb"), ["a\n", "b"]);
  assert.equal(tool.findCellIndexById([{ id: "ABCDEF", cell_type: "code", source: [] }], "bcd"), 0);
  assert.equal(tool.findCellIndexById([{ cell_type: "code", source: [] }], "unknown"), 0, "preserve the source empty-id partial-match edge case");
  assert.equal(tool.validateToolParams({ notebook_path: "relative.ipynb", new_source: "" }), "Notebook path must be absolute, not relative");
  await writeFile(filename, '{"cells":[],"nbformat":"4"}'); await assert.rejects(tool.readNotebookFile(filename), /missing or invalid nbformat/);
  const sparse = await open(filename, "w"); try { await sparse.truncate(50 * 1024 * 1024 + 1); } finally { await sparse.close(); }
  await assert.rejects(tool.readNotebookFile(filename), /Notebook file is too large \(50MB\)/);
  await assert.rejects(tool.readNotebookFile(root), /Path is not a file/);
});

test("NotebookEdit insert/replace/delete preserve output and execution-count quirks, refresh read state and report changes", async (t) => {
  const root = await directory(t), filename = join(root, "fixture.ipynb"), reports: any[] = [];
  const tool = new NotebookEditTool(undefined, { reportFileAction: (...args) => reports.push(args) });
  await writeFile(filename, JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { fixture: true }, cells: [{ id: "code", cell_type: "code", source: ["old"], execution_count: 7, outputs: [{ output_type: "stream", text: "old" }] }] }));
  await tool.execute({ notebook_path: filename, cell_id: "code", new_source: "new" });
  let notebook = await tool.readNotebookFile(filename); assert.equal(notebook.cells[0]!.execution_count, 7); assert.equal(notebook.cells[0]!.outputs?.length, 1);
  await tool.execute({ notebook_path: filename, cell_id: "code", new_source: "# markdown", cell_type: "markdown" });
  notebook = await tool.readNotebookFile(filename); assert.equal("outputs" in notebook.cells[0]!, false);
  await tool.execute({ notebook_path: filename, cell_id: "code", new_source: "back to code", cell_type: "code" });
  notebook = await tool.readNotebookFile(filename); assert.equal("execution_count" in notebook.cells[0]!, false); assert.deepEqual(notebook.cells[0]!.outputs, []);
  await tool.execute({ notebook_path: filename, edit_mode: "insert", new_source: "inserted", cell_type: "code", cell_id: "code" });
  assert.equal((await tool.readNotebookFile(filename)).cells.length, 2);
  await tool.execute({ notebook_path: filename, edit_mode: "delete", cell_id: "1", new_source: "" });
  assert.equal((await tool.readNotebookFile(filename)).cells.length, 1); assert.equal(tool.readFileState.hasBeenRead(filename), true); assert.equal(reports.length, 5);
});

test("StructuredOutput resolves dynamic schemas, enforces AJV, captures raw/wrapped output and preserves cached schema identity", async () => {
  const session = new HarnessSession("output"), contexts = new StructuredOutputContextFactory(), context = contexts.getOrCreate(session);
  const tool = new StructuredOutputTool(() => session, contexts);
  assert.equal(tool.isEnabled(session), false); assert.deepEqual((await tool.parameters()).required, ["data"]);
  assert.equal((await tool.execute({}, undefined)).error, "No session context");
  await tool.execute({ data: { wrapped: true } }, { context: session } as any); assert.deepEqual(context.output, { wrapped: true });
  const schema = { type: "object", properties: { count: { type: "integer" } }, required: ["count"], additionalProperties: false };
  session.options.jsonSchema = schema; assert.equal(await tool.parameters(), schema);
  assert.match((await tool.execute({ count: "wrong" }, { context: session } as any)).error!, /Schema validation failed/);
  await tool.execute({ count: 2 }, { context: session } as any); assert.deepEqual(session.structuredOutput, { count: 2 });
  schema.required.push("newRequired"); await tool.parameters(); assert.equal((await tool.execute({ count: 2 }, { context: session } as any)).error, undefined, "source does not recompile a schema mutated in place");
  session.options.jsonSchema = "not JSON"; assert.deepEqual((await tool.parameters()).required, ["data"]);
});

test("StructuredOutput start/stop hooks preserve format gates, invalid JSON feedback, 4-attempt ceiling, meta messages and completion", async () => {
  const session = new HarnessSession("hooks"), contexts = new StructuredOutputContextFactory(), warnings: string[] = [], registered: Promise<void>[] = [];
  const start = new StructuredOutputSessionStartHook(contexts, { registerCompletion: (_session, promise) => registered.push(promise) }, { warn: (message) => warnings.push(message) }), stop = new StructuredOutputStopHook(contexts);
  session.options.jsonSchema = "{}"; await start.execute({ session }); assert.equal(contexts.get(session), undefined); assert.equal(warnings.length, 1);
  session.options.outputFormat = "json"; session.options.jsonSchema = "{"; assert.equal((await start.execute({ session }))?.allowed, false);
  session.options.jsonSchema = '{"type":"object"}'; await start.execute({ session }); assert.equal(registered.length, 1);
  for (let attempt = 1; attempt <= 3; attempt++) { const feedback = await stop.execute({ session }); assert.match((feedback!.continueRequest.message as any).content, /You MUST call/); assert.equal(feedback!.continueRequest.message.providerData?.isMeta, true); }
  assert.equal(await stop.execute({ session }), undefined); await registered[0];
  contexts.dispose(session); assert.equal(contexts.get(session), undefined);
});

test("real SDK StructuredOutput retries an ordinary final answer, validates tool input, captures JSON and completes without extra retry", async (t) => {
  const root = await directory(t), requests: any[] = [];
  const schema = '{"type":"object","properties":{"answer":{"type":"integer"}},"required":["answer"],"additionalProperties":false}';
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? answer("ordinary answer") : count === 2 ? call("StructuredOutput", { answer: "invalid" }, "bad-output") : count === 3 ? call("StructuredOutput", { answer: 42 }, "good-output") : answer("complete"); });
  const runtime = await createHarness({ workDir: root, jsonSchema: schema, outputFormat: "json", modelProvider: { getModel: () => model }, approveTool: (name) => name === "StructuredOutput" }); t.after(() => runtime.close());
  const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "return JSON"), "complete");
  assert.deepEqual(session.structuredOutput, { answer: 42 }); assert.equal(requests.length, 4);
  assert.match(JSON.stringify(requests[1].input), /You MUST call the StructuredOutput tool/);
  assert.match(JSON.stringify(requests[2].input), /Output does not match required schema/);
  assert.deepEqual(requests[0].tools.find((tool: any) => tool.name === "StructuredOutput").parameters, JSON.parse(schema));
  await runtime.structuredContexts.get(session)!.completionDeferred.promise;
});

test("real SDK structured-output retry stops after four ordinary final responses and format-disabled mode does not force retries", async (t) => {
  const root = await directory(t); let count = 0;
  const model = modelFixture((_request, current) => { count = current; return answer("no tool"); });
  const runtime = await createHarness({ workDir: root, jsonSchema: '{"type":"object"}', outputFormat: "json", modelProvider: { getModel: () => model } }); t.after(() => runtime.close());
  const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "try"), "no tool"); assert.equal(count, 4); assert.equal(session.structuredOutput, undefined);
  const plain = await runtime.openSession(undefined, { outputFormat: "text" }); await runtime.prompt(plain, "no forced tool"); assert.equal(count, 5);
});

test("dynamic SDK schemas follow the run session rather than the most recently opened session", async (t) => {
  const root = await directory(t), schemas: string[] = [];
  const model = modelFixture((request, count) => {
    if (count % 2 === 0) return answer("captured");
    const schema = request.tools.find((tool: any) => tool.name === "StructuredOutput").parameters;
    const key = Object.keys(schema.properties)[0]!; schemas.push(key);
    return call("StructuredOutput", { [key]: key === "count" ? 1 : "text" }, `capture-${count}`);
  });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, outputFormat: "json", approveTool: () => true }); t.after(() => runtime.close());
  const first = await runtime.openSession(undefined, { jsonSchema: { type: "object", properties: { count: { type: "integer" } }, required: ["count"] } });
  const second = await runtime.openSession(undefined, { jsonSchema: { type: "object", properties: { label: { type: "string" } }, required: ["label"] } });
  await runtime.prompt(first, "first schema"); await runtime.prompt(second, "second schema");
  assert.deepEqual(schemas, ["count", "label"]); assert.deepEqual(first.structuredOutput, { count: 1 }); assert.deepEqual(second.structuredOutput, { label: "text" });
});

test("SDK SkillManage respects false product feature then runs guidance after an explicit in-memory feature overlay", async (t) => {
  const root = await directory(t), requests: any[] = [];
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? call("ToolSearch", { tool_names: ["SkillManage"] }, "search") : count === 2 ? call("DeferExecuteTool", { toolName: "SkillManage", params: { action: "create", name: "new-skill" } }, "manage") : answer("guidance read"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: (name) => name === "SkillManage" }); t.after(() => runtime.close());
  assert.equal(await runtime.skillManageTool.isEnabled(), false);
  runtime.product.raw.productFeatures = { ...(runtime.product.raw.productFeatures as object), SkillManage: true };
  const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "create a skill"), "guidance read");
  assert.match(JSON.stringify(requests[2].input), /SKILL.md template/);
  await assert.rejects(stat(join(root, ".workbuddy-harness", "skills", "new-skill")), /ENOENT/);
});

test("legacy NotebookEdit runs through explicit SDK registration without changing the original agent allowlists", async (t) => {
  const root = await directory(t), filename = join(root, "sdk.ipynb"), requests: any[] = [];
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? call("NotebookEdit", { notebook_path: filename, new_source: "print(42)", cell_type: "code" }, "notebook") : answer("notebook ready"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: (name) => name === "NotebookEdit" }); t.after(() => runtime.close());
  const session = await runtime.openSession(); assert.equal((await runtime.agents.getDefault()).tools.some((tool) => tool.name === "NotebookEdit"), false);
  const tools = await runtime.tools.buildTools(["NotebookEdit"], { name: "notebook-fixture" });
  const result = await new Runner({ modelProvider: { getModel: () => model }, tracingDisabled: true }).run(new Agent<HarnessSession>({ name: "notebook-fixture", model: "fixture", tools }), "edit notebook", { context: session, stream: true });
  for await (const _event of result) { /* drive actual SDK execution */ } await result.completed;
  assert.equal(result.finalOutput, "notebook ready"); assert.match(await readFile(filename, "utf8"), /print\(42\)/); assert.match(JSON.stringify(requests[1].input), /Created new notebook/);
});
