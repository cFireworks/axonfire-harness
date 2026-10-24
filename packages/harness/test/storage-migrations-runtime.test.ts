import { test } from "node:test";
import { createNativeStorageOrm } from "../src/vendor/captured-storage-orm.js";
import { createNativeStorageMigrations } from "../src/storage/native-storage-migrations.js";
import { storageMigrationsScenarios } from "../scripts/helpers/storage-migrations-scenarios.js";
for (const [name, run] of storageMigrationsScenarios)
  test("native migrations: " + name, () =>
    run(() => {
      const orm = createNativeStorageOrm(undefined);
      return { orm, migrations: createNativeStorageMigrations(orm) };
    }),
  );
