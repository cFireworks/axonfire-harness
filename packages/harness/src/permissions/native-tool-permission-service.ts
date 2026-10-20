import {
  PermissionMode,
  buildDontAskDenyMessage,
  buildClassifierUnavailableDenyMessage,
} from "./permission.js";
import { ToolNames } from "../tools/tool-names.js";
import { PermissionDeniedError } from "../tools/native-tool-errors.js";
import {
  ToolArgType,
  ToolPermissionType,
  SettingsScope,
  buildPermissionDeniedMessage,
} from "./native-permission-policy.js";
import { filterDangerousAllowRules } from "./native-permission-policy.js";
// Complete original class: UTF-16 11948949..11968077; construction injection only.
export function createNativeToolPermissionService(
  runtime: any,
  dependencies: Record<string, any>,
) {
  const nC = {
      ToolNames,
      ToolArgType,
      ToolPermissionType,
      PermissionDeniedError,
      buildPermissionDeniedMessage,
      ToolPermissionStrategy: "strategies",
    },
    ih = { PermissionMode, SettingsScope },
    nw = { buildDontAskDenyMessage, buildClassifierUnavailableDenyMessage },
    nW = {
      PermissionUtils: runtime.permissionUtils,
      CommandUtils: runtime.commandUtils,
      PathUtils: runtime.pathUtils,
      RiskLevel: runtime.riskLevel,
    },
    oT = { SessionHookManager: "sessionHooks" },
    nk = {
      ContainerUtil: {
        get: (key: string) =>
          key === "sessionHooks" ? runtime.sessionHookManager : undefined,
        getAll: (..._args: any[]) => runtime.getStrategies(),
      },
    },
    sH = {
      PRODUCT_LOWERCASE_NAME: runtime.productLowercaseName ?? "codebuddy",
    },
    process = { stdin: { isTTY: runtime.isTTY ?? false } };
  class ToolPermissionService {
    [key: string]: any;
    constructor() {
      ((this.readTools = new Set([
        nC.ToolNames.READ,
        nC.ToolNames.NOTEBOOK_READ,
      ])),
        (this.editTools = new Set([
          nC.ToolNames.EDIT,
          nC.ToolNames.MULTI_EDIT,
          nC.ToolNames.NOTEBOOK_EDIT,
          nC.ToolNames.WRITE,
        ])),
        (this.alwaysApprovalTools = [nC.ToolNames.ASK_USER_QUESTION]));
    }
    async checkPermission(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = await this.doCheckPermission(eA, el, ec, eu, ed);
      if (
        "ask" ===
        (ep = await this.applyModeFinalization(ep, eA, ec, el)).behavior
      ) {
        let eu: any = el.context.permissionModeSubject.value,
          ed: any = ec?.command,
          eg: any = "string" == typeof ed ? ed.slice(0, 200) : void 0;
        this.logger.warn(
          `[tool-permission] ASK tool=${eA.name} mode=${eu} reason=${JSON.stringify(ep.decisionReason)} message=${JSON.stringify(ep.message)}` +
            (eg ? ` command=${JSON.stringify(eg)}` : ""),
        );
      }
      return ep;
    }
    isEffectiveAutoMode(eA: any): any {
      let el: any = eA.permissionModeSubject.value;
      return (
        el === ih.PermissionMode.Auto ||
        (el === ih.PermissionMode.Plan &&
          eA.meta?.prePlanPermissionMode === ih.PermissionMode.Auto)
      );
    }
    kickOutOfAutoMode(eA: any, el: any): any {
      let ec: any = eA.permissionModeSubject.value;
      ec === ih.PermissionMode.Auto
        ? (this.debugService.debug(el),
          eA.permissionModeSubject.next(ih.PermissionMode.Default))
        : ec === ih.PermissionMode.Plan &&
          eA.meta?.prePlanPermissionMode === ih.PermissionMode.Auto &&
          (this.debugService.debug(
            `${el} (Plan+Auto: downgrading prePlanPermissionMode to Default)`,
          ),
          (eA.meta.prePlanPermissionMode = ih.PermissionMode.Default));
    }
    async applyModeFinalization(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): Promise<any> {
      if ("ask" !== eA.behavior) return eA;
      let ed: any = eu.context.permissionModeSubject.value;
      if (
        (el.name === nC.ToolNames.ASK_USER_QUESTION ||
          el.name === nC.ToolNames.EXIT_PLAN_MODE) &&
        ed !== ih.PermissionMode.DontAsk
      )
        return eA;
      if (ed === ih.PermissionMode.DontAsk) {
        let ec: any = eA.message || `${el.name} requires approval`;
        return {
          behavior: "deny",
          message: (0, nw.buildDontAskDenyMessage)(el.name, ec),
          decisionReason: {
            type: "modeDeny",
            mode: ih.PermissionMode.DontAsk,
            reason: ec,
          },
        };
      }
      return this.isEffectiveAutoMode(eu.context)
        ? (await this.autoModePermissionService.isAutoModeAvailable()).available
          ? eA.decisionReason?.type === "rule"
            ? eA
            : this.classifyAutoMode(eA, el, ec, eu)
          : (this.kickOutOfAutoMode(
              eu.context,
              "tool-permission: auto mode unavailable (e.g. disableAutoMode) — kicking session back to default",
            ),
            eA)
        : eA;
    }
    async classifyAutoMode(eA: any, el: any, ec: any, eu: any): Promise<any> {
      let ed: any = eu.context,
        ep: any = !ed.toolPermissionContext?.shouldAvoidPermissionPrompts,
        eg: any = ed.toolPermissionContext?.denyRules
          ? nW.PermissionUtils.mergeRulesFromAllSources(
              ed.toolPermissionContext.denyRules,
            )
          : [],
        eh: any = await this.autoModePermissionService.classifyAsk({
          sessionId: ed.id,
          toolName: el.name,
          toolInput: ec,
          currentMode: ih.PermissionMode.Auto,
          canPrompt: ep,
          headless:
            ed.options?.outputFormat === "json" ||
            ed.options?.outputFormat === "stream-json",
          transcript: ed.history,
          settingsDenyRules: eg,
        });
      switch (eh.behavior) {
        case "allow":
          return {
            behavior: "allow",
            message: eh.reason,
            decisionReason: { type: "mode", mode: ih.PermissionMode.Auto },
          };
        case "deny":
          return {
            behavior: "deny",
            message: `Permission for this action was denied by the CodeBuddy auto mode classifier. Reason: ${eh.reason}`,
            decisionReason: {
              type: "modeDeny",
              mode: ih.PermissionMode.Auto,
              reason: eh.reason,
            },
          };
        case "transcriptTooLong":
          if (eh.headlessAbort)
            return (
              ed.abortController.abort(),
              {
                behavior: "deny",
                message: `Agent aborted: auto mode classifier transcript exceeded context window in headless mode (${eh.actualTokens} > ${eh.limitTokens} tokens).`,
                decisionReason: {
                  type: "modeDeny",
                  mode: ih.PermissionMode.Auto,
                  reason: eh.reason,
                },
              }
            );
          return eA;
        case "denialLimitExceeded":
          if (eh.headlessAbort)
            return (
              ed.abortController.abort(),
              {
                behavior: "deny",
                message: `Agent aborted: too many auto mode classifier denials in headless mode. ${eh.reason}`,
                decisionReason: {
                  type: "modeDeny",
                  mode: ih.PermissionMode.Auto,
                  reason: eh.reason,
                },
              }
            );
          return eA;
        default:
          if (
            (eh.kickOutOfAuto &&
              this.kickOutOfAutoMode(
                ed,
                "tool-permission: classifier circuit breaker tripped — kicking out of auto mode",
              ),
            eh.failClosed)
          )
            return {
              behavior: "deny",
              message: (0, nw.buildClassifierUnavailableDenyMessage)(
                el.name,
                eh.reason,
              ),
              decisionReason: {
                type: "modeDeny",
                mode: ih.PermissionMode.Auto,
                reason: eh.reason,
              },
            };
          return eA;
      }
    }
    async doCheckPermission(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = el.context,
        eg: any = ep.toolPermissionContext;
      if (
        (this.debugService.debug(
          `tool-permission: ===== Starting permission check for tool: ${eA.name} =====`,
        ),
        this.alwaysApprovalTools.includes(eA.name))
      )
        return (
          this.debugService.debug(
            `tool-permission: Tool ${eA.name} is in alwaysApprovalTools, returning ask`,
          ),
          {
            behavior: "ask",
            message: `Tool ${eA.name} always requires user interaction`,
            decisionReason: {
              type: "toolValidation",
              message: "Always requires approval",
            },
          }
        );
      ec = this.toolArgumentRewriteService.process(ec);
      let eh: any = this.isMcpTool(eA),
        ef: any = (eh ? [eA.name] : [eA.name, ...(eA.aliases || [])]).map(
          (eA: any) => eA.toLowerCase(),
        );
      this.debugService.debug(
        `tool-permission: Tool names: ${JSON.stringify(ef)}`,
      );
      let em: any = ed ? ed(el, ec, eu) : this.getDefaultPermissionArgs(ec);
      this.debugService.debug(
        `tool-permission: Check arguments: ${JSON.stringify(em)}`,
      );
      let eE: any = ep.options,
        eC: any = ep.permissionModeSubject.value;
      this.debugService.debug(`tool-permission: Current mode: ${eC}`);
      let ey: any = nW.PermissionUtils.mergeRulesFromAllSources(eg.denyRules),
        ew: any = nW.PermissionUtils.mergeRulesFromAllSources(eg.askRules),
        eB: any = this.directoryTrustService.isTrustDirectory,
        e_: any = [
          ...eg.allowRules.userSettings,
          ...eg.allowRules.cliArg,
          ...eg.allowRules.flagSettings,
          ...eg.allowRules.session,
          ...eg.allowRules.policySettings,
          ...(eE.allowedTools || []),
          ...(ep.requestOptions?.allowedTools || []),
          ...(eB ? eg.allowRules.projectSettings : []),
          ...(eB ? eg.allowRules.localSettings : []),
        ],
        eI: any = [
          ...(eB ? [] : eg.allowRules.projectSettings),
          ...(eB ? [] : eg.allowRules.localSettings),
          ...eg.allowRules.command,
          ...eg.allowRules.sandbox,
        ],
        ev: any = this.isEffectiveAutoMode(ep),
        debugRemoved: any = (eA: any) =>
          this.debugService.debug(`tool-permission: ${eA}`),
        eS: any = ev ? filterDangerousAllowRules(e_, debugRemoved) : e_,
        eQ: any = ev ? filterDangerousAllowRules(eI, debugRemoved) : eI,
        eD: any = [...ey, ...(eE.disallowedTools || [])],
        eT: any = this.checkDenyRules(eA.name, ef, eD, em, eh);
      if (eT) return eT;
      let eR: any = this.checkAllowRules(ef, eS, em, eh);
      if (eR)
        return (
          this.debugService.debug(
            "tool-permission: Trusted allow rule matched, bypassing safety check",
          ),
          eR
        );
      if (!eE.print) {
        let eA: any = this.checkCommandSafety(em, eC, eE);
        if (eA) return eA;
      }
      let ek: any = this.checkAskRules(ef, ew, em, eh);
      if (ek) return ek;
      if (eC === ih.PermissionMode.BypassPermissions)
        if (eg.isBypassPermissionsModeAvailable)
          if (this.isDangerousCommand(em) && !eE.print)
            return (
              this.debugService.debug(
                "tool-permission: Bypass mode active but dangerous command detected, require approval",
              ),
              {
                behavior: "ask",
                message:
                  "Dangerous command requires explicit approval even in bypass mode",
                decisionReason: {
                  type: "toolValidation",
                  message: "HIGH/CRITICAL command safety check in bypass mode",
                },
              }
            );
          else
            return (
              this.debugService.debug(
                "tool-permission: Bypass mode enabled, allowing",
              ),
              {
                behavior: "allow",
                message: "Bypass permissions mode is enabled",
                decisionReason: {
                  type: "mode",
                  mode: ih.PermissionMode.BypassPermissions,
                },
              }
            );
        else
          this.debugService.debug(
            "tool-permission: Bypass mode disabled by settings, falling through",
          );
      let eM: any = this.checkAllowRules(ef, eQ, em, eh);
      if (eM) return eM;
      if (!eh) {
        let ed: any = await this.checkWithStrategy(eA, el, ec, em, eC, eu);
        if (ed && "ask" !== ed.behavior) return ed;
      }
      if (eg.shouldAvoidPermissionPrompts) {
        this.debugService.debug(
          "tool-permission: shouldAvoidPermissionPrompts is true, denying",
        );
        let el: any = (0, nC.buildPermissionDeniedMessage)(
            eA.name,
            "this tool requires approval but permission prompts are not available in non-interactive mode",
          ),
          ec: any = `To allow this tool, the user can either: (1) re-run with ${sH.PRODUCT_LOWERCASE_NAME} -p -y "<prompt>" or ${sH.PRODUCT_LOWERCASE_NAME} -p --permission-mode bypassPermissions "<prompt>" to bypass all permission checks, or (2) add "${eA.name}" to the "permissions.allow" list in settings to permanently allow this tool.`;
        return {
          behavior: "deny",
          message: `${el} ${ec}`,
          decisionReason: {
            type: "asyncAgent",
            reason: "Permission prompts are not available in this context",
          },
        };
      }
      return (
        this.debugService.debug(
          "tool-permission: No matching rules, defaulting to ask (secure default)",
        ),
        {
          behavior: "ask",
          message: `Approval required for ${eA.name}`,
          decisionReason: { type: "default" },
          suggestions: this.generateRuleSuggestions(eA.name, em),
        }
      );
    }
    async needsApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = el?.context;
      if (ep && eu)
        try {
          let el: any = await this.executeAndCachePreToolUseHooks(
            eA.name,
            ep,
            ec,
            eu,
          );
          if (el?.permissionDecision)
            switch (
              (this.debugService.debug(
                `tool-permission: PreToolUse hook returned permissionDecision=${el.permissionDecision} for ${eA.name}`,
              ),
              el.permissionDecision)
            ) {
              case "deny":
              case "allow":
                return !1;
              case "ask":
                return !0;
            }
          if (el && !el.allowed)
            return (
              this.debugService.debug(
                `tool-permission: PreToolUse hook blocked tool ${eA.name} (allowed=false)`,
              ),
              this.cachePreToolUseResult(ep, eu, {
                allowed: !1,
                message: el.message || "Blocked by PreToolUse hook",
                permissionDecision: "deny",
              }),
              !1
            );
        } catch (eA: any) {
          this.debugService.debug(
            `tool-permission: PreToolUse hook execution error: ${eA}`,
          );
        }
      try {
        let eg: any = await this.checkPermission(eA, el, ec, eu, ed);
        switch (eg.behavior) {
          case "allow":
            return !1;
          case "deny":
            if (ep && eu)
              return (
                await this.dispatchPermissionDeniedHook(
                  ep,
                  eA.name,
                  ec,
                  eg.message || `Permission denied for ${eA.name}`,
                  eu,
                ),
                this.cachePreToolUseResult(ep, eu, {
                  allowed: !1,
                  message: eg.message || `Permission denied for ${eA.name}`,
                  permissionDecision: "deny",
                }),
                !1
              );
            throw new nC.PermissionDeniedError(
              eA.name,
              eg.message || `Permission denied for ${eA.name}`,
              eg.decisionReason?.type === "rule"
                ? eg.decisionReason.rule.originalRule
                : void 0,
            );
          default:
            if (ep) {
              let eg: any = this.generateRuleSuggestions(
                  eA.name,
                  ed ? ed(el, ec, eu) : this.getDefaultPermissionArgs(ec),
                ),
                eh: any = await this.dispatchPermissionRequestHook(
                  ep,
                  eA.name,
                  ec,
                  eg,
                  eu,
                );
              if (eh?.behavior === "allow")
                return (
                  eu &&
                    this.cachePreToolUseResult(ep, eu, {
                      allowed: !0,
                      permissionDecision: "allow",
                      modifiedInput: eh.updatedInput,
                    }),
                  !1
                );
              if (eh?.behavior === "deny")
                return (
                  eu &&
                    this.cachePreToolUseResult(ep, eu, {
                      allowed: !1,
                      message: eh.message || `Permission denied for ${eA.name}`,
                      permissionDecision: "deny",
                    }),
                  !1
                );
            }
            return !0;
        }
      } catch (eA: any) {
        if (eA instanceof nC.PermissionDeniedError) throw eA;
        return (
          this.debugService.debug(
            `tool-permission: Error during permission check: ${eA}`,
          ),
          !0
        );
      }
    }
    async dispatchPermissionRequestHook(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      try {
        let ep: any = nk.ContainerUtil.get(oT.SessionHookManager),
          eg: any =
            "object" == typeof ec && null !== ec && "value" in ec
              ? ec.value
              : ec,
          { decision: eh } = await ep.executePermissionRequestHooks(
            eA,
            el,
            eg,
            eu,
            ed,
          );
        return eh;
      } catch (eA: any) {
        this.debugService.debug(
          `tool-permission: PermissionRequest hook dispatch failed: ${eA}`,
        );
        return;
      }
    }
    async dispatchPermissionDeniedHook(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      try {
        let ep: any = nk.ContainerUtil.get(oT.SessionHookManager),
          eg: any =
            "object" == typeof ec && null !== ec && "value" in ec
              ? ec.value
              : ec;
        await ep.executePermissionDeniedHooks(eA, el, eg, eu, ed);
      } catch (eA: any) {
        this.debugService.debug(
          `tool-permission: PermissionDenied hook dispatch failed: ${eA}`,
        );
      }
    }
    async executeAndCachePreToolUseHooks(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): Promise<any> {
      let ed: any =
          "object" == typeof ec && null !== ec && "value" in ec ? ec.value : ec,
        ep: any = this.sessionStore.getSessionFilePath(el.id),
        eg: any = await this.toolHookManager.executePreToolUseHooks(
          eA,
          ed,
          el,
          ep,
          nW.PathUtils.getWorkDir(),
          eu,
        );
      return (this.cachePreToolUseResult(el, eu, eg), eg);
    }
    cachePreToolUseResult(eA: any, el: any, ec: any): any {
      (eA.preToolUseHookResults || (eA.preToolUseHookResults = new Map()),
        eA.preToolUseHookResults.set(el, ec));
    }
    async applyUpdate(eA: any, el: any): Promise<any> {
      ((eA.toolPermissionContext = nW.PermissionUtils.applyPermissionUpdate(
        eA.toolPermissionContext,
        el,
      )),
        "setMode" === el.type && eA.permissionModeSubject.next(el.mode),
        await this.persistUpdateIfNeeded(el));
    }
    async persistUpdateIfNeeded(eA: any): Promise<any> {
      let el: any = ({
        userSettings: ih.SettingsScope.USER,
        projectSettings: ih.SettingsScope.PROJECT,
        localSettings: ih.SettingsScope.PROJECT_LOCAL,
      } as any)[eA.destination];
      if (!el) return;
      let ec: any = (await this.settingsManager.get("permissions", el)) || {};
      switch (eA.type) {
        case "setMode": {
          let eu: any = { ...ec, defaultMode: eA.mode };
          await this.settingsManager.set("permissions", eu, el);
          break;
        }
        case "addRules": {
          let eu: any = eA.rules.map(nW.PermissionUtils.ruleValueToString),
            ed: any = eA.behavior,
            ep: any = [...(ec[ed] || []), ...eu],
            eg: any = { ...ec, [ed]: ep };
          await this.settingsManager.set("permissions", eg, el);
          break;
        }
        case "replaceRules": {
          let eu: any = eA.rules.map(nW.PermissionUtils.ruleValueToString),
            ed: any = eA.behavior,
            ep: any = { ...ec, [ed]: eu };
          await this.settingsManager.set("permissions", ep, el);
          break;
        }
        case "removeRules": {
          let eu: any = new Set(
              eA.rules.map(nW.PermissionUtils.ruleValueToString),
            ),
            ed: any = eA.behavior,
            ep: any = (ec[ed] || []).filter((eA: any) => !eu.has(eA)),
            eg: any = { ...ec, [ed]: ep };
          await this.settingsManager.set("permissions", eg, el);
          break;
        }
        case "addDirectories": {
          let eu: any = [
              ...(ec.additionalDirectories || []),
              ...eA.directories,
            ],
            ed: any = { ...ec, additionalDirectories: eu };
          await this.settingsManager.set("permissions", ed, el);
          break;
        }
        case "removeDirectories": {
          let eu: any = new Set(eA.directories),
            ed: any = (ec.additionalDirectories || []).filter(
              (eA: any) => !eu.has(eA),
            ),
            ep: any = { ...ec, additionalDirectories: ed };
          await this.settingsManager.set("permissions", ep, el);
        }
      }
    }
    async initializeContext(eA: any): Promise<any> {
      let el: any = eA.toolPermissionContext,
        ec: any =
          (await this.settingsManager.get(
            "permissions",
            ih.SettingsScope.USER,
          )) || {};
      ((el.allowRules.userSettings = ec.allow || []),
        (el.denyRules.userSettings = ec.deny || []),
        (el.askRules.userSettings = ec.ask || []));
      let eu: any =
        (await this.settingsManager.get(
          "permissions",
          ih.SettingsScope.PROJECT,
        )) || {};
      ((el.allowRules.projectSettings = eu.allow || []),
        (el.denyRules.projectSettings = eu.deny || []),
        (el.askRules.projectSettings = eu.ask || []));
      let ed: any =
        (await this.settingsManager.get(
          "permissions",
          ih.SettingsScope.PROJECT_LOCAL,
        )) || {};
      ((el.allowRules.localSettings = ed.allow || []),
        (el.denyRules.localSettings = ed.deny || []),
        (el.askRules.localSettings = ed.ask || []));
      let ep: any =
        (await this.settingsManager.get("permissions", ih.SettingsScope.CLI)) ||
        {};
      ((el.allowRules.cliArg = ep.allow || []),
        (el.denyRules.cliArg = ep.deny || []),
        (el.askRules.cliArg = ep.ask || []),
        (el.isBypassPermissionsModeAvailable =
          "disable" !==
          (ec.disableBypassPermissionsMode ||
            eu.disableBypassPermissionsMode ||
            ed.disableBypassPermissionsMode ||
            ep.disableBypassPermissionsMode)));
      let eg: any =
        eA.options?.inputFormat === "stream-json" && eA.options?.acp !== !0;
      for (let eh of ((el.shouldAvoidPermissionPrompts =
        eA.options?.print === !0 && eA.options?.acp !== !0 && !eg),
      [
        ...(ec.additionalDirectories || []),
        ...(eu.additionalDirectories || []),
        ...(ed.additionalDirectories || []),
        ...(ep.additionalDirectories || []),
        ...(eA.options?.addDir || []),
      ]))
        el.additionalWorkingDirectories.set(eh, {
          path: eh,
          source: "userSettings",
        });
      (this.debugService.debug("tool-permission: Context initialized"),
        await this.syncSandboxDenyRules(el));
    }
    async syncSandboxDenyRules(eA: any): Promise<any> {
      try {
        let el: any = await this.bashSandboxManager.getConfig();
        if (!el?.enabled) return;
        let ec: any = [],
          eu: any = [
            nC.ToolNames.WRITE,
            nC.ToolNames.EDIT,
            nC.ToolNames.MULTI_EDIT,
            nC.ToolNames.NOTEBOOK_EDIT,
          ];
        if (el.filesystem?.denyWrite)
          for (let eA of el.filesystem.denyWrite)
            for (let el of eu) ec.push(`${el}(${eA})`);
        let ed: any = [
          nC.ToolNames.READ,
          nC.ToolNames.GLOB,
          nC.ToolNames.GREP,
          nC.ToolNames.NOTEBOOK_READ,
        ];
        if (el.filesystem?.denyRead)
          for (let eA of el.filesystem.denyRead)
            for (let el of ed) ec.push(`${el}(${eA})`);
        ec.length > 0 &&
          ((eA.denyRules.sandbox = ec),
          this.debugService.debug(
            `tool-permission: Synced ${ec.length} sandbox deny rules`,
          ));
      } catch (eA: any) {
        this.debugService.debug(
          `tool-permission: Failed to sync sandbox deny rules: ${eA}`,
        );
      }
    }
    checkCommandSafety(eA: any, el: any, ec: any): any {
      if (nW.PermissionUtils.checkSafeyPermission([], eA)) return;
      let eu: any = process.stdin.isTTY || ec.acp;
      if (this.isDangerousCommand(eA) && eu) {
        let el: any = this.isCriticalCommand(eA);
        return (
          this.debugService.debug(
            `tool-permission: ${el ? "CRITICAL" : "HIGH"} command in interactive mode, require approval`,
          ),
          {
            behavior: "ask",
            message: `${el ? "Critical" : "High-risk"} command requires explicit approval`,
            decisionReason: {
              type: "toolValidation",
              message: `${el ? "Critical" : "High-risk"} command safety check`,
            },
          }
        );
      }
      if (el !== ih.PermissionMode.BypassPermissions)
        return (
          this.debugService.debug(
            "tool-permission: Unsafe command, require approval",
          ),
          {
            behavior: "ask",
            message: "Unsafe command requires approval",
            decisionReason: {
              type: "toolValidation",
              message: "Command safety check",
            },
          }
        );
    }
    checkDenyRules(eA: any, el: any, ec: any, eu: any, ed: any): any {
      this.debugService.debug(
        `tool-permission: Checking deny rules: ${JSON.stringify(ec)}`,
      );
      let ep: any = ed
          ? nW.PermissionUtils.matchMcpPermissionRules(ec, el)
          : nW.PermissionUtils.matchPermissionRules(ec, el),
        eg: any = nW.PermissionUtils.findMatchingPermissionRule(ep, eu);
      if (eg)
        return (
          this.debugService.debug(
            `tool-permission: Denied by rule: ${eg.permission}`,
          ),
          {
            behavior: "deny",
            message: this.buildPermissionDeniedError(eA, eg).message,
            decisionReason: {
              type: "rule",
              rule: {
                source: "userSettings",
                behavior: "deny",
                value: { toolName: eA, ruleContent: eg.rule },
                originalRule: eg.permission,
              },
            },
          }
        );
    }
    checkAskRules(eA: any, el: any, ec: any, eu: any): any {
      this.debugService.debug(
        `tool-permission: Checking ask rules: ${JSON.stringify(el)}`,
      );
      let ed: any = eu
        ? nW.PermissionUtils.matchMcpPermissionRules(el, eA)
        : nW.PermissionUtils.matchPermissionRules(el, eA);
      if (nW.PermissionUtils.checkPermissionRules(ed, ec))
        return (
          this.debugService.debug(
            "tool-permission: Ask rule matched, require approval",
          ),
          {
            behavior: "ask",
            message: "Ask rule matched - approval required",
            decisionReason: {
              type: "rule",
              rule: {
                source: "userSettings",
                behavior: "ask",
                value: { toolName: eA[0] },
                originalRule: ed[0]?.permission || "",
              },
            },
          }
        );
    }
    checkAllowRules(eA: any, el: any, ec: any, eu: any): any {
      this.debugService.debug(
        `tool-permission: Checking allow rules: ${JSON.stringify(el)}`,
      );
      let ed: any = eu
        ? nW.PermissionUtils.matchMcpPermissionRules(el, eA)
        : nW.PermissionUtils.matchPermissionRules(el, eA);
      if (nW.PermissionUtils.checkAllowPermissionRules(ed, ec))
        return (
          this.debugService.debug("tool-permission: Allow rule matched"),
          {
            behavior: "allow",
            message: "Allow rule matched",
            decisionReason: {
              type: "rule",
              rule: {
                source: "userSettings",
                behavior: "allow",
                value: { toolName: eA[0] },
                originalRule: ed[0]?.permission || "",
              },
            },
          }
        );
    }
    async checkWithStrategy(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
      ep: any,
    ): Promise<any> {
      for (let eg of nk.ContainerUtil.getAll(nC.ToolPermissionStrategy))
        if (eg.mode === ed) {
          let eh: any = await eg.needApproval(eA, el, ec, eu, ep);
          return (
            this.debugService.debug(
              `tool-permission: Strategy ${ed} returned needsApproval=${eh}`,
            ),
            {
              behavior: eh ? "ask" : "allow",
              message: `Strategy ${ed} decision`,
              decisionReason: { type: "strategy", strategyMode: ed },
            }
          );
        }
    }
    generateRuleSuggestions(eA: any, el: any): any {
      let ec: any = [];
      for (let eu of (ec.push({
        rule: { toolName: eA },
        behavior: "allow",
        destination: "session",
        label: `Allow ${eA} for this session`,
      }),
      el))
        eu.type === nC.ToolArgType.FilePath &&
          ec.push({
            rule: { toolName: eA, ruleContent: eu.value },
            behavior: "allow",
            destination: "localSettings",
            label: `Always allow ${eA} for ${eu.value}`,
          });
      return ec;
    }
    buildPermissionDeniedError(eA: any, el: any): any {
      return eA === nC.ToolNames.BASH && el.arg?.type === nC.ToolArgType.Command
        ? new nC.PermissionDeniedError(
            eA,
            `Permission to use Bash with command ${el.arg.value} has been denied.`,
            el.permission,
          )
        : this.readTools.has(eA) && el.arg?.type === nC.ToolArgType.FilePath
          ? new nC.PermissionDeniedError(
              eA,
              `Permission to read ${el.arg.value} has been denied.`,
              el.permission,
            )
          : this.editTools.has(eA) && el.arg?.type === nC.ToolArgType.FilePath
            ? new nC.PermissionDeniedError(
                eA,
                `Permission to edit ${el.arg.value} has been denied.`,
                el.permission,
              )
            : new nC.PermissionDeniedError(
                eA,
                `Permission to use ${eA} has been denied.`,
                el.permission,
              );
    }
    isMcpTool(eA: any): any {
      return eA.name.startsWith("mcp__");
    }
    isCriticalCommand(eA: any): any {
      for (let el of eA)
        if (
          el.type === nC.ToolArgType.Command &&
          nW.CommandUtils.checkCommandSafety(el.value).riskLevel ===
            nW.RiskLevel.CRITICAL
        )
          return !0;
      return !1;
    }
    isDangerousCommand(eA: any): any {
      for (let el of eA)
        if (el.type === nC.ToolArgType.Command) {
          let eA: any = nW.CommandUtils.checkCommandSafety(el.value);
          if (
            eA.riskLevel === nW.RiskLevel.CRITICAL ||
            eA.riskLevel === nW.RiskLevel.HIGH
          )
            return !0;
        }
      return !1;
    }
    getDefaultPermissionArgs(eA: any): any {
      return [
        {
          type: nC.ToolArgType.Unknown,
          value: "string" == typeof eA ? eA : JSON.stringify(eA.value),
        },
      ];
    }
  }
  return Object.assign(new ToolPermissionService(), dependencies);
}
