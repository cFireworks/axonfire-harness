import * as realCrypto from "node:crypto";
export const SESSION_PROMPT_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_PROMPT_METHODS = [
  ["enrichPromptMeta", 4665811, 4666438],
  ["composePromptForBackend", 4666440, 4667314],
  ["recordSessionEvent", 4685482, 4688357],
  ["updatePromptHistoryState", 4688359, 4688823],
  ["recordSyntheticUserPromptEvent", 4688825, 4690388],
  ["persistLastUserPromptExpertSelection", 4713542, 4714180],
  ["enqueueSessionEffect", 4714182, 4714631],
  ["flushSessionEffects", 4715690, 4715803],
] as const;
export const SESSION_PROMPT_FUNCTIONS = [
  ["readCodebuddyMeta", 4570610, 4570738],
  ["readProjectId", 4573214, 4573399],
  ["cloneSessionPayload", 4782942, 4783017],
  ["getOwnerHistoryUserMessageId", 4789551, 4789921],
  ["isSyntheticOwnerHistoryEvent", 4789922, 4790102],
  ["getOwnerHistoryInterruptionResolutionKey", 4790594, 4790910],
  ["getOwnerHistoryInterruptionRequestKey", 4790911, 4791222],
  ["getOwnerHistoryOffset", 4791443, 4791856],
  ["getOwnerHistoryMode", 4791857, 4792086],
  ["sessionHasPriorUserMessages", 4793082, 4793179],
  ["toExpertSelectionIdentity", 4793180, 4793417],
  ["toPersistedExpertSelectionState", 4793418, 4793550],
  ["fromPersistedExpertSelectionState", 4793551, 4793687],
  ["isCompactInternalEventPayload", 4794051, 4794566],
  ["isSessionSeparatorEventPayload", 4794567, 4795035],
] as const;
// Eight complete original methods, NOT a claim to have restored the entire Desktop SessionManager.
export function createNativeSessionPrompt(runtime: any = {}) {
  const Object: any = globalThis.Object,
    node_crypto: any = runtime.crypto ?? realCrypto;
  function readCodebuddyMeta(meta: any): any {
    const raw: any = meta?.["codebuddy.ai"];
    return raw && typeof raw === "object" ? raw : void 0;
  }
  function readProjectId(meta: any): any {
    const projectId: any = readCodebuddyMeta(meta)?.projectId;
    return typeof projectId === "string" && projectId.trim().length > 0
      ? projectId.trim()
      : void 0;
  }
  function cloneSessionPayload(payload: any): any {
    return structuredClone(payload);
  }
  function getOwnerHistoryUserMessageId(payload: any): any {
    if (payload.update?.sessionUpdate !== "user_message_chunk") return null;
    const meta: any = payload._meta?.["codebuddy.ai"];
    if (!meta || typeof meta !== "object") return null;
    const messageId: any = meta.messageId ?? meta.userMessageId;
    return typeof messageId === "string" && messageId.trim().length > 0
      ? messageId
      : null;
  }
  function isSyntheticOwnerHistoryEvent(payload: any): any {
    const meta: any = payload._meta?.["codebuddy.ai"];
    return (
      !!meta && typeof meta === "object" && meta.syntheticOwnerHistory === true
    );
  }
  function getOwnerHistoryInterruptionResolutionKey(payload: any): any {
    const type: any = typeof payload.type === "string" ? payload.type : null;
    const toolCallId: any =
      typeof payload.toolCallId === "string" ? payload.toolCallId : null;
    if (type !== "questionCancelled" || !toolCallId) return null;
    return `${type}:${toolCallId}`;
  }
  function getOwnerHistoryInterruptionRequestKey(payload: any): any {
    const type: any = typeof payload.type === "string" ? payload.type : null;
    const toolCallId: any =
      typeof payload.toolCallId === "string" ? payload.toolCallId : null;
    if (type !== "questionRequest" || !toolCallId) return null;
    return `${type}:${toolCallId}`;
  }
  function getOwnerHistoryOffset(payload: any): any {
    const meta: any = payload._meta?.["codebuddy.ai"];
    if (!meta || typeof meta !== "object") return null;
    const rawOffset: any = meta.offset;
    if (typeof rawOffset === "number" && Number.isFinite(rawOffset))
      return rawOffset;
    if (typeof rawOffset === "string") {
      const parsed: any = Number.parseInt(rawOffset, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }
  function getOwnerHistoryMode(payload: any): any {
    const meta: any = payload._meta?.["codebuddy.ai"];
    if (!meta || typeof meta !== "object") return null;
    const mode: any = meta.mode;
    return mode === "history" || mode === "stream" ? mode : null;
  }
  function sessionHasPriorUserMessages(session: any): any {
    return session.hasUserMessageSinceLastCompact;
  }
  function toExpertSelectionIdentity(desiredConfig: any): any {
    const id: any = desiredConfig.expertId?.trim();
    if (!id) return;
    const marketplace: any = desiredConfig.expertMarketplace?.trim();
    return {
      id,
      ...(marketplace ? { marketplace } : {}),
    };
  }
  function toPersistedExpertSelectionState(selection: any): any {
    return {
      version: 1,
      selection: selection ? { ...selection } : null,
    };
  }
  function fromPersistedExpertSelectionState(state: any): any {
    return state?.version === 1 && state.selection
      ? { ...state.selection }
      : void 0;
  }
  // prettier-ignore
  function isCompactInternalEventPayload(payload: any): any {
    const updateMeta: any = payload.update?._meta;
    const notifMeta: any = payload._meta;
    if (updateMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
    if (notifMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
    if (
      (updateMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true
    )
      return true;
    if (
      (notifMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true
    )
      return true;
    return isSessionSeparatorEventPayload(payload);
  }
  function isSessionSeparatorEventPayload(payload: any): any {
    const updateMeta: any = payload.update?._meta;
    const notifMeta: any = payload._meta;
    if (
      updateMeta?.isSessionSeparator === true ||
      notifMeta?.isSessionSeparator === true
    )
      return true;
    const updateNested: any = updateMeta?.["codebuddy.ai"];
    const notifNested: any = notifMeta?.["codebuddy.ai"];
    if (updateNested?.isSessionSeparator === true) return true;
    if (notifNested?.isSessionSeparator === true) return true;
    return false;
  }
  class NativeSessionPrompt {
    [key: string]: any;
    enrichPromptMeta(session: any, _meta: any): any {
      if (
        !_meta &&
        !session.projectId &&
        !session.lastUserPromptExpertSelection
      )
        return;
      const meta: any = _meta ? structuredClone(_meta) : {};
      const cbMeta: any = meta["codebuddy.ai"];
      const codebuddyMeta: any =
        cbMeta && typeof cbMeta === "object" ? cbMeta : {};
      if (session.projectId && !codebuddyMeta.projectId)
        codebuddyMeta.projectId = session.projectId;
      if (session.lastUserPromptExpertSelection)
        codebuddyMeta.previousExpertSelection = {
          ...session.lastUserPromptExpertSelection,
        };
      else delete codebuddyMeta.previousExpertSelection;
      meta["codebuddy.ai"] = codebuddyMeta;
      return meta;
    }
    async composePromptForBackend(
      session: any,
      prompt: any,
      _meta: any,
    ): Promise<any> {
      if (
        !this.userPromptComposer ||
        !Array.isArray(prompt) ||
        prompt.length === 0
      )
        return prompt;
      await this.userPromptComposerReady;
      const metaProjectId: any = readProjectId(_meta);
      this.logger?.info?.(
        `[SessionManager] composing user prompt context ${JSON.stringify({
          sessionId: session.sessionId,
          sessionProjectId: session.projectId,
          metaProjectId,
          hasProjectId: !!(session.projectId || metaProjectId),
          hasPriorUserMessages: sessionHasPriorUserMessages(session),
          hasPromptMeta: !!_meta,
        })}`,
      );
      return this.userPromptComposer.composeUserPrompt({
        sessionId: session.sessionId,
        cwd: session.cwd,
        desiredConfig: session.desiredConfig,
        prompt: structuredClone(prompt),
        _meta: this.enrichPromptMeta(session, _meta),
        hasPriorUserMessages: sessionHasPriorUserMessages(session),
      });
    }
    recordSessionEvent(session: any, payload: any, options?: any): any {
      if (!options?.isReplay) this.updatePromptHistoryState(session, payload);
      if (payload.update) {
        const offset: any =
          getOwnerHistoryMode(payload) === "stream"
            ? null
            : getOwnerHistoryOffset(payload);
        if (offset !== null) {
          if (
            session.eventHistory.findIndex(
              (existing: any) => getOwnerHistoryOffset(existing) === offset,
            ) >= 0
          )
            return "duplicate";
        }
        const userMessageId: any = getOwnerHistoryUserMessageId(payload);
        if (userMessageId) {
          const existingIndex: any = session.eventHistory.findIndex(
            (existing: any) =>
              getOwnerHistoryUserMessageId(existing) === userMessageId,
          );
          if (existingIndex >= 0) {
            const existing: any = session.eventHistory[existingIndex];
            const existingSynthetic: any =
              isSyntheticOwnerHistoryEvent(existing);
            const incomingSynthetic: any =
              isSyntheticOwnerHistoryEvent(payload);
            if (existingSynthetic && !incomingSynthetic) {
              session.eventHistory[existingIndex] =
                cloneSessionPayload(payload);
              return "replaced";
            }
            return "duplicate";
          }
        }
      }
      const interruptionRequestKey: any =
        getOwnerHistoryInterruptionRequestKey(payload);
      if (interruptionRequestKey) {
        const existingIndex: any = session.eventHistory.findIndex(
          (existing: any) =>
            getOwnerHistoryInterruptionRequestKey(existing) ===
            interruptionRequestKey,
        );
        if (existingIndex >= 0) {
          const existing: any = session.eventHistory[existingIndex];
          const existingMode: any = getOwnerHistoryMode(existing);
          const incomingMode: any = getOwnerHistoryMode(payload);
          if (existingMode === "history" && incomingMode === "stream") {
            session.eventHistory[existingIndex] = cloneSessionPayload(payload);
            return "replaced";
          }
          return "duplicate";
        }
      }
      const interruptionResolutionKey: any =
        getOwnerHistoryInterruptionResolutionKey(payload);
      if (interruptionResolutionKey) {
        const existingIndex: any = session.eventHistory.findIndex(
          (existing: any) =>
            getOwnerHistoryInterruptionResolutionKey(existing) ===
            interruptionResolutionKey,
        );
        if (existingIndex >= 0) {
          session.eventHistory[existingIndex] = cloneSessionPayload(payload);
          return "replaced";
        }
      }
      if (payload.update) {
        const update: any = payload.update;
        if (update.sessionUpdate === "tool_call_update") {
          const toolCallId: any = update.toolCallId;
          const hasStatus: any = update.status !== void 0;
          if (toolCallId && !hasStatus)
            for (let i: any = session.eventHistory.length - 1; i >= 0; i--) {
              const eu: any = session.eventHistory[i].update;
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
    updatePromptHistoryState(session: any, payload: any): any {
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
    recordSyntheticUserPromptEvent(session: any, prompt: any, meta: any): any {
      if (!Array.isArray(prompt) || prompt.length === 0) return;
      const metaRecord: any =
        meta && typeof meta === "object" ? structuredClone(meta) : {};
      const rawCodebuddyMeta: any = metaRecord["codebuddy.ai"];
      const codebuddyMeta: any =
        rawCodebuddyMeta && typeof rawCodebuddyMeta === "object"
          ? { ...rawCodebuddyMeta }
          : {};
      const messageId: any =
        typeof codebuddyMeta.userMessageId === "string" &&
        codebuddyMeta.userMessageId.trim().length > 0
          ? codebuddyMeta.userMessageId
          : typeof metaRecord.messageId === "string" &&
              metaRecord.messageId.trim().length > 0
            ? metaRecord.messageId
            : (0, node_crypto.randomUUID)();
      codebuddyMeta.messageId = messageId;
      codebuddyMeta.messageRequestId =
        typeof codebuddyMeta.messageRequestId === "string" &&
        codebuddyMeta.messageRequestId.trim().length > 0
          ? codebuddyMeta.messageRequestId
          : messageId;
      codebuddyMeta.syntheticOwnerHistory = true;
      const payload: any = {
        sessionId: session.sessionId,
        update: {
          sessionUpdate: "user_message_chunk",
          content: prompt.map((block: any) => structuredClone(block)),
        },
        _meta: {
          ...metaRecord,
          "codebuddy.ai": codebuddyMeta,
        },
      };
      const recordResult: any = this.recordSessionEvent(session, payload);
      if (codebuddyMeta.emitSyntheticUserPromptLive) {
        const dedupKey: any = `${session.sessionId}::${messageId}`;
        if (
          recordResult === "added" &&
          !this.liveEmittedSyntheticUserPromptKeys.has(dedupKey)
        ) {
          this.liveEmittedSyntheticUserPromptKeys.add(dedupKey);
          this.emitOrBufferScopedEvent(session, payload);
        }
      }
    }
    async persistLastUserPromptExpertSelection(
      session: any,
      selectionOverride?: any,
    ): Promise<any> {
      try {
        const selection: any =
          selectionOverride === null
            ? void 0
            : (selectionOverride ?? session.lastUserPromptExpertSelection);
        await this.upsertSessionRecord(session.sessionId, (current: any) => ({
          ...current,
          lastUserPromptExpertSelection:
            toPersistedExpertSelectionState(selection),
          updatedAt: current.updatedAt,
        }));
      } catch (error: any) {
        this.logDiagnostic(
          "warn",
          "[SessionManager] failed to persist expert selection prompt state",
          {
            sessionId: session.sessionId,
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
    }
    enqueueSessionEffect(session: any, effect: any): any {
      const sessionId: any = session.sessionId;
      if (this.sessions.get(sessionId) !== session) return Promise.resolve();
      const next: any = (
        this.sessionEffectChains.get(sessionId) ?? Promise.resolve()
      )
        .catch(() => {})
        .then(effect)
        .finally(() => {
          if (this.sessionEffectChains.get(sessionId) === next)
            this.sessionEffectChains.delete(sessionId);
        });
      this.sessionEffectChains.set(sessionId, next);
      return next;
    }
    async flushSessionEffects(sessionId: any): Promise<any> {
      await (this.sessionEffectChains.get(sessionId) ?? Promise.resolve());
    }
  }
  return {
    NativeSessionPrompt,
    readCodebuddyMeta,
    readProjectId,
    cloneSessionPayload,
    getOwnerHistoryMode,
    getOwnerHistoryOffset,
    getOwnerHistoryUserMessageId,
    isSyntheticOwnerHistoryEvent,
    getOwnerHistoryInterruptionRequestKey,
    getOwnerHistoryInterruptionResolutionKey,
    isCompactInternalEventPayload,
    isSessionSeparatorEventPayload,
    sessionHasPriorUserMessages,
    toExpertSelectionIdentity,
    toPersistedExpertSelectionState,
    fromPersistedExpertSelectionState,
  };
}
