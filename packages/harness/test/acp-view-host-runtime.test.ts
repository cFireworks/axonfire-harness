import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { setTraceProcessors } from "@openai/agents-core";
import { acpViewFixture } from "../scripts/helpers/acp-view-fixture.js";
import { ACP_LIFECYCLE_CASES } from "../scripts/helpers/acp-lifecycle-scenarios.js";
import { createNativeAcpLifecycle } from "../src/protocol/native-acp-lifecycle.js";
import { settle } from "../scripts/helpers/acp-protocol-fixture.js";
import { user } from "@openai/agents-core";
import { createNativeAcpView } from "../src/protocol/native-acp-view.js";
import {
  createAcpViewHost,
  type AcpViewHostOptions,
} from "../src/protocol/acp-view-host.js";
setTraceProcessors([]);
function hostOptions(
  p: Awaited<ReturnType<typeof acpViewFixture>>,
): AcpViewHostOptions {
  return {
    backend: p.backend,
    session: p.session,
    agent: p.f.agent,
    agentManager: { get: () => p.f.agent },
    services: p.services,
    runtime: p.f.runtime,
    followUpPauseState: p.lifecycle.team,
    logger: p.f.logger,
    runInContext: (operation) =>
      p.context.run(
        { request: { headers: { "acp-connection-id": "owned-connection" } } },
        operation,
      ),
  };
}
for (const scenario of ACP_LIFECYCLE_CASES)
  test(scenario.name, () => scenario.run(createNativeAcpLifecycle));

test(
  "full original Agent/View render loop and ACP SDK approve a real SDK Write exactly once",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t);
    assert.equal(
      (await p.client.initialize({ protocolVersion: 1 })).protocolVersion,
      1,
    );
    const response = await p.client.prompt({
      sessionId: p.session.id,
      prompt: [{ type: "text", text: "write owned file" }],
    });
    assert.equal(response.stopReason, "end_turn");
    assert.equal(await readFile(p.path, "utf8"), "written through ACP");
    assert.equal(p.permissions.length, 1);
    assert.equal(p.localApprovals.length, 0);
    assert.equal(p.backend.approvalOwners.count, 1);
    assert.ok(
      p.updates.some((value) => value.update.sessionUpdate === "tool_call"),
    );
    assert.ok(
      p.updates.some(
        (value) => value.update.sessionUpdate === "config_option_update",
      ),
    );
    assert.equal(response._meta["codebuddy.ai/outcome"], "SUCCESS");
    await p.host.close();
    assert.equal(p.host.timerCount, 0);
    assert.equal(p.backend.approvalOwners.count, 0);
    await assert.rejects(
      p.client.prompt({ sessionId: p.session.id, prompt: [] }),
      (error: any) =>
        error.code === -32603 &&
        error.data?.details === "ACP View host is closed",
    );
  },
);

test(
  "full source ACP rejection prevents Write and never invokes legacy approval UI",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t, {
      requestPermission: async () => ({
        outcome: { outcome: "selected", optionId: "reject" },
      }),
    });
    await p.client.initialize({ protocolVersion: 1 });
    const result = await p.client.prompt({
      sessionId: p.session.id,
      prompt: [{ type: "text", text: "deny owned write" }],
    });
    await assert.rejects(access(p.path), { code: "ENOENT" });
    assert.equal(p.permissions.length, 1);
    assert.equal(p.localApprovals.length, 0);
    assert.ok(["cancelled", "end_turn"].includes(result.stopReason));
  },
);

test(
  "closing full View during a pending ACP approval cancels without side effects and releases lease",
  { timeout: 20000 },
  async (t) => {
    let entered!: () => void;
    const permissionEntered = new Promise<void>(
      (resolve) => (entered = resolve),
    );
    const p = await acpViewFixture(t, {
      requestPermission: async () => {
        entered();
        return new Promise(() => {});
      },
    });
    await p.client.initialize({ protocolVersion: 1 });
    const pending = p.client
      .prompt({
        sessionId: p.session.id,
        prompt: [{ type: "text", text: "cancel owned write" }],
      })
      .then(
        (value: any) => ({ value }),
        (error: any) => ({ error }),
      );
    await permissionEntered;
    assert.throws(() => p.backend.approvalOwners.claim(p.session), /already/);
    await p.host.close();
    const result = await pending;
    assert.equal(result.value?.stopReason, "cancelled");
    await assert.rejects(access(p.path), { code: "ENOENT" });
    assert.equal(p.localApprovals.length, 0);
    assert.equal(p.host.timerCount, 0);
    assert.equal(p.host.pendingCount, 0);
    assert.equal(p.backend.approvalOwners.count, 0);
    assert.equal(p.f.agent.activeForwardingCleanups.size, 0);
    assert.equal(p.lifecycle.team.isLeadInboxPaused(p.session), true);
    assert.equal(p.backend.teamLeadPoller.isLeadInboxPaused(p.session), true);
  },
);

