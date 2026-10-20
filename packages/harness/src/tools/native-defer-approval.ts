import { ToolArgType } from "../permissions/native-permission-policy.js";
import { nativeToolPermissionMetadata } from "../permissions/native-tool-permission-metadata.js";
// Complete constructor approval callback and defaultNeedsApproval, original DeferExecuteTool 12008364..12018235.
export function createNativeDeferApproval(runtime: any) {
  const nC = { ToolArgType, ToolPermissionService: "permission" },
    nk = { ContainerUtil: { get: (..._args: any[]) => runtime.permission } },
    nW = {
      ModelUtils: {
        isMandatoryApprovalTarget:
          runtime.isMandatoryApprovalTarget ?? (async () => false),
      },
    };
  class NativeDeferApproval {
    [key: string]: any;
    constructor() {
      this.needsApproval = async (eA: any, el: any, ec: any) => {
        let eu: any =
            "object" == typeof el && null !== el && "value" in el
              ? el.value
              : el,
          ed: any = eu?.toolName;
        if (!ed || "string" != typeof ed)
          return this.defaultNeedsApproval(eA, el, ec);
        let ep: any = nk.ContainerUtil.get(nC.ToolPermissionService),
          eg: any = [{ type: nC.ToolArgType.Command, value: ed }],
          eh: any = await ep.checkPermission(this, eA, el, ec, () => eg);
        if ("deny" === eh.behavior) {
          let el: any = eA.context;
          return (
            el &&
              ec &&
              (el.preToolUseHookResults ||
                (el.preToolUseHookResults = new Map()),
              el.preToolUseHookResults.set(ec, {
                allowed: !1,
                message:
                  eh.message || `Permission denied for DeferExecuteTool(${ed})`,
                permissionDecision: "deny",
              })),
            !1
          );
        }
        if (
          this.isMandatoryApprovalEnabled() &&
          (await nW.ModelUtils.isMandatoryApprovalTarget(eA.context, ed))
        )
          return !0;
        if ("allow" === eh.behavior) {
          let eA: any = await this.toolManager.get(ed);
          if (!eA || !0 !== eA.needsApproval) return !1;
        }
        let ef: any = this.toolSearchService.describe(ed);
        if (ed.startsWith("mcp__") || ef?.isBare === !0) {
          let el: any = {
            name: this.getMcpPermissionToolName(ed, ef),
            description: ef?.description || "",
            inputSchema: { type: "object" },
          };
          return ep.needsApproval(el, eA, eu.params || {}, ec);
        }
        let em: any = await this.toolManager.get(ed);
        if (!em) return this.defaultNeedsApproval(eA, el, ec);
        let eE: any = em;
        return ep.needsApproval(
          eE,
          eA,
          eu.params || {},
          ec,
          (eA: any, el: any, ec: any) =>
            eE.resolveNeedPermissionArgs(eA, el, ec),
        );
      };
    }
    async defaultNeedsApproval(eA: any, el: any, ec: any): Promise<any> {
      return nk.ContainerUtil.get(nC.ToolPermissionService).needsApproval(
        this,
        eA,
        el,
        ec,
        (eA: any, el: any, ec: any) =>
          this.resolveNeedPermissionArgs(eA, el, ec),
      );
    }
  }
  const metadata = nativeToolPermissionMetadata("DeferExecuteTool");
  return Object.assign(new NativeDeferApproval(), {
    name: "DeferExecuteTool",
    aliases: [],
    resolveToolType: metadata.resolveToolType.bind(metadata),
    toolManager: runtime.toolManager,
    toolSearchService: runtime.toolSearchService,
    isMandatoryApprovalEnabled: runtime.isMandatoryApprovalEnabled,
    getMcpPermissionToolName: runtime.getMcpPermissionToolName,
    resolveNeedPermissionArgs: runtime.resolveNeedPermissionArgs,
  });
}
