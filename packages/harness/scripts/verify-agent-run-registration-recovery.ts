import assert from "node:assert/strict";
import { createNativeWorktreeContext } from "../src/agents/native-worktree-context.js";
import { worktreeContextScenarios } from "./helpers/worktree-context-scenarios.js";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { verifyCapturedAgentRunRegistration } from "./helpers/captured-agent-run-registration.js";
const { worktreeFactory, ...proof } = verifyCapturedAgentRunRegistration(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
const comparisons = await worktreeContextScenarios(createNativeWorktreeContext);
assert.deepEqual(comparisons, await worktreeContextScenarios(worktreeFactory));
console.log(
  JSON.stringify({
    ...proof,
    comparisons: comparisons.length,
    worktreeDeclarationAst: true,
    bootstrapExecuted: false,
    ok: true,
  }),
);
