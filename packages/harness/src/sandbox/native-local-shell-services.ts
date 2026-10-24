import { createNativeLocalShell } from "./native-local-shell.js";
/** Explicit parent composition. The parent owns shutdown, dispatch and the original
 * warmup timer; disposeAll does not cancel that timer or pending snapshot creation. */
export function createNativeLocalShellServices(options: {
  runtime: any;
  logger: any;
  workspace: any;
  settingsManager: any;
  bashSandboxManager?: any;
  sourceFactory?: typeof createNativeLocalShell;
}) {
  const native = (options.sourceFactory ?? createNativeLocalShell)(
    options.runtime,
  );
  const snapshot = Object.assign(new native.ShellSnapshotServiceImpl(), {
    logger: options.logger,
  });
  snapshot.init();
  const localShell = Object.assign(new native.ShellServiceImpl(), {
    logger: options.logger,
    workspace: options.workspace,
    settingsManager: options.settingsManager,
    snapshotService: snapshot,
  });
  localShell.init();
  const bindings = new Map<any, any>([
    [native.LocalShellService, localShell],
    [native.ShellSnapshotService, snapshot],
  ]);
  let legacyShell: any;
  if (options.bashSandboxManager) {
    legacyShell = Object.assign(new native.LegacySandboxShellServiceImpl(), {
      logger: options.logger,
      localShellService: localShell,
      bashSandboxManager: options.bashSandboxManager,
    });
    bindings.set(
      native.getModule(57126).LegacySandboxShellService,
      legacyShell,
    );
  }
  return { native, localShell, snapshot, legacyShell, bindings };
}
