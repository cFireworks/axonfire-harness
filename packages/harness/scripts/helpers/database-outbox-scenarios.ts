import assert from "node:assert/strict";
import {
  databaseFixture,
  type DatabaseServiceFactory,
} from "./database-service-scenarios.js";
const row = (id: string, patch: any = {}) => ({
  id,
  dedupeKey: id,
  channel: "wechatmp",
  automationId: "auto",
  runId: "run",
  automationName: "Owned",
  payloadJson: "{}",
  status: "pending",
  attemptCount: 0,
  maxAttempts: 5,
  nextRunAt: 10,
  createdAt: 1,
  updatedAt: 1,
  ...patch,
});
const get = (db: any, id: string) =>
  db.getAutomationDeliveryOutboxByDedupeKey(id);
export const databaseOutboxScenarios: Array<
  [string, (factory: DatabaseServiceFactory) => Promise<void>]
> = [
  [
    "dedupe preserves first payload and claim orders due rows without enforcing attempt budget",
    (factory) =>
      databaseFixture(factory, ({ db }: any) => {
        db.initialize();
        db.enqueueAutomationDeliveryOutbox(
          row("a", { payloadJson: "first", createdAt: 2 }),
        );
        const duplicate = db.enqueueAutomationDeliveryOutbox(
          row("different", { dedupeKey: "a", payloadJson: "second" }),
        );
        assert.equal(duplicate.id, "a");
        assert.equal(duplicate.payloadJson, "first");
        db.enqueueAutomationDeliveryOutbox(
          row("b", { createdAt: 1, maxAttempts: 0, attemptCount: 99 }),
        );
        db.enqueueAutomationDeliveryOutbox(row("future", { nextRunAt: 100 }));
        assert.equal(db.getNextAutomationDeliveryOutboxRunAt(), 10);
        assert.deepEqual(
          db
            .claimAutomationDeliveryOutbox(10, "w", 50, 0)
            .map((r: any) => r.id),
          ["b"],
        );
        assert.equal(get(db, "b").attemptCount, 99);
        assert.deepEqual(
          db
            .claimAutomationDeliveryOutbox(10, "w", 50, 5)
            .map((r: any) => r.id),
          ["a"],
        );
        assert.equal(db.getNextAutomationDeliveryOutboxRunAt(), 100);
      }),
  ],
  [
    "second connection wins between selection and conditional update without double claiming",
    (factory) =>
      databaseFixture(factory, ({ db, create }: any) => {
        db.initialize();
        db.enqueueAutomationDeliveryOutbox(row("race"));
        const other = create();
        other.initialize();
        const original = db.rawSqliteDb.prepare;
        let armed = true,
          won: any[] = [];
        db.rawSqliteDb.prepare = function (query: string) {
          const target = original.call(this, query);
          let proxy: any;
          proxy = new Proxy(target, {
            get(t, key) {
              const value = Reflect.get(t, key, t);
              if (typeof value !== "function") return value;
              return (...args: any[]) => {
                const result = value.apply(t, args);
                if (
                  key === "all" &&
                  armed &&
                  query.startsWith("select") &&
                  query.includes('"automation_delivery_outbox"')
                ) {
                  armed = false;
                  won = other.claimAutomationDeliveryOutbox(
                    10,
                    "winner",
                    50,
                    1,
                  );
                }
                return result === t ? proxy : result;
              };
            },
          });
          return proxy;
        };
        try {
          assert.deepEqual(
            db.claimAutomationDeliveryOutbox(10, "loser", 50, 1),
            [],
          );
          assert.equal(armed, false);
          assert.deepEqual(
            won.map((r: any) => r.id),
            ["race"],
          );
          assert.equal(get(db, "race").leaseOwner, "winner");
        } finally {
          db.rawSqliteDb.prepare = original;
        }
      }),
  ],
  [
    "owner guards success/failure and authorization deferral can preserve attempt count",
    (factory) =>
      databaseFixture(factory, ({ db }: any) => {
        db.initialize();
        db.enqueueAutomationDeliveryOutbox(row("a"));
        db.claimAutomationDeliveryOutbox(10, "w1", 30, 1);
        assert.equal(
          db.markAutomationDeliverySucceeded("a", "wrong", "d", 11),
          false,
        );
        assert.equal(
          db.markAutomationDeliveryFailed("a", "wrong", {
            status: "abandoned",
            now: 11,
          }),
          false,
        );
        assert.equal(
          db.markAutomationDeliveryFailed("a", "w1", {
            status: "pending_auth",
            incrementAttempt: false,
            nextRunAt: 20,
            errorCode: "auth",
            now: 12,
          }),
          true,
        );
        assert.equal(get(db, "a").attemptCount, 0);
        assert.equal(get(db, "a").leaseOwner, undefined);
        assert.deepEqual(db.claimAutomationDeliveryOutbox(19, "w2", 40, 1), []);
        db.claimAutomationDeliveryOutbox(20, "w2", 40, 1);
        db.markAutomationDeliveryFailed("a", "w2", {
          status: "retry_waiting",
          nextRunAt: 25,
          errorCode: "network",
          errorMessage: "owned",
          now: 21,
        });
        assert.equal(get(db, "a").attemptCount, 1);
        db.claimAutomationDeliveryOutbox(25, "w3", 50, 1);
        assert.equal(
          db.markAutomationDeliverySucceeded("a", "w3", "delivery", 26),
          true,
        );
        const r = get(db, "a");
        assert.equal(r.status, "succeeded");
        assert.equal(r.attemptCount, 2);
        assert.equal(r.deliveryId, "delivery");
        assert.equal(r.lastErrorCode, undefined);
        assert.equal(r.finishedAt, 26);
        assert.equal(
          db.markAutomationDeliverySucceeded("a", "w3", "again", 27),
          false,
        );
      }),
  ],
  [
    "expired lease becomes manual-required and survives reopen without automatic redelivery",
    (factory) =>
      databaseFixture(factory, ({ db, create }: any) => {
        db.initialize();
        db.enqueueAutomationDeliveryOutbox(row("expired"));
        db.enqueueAutomationDeliveryOutbox(
          row("later", {
            status: "in_flight",
            leaseOwner: "x",
            leaseExpireAt: 100,
          }),
        );
        db.enqueueAutomationDeliveryOutbox(
          row("no-lease", { status: "in_flight", leaseOwner: "x" }),
        );
        db.claimAutomationDeliveryOutbox(10, "w", 20, 1);
        assert.equal(db.reclaimStuckAutomationDeliveries(19, 10), 0);
        assert.equal(db.reclaimStuckAutomationDeliveries(20, 0), 1);
        db.dispose();
        const next = create();
        next.initialize();
        const r = get(next, "expired");
        assert.equal(r.status, "manual_required");
        assert.equal(r.lastErrorCode, "lease_expired_ambiguous");
        assert.equal(r.attemptCount, 0);
        assert.equal(r.finishedAt, 20);
        assert.equal(r.leaseOwner, undefined);
        assert.deepEqual(
          next.claimAutomationDeliveryOutbox(50, "new", 70, 10),
          [],
        );
        assert.equal(get(next, "no-lease").status, "in_flight");
      }),
  ],
  [
    "terminal cleanup applies age first then failure retention within one shared limit",
    (factory) =>
      databaseFixture(factory, ({ db }: any) => {
        db.initialize();
        for (const r of [
          row("old-success", { status: "succeeded", finishedAt: 10 }),
          row("old-skip", { status: "skipped", finishedAt: 20 }),
          row("boundary", { status: "succeeded", finishedAt: 30 }),
          row("pending-finished", { finishedAt: 1 }),
          row("unfinished", { status: "manual_required" }),
          ...[50, 60, 70, 80].map((n) =>
            row("failed-" + n, {
              status: n === 60 ? "abandoned" : "manual_required",
              finishedAt: n,
            }),
          ),
        ])
          db.enqueueAutomationDeliveryOutbox(r);
        const params = {
          succeededFinishedBefore: 30,
          failedFinishedBefore: 0,
          failedRetainLimit: 2,
          limit: 2,
        };
        assert.equal(db.cleanupTerminalAutomationDeliveries(params), 2);
        assert.equal(get(db, "old-success"), undefined);
        assert.equal(get(db, "old-skip"), undefined);
        assert.ok(get(db, "failed-50"));
        assert.equal(db.cleanupTerminalAutomationDeliveries(params), 2);
        assert.equal(get(db, "failed-50"), undefined);
        assert.equal(get(db, "failed-60"), undefined);
        assert.ok(get(db, "failed-70"));
        assert.ok(get(db, "failed-80"));
        assert.ok(get(db, "boundary"));
        assert.ok(get(db, "pending-finished"));
        assert.ok(get(db, "unfinished"));
        assert.equal(db.cleanupTerminalAutomationDeliveries(params), 0);
      }),
  ],
  [
    "supersession requires matching automation/channel/owner/host but ignores newer status",
    (factory) =>
      databaseFixture(factory, ({ db }: any) => {
        db.initialize();
        const candidate = db.enqueueAutomationDeliveryOutbox(
          row("a", { ownerUserId: "u", hostId: "h", createdAt: 10 }),
        );
        db.enqueueAutomationDeliveryOutbox(
          row("wrong-owner", { ownerUserId: "v", hostId: "h", createdAt: 20 }),
        );
        db.enqueueAutomationDeliveryOutbox(
          row("wrong-host", { ownerUserId: "u", hostId: "j", createdAt: 20 }),
        );
        db.enqueueAutomationDeliveryOutbox(
          row("equal", { ownerUserId: "u", hostId: "h", createdAt: 10 }),
        );
        assert.equal(db.hasNewerAutomationDeliveryOutbox(candidate), false);
        db.enqueueAutomationDeliveryOutbox(
          row("newer", {
            ownerUserId: "u",
            hostId: "h",
            createdAt: 11,
            status: "abandoned",
          }),
        );
        assert.equal(db.hasNewerAutomationDeliveryOutbox(candidate), true);
        const unowned = db.enqueueAutomationDeliveryOutbox(
          row("unowned", { createdAt: 1 }),
        );
        assert.equal(db.hasNewerAutomationDeliveryOutbox(unowned), false);
        db.enqueueAutomationDeliveryOutbox(
          row("unowned-new", { createdAt: 2 }),
        );
        assert.equal(db.hasNewerAutomationDeliveryOutbox(unowned), true);
      }),
  ],
];