test(
  "View host close restores legacy approval ownership and leaves borrowed backend usable",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t);
    await p.host.close();
    await p.host.close();
    await assert.rejects(
      p.host.prompt({ sessionId: p.session.id, prompt: [] }),
      /not running/,
    );
    const lease = p.backend.approvalOwners.claim(p.session);
    lease.release();
    assert.equal(p.session.options.acp, undefined);
    const answer = await p.backend.prompt(p.session, "legacy owned prompt");
    assert.equal(p.localApprovals.length, 1);
    assert.equal(p.permissions.length, 0);
    await assert.rejects(access(p.path), { code: "ENOENT" });
    assert.equal(answer, "");
    assert.match(
      await p.backend.prompt(p.session, "continue after rejection"),
      /view complete/,
    );
  },
);

test(
  "ACP owns only its session ingress and handles deferred Write with one original approval",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t, { deferred: true });
    await assert.rejects(
      p.backend.prompt(p.session, "wrong ingress"),
      /owned by ACP/,
    );
    await assert.rejects(p.backend.compact(p.session), /ACP-owned/);
    await p.client.initialize({ protocolVersion: 1 });
    assert.equal(
      (
        await p.client.prompt({
          sessionId: p.session.id,
          prompt: [{ type: "text", text: "deferred write" }],
        })
      ).stopReason,
      "end_turn",
    );
    assert.equal(await readFile(p.path, "utf8"), "written through ACP");
    assert.equal(p.permissions.length, 1);
    assert.equal(p.localApprovals.length, 0);
  },
);

test(
  "original View iterator serves a second RPC turn without leaking task listeners",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t);
    assert.equal(p.host.taskListenerCount, 5);
    for (const text of ["first owned turn", "second owned turn"])
      assert.equal(
        (
          await p.client.prompt({
            sessionId: p.session.id,
            prompt: [{ type: "text", text }],
          })
        ).stopReason,
        "end_turn",
      );
    assert.ok(
      JSON.stringify(p.requests.at(-1).input).includes("first owned turn"),
    );
    assert.equal(p.permissions.length, 1);
    await p.host.close();
    assert.equal(p.host.taskListenerCount, 0);
    assert.equal(p.host.timerCount, 0);
    assert.deepEqual(p.host.asynchronousErrors, []);
  },
);

test(
  "idle owned queue wakeup uses the original View background-drain branch, not legacy prompt",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t);
    const item = user("owned background task notification");
    p.backend.messageQueue.enqueueMessage(p.session, item);
    for (
      let i = 0;
      i < 400 &&
      !p.wire.some(
        (value) => value.params?.update?.sessionUpdate === "session_end",
      );
      i++
    )
      await new Promise((resolve) => setTimeout(resolve, 5));
    assert.equal(p.session.queue.length, 0);
    assert.ok(
      p.wire.some(
        (value) => value.params?.update?.sessionUpdate === "session_end",
      ),
    );
    // The original producer emits this product extension, but the sample SDK client schema drops it.
    assert.equal(
      p.updates.some((value) => value.update.sessionUpdate === "session_end"),
      false,
    );
    assert.equal(p.sdkErrors.length, 1);
    assert.equal(p.localApprovals.length, 0);
    assert.equal(await readFile(p.path, "utf8"), "written through ACP");
  },
);

