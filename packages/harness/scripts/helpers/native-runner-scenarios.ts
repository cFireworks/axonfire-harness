import assert from "node:assert/strict";
import { createNativeRunner } from "../../src/runner/native-runner.js";
import { nativeRunnerFixture } from "./native-runner-fixture.js";
type Fixture = Awaited<ReturnType<typeof nativeRunnerFixture>>;
type Scenario = {
  name: string;
  run(factory?: typeof createNativeRunner): Promise<any>;
};
const scenario = (
  name: string,
  run: (f: Fixture) => Promise<any>,
  patch: any = {},
): Scenario => ({
  name,
  async run(factory) {
    const f = await nativeRunnerFixture(factory, patch);
    try {
      return f.normalize(await run(f));
    } finally {
      await f.close();
    }
  },
});
const user = (text = "owned", seed: any = {}) => ({
  type: "message",
  role: "user",
  content: [{ type: "input_text", text }],
  ...seed,
});
const call = (name = "Write", args: any = "", seed: any = {}) => ({
  type: "function_call",
  name,
  arguments: args,
  callId: "owned-call",
  ...seed,
});
const result = (type = "function_call_result", seed: any = {}) => ({
  type,
  callId: "owned-call",
  output: "owned result",
  ...seed,
});
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
export const NATIVE_RUNNER_CASES: Scenario[] = [
  scenario(
    "source RunnerFactory passes only modelProvider/filter and ignores create arguments",
    async (f) => {
      const r = await f.runnerFactory.create({
        tracingDisabled: true,
        model: "ignored",
      });
      assert.deepEqual(Object.keys(r.config).sort(), [
        "callModelInputFilter",
        "modelProvider",
      ]);
      assert.equal(r.config.modelProvider, f.runnerFactory.modelProvider);
      assert.equal(
        f.n.originalModules.factory.RunnerFactoryImpl,
        f.n.RunnerFactoryImpl,
      );
      return Object.keys(r.config);
    },
  ),
  scenario(
    "source RunnerProvider caches resolved runner but concurrent cold get duplicates creation",
    async (f) => {
      let creates = 0;
      const pending: Array<(value: any) => void> = [];
      f.provider.runnerFactory = {
        create: () => {
          creates++;
          return new Promise((resolve) => pending.push(resolve));
        },
      };
      const a = f.provider.get(),
        b = f.provider.get();
      assert.equal(creates, 2);
      pending[0]!({ id: "first" });
      assert.deepEqual(await a, { id: "first" });
      pending[1]!({ id: "second" });
      assert.deepEqual(await b, { id: "second" });
      assert.deepEqual(await f.provider.get(), { id: "second" });
      assert.equal(creates, 2);
      return creates;
    },
  ),
  scenario(
    "source RunnerProvider retries failed create instead of caching a rejected promise",
    async (f) => {
      let count = 0;
      f.provider.runnerFactory = {
        create: async () => {
          if (!count++) throw Error("owned create failure");
          return { id: "retry" };
        },
      };
      await assert.rejects(f.provider.get(), /owned create failure/);
      assert.equal(f.provider.runner, undefined);
      assert.deepEqual(await f.provider.get(), { id: "retry" });
      return count;
    },
  ),
  scenario(
    "source model input filter awaits compact, cleanup, send-now and state in original order",
    async (f) => {
      f.activate();
      const order: string[] = [],
        data = { input: [user()] };
      f.runnerFactory.toolCallLoopDetector = {
        check: () => {
          order.push("loop");
          return null;
        },
      };
      f.runnerFactory.checkAutoCompact = async () => {
        await tick();
        order.push("compact");
      };
      f.runnerFactory.filterTruncatedToolCalls = (value: any) => {
        assert.equal(value, data);
        order.push("cleanup");
        return { ...value, owned: true };
      };
      f.runnerFactory.injectSendNowItems = async () => {
        await tick();
        order.push("send-now");
      };
      f.runnerFactory.stateMachine = {
        transition: (_s: any, event: any) => {
          order.push(event.type);
        },
      };
      assert.equal((await f.inputFilter(data)).owned, true);
      assert.deepEqual(order, [
        "loop",
        "compact",
        "cleanup",
        "send-now",
        "MODEL_REQUEST_STARTED",
      ]);
      return order;
    },
  ),
  scenario(
    "source loop recovery refunds and short-circuits compaction, cleanup and transition",
    async (f) => {
      f.activate();
      const data = {
        input: Array.from({ length: 4 }, () => call("Read", "{}")),
      };
      const out = await f.inputFilter(data);
      assert.match(JSON.stringify(out.input.at(-1)), /LOOP_DETECTED/);
      assert.deepEqual(f.calls, [["refund", f.s.id, "loop_detected"]]);
      assert.equal(f.scheduled.length, 0);
      return out;
    },
  ),
  scenario(
    "source refund failure is logged and still returns loop recovery",
    async (f) => {
      f.activate();
      const out = await f.inputFilter({
        input: Array.from({ length: 4 }, () => call("Bash", "{}")),
      });
      assert.match(JSON.stringify(out), /LOOP_DETECTED/);
      assert.ok(
        f.logs.some((x) =>
          String(x).includes("Failed to report credit refund"),
        ),
      );
      return out;
    },
    {
      refund: async () => {
        throw Error("owned refund failure");
      },
    },
  ),
  scenario(
    "source primary state-transition failure logs without rejecting prepared input",
    async (f) => {
      f.activate();
      f.s.isCompressing = true;
      const out = await f.inputFilter({ input: [user()] });
      assert.equal(out.input.length, 1);
      assert.ok(
        f.logs.some((x) =>
          String(x).includes("Failed to emit MODEL_REQUEST_STARTED"),
        ),
      );
      return out;
    },
    {
      transition: () => {
        throw Error("owned state failure");
      },
    },
  ),
  scenario(
    "source auxiliary purpose suppresses primary model-request state transition",
    async (f) => {
      f.activate();
      f.s.agentPurpose = "memory_selection";
      f.s.isCompressing = true;
      await f.inputFilter({ input: [user()] });
      assert.equal(f.calls.length, 0);
      return true;
    },
  ),
  scenario(
    "source checkAutoCompact defers forced emergency work and catches its failure",
    async (f) => {
      f.activate();
      await f.runnerFactory.checkAutoCompact();
      assert.equal(f.scheduled.length, 1);
      assert.equal(f.calls.length, 0);
      await f.scheduled.shift()!();
      assert.deepEqual(f.calls[0], [
        "compact",
        f.s.id,
        { force: true, type: "emergency-auto" },
      ]);
      assert.ok(
        f.logs.some((x) => String(x).includes("Deferred compaction failed")),
      );
      return f.calls;
    },
    {
      compact: async () => {
        throw Error("owned deferred failure");
      },
    },
  ),
  scenario(
    "source checkAutoCompact catches missing summarizer DI without scheduling",
    async (f) => {
      f.activate();
      f.di.delete(f.n.getModule(67330).ContextCompactSummarizer);
      await f.runnerFactory.checkAutoCompact();
      assert.equal(f.scheduled.length, 0);
      assert.ok(
        f.logs.some((x) => String(x).includes("Auto compact check failed")),
      );
      return true;
    },
  ),
  scenario(
    "source shouldCompact uses history usage and source physical subagent identity",
    async (f) => {
      assert.equal(await f.runnerFactory.shouldCompact(f.s, f.compactor), true);
      f.s.history[1].providerData.usage.inputTokens = 800;
      f.s.meta.parentSessionId = "parent";
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      f.s.storeId = "parent-store";
      assert.equal(await f.runnerFactory.shouldCompact(f.s, f.compactor), true);
      return true;
    },
  ),
  scenario(
    "source shouldCompact ignores aggregate session usage and rawResponses when no history usage exists",
    async (f) => {
      delete f.s.history[1].providerData.usage;
      f.s.usage.inputTokens = 999999;
      f.s.resultSubject.next({
        lastAgent: f.agent,
        rawResponses: [{ usage: { inputTokens: 999999 } }],
      });
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      return true;
    },
  ),
  scenario(
    "source shouldCompact adds trailing tool-result token estimate to latest API history usage",
    async (f) => {
      f.s.history[1].providerData.usage.inputTokens = 900;
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      f.s.history.push(
        call("Read", "{}"),
        result("function_call_result", {
          output: "owned trailing result ".repeat(100),
        }),
      );
      assert.equal(await f.runnerFactory.shouldCompact(f.s, f.compactor), true);
      return true;
    },
  ),
  scenario(
    "source shouldCompact blocks empty/post-summary-degenerate histories and non-default parent agent",
    async (f) => {
      f.s.history = [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "summary" }],
          providerData: { agent: "compact", usage: { inputTokens: 9999 } },
        },
      ];
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      f.s.history.push({
        type: "message",
        role: "assistant",
        content: [],
        providerData: { usage: { inputTokens: 9999 }, isCompactInternal: true },
      });
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      f.s.history.push(user("new question"));
      f.s.resultSubject.next({ lastAgent: { name: "non-default" } });
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      f.s.resultSubject.next({ lastAgent: f.agent });
      assert.equal(await f.runnerFactory.shouldCompact(f.s, f.compactor), true);
      return true;
    },
  ),
  scenario(
    "source shouldCompact catches configuration errors and returns false",
    async (f) => {
      f.runnerFactory.productManager.waitConfiguration = async () => {
        throw Error("owned config failure");
      };
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      assert.ok(
        f.logs.some((x) => String(x).includes("[shouldCompact] Check failed")),
      );
      return true;
    },
  ),
  scenario(
    "source filter cleans content-filter notices/blocked user and deletes only source meta keys",
    async (f) => {
      f.activate();
      f.s.meta = {
        lastFinishReason: "content_filter",
        lastContentFilterUserMessageId: "blocked",
        keep: true,
      };
      const out = f.runnerFactory.filterTruncatedToolCalls({
        instructions: "owned",
        input: [
          user("blocked", { id: "blocked" }),
          {
            type: "message",
            role: "assistant",
            content: [],
            providerData: {
              contentFilterNotice: true,
              strippedUserMessageId: "blocked",
            },
          },
          user("safe", { id: "safe" }),
        ],
      });
      assert.equal(out.input.length, 1);
      assert.equal(out.input[0].id, "safe");
      assert.deepEqual(f.s.meta, { keep: true });
      return out;
    },
  ),
  scenario(
    "source filter uses pre-cleanup length finish reason while cleanup deletes it",
    async (f) => {
      f.activate();
      f.s.meta = {
        lastFinishReason: "length",
        lastContentFilterUserMessageId: "blocked",
      };
      const out = f.runnerFactory.filterTruncatedToolCalls({
        input: [user("blocked", { id: "blocked" }), call()],
      });
      assert.equal(out.input.length, 1);
      assert.match(JSON.stringify(out), /previous response was truncated/);
      assert.equal(f.s.meta.lastFinishReason, undefined);
      return out;
    },
  ),
  scenario(
    "source retry message keeps exact tool-specific guidance, ordering and deduplication",
    async (f) => {
      const a = f.n.buildTruncationRetryMessage([
          "Write",
          "Edit",
          "Write",
          "unknown",
        ]),
        b = f.n.buildTruncationRetryMessage(["unknown"]);
      assert.equal(a.split("The Write tool call was too large.").length, 2);
      assert.match(b, /multiple smaller tool calls/);
      assert.ok(a.endsWith(f.n.TRUNCATION_RETRY_MARKER));
      return [a, b];
    },
  ),
  scenario(
    "source filter uses real pinned jsonrepair and preserves repaired call identity",
    async (f) => {
      f.activate();
      const broken = call("Write", '{file_path:"owned",}'),
        data = { input: [broken] };
      const out = f.runnerFactory.filterTruncatedToolCalls(data);
      assert.equal(out, data);
      assert.deepEqual(JSON.parse(broken.arguments), { file_path: "owned" });
      return out;
    },
  ),
  scenario(
    "source injectSendNowItems remains an exact async no-op",
    async (f) => {
      const data = { input: [user()] };
      assert.equal(await f.runnerFactory.injectSendNowItems(data), undefined);
      assert.equal(data.input.length, 1);
      return data;
    },
  ),
];
for (const flag of [
  "isCompressing",
  "aborted",
  "cooldown",
  "compact-agent",
  "empty-history",
])
  NATIVE_RUNNER_CASES.push(
    scenario("source compaction early gate " + flag, async (f) => {
      if (flag === "isCompressing") f.s.isCompressing = true;
      if (flag === "aborted") f.s.abortController.abort();
      if (flag === "cooldown")
        f.s.lastCompactTimestamp = f.runtime.Date.now() - 29999;
      if (flag === "compact-agent")
        f.s.resultSubject.next({ lastAgent: { name: "compact" } });
      if (flag === "empty-history") f.s.history = [];
      assert.equal(
        await f.runnerFactory.shouldCompact(f.s, f.compactor),
        false,
      );
      return true;
    }),
  );
