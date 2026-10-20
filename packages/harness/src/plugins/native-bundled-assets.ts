// Complete original bundled-assets resolver; explicit platform binding, no Electron import.
import * as nodeFs from "node:fs";
import * as path from "node:path";
export const BUNDLED_ASSETS_SOURCE_SHA256 =
  "3a3e001bb227550087d735d07e470a9d06ac8d29141ea1764e0eb48c6e467251";
export const BUNDLED_ASSET_FUNCTIONS = [
  ["setBundledAssetsRoot", 1176, 1228],
  ["getAssetsRoot", 1229, 1289],
  ["getElectronResourcesPath", 1290, 1471],
  ["resolveBundledAsset", 1849, 2040],
  ["requireBundledAsset", 2041, 2473],
] as const;
export const BUNDLED_ASSET_CANDIDATES = [2577, 3313] as const;
export function createNativeBundledAssets(runtime: any = {}) {
  const process: any = runtime.process ?? globalThis.process,
    fs: any = runtime.fs ?? nodeFs;
  let _root: any, CANDIDATES_FNS: any;
  CANDIDATES_FNS = [
    (_root: any, segments: any) => {
      const resourcesPath: any = getElectronResourcesPath();
      return resourcesPath
        ? (0, path.join)(
            resourcesPath,
            "app.asar.unpacked",
            "resources",
            ...segments,
          )
        : void 0;
    },
    (_root: any, segments: any) => {
      const resourcesPath: any = getElectronResourcesPath();
      return resourcesPath
        ? (0, path.join)(resourcesPath, "app.asar.unpacked", ...segments)
        : void 0;
    },
    (root: any, segments: any) => (0, path.join)(root, ...segments),
    (root: any, segments: any) =>
      (0, path.join)(root, "..", "resources", ...segments),
    (root: any, segments: any) =>
      (0, path.join)(root, "resources", ...segments),
    (root: any, segments: any) => (0, path.join)(root, "..", "..", ...segments),
    (root: any, segments: any) =>
      (0, path.join)(root, "..", "..", "resources", ...segments),
  ];
  // UTF-16 1176..1228
  function setBundledAssetsRoot(dir: any): any {
    _root = dir;
  }
  // UTF-16 1229..1289
  function getAssetsRoot(): any {
    return _root ?? process.cwd();
  }
  // UTF-16 1290..1471
  function getElectronResourcesPath(): any {
    const resourcesPath: any = process.resourcesPath;
    return typeof resourcesPath === "string" && resourcesPath.length > 0
      ? resourcesPath
      : void 0;
  }
  // UTF-16 1849..2040
  function resolveBundledAsset(...segments: any[]): any {
    const root: any = getAssetsRoot();
    for (const fn of CANDIDATES_FNS) {
      const p: any = fn(root, segments);
      if (p && (0, fs.existsSync)(p)) return p;
    }
  }
  // UTF-16 2041..2473
  function requireBundledAsset(...segments: any[]): any {
    const resolved: any = resolveBundledAsset(...segments);
    if (!resolved) {
      const root: any = getAssetsRoot();
      throw new Error(
        `[bundled-assets] Cannot locate "${segments.join("/")}".\n  Root: ${root}\n  Searched:
` +
          CANDIDATES_FNS.map((fn: any) => {
            const candidate: any = fn(root, segments);
            return candidate ? `    - ${candidate}` : null;
          })
            .filter(Boolean)
            .join("\n"),
      );
    }
    return resolved;
  }
  return {
    setBundledAssetsRoot,
    getAssetsRoot,
    getElectronResourcesPath,
    resolveBundledAsset,
    requireBundledAsset,
    get candidates() {
      return CANDIDATES_FNS;
    },
  };
}
