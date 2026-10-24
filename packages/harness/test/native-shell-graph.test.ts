import test from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { localShellFixture } from "../scripts/helpers/local-shell-scenarios.js";
import { sandboxCliFixture } from "../scripts/helpers/sandbox-cli-fixture.js";
import { bashSandboxFixture } from "../scripts/helpers/bash-sandbox-scenarios.js";
import { sandboxFinalizationFixture } from "../scripts/helpers/sandbox-finalization-scenarios.js";
import { createNativeSandboxServices } from "../src/sandbox/native-sandbox-services.js";

test("combined Shell graph shares original tokens, actual local handles and legacy ownership", async () => {
  const f = localShellFixture(),
    cli = sandboxCliFixture(),
    bash = bashSandboxFixture(),
    finalization = sandboxFinalizationFixture();
  const runtime = {
    ...cli.runtime,
    ...f.runtime,
    legacy: bash.runtime.legacy,
    getModule: undefined,
    modules: {
      ...cli.runtime.modules,
      ...bash.runtime.modules,
      ...f.runtime.modules,
      ...Object.fromEntries(
        [19702, 62922, 38736, 6453, 2752, 83044].map((id) => [
          id,
          f.native.getModule(id),
        ]),
      ),
      20852: bash.n.getModule(20852),
      78213: finalization.runtime.modules[78213],
      99006: finalization.runtime.modules[99006],
      59255: finalization.runtime.modules[59255],
    },
  };
  const settingsManager = {
      list: async () => ({ sandbox: { safeDeleteRuntimeEnabled: false } }),
    },
    workspace = { workspaceFolders: [{ uri: { fsPath: f.root } }] },
    logger = { info() {}, warn() {}, error() {}, debug() {}, setContext() {} };
  let graph: ReturnType<typeof createNativeSandboxServices> | undefined;
  try {
    graph = createNativeSandboxServices({
      runtime,
      logger,
      local: { workspace, settingsManager },
      bash: { settingsManager },
      shell: {
        workspace,
        settingsManager,
        sessionManager: { sessionSubject: { value: { id: "owned" } } },
      },
      finalization: {},
    });
    const {
      local,
      shellService,
      delegatingShellService: router,
      bindings,
      namespaces,
    } = graph;
    assert.ok(local);
    assert.equal(shellService.localShellService, local.localShell);
    assert.equal(local.legacyShell.localShellService, local.localShell);
    assert.equal(local.legacyShell.bashSandboxManager, graph.bashManager);
    assert.equal(router.localShellService, local.localShell);
    assert.equal(router.legacySandboxShellService, local.legacyShell);
    assert.equal(
      bindings.get(namespaces.get(19702).LocalShellService),
      local.localShell,
    );
    assert.equal(bindings.get(namespaces.get(19702).ShellService), router);
    assert.equal(
      bindings.get(namespaces.get(35179).ShellSnapshotService),
      local.snapshot,
    );
    assert.equal(
      bindings.get(namespaces.get(57126).LegacySandboxShellService),
      local.legacyShell,
    );
    assert.equal(
      graph.shellNative.getModule(19702),
      local.native.getModule(19702),
    );
    assert.equal(graph.hooks.length, 3);
    for (const hook of graph.hooks)
      assert.equal(hook.sandboxLifecycle, graph.lifecycle);
    graph.turnConfig.useSandboxCLI = false;
    assert.equal(await router.resolveBackend(), "off");
    const file = path.join(f.root, "graph-owned.cjs");
    fs.writeFileSync(file, "process.stdout.write('graph-owned');");
    const handle = await router.execute({
      command: JSON.stringify(process.execPath) + " " + JSON.stringify(file),
      rawCommand: true,
      usePty: false,
    });
    assert.equal(local.localShell.getActiveHandleCount(), 1);
    assert.equal(local.legacyShell.getActiveHandleCount(), 0);
    assert.equal((await handle.wait()).stdout, "graph-owned");
    await router.disposeAll();
    assert.equal(router.getActiveHandleCount(), 0);
    graph.turnConfig.useSandboxCLI = true;
    assert.equal(
      await router.resolveBackend(),
      process.platform === "linux" ? "legacy" : "sandbox-cli",
    );
    assert.equal(router.pickDelegate("sandbox-cli").delegate, shellService);
    assert.equal(router.pickDelegate("legacy").delegate, local.legacyShell);
    // Exercise Linux routing with an explicit legacy-engine boundary. The wrapper
    // delegates the harmless command unchanged; this is not OS sandbox enforcement.
    const oldPlatform = runtime.modules[70857].platform;
    runtime.modules[70857].platform = () => "linux";
    runtime.legacy.wrapWithSandbox = async (command: string) => command;
    try {
      assert.equal(await router.resolveBackend(), "legacy");
      const legacyHandle = await router.execute({
        command: JSON.stringify(process.execPath) + " " + JSON.stringify(file),
        rawCommand: true,
        usePty: false,
      });
      assert.equal(local.legacyShell.getActiveHandleCount(), 0);
      assert.equal(local.localShell.getActiveHandleCount(), 1);
      assert.equal((await legacyHandle.wait()).stdout, "graph-owned");
      await router.disposeAll();
      assert.equal(router.getActiveHandleCount(), 0);
    } finally {
      runtime.modules[70857].platform = oldPlatform;
    }
  } finally {
    if (graph) {
      await graph.delegatingShellService?.disposeAll();
      graph.local?.snapshot.clearCache();
      await graph.lifecycle.stop();
    }
    await f.close();
  }
});

test("combined Shell graph rejects ambiguous owned and borrowed delegates before construction", () => {
  const base: any = {
    runtime: {},
    logger: {},
    local: {},
    shell: { localShellService: {} },
  };
  assert.throws(
    () => createNativeSandboxServices(base),
    /owned local Shell composition/,
  );
  assert.throws(
    () =>
      createNativeSandboxServices({
        ...base,
        shell: undefined,
        finalization: { delegates: {} },
      }),
    /supplies its own routing delegates/,
  );
});
