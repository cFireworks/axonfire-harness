import * as fs from "node:fs";
import * as path from "node:path";
import { createNativeSettingsManager } from "../../src/config/native-settings-manager.js";
import { createNativeCliSettings } from "../../src/config/native-cli-settings.js";
import { createNativePluginPolicy } from "../../src/plugins/native-plugin-policy.js";
import { createCapturedSettingsConstants } from "../../src/vendor/captured-settings-constants.js";
import { NativeEmitter } from "../../src/agents/native-agent-manager-runtime.js";
export function settingsFixture(
  root: string,
  factories: any = {},
  overrides: any = {},
) {
  const logs: any[] = [],
    hooks: any[] = [],
    locks: any[] = [],
    printed: any[] = [];
  let tick = 100000;
  const constants: any = createCapturedSettingsConstants();
  const productChanges = new NativeEmitter();
  const product: any = { builtInMarketPluginsMerge: [] };
  const runtime: any = {
    constants,
    fsPromises: fs.promises,
    getHomeDir: () => path.join(root, "state"),
    getWorkDir: () => root,
    resolveFilePathToWorkDir: (file: string) => path.resolve(root, file),
    Date: { now: () => tick },
    setTimeout: (fn: any) => queueMicrotask(fn),
    dependencies: {
      startupProfiler: { markStart() {}, markEnd() {} },
      consoleManager: { log: (...args: any[]) => printed.push(args) },
      hookManager: {
        hasHooks: () => true,
        executeHooks: async (...args: any[]) => {
          hooks.push(args);
        },
      },
      productManager: {
        getCurrentConfiguration: () => product,
        onDidChange: productChanges.event,
      },
    },
    ...overrides,
  };
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error"].map((k) => [
      k,
      (...v: any[]) => logs.push([k, ...v.map(String)]),
    ]),
  );
  const classes = (factories.settings ?? createNativeSettingsManager)(runtime);
  const cliClasses = (factories.cli ?? createNativeCliSettings)(runtime);
  const policyClasses = (factories.policy ?? createNativePluginPolicy)(runtime);
  const cli = Object.assign(new cliClasses.CliSettingsProvider(), { logger });
  const sources = Object.assign(new cliClasses.CliSettingSourcesProvider(), {
    logger,
  });
  let opts: any = {};
  for (const provider of [cli, sources])
    provider.cliProvider = { parseOpts: () => ({ opts }) };
  cli.deferred.resolve();
  sources.deferred.resolve();
  const manager = Object.assign(new classes.SettingsManagerImpl(), {
    logger,
    cliSettingsProvider: cli,
    cliSettingSourcesProvider: sources,
    fileLockService: {
      async acquireFileLock(...args: any[]) {
        locks.push(args);
        return async () => locks.push(["release"]);
      },
    },
  });
  const controller = Object.assign(new classes.SettingsController(), {
    settingsManager: manager,
  });
  const policy = Object.assign(new policyClasses.PluginPolicyServiceImpl(), {
    logger,
  });
  return {
    root,
    runtime,
    constants,
    classes,
    cliClasses,
    logger,
    logs,
    hooks,
    locks,
    printed,
    cli,
    sources,
    manager,
    controller,
    policy,
    product,
    productChanges,
    setOptions: (value: any) => {
      opts = value;
    },
    advance: (ms: number) => {
      tick += ms;
    },
    async put(scope: string, text: string) {
      const file = classes.PathUtils.getSettingsFilePath(scope);
      await fs.promises.mkdir(path.dirname(file), { recursive: true });
      await fs.promises.writeFile(file, text);
    },
    async read(scope: string) {
      return fs.promises.readFile(
        classes.PathUtils.getSettingsFilePath(scope),
        "utf8",
      );
    },
    dispose() {
      manager.onDidChangeEmitter.dispose();
      sources.onDidChangeEmitter.dispose();
      policy.onDidChangeEmitter.dispose();
      productChanges.dispose();
    },
  };
}
