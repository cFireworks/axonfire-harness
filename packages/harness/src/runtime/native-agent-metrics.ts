// @ts-nocheck
// Complete original 8395 factory including DI declarations and lifecycle registration.
export const AGENT_METRICS_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export function createNativeAgentMetrics(runtime: any) {
  const Date = runtime.Date ?? globalThis.Date,
    Reflect = runtime.Reflect ?? globalThis.Reflect,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const factories = {
    8395(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          AgentMetricsAggregator: () => em,
          AgentMetricsAggregatorImpl: () => eE,
        }));
      var eu,
        ed,
        ep,
        eg = ec(80699),
        eh = ec(92735),
        ef = ec(40602),
        __decorate = function (eA, el, ec, eu) {
          var ed,
            ep = arguments.length,
            eg =
              ep < 3
                ? el
                : null === eu
                  ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                  : eu;
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.decorate
          )
            eg = Reflect.decorate(eA, el, ec, eu);
          else
            for (var eh = eA.length - 1; eh >= 0; eh--)
              (ed = eA[eh]) &&
                (eg =
                  (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                  eg);
          return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
        },
        __metadata = function (eA, el) {
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.metadata
          )
            return Reflect.metadata(eA, el);
        };
      let em = Symbol("AgentMetricsAggregator"),
        eE = (eu = class {
          constructor() {
            this.window = this.createEmptyWindow();
          }
          onStart() {
            ((this.timer = setInterval(
              () => this.flush(),
              eu.FLUSH_INTERVAL_MS,
            )),
              this.timer.unref && this.timer.unref());
          }
          onStop() {
            (this.timer && (clearInterval(this.timer), (this.timer = void 0)),
              this.flush());
          }
          async flushOnly(eA) {
            try {
              this.flush();
            } catch (eA) {
              this.logger.warn(
                `[AgentMetricsAggregator] flushOnly window flush failed: ${eA}`,
              );
            }
            try {
              await this.galileo.forceFlush(eA);
            } catch (eA) {
              this.logger.warn(
                `[AgentMetricsAggregator] flushOnly galileo forceFlush failed: ${eA}`,
              );
            }
          }
          async flushAndShutdown(eA) {
            try {
              this.timer &&
                (clearInterval(this.timer),
                (this.timer = void 0),
                this.flush());
            } catch (eA) {
              this.logger.warn(
                `[AgentMetricsAggregator] final flush failed: ${eA}`,
              );
            }
            try {
              await this.galileo.shutdown(eA);
            } catch (eA) {
              this.logger.warn(
                `[AgentMetricsAggregator] galileo shutdown failed: ${eA}`,
              );
            }
          }
          recordRequestResult(eA, el, ec, eu, ed, ep) {
            if (
              (ec &&
                ((this.window.lastModel = ec),
                (this.window.lastModelName = ep ?? "")),
              this.window.requestTotal++,
              0 === eA)
            )
              this.window.requestSuccess++;
            else {
              this.window.requestFailed++;
              let eg = el ?? String(eA);
              (this.window.requestErrorCodes.set(
                eg,
                (this.window.requestErrorCodes.get(eg) ?? 0) + 1,
              ),
                this.galileo.logInfo("agent.request.error_brief", {
                  type: "custom_event",
                  name: "agent.request.error_brief",
                  error_code: String(eA),
                  error_message: eu?.slice(0, 500) ?? "",
                  model: ec ?? "",
                  model_name: ep ?? "",
                  conversation_request_id: ed ?? "",
                }));
            }
          }
          recordToolResult(eA, el, ec, eu, ed, ep, eg) {
            (this.window.toolTotal++, el && this.window.toolSuccess++);
            let eh = this.window.toolByName.get(eA);
            if (
              (eh
                ? ep &&
                  "builtin" === eh.mcpServer &&
                  "builtin" !== ep &&
                  (eh.mcpServer = ep)
                : ((eh = {
                    total: 0,
                    success: 0,
                    errorsByType: new Map(),
                    mcpServer: ep ?? "builtin",
                  }),
                  this.window.toolByName.set(eA, eh)),
              eh.total++,
              el)
            )
              eh.success++;
            else {
              let el = ec ?? "UNKNOWN";
              (eh.errorsByType.set(el, (eh.errorsByType.get(el) ?? 0) + 1),
                this.galileo.logInfo("agent.tool.error_brief", {
                  type: "custom_event",
                  name: "agent.tool.error_brief",
                  tool_name: eA,
                  error_type: el,
                  tool_error_code: eg ?? "99999",
                  error_message: eu?.slice(0, 500) ?? "",
                  call_id: ed ?? "",
                  mcp_server: ep ?? "builtin",
                }));
            }
          }
          recordTaskOutcome(eA, el) {
            let ec =
                el?.model && el.model.length > 0
                  ? el.model
                  : this.window.lastModel,
              eu =
                el?.modelName && el.modelName.length > 0
                  ? el.modelName
                  : this.window.lastModelName;
            this.window.taskTotal++;
            let ed = el?.scene ?? "",
              ep = el?.agentName ?? "",
              eg = `${eA}|${ec}|${eu}|${ed}|${ep}`;
            (this.window.taskOutcomes.set(
              eg,
              (this.window.taskOutcomes.get(eg) ?? 0) + 1,
            ),
              this.galileo.logInfo("agent.task.outcome_detail", {
                type: "custom_event",
                name: "agent.task.outcome_detail",
                prompt_request_id: el?.promptRequestId ?? "",
                conversation_request_id: el?.conversationRequestId ?? "",
                trace_id: el?.traceId ?? "",
                outcome: eA,
                failure_stage: this.resolveTaskFailureStage(eA),
                failure_category: this.resolveTaskFailureCategory(eA),
                model: ec,
                model_name: eu,
                scene: ed,
                agent_name: ep,
                stop_reason: el?.stopReason ?? "",
                error_category: el?.errorCategory ?? "",
                expert_id: el?.expertId ?? "",
              }));
          }
          resolveTaskFailureStage(eA) {
            return "SUCCESS" === eA || "PARTIAL_SUCCESS" === eA
              ? "none"
              : "cli_processing";
          }
          resolveTaskFailureCategory(eA) {
            switch (eA) {
              case "SUCCESS":
                return "success";
              case "PARTIAL_SUCCESS":
                return "partial_success";
              case "FAILED_MODEL_REQUEST":
                return "model_request";
              case "FAILED_TOOL_EXECUTION":
                return "tool_execution";
              case "FAILED_AGENT_LOOP":
                return "agent_loop";
              case "REFUSED_OR_BLOCKED":
                return "refused_or_blocked";
              case "PERMISSION_DENIED":
                return "permission_denied";
              case "CANCELLED":
                return "cancelled";
              case "UNKNOWN":
                return "unknown";
            }
          }
          recordCacheRate(eA, el, ec, eu) {
            ((this.window.cacheTokensTotal += eA),
              (this.window.inputTokensTotal += el));
          }
          recordToolCallsGenerated(eA) {
            this.window.toolCallsGenerated += eA;
          }
          recordTokenUsage(eA, el, ec, eu, ed, ep) {
            let eg = eu || "_unknown",
              eh = ep ?? "";
            eu &&
              ((this.window.lastModel = eu), (this.window.lastModelName = eh));
            let ef = this.window.tokenByModel.get(eg);
            (ef ||
              ((ef = {
                input: 0,
                output: 0,
                cached: 0,
                calls: 0,
                modelName: eh,
              }),
              this.window.tokenByModel.set(eg, ef)),
              (ef.input += eA),
              (ef.output += el),
              (ef.cached += ec),
              ef.calls++,
              eh && (ef.modelName = eh),
              this.galileo.recordDuration("agent.token.per_message", eA + el, {
                model: eg,
                model_name: ef.modelName,
              }));
          }
          flush() {
            let eA = this.window;
            if (
              0 !== eA.requestTotal ||
              0 !== eA.taskTotal ||
              0 !== eA.toolTotal ||
              0 !== eA.tokenByModel.size
            ) {
              try {
                (this.flushTaskMetrics(eA),
                  this.flushRequestMetrics(eA),
                  this.flushToolMetrics(eA),
                  this.flushCacheMetrics(eA),
                  this.flushToolCallbackRate(eA),
                  this.flushTokenUsageMetrics(eA));
              } catch (eA) {
                this.logger.warn(`[AgentMetricsAggregator] flush error: ${eA}`);
              }
              this.window = this.createEmptyWindow();
            }
          }
          flushTaskMetrics(eA) {
            if (0 !== eA.taskTotal)
              for (let [el, ec] of eA.taskOutcomes) {
                let [eA, eu, ed, ep, eg] = el.split("|");
                this.galileo.addCounter("agent.task.outcome", ec, {
                  outcome: eA,
                  model: eu || "",
                  model_name: ed || "",
                  scene: ep || "",
                  agent_name: eg || "",
                });
              }
          }
          flushRequestMetrics(eA) {
            if (0 !== eA.requestTotal)
              for (let [el, ec] of (this.galileo.addCounter(
                "agent.request.total",
                eA.requestTotal,
                {},
              ),
              this.galileo.addCounter(
                "agent.request.success",
                eA.requestSuccess,
                {},
              ),
              eA.requestFailed > 0 &&
                this.galileo.addCounter(
                  "agent.request.failed",
                  eA.requestFailed,
                  {},
                ),
              eA.requestErrorCodes))
                this.galileo.addCounter("agent.request.error", ec, {
                  error_code: el,
                });
          }
          flushToolMetrics(eA) {
            if (0 !== eA.toolTotal)
              for (let [el, ec] of eA.toolByName) {
                let eA = { tool_name: el, mcp_server: ec.mcpServer };
                for (let [el, eu] of (this.galileo.addCounter(
                  "agent.tool.total",
                  ec.total,
                  eA,
                ),
                this.galileo.addCounter("agent.tool.success", ec.success, eA),
                ec.errorsByType))
                  this.galileo.addCounter("agent.tool.failed", eu, {
                    ...eA,
                    error_type: el,
                  });
              }
          }
          flushCacheMetrics(eA) {
            if (0 === eA.inputTokensTotal) return;
            let el = (eA.cacheTokensTotal / eA.inputTokensTotal) * 100;
            this.galileo.recordDuration("agent.cache_rate_pct", el, {
              model: eA.lastModel,
              model_name: eA.lastModelName,
            });
          }
          flushToolCallbackRate(eA) {
            if (0 === eA.toolCallsGenerated) return;
            let el = (eA.toolTotal / eA.toolCallsGenerated) * 100;
            this.galileo.recordDuration("agent.tool_callback_rate_pct", el, {});
          }
          flushTokenUsageMetrics(eA) {
            if (0 !== eA.tokenByModel.size)
              for (let [el, ec] of eA.tokenByModel) {
                let eA = { model: el, model_name: ec.modelName };
                (ec.input > 0 &&
                  this.galileo.addCounter("agent.token.input", ec.input, eA),
                  ec.output > 0 &&
                    this.galileo.addCounter(
                      "agent.token.output",
                      ec.output,
                      eA,
                    ),
                  ec.cached > 0 &&
                    this.galileo.addCounter(
                      "agent.token.cached",
                      ec.cached,
                      eA,
                    ));
              }
          }
          createEmptyWindow() {
            return {
              startTime: Date.now(),
              requestTotal: 0,
              requestSuccess: 0,
              requestFailed: 0,
              requestErrorCodes: new Map(),
              taskTotal: 0,
              taskOutcomes: new Map(),
              toolTotal: 0,
              toolSuccess: 0,
              toolByName: new Map(),
              cacheTokensTotal: 0,
              inputTokensTotal: 0,
              toolCallsGenerated: 0,
              tokenByModel: new Map(),
              lastModel: "",
              lastModelName: "",
            };
          }
        });
      ((eE.FLUSH_INTERVAL_MS = 3e4),
        __decorate(
          [
            (0, eg.Autowired)(ef.GalileoService),
            __metadata(
              "design:type",
              "function" ==
                typeof (ed = void 0 !== ef.GalileoService && ef.GalileoService)
                ? ed
                : Object,
            ),
          ],
          eE.prototype,
          "galileo",
          void 0,
        ),
        __decorate(
          [
            (0, eg.Autowired)(eh.Logger),
            __metadata(
              "design:type",
              "function" == typeof (ep = void 0 !== eh.Logger && eh.Logger)
                ? ep
                : Object,
            ),
          ],
          eE.prototype,
          "logger",
          void 0,
        ),
        (eE = eu =
          __decorate([(0, eg.Component)(em, eg.ApplicationLifecycle)], eE)));
    },
  };
  const ec = (id: number) => {
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit metrics parent required: " + id);
    return value;
  };
  ec.r = (o: any) => {
    Object.defineProperty(o, "__esModule", { value: true });
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  const exports: any = {};
  factories[8395]({}, exports, ec);
  return exports;
}
