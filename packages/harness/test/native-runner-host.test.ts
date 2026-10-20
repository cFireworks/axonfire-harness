import assert from "node:assert/strict";
import test from "node:test";
import { Runner } from "@openai/agents-core";
import { createNativeRunnerHost } from "../src/runner/native-runner-host.js";
import { RunnerFactory } from "../src/runner/runner-factory.js";
import { getAutoCompactWindow } from "../src/context/compact-config.js";
import { nativeRunnerFixture } from "../scripts/helpers/native-runner-fixture.js";
function hostOptions(f: any, extra: any = {}) {
  return {
    modelProvider: { getModel: () => undefined } as any,
    sessionManager: f.manager,
    stateMachine: f.manager.stateMachine,
    agentManager: f.agentManager,
    productManager: { waitConfiguration: async () => ({}) },
    compactor: f.compactor,
    env: {},
    tracingDisabled: true,
    ...extra,
  };
}
test("default Runner adapter delegates to complete original class, with original loop and real SDK constructor", async () => {
  const f = await nativeRunnerFixture();
  const host = createNativeRunnerHost(hostOptions(f));
  try {
    assert.ok(host.factory instanceof host.native.RunnerFactoryImpl);
    assert.ok(host.provider instanceof host.native.RunnerProviderImpl);
    assert.ok(
      host.loopDetector instanceof host.native.ToolCallLoopDetectorImpl,
    );
    const r = await host.provider.get();
    assert.ok(r instanceof Runner);
    assert.equal(await host.provider.get(), r);
    assert.equal(
      host.utilities.UsageUtils.getLatestUsage(f.s).inputTokens,
      950,
    );
    assert.equal(host.utilities.SessionUtils.isSubAgent(f.s), false);
  } finally {
    await host.close();
    await f.close();
  }
});
test("standalone compatibility RunnerFactory delegates public methods rather than reimplementing decisions", async () => {
  const f = await nativeRunnerFixture();
  const adapter = new RunnerFactory(
    { getModel: () => undefined } as any,
    f.manager,
    f.manager.stateMachine,
    f.agentManager,
    { raw: {} } as any,
    undefined,
    f.compactor,
    undefined,
    { env: {}, tracingDisabled: true },
  );
  try {
    let count = 0;
    adapter.host.factory.checkAutoCompact = async () => {
      count++;
    };
    adapter.host.factory.shouldCompact = async (s: any) => {
      assert.equal(s, f.s);
      return true;
    };
    await adapter.checkAutoCompact();
    assert.equal(count, 1);
    assert.equal(await adapter.shouldCompact(f.s), true);
    assert.ok((await adapter.create()) instanceof Runner);
  } finally {
    await adapter.close();
    await f.close();
  }
});
test("Runner host close waits for its deferred original compaction without adding a microtask before its synchronous prefix", async (t) => {
  const f = await nativeRunnerFixture();
  let started = false,
    callback: (() => void) | undefined,
    release!: () => void;
  const blocked = new Promise<void>((r) => {
    release = r;
  });
  const host = createNativeRunnerHost(
    hostOptions(f, {
      compactor: {
        compactAndSummarize: async () => {
          started = true;
          await blocked;
          return true;
        },
      },
    }),
  );
  const runImmediate = () => {
    const run = callback;
    callback = undefined;
    run?.();
  };
  t.mock.method(globalThis, "setImmediate", ((run: () => void) => {
    callback = run;
    return {};
  }) as any);
  try {
    f.activate();
    await host.factory.checkAutoCompact();
    let closed = false;
    const close = host.close().then(() => {
      closed = true;
    });
    assert.equal(started, false);
    assert.equal(closed, false);
    runImmediate();
    assert.equal(
      started,
      true,
      "source callback prefix runs immediately, before another microtask",
    );
    release();
    await close;
    assert.equal(closed, true);
    await host.close();
  } finally {
    runImmediate();
    release();
    t.mock.restoreAll();
    await host.close();
    await f.close();
  }
});
test("standalone exported compact-window helper matches original Number/floor/clamp parsing", () => {
  const previous = process.env.CODEBUDDY_AUTO_COMPACT_WINDOW;
  try {
    for (const [value, expected] of [
      ["5e5", 500000],
      ["500000junk", 200000],
      ["0.1", 100000],
      ["500000.9", 500000],
      ["0", 200000],
    ] as const) {
      process.env.CODEBUDDY_AUTO_COMPACT_WINDOW = value;
      assert.equal(getAutoCompactWindow(), expected);
    }
  } finally {
    if (previous === undefined)
      delete process.env.CODEBUDDY_AUTO_COMPACT_WINDOW;
    else process.env.CODEBUDDY_AUTO_COMPACT_WINDOW = previous;
  }
});
