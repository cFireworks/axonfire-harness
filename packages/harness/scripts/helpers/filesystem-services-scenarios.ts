import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import * as fs from "node:fs";
import { tmpdir, homedir, platform } from "node:os";
import { join } from "node:path";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import {
  createNativeFilesystemServices,
  FILESYSTEM_SERVICES_MODULES,
} from "../../src/runtime/native-filesystem-services.js";
const require = createRequire(import.meta.url);
export async function filesystemServicesScenario(
  factory: typeof createNativeFilesystemServices,
) {
  const di = createNativeDi(diRuntime()),
    core = di.getModule(78842).default;
  di.ConfigUtil.getRaw().cell.logger.level = "error";
  const messages: any[] = [];
  const quiet = {
    ...console,
    info: (...a: any[]) => messages.push(a),
    warn: (...a: any[]) => messages.push(a),
    error: (...a: any[]) => messages.push(a),
  };
  const runtime = {
    di,
    globals: Object.create(globalThis),
    require,
    process,
    console: quiet,
  };
  const foundation = createNativeBackendFoundation(runtime),
    express = createNativeExpress(runtime);
  const host = factory({
    ...runtime,
    http: foundation,
    express,
    getModule: foundation.getModule,
  });
  const ids = new Set<number>(FILESYSTEM_SERVICES_MODULES.map(([id]) => id));
  const bootstrap = createNativeContainerBootstrap({
    di,
    configBasePath: "/owned",
    getModule(id: number) {
      return ids.has(id) ? host.getModule(id) : foundation.getModule(id);
    },
  });
  const container = di.ContainerFactory.create(core);
  const temp = await mkdtemp(join(tmpdir(), "axon-fs-"));
  let subscription: any;
  try {
    container.load(bootstrap.getModule(53879).default);
    container.load(bootstrap.getModule(61488).default);
    di.ContainerProvider.set(container);
    const api = host.load(),
      token = host.getModule(72018).FileSystem;
    const memory = container.get(token);
    assert.equal(memory, host.getModule(61000).fs);
    memory.mkdirSync("/owned");
    memory.writeFileSync("/owned/memory.txt", "memory only");
    assert.equal(
      memory.readFileSync("/owned/memory.txt", "utf8"),
      "memory only",
    );
    const volume = new (host.getModule(61000).Volume)();
    volume.fromJSON({ "/isolated.txt": "isolated" });
    assert.equal(volume.readFileSync("/isolated.txt", "utf8"), "isolated");
    assert.equal(memory.existsSync("/isolated.txt"), false);
    container.load(bootstrap.getModule(97619).default);
    const disk = container.get(token);
    assert.notEqual(disk, memory);
    assert.equal(disk.default, require("node:fs"));
    assert.equal(disk.readFileSync, fs.readFileSync);
    await disk.promises.writeFile(join(temp, "disk.txt"), "disk only");
    assert.equal(await readFile(join(temp, "disk.txt"), "utf8"), "disk only");
    assert.equal(memory.existsSync(join(temp, "disk.txt")), false);
    const workspace = container.get(api.Workspace);
    assert.deepEqual(workspace.workspaceFolders, []);
    const variables = foundation.getModule(66915),
      manager = container.get(variables.ContextVariableManager);
    const initial = await manager.getContextVariable({ name: "systemInfo" });
    assert.equal(initial.value.workspace, join(homedir(), "Desktop"));
    workspace.workspaceFolders = [{ uri: api.URI.file(temp) }];
    const current = await manager.getContextVariable({ name: "systemInfo" });
    assert.deepEqual(current, {
      name: "systemInfo",
      value: {
        os: platform(),
        workspace: temp,
        defaultShell: process.platform === "win32" ? "powershell" : "bash",
      },
    });
    const storage = container.get(api.LocalStorage),
      changes: any[] = [];
    subscription = storage.changeEvent((event: any) => changes.push(event));
    await storage.set("owned", { x: 1 });
    assert.deepEqual(await storage.get("owned", null), { x: 1 });
    await storage.set("zero", 0);
    assert.equal(await storage.get("zero", 1), 0);
    await storage.remove("owned");
    assert.equal(await storage.get("owned", "fallback"), "fallback");
    assert.deepEqual(changes, [
      { domain: "owned" },
      { domain: "zero" },
      { domain: "owned" },
    ]);
    assert.equal(
      await container
        .get(api.ExternalUriOpener)
        .open("https://example.invalid"),
      false,
    );
    assert.equal(await container.get(api.PagePreviewer).preview("owned"), true);
    const notifier = container.get(api.Notifier);
    await notifier.info("owned {0} {0}", [7]);
    assert.deepEqual(messages.at(-1), ["owned 7 {0}"]);
    assert.equal(
      await container.get(api.UserinfoProvider).provide(),
      undefined,
    );
    return {
      memory: memory.readFileSync("/owned/memory.txt", "utf8"),
      disk: "disk only",
      changes,
      system: { ...current.value, workspace: "<owned>" },
      notification: messages.at(-1),
    };
  } finally {
    subscription?.dispose();
    await container.unbindAllAsync();
    await foundation.closeContext();
    await rm(temp, { recursive: true, force: true });
  }
}