for (const [value, expected] of [
  [undefined, 200000],
  ["500000.9", 500000],
  ["5e5", 500000],
  ["500000junk", 200000],
  ["0", 200000],
  ["99999", 100000],
  ["2000000", 1000000],
  ["Infinity", 200000],
])
  NATIVE_RUNNER_CASES.push(
    scenario(
      "source full NumberUtils compact window parsing " + String(value),
      async (f) => {
        const compact = f.n.getModule(67330),
          n = f.n.getModule(3927).NumberUtils;
        assert.equal(compact.getAutoCompactWindow(), expected);
        assert.equal(compact.resolveCompactTriggerAt(0, 0.92), expected);
        assert.throws(() => n.clamp(Infinity, 1, 2), /finite/);
        return expected;
      },
      { env: { CODEBUDDY_AUTO_COMPACT_WINDOW: value } },
    ),
  );
for (const [length, prior, resultType, partial] of [
  [false, false, "function_call_result", false],
  [false, false, "function_call_result", true],
  [true, false, "function_call_result", false],
  [true, true, "function_call_output", false],
] as const)
  NATIVE_RUNNER_CASES.push(
    scenario(
      "source empty call/truncation branch " +
        [length, prior, resultType, partial].join("/"),
      async (f) => {
        f.activate();
        f.s.meta.lastFinishReason = length ? "length" : "stop";
        const c = call(),
          input: any[] = [
            c,
            result(resultType, {
              providerData: partial ? { isPartialAborted: true } : {},
            }),
          ];
        if (prior) input.unshift(user(f.n.TRUNCATION_RETRY_MARKER));
        const out = f.runnerFactory.filterTruncatedToolCalls({ input });
        if (!length && !partial) {
          assert.equal(c.arguments, "{}");
          assert.equal(out.input.length, 2);
        } else {
          assert.equal(
            out.input.some((x: any) => x.type === "function_call"),
            false,
          );
          if (length)
            assert.match(
              JSON.stringify(out.input.at(-1)),
              prior
                ? /TRUNCATION_RETRY_EXHAUSTED/
                : /previous response was truncated/,
            );
          else assert.equal(out.input.length, 0);
        }
        if (length && resultType === "function_call_output")
          assert.equal(
            out.input.some((x: any) => x.type === "function_call_output"),
            true,
          );
        return out;
      },
    ),
  );
for (const [name, count, expected] of [
  ["Read", 3, false],
  ["Read", 4, true],
  ["Agent", 39, false],
  ["Agent", 40, true],
] as const)
  NATIVE_RUNNER_CASES.push(
    scenario(
      "source complete loop detector threshold " + name + count,
      async (f) => {
        const input = Array.from({ length: count }, () => call(name, "{}")),
          found = f.loop.detectLoop(input);
        assert.equal(found.detected, expected);
        assert.equal(
          f.loop.detectLoop([...input, user("[LOOP_DETECTED]")]).detected,
          false,
        );
        return found;
      },
    ),
  );
