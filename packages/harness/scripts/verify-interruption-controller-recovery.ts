import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import {
  loadCapturedInterruptionController,
  loadCapturedToolApprovalServices,
} from "./helpers/captured-interruption-controller.js";
import {
  interruptionControllerFixture,
  type ControllerCase,
} from "./helpers/interruption-controller-fixtures.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { interruptionResultFixture } from "./helpers/interruption-result-fixtures.js";
import { createNativeInterruptionService } from "../src/permissions/native-interruption-service.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedInterruptionController(source),
  originalApprovals = loadCapturedToolApprovalServices(source);
const generated = ts.transpileModule(
  await readFile(
    new URL(
      "../src/permissions/native-interruption-service.ts",
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
).outputText;
assert.equal(
  (generated.match(/runtime\.subscribe\(eA,\s*async/g) ?? []).length,
  1,
  "exactly one owned result subscription bridge",
);
const port = generated.replace(
  /runtime\.subscribe\(eA,\s*async/,
  "eA.resultSubject.subscribe(async",
);
const nodes: any[] = [];
function walk(node: any) {
  if (!node || typeof node !== "object") return;
  if (
    ["ClassDeclaration", "ClassExpression", "FunctionDeclaration"].includes(
      node.type,
    )
  )
    nodes.push(node);
  for (const [key, value] of Object.entries(node))
    if (!["start", "end"].includes(key)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") walk(value);
    }
}
walk(parse(port, { ecmaVersion: "latest", sourceType: "module" }));
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
let members = 0;
for (const [name, start, end] of [
  ["NativeInterruptionService", 11047102, 11089570],
  ["ToolAlwaysApprovalService", 11939394, 11942161],
  ["BackgroundTaskToolApprovalService", 6987547, 6988678],
  ["ErrorUtil", 103409, 103590],
  ["CustomError", 66854, 67085],
  ["Deferred", 117049, 117147],
] as const) {
  const recovered = nodes.find((node) => node.id?.name === name),
    captured: any = (
      parse(`(${source.slice(start, end)})`, { ecmaVersion: "latest" })
        .body[0] as any
    ).expression;
  assert.equal(
    recovered.body.body.length,
    captured.body.body.length,
    name + " complete class",
  );
  for (let i = 0; i < captured.body.body.length; i++) {
    assert.deepEqual(
      ast(recovered.body.body[i]),
      ast(captured.body.body[i]),
      name + "." + captured.body.body[i].key.name,
    );
    members++;
  }
}
for (const name of [
  "SessionAbortedError",
  "SessionCompactionAbortError",
  "SdkPermissionDeniedError",
  "AgentTimeoutError",
]) {
  const start = source.indexOf("class " + name),
    captured: any = (
      parse(`(${source.slice(start, source.indexOf(";", start))})`, {
        ecmaVersion: "latest",
      }).body[0] as any
    ).expression;
  assert.deepEqual(
    ast(nodes.find((n) => n.id?.name === name).body),
    ast(captured.body),
    name,
  );
  members += captured.body.body.length;
}
const sourceHelpers: any = parse(
  source.slice(
    11089571,
    source.indexOf("ry.MODEL_ERROR_RETRY_MARKER=", 11089571),
  ),
  { ecmaVersion: "latest" },
);
for (const helper of sourceHelpers.body) {
  assert.deepEqual(
    ast(nodes.find((n) => n.id?.name === helper.id.name)),
    ast(helper),
    helper.id.name,
  );
  members++;
}
let comparisons = 0;
const norm = (value: any) =>
  JSON.parse(
    JSON.stringify(value, (key, item) =>
      key === "id" || key === "parentId" ? "UUID" : item,
    ),
  );
async function compare(spec: ControllerCase) {
  const actual = interruptionControllerFixture(spec),
    expected = interruptionControllerFixture(spec, original, originalApprovals);
  assert.deepEqual(
    norm(await actual.execute()),
    norm(await expected.execute()),
    JSON.stringify(spec),
  );
  comparisons++;
}
for (const mode of Object.values(PermissionMode))
  for (const child of [false, true])
    for (const background of [false, true])
      for (const decision of [
        "approve",
        "always",
        "reject",
        "cancel",
        "abort",
        "compact",
      ] as const)
        for (const tool of [
          "Write",
          "AskUserQuestion",
          "Bash",
          "DeferExecuteTool",
        ])
          await compare({
            mode,
            child,
            background,
            decision,
            tool,
            input:
              tool === "Bash"
                ? { command: "rm -rf /owned/fixture" }
                : tool === "DeferExecuteTool"
                  ? { toolName: "MandatoryOwned", params: {} }
                  : {},
          });
for (const sdk of [false, true])
  for (const acp of [false, true])
    for (const interrupt of [false, true])
      for (const decision of ["approve", "reject"] as const)
        for (const missingId of [false, true])
          for (const hookFailure of [false, true])
            await compare({
              sdk,
              acp,
              interrupt,
              decision,
              missingId,
              hookFailure,
            });
for (const channel of ["allow", "allow_always", "deny", "deny_and_exit_plan"])
  for (const child of [false, true])
    await compare({ channel, child, mode: PermissionMode.Plan });
for (const ceiling of [PermissionMode.Auto, PermissionMode.DontAsk])
  for (const mode of Object.values(PermissionMode))
    await compare({ ceiling, mode, background: true });
for (const customRejection of [false, true])
  for (const preApproved of [false, true])
    await compare({ customRejection, preApproved, decision: "reject" });
for (const params of [
  { name: "owned" },
  { scriptPath: "owned.js" },
  { script: "inline owned" },
  { name: "owned", script: "   " },
])
  await compare({
    tool: "DeferExecuteTool",
    input: { toolName: "Workflow", params },
  });
for (const child of [false, true])
  for (const aborted of [false, true])
    for (const continuation of [false, true])
      for (const final of [false, true])
        for (const deferred of [false, true]) {
          const spec = { child, aborted, continuation, final, deferred },
            actual = interruptionResultFixture(
              spec,
              createNativeInterruptionService as any,
            ),
            expected = interruptionResultFixture(spec, original);
          assert.deepEqual(
            norm(await actual.execute()),
            norm(await expected.execute()),
            "complete-controller waitFor " + JSON.stringify(spec),
          );
          comparisons++;
        }
async function queueCase(
  construct: any,
  approvals: any,
  sandbox: boolean,
  cancel: boolean,
  child: boolean,
) {
  const f = interruptionControllerFixture({ child }, construct, approvals);
  f.subscription.unsubscribe();
  const events: any[] = [];
  f.owner.acpBroadcastService = {
    broadcastInterruptionRequest: async (id: string, item: any) =>
      events.push(["broadcast", id, item.rawItem.callId]),
    broadcastPermissionResolved: async (...args: any[]) =>
      events.push(["resolved", ...args]),
  };
  const items = ["a", "b", "c"].map((id) => ({
    rawItem: {
      type: "function_call",
      name: "Bash",
      callId: id,
      arguments: "{}",
      providerData: sandbox
        ? {
            _enqueuedViaQueue: true,
            _sandboxResolve: (v: any) => events.push(["sandbox", id, v]),
          }
        : {},
    },
  }));
  const pending = f.owner.pending$.subscribe((value: any) =>
    events.push([
      "pending",
      value?.mainSessionId,
      value?.item?.rawItem.callId,
      value?.queueTotal,
    ]),
  );
  for (const [index, item] of items.entries()) {
    const session = index === 2 ? f.parent : f.session;
    const deferred = f.owner.enqueue(
      f.owner.findMainSession(session),
      item,
      session,
      index === 1 ? { memberName: "owned-member", color: "blue" } : undefined,
    );
    deferred.promise.catch((e: any) =>
      events.push(["rejected", index, e?.message]),
    );
  }
  if (cancel)
    f.owner.cancelAllForSession(
      f.owner.findMainSession(f.session).id,
      "owned cancel",
    );
  else {
    f.owner.approve(items[0]);
    f.owner.reject(items[1]);
  }
  f.owner.approve(items[2]);
  await Promise.resolve();
  pending.unsubscribe();
  return {
    events,
    queues: [...f.owner.interruptionQueues].map(([id, items]: any) => [
      id,
      items.length,
    ]),
    pending: f.owner.pending$.value,
    providerData: items.map((item) => item.rawItem.providerData),
  };
}
for (const sandbox of [false, true])
  for (const cancel of [false, true])
    for (const child of [false, true]) {
      assert.deepEqual(
        norm(
          await queueCase(
            createNativeInterruptionService,
            undefined,
            sandbox,
            cancel,
            child,
          ),
        ),
        norm(
          await queueCase(original, originalApprovals, sandbox, cancel, child),
        ),
        "queue " + JSON.stringify({ sandbox, cancel, child }),
      );
      comparisons++;
    }
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMemberAndHelperAsts: members,
      comparisons,
      scope:
        "complete InterruptionService plus always/background approval services; fake tools and SDK client only",
    },
    null,
    2,
  ),
);
