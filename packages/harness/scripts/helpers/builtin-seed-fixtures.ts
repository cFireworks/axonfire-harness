import * as fs from "node:fs";
import * as path from "node:path";
import { createNativeBuiltinSeed } from "../../src/plugins/native-builtin-seed.js";
export async function ownedBuiltinAssets(
  root: string,
  entries: any[] = [
    { name: "seed-owned", version: "1.0.0", category: "builtin-plugin" },
  ],
) {
  const assets = path.join(root, "assets"),
    market = path.join(assets, "plugins", "workbuddy-builtin");
  async function put(file: string, text: string) {
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, text);
  }
  const plugins = entries.map((p) => ({ source: "./plugins/" + p.name, ...p }));
  await put(
    path.join(market, ".codebuddy-plugin", "marketplace.json"),
    JSON.stringify({
      name: "workbuddy-builtin",
      description: "owned fixture",
      plugins,
    }),
  );
  for (const plugin of plugins) {
    const dir = path.resolve(market, plugin.source);
    const rel = path.relative(market, dir);
    if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel))
      throw Error("Fixture source escapes owned marketplace");
    await put(
      path.join(dir, ".codebuddy-plugin", "plugin.json"),
      JSON.stringify({
        name: plugin.name,
        version: plugin.version ?? "5.3.14+825709d464",
        description: "owned seed plugin",
      }),
    );
    await put(
      path.join(dir, "commands", "echo.md"),
      "---\ndescription: owned seeded command\n---\nowned seed " +
        plugin.name +
        " $ARGUMENTS",
    );
    await put(
      path.join(dir, "agents", "expert.md"),
      "---\nname: seeded-expert\ndescription: owned seeded agent\n---\nowned seeded instructions",
    );
  }
  return { assets, market, plugins, put };
}
export function builtinSeedFixture(
  root: string,
  factory: any = createNativeBuiltinSeed,
  overrides: any = {},
) {
  const logs: any[] = [];
  const runtime: any = {
    fs,
    process: { pid: 12345, platform: "darwin" },
    Date: class extends Date {
      constructor(value: any = 1700000000000) {
        super(value);
      }
      static now() {
        return 1700000000000;
      }
    },
    getConfigDir: () => path.join(root, "state"),
    getAppVersion: () => "5.3.14",
    resolveBundledAsset: (...segments: string[]) => {
      const file = path.join(root, "assets", ...segments);
      return fs.existsSync(file) ? file : undefined;
    },
    console: Object.fromEntries(
      ["info", "warn", "error"].map((k) => [
        k,
        (...args: any[]) => logs.push([k, ...args]),
      ]),
    ),
    ...overrides,
  };
  return { root, runtime, native: factory(runtime), logs };
}
