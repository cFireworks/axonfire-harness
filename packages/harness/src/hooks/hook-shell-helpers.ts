import type { GenericHookRuntime } from "./hook-runtime.js";
export function createHookShellHelpers(runtime: GenericHookRuntime) {
  const oK = runtime.shell,
    process = { env: runtime.env };
  function getPowerShellHookShellConfig(): any {
    return {
      executable: "pwsh",
      argsPrefix: [
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-Command",
      ],
    };
  }
  function buildHookSpawnOptions(eA: any, el: any = (0, oK.isWindows)()): any {
    return {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...eA, NODE_OPTIONS: "" },
      ...(el ? { windowsHide: !0 } : {}),
    };
  }
  function isPowerShellExecutable(eA: any): any {
    let el: any = eA.split(/[\\/]/).pop()?.toLowerCase();
    return (
      "powershell.exe" === el ||
      "powershell" === el ||
      "pwsh.exe" === el ||
      "pwsh" === el
    );
  }
  function expandBracedEnvReferences(eA: any, el: any): any {
    return eA.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (eA: any, ec: any) => {
      let eu: any = el[ec];
      return "string" == typeof eu ? eu : eA;
    });
  }
  function withHiddenPowerShellArgs(eA: any): any {
    let el: any = eA.map((eA: any) => eA.toLowerCase()),
      ec: any = el.includes("-noninteractive"),
      eu: any = el.includes("-windowstyle");
    if (ec && eu) return eA;
    let ed: any = [];
    (ec || ed.push("-NonInteractive"), eu || ed.push("-WindowStyle", "Hidden"));
    let ep: any = el.findIndex(
      (eA: any) =>
        "-command" === eA || "-file" === eA || "-encodedcommand" === eA,
    );
    return -1 === ep
      ? [...eA, ...ed]
      : [...eA.slice(0, ep), ...ed, ...eA.slice(ep)];
  }
  function tryBuildDirectPowerShellHookCommand(eA: any, el: any): any {
    let ec: any;
    try {
      ec = (0, oK.parseCommandLine)(expandBracedEnvReferences(eA, el));
    } catch {
      return;
    }
    if (isPowerShellExecutable(ec.exe))
      return { executable: ec.exe, args: withHiddenPowerShellArgs(ec.args) };
  }
  function windowsPathToUnix(eA: any): any {
    let el: any = eA.replace(/\\/g, "/"),
      ec: any = el.match(/^([a-zA-Z]):\//);
    return (ec && (el = "/" + ec[1].toLowerCase() + el.slice(2)), el);
  }
  function parseCommandLine(eA: any): any {
    if ("string" != typeof eA || 0 === eA.trim().length)
      throw Error("parseCommandLine: empty command line");
    let el: any = [],
      ec: any = "",
      eu: any = !1,
      ed: any = !1;
    for (let ep: any = 0; ep < eA.length; ep++) {
      let eg: any = eA[ep],
        eh: any = eA[ep + 1];
      if (eu) {
        if (("`" === eg && '"' === eh) || ("\\" === eg && '"' === eh)) {
          ((ec += '"'), ep++);
          continue;
        }
        if ('"' === eg) {
          eu = !1;
          continue;
        }
        ec += eg;
        continue;
      }
      if ('"' === eg) {
        ((eu = !0), (ed = !0));
        continue;
      }
      if (" " === eg || "	" === eg) {
        ed && (el.push(ec), (ec = ""), (ed = !1));
        continue;
      }
      ((ec += eg), (ed = !0));
    }
    if (eu)
      throw Error(
        `parseCommandLine: unterminated quoted string in ${JSON.stringify(eA)}`,
      );
    if ((ed && el.push(ec), 0 === el.length))
      throw Error("parseCommandLine: no tokens parsed");
    let [ep, ...eg] = el;
    return { exe: ep, args: eg };
  }
  return {
    getPowerShellHookShellConfig,
    buildHookSpawnOptions,
    isPowerShellExecutable,
    expandBracedEnvReferences,
    withHiddenPowerShellArgs,
    tryBuildDirectPowerShellHookCommand,
    windowsPathToUnix,
    parseCommandLine,
  };
}
