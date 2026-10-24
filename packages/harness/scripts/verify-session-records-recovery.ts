import { loadCapturedSessionRecords } from "./helpers/captured-session-records.js";
import { sessionRecordsScenarios } from "./helpers/session-records-scenarios.js";
import { createNativeSessionRecords } from "../src/sessions/native-session-records.js";
const captured = loadCapturedSessionRecords();
for (const [, run] of sessionRecordsScenarios) {
  await run(captured);
  await run(createNativeSessionRecords);
}
console.log(
  JSON.stringify({
    sourceComparisons: 33,
    pairedScenarios: sessionRecordsScenarios.length,
  }),
);
