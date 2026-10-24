// @ts-nocheck
// Complete original event history deduplication, hydration and scoped publication methods.
export const SESSION_HISTORY_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_HISTORY_MEMBERS = [
  ["recordSessionEvent", 4685482, 4688357],
  ["handleHistoryReplayBoundary", 4746783, 4747324],
  ["handleHistoryReplayCompletion", 4747326, 4747726],
  ["finishHistoryHydrationAfterBackendReplay", 4747728, 4748538],
  ["emitOrBufferScopedEvent", 4685204, 4685480],
  ["subscribeSessionEvents", 4684736, 4685202],
  ["updatePromptHistoryState", 4688359, 4688823],
  ["beginHistoryHydration", 4745823, 4746163],
  ["finishHistoryHydration", 4746165, 4746781],
  ["shouldBufferScopedEventDuringHistoryHydration", 4745584, 4745821],
  ["emitScoped", 4684327, 4684595],
] as const;
export const SESSION_HISTORY_FUNCTIONS = [
  ["getOwnerHistoryMode", 4791857, 4792086],
  ["getOwnerHistoryOffset", 4791443, 4791856],
  ["getOwnerHistoryUserMessageId", 4789551, 4789921],
  ["isSyntheticOwnerHistoryEvent", 4789922, 4790102],
  ["cloneSessionPayload", 4782942, 4783017],
  ["getOwnerHistoryInterruptionRequestKey", 4790911, 4791222],
  ["getOwnerHistoryInterruptionResolutionKey", 4790594, 4790910],
  ["getHistoryReplayPhase", 4792087, 4792612],
  ["isCompactInternalEventPayload", 4794051, 4794566],
  ["isSessionSeparatorEventPayload", 4794567, 4795035],
] as const;
export function attachNativeSessionHistory(
  controller: any,
  deps: any = {},
): any {
  function getOwnerHistoryMode(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const mode = meta.mode;
	return mode === "history" || mode === "stream" ? mode : null;
}
  function getOwnerHistoryOffset(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const rawOffset = meta.offset;
	if (typeof rawOffset === "number" && Number.isFinite(rawOffset)) return rawOffset;
	if (typeof rawOffset === "string") {
		const parsed = Number.parseInt(rawOffset, 10);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}
  function getOwnerHistoryUserMessageId(payload) {
	if (payload.update?.sessionUpdate !== "user_message_chunk") return null;
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const messageId = meta.messageId ?? meta.userMessageId;
	return typeof messageId === "string" && messageId.trim().length > 0 ? messageId : null;
}
  function isSyntheticOwnerHistoryEvent(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	return !!meta && typeof meta === "object" && meta.syntheticOwnerHistory === true;
}
  function cloneSessionPayload(payload) {
	return structuredClone(payload);
}
  function getOwnerHistoryInterruptionRequestKey(payload) {
	const type = typeof payload.type === "string" ? payload.type : null;
	const toolCallId = typeof payload.toolCallId === "string" ? payload.toolCallId : null;
	if (type !== "questionRequest" || !toolCallId) return null;
	return `${type}:${toolCallId}`;
}
  function getOwnerHistoryInterruptionResolutionKey(payload) {
	const type = typeof payload.type === "string" ? payload.type : null;
	const toolCallId = typeof payload.toolCallId === "string" ? payload.toolCallId : null;
	if (type !== "questionCancelled" || !toolCallId) return null;
	return `${type}:${toolCallId}`;
}
  function getHistoryReplayPhase(payload) {
	const notificationMeta = payload._meta;
	const updateMeta = typeof payload.update?._meta === "object" ? payload.update._meta : void 0;
	const candidates = [
		updateMeta?.["codebuddy.ai/historyReplay"],
		notificationMeta?.["codebuddy.ai/historyReplay"],
		(updateMeta?.["codebuddy.ai"])?.historyReplay,
		(notificationMeta?.["codebuddy.ai"])?.historyReplay
	];
	for (const candidate of candidates) if (candidate === "start" || candidate === "end") return candidate;
	return null;
}
  function isCompactInternalEventPayload(payload) {
	const updateMeta = payload.update?._meta;
	const notifMeta = payload._meta;
	if (updateMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if (notifMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if ((updateMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if ((notifMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true) return true;
	return isSessionSeparatorEventPayload(payload);
}
  function isSessionSeparatorEventPayload(payload) {
	const updateMeta = payload.update?._meta;
	const notifMeta = payload._meta;
	if (updateMeta?.isSessionSeparator === true || notifMeta?.isSessionSeparator === true) return true;
	const updateNested = updateMeta?.["codebuddy.ai"];
	const notifNested = notifMeta?.["codebuddy.ai"];
	if (updateNested?.isSessionSeparator === true) return true;
	if (notifNested?.isSessionSeparator === true) return true;
	return false;
}
  class NativeSessionHistory {
    recordSessionEvent(session, payload, options) {
      if (!options?.isReplay) this.updatePromptHistoryState(session, payload);
      if (payload.update) {
        const offset =
          getOwnerHistoryMode(payload) === "stream"
            ? null
            : getOwnerHistoryOffset(payload);
        if (offset !== null) {
          if (
            session.eventHistory.findIndex(
              (existing) => getOwnerHistoryOffset(existing) === offset,
            ) >= 0
          )
            return "duplicate";
        }
        const userMessageId = getOwnerHistoryUserMessageId(payload);
        if (userMessageId) {
          const existingIndex = session.eventHistory.findIndex(
            (existing) =>
              getOwnerHistoryUserMessageId(existing) === userMessageId,
          );
          if (existingIndex >= 0) {
            const existing = session.eventHistory[existingIndex];
            const existingSynthetic = isSyntheticOwnerHistoryEvent(existing);
            const incomingSynthetic = isSyntheticOwnerHistoryEvent(payload);
            if (existingSynthetic && !incomingSynthetic) {
              session.eventHistory[existingIndex] =
                cloneSessionPayload(payload);
              return "replaced";
            }
            return "duplicate";
          }
        }
      }
      const interruptionRequestKey =
        getOwnerHistoryInterruptionRequestKey(payload);
      if (interruptionRequestKey) {
        const existingIndex = session.eventHistory.findIndex(
          (existing) =>
            getOwnerHistoryInterruptionRequestKey(existing) ===
            interruptionRequestKey,
        );
        if (existingIndex >= 0) {
          const existing = session.eventHistory[existingIndex];
          const existingMode = getOwnerHistoryMode(existing);
          const incomingMode = getOwnerHistoryMode(payload);
          if (existingMode === "history" && incomingMode === "stream") {
            session.eventHistory[existingIndex] = cloneSessionPayload(payload);
            return "replaced";
          }
          return "duplicate";
        }
      }
      const interruptionResolutionKey =
        getOwnerHistoryInterruptionResolutionKey(payload);
      if (interruptionResolutionKey) {
        const existingIndex = session.eventHistory.findIndex(
          (existing) =>
            getOwnerHistoryInterruptionResolutionKey(existing) ===
            interruptionResolutionKey,
        );
        if (existingIndex >= 0) {
          session.eventHistory[existingIndex] = cloneSessionPayload(payload);
          return "replaced";
        }
      }
      if (payload.update) {
        const update = payload.update;
        if (update.sessionUpdate === "tool_call_update") {
          const toolCallId = update.toolCallId;
          const hasStatus = update.status !== void 0;
          if (toolCallId && !hasStatus)
            for (let i = session.eventHistory.length - 1; i >= 0; i--) {
              const eu = session.eventHistory[i].update;
              if (!eu) continue;
              if (
                eu.sessionUpdate === "tool_call_update" &&
                eu.toolCallId === toolCallId &&
                eu.status === void 0
              ) {
                session.eventHistory[i] = cloneSessionPayload(payload);
                return "replaced";
              }
              if (
                eu.sessionUpdate === "tool_call" ||
                eu.sessionUpdate === "tool_call_update"
              )
                break;
            }
        }
      }
      session.eventHistory.push(cloneSessionPayload(payload));
      return "added";
    }
    handleHistoryReplayBoundary(session, notification) {
      if (getOwnerHistoryMode(notification) === "history")
        session.sawHistoryReplayContent = true;
      if (getHistoryReplayPhase(notification) === "start") {
        session.sawHistoryReplayStart = true;
        if (session.historyHydrationFallbackHandle) {
          clearTimeout(session.historyHydrationFallbackHandle);
          session.historyHydrationFallbackHandle = void 0;
        }
        if (session.historyHydrationDepth <= 0)
          this.beginHistoryHydration(session);
        session.awaitingHistoryReplayEnd = true;
      }
    }
    handleHistoryReplayCompletion(session, notification) {
      if (
        getHistoryReplayPhase(notification) !== "end" ||
        !session.awaitingHistoryReplayEnd
      )
        return;
      if (session.historyHydrationFallbackHandle) {
        clearTimeout(session.historyHydrationFallbackHandle);
        session.historyHydrationFallbackHandle = void 0;
      }
      session.awaitingHistoryReplayEnd = false;
      this.finishHistoryHydration(session);
    }
    finishHistoryHydrationAfterBackendReplay(session) {
      if (session.awaitingHistoryReplayEnd && !session.sawHistoryReplayStart) {
        if (session.sawHistoryReplayContent) {
          session.awaitingHistoryReplayEnd = false;
          this.finishHistoryHydration(session);
          return;
        }
        if (session.historyHydrationFallbackHandle)
          clearTimeout(session.historyHydrationFallbackHandle);
        session.historyHydrationFallbackHandle = setTimeout(() => {
          session.historyHydrationFallbackHandle = void 0;
          if (
            session.awaitingHistoryReplayEnd &&
            !session.sawHistoryReplayStart
          ) {
            session.awaitingHistoryReplayEnd = false;
            this.finishHistoryHydration(session);
          }
        }, 50);
        return;
      }
      if (
        !session.awaitingHistoryReplayEnd &&
        session.historyHydrationDepth > 0
      )
        this.finishHistoryHydration(session);
    }
    emitOrBufferScopedEvent(session, payload) {
      if (
        this.shouldBufferScopedEventDuringHistoryHydration(session, payload)
      ) {
        session.bufferedScopedEventsDuringHistoryHydration.push(
          cloneSessionPayload(payload),
        );
        return;
      }
      this.emitScoped(session.sessionId, payload);
    }
    subscribeSessionEvents(sessionId, listener) {
      let listeners = this.scopedEventListeners.get(sessionId);
      if (!listeners) {
        listeners = /* @__PURE__ */ new Set();
        this.scopedEventListeners.set(sessionId, listeners);
      }
      listeners.add(listener);
      return () => {
        const current = this.scopedEventListeners.get(sessionId);
        if (!current) return;
        current.delete(listener);
        if (current.size === 0) this.scopedEventListeners.delete(sessionId);
      };
    }
    updatePromptHistoryState(session, payload) {
      if (isCompactInternalEventPayload(payload)) {
        session.hasUserMessageSinceLastCompact = false;
        session.lastUserPromptExpertSelection = void 0;
        this.enqueueSessionEffect(session, async () => {
          await this.persistLastUserPromptExpertSelection(session, null);
        }).catch(() => {});
        return;
      }
      if (payload.update?.sessionUpdate === "user_message_chunk")
        session.hasUserMessageSinceLastCompact = true;
    }
    beginHistoryHydration(session) {
      if (session.historyHydrationDepth === 0)
        session.bufferedScopedEventsDuringHistoryHydration.length = 0;
      if (session.historyHydrationFallbackHandle) {
        clearTimeout(session.historyHydrationFallbackHandle);
        session.historyHydrationFallbackHandle = void 0;
      }
      session.historyHydrationDepth += 1;
    }
    finishHistoryHydration(session) {
      session.historyHydrationDepth = Math.max(
        0,
        session.historyHydrationDepth - 1,
      );
      if (session.historyHydrationDepth > 0) return;
      if (session.historyHydrationFallbackHandle) {
        clearTimeout(session.historyHydrationFallbackHandle);
        session.historyHydrationFallbackHandle = void 0;
      }
      session.awaitingHistoryReplayEnd = false;
      session.sawHistoryReplayStart = false;
      session.sawHistoryReplayContent = false;
      const buffered =
        session.bufferedScopedEventsDuringHistoryHydration.splice(0);
      for (const payload of buffered)
        this.emitScoped(session.sessionId, payload);
    }
    shouldBufferScopedEventDuringHistoryHydration(session, payload) {
      if (session.historyHydrationDepth <= 0) return false;
      if (!payload || typeof payload !== "object") return true;
      return getOwnerHistoryMode(payload) !== "history";
    }
    emitScoped(sessionId, payload) {
      this.pushEvent(`session:event:${sessionId}`, payload);
      const listeners = this.scopedEventListeners.get(sessionId);
      if (listeners && listeners.size > 0)
        for (const listener of listeners)
          try {
            listener(payload);
          } catch {}
    }
  }
  for (const name of [
    "recordSessionEvent",
    "handleHistoryReplayBoundary",
    "handleHistoryReplayCompletion",
    "finishHistoryHydrationAfterBackendReplay",
    "emitOrBufferScopedEvent",
    "subscribeSessionEvents",
    "updatePromptHistoryState",
    "beginHistoryHydration",
    "finishHistoryHydration",
    "shouldBufferScopedEventDuringHistoryHydration",
    "emitScoped",
  ])
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(NativeSessionHistory.prototype, name),
    );
  controller.scopedEventListeners ??= new Map();
  for (const name of ["pushEvent"])
    if (deps[name] !== undefined) controller[name] = deps[name];
  return controller;
}
