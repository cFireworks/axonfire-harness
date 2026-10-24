import { prepareNativeProductInput } from "../cli/native-product-input.mjs";
// Web startup boundary over original CLI configuration parsing and Desktop services.
import * as fs from "node:fs";
import { mkdir, copyFile, writeFile, symlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDesktopAccountProductHost } from "@axonfire/harness/auth/desktop-account-product-host.js";
import { createNativeProductRuntime } from "@axonfire/harness/config/native-product-runtime.js";

export async function startNativeWebAccountRuntime({
  env,
  cwd,
  configRoot,
  controlRoot,
  logger,
}) {
  // Keep immutable input separate from the coordinator's mutable output environment.
  const bootstrapEnv = { ...env };
  prepareNativeProductInput(bootstrapEnv);
  const assets = env.AXONFIRE_NATIVE_ASSETS
    ? resolve(env.AXONFIRE_NATIVE_ASSETS)
    : fileURLToPath(
        new URL("../../packages/harness/dist/native-product/", import.meta.url),
      );
  const resourcesRoot = join(controlRoot, "account-assets");
  const diagnostics = {
    ...logger,
    setContext() {},
    time() {},
    timeEnd() {},
  };
  const classes = createNativeProductRuntime({
    env: bootstrapEnv,
    getWorkDir: () => cwd,
    getHomeDir: () => configRoot,
    fs,
    dependencies: { logger: diagnostics },
  });
  const merger = Object.assign(new classes.DefaultProductMerger(), {
    productMergeStrategies: [
      new classes.OverrideProductMergeStrategy(),
      new classes.MergeProductMergeStrategy(),
      new classes.SmartMergeProductMergeStrategy(),
      new classes.DeepSmartMergeProductMergeStrategy(),
      new classes.CommandsSmartMergeProductMergeStrategy(),
    ],
  });
  const input = Object.assign(new classes.EnvProductProvider(), {
    fs,
    logger: diagnostics,
    productMerger: merger,
  });
  // The Desktop snapshot builder merges against its base file. Give it the
  // same effective bootstrap base as the CLI; otherwise named-array merging
  // resurrects agents/models explicitly replaced by the user's CLI input.
  const client = Object.assign(new classes.ClientProductProvider(), {
    fs,
    configBasePath: assets,
    logger: diagnostics,
  });
  const base = await client.provide();
  const effective = await merger.merge(
    base,
    await input.provide({ current: base }),
  );
  const stagedCli = join(resourcesRoot, "cli");
  await mkdir(stagedCli, { recursive: true });
  for (const name of fs.readdirSync(assets)) {
    if (/^product\.[a-z]+\.json$/i.test(name))
      await copyFile(join(assets, name), join(stagedCli, name));
  }
  await writeFile(join(stagedCli, "product.json"), JSON.stringify(effective));
  for (const entry of fs.readdirSync(assets, { withFileTypes: true })) {
    if (
      entry.name === "product.json" ||
      /^product\.[a-z]+\.json$/i.test(entry.name)
    )
      continue;
    await symlink(
      join(assets, entry.name),
      join(stagedCli, entry.name),
      entry.isDirectory()
        ? process.platform === "win32"
          ? "junction"
          : "dir"
        : "file",
    );
  }
  // Local Web has no Desktop telemetry/notification UI. These diagnostic sinks
  // are explicit host boundaries; account decisions remain original services.
  const span = () => ({
    startSpan: span,
    markAsFailed() {},
    markAsSuccessful() {},
  });
  const owner = createDesktopAccountProductHost({
    resourcesRoot,
    productDirectory: assets,
    configDirectory: configRoot,
    env: bootstrapEnv,
    dependencies: {
      logger: diagnostics,
      traceService: { startTrace: span },
      eventService: { report() {} },
      notifier: { info() {}, warn() {}, error() {} },
      filePathService: { setCurrentUserId() {} },
    },
    productProviders: () => [
      {
        priority: input.priority,
        provide: (context) => input.provide(context),
      },
    ],
  });
  try {
    await owner.start();
    return Object.assign(owner, { assetsDirectory: stagedCli });
  } catch (error) {
    await owner.close();
    throw error;
  }
}
