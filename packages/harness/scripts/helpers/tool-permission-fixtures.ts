import { BehaviorSubject } from "rxjs";
import { PermissionMode } from "../../src/permissions/permission.js";
import { createNativeToolPermissionService } from "../../src/permissions/native-tool-permission-service.js";
import { createNativePermissionUtils } from "../../src/permissions/native-permission-utils.js";
import { createNativeCommandSafety } from "../../src/permissions/native-command-safety.js";
import { createNativeToolPermissionStrategies } from "../../src/permissions/native-tool-permission-strategies.js";
import { nativeToolPermissionMetadata } from "../../src/permissions/native-tool-permission-metadata.js";
import { ToolArgumentRewriteService } from "../../src/tools/tool-argument-rewrite-service.js";
import { createMemoryRuleUtilities } from "../../src/memory/memory-rule-utilities.js";
export const nativePermissionImplementations = {
  service: createNativeToolPermissionService,
  utils: createNativePermissionUtils,
  command: createNativeCommandSafety,
  strategies: createNativeToolPermissionStrategies,
};
export function toolPermissionFixture(
  spec: any = {},
  implementations = nativePermissionImplementations,
) {
  const events: any[] = [],
    saved = new Map<string, any>();
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((name) => [
      name,
      (...args: any[]) =>
        events.push([
          name,
          ...args.map((x) =>
            x instanceof Error ? { name: x.name, message: x.message } : x,
          ),
        ]),
    ]),
  );
  const settingsManager = spec.settingsManager ?? {
    async get(key: string, scope?: string) {
      events.push(["get", key, scope]);
      return (
        saved.get(`${scope}\0${key}`) ??
        (key === "permissions"
          ? (spec.settings?.[scope ?? "merged"] ?? {})
          : (spec.trustedDirectories ?? []))
      );
    },
    async set(key: string, value: any, scope?: string) {
      events.push(["set", key, value, scope]);
      saved.set(`${scope}\0${key}`, value);
    },
  };
  const pathUtils = createMemoryRuleUtilities({
    getWorkDir: () => "/owned/project",
    getHomeDir: () => "/owned/state",
    getUserHomeDir: () => "/owned/home",
    platform: "linux",
    fs: {
      accessSync() {
        throw Error("owned missing");
      },
    },
  }).PathUtils;
  const commandRuntime: any = {
    platform: "linux",
    isWorkBuddyDesktop: () => spec.desktop !== false,
    exec: async (...args: any[]) => {
      events.push(["exec", ...args]);
      if (spec.commandMissing) throw Error("owned missing");
    },
  };
  const commands = implementations.command(commandRuntime);
  const utilsRuntime = {
    pathUtils,
    getHomeDir: () => "/owned/home",
    isWindows: spec.windows === true,
    commandUtils: commands.CommandUtils,
    settingsManager,
    debugService: logger,
    consoleManager: logger,
    commandParserService: spec.parser,
  };
  const utils = implementations.utils(utilsRuntime);
  const strategyRuntime: any = {
    permissionUtils: utils,
    pathUtils,
    commandUtils: commands.CommandUtils,
    settingsManager,
    planStorageService: { getPlanFilePath: () => "/owned/project/plan.md" },
    logger,
  };
  const strategies = implementations.strategies(strategyRuntime);
  const session: any = {
    id: "owned-session",
    options: {
      print: spec.print === true,
      acp: spec.acp === true,
      ...(spec.options ?? {}),
    },
    requestOptions: spec.requestOptions ?? {},
    meta: { ...(spec.meta ?? {}) },
    history: [],
    abortController: new AbortController(),
    permissionModeSubject: new BehaviorSubject(
      spec.mode ?? PermissionMode.Default,
    ),
    toolPermissionContext: utils.createDefaultToolPermissionContext(),
  };
  const sessionHooks = {
    async executePermissionRequestHooks(...args: any[]) {
      events.push(["permissionRequest", args[1], args[2], args[3], args[4]]);
      if (spec.requestError) throw Error("owned request failure");
      return { decision: spec.requestDecision };
    },
    async executePermissionDeniedHooks(...args: any[]) {
      events.push(["permissionDenied", args[1], args[2], args[3], args[4]]);
    },
  };
  const dependencies = {
    logger,
    debugService: logger,
    directoryTrustService: { isTrustDirectory: spec.trusted === true },
    settingsManager,
    toolArgumentRewriteService: new ToolArgumentRewriteService(),
    sessionStore: {
      getSessionFilePath: () => "/owned/state/owned-session.jsonl",
    },
    toolHookManager: {
      async executePreToolUseHooks(...args: any[]) {
        events.push(["pre", ...args.slice(0, 2), args[3], args[4], args[5]]);
        if (spec.preError) throw Error("owned pre failure");
        return spec.pre ?? { allowed: true };
      },
    },
    autoModePermissionService: {
      async isAutoModeAvailable() {
        return { available: spec.autoAvailable !== false };
      },
      async classifyAsk(input: any) {
        events.push(["classify", input]);
        return (
          spec.classification ?? {
            behavior: "allow",
            reason: "owned classifier",
          }
        );
      },
    },
    bashSandboxManager: {
      async getConfig() {
        return spec.sandbox;
      },
    },
  };
  const serviceRuntime: any = {
    permissionUtils: utils,
    commandUtils: commands.CommandUtils,
    riskLevel: commands.RiskLevel,
    pathUtils,
    sessionHookManager: sessionHooks,
    getStrategies: () => strategies,
    isTTY: spec.tty === true,
  };
  const service = implementations.service(serviceRuntime, dependencies);
  const metadata = nativeToolPermissionMetadata(spec.tool ?? "Write");
  const tool: any = Object.assign(
    Object.create(Object.getPrototypeOf(metadata)),
    metadata,
    { name: spec.tool ?? "Write" },
  );
  if (spec.aliases) tool.aliases = spec.aliases;
  if (spec.intrinsic !== undefined) tool.needsApproval = spec.intrinsic;
  const context: any = { context: session };
  async function run(operation = "check", update?: any) {
    await service.initializeContext(session);
    for (const [kind, rules] of Object.entries(spec.rules ?? {}))
      Object.assign(session.toolPermissionContext[kind], rules);
    const input = spec.input ?? {
      file_path: "/owned/project/a.txt",
      path: "/owned/project",
      command: "echo owned",
      url: "https://example.test",
      skill: "owned",
    };
    const args =
      spec.args ?? tool.resolveNeedPermissionArgs(context, input, "owned-call");
    let result: any;
    try {
      if (operation === "needs")
        result = await service.needsApproval(
          tool,
          context,
          input,
          spec.noCallId ? undefined : "owned-call",
          () => args,
        );
      else if (operation === "update") {
        await service.applyUpdate(session, update);
        result = session.toolPermissionContext;
      } else
        result = await service.checkPermission(
          tool,
          context,
          input,
          "owned-call",
          () => args,
        );
    } catch (error: any) {
      result = { thrown: error.name, message: error.message, rule: error.rule };
    }
    return {
      result,
      events,
      context: session.toolPermissionContext,
      mode: session.permissionModeSubject.value,
      meta: session.meta,
      aborted: session.abortController.signal.aborted,
      cache: session.preToolUseHookResults,
      saved,
    };
  }
  return {
    service,
    utils,
    commands,
    strategies,
    tool,
    session,
    context,
    events,
    saved,
    run,
  };
}
