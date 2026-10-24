import assert from "node:assert/strict";
export async function sidecarScenarios(environment: any, sidecar: any) {
  const env = environment();
  const { RingBuffer, SessionReadyRegistry } = sidecar({ environment: env });
  const ring = new RingBuffer(5);
  ring.write(Buffer.from("abc"));
  ring.write(Buffer.from("def"));
  assert.equal(ring.snapshot().toString(), "bcdef");
  ring.write(Buffer.from("0123456789"));
  assert.equal(ring.snapshot().toString(), "56789");
  const snapshot = ring.snapshot();
  snapshot.fill(0);
  assert.equal(ring.snapshot().toString(), "56789");
  assert.deepEqual(
    env.buildCliProcessEnv(
      { NODE_OPTIONS: "managed", SERVER__PORT: "0" },
      {
        PATH: "/bin",
        HOME: "/owned",
        NODE_OPTIONS: "bad",
        https_proxy: "bad",
        codebuddy_secret: "bad",
        VITE_KEY: "bad",
        KEEP: "yes",
      },
    ),
    {
      PATH: "/bin",
      HOME: "/owned",
      KEEP: "yes",
      NODE_OPTIONS: "managed",
      SERVER__PORT: "0",
    },
  );
  const registry = new SessionReadyRegistry();
  try {
    const waiter = registry.register("a", 1000);
    const report = {
      sessionId: "a",
      token: waiter.token,
      pid: 123,
      port: 4321,
      protocolVersion: 1,
    };
    assert.throws(() => registry.accept(report), /not armed/);
    waiter.arm(123);
    assert.throws(() => registry.accept({ ...report, token: "bad" }), /token/);
    assert.throws(
      () => registry.accept({ ...report, pid: 124 }),
      /PID mismatch/,
    );
    assert.throws(() => registry.accept({ ...report, port: 0 }), /port/);
    registry.accept(report);
    assert.deepEqual(await waiter.promise, { pid: 123, port: 4321 });
    assert.deepEqual(registry.accept(report), { pid: 123, port: 4321 });
    assert.throws(
      () => registry.accept({ ...report, port: 4322 }),
      /No endpoint/,
    );
    const cancelled = registry.register("b", 1000);
    registry.reject("b", new Error("cancelled"));
    await assert.rejects(cancelled.promise, /cancelled/);
  } finally {
    registry.rejectAll(new Error("cleanup"));
  }
}
