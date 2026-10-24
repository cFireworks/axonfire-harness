import { Script } from "node:vm";
import { parse } from "acorn";
import { createHash } from "node:crypto";
import * as path from "node:path";
import {
  PermissionMode,
  buildDontAskDenyMessage,
  buildClassifierUnavailableDenyMessage,
} from "../../src/permissions/permission.js";
import { ToolNames } from "../../src/tools/tool-names.js";
import { PermissionDeniedError } from "../../src/tools/native-tool-errors.js";
import {
  ToolArgType,
  ToolPermissionType,
  SettingsScope,
  buildPermissionDeniedMessage,
} from "../../src/permissions/native-permission-policy.js";
import { CapturedMinimatch } from "../../src/vendor/captured-minimatch.js";
import { CapturedHookMicromatch } from "../../src/vendor/captured-hook-dependencies.js";
export function loadCapturedToolPermission(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const command = new Script(
    `(()=>{let eu;${source.slice(13050284, 13060942)};return{CommandUtils,RiskLevel:eu}})()`,
  );
  const utils = new Script(`(${source.slice(13340331, 13350579)})`);
  const policy = new Script(
    `(()=>{${source.slice(11551818, 11554685)};return{filterDangerousAllowRules}})()`,
  );
  const service = new Script(`(${source.slice(11948949, 11968077)})`);
  const definitions = [
    ["Default", 11576067, 11576640],
    ["AcceptEdits", 11577186, 11577575],
    ["Plan", 11577912, 11579866],
    ["Bypass", 11580409, 11580671],
    ["Work", 11581008, 11581494],
    ["Delegate", 11581831, 11581933],
    ["DontAsk", 11582270, 11582631],
    ["Auto", 11584041, 11584358],
  ] as const;
  // Pin the dependency binding as well as the class bodies. A shared wrong
  // injected token can otherwise make both sides of a paired test agree.
  if (
    !source.slice(11577183, 11577255).startsWith(
      "iy=class{constructor(){this.mode=ih.PermissionMode.AcceptEdits}",
    )
  )
    throw Error("Auto strategy AcceptEdits binding changed");
  const strategy = new Script(
    `(()=>{${source.slice(11583503, 11584041).replace(/,iQ=$/, ";")};return[${definitions.map(([, start, end]) => `new (${source.slice(start, end)})()`).join(",")}]})()`,
  );
  const nC = {
    ToolNames,
    ToolArgType,
    ToolPermissionType,
    PermissionDeniedError,
    buildPermissionDeniedMessage,
    ToolPermissionStrategy: "strategies",
  };
  const chunk = source.slice(12008364, 12018235),
    parsed: any = (
      parse(`(${chunk})`, { ecmaVersion: "latest" }).body[0] as any
    ).expression;
  let assignment: any;
  const scan = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (
      node.type === "AssignmentExpression" &&
      node.left.type === "MemberExpression" &&
      node.left.object.type === "ThisExpression" &&
      node.left.property.name === "needsApproval"
    )
      assignment = node;
    for (const value of Object.values(node))
      if (Array.isArray(value)) value.forEach(scan);
      else if (value && typeof value === "object") scan(value);
  };
  scan(parsed.body.body.find((node: any) => node.kind === "constructor"));
  const method = parsed.body.body.find(
    (node: any) => node.key?.name === "defaultNeedsApproval",
  );
  const defer = new Script(
    `(class {constructor(){${chunk.slice(assignment.start - 1, assignment.end - 1)};} ${chunk.slice(method.start - 1, method.end - 1)}})`,
  );
  return {
    defer(runtime: any): any {
      const Original = defer.runInNewContext({
        nC,
        nk: { ContainerUtil: { get: () => runtime.permission } },
        nW: {
          ModelUtils: {
            isMandatoryApprovalTarget: runtime.isMandatoryApprovalTarget,
          },
        },
      });
      return Object.assign(new Original(), runtime);
    },
    command(runtime: any): any {
      return command.runInNewContext({
        process: { platform: runtime.platform },
        ed: { default: runtime.exec },
        ep: { isWorkBuddyDesktop: runtime.isWorkBuddyDesktop },
      });
    },
    utils(runtime: any): any {
      return utils.runInNewContext({
        URL,
        ef: () => path,
        eg: () => ({ homedir: runtime.getHomeDir }),
        eE: () => CapturedHookMicromatch,
        ed: CapturedMinimatch,
        ev: { PathUtils: runtime.pathUtils },
        eI: { CommandUtils: runtime.commandUtils },
        e_: { ToolArgType },
        ew: { DebugService: "debug" },
        eB: { SettingsManager: "settings" },
        eC: { CommandParserService: "parser" },
        ey: {
          ConsoleManager: "console",
          ConsoleOutputMode: { NATIVE: "native" },
        },
        eu: {
          isWindows: runtime.isWindows,
          ContainerUtil: {
            get: (key: string) =>
              (
                ({
                  debug: runtime.debugService,
                  settings: runtime.settingsManager,
                  console: runtime.consoleManager,
                  parser: runtime.commandParserService,
                }) as any
              )[key],
          },
        },
      });
    },
    strategies(runtime: any): any {
      let instances: any[];
      instances = strategy.runInNewContext({
        ih: { PermissionMode },
        nC,
        nW: {
          PermissionUtils: runtime.permissionUtils,
          CommandUtils: runtime.commandUtils,
          PathUtils: runtime.pathUtils,
        },
        iC: "default",
        iy: "acceptEdits",
        iE: { PlanStorageService: "plans" },
        nk: {
          ContainerUtil: {
            getAll: () => instances,
            get: (key: string) =>
              key === "plans"
                ? runtime.planStorageService
                : instances.find(
                    (x) =>
                      x.mode ===
                      (key === "default"
                        ? PermissionMode.Default
                        : PermissionMode.AcceptEdits),
                  ),
          },
        },
      });
      for (const instance of instances)
        Object.assign(instance, {
          logger: runtime.logger,
          settingsManager: runtime.settingsManager,
        });
      return instances;
    },
    service(runtime: any, dependencies: any): any {
      const helpers = policy.runInNewContext({});
      const Original = service.runInNewContext({
        Error,
        process: { stdin: { isTTY: runtime.isTTY } },
        nC,
        ih: { PermissionMode, SettingsScope },
        nw: { buildDontAskDenyMessage, buildClassifierUnavailableDenyMessage },
        nW: {
          PermissionUtils: runtime.permissionUtils,
          CommandUtils: runtime.commandUtils,
          RiskLevel: runtime.riskLevel,
          PathUtils: runtime.pathUtils,
        },
        oT: { SessionHookManager: "sessionHooks" },
        nk: {
          ContainerUtil: {
            get: () => runtime.sessionHookManager,
            getAll: runtime.getStrategies,
          },
        },
        sH: { PRODUCT_LOWERCASE_NAME: "codebuddy" },
        ...helpers,
      });
      return Object.assign(new Original(), dependencies);
    },
  };
}
