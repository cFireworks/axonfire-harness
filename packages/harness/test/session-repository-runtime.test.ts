import { test } from "node:test";
import { createNativeStorageOrm } from "../src/vendor/captured-storage-orm.js";
import { createNativeSessionRepository } from "../src/sessions/native-session-repository.js";
import { sessionRepositoryScenarios } from "../scripts/helpers/session-repository-scenarios.js";
for (const [name, run] of sessionRepositoryScenarios)
  test("native repository: " + name, () =>
    run(() => {
      const orm = createNativeStorageOrm(undefined);
      return { orm, ...createNativeSessionRepository(orm) };
    }),
  );
