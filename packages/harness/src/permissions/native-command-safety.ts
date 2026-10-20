import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createNativeHostDetection } from "./native-host-detection.js";
export function createNativeCommandSafety(runtime: any = {}) {
  let eu: any;
  const process = { platform: runtime.platform ?? globalThis.process.platform },
    ed = { default: runtime.exec ?? promisify(execFile) },
    ep = {
      isWorkBuddyDesktop:
        runtime.isWorkBuddyDesktop ??
        createNativeHostDetection(runtime).isWorkBuddyDesktop,
    };
  let eg: any = new Set([
      "nvm",
      "fnm",
      "rbenv",
      "pyenv",
      "asdf",
      "source",
      "mktemp",
      "code",
      "open",
      "xdg-open",
      "brew",
      "apt",
      "apt-get",
      "yum",
      "dnf",
      "pacman",
      "snap",
      "flatpak",
      "systemctl",
      "service",
      "launchctl",
      "mysql",
      "psql",
      "redis-cli",
      "mongo",
      "mongosh",
      "sqlite3",
      "mysqld",
      "mysqld.exe",
      "postgres",
      "pg_ctl",
      "initdb",
      "mongod",
      "redis-server",
      "docker-compose",
      "vagrant",
      "minikube",
      "kind",
      "helm",
      "trash",
      "trash-put",
      "ln",
      "install",
      "dos2unix",
      "unix2dos",
      "iconv",
      "watchman",
      "tmux",
      "screen",
      "nohup",
      "crontab",
      "at",
      "choco",
      "winget",
      "scoop",
      "start",
      "sc",
      "mklink",
      "robocopy",
    ]),
    eh: any = "high",
    ef: any = "low",
    em: any = [
      /\b(rm|del|delete|remove|drop|destroy|purge|wipe|shred|erase|clean|nuke)\b/,
      /-(rm|del|delete|remove|drop|destroy|purge|wipe|clean)\b/,
    ],
    eE: any =
      /\s+(--delete|--force-delete|--purge|--destroy|--wipe|--erase|--nuke|\bdestroy\b|\bdelete\b|\bpurge\b|\bnuke\b)/;
  function checkWorkBuddyWhitelistOrDefault(eA: any, el: any, ec: any): any {
    let eu: any = eA.toLowerCase();
    if (eg.has(eu))
      return {
        isSafe: !0,
        requiresApproval: !0,
        riskLevel: "low",
        reason: "WorkBuddy: known development tool - low risk",
      };
    for (let eA of em)
      if (eA.test(eu))
        return {
          isSafe: !1,
          requiresApproval: !0,
          riskLevel: eh,
          isUnknown: !0,
          reason:
            "WorkBuddy: unknown command with destructive keyword in name - requires confirmation every time",
        };
    if (eE.test(el))
      return {
        isSafe: !1,
        requiresApproval: !0,
        riskLevel: eh,
        isUnknown: !0,
        reason:
          "WorkBuddy: unknown command with destructive arguments - requires confirmation every time",
      };
    if (ec && ec.fileBlockRecords.length > 0) {
      let eA: any = 4;
      if (ec.fileBlockRecords.some((el: any) => (el.actionMask & eA) != 0)) {
        let el: any = ec.fileBlockRecords
          .filter((el: any) => (el.actionMask & eA) != 0)
          .map((eA: any) => eA.path)
          .slice(0, 5);
        return {
          isSafe: !1,
          requiresApproval: !0,
          riskLevel: eh,
          isUnknown: !0,
          reason: `WorkBuddy: unknown command blocked by sandbox with DELETE operations on: ${el.join(", ")}`,
        };
      }
      return {
        isSafe: !0,
        requiresApproval: !1,
        riskLevel: "safe",
        isUnknown: !0,
        reason:
          "WorkBuddy: unknown command - sandbox blocked non-DELETE operations only, auto-allowed",
      };
    }
    return {
      isSafe: !0,
      requiresApproval: !0,
      riskLevel: ef,
      isUnknown: !0,
      reason:
        "WorkBuddy: unknown command - low risk (sandbox provides safety net)",
    };
  }
  function applyWorkBuddyCommandPolicy(
    eA: any,
    el: any,
    ec: any,
    eu: any,
  ): any {
    let ed: any = eA.riskLevel.toLowerCase();
    if ("critical" === ed || "high" === ed)
      return (console.debug(`[WB-Policy] passthrough ${ed}: "${ec}"`), eA);
    if (eA.isUnknown) {
      let eA: any = checkWorkBuddyWhitelistOrDefault(ec, el, eu);
      return (
        console.debug(
          `[WB-Policy] unknown cmd → ${eA.riskLevel}: "${ec}" (isUnknown=true, hasSandboxCtx=${!!eu})`,
        ),
        eA
      );
    }
    return (console.debug(`[WB-Policy] keep base ${ed}: "${ec}"`), eA);
  }
  function extractCommandName(eA: any): any {
    let el: any,
      ec: any = eA.trimStart();
    if (ec.startsWith('"')) {
      let eA: any = ec.indexOf('"', 1);
      el = eA > 0 ? ec.substring(1, eA) : ec.split(/\s+/)[0];
    } else if (ec.startsWith("'")) {
      let eA: any = ec.indexOf("'", 1);
      el = eA > 0 ? ec.substring(1, eA) : ec.split(/\s+/)[0];
    } else el = ec.split(/\s+/)[0];
    let eu: any = Math.max(el.lastIndexOf("/"), el.lastIndexOf("\\"));
    return eu >= 0 ? el.substring(eu + 1) : el;
  }
  function stripRedirections(eA: any): any {
    return eA
      .replace(/\d*>>[&]?\d+/g, " ")
      .replace(/\d*>[&]\d+/g, " ")
      .replace(/\d+>>[^\s;|&]*/g, " ")
      .replace(/\d+>[^\s;|&]*/g, " ");
  }
  function splitCommandRespectingQuotes(eA: any): any {
    let el: any = [],
      ec: any = "",
      eu: any = !1,
      ed: any = !1;
    for (let ep: any = 0; ep < eA.length; ep++) {
      let eg: any = eA[ep];
      if ("\\" === eg && !eu && ep + 1 < eA.length) {
        ((ec += eg + eA[ep + 1]), ep++);
        continue;
      }
      if ("'" === eg && !ed) {
        ((eu = !eu), (ec += eg));
        continue;
      }
      if ('"' === eg && !eu) {
        ((ed = !ed), (ec += eg));
        continue;
      }
      if (eu || ed) {
        ec += eg;
        continue;
      }
      if (";" === eg || "&" === eg || "|" === eg) {
        for (; ep + 1 < eA.length && /[;&|]/.test(eA[ep + 1]); ) ep++;
        let eu: any = ec.trim();
        (eu.length > 0 && el.push(eu), (ec = ""));
        continue;
      }
      ec += eg;
    }
    let ep: any = ec.trim();
    return (ep.length > 0 && el.push(ep), el);
  }
  function normalizeCommandPaths(eA: any): any {
    return eA.replace(/(^|[;&|]\s*)\/[\w/.-]+/g, (eA: any, el: any) => {
      let ec: any = eA.lastIndexOf("/");
      return el + eA.substring(ec + 1);
    });
  }
  !(function (eA: any): any {
    ((eA.SAFE = "safe"),
      (eA.LOW = "low"),
      (eA.MEDIUM = "medium"),
      (eA.HIGH = "high"),
      (eA.CRITICAL = "critical"));
  })(eu || (eu = {}));
  let eC: any = [
      "ls",
      "dir",
      "pwd",
      "cd",
      "echo",
      "cat",
      "more",
      "less",
      "head",
      "tail",
      "grep",
      "find",
      "cp",
      "mv",
      "mkdir",
      "touch",
      "chmod",
      "chown",
      "df",
      "du",
      "ps",
      "top",
      "which",
      "where",
      "type",
      "file",
      "stat",
      "wc",
      "sort",
      "uniq",
      "diff",
      "patch",
      "tee",
      "xargs",
      "env",
      "printenv",
      "uname",
      "whoami",
      "hostname",
      "date",
      "cal",
      "bc",
      "expr",
      "jq",
      "yq",
      "sed",
      "awk",
      "cut",
      "tr",
      "column",
      "tar",
      "zip",
      "unzip",
      "gzip",
      "gunzip",
      "bzip2",
      "curl",
      "wget",
      "ssh",
      "scp",
      "rsync",
      "npm",
      "node",
      "git",
      "python",
      "python3",
      "pip",
      "pip3",
      "java",
      "javac",
      "mvn",
      "gradle",
      "go",
      "cargo",
      "rustc",
      "gcc",
      "g++",
      "make",
      "cmake",
      "dotnet",
      "swift",
      "swiftc",
      "pnpm",
      "bun",
      "deno",
      "tsx",
      "ts-node",
      "npx",
      "yarn",
      "lerna",
      "turbo",
      "nx",
      "docker",
      "kubectl",
      "terraform",
      "ansible",
      "podman",
      "jest",
      "mocha",
      "vitest",
      "pytest",
      "phpunit",
      "eslint",
      "prettier",
      "tsc",
      "swc",
      "gh",
      "glab",
    ],
    ey: any = [/git\s+restore\s+--staged\b/, /git\s+clean\s+-[^\s]*n/],
    ew: any = [
      /rm\s+(-[rf]+|--recursive|--force).*\/(\s|$)/,
      /rm\s+(-[rf]+|--recursive|--force).*(\/(etc|usr|var|sys|boot|lib)|~\/\*)/,
      /\bdd\b.*of=\/(dev|sys|boot)/,
      /\bmkfs\b/,
      /\bfdisk\b/,
      /\bparted\b/,
      />\s*\/(etc|boot|sys)\//,
      /crontab\s+-r/,
      /\buserdel\b/,
      /\bgroupdel\b/,
      /DROP\s+DATABASE/i,
      /\bTRUNCATE\s+TABLE\b/i,
      /DELETE\s+FROM.*WHERE\s+(1=1|true)/i,
      /FLUSHALL/i,
      /FLUSHDB/i,
      /terraform\s+destroy/,
      /aws\s+\S+\s+delete\b/,
      /az\s+\S+\s+delete\b/,
      /gcloud\s+\S+\s+delete\b/,
      /git\s+checkout\s+--\s+[.*]/,
      /git\s+reset\s+--hard/,
      /git\s+clean\s+-[fdxX]/,
      /git\s+checkout\s+-[fF]/,
      /git\s+stash\s+clear/,
      /git\s+push(\s+[^\s]+)*\s+(-f|--force)(\s|$).*\b(main|master|develop|release|production)\b/,
      /git\s+push(\s+[^\s]+)*\s+\b(main|master|develop|release|production)\b(\s+[^\s]+)*\s+(-f|--force)(\s|$)/,
      /git\s+push(\s+[^\s]+)*\s+(--delete)(\s|$).*\b(main|master|develop|release|production)\b/,
      /git\s+push\s+[^\s]+\s+:(main|master|develop|release|production)\b/,
      /git\s+branch\s+-[dD]\s+(main|master|develop|release|production)\b/,
      /git\s+merge\s+.*--force.*\b(main|master|develop|release|production)\b/,
    ],
    eB: any = [
      /^\s*sudo\b/,
      /^\s*su\s/,
      /\bchmod\s+777/,
      /\brm\s+(-[^\s]*r|-[^\s]*R|--recursive)/,
      /\bshred\b/,
      /\bwipe\b/,
      /\btruncate\b.*-s\s*0/,
      /git\s+branch\s+-D/,
      /git\s+push(\s+[^\s]+)*\s+(-f|--force)(\s|$)/,
      /git\s+push(\s+[^\s]+)*\s+(--delete)(\s|$)/,
      /git\s+push\s+[^\s]+\s+:/,
      /git\s+filter-branch/,
      /git\s+filter-repo/,
      /git\s+worktree\s+(remove|prune)/,
      /git\s+reflog\s+(delete|expire)/,
      /git\s+checkout\s+--\s+\S/,
      /git\s+restore\b/,
      /git\s+stash\s+drop/,
      /docker\s+system\s+prune/,
      /docker\s+volume\s+rm/,
      /kubectl\s+delete\b/,
      /kubectl\s+drain\b/,
      /find\s+.*-delete/,
      /find\s+.*-exec\s+rm/,
      /\|\s*xargs\s+(rm|unlink)/,
      /\brm\s+(?:-[^\s]*\s+)*\S*[*?]/,
    ],
    e_: any = [
      /find\s+.*-exec\s+(bash|sh|python[0-9]*|perl|ruby|php|node|java)\s/,
      /find\s+.*-exec\s+.*-c\s/,
      /find\s+\.\.\/.*-exec/,
      /\brm\b(?!\s*--help|\s*--version)/,
      /\brm\s+(?:-[^\s]*\s+)*(?:[^-\s]\S*\s+)[^-\s]\S*/,
      /\bunlink\b/,
      /\brmdir\b/,
      /curl.*\|\s*(bash|sh)\b/,
      /wget.*\|\s*(bash|sh)\b/,
      /nc\s+-l/,
      /\bncat\b/,
      /\btelnet\b/,
      />\s*\/(dev|proc)/,
      /__import__\s*\(/,
      /eval\s*\([^)]*input/,
      /exec\s*\([^)]*input/,
      /git\s+branch\s+-d\b/,
      /git\s+rm\b/,
      /git\s+tag\s+-d/,
      /git\s+checkout\s+-B/,
      /docker\s+rm\b/,
      /docker\s+rmi\b/,
      /docker\s+network\s+rm/,
      /docker\s+image\s+prune/,
      /docker\s+container\s+prune/,
      /docker\s+volume\s+prune/,
      /podman\s+(rm|rmi)\b/,
      /rsync.*--delete/,
      /\bkill\s+-9/,
      /\bkillall\b/,
      /\bpkill\b/,
      /npm\s+(uninstall|remove|rm|un)\b/,
      /yarn\s+remove\b/,
      /pnpm\s+(remove|rm)\b/,
      /pip\s+uninstall\b/,
      /apt(-get)?\s+(remove|purge|autoremove)/,
      /yum\s+(remove|erase|autoremove)/,
      /dnf\s+(remove|erase|autoremove)/,
      /brew\s+(uninstall|remove|rm)\b/,
      /cargo\s+uninstall\b/,
      /gem\s+uninstall\b/,
      /composer\s+remove\b/,
    ];
  function stripHeredocBodies(eA: any): any {
    return eA.replace(
      /<<-?\s*['"]?(\w+)['"]?\s*\n[\s\S]*?\n\s*\1(?:\s*$|\n)/gm,
      (eA: any, el: any) => `<< ${el}
${el}
`,
    );
  }
  let CommandUtils: any = class CommandUtils {
    declare static RISK_PRIORITY: any;
    static extractCommandPrefix(eA: any): any {
      let el: any, ec: any;
      if (!eA || !eA.trim()) return { prefix: "none" };
      let eu: any = eA.trim().split(/\s+/),
        ed: any = [],
        ep: any = 0;
      for (; ep < eu.length && /^[A-Za-z_]\w*=/.test(eu[ep]); )
        (ed.push(eu[ep]), ep++);
      if (ep >= eu.length) return { prefix: "none" };
      let eg: any = eu[ep];
      if (++ep < eu.length && !eu[ep].startsWith("-")) {
        let eA: any = eu[ep];
        !eA.includes("/") &&
          !eA.includes(".") &&
          !eA.startsWith("=") &&
          ((el = eA), ep++);
      }
      if (el && ep < eu.length && !eu[ep].startsWith("-")) {
        let eA: any = eu[ep];
        eA.includes("/") ||
          eA.includes(".") ||
          eA.startsWith("=") ||
          eA.startsWith("--") ||
          ((ec = eA), ep++);
      }
      let eh: any = [...ed, eg];
      return (el && eh.push(el), ec && eh.push(ec), ep < eu.length)
        ? { prefix: eh.join(" ") }
        : { prefix: "none" };
    }
    static async isCommandAvailable(eA: any): Promise<any> {
      try {
        let el: any = "win32" === process.platform ? "where" : "which";
        return (
          await (0, ed.default)(el, [eA], {
            stdout: "ignore",
            stderr: "ignore",
            shell: "win32" === process.platform,
          }),
          !0
        );
      } catch {
        return !1;
      }
    }
    static checkSingleCommandSafety(eA: any): any {
      for (let el of ey)
        if (el.test(eA))
          return { isSafe: !0, requiresApproval: !1, riskLevel: eu.SAFE };
      for (let el of ew)
        if (el.test(eA))
          return {
            isSafe: !1,
            requiresApproval: !0,
            riskLevel: eu.CRITICAL,
            reason:
              "Critical risk operation detected - requires confirmation every time",
          };
      for (let el of eB)
        if (el.test(eA))
          return {
            isSafe: !1,
            requiresApproval: !0,
            riskLevel: eu.HIGH,
            reason:
              "High risk operation detected - requires confirmation every time",
          };
      for (let el of e_)
        if (el.test(eA))
          return {
            isSafe: !0,
            requiresApproval: !0,
            riskLevel: eu.MEDIUM,
            reason:
              "Medium risk operation detected - please proceed with caution",
          };
      let el: any = extractCommandName(eA.trim());
      return eC.some((eA: any) => eA.toLowerCase() === el.toLowerCase())
        ? { isSafe: !0, requiresApproval: !1, riskLevel: eu.SAFE }
        : {
            isSafe: !0,
            requiresApproval: !0,
            riskLevel: eu.LOW,
            isUnknown: !0,
            reason: "Unknown command - please verify before proceeding",
          };
    }
    static checkCommandSafety(eA: any, el?: any): any {
      if (!eA) return { isSafe: !0, requiresApproval: !1, riskLevel: eu.SAFE };
      let ec: any = normalizeCommandPaths(stripHeredocBodies(eA)).toLowerCase(),
        ed: any = stripRedirections(ec),
        ep: any = splitCommandRespectingQuotes(ed);
      if (ep.length > 1) {
        let eA: any = this.checkCrossSeparatorDangerousPatterns(ed);
        if (eA) return eA;
        let ec: any = { isSafe: !0, requiresApproval: !1, riskLevel: eu.SAFE };
        for (let eA of ep) {
          let eu: any = this.checkSingleCommandWithProductPolicy(eA, el);
          this.RISK_PRIORITY[eu.riskLevel] > this.RISK_PRIORITY[ec.riskLevel] &&
            (ec = eu);
        }
        return ec;
      }
      return this.checkSingleCommandWithProductPolicy(ec, el);
    }
    static checkSingleCommandWithProductPolicy(eA: any, el: any): any {
      let ec: any = this.checkSingleCommandSafety(eA);
      if ((0, ep.isWorkBuddyDesktop)()) {
        let eu: any = extractCommandName(eA.trim());
        return applyWorkBuddyCommandPolicy(ec, eA, eu, el);
      }
      return ec;
    }
    static checkCrossSeparatorDangerousPatterns(eA: any): any {
      return /\|\s*xargs\s+(rm|unlink)\b/.test(eA)
        ? {
            isSafe: !1,
            requiresApproval: !0,
            riskLevel: eu.HIGH,
            reason: "Pipe to xargs rm/unlink detected - batch deletion",
          }
        : /\b(curl|wget)\b.*\|\s*(bash|sh|zsh|ksh)\b/.test(eA)
          ? {
              isSafe: !0,
              requiresApproval: !0,
              riskLevel: eu.MEDIUM,
              reason:
                "Remote script piped to shell detected - please verify source",
            }
          : void 0;
    }
    static getCommandRiskInfo(eA: any): any {
      let el: any = CommandUtils.checkCommandSafety(eA);
      return el.requiresApproval
        ? el.reason ||
            "Potentially risky command detected, please proceed with caution"
        : "";
    }
  };
  CommandUtils.RISK_PRIORITY = {
    [eu.SAFE]: 0,
    [eu.LOW]: 1,
    [eu.MEDIUM]: 2,
    [eu.HIGH]: 3,
    [eu.CRITICAL]: 4,
  };
  return {
    CommandUtils,
    RiskLevel: eu,
    stripHeredocBodies,
    stripRedirections,
    splitCommandRespectingQuotes,
    normalizeCommandPaths,
    extractCommandName,
    applyWorkBuddyCommandPolicy,
    checkWorkBuddyWhitelistOrDefault,
    CRITICAL_COMMAND_PATTERNS: ew,
    HIGH_COMMAND_PATTERNS: eB,
    MEDIUM_COMMAND_PATTERNS: e_,
    SAFE_COMMANDS: eC,
  };
}
