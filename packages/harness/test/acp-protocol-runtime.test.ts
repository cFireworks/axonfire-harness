import test from "node:test";
import { ACP_PROTOCOL_CASES } from "../scripts/helpers/acp-protocol-scenarios.js";
import { protocolFactories } from "../scripts/helpers/acp-protocol-fixture.js";
import { acpProtocolFixture } from "../scripts/helpers/acp-protocol-fixture.js";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { PermissionMode } from "../src/permissions/permission.js";
setTraceProcessors([]);
for (const scenario of ACP_PROTOCOL_CASES)
  test(scenario.name, { timeout: 5000 }, () => scenario.run(protocolFactories));

test(
  "complete native ACP forwarder observes real SDK Read and next-turn replay without taking approval ownership",
  { timeout: 20000 },
  async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "native-acp-sdk-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const path = join(dir, "owned.txt");
    await writeFile(path, "owned real SDK content\n");
    let turn = 0;
    const requests: any[] = [];
    const model: Model = {
      getResponse: async () => ({ output: [], usage: new Usage() }),
      async *getStreamedResponse(request) {
        requests.push(request);
        ++turn;
        const output =
          turn === 1
            ? [
                {
                  type: "function_call",
                  id: "read-owned",
                  callId: "read-owned",
                  name: "Read",
                  arguments: JSON.stringify({ file_path: path }),
                  status: "completed",
                },
              ]
            : [
                {
                  type: "message",
                  role: "assistant",
                  id: "answer-" + turn,
                  status: "completed",
                  content: [
                    {
                      type: "output_text",
                      text: turn === 2 ? "read done" : "replayed",
                    },
                  ],
                },
              ];
        yield { type: "response_started" };
        if (turn > 1)
          yield {
            type: "output_text_delta",
            delta: turn === 2 ? "read done" : "replayed",
          };
        yield {
          type: "response_done",
          response: {
            id: "response-" + turn,
            output,
            usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
          },
        } as any;
      },
    };
    const backend = await createHarness({
      workDir: dir,
      stateDir: join(dir, "state"),
      model: "fixture-model",
      recordReplayEnv: {},
      productRuntime: { watch: false, environment: false },
      modelProvider: { getModel: () => model },
    });
    t.after(() => backend.close());
    const session = await backend.openSession();
    // Explicit fixture-only mode: this test must not run two approval owners.
    session.permissionModeSubject.next(PermissionMode.BypassPermissions);
    const h = acpProtocolFixture(protocolFactories, {
      session,
      sessionManager: backend.sessions,
      stateMachine: backend.stateMachine,
      tasks: backend.taskManager,
      realTimers: true,
      modules: { 54193: { getTeamMemberRegistry: () => backend.teamMembers } },
    });
    t.after(() => h.close());
    const controller = new AbortController();
    t.after(() => controller.abort());
    let forwarding = h.agent.createEventForwardingPromise(
      session,
      {
        requestId: "first",
        messageId: "first-message",
        messageRequestId: "first-user",
      },
      { signal: controller.signal },
    );
    assert.equal(
      await backend.prompt(session, "read the owned fixture"),
      "read done",
    );
    assert.equal((await forwarding).stopReason, "end_turn");
    assert.ok(
      h.updates.some(
        (p: any) =>
          p.update?.sessionUpdate === "tool_call" &&
          p.update.toolCallId === "read-owned",
      ),
    );
    assert.ok(
      h.updates.some(
        (p: any) =>
          p.update?.sessionUpdate === "tool_call_update" &&
          p.update.status === "completed",
      ),
    );
    assert.ok(
      h.updates.some((p: any) => p.update?.content?.text === "read done"),
    );
    forwarding = h.agent.createEventForwardingPromise(
      session,
      {
        requestId: "second",
        messageId: "second-message",
        messageRequestId: "second-user",
      },
      { signal: controller.signal },
    );
    assert.equal(await backend.prompt(session, "continue"), "replayed");
    assert.equal((await forwarding).stopReason, "end_turn");
    assert.match(
      JSON.stringify(requests.at(-1).input),
      /owned real SDK content/,
    );
    assert.equal(h.permissions.length, 0);
    assert.equal(h.agent.activeForwardingCleanups.size, 0);
    assert.equal(session.combineSubject.observers.length > 0, false);
  },
);
