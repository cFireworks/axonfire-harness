// @ts-nocheck
// Complete original plan normalization, snapshot and task-tool derivation methods.
export const SESSION_PLANS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_PLANS_MEMBERS = [
  ["preparePlanNotification", 4723038, 4723300],
  ["commitPreparedPlanSnapshot", 4724215, 4724364],
  ["createPlanNotificationFromTaskToolResult", 4727038, 4728080],
  ["createPreparedPlanNotification", 4723302, 4724213],
  ["extractToolNameForPlanDerivation", 4728082, 4728661],
  ["extractTaskRawResponse", 4728663, 4729424],
  ["resolvePlanRevision", 4724366, 4724760],
  ["normalizePlanEntries", 4725406, 4727036],
  ["withPlanOwnerMeta", 4725048, 4725404],
  ["readPlanRevision", 4724762, 4725046],
  ["pickString", 4729804, 4729939],
  ["pickStringArray", 4730070, 4730345],
  ["pickNumber", 4729941, 4730068],
  ["normalizePlanEntryStatus", 4729426, 4729661],
  ["normalizePlanPriority", 4729663, 4729802],
] as const;
export const SESSION_PLANS_FUNCTIONS = [
  ["isRecord$3", 4783018, 4783126],
  ["cloneSessionPayload", 4782942, 4783017],
] as const;
export function attachNativeSessionPlans(controller: any, deps: any = {}): any {
  function isRecord$3(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function cloneSessionPayload(payload) {
    return structuredClone(payload);
  }
  class NativeSessionPlans {
    preparePlanNotification(session, notification) {
      const update = notification.update;
      if (!isRecord$3(update) || update.sessionUpdate !== "plan")
        return { payload: notification };
      return this.createPreparedPlanNotification(session, notification, update);
    }
    commitPreparedPlanSnapshot(session, prepared) {
      if (!prepared.snapshot) return;
      session.planSnapshot = cloneSessionPayload(prepared.snapshot);
    }
    createPlanNotificationFromTaskToolResult(session, notification) {
      const update = notification.update;
      if (!isRecord$3(update) || update.sessionUpdate !== "tool_call_update")
        return;
      if (update.status !== "completed") return;
      const toolName = this.extractToolNameForPlanDerivation(session, update);
      if (
        !toolName ||
        !["TaskCreate", "TaskUpdate", "TaskList"].includes(toolName)
      )
        return;
      const rawResponse = this.extractTaskRawResponse(update);
      const rawEntries = Array.isArray(rawResponse?.todos)
        ? rawResponse.todos
        : Array.isArray(rawResponse?.tasks)
          ? rawResponse.tasks
          : void 0;
      if (!rawEntries) return;
      const planUpdate = {
        sessionUpdate: "plan",
        entries: rawEntries,
      };
      const planNotification = {
        sessionId: session.sessionId,
        update: planUpdate,
        _meta: {
          "codebuddy.ai": {
            source: toolName,
            derivedFromToolCallId:
              typeof update.toolCallId === "string"
                ? update.toolCallId
                : void 0,
          },
        },
      };
      return this.createPreparedPlanNotification(
        session,
        planNotification,
        planUpdate,
      );
    }
    createPreparedPlanNotification(session, notification, update) {
      const now = Date.now();
      const revision = this.resolvePlanRevision(session, notification, update);
      const entries = this.normalizePlanEntries(update.entries);
      const notificationMeta = this.withPlanOwnerMeta(
        isRecord$3(notification._meta) ? notification._meta : void 0,
        revision,
        now,
      );
      const updateMeta = this.withPlanOwnerMeta(
        isRecord$3(update._meta) ? update._meta : void 0,
        revision,
        now,
      );
      const normalizedUpdate = {
        ...update,
        sessionUpdate: "plan",
        entries,
        _meta: updateMeta,
      };
      return {
        payload: {
          ...notification,
          sessionId: session.sessionId,
          update: normalizedUpdate,
          _meta: notificationMeta,
        },
        snapshot: {
          sessionId: session.sessionId,
          update: cloneSessionPayload(normalizedUpdate),
          _meta: cloneSessionPayload(notificationMeta),
          revision,
          updatedAt: now,
        },
      };
    }
    extractToolNameForPlanDerivation(session, update) {
      const meta = isRecord$3(update._meta) ? update._meta : void 0;
      const flatToolName = meta?.["codebuddy.ai/toolName"];
      if (typeof flatToolName === "string") return flatToolName;
      const nestedToolName = (
        meta && isRecord$3(meta["codebuddy.ai"]) ? meta["codebuddy.ai"] : void 0
      )?.toolName;
      if (typeof nestedToolName === "string") return nestedToolName;
      const toolCallId =
        typeof update.toolCallId === "string" ? update.toolCallId : void 0;
      return toolCallId
        ? session.toolResults.get(toolCallId)?.toolName
        : void 0;
    }
    extractTaskRawResponse(update) {
      const rawOutput = update.rawOutput;
      if (isRecord$3(rawOutput)) {
        if (isRecord$3(rawOutput.rawResponse))
          return cloneSessionPayload(rawOutput.rawResponse);
        if (
          rawOutput.task != null ||
          rawOutput.tasks != null ||
          rawOutput.todos != null ||
          rawOutput.taskId != null ||
          rawOutput.deleted != null
        )
          return cloneSessionPayload(rawOutput);
      }
      const meta = isRecord$3(update._meta) ? update._meta : void 0;
      const direct = meta?.["codebuddy.ai/rawResponse"];
      if (isRecord$3(direct)) return cloneSessionPayload(direct);
      const codebuddyMeta =
        meta && isRecord$3(meta["codebuddy.ai"])
          ? meta["codebuddy.ai"]
          : void 0;
      if (isRecord$3(codebuddyMeta?.rawResponse))
        return cloneSessionPayload(codebuddyMeta.rawResponse);
    }
    resolvePlanRevision(session, notification, update) {
      const explicitRevision =
        this.readPlanRevision(notification._meta) ??
        this.readPlanRevision(update._meta);
      const currentRevision = session.planSnapshot?.revision ?? 0;
      if (
        typeof explicitRevision === "number" &&
        Number.isFinite(explicitRevision)
      )
        return Math.max(explicitRevision, currentRevision + 1);
      return currentRevision + 1;
    }
    normalizePlanEntries(entries) {
      if (!Array.isArray(entries)) return [];
      return entries.map((entry, index) => {
        const record = isRecord$3(entry)
          ? entry
          : { content: String(entry ?? "") };
        const rawMeta = isRecord$3(record._meta)
          ? cloneSessionPayload(record._meta)
          : {};
        const rawCodebuddyMeta = isRecord$3(rawMeta["codebuddy.ai"])
          ? rawMeta["codebuddy.ai"]
          : {};
        const id =
          this.pickString(rawCodebuddyMeta.id, rawMeta.id, record.id) ??
          `task-${index}`;
        const activeForm = this.pickString(
          rawCodebuddyMeta.activeForm,
          record.activeForm,
        );
        const dependencies = this.pickStringArray(
          rawCodebuddyMeta.dependencies,
          rawMeta.dependencies,
          record.dependencies,
          record.blockedBy,
        );
        const order =
          this.pickNumber(
            rawCodebuddyMeta.order,
            rawMeta.order,
            record.order,
          ) ?? index;
        const nextCodebuddyMeta = {
          ...rawCodebuddyMeta,
          id,
          order,
        };
        if (activeForm) nextCodebuddyMeta.activeForm = activeForm;
        if (dependencies.length > 0)
          nextCodebuddyMeta.dependencies = dependencies;
        const nextMeta = {
          ...rawMeta,
          id,
          "codebuddy.ai": nextCodebuddyMeta,
        };
        if (dependencies.length > 0) nextMeta.dependencies = dependencies;
        const createdAt = this.pickNumber(record.createdAt);
        const updatedAt = this.pickNumber(record.updatedAt);
        return {
          content:
            this.pickString(record.content, record.subject, record.title) ?? "",
          status: this.normalizePlanEntryStatus(record.status),
          priority: this.normalizePlanPriority(record.priority),
          ...(createdAt !== void 0 ? { createdAt } : {}),
          ...(updatedAt !== void 0 ? { updatedAt } : {}),
          _meta: nextMeta,
        };
      });
    }
    withPlanOwnerMeta(meta, revision, updatedAt) {
      const nextMeta = cloneSessionPayload(meta ?? {});
      nextMeta["codebuddy.ai"] = {
        ...(isRecord$3(nextMeta["codebuddy.ai"])
          ? { ...nextMeta["codebuddy.ai"] }
          : {}),
        isFullPlanSnapshot: true,
        planOwner: "session-manager",
        planRevision: revision,
        planUpdatedAt: updatedAt,
      };
      return nextMeta;
    }
    readPlanRevision(meta) {
      if (!isRecord$3(meta)) return;
      const codebuddyMeta = isRecord$3(meta["codebuddy.ai"])
        ? meta["codebuddy.ai"]
        : void 0;
      const revision = codebuddyMeta?.planRevision ?? codebuddyMeta?.revision;
      return typeof revision === "number" ? revision : void 0;
    }
    pickString(...values) {
      for (const value of values)
        if (typeof value === "string" && value.trim().length > 0)
          return value.trim();
    }
    pickStringArray(...values) {
      for (const value of values) {
        if (!Array.isArray(value)) continue;
        const strings = value
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
        if (strings.length > 0) return strings;
      }
      return [];
    }
    pickNumber(...values) {
      for (const value of values)
        if (typeof value === "number" && Number.isFinite(value)) return value;
    }
    normalizePlanEntryStatus(value) {
      switch (value) {
        case "in_progress":
          return "in_progress";
        case "completed":
          return "completed";
        case "cancelled":
        case "deleted":
          return "cancelled";
        default:
          return "pending";
      }
    }
    normalizePlanPriority(value) {
      switch (value) {
        case "low":
        case "medium":
        case "high":
          return value;
        default:
          return;
      }
    }
  }
  for (const name of [
    "preparePlanNotification",
    "commitPreparedPlanSnapshot",
    "createPlanNotificationFromTaskToolResult",
    "createPreparedPlanNotification",
    "extractToolNameForPlanDerivation",
    "extractTaskRawResponse",
    "resolvePlanRevision",
    "normalizePlanEntries",
    "withPlanOwnerMeta",
    "readPlanRevision",
    "pickString",
    "pickStringArray",
    "pickNumber",
    "normalizePlanEntryStatus",
    "normalizePlanPriority",
  ])
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(NativeSessionPlans.prototype, name),
    );
  return controller;
}
