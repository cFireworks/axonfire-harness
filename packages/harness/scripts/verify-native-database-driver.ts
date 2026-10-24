import { databaseOutboxScenarios } from "./helpers/database-outbox-scenarios.js";
import { nativeDatabaseWalScenarios } from "./helpers/native-database-wal-scenarios.js";
import { loadCapturedDatabaseDriver } from "./helpers/captured-database-driver.js";
import { loadCapturedDatabaseService } from "./helpers/captured-database-service.js";
import { loadCapturedStorageMigrations } from "./helpers/captured-storage-migrations.js";
import {
  databaseServiceScenarios,
  type DatabaseServiceFactory,
} from "./helpers/database-service-scenarios.js";
import { createNativeDatabaseService } from "../src/storage/native-database-service.js";
const outboxOnly = process.argv.includes("--outbox-only");
const walOnly = process.argv.includes("--wal-only");
process.argv = process.argv.filter(
  (value) => value !== "--wal-only" && value !== "--outbox-only",
);
const { Database, metadata } = loadCapturedDatabaseDriver();
const withDriver = (factory: DatabaseServiceFactory) =>
  Object.assign((deps: any) => factory(deps), { sqliteDriver: Database });
const captured = withDriver(loadCapturedDatabaseService()),
  recovered = withDriver(createNativeDatabaseService);
loadCapturedStorageMigrations();
const scenarios = outboxOnly
  ? databaseOutboxScenarios
  : walOnly
    ? nativeDatabaseWalScenarios
    : [
        ...databaseServiceScenarios,
        ...databaseOutboxScenarios,
        ...nativeDatabaseWalScenarios,
      ];
for (const [name, run] of scenarios) {
  await run(captured);
  await run(recovered);
  console.log("PASS native driver: " + name);
}
console.log(
  JSON.stringify({
    ...metadata,
    pairedScenarios: scenarios.length,
    sourceDeclarations: 18,
    dependencyStatements: 244,
  }),
);
