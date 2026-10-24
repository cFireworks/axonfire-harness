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
export function createNativeToolPermissionStrategies(runtime: any) {
  const ih = { PermissionMode },
    nC = {
      ToolNames,
      ToolArgType,
      ToolPermissionType,
      ToolPermissionStrategy: "strategies",
    },
    nW = {
      PermissionUtils: runtime.permissionUtils,
      CommandUtils: runtime.commandUtils,
      PathUtils: runtime.pathUtils,
    },
    iC = "default",
    iy = "acceptEdits",
    iE = { PlanStorageService: "plans" },
    nk = {
      ContainerUtil: {
        get: (key: string) =>
          key === "plans"
            ? runtime.planStorageService
            : instances.find(
                (x) =>
                  x.mode ===
                  (key === "default"
                    ? PermissionMode.Default
                    : PermissionMode.AcceptEdits),
              ),
        getAll: (..._args: any[]) => instances,
      },
    };
  let iS: any = new Set([
    nC.ToolNames.READ,
    nC.ToolNames.GLOB,
    nC.ToolNames.GREP,
    nC.ToolNames.LS,
    nC.ToolNames.NOTEBOOK_READ,
    nC.ToolNames.LSP,
    nC.ToolNames.TOOL_SEARCH,
    nC.ToolNames.LIST_MCP_RESOURCES,
    nC.ToolNames.READ_MCP_RESOURCE,
    nC.ToolNames.WAIT_FOR_MCP_SERVERS,
    nC.ToolNames.TODO_WRITE,
    nC.ToolNames.TASK_CREATE,
    nC.ToolNames.TASK_GET,
    nC.ToolNames.TASK_UPDATE,
    nC.ToolNames.TASK_LIST,
    nC.ToolNames.TASK_STOP,
    nC.ToolNames.TASK_OUTPUT,
    nC.ToolNames.ASK_USER_QUESTION,
    nC.ToolNames.ENTER_PLAN_MODE,
    nC.ToolNames.EXIT_PLAN_MODE,
    nC.ToolNames.SEND_MESSAGE,
  ]);
  class NativeDefaultStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.Default;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = [eA.name, ...(eA.aliases || [])].map((eA: any) =>
        eA.toLowerCase(),
      );
      switch (eA.resolveToolType(ep)) {
        case nC.ToolPermissionType.Read: {
          let el: any = await nW.PermissionUtils.isArgsInTrustedDirectories(eu);
          if (
            (this.logger.info?.(
              `[ToolPermission-Default] Read tool=${eA.name}, inTrustedDirectories=${el}, checkArgs=${JSON.stringify(eu.map((eA: any) => ({ type: eA.type, value: eA.value?.slice?.(0, 100) })))}`,
            ),
            !el)
          )
            return !0;
          return !1;
        }
        case nC.ToolPermissionType.Edit:
        case nC.ToolPermissionType.Bash:
        default:
          return !0;
      }
    }
  }
  class NativeAcceptEditsStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.AcceptEdits;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = [eA.name, ...(eA.aliases || [])].map((eA: any) =>
        eA.toLowerCase(),
      );
      switch (eA.resolveToolType(ep)) {
        case nC.ToolPermissionType.Read:
          if (!(await nW.PermissionUtils.isArgsInTrustedDirectories(eu)))
            return !0;
          return !1;
        case nC.ToolPermissionType.Edit:
          return !1;
        case nC.ToolPermissionType.Bash:
        default:
          return !0;
      }
    }
  }
  class NativePlanStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.Plan;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = el.context,
        eg: any = [eA.name, ...(eA.aliases || [])].map((eA: any) =>
          eA.toLowerCase(),
        ),
        eh: any = eA.resolveToolType(eg),
        ef: any = ep?.meta?.prePlanPermissionMode;
      if (
        (this.logger.info?.(
          `[ToolPermission-Plan] tool=${eA.name}, toolType=${eh}, prePlanMode=${ef || "undefined(→Default)"}, callId=${ed}`,
        ),
        !0 === eA.needsApproval)
      )
        return (
          this.logger.info?.(
            `[ToolPermission-Plan] tool=${eA.name} declares needsApproval=true, always requires approval`,
          ),
          !0
        );
      switch (eh) {
        case nC.ToolPermissionType.Read: {
          let ep: any = await this.delegateToPrePlanStrategy(
            ef,
            eA,
            el,
            ec,
            eu,
            ed,
          );
          return (
            this.logger.info?.(
              `[ToolPermission-Plan] Read delegation result: needApproval=${ep}`,
            ),
            ep
          );
        }
        case nC.ToolPermissionType.Edit:
          if (this.isPlanFileEdit(el, eu)) return !1;
          return this.delegateToPrePlanStrategy(ef, eA, el, ec, eu, ed);
        case nC.ToolPermissionType.Bash:
        default:
          return this.delegateToPrePlanStrategy(ef, eA, el, ec, eu, ed);
      }
    }
    async delegateToPrePlanStrategy(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
      ep: any,
    ): Promise<any> {
      let eg: any = eA || ih.PermissionMode.Default;
      this.logger.info?.(
        `[ToolPermission-Plan] delegateToPrePlanStrategy: targetMode=${eg}, tool=${el.name}`,
      );
      let eh: any = nk.ContainerUtil.getAll(nC.ToolPermissionStrategy).find(
        (eA: any) => eA.mode === eg,
      );
      if (
        (this.logger.info?.(
          `[ToolPermission-Plan] delegateToPrePlanStrategy: found strategy=${!!eh}, strategyMode=${eh?.mode}`,
        ),
        eh && eh !== this)
      ) {
        let eA: any = await eh.needApproval(el, ec, eu, ed, ep);
        return (
          this.logger.info?.(
            `[ToolPermission-Plan] delegateToPrePlanStrategy: delegated result=${eA}`,
          ),
          eA
        );
      }
      let ef: any = nk.ContainerUtil.get(iC),
        em: any = await ef.needApproval(el, ec, eu, ed, ep);
      return (
        this.logger.info?.(
          `[ToolPermission-Plan] delegateToPrePlanStrategy: fallback to Default, result=${em}`,
        ),
        em
      );
    }
    isPlanFileEdit(eA: any, el: any): any {
      let ec: any = eA.context;
      if (!ec) return !1;
      let eu: any = nk.ContainerUtil.get(iE.PlanStorageService).getPlanFilePath(
        ec,
      );
      if (!eu) return !1;
      let ed: any = el.find((eA: any) => eA.type === nC.ToolArgType.FilePath);
      return (
        !!ed?.value && nW.PathUtils.resolveFilePathToWorkDir(ed.value) === eu
      );
    }
  }
  class NativeBypassStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.BypassPermissions;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = await this.settingsManager.get("permissions");
      return (
        ep?.disableBypassPermissionsMode === "disable" &&
        nk.ContainerUtil.get(iC).needApproval(eA, el, ec, eu, ed)
      );
    }
  }
  class NativeWorkStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.Work;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = [eA.name, ...(eA.aliases || [])].map((eA: any) =>
        eA.toLowerCase(),
      );
      switch (eA.resolveToolType(ep)) {
        case nC.ToolPermissionType.Read:
          return !1;
        case nC.ToolPermissionType.Edit:
          return !0;
        case nC.ToolPermissionType.Bash: {
          let eA: any = eu.find(
            (eA: any) => eA.type === nC.ToolArgType.Command,
          );
          if (eA?.value) {
            let el: any = nW.CommandUtils.checkCommandSafety(eA.value);
            if (!el.requiresApproval && el.isSafe) return !1;
          }
          return !0;
        }
        default:
          return !1;
      }
    }
  }
  class NativeDelegateStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.Delegate;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      return !1;
    }
  }
  class NativeDontAskStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.DontAsk;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = [eA.name, ...(eA.aliases || [])].map((eA: any) =>
        eA.toLowerCase(),
      );
      switch (eA.resolveToolType(ep)) {
        case nC.ToolPermissionType.Read:
          return !(await nW.PermissionUtils.isArgsInTrustedDirectories(eu));
        case nC.ToolPermissionType.Bash:
        case nC.ToolPermissionType.Edit:
        default:
          return !0;
      }
    }
  }
  class NativeAutoStrategy {
    [key: string]: any;
    constructor() {
      this.mode = ih.PermissionMode.Auto;
    }
    async needApproval(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      let ep: any = nk.ContainerUtil.get(iy);
      if (!(await ep.needApproval(eA, el, ec, eu, ed))) return !1;
      let eg: any = [eA.name, ...(eA.aliases || [])];
      return (
        !eg.some((eA: any) => iS.has(eA)) &&
        eA.resolveToolType(eg.map((eA: any) => eA.toLowerCase())) !==
          nC.ToolPermissionType.Read
      );
    }
  }
  const instances = [
    new NativeDefaultStrategy(),
    new NativeAcceptEditsStrategy(),
    new NativePlanStrategy(),
    new NativeBypassStrategy(),
    new NativeWorkStrategy(),
    new NativeDelegateStrategy(),
    new NativeDontAskStrategy(),
    new NativeAutoStrategy(),
  ];
  for (const instance of instances)
    Object.assign(instance, {
      logger: runtime.logger ?? {},
      settingsManager: runtime.settingsManager,
    });
  return instances;
}
