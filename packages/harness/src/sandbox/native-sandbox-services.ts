import { createNativeLocalShellServices } from "./native-local-shell-services.js";
import { createNativeLocalShell } from "./native-local-shell.js";
import { createNativeSandboxFinalization } from "./native-sandbox-finalization.js";
import { createNativeBashSandboxManager } from "./native-bash-sandbox-manager.js";
import { createNativeSandboxRules } from "./native-sandbox-rules.js";
import { createNativeSandboxCLI } from "./native-sandbox-cli.js";
import { createNativeSandboxProtocol } from "./native-sandbox-protocol.js";
import { createNativeSandboxTurnConfig } from "./native-sandbox-turn-config.js";
import { createNativeSandboxShell } from "./native-sandbox-shell.js";

/** Explicit composition only. The caller owns dispatch, timers, filesystem,
 * process/network boundaries and shutdown; no installed binary is discovered here.
 * Call lifecycle.stop() after accepted work settles. Methods remain original.
 */
export function createNativeSandboxServices(options: {
  runtime: any;
  logger: any;
  telemetryReporter?: any;
  protocol?: ReturnType<typeof createNativeSandboxProtocol>;
  turnConfiguration?: ReturnType<typeof createNativeSandboxTurnConfig>;
  turnConfig?: any;
  sourceFactory?: typeof createNativeSandboxCLI;
  finalization?: {
    cwdService?: any;
    sourceFactory?: typeof createNativeSandboxFinalization;
    delegates?: { localShellService: any; legacySandboxShellService: any };
  };
  local?: {
    workspace: any;
    settingsManager: any;
    sourceFactory?: typeof createNativeLocalShell;
  };
  shell?: {
    workspace: any;
    sessionManager: any;
    settingsManager: any;
    localShellService?: any;
    namespace?: any;
    sourceFactory?: typeof createNativeSandboxShell;
  };
  bash?: {
    settingsManager: any;
    execPolicy?: any;
    sensitiveCommandDetector?: any;
    namespace?: any;
    sourceFactory?: typeof createNativeBashSandboxManager;
  };
  rules?: {
    bashSandboxManager?: any;
    namespace?: any;
    sourceFactory?: typeof createNativeSandboxRules;
  };
}) {
  if (options.local && options.shell?.localShellService)
    throw Error(
      "Choose owned local Shell composition or a borrowed local Shell service",
    );
  if (options.local && options.finalization?.delegates)
    throw Error(
      "Owned local Shell composition supplies its own routing delegates",
    );
  const parentNamespace = (id: number) =>
    options.runtime.modules?.[id] ?? options.runtime.getModule?.(id);
  const protocol =
    options.protocol ??
    createNativeSandboxProtocol({
      modules: {
        70353: parentNamespace(70353),
        74674: parentNamespace(74674),
      },
    });
  const turnConfiguration =
    options.turnConfiguration ??
    parentNamespace(41695) ??
    createNativeSandboxTurnConfig();
  const turnConfig =
    options.turnConfig ?? new turnConfiguration.SandboxTurnConfigImpl();
  const native = (options.sourceFactory ?? createNativeSandboxCLI)({
    ...options.runtime,
    modules: { ...options.runtime.modules, 74674: protocol.getModule(74674) },
  });
  const client = Object.assign(new native.SandboxCLIClientImpl(), {
    logger: options.logger,
  });
  const processManager = Object.assign(
    new native.SandboxCLIProcessManagerImpl(),
    {
      logger: options.logger,
      telemetryReporter: options.telemetryReporter,
    },
  );
  const lifecycle = Object.assign(new native.SandboxCLILifecycleImpl(), {
    client,
    processManager,
    logger: options.logger,
    telemetryReporter: options.telemetryReporter,
  });
  client.init();
  processManager.init();
  const bindings = new Map<any, any>([
    [protocol.SandboxCLIClient, client],
    [protocol.SandboxCLIProcessManager, processManager],
    [protocol.SandboxCLILifecycle, lifecycle],
    [turnConfiguration.SandboxTurnConfig, turnConfig],
  ]);
  const namespaces = new Map<number, any>([
    [70353, protocol.getModule(70353)],
    [74674, protocol.getModule(74674)],
    [41695, turnConfiguration],
  ]);
  let ruleNamespace: any;
  let ruleSync: any;
  let bashNative: any, bashManager: any;
  if (options.rules || options.bash) {
    if (options.bash && options.rules?.bashSandboxManager)
      throw Error(
        "Choose an owned BashSandbox manager or an explicit borrowed manager",
      );
    ruleNamespace =
      options.rules?.namespace ??
      parentNamespace(64187) ??
      (options.rules?.sourceFactory ?? createNativeSandboxRules)({
        ...options.runtime,
        modules: {
          ...options.runtime.modules,
          68331: options.runtime.modules?.[68331] ?? protocol.getModule(68331),
          20852: parentNamespace(20852),
          42017: parentNamespace(42017),
          74674: protocol.getModule(74674),
        },
      });
    const bashNamespace =
      parentNamespace(20852) ?? ruleNamespace.getModule?.(20852);
    if (!bashNamespace?.BashSandboxManager)
      throw Error("Parent BashSandboxManager token namespace required");
    if (options.bash) {
      if (typeof options.bash.settingsManager?.list !== "function")
        throw Error(
          "BashSandbox manager requires original parent settings list()",
        );
      bashNative =
        options.bash.namespace ??
        (options.bash.sourceFactory ?? createNativeBashSandboxManager)({
          ...options.runtime,
          modules: { ...options.runtime.modules, 20852: bashNamespace },
        });
      bashManager = Object.assign(new bashNative.BashSandboxManagerImpl(), {
        settingsManager: options.bash.settingsManager,
        logger: options.logger,
        execPolicy: options.bash.execPolicy,
        sensitiveCommandDetector: options.bash.sensitiveCommandDetector,
        sandboxTurnConfig: turnConfig,
      });
    } else bashManager = options.rules?.bashSandboxManager;
    if (typeof bashManager?.getConfig !== "function")
      throw Error(
        "Sandbox rule synchronization requires the parent BashSandboxManager",
      );
    ruleSync = Object.assign(new ruleNamespace.SandboxRuleSyncServiceImpl(), {
      lifecycle,
      logger: options.logger,
      bashSandboxManager: bashManager,
      turnConfig,
    });
    bindings.set(ruleNamespace.SandboxRuleSyncService, ruleSync);
    bindings.set(bashNamespace.BashSandboxManager, bashManager);
    namespaces.set(64187, ruleNamespace);
    namespaces.set(20852, bashNamespace);
  }
  let local: ReturnType<typeof createNativeLocalShellServices> | undefined;
  if (options.local) {
    local = createNativeLocalShellServices({
      runtime: {
        ...options.runtime,
        modules: {
          ...options.runtime.modules,
          74674: protocol.getModule(74674),
          20852: namespaces.get(20852) ?? parentNamespace(20852),
        },
      },
      logger: options.logger,
      workspace: options.local.workspace,
      settingsManager: options.local.settingsManager,
      bashSandboxManager: bashManager,
      ...(options.local.sourceFactory
        ? { sourceFactory: options.local.sourceFactory }
        : {}),
    });
    for (const [token, service] of local.bindings) bindings.set(token, service);
    for (const id of [19702, 35179, 57126])
      namespaces.set(id, local.native.getModule(id));
  }
  let shellNative: any, shellService: any;
  if (options.shell) {
    if (!bashManager)
      throw Error("Sandbox shell requires the parent BashSandbox manager");
    const localShellService =
      local?.localShell ?? options.shell.localShellService;
    if (typeof localShellService?.execute !== "function")
      throw Error(
        "Sandbox shell requires an owned or borrowed local Shell service",
      );
    shellNative =
      options.shell.namespace ??
      (options.shell.sourceFactory ?? createNativeSandboxShell)({
        ...options.runtime,
        modules: {
          ...options.runtime.modules,
          74674: protocol.getModule(74674),
          64187: ruleNamespace,
          93289: parentNamespace(93289) ?? bashNative?.getModule(93289),
          19702: namespaces.get(19702) ?? parentNamespace(19702),
        },
      });
    shellService = Object.assign(new shellNative.SandboxShellServiceImpl(), {
      lifecycle,
      logger: options.logger,
      workspace: options.shell.workspace,
      sessionManager: options.shell.sessionManager,
      settingsManager: options.shell.settingsManager,
      localShellService,
      bashSandboxManager: bashManager,
      telemetryReporter: options.telemetryReporter,
      sandboxRuleSyncService: ruleSync,
      turnConfig,
    });
    shellService.init();
    bindings.set(protocol.getModule(74674).SandboxShellService, shellService);
    namespaces.set(19702, shellNative.getModule(19702));
  }
  let finalizationNative: any, delegatingShellService: any;
  const hooks: any[] = [];
  if (options.finalization) {
    finalizationNative = (
      options.finalization.sourceFactory ?? createNativeSandboxFinalization
    )({
      ...options.runtime,
      modules: {
        ...options.runtime.modules,
        74674: protocol.getModule(74674),
        38195: parentNamespace(38195),
      },
    });
    for (const C of [
      finalizationNative.FinalizationFileProjectionSyncHook,
      finalizationNative.FinalizationModifyBackupHook,
      finalizationNative.SandboxCLISessionEndHook,
    ]) {
      hooks.push(
        Object.assign(new C(), {
          logger: options.logger,
          sandboxLifecycle: lifecycle,
          sandboxTurnConfig: turnConfig,
          telemetryReporter: options.telemetryReporter,
          cwdService: options.finalization.cwdService,
        }),
      );
    }
    // A collection for the parent Hook provider; dispatch/concurrency remain its responsibility.
    namespaces.set(38195, finalizationNative.getModule(38195));
    const delegates = local?.legacyShell
      ? {
          localShellService: local.localShell,
          legacySandboxShellService: local.legacyShell,
        }
      : options.finalization.delegates;
    if (delegates) {
      if (!bashManager || !shellService)
        throw Error(
          "Shell routing requires BashSandbox and Sandbox shell services",
        );
      delegatingShellService = Object.assign(
        new finalizationNative.DelegatingShellService(),
        {
          ...delegates,
          logger: options.logger,
          bashSandboxManager: bashManager,
          sandboxShellService: shellService,
        },
      );
      bindings.set(namespaces.get(19702).ShellService, delegatingShellService);
    }
  }
  return {
    local,
    finalizationNative,
    hooks,
    delegatingShellService,
    shellNative,
    shellService,
    native,
    ruleNamespace,
    ruleSync,
    bashNative,
    bashManager,
    protocol,
    turnConfiguration,
    turnConfig,
    client,
    processManager,
    lifecycle,
    bindings,
    namespaces,
  };
}
