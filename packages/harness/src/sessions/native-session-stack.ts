// @ts-nocheck
// Complete inert original SessionManager/Store declarations and their local dependencies.
// No original DI decorators/bootstrap, installed home lookup, or implicit process arguments.
export const SESSION_STACK_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SESSION_STACK_BLOCKS = [
  ["AbortedStreamDraftStore", 10949862, 10954862],
  ["A_", 10955370, 10955502],
  ["createAbortableIterator", 10955502, 10956210],
  ["AI", 10956210, 10977597],
  ["AR", 10981143, 10981190],
  ["resolveSessionMaxItems", 10981190, 10981389],
  ["Ax", 10981389, 10994844],
] as const;
export const SESSION_STACK_CLASSES = [
  ["AbortedStreamDraftStore", 10949890, 10954861, 21],
  ["AI", 10956217, 10977596, 38],
  ["Ax", 10981396, 10994843, 28],
] as const;
export const SESSION_STACK_BINDINGS = [
  ["AB", 93039],
  ["AC", 94460],
  ["AD", 89483],
  ["AS", 16928],
  ["AT", 95695],
  ["Ad", 15315],
  ["Ah", 38195],
  ["Al", 18553],
  ["Am", 20881],
  ["An", 69466],
  ["Au", 68366],
  ["Av", 91943],
  ["Aw", 6350],
  ["t3", 99006],
  ["t4", 71389],
  ["t5", 80699],
  ["t6", 47005],
  ["t7", 29827],
  ["t8", 94317],
] as const;
export const SESSION_STACK_STATICS = [] as const;
export const SESSION_STACK_UNINITIALIZED = [] as const;
export const SESSION_STACK_FACTORIES = [
  [73571, 6295281, 6296958],
  [95695, 11182349, 11182603],
  [89483, 13061616, 13062372],
] as const;
export function createNativeSessionStack(runtime: any = {}) {
  const process: any = { env: runtime.env ?? {}, argv: runtime.argv ?? [] };
  const Date = runtime.Date ?? globalThis.Date;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const cache = new Map(),
    factories: any = {
      73571(eA, el, ec) {
        !(function () {
          "use strict";
          var el = ec(79896),
            noop = function () {};
          function LineReader(eA, ec, eu, ed) {
            ((this.size = el.statSync(eA).size),
              (this.filename = eA),
              (this.separator = ec || "\n"),
              (this.encoding = eu || "utf8"),
              (this.chunkSize = ed || 1024),
              (this.pos = Math.max(this.size - this.chunkSize, 0)),
              (this.pointer = this.pos),
              (this.buffer = null),
              (this.savedBuffer = ""));
          }
          function eachLine(eA, el, ec, eu, ed) {
            var ep,
              eg = 3 == el.length,
              eh = new LineReader(eA, ec, eu, ed);
            function readLine(eA) {
              if (!1 === eA) {
                ep && ep();
                return;
              }
              eh.readLine(function (eA, ec) {
                (null !== eA && !1 !== el(eA, ec, ec ? noop : readLine)
                  ? ec || eg || readLine()
                  : (ec = !0),
                  ec && ep && ep());
              });
            }
            return (
              readLine(),
              {
                then: function (eA) {
                  ep = eA;
                },
              }
            );
          }
          ((LineReader.prototype.searchBuffer = function () {
            if (null === this.buffer) return !1;
            var eA,
              el = this.buffer.lastIndexOf(this.separator);
            if (this.pos <= 0 && -1 === el) {
              var ec = this.buffer;
              return (
                (this.buffer = ""),
                (eA = this.savedBuffer),
                (this.savedBuffer = ""),
                ec + eA
              );
            }
            if (-1 === el)
              return (
                (this.pointer = this.pos - this.chunkSize - 1),
                (this.pos = this.pointer),
                (this.savedBuffer = this.buffer + this.savedBuffer),
                (this.buffer = ""),
                !1
              );
            var eu = this.buffer.substr(
              el + this.separator.length,
              this.buffer.length,
            );
            return (
              (this.buffer = this.buffer.substr(0, el)),
              (eA = this.savedBuffer),
              (this.savedBuffer = ""),
              eu + eA
            );
          }),
            (LineReader.prototype.readLine = function (eA) {
              var ec = this,
                eu = 0,
                ed = ec.searchBuffer();
              if (!1 !== ed) eA(ed, "" === ec.buffer && this.pos <= 0);
              else {
                var ep = el.createReadStream(this.filename, {
                  start: Math.max(this.pointer, 0),
                  end: Math.max(this.pointer + this.chunkSize, 0),
                  encoding: this.encoding,
                });
                (ep.on("error", function (eA) {
                  throw eA;
                }),
                  ep.on("end", function () {
                    null === ec.buffer ? eA(null, !0) : ec.readLine(eA);
                  }),
                  ep.on("data", function (eA) {
                    (null === ec.buffer && (ec.buffer = ""),
                      (ec.buffer += eA),
                      (eu += eA.length));
                  }));
              }
            }),
            (eA.exports.eachLine = eachLine));
        })();
      },
      95695(eA, el, ec) {
        "use strict";
        function isSessionPersistenceDisabled(eA, el = process.argv) {
          return (
            el.includes("--no-session-persistence") ||
            eA?.options?.sessionPersistence === !1
          );
        }
        (ec.r(el),
          ec.d(el, {
            isSessionPersistenceDisabled: () => isSessionPersistenceDisabled,
          }));
      },
      89483(eA, el, ec) {
        "use strict";
        function sanitizeContentBlockTypes(eA, el) {
          if (!Array.isArray(eA) || 0 === eA.length) return eA;
          let ec = 0,
            eu = [],
            ed = eA.map((eA) => {
              if (!eA || "message" !== eA.type) return eA;
              let el = eA.role,
                ed = eA.content;
              if (!Array.isArray(ed)) return eA;
              let ep = !1,
                eg = ed.map((eA) =>
                  eA && "text" === eA.type
                    ? "assistant" === el
                      ? ((ep = !0), ec++, { ...eA, type: "output_text" })
                      : "user" === el
                        ? ((ep = !0), ec++, { ...eA, type: "input_text" })
                        : eA
                    : eA,
                );
              return ep
                ? (eA.id && eu.push(eA.id), { ...eA, content: eg })
                : eA;
            });
          if (ec > 0)
            try {
              el?.warn?.(
                `[content-block-sanitizer] Fixed ${ec} illegal {type:'text'} block(s) across ${eu.length} item(s): ${eu.slice(0, 10).join(", ")}` +
                  (eu.length > 10 ? ` (+${eu.length - 10} more)` : ""),
              );
            } catch {}
          return ed;
        }
        (ec.r(el),
          ec.d(el, {
            sanitizeContentBlockTypes: () => sanitizeContentBlockTypes,
          }));
      },
    };
  const ec: any = (id: number) => {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit native session dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  };
  ec.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  ec.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      Object.defineProperty(exports, key, { enumerable: true, get: defs[key] });
  };
  const AB = ec(93039);
  const AC = ec(94460);
  const AD = ec(89483);
  const AS = ec(16928);
  const AT = ec(95695);
  const Ad = ec(15315);
  const Ah = ec(38195);
  const Al = ec(18553);
  const Am = ec(20881);
  const An = ec(69466);
  const Au = ec(68366);
  const Av = ec(91943);
  const Aw = ec(6350);
  const t3 = ec(99006);
  const t4 = ec(71389);
  const t5 = ec(80699);
  const t6 = ec(47005);
  const t7 = ec(29827);
  const t8 = ec(94317);

  let AbortedStreamDraftStore = class AbortedStreamDraftStore {
    constructor() {
      ((this.toolCallDrafts = new Map()),
        (this.toolCallIndexToId = new Map()),
        (this.committedRefs = new WeakSet()),
        (this.committedKeys = new Set()));
    }
    ingestModelStreamEvent(eA) {
      "output_text_delta" === eA.type
        ? this.appendAssistantText(eA.delta)
        : "model" === eA.type && this.ingestRawModelEvent(eA.event);
    }
    markCommitted(eA) {
      let el = eA;
      for (let eA of (el && "object" == typeof el && this.committedRefs.add(el),
      this.getItemKeys(el)))
        this.committedKeys.add(eA);
      if ("message" === el.type && "assistant" === el.role) {
        this.assistantMessageDraft = void 0;
        return;
      }
      if ("reasoning" === el.type) {
        this.reasoningDraft = void 0;
        return;
      }
      "function_call" === el.type &&
        el.callId &&
        (this.toolCallDrafts.delete(el.callId),
        this.deleteToolCallIndex(el.callId));
    }
    flushAbortedItems(eA) {
      let el = [];
      for (let ec of (this.pushIfFlushable(el, this.reasoningDraft, eA),
      this.pushIfFlushable(el, this.assistantMessageDraft, eA),
      this.toolCallDrafts.values()))
        this.pushIfFlushable(el, ec, eA);
      return (this.resetDrafts(), el);
    }
    ingestRawModelEvent(eA) {
      eA &&
        "object" == typeof eA &&
        (this.ingestResponsesEvent(eA), this.ingestChatCompletionsEvent(eA));
    }
    ingestResponsesEvent(eA) {
      if (
        "response.output_item.added" === eA.type &&
        eA.item?.type === "function_call"
      ) {
        let el = eA.item.call_id || eA.item.id;
        "string" == typeof el &&
          el.length > 0 &&
          this.ensureToolCallDraft(el, eA.item.name || "");
        return;
      }
      if ("response.function_call_arguments.delta" === eA.type) {
        let el = eA.call_id;
        if ("string" != typeof el || 0 === el.length) return;
        let ec = this.ensureToolCallDraft(el, eA.name || "");
        "string" == typeof eA.delta &&
          (ec.arguments = `${ec.arguments || ""}${eA.delta}`);
      }
    }
    ingestChatCompletionsEvent(eA) {
      let el = eA.choices;
      if (Array.isArray(el))
        for (let eA of el) {
          let el = eA?.delta;
          if (!el || "object" != typeof el) continue;
          let ec = el.reasoning_content ?? el.reasoning;
          ("string" == typeof ec &&
            ec.length > 0 &&
            this.appendReasoningText(ec),
            Array.isArray(el.tool_calls) &&
              this.ingestChatToolCalls(el.tool_calls));
        }
    }
    ingestChatToolCalls(eA) {
      for (let el of eA) {
        if (!el || "object" != typeof el) continue;
        let eA = "number" == typeof el.index ? el.index : void 0,
          ec = this.resolveToolCallId(el.id, eA);
        if (!ec) continue;
        void 0 !== eA && this.toolCallIndexToId.set(eA, ec);
        let eu = "string" == typeof el.function?.name ? el.function.name : "",
          ed =
            "string" == typeof el.function?.arguments
              ? el.function.arguments
              : "",
          ep = this.ensureToolCallDraft(ec, eu);
        (eu && (ep.name = eu),
          ed && (ep.arguments = `${ep.arguments || ""}${ed}`));
      }
    }
    resolveToolCallId(eA, el) {
      return "string" == typeof eA && eA.length > 0
        ? eA
        : void 0 !== el
          ? this.toolCallIndexToId.get(el)
          : void 0;
    }
    appendAssistantText(eA) {
      if (!eA) return;
      let el = this.ensureAssistantMessageDraft(),
        ec = el.content?.[0];
      ec && (ec.text = `${ec.text || ""}${eA}`);
    }
    appendReasoningText(eA) {
      if (!eA) return;
      let el = this.ensureReasoningDraft(),
        ec = el.content?.[0];
      ec && (ec.text = `${ec.text || ""}${eA}`);
      let eu = el.rawContent?.[0];
      eu && (eu.text = `${eu.text || ""}${eA}`);
    }
    ensureAssistantMessageDraft() {
      return (
        this.assistantMessageDraft ||
          (this.assistantMessageDraft = {
            id: (0, t5.generateUUUID)(),
            type: "message",
            role: "assistant",
            status: "in_progress",
            content: [{ type: "output_text", text: "" }],
          }),
        this.assistantMessageDraft
      );
    }
    ensureReasoningDraft() {
      return (
        this.reasoningDraft ||
          (this.reasoningDraft = {
            id: (0, t5.generateUUUID)(),
            type: "reasoning",
            content: [{ type: "input_text", text: "" }],
            rawContent: [{ type: "reasoning_text", text: "" }],
            status: "in_progress",
          }),
        this.reasoningDraft
      );
    }
    ensureToolCallDraft(eA, el) {
      let ec = this.toolCallDrafts.get(eA);
      return (
        ec
          ? el && (ec.name = el)
          : ((ec = {
              id: (0, t5.generateUUUID)(),
              type: "function_call",
              callId: eA,
              name: el,
              arguments: "",
              status: "in_progress",
            }),
            this.toolCallDrafts.set(eA, ec)),
        ec
      );
    }
    pushIfFlushable(eA, el, ec) {
      !(!el || this.isCommitted(el)) &&
        this.hasMeaningfulContent(el) &&
        eA.push(this.toAbortedItem(el, ec));
    }
    toAbortedItem(eA, el) {
      let ec = {
        ...eA.providerData,
        messageId: el.messageId,
        model: el.model,
        ...(el.requestModelId ? { requestModelId: el.requestModelId } : {}),
        ...(el.requestModelName
          ? { requestModelName: el.requestModelName }
          : {}),
        ...(el.traceId ? { traceId: el.traceId } : {}),
        ...(el.conversationRequestId
          ? { conversationRequestId: el.conversationRequestId }
          : {}),
        isPartialAborted: !0,
      };
      return {
        ...eA,
        timestamp: el.timestamp,
        content: eA.content?.map((eA) => ({ ...eA })),
        rawContent: eA.rawContent?.map((eA) => ({ ...eA })),
        status: "incomplete",
        providerData: ec,
      };
    }
    hasMeaningfulContent(eA) {
      return "message" === eA.type && "assistant" === eA.role
        ? !!eA.content?.some(
            (eA) => "string" == typeof eA.text && eA.text.length > 0,
          )
        : "reasoning" === eA.type
          ? !!(
              eA.rawContent?.some((eA) => eA.text.length > 0) ||
              eA.content?.some(
                (eA) => "string" == typeof eA.text && eA.text.length > 0,
              )
            )
          : "function_call" === eA.type && !!(eA.callId && eA.name);
    }
    isCommitted(eA) {
      return (
        !!(eA && "object" == typeof eA && this.committedRefs.has(eA)) ||
        this.getItemKeys(eA).some((eA) => this.committedKeys.has(eA))
      );
    }
    getItemKeys(eA) {
      let el = [];
      return (
        eA.id && el.push(`id:${eA.id}`, `${eA.type || "unknown"}:${eA.id}`),
        eA.callId &&
          el.push(
            `callId:${eA.callId}`,
            `${eA.type || "unknown"}:${eA.callId}`,
          ),
        el
      );
    }
    deleteToolCallIndex(eA) {
      for (let [el, ec] of this.toolCallIndexToId)
        ec === eA && this.toolCallIndexToId.delete(el);
    }
    resetDrafts() {
      ((this.assistantMessageDraft = void 0),
        (this.reasoningDraft = void 0),
        this.toolCallDrafts.clear(),
        this.toolCallIndexToId.clear());
    }
  };
  let A_ = (() => {
    let eA = process.env.CODEBUDDY_ABORT_GRACE_MS;
    if (eA) {
      let el = parseInt(eA, 10);
      if (!isNaN(el) && el > 0) return el;
    }
    return 3e3;
  })();
  async function* createAbortableIterator(eA, el, ec) {
    if (!el.aborted)
      for (;;) {
        let eu,
          ed = null,
          ep = new Promise((eA) => {
            ((eu = () => {
              "function" ==
                typeof (ed = setTimeout(() => {
                  (ec.info(
                    `[AbortableIterator] Abort grace period (${A_}ms) expired, forcing exit`,
                  ),
                    eA({ done: !0, aborted: !0 }));
                }, A_)).unref && ed.unref();
            }),
              el.aborted
                ? eu()
                : el.addEventListener("abort", eu, { once: !0 }));
          });
        try {
          let el = await Promise.race([eA.next(), ep]);
          if (
            (ed && (clearTimeout(ed), (ed = null)),
            "aborted" in el && el.aborted)
          ) {
            try {
              eA.return?.();
            } catch {}
            return;
          }
          if (el.done) return;
          yield el.value;
        } catch (eA) {
          if ((ed && clearTimeout(ed), el.aborted))
            return void ec.info(
              "[AbortableIterator] Iterator threw after abort, exiting",
            );
          throw eA;
        } finally {
          el.aborted || el.removeEventListener("abort", eu);
        }
      }
  }
  let AI = class {
    constructor() {
      ((this.sessionSubject = new t7.BehaviorSubject(void 0)),
        (this.context = new t8.AsyncLocalStorage()),
        (this.skipHistoryContext = new t8.AsyncLocalStorage()),
        (this.sessionStartTimes = new Map()),
        (this.addHistoryLocks = new Map()),
        (this.resultSubscriptions = new Map()),
        (this.overridePermissionModes = new Map()),
        (this.overrideModels = new Map()),
        (this.overrideThinking = new Map()),
        (this.idleTimers = new Map()),
        (this.inflightSessionStarts = new WeakMap()));
    }
    run(eA, el) {
      return this.context.run(eA, el);
    }
    runWithoutHistory(eA) {
      return this.skipHistoryContext.run(!0, eA);
    }
    readTimestamp(eA) {
      let el = eA?.timestamp;
      if ("number" == typeof el && Number.isFinite(el)) return el;
    }
    setTimestamp(eA, el) {
      return (eA && "object" == typeof eA && (eA.timestamp = el), el);
    }
    ensureHistoryItemTimestamp(eA, el = Date.now()) {
      let ec = this.readTimestamp(eA);
      return void 0 !== ec ? ec : ((eA.timestamp = el), el);
    }
    stampModelStreamEventTimestamp(eA) {
      let el = this.readTimestamp(eA) ?? Date.now();
      return this.setTimestamp(eA, el);
    }
    stampModelHistoryItemTimestamp(eA) {
      return this.ensureHistoryItemTimestamp(eA);
    }
    isRecord(eA) {
      return "object" == typeof eA && null !== eA;
    }
    formatCreditForLog(eA) {
      if (!this.isRecord(eA) || !("credit" in eA)) return "undefined";
      let el = eA.credit;
      if (void 0 === el) return "undefined";
      try {
        return JSON.stringify(el) ?? String(el);
      } catch {
        return String(el);
      }
    }
    getCurrent() {
      let eA = this.context.getStore();
      return (
        eA ||
          (eA = t6.Context.getAttr(
            t3.CURRENT_CHAT_SESSION,
            t6.AttributeScope.Request,
          )),
        eA
      );
    }
    setCurrent(eA) {
      let el = this.sessionSubject.value;
      if (el && el.id === eA.id) {
        if (
          (this.logger.info?.(
            `[setCurrent] Same session ID (${eA.id}), reusing in-memory session object`,
          ),
          eA.options && (el.options = { ...el.options, ...eA.options }),
          eA.meta && Object.keys(eA.meta).length > 0)
        )
          for (let [ec, eu] of ((el.meta = el.meta || {}),
          Object.entries(eA.meta)))
            void 0 === eu || ec in el.meta || (el.meta[ec] = eu);
        if (!el.conversationReverted)
          for (let eA = el.history.length - 1; eA >= 0; eA--) {
            let ec = el.history[eA];
            if (ec?.id && !AB.InputItemUtils.isCustomInputItem(ec)) {
              el.lastMessageId = ec.id;
              break;
            }
          }
        if (el.abortController?.signal.aborted) {
          this.logger.info?.(
            `[setCurrent] Session ${el.id} abortController was aborted (reason=${el.abortController.signal.reason}), resetting`,
          );
          let eA = (0, AB.createAbortController)();
          ((el.abortController = eA), (el.abortSignal = eA.signal));
        }
        this.context.enterWith(el);
        try {
          t6.Context.setAttr(
            t3.CURRENT_CHAT_SESSION,
            el,
            t6.AttributeScope.Request,
          );
        } catch {}
        return;
      }
      if (el) {
        try {
          this.progressSyncService.stop(el.id);
        } catch (eA) {
          this.logger.warn?.("Failed to stop progress sync:", eA);
        }
        (el.resultSubject.complete(),
          el.inputSubject.complete(),
          el.historyReloadSubject.complete(),
          el.modelSubject.complete(),
          el.backgroundTaskSubject.complete(),
          el.agentStateSubject.complete(),
          el.interruptionSubject.complete(),
          el.localExecuteSubject.complete(),
          el.permissionModeSubject.complete(),
          el.queueSubject.complete());
        let eA = this.resultSubscriptions.get(el.id);
        eA && (eA.unsubscribe(), this.resultSubscriptions.delete(el.id));
        let ec = this.idleTimers.get(el.id);
        (ec && (clearTimeout(ec), this.idleTimers.delete(el.id)),
          this.agentTaskManager.clearBySession(el.id).catch((eA) => {
            this.logger.warn?.("Failed to clear agent tasks for session:", eA);
          }));
        try {
          this.cronSchedulerService.stop(el.id);
        } catch (eA) {
          this.logger.warn?.("Failed to stop cron scheduler:", eA);
        }
      }
      for (let el = eA.history.length - 1; el >= 0; el--) {
        let ec = eA.history[el];
        if (ec?.id && !AB.InputItemUtils.isCustomInputItem(ec)) {
          eA.lastMessageId = ec.id;
          break;
        }
      }
      if ((this.sessionSubject.next(eA), eA)) {
        (this.progressSyncService.start(eA).catch((eA) => {
          this.logger.warn?.("Failed to start progress sync:", eA);
        }),
          this.handleRunResult(eA));
        try {
          this.cronSchedulerService.start(eA);
        } catch (eA) {
          this.logger.warn?.("Failed to start cron scheduler:", eA);
        }
      }
      this.context.enterWith(eA);
      try {
        t6.Context.setAttr(
          t3.CURRENT_CHAT_SESSION,
          eA,
          t6.AttributeScope.Request,
        );
      } catch {}
    }
    async getMostRecent() {
      return this.sessionStore.getMostRecent();
    }
    resetIdleTimer(eA) {
      let el = this.idleTimers.get(eA.id);
      el && clearTimeout(el);
      let ec = setTimeout(async () => {
        this.idleTimers.delete(eA.id);
        try {
          if (!this.stateMachine.isIdle(eA))
            return void this.resetIdleTimer(eA);
          await this.sessionHookManager.executeNotificationHooks(
            eA,
            "CodeBuddy is waiting for your input",
            Ah.NotificationType.IDLE_PROMPT,
          );
        } catch (eA) {
          this.logger.warn?.("Notification (idle) hook failed:", eA);
        }
      }, 6e4);
      this.idleTimers.set(eA.id, ec);
    }
    async addHistory(eA, el) {
      if (this.skipHistoryContext.getStore())
        return void this.logger.debug?.(
          `[addHistory] SKIPPED by skipHistoryContext, sessionId=${eA.id}, types=[${Array.isArray(el) ? el.map((eA) => eA.type).join(", ") : "string"}]`,
        );
      let ec = this.addHistoryLocks.get(eA.id) || Promise.resolve(),
        eu = Array.isArray(el) ? el.map((eA) => eA.type).join(", ") : "string",
        ed = Array.isArray(el)
          ? el
              .map(
                (eA) => `{type: ${eA.type}, id: ${"id" in eA ? eA.id : "N/A"}}`,
              )
              .join(", ")
          : `string(${el.substring(0, 50)}...)`;
      this.logger.info(
        `[addHistory] START sessionId=${eA.id}, storeId=${eA.storeId}, types=[${eu}], input=[${ed}]`,
      );
      let ep = ec.then(async () => {
        this.logger.debug(`[addHistory] LOCK_ACQUIRED sessionId=${eA.id}`);
        let ec = Array.isArray(el) ? el : [(0, Al.user)(el)];
        for (let el of (this.logger.debug(
          `[addHistory] PARSED itemCount=${ec.length}, sessionId=${eA.id}`,
        ),
        ec))
          (this.ensureHistoryItemTimestamp(el),
            await this.processInputItem(el, eA),
            eA.history.push(el),
            eA.inputSubject.next(el),
            eA.combineSubject.next({ type: "input", data: el }),
            this.logger.debug(
              `[addHistory] ITEM_ADDED type=${el.type}, sessionId=${eA.id}, historyLength=${eA.history.length}`,
            ));
        let eu =
            !Array.isArray(el) ||
            el.some((eA) => "message" === eA.type && "user" === eA.role),
          ed = ec.some(
            (eA) =>
              AB.InputItemUtils.isRealUserMessageItem(eA) &&
              eA.providerData?.agent !== An.AgentNames.COMPACT,
          );
        (eu &&
          ed &&
          (eA.meta?.parentSessionId ||
            (this.logger.debug(
              `[addHistory] EXECUTING_USER_PROMPT_SUBMIT_HOOKS sessionId=${eA.id}`,
            ),
            await this.sessionHookManager.executeUserPromptSubmitHooks(
              eA,
              ec,
            ))),
          AB.HistoryUtils.hasRealUserMessageItem(ec) &&
            (this.logger.debug(
              `[addHistory] CREATING_CHECKPOINT sessionId=${eA.id}`,
            ),
            await t5.ContainerUtil.get(Ad.CheckpointService).createCheckpoint(
              eA,
            )));
        let ep = eA.storeId ?? eA.id,
          eg = eA.meta?.parentSessionId;
        this.logger.debug(
          `[addHistory] BEFORE_APPEND fileId=${ep}, sessionId=${eA.id}, itemCount=${ec.length}`,
        );
        try {
          (await this.sessionStore.appendHistory(ep, ec, eg, eA),
            this.logger.debug(
              `[addHistory] APPEND_SUCCESS fileId=${ep}, sessionId=${eA.id}`,
            ));
        } catch (el) {
          throw (
            this.logger.error(
              `[addHistory] APPEND_HISTORY_FAILED fileId=${ep}, sessionId=${eA.id}, error=${el}`,
            ),
            el
          );
        }
        (this.resetIdleTimer(eA),
          this.logger.info(`[addHistory] COMPLETED sessionId=${eA.id}`));
      });
      (this.addHistoryLocks.set(eA.id, ep),
        await ep.finally(() => {
          this.addHistoryLocks.get(eA.id) === ep &&
            (this.addHistoryLocks.delete(eA.id),
            this.logger.debug(`[addHistory] LOCK_RELEASED sessionId=${eA.id}`));
        }));
    }
    async emitSessionStart(eA, el) {
      if ("startup" === el || "resume" === el) {
        let ec = this.inflightSessionStarts.get(eA);
        if (ec)
          return (
            this.logger.debug(
              `[SessionManager] emitSessionStart(${el}) joining in-flight emit for session ${eA.id}`,
            ),
            ec
          );
      }
      let ec = (async () => {
        try {
          await this.sessionHookManager.executeSessionStartHooks(eA, el);
        } catch (eA) {
          this.logger.error(
            `[SessionManager] emitSessionStart(${el}) failed:`,
            eA,
          );
        }
      })();
      return (this.inflightSessionStarts.set(eA, ec), ec);
    }
    async create(eA, el) {
      let ec = await this.sessionFactory.create(eA);
      (this.sessionStartTimes.set(ec.id, Date.now()),
        await t5.ContainerUtil.get(Aw.ToolPermissionService).initializeContext(
          ec,
        ),
        this.userStateManager?.incrementSession().catch((eA) => {
          this.logger.error("Failed to increment session count:", eA);
        }));
      try {
        t5.ContainerUtil.get(Au.TeamInboxDispatchService).register(ec);
      } catch {}
      try {
        t5.ContainerUtil.get(t3.IdleQueueDrainService).register(ec);
      } catch {}
      return (el && this.handleRunResult(ec), ec);
    }
    initRunResultHandler(eA) {
      let el = this.resultSubscriptions.get(eA.id);
      (el && (el.unsubscribe(), this.resultSubscriptions.delete(eA.id)),
        this.handleRunResult(eA));
    }
    async handleRunResult(eA) {
      if (this.resultSubscriptions.has(eA.id)) return;
      this.interruptionService.waitFor(eA);
      let el = eA.resultSubject.subscribe(async (el) => {
        let ec, eu;
        if (!el) return;
        if (el.__cancelNudge)
          return void this.logger.info(
            `[SessionManager] Skip cancel-nudge result, session=${eA.id}`,
          );
        ((eA.state = el.state),
          (eA.interceptorGate = {
            completed: new Promise((eA) => {
              ec = eA;
            }),
            resolve: (eA) => ec(eA),
          }));
        let ed = !0,
          ep = {};
        try {
          let ec = Date.now(),
            eu = eA.telemetry
              ? {
                  modelId: eA.telemetry.modelId,
                  modelName: eA.telemetry.modelName,
                  currentTurn: eA.telemetry.currentTurn,
                  traceId: eA.telemetry.traceId,
                }
              : void 0;
          (this.galileoSessionBridge.emitRequestStart(eA, eu),
            this.galileoSessionBridge.emitMessageStart(eA),
            AB.RunResultUtils.isStream(el)
              ? (this.logger.info(
                  `[SessionManager] handleStreamRunResult START — session=${eA.id}`,
                ),
                await this.handleStreamRunResult(eA, el, ep),
                this.logger.info(
                  `[SessionManager] handleStreamRunResult DONE — session=${eA.id}, elapsed=${Date.now() - ec}ms`,
                ))
              : await this.handleNonStreamRunResult(eA, el, ep));
        } catch (el) {
          ((eu = el),
            (ed = !1),
            this.logger.error("Failed to handle run result:", el),
            this.stateMachine.transition(eA, {
              type: t4.SessionRunEventType.RUN_FAILED,
              reason: "handle-run-result-error",
            }));
        } finally {
          let eg = !1,
            eh = null;
          if (AB.RunResultUtils.isStream(el)) {
            try {
              this.logger.info(
                `[SessionManager] await result.completed START — session=${eA.id}, agent=${eA.agentName}`,
              );
              let ec = Date.now();
              (await el.completed,
                this.logger.info(
                  `[SessionManager] await result.completed DONE — session=${eA.id}, elapsed=${Date.now() - ec}ms`,
                ));
            } catch (el) {
              ((eh = el),
                this.logger.info(
                  `[SessionManager] await result.completed ERROR — session=${eA.id}, error=${el?.message || el}`,
                ));
            }
            let ec = el._hasInterruptions,
              eu = el.interruptions?.length ?? 0;
            ((ec ?? (el.interruptions && el.interruptions.length > 0)) &&
              ((eg = !0),
              this.logger.info(
                `[SessionManager][Gate] willRetry=true reason=interruptions session=${eA.id} stamped=${ec} liveLen=${eu}`,
              )),
              !eg &&
                el.error &&
                AB.ErrorUtils.isNetworkError(el.error) &&
                ((eg = !0),
                this.logger.info(
                  `[SessionManager][Gate] willRetry=true reason=networkError session=${eA.id} errorCode=${el.error?.code}`,
                )),
              !eg &&
                eh &&
                AB.ErrorUtils.isRetryableModelError(eh) &&
                ((eg = !0),
                this.logger.info(
                  `[SessionManager][Gate] willRetry=true reason=retryableModelError session=${eA.id} errorType=${eh?.constructor?.name}`,
                )),
              !eg &&
                eh &&
                AB.ErrorUtils.isStreamTimeoutError(eh) &&
                ((eg = !0),
                this.logger.info(
                  `[SessionManager][Gate] willRetry=true reason=streamTimeout session=${eA.id}`,
                )),
              !eg &&
                eA.meta?.retryInProgress &&
                ((eg = !0),
                this.logger.info(
                  `[SessionManager][Gate] willRetry=true reason=retryInProgress session=${eA.id}`,
                )),
              !eg &&
                eA.isCompressing &&
                ((eg = !0),
                this.logger.info(
                  `[SessionManager][Gate] willRetry=true reason=compacting session=${eA.id}`,
                )));
          }
          if (!eg)
            try {
              if (this.interceptors && this.interceptors.length > 0)
                for (let ec of this.interceptors)
                  try {
                    let eu = await ec.intercept({
                      session: eA,
                      result: el,
                      modelResponseMetadata: ep,
                    });
                    if (!0 === eu) {
                      ((eg = !0),
                        this.logger.info(
                          `[SessionManager][Gate] willRetry=true reason=interceptor session=${eA.id} interceptor=${ec.constructor?.name}`,
                        ));
                      break;
                    }
                  } catch (eA) {
                    this.logger.warn("ModelResponseInterceptor error:", eA);
                  }
            } catch (eA) {
              this.logger.warn(`Failed to run session interceptors: ${eA}`);
            }
          (this.logger.info(
            `[SessionManager][Gate] resolve willRetry=${eg} session=${eA.id}`,
          ),
            ec(eg));
          let ef = eA.telemetry
            ? {
                modelId: eA.telemetry.modelId,
                modelName: eA.telemetry.modelName,
                currentTurn: eA.telemetry.currentTurn,
                traceId: eA.telemetry.traceId,
              }
            : void 0;
          if (
            eg &&
            ((eh && AB.ErrorUtils.isRetryableModelError(eh)) ||
              (eh && AB.ErrorUtils.isStreamTimeoutError(eh)) ||
              (el.error && AB.ErrorUtils.isNetworkError(el.error)) ||
              eA.meta?.retryInProgress)
          )
            (this.logger.info(
              `[SessionManager] Skipping telemetry report — auto-retry in progress, session=${eA.id}, error=${eu?.message || eu?.constructor?.name || "none"}`,
            ),
              (eA.telemetry = void 0));
          else {
            try {
              await this.telemetryService.reportChatRequestResponseTelemetry(
                eA,
                el,
                ed,
                eu,
                ep,
              );
            } catch (eA) {
              this.logger.warn(
                "Failed to report agent execution end telemetry:",
                eA,
              );
            }
            if (
              (ed &&
                (this.galileoSessionBridge.emitRequestSuccess(eA, ef, ep),
                this.galileoSessionBridge.addRequestSuccessSpanEvent(
                  eA,
                  ef,
                  ep,
                )),
              !ed &&
                eu &&
                (this.galileoSessionBridge.emitRequestError(eA, ef, eu, ep),
                this.galileoSessionBridge.addRequestErrorSpanEvent(
                  eA,
                  ef,
                  eu,
                  ep,
                )),
              !ed)
            ) {
              try {
                let el = AB.ErrorUtils.mapMessageErrorCode(eu) || "unknown";
                this.telemetryService.reportChatMessageStatus(eA, el, eu);
              } catch (eA) {
                this.logger.warn(
                  "Failed to report chat message status telemetry:",
                  eA,
                );
              }
              eu &&
                (this.galileoSessionBridge.emitMessageError(eA, ef, eu),
                this.galileoSessionBridge.addMessageErrorSpanEvent(eA, ef, eu));
            }
          }
        }
      });
      this.resultSubscriptions.set(eA.id, el);
    }
    async handleStreamRunResult(eA, el, ec) {
      let eu = eA.traceId,
        ed = eA.conversationRequestId,
        ep =
          eA.telemetry?.modelId ||
          eA.requestOptions?.model ||
          eA.options?.model ||
          "",
        eg = eA.telemetry?.modelName || "",
        eh = null,
        ef = !1,
        em = !1,
        eE = {
          Write: "file",
          Edit: "edits",
          MultiEdit: "edits",
          NotebookEdit: "notebook",
        },
        eC = new AbortedStreamDraftStore();
      for await (let ey of createAbortableIterator(
        el[Symbol.asyncIterator](),
        eA.abortSignal,
        this.logger,
      )) {
        if (eA.abortSignal.aborted) {
          ((ec.finishReason = "aborted"),
            el.lastAgent?.emit("agent_end", el.state._context));
          break;
        }
        if ("run_item_stream_event" === ey.type) {
          if ("reasoning_item" === ey.item.type) {
            let el = ey.item.rawItem;
            (this.stampModelHistoryItemTimestamp(el),
              el.providerData || (el.providerData = {}),
              eA.traceId && (eu = eA.traceId),
              (el.providerData = {
                ...el.providerData,
                messageId: eA.messageId || "",
                model: ec.model || eA.telemetry?.modelId || "",
                requestModelId: ep,
                requestModelName: eg,
                ...(eu ? { traceId: eu } : {}),
                ...(ed ? { conversationRequestId: ed } : {}),
              }),
              await this.addHistory(eA, [{ ...el }]),
              eC.markCommitted(el));
          } else if ("tool_approval_item" !== ey.item.type) {
            let ef = ey.item.rawItem;
            (this.stampModelHistoryItemTimestamp(ef),
              "function_call" === ef.type || "function_call_result" === ef.type
                ? this.logger.debug(
                    `Received stream item type: ${ef.type}, callId: ${ef.callId}`,
                  )
                : this.logger.debug(`Received stream item type: ${ef.type}`),
              ef.providerData || (ef.providerData = {}),
              eA.traceId && (eu = eA.traceId),
              (ef.providerData = {
                ...ef.providerData,
                messageId: eA.messageId || "",
                model: ec.model || eA.telemetry?.modelId || "",
                requestModelId: ep,
                requestModelName: eg,
                ...(eu ? { traceId: eu } : {}),
                ...(ed ? { conversationRequestId: ed } : {}),
              }));
            let em = !1;
            if (el.rawResponses) {
              let eA = el.rawResponses[el.rawResponses.length - 1];
              eA &&
                eA.output[eA.output.length - 1] === ef &&
                ((eh = ef), (em = !0));
            }
            let eE = { ...ef };
            (em &&
              ((eE.providerData = {
                ...eE.providerData,
                _isLastResponseItem: !0,
              }),
              ec.usage
                ? ((eE.providerData.rawUsage = ec.usage), (eh = null))
                : (eh = eE)),
              await this.addHistory(eA, [eE]),
              eC.markCommitted(ef));
          }
        } else if ("raw_model_stream_event" === ey.type) {
          if (
            (this.stampModelStreamEventTimestamp(ey.data),
            eC.ingestModelStreamEvent(ey.data),
            "model" === ey.data.type)
          ) {
            if (!ef) {
              let el = ey.data.event?.choices,
                ec = ey.data.event?.type;
              (el?.length ||
                (ec &&
                  ("response.text.delta" === ec ||
                    "response.output_item.added" === ec ||
                    "response.function_call_arguments.delta" === ec))) &&
                ((ef = !0),
                this.stateMachine.transition(eA, {
                  type: t4.SessionRunEventType.MODEL_STREAM_STARTED,
                }));
            }
            let el = ey.data.event?.model,
              eu = ey.data.event?.choices,
              ed = ey.data.event?.usage;
            if (
              (el &&
                ((ec.model = el),
                eA.meta || (eA.meta = {}),
                (eA.meta.responseModelId = el)),
              eu)
            )
              for (let el of eu) {
                if (!em && el.delta?.tool_calls?.length) {
                  let ec = el.delta.tool_calls[0],
                    eu = ec.function?.name;
                  if (eu) {
                    em = !0;
                    let el = eE[eu] || eu;
                    this.stateMachine.transition(eA, {
                      type: t4.SessionRunEventType.MODEL_STREAM_STARTED,
                      streamingToolName: el,
                    });
                  }
                }
                if (el.finish_reason)
                  if (
                    ((ec.finishReason = el.finish_reason),
                    eA.meta || (eA.meta = {}),
                    (eA.meta.lastFinishReason = el.finish_reason),
                    "content_filter" === el.finish_reason ||
                      "content-filter" === el.finish_reason)
                  ) {
                    let eu = el.delta?.content || el.message?.content;
                    (eu && (ec.contentFilterMessage = eu),
                      (ec.contentFilterMessageId = eA.messageId));
                    let ed =
                      AB.InputItemUtils.findLatestContentFilterCandidateUserMessageId(
                        eA.history,
                        eA.lastUserMessageId,
                      );
                    ed
                      ? (eA.meta.lastContentFilterUserMessageId = ed)
                      : delete eA.meta.lastContentFilterUserMessageId;
                  } else delete eA.meta.lastContentFilterUserMessageId;
              }
            ed &&
              ((ec.usage = ed),
              this.logger.info(
                `[SessionManager][credit] Credit received: rootRequestId=${eA.meta?.rootRequestId ?? "unknown"}, source=raw_model_stream_event, credit=${this.formatCreditForLog(ed)}`,
              ),
              eh &&
                (eh.providerData || (eh.providerData = {}),
                (eh.providerData.rawUsage = ed),
                (eh = null)));
            let ep = ey.data.event;
            if (
              !em &&
              ep?.type === "response.output_item.added" &&
              ep.item?.type === "function_call" &&
              ep.item.name
            ) {
              em = !0;
              let el = eE[ep.item.name] || ep.item.name;
              this.stateMachine.transition(eA, {
                type: t4.SessionRunEventType.MODEL_STREAM_STARTED,
                streamingToolName: el,
              });
            }
          } else if ("response_done" === ey.data.type) {
            (this.stateMachine.transition(eA, {
              type: t4.SessionRunEventType.MODEL_RESPONSE_DONE,
            }),
              (ef = !1),
              (em = !1),
              ey.data.response.output.length <= 0 &&
                !eA.structuredOutput &&
                ((el.silentAbort = !0),
                this.logger.info(
                  "Aborting session in session-manager, reason: empty response output from model",
                ),
                eA.abortController.abort()),
              (ey.data.response.id = eA.messageId || ""),
              eh &&
                ey.data.response?.usage &&
                (eh.providerData || (eh.providerData = {}),
                (eh.providerData.rawUsage = ey.data.response.usage),
                (eh = null)));
            let eu = ey.data.response?.usage;
            this.logger.info(
              `[SessionManager][credit] Credit received: rootRequestId=${eA.meta?.rootRequestId ?? "unknown"}, source=response_done, credit=${this.formatCreditForLog(eu)}`,
            );
            let ed = eu
              ? {
                  ...eu,
                  inputTokensDetails: Array.isArray(eu.inputTokensDetails)
                    ? eu.inputTokensDetails[0]
                    : eu.inputTokensDetails,
                  outputTokensDetails: Array.isArray(eu.outputTokensDetails)
                    ? eu.outputTokensDetails[0]
                    : eu.outputTokensDetails,
                }
              : void 0;
            (this.telemetryService.reportMessageResponseTelemetryStream(
              eA,
              ed,
              ec,
              el.error,
            ),
              this.telemetryService.reportChatMessageStatus(eA, "0"),
              this.galileoSessionBridge.emitMessageSuccess(eA),
              this.galileoSessionBridge.addMessageSuccessSpanEvent(eA));
          }
          (eA.modelSubject.next(ey.data),
            eA.combineSubject.next({ type: "model", data: ey.data }));
        }
      }
      if (eA.abortSignal.aborted) {
        ec.finishReason ||
          ((ec.finishReason = "aborted"),
          el.lastAgent?.emit("agent_end", el.state._context));
        let eh = eC.flushAbortedItems({
          messageId: eA.messageId || "",
          model: ec.model || eA.telemetry?.modelId || "",
          timestamp: Date.now(),
          requestModelId: ep,
          requestModelName: eg,
          traceId: eu,
          conversationRequestId: ed,
        });
        if (eh.length > 0)
          try {
            (this.logger.info(
              `[AbortedStreamDraftStore] handleStreamRunResult: persisting ${eh.length} partial item(s) after abort, sessionId=${eA.id}, types=[${eh.map((eA) => eA.type).join(", ")}]`,
            ),
              await this.addHistory(eA, eh));
          } catch (eA) {
            this.logger.warn?.(
              `[AbortedStreamDraftStore] handleStreamRunResult: failed to persist partial items after abort: ${eA}`,
            );
          }
      }
      ("content_filter" === ec.finishReason ||
        "content-filter" === ec.finishReason) &&
        ec.contentFilterMessageId &&
        (await this.handleContentFilteredResponse(
          eA,
          ec.contentFilterMessageId,
        ));
    }
    async handleContentFilteredResponse(eA, el) {
      try {
        if (
          (await this.flushHistory(eA),
          eA.history.some(
            (eA) =>
              AB.InputItemUtils.isContentFilterNoticeItem(eA) &&
              eA.providerData?.messageId === el,
          ))
        )
          return;
        let ec = eA.history.find(
          (eA) =>
            eA.providerData?.messageId === el &&
            ("reasoning" === eA.type ||
              "function_call" === eA.type ||
              "function_call_result" === eA.type ||
              ("message" === eA.type && "assistant" === eA.role)),
        );
        if (!ec)
          return void this.logger.info(
            `[ContentFilter] no filtered items for messageId=${el}, skip fork`,
          );
        let eu = eA.meta?.lastContentFilterUserMessageId ?? ec.parentId,
          ed = AB.InputItemUtils.createContentFilterNoticeMessage(
            el,
            ec.parentId,
            eu,
          );
        await this.addHistory(eA, [ed]);
        try {
          eA.historyReloadSubject.next({ reason: "content-filter" });
        } catch (eA) {
          this.logger.warn?.(
            `[ContentFilter] historyReloadSubject.next failed: ${eA}`,
          );
        }
        this.logger.info(
          `[ContentFilter] forked past filtered round messageId=${el}, notice.parentId=${ec.parentId ?? "none"}, strippedUserMessageId=${eu ?? "none"}, historyLen=${eA.history.length}`,
        );
      } catch (eA) {
        this.logger.warn?.(
          `[ContentFilter] handleContentFilteredResponse failed: ${eA}`,
        );
      }
    }
    async handleNonStreamRunResult(eA, el, ec) {
      for (let ec of el.newItems) await this.addHistory(eA, [ec.rawItem]);
    }
    async processInputItem(eA, el) {
      for (let ec of this.agentInputItemProcessorProvider.sortSync())
        await ec.process(eA, el);
    }
    async flushHistory(eA) {
      let el = this.addHistoryLocks.get(eA.id);
      el && (await el);
    }
    save(eA, el) {
      return el
        ? this.sessionStore.saveHistory(eA)
        : this.sessionStore.save(eA);
    }
    async get(eA, el) {
      return await this.sessionStore.get(eA, el);
    }
    getSessionFilePath(eA) {
      let el = eA.storeId ?? eA.id,
        ec = eA.meta?.parentSessionId;
      return this.sessionStore.getSessionFilePath(el, ec);
    }
    getAll() {
      return this.sessionStore.getAll();
    }
    getAllAcrossProjects() {
      return this.sessionStore.getAllAcrossProjects();
    }
    getAllByWorkdir(eA, el) {
      return this.sessionStore.getAllByWorkdir(eA, el);
    }
    async remove(eA) {
      let el = this.resultSubscriptions.get(eA);
      el && (el.unsubscribe(), this.resultSubscriptions.delete(eA));
      let ec = this.idleTimers.get(eA);
      (ec && (clearTimeout(ec), this.idleTimers.delete(eA)),
        this.sessionStartTimes.delete(eA));
      try {
        await this.agentTaskManager.clearBySession(eA);
      } catch (eA) {
        this.logger.warn?.("Failed to clear agent tasks for session:", eA);
      }
      try {
        this.cronSchedulerService.stop(eA);
      } catch (eA) {
        this.logger.warn?.("Failed to stop cron scheduler on remove:", eA);
      }
      return this.sessionStore.remove(eA);
    }
    async rename(eA, el) {
      try {
        let ec = {
          type: "custom-title",
          id: (0, t5.generateUUUID)(),
          customTitle: el.trim(),
          sessionId: eA.id,
        };
        if (
          (await this.addHistory(eA, [ec]),
          this.sessionSubject.value?.id === eA.id)
        )
          try {
            t5.ContainerUtil.get(AC.TerminalTitleUpdater).update(
              (0, Am.getEffectiveSessionTitle)(eA.history) || "",
            );
          } catch (eA) {
            this.logger.warn?.(
              "Failed to sync terminal title after rename:",
              eA,
            );
          }
      } catch (eA) {
        throw (this.logger.error("Failed to rename session:", eA), eA);
      }
    }
    setOverridePermissionMode(eA, el) {
      this.overridePermissionModes.set(eA, el);
    }
    getOverridePermissionMode(eA) {
      return this.overridePermissionModes.get(eA);
    }
    setOverrideModel(eA, el) {
      this.overrideModels.set(eA, el);
    }
    getOverrideModel(eA) {
      return this.overrideModels.get(eA);
    }
    setOverrideThinking(eA, el) {
      null === el
        ? this.overrideThinking.delete(eA)
        : !1 === el.thinkingEnabled
          ? this.overrideThinking.set(eA, { thinkingEnabled: !1 })
          : this.overrideThinking.set(eA, { ...el });
    }
    getOverrideThinking(eA) {
      return this.overrideThinking.get(eA);
    }
  };
  let AR = ["summary", "topic"],
    Ak = ec(73571),
    AM = 1e3;
  function resolveSessionMaxItems(
    eA = process.env.CODEBUDDY_SESSION_MAX_ITEMS,
    el = AM,
  ) {
    if (void 0 === eA || "" === eA) return el;
    let ec = Number(eA);
    return Number.isFinite(ec) && Number.isInteger(ec) && !(ec <= 0) ? ec : el;
  }
  let Ax = class {
    constructor() {
      this.writeLocks = new Map();
    }
    getStorageDir() {
      return AB.PathUtils.getHomeProjectDir();
    }
    normalizeUsageFormat(eA) {
      if (!eA || "object" != typeof eA) return eA;
      let el = {};
      ("inputTokens" in eA
        ? (el.input_tokens = eA.inputTokens)
        : "input_tokens" in eA && (el.input_tokens = eA.input_tokens),
        "outputTokens" in eA
          ? (el.output_tokens = eA.outputTokens)
          : "output_tokens" in eA && (el.output_tokens = eA.output_tokens),
        "totalTokens" in eA
          ? (el.total_tokens = eA.totalTokens)
          : "total_tokens" in eA && (el.total_tokens = eA.total_tokens));
      let ec = AB.UsageUtils.getCacheReadTokens(eA);
      ec > 0 && (el.cache_read_input_tokens = ec);
      let eu = AB.UsageUtils.getCacheCreationTokens(eA);
      return (eu > 0 && (el.cache_creation_input_tokens = eu), el);
    }
    async transformItemForSaveAsync(eA, el, ec) {
      let eu = { ...eA };
      if (eu.providerData?.usage) {
        let eA = eu.providerData.usage,
          el = this.normalizeUsageFormat(eA);
        ("message" === eu.type ||
          "assistant" === eu.type ||
          "function_call" === eu.type) &&
          (eu.message || (eu.message = {}), (eu.message.usage = el));
      }
      (eu.timestamp ||
        ((eu.timestamp = Date.now()), (eA.timestamp = eu.timestamp)),
        eu.cwd || AR.includes(eu.type) || (eu.cwd = AB.PathUtils.getWorkDir()),
        await this.replaceImageDataWithBlobRef(eu),
        el &&
          ("function_call_output" === eu.type ||
            "function_call_result" === eu.type) &&
          (await this.externalizeToolResultIfNeeded(eu, el, ec)),
        eu.output !== eA.output && (eA.output = eu.output));
      let {
        id: ed,
        parentId: ep,
        logicalParentId: eg,
        timestamp: eh,
        type: ef,
        role: em,
        ...eE
      } = eu;
      return {
        id: ed,
        parentId: ep,
        logicalParentId: eg,
        timestamp: eh,
        type: ef,
        role: em,
        ...eE,
      };
    }
    async replaceImageDataWithBlobRef(eA) {
      if (
        "message" === eA.type &&
        "user" === eA.role &&
        Array.isArray(eA.content)
      ) {
        eA.content = [...eA.content];
        for (let el = 0; el < eA.content.length; el++) {
          let ec = eA.content[el];
          if (
            ec?.type === "input_image" &&
            "string" == typeof ec.image &&
            ec.image.startsWith("data:")
          )
            try {
              let eu = await this.imageBlobService.storeFromDataUri(
                ec.image,
                ec.source,
                ec.original_filename,
              );
              eA.content[el] = eu;
            } catch (eA) {
              this.logger.warn(
                "Failed to replace image with blob ref in user message:",
                eA,
              );
            }
        }
      }
      ("function_call_output" === eA.type ||
        "function_call_result" === eA.type) &&
        (await this.replaceImageInFunctionCallOutput(eA));
    }
    async replaceImageInFunctionCallOutput(eA) {
      if (Array.isArray(eA.providerData?.toolResult?.content))
        for (let el = 0; el < eA.providerData.toolResult.content.length; el++) {
          let ec = eA.providerData.toolResult.content[el];
          if (
            ec?.type === "image_url" &&
            ec.image_url?.url?.startsWith("data:")
          )
            try {
              let eu = await this.imageBlobService.storeFromDataUri(
                ec.image_url.url,
              );
              eA.providerData.toolResult.content[el] = eu;
            } catch (eA) {
              this.logger.warn(
                "Failed to replace image in toolResult content:",
                eA,
              );
            }
        }
      let el =
        "string" == typeof eA.output
          ? eA.output
          : "string" == typeof eA.output?.text
            ? eA.output.text
            : "";
      if (el.includes("data:image/")) {
        let ec = el;
        try {
          let eA = JSON.parse(el);
          if (Array.isArray(eA)) {
            let el = !1;
            for (let ec = 0; ec < eA.length; ec++) {
              let eu = eA[ec];
              if (
                eu?.type === "image_url" &&
                eu.image_url?.url?.startsWith("data:")
              )
                try {
                  let ed = await this.imageBlobService.storeFromDataUri(
                    eu.image_url.url,
                  );
                  ((eA[ec] = ed), (el = !0));
                } catch (eA) {
                  this.logger.warn(
                    "Failed to replace image in output array:",
                    eA,
                  );
                }
            }
            el && (ec = JSON.stringify(eA));
          }
        } catch {
          let eA,
            eu = /data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/=]{1000,})/g,
            ed = [];
          for (; null !== (eA = eu.exec(el)); )
            ed.push({ full: eA[0], dataUri: eA[0] });
          for (let eA of ed)
            try {
              let el = await this.imageBlobService.storeFromDataUri(eA.dataUri),
                eu = JSON.stringify(JSON.stringify(el)).slice(1, -1);
              ec = ec.replace(eA.full, eu);
            } catch (eA) {
              this.logger.warn(
                "Failed to replace image data URI in function call output:",
                eA,
              );
            }
        }
        ec !== el &&
          ("string" == typeof eA.output
            ? (eA.output = ec)
            : eA.output?.text && (eA.output = { ...eA.output, text: ec }));
      }
    }
    async externalizeToolResultIfNeeded(eA, el, ec) {
      let eu,
        ed = eA.output;
      if (Array.isArray(ed))
        return void (await this.externalizeStructuredArrayOutput(
          eA,
          ed,
          el,
          ec,
        ));
      let ep = !1;
      if (
        ("string" == typeof ed
          ? (eu = ed)
          : "string" == typeof ed?.text && ((eu = ed.text), (ep = !0)),
        !eu ||
          !this.toolResultBlobService.shouldExternalize(eu) ||
          eu.startsWith("<persisted-output>"))
      )
        return;
      let eg = eA.callId || eA.call_id || eA.id || `unknown-${Date.now()}`;
      try {
        let ed = await this.toolResultBlobService.externalize(eg, eu, el, ec);
        ep ? (eA.output = { ...eA.output, text: ed }) : (eA.output = ed);
      } catch (eA) {
        this.logger.warn("Failed to externalize tool result:", eA);
      }
    }
    async externalizeStructuredArrayOutput(eA, el, ec, eu) {
      let ed = eA.callId || eA.call_id || eA.id || `unknown-${Date.now()}`,
        ep = !1,
        eg = [...el];
      for (let eA = 0; eA < eg.length; eA++) {
        let el = eg[eA];
        if (
          (el?.type === "input_text" || el?.type === "text") &&
          "string" == typeof el.text
        ) {
          let eh = el.text;
          if (
            !this.toolResultBlobService.shouldExternalize(eh) ||
            eh.startsWith("<persisted-output>")
          )
            continue;
          try {
            let ef = eg.length > 1 ? `${ed}_${eA}` : ed,
              em = await this.toolResultBlobService.externalize(ef, eh, ec, eu);
            ((eg[eA] = { ...el, text: em }), (ep = !0));
          } catch (el) {
            this.logger.warn(
              `Failed to externalize structured output element [${eA}]:`,
              el,
            );
          }
        }
      }
      ep && (eA.output = eg);
    }
    async ensureStorageDir() {
      try {
        await Av.mkdir(this.getStorageDir(), { recursive: !0 });
      } catch (eA) {}
    }
    getSessionFilePath(eA, el) {
      return el && eA.startsWith("agent-")
        ? AS.join(this.getStorageDir(), el, "subagents", `${eA}.jsonl`)
        : AS.join(this.getStorageDir(), `${eA}.jsonl`);
    }
    getSessionMetaFilePath(eA, el) {
      return el && eA.startsWith("agent-")
        ? AS.join(this.getStorageDir(), el, "subagents", `${eA}.meta.json`)
        : AS.join(this.getStorageDir(), `${eA}.meta.json`);
    }
    async findSubagentSessionByStoreId(eA, el) {
      if (eA.startsWith("agent-")) {
        let ec = this.getStorageDir();
        try {
          for (let eu of await Av.readdir(ec, { withFileTypes: !0 })) {
            if (!eu.isDirectory()) continue;
            let ed = AS.join(ec, eu.name, "subagents"),
              ep = AS.join(ed, `${eA}.jsonl`);
            try {
              await Av.access(ep);
              let eA = await this.deserializeSessionFromPath(ep, el);
              if (eA) return eA;
            } catch {
              continue;
            }
          }
        } catch {}
      }
    }
    async deserializeSessionFromJsonl(eA, el) {
      if (eA.startsWith("agent-")) {
        let ec = await this.findSubagentSessionByStoreId(eA, el);
        if (ec) return ec;
      }
      let ec = this.getSessionFilePath(eA),
        eu = await this.deserializeSessionFromPath(ec, el);
      if (eu) return eu;
    }
    async deserializeSessionFromPath(eA, el) {
      try {
        let ec, eu;
        (await Av.access(eA),
          this.logger.debug(`[SessionStore] File exists: ${eA}`));
        let ed = el?.historyLimit,
          ep = ed ?? resolveSessionMaxItems(),
          eg = [];
        (await Ak.eachLine(
          eA,
          (eA, el, ec) => {
            if (eA.trim())
              try {
                let el = JSON.parse(eA.trim());
                if ((eg.push(el), void 0 !== ed)) {
                  if (eg.length >= ep) return void ec(!1);
                } else if (
                  (eg.length >= ep &&
                    "message" === el.type &&
                    "user" === el.role) ||
                  eg.length > ep + 100
                )
                  return void ec(!1);
              } catch (eA) {}
            ec();
          },
          "\n",
          "utf8",
          65536,
        ),
          this.logger.debug(
            `[SessionStore] Read ${eg.length} history items from ${eA}`,
          ),
          eg.reverse());
        let { birthtimeMs: eh, mtimeMs: ef, ctimeMs: em } = await Av.stat(eA);
        (eh >= 1 / 0 || eh <= 0) && (eh = em);
        let eE = this.getSessionId(eA),
          eC = eE;
        if (eg.length > 0) {
          for (let eA of eg.slice(0, 10))
            if (eA.sessionId) {
              (eC = eA.sessionId) !== eE && (eu = eE);
              break;
            }
        }
        try {
          let el = eA.replace(/\.jsonl$/, ".meta.json"),
            eu = await Av.readFile(el, "utf-8");
          ec = JSON.parse(eu);
        } catch {}
        let ey = eg.some((eA) => eA.logicalParentId && !eA.parentId);
        return await this.sessionFactory.create({
          id: eC,
          storeId: eu,
          history: (0, AD.sanitizeContentBlockTypes)(eg, this.logger),
          createdAt: eh,
          updatedAt: ef,
          meta: ec,
          hasCompactedHistory: ey,
        });
      } catch (el) {
        this.logger.error(
          `[SessionStore] deserializeSessionFromPath failed for ${eA}:`,
          el,
        );
        return;
      }
    }
    getSessionId(eA) {
      return AS.basename(eA, AS.extname(eA));
    }
    getPreferredProjectDir(eA) {
      let el = eA?.trim();
      if (el)
        return AS.join(
          AB.PathUtils.getHomeProjectsDir(),
          AB.PathUtils.compressPath(el),
        );
    }
    async get(eA, el) {
      try {
        let ec = this.getPreferredProjectDir(el?.cwd);
        if (ec) {
          let eu = AS.join(ec, `${eA}.jsonl`);
          this.logger.debug(
            `[SessionStore] Looking for session ${eA} by cwd at: ${eu}`,
          );
          try {
            await Av.access(eu);
            let ec = await this.deserializeSessionFromPath(eu, el);
            if (ec)
              return (
                this.logger.debug(
                  `[SessionStore] Found session ${eA} in requested cwd project dir`,
                ),
                ec
              );
          } catch {}
        }
        let eu = this.getSessionFilePath(eA);
        this.logger.debug(
          `[SessionStore] Looking for session ${eA} at: ${eu}, storageDir=${this.getStorageDir()}, workDir=${AB.PathUtils.getWorkDir()}`,
        );
        let ed = await this.deserializeSessionFromJsonl(eA, el);
        if (ed)
          return (
            this.logger.debug(
              `[SessionStore] Found session ${eA} in current project dir`,
            ),
            ed
          );
        return (
          this.logger.debug(
            `[SessionStore] Session ${eA} not found in current project dir, searching across projects...`,
          ),
          (ed = await this.findSessionAcrossProjects(eA, el))
            ? this.logger.debug(
                `[SessionStore] Found session ${eA} in another project dir`,
              )
            : this.logger.warn(
                `[SessionStore] Session ${eA} not found anywhere`,
              ),
          ed
        );
      } catch (el) {
        this.logger.error(`Failed to load session ${eA}:`, el);
        return;
      }
    }
    async findSessionAcrossProjects(eA, el) {
      let ec = AB.PathUtils.getHomeProjectsDir();
      try {
        await Av.access(ec);
      } catch {
        return;
      }
      for (let eu of await Av.readdir(ec)) {
        let ed = AS.join(ec, eu);
        try {
          if (!(await Av.stat(ed)).isDirectory()) continue;
        } catch {
          continue;
        }
        let ep = AS.join(ed, `${eA}.jsonl`);
        try {
          return (await Av.access(ep), this.deserializeSessionFromPath(ep, el));
        } catch {
          continue;
        }
      }
    }
    async getMostRecent() {
      try {
        let eA = (await Av.readdir(this.getStorageDir())).filter((eA) =>
          eA.endsWith(".jsonl"),
        );
        if (0 === eA.length) return;
        let el = await Promise.all(
          eA.map(async (eA) => {
            let el = AS.join(this.getStorageDir(), eA),
              ec = await Av.stat(el);
            return { file: eA, filePath: el, mtime: ec.mtime.getTime() };
          }),
        );
        for (let { filePath: eA } of (el.sort((eA, el) => el.mtime - eA.mtime),
        el)) {
          let el = await this.get(this.getSessionId(eA));
          if (el && !this.isNonUserSession(el)) return el;
        }
        return;
      } catch (eA) {
        return;
      }
    }
    async save(eA) {
      if (!(0, AT.isSessionPersistenceDisabled)(eA))
        try {
          let el;
          await this.ensureStorageDir();
          let ec = eA.storeId ?? eA.id,
            eu = eA.meta?.parentSessionId,
            ed = this.getSessionFilePath(ec, eu);
          if (eu && ec.startsWith("agent-")) {
            let eA = AS.join(this.getStorageDir(), eu, "subagents");
            await Av.mkdir(eA, { recursive: !0 });
          }
          let ep = !0;
          try {
            let eA = await Av.stat(ed);
            eA.size > 0
              ? ((ep = !1), (el = `exists(${eA.size}bytes)`))
              : (el = "exists(empty)");
          } catch {
            el = "not_found";
          }
          if (
            (this.logger.info(
              `[SessionStore.save] fileId=${ec}, status=${el}, shouldCreate=${ep}, path=${ed}`,
            ),
            ep && (await Av.writeFile(ed, "", "utf-8")),
            eA.meta && Object.keys(eA.meta).length > 0)
          ) {
            let el = this.getSessionMetaFilePath(ec, eu);
            await Av.writeFile(el, JSON.stringify(eA.meta, null, 2), "utf-8");
          }
        } catch (eA) {
          throw (this.logger.error("Failed to save history:", eA), eA);
        }
    }
    async remove(eA, el) {
      try {
        let ec = this.getSessionFilePath(eA, el);
        (this.logger.info(`[SessionStore.remove] id=${eA}, path=${ec}`),
          await Av.unlink(ec));
        try {
          let ec = this.getSessionMetaFilePath(eA, el);
          await Av.unlink(ec);
        } catch {}
      } catch (eA) {}
    }
    async getAll() {
      try {
        let eA = (await Av.readdir(this.getStorageDir()))
          .filter((eA) => eA.endsWith(".jsonl"))
          .map(async (eA) => {
            try {
              let el = await this.get(this.getSessionId(eA));
              return el && !this.isNonUserSession(el) ? el : null;
            } catch (eA) {
              return null;
            }
          });
        return (await Promise.all(eA))
          .filter((eA) => null !== eA)
          .sort((eA, el) => (el.updatedAt || 0) - (eA.updatedAt || 0));
      } catch (eA) {
        return [];
      }
    }
    async getAllAcrossProjects(eA) {
      try {
        let el = AB.PathUtils.getHomeProjectsDir(),
          ec = eA?.sinceMs;
        try {
          await Av.access(el);
        } catch {
          return [];
        }
        let eu = await Av.readdir(el),
          ed = [];
        for (let eA of eu) {
          let eu = AS.join(el, eA);
          try {
            if (!(await Av.stat(eu)).isDirectory()) continue;
          } catch {
            continue;
          }
          try {
            for (let eA of (await Av.readdir(eu)).filter((eA) =>
              eA.endsWith(".jsonl"),
            ))
              try {
                let el = AS.join(eu, eA);
                if (ec && (await Av.stat(el)).mtimeMs < ec) continue;
                let ep = await this.deserializeSessionFromPath(el);
                ep && !this.isNonUserSession(ep) && ed.push(ep);
              } catch {
                continue;
              }
          } catch {
            continue;
          }
        }
        return (
          this.logger.info(
            `[SessionStore] Loaded ${ed.length} sessions across projects`,
          ),
          ed.sort((eA, el) => (el.updatedAt || 0) - (eA.updatedAt || 0))
        );
      } catch (eA) {
        return (
          this.logger.error("Failed to get all sessions across projects:", eA),
          []
        );
      }
    }
    async getAllByWorkdir(eA, el) {
      if ("*" === eA) return this.getAllAcrossProjects(el);
      if (!eA) return this.getAll();
      try {
        let ec = AB.PathUtils.getHomeProjectsDir(),
          eu = el?.sinceMs,
          ed = [];
        try {
          if (!(await Av.stat(eA)).isDirectory()) return [];
        } catch {
          return [];
        }
        try {
          await Av.access(ec);
        } catch {
          return [];
        }
        for (let el of await Av.readdir(ec)) {
          let ep = AS.join(ec, el);
          try {
            if (!(await Av.stat(ep)).isDirectory()) continue;
          } catch {
            continue;
          }
          try {
            for (let el of (await Av.readdir(ep)).filter((eA) =>
              eA.endsWith(".jsonl"),
            ))
              try {
                let ec = AS.join(ep, el);
                if (eu && (await Av.stat(ec)).mtimeMs < eu) continue;
                let eg = await this.deserializeSessionFromPath(ec);
                eg &&
                  !this.isNonUserSession(eg) &&
                  this.extractCwdFromSession(eg) === eA &&
                  ed.push(eg);
              } catch {
                continue;
              }
          } catch {
            continue;
          }
        }
        return ed.sort((eA, el) => (el.updatedAt || 0) - (eA.updatedAt || 0));
      } catch (eA) {
        return (
          this.logger.error("Failed to get sessions by workdir:", eA),
          []
        );
      }
    }
    extractCwdFromSession(eA) {
      for (let el of eA.history) if (el.cwd) return el.cwd;
    }
    isNonUserSession(eA) {
      return !!(
        AB.SessionUtils.isSubAgent(eA) || eA.meta?.isForkedCompactionSession
      );
    }
    async appendHistory(eA, el, ec, eu) {
      let ed;
      if ((0, AT.isSessionPersistenceDisabled)(eu)) return;
      let ep = this.writeLocks.get(eA) || Promise.resolve(),
        eg = new Promise((eA) => (ed = eA));
      this.writeLocks.set(
        eA,
        ep.then(() => eg),
      );
      try {
        if (
          (await ep,
          await this.ensureStorageDir(),
          ec && eA.startsWith("agent-"))
        ) {
          let eA = AS.join(this.getStorageDir(), ec, "subagents");
          await Av.mkdir(eA, { recursive: !0 });
        }
        let eu = this.getSessionFilePath(eA, ec),
          ed = (
            await Promise.all(
              el.map(async (el) => {
                let eu = await this.transformItemForSaveAsync(el, eA, ec);
                return JSON.stringify(eu) + "\n";
              }),
            )
          ).join("");
        await Av.appendFile(eu, ed, "utf-8");
        let eg = await Av.stat(eu).catch(() => null);
        this.logger.info(
          `[SessionStore.appendHistory] id=${eA}, items=${el.length}, bytesWritten=${ed.length}, fileSize=${eg?.size ?? "N/A"}`,
        );
      } catch (eA) {
        throw (this.logger.error("Failed to append history:", eA), eA);
      } finally {
        (ed(), this.writeLocks.get(eA) === eg && this.writeLocks.delete(eA));
      }
    }
    async saveHistory(eA) {
      if ((0, AT.isSessionPersistenceDisabled)(eA)) return;
      let el = eA.storeId ?? eA.id;
      (this.logger.info(
        `[SessionStore.saveHistory] fileId=${el}, historyLength=${eA.history.length}`,
      ),
        await this.save(eA));
      let ec = eA.meta?.parentSessionId;
      await this.appendHistory(el, eA.history, ec, eA);
    }
  };

  return {
    SessionManagerImpl: AI,
    SessionStoreImpl: Ax,
    AbortedStreamDraftStore,
    createAbortableIterator,
    resolveSessionMaxItems,
    isSessionPersistenceDisabled: AT.isSessionPersistenceDisabled,
  };
}
