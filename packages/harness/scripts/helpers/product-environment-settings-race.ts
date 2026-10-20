import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { settingsFixture } from "./settings-fixtures.js";
import { toolPermissionFixture } from "./tool-permission-fixtures.js";
import { productEnvironmentFixture } from "./product-environment-fixtures.js";
/** Deterministic original read/cache/write interleaving, not a production serialization fix. */
export async function productEnvironmentSettingsRace(factories: any = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), "environment-cache-race-"));
  let enter!: () => void,
    release!: () => void,
    armed = false;
  const entered = new Promise<void>((r) => (enter = r)),
    held = new Promise<void>((r) => (release = r));
  const file = join(root, "state", "settings.json");
  const settings = settingsFixture(root, factories.settings ?? {}, {
    fsPromises: {
      ...fs,
      async readFile(...args: any[]) {
        const text = await (fs.readFile as any)(...args);
        if (armed && args[0] === file) {
          armed = false;
          enter();
          await held;
        }
        return text;
      },
    },
  });
  const permission = toolPermissionFixture(
    { settingsManager: settings.manager },
    factories.permission,
  );
  const env = productEnvironmentFixture(factories.environment);
  env.endpoint.settingsManager = settings.manager;
  let reading: Promise<any> | undefined;
  try {
    await settings.put("user", '{"permissions":{"allow":["Write"]}}');
    await permission.service.initializeContext(permission.session);
    settings.manager.clearCache("user");
    armed = true;
    reading = env.endpoint.generateConfig();
    await entered;
    await permission.service.applyUpdate(permission.session, {
      type: "addRules",
      destination: "userSettings",
      behavior: "allow",
      rules: [{ toolName: "Read" }],
    });
    const afterWrite = JSON.parse(await settings.read("user")).permissions
      .allow;
    assert.deepEqual(afterWrite, ["Write", "Read"]);
    release();
    await reading;
    const stale = (await settings.manager.get("permissions", "user")).allow;
    await permission.service.applyUpdate(permission.session, {
      type: "removeRules",
      destination: "userSettings",
      behavior: "allow",
      rules: [{ toolName: "Write" }],
    });
    return JSON.parse(
      JSON.stringify({
        afterWrite,
        stale,
        finalDisk: JSON.parse(await settings.read("user")).permissions.allow,
        finalContext:
          permission.session.toolPermissionContext.allowRules.userSettings,
      }),
    );
  } finally {
    release();
    await reading?.catch(() => {});
    settings.dispose();
    env.dispose();
    await fs.rm(root, { recursive: true, force: true });
  }
}
