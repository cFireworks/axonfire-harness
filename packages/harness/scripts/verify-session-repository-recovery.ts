import { loadCapturedSessionRepository } from "./helpers/captured-session-repository.js";
import { sessionRepositoryScenarios } from "./helpers/session-repository-scenarios.js";
import { createNativeStorageOrm } from "../src/vendor/captured-storage-orm.js";
import { createNativeSessionRepository } from "../src/sessions/native-session-repository.js";
const captured = loadCapturedSessionRepository();
for (const [, run] of sessionRepositoryScenarios) {
  await run(captured.factory);
  await run(() => {
    const orm = createNativeStorageOrm(undefined);
    return { orm, ...createNativeSessionRepository(orm) };
  });
}
console.log(
  JSON.stringify({
    sourceStatements: captured.statements,
    ormRegions: 53,
    repositoryDeclarations: 7,
    pairedSQLiteScenarios: sessionRepositoryScenarios.length,
  }),
);
