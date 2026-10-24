import { test } from "node:test";
import { createNativeDatabaseService } from "../src/storage/native-database-service.js";
import { databaseServiceScenarios } from "../scripts/helpers/database-service-scenarios.js";
for (const [name, run] of databaseServiceScenarios)
  test("native database: " + name, () => run(createNativeDatabaseService));
