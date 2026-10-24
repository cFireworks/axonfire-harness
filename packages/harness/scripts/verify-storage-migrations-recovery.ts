import { loadCapturedStorageMigrations } from "./helpers/captured-storage-migrations.js";
import { storageMigrationsScenarios } from "./helpers/storage-migrations-scenarios.js";
import { createNativeStorageOrm } from "../src/vendor/captured-storage-orm.js";
import { createNativeStorageMigrations } from "../src/storage/native-storage-migrations.js";
const captured = loadCapturedStorageMigrations();
for (const [, run] of storageMigrationsScenarios) {
  run(captured.factory);
  run(() => {
    const orm = createNativeStorageOrm(undefined);
    return { orm, migrations: createNativeStorageMigrations(orm) };
  });
}
console.log(
  JSON.stringify({
    migrationStatements: captured.statements,
    ormAndRepositoryStatements: captured.ormAndRepositoryStatements,
    pairedScenarios: storageMigrationsScenarios.length,
  }),
);
