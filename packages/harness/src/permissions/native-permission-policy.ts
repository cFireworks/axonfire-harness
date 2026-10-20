export const ToolArgType = {
  Unknown: "unknown",
  FilePath: "filePath",
  Command: "command",
  SlashCommand: "slashCommand",
  Skill: "skill",
  URL: "url",
} as const;
export const ToolPermissionType = {
  Read: "read",
  Edit: "edit",
  Bash: "bash",
  Unknown: "unknown",
} as const;
export const SettingsScope = {
  USER: "user",
  PROJECT: "project",
  PROJECT_LOCAL: "project-local",
  CLI: "cli",
} as const;
const eY =
  "IMPORTANT: You *may* attempt to accomplish this action using other tools that might naturally be used to accomplish this goal. But you *should not* attempt to work around this denial in malicious ways. You should only try to work around this restriction in reasonable ways that do not attempt to bypass the intent behind this denial. If you believe this capability is essential to complete the user's request, STOP and explain to the user what you were trying to do and why you need this permission. Let the user decide how to proceed.";
export function buildPermissionDeniedMessage(eA: any, el: any): any {
  return `Permission to use ${eA} has been denied because ${el}. ${eY}`;
}
let n_: any = "Bash",
  nI: any = "PowerShell",
  nv: any = new Set(["Agent", "Task"]),
  nS: any = [
    "python",
    "python3",
    "python2",
    "node",
    "deno",
    "tsx",
    "ruby",
    "perl",
    "php",
    "lua",
    "npx",
    "bunx",
    "npm run",
    "yarn run",
    "pnpm run",
    "bun run",
    "bash",
    "sh",
    "ssh",
  ],
  nQ: any = [...nS, "zsh", "fish", "eval", "exec", "env", "xargs", "sudo"],
  nD: any = new Set(["curl", "wget", "kubectl", "aws", "gcloud", "gsutil"]),
  nT: any = {
    kubectl: new Set([
      "exec",
      "apply",
      "create",
      "delete",
      "run",
      "cp",
      "port-forward",
      "proxy",
      "patch",
      "edit",
      "replace",
      "attach",
      "debug",
      "scale",
      "rollout",
      "drain",
      "cordon",
      "taint",
    ]),
  },
  nR: any = [
    ...nS,
    "pwsh",
    "powershell",
    "cmd",
    "wsl",
    "iex",
    "invoke-expression",
    "icm",
    "invoke-command",
    "start-process",
    "saps",
    "start",
    "start-job",
    "sajb",
    "start-threadjob",
    "register-objectevent",
    "register-engineevent",
    "register-wmievent",
    "register-scheduledjob",
    "new-pssession",
    "nsn",
    "enter-pssession",
    "etsn",
    "add-type",
    "new-object",
  ];
function matchesDangerousCommand(eA: any, el: any): any {
  let ec: any = eA.trim().toLowerCase();
  if ("*" === ec) return !0;
  for (let eA of el) {
    let el: any = eA.toLowerCase();
    if (ec === el || ec === `${el}:*` || ec === `${el} *` || ec === `${el}*`)
      return !0;
    if (ec.startsWith(`${el} `) && ec.endsWith("*")) {
      let eA: any = ec.slice(el.length + 1);
      if (nD.has(el)) {
        if (/[$`]/.test(eA)) return !0;
        let ec: any = nT[el],
          eu: any = eA
            .replace(/[\s:*]+$/, "")
            .split(/\s+/)
            .filter(Boolean),
          ed: any = 0;
        for (; ed < eu.length; ed++) {
          let eA: any = eu[ed];
          if (!eA.startsWith("-")) break;
          !eA.includes("=") &&
            ed + 1 < eu.length &&
            !eu[ed + 1].startsWith("-") &&
            ed++;
        }
        let ep: any = eu[ed];
        if (void 0 === ep) {
          if (
            ("curl" === el || "wget" === el) &&
            eu.some((eA: any) => eA.includes("://"))
          )
            continue;
          return !0;
        }
        if (ec?.has(ep)) return !0;
        continue;
      }
      if (eA.startsWith("-")) {
        let ec: any = eA.slice(0, -1);
        if (
          !(
            /^python[\d.]*$/.test(el) && /^-m\s+\w+\.[\w.]+(\s*:|\s+)$/.test(ec)
          )
        )
          return !0;
      }
    }
  }
  return !1;
}
function isDangerousBashContent(eA: any): any {
  return (
    !!(void 0 === eA || "" === eA || /^[\s*]+$/.test(eA)) ||
    matchesDangerousCommand(eA, nQ)
  );
}
function isDangerousPowerShellContent(eA: any): any {
  if (void 0 === eA || "" === eA || /^[\s*]+$/.test(eA)) return !0;
  let el: any = eA.trim().toLowerCase();
  if ("*" === el) return !0;
  for (let eA of nR) {
    let ec: any = eA.toLowerCase();
    if (
      el === ec ||
      el === `${ec}:*` ||
      el === `${ec}*` ||
      el === `${ec} *` ||
      (el.startsWith(`${ec} -`) && el.endsWith("*"))
    )
      return !0;
    let eu: any = ec.indexOf(" "),
      ed: any =
        -1 === eu ? `${ec}.exe` : `${ec.slice(0, eu)}.exe${ec.slice(eu)}`;
    if (
      el === ed ||
      el === `${ed}:*` ||
      el === `${ed}*` ||
      el === `${ed} *` ||
      (el.startsWith(`${ed} -`) && el.endsWith("*"))
    )
      return !0;
  }
  return !1;
}
function parseRule(eA: any): any {
  let el: any = eA.indexOf("(");
  if (el < 0) return { toolName: eA.trim(), content: void 0 };
  let ec: any = eA.lastIndexOf(")");
  return {
    toolName: eA.slice(0, el).trim(),
    content: eA.slice(el + 1, ec >= 0 ? ec : void 0).trim(),
  };
}
function isDangerousAllowRule(eA: any): any {
  let { toolName: el, content: ec } = parseRule(eA);
  return (
    !!nv.has(el) ||
    (el === n_
      ? isDangerousBashContent(ec)
      : el === nI && isDangerousPowerShellContent(ec))
  );
}
function filterDangerousAllowRules(eA: any, el: any): any {
  let ec: any = [];
  for (let eu of eA)
    isDangerousAllowRule(eu)
      ? el?.(
          `Ignoring dangerous allow rule "${eu}" in auto mode because it bypasses the auto classifier.`,
        )
      : ec.push(eu);
  return ec;
}
export {
  filterDangerousAllowRules,
  isDangerousAllowRule,
  isDangerousBashContent,
  isDangerousPowerShellContent,
};
