// @ts-nocheck
// Original module 76360, UTF-16 [9852690,9858421). Importing this file installs nothing.
export const PROCESS_LIFECYCLE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
/** Explicit activation: installs original handlers on runtime.process and wraps its exit.
 * The caller supplies process, console, timers, and dependency namespaces. No teardown
 * or idempotency is added: the original module is installed once by its module loader.
 */
export function installNativeProcessLifecycle(runtime: any) {
  for (const name of [
    "process",
    "console",
    "setTimeout",
    "clearTimeout",
    "setInterval",
    "clearInterval",
  ])
    if (!runtime?.[name])
      throw Error("Explicit process lifecycle boundary required: " + name);
  const {
    process,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  } = runtime;
  const Date = runtime.Date ?? globalThis.Date;
  const ec = (id: number) => {
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit process lifecycle module required: " + id);
    return value;
  };
  function activateOriginal() {
    "use strict";
    var eu = ec(80699),
      ed = ec(92735),
      ep = ec(94377),
      eg = ec(68366),
      eh = ec(26106),
      ef = ec(93441),
      em = ec(97352),
      eE = ec(79488),
      eC = ec(32110),
      ey = ec(80588),
      ew = ec(99006),
      eB = ec(19702),
      e_ = ec(35179),
      eI = ec(54193),
      ev = ec(9151);
    let eS = "[ProcessExit]",
      eQ = 2e3,
      eD = 4e3;
    function formatExitDiagnostic(eA, el) {
      let ec = [`${eS} ${eA}`];
      if (el instanceof Error) {
        (ec.push(`name=${el.name}`),
          ec.push(`message=${truncate(el.message, eQ)}`));
        let eA = el.code;
        (eA && ec.push(`code=${eA}`),
          el.stack &&
            ec.push(
              `stack=${truncate(el.stack.replace(/\r?\n/g, "\\n"), eD)}`,
            ));
      } else null != el && ec.push(`reason=${truncate(String(el), eQ)}`);
      return ec.join(" | ");
    }
    function truncate(eA, el) {
      return eA.length > el
        ? `${eA.slice(0, el)}…(truncated ${eA.length - el})`
        : eA;
    }
    function persistExitDiagnostic(eA, el) {
      let ec = formatExitDiagnostic(eA, el);
      try {
        eu.ContainerUtil.get(ed.LoggerStorageService).storeSync(
          ec,
          ev.LogLevel.Error,
        );
      } catch {}
    }
    var eT = ec(36648),
      eR = ec(70064);
    let ek = "18.20.8";
    ep.lt(process.versions.node, ek) &&
      (console.error(`
${eh.PRODUCT_CLI_NAME} requires Node.js v${ek} or newer.
You are running Node.js v${process.versions.node}.
Please upgrade Node.js: https://nodejs.org/en/download/
`),
      process.exit(1));
    {
      let eA = process.argv,
        el = eA.includes("--version") || eA.includes("-v"),
        ec = eA.some(
          (eA) =>
            !eA.startsWith("-") &&
            !eA.endsWith("codebuddy") &&
            !eA.endsWith("cbc") &&
            !eA.endsWith("node"),
        );
      if (el && !ec) {
        let eA = em.packageJson?.publishConfig?.customPackage;
        (console.log(eA?.version ?? em.packageJson?.version ?? "unknown"),
          process.exit(0));
      }
    }
    if (
      "win32" === process.platform &&
      "1" !== process.env.CODEBUDDY_SKIP_GIT_BASH_CHECK
    )
      try {
        let eA = eR.WindowsBashUtils.findBashPath();
        eA
          ? (process.env.SHELL = eA)
          : (delete process.env.SHELL,
            console.warn(`
Note: Git Bash not detected. ${eh.PRODUCT_CLI_NAME} will use PowerShell for shell commands.
Git Bash-only features (/enter-worktree, POSIX shell snapshot) will be disabled.
To enable Git Bash features, install Git for Windows (https://git-scm.com/downloads/win)
  or set: CODEBUDDY_CODE_GIT_BASH_PATH=C:\\Program Files\\Git\\bin\\bash.exe
Suppress this notice with: CODEBUDDY_SKIP_GIT_BASH_CHECK=1
`));
      } catch (el) {
        el instanceof Error &&
          el.message.includes("CODEBUDDY_CODE_GIT_BASH_PATH") &&
          (console.error(`
${el.message}
`),
          process.exit(1));
        let eA = el instanceof Error ? el.message : String(el);
        (console.warn(
          `Git Bash detection threw unexpectedly: ${eA}. Falling back to PowerShell. Set CODEBUDDY_SKIP_GIT_BASH_CHECK=1 to suppress this check.`,
        ),
          el instanceof Error && el.stack && console.warn(el.stack));
      }
    function isStreamJsonMode() {
      let eA = process.argv,
        el = eA.indexOf("--output-format");
      return (
        (-1 !== el && "stream-json" === eA[el + 1]) ||
        eA.some((eA) => "--output-format=stream-json" === eA)
      );
    }
    process.noDeprecation = !0;
    let eM = !1;
    try {
      let eA = process.exit.bind(process),
        _exitWrapped = function (el) {
          try {
            (0, ey.killAllSandboxCliSync)();
          } catch {}
          return eA(el);
        };
      process.exit = _exitWrapped;
    } catch {}
    let exit = async (eA = "other") => {
        if (eM) return;
        eM = !0;
        let el = setTimeout(() => {
          try {
            process.exit(1);
          } catch {}
        }, 5e3);
        "function" == typeof el.unref && el.unref();
        try {
          await (0, ef.flushTelemetryBeforeExit)(1500);
          try {
            eu.ContainerUtil.get(e_.ShellSnapshotService).clearCache();
          } catch {}
          try {
            let eA = eu.ContainerUtil.get(eB.ShellService);
            await eA.disposeAll();
          } catch {}
          try {
            eu.ContainerUtil.get(eC.GatewayPtyService).destroyAllSessions();
          } catch {}
          try {
            eu.ContainerUtil.get(
              eE.GatewayProcessService,
            ).destroyAllProcesses();
          } catch {}
          try {
            let eA = eu.ContainerUtil.get(eg.TeamManager);
            if (eA.isInTeam() && eA.isAutoTeam()) {
              (0, eI.stopTeamLeadPoller)();
              let el = (0, eI.getTeamMemberRegistry)();
              (await el.destroyAll(), await eA.deleteTeam());
            }
          } catch {}
          try {
            let eA = eu.ContainerUtil.get(eg.TeamManager);
            await eA.cleanupSessionTeams();
          } catch {}
          let el = eu.ContainerUtil.get(ew.SessionManager),
            ec = eu.ContainerUtil.get(ew.SessionHookManager),
            ed = el?.getCurrent();
          (ed && ec && (await ec.executeSessionEndHooks(ed, eA)),
            await (0, ef.shutdownTelemetryBeforeExit)(1500));
        } catch (eA) {
        } finally {
          (clearTimeout(el), eT.SafeExitUtils.exit(0));
        }
      },
      flushLogsSync = () => {
        try {
          eu.ContainerUtil.get(ed.LoggerStorageService).flushSync();
        } catch {}
      };
    if (
      (process.on("SIGQUIT", () => {
        (persistExitDiagnostic("signal", "SIGQUIT"),
          flushLogsSync(),
          exit("other"));
      }),
      process.on("SIGTERM", () => {
        (persistExitDiagnostic("signal", "SIGTERM"),
          flushLogsSync(),
          exit("other"));
      }),
      process.on("SIGHUP", () => {
        (persistExitDiagnostic("signal", "SIGHUP"),
          flushLogsSync(),
          exit("other"));
      }),
      process.stdin.isTTY &&
        "1" !== process.env.CODEBUDDY_DISABLE_ORPHAN_TTY_CHECK)
    ) {
      let eA = setInterval(() => {
        (process.stdout.writable && process.stdin.readable) ||
          (clearInterval(eA),
          persistExitDiagnostic(
            "orphan_detected",
            "controlling TTY revoked (terminal window closed without SIGHUP)",
          ),
          flushLogsSync(),
          exit("other"));
      }, 3e4);
      "function" == typeof eA.unref && eA.unref();
    }
    (process.on("exit", flushLogsSync),
      process.on("unhandledRejection", (eA) => {
        persistExitDiagnostic("unhandledRejection", eA);
      }),
      process.on("uncaughtException", (eA) => {
        persistExitDiagnostic("uncaughtException", eA);
        let el = [
          "ENXIO",
          "EIO",
          "EPIPE",
          "ERR_STREAM_DESTROYED",
          "ERR_STREAM_WRITE_AFTER_END",
        ];
        if (
          eA &&
          (el.includes(eA.code ?? "") ||
            /stream.*destroyed|cannot.*write/i.test(eA.message))
        ) {
          try {
            process.exit(1);
          } catch {}
          return;
        }
        try {
          if (isStreamJsonMode()) {
            let el = eA instanceof Error ? eA.message : String(eA);
            process.stdout.write(
              JSON.stringify({ type: "error", error: el }) + "\n",
            );
          } else console.error("Uncaught exception:", eA);
        } catch {}
      }),
      process.on("beforeExit", (eA) => {
        try {
          (process.stdout.write(""), process.stderr.write(""));
        } catch {}
      }));
    {
      let eA = process.env.CODEBUDDY_DEBUG_FORCE_CRASH;
      if ("uncaught" === eA || "unhandled" === eA) {
        let el = Date.now(),
          ec = setInterval(() => {
            let ep = !1;
            try {
              (eu.ContainerUtil.get(ed.LoggerStorageService), (ep = !0));
            } catch {}
            if (ep || Date.now() - el > 1e4) {
              if ((clearInterval(ec), "uncaught" === eA))
                throw Error(
                  "forced uncaught exception (CODEBUDDY_DEBUG_FORCE_CRASH)",
                );
              Promise.reject(
                Error(
                  "forced unhandled rejection (CODEBUDDY_DEBUG_FORCE_CRASH)",
                ),
              );
            }
          }, 200);
      }
    }
    return {
      exit,
      flushLogsSync,
      formatExitDiagnostic,
      persistExitDiagnostic,
      isStreamJsonMode,
    };
  }
  return activateOriginal();
}
