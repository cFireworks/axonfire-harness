import { test } from "node:test";
import { recoveredPrewarmLifecycle } from "../scripts/helpers/captured-prewarm-lifecycle.js";
import { prewarmLifecycleScenarios } from "../scripts/helpers/prewarm-lifecycle-scenarios.js";
for (const [name, run] of prewarmLifecycleScenarios)
  test("native prewarm/lifecycle: " + name, () =>
    run(recoveredPrewarmLifecycle),
  );
