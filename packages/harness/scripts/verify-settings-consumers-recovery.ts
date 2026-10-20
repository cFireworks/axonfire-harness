import assert from "node:assert/strict";
import { readFile, mkdtemp, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  emittedSettings,
  loadCapturedSettings,
} from "./helpers/captured-settings.js";
import { settingsFixture } from "./helpers/settings-fixtures.js";
import { loadCapturedToolPermission } from "./helpers/captured-tool-permission.js";
import { toolPermissionFixture } from "./helpers/tool-permission-fixtures.js";
import { loadCapturedMcpManager } from "./helpers/captured-mcp-manager.js";
import { mcpManagerFixture } from "./helpers/mcp-manager-fixtures.js";
import { loadCapturedSdkControl } from "./helpers/captured-sdk-control.js";
import { createNativeSdkControl } from "../src/sdk/native-sdk-control.js";
import { HarnessSession } from "../src/sessions/session.js";
const source = await readFile(getCapturedBundlePath(), "utf8");
const captured = {
  settings: loadCapturedSettings(source),
  permission: loadCapturedToolPermission(source),
  mcp: loadCapturedMcpManager(source),
  sdk: loadCapturedSdkControl(source),
};
const classes = [
  ["config/native-settings-manager", "SettingsManagerImpl", 11202361, 11209123],
  ["config/native-cli-settings", "CliSettingsProvider", 11193064, 11196069],
  [
    "permissions/native-tool-permission-service",
    "ToolPermissionService",
    11948949,
    11968077,
  ],
  [
    "permissions/native-permission-utils",
    "PermissionUtils",
    13340331,
    13350579,
  ],
  ["mcp/native-mcp-manager-runtime", "McpPermissionsManager", 9277575, 9279382],
  ["sdk/native-sdk-control", "InitializeHandler", 7811554, 7814144],
  ["sdk/native-sdk-control", "SetModelHandler", 7825195, 7826336],
] as const;
function ast(v: any): any {
  if (!v || typeof v !== "object") return v;
  return Array.isArray(v)
    ? v.map(ast)
    : Object.fromEntries(
        Object.entries(v)
          .filter(([k]) => !["start", "end", "raw"].includes(k))
          .map(([k, v]) => [k, ast(v)]),
      );
}
let completeClassMembers = 0,
  comparisons = 0;
