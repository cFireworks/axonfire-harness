import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, sep } from "node:path";

const dependencyRequire = createRequire(import.meta.url);
let shared: any;

/** Keep zod3/v4's 4.0.0 core separate from the harness's unrelated zod 4.3.5. */
export function getAcpZodRuntime(): any {
  if (shared) return shared;
  const manifestPath = dependencyRequire.resolve("zod3/package.json"),
    root = dirname(manifestPath);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.version !== "3.25.67")
    throw Error(
      "ACP schema runtime requires the locked zod3@3.25.67 dependency",
    );
  const cache = new Map<string, { exports: any }>();
  function load(filename: string): any {
    if (!filename.startsWith(root + sep))
      throw Error("ACP schema dependency resolved outside its package");
    const existing = cache.get(filename);
    if (existing) return existing.exports;
    const module = { exports: {} as any };
    cache.set(filename, module);
    const localRequire = createRequire(filename);
    const scopedRequire = (id: string): any => {
      // This older package uses bare self-imports. npm aliases otherwise redirect those to root zod 4.3.5.
      if (id === "zod" || id.startsWith("zod/"))
        return load(dependencyRequire.resolve("zod3" + id.slice(3)));
      if (id.startsWith(".")) return load(localRequire.resolve(id));
      throw Error("Unexpected ACP schema dependency: " + id);
    };
    // Execute only installed, pinned library modules; source and resolution stay unmodified within that package.
    const wrapper = Function(
      "require",
      "module",
      "exports",
      "__filename",
      "__dirname",
      readFileSync(filename, "utf8"),
    );
    wrapper.call(
      module.exports,
      scopedRequire,
      module,
      module.exports,
      filename,
      dirname(filename),
    );
    return module.exports;
  }
  shared = load(dependencyRequire.resolve("zod3/v4"));
  const version = shared.core?.version;
  if (
    !version ||
    [version.major, version.minor, version.patch].join(".") !== "4.0.0"
  ) {
    shared = undefined;
    throw Error(
      "ACP schema runtime core version differs from the captured 4.0.0 ABI",
    );
  }
  return shared;
}
