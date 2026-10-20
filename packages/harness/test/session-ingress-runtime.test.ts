import test from "node:test";
import assert from "node:assert/strict";
import { BehaviorSubject } from "rxjs";
import { acpProtocolFixture } from "../scripts/helpers/acp-protocol-fixture.js";
import { createNativeSessionIngress } from "../src/sessions/native-session-ingress.js";
import { SESSION_INGRESS_CASES } from "../scripts/helpers/session-ingress-scenarios.js";
for (const scenario of SESSION_INGRESS_CASES)
  test(scenario.name, () => scenario.run(createNativeSessionIngress));

test("source ACP new-session refuses anonymous auth before REST or session rendezvous", async (t) => {
  const AuthenticationManager = Symbol("owned anonymous auth boundary");
  const f = acpProtocolFixture(undefined, {
    modules: { 86482: { AuthenticationManager } },
  });
  t.after(() => f.close());
  f.setDependency(AuthenticationManager, {
    initialized: Promise.resolve(),
    currentSessionSubject: new BehaviorSubject(undefined),
  });
  let network = 0;
  (f.modules[67062] as any).RestOperationsFactory =
    Symbol("owned REST factory");
  f.setDependency((f.modules[67062] as any).RestOperationsFactory, {
    create() {
      network++;
      throw Error("must not create REST client");
    },
  });
  await assert.rejects(
    f.agent.newSession({ cwd: "/owned", mcpServers: [] }),
    (error: any) => error.code === -32000,
  );
  assert.equal(network, 0);
  assert.equal(f.agent.sessionRequest, undefined);
  assert.equal(f.agent.sessionDeferred, undefined);
});

test("source ACP new-session waits authentication initialization and propagates failure without treating model key as account", async (t) => {
  const AuthenticationManager = Symbol("owned pending auth boundary");
  const f = acpProtocolFixture(undefined, {
    modules: { 86482: { AuthenticationManager } },
  });
  t.after(() => f.close());
  let reject!: (error: Error) => void,
    done = false,
    network = 0;
  const initialized = new Promise<void>((_resolve, fail) => {
    reject = fail;
  });
  f.setDependency(AuthenticationManager, {
    initialized,
    currentSessionSubject: new BehaviorSubject(undefined),
  });
  (f.modules[67062] as any).RestOperationsFactory =
    Symbol("owned REST factory");
  f.setDependency((f.modules[67062] as any).RestOperationsFactory, {
    create() {
      network++;
      throw Error("must not create REST client");
    },
  });
  const pending = f.agent
    .newSession({ cwd: "/owned", mcpServers: [] })
    .finally(() => {
      done = true;
    });
  const rejection = assert.rejects(
    pending,
    /owned auth initialization failure/,
  );
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(done, false);
  reject(Error("owned auth initialization failure"));
  await rejection;
  assert.equal(network, 0);
  assert.equal(f.agent.sessionDeferred, undefined);
});
