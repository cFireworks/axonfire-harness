import assert from "node:assert/strict";
import { ModelBehaviorError } from "@openai/agents-core";
import {
  acpProtocolFixture,
  protocolFactories,
  settle,
} from "./acp-protocol-fixture.js";
type Factories = typeof protocolFactories;
type Case = { name: string; run(factories: Factories): Promise<any> };
const scenario = (
  name: string,
  run: (h: ReturnType<typeof acpProtocolFixture>) => Promise<any>,
): Case => ({
  name,
  async run(factories) {
    const h = acpProtocolFixture(factories);
    try {
      return await run(h);
    } finally {
      await h.close();
    }
  },
});
export const protocolSnapshot = (value: any): any =>
  value instanceof Error
    ? {
        name: value.name,
        message: value.message,
        ...(typeof (value as any).code === "number"
          ? {
              code: (value as any).code,
              data: protocolSnapshot((value as any).data),
            }
          : {}),
      }
    : value instanceof Map || value instanceof Set
      ? [...value].map(protocolSnapshot)
      : Array.isArray(value)
        ? value.map(protocolSnapshot)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.entries(value).map(([key, v]) => [
                key,
                protocolSnapshot(v),
              ]),
            )
          : value;
const tracking = {
  requestId: "req",
  messageRequestId: "user-id",
  messageId: "owned-user-id",
};
const rawModel = (h: any, event: any) =>
  h.session.combineSubject.next({
    type: "model",
    data: { type: "model", event, timestamp: 1700000000000 },
  });
