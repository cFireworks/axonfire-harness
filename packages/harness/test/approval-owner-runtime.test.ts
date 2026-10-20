import test from "node:test";
import assert from "node:assert/strict";
import { createApprovalOwners } from "../src/permissions/approval-owner.js";
import { HarnessSession } from "../src/sessions/session.js";
function fixture() {
  const main = new HarnessSession("main"),
    child = new HarnessSession("child"),
    foreign = new HarnessSession("main"),
    queue: any[] = [],
    receipts: any[] = [],
    item: any = { rawItem: { type: "function_call", callId: "owned" } },
    sessions = [main, child];
  let busy = false,
    accepted = true;
  main.state = {} as any;
  child.state = {} as any;
  const interruptions = {
    findMainSession: (session: HarnessSession) =>
      session === child ? main : session,
    findSessionByItem: (value: any) => (value === item ? child : undefined),
    getQueue: () => queue,
    approve(value: any) {
      assert.equal(this, interruptions);
      return value === item && accepted;
    },
    receiver() {
      return this;
    },
  };
  const owners = createApprovalOwners({
    sessions: { getCachedSessions: () => sessions },
    stateMachine: { isBusy: () => busy },
    interruptions,
    onApproved: (...args) => receipts.push(args),
  });
  return {
    main,
    child,
    foreign,
    item,
    queue,
    receipts,
    owners,
    interruptions,
    setBusy: (value: boolean) => (busy = value),
    setAccepted: (value: boolean) => (accepted = value),
    show() {
      main.interruptionSubject.next(item);
      queue.push({ item });
    },
    hide() {
      main.interruptionSubject.next(undefined);
      queue.length = 0;
    },
  };
}
test("approval lease requires exact live main object, rejects duplicate, and does not persist metadata", () => {
  const f = fixture();
  assert.throws(() => f.owners.claim(f.foreign), /exact live/);
  assert.throws(() => f.owners.claim(f.child), /main session/);
  const lease = f.owners.claim(f.main);
  assert.throws(() => f.owners.claim(f.main), /already/);
  assert.deepEqual(f.main.meta, {});
  lease.release();
  lease.release();
  assert.equal(f.owners.count, 0);
});
test("approval lease cannot be acquired or released across busy/pending boundaries", () => {
  const f = fixture();
  f.setBusy(true);
  assert.throws(() => f.owners.claim(f.main), /idle/);
  f.setBusy(false);
  const lease = f.owners.claim(f.main);
  f.show();
  assert.throws(() => lease.release(), /idle/);
  f.hide();
  f.setBusy(true);
  assert.throws(() => lease.release(), /idle/);
  f.setBusy(false);
  lease.release();
});
test("descendant routing requires exact main interruption identity and real queue membership", () => {
  const f = fixture();
  const lease = f.owners.claim(f.main);
  f.show();
  assert.equal(f.owners.ownsPending(f.child, f.item), true);
  assert.equal(f.owners.ownsPending(f.child, { ...f.item }), false);
  f.queue.length = 0;
  assert.equal(f.owners.ownsPending(f.child, f.item), false);
  f.hide();
  lease.release();
});
test("one-shot executor receipt follows accepted original approval, not a client outcome alone", () => {
  const f = fixture();
  f.owners.claim(f.main);
  f.show();
  f.setAccepted(false);
  assert.equal(f.owners.interruptionService.approve(f.item), false);
  assert.equal(f.receipts.length, 0);
  f.setAccepted(true);
  assert.equal(f.owners.interruptionService.approve(f.item), true);
  assert.deepEqual(f.receipts, [[f.child, f.item]]);
});
test("unowned, stale, stateless and sandbox resolutions never create SDK executor receipts", () => {
  for (const kind of ["unowned", "stale", "stateless", "sandbox"]) {
    const f = fixture();
    if (kind !== "unowned") f.owners.claim(f.main);
    f.show();
    if (kind === "stale") f.hide();
    if (kind === "stateless") delete f.child.state;
    if (kind === "sandbox")
      f.item.rawItem.providerData = { _sandboxResolve: () => {} };
    f.owners.interruptionService.approve(f.item);
    assert.equal(f.receipts.length, 0, kind);
  }
});
test("approval adapter preserves original receivers, method identity and arity", () => {
  const f = fixture();
  assert.equal(f.owners.interruptionService.receiver(), f.interruptions);
  assert.equal(
    f.owners.interruptionService.approve,
    f.owners.interruptionService.approve,
  );
  assert.equal(
    f.owners.interruptionService.approve.length,
    f.interruptions.approve.length,
  );
  assert.equal(
    f.owners.interruptionService.approve.name,
    f.interruptions.approve.name,
  );
});
test("registry close invalidates leases without creating a persisted bypass", () => {
  const f = fixture();
  const lease = f.owners.claim(f.main);
  f.owners.close();
  assert.equal(lease.released, true);
  lease.release();
  assert.equal(f.owners.count, 0);
  assert.throws(() => f.owners.claim(f.main), /closed/);
  f.show();
  assert.equal(f.owners.ownsPending(f.child, f.item), false);
});
