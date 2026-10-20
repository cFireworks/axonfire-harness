import { marketplaceFixture } from "../../scripts/helpers/marketplace-fixtures.js";
const [root, operation, name] = process.argv.slice(2);
if (!root || !name) throw Error("owned root and name required");
const f = marketplaceFixture(root);
if (operation === "hold") {
  const release = await f.fileLockService.acquireFileLock(name, {
    maxRetries: 50,
    retryDelay: 10,
  });
  process.send?.("locked");
  await new Promise<void>((resolve) =>
    process.once("message", () => resolve()),
  );
  await release();
} else if (operation === "save" || operation === "save-held") {
  if (operation === "save-held") {
    const native = f.storage.rawRename.bind(f.storage);
    let first = true;
    f.storage.rawRename = async (from: string, to: string) => {
      if (first) {
        first = false;
        process.send?.("write-locked");
        await new Promise<void>((resolve) =>
          process.once("message", () => resolve()),
        );
      }
      return native(from, to);
    };
  } else {
    const native = f.nativeLock.isLockStale.bind(f.nativeLock);
    let first = true;
    f.nativeLock.isLockStale = async (file: string, timeout: number) => {
      const stale = await native(file, timeout);
      if (!stale && first) {
        first = false;
        process.send?.("contended");
        await new Promise<void>((resolve) =>
          process.once("message", () => resolve()),
        );
      }
      return stale;
    };
  }
  for (let i = 0; i < 3; i++)
    await f.storage.saveMarketplace({
      name: name + i,
      source: { source: "directory", path: root },
    });
} else throw Error("unknown operation");
process.disconnect?.();