const stream = (patch: any = {}) => ({
  currentTurn: 1,
  _currentStep: { type: "next_step_final_output" },
  lastAgent: { name: "craft" },
  completed: Promise.resolve(),
  state: {
    _currentStep: { type: "next_step_final_output" },
    _lastTurnResponse: { output: [{ type: "message" }] },
  },
  ...patch,
});
export const ACP_PROTOCOL_CASES: Case[] = [
  scenario(
    "incremental JSON preserves every split and incomplete-prefix quirk",
    async (h) => {
      const results: any[] = [];
      for (const text of [
        '{"file_path":"a\\nb","count":12,"nested":{"x":[true,null]}}',
        "{}",
        '"key":"中文"}',
        'key":"ok"}',
        '{"x":-12.5,"tail":"unfinished',
        '{"nested":[1,{"x":2}],"t":true}',
        '{"x":"a\\\\b\\\"c"}',
        '{"bad":undefined,"x":false}',
      ]) {
        for (let at = 0; at <= text.length; at++) {
          const parser = new h.n.JsonStreamParser();
          const first = parser.appendDelta(text.slice(0, at));
          const second = parser.appendDelta(text.slice(at));
          results.push([
            first,
            second,
            parser.getBuffer(),
            parser.isCompleted(),
          ]);
        }
      }
      const parser = new h.n.JsonStreamParser();
      parser.appendDelta('{"x":"a');
      parser.appendDelta('b"}');
      assert.deepEqual(parser.getCurrentResult().parameters, { x: "ab" });
      parser.appendDelta("ignored");
      assert.equal(parser.getBuffer(), '{"x":"ab"}');
      return results;
    },
  ),
  scenario(
    "JSON finalization reports nonobjects but ignores SyntaxError",
    async (h) => {
      const events: any[] = [],
        parser = new h.n.JsonStreamParser((error: any, where: any) =>
          events.push([error, where]),
        );
      parser.setComplete("[1,2]");
      assert.equal(events.length, 1);
      assert.equal(parser.isCompleted(), true);
      parser.setComplete("{invalid");
      assert.equal(events.length, 1);
      parser.setComplete({ x: 1 });
      assert.deepEqual(parser.getCurrentResult().parameters, { x: 1 });
      return [events, parser.getCurrentResult()];
    },
  ),
  scenario(
    "tracking precedence keeps flat/nested IDs and trims only explicit message ID",
    async (h) => {
      const out = [];
      for (const conversationRequestId of [undefined, "conversation", ""])
        for (const meta of [
          undefined,
          {},
          {
            messageId: "flat-user",
            "codebuddy.ai/requestId": "flat-req",
            "codebuddy.ai/messageId": " explicit ",
          },
          {
            "codebuddy.ai": {
              requestId: "nested-req",
              messageId: " nested ",
              messageRequestId: "nested-user",
            },
          },
          {
            "codebuddy.ai/userMessageId": "user",
            "codebuddy.ai/messageRequestId": "other",
          },
        ]) {
          h.session.conversationRequestId = conversationRequestId;
          out.push(
            h.agent.resolvePromptTracking(
              { sessionId: "s", _meta: meta },
              h.session,
            ),
          );
        }
      h.session.conversationRequestId = undefined;
      assert.deepEqual(
        h.agent.resolvePromptTracking(
          {
            sessionId: "s",
            _meta: { messageId: "user", "codebuddy.ai/messageId": "  " },
          },
          h.session,
        ),
        {
          requestId: "fixed-uuid",
          messageId: "s-user",
          messageRequestId: "user",
        },
      );
      return out;
    },
  ),
  scenario(
    "W3C trace validation rejects zero, uppercase and unsupported version",
    async (h) => {
      const out = [];
      for (const tid of [
        "a".repeat(32),
        "0".repeat(32),
        "A".repeat(32),
        "a".repeat(31),
        undefined,
      ])
        for (const sid of ["b".repeat(16), "0".repeat(16), "B".repeat(16)])
          for (const version of ["00", "01"])
            out.push(
              h.p.trace.parseW3CTraceparent(`${version}-${tid}-${sid}-01`),
            );
      assert.deepEqual(
        h.p.trace.parseW3CTraceparent(
          `00-${"a".repeat(32)}-${"b".repeat(16)}-01`,
        ),
        { traceId: "a".repeat(32), spanId: "b".repeat(16) },
      );
      return out;
    },
  ),
  scenario(
    "RPC error mapping preserves authentication, network, quota and cancellation categories",
    async (h) => {
      const out: any[] = [];
      for (const status of [undefined, 401, 403, 408, 429, 500, 502, 503, 504])
        for (const code of [undefined, 11140, 14001]) {
          const error = Object.assign(
            Error("Tool Ghost not found in agent craft."),
            { status, code },
          );
          out.push(h.n.classifyErrorAsRequestError(error).toErrorResponse());
        }
      for (const message of [
        "canceled",
        "cancelled",
        "The operation was aborted",
        "This operation was aborted",
        "aborted",
        "other",
      ])
        out.push(
          h.n.classifyErrorAsRequestError(Error(message)).toErrorResponse(),
        );
      const direct = h.p.RequestError.invalidParams({ reason: "x" }, undefined);
      assert.equal(h.n.classifyErrorAsRequestError(direct), direct);
      assert.equal(
        h.n.classifyErrorAsRequestError(
          Object.assign(Error("expired"), { status: 401 }),
        ).code,
        -32000,
      );
      return out;
    },
  ),
  scenario(
    "RequestError preserves all JSON-RPC constructors and result envelopes",
    async (h) => {
      class BorrowedRequestError extends Error {}
      const borrowed = h.createPrimitives({
        modules: { 38113: { RequestError: BorrowedRequestError } },
      });
      assert.equal(borrowed.RequestError, BorrowedRequestError);
      assert.equal(borrowed.protocol.RequestError, BorrowedRequestError);
      const inert = h.createPrimitives();
      assert.throws(
        () => inert.protocol.AgentSideConnection,
        /transport SDK is not installed/,
      );
      const out = [];
      for (const name of [
        "parseError",
        "invalidRequest",
        "methodNotFound",
        "invalidParams",
        "internalError",
        "authRequired",
        "resourceNotFound",
      ])
        for (const arg of [undefined, "owned", { detail: "owned" }]) {
          const error = (h.p.RequestError as any)[name](arg, "detail");
          out.push([error.toResult(), error.toErrorResponse()]);
        }
      return out;
    },
  ),
  scenario(
    "mention telemetry deduplicates contexts without deduplicating knowledge IDs",
    async (h) => {
      const prompt = [
        { _meta: { mentionType: "file" } },
        { _meta: { mentionType: "rules" } },
        { _meta: { source: "ima", "ima.kbId": "same", "ima.kbName": "A" } },
        { _meta: { source: "ima", "ima.kbId": "same", "ima.kbName": "A" } },
        {
          name: "fallback",
          _meta: { mentionType: "tencent-doc", fileId: "doc" },
        },
      ];
      const result = h.p.TelemetryUtils.extractMentionInfoFromPrompt(prompt);
      assert.deepEqual(result, {
        mentionContexts: ["file", "rule", "knowledge"],
        knowledgeId: ["same", "same", "doc"],
        knowledgeName: ["A", "A", "fallback"],
      });
      return [
        result,
        h.p.TelemetryUtils.extractMentionInfoFromPrompt(undefined),
      ];
    },
  ),
  scenario(
    "history response lookup retains request-suffix and meta fallback behavior",
    async (h) => {
      const history = [
        {
          type: "message",
          role: "user",
          id: "owned-first",
          parentId: "before",
        },
        { type: "message", role: "assistant", id: "answer" },
        {
          type: "message",
          role: "user",
          id: "meta",
          providerData: { isMeta: true },
        },
      ];
      assert.equal(
        h.p.history.resolveUserItemIdForResponse(history, "first"),
        "owned-first",
      );
      assert.equal(
        h.p.history.resolveUserItemIdForResponse(history),
        "owned-first",
      );
      return [
        h.p.history.resolveResendForkPoint(history, {
          forkFromRequestId: "first",
        }),
        h.p.history.resolveResendForkPoint(history, {
          userMessageId: "missing",
        }),
      ];
    },
  ),
  scenario(
    "source tool interceptor caches only whole-file reads and delegates declared capabilities",
    async (h) => {
      const calls: any[] = [];
      h.toolInterceptor.setConnection({
        readTextFile: async (req: any) => {
          calls.push(req);
          return { content: "a\nb" };
        },
        writeTextFile: async (req: any) => {
          calls.push(req);
          return {};
        },
      });
      assert.equal(h.toolInterceptor.isSupportRead(), false);
      h.toolInterceptor.setCapabilities({
        fs: { readTextFile: true, writeTextFile: true },
      });
      await h.toolInterceptor.readTextFile({ path: "partial", line: 2 });
      await h.toolInterceptor.readTextFile({ path: "full" });
      await h.toolInterceptor.writeTextFile({
        path: "new",
        content: "written",
      });
      assert.deepEqual(h.toolInterceptor.getFileContentCache(), {
        full: "a\nb",
        new: "written",
      });
      return [
        calls,
        h.toolInterceptor.isSupportWrite(),
        h.toolInterceptor.formatContentWithLineNumbers("x\ny", 3),
        h.toolInterceptor.formatToolCommandOutput("timedOut", {
          output: "partial",
          truncated: true,
        }),
      ];
    },
  ),
  scenario(
    "agent update ACK succeeds, rejects real errors, and clears timer",
    async (h) => {
      assert.equal(
        await h.agent.sendPromptSessionUpdate({ value: 1 }, "owned"),
        true,
      );
      assert.equal(h.timers.size, 0);
      h.agent.connection.sessionUpdate = async () => {
        throw Error("client refused");
      };
      await assert.rejects(
        h.agent.sendPromptSessionUpdate({}, "owned"),
        /client refused/,
      );
      assert.equal(h.timers.size, 0);
      return h.updates;
    },
  ),
  scenario(
    "agent update timeout is exactly 5000 ms and abort does not send when already cancelled",
    async (h) => {
      let sends = 0,
        resolved = false;
      h.agent.connection.sessionUpdate = () => {
        sends++;
        return new Promise(() => {});
      };
      const pending = h.agent
        .sendPromptSessionUpdate({}, "owned")
        .then((v: any) => {
          resolved = true;
          return v;
        });
      await h.tick(4999);
      assert.equal(resolved, false);
      await h.tick(1);
      assert.equal(await pending, false);
      const controller = new AbortController();
      controller.abort();
      assert.equal(
        await h.agent.sendPromptSessionUpdate({}, "owned", controller.signal),
        false,
      );
      assert.equal(sends, 1);
      assert.equal(h.timers.size, 0);
      return h.logs;
    },
  ),
  scenario(
    "view ACK timeout and abort cleanup match native throw behavior",
    async (h) => {
      const pending = h.view.waitForSessionUpdate(
        new Promise(() => {}),
        "owned",
      );
      await h.tick(5000);
      assert.equal(await pending, false);
      const controller = new AbortController(),
        aborted = h.view.waitForSessionUpdate(
          new Promise(() => {}),
          "owned",
          controller.signal,
        );
      controller.abort();
      await assert.rejects(aborted, { name: "AbortError" });
      assert.equal(h.timers.size, 0);
      return h.logs;
    },
  ),
  scenario(
    "cancel barrier includes future timestamp and excludes exact 500 ms edge",
    async (h) => {
      const now = 1700000000000,
        out = [];
      for (const at of [
        undefined,
        now + 1,
        now,
        now - 499,
        now - 500,
        now - 501,
      ])
        out.push(h.v.isCancelBarrierActive(at, now));
      assert.deepEqual(out, [false, true, true, true, false, false]);
      h.view.lastCancelAtBySession.set("owned", now - 499);
      let dispatches = 0;
      h.view.tryExecuteLocalCommand = async () => {
        dispatches++;
        return { stopReason: "end_turn" };
      };
      const request = { request: { sessionId: "owned", prompt: [{ type: "text", text: "/owned" }] } };
      const blocked = await h.view.executePrompt(request, h.session, h.agent, {});
      assert.equal(blocked.stopReason, "cancelled");
      assert.equal(dispatches, 0, "499 ms barrier prevents even local command dispatch");
      await h.tick(1);
      const allowed = await h.view.executePrompt(request, h.session, h.agent, {});
      assert.equal(allowed.stopReason, "end_turn");
      assert.equal(dispatches, 1, "exact 500 ms boundary resumes normal dispatch");
      return [out, blocked, allowed, dispatches];
    },
  ),
  scenario(
    "source prompt iterator parks, wakes, and preserves parked-before-return ordering",
    async (h) => {
      const iterator = h.view
        .createPromptIterator(h.agent, h.session)
        [Symbol.asyncIterator]();
      h.agent.promptEvent.next({ request: { sessionId: "owned" }, marker: 1 });
      assert.equal((await iterator.next()).value.marker, 1);
      const waiting = iterator.next();
      h.agent.promptEvent.next({ marker: 2 });
      assert.equal((await waiting).value.marker, 2);
      h.agent.promptEvent.next({ marker: 3 });
      await iterator.return();
      assert.equal((await iterator.next()).value.marker, 3);
      assert.equal((await iterator.next()).done, true);
      assert.equal(h.agent.promptEvent.observers.length, 0);
      return h.logs;
    },
  ),
  scenario(
    "busy prompt iterator dispatches original ACP conversion with timestamp and user ID",
    async (h) => {
      h.session.status = "agent_running";
      const runs: any[] = [];
      h.view.agentService = {
        runDefault: async (items: any[], options: any) => {
          runs.push([items, options.context.id]);
        },
      };
      const iterator = h.view
          .createPromptIterator(h.agent, h.session)
          [Symbol.asyncIterator](),
        d = new h.p.Deferred();
      h.agent.promptEvent.next({
        request: {
          sessionId: "owned",
          prompt: [{ type: "text", text: "queued" }],
          _meta: { timestamp: 1234 },
        },
        responseDeferred: d,
        tracking,
      });
      const response = await d.promise;
      assert.deepEqual(response, {
        stopReason: "end_turn",
        userMessageId: "user-id",
      });
      assert.equal(runs[0][0][0].timestamp, 1234);
      await iterator.return();
      return [runs, response, h.session.meta];
    },
  ),
  scenario(
    "background drain clears queue before run failure without restoring items",
    async (h) => {
      h.session.queue.push({
        type: "message",
        role: "user",
        content: "background",
      });
      const calls: any[] = [];
      h.view.agentService = {
        runDefault: async (items: any[]) => {
          calls.push(items);
          throw Error("run failed");
        },
      };
      const peer = {
        getConnectionId: () => undefined,
        createEventForwardingPromise: () =>
          Promise.resolve({ stopReason: "end_turn" }),
      };
      await h.view.drainBackgroundTaskNotifications(h.session, peer, {
        setPromptForwardingActive: (value: boolean) => calls.push(value),
      });
      assert.equal(h.session.queue.length, 0);
      assert.deepEqual(h.session.queueSubject.value, []);
      assert.deepEqual(
        calls.filter((x) => typeof x === "boolean"),
        [true, false],
      );
      return [calls, h.logs];
    },
  ),
  scenario(
    "source approval waits for tool-call ACK and deduplicates the same approval object",
    async (h) => {
      const item = {
        rawItem: {
          type: "function_call",
          callId: "call",
          name: "Read",
          arguments: '{"file_path":"owned"}',
        },
      };
      h.session.interruptionSubject.next(item);
      const pending = h.agent.handleToolApproval(item, h.session.id);
      await settle();
      assert.equal(h.permissions.length, 0);
      h.agent.notifyToolCallSent("call");
      await pending;
      await h.agent.handleToolApproval(item, h.session.id);
      assert.equal(h.permissions.length, 1);
      assert.deepEqual(
        h.decisions.filter((v: any[]) => v[0] === "approve"),
        [["approve", { alwaysApprove: false }]],
      );
      return [h.permissions, h.decisions];
    },
  ),
  scenario(
    "cancel publishes reason and pending cancellation is consumed once",
    async (h) => {
      const events: any[] = [],
        sub = h.agent.cancelEvent.subscribe((event: any) => events.push(event));
      await h.agent.cancel({
        sessionId: "owned",
        _meta: { "codebuddy.ai/cancelReason": "user" },
      });
      assert.equal(h.agent.consumePendingCancellation("owned"), true);
      assert.equal(h.agent.consumePendingCancellation("owned"), false);
      sub.unsubscribe();
      return [events, h.updates];
    },
  ),
  scenario(
    "native stream forwards tool argument deltas, text, tracking, and cleans subscriptions on abort",
    async (h) => {
      const controller = new AbortController(),
        response = h.agent.createEventForwardingPromise(h.session, tracking, {
          signal: controller.signal,
        });
      rawModel(h, {
        model: "served-model",
        choices: [
          {
            delta: {
              reasoning_content: "thinking",
              tool_calls: [
                {
                  index: 0,
                  id: "call",
                  function: { name: "Read", arguments: '{"file_' },
                },
              ],
            },
          },
        ],
      });
      await settle();
      rawModel(h, {
        choices: [
          {
            delta: {
              tool_calls: [
                { index: 0, function: { arguments: 'path":"owned"}' } },
              ],
            },
          },
        ],
      });
      await settle();
      rawModel(h, {
        type: "response.function_call_arguments.done",
        call_id: "call",
        arguments: '{"file_path":"owned"}',
      });
      await settle();
      h.session.combineSubject.next({
        type: "model",
        data: { type: "output_text_delta", delta: "answer", timestamp: 1234 },
      });
      await settle();
      const chunks = h.updates.filter(
        (u: any) => u.update?.sessionUpdate === "tool_call_update",
      );
      assert.deepEqual(chunks.at(-1).update.rawInput, { file_path: "owned" });
      assert.equal(
        chunks.at(-1).update._meta["codebuddy.ai/toolArgumentsComplete"],
        true,
      );
      const text = h.updates.find(
        (u: any) => u.update?.content?.text === "answer",
      );
      assert.equal(
        text.update._meta["codebuddy.ai/messageId"],
        tracking.messageId,
      );
      controller.abort();
      assert.equal((await response).stopReason, "cancelled");
      assert.equal(h.agent.activeForwardingCleanups.size, 0);
      assert.equal(h.tasks.listenerCount("task-completed"), 0);
      assert.equal(h.session.combineSubject.observers.length, 0);
      return [h.updates, h.session.meta];
    },
  ),
  scenario(
    "late interruption abort marker cancels one completed follow-up and is consumed",
    async (h) => {
      const controller = new AbortController();
      const first = h.agent.createEventForwardingPromise(h.session, tracking, { signal: controller.signal });
      controller.abort();
      assert.equal((await first).stopReason, "cancelled");
      // Original rejection handling can set this after awaiting trace flush,
      // when the abort-forwarder subscription has already been cleaned up.
      h.session.meta.userInitiatedAbort = true;
      const second = h.agent.createEventForwardingPromise(h.session, tracking);
      rawModel(h, { choices: [{ finish_reason: "stop" }] });
      h.session.combineSubject.next({ type: "result", data: stream() });
      const completedButCancelled = await second;
      assert.equal(completedButCancelled.stopReason, "cancelled");
      assert.equal(completedButCancelled.finishReason, "stop");
      assert.equal(h.session.meta.userInitiatedAbort, undefined);
      const third = h.agent.createEventForwardingPromise(h.session, tracking);
      rawModel(h, { choices: [{ finish_reason: "stop" }] });
      h.session.combineSubject.next({ type: "result", data: stream() });
      const recovered = await third;
      assert.equal(recovered.stopReason, "end_turn");
      return [completedButCancelled, recovered, h.logs];
    },
  ),
  ...["end_turn", "refusal", "max_tokens"].map((reason) =>
    scenario("native stream maps final finish reason " + reason, async (h) => {
      const response = h.agent.createEventForwardingPromise(
        h.session,
        tracking,
      );
      rawModel(h, {
        choices: [
          { finish_reason: reason === "max_tokens" ? "length" : reason },
        ],
      });
      await settle();
      h.session.combineSubject.next({ type: "result", data: stream() });
      const result = await response;
      assert.equal(result.stopReason, reason);
      assert.equal(h.agent.activeForwardingCleanups.size, 0);
      return [result, h.updates];
    }),
  ),
  scenario(
    "native forwarding ignores stale result and aborts explicitly",
    async (h) => {
      const old = stream();
      h.session.resultSubject.next(old);
      const controller = new AbortController(),
        pending = h.agent.createEventForwardingPromise(h.session, tracking, {
          signal: controller.signal,
        });
      h.session.combineSubject.next({ type: "result", data: old });
      await settle();
      assert.equal(h.agent.activeForwardingCleanups.size, 1);
      controller.abort();
      return [await pending, h.logs];
    },
  ),
  scenario(
    "native forwarding gates team completion on both terminal members and session idle",
    async (h) => {
      let status = "running";
      h.members.push({ getAgentTask: () => ({ status }) });
      h.session.status = "agent_running";
      const pending = h.agent.createEventForwardingPromise(h.session, tracking);
      h.session.combineSubject.next({ type: "result", data: stream() });
      await settle();
      assert.equal(h.agent.activeForwardingCleanups.size, 1);
      status = "completed";
      h.tasks.emit("task-completed");
      await h.tick();
      assert.equal(h.agent.activeForwardingCleanups.size, 1);
      h.stateMachine.forceIdle(h.session);
      await h.tick();
      const result = await pending;
      assert.equal(result.stopReason, "end_turn");
      return [result, h.logs];
    },
  ),
  scenario(
    "ModelBehaviorError drains pending calls and remains end_turn for model correction",
    async (h) => {
      const pending = h.agent.createEventForwardingPromise(h.session, tracking);
      const rejected = Promise.reject(new ModelBehaviorError("bad output"));
      rejected.catch(() => {});
      h.session.combineSubject.next({
        type: "result",
        data: stream({ completed: rejected }),
      });
      const result = await pending;
      assert.equal(result.stopReason, "end_turn");
      return [result, h.updates];
    },
  ),
];

