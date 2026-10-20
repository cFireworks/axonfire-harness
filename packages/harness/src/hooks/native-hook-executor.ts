import { HookEvent, HookPriority } from "./hook-constants.js";
import type { GenericHookRuntime } from "./hook-runtime.js";
const oH = { HookEvent, HookPriority };
// Native UTF-16 8446794..8452932.
export class HookExecutorImpl {
  [key: string]: any;
  constructor(readonly runtime: GenericHookRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  async execute(eA: any, el: any, ec: any): Promise<any> {
    return new Promise((eu: any) => {
      let ed: any,
        ep: any,
        eg: any = "",
        eh: any = "",
        ef: any = !1,
        em: any = ec?.timeout ?? 60000,
        { session: eE, ...eC } = el;
      (this.debugService.debug(`hooks: Executing hook: ${eA}`),
        this.debugService.debug(`hooks: Hook input: ${JSON.stringify(eC)}`));
      let ey: any = { ...this.runtime.env, ...ec?.env },
        ew: any =
          (0, this.runtime.shell.isWindows)() && ec?.shell !== "powershell"
            ? this.runtime.shellHelpers.tryBuildDirectPowerShellHookCommand(
                eA,
                ey,
              )
            : void 0;
      if (ew) ((ed = ew.executable), (ep = ew.args));
      else if (ec?.shell === "powershell") {
        let el: any;
        (({ executable: ed, argsPrefix: el } =
          this.runtime.shellHelpers.getPowerShellHookShellConfig()),
          (ep = [...el, eA]));
      } else {
        let el: any;
        (({ executable: ed, argsPrefix: el } = (0,
        this.runtime.shell.getShellConfiguration)()),
          (ep = [...el, eA]));
      }
      if (
        (0, this.runtime.shell.isWindows)() &&
        ec?.shell !== "powershell" &&
        !ew
      )
        for (let eA of [
          "CLAUDE_PROJECT_DIR",
          "CODEBUDDY_PROJECT_DIR",
          "CLAUDE_PLUGIN_ROOT",
          "CODEBUDDY_PLUGIN_ROOT",
          "CLAUDE_PLUGIN_DATA",
          "CODEBUDDY_PLUGIN_DATA",
        ]) {
          let el: any = ey[eA];
          "string" == typeof el &&
            /^[A-Za-z]:[\\/]/.test(el) &&
            (ey[eA] = (0, this.runtime.shell.windowsPathToUnix)(el));
        }
      let eB: any = this.runtime.now(),
        e_: any = (0, this.runtime.spawn)(
          ed,
          ep,
          this.runtime.shellHelpers.buildHookSpawnOptions(ey),
        );
      (this.logger.info?.(
        `[HookExecutor] spawn pid=${e_.pid ?? "unknown"} shell=${ed} timeout=${em}ms cmd=${eA.slice(0, 200)}`,
      ),
        this.debugService.debug(
          `hooks: spawn pid=${e_.pid ?? "unknown"} shell=${ed} timeout=${em}ms cmd=${eA.slice(0, 200)}`,
        ));
      let eI: any = this.runtime.setTimeout(() => {
          ((ef = !0),
            this.logger.warn(`Hook timed out after ${em}ms: ${eA}`),
            this.debugService.debug(
              `hooks: Hook timed out after ${em}ms: ${eA}`,
            ),
            e_.kill("SIGTERM"),
            this.runtime
              .setTimeout(() => {
                e_.killed || e_.kill("SIGKILL");
              }, 1e3)
              .unref?.());
        }, em),
        decodeBuffer: any = (eA: any) => eA.toString("utf8"),
        ev: any = !1,
        eS: any = !1,
        tryAsyncProbe: any = () => {
          if (ev || eS) return;
          let el: any = eg.trimStart();
          if (!el.startsWith("{")) {
            eg.length > 4096 && (eS = !0);
            return;
          }
          let ec: any = 0,
            ed: any = !1,
            ep: any = !1,
            ef: any = -1;
          for (let eA: any = 0; eA < el.length; eA++) {
            let eu: any = el[eA];
            if (ed)
              ep
                ? (ep = !1)
                : "\\" === eu
                  ? (ep = !0)
                  : '"' === eu && (ed = !1);
            else if ('"' === eu) ed = !0;
            else if ("{" === eu) ec++;
            else if ("}" === eu && 0 == --ec) {
              ef = eA;
              break;
            }
          }
          if (-1 !== ef) {
            eS = !0;
            try {
              let ec: any = JSON.parse(el.slice(0, ef + 1));
              if (!0 === ec.async) {
                ev = !0;
                let el: any =
                  "number" == typeof ec.asyncTimeout && ec.asyncTimeout > 0
                    ? ec.asyncTimeout
                    : em;
                this.runtime.clearTimeout(eI);
                let ed: any = this.runtime.setTimeout(() => {
                  e_.killed ||
                    (e_.kill("SIGTERM"),
                    this.runtime
                      .setTimeout(() => {
                        e_.killed || e_.kill("SIGKILL");
                      }, 1e3)
                      .unref?.());
                }, el);
                (ed.unref?.(),
                  this.logger.info?.(
                    `[HookExecutor] async hook detached pid=${e_.pid ?? "unknown"} asyncTimeout=${el}ms cmd=${eA.slice(0, 80)}`,
                  ),
                  eu({ allowed: !0, exitCode: 0, stdout: eg, stderr: eh }));
              }
            } catch (el: any) {
              this.logger.debug?.(
                `[HookExecutor] async probe: JSON parse failed, treating as sync (command: ${eA.slice(0, 80)})`,
              );
            }
          }
        };
      (e_.stdout?.on("data", (eA: any) => {
        ((eg += decodeBuffer(eA)), tryAsyncProbe());
      }),
        e_.stderr?.on("data", (eA: any) => {
          eh += decodeBuffer(eA);
        }),
        e_.on("exit", (el: any) => {
          if (ev) return;
          this.runtime.clearTimeout(eI);
          let ed: any = this.runtime.now() - eB;
          if (
            ((ef || 0 !== el || ed > 1e3) &&
              this.logger.warn?.(
                `[HookExecutor] abnormal exit pid=${e_.pid ?? "unknown"} code=${el} elapsed=${ed}ms timedOut=${ef} cmd=${eA.slice(0, 80)}`,
              ),
            e_.stdout?.destroy(),
            e_.stderr?.destroy(),
            e_.stdin?.destroy(),
            ef)
          )
            return void eu({
              allowed: !1,
              exitCode: -1,
              stdout: eg,
              stderr: eh,
              message: `Hook timed out after ${em}ms`,
              error: Error(`Hook execution timed out: ${eA}`),
            });
          (this.debugService.debug(
            `hooks: Hook exited with code ${el}, command: ${eA}`,
          ),
            this.debugService.debug(`hooks: Hook stdout: ${eg}`),
            eh && this.debugService.debug(`hooks: Hook stderr: ${eh}`));
          let ep: any = this.parseHookOutput(el, eg, eh, eA),
            eC: any = ep.message || ep.systemMessage || ep.error?.message || "",
            ey: any =
              ec?.hookEvent === oH.HookEvent.USER_PROMPT_SUBMIT && !ep.allowed,
            ew: any =
              ec?.hookEvent === oH.HookEvent.PRE_TOOL_USE &&
              ep.hookSpecificOutput?.permissionDecision === "ask";
          if (eC && !ey && !ew) {
            let eA: any = this.deriveHookStatus(ep);
            eE?.inputSubject.next(
              this.runtime.utilities.InputItemUtils.createHookMessage(
                eC,
                { hookStatus: eA, exitCode: ep.exitCode },
                ec?.hookEvent,
                ec?.callId,
              ),
            );
          }
          eu(ep);
        }),
        e_.on("error", (eA: any) => {
          (this.runtime.clearTimeout(eI),
            this.logger.error(`Hook execution error: ${eA.message}`),
            eu({
              allowed: !1,
              exitCode: -1,
              stdout: eg,
              stderr: eh,
              message: `Hook execution failed: ${eA.message}`,
              error: eA,
            }));
        }),
        e_.stdin?.on("error", (el: any) => {
          "EPIPE" === el.code
            ? this.logger.debug(
                `Hook stdin EPIPE (child exited before reading stdin, safe to ignore): ${eA}`,
              )
            : this.logger.error(`Hook stdin error: ${el.message}`);
        }));
      try {
        let eA: any = JSON.stringify(eC);
        (e_.stdin?.write(eA), e_.stdin?.end());
      } catch (eA: any) {
        (this.runtime.clearTimeout(eI),
          this.logger.error("Failed to write to hook stdin:", eA),
          e_.kill(),
          eu({
            allowed: !1,
            exitCode: -1,
            stdout: eg,
            stderr: eh,
            message: "Failed to write input to hook",
            error: eA,
          }));
      }
    });
  }
  deriveHookStatus(eA: any): any {
    return -1 === eA.exitCode
      ? "error"
      : eA.allowed
        ? 0 !== eA.exitCode
          ? "warning"
          : "success"
        : "blocked";
  }
  parseHookOutput(eA: any, el: any, ec: any, eu: any): any {
    let ed: any = {
      allowed: 0 === eA,
      exitCode: eA ?? -1,
      stdout: el,
      stderr: ec,
    };
    if (el.trim())
      try {
        let eA: any = JSON.parse(el.trim());
        if (eA.hookSpecificOutput?.permissionDecision) {
          let el: any = eA.hookSpecificOutput.permissionDecision;
          "deny" === el
            ? ((ed.allowed = !1), (ed.blocking = !0))
            : "allow" === el && (ed.allowed = !0);
        } else
          "block" === eA.decision
            ? ((ed.allowed = !1),
              (ed.blocking = !0),
              this.logger.warn(
                'Hook uses deprecated "decision" field. Use hookSpecificOutput.permissionDecision instead.',
              ))
            : "approve" === eA.decision
              ? ((ed.allowed = !0),
                this.logger.warn(
                  'Hook uses deprecated "decision" field. Use hookSpecificOutput.permissionDecision instead.',
                ))
              : "boolean" == typeof eA.continue && (ed.allowed = eA.continue);
        (eA.stopReason
          ? (ed.message = eA.stopReason)
          : eA.reason
            ? (ed.message = eA.reason)
            : eA.systemMessage && (ed.message = eA.systemMessage),
          "boolean" == typeof eA.suppressOutput &&
            (ed.suppressOutput = eA.suppressOutput),
          "string" == typeof eA.systemMessage &&
            (ed.systemMessage = eA.systemMessage),
          eA.hookSpecificOutput?.permissionDecisionReason &&
            (ed.permissionDecisionReason =
              eA.hookSpecificOutput.permissionDecisionReason),
          eA.hookSpecificOutput &&
            ((ed.hookSpecificOutput = eA.hookSpecificOutput),
            eA.hookSpecificOutput.modifiedInput &&
              (ed.modifiedInput = eA.hookSpecificOutput.modifiedInput)));
      } catch (eA: any) {
        (this.logger.debug(
          "Hook output is not valid JSON, treating as plain text",
        ),
          (ed.message = el.trim()));
      }
    return (
      2 === eA
        ? ((ed.allowed = !1),
          (ed.blocking = !0),
          !ed.message && ec.trim() && (ed.message = ec.trim()),
          this.logger.info(
            `Hook blocked with exit code 2 (blocking error): ${ed.message || "No stderr output"}`,
          ))
        : 0 !== eA &&
          null !== eA &&
          ((ed.allowed = !0),
          ec.trim() && !ed.systemMessage && (ed.systemMessage = ec.trim()),
          this.logger.info(
            `Hook exited with non-blocking error code ${eA}: ${ed.systemMessage || "No stderr output"}`,
          )),
      ed
    );
  }
}