test(
  "View close joins async source subscription settings writes and restores borrowed receiver",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t),
      cli = p.backend.settingsHost.cli,
      original = cli.set;
    let release!: () => void,
      entered!: () => void,
      closed = false;
    const gate = new Promise<void>((resolve) => (release = resolve)),
      started = new Promise<void>((resolve) => (entered = resolve));
    cli.set = async function (...args: Parameters<typeof original>) {
      entered();
      await gate;
      return Reflect.apply(original, this, args);
    };
    try {
      p.f.agent.modelChangeEvent.next({
        sessionId: p.session.id,
        modelId: "fixture-model",
      });
      await started;
      const closing = p.host.close().then(() => {
        closed = true;
      });
      await settle();
      assert.equal(closed, false);
      release();
      await closing;
      assert.equal(p.host.pendingCount, 0);
      assert.deepEqual(p.host.asynchronousErrors, []);
    } finally {
      release();
      cli.set = original;
    }
  },
);

test(
  "render startup failure is observable and close still releases idle ownership and timers",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t);
    await p.host.close();
    const host = createAcpViewHost({
      ...hostOptions(p),
      sourceFactory(runtime) {
        const source = createNativeAcpView(runtime);
        return {
          ...source,
          AcpView: class extends source.AcpView {
            async render() {
              throw Error("owned render failure");
            }
          },
        };
      },
    });
    await assert.rejects(host.start(), /owned render failure/);
    await assert.rejects(host.close(), /owned render failure/);
    assert.equal(host.timerCount, 0);
    assert.equal(host.taskListenerCount, 0);
    assert.equal(p.backend.approvalOwners.count, 0);
  },
);

test(
  "wrong ACP Context fails before claiming ownership or changing session flags",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t);
    await p.host.close();
    assert.throws(
      () =>
        createAcpViewHost({
          ...hostOptions(p),
          runInContext: (operation) => operation(),
        }),
      /Context does not identify/,
    );
    assert.equal(p.backend.approvalOwners.count, 0);
    assert.equal(p.session.options.acp, undefined);
  },
);

test(
  "source SDK policy auto-allows Read without invoking either human UI",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t, { toolName: "Read" });
    assert.equal(
      (
        await p.client.prompt({
          sessionId: p.session.id,
          prompt: [{ type: "text", text: "owned read" }],
        })
      ).stopReason,
      "end_turn",
    );
    assert.equal(p.permissions.length, 0);
    assert.equal(p.localApprovals.length, 0);
    assert.ok(
      JSON.stringify(p.session.history).includes("owned readable content"),
    );
  },
);

test(
  "source Always Allow applies real permission policy to a second Write without legacy UI",
  { timeout: 20000 },
  async (t) => {
    const p = await acpViewFixture(t, {
      repeatWrite: true,
      requestPermission: async () => ({
        outcome: { outcome: "selected", optionId: "allow_always" },
      }),
    });
    await p.client.prompt({
      sessionId: p.session.id,
      prompt: [{ type: "text", text: "owned repeat write" }],
    });
    assert.equal(await readFile(p.path, "utf8"), "written through ACP");
    assert.equal(p.permissions.length, 1);
    assert.equal(p.localApprovals.length, 0);
    const outputs = p.session.history.filter(
      (value: any) => value.type === "function_call_result",
    );
    assert.equal(outputs.length, 2);
    assert.equal(
      JSON.stringify(outputs).includes("Tool permission denied"),
      false,
    );
  },
);

test(
  "source policy deny returning needsApproval=false does not create an executor allowance",
  { timeout: 20000 },
  async (t) => {
    const decisions: any[] = [];
    const p = await acpViewFixture(t, {
      backend: {
        permissionHost: {
          onSdkDecision: (...args: any[]) => decisions.push(args),
        },
      },
    });
    await p.backend.permissions.service.applyUpdate(p.session, {
      type: "addRules",
      rules: [{ toolName: "Write" }],
      behavior: "deny",
      destination: "session",
    });
    await p.client.prompt({
      sessionId: p.session.id,
      prompt: [{ type: "text", text: "owned deny rule" }],
    });
    await assert.rejects(access(p.path), { code: "ENOENT" });
    assert.equal(p.permissions.length, 0);
    assert.equal(p.localApprovals.length, 0);
    assert.ok(decisions.some((value) => value[4] === false));
    assert.ok(JSON.stringify(p.session.history).includes("denied"));
  },
);
