import test from "node:test";
import assert from "node:assert/strict";
import { AskService, AnswerDeferred } from "../src/interaction/ask-service.js";
import { INTERACTION_SERVICE_CASES } from "../scripts/helpers/interaction-services-scenarios.js";
for (const scenario of INTERACTION_SERVICE_CASES)
  test(scenario.name, async () => {
    await scenario.run();
  });
test("public AskService inherits all native members and preserves Deferred constructor identity", async () => {
  const ask = new AskService();
  assert.equal(
    Object.getOwnPropertyNames(Object.getPrototypeOf(AskService.prototype))
      .length,
    14,
  );
  ask.setAsk({
    rawItem: { type: "function_call", id: "owned", callId: "owned" },
  });
  const d = ask.getCurrentDeferred()!;
  assert.ok(d instanceof AnswerDeferred);
  ask.doneAsk({ Q: "owned" }, "owned");
  assert.deepEqual(await d.promise, { Q: "owned" });
  assert.deepEqual(await ask.acquireAnswers("owned", undefined, 0), {
    Q: "owned",
  });
  ask.cleanup();
  ask.currentItem$.complete();
});
