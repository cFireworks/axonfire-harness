// Original Desktop materializer/default policy; no Electron/bootstrap execution.
import * as fs from "node:fs";
import * as path from "node:path";
export const BUILTIN_SEED_MAIN_SHA256 =
  "ec41f11bec48bc4fcb81477a8695083161047db303504b03f2ef87dbf6d27935";
export const BUILTIN_SEED_FUNCTIONS = [
  ["safeCopyDirRecursive$1", 312270, 314251],
  ["createMarketplaceSeedPlan", 364636, 365944],
  ["seedBuiltinMarketplace", 365945, 366941],
  ["prepareSafePluginCacheRoot", 366942, 367368],
  ["prepareSafeMarketplaceRoot", 367369, 367706],
  ["prepareContainedDirectory", 367707, 368314],
  ["prepareDirectoryChain", 368315, 368867],
  ["assertRealPathStrictlyInside", 368868, 369182],
  ["assertRealPathMatchesLexicalRelative", 369183, 369748],
  ["assertRealParentAtOrInside", 369749, 370107],
  ["recoverLegacyPluginSnapshots", 370108, 372016],
  ["hasPluginManifest", 372017, 372210],
  ["seedMarketplaceSource", 372211, 374177],
  ["isMarketplaceSourceCurrent", 374178, 374800],
  ["swapDirectoryFromStaging", 374801, 376194],
  ["seedPluginSnapshots", 376195, 377536],
  ["copyPluginSnapshotAtomically", 377537, 379420],
  ["clearCurrentSnapshotOrphanMarker", 379421, 380144],
  ["lstatIfExists", 380145, 380298],
  ["prepareReplaceablePath", 380299, 380670],
  ["removePathSafelyWithin", 380671, 381278],
  ["isRealPathStrictlyInside", 381279, 381464],
  ["isResolvedPathStrictlyInside", 381465, 381694],
  ["isValidPluginSnapshot", 381695, 382264],
  ["getPluginCacheVersion", 382265, 382565],
  ["getMarketplaceSeedRevision", 382566, 382716],
  ["copyDirectoryIfMissing", 382717, 384242],
  ["isConcurrentDirectoryInstallRace", 384243, 384414],
  ["ensurePathInside", 384415, 384768],
  ["sanitizePathSegment", 384769, 384857],
  ["isRecord$1", 384858, 384959],
  ["isPluginMaterialized", 384960, 385384],
  ["writeJsonAtomic", 385385, 385873],
  ["isPluginSupportedOnPlatform", 386813, 387036],
  ["seedBuiltinPluginsMarketplace", 387323, 389775],
  ["resolveMarketplaceCandidates", 389776, 390315],
  ["readMarketplaceManifest", 390316, 390932],
  ["isValidMarketplaceManifest", 390933, 392094],
  ["resolveDefaultEnabledPluginNames", 392562, 392796],
  ["isBuiltinPluginSeedAllEnabled", 392920, 393064],
  ["isBuiltinPluginDefaultSeedEnabled", 393065, 393196],
  ["isDefaultSeedCandidate", 393197, 393302],
  ["applyDefaultEnabledPlugins", 393781, 394463],
] as const;
export const BUILTIN_SEED_CONSTANTS = [
  ["noopLogger$1", 311936, 311964],
  ["BUILTIN_MARKETPLACE_NAME", 364135, 364186],
  ["MARKETPLACE_MANIFEST_CANDIDATES", 364187, 364342],
  ["BUILD_COMMIT", 364343, 364375],
  ["MARKETPLACE_METADATA_DIR", 364376, 364427],
  ["EMPTY_SEED_RESULT", 386630, 386684],
  ["MARKETPLACE_ASSET_CANDIDATES", 386685, 386812],
  ["DEFAULT_ENABLED_PLUGIN_NAMES", 392095, 392229],
  ["DEFAULT_SEEDABLE_PLUGIN_CATEGORY", 392505, 392561],
] as const;
export function createNativeBuiltinSeed(runtime: any) {
  const node_fs: any = runtime.fs ?? fs,
    node_path = path,
    process: any = runtime.process ?? globalThis.process,
    Date: any = runtime.Date ?? globalThis.Date,
    console: any = runtime.console ?? globalThis.console;
  const require_runtime_context = {
      getWorkbuddyRuntimeConfigDir: runtime.getConfigDir,
      getWorkbuddyRuntimeAppVersion: runtime.getAppVersion,
    },
    require_workbuddy_product_config = {
      resolveBundledAsset: runtime.resolveBundledAsset,
    },
    require_common$1 = {
      ProductFeature: {
        IntentRecommend: "IntentRecommend",
        TencentPptxBuiltinDefaultEnabled: "TencentPptxBuiltinDefaultEnabled",
      },
    };
  var noopLogger$1 = () => {};
  var BUILTIN_MARKETPLACE_NAME = "workbuddy-builtin";
  var MARKETPLACE_MANIFEST_CANDIDATES = [
    ".codebuddy-plugin/marketplace.json",
    ".workbuddy-plugin/marketplace.json",
    ".claude-plugin/marketplace.json",
  ];
  var BUILD_COMMIT = "825709d464";
  var MARKETPLACE_METADATA_DIR = ".codebuddy-plugin";
  var EMPTY_SEED_RESULT = { marketplaceChanged: false };
  var MARKETPLACE_ASSET_CANDIDATES = [
    {
      label: "plugins/workbuddy-builtin",
      segments: ["plugins", BUILTIN_MARKETPLACE_NAME],
    },
  ];
  var DEFAULT_ENABLED_PLUGIN_NAMES = new Set([
    "tencent-pptx",
    "tencent-docs-plugin",
    "sheetagent",
    "weixinpay",
    "tencent-docx",
  ]);
  var DEFAULT_SEEDABLE_PLUGIN_CATEGORY = "builtin-plugin";
  // UTF-16 312270..314251
  function safeCopyDirRecursive$1(
    srcDir: any,
    dstDir: any,
    log: any = noopLogger$1,
  ): any {
    const result: any = {
      copied: 0,
      skipped: 0,
      errors: [],
    };
    let entries: any;
    try {
      entries = node_fs.readdirSync(srcDir, { withFileTypes: true });
    } catch (err: any) {
      const msg: any = err instanceof Error ? err.message : String(err);
      log(`safeCopyDirRecursive: cannot read srcDir=${srcDir}: ${msg}`);
      result.errors.push({
        file: srcDir,
        error: `readdirSync failed: ${msg}`,
      });
      return result;
    }
    try {
      node_fs.mkdirSync(dstDir, { recursive: true });
    } catch (err: any) {
      const msg: any = err instanceof Error ? err.message : String(err);
      result.errors.push({
        file: dstDir,
        error: `mkdirSync failed: ${msg}`,
      });
      return result;
    }
    for (const entry of entries) {
      const srcPath: any = node_path.join(srcDir, entry.name);
      const dstPath: any = node_path.join(dstDir, entry.name);
      if (entry.isSymbolicLink() || (!entry.isFile() && !entry.isDirectory())) {
        result.skipped++;
        continue;
      }
      if (entry.isDirectory()) {
        const sub: any = safeCopyDirRecursive$1(srcPath, dstPath, log);
        result.copied += sub.copied;
        result.skipped += sub.skipped;
        result.errors.push(...sub.errors);
        continue;
      }
      let fd: any;
      try {
        fd = node_fs.openSync(srcPath, "r");
      } catch (err: any) {
        const msg: any = err instanceof Error ? err.message : String(err);
        log(
          `safeCopyDirRecursive: skipping locked/unreadable file: ${srcPath} (${msg})`,
        );
        result.skipped++;
        result.errors.push({
          file: srcPath,
          error: `openSync failed: ${msg}`,
        });
        continue;
      } finally {
        if (fd !== void 0)
          try {
            node_fs.closeSync(fd);
          } catch {}
      }
      try {
        node_fs.copyFileSync(srcPath, dstPath);
        result.copied++;
      } catch (err: any) {
        const msg: any = err instanceof Error ? err.message : String(err);
        log(`safeCopyDirRecursive: copyFileSync failed for ${srcPath}: ${msg}`);
        result.skipped++;
        result.errors.push({
          file: srcPath,
          error: `copyFileSync failed: ${msg}`,
        });
      }
    }
    return result;
  }
  // UTF-16 364636..365944
  function createMarketplaceSeedPlan(selectedCandidates: any): any {
    const plugins: any = [];
    const pluginSourceDirs: any = /* @__PURE__ */ new Map();
    const pluginNames: any = /* @__PURE__ */ new Set();
    for (const selected of selectedCandidates)
      for (const plugin of selected.supportedPlugins) {
        if (pluginNames.has(plugin.name)) continue;
        const sourceDir: any = node_path.resolve(selected.dir, plugin.source);
        ensurePathInside(selected.dir, sourceDir, "packaged marketplace");
        if (!node_fs.existsSync(sourceDir)) {
          console.warn(
            `[seed-builtin-plugins] skip plugin ${plugin.name}: source directory not found at ${sourceDir}`,
          );
          continue;
        }
        plugins.push({
          ...plugin,
          version: getPluginCacheVersion(plugin),
        });
        pluginSourceDirs.set(plugin.name, sourceDir);
        pluginNames.add(plugin.name);
      }
    const baseManifest: any = selectedCandidates[0]?.manifest ?? {};
    return {
      manifest: {
        ...baseManifest,
        name: BUILTIN_MARKETPLACE_NAME,
        metadata: {
          ...(isRecord$1(baseManifest.metadata) ? baseManifest.metadata : {}),
          workbuddySeed: {
            version: 1,
            revision: getMarketplaceSeedRevision(),
            sourceMarketplaces: selectedCandidates.map(
              (selected: any) => selected.candidate.label,
            ),
            sourceRoots: selectedCandidates.map(
              (selected: any) => selected.dir,
            ),
          },
        },
        plugins,
      },
      pluginSourceDirs,
    };
  }
  // UTF-16 365945..366941
  function seedBuiltinMarketplace(
    configDir: any,
    selectedCandidates: any,
  ): any {
    const pluginsRoot: any = node_path.join(configDir, "plugins");
    const marketplaceRoot: any = node_path.join(
      pluginsRoot,
      "marketplaces",
      BUILTIN_MARKETPLACE_NAME,
    );
    const cacheRoot: any = node_path.join(
      pluginsRoot,
      "cache",
      BUILTIN_MARKETPLACE_NAME,
    );
    const plan: any = createMarketplaceSeedPlan(selectedCandidates);
    node_fs.mkdirSync(configDir, { recursive: true });
    prepareContainedDirectory(configDir, pluginsRoot, "plugins root", false);
    prepareSafePluginCacheRoot(configDir, cacheRoot);
    prepareSafeMarketplaceRoot(pluginsRoot, marketplaceRoot);
    const recoveredLegacyCache: any = recoverLegacyPluginSnapshots(
      marketplaceRoot,
      cacheRoot,
    );
    const sourceChanged: any = seedMarketplaceSource(
      pluginsRoot,
      marketplaceRoot,
      plan,
    );
    const cacheChanged: any = seedPluginSnapshots(
      marketplaceRoot,
      cacheRoot,
      plan.manifest,
    );
    return {
      marketplaceRoot,
      cacheRoot,
      manifest: plan.manifest,
      changed: recoveredLegacyCache || sourceChanged || cacheChanged,
    };
  }
  // UTF-16 366942..367368
  function prepareSafePluginCacheRoot(configDir: any, cacheRoot: any): any {
    const pluginsRoot: any = node_path.join(configDir, "plugins");
    const sharedCacheRoot: any = node_path.join(pluginsRoot, "cache");
    node_fs.mkdirSync(pluginsRoot, { recursive: true });
    prepareContainedDirectory(
      pluginsRoot,
      sharedCacheRoot,
      "plugins/cache",
      false,
    );
    prepareContainedDirectory(
      sharedCacheRoot,
      cacheRoot,
      `plugin cache ${BUILTIN_MARKETPLACE_NAME}`,
      false,
    );
  }
  // UTF-16 367369..367706
  function prepareSafeMarketplaceRoot(
    pluginsRoot: any,
    marketplaceRoot: any,
  ): any {
    node_fs.mkdirSync(pluginsRoot, { recursive: true });
    prepareContainedDirectory(
      pluginsRoot,
      node_path.dirname(marketplaceRoot),
      "plugins/marketplaces",
      true,
    );
    prepareContainedDirectory(
      pluginsRoot,
      marketplaceRoot,
      `marketplace ${BUILTIN_MARKETPLACE_NAME}`,
      true,
    );
  }
  // UTF-16 367707..368314
  function prepareContainedDirectory(
    trustedRoot: any,
    target: any,
    label: any,
    repairSymlink: any,
  ): any {
    ensurePathInside(trustedRoot, target, label);
    assertRealParentAtOrInside(trustedRoot, target, `${label} parent`);
    const entry: any = lstatIfExists(target);
    if (entry?.isSymbolicLink()) {
      if (!repairSymlink)
        throw new Error(`Refusing symlinked ${label}: ${target}`);
      node_fs.unlinkSync(target);
    } else if (entry && !entry.isDirectory())
      throw new Error(`Refusing non-directory ${label}: ${target}`);
    if (!lstatIfExists(target)) node_fs.mkdirSync(target);
    assertRealPathMatchesLexicalRelative(trustedRoot, target, label);
  }
  // UTF-16 368315..368867
  function prepareDirectoryChain(
    trustedRoot: any,
    target: any,
    label: any,
  ): any {
    const resolvedRoot: any = node_path.resolve(trustedRoot);
    const resolvedTarget: any = node_path.resolve(target);
    if (resolvedTarget === resolvedRoot) return;
    ensurePathInside(resolvedRoot, resolvedTarget, label);
    const relative: any = node_path.relative(resolvedRoot, resolvedTarget);
    let current: any = resolvedRoot;
    for (const segment of relative.split(node_path.sep).filter(Boolean)) {
      current = node_path.join(current, segment);
      prepareContainedDirectory(resolvedRoot, current, label, true);
    }
  }
  // UTF-16 368868..369182
  function assertRealPathStrictlyInside(
    root: any,
    target: any,
    label: any,
  ): any {
    const realRoot: any = node_fs.realpathSync(root);
    const realTarget: any = node_fs.realpathSync(target);
    if (!isResolvedPathStrictlyInside(realRoot, realTarget))
      throw new Error(
        `Refusing ${label} outside its real parent: ${realTarget} (parent=${realRoot})`,
      );
  }
  // UTF-16 369183..369748
  function assertRealPathMatchesLexicalRelative(
    root: any,
    target: any,
    label: any,
  ): any {
    const resolvedRoot: any = node_path.resolve(root);
    const resolvedTarget: any = node_path.resolve(target);
    ensurePathInside(resolvedRoot, resolvedTarget, label);
    const realRoot: any = node_fs.realpathSync(resolvedRoot);
    const realTarget: any = node_fs.realpathSync(resolvedTarget);
    const expectedTarget: any = node_path.resolve(
      realRoot,
      node_path.relative(resolvedRoot, resolvedTarget),
    );
    if (realTarget !== expectedTarget)
      throw new Error(
        `Refusing aliased ${label}: ${realTarget} (expected=${expectedTarget})`,
      );
  }
  // UTF-16 369749..370107
  function assertRealParentAtOrInside(root: any, target: any, label: any): any {
    const realRoot: any = node_fs.realpathSync(root);
    const realParent: any = node_fs.realpathSync(node_path.dirname(target));
    if (
      realParent !== realRoot &&
      !isResolvedPathStrictlyInside(realRoot, realParent)
    )
      throw new Error(
        `Refusing ${label} outside its real parent: ${realParent} (parent=${realRoot})`,
      );
  }
  // UTF-16 370108..372016
  function recoverLegacyPluginSnapshots(
    marketplaceRoot: any,
    cacheRoot: any,
  ): any {
    const manifestPath: any = node_path.join(
      marketplaceRoot,
      MARKETPLACE_METADATA_DIR,
      "marketplace.json",
    );
    if (!node_fs.existsSync(manifestPath)) return false;
    let manifest: any;
    try {
      if (!isRealPathStrictlyInside(marketplaceRoot, manifestPath))
        return false;
      manifest = JSON.parse(node_fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      return false;
    }
    const plugins: any = manifest.plugins ?? [];
    if (
      !(
        plugins.length > 0 &&
        plugins.every((plugin: any) => {
          const segments: any = plugin.source
            .replace(/\\/g, "/")
            .replace(/^\.\//, "")
            .split("/")
            .filter(Boolean);
          return segments.length === 2 && segments[0] === plugin.name;
        })
      )
    )
      return false;
    let changed: any = false;
    for (const pluginDirent of node_fs.readdirSync(marketplaceRoot, {
      withFileTypes: true,
    })) {
      if (!pluginDirent.isDirectory() || pluginDirent.name.startsWith("."))
        continue;
      const pluginRoot: any = node_path.join(
        marketplaceRoot,
        pluginDirent.name,
      );
      for (const versionDirent of node_fs.readdirSync(pluginRoot, {
        withFileTypes: true,
      })) {
        if (!versionDirent.isDirectory() || versionDirent.name.startsWith("."))
          continue;
        const legacySnapshot: any = node_path.join(
          pluginRoot,
          versionDirent.name,
        );
        if (!hasPluginManifest(legacySnapshot)) continue;
        const pluginCacheRoot: any = node_path.join(
          cacheRoot,
          pluginDirent.name,
        );
        prepareContainedDirectory(
          cacheRoot,
          pluginCacheRoot,
          `plugin cache ${pluginDirent.name}`,
          true,
        );
        const cacheSnapshot: any = node_path.join(
          pluginCacheRoot,
          versionDirent.name,
        );
        ensurePathInside(
          marketplaceRoot,
          legacySnapshot,
          "legacy marketplace cache",
        );
        ensurePathInside(cacheRoot, cacheSnapshot, "plugin cache");
        prepareReplaceablePath(
          cacheRoot,
          cacheSnapshot,
          "legacy plugin snapshot",
        );
        changed =
          copyDirectoryIfMissing(
            legacySnapshot,
            cacheSnapshot,
            cacheRoot,
            pluginDirent.name,
            versionDirent.name,
          ) || changed;
      }
    }
    return changed;
  }
  // UTF-16 372017..372210
  function hasPluginManifest(pluginRoot: any): any {
    return MARKETPLACE_MANIFEST_CANDIDATES.some((rel: any) =>
      node_fs.existsSync(
        node_path.join(
          pluginRoot,
          rel.replace("marketplace.json", "plugin.json"),
        ),
      ),
    );
  }
  // UTF-16 372211..374177
  function seedMarketplaceSource(
    pluginsRoot: any,
    marketplaceRoot: any,
    plan: any,
  ): any {
    if (isMarketplaceSourceCurrent(marketplaceRoot, plan.manifest))
      return false;
    const stagingRoot: any = `${marketplaceRoot}.staging.${process.pid}.${Date.now()}`;
    removePathSafelyWithin(
      pluginsRoot,
      stagingRoot,
      "marketplace staging directory",
    );
    assertRealParentAtOrInside(
      pluginsRoot,
      stagingRoot,
      "marketplace staging parent",
    );
    node_fs.mkdirSync(stagingRoot);
    assertRealPathStrictlyInside(
      pluginsRoot,
      stagingRoot,
      "marketplace staging directory",
    );
    try {
      for (const plugin of plan.manifest.plugins ?? []) {
        const sourceDir: any = plan.pluginSourceDirs.get(plugin.name);
        if (!sourceDir) continue;
        const targetDir: any = node_path.resolve(stagingRoot, plugin.source);
        ensurePathInside(stagingRoot, targetDir, "seeded marketplace");
        prepareDirectoryChain(
          stagingRoot,
          node_path.dirname(targetDir),
          `marketplace staging parent for ${plugin.name}`,
        );
        prepareReplaceablePath(
          stagingRoot,
          targetDir,
          `marketplace staging target for ${plugin.name}`,
        );
        const copyMarketplace: any = safeCopyDirRecursive$1(
          sourceDir,
          targetDir,
          (msg: any) => {
            console.warn(`[builtin-plugin-marketplace] ${msg}`);
          },
        );
        if (copyMarketplace.errors.length > 0)
          throw new Error(
            `marketplace staging copy for ${plugin.name} incomplete: ${copyMarketplace.copied} copied, ${copyMarketplace.skipped} skipped, ${copyMarketplace.errors.length} error(s)`,
          );
        assertRealPathStrictlyInside(
          stagingRoot,
          targetDir,
          `marketplace staging target for ${plugin.name}`,
        );
      }
      const metadataDir: any = node_path.join(
        stagingRoot,
        MARKETPLACE_METADATA_DIR,
      );
      prepareDirectoryChain(
        stagingRoot,
        metadataDir,
        "marketplace metadata directory",
      );
      writeJsonAtomic(
        node_path.join(metadataDir, "marketplace.json"),
        plan.manifest,
      );
      swapDirectoryFromStaging(
        stagingRoot,
        marketplaceRoot,
        pluginsRoot,
        "marketplace source",
      );
      return true;
    } finally {
      removePathSafelyWithin(
        pluginsRoot,
        stagingRoot,
        "marketplace staging directory",
      );
    }
  }
  // UTF-16 374178..374800
  function isMarketplaceSourceCurrent(
    marketplaceRoot: any,
    desiredManifest: any,
  ): any {
    const manifestPath: any = node_path.join(
      marketplaceRoot,
      MARKETPLACE_METADATA_DIR,
      "marketplace.json",
    );
    if (!node_fs.existsSync(manifestPath)) return false;
    try {
      if (!isRealPathStrictlyInside(marketplaceRoot, manifestPath))
        return false;
      const currentManifest: any = JSON.parse(
        node_fs.readFileSync(manifestPath, "utf-8"),
      );
      if (JSON.stringify(currentManifest) !== JSON.stringify(desiredManifest))
        return false;
      return (desiredManifest.plugins ?? []).every((plugin: any) =>
        isPluginMaterialized(marketplaceRoot, plugin),
      );
    } catch {
      return false;
    }
  }
  // UTF-16 374801..376194
  function swapDirectoryFromStaging(
    stagingRoot: any,
    targetRoot: any,
    trustedRoot: any,
    label: any,
  ): any {
    ensurePathInside(trustedRoot, stagingRoot, `${label} staging`);
    ensurePathInside(trustedRoot, targetRoot, label);
    assertRealParentAtOrInside(
      trustedRoot,
      stagingRoot,
      `${label} staging parent`,
    );
    assertRealParentAtOrInside(trustedRoot, targetRoot, `${label} parent`);
    assertRealPathStrictlyInside(trustedRoot, stagingRoot, `${label} staging`);
    prepareReplaceablePath(trustedRoot, targetRoot, label);
    const backupRoot: any = `${targetRoot}.backup.${process.pid}.${Date.now()}`;
    removePathSafelyWithin(trustedRoot, backupRoot, `${label} backup`);
    let backupCreated: any = false;
    try {
      if (lstatIfExists(targetRoot)) {
        node_fs.renameSync(targetRoot, backupRoot);
        backupCreated = true;
      }
      try {
        node_fs.renameSync(stagingRoot, targetRoot);
      } catch (error: any) {
        if (backupCreated && !lstatIfExists(targetRoot)) {
          node_fs.renameSync(backupRoot, targetRoot);
          backupCreated = false;
        }
        throw error;
      }
      if (backupCreated) {
        removePathSafelyWithin(trustedRoot, backupRoot, `${label} backup`);
        backupCreated = false;
      }
    } finally {
      if (
        backupCreated &&
        !lstatIfExists(targetRoot) &&
        lstatIfExists(backupRoot)
      ) {
        node_fs.renameSync(backupRoot, targetRoot);
        backupCreated = false;
      }
      if (backupCreated)
        removePathSafelyWithin(trustedRoot, backupRoot, `${label} backup`);
    }
  }
  // UTF-16 376195..377536
  function seedPluginSnapshots(
    marketplaceRoot: any,
    cacheRoot: any,
    manifest: any,
  ): any {
    let changed: any = false;
    node_fs.mkdirSync(cacheRoot, { recursive: true });
    for (const plugin of manifest.plugins ?? []) {
      const version: any = getPluginCacheVersion(plugin);
      const sourceDir: any = node_path.resolve(marketplaceRoot, plugin.source);
      const pluginRoot: any = node_path.join(
        cacheRoot,
        sanitizePathSegment(plugin.name),
      );
      prepareContainedDirectory(
        cacheRoot,
        pluginRoot,
        `plugin cache ${plugin.name}`,
        true,
      );
      const pluginCacheDir: any = node_path.join(pluginRoot, version);
      ensurePathInside(marketplaceRoot, sourceDir, "marketplace source");
      ensurePathInside(cacheRoot, pluginCacheDir, "plugin cache");
      if (!node_fs.existsSync(sourceDir)) {
        console.warn(
          `[seed-builtin-plugins] skip plugin ${plugin.name}: seeded source not found at ${sourceDir}`,
        );
        continue;
      }
      assertRealPathStrictlyInside(
        marketplaceRoot,
        sourceDir,
        `marketplace source ${plugin.name}`,
      );
      prepareReplaceablePath(
        cacheRoot,
        pluginCacheDir,
        `plugin snapshot ${plugin.name}@${version}`,
      );
      const snapshotChanged: any = copyPluginSnapshotAtomically(
        sourceDir,
        pluginCacheDir,
        plugin.name,
        version,
        cacheRoot,
      );
      const markerChanged: any = clearCurrentSnapshotOrphanMarker(
        cacheRoot,
        pluginCacheDir,
        plugin.name,
        version,
      );
      changed = snapshotChanged || markerChanged || changed;
    }
    return changed;
  }
  // UTF-16 377537..379420
  function copyPluginSnapshotAtomically(
    sourceDir: any,
    targetDir: any,
    expectedName: any,
    expectedVersion: any,
    cacheRoot: any,
  ): any {
    if (!isValidPluginSnapshot(sourceDir, expectedName, expectedVersion))
      throw new Error(
        `Packaged plugin snapshot ${sourceDir} does not match ${expectedName}@${expectedVersion}`,
      );
    if (
      isRealPathStrictlyInside(cacheRoot, targetDir) &&
      isValidPluginSnapshot(targetDir, expectedName, expectedVersion)
    )
      return false;
    const stagingDir: any = `${targetDir}.tmp.${process.pid}.${Date.now()}`;
    removePathSafelyWithin(
      cacheRoot,
      stagingDir,
      "plugin snapshot staging directory",
    );
    assertRealParentAtOrInside(
      cacheRoot,
      stagingDir,
      "plugin snapshot staging parent",
    );
    const copySnapshot: any = safeCopyDirRecursive$1(
      sourceDir,
      stagingDir,
      (msg: any) => {
        console.warn(`[builtin-plugin-marketplace] ${msg}`);
      },
    );
    if (copySnapshot.errors.length > 0) {
      console.warn(
        `[builtin-plugin-marketplace] snapshot staging for ${expectedName}@${expectedVersion} failed: ${copySnapshot.copied} copied, ${copySnapshot.skipped} skipped, ${copySnapshot.errors.length} error(s) — discarding staging`,
      );
      removePathSafelyWithin(
        cacheRoot,
        stagingDir,
        "plugin snapshot staging directory",
      );
      return false;
    }
    assertRealPathStrictlyInside(
      cacheRoot,
      stagingDir,
      "plugin snapshot staging directory",
    );
    try {
      if (!isValidPluginSnapshot(stagingDir, expectedName, expectedVersion))
        throw new Error(
          `Staged plugin snapshot is incomplete at ${stagingDir}`,
        );
      try {
        swapDirectoryFromStaging(
          stagingDir,
          targetDir,
          cacheRoot,
          `plugin snapshot ${expectedName}@${expectedVersion}`,
        );
        return true;
      } catch (error: any) {
        if (
          isConcurrentDirectoryInstallRace(error) &&
          isRealPathStrictlyInside(cacheRoot, targetDir) &&
          isValidPluginSnapshot(targetDir, expectedName, expectedVersion)
        )
          return true;
        throw error;
      }
    } finally {
      removePathSafelyWithin(
        cacheRoot,
        stagingDir,
        "plugin snapshot staging directory",
      );
    }
  }
  // UTF-16 379421..380144
  function clearCurrentSnapshotOrphanMarker(
    cacheRoot: any,
    snapshotRoot: any,
    expectedName: any,
    expectedVersion: any,
  ): any {
    if (
      !isRealPathStrictlyInside(cacheRoot, snapshotRoot) ||
      !isValidPluginSnapshot(snapshotRoot, expectedName, expectedVersion)
    )
      return false;
    const markerPath: any = node_path.join(snapshotRoot, ".orphaned_at");
    assertRealParentAtOrInside(
      cacheRoot,
      markerPath,
      "plugin orphan marker parent",
    );
    const marker: any = lstatIfExists(markerPath);
    if (!marker) return false;
    if (!marker.isSymbolicLink()) {
      assertRealPathStrictlyInside(
        cacheRoot,
        markerPath,
        "plugin orphan marker",
      );
      if (!marker.isFile())
        throw new Error(
          `Refusing non-file plugin orphan marker: ${markerPath}`,
        );
    }
    node_fs.unlinkSync(markerPath);
    return true;
  }
  // UTF-16 380145..380298
  function lstatIfExists(target: any): any {
    try {
      return node_fs.lstatSync(target);
    } catch (error: any) {
      if (error.code === "ENOENT") return;
      throw error;
    }
  }
  // UTF-16 380299..380670
  function prepareReplaceablePath(
    trustedRoot: any,
    target: any,
    label: any,
  ): any {
    ensurePathInside(trustedRoot, target, label);
    assertRealParentAtOrInside(trustedRoot, target, `${label} parent`);
    const entry: any = lstatIfExists(target);
    if (!entry) return;
    if (entry.isSymbolicLink()) {
      node_fs.unlinkSync(target);
      return;
    }
    assertRealPathStrictlyInside(trustedRoot, target, label);
  }
  // UTF-16 380671..381278
  function removePathSafelyWithin(
    trustedRoot: any,
    target: any,
    label: any,
  ): any {
    ensurePathInside(trustedRoot, target, label);
    assertRealParentAtOrInside(trustedRoot, target, `${label} parent`);
    const entry: any = lstatIfExists(target);
    if (!entry) return;
    if (entry.isSymbolicLink()) {
      node_fs.unlinkSync(target);
      return;
    }
    assertRealPathStrictlyInside(trustedRoot, target, label);
    if (entry.isDirectory()) {
      for (const child of node_fs.readdirSync(target))
        removePathSafelyWithin(
          trustedRoot,
          node_path.join(target, child),
          `${label} child`,
        );
      node_fs.rmdirSync(target);
      return;
    }
    node_fs.unlinkSync(target);
  }
  // UTF-16 381279..381464
  function isRealPathStrictlyInside(root: any, target: any): any {
    try {
      return isResolvedPathStrictlyInside(
        node_fs.realpathSync(root),
        node_fs.realpathSync(target),
      );
    } catch {
      return false;
    }
  }
  // UTF-16 381465..381694
  function isResolvedPathStrictlyInside(root: any, target: any): any {
    const relative: any = node_path.relative(root, target);
    return (
      !!relative &&
      relative !== ".." &&
      !relative.startsWith(`..${node_path.sep}`) &&
      !node_path.isAbsolute(relative)
    );
  }
  // UTF-16 381695..382264
  function isValidPluginSnapshot(
    pluginRoot: any,
    expectedName: any,
    expectedVersion: any,
  ): any {
    for (const rel of MARKETPLACE_MANIFEST_CANDIDATES) {
      const manifestPath: any = node_path.join(
        pluginRoot,
        rel.replace("marketplace.json", "plugin.json"),
      );
      if (!node_fs.existsSync(manifestPath)) continue;
      try {
        if (!isRealPathStrictlyInside(pluginRoot, manifestPath)) continue;
        const manifest: any = JSON.parse(
          node_fs.readFileSync(manifestPath, "utf-8"),
        );
        return (
          manifest.name === expectedName && manifest.version === expectedVersion
        );
      } catch {
        return false;
      }
    }
    return false;
  }
  // UTF-16 382265..382565
  function getPluginCacheVersion(plugin: any): any {
    if (typeof plugin.version === "string" && plugin.version.trim().length > 0)
      return sanitizePathSegment(plugin.version.trim());
    return sanitizePathSegment(
      `${require_runtime_context.getWorkbuddyRuntimeAppVersion().trim() || "dev"}+${BUILD_COMMIT.trim()}`,
    );
  }
  // UTF-16 382566..382716
  function getMarketplaceSeedRevision(): any {
    return `${require_runtime_context.getWorkbuddyRuntimeAppVersion().trim() || "dev"}+${BUILD_COMMIT.trim()}`;
  }
  // UTF-16 382717..384242
  function copyDirectoryIfMissing(
    sourceDir: any,
    targetDir: any,
    trustedRoot: any,
    expectedName: any,
    expectedVersion: any,
  ): any {
    prepareReplaceablePath(trustedRoot, targetDir, "legacy plugin snapshot");
    if (lstatIfExists(targetDir)) {
      if (
        expectedName !== void 0 &&
        expectedVersion !== void 0 &&
        isValidPluginSnapshot(targetDir, expectedName, expectedVersion)
      )
        return false;
      removePathSafelyWithin(
        trustedRoot,
        targetDir,
        "stale legacy plugin snapshot",
      );
    }
    const tmpDir: any = `${targetDir}.tmp.${process.pid}.${Date.now()}`;
    removePathSafelyWithin(
      trustedRoot,
      tmpDir,
      "legacy snapshot staging directory",
    );
    assertRealParentAtOrInside(
      trustedRoot,
      tmpDir,
      "legacy snapshot staging parent",
    );
    const copyLegacy: any = safeCopyDirRecursive$1(
      sourceDir,
      tmpDir,
      (msg: any) => {
        console.warn("[builtin-plugin-marketplace] " + msg);
      },
    );
    if (copyLegacy.errors.length > 0) {
      console.warn(
        `[builtin-plugin-marketplace] legacy snapshot staging failed: ${copyLegacy.copied} copied, ${copyLegacy.skipped} skipped, ${copyLegacy.errors.length} error(s) — discarding staging`,
      );
      removePathSafelyWithin(
        trustedRoot,
        tmpDir,
        "legacy snapshot staging directory",
      );
      return false;
    }
    assertRealPathStrictlyInside(
      trustedRoot,
      tmpDir,
      "legacy snapshot staging directory",
    );
    try {
      node_fs.renameSync(tmpDir, targetDir);
      return true;
    } catch (error: any) {
      removePathSafelyWithin(
        trustedRoot,
        tmpDir,
        "legacy snapshot staging directory",
      );
      if (
        isConcurrentDirectoryInstallRace(error) &&
        isRealPathStrictlyInside(trustedRoot, targetDir)
      )
        return false;
      throw error;
    }
  }
  // UTF-16 384243..384414
  function isConcurrentDirectoryInstallRace(error: any): any {
    const code: any = error?.code;
    return (
      code === "EEXIST" ||
      code === "ENOTEMPTY" ||
      code === "EPERM" ||
      code === "EACCES"
    );
  }
  // UTF-16 384415..384768
  function ensurePathInside(root: any, target: any, label: any): any {
    const resolvedRoot: any = node_path.resolve(root);
    const resolvedTarget: any = node_path.resolve(target);
    const relative: any = node_path.relative(resolvedRoot, resolvedTarget);
    if (
      !relative ||
      relative.startsWith("..") ||
      node_path.isAbsolute(relative)
    )
      throw new Error(`Path escapes ${label} root: ${target}`);
  }
  // UTF-16 384769..384857
  function sanitizePathSegment(value: any): any {
    return value.replace(/[^a-zA-Z0-9._+-]/g, "_");
  }
  // UTF-16 384858..384959
  function isRecord$1(value: any): any {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
  // UTF-16 384960..385384
  function isPluginMaterialized(pluginRootDir: any, plugin: any): any {
    const source: any = plugin.source;
    if (typeof source !== "string" || !source.trim()) return false;
    const pluginDir: any = node_path.resolve(pluginRootDir, source);
    if (!isRealPathStrictlyInside(pluginRootDir, pluginDir)) return false;
    const pluginManifestPath: any = node_path.join(
      pluginDir,
      ".codebuddy-plugin",
      "plugin.json",
    );
    return node_fs.existsSync(pluginManifestPath);
  }
  // UTF-16 385385..385873
  function writeJsonAtomic(filePath: any, data: any): any {
    node_fs.mkdirSync(node_path.dirname(filePath), { recursive: true });
    const tmpPath: any = `${filePath}.tmp.${process.pid}`;
    const tmpEntry: any = lstatIfExists(tmpPath);
    if (tmpEntry?.isDirectory() && !tmpEntry.isSymbolicLink())
      throw new Error(`Refusing JSON staging directory: ${tmpPath}`);
    if (tmpEntry) node_fs.unlinkSync(tmpPath);
    node_fs.writeFileSync(tmpPath, JSON.stringify(data, null, 4), "utf-8");
    node_fs.renameSync(tmpPath, filePath);
  }
  // UTF-16 386813..387036
  function isPluginSupportedOnPlatform(
    plugin: any,
    platform: any = process.platform,
  ): any {
    const platforms: any = plugin.platforms;
    if (!Array.isArray(platforms) || platforms.length === 0) return true;
    return platforms.includes(platform);
  }
  // UTF-16 387323..389775
  function seedBuiltinPluginsMarketplace(productFeatures: any): any {
    const seedAllEnabled: any = isBuiltinPluginSeedAllEnabled(productFeatures);
    const tag: any = "[seed-builtin-plugins]";
    const configDir: any =
      require_runtime_context.getWorkbuddyRuntimeConfigDir();
    const selectedCandidates: any = resolveMarketplaceCandidates();
    if (selectedCandidates.length === 0) {
      console.info(
        `${tag} skipped: no usable builtin marketplace directory found`,
      );
      return { ...EMPTY_SEED_RESULT };
    }
    const supportedPlugins: any = selectedCandidates.flatMap(
      (candidate: any) => candidate.supportedPlugins,
    );
    if (supportedPlugins.length === 0) {
      const skipped: any =
        selectedCandidates
          .flatMap((candidate: any) => candidate.allPlugins)
          .map((p: any) => p.name)
          .join(", ") || "<empty>";
      console.info(
        `${tag} skipped on ${process.platform}: no supported plugins (all=[${skipped}])`,
      );
      return { ...EMPTY_SEED_RESULT };
    }
    try {
      const seeded: any = seedBuiltinMarketplace(configDir, selectedCandidates);
      let mode: any = "none";
      let defaultEnabledNames: any = /* @__PURE__ */ new Set();
      if (seedAllEnabled) {
        mode = "all";
        defaultEnabledNames = null;
      } else if (isBuiltinPluginDefaultSeedEnabled(productFeatures)) {
        mode = "defaults";
        defaultEnabledNames = resolveDefaultEnabledPluginNames(productFeatures);
      } else
        console.info(
          `${tag} skipped default plugin seed: TencentPptxBuiltinDefaultEnabled=false`,
        );
      const defaults: any = {};
      applyDefaultEnabledPlugins(
        seeded.manifest.plugins ?? [],
        defaults,
        process.platform,
        defaultEnabledNames,
        seeded.marketplaceRoot,
      );
      const metadataRequest: any = {
        available: true,
        mode,
        defaults,
      };
      const enabledStr: any = supportedPlugins
        .map((p: any) => p.name)
        .join(", ");
      const skippedNames: any = selectedCandidates
        .flatMap((candidate: any) => candidate.allPlugins)
        .filter((p: any) => !isPluginSupportedOnPlatform(p))
        .map((p: any) => p.name);
      const skippedStr: any =
        skippedNames.length > 0
          ? ` (skipped on ${process.platform}: [${skippedNames.join(", ")}])`
          : "";
      const seedMode: any = seedAllEnabled ? "seed-all" : "whitelist-only";
      console.info(
        `${tag} ok: registered ${BUILTIN_MARKETPLACE_NAME} source at ${seeded.marketplaceRoot} with installed snapshots at ${seeded.cacheRoot} (${seedMode}), available=[${enabledStr}]${skippedStr}`,
      );
      return {
        marketplaceChanged: seeded.changed,
        metadataRequest,
      };
    } catch (error: any) {
      const message: any =
        error instanceof Error ? error.message : String(error);
      console.error(`${tag} failed: ${message}`);
      return { ...EMPTY_SEED_RESULT };
    }
  }
  // UTF-16 389776..390315
  function resolveMarketplaceCandidates(): any {
    const resolved: any = [];
    for (const candidate of MARKETPLACE_ASSET_CANDIDATES) {
      const dir: any = require_workbuddy_product_config.resolveBundledAsset(
        ...candidate.segments,
      );
      if (!dir) continue;
      const manifest: any = readMarketplaceManifest(dir);
      if (!manifest) continue;
      const allPlugins: any = manifest.plugins ?? [];
      resolved.push({
        candidate,
        dir,
        manifest,
        allPlugins,
        supportedPlugins: allPlugins.filter((plugin: any) =>
          isPluginSupportedOnPlatform(plugin),
        ),
      });
    }
    return resolved;
  }
  // UTF-16 390316..390932
  function readMarketplaceManifest(builtinPluginsDir: any): any {
    for (const rel of MARKETPLACE_MANIFEST_CANDIDATES) {
      const manifestPath: any = node_path.join(builtinPluginsDir, rel);
      if (!node_fs.existsSync(manifestPath)) continue;
      try {
        const raw: any = node_fs.readFileSync(manifestPath, "utf-8");
        const manifest: any = JSON.parse(raw);
        if (!isValidMarketplaceManifest(manifest, manifestPath)) return;
        return manifest;
      } catch (error: any) {
        const message: any =
          error instanceof Error ? error.message : String(error);
        console.warn(
          `[seed-builtin-plugins] failed to parse ${manifestPath}: ${message}`,
        );
        return;
      }
    }
  }
  // UTF-16 390933..392094
  function isValidMarketplaceManifest(manifest: any, manifestPath: any): any {
    if (manifest.name && manifest.name !== "workbuddy-builtin") {
      console.warn(
        `[seed-builtin-plugins] ignored ${manifestPath}: expected marketplace name ${BUILTIN_MARKETPLACE_NAME}, got ${manifest.name}`,
      );
      return false;
    }
    if (!Array.isArray(manifest.plugins)) {
      console.warn(
        `[seed-builtin-plugins] ignored ${manifestPath}: plugins must be an array`,
      );
      return false;
    }
    for (const [index, plugin] of manifest.plugins.entries()) {
      if (
        !plugin ||
        typeof plugin.name !== "string" ||
        plugin.name.length === 0
      ) {
        console.warn(
          `[seed-builtin-plugins] ignored ${manifestPath}: plugins[${index}].name is required`,
        );
        return false;
      }
      if (typeof plugin.source !== "string" || plugin.source.length === 0) {
        console.warn(
          `[seed-builtin-plugins] ignored ${manifestPath}: plugins[${index}].source is required`,
        );
        return false;
      }
      if (
        node_path.isAbsolute(plugin.source) ||
        plugin.source.split(/[\\/]+/).includes("..")
      ) {
        console.warn(
          `[seed-builtin-plugins] ignored ${manifestPath}: plugins[${index}].source must stay inside the marketplace`,
        );
        return false;
      }
    }
    return true;
  }
  // UTF-16 392562..392796
  function resolveDefaultEnabledPluginNames(productFeatures: any): any {
    if (
      productFeatures?.[
        require_common$1.ProductFeature.TencentPptxBuiltinDefaultEnabled
      ] === false
    )
      return /* @__PURE__ */ new Set();
    return DEFAULT_ENABLED_PLUGIN_NAMES;
  }
  // UTF-16 392920..393064
  function isBuiltinPluginSeedAllEnabled(productFeatures: any): any {
    return (
      productFeatures?.[require_common$1.ProductFeature.IntentRecommend] !==
      true
    );
  }
  // UTF-16 393065..393196
  function isBuiltinPluginDefaultSeedEnabled(productFeatures: any): any {
    return resolveDefaultEnabledPluginNames(productFeatures).size > 0;
  }
  // UTF-16 393197..393302
  function isDefaultSeedCandidate(plugin: any): any {
    return plugin.category === DEFAULT_SEEDABLE_PLUGIN_CATEGORY;
  }
  // UTF-16 393781..394463
  function applyDefaultEnabledPlugins(
    plugins: any,
    enabledPlugins: any,
    platform: any = process.platform,
    defaultEnabledNames: any = DEFAULT_ENABLED_PLUGIN_NAMES,
    pluginRootDir: any,
  ): any {
    let changed: any = false;
    for (const plugin of plugins) {
      if (
        !plugin.name ||
        !isDefaultSeedCandidate(plugin) ||
        !isPluginSupportedOnPlatform(plugin, platform)
      )
        continue;
      if (defaultEnabledNames !== null && !defaultEnabledNames.has(plugin.name))
        continue;
      const pluginId: any = `${plugin.name}@${BUILTIN_MARKETPLACE_NAME}`;
      if (pluginRootDir && !isPluginMaterialized(pluginRootDir, plugin))
        continue;
      if (pluginId in enabledPlugins) continue;
      enabledPlugins[pluginId] = true;
      changed = true;
    }
    return { changed };
  }
  return {
    safeCopyDirRecursive$1,
    createMarketplaceSeedPlan,
    seedBuiltinMarketplace,
    prepareSafePluginCacheRoot,
    prepareSafeMarketplaceRoot,
    prepareContainedDirectory,
    prepareDirectoryChain,
    assertRealPathStrictlyInside,
    assertRealPathMatchesLexicalRelative,
    assertRealParentAtOrInside,
    recoverLegacyPluginSnapshots,
    hasPluginManifest,
    seedMarketplaceSource,
    isMarketplaceSourceCurrent,
    swapDirectoryFromStaging,
    seedPluginSnapshots,
    copyPluginSnapshotAtomically,
    clearCurrentSnapshotOrphanMarker,
    lstatIfExists,
    prepareReplaceablePath,
    removePathSafelyWithin,
    isRealPathStrictlyInside,
    isResolvedPathStrictlyInside,
    isValidPluginSnapshot,
    getPluginCacheVersion,
    getMarketplaceSeedRevision,
    copyDirectoryIfMissing,
    isConcurrentDirectoryInstallRace,
    ensurePathInside,
    sanitizePathSegment,
    isRecord$1,
    isPluginMaterialized,
    writeJsonAtomic,
    isPluginSupportedOnPlatform,
    seedBuiltinPluginsMarketplace,
    resolveMarketplaceCandidates,
    readMarketplaceManifest,
    isValidMarketplaceManifest,
    resolveDefaultEnabledPluginNames,
    isBuiltinPluginSeedAllEnabled,
    isBuiltinPluginDefaultSeedEnabled,
    isDefaultSeedCandidate,
    applyDefaultEnabledPlugins,
    constants: {
      BUILTIN_MARKETPLACE_NAME,
      MARKETPLACE_MANIFEST_CANDIDATES,
      BUILD_COMMIT,
      MARKETPLACE_METADATA_DIR,
      EMPTY_SEED_RESULT,
      MARKETPLACE_ASSET_CANDIDATES,
      DEFAULT_ENABLED_PLUGIN_NAMES,
      DEFAULT_SEEDABLE_PLUGIN_CATEGORY,
      noopLogger$1,
    },
  };
}
