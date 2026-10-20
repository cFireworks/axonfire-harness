import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { interruptionResultFixture } from "../scripts/helpers/interruption-result-fixtures.js";

test("native result dispatcher runs completed Stop before result event and final agent_end", async () => {
  const fixture = interruptionResultFixture();
  const outcome = await fixture.execute();
  const types = outcome.events.map((event) => event[0]);
  assert.ok(types.indexOf("stop") < types.indexOf("combine"));
  assert.ok(types.indexOf("combine") < types.indexOf("emit"));
  assert.deepEqual(outcome.events.find((event) => event[0] === "stop")[1], {
    stopHookActive: false,
    stopReason: "completed",
  });
  assert.equal(outcome.resultSignalReleased, true);
  assert.equal(
    outcome.events.filter((event) => event[0] === "headless").length,
    2,
  );
});
test("native default-agent Stop schedules continuation and consumes one-shot active flag", async () => {
  const fixture = interruptionResultFixture({
    continuation: true,
    stopActive: true,
  });
  const outcome = await fixture.execute();
  assert.deepEqual(outcome.events.find((event) => event[0] === "stop")[1], {
    stopHookActive: true,
    stopReason: "completed",
  });
  assert.equal(outcome.hooks?.continueRequest, undefined);
  assert.equal(outcome.hooks?.stopHookActive, true);
  assert.equal(
    outcome.events.filter((event) => event[0] === "runDefault").length,
    1,
  );
});
test("native non-default Stop has no options, discards continuation and resolves headless", async () => {
  const outcome = await interruptionResultFixture({
    agent: "other",
    continuation: true,
  }).execute();
  assert.equal(
    outcome.events.find((event) => event[0] === "stop")[1],
    undefined,
  );
  assert.equal(outcome.hooks?.continueRequest, undefined);
  assert.equal(
    outcome.events.some((event) => event[0] === "runDefault"),
    false,
  );
});
test("native child result skips root Stop; interrupted result preserves interruption stamp", async () => {
  for (const spec of [{ child: true }, { interruptions: true }]) {
    const outcome = await interruptionResultFixture(spec).execute();
    assert.equal(
      outcome.events.some((event) => event[0] === "stop"),
      false,
    );
    assert.equal(outcome.stamped, spec.interruptions === true);
  }
});
test("native completion errors run failed/cancelled Stop only when not retried", async () => {
  for (const aborted of [false, true]) {
    const outcome = await interruptionResultFixture({
      error: new Error("owned failure"),
      aborted,
      continuation: true,
    }).execute();
    assert.deepEqual(outcome.events.find((event) => event[0] === "stop")[1], {
      stopReason: aborted ? "cancelled" : "failed",
    });
    assert.equal(outcome.hooks?.continueRequest, undefined);
  }
  const retried = await interruptionResultFixture({
    error: Object.assign(new Error("reset"), { code: "ECONNRESET" }),
  }).execute();
  assert.equal(
    retried.events.some((event) => event[0] === "stop"),
    false,
  );
  assert.ok(retried.events.some((event) => event[0] === "run"));
});
test("native silent abort marks unfinished calls and omits failed Stop", async () => {
  const fixture = interruptionResultFixture({
    error: new Error("owned failure"),
    silent: true,
    pending: true,
  });
  const outcome = await fixture.execute();
  assert.equal(fixture.result.newItems[0].rawItem.status, "incomplete");
  assert.equal(outcome.silent, false);
  assert.equal(
    outcome.events.some((event) => event[0] === "stop"),
    false,
  );
});
test("native continuation waits for idle and retains original five-second timer semantics", async () => {
  const f = interruptionResultFixture({ status: "tool_executing" });
  const task = f.owner.continueAgentWithMessage(f.session, {
    role: "user",
    content: "continue",
  });
  assert.equal(
    f.events.some((event) => event[0] === "runDefault"),
    false,
  );
  assert.equal(f.timers.size, 1);
  f.machine.forceIdle(f.session, "owned test");
  await task;
  assert.equal(f.events.filter((event) => event[0] === "runDefault").length, 1);
  assert.equal(
    f.timers.size,
    1,
    "source only clears timer in its immediate-idle check, not the change callback",
  );
});
test("native continuation timeout or abort after idle does not start a new turn", async () => {
  const timed = interruptionResultFixture({ status: "tool_executing" });
  const waiting = timed.owner.continueAgentWithMessage(timed.session, "owned");
  for (const callback of timed.timers.values()) callback();
  await waiting;
  assert.equal(
    timed.events.some((event) => event[0] === "runDefault"),
    false,
  );
  const aborted = interruptionResultFixture({ status: "tool_executing" });
  const task = aborted.owner.continueAgentWithMessage(aborted.session, "owned");
  aborted.session.abortController.abort();
  aborted.machine.forceIdle(aborted.session);
  await task;
  assert.equal(
    aborted.events.some((event) => event[0] === "runDefault"),
    false,
  );
});

