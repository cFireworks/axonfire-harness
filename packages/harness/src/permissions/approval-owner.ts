import type { HarnessSession } from "../sessions/session.js";

/** New standalone-host ownership boundary, not a reconstructed product permission policy.
 * A lease selects which UI observes a real main-session interruption; it never approves a tool.
 * Routing follows InterruptionService's actual queue and item identity, not persisted metadata.
 */
export function createApprovalOwners<
  T extends {
    findMainSession(session: HarnessSession): HarnessSession;
    findSessionByItem(item: any): HarnessSession | undefined;
    getQueue(id: string): readonly { item: any }[];
    approve(item: any, options?: any): boolean;
  },
>(dependencies: {
  sessions: { getCachedSessions(): HarnessSession[] };
  stateMachine: { isBusy(session: HarnessSession): boolean };
  interruptions: T;
  onApproved(session: HarnessSession, item: any): void;
  isRunning?(session: HarnessSession): boolean;
  onReleased?(session: HarnessSession): void;
}) {
  let closed = false;
  const owners = new Map<
    HarnessSession,
    { token: symbol; wakeQueue?: () => void }
  >();
  function assertQuiet(session: HarnessSession) {
    if (
      dependencies.isRunning?.(session) ||
      dependencies.stateMachine.isBusy(session) ||
      session.interruptionSubject.value ||
      dependencies.interruptions.getQueue(session.id).length
    )
      throw Error(
        "Approval ownership can change only on an idle session without pending decisions",
      );
  }
  function ownsPending(source: HarnessSession, item: any) {
    const main = dependencies.interruptions.findMainSession(source);
    return (
      !closed &&
      owners.has(main) &&
      main.interruptionSubject.value === item &&
      dependencies.interruptions
        .getQueue(main.id)
        .some((entry) => entry.item === item)
    );
  }
  const bound = new Map<PropertyKey, { raw: any; value: any }>();
  const interruptionService = new Proxy(dependencies.interruptions, {
    get(target, key) {
      const raw = Reflect.get(target, key, target);
      if (typeof raw !== "function") return raw;
      if (bound.get(key)?.raw === raw) return bound.get(key)!.value;
      const value =
        key === "approve"
          ? function (item: any, options?: any) {
              const source = target.findSessionByItem(item),
                owned =
                  source &&
                  source.state &&
                  !item.rawItem.providerData?._sandboxResolve &&
                  ownsPending(source, item);
              const accepted = Reflect.apply(raw, target, [item, options]);
              // The standalone executor consumes a one-shot receipt only after the real controller accepted this exact pending item.
              if (owned && accepted) dependencies.onApproved(source!, item);
              return accepted;
            }
          : raw.bind(target);
      Object.defineProperty(value, "name", {
        value: raw.name,
        configurable: true,
      });
      Object.defineProperty(value, "length", {
        value: raw.length,
        configurable: true,
      });
      bound.set(key, { raw, value });
      return value;
    },
  });
  return {
    interruptionService,
    claim(session: HarnessSession, wakeQueue?: () => void) {
      if (closed) throw Error("Approval owner registry is closed");
      if (!dependencies.sessions.getCachedSessions().includes(session))
        throw Error(
          "Approval owner requires this backend's exact live session object",
        );
      if (dependencies.interruptions.findMainSession(session) !== session)
        throw Error("Claim the main session, not a descendant approval route");
      if (owners.has(session))
        throw Error("Session already has an approval owner");
      assertQuiet(session);
      const token = Symbol("approval-owner");
      owners.set(session, { token, ...(wakeQueue ? { wakeQueue } : {}) });
      let released = false;
      return {
        get released() {
          return released || closed;
        },
        release() {
          if (released || closed) return;
          assertQuiet(session);
          if (owners.get(session)?.token !== token)
            throw Error("Approval owner identity mismatch");
          owners.delete(session);
          released = true;
          dependencies.onReleased?.(session);
        },
      };
    },
    ownsPending,
    ownsApprovalRoute(source: HarnessSession) {
      return (
        !closed &&
        dependencies.sessions.getCachedSessions().includes(source) &&
        owners.has(dependencies.interruptions.findMainSession(source))
      );
    },
    has(session: HarnessSession) {
      return !closed && owners.has(session);
    },
    wakeQueue(session: HarnessSession) {
      if (!closed) owners.get(session)?.wakeQueue?.();
    },
    get count() {
      return owners.size;
    },
    close() {
      closed = true;
      owners.clear();
    },
  };
}
