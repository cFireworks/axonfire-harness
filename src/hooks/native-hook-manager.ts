import { HookEvent, HookPriority } from "./hook-constants.js";
import type { GenericHookRuntime } from "./hook-runtime.js";
const oH = { HookEvent, HookPriority };
// Native UTF-16 8454850..8469415.
export class HookManagerImpl {
  [key: string]: any;
  constructor(readonly runtime: GenericHookRuntime) {
    Object.assign(this, runtime.dependencies);
    this.onceFired = new WeakSet();
  }
  async executeHooks(eA: any, el: any, ec?: any): Promise<any> {
    (await this.runInputProcessors(el, eA),
      ec?.callId && (el.call_id = ec.callId));
    let eu: any = await this.prepareEnvironment(eA, el),
      ed: any = this.getMatchValue(eA, el);
    this.debugService.debug(
      `hooks: executeHooks event=${eA} matchValue=${ed ?? "<none>"}`,
    );
    let ep: any = [],
      eg: any = this.getMatchingInternalHooks(eA, ed);
    for (let eA of eg) ep.push(this.executeInternalHook(eA, el));
    let eh: any = await this.getHooks(eA),
      ef: any = this.findMatchingHooks(eh, ed),
      em: any = this.filterHooksByIfRule(ef, el),
      eE: any = this.deduplicateHooks(em);
    for (let ed of eE) ep.push(this.executeLocalHook(ed, el, eu, eA, ec));
    if (eE.length > 1) {
      let el: any = eE
        .map((eA: any) => {
          if ("command" === eA.type) {
            let el: any = eA.command;
            return `command:${el.slice(0, 60)}${el.length > 60 ? "…" : ""}`;
          }
          if ("prompt" === eA.type) {
            let el: any = eA.prompt;
            return `prompt:${el.slice(0, 60)}${el.length > 60 ? "…" : ""}`;
          }
          return eA.type;
        })
        .join(" | ");
      this.logger.info(
        `[HookManager] event=${eA} matched ${eE.length} distinct hook entries (after dedupe): ${el}`,
      );
    }
    this.debugService.debug(
      `hooks: found ${eg.length} internal + ${eE.length} local hooks for event=${eA}`,
    );
    let eC: any = { allowed: !0 };
    if (ep.length > 0) {
      let eA: any = await Promise.allSettled(ep);
      eC = this.aggregateSettledResults(eA);
    }
    let ey: any = [],
      ew: any = eA,
      eB: any = this.sdkHooksManager.getHooks(ew);
    if (eB.length > 0) {
      let eu: any = this.convertToSdkInput(eA, el, eC.hookSpecificOutput);
      for (let eA of eB)
        if (this.matchesSdkMatcher(eA.matcher, ed)) {
          let el: any = (eA.timeout ?? 60) * 1e3;
          for (let ed of eA.hookCallbackIds)
            ey.push(this.executeSdkHook(ed, eu, ec?.callId, el));
        }
    }
    if (
      (ey.length > 0 &&
        this.debugService.debug(
          `hooks: found ${ey.length} SDK hooks for event=${eA}`,
        ),
      0 === ep.length && 0 === ey.length)
    )
      return (
        this.debugService.debug(
          `hooks: no hooks matched for event=${eA}, returning allowed=true`,
        ),
        { allowed: !0 }
      );
    if (0 === ey.length)
      return (
        this.debugService.debug(
          `hooks: CLI hooks result: allowed=${eC.allowed}`,
        ),
        eC
      );
    let e_: any = [
        { status: "fulfilled", value: eC },
        ...(await Promise.allSettled(ey)),
      ],
      eI: any = this.aggregateSettledResults(e_);
    return (
      this.debugService.debug(
        `hooks: final aggregated result: allowed=${eI.allowed}`,
      ),
      eI
    );
  }
  getMatchingInternalHooks(eA: any, el: any): any {
    return this.hookProvider
      .sortSync()
      .filter((el: any) => el.event === eA)
      .filter((eA: any) => this.matchesInternalHookMatcher(eA.matcher, el));
  }
  matchesInternalHookMatcher(eA: any, el: any): any {
    if (!eA || !el) return !0;
    try {
      return new RegExp(eA).test(el);
    } catch {
      return el === eA;
    }
  }
  async executeInternalHook(eA: any, el: any): Promise<any> {
    try {
      return (await eA.execute(el)) ?? { allowed: !0 };
    } catch (eA: any) {
      return (
        this.logger.error("Internal hook execution failed:", eA),
        { allowed: !0 }
      );
    }
  }
  async executeSdkHook(eA: any, el: any, ec: any, eu: any): Promise<any> {
    try {
      let ed: any = await this.sdkHooksManager.invokeCallback(eA, el, ec, eu);
      return this.convertSdkOutputToResult(ed);
    } catch (el: any) {
      return (
        this.logger.warn(`SDK hook callback failed: ${eA}`, el),
        { allowed: !0 }
      );
    }
  }
  convertSdkOutputToResult(eA: any): any {
    let el: any = eA.hookSpecificOutput;
    return {
      allowed: !1 !== eA.continue && el?.permissionDecision !== "deny",
      ...(el?.permissionDecision === "deny" ? { blocking: !0 } : {}),
      message: el?.permissionDecisionReason || eA.stopReason,
      modifiedInput: el?.updatedInput,
      hookSpecificOutput: el
        ? {
            hookEventName: "PreToolUse",
            permissionDecision: el.permissionDecision,
            permissionDecisionReason: el.permissionDecisionReason,
            updatedInput: el.updatedInput,
            additionalContext: el.additionalContext,
          }
        : void 0,
      suppressOutput: eA.suppressOutput,
    };
  }
  getMatchValue(eA: any, el: any): any {
    switch (eA) {
      case oH.HookEvent.PRE_TOOL_USE:
      case oH.HookEvent.POST_TOOL_USE:
        return el.tool_name;
      case oH.HookEvent.SESSION_START:
        return el.source;
      case oH.HookEvent.SESSION_END:
        return el.reason;
      case oH.HookEvent.PRE_COMPACT:
        return el.trigger;
      case oH.HookEvent.NOTIFICATION:
        return el.notification_type;
      default:
        return;
    }
  }
  matchesSdkMatcher(eA: any, el: any): any {
    if (!eA) return !0;
    if (!el) return !1;
    try {
      return new RegExp(eA).test(el);
    } catch {
      return el === eA;
    }
  }
  aggregateSettledResults(eA: any): any {
    let el: any = { allowed: !0 },
      ec: any = [],
      eu: any = [];
    for (let ed of eA) {
      if ("rejected" === ed.status) {
        this.logger.warn("Hook execution failed unexpectedly:", ed.reason);
        continue;
      }
      let eA: any = ed.value;
      (!eA.allowed &&
        ((el.allowed = !1),
        eA.blocking && (el.blocking = !0),
        eA.message &&
          (el.message = el.message
            ? `${el.message}
${eA.message}`
            : eA.message)),
        eA.modifiedInput &&
          (el.modifiedInput = {
            ...(el.modifiedInput || {}),
            ...eA.modifiedInput,
          }),
        eA.stdout &&
          !eA.suppressOutput &&
          (el.stdout = el.stdout
            ? `${el.stdout}
${eA.stdout}`
            : eA.stdout),
        eA.hookSpecificOutput &&
          (el.hookSpecificOutput = {
            ...(el.hookSpecificOutput || {}),
            ...eA.hookSpecificOutput,
          }),
        eA.message &&
          eA.allowed &&
          (el.message = el.message
            ? `${el.message}
${eA.message}`
            : eA.message),
        eA.continueRequest?.message &&
          (ec.push(eA.continueRequest.message),
          eA.continueRequest.completionPromise &&
            eu.push(eA.continueRequest.completionPromise)),
        eA.preventContinuation && (el.preventContinuation = !0));
    }
    return (
      ec.length > 0 &&
        (el.continueRequest = {
          message: this.mergeMessages(ec),
          completionPromise:
            eu.length > 0 ? Promise.all(eu).then(() => {}) : void 0,
        }),
      el
    );
  }
  mergeMessages(eA: any): any {
    return 1 === eA.length
      ? eA[0]
      : {
          type: "message",
          role: "user",
          content: eA
            .map((eA: any) =>
              "message" === eA.type && "string" == typeof eA.content
                ? eA.content
                : "",
            )
            .filter(Boolean)
            .join("\n\n---\n\n"),
          providerData: { isMeta: !0 },
        };
  }
  convertToSdkInput(eA: any, el: any, ec: any): any {
    let eu: any = {
      hook_event_name: eA,
      session_id: el.session_id || "",
      transcript_path: el.transcript_path,
      cwd: el.cwd || this.runtime.utilities.PathUtils.getWorkDir(),
      ...(ec && Object.keys(ec).length > 0 && { hook_specific_output: ec }),
    };
    switch (eA) {
      case oH.HookEvent.PRE_TOOL_USE:
        return {
          ...eu,
          hook_event_name: "PreToolUse",
          tool_name: el.tool_name || "",
          tool_input: el.tool_input || {},
        };
      case oH.HookEvent.POST_TOOL_USE:
        return {
          ...eu,
          hook_event_name: "PostToolUse",
          tool_name: el.tool_name || "",
          tool_input: el.tool_input || {},
          tool_response: el.tool_response,
        };
      case oH.HookEvent.NOTIFICATION:
        return {
          ...eu,
          hook_event_name: "Notification",
          message: el.message || "",
          notification_type: el.notification_type || "permission_prompt",
        };
      case oH.HookEvent.USER_PROMPT_SUBMIT:
        return {
          ...eu,
          hook_event_name: "UserPromptSubmit",
          prompt: el.prompt || "",
        };
      case oH.HookEvent.SESSION_START:
        return {
          ...eu,
          hook_event_name: "SessionStart",
          source: el.source || "startup",
        };
      case oH.HookEvent.SESSION_END:
        return {
          ...eu,
          hook_event_name: "SessionEnd",
          reason: el.reason || "other",
        };
      case oH.HookEvent.STOP:
        return {
          ...eu,
          hook_event_name: "Stop",
          stop_hook_active: el.stop_hook_active || !1,
        };
      case oH.HookEvent.SUBAGENT_STOP:
        return {
          ...eu,
          hook_event_name: "SubagentStop",
          stop_hook_active: el.stop_hook_active || !1,
        };
      case oH.HookEvent.PRE_COMPACT:
        return {
          ...eu,
          hook_event_name: "PreCompact",
          trigger: el.trigger || "auto",
          custom_instructions: el.custom_instructions || null,
        };
      case oH.HookEvent.WORKTREE_CREATE:
        return {
          ...eu,
          hook_event_name: "WorktreeCreate",
          name: el.name || "",
        };
      case oH.HookEvent.WORKTREE_REMOVE:
        return {
          ...eu,
          hook_event_name: "WorktreeRemove",
          worktree_path: el.worktree_path || "",
        };
      default:
        return eu;
    }
  }
  async executeLocalHook(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    return "prompt" === eA.type || "agent" === eA.type
      ? this.executePromptHook(eA, el, eu, ed)
      : "http" === eA.type
        ? this.executeHttpHook(eA, el, eu, ed)
        : this.executeCommandHook(eA, el, ec, eu, ed);
  }
  async executePromptHook(eA: any, el: any, ec: any, eu?: any): Promise<any> {
    try {
      let ed: any =
          ec === oH.HookEvent.STOP || ec === oH.HookEvent.SUBAGENT_STOP,
        ep: any = await this.promptHookService.execute(eA, el, {
          timeout: eu?.timeout ?? (eA.timeout ? 1e3 * eA.timeout : void 0),
          includeHistory: ed,
        });
      if (eA.onResult)
        try {
          await eA.onResult(ep, el);
        } catch (eA: any) {
          this.logger.warn("Prompt hook onResult callback failed:", eA);
        }
      if (!ep.ok && ep.impossible && eA.treatImpossibleAsAllow)
        return {
          allowed: !0,
          message: ep.reason,
          hookSpecificOutput: { goalImpossible: !0, reason: ep.reason },
        };
      if (!ep.ok)
        return (
          this.logger.info("Prompt hook blocked operation"),
          ep.reason && this.logger.info(`Prompt hook reason: ${ep.reason}`),
          {
            allowed: !1,
            message: ep.reason,
            blocking: !0,
            preventContinuation:
              !eA.treatImpossibleAsAllow && !0 !== eA.continueOnBlock,
          }
        );
      return { allowed: ep.ok, message: ep.reason };
    } catch (eA: any) {
      return (
        this.logger.error("Prompt hook execution failed:", eA),
        { allowed: !0, error: eA }
      );
    }
  }
  async executeCommandHook(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    try {
      let ep: any;
      if (Array.isArray(eA.allowedEnvVars) && eA.allowedEnvVars.length > 0) {
        for (let el of ((ep = {}), eA.allowedEnvVars)) {
          let eA: any = this.runtime.env[el];
          "string" == typeof eA && (ep[el] = eA);
        }
        for (let eA of ["CLAUDE_PROJECT_DIR", "CODEBUDDY_PROJECT_DIR"]) {
          let el: any = ec[eA];
          "string" == typeof el && (ep[eA] = el);
        }
      } else ep = { ...ec };
      if (
        (eA.pluginRoot &&
          ((ep.CODEBUDDY_PLUGIN_ROOT = eA.pluginRoot),
          (ep.CLAUDE_PLUGIN_ROOT = eA.pluginRoot)),
        eA.pluginData &&
          ((ep.CODEBUDDY_PLUGIN_DATA = eA.pluginData),
          (ep.CLAUDE_PLUGIN_DATA = eA.pluginData)),
        eA.pluginOptions)
      )
        for (let [el, ec] of Object.entries(eA.pluginOptions)) {
          let eA: any = (0, this.runtime.pluginUtilities.toPluginOptionEnvKey)(
              el,
            ),
            eu: any = "string" == typeof ec ? ec : String(ec);
          ((ep[`CODEBUDDY_PLUGIN_OPTION_${eA}`] = eu),
            (ep[`CLAUDE_PLUGIN_OPTION_${eA}`] = eu),
            (ep[`PLUGIN_OPT_${eA}`] = eu));
        }
      let eg: any = {
          timeout: eA.timeout ? 1e3 * eA.timeout : void 0,
          env: ep,
          hookEvent: eu,
          callId: ed?.callId,
          shell: eA.shell,
          asyncRewake: eA.asyncRewake,
        },
        eh: any = await this.hookExecutor.execute(eA.command, el, eg);
      return (
        eA.once && 0 === eh.exitCode && this.onceFired.add(eA),
        (eu === oH.HookEvent.STOP || eu === oH.HookEvent.SUBAGENT_STOP) &&
          eh.blocking &&
          eh.message &&
          (eh.message = `[${eA.command}]: ${eh.message}`),
        !eh.allowed &&
          (this.logger.info(`Hook blocked operation: ${eA.command}`),
          eh.message && this.logger.info(`Hook message: ${eh.message}`)),
        eh
      );
    } catch (el: any) {
      return (
        this.logger.error(`Hook execution failed: ${eA.command}`, el),
        { allowed: !0, error: el }
      );
    }
  }
  deduplicateHooks(eA: any): any {
    let el: any = new Set(),
      ec: any = [];
    for (let eu of eA) {
      let eA: any,
        ed: any = eu.sourceId ?? eu.pluginRoot ?? "",
        ep: any = eu.if ?? "";
      switch (eu.type) {
        case "command": {
          let el: any = eu,
            ec: any = el.shell ?? "bash";
          eA = `${ec}\0${el.command}\0${ep}`;
          break;
        }
        case "prompt":
        case "agent":
          eA = `${eu.prompt}\0${ep}`;
          break;
        case "http": {
          let el: any = eu;
          eA = `${el.url}\0${el.method ?? "POST"}\0${ep}`;
          break;
        }
        default:
          ec.push(eu);
          continue;
      }
      let eg: any = `${ed}\0${eu.type}\0${eA}`;
      el.has(eg) || (el.add(eg), ec.push(eu));
    }
    return ec;
  }
  async prepareEnvironment(eA: any, el: any): Promise<any> {
    let ec: any = {},
      eu: any = (0, this.runtime.shell.windowsPathToUnix)(
        this.runtime.utilities.PathUtils.getWorkDir(),
      );
    ((ec.CLAUDE_PROJECT_DIR = eu), (ec.CODEBUDDY_PROJECT_DIR = eu));
    try {
      let eA: any = await this.endpointProvider.get();
      ec.CODEBUDDY_SERVICE_PROXY_URL = `${eA}/internal/hooks/services/invoke`;
    } catch (eA: any) {
      this.logger.warn(
        "Failed to get endpoint for service proxy URL, hooks using service proxy may fail:",
        eA,
      );
    }
    return ec;
  }
  async runInputProcessors(eA: any, el: any): Promise<any> {
    for (let ec of this.hookInputProcessorProvider.sortSync())
      try {
        (await ec.process(eA, el),
          this.logger.debug(
            `[HookManager] HookInputProcessor executed: ${el}`,
          ));
      } catch (eA: any) {
        this.logger.warn("HookInputProcessor failed:", eA);
      }
  }
  async hasHooks(eA: any, el?: any): Promise<any> {
    if (this.getMatchingInternalHooks(eA, el).length > 0) return !0;
    let ec: any = await this.getHooks(eA);
    if (ec.length > 0 && (!el || this.findMatchingHooks(ec, el).length > 0))
      return !0;
    let eu: any = eA,
      ed: any = this.sdkHooksManager.getHooks(eu);
    if (ed.length > 0) {
      if (!el) return !0;
      for (let eA of ed) if (this.matchesSdkMatcher(eA.matcher, el)) return !0;
    }
    return !1;
  }
  async getHooks(eA: any): Promise<any> {
    let el: any = this.runtime.now();
    try {
      let ec: any = [],
        eu: any = await this.settingsManager.get("hooks");
      if (eu) {
        let el: any = eu[eA];
        el && ec.push(...el);
      }
      let ed: any = await this.loadHooksFromPlugins(eA);
      ec.push(...ed);
      let ep: any = this.scopedHookRegistry.getHooks(eA);
      ep.length > 0 && ec.push(...ep);
      let eg: any = [];
      for (let eA of ec) {
        let el: any = eA.hooks.filter((eA: any) => !this.onceFired.has(eA));
        el.length === eA.hooks.length
          ? eg.push(eA)
          : el.length > 0 && eg.push({ ...eA, hooks: el });
      }
      let eh: any = eg,
        ef: any = this.runtime.now() - el;
      return (
        ef > 500 &&
          this.logger.warn?.(
            `[HookManager] slow getHooks(${eA}) total=${ef}ms count=${eh.length}`,
          ),
        eh
      );
    } catch (ec: any) {
      return (
        this.logger.error(
          `Failed to load hooks for event ${eA} after ${this.runtime.now() - el}ms:`,
          ec,
        ),
        []
      );
    }
  }
  async loadHooksFromPlugins(eA: any): Promise<any> {
    let el: any = this.runtime.now();
    try {
      let ec: any = [],
        eu: any = this.runtime.now(),
        ed: any = await this.pluginManager.getActivePlugins(),
        ep: any = this.runtime.now() - eu;
      for (let { plugin: el, components: eu } of (ep > 1e3 &&
        this.logger.warn?.(
          `[HookManager] slow getActivePlugins(${eA})=${ep}ms count=${ed.length}`,
        ),
      ed)) {
        let ed: any = this.runtime.now();
        try {
          let ep: any = this.runtime.now() - ed;
          if (
            (ep > 200 &&
              this.logger.warn?.(
                `[HookManager] slow getPluginComponents ${el.name}@${el.marketplaceName} = ${ep}ms`,
              ),
            !eu || !eu.hooks)
          )
            continue;
          let eg: any = eA,
            eh: any = eu.hooks[eg];
          eh &&
            Array.isArray(eh) &&
            (ec.push(...eh),
            this.logger.debug(
              `Loaded ${eh.length} hook(s) for event ${eA} from plugin: ${el.name}@${el.marketplaceName}`,
            ));
        } catch (eA: any) {
          this.logger.warn(
            `Failed to load hooks from plugin ${el.name}@${el.marketplaceName} after ${this.runtime.now() - ed}ms:`,
            eA,
          );
        }
      }
      let eg: any = this.runtime.now() - el;
      return (
        eg > 1e3 &&
          this.logger.warn?.(
            `[HookManager] slow loadHooksFromPlugins(${eA}) total=${eg}ms configs=${ec.length}`,
          ),
        ec
      );
    } catch (eA: any) {
      return (
        this.logger.error(
          `Failed to load hooks from plugins after ${this.runtime.now() - el}ms:`,
          eA,
        ),
        []
      );
    }
  }
  findMatchingHooks(eA: any, el: any): any {
    let ec: any = [];
    for (let eu of eA) {
      if (!el || !eu.matcher || "" === eu.matcher || "*" === eu.matcher) {
        ec.push(...eu.hooks);
        continue;
      }
      try {
        new RegExp(eu.matcher).test(el) && ec.push(...eu.hooks);
      } catch (eA: any) {
        this.logger.warn(
          `Invalid regex pattern in hook matcher: ${eu.matcher}`,
          eA,
        );
      }
    }
    return ec;
  }
  filterHooksByIfRule(eA: any, el: any): any {
    let ec: any = "string" == typeof el.tool_name ? el.tool_name : void 0,
      eu: any =
        el.tool_input && "object" == typeof el.tool_input
          ? el.tool_input
          : void 0;
    return eA.filter((eA: any) => {
      if (!eA.if || "string" != typeof eA.if || 0 === eA.if.trim().length)
        return !0;
      let el: any = this.runtime.ifRule.matches(eA.if, {
        toolName: ec,
        toolInput: eu,
      });
      return (
        el ||
          this.debugService.debug(
            `hooks: hook skipped by if="${eA.if}" (tool=${ec ?? "<none>"})`,
          ),
        el
      );
    });
  }
  async executeHttpHook(eA: any, el: any, ec: any, eu?: any): Promise<any> {
    let ed: any = eA.method || "POST",
      ep: any = (eA.timeout ?? 60) * 1e3,
      eg: any = new Set(eA.allowedEnvVars || []),
      resolveVar: any = (eA: any) =>
        eg.has(eA)
          ? (this.runtime.env[eA] ?? "")
          : (this.logger.debug?.(
              `[HookHttp] env var "${eA}" not in allowedEnvVars, skipped`,
            ),
            ""),
      interpolate: any = (eA: any) =>
        eA
          .replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (eA: any, el: any) =>
            resolveVar(el),
          )
          .replace(/\$([A-Z_][A-Z0-9_]*)/g, (eA: any, el: any) =>
            resolveVar(el),
          ),
      eh: any = { "Content-Type": "application/json" };
    for (let [el, ec] of Object.entries(eA.headers || {}))
      eh[el] = "string" == typeof ec ? interpolate(ec) : String(ec);
    let { session: ef, ...em } = el,
      eE: any = JSON.stringify(em),
      eC: any = new AbortController(),
      ey: any = this.runtime.setTimeout(() => eC.abort(), ep);
    try {
      this.logger.info?.(`[HookHttp] ${ed} ${eA.url} (timeout=${ep}ms)`);
      let el: any = await this.runtime.fetch(eA.url, {
        method: ed,
        headers: eh,
        body: eE,
        signal: eC.signal,
      });
      this.runtime.clearTimeout(ey);
      let ec: any = await el.text(),
        eu: any = el.status;
      if (
        (this.logger.info?.(`[HookHttp] ${ed} ${eA.url} -> ${eu}`),
        eu < 200 || eu >= 300)
      )
        return {
          allowed: !0,
          exitCode: eu,
          stdout: ec,
          systemMessage: `HTTP hook ${eA.url} returned ${eu}`,
        };
      try {
        let eA: any = JSON.parse(ec),
          el: any = {
            allowed: !1 !== eA.continue && "block" !== eA.decision,
            exitCode: 0,
            stdout: ec,
          };
        return (
          "block" === eA.decision && (el.blocking = !0),
          "boolean" == typeof eA.suppressOutput &&
            (el.suppressOutput = eA.suppressOutput),
          "string" == typeof eA.systemMessage &&
            (el.systemMessage = eA.systemMessage),
          eA.stopReason
            ? (el.message = eA.stopReason)
            : eA.reason && (el.message = eA.reason),
          eA.hookSpecificOutput &&
            (el.hookSpecificOutput = eA.hookSpecificOutput),
          el
        );
      } catch {
        return {
          allowed: !0,
          exitCode: 0,
          stdout: ec,
          message: ec.trim() || void 0,
        };
      }
    } catch (ec: any) {
      this.runtime.clearTimeout(ey);
      let el: any = ec?.name === "AbortError";
      return (
        this.logger.warn?.(
          `[HookHttp] ${ed} ${eA.url} failed: ${el ? "timeout" : ec.message}`,
        ),
        {
          allowed: !0,
          exitCode: -1,
          stderr: ec.message,
          error: ec,
          systemMessage: el
            ? `HTTP hook ${eA.url} timed out after ${ep}ms`
            : `HTTP hook ${eA.url} failed: ${ec.message}`,
        }
      );
    }
  }
}
