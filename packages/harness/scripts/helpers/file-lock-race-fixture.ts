import { join } from "node:path";
import { createNativeFileLock } from "../../src/tasks/native-file-lock.js";
import { createOwnedPluginFilesystem } from "../../src/plugins/owned-plugin-filesystem.js";
/** Deterministically characterize the original mkdir-before-lock.json publication window. */
export async function characterizeFileLockPublicationRace(
  root: string,
  factory = createNativeFileLock,
) {
  const fsExtra = createOwnedPluginFilesystem(root),
    lockRoot = join(root, "locks");
  await fsExtra.ensureDir(lockRoot);
  let created!: () => void, publish!: () => void;
  const directoryCreated = new Promise<void>((r) => {
      created = r;
    }),
    publication = new Promise<void>((r) => {
      publish = r;
    });
  const first = new (factory({
    tmpdir: () => lockRoot,
    fs: {
      ...fsExtra,
      writeFile: async (...args: any[]) => {
        created();
        await publication;
        return (fsExtra.writeFile as any)(...args);
      },
    },
  }).FileLockServiceImpl)();
  const second = new (factory({
    tmpdir: () => lockRoot,
    fs: fsExtra,
  }).FileLockServiceImpl)();
  const firstPending = first.acquireFileLock("publication-window", {
    maxRetries: 1,
  });
  await directoryCreated;
  const releaseSecond = await second.acquireFileLock("publication-window", {
    maxRetries: 1,
  });
  publish();
  const releaseFirst = await firstPending;
  const result = {
    secondAcquiredBeforeFirstPublished: true,
    firstAlsoAcquired: true,
    recordExists: await fsExtra.pathExists(
      join(lockRoot, "publication-window.lock", "lock.json"),
    ),
  };
  await releaseFirst();
  await releaseSecond();
  return result;
}
