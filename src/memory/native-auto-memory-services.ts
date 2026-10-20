import * as SDK from "@openai/agents-core";
import type { AutoMemoryRuntime } from "./auto-memory-runtime.js";
const tQ = SDK,
  tB = SDK,
  t_ = SDK,
  ty = {
    ENV_KEY_CODEBUDDY_DISABLE_AUTO_MEMORY: "CODEBUDDY_DISABLE_AUTO_MEMORY",
    PermissionMode: { BypassPermissions: "bypassPermissions" },
  },
  tS = { AgentPurpose: { MemoryExtraction: "memory_extraction" } },
  tE = { AgentNames: { MEMORY_SELECTOR: "memorySelector" } },
  eV = {
    HookEvent: { POST_TOOL_USE: "PostToolUse", STOP: "Stop" },
    HookPriority: { Normal: 500, Low: 800 },
  };
// Native UTF-16 9342347..9344463
export class MemoryRelevanceServiceImpl {
  [key: string]: any;
  constructor(readonly runtime: AutoMemoryRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  init(): any {
    this.logger.setContext("MemoryRelevanceService");
  }
  async isEnabled(): Promise<any> {
    if ("1" === this.runtime.env.CODEBUDDY_MEMORY_RELEVANCE_DISABLED) return !1;
    if ("1" === this.runtime.env.CODEBUDDY_MEMORY_RELEVANCE_ENABLED) return !0;
    let eA: any = await this.settingsManager.get("memory");
    return eA?.relevanceSelection === !0;
  }
  async selectRelevantMemories(
    eA: any,
    el: any,
    ec: any = [],
    eu: any = new Set(),
    ed: any,
  ): Promise<any> {
    if (!(await this.isEnabled()) || ed?.aborted) return [];
    try {
      let ep: any = (await this.runtime.scanner.scanMemoryFiles(el, ed)).filter(
        (eA: any) => !eu.has(eA.filePath),
      );
      if (0 === ep.length) return [];
      let eg: any = await this.doAISelection(eA, ep, ec, ed),
        eh: any = new Map(ep.map((eA: any) => [eA.filename, eA])),
        ef: any = eg
          .map((eA: any) => eh.get(eA))
          .filter((eA: any) => void 0 !== eA);
      return (
        this.logger.debug(
          `[MemoryRelevance] AI selected ${ef.length}/${ep.length}`,
        ),
        ef.map((eA: any) => ({ path: eA.filePath, mtimeMs: eA.mtimeMs }))
      );
    } catch (eA: any) {
      return (
        "AbortError" === eA.name
          ? this.logger.debug("Memory relevance selection aborted")
          : this.logger.warn(
              `Memory relevance selection failed: ${eA.message}`,
            ),
        []
      );
    }
  }
  async doAISelection(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any,
      ep: any = new Set(el.map((eA: any) => eA.filename)),
      eg: any = this.runtime.scanner.formatMemoryManifest(el),
      eh: any =
        ec.length > 0
          ? `

Recently used tools: ${ec.join(", ")}`
          : "",
      ef: any = `Query: ${eA}

Available memories:
${eg}${eh}`,
      em: any = await this.sessionManager.create();
    eu &&
      ((ed = () => {
        this.logger.debug(
          "[MemoryRelevance:AI] External signal aborted, cancelling memorySelector",
        );
        try {
          em.abortController?.abort();
        } catch {}
      }),
      eu.aborted ? ed() : eu.addEventListener("abort", ed, { once: !0 }));
    try {
      let eA: any = this.runtime.getAgentService(),
        el: any = await eA.runOneTime(tE.AgentNames.MEMORY_SELECTOR, ef, {
          context: em,
        });
      if (
        (this.logger.debug(
          `[MemoryRelevance:AI] Response (${el.length} chars)`,
        ),
        eu?.aborted)
      )
        return [];
      let ec: any = el.match(/\{[\s\S]*"selected_memories"[\s\S]*\}/);
      if (!ec)
        return (
          this.logger.debug("[MemoryRelevance:AI] No valid JSON in response"),
          []
        );
      let ed: any = JSON.parse(ec[0]);
      if (!Array.isArray(ed.selected_memories)) return [];
      return ed.selected_memories.filter((eA: any) => ep.has(eA));
    } catch (eA: any) {
      if ("AbortError" === eA.name || eu?.aborted)
        return (this.logger.debug("[MemoryRelevance:AI] Aborted"), []);
      return (
        this.logger.debug(`[MemoryRelevance:AI] Failed: ${eA.message}`),
        []
      );
    } finally {
      eu && ed && eu.removeEventListener("abort", ed);
    }
  }
}
// Native UTF-16 9348849..9352982
export class MemoryExtractionServiceImpl {
  [key: string]: any;
  constructor(readonly runtime: AutoMemoryRuntime) {
    Object.assign(this, runtime.dependencies);
    this.inProgress = !1;
  }
  init(): any {
    this.logger.setContext("MemoryExtractionService");
  }
  async isEnabled(): Promise<any> {
    if ("1" === this.runtime.env.CODEBUDDY_MEMORY_EXTRACTION_ENABLED) return !0;
    if (
      "1" === this.runtime.env.CODEBUDDY_MEMORY_EXTRACTION_DISABLED ||
      "1" === this.runtime.env[ty.ENV_KEY_CODEBUDDY_DISABLE_AUTO_MEMORY]
    )
      return !1;
    let eA: any = await this.settingsManager.get("memory");
    return eA?.autoMemoryEnabled !== !1 && eA?.memoryExtraction === !0;
  }
  extractAsync(eA: any): any {
    this.lastExtractionPromise = this.doExtract(eA).catch((eA: any) => {
      if ("AbortError" !== eA.name) {
        let el: any = eA instanceof Error ? eA.message : String(eA);
        this.logger.warn(`Memory extraction failed: ${el}`);
      }
    });
  }
  async waitForExtraction(): Promise<any> {
    this.lastExtractionPromise && (await this.lastExtractionPromise);
  }
  async doExtract(eA: any): Promise<any> {
    if (!(await this.isEnabled())) return;
    if (this.inProgress)
      return void this.logger.debug(
        "Memory extraction already in progress, skipping",
      );
    if (!eA?.state)
      return void this.logger.debug(
        "No session state available for memory extraction",
      );
    let el: any = this.runtime.utilities.PathUtils.getCompressedWorkDir(),
      ec: any = this.runtime.utilities.PathUtils.getProjectMemoryDir(el);
    if (!(0, this.runtime.fs.existsSync)(ec)) return;
    let eu: any = eA.state.history,
      ed: any = this.countNewMessages(eu);
    if (ed < 2)
      return void this.logger.debug("Too few new messages for extraction");
    if (this.hasMemoryWritesSince(eu, ec)) {
      (this.logger.debug(
        "Main agent already wrote memories, skipping extraction",
      ),
        this.advanceCursor(eu));
      return;
    }
    this.inProgress = !0;
    let ep: any = this.runtime.now();
    try {
      let el: any = this.runtime.scanner.formatMemoryManifest(
          await this.runtime.scanner.scanMemoryFiles(ec),
        ),
        eg: any = this.runtime.prompts.buildExtractPrompt(ed, el),
        eh: any = eA.state._currentAgent,
        ef: any = eA.state._context;
      if (!eh || !ef)
        return void this.logger.debug(
          "Cannot access state internals for extraction, skipping",
        );
      let em: any = new AbortController(),
        eE: any = eA.abortSignal;
      if (eE) {
        let onAbort: any = () => em.abort();
        (eE.addEventListener("abort", onAbort, { once: !0 }),
          em.signal.addEventListener(
            "abort",
            () => {
              eE.removeEventListener("abort", onAbort);
            },
            { once: !0 },
          ));
      }
      let eC: any = new t_.RunContext({
          ...ef.context,
          conversationRequestId: this.runtime.uuid().replace(/-/g, ""),
          abortController: em,
          abortSignal: em.signal,
        }),
        ey: any = await this.runnerProvider.get(),
        ew: any = eh,
        eB: any = ["Read", "Grep", "Glob"],
        e_: any = ["Write", "Edit"],
        eI: any = (ew.tools || []).filter((eA: any) => {
          let el: any = eA.name || "";
          return eB.includes(el) || e_.includes(el);
        });
      this.logger.debug(
        `Memory extraction: using ${eI.length} tools (of ${(ew.tools || []).length})`,
      );
      let ev: any = new tQ.Agent({
          name: `${ew.name}-memory-extractor`,
          instructions: ew.instructions,
          model: ew.model,
          modelSettings: ew.modelSettings,
          tools: eI,
          handoffs: [],
        }),
        eS: any = [
          ...this.runtime.utilities.HistoryUtils.fillFunctionCallResultHistory(
            eu,
          ),
          (0, tQ.user)(eg),
        ],
        eQ: any = new tB.RunState(eC, eS, ev, 5),
        eD: any = eA.permissionModeSubject?.value;
      eA.permissionModeSubject &&
        eA.permissionModeSubject.next(ty.PermissionMode.BypassPermissions);
      let eT: any = eA.agentPurpose;
      eA.agentPurpose = tS.AgentPurpose.MemoryExtraction;
      try {
        for await (let eA of (
          await this.sessionManager.runWithoutHistory(() =>
            ey.run(ev, eQ, { stream: !0, maxTurns: 5, signal: em.signal }),
          )
        ).toTextStream());
      } finally {
        (eA.permissionModeSubject &&
          void 0 !== eD &&
          eA.permissionModeSubject.next(eD),
          (eA.agentPurpose = eT));
      }
      this.advanceCursor(eu);
      let eR: any = this.runtime.now() - ep;
      this.logger.info(`Memory extraction completed in ${eR}ms`);
    } catch (el: any) {
      let eA: any = el instanceof Error ? el.message : String(el);
      this.logger.warn(`Memory extraction error: ${eA}`);
    } finally {
      this.inProgress = !1;
    }
  }
  countNewMessages(eA: any): any {
    if (!this.lastMemoryMessageUuid)
      return eA.filter(
        (eA: any) => "user" === eA.role || "assistant" === eA.role,
      ).length;
    let el: any = !1,
      ec: any = 0;
    for (let eu of eA) {
      if (!el) {
        eu.id === this.lastMemoryMessageUuid && (el = !0);
        continue;
      }
      ("user" === eu.role || "assistant" === eu.role) && ec++;
    }
    return el
      ? ec
      : eA.filter((eA: any) => "user" === eA.role || "assistant" === eA.role)
          .length;
  }
  hasMemoryWritesSince(eA: any, el: any): any {
    let ec: any = void 0 === this.lastMemoryMessageUuid;
    for (let eu of eA) {
      if (!ec) {
        eu.id === this.lastMemoryMessageUuid && (ec = !0);
        continue;
      }
      if ("assistant" !== eu.role) continue;
      let eA: any = eu.content;
      if (Array.isArray(eA)) {
        for (let ec of eA)
          if ("tool_use" === ec.type || "function_call" === ec.type) {
            let eA: any = ec.name || "";
            if ("Write" === eA || "Edit" === eA) {
              let eA: any = ec.input || ec.arguments || {},
                eu: any = "string" == typeof eA ? "" : eA.file_path || "";
              if ("string" == typeof eu && eu.startsWith(el)) return !0;
            }
          }
      }
    }
    return !1;
  }
  advanceCursor(eA: any): any {
    for (let el: any = eA.length - 1; el >= 0; el--)
      if (eA[el].id) {
        this.lastMemoryMessageUuid = eA[el].id;
        return;
      }
  }
}
// Native UTF-16 9354814..9355075
export class MemoryExtractionStopHook {
  [key: string]: any;
  constructor(readonly runtime: AutoMemoryRuntime) {
    Object.assign(this, runtime.dependencies);
    ((this.event = eV.HookEvent.STOP), (this.priority = eV.HookPriority.Low));
  }
  async execute(eA: any): Promise<any> {
    let el: any = eA.session;
    el &&
      this.extractionService &&
      (this.extractionService.extractAsync(el),
      this.runtime.isTTY() ||
        (await this.extractionService.waitForExtraction()));
  }
}
// Native UTF-16 9355943..9356698
export class MemoryFreshnessPostToolHook {
  [key: string]: any;
  constructor(readonly runtime: AutoMemoryRuntime) {
    Object.assign(this, runtime.dependencies);
    ((this.event = eV.HookEvent.POST_TOOL_USE),
      (this.priority = eV.HookPriority.Normal),
      (this.matcher = "Read"));
  }
  async execute(eA: any): Promise<any> {
    let el: any,
      ec: any = eA.tool_input?.file_path;
    if ("string" != typeof ec || !this.isMemoryPath(ec)) return;
    try {
      el = (0, this.runtime.fs.statSync)(ec).mtimeMs;
    } catch (eA: any) {
      this.logger.debug(
        `Cannot stat memory file for freshness check: ${ec}: ${eA.message}`,
      );
      return;
    }
    let eu: any = (0, this.runtime.freshness.memoryFreshnessText)(el);
    if (eu)
      return (
        this.logger.debug(`Memory freshness warning appended for ${ec}`),
        {
          allowed: !0,
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: `<system-reminder data-role="memory-freshness">${eu}</system-reminder>`,
          },
        }
      );
  }
  isMemoryPath(eA: any): any {
    let el: any = this.runtime.utilities.PathUtils.getCompressedWorkDir(),
      ec: any = this.runtime.utilities.PathUtils.getProjectMemoryDir(el);
    return eA.startsWith(ec);
  }
}
