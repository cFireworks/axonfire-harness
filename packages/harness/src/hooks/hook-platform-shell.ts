import * as path from "node:path";
import { CapturedHookWhich } from "../vendor/captured-hook-dependencies.js";
export function createHookPlatformShell(runtime: any) {
  const process = { env: runtime.env, cwd: runtime.getCwd },
    console = { warn: runtime.warn },
    ed = path,
    eu = runtime.fs,
    eg = () => runtime.which ?? CapturedHookWhich;
  class WindowsBashUtils {
    declare static cachedBashPath: any;
    static verifyPathExists(eA: any): any {
      try {
        return eu.existsSync(eA);
      } catch {
        return !1;
      }
    }
    static isWslBash(eA: any): any {
      let el: any = eA.toLowerCase();
      return (
        el.includes("\\system32\\") ||
        el.includes("/system32/") ||
        el.includes("\\syswow64\\") ||
        el.includes("/syswow64/")
      );
    }
    static isGitBash(eA: any): any {
      let el: any = eA.toLowerCase();
      return el.includes("\\git\\") || el.includes("/git/");
    }
    static findExecutableInPath(eA: any): any {
      if ("git" === eA) {
        for (let eA of [
          "C:\\Program Files\\Git\\cmd\\git.exe",
          "C:\\Program Files (x86)\\Git\\cmd\\git.exe",
        ])
          if (this.verifyPathExists(eA)) return eA;
      }
      try {
        let el: any = eg().sync(eA, { all: !0, nothrow: !0 });
        if (!el || 0 === el.length) return;
        let ec: any = process.cwd().toLowerCase();
        for (let eu of el) {
          let el: any = ed.resolve(eu).toLowerCase();
          if (
            !(
              ed.dirname(el).toLowerCase() === ec || el.startsWith(ec + ed.sep)
            ) &&
            !("bash" === eA && this.isWslBash(eu))
          )
            return eu;
        }
        return;
      } catch {
        return;
      }
    }
    static findBashPath(): any {
      if (void 0 !== this.cachedBashPath) return this.cachedBashPath ?? void 0;
      let eA: any = this.doFindBashPath();
      return ((this.cachedBashPath = eA ?? null), eA);
    }
    static doFindBashPath(): any {
      if (process.env.CODEBUDDY_CODE_GIT_BASH_PATH) {
        if (this.verifyPathExists(process.env.CODEBUDDY_CODE_GIT_BASH_PATH))
          return process.env.CODEBUDDY_CODE_GIT_BASH_PATH;
        (console.warn(
          `[WindowsBashUtils] CODEBUDDY_CODE_GIT_BASH_PATH path not found: "${process.env.CODEBUDDY_CODE_GIT_BASH_PATH}", falling back to system git bash detection`,
        ),
          delete process.env.CODEBUDDY_CODE_GIT_BASH_PATH);
      }
      let eA: any = this.findExecutableInPath("git");
      if (eA) {
        let el: any = ed.join(ed.dirname(eA), "..", "bin", "bash.exe");
        if (
          this.verifyPathExists(el) ||
          ((el = ed.join(ed.dirname(eA), "..", "usr", "bin", "bash.exe")),
          this.verifyPathExists(el))
        )
          return el;
      }
      let el: any = this.findExecutableInPath("bash");
      if (el && !this.isWslBash(el) && this.isGitBash(el)) return el;
    }
    static clearCache(): any {
      this.cachedBashPath = void 0;
    }
  }
  const e_ = { WindowsBashUtils },
    eC = () => ({ platform: () => runtime.platform }),
    ew = eg;
  function isWindows(): any {
    return "win32" === eC().platform();
  }
  function commandExists(eA: any): any {
    try {
      return (ew().sync(eA), !0);
    } catch {
      return !1;
    }
  }
  function getPowerShellArgsPrefix(eA: any = isWindows()): any {
    return eA
      ? ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command"]
      : ["-NoProfile", "-NonInteractive", "-Command"];
  }
  function getPowerShellConfiguration(): any {
    let eA: any = getPowerShellArgsPrefix(),
      el: any = ew().sync("pwsh", { nothrow: !0 });
    if (el) return { executable: el, argsPrefix: eA, shell: "powershell" };
    let ec: any = ew().sync("powershell", { nothrow: !0 });
    if (ec) return { executable: ec, argsPrefix: eA, shell: "powershell" };
    let eu: any =
      (process.env.SYSTEMROOT || "C:\\Windows") +
      "\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
    try {
      return (
        runtime.fs.accessSync(eu),
        { executable: eu, argsPrefix: eA, shell: "powershell" }
      );
    } catch {
      throw Error(
        "No shell is available. Neither Git Bash nor PowerShell could be found. Please install PowerShell 7+ (https://aka.ms/powershell) or Git for Windows (https://git-scm.com/download/win).",
      );
    }
  }
  function getShellConfigByType(eA: any): any {
    switch (eA.toLowerCase()) {
      case "bash":
        if (isWindows()) {
          let eA: any = e_.WindowsBashUtils.findBashPath();
          if (!eA)
            return (
              console.warn(
                'CODEBUDDY_CODE_SHELL is set to "bash" but Git Bash was not found. Falling back to PowerShell. Install Git for Windows (https://git-scm.com/download/win) to use bash.',
              ),
              getPowerShellConfiguration()
            );
          return { executable: eA, argsPrefix: ["-c"], shell: "bash" };
        }
        return { executable: "bash", argsPrefix: ["-c"], shell: "bash" };
      case "zsh":
        return { executable: "zsh", argsPrefix: ["-c"], shell: "zsh" };
      case "sh":
        return { executable: "/bin/sh", argsPrefix: ["-c"], shell: "sh" };
      case "powershell":
        return getPowerShellConfiguration();
      case "cmd":
        throw Error(
          'CODEBUDDY_CODE_SHELL="cmd" is not supported. Please use powershell, bash, or install Git for Windows.',
        );
      default:
        throw Error(`Unsupported shell type: ${eA}`);
    }
  }
  function getShellConfiguration(): any {
    let eA: any = process.env.CODEBUDDY_CODE_SHELL;
    if (eA) return getShellConfigByType(eA);
    if (isWindows()) {
      let eA: any = e_.WindowsBashUtils.findBashPath();
      return eA
        ? { executable: eA, argsPrefix: ["-c"], shell: "bash" }
        : getPowerShellConfiguration();
    }
    let el: any = process.env.SHELL;
    if (el && commandExists(el)) {
      let eA: any = detectShellType(el);
      return { executable: el, argsPrefix: ["-c"], shell: eA };
    }
    return { executable: "/bin/sh", argsPrefix: ["-c"], shell: "sh" };
  }
  function detectShellType(eA: any): any {
    let el: any = eA.toLowerCase().split("/").pop() || "sh";
    return el.startsWith("bash")
      ? "bash"
      : el.startsWith("zsh")
        ? "zsh"
        : "sh" === el
          ? "sh"
          : el;
  }
  return {
    WindowsBashUtils,
    isWindows,
    commandExists,
    getPowerShellArgsPrefix,
    getPowerShellConfiguration,
    getShellConfigByType,
    getShellConfiguration,
    detectShellType,
  };
}
