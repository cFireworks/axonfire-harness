import { createNativeSessionManager } from "../../../packages/harness/dist/src/sessions/native-session-manager.js";
import { createNativeSessionHostRuntime } from "../../../packages/harness/dist/src/sessions/native-session-host-runtime.js";
import { createNativeSessionReplayTransport } from "../../../packages/harness/dist/src/sessions/native-session-replay-transport.js";
import { loadCapturedDatabaseDriver } from "../../../packages/harness/dist/scripts/helpers/captured-database-driver.js";
import { createNativeDatabaseService } from "../../../packages/harness/dist/src/storage/native-database-service.js";
import { SQLiteTestDatabase } from "../../../packages/harness/dist/scripts/helpers/sqlite-test-driver.js";
import * as os from "node:os";
import { createNativeSessionRecords } from "../../../packages/harness/dist/src/sessions/native-session-records.js";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { originalBackendFixture } from "./original-backend-fixture.mjs";

for (const reclaimBeforeDelete of [false, true])
  test(
    "recovered real CLI session lifecycle: " +
      (reclaimBeforeDelete ? "reclaim then delete" : "active delete"),
    { timeout: 45000 },
    async () => {
      const root = await mkdtemp(join(tmpdir(), "axon-mode-restart-"));
      const titleRequests = [];
      const requests = [],
        backends = [],
        order = [],
        warnings = [];
      let recordDatabase, session, hostAttachment;
      const output = join(root, "after-restart.txt");
      const server = createServer(async (req, res) => {
        let body = "";
        for await (const chunk of req) body += chunk;
        const request = JSON.parse(body);
        // The original desktop client enables title generation, which is a separate model call.
        const titleRequest = request.messages?.some(
          (message) =>
            typeof message.content === "string" &&
            message.content.startsWith(
              "Generate a concise, sentence-case title",
            ),
        );
        (titleRequest ? titleRequests : requests).push(request);
        res.writeHead(200, { "content-type": "text/event-stream" });
        const toolCalls =
          !titleRequest && requests.length === 2
            ? [
                {
                  index: 0,
                  id: "owned-restart-write",
                  type: "function",
                  function: {
                    name: "Write",
                    arguments: JSON.stringify({
                      file_path: output,
                      content: "owned-restart-write-ok",
                    }),
                  },
                },
                {
                  index: 1,
                  id: "owned-task-create",
                  type: "function",
                  function: {
                    name: "TaskCreate",
                    arguments: JSON.stringify({
                      subject: "Owned plan task",
                      description: "Verify recovered plan snapshot",
                      activeForm: "Verifying plan",
                    }),
                  },
                },
              ]
            : !titleRequest && requests.length === 3
              ? [
                  {
                    index: 0,
                    id: "owned-task-list",
                    type: "function",
                    function: { name: "TaskList", arguments: "{}" },
                  },
                ]
              : undefined;
        const delta = toolCalls
          ? { role: "assistant", tool_calls: toolCalls }
          : {
              role: "assistant",
              content: titleRequest
                ? JSON.stringify({
                    isNewTopic: true,
                    title: "Owned restart verification",
                  })
                : "Owned restart answer " + requests.length,
            };
        res.end(
          `data: ${JSON.stringify({ id: "owned", object: "chat.completion.chunk", created: 1, model: "owned-model", choices: [{ index: 0, delta, finish_reason: toolCalls ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const config = join(root, "product.json");
      await writeFile(
        config,
        JSON.stringify({
          authentication: {
            type: "custom-token",
            attributes: { token: "owned-token" },
          },
          config: { disabled: true },
          agents: [
            {
              name: "owned-agent",
              tags: ["cli", "default"],
              instructions: "Owned base",
              tools: ["Read", "Write", "TaskCreate", "TaskList"],
              models: ["owned-model"],
            },
          ],
          models: [
            {
              id: "owned-model",
              name: "owned-model",
              url: `http://127.0.0.1:${server.address().port}/v1`,
            },
          ],
        }),
      );
      const replayTransport = createNativeSessionReplayTransport();
      const env = {
        ...nativeFixtureEnv,
        // The isolated child environment must retain an explicitly selected Electron Node mode.
        ...(process.versions.electron &&
        process.env.ELECTRON_RUN_AS_NODE === "1"
          ? { ELECTRON_RUN_AS_NODE: "1" }
          : {}),
        HOME: root,
        SHELL: "/bin/sh",
        AXONFIRE_STATE_DIR: join(root, "state"),
        AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
        ...replayTransport.gatewaySecretEnv(),
      };
      let originalBackend;
      // Observe lifecycle order without replacing original backend behavior or ACP transport.
      function backend(runtimeConfig, expectedSessionId) {
        const number = backends.length;
        const value = originalBackend.definition.create({
          sessionId: expectedSessionId,
          cwd: root,
          runtimeConfig,
        });
        let origin;
        const initialize = value.initialize.bind(value);
        value.initialize = async (...args) => {
          order.push("initialize-" + number);
          const result = await initialize(...args);
          assert.equal(
            await readFile(value.systemPromptFile, "utf8"),
            runtimeConfig.systemPrompt,
          );
          origin = new URL(value.acpEndpoint).origin;
          return result;
        };
        const prompt = value.prompt.bind(value);
        value.prompt = (...args) => {
          assert.equal(
            recordDatabase.service.getSession(expectedSessionId).status,
            "planning",
          );
          return prompt(...args);
        };
        const releaseRuntime = value.releaseRuntime.bind(value);
        value.releaseRuntime = async (...args) => {
          order.push("release-" + number);
          return releaseRuntime(...args);
        };
        const destroy = value.destroy.bind(value);
        value.destroy = async (...args) => {
          order.push("destroy-" + number);
          await destroy(...args);
          order.push("exited-" + number);
        };
        Object.defineProperty(value, "origin", { get: () => origin });
        backends.push(value);
        return value;
      }
      try {
        originalBackend = await originalBackendFixture({
          root,
          env,
          gateway: replayTransport,
        });
        const firstConfig = {
          model: "owned-model",
          systemPrompt: "Owned phase ASK-4281",
          tools: "Read",
          permissionMode: "default",
          restartFingerprint: "ask-owned",
        };
        const expectedSessionId = randomUUID();
        const originalManager = createNativeSessionManager({
          console: {
            log() {},
            warn: (...args) => warnings.push(args.map(String).join(" ")),
          },
          os: { ...os, homedir: () => root, tmpdir: () => root },
        });
        const controller = new originalManager.SessionManager();
        const preparations = [];
        let armReconfiguration = false;
        async function onBeforePrompt(input) {
          if (!armReconfiguration) return;
          preparations.push(input.backendRestarted);
          if (preparations.length === 1)
            await controller.updateSessionConfig(session.sessionId, {
              mode: "craft",
              model: "owned-model",
              systemPrompt: "Owned phase CRAFT-4281",
              tools: "Read,Write,TaskCreate,TaskList",
              permissionMode: "acceptEdits",
            });
        }
        // Default driver is a test bridge; an explicit fixed sample path exercises the original native driver.
        const sqliteDriver = process.env.AXONFIRE_TEST_SQLITE_DRIVER
          ? loadCapturedDatabaseDriver(process.env.AXONFIRE_TEST_SQLITE_DRIVER)
          : { Database: SQLiteTestDatabase };
        if (sqliteDriver.metadata)
          console.log(JSON.stringify(sqliteDriver.metadata));
        const storageRuntime = createNativeDatabaseService({
          BetterSQLite: sqliteDriver.Database,
          runtimeContext: {
            getWorkbuddyRuntimeConfigDir: () => join(root, "desktop-db"),
            getWorkbuddyRuntimeLogsDir: (...parts) =>
              join(root, "desktop-db", "logs", ...parts),
          },
          osModule: { ...os, homedir: () => root },
        });
        let database = new storageRuntime.WorkbuddyDatabaseService();
        recordDatabase = {
          get service() {
            return database;
          },
          reopen() {
            database.dispose();
            database = new storageRuntime.WorkbuddyDatabaseService();
            database.initialize();
          },
          async close() {
            database.dispose();
            const logger = storageRuntime.DatabaseFileLogger.instance;
            await logger?.flush();
            logger?.dispose();
          },
        };
        const recordRuntime = createNativeSessionRecords();
        const recordStore = recordRuntime.createSessionRecordStore(
          Promise.resolve({ database }),
          { getCurrentUserId: () => "owned-user" },
        );
        const taskRecords = [],
          taskTelemetry = [],
          backendUpdates = [],
          toolObservations = [];
        controller.initialize({
          createBackend: (request) =>
            backend(request.runtimeConfig, request.sessionId),
          recordStore,
          onBeforePrompt,
          getCurrentUserId: () => "owned-user",
          logger: {
            info() {},
            warn: (...args) => warnings.push(args.map(String).join(" ")),
          },
          reportTelemetry: (name, data) => taskTelemetry.push({ name, data }),
          toolUsageObserver: {
            observe: (entry) => toolObservations.push(entry),
          },
        });
        controller.setEventSink((channel, payload) => {
          if (channel === "session:event:" + expectedSessionId)
            backendUpdates.push(payload);
          if (channel === "session:upserted") taskRecords.push(payload.status);
        });
        session = await controller.startSession(
          {
            sessionId: expectedSessionId,
            cwd: root,
            config: { ...firstConfig, mode: "ask" },
          },
          "new",
        );
        async function runOwnedPrompt(_backend, text) {
          const response = await controller.prompt(session.sessionId, [
            { type: "text", text },
          ]);
          assert.equal(
            recordDatabase.service.getSession(session.sessionId).status,
            "completed",
          );
          assert.match(
            response._meta["codebuddy.ai"].lastAssistantText,
            /Owned restart answer/,
          );
          assert.equal(session.promptInvocationActive, false);
          assert.equal(session.noResponseWatchdog.timer, null);
          return response;
        }
        const first = session.backend;
        const handle = { sessionId: session.sessionId };
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).mode,
          "ask",
        );
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).permissionMode,
          "default",
        );
        assert.equal(
          (await runOwnedPrompt(first, "Owned before restart question"))
            .stopReason,
          "end_turn",
        );
        assert.match(
          JSON.stringify(requests[0].messages),
          /Owned phase ASK-4281/,
        );
        assert.ok(requests[0].tools.some((t) => t.function.name === "Read"));
        assert.equal(
          requests[0].tools.some((t) => t.function.name === "Write"),
          false,
        );
        // Drive queue edits through original SessionManager entrypoints and real ACP.
        await controller.saveMessageQueue({
          sessionId: handle.sessionId,
          version: 3,
          conversationId: handle.sessionId,
          items: [],
          runtime: {
            activated: false,
            paused: true,
            pauseReason: "error",
            updatedAt: 1,
          },
        });
        // The fixed desktop exposes these methods, but its CLI returns method-not-found.
        await assert.rejects(controller.getQueueState(handle.sessionId), {
          code: -32601,
        });
        await assert.rejects(controller.cancelMessageQueue(handle.sessionId), {
          code: -32601,
        });
        const queuedA = await controller.enqueueMessage(handle.sessionId, [
          { type: "text", text: "Owned queue A" },
        ]);
        const itemA = queuedA.items.at(-1).id;
        const queuedB = await controller.enqueueMessage(handle.sessionId, [
          { type: "text", text: "Owned queue B" },
        ]);
        const itemB = queuedB.items.at(-1).id;
        const reordered = await controller.reorderQueue(handle.sessionId, [
          itemB,
          itemA,
        ]);
        assert.deepEqual(
          reordered.items.map((item) => item.id),
          [itemB, itemA],
        );
        const popped = await controller.popQueueItemForEdit(
          handle.sessionId,
          itemB,
        );
        assert.equal(popped.item.id, itemB);
        assert.deepEqual(popped.item.contentBlocks, [
          { type: "text", text: "Owned queue B" },
        ]);
        assert.equal(
          (await controller.removeQueueItem(handle.sessionId, itemA)).items
            .length,
          0,
        );
        assert.equal(
          (await controller.pauseMessageQueue(handle.sessionId, "error"))
            .runtime.paused,
          true,
        );
        assert.equal(
          (await controller.activateMessageQueue(handle.sessionId)).item,
          undefined,
        );
        assert.equal(
          (await controller.resumeMessageQueue(handle.sessionId)).runtime
            .paused,
          false,
        );
        assert.equal(
          requests.length,
          1,
          "editing the paused queue must not start a model turn",
        );
        await controller.saveMessageQueue({
          sessionId: handle.sessionId,
          version: 3,
          conversationId: handle.sessionId,
          items: [
            {
              id: "owned-pending",
              status: "pending",
              order: 5,
              contentBlocks: [{ type: "text", text: "Owned queued pending" }],
            },
            {
              id: "owned-sending",
              status: "sending",
              order: 2,
              lastAttemptAt: 123,
              contentBlocks: [{ type: "text", text: "Owned queued sending" }],
            },
            {
              id: "owned-sent",
              status: "sent",
              order: 0,
              contentBlocks: [{ type: "text", text: "Owned already sent" }],
            },
          ],
          runtime: {
            activated: false,
            paused: true,
            pauseReason: "error",
            lastError: "owned-queue-error",
            updatedAt: 1,
          },
        });
        const beforeQueue = await controller.getMessageQueue(handle.sessionId);
        assert.equal(beforeQueue.items.length, 3, JSON.stringify(beforeQueue));
        armReconfiguration = true;
        const promptBackend = await controller.withReadySession(
          session.sessionId,
          (ready) => controller.resolveBackendForPromptSend(ready),
        );
        armReconfiguration = false;
        assert.deepEqual(
          preparations,
          [false, true],
          "preparation must repeat for the replaced backend",
        );
        assert.equal(promptBackend, session.backend);
        assert.deepEqual(warnings, []);
        assert.equal(session.modeEpoch, 3);
        assert.equal(backends.length, 2);
        assert.ok(
          order.indexOf("exited-0") < order.indexOf("initialize-1"),
          JSON.stringify(order),
        );
        await assert.rejects(
          fetch(first.origin + "/api/v1/health", {
            headers: { "x-codebuddy-request": "1" },
          }),
        );
        const restored = await controller.getMessageQueue(handle.sessionId);
        assert.equal(restored.conversationId, handle.sessionId);
        assert.deepEqual(
          restored.items.map((i) => [i.id, i.status, i.order, i.lastAttemptAt]),
          [
            ["owned-sending", "pending", 0, undefined],
            ["owned-pending", "pending", 1, undefined],
          ],
        );
        assert.equal(restored.runtime.activated, false);
        assert.equal(restored.runtime.paused, true);
        assert.equal(restored.runtime.pauseReason, "error");
        assert.equal(restored.runtime.lastError, "owned-queue-error");
        assert.equal(
          (await runOwnedPrompt(promptBackend, "Owned after restart question"))
            .stopReason,
          "end_turn",
        );
        assert.equal(
          requests.length,
          4,
          "two prompts plus write/create and list results; paused queue must not run",
        );
        assert.equal(await readFile(output, "utf8"), "owned-restart-write-ok");
        assert.ok(
          requests[2].messages.some(
            (m) =>
              m.role === "tool" && m.tool_call_id === "owned-restart-write",
          ),
        );
        const second = requests[1];
        assert.match(JSON.stringify(second.messages), /Owned phase CRAFT-4281/);
        assert.doesNotMatch(
          JSON.stringify(second.messages),
          /Owned phase ASK-4281/,
        );
        assert.match(
          JSON.stringify(second.messages),
          /Owned before restart question/,
        );
        assert.match(JSON.stringify(second.messages), /Owned restart answer 1/);
        assert.ok(second.tools.some((t) => t.function.name === "Write"));
        assert.equal(
          originalManager.coordinator.policies.has(expectedSessionId),
          true,
        );
        assert.equal(session.historyHydrationDepth, 0);
        assert.equal(session.awaitingHistoryReplayEnd, false);
        assert.equal(
          session.bufferedScopedEventsDuringHistoryHydration.length,
          0,
        );
        assert.ok(
          session.eventHistory.some(
            (p) =>
              p.update?.sessionUpdate === "tool_call_update" &&
              p.update.toolCallId === "owned-task-list",
          ),
        );
        assert.ok(
          session.eventHistory.some((p) => p.update?.sessionUpdate === "plan"),
        );

        for (const name of ["Write", "TaskCreate", "TaskList"]) {
          const captured = controller.getLatestToolResultByName(
            expectedSessionId,
            name,
          );
          assert.ok(captured, "missing captured result for " + name);
          assert.equal(captured.status, "completed");
          assert.notEqual(captured.rawOutput, undefined);
          assert.ok(
            toolObservations.some(
              (e) =>
                e.toolName === name &&
                e.status === "completed" &&
                e.sessionId === expectedSessionId,
            ),
          );
        }
        assert.equal(controller.hasActiveToolCall(session), false);
        const toolSnapshot =
          controller.getSessionToolResults(expectedSessionId);
        assert.ok(toolSnapshot.has("owned-task-list"));

        assert.ok(
          session.planSnapshot,
          "actual task tool updates must produce a plan",
        );
        assert.ok(
          session.planSnapshot.update.entries.some(
            (e) => e.content === "Owned plan task",
          ),
        );
        assert.ok(session.planSnapshot.revision >= 1);
        assert.ok(
          backendUpdates.some(
            (p) =>
              p.update?.sessionUpdate === "plan" &&
              p._meta?.["codebuddy.ai"]?.source === "TaskList" &&
              p._meta?.["codebuddy.ai"]?.derivedFromToolCallId ===
                "owned-task-list",
          ),
        );
        assert.equal(
          session.planSnapshot._meta["codebuddy.ai"].planOwner,
          "session-manager",
        );
        assert.ok(
          backendUpdates.some((p) => p.update?.sessionUpdate === "plan"),
        );
        assert.equal(session.hasReceivedBackendActivity, true);
        assert.ok(
          backendUpdates.some(
            (p) => p.update?.sessionUpdate === "agent_message_chunk",
          ),
        );
        assert.ok(
          backendUpdates.some((p) => p.update?.sessionUpdate === "tool_call"),
        );
        assert.ok(
          backendUpdates.every((p) => p.sessionId === expectedSessionId),
        );
        assert.equal(
          controller.hasStoredSessionHistory(expectedSessionId),
          true,
        );
        // Invalidate through the original manager before uncached LOAD reconstruction.
        controller.invalidateStoredSessionHistory(expectedSessionId);
        assert.equal(session.eventHistory.length, 0);
        assert.equal(session.toolResults.size, 0);
        assert.equal(session.planSnapshot, undefined);
        assert.equal(
          controller.hasStoredSessionHistory(expectedSessionId),
          false,
        );
        const hostRuntime = createNativeSessionHostRuntime();
        const registeredHandlers = new Map();
        let replayRequests = 0,
          resolveSynthetic,
          disconnected,
          releasedSubscriptions = 0;
        const synthetic = new Promise((resolve) => {
          resolveSynthetic = resolve;
        });
        const rpcPublications = [];
        hostAttachment = hostRuntime.attachWorkbuddyAppServerSessionRuntime({
          sessionManager: controller,
          windowFocus: { isFocused: () => true },
          logger: { info() {}, warn: (...args) => warnings.push(args) },
          endpoint: {
            handle: (channel, fn) => registeredHandlers.set(channel, fn),
            onAllClientsDisconnected: (fn) => {
              disconnected = fn;
            },
            push(channel, payload) {
              rpcPublications.push({ channel, payload });
              if (
                payload.type === "promptResponse" &&
                payload.origin === "synthetic"
              )
                resolveSynthetic(payload);
            },
          },
          handlers: {
            auxiliary: {
              sessionManager: controller,
              getFileWatchService: () => ({
                releaseAllSubscriptions: () => releasedSubscriptions++,
              }),
            },
            createConfig: { sessionManager: controller },
            load: {
              sessionManager: controller,
              requestSessionReplay: async (sessionId, options) => {
                replayRequests++;
                return replayTransport.requestWorkbuddySessionReplay({
                  runtimeManager: {
                    getHostEndpoint: async () => promptBackend.origin,
                  },
                  sessionId,
                  ...options,
                });
              },
            },
          },
        });
        assert.ok(controller.runtimeReclaimJanitorTimer);
        await controller.runtimeReclaimPromise;
        await registeredHandlers.get(
          hostRuntime.SESSION_RUNTIME_ROUTE_STATE_CHANNEL,
        )({ taskId: expectedSessionId });
        hostAttachment.scheduleRuntimeSweep();
        await controller.runtimeReclaimPromise;
        assert.equal(
          controller.runtimeReclaimEligibleSince.has(expectedSessionId),
          false,
        );
        disconnected();
        assert.equal(releasedSubscriptions, 1);
        const loadRpc = registeredHandlers.get(
          hostRuntime.SESSION_RPC_CHANNELS.LOAD,
        );
        const replayLoaded = await loadRpc(expectedSessionId, { cwd: root });
        assert.equal(
          replayLoaded.rendererHistoryReplayComplete,
          true,
          JSON.stringify({ replayLoaded, warnings }),
        );
        assert.equal(replayLoaded.id, expectedSessionId);
        assert.equal(replayLoaded.status, "completed");
        assert.equal(replayLoaded.mode, session.desiredConfig.mode);
        assert.ok(replayLoaded.replayTiming.bytes > 0);
        assert.equal(replayRequests, 1);
        assert.ok(
          rpcPublications.some(
            (p) => p.payload.update?.sessionUpdate === "agent_message_chunk",
          ),
        );
        assert.ok(
          rpcPublications.every(
            (p) =>
              p.payload._meta?.["codebuddy.ai/rendererHistoryReplay"] === true,
          ),
        );
        const syntheticTimeout = setTimeout(
          () => resolveSynthetic({ timeout: true }),
          2000,
        );
        try {
          const completion = await synthetic;
          assert.equal(completion.response?.stopReason, "end_turn");
        } finally {
          clearTimeout(syntheticTimeout);
        }
        const storedLoad = await loadRpc(expectedSessionId, { cwd: root });
        assert.equal(storedLoad.rendererHistoryReplayComplete, true);
        assert.equal(replayRequests, 1);
        const unauthorizedReplay = await fetch(
          `${promptBackend.origin}/api/v1/sessions/${expectedSessionId}/replay`,
          { headers: { "X-CodeBuddy-Request": "1" } },
        );
        assert.equal(unauthorizedReplay.status, 401);
        await controller.flushSessionEffects(expectedSessionId);
        assert.equal(session.ownerHistoryHydrated, true);
        assert.equal(session.taskState.terminalOutcome, "completed");
        assert.ok(
          session.eventHistory.every(
            (p) => p._meta?.["codebuddy.ai"]?.mode === "history",
          ),
        );
        assert.equal(
          controller.getLatestToolResultByName(expectedSessionId, "TaskList")
            .status,
          "completed",
        );
        assert.ok(
          session.planSnapshot.update.entries.some(
            (e) => e.content === "Owned plan task",
          ),
        );
        assert.equal(
          controller.primedReplayStates.has(expectedSessionId),
          false,
        );
        const publicationStart = backendUpdates.length;
        const loaded = await controller.loadSession(expectedSessionId, root, {
          forceRendererHistoryReplay: true,
        });
        assert.equal(loaded.rendererHistoryReplayComplete, true);
        assert.equal(loaded.sessionId, expectedSessionId);
        assert.equal(loaded.cwd, root);
        assert.equal(loaded.status, "completed");
        assert.equal(loaded.pendingInputKind, undefined);
        assert.equal(loaded.hasActiveToolCalls, false);
        assert.equal(loaded.isProcessing, false);
        assert.deepEqual(
          loaded.config,
          Object.fromEntries(
            Object.entries(session.desiredConfig).filter(
              ([, value]) => value !== undefined,
            ),
          ),
        );
        assert.equal(loaded.userId, session.userId);
        assert.equal(loaded.modeEpoch, session.modeEpoch);
        const publishedHistory = backendUpdates.slice(publicationStart);
        assert.ok(
          publishedHistory.some(
            (p) => p.update?.sessionUpdate === "agent_message_chunk",
          ),
        );
        assert.ok(
          publishedHistory.some((p) => p.update?.sessionUpdate === "plan"),
        );
        assert.ok(
          publishedHistory.every(
            (p) => p._meta?.["codebuddy.ai"]?.mode === "history",
          ),
        );
        assert.equal(
          controller.hasStoredSessionHistory(expectedSessionId),
          true,
        );
        assert.equal(session.taskState.terminalOutcome, "completed");
        if (reclaimBeforeDelete) {
          const policy = { idleTimeoutMs: 1, maxActiveSessions: 0 };
          const initialSweep = await controller.reclaimInactiveSessions(policy);
          assert.equal(initialSweep.reclaimed.length, 0);
          await new Promise((resolve) => setTimeout(resolve, 10));
          const reclaimed = await controller.reclaimInactiveSessions(policy);
          assert.deepEqual(reclaimed.reclaimed, [
            {
              sessionId: expectedSessionId,
              status: "completed",
              reason: "background_idle_timeout",
            },
          ]);
          assert.equal(controller.sessions.has(expectedSessionId), false);
          assert.equal(session.pendingPromptCancelCause, "runtime_reclaim");
          assert.ok(order.includes("exited-1"));
          assert.equal(
            controller.primedReplayStates.has(expectedSessionId),
            true,
          );
          assert.ok(
            !recordDatabase.service.getSession(expectedSessionId).deletedAt,
          );
          const closedLoad = await loadRpc(expectedSessionId, { cwd: root });
          assert.equal(closedLoad.rendererHistoryReplayComplete, true);
          assert.equal(replayRequests, 1);
          assert.equal(backends.length, 2);
        }
        hostAttachment.stop();
        assert.equal(controller.runtimeReclaimJanitorTimer, undefined);
        await controller.deleteSession(expectedSessionId);
        assert.equal(controller.sessions.has(expectedSessionId), false);
        assert.ok(order.includes("exited-1"));
        await assert.rejects(
          fetch(promptBackend.origin + "/api/v1/health", {
            headers: { "x-codebuddy-request": "1" },
          }),
        );
        assert.equal(controller.deletedSessionIds.has(expectedSessionId), true);
        assert.equal(controller.pendingSessionDisposals.size, 0);
        assert.equal(
          originalManager.coordinator.policies.has(expectedSessionId),
          false,
        );
        assert.equal(session.taskState.terminalOutcome, "completed");
        assert.equal(session.hasPendingInput, false);
        assert.equal(
          controller.getSessionToolResults(expectedSessionId),
          undefined,
        );
        assert.equal(toolSnapshot.get("owned-task-list").status, "completed");
        assert.equal(taskRecords[0], "planning");
        assert.ok(
          taskRecords.includes("working"),
          "actual notifications must enter working state",
        );
        assert.equal(taskRecords.at(-1), "completed");
        assert.ok(
          taskRecords.filter((status) => status === "completed").length >= 2,
        );
        assert.equal(session.isProcessing, false);
        assert.equal(session.teamRuntime.lastCompletedTurnSeq, 2);

        assert.deepEqual(
          taskTelemetry.map((x) => [x.name, x.data.total_steps]),
          [
            ["agent_task_completed", 1],
            ["agent_task_completed", 2],
          ],
        );
        recordDatabase.reopen();
        assert.ok(
          recordDatabase.service.getSession(expectedSessionId).deletedAt,
        );
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).status,
          "completed",
        );
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).userId,
          "owned-user",
        );
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).mode,
          "craft",
        );
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).permissionMode,
          "acceptEdits",
        );
        assert.equal(
          recordDatabase.service.getSession(expectedSessionId).createdAt,
          session.createdAt,
        );
      } finally {
        hostAttachment?.stop();
        session?.noResponseWatchdog?.stop();
        await recordDatabase?.close();
        for (const b of backends) await b.destroy().catch(() => {});
        let daemonExit;
        try {
          daemonExit = await originalBackend?.close();
        } finally {
          server.closeAllConnections();
          await new Promise((r) => server.close(r));
          await rm(root, { recursive: true, force: true });
        }
        if (daemonExit) assert.deepEqual(daemonExit, { code: 0, signal: null });
      }
    },
  );
