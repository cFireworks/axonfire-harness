import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as module from "node:module";
import { fileURLToPath } from "node:url";
import { createNativeSafeDelete } from "../../src/sandbox/native-safe-delete.js";
const candidates = [
  new URL("../../vendor/", import.meta.url),
  new URL("../../../vendor/", import.meta.url),
];
export const safeDeleteVendorRoot = fileURLToPath(
  candidates.find((p) => fs.existsSync(new URL("shim-manifest.json", p)))!,
);
export function safeDeleteFixture(
  factory = createNativeSafeDelete,
  options: any = {},
) {
  const root =
    options.root ??
    fs.mkdtempSync(path.join(os.tmpdir(), "axonfire-safe-delete-"));
  fs.mkdirSync(path.join(root, "tmp"), { recursive: true });
  if (options.assets !== false)
    fs.cpSync(
      path.join(safeDeleteVendorRoot, "shim"),
      path.join(root, "vendor", "shim"),
      { recursive: true },
    );
  const logs: any[] = [];
  const runtime: any = {
    process: {
      env: { CODEBUDDY_HOST: "workbuddy-desktop" },
      argv: [],
      pid: 4242,
      execPath: process.execPath,
      platform: process.platform,
      versions: process.versions,
    },
    __filename: path.join(root, "entry.cjs"),
    __dirname: root,
    Date: { now: () => 1000 },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    modules: {
      79896: fs,
      70857: {
        platform: () => process.platform,
        tmpdir: () => path.join(root, "tmp"),
      },
      16928: path,
      44237: {
        PathUtils: { getRootPathSync: () => root, getWorkDir: () => root },
      },
      73339: module,
      ...options.modules,
    },
  };
  Object.assign(runtime.process, options.process);
  const native = factory(runtime),
    s = native.safeDelete,
    logger = {
      info: (...a: any[]) => logs.push(a),
      debug: (...a: any[]) => logs.push(a),
      warn: (...a: any[]) => logs.push(a),
    };
  return {
    root,
    runtime,
    native,
    s,
    logs,
    logger,
    close: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}