ACP_PROTOCOL_CASES.push(
  ...["allow", "allow_always", "reject", "reject_and_exit_plan", "unknown"].map(
    (optionId) =>
      scenario("original approval outcome " + optionId, async (h) => {
        const item = {
          rawItem: {
            type: "function_call",
            callId: "choice",
            name: "ExitPlanMode",
            arguments: "{}",
          },
        };
        h.session.permissionModeSubject.next("plan");
        h.session.meta.prePlanPermissionMode = "acceptEdits";
        h.agent.connection.requestPermission = async (request: any) => {
          h.permissions.push(request);
          return { outcome: { outcome: "selected", optionId } };
        };
        h.session.interruptionSubject.next(item);
        h.agent.notifyToolCallSent("choice");
        await h.agent.handleToolApproval(item, h.session.id);
        const decision = h.decisions.find(
          (v: any[]) => v[0] === "approve" || v[0] === "reject",
        );
        assert.equal(
          decision[0],
          optionId === "allow" || optionId === "allow_always"
            ? "approve"
            : "reject",
        );
        if (optionId === "reject_and_exit_plan") {
          assert.equal(h.session.permissionModeSubject.value, "acceptEdits");
          assert.equal(h.session.meta.prePlanPermissionMode, undefined);
        }
        return [
          h.permissions,
          h.decisions,
          h.session.permissionModeSubject.value,
        ];
      }),
  ),
  scenario(
    "local decision wins permission race without a second approval",
    async (h) => {
      const item = {
        rawItem: {
          type: "function_call",
          callId: "local",
          name: "Read",
          arguments: "{}",
        },
      };
      h.agent.connection.requestPermission = (request: any) => {
        h.permissions.push(request);
        return new Promise(() => {});
      };
      h.session.interruptionSubject.next(item);
      h.agent.notifyToolCallSent("local");
      const pending = h.agent.handleToolApproval(item, h.session.id);
      await settle();
      assert.equal(h.permissions.length, 1);
      h.session.interruptionSubject.next(undefined);
      await pending;
      assert.equal(
        h.decisions.some((v: any[]) => v[0] === "approve" || v[0] === "reject"),
        false,
      );
      return h.logs;
    },
  ),
  scenario(
    "already-aborted session rejects approval without a client request",
    async (h) => {
      h.session.abortController.abort();
      await h.agent.handleToolApproval(
        { rawItem: { type: "function_call", callId: "abort", name: "Read" } },
        h.session.id,
      );
      assert.equal(h.permissions.length, 0);
      assert.equal(h.decisions[0][0], "reject");
      return h.decisions;
    },
  ),
  scenario(
    "permission denials emit one cancelled update per nonempty call ID",
    async (h) => {
      await h.agent.emitCancelledToolCallUpdatesForDenials(h.session, [
        { tool_use_id: "same", tool_name: "Write" },
        { tool_use_id: "same", tool_name: "Edit" },
        { tool_use_id: "", tool_name: "Read" },
        { tool_name: "Read" },
      ]);
      assert.equal(h.updates.length, 1);
      assert.equal(h.updates[0].update.status, "cancelled");
      assert.equal(
        h.updates[0].update._meta["codebuddy.ai/toolCancelReason"],
        "permission_denied",
      );
      return h.updates;
    },
  ),
  scenario(
    "retry gate suppresses completion until a later run, but explicit user cancel resolves",
    async (h) => {
      const pending = h.agent.createEventForwardingPromise(h.session, tracking);
      h.session.interceptorGate = { completed: Promise.resolve(true) };
      h.session.combineSubject.next({ type: "result", data: stream() });
      await settle();
      assert.equal(h.agent.activeForwardingCleanups.size, 1);
      h.agent.pendingCancellations.add(h.session.id);
      h.session.combineSubject.next({ type: "result", data: stream() });
      const result = await pending;
      assert.equal(result.stopReason, "cancelled");
      return [result, h.logs];
    },
  ),
  scenario(
    "compact internal result remains open for post-compact continuation",
    async (h) => {
      const pending = h.agent.createEventForwardingPromise(h.session, tracking);
      h.session.isCompressing = true;
      h.session.meta[
        h.base.getModule(67330).SESSION_META_COMPACT_EXPECTS_CONTINUE
      ] = true;
      h.session.combineSubject.next({
        type: "result",
        data: stream({
          lastAgent: { name: h.base.getModule(69466).AgentNames.COMPACT },
        }),
      });
      await settle();
      assert.equal(h.agent.activeForwardingCleanups.size, 1);
      h.session.isCompressing = false;
      h.session.combineSubject.next({ type: "result", data: stream() });
      return [await pending, h.logs];
    },
  ),
  scenario(
    "scoped Ask IDs keep only the newest 512 and consume early skips once",
    async (h) => {
      for (let i = 0; i < 514; i++)
        h.agent.markAskToolCallHandled("s", "id" + i);
      assert.equal(h.agent.hasHandledAskToolCall("s", "id0"), false);
      assert.equal(h.agent.hasHandledAskToolCall("s", "id513"), true);
      assert.equal(h.agent.hasHandledAskToolCall("other", "id513"), false);
      h.agent.addPendingEarlyAskSkipToolCallId("s", "id");
      assert.equal(
        h.agent.consumePendingEarlyAskSkipToolCallId("s", "id"),
        true,
      );
      assert.equal(
        h.agent.consumePendingEarlyAskSkipToolCallId("s", "id"),
        false,
      );
      return [
        h.agent.handledAskToolCallIds.size,
        h.agent.pendingEarlyAskSkipToolCallIds.size,
      ];
    },
  ),
);
