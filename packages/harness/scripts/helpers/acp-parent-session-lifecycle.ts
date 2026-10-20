import assert from "node:assert/strict";
import * as io from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { tmpdir } from "node:os";
import { acpRendezvousSdk, rendezvousFactories } from "./acp-rendezvous-sdk.js";
import { PermissionMode } from "../../src/permissions/permission.js";

export const ACP_PARENT_RECOVERY_MODES = [
  "load",
  "resume",
  "continue",
  "fork-load",
] as const;
export const ACP_PARENT_FAILURE_MODES = [
  "missing-load",
  "missing-resume",
  "invalid-load",
  "missing-fork",
] as const;
export async function acpParentFailureLifecycle(
  mode: (typeof ACP_PARENT_FAILURE_MODES)[number],
  factories = rendezvousFactories,
) {
  const missing = mode === "missing-load" || mode === "missing-resume";
  return acpRendezvousSdk(factories, "single", {
    uuidPrefix: "failure-",
    modelLabel: mode,
    ...(missing
      ? {
          entrance: {
            method:
              mode === "missing-load" ? ("load" as const) : ("resume" as const),
            sessionId: "owned-missing",
          },
        }
      : {}),
    async run(p) {
      if (missing) {
        assert.equal(p.session.id, "owned-missing");
        assert.equal(p.session.history.length, 0);
        assert.ok(
          p.updates.every(
            (u: any) => !u.update?._meta?.["codebuddy.ai/historyReplay"],
          ),
        );
      } else if (mode === "invalid-load") {
        const error = await p.expectProtocolFailure(
          "session/load",
          -32603,
          () =>
            p.client.loadSession({
              sessionId: "../blocked",
              cwd: p.fixture.cwd,
              mcpServers: [],
            }),
        );
        assert.match(error.data.details, /Invalid session ID format/);
        assert.equal(
          p.agent.getSessionRequest().type,
          "load",
          "original failed entrance leaves request until replaced",
        );
        await p.checked(
          "valid resume after failed load",
          p.client.resumeSession({
            sessionId: p.session.id,
            cwd: p.fixture.cwd,
            mcpServers: [],
          }),
        );
        assert.equal(p.agent.getSessionRequest(), undefined);
        assert.deepEqual(
          p.httpRequests.map((r: any) => r.response.statusCode),
          [200, 500, 200],
        );
      } else {
        await assert.rejects(
          p.checked(
            "missing source fork",
            p.postInternal({
              forkSession: true,
              resume: "owned-absent-source",
              sessionId: "owned-rejected-fork",
              acp: true,
              interactive: false,
            }),
          ),
          /No conversation found/,
        );
        assert.equal(p.manager.sessionSubject.value, p.session);
        await assert.rejects(
          io.access(p.store.getSessionFilePath("owned-rejected-fork")),
        );
      }
      const reply = await p.checked(
        "usable after entrance edge",
        p.client.prompt({
          sessionId: p.session.id,
          prompt: [{ type: "text", text: "read after owned entrance edge" }],
        }),
      );
      await p.fixture.drain();
      assert.equal(reply.stopReason, "end_turn");
      assert.equal(p.modelRequests.length, 2);
      return {
        mode,
        sourceMissingCreatesEmpty: missing,
        failedForkCreatesNothing: mode === "missing-fork",
        failedLoadRecovered: mode === "invalid-load",
        usable: true,
        stopReason: reply.stopReason,
      };
    },
  });
}
export async function acpParentSessionLifecycle(
  mode: (typeof ACP_PARENT_RECOVERY_MODES)[number],
  factories = rendezvousFactories,
) {
  const root = await io.mkdtemp(join(tmpdir(), "axonfire-parent-recovery-"));
  let seedId = "",
    seedSession: any,
    seedDisk = "",
    sourcePath = "";
  const plain = (value: any) =>
    JSON.parse(JSON.stringify(value).split(root).join("<owned-root>"));
  const isReplay = (u: any) =>
    u.update?._meta?.["codebuddy.ai/historyReplay"] ||
    u.update?._meta?.["codebuddy.ai"]?.mode === "history" ||
    u._meta?.["codebuddy.ai"]?.mode === "history";
  try {
    await acpRendezvousSdk(factories, "single", {
      ownedRoot: root,
      uuidPrefix: "seed-",
      modelLabel: "seed",
      async run(p) {
        seedSession = p.session;
        seedId = p.session.id;
        const reply = await p.checked(
          "seed Read",
          p.client.prompt({
            sessionId: seedId,
            prompt: [{ type: "text", text: "owned seed read" }],
          }),
        );
        await p.fixture.drain();
        assert.equal(reply.stopReason, "end_turn");
        p.session.meta.recoveryMarker = "owned durable metadata";
        await p.checked(
          "seed plan mode",
          p.client.setSessionMode({ sessionId: seedId, modeId: "plan" }),
        );
        assert.equal(
          p.session.permissionModeSubject.value,
          PermissionMode.Plan,
        );
        await p.manager.save(p.session);
        sourcePath = p.store.getSessionFilePath(seedId);
        seedDisk = await io.readFile(sourcePath, "utf8");
        assert.match(seedDisk, /parent Read done/);
        return { seeded: true };
      },
    });
    assert.equal(
      seedSession.resultSubject.isStopped,
      true,
      "first parent resources have really closed",
    );
    const initialMethod = mode === "fork-load" ? "resume" : mode;
    return await acpRendezvousSdk(factories, "single", {
      ownedRoot: root,
      uuidPrefix: "cold-",
      modelLabel: mode,
      entrance: { method: initialMethod, sessionId: seedId },
      async run(p) {
        assert.notEqual(p.session, seedSession);
        assert.equal(p.session.id, seedId);
        assert.equal(p.session.meta.recoveryMarker, "owned durable metadata");
        assert.equal(
          p.session.state,
          undefined,
          "cold graph reconstructs history, not a shared SDK RunState",
        );
        assert.equal(p.session.resultSubject.value, undefined);
        assert.match(JSON.stringify(p.session.history), /parent Read done/);
        assert.equal(
          p.session.permissionModeSubject.value,
          PermissionMode.Default,
          "source CLI store does not persist the permissionMode Subject",
        );
        assert.equal(p.session.usage.totalTokens, 32);
        const replay = p.updates.filter(isReplay);
        if (mode === "load" || mode === "continue") {
          assert.ok(
            replay.some(
              (u: any) =>
                u.update?._meta?.["codebuddy.ai/historyReplay"] === "start",
            ),
          );
          assert.ok(
            replay.some(
              (u: any) =>
                u.update?._meta?.["codebuddy.ai/historyReplay"] === "end",
            ),
          );
          assert.match(JSON.stringify(replay), /parent Read done/);
        } else
          assert.equal(
            replay.length,
            0,
            "resume reconnects without replaying old messages",
          );
        const beforeRead = await io.readFile(sourcePath, "utf8");
        assert.equal(
          beforeRead,
          seedDisk,
          "connecting does not append a synthetic user turn",
        );
        let current = p.session;
        let fork: any;
        let metadataBeforeFork: string | undefined;
        if (mode === "fork-load") {
          metadataBeforeFork = await io.readFile(
            sourcePath.replace(/\.jsonl$/, ".meta.json"),
            "utf8",
          );
          await p.expectProtocolFailure("session/fork", -32601, () =>
            p.client.unstable_forkSession({
              sessionId: seedId,
              cwd: p.fixture.cwd,
            }),
          );
          const forkId = "owned-http-fork";
          await p.checked(
            "native internal HTTP fork",
            p.postInternal({
              forkSession: true,
              resume: seedId,
              sessionId: forkId,
              interactive: false,
              acp: true,
            }),
          );
          const created = p.manager.sessionSubject.value;
          assert.equal(created.id, forkId);
          assert.equal(created.meta.forkedFrom, seedId);
          assert.equal(await io.readFile(sourcePath, "utf8"), seedDisk);
          assert.equal(
            await io.readFile(
              sourcePath.replace(/\.jsonl$/, ".meta.json"),
              "utf8",
            ),
            metadataBeforeFork,
          );
          await p.checked(
            "ACP attach fork",
            p.client.loadSession({
              sessionId: forkId,
              cwd: p.fixture.cwd,
              mcpServers: [],
            }),
          );
          current = p.host.getEntry(p.agent.getConnectionId()).session;
          assert.equal(current, created);
          assert.equal(current.id, forkId);
          assert.equal(p.host.iteratorCount, 1);
          assert.deepEqual(
            p.httpRequests.map((r: any) => r.response.writableEnded),
            [false, true, true],
          );
          fork = {
            id: forkId,
            sourceUnchanged: true,
            unsupportedProtocolFork: true,
            oneIterator: true,
          };
        }
        const reply = await p.checked(
          "cold next prompt",
          p.client.prompt({
            sessionId: current.id,
            prompt: [
              { type: "text", text: "continue from owned disk history" },
            ],
          }),
        );
        await p.fixture.drain();
        assert.equal(reply.stopReason, "end_turn");
        assert.ok(
          p.modelRequests.every((r: any) => r.sessionId === current.id),
        );
        assert.match(
          JSON.stringify(p.modelRequests[0].input),
          /parent Read done/,
        );
        const newDisk = await io.readFile(
          p.store.getSessionFilePath(current.id),
          "utf8",
        );
        assert.ok(newDisk.length > seedDisk.length);
        if (mode === "fork-load") {
          assert.equal(await io.readFile(sourcePath, "utf8"), seedDisk);
          assert.equal(
            await io.readFile(
              sourcePath.replace(/\.jsonl$/, ".meta.json"),
              "utf8",
            ),
            metadataBeforeFork,
          );
        }
        return {
          mode,
          coldObject: true,
          marker: true,
          sourceModeAfterCold: p.session.permissionModeSubject.value,
          seedUsage: 32,
          currentUsage: current.usage.totalTokens,
          replay: plain(replay),
          fork,
          stopReason: reply.stopReason,
          persisted: true,
        };
      },
    });
  } finally {
    if (
      dirname(root) !== tmpdir() ||
      !basename(root).startsWith("axonfire-parent-recovery-")
    )
      throw Error("Invalid owned recovery cleanup target");
    await io.rm(root, { recursive: true, force: true });
  }
}
