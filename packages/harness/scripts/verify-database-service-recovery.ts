import { databaseOutboxScenarios } from "./helpers/database-outbox-scenarios.js";
import { loadCapturedDatabaseService } from "./helpers/captured-database-service.js";
import { loadCapturedStorageMigrations } from "./helpers/captured-storage-migrations.js";
import { databaseServiceScenarios } from "./helpers/database-service-scenarios.js";
import {
  createNativeDatabaseService,
  DATABASE_SERVICE_DECLARATIONS,
} from "../src/storage/native-database-service.js";
const captured = loadCapturedDatabaseService();
const dependencies = loadCapturedStorageMigrations();
for (const [, run] of [
  ...databaseServiceScenarios,
  ...databaseOutboxScenarios,
]) {
  await run(captured);
  await run(createNativeDatabaseService);
}
console.log(
  JSON.stringify({
    completeDeclarations: DATABASE_SERVICE_DECLARATIONS.length,
    dependencyStatements:
      dependencies.statements + dependencies.ormAndRepositoryStatements,
    pairedScenarios:
      databaseServiceScenarios.length + databaseOutboxScenarios.length,
  }),
);
