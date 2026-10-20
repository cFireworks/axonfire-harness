import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { z as z3 } from "zod3";
import { Ajv } from "ajv";
import { SkillManageTool, skillManageParameters, SKILL_REGISTRY_FILENAME } from "../src/tools/skill-manage-tool.js";
import { NotebookEditTool, notebookEditParameters } from "../src/tools/notebook-edit-tool.js";
import { StructuredOutputTool } from "../src/tools/structured-output-tool.js";
import { StructuredOutputContextFactory, StructuredOutputContext, StructuredOutputSessionStartHook, StructuredOutputStopHook, STRUCTURED_OUTPUT_FEEDBACK_TEMPLATE } from "../src/structured-output/structured-output-context.js";
import { HarnessSession } from "../src/sessions/session.js";

const bundle = process.argv[2]; if (!bundle) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await fs.readFile(bundle, "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const directory = await fs.mkdtemp(path.join(tmpdir(), "harness-original-management-diff-"));
const logger = { debug() {}, info() {}, warn() {}, error() {}, setContext() {} };
// VM intrinsics and fs/Zod errors come from distinct realms. Product code runs in one realm.
const CrossRealmError: ErrorConstructor = new Proxy(Error, { get(target, key, receiver) { return key === Symbol.hasInstance ? (value: unknown) => Object.prototype.toString.call(value) === "[object Error]" : Reflect.get(target, key, receiver); } });
function evaluate(text: string, context: any = {}): any { return runInNewContext(text, { Error: CrossRealmError, process, Date, Math, Map, Set, ...context }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
const OriginalMarkdown = evaluate(`(class MarkdownUtils{${source.slice(13250062, source.indexOf(";var tY=", 13250062))})`);
const zodEnd = source.indexOf("(eB||(eB={}))", 13261704) + "(eB||(eB={}))".length;
const ZodUtils = evaluate(`(()=>{let eB;${source.slice(13261704, zodEnd)};return eB})()`);
const schema = (start: string, stop: string, offset: number) => { const index = source.indexOf(start, offset); assert.ok(index > offset); return evaluate(`(${source.slice(index + start.length, source.indexOf(stop, index))})`, { iJ: { z: z3 } }); };
const manageSchema = schema("lz=", ",lW=class", 11929000), notebookSchema = schema("s5=", ",s6=class", 11843000);
const shared: any = { iz: { BaseTool: class {} }, SandboxPermissionFileTool: class {}, nC: { ToolNames: { SKILL_MANAGE: "SkillManage", STRUCTURED_OUTPUT: "StructuredOutput" }, ToolArgType: { FilePath: "filePath" } },
  n2: fsSync, n4: path, ok: fs, lz: manageSchema, s5: notebookSchema, "l$": SKILL_REGISTRY_FILENAME, lY: 30000, lJ: 30, lq: 100,
  nW: { ZodUtils, MarkdownUtils: OriginalMarkdown, PathUtils: { getHomeSkillsDir: () => directory }, ThemeUtils: { chalk: { success: (value: string) => value } } }, nq: { ProductFeature: { SkillManage: "SkillManage" } } };
const OriginalManage = evaluate(`(${source.slice(11929601, 11938484)})`, shared), OriginalNotebook = evaluate(`(${source.slice(11844914, 11851712)})`, shared);
const feedback = source.slice(11381000, 11382000).match(/ep=`([\s\S]*?)`/)![1]!;
class Deferred { resolve!: () => void; readonly promise = new Promise<void>((resolve) => { this.resolve = resolve; }); }
const contextStart = source.indexOf("class StructuredOutputContextImpl{"), contextEnd = source.indexOf(";let pf=", contextStart);
const OriginalContext = evaluate(`(${source.slice(contextStart, contextEnd)})`, { o6: { DEFAULT_MAX_RETRIES: 4 }, r6: { Deferred } });
const factoryStart = 8962712 + 3, factoryEnd = source.indexOf(";pf=structured_output_context_decorate", factoryStart);
const OriginalFactory = evaluate(`(${source.slice(factoryStart, factoryEnd)})`, { StructuredOutputContextImpl: OriginalContext });
const hookContext = { oH: { HookEvent: { SESSION_START: "SessionStart", STOP: "Stop" }, HookPriority: { StructuredOutput: 200 } }, o6: { STRUCTURED_OUTPUT_FEEDBACK_TEMPLATE: feedback } };
const OriginalStart = evaluate(`(${source.slice(8486296, source.indexOf(";structured_output_session_start_hook_decorate", 8486296))})`, hookContext), OriginalStop = evaluate(`(${source.slice(8484193, 8485073)})`, hookContext);
let current: HarnessSession | undefined; const beforeFactory = new OriginalFactory(), afterFactory = new StructuredOutputContextFactory();
const OriginalOutput = evaluate(`(${source.slice(11998971, 12000593)})`, { ...shared, cf: () => Ajv, sd: { SessionManager: "sessions" }, cm: { StructuredOutputContextFactory: "outputs" }, nk: { ContainerUtil: { get: (token: string) => token === "sessions" ? { getCurrent: () => current } : beforeFactory } } });
let comparisons = 0;
const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function equal(actual: any, expected: any) { assert.deepEqual(plain(actual), plain(expected)); comparisons++; }
async function outcome(action: () => any): Promise<any> { try { return { result: await action() }; } catch (error) { return { error: error instanceof CrossRealmError ? error.message : String(error) }; } }
const random = Math.random; Math.random = () => .5;
try {
  let configuration: any = { skills: [], productFeatures: {} };
  const captured = new OriginalManage(); captured.logger = logger; captured.productManager = { waitConfiguration: async () => configuration };
  const recovered = new SkillManageTool(async () => configuration, () => directory);
  for (const enabled of [undefined, false, true]) { configuration.productFeatures.SkillManage = enabled; equal(await recovered.isEnabled(), await captured.isEnabled()); }
  for (const value of [{}, { action: "list" }, { action: "unknown" }, { action: "create" }, { action: "modify", name: " " }, { action: "delete", name: "missing" }, { action: "create", name: "new" }, { action: 1 }, { action: "create", name: 1 }]) {
    equal(skillManageParameters.safeParse(value).success, manageSchema.safeParse(value).success);
    equal(await outcome(() => recovered.execute(value as any)), await outcome(() => captured.execute(value)));
  }
  for (const name of ["new", "中文技能", "a:b", ""]) equal(recovered.generateSkillTemplate(name), captured.generateSkillTemplate(name));
  for (const size of [0, 1, 29999, 30000, 30001, 100000]) equal(recovered.truncateOutput("x".repeat(size)), captured.truncateOutput("x".repeat(size)));
  await fs.mkdir(path.join(directory, "owned")); await fs.mkdir(path.join(directory, "third"));
  await fs.writeFile(path.join(directory, "owned", "SKILL.md"), "---\nagent_created: true\n---\nbody"); await fs.writeFile(path.join(directory, "third", "SKILL.md"), "---\nagent_created: false\n---\nbody");
  configuration.skills = Array.from({ length: 35 }, (_, index) => ({ name: index === 0 ? "owned" : index === 1 ? "third" : `skill${index}`, instructions: "body", location: path.join(directory, index === 0 ? "owned" : "third", "SKILL.md"), baseDirectory: path.join(directory, index === 0 ? "owned" : "third"), description: `description${index}`, agentCreated: index === 34 }));
  equal(await recovered.handleList(), await captured.handleList());
  for (const contents of ["invalid", "{}", '{"skills":[]}', '{"skills":[{"name":"third"}]}']) {
    await fs.writeFile(path.join(directory, SKILL_REGISTRY_FILENAME), contents); equal(recovered.readRegistry(), captured.readRegistry());
    for (const name of ["owned", "third", "absent", undefined, " "]) for (const action of ["create", "modify", "delete"]) equal(await outcome(() => recovered.execute({ action, name } as any)), await outcome(() => captured.execute({ action, name })));
  }
  for (const skills of [[], [{ name: "a:x" }], [{ name: "a:x" }, { name: "b:x" }], [{ name: "x" }, { name: "a:x" }]]) for (const name of ["x", "a:x", "missing"]) equal(recovered.findSkillByName(skills as any, name), captured.findSkillByName(skills, name));
  await fs.mkdir(path.join(directory, "listing")); await fs.mkdir(path.join(directory, "listing", "nested"));
  for (let index = 0; index < 103; index++) await fs.writeFile(path.join(directory, "listing", "nested", `${index}.txt`), "");
  for (const filename of [path.join(directory, "listing"), path.join(directory, "owned"), path.join(directory, "missing")]) equal(recovered.listDirectoryContents(filename), captured.listDirectoryContents(filename));
  const oldNotebook = new OriginalNotebook(), notebook = new NotebookEditTool(); oldNotebook.readFileStateService = { refreshFile: async () => undefined }; oldNotebook.reportFileAction = () => undefined;
  const notebookPath = path.join(directory, "fixture.ipynb");
  const base = { notebook_path: notebookPath, new_source: "new", cell_id: "abc", cell_type: "code", edit_mode: "replace" };
  const inputs: any[] = [{}, { notebook_path: "relative.ipynb", new_source: "x" }, { ...base, notebook_path: "/notebook.txt" }];
  for (const field of Object.keys(base)) for (const value of [undefined, null, 1, false, [], {}, "", "bad", "code", "delete", NaN]) inputs.push({ ...base, [field]: value });
  for (const input of inputs) {
    equal(notebookEditParameters.safeParse(input).success, notebookSchema.safeParse(input).success);
    equal(notebook.validateToolParams(input), oldNotebook.validateToolParams(input));
    equal(notebook.toAutoClassifierInput(input), oldNotebook.toAutoClassifierInput(input));
  }
  for (const text of ["", "one", "one\n", "a\nb\n", "a\r\nb", "a\rb", "中文\n行"]) equal(notebook.normalizeSource(text), oldNotebook.normalizeSource(text));
  const cells = [{ id: "abcDEF", cell_type: "code", source: [] }, { id: "other", cell_type: "markdown", source: [] }, { cell_type: "code", source: [] }];
  for (const id of ["abcDEF", "abcdef", "bcd", "ABC", "other", "0", "1", "2", "3", "cell-0", "CELL-1", " cell-2 ", "missing", ""]) equal(notebook.findCellIndexById(cells, id), oldNotebook.findCellIndexById(cells, id));
  for (const text of ["", "new\n", "中文"]) { equal(notebook.createNewNotebook(text), oldNotebook.createNewNotebook(text)); for (const type of ["code", "markdown"]) equal(notebook.createNewCell(type, text), oldNotebook.createNewCell(type, text)); }
  for (const initial of [undefined, "", "invalid JSON", '{"cells":[]}', '{"cells":[],"nbformat":"4"}', JSON.stringify({ cells, nbformat: 4, metadata: {} })]) for (const mode of [undefined, "replace", "insert", "delete"]) for (const id of [undefined, "0", "missing"]) {
    const reset = async () => { if (initial === undefined) await fs.rm(notebookPath, { force: true }); else await fs.writeFile(notebookPath, initial); };
    const input = { notebook_path: notebookPath, new_source: mode === "delete" ? "" : "new\nsource", cell_type: "markdown", edit_mode: mode, cell_id: id };
    await reset(); const before = await outcome(() => oldNotebook.execute(structuredClone(input), { context: new HarnessSession("notebook") })); const beforeFile = await fs.readFile(notebookPath, "utf8").catch(() => undefined);
    await reset(); const after = await outcome(() => notebook.execute(structuredClone(input) as any, { context: new HarnessSession("notebook") } as any)); const afterFile = await fs.readFile(notebookPath, "utf8").catch(() => undefined);
    equal(after, before); equal(afterFile, beforeFile);
  }
  equal(STRUCTURED_OUTPUT_FEEDBACK_TEMPLATE, feedback);
  for (const value of [undefined, "schema", { type: "object" }]) {
    const before = new OriginalContext(value), after = new StructuredOutputContext(value);
    equal([after.enabled, after.retryCount, after.maxRetries, after.schemaString, after.hasOutput()], [before.enabled, before.retryCount, before.maxRetries, before.schemaString, before.hasOutput()]);
    for (const output of [null, false, 0, "", { fixture: true }, undefined]) { before.setOutput(output); after.setOutput(output); equal([after.output, after.hasOutput()], [before.output, before.hasOutput()]); }
    for (let attempt = 0; attempt < 6; attempt++) equal(after.incrementRetry(), before.incrementRetry());
    before.markComplete(); after.markComplete(); await Promise.all([before.completionDeferred.promise, after.completionDeferred.promise]);
  }
  const output = new StructuredOutputTool(() => current, afterFactory), oldOutput = new OriginalOutput(); oldOutput.logger = logger;
  equal(await output.execute({}), await oldOutput.execute({}));
  for (const schema of [undefined, '{"type":"object","properties":{"value":{"type":"integer"}},"required":["value"],"additionalProperties":false}', "not JSON", { type: "object", properties: { value: { type: "string" } } }, { type: "nonsense" }]) {
    current = new HarnessSession("structured"); current.options.jsonSchema = schema;
    beforeFactory.getOrCreate(current, schema); afterFactory.getOrCreate(current, schema as any);
    equal(await output.parameters(), await oldOutput.parameters()); equal(output.isEnabled(current), oldOutput.isEnabled({ runContext: { context: current } }));
    for (const value of [{}, { value: 1 }, { value: "x" }, { data: { fallback: true } }, { unexpected: false }]) {
      equal(await output.execute(value, { context: current } as any), await oldOutput.execute(value, { context: current }));
      equal(afterFactory.get(current)?.output, beforeFactory.get(current)?.output);
    }
  }
  const oldStart = new OriginalStart(), oldStop = new OriginalStop(), start = new StructuredOutputSessionStartHook(afterFactory), stop = new StructuredOutputStopHook(afterFactory);
  for (const hook of [oldStart, oldStop]) { hook.logger = logger; hook.contextFactory = beforeFactory; }
  oldStart.completionWaiter = { registerCompletion() {} };
  equal([start.event, start.priority, stop.event, stop.priority], [oldStart.event, oldStart.priority, oldStop.event, oldStop.priority]);
  for (const format of [undefined, "text", "json", "stream-json"]) for (const schema of [undefined, "{}", "{", "null", "false", { type: "object" }]) {
    const session = new HarnessSession("hooks"); session.options.outputFormat = format; session.options.jsonSchema = schema;
    equal(await start.execute({ session }), await oldStart.execute({ session }));
    for (let attempt = 0; attempt < 5; attempt++) equal(await stop.execute({ session }), await oldStop.execute({ session }));
    equal(afterFactory.get(session)?.retryCount, beforeFactory.get(session)?.retryCount);
    afterFactory.dispose(session); beforeFactory.dispose(session); equal(afterFactory.get(session), beforeFactory.get(session));
  }
} finally { Math.random = random; await fs.rm(directory, { recursive: true, force: true }); }
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle", scope: "SkillManage/NotebookEdit/StructuredOutput/context/start-stop hooks; excludes native telemetry/sandbox" }, null, 2));
