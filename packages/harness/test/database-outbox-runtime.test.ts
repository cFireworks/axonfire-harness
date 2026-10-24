import { test } from "node:test";
import { createNativeDatabaseService } from "../src/storage/native-database-service.js";
import { databaseOutboxScenarios } from "../scripts/helpers/database-outbox-scenarios.js";
for (const [name, run] of databaseOutboxScenarios)
  test("native database outbox: " + name, () =>
    run(createNativeDatabaseService),
  );
