// @ts-nocheck
// Complete original token/class declaration; original registration decorator is not executed.
export const SANDBOX_TURN_CONFIG_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SANDBOX_TURN_CONFIG_MODULE = [41695, 10540577, 10541376] as const;
export const SANDBOX_TURN_CONFIG_DECLARATION = [10541077, 10541335] as const;
export const SANDBOX_TURN_CONFIG_CLASS = [10541115, 10541334, 1] as const;
export const SANDBOX_TURN_CONFIG_REGISTRATION = [10541335, 10541375] as const;
export function createNativeSandboxTurnConfig() {
  let ed = Symbol("SandboxTurnConfig"),
    ep = class {
      constructor() {
        ((this.useSandboxCLI = !1),
          (this.enableProjection = !1),
          (this.enableVersionControl = !1),
          (this.enableDeleteProtection = !1),
          (this.enableFileBackup = !1),
          (this.safeDeleteRuntimeEnabled = !0),
          (this.configAllowsAllWritePath = !1));
      }
    };
  return { SandboxTurnConfig: ed, SandboxTurnConfigImpl: ep };
}
