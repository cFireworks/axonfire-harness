import test from "node:test";
import { createNativeSessionRecords } from "../src/sessions/native-session-records.js";
import { sessionRecordsScenarios } from "../scripts/helpers/session-records-scenarios.js";
for (const [name, run] of sessionRecordsScenarios)
  test("native records: " + name, () => run(createNativeSessionRecords));
