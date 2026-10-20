import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { ModelBehaviorError } from "@openai/agents-core";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedInterruptionResult } from "./helpers/captured-interruption-result.js";
import {
  interruptionResultFixture,
  type DispatchCase,
} from "./helpers/interruption-result-fixtures.js";
import { StreamTimeoutError } from "../src/models/model-transport.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedInterruptionResult(source);
const port = ts
  .transpileModule(
    await readFile(
      new URL(
        "../src/permissions/native-interruption-result-dispatcher.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  )
  .outputText.replace(
    /runtime\.subscribe\(eA,\s*async/,
    "eA.resultSubject.subscribe(async",
  );
const classes: any[] = [];
function walk(node: any, list: any[]) {
  if (!node || typeof node !== "object") return;
  if (node.type === "ClassDeclaration" || node.type === "ClassExpression")
    list.push(node);
  for (const [key, value] of Object.entries(node))
    if (!["start", "end"].includes(key)) {
      if (Array.isArray(value)) value.forEach((item) => walk(item, list));
      else if (value && typeof value === "object") walk(value, list);
    }
}
walk(parse(port, { ecmaVersion: "latest", sourceType: "module" }), classes);
const recovered = classes.find(
    (node) => node.id?.name === "NativeInterruptionResultDispatcher",
  ),
  captured: any = (
    parse(`(${source.slice(11047102, 11089570)})`, { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
const ast = (value: any): any =>
  value && typeof value === "object"
    ? Array.isArray(value)
      ? value.map(ast)
      : Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => !["start", "end", "raw"].includes(key))
            .map(([key, item]) => [key, ast(item)]),
        )
    : value;
const methods = [
  "startupProfiler",
  "waitFor",
  "continueAgentWithMessage",
  "sanitizeToolNotFoundMessage",
  "hasRecentModelErrorRetry",
  "hasRecentNetworkErrorRetry",
  "incrementStreamTimeoutRetryCount",
  "hasRecentStreamTimeoutRetry",
];
for (const name of methods)
  assert.deepEqual(
    ast(recovered.body.body.find((node: any) => node.key?.name === name)),
    ast(captured.body.body.find((node: any) => node.key?.name === name)),
    `Complete method AST: ${name}`,
  );
let comparisons = 0;
const norm = (value: any) =>
  JSON.parse(
    JSON.stringify(value, (key, item) =>
      key === "id" || key === "parentId" ? "UUID" : item,
    ),
  );
async function compare(spec: DispatchCase) {
  const actual = interruptionResultFixture(spec),
    expected = interruptionResultFixture(spec, original);
  assert.deepEqual(
    norm(await actual.execute()),
    norm(await expected.execute()),
    JSON.stringify({ ...spec, error: spec.error?.message }),
  );
  comparisons++;
}
for (const agent of ["default", "other", "missing"] as const)
  for (const child of [false, true])
    for (const aborted of [false, true])
      for (const interruptions of [false, true])
        for (const continuation of [false, true])
          for (const stopActive of [false, true])
            for (const final of [false, true])
              for (const deferred of [false, true]) {
                await compare({
                  agent,
                  child,
                  aborted,
                  interruptions,
                  continuation,
                  stopActive,
                  final,
                  deferred,
                });
              }
const errors = [
  () => new Error("owned failure"),
  () => Object.assign(new Error("reset"), { code: "ECONNRESET" }),
  () => new SyntaxError("bad owned JSON"),
  () => new ModelBehaviorError("Tool Missing not found in agent Default."),
  () => new StreamTimeoutError(1000, 1, 20),
  () => new StreamTimeoutError(1000, 0, 0, true),
  () => ({
    message: "owned wrapped",
    error: new ModelBehaviorError("invalid owned output"),
  }),
  () => Object.assign(new Error("owned auth"), { status: 401 }),
];
for (const makeError of errors)
  for (const child of [false, true])
    for (const aborted of [false, true])
      for (const silent of [false, true])
        for (const pending of [false, true])
          for (const retryCap of [false, true])
            for (const deferred of [false, true]) {
              await compare({
                error: makeError(),
                child,
                aborted,
                silent,
                pending,
                retryCap,
                deferred,
              });
            }
for (const agent of ["default", "other", "missing"] as const)
  for (const continuation of [false, true])
    await compare({ agent, continuation, stopThrows: true });
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMethodAsts: methods.length,
      comparisons,
      source: "WorkBuddy 5.3.14 fixed SHA",
      scope:
        "complete InterruptionService.waitFor, continuation wait, retry helpers; approval queue/handleInterruptions remain a separate boundary",
    },
    null,
    2,
  ),
);