for (const [file, name, start, end] of classes) {
  const original: any = (
    parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  const nodes = nodesOf(
    parse(emittedSettings(file), {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
  );
  assert.deepEqual(
    ast(
      nodes.find((n) => n.type === "ClassDeclaration" && n.id?.name === name)
        .body,
    ),
    ast(original.body),
    name,
  );
  completeClassMembers += original.body.body.length;
}
function plain(value: any): any {
  if (Object.prototype.toString.call(value) === "[object Map]")
    return [...value].map(([k, v]) => [k, plain(v)]);
  if (Object.prototype.toString.call(value) === "[object Set]")
    return [...value];
  if (value && typeof value === "object")
    return Array.isArray(value)
      ? Array.from(value,plain)
      : Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((k) => [k, plain(value[k])]),
        );
  return value;
}
function same(values: any[]) {
  assert.deepEqual(plain(values[0]), plain(values[1]));
  comparisons++;
}
const root = await mkdtemp(join(tmpdir(), "settings-consumer-diff-"));
let index = 0;
async function scenario(run: (f: any) => Promise<any>) {
  const values = [];
  for (const original of [false, true]) {
    const dir = join(root, String(++index));
    await mkdir(dir, { recursive: true });
    const settings = settingsFixture(dir, original ? captured.settings : {});
    const permission = toolPermissionFixture(
      { settingsManager: settings.manager },
      original ? captured.permission : undefined,
    );
    const mcp = mcpManagerFixture(
      {
        scopes: {
          project: {
            a: { type: "http", url: "http://owned.invalid" },
            b: { type: "http", url: "http://owned.invalid" },
          },
        },
      },
      original ? captured.mcp : undefined,
    );
    mcp.permissions.settingsManager = settings.manager;
    const runtime = {
      now: () => 1000,
      setTimeout: () => ({}),
      clearTimeout() {},
      stdout: { write: () => true, once() {} },
    };
    const sdk = (original ? captured.sdk : createNativeSdkControl)(runtime);
    try {
      const output = await run({ settings, permission, mcp, sdk, dir });
      await new Promise<void>((resolve) => setImmediate(resolve));
      const files = [];
      for (const scope of ["user", "project", "project-local"]) {
        try {
          files.push([scope, await settings.read(scope)]);
        } catch (e: any) {
          if (e.code !== "ENOENT") throw e;
          files.push([scope, null]);
        }
      }
      values.push(
        JSON.parse(
          JSON.stringify(plain([output, files, settings.hooks])).replaceAll(
            dir,
            "/owned",
          ),
        ),
      );
    } finally {
      settings.dispose();
    }
  }
  same(values);
}
try {
  same([
    new HarnessSession("owned").toolPermissionContext,
    toolPermissionFixture(
      {},
      captured.permission,
    ).utils.createDefaultToolPermissionContext(),
  ]);
  const updates: any[] = [];
  for (const type of ["addRules", "replaceRules", "removeRules"])
    for (const behavior of ["allow", "deny", "ask"])
      updates.push({
        type,
        behavior,
        rules: [
          { toolName: "Read" },
          { toolName: "Bash", ruleContent: "echo owned" },
        ],
      });
  updates.push(
    { type: "setMode", mode: "acceptEdits" },
    { type: "addDirectories", directories: ["/owned/extra", "/owned/extra"] },
    { type: "removeDirectories", directories: ["/owned/extra"] },
  );
  for (const none of [false, true])
    for (const destination of [
      "userSettings",
      "projectSettings",
      "localSettings",
    ])
      for (const update of updates) {
        await scenario(async ({ settings: s, permission: p }: any) => {
          await s.put(
            "user",
            '{/*owned*/"permissions":{"allow":["Read"],"deny":["Bash"],"additionalDirectories":["/owned/extra"]}}',
          );
          await s.put(
            "project",
            '{"permissions":{"allow":["Write"],"ask":["Read"]}}',
          );
          await s.put("project-local", '{"permissions":{"deny":["Edit"]}}');
          s.sources.settingScopes = none
            ? []
            : ["user", "project", "project-local"];
          await s.cli.set("permissions", {
            allow: ["Skill"],
            disableBypassPermissionsMode: "disable",
          });
          await p.service.initializeContext(p.session);
          await p.service.applyUpdate(p.session, { ...update, destination });
          return [
            p.session.toolPermissionContext,
            p.session.permissionModeSubject.value,
            await s.manager.get("permissions"),
            await s.cli.getSettings(),
          ];
        });
      }
  for (const destination of ["session", "cliArg"])
    await scenario(async ({ settings: s, permission: p }: any) => {
      await p.service.initializeContext(p.session);
      await p.service.applyUpdate(p.session, {
        type: "addRules",
        destination,
        behavior: "allow",
        rules: [{ toolName: "Read" }],
      });
      return [
        p.session.toolPermissionContext,
        await s.manager.list("user"),
        await s.cli.getSettings(),
      ];
    });
  for (const [scope, destination] of [
    ["user", "userSettings"],
    ["project", "projectSettings"],
    ["project-local", "localSettings"],
  ])
    await scenario(async ({ settings: s, permission: p }: any) => {
      await s.put(scope, "{broken");
      await p.service.initializeContext(p.session);
      await p.service.applyUpdate(p.session, {
        type: "addRules",
        destination,
        behavior: "allow",
        rules: [{ toolName: "Read" }],
      });
      return [
        p.session.toolPermissionContext,
        [...s.manager.corruptedScopes],
        await s.manager.get("permissions", scope),
      ];
    });
  for (const all of [undefined, false, true])
    for (const cli of [
      {},
      { enabledMcpjsonServers: [] },
      { disabledMcpjsonServers: ["a"] },
      { enableAllProjectMcpServers: false },
    ])
      for (const action of ["approve", "deny", "approveAll", "none"])
        await scenario(async ({ settings: s, mcp: m }: any) => {
          await s.put(
            "project-local",
            JSON.stringify({
              enableAllProjectMcpServers: all,
              enabledMcpjsonServers: ["a"],
              disabledMcpjsonServers: ["b"],
            }),
          );
          for (const [k, v] of Object.entries(cli)) await s.cli.set(k, v);
          if (action === "approve")
            await m.permissions.approve(["a", "b", "a"]);
          if (action === "deny") await m.permissions.deny(["a"]);
          if (action === "approveAll") await m.permissions.approveAll();
          return [
            await m.permissions.getMcpSettings(),
            await Promise.all(
              ["a", "b", "unknown"].flatMap((n) => [
                m.permissions.isAllowed(n, "project"),
                m.permissions.isAllowed(n, "user"),
                m.permissions.isAllowed(n),
              ]),
            ),
            await m.permissions.getServersNeedingConfirmation(),
            await s.manager.list("project-local"),
          ];
        });
  for (const before of [false, true])
    for (const target of [undefined, "owned-session", "wrong"])
      for (const model of [undefined, "owned-model"])
        await scenario(async ({ settings: s, permission: p, sdk }: any) => {
          const overrides: any[] = [],
            h = Object.assign(new sdk.SetModelHandler(), {
              logger: { info() {} },
              sessionManager: {
                sessionSubject: {
                  getValue: () => (before ? undefined : p.session),
                },
                setOverrideModel: (...args: any[]) => overrides.push(args),
              },
              cliSettingsProvider: s.cli,
            });
          let result;
          try {
            result = await h.handle(
              { request: { session_id: target, model } },
              new AbortController().signal,
            );
          } catch (e: any) {
            result = { name: e.name, message: e.message };
          }
          return [
            result,
            overrides,
            p.session.options,
            p.session.requestOptions,
            await s.cli.getSettings(),
            await s.manager.get("model", "user"),
          ];
        });
  for (const environment of [undefined, "external", "internal", "bad"])
    for (const endpoint of [undefined, "http://owned.invalid"])
      for (const fail of [false, true])
        await scenario(async ({ settings: s, sdk }: any) => {
          const switched: any[] = [],
            h = Object.assign(new sdk.InitializeHandler(), {
              settingsManager: s.manager,
              productEnvService: {
                async switch(mode: any) {
                  switched.push(mode);
                  if (fail) throw Error("owned switch failed");
                },
              },
            });
          let result;
          try {
            result = await h.switchEnvironmentIfNeeded(environment, endpoint);
          } catch (e: any) {
            result = { name: e.name, message: e.message };
          }
          return [
            result,
            switched,
            await s.manager.get("enterpriseEndpoint", "user"),
          ];
        });
  console.log(
    JSON.stringify({
      completeClasses: classes.length,
      completeClassMembers,
      joinedScenarios: comparisons,
      sdkReimplemented: false,
      installedBootstrapExecuted: false,
    }),
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