setTraceProcessors([]);
const answer = (text: string): any[] => [
  {
    type: "message",
    role: "assistant",
    id: "dispatch-answer",
    status: "completed",
    content: [{ type: "output_text", text }],
  },
];
function modelFixture(output: (count: number) => any[]): Model {
  let count = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse() {
      const items = output(++count);
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: `dispatch-${count}`,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: items,
        },
      } as any;
    },
  };
}
async function ownedRuntime(t: any, model: Model) {
  const root = await mkdtemp(join(tmpdir(), "harness-native-result-"));
  const h = await createHarness({
    workDir: root,
    recordReplayEnv: {},
    modelProvider: { getModel: () => model },
    autoMemory: { gitUserName: () => "owned" },
  });
  t.after(async () => {
    await h.close();
    await rm(root, { recursive: true, force: true });
  });
  const stops: any[] = [],
    original = h.hooks!.sessionManager.executeStopHooks.bind(
      h.hooks!.sessionManager,
    );
  h.hooks!.sessionManager.executeStopHooks = async (...args: any[]) => {
    stops.push(args[2]);
    return (original as any)(...args);
  };
  assert.ok(h.interruptions.nativeResultDispatcher);
  return { h, stops, session: await h.openSession() };
}
test("real SDK terminal failure reaches native failed Stop exactly once, not root backfill", async (t) => {
  const { h, session, stops } = await ownedRuntime(
    t,
    modelFixture(() => {
      throw new Error("owned terminal");
    }),
  );
  await assert.rejects(h.prompt(session, "owned failure"), /owned terminal/);
  assert.deepEqual(stops, [{ stopReason: "failed" }]);
});
test("real SDK network retry skips failed Stop and emits one native completion Stop", async (t) => {
  let requests = 0;
  const { h, session, stops } = await ownedRuntime(
    t,
    modelFixture((count) => {
      requests++;
      if (count === 1)
        throw Object.assign(new Error("owned reset"), { code: "ECONNRESET" });
      return answer("owned recovered");
    }),
  );
  assert.equal(await h.prompt(session, "owned retry"), "owned recovered");
  assert.equal(requests, 2);
  assert.deepEqual(stops, [{ stopHookActive: false, stopReason: "completed" }]);
});
test("direct non-default SDK run receives native Stop and headless completion without root prompt", async (t) => {
  const { h, session, stops } = await ownedRuntime(
    t,
    modelFixture(() => answer("owned auxiliary")),
  );
  const other = await h.agents.get("Explore");
  assert.ok(other);
  let resolved = 0;
  session.headlessCompletionDeferred = {
    resolve() {
      resolved++;
    },
  };
  await h.service.run(other, "owned auxiliary input", { context: session });
  const result = session.resultSubject.value as any;
  await result.completed;
  await h.sessions.waitForResultHandled(result);
  await h.interruptions.waitForResultHandled(result);
  assert.deepEqual(stops, [undefined]);
  assert.ok(resolved >= 1);
});
test("real SDK cancellation reaches native cancelled Stop exactly once", async (t) => {
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      yield { type: "response_started" };
      started();
      await new Promise<void>((_resolve, reject) => {
        if (request.signal?.aborted) reject(request.signal.reason);
        else
          request.signal?.addEventListener(
            "abort",
            () => reject(request.signal!.reason),
            { once: true },
          );
      });
    },
  };
  const { h, session, stops } = await ownedRuntime(t, model),
    controller = new AbortController();
  const running = h.prompt(session, "owned cancellation", {
    signal: controller.signal,
  });
  void running.catch(() => {});
  await ready;
  controller.abort();
  await assert.rejects(running);
  assert.deepEqual(stops, [{ stopReason: "cancelled" }]);
});
