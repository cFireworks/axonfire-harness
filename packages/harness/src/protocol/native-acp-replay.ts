// @ts-nocheck
// Complete original module 67037. No application bootstrap or ambient account/DI discovery.
export const ACP_REPLAY_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_REPLAY_FACTORIES = [[67037, 6918399, 6929073]] as const;
export const ACP_REPLAY_FUNCTIONS = [
  ["isReplayShowPreCompactEnabled", 6918808, 6918947],
  ["resolveActiveHistory", 6918947, 6919300],
  ["pushSessionUpdate", 6919300, 6919452],
  ["isRecord", 6919452, 6919526],
  ["withCodeBuddyMeta", 6919526, 6919667],
  ["replayOffsetMeta", 6919667, 6919784],
  ["withReplayOffset", 6919784, 6919939],
  ["pushExtNotification", 6919939, 6920048],
  ["getReplayRequestId", 6920048, 6920196],
  ["appendUpdateMeta", 6920196, 6920262],
  ["parseMcpServerName", 6920262, 6920372],
  ["getReplayMcpUi", 6920372, 6920605],
  ["prefetchReplayMcpUiHtml", 6920605, 6921092],
  ["appendDerivedUsageUpdate", 6921092, 6921548],
  ["collectSessionReplayEvents", 6921548, 6928824],
  ["emitSessionReplayEvents", 6928824, 6929072],
] as const;
export function createNativeAcpReplay(runtime: any = {}) {
  const process = { env: runtime.env ?? {} },
    Date = runtime.Date ?? globalThis.Date,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  const cache = new Map(),
    factories: any = {
      67037(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            REPLAY_SHOW_PRE_COMPACT_ENV: () => eC,
            collectSessionReplayEvents: () => collectSessionReplayEvents,
            emitSessionReplayEvents: () => emitSessionReplayEvents,
            isReplayShowPreCompactEnabled: () => isReplayShowPreCompactEnabled,
          }));
        var eu = ec(80699),
          ed = ec(92735),
          ep = ec(66545),
          eg = ec(20881),
          eh = ec(93039),
          ef = ec(12502),
          em = ec(38548),
          eE = ec(82263);
        let eC = "CODEBUDDY_REPLAY_SHOW_PRE_COMPACT";
        function isReplayShowPreCompactEnabled() {
          let eA = process.env[eC];
          if (!eA) return !1;
          let el = eA.trim().toLowerCase();
          return "1" === el || "true" === el;
        }
        function resolveActiveHistory(eA, el) {
          let ec = !0 === eA.conversationReverted,
            { lastMessageId: eu } = eA;
          if (ec && !eu) return [];
          let ed = !!el?.showPreCompactHistory || eA.hasCompactedHistory;
          return eh.HistoryUtils.resolveReplayHistory(eA.history, {
            lastMessageId: eu,
            hasCompactedHistory: ed,
            keepCustomItems: !1,
            recoverLegacySelfParentCompact: el?.showPreCompactHistory === !0,
          });
        }
        function pushSessionUpdate(eA, el, ec, eu, ed = Date.now()) {
          eA.push({
            type: "sessionUpdate",
            sessionId: el,
            update: ec,
            _meta: (0, em.withAcpTimestampRecord)(eu, ed),
          });
        }
        function isRecord(eA) {
          return !!eA && "object" == typeof eA && !Array.isArray(eA);
        }
        function withCodeBuddyMeta(eA, el) {
          let ec = isRecord(eA?.["codebuddy.ai"]) ? eA["codebuddy.ai"] : {};
          return { ...(eA ?? {}), "codebuddy.ai": { ...ec, ...el } };
        }
        function replayOffsetMeta(eA, el) {
          return (0, em.withAcpTimestampRecord)(
            { "codebuddy.ai": { mode: "history", offset: eA } },
            el,
          );
        }
        function withReplayOffset(eA, el, ec) {
          let eu = eA;
          return {
            ...eu,
            _meta: (0, em.withAcpTimestampRecord)(
              withCodeBuddyMeta(eu._meta, { mode: "history", offset: el }),
              ec,
            ),
          };
        }
        function pushExtNotification(eA, el, ec, eu) {
          eA.push({
            type: "extNotification",
            sessionId: el,
            method: ec,
            params: eu,
          });
        }
        function getReplayRequestId(eA) {
          let el = eA.providerData,
            ec = el?.conversationRequestId ?? el?.requestId;
          return "string" == typeof ec && ec.length > 0 ? ec : void 0;
        }
        function appendUpdateMeta(eA, el) {
          eA._meta = { ...(eA._meta || {}), ...el };
        }
        function parseMcpServerName(eA) {
          if ("string" == typeof eA)
            return eA.match(/^mcp__([^_]+(?:_[^_]+)*?)__.+$/)?.[1];
        }
        function getReplayMcpUi(eA) {
          let el = eA._meta,
            ec = isRecord(el?.["codebuddy.ai"]) ? el["codebuddy.ai"] : void 0,
            eu = isRecord(ec?.toolMetaData) ? ec.toolMetaData : void 0,
            ed = eu?.mcpUi;
          if (isRecord(ed) && "string" == typeof ed.toolResourceUri) return ed;
        }
        async function prefetchReplayMcpUiHtml(eA, el, ec = 300) {
          if (!el) return;
          let eu = getReplayMcpUi(eA);
          if (!eu || void 0 !== eu.html) return;
          let ed = parseMcpServerName(eu.toolName);
          if (!ed) return;
          let ep = (
            await Promise.race([
              el(ed, eu.toolResourceUri),
              new Promise((eA) => {
                let el = setTimeout(() => eA([]), ec);
                el.unref?.();
              }),
            ])
          ).find(
            (eA) =>
              "string" == typeof eA.text &&
              "string" == typeof eA.mimeType &&
              "text/html;profile=mcp-app" ===
                eA.mimeType.toLowerCase().replace(/\s+/g, ""),
          );
          ep && ((eu.mimeType = ep.mimeType), (eu.html = ep.text));
        }
        async function appendDerivedUsageUpdate(eA, el, ec) {
          try {
            let ed = eu.ContainerUtil.get(ep.AgentManager),
              eg = await (0, eE.buildSessionUsageUpdate)(el, ed, ec);
            if (!eg) return;
            eA.push({
              type: "sessionUpdate",
              sessionId: el.id,
              update: {
                sessionUpdate: "usage_update",
                used: eg.used,
                size: eg.size,
                ...(eg.usageByCategory
                  ? {
                      _meta: {
                        [eE.META_KEY_CONTEXT_USAGE_BY_CATEGORY]:
                          eg.usageByCategory,
                      },
                    }
                  : {}),
              },
            });
          } catch (eA) {
            ec?.warn?.(
              `[ACP Agent] replayHistory: usage_update derive skipped: ${eA}`,
            );
          }
        }
        async function collectSessionReplayEvents(eA, el, ep) {
          let eE,
            eC = Date.now();
          try {
            eE = eu.ContainerUtil.get(ed.TraceService).startTrace(
              ed.SPAN_NAME_SESSION_REPLAY,
            );
          } catch (eA) {
            el?.info?.(
              `[ACP Agent] replayHistory: session_replay span start failed: ${eA}`,
            );
          }
          try {
            let ey,
              ew,
              eB = resolveActiveHistory(eA, ep);
            (ep?.timing && (ep.timing.activeItems = eB.length),
              eE?.setAttributes({
                [ed.SESSION_REPLAY_ATTRS.SPAN_TYPE]:
                  ed.SPAN_TYPE_SESSION_REPLAY,
                [ed.SESSION_REPLAY_ATTRS.ACTIVE_ITEMS]: eB.length,
                "conversation.id": eA.id,
                "workbuddy.session_id": eA.id,
                "workbuddy.history_total": eA.history.length,
                "workbuddy.conversation_reverted":
                  !0 === eA.conversationReverted,
                "workbuddy.last_message_id": eA.lastMessageId ?? "",
              }),
              el?.info?.(
                `[ACP Agent] replayHistory: replaying ${eB.length} of ${eA.history.length} history items, lastMessageId=${eA.lastMessageId}, reverted=${!0 === eA.conversationReverted}`,
              ));
            let e_ = new Set(),
              eI = new Map();
            for (let eA of eB)
              if (
                (("function_call_result" === eA.type ||
                  "function_call_output" === eA.type) &&
                  eA.callId &&
                  e_.add(eA.callId),
                "function_call" === eA.type && eA.callId)
              )
                try {
                  let el = JSON.parse(eA.arguments || "{}");
                  "string" == typeof el.toolName &&
                    el.toolName.startsWith("mcp__") &&
                    eI.set(eA.callId, el.toolName);
                } catch {}
            try {
              let el = eA.interruptionSubject.value;
              if (el) {
                let eA = el.rawItem;
                ey = eA.callId || eA.id;
              }
            } catch {}
            let ev = [];
            pushSessionUpdate(ev, eA.id, {
              sessionUpdate: "session_info_update",
              _meta: {
                "codebuddy.ai/historyReplay": "start",
                "codebuddy.ai/historyReplayTotalItems": eB.length,
              },
            });
            let eS = (0, eg.getEffectiveSessionTitle)(eA.history);
            eS &&
              pushSessionUpdate(ev, eA.id, {
                sessionUpdate: "session_info_update",
                title: eS,
              });
            let eQ = 0,
              eD = eE?.startSpan("convert-history"),
              eT = Date.now();
            for (let ec of eB) {
              "message" === ec.type && "assistant" === ec.role
                ? (ew = ec.id)
                : "reasoning" === ec.type &&
                  (ew = ec.providerData?.messageId || ec.id || ew);
              let eu =
                  "function_call" !== ec.type ||
                  "string" != typeof ec.callId ||
                  e_.has(ec.callId) ||
                  ec.callId === ey
                    ? void 0
                    : ec.callId,
                ed = ef.AcpUtils.convertHistoryItemToAcp(ec),
                eg = getReplayRequestId(ec),
                eh = (0, em.getAcpItemTimestamp)(ec);
              for (let el of ed) {
                let eu = getReplayMcpUi(el),
                  ed = ec.callId ? eI.get(ec.callId) : void 0;
                (eu && !eu.toolName && ed && (eu.toolName = ed),
                  await prefetchReplayMcpUiHtml(
                    el,
                    ep?.mcpUiResourceReader,
                    ep?.mcpUiPrefetchTimeoutMs,
                  ));
                let ef = el.sessionUpdate;
                (eg &&
                  !el._meta?.["codebuddy.ai/requestId"] &&
                  appendUpdateMeta(el, { "codebuddy.ai/requestId": eg }),
                  ("agent_thought_chunk" === ef ||
                    "agent_message_chunk" === ef) &&
                    ew &&
                    !el._meta?.["codebuddy.ai/messageId"] &&
                    appendUpdateMeta(el, { "codebuddy.ai/messageId": ew }));
                let em = eQ++;
                pushSessionUpdate(
                  ev,
                  eA.id,
                  withReplayOffset(el, em, eh),
                  replayOffsetMeta(em, eh),
                  eh,
                );
              }
              if (eu) {
                let ed = eQ++,
                  ep = ec.name;
                (pushSessionUpdate(
                  ev,
                  eA.id,
                  withReplayOffset(
                    {
                      sessionUpdate: "tool_call_update",
                      toolCallId: eu,
                      status: "cancelled",
                      _meta: {
                        "codebuddy.ai/toolCancelReason": "session_interrupted",
                        ...("string" == typeof ep && ep
                          ? { "codebuddy.ai/toolName": ep }
                          : {}),
                      },
                    },
                    ed,
                    eh,
                  ),
                  replayOffsetMeta(ed, eh),
                  eh,
                ),
                  el?.info?.(
                    `[ACP Agent] replayHistory: marked orphaned tool_call cancelled (interrupted): callId=${eu}, name=${ep}`,
                  ));
              }
            }
            (ep?.timing && (ep.timing.convertMs = Date.now() - eT),
              eD?.markAsSuccessful(),
              pushSessionUpdate(ev, eA.id, {
                sessionUpdate: "session_info_update",
                _meta: { "codebuddy.ai/historyReplay": "end" },
              }));
            try {
              let { TaskStorageService: el } = await Promise.resolve().then(
                  ec.bind(ec, 57135),
                ),
                ed = eu.ContainerUtil.get(el),
                ep = await ed.list(eA.id);
              ep &&
                ep.length > 0 &&
                pushExtNotification(ev, eA.id, "_codebuddy.ai/artifact", {
                  sessionId: eA.id,
                  event: "created",
                  artifact: {
                    type: "tasks",
                    uri: `agent:///${eA.id}/tasks/${eA.id}`,
                    name: "Tasks",
                    title: "Tasks",
                    mimeType: "application/json",
                    tasks: ep.map((eA) => ({
                      id: eA.id,
                      content: eA.subject,
                      status:
                        "completed" === eA.status
                          ? "completed"
                          : "in_progress" === eA.status
                            ? "in_progress"
                            : "pending",
                    })),
                    enableEdit: !1,
                  },
                });
            } catch (eA) {
              el?.info?.(
                `[ACP Agent] replayHistory: tasks broadcast skipped: ${eA}`,
              );
            }
            let eR = eE?.startSpan("restore-checkpoint"),
              ek = Date.now();
            try {
              let { CheckpointService: ed } = await Promise.resolve().then(
                  ec.bind(ec, 6512),
                ),
                { FileVersionStore: ep } = await Promise.resolve().then(
                  ec.bind(ec, 6512),
                ),
                eg = eu.ContainerUtil.get(ed),
                ef = eu.ContainerUtil.get(ep),
                em = eg.getLatestCheckpoint(eA);
              if (em && Object.keys(em.fileSnapshots || {}).length > 0) {
                let ec = [];
                for (let [eu, ed] of Object.entries(em.fileSnapshots)) {
                  let ep = ed.backupFileName ? "modified" : "created";
                  try {
                    let ec;
                    try {
                      ec = await eh.FileUtils.readFileWithEncodingDetection(eu);
                    } catch (eA) {
                      if (eA?.code === "ENOENT") ec = "";
                      else {
                        el?.info?.(
                          `[ACP Agent] replayHistory: failed to read current content of ${eu} for checkpoint comparison: ${eA?.message ?? eA}`,
                        );
                        continue;
                      }
                    }
                    let ed = eh.FileHistorySnapshotUtils.computePathHash(eu),
                      ep = eh.FileHistorySnapshotUtils.formatBackupName(ed, 1),
                      eg = (await ef.get(eA.id, ep)) ?? "";
                    if (ec === eg) continue;
                  } catch (eA) {
                    el?.info?.(
                      `[ACP Agent] replayHistory: checkpoint compare skipped for ${eu}: ${eA}`,
                    );
                  }
                  ec.push({ uri: eu, changeType: ep });
                }
                ec.length > 0 &&
                  pushExtNotification(ev, eA.id, "_codebuddy.ai/checkpoint", {
                    sessionId: eA.id,
                    event: "created",
                    checkpoint: {
                      id: em.id ?? (0, eu.generateUUUID)(),
                      createdAt: em.createdAt ?? Date.now(),
                      label: em.label,
                      fileChanges: {
                        files: ec,
                        totalAdditions: em.fileChangeStats?.additions ?? 0,
                        totalDeletions: em.fileChangeStats?.deletions ?? 0,
                      },
                    },
                  });
              }
            } catch (eA) {
              el?.info?.(
                `[ACP Agent] replayHistory: checkpoint broadcast skipped: ${eA}`,
              );
            } finally {
              (ep?.timing && (ep.timing.checkpointMs = Date.now() - ek),
                eR?.markAsSuccessful());
            }
            try {
              let { TeamManager: ed } = await Promise.resolve().then(
                  ec.bind(ec, 68366),
                ),
                ep = eu.ContainerUtil.get(ed);
              if (ep.isInTeam()) {
                let { getTeamMemberRegistry: eu } =
                    await Promise.resolve().then(ec.bind(ec, 54193)),
                  ed = eu()
                    .getAll()
                    .map((eA) => {
                      let el = eA.info,
                        ec = eA.getAgentTask();
                      return {
                        name: el.name,
                        color: el.color,
                        description: el.prompt,
                        status: ec?.status ?? "pending",
                        taskId: ec?.id,
                        sessionId: ec?.sessionId,
                        tokenUsage: ec?.tokenUsage
                          ? {
                              inputTokens: ec.tokenUsage.inputTokens,
                              outputTokens: ec.tokenUsage.outputTokens,
                              lastContextWindow:
                                ec.tokenUsage.lastContextWindow,
                            }
                          : void 0,
                        toolCallCount: ec?.toolCallHistory?.length,
                      };
                    }),
                  eg = ep.getTeam();
                (pushSessionUpdate(ev, eA.id, {
                  sessionUpdate: "session_info_update",
                  _meta: {
                    "codebuddy.ai/teamUpdate": {
                      type: "member_status_change",
                      teamName: eg?.name,
                      isAutoTeam: eg?.isAutoTeam,
                      members: ed,
                    },
                  },
                }),
                  el?.info?.(
                    `[ACP Agent] replayHistory: pushed team status (${ed.length} members)`,
                  ));
              }
            } catch (eA) {
              el?.info?.(
                `[ACP Agent] replayHistory: team status push skipped: ${eA}`,
              );
            }
            try {
              let ec = eA.interruptionSubject.value;
              if (ec) {
                let eu = ec.rawItem,
                  ed = eu.callId || eu.id,
                  ep = String(eu.name || eu.type || "tool"),
                  eg = eu.providerData || {},
                  eh = ["allow", "allowAll", "deny"];
                ("ExitPlanMode" === ep && eh.push("rejectAndExitPlan"),
                  el?.info?.(
                    "[ACP Agent] replayHistory: pushing active interruption to Web UI",
                  ),
                  pushSessionUpdate(ev, eA.id, {
                    sessionUpdate: "session_info_update",
                    _meta: {
                      "codebuddy.ai/interruptionRequest": {
                        interruptionId: `ir-${ed}`,
                        toolCallId: ed,
                        toolName: ep,
                        toolTitle: ep,
                        toolInput: ef.AcpUtils.parseToRecord(
                          eu.arguments,
                          "arguments",
                        ),
                        options: eh,
                        queuePosition: eg.queuePosition,
                        queueTotal: eg.queueTotal,
                        isSubAgent: eg.isSubAgent,
                        agentName: eg.agent,
                        agentColor: eg.agentColor,
                      },
                    },
                  }));
              }
            } catch (eA) {
              el?.info?.(
                `[ACP Agent] replayHistory: interruption push skipped: ${eA}`,
              );
            }
            return (
              ep?.timing && (ep.timing.events = ev.length),
              eE?.setAttributes({
                [ed.SESSION_REPLAY_ATTRS.EVENTS]: ev.length,
                "workbuddy.duration_ms": Date.now() - (eC ?? Date.now()),
              }),
              eE?.markAsSuccessful(),
              await appendDerivedUsageUpdate(ev, eA, el),
              ev
            );
          } catch (eA) {
            throw (
              eE?.setAttributes({ "workbuddy.duration_ms": Date.now() - eC }),
              eE?.markAsFailed(eA),
              eA
            );
          }
        }
        async function emitSessionReplayEvents(eA, el) {
          for (let ec of el) {
            if ("sessionUpdate" === ec.type) {
              await eA.sessionUpdate({
                sessionId: ec.sessionId,
                update: ec.update,
                ...(ec._meta ? { _meta: ec._meta } : {}),
              });
              continue;
            }
            await eA.extNotification(ec.method, ec.params);
          }
        }
      },
    };
  function load(id: number): any {
    if (id !== 67037 && runtime.modules?.[id] !== undefined)
      return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m);
      factories[id](m, m.exports, load);
      return m.exports;
    }
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit ACP replay dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  }
  load.r = (value: any) => {
    Object.defineProperty(value, "__esModule", { value: true });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag)
      Object.defineProperty(value, Symbol.toStringTag, { value: "Module" });
  };
  load.d = (value: any, getters: any) => {
    for (const key of Object.keys(getters))
      if (!Object.hasOwn(value, key))
        Object.defineProperty(value, key, {
          enumerable: true,
          get: getters[key],
        });
  };
  return {
    getModule: load,
    get replay() {
      return load(67037);
    },
  };
}
