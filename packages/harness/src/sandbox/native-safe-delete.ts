// @ts-nocheck
// Original complete safe-delete/helper factories. Filesystem and module-loader roots are explicit.
export const SAFE_DELETE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SAFE_DELETE_MODULES = [
  [35568, 11279769, 11301909],
  [8616, 11301910, 11303045],
  [75753, 10518764, 10519328],
  [61462, 9441678, 9444664],
  [93289, 6501773, 6501840],
  [69897, 6504193, 6504557],
  [50158, 6501841, 6504192],
] as const;
export function createNativeSafeDelete(runtime: any) {
  if (!runtime?.process || !runtime.__filename || !runtime.__dirname)
    throw Error("Explicit safe-delete process and module file roots required");
  const process = runtime.process,
    __filename = runtime.__filename,
    __dirname = runtime.__dirname,
    Buffer = runtime.Buffer ?? globalThis.Buffer,
    Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math;
  const factories = {
    35568(eA, el, ec) {
      "use strict";
      let eu, ed, ep;
      (ec.r(el),
        ec.d(el, {
          SAFE_DELETE_REPORT_ENV: () => eS,
          buildPowerShellSafeDeleteEnv: () => buildPowerShellSafeDeleteEnv,
          createSafeDeleteBulkGuardContext: () =>
            createSafeDeleteBulkGuardContext,
          parseSafeDeleteBulkConfirmInfo: () => parseSafeDeleteBulkConfirmInfo,
          SAFE_DELETE_FAIL_CLOSED_MARKER_RE: () => eP,
          rejectSafeDeleteBulkGuard: () => rejectSafeDeleteBulkGuard,
          ensureSafeDeleteReportPath: () => ensureSafeDeleteReportPath,
          parseSafeDeleteBulkThreshold: () => parseSafeDeleteBulkThreshold,
          normalizeWindowsShellPathForAudit: () =>
            normalizeWindowsShellPathForAudit,
          shouldEscalateSafeDeleteFailClosed: () =>
            shouldEscalateSafeDeleteFailClosed,
          resolveWindowsRecycleBinAuditPath: () =>
            resolveWindowsRecycleBinAuditPath,
          readBulkGuardSignalFile: () => readBulkGuardSignalFile,
          shouldEscalateSafeDeleteBulkConfirm: () =>
            shouldEscalateSafeDeleteBulkConfirm,
          DEFAULT_SAFE_DELETE_BULK_THRESHOLD: () => ew,
          buildSafeDeletePosixBootstrap: () => buildSafeDeletePosixBootstrap,
          SAFE_DELETE_BULK_STATE_DIR_NAME: () => eB,
          SAFE_DELETE_BULK_CONFIRM_MARKER_RE: () => eL,
          logSafeDeleteInjection: () => logSafeDeleteInjection,
          filterSafeDeleteTempProbeNoise: () => filterSafeDeleteTempProbeNoise,
          attachSafeDeleteReportEvents: () => attachSafeDeleteReportEvents,
          isSafeDeleteHelperProcessExecRecord: () =>
            eD.isSafeDeleteHelperProcessExecRecord,
          isSafeDeleteRuntimeEnabled: () => isSafeDeleteRuntimeEnabled,
          resolveSafeDeleteRuntimeConfig: () => resolveSafeDeleteRuntimeConfig,
          isSafeDeleteHelperPath: () => eD.isSafeDeleteHelperPath,
          approveSafeDeleteBulkGuard: () => approveSafeDeleteBulkGuard,
          matchesSafeDeleteEscalationCommand: () =>
            matchesSafeDeleteEscalationCommand,
          buildSafeDeleteEnv: () => buildSafeDeleteEnv,
          resolveSafeDeleteRuntimeEnabled: () =>
            resolveSafeDeleteRuntimeEnabled,
          readSafeDeleteReport: () => readSafeDeleteReport,
        }));
      var eg = ec(79896),
        eh = ec.n(eg),
        ef = ec(70857),
        em = ec.n(ef),
        eE = ec(16928),
        eC = ec.n(eE),
        ey = ec(44237);
      let ew = 50,
        eB = "codebuddy-safe-delete-bulk",
        e_ = "[safe-delete][SAFE_DELETE_BULK_CONFIRM_REQUIRED]",
        eI = 5;
      function extractJsonObject(eA) {
        let el = eA.indexOf("{");
        if (el < 0) return;
        let ec = 0,
          eu = !1,
          ed = !1;
        for (let ep = el; ep < eA.length; ep++) {
          let eg = eA[ep];
          if (eu) {
            if (ed) {
              ed = !1;
              continue;
            }
            if ("\\" === eg) {
              ed = !0;
              continue;
            }
            '"' === eg && (eu = !1);
            continue;
          }
          if ('"' === eg) {
            eu = !0;
            continue;
          }
          if ("{" === eg) {
            ec++;
            continue;
          }
          if ("}" === eg && 0 == --ec) return eA.slice(el, ep + 1);
        }
      }
      function parseMarkerPayload(eA) {
        try {
          return JSON.parse(eA);
        } catch {
          return;
        }
      }
      function normalizeTargets(eA) {
        return Array.isArray(eA)
          ? eA.filter((eA) => "string" == typeof eA).slice(0, eI)
          : [];
      }
      function finiteNumber(eA) {
        return "number" == typeof eA && Number.isFinite(eA) ? eA : void 0;
      }
      function parseSafeDeleteBulkConfirmMarker(eA) {
        let el = eA.indexOf(e_);
        if (el < 0) return;
        let ec = extractJsonObject(eA.slice(el));
        if (!ec) return;
        let eu =
          parseMarkerPayload(ec) ??
          parseMarkerPayload(ec.replace(/\r?\n/g, ""));
        if (!eu) return;
        let ed = finiteNumber(eu.count),
          ep = finiteNumber(eu.threshold);
        if (void 0 === ed || void 0 === ep) return;
        let eg = normalizeTargets(eu.sampleTargets ?? eu.targets);
        return {
          count: ed,
          threshold: ep,
          scope: "turn",
          targets: eg,
          targetCount: finiteNumber(eu.targetCount) ?? eg.length,
        };
      }
      let ev = (0, ec(73339).createRequire)(__filename);
      function resolveBulkGuardHelperPath() {
        let eA = [
          eC().join(
            ey.PathUtils.getRootPathSync(),
            "vendor",
            "shim",
            "safe-delete-bulk-guard.cjs",
          ),
          eC().resolve(
            __dirname,
            "../../../../..",
            "vendor",
            "shim",
            "safe-delete-bulk-guard.cjs",
          ),
          process.env.CODEBUDDY_SAFE_DELETE_BULK_GUARD,
        ].filter(Boolean);
        for (let el of eA) if (eh().existsSync(el)) return el;
        return eA[0];
      }
      function loadBulkGuardHelper() {
        return (eu || (eu = ev(resolveBulkGuardHelperPath())), eu);
      }
      function createSafeDeleteBulkGuardContext(eA) {
        return loadBulkGuardHelper().createSafeDeleteBulkGuardContext(eA);
      }
      function approveSafeDeleteBulkGuard(eA, el) {
        loadBulkGuardHelper().approveSafeDeleteBulkGuard(eA, el);
      }
      function rejectSafeDeleteBulkGuard(eA, el) {
        loadBulkGuardHelper().rejectSafeDeleteBulkGuard(eA, el);
      }
      function bulkGuardSignalFilePath(eA) {
        return eC().join(eA.sessionDir, `signal-${eA.toolCallId}.json`);
      }
      function readBulkGuardSignalFile(eA) {
        let el,
          ec = bulkGuardSignalFilePath(eA);
        try {
          el = eh().readFileSync(ec, "utf-8");
        } catch {
          return;
        }
        try {
          eh().unlinkSync(ec);
        } catch {}
        try {
          let eA = JSON.parse(el),
            ec = eA.type;
          if ("confirmRequired" !== ec && "rejected" !== ec) return;
          let eu = eA.payload;
          if (!eu || "object" != typeof eu) return;
          return { type: ec, payload: eu };
        } catch {
          return;
        }
      }
      let eS = "CODEBUDDY_SAFE_DELETE_REPORT_PATH";
      function isSafeDeleteRuntime(eA) {
        return (
          "bash" === eA ||
          "node" === eA ||
          "powershell" === eA ||
          "python" === eA
        );
      }
      function ensureSafeDeleteReportPath(eA) {
        if (eA[eS]) return eA[eS];
        try {
          let el = eC().join(em().tmpdir(), "codebuddy-safe-delete");
          eh().mkdirSync(el, { recursive: !0, mode: 448 });
          let ec = Math.random().toString(36).slice(2),
            eu = eC().join(
              el,
              `report-${process.pid}-${Date.now()}-${ec}.jsonl`,
            );
          return ((eA[eS] = eu), eu);
        } catch {
          return;
        }
      }
      function readSafeDeleteReport(eA, el) {
        if (!eA) return [];
        let ec = "";
        try {
          ec = eh().readFileSync(eA, "utf8");
        } catch (ec) {
          return (
            ec?.code !== "ENOENT" &&
              el?.debug?.(
                `[safe-delete] failed to read report ${eA}: ${ec?.message || ec}`,
              ),
            []
          );
        } finally {
          try {
            eh().rmSync(eA, { force: !0 });
          } catch {}
        }
        let eu = [];
        for (let eA of ec.split(/\r?\n/)) {
          let ec = eA.replace(/^\uFEFF/, "").trim();
          if (ec)
            try {
              let eA = JSON.parse(ec);
              if (
                eA &&
                "trash" === eA.operation &&
                "string" == typeof eA.path &&
                eA.path.length > 0
              ) {
                let ec = {
                  operation: "trash",
                  path: eA.path,
                  runtime: isSafeDeleteRuntime(eA.runtime)
                    ? eA.runtime
                    : void 0,
                  timestamp:
                    "number" == typeof eA.timestamp ? eA.timestamp : void 0,
                };
                (eu.push(ec),
                  el?.info?.(
                    `[safe-delete] moved to trash | runtime=${ec.runtime ?? "unknown"} | path=${ec.path}`,
                  ));
              }
            } catch (eA) {
              el?.debug?.(
                `[safe-delete] failed to parse report line: ${eA?.message || eA}`,
              );
            }
        }
        return eu;
      }
      function attachSafeDeleteReportEvents(eA, el, ec) {
        let eu = readSafeDeleteReport(el, ec),
          ed = eA;
        return (
          eu.length > 0 &&
            (ed.safeDeleteEvents = [...(ed.safeDeleteEvents ?? []), ...eu]),
          ed
        );
      }
      let eQ = [
        "genie-safe-delete.cjs",
        "sitecustomize.py",
        eC().join("safe-bin", "safe-delete-bash-env.sh"),
        eC().join("safe-bin", "safe-delete-common.sh"),
        eC().join("safe-bin", "rm"),
        eC().join("safe-bin", "unlink"),
        eC().join("safe-bin", "rmdir"),
      ];
      function isBunVirtualPath(eA) {
        if (!eA) return !1;
        let el = eA.toLowerCase().replace(/\\/g, "/");
        return el.includes("$bunfs") || el.includes("~bun");
      }
      function canAccess(eA) {
        try {
          return (eh().accessSync(eA, eh().constants.F_OK), !0);
        } catch {
          return !1;
        }
      }
      function canExecute(eA) {
        try {
          return (eh().accessSync(eA, eh().constants.X_OK), !0);
        } catch {
          return !1;
        }
      }
      function addRuntimeRootCandidate(eA, el, ec) {
        if (!ec || isBunVirtualPath(ec)) return;
        let eu = eC().resolve(ec),
          ed = "win32" === process.platform ? eu.toLowerCase() : eu;
        el.has(ed) || (el.add(ed), eA.push(eu));
      }
      function getRuntimeRootCandidates(eA) {
        let el = [],
          ec = new Set();
        addRuntimeRootCandidate(el, ec, eA);
        let eu = eC().dirname(process.execPath);
        (addRuntimeRootCandidate(el, ec, eu),
          addRuntimeRootCandidate(el, ec, eC().resolve(eu, "..")));
        let ed = process.argv[1];
        if (ed && !isBunVirtualPath(ed)) {
          let eA = eC().dirname(ed);
          (addRuntimeRootCandidate(el, ec, eA),
            addRuntimeRootCandidate(el, ec, eC().resolve(eA, "..")));
        }
        let ep = process.env.CODEBUDDY_CODE_PATH;
        if (ep && !isBunVirtualPath(ep)) {
          let eA = eC().dirname(ep);
          (addRuntimeRootCandidate(el, ec, eA),
            addRuntimeRootCandidate(el, ec, eC().resolve(eA, "..")));
        }
        return el;
      }
      function resolveGenieTrashDir(eA) {
        let el = process.resourcesPath;
        if (el) {
          let eA = eC().join(el, "vendor", "genie-trash");
          if (canAccess(eA)) return eA;
        }
        let ec = eC().resolve(eA, "..", "genie-trash");
        return canAccess(ec) ? ec : void 0;
      }
      function hasCompleteShimBundle(eA) {
        return eQ.every((el) => canAccess(eC().join(eA, el)));
      }
      function resolveSafeDeleteRuntimePaths() {
        if (void 0 !== ed) return ed ?? void 0;
        for (let eA of getRuntimeRootCandidates(
          ey.PathUtils.getRootPathSync(),
        )) {
          let el = eC().join(eA, "vendor", "shim");
          if (!hasCompleteShimBundle(el)) continue;
          let ec = eC().join(el, "safe-bin");
          return (ed = {
            shimDir: el,
            nodeShimPath: eC().join(el, "genie-safe-delete.cjs"),
            safeBinDir: ec,
            bashEnvPath: eC().join(ec, "safe-delete-bash-env.sh"),
            genieTrashDir: resolveGenieTrashDir(el),
          });
        }
        ed = null;
      }
      function normalizeBulkThreshold(eA) {
        let el =
          "number" == typeof eA ? eA : Number.parseInt(String(eA ?? ""), 10);
        return Number.isFinite(el) && el > 0 ? Math.floor(el) : ew;
      }
      function isElectronNodeBin(eA) {
        return (
          !!eA &&
          (/(?:^|[/\\])Electron(?:\.exe)?$/i.test(eA) ||
            /[/\\][^/\\]+\.app[/\\]Contents[/\\]MacOS[/\\][^/\\]+$/i.test(eA))
        );
      }
      function isUsableNodeBinPath(eA) {
        return (
          !(
            !eA ||
            isElectronNodeBin(eA) ||
            ("win32" === process.platform && /\.(?:cmd|bat)$/i.test(eA))
          ) &&
          (!eC().isAbsolute(eA) || canExecute(eA))
        );
      }
      function findNodeBinInPath(eA) {
        if (eA)
          for (let el of eA.split(eC().delimiter)) {
            if (!el) continue;
            let eA = eC().join(
              el,
              "win32" === process.platform ? "node.exe" : "node",
            );
            if (canExecute(eA)) return eA;
          }
      }
      function resolveSafeDeleteNodeBin(eA) {
        let el,
          ec = [
            eA.CODEBUDDY_NODE_BIN || "",
            eA.NODE_BINARY || "",
            eA.PATH || "",
            process.env.CODEBUDDY_NODE_BIN || "",
            process.env.NODE_BINARY || "",
            process.env.PATH || "",
            process.execPath,
            process.platform,
            process.versions?.electron ? "electron" : "node",
          ].join("\0");
        if (ep?.key === ec) return ep.value;
        let eu =
          eA.CODEBUDDY_NODE_BIN ||
          eA.NODE_BINARY ||
          process.env.CODEBUDDY_NODE_BIN ||
          process.env.NODE_BINARY;
        return (
          (ep = {
            key: ec,
            value: (el = isUsableNodeBinPath(eu)
              ? eu
              : isElectronNodeBin(eu)
                ? findNodeBinInPath(eA.PATH) ||
                  findNodeBinInPath(process.env.PATH) ||
                  (!process.versions?.electron &&
                  isUsableNodeBinPath(process.execPath)
                    ? process.execPath
                    : void 0)
                : !process.versions?.electron &&
                    isUsableNodeBinPath(process.execPath)
                  ? process.execPath
                  : findNodeBinInPath(eA.PATH) ||
                    findNodeBinInPath(process.env.PATH)),
          }),
          el
        );
      }
      function injectBulkGuardEnv(eA, el, ec) {
        let eu =
            ec?.sessionId || eA.CODEBUDDY_SESSION_ID || eA.CLAUDE_SESSION_ID,
          ed = ec?.toolCallId || eA.CODEBUDDY_TOOL_CALL_ID;
        if (!eu || !ed) return;
        let ep = eC().join(el.shimDir, "safe-delete-bulk-guard.cjs");
        if (!canAccess(ep)) return;
        let eg = resolveSafeDeleteNodeBin(eA);
        if (!eg) return;
        let eh =
          ec?.conversationRequestId || eA.CODEBUDDY_CONVERSATION_REQUEST_ID;
        ((eA.CODEBUDDY_SESSION_ID = eu),
          (eA.CLAUDE_SESSION_ID = eA.CLAUDE_SESSION_ID || eu),
          (eA.CODEBUDDY_TOOL_CALL_ID = ed),
          eh && (eA.CODEBUDDY_CONVERSATION_REQUEST_ID = eh),
          (eA.CODEBUDDY_NODE_BIN = eg),
          (eA.CODEBUDDY_SAFE_DELETE_BULK_GUARD = ep),
          (eA.CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR =
            eA.CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR ||
            eC().join(em().tmpdir(), eB)),
          (eA.CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD = String(
            normalizeBulkThreshold(
              ec?.bulkThreshold ?? eA.CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD,
            ),
          )));
      }
      function buildSafeDeleteEnv(eA, el) {
        let ec = { ...eA };
        if (el?.enabled === !1) return ec;
        let eu = resolveSafeDeleteRuntimePaths();
        if (!eu) return ec;
        let {
          shimDir: ed,
          nodeShimPath: ep,
          safeBinDir: eg,
          bashEnvPath: eh,
          genieTrashDir: ef,
        } = eu;
        (ec.CODEBUDDY_SAFE_DELETE_BIN_DIR ||
          (ec.CODEBUDDY_SAFE_DELETE_BIN_DIR = eg),
          !ec.GENIE_TRASH_DIR && ef && (ec.GENIE_TRASH_DIR = ef),
          ensureSafeDeleteReportPath(ec),
          ec.BASH_ENV || (ec.BASH_ENV = eh),
          injectBulkGuardEnv(ec, eu, el));
        let em = ec.NODE_OPTIONS ?? process.env.NODE_OPTIONS ?? "",
          eE = "win32" === process.platform ? ep.replace(/\\/g, "/") : ep,
          ey = `--require="${eE}"`;
        (em.match(/--require=(?:"([^"]*)"|'([^']*)'|(\S+))/g) || [])
          .map((eA) => {
            let el = eA.match(/^--require=(?:"([^"]*)"|'([^']*)'|(\S+))$/),
              ec = el ? el[1] || el[2] || el[3] : "",
              eu = "win32" === process.platform ? ec.replace(/\\/g, "/") : ec;
            return `--require="${eu}"`;
          })
          .includes(ey)
          ? (ec.NODE_OPTIONS = em)
          : (ec.NODE_OPTIONS = `${ey}${em ? " " + em : ""}`);
        let ew = ec.PYTHONPATH ?? process.env.PYTHONPATH ?? "";
        ec.PYTHONPATH =
          ew && ew.split(eC().delimiter).includes(ed)
            ? ew
            : ew
              ? `${ed}${eC().delimiter}${ew}`
              : ed;
        let eB = ec.PATH ?? process.env.PATH ?? "";
        return (
          (ec.PATH = eB.split(eC().delimiter).includes(eg)
            ? eB
            : eB
              ? `${eg}${eC().delimiter}${eB}`
              : eg),
          ec
        );
      }
      function buildPowerShellSafeDeleteEnv(eA, el, ec) {
        let eu = eA.sessionSubject.value,
          ed = eu?.id,
          ep = {
            CODEBUDDY_PROJECT_DIR: ey.PathUtils.getWorkDir(),
            CLAUDE_PROJECT_DIR: ey.PathUtils.getWorkDir(),
          };
        return (
          ed && ((ep.CODEBUDDY_SESSION_ID = ed), (ep.CLAUDE_SESSION_ID = ed)),
          buildSafeDeleteEnv(ep, {
            enabled: el.enabled,
            sessionId: ed,
            conversationRequestId: eu?.conversationRequestId,
            toolCallId: ec?.toolCallId,
            bulkThreshold: ec?.bulkThreshold ?? el.bulkThreshold,
          })
        );
      }
      var eD = ec(8616),
        eT = ec(75753);
      let eR = 1,
        ek = 99999;
      function parseSafeDeleteBulkThreshold(eA) {
        if (Number.isInteger(eA) && eA >= eR && eA <= ek) return eA;
      }
      function resolveSafeDeleteEnabled(eA) {
        return eA?.safeDeleteRuntimeEnabled !== !1;
      }
      async function resolveSafeDeleteRuntimeEnabled(eA, el, ec) {
        return (await resolveSafeDeleteRuntimeConfig(eA, el, ec)).enabled;
      }
      async function resolveSafeDeleteRuntimeConfig(eA, el, ec) {
        if (!(0, eT.isWorkBuddyDesktop)())
          return { enabled: !1, bulkThreshold: ew };
        try {
          let el = await eA.list();
          return {
            enabled: resolveSafeDeleteEnabled(el.sandbox),
            bulkThreshold:
              parseSafeDeleteBulkThreshold(
                el.sandbox?.safeDeleteBulkThreshold,
              ) ?? ew,
          };
        } catch (eA) {
          return (
            el?.warn?.(
              `[${ec}] failed to read sandbox safe-delete config, defaulting to enabled with bulkThreshold=${ew}: ${eA}`,
            ),
            { enabled: !0, bulkThreshold: ew }
          );
        }
      }
      function hasShimPath(eA) {
        return (
          !!eA && (eA.includes("vendor/shim") || eA.includes("vendor\\shim"))
        );
      }
      function logSafeDeleteInjection(eA, el, ec, eu) {
        let ed = ec.CODEBUDDY_SESSION_ID || ec.CLAUDE_SESSION_ID,
          ep = ec.NODE_OPTIONS || "",
          eg = ec.PYTHONPATH || "";
        eA?.info?.(
          `[SafeDeleteInject] source=${el} enabled=${eu} session=${ed ? "present" : "missing"} nodeRequire=${ep.includes("genie-safe-delete.cjs")} pythonShimPath=${hasShimPath(eg)} safeBin=${!!ec.CODEBUDDY_SAFE_DELETE_BIN_DIR} bashEnv=${!!ec.BASH_ENV} genieTrashDir=${!!ec.GENIE_TRASH_DIR} bulkGuard=${!!ec.CODEBUDDY_SAFE_DELETE_BULK_GUARD}`,
        );
      }
      var eM = ec(61462);
      let ex = new Set([
          "python",
          "python.exe",
          "python3",
          "python3.exe",
          "py",
          "py.exe",
        ]),
        eO = new Set([
          "rm",
          "remove-item",
          "ri",
          "del",
          "erase",
          "unlink",
          "rmdir",
          ...new Set(["node", "node.exe"]),
          ...ex,
        ]),
        eN = [...eO].map((eA) => ({ prefix: [eA] })),
        eP = /\bSAFE_DELETE_FAIL_CLOSED\b/i,
        eL = /\bSAFE_DELETE_BULK_CONFIRM_REQUIRED\b/i,
        eF = /^[A-Za-z]:\/\$RECYCLE\.BIN\/[^/]+\/(\$[IR][^/]*)$/i,
        eU = new Set([
          "rm",
          "remove-item",
          "ri",
          "del",
          "erase",
          "unlink",
          "rmdir",
        ]),
        ej = new Set(["sudo", "command", "env", "builtin", "nohup", "time"]),
        eG = 24,
        eH = 24,
        eK = 28,
        e$ = "\\\\?\\",
        eY = "\\\\?\\UNC\\",
        eJ = "\\??\\",
        ez = new Set(["genie-trash", "win32-x64", "win32-arm64"]),
        eW = /\[safe-delete\]\[SAFE_DELETE_FAIL_CLOSED\]/i;
      function normalizeWindowsRecycleBinPathFromMetadata(eA) {
        let el = eA.split("\0").join("").trim();
        if (!el) return;
        let ec = el.toLowerCase();
        if (
          (ec.startsWith(eY.toLowerCase())
            ? (el = `\\\\${el.slice(eY.length)}`)
            : ec.startsWith(e$.toLowerCase())
              ? (el = el.slice(e$.length))
              : ec.startsWith(eJ.toLowerCase()) && (el = el.slice(eJ.length)),
          (el = el.replace(/\//g, "\\")),
          /^[A-Za-z]:\\/.test(el) || el.startsWith("\\\\"))
        )
          return el;
      }
      function extractWindowsRecycleBinPathWithLengthField(eA) {
        if (eA.length < eK) return;
        let el = eA.readUInt32LE(eH);
        if (!Number.isFinite(el) || el <= 0) return;
        let ec = 2 * el;
        if (!(ec <= 0) && !(eK + ec > eA.length))
          return normalizeWindowsRecycleBinPathFromMetadata(
            eA.subarray(eK, eK + ec).toString("utf16le"),
          );
      }
      function extractWindowsRecycleBinPathLegacy(eA) {
        if (!(eA.length <= eG))
          return normalizeWindowsRecycleBinPathFromMetadata(
            eA.subarray(eG).toString("utf16le").split("\0", 1)[0] ?? "",
          );
      }
      function extractWindowsRecycleBinOriginalPathFromInfoBuffer(eA) {
        let el = extractWindowsRecycleBinPathWithLengthField(eA);
        return el || extractWindowsRecycleBinPathLegacy(eA);
      }
      function resolveWindowsRecycleBinInfoPath(eA) {
        let el = eA.replace(/\//g, "\\"),
          ec = eC().win32.basename(el);
        if (!/^\$[IR][^\\/]*$/i.test(ec)) return;
        let eu = ec.replace(/^\$R/i, "$I");
        return eC().win32.join(eC().win32.dirname(el), eu);
      }
      function resolveWindowsRecycleBinOriginalPathFromMetadata(eA) {
        let el = resolveWindowsRecycleBinInfoPath(eA);
        if (el)
          try {
            let eA = (0, eg.readFileSync)(el);
            return extractWindowsRecycleBinOriginalPathFromInfoBuffer(eA);
          } catch {
            return;
          }
      }
      function normalizeWindowsShellPathForAudit(eA) {
        if ("win32" !== em().platform()) return eA;
        let el = eA.replace(/\\/g, "/"),
          ec = "/tmp/";
        if ("/tmp" === el) return em().tmpdir();
        if (el.toLowerCase().startsWith(ec))
          return eC().win32.join(em().tmpdir(), el.slice(ec.length));
        let eu = el.match(/^\/([A-Za-z])(?:\/(.*))?$/);
        if (eu) {
          let eA = eu[2] ? eu[2].replace(/\//g, "\\") : "";
          return eA
            ? `${eu[1].toUpperCase()}:\\${eA}`
            : `${eu[1].toUpperCase()}:\\`;
        }
        return eA;
      }
      function isGenieTrashAuditPath(eA) {
        if (eA.replace(/\\/g, "/").toLowerCase().includes("/genie-trash/"))
          return !0;
        let el = eC()
          .win32.basename(eA)
          .toLowerCase()
          .replace(/\.exe$/i, "");
        return ez.has(el);
      }
      function isPlausibleUserDeleteTarget(eA) {
        return !(
          eA.includes("\0") ||
          eA.includes("\r") ||
          eA.includes("\n") ||
          isGenieTrashAuditPath(eA) ||
          eF.test(eA.replace(/\\/g, "/"))
        );
      }
      function normalizeSafeDeleteOutputCandidatePath(eA) {
        let el = eA.replace(/[),.;'"]+$/g, "").trim();
        if (!el) return;
        let ec = normalizeWindowsRecycleBinPathFromMetadata(
          normalizeWindowsShellPathForAudit(el),
        );
        if (ec && isPlausibleUserDeleteTarget(ec)) return ec;
      }
      function extractSafeDeleteJsonTargetFromLine(eA) {
        if (!eW.test(eA)) return;
        let el = eA.indexOf("{"),
          ec = eA.lastIndexOf("}");
        if (!(el < 0) && !(ec <= el))
          try {
            let eu = JSON.parse(eA.slice(el, ec + 1));
            return "string" == typeof eu.target
              ? normalizeSafeDeleteOutputCandidatePath(eu.target)
              : void 0;
          } catch {
            return;
          }
      }
      function resolveWindowsRecycleBinOriginalPathFromSafeDeleteFailureOutput(
        eA,
      ) {
        let el = eA.split(/\r?\n/);
        for (let eA = el.length - 1; eA >= 0; eA--) {
          let ec = el[eA];
          if (!/\[safe-delete\]/i.test(ec)) continue;
          let eu = extractSafeDeleteJsonTargetFromLine(ec);
          if (eu) return eu;
        }
      }
      function resolveWindowsRecycleBinOriginalPathFromOutput(eA) {
        if (eA)
          return resolveWindowsRecycleBinOriginalPathFromSafeDeleteFailureOutput(
            eA,
          );
      }
      function normalizeWindowsDeleteCommandName(eA) {
        let el = eA.replace(/\\/g, "/");
        return (el.split("/").pop() ?? el).toLowerCase().replace(/\.exe$/i, "");
      }
      function isWindowsGenieTrashCommandToken(eA, el) {
        return (
          !!ez.has(el) ||
          eA.replace(/\\/g, "/").toLowerCase().includes("/genie-trash/")
        );
      }
      function extractDeleteTargetPathFromSegment(eA) {
        if (0 === eA.length) return;
        let el = 0;
        for (; el < eA.length && ej.has(eA[el].toLowerCase()); ) el++;
        if (el >= eA.length) return;
        let ec = eA[el],
          eu = normalizeWindowsDeleteCommandName(ec),
          ed = isWindowsGenieTrashCommandToken(ec, eu);
        if (!ed && !eU.has(eu)) return;
        let ep = !1;
        for (let ec = el + 1; ec < eA.length; ec++) {
          let el = eA[ec];
          if (!ep && "--" === el) {
            ep = !0;
            continue;
          }
          if (
            !(!ep && el.startsWith("-")) &&
            !(
              !ed &&
              !ep &&
              ("del" === eu || "erase" === eu) &&
              /^\/[A-Za-z?]/.test(el)
            ) &&
            el.length > 0
          )
            return el;
        }
      }
      function splitDelimitedCommandFragments(eA) {
        return eA
          .split(/&&|\|\||[;|\r\n]/g)
          .map((eA) => eA.trim())
          .filter((eA) => eA.length > 0 && !eA.startsWith("#"))
          .map((eA) => eA.split(/\s+/).filter(Boolean));
      }
      function extractEscalationTargetFromCommandRegex(eA) {
        for (let el of splitDelimitedCommandFragments(eA)) {
          let eA = extractDeleteTargetPathFromSegment(el);
          if (eA) return eA;
        }
        for (let el of [
          /(?:^|[;&|]|\r?\n)\s*(?:rm|ri|del|erase|unlink|rmdir)(?:\.exe)?\s+(?:"([^"]+)"|'([^']+)'|(\S+))/gi,
          /(?:^|[;&|]|\r?\n)\s*remove-item(?:\.exe)?\s+(?:-[A-Za-z]+\s+)*(?:"([^"]+)"|'([^']+)'|(\S+))/gi,
        ]) {
          let ec;
          for (; null !== (ec = el.exec(eA)); ) {
            let eA = ec[1] ?? ec[2] ?? ec[3];
            if (eA && !eA.startsWith("-")) return eA;
          }
        }
      }
      function commandContainsEscalationRoot(eA) {
        return splitDelimitedCommandFragments(eA.replace(/\\/g, "/")).some(
          (eA) => {
            let el = eA
              .find((eA) => !/^[A-Za-z_]\w*=/.test(eA))
              ?.split("/")
              .pop()
              ?.toLowerCase()
              .replace(/\.exe$/i, "");
            return !!el && eO.has(el);
          },
        );
      }
      function resolveWindowsRecycleBinOriginalPathFromCommand(eA) {
        let el = eA?.trim();
        if (!el) return;
        let ec = [el],
          eu = (0, eM.unwrapShellWrapper)(el);
        for (let eA of (eu && eu !== el && ec.unshift(eu), ec)) {
          let el = (0, eM.splitCommandSegments)(eA);
          if (el)
            for (let eA of el) {
              let el = extractDeleteTargetPathFromSegment(eA);
              if (el) return el;
            }
          let ec = extractEscalationTargetFromCommandRegex(eA);
          if (ec) return ec;
        }
      }
      function resolveWindowsRecycleBinAuditPath(eA, el, ec) {
        if (!eA.path.replace(/\\/g, "/").match(eF)) return;
        let eu =
          resolveWindowsRecycleBinOriginalPathFromOutput(ec) ??
          resolveWindowsRecycleBinOriginalPathFromCommand(el) ??
          resolveWindowsRecycleBinOriginalPathFromCommand(eA.command) ??
          resolveWindowsRecycleBinOriginalPathFromMetadata(eA.path);
        if (eu) return normalizeWindowsShellPathForAudit(eu);
      }
      function buildSandboxOutputForAuditPath(eA) {
        let el = eA.stdout ?? "",
          ec = eA.stderr ?? "";
        if (el || ec)
          return `${el}
${ec}`;
      }
      function normalizeWindowsPathForComparison(eA) {
        return normalizeWindowsRecycleBinPathFromMetadata(
          normalizeWindowsShellPathForAudit(eA),
        )?.toLowerCase();
      }
      function getTmpDirs() {
        let eA = [],
          el = em().tmpdir();
        return (
          el && eA.push(el),
          "win32" !== em().platform() && "/tmp" !== el && eA.push("/tmp"),
          eA
        );
      }
      function isSafeDeleteTempProbeNoise(eA, el) {
        let ec = normalizeWindowsPathForComparison(eA);
        return (
          !!ec &&
          ec !== el &&
          (!!eF.test(eA.replace(/\\/g, "/")) ||
            ["C:\\windows\\Temp", "C:\\temp", "C:\\tmp", ...getTmpDirs()].some(
              (eA) => {
                let el = normalizeWindowsPathForComparison(eA);
                if (!el) return !1;
                let eu = el.endsWith("\\") ? el : `${el}\\`;
                return ec.startsWith(eu);
              },
            ))
        );
      }
      function filterSafeDeleteTempProbeNoise(eA, el, ec) {
        if (0 === eA.length || !matchesSafeDeleteEscalationCommand(el))
          return eA;
        let eu = buildSandboxOutputForAuditPath(ec);
        if (!eu || !eP.test(eu)) return eA;
        let ed =
            resolveWindowsRecycleBinOriginalPathFromCommand(el) ??
            resolveWindowsRecycleBinOriginalPathFromOutput(eu),
          ep = ed ? normalizeWindowsPathForComparison(ed) : void 0;
        if (!ep) {
          let el = eA.filter((eA) => !eF.test(eA.path.replace(/\\/g, "/")));
          return el.length === eA.length ? eA : el;
        }
        let eg = eA.filter((eA) => !isSafeDeleteTempProbeNoise(eA.path, ep));
        return eg.length === eA.length ? eA : eg;
      }
      function matchesCommandRoot(eA, el, ec) {
        let eu = [eA],
          ed = eA.replace(/\\/g, "/");
        if (
          (ed !== eA && eu.push(ed),
          eu.some((eA) => (0, eM.matchAnyCommandPrefix)(eA, ec).matched))
        )
          return !0;
        let ep = (0, eM.splitCommandSegments)(eA);
        if (ep)
          for (let eA of ep) {
            if (0 === eA.length) continue;
            let ec = eA
              .find((eA) => !/^[A-Za-z_]\w*=/.test(eA))
              ?.split(/[/\\]/)
              .pop()
              ?.toLowerCase();
            if (ec && el.has(ec)) return !0;
          }
        return commandContainsEscalationRoot(eA);
      }
      function matchesSafeDeleteEscalationCommand(eA) {
        return matchesCommandRoot(eA, eO, eN);
      }
      function shouldEscalateSafeDeleteFailClosed(eA, el, ec) {
        if (ec > 0 || !matchesSafeDeleteEscalationCommand(eA)) return !1;
        let eu = `${el.stdout ?? ""}
${el.stderr ?? ""}`;
        return eP.test(eu);
      }
      function parseSafeDeleteBulkConfirmInfo(eA) {
        return parseSafeDeleteBulkConfirmMarker(eA);
      }
      function shouldEscalateSafeDeleteBulkConfirm(eA, el, ec) {
        if (ec > 0 || !matchesSafeDeleteEscalationCommand(eA)) return;
        let eu = `${el.stdout ?? ""}
${el.stderr ?? ""}`;
        if (eL.test(eu)) return parseSafeDeleteBulkConfirmInfo(eu);
      }
      function buildSafeDeletePosixBootstrap(eA) {
        let el =
          'if [ -n "${CODEBUDDY_SAFE_DELETE_BIN_DIR:-}" ]; then unalias rm unlink rmdir 2>/dev/null || true; unset -f rm unlink rmdir 2>/dev/null || true; export PATH="${CODEBUDDY_SAFE_DELETE_BIN_DIR}:$PATH"; rm() { "${CODEBUDDY_SAFE_DELETE_BIN_DIR}/rm" "$@"; }; unlink() { "${CODEBUDDY_SAFE_DELETE_BIN_DIR}/unlink" "$@"; }; rmdir() { "${CODEBUDDY_SAFE_DELETE_BIN_DIR}/rmdir" "$@"; };';
        return "bash" === eA
          ? `${el} export -f rm unlink rmdir >/dev/null 2>&1 || true; fi`
          : "zsh" === eA || "sh" === eA
            ? `${el} fi`
            : "";
      }
      function isSafeDeleteRuntimeEnabled(eA) {
        return eA?.safeDeleteRuntimeEnabled !== !1;
      }
    },
    8616(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          isSafeDeleteHelperPath: () => isSafeDeleteHelperPath,
          isSafeDeleteHelperProcessExecRecord: () =>
            isSafeDeleteHelperProcessExecRecord,
        }));
      let eu = "process-exec",
        ed = [
          /(?:^|[\\/])osascript(?:\.exe)?$/i,
          /(?:^|[\\/])genie-trash(?:[\\/]|$)/i,
        ],
        ep = /\bSAFE_DELETE\b/i;
      function pathMatchesSafeDeletePatterns(eA) {
        return !!eA && ed.some((el) => el.test(eA));
      }
      function collectRecordCommandCandidates(eA) {
        let el = [];
        return (
          "string" == typeof eA.command &&
            eA.command.trim().length > 0 &&
            el.push(eA.command),
          el
        );
      }
      function hasSafeDeleteSignature(eA) {
        let el = collectRecordCommandCandidates(eA);
        return (
          0 !== el.length &&
          el.some((eA) => {
            let el = eA
              .replace(/\\"/g, '"')
              .replace(/\\'/g, "'")
              .replace(/\s+/g, " ");
            return ep.test(el);
          })
        );
      }
      function getRecordOperation(eA) {
        if (eA.raw && "object" == typeof eA.raw && !Array.isArray(eA.raw)) {
          let el = eA.raw.operation;
          if ("string" == typeof el) return el;
        }
      }
      function isSafeDeleteHelperPath(eA) {
        return pathMatchesSafeDeletePatterns(eA);
      }
      function isSafeDeleteHelperProcessExecRecord(eA) {
        let el = getRecordOperation(eA);
        return (
          !!el &&
          !!el.toLowerCase().startsWith(eu) &&
          (isSafeDeleteHelperPath(eA.path) || hasSafeDeleteSignature(eA))
        );
      }
    },
    75753(eA, el, ec) {
      "use strict";
      let eu;
      function getHostName() {
        return (void 0 === eu && (eu = detectHost()), eu);
      }
      function isWorkBuddyDesktop() {
        return "workbuddy-desktop" === getHostName();
      }
      function __resetHostDetectionCache() {
        eu = void 0;
      }
      function detectHost() {
        if ("workbuddy-desktop" === process.env.CODEBUDDY_HOST)
          return "workbuddy-desktop";
        let eA = process.argv;
        return eA.includes("--acp")
          ? "vscode-acp"
          : eA.includes("--serve")
            ? "web-ui"
            : "cli";
      }
      (ec.r(el),
        ec.d(el, {
          __resetHostDetectionCache: () => __resetHostDetectionCache,
          getHostName: () => getHostName,
          isWorkBuddyDesktop: () => isWorkBuddyDesktop,
        }));
    },
    61462(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          commandLooksLikePowerShellLine: () => commandLooksLikePowerShellLine,
          matchAnyCommandPrefix: () => matchAnyCommandPrefix,
          prefixMatchesArgv: () => prefixMatchesArgv,
          splitCommandSegments: () => splitCommandSegments,
          unwrapShellWrapper: () => unwrapShellWrapper,
        }));
      var eu = ec(93289);
      let ed = new Set(["&&", "||", ";", "|"]);
      function commandLooksLikePowerShellLine(eA) {
        let el = eA.search(/\s/),
          ec = -1 === el ? eA : eA.slice(0, el);
        return /^[A-Za-z]+-[A-Za-z]+$/.test(ec);
      }
      function splitCommandSegments(eA) {
        let el,
          ec = (eA ?? "").trim();
        if (0 === ec.length) return [];
        if (commandLooksLikePowerShellLine(ec))
          return [ec.split(/\s+/).filter(Boolean)];
        try {
          el = (0, eu.parse)(ec);
        } catch {
          return;
        }
        let ep = [],
          eg = [];
        for (let eA of el) {
          if ("string" == typeof eA) {
            eg.push(eA);
            continue;
          }
          if (
            eA &&
            "object" == typeof eA &&
            "op" in eA &&
            "string" == typeof eA.op &&
            ed.has(eA.op)
          ) {
            (eg.length > 0 && ep.push(eg), (eg = []));
            continue;
          }
          return;
        }
        return (eg.length > 0 && ep.push(eg), ep);
      }
      function prefixMatchesArgv(eA, el) {
        if (
          !Array.isArray(eA.prefix) ||
          0 === eA.prefix.length ||
          eA.prefix.length > el.length
        )
          return !1;
        let ec = el.map((eA, el) => normaliseToken(eA, 0 === el));
        for (let eu = 0; eu < eA.prefix.length; eu++) {
          let ed = eA.prefix[eu],
            ep = el[eu];
          if (
            normaliseToken(ed, 0 === eu) !== ec[eu] &&
            !(0 === eu && commandNameMatches(ed, ep))
          )
            return !1;
        }
        return !0;
      }
      function matchAnyCommandPrefix(eA, el) {
        if (!eA?.trim() || !Array.isArray(el) || 0 === el.length)
          return { matched: !1 };
        let ec = matchOnSegments(splitCommandSegments(eA), el);
        if (ec.matched) return ec;
        let eu = unwrapShellWrapper(eA);
        return eu !== eA.trim()
          ? matchOnSegments(splitCommandSegments(eu), el)
          : { matched: !1 };
      }
      function matchOnSegments(eA, el) {
        if (!eA) return { matched: !1 };
        for (let ec of eA)
          for (let eA of el)
            if (prefixMatchesArgv(eA, ec))
              return { matched: !0, rule: eA, segment: ec };
        return { matched: !1 };
      }
      function unwrapShellWrapper(eA) {
        let el = (eA ?? "").trim(),
          ec = el.match(
            /^(?:\/[^\s]*\/)?(bash|zsh|sh)\s+(?:-[a-z]*\s+)*-l?c\s+(.+)$/i,
          );
        if (ec) {
          let eA = ec[2].trim();
          return (eA.startsWith("'") && eA.endsWith("'")) ||
            (eA.startsWith('"') && eA.endsWith('"'))
            ? eA.slice(1, -1)
            : eA;
        }
        let eu = el.match(
          /^(?:.*[/\\])?(pwsh|powershell)(?:\.exe)?\s+(?:-\w+\s+)*-Command\s+(.+)$/i,
        );
        if (eu) {
          let eA = eu[2].trim();
          return (eA.startsWith("'") && eA.endsWith("'")) ||
            (eA.startsWith('"') && eA.endsWith('"'))
            ? eA.slice(1, -1)
            : eA;
        }
        return el;
      }
      function normaliseToken(eA, el) {
        return "string" != typeof eA || 0 === eA.length
          ? eA
          : (el && /^[A-Za-z]+-[A-Za-z]/.test(eA)) ||
              (el && looksLikeWindowsExecutableToken(eA))
            ? eA.toLowerCase()
            : /^[A-Za-z]:[\\/]/.test(eA)
              ? eA[0].toLowerCase() + eA.slice(1)
              : eA;
      }
      function commandNameMatches(eA, el) {
        let ec = normaliseToken(eA, !0);
        if (ec === normaliseToken(el, !0)) return !0;
        if (looksLikePathToken(el) && !looksLikePathToken(eA)) {
          let eA = extractBasename(el);
          return !!eA && ec === normaliseToken(eA, !0);
        }
        return !1;
      }
      function looksLikeWindowsExecutableToken(eA) {
        return (
          /^[A-Za-z]:[\\/]/.test(eA) ||
          eA.includes("\\") ||
          /\.(?:exe|cmd|bat)$/i.test(eA)
        );
      }
      function looksLikePathToken(eA) {
        return eA.includes("/") || eA.includes("\\");
      }
      function extractBasename(eA) {
        let el = eA.split(/[\\/]+/).filter(Boolean);
        return el.length > 0 ? el[el.length - 1] : "";
      }
    },
    93289(eA, el, ec) {
      "use strict";
      ((el.quote = ec(69897)), (el.parse = ec(50158)));
    },
    69897(eA) {
      "use strict";
      eA.exports = function (eA) {
        return eA
          .map(function (eA) {
            return "" === eA
              ? "''"
              : eA && "object" == typeof eA
                ? eA.op.replace(/(.)/g, "\\$1")
                : /["\s\\]/.test(eA) && !/'/.test(eA)
                  ? "'" + eA.replace(/(['])/g, "\\$1") + "'"
                  : /["'\s]/.test(eA)
                    ? '"' + eA.replace(/(["\\$`!])/g, "\\$1") + '"'
                    : String(eA).replace(
                        /([A-Za-z]:)?([#!"$&'()*,:;<=>?@[\\\]^`{|}])/g,
                        "$1\\$2",
                      );
          })
          .join(" ");
      };
    },
    50158(eA) {
      "use strict";
      for (
        var el =
            "(?:\\|\\||\\&\\&|;;|\\|\\&|\\<\\(|\\<\\<\\<|>>|>\\&|<\\&|[&;()|<>])",
          ec = RegExp("^" + el + "$"),
          eu = "|&;()<> \\t",
          ed = '"((\\\\"|[^"])*?)"',
          ep = "'((\\\\'|[^'])*?)'",
          eg = /^#$/,
          eh = "'",
          ef = '"',
          em = "$",
          eE = "",
          eC = 0x100000000,
          ey = 0;
        ey < 4;
        ey++
      )
        eE += (eC * Math.random()).toString(16);
      var ew = RegExp("^" + eE);
      function matchAll(eA, el) {
        for (var ec, eu = el.lastIndex, ed = []; (ec = el.exec(eA)); )
          (ed.push(ec), el.lastIndex === ec.index && (el.lastIndex += 1));
        return ((el.lastIndex = eu), ed);
      }
      function getVar(eA, el, ec) {
        var eu = "function" == typeof eA ? eA(ec) : eA[ec];
        return (void 0 === eu && "" != ec
          ? (eu = "")
          : void 0 === eu && (eu = "$"),
        "object" == typeof eu)
          ? el + eE + JSON.stringify(eu) + eE
          : el + eu;
      }
      function parseInternal(eA, eE, eC) {
        eC || (eC = {});
        var ey = eC.escape || "\\",
          ew = matchAll(
            eA,
            RegExp(
              [
                "(" + el + ")",
                "(" +
                  ("(\\" + ey + "['\"" + eu + "]|[^\\s'\"" + eu) +
                  "])+|" +
                  ed +
                  "|" +
                  ep +
                  ")+",
              ].join("|"),
              "g",
            ),
          );
        if (0 === ew.length) return [];
        eE || (eE = {});
        var eB = !1;
        return ew
          .map(function (el) {
            var eu,
              ed = el[0];
            if (ed && !eB) {
              if (ec.test(ed)) return { op: ed };
              var ep = !1,
                eC = !1,
                ew = "",
                e_ = !1;
              for (eu = 0; eu < ed.length; eu++) {
                var eI = ed.charAt(eu);
                if (((e_ = e_ || (!ep && ("*" === eI || "?" === eI))), eC))
                  ((ew += eI), (eC = !1));
                else if (ep)
                  eI === ep
                    ? (ep = !1)
                    : ep == eh
                      ? (ew += eI)
                      : eI === ey
                        ? ((eu += 1),
                          (eI = ed.charAt(eu)) === ef || eI === ey || eI === em
                            ? (ew += eI)
                            : (ew += ey + eI))
                        : eI === em
                          ? (ew += parseEnvVar())
                          : (ew += eI);
                else if (eI === ef || eI === eh) ep = eI;
                else if (ec.test(eI)) return { op: ed };
                else if (eg.test(eI)) {
                  eB = !0;
                  var ev = { comment: eA.slice(el.index + eu + 1) };
                  if (ew.length) return [ew, ev];
                  return [ev];
                } else
                  eI === ey
                    ? (eC = !0)
                    : eI === em
                      ? (ew += parseEnvVar())
                      : (ew += eI);
              }
              return e_ ? { op: "glob", pattern: ew } : ew;
            }
            function parseEnvVar() {
              eu += 1;
              var eA,
                el,
                ec = ed.charAt(eu);
              if ("{" === ec) {
                if (((eu += 1), "}" === ed.charAt(eu)))
                  throw Error("Bad substitution: " + ed.slice(eu - 2, eu + 1));
                if ((eA = ed.indexOf("}", eu)) < 0)
                  throw Error("Bad substitution: " + ed.slice(eu));
                ((el = ed.slice(eu, eA)), (eu = eA));
              } else if (/[*@#?$!_-]/.test(ec)) ((el = ec), (eu += 1));
              else {
                var ep = ed.slice(eu);
                (eA = ep.match(/[^\w\d_]/))
                  ? ((el = ep.slice(0, eA.index)), (eu += eA.index - 1))
                  : ((el = ep), (eu = ed.length));
              }
              return getVar(eE, "", el);
            }
          })
          .reduce(function (eA, el) {
            return void 0 === el ? eA : eA.concat(el);
          }, []);
      }
      eA.exports = function (eA, el, ec) {
        var eu = parseInternal(eA, el, ec);
        return "function" != typeof el
          ? eu
          : eu.reduce(function (eA, el) {
              if ("object" == typeof el) return eA.concat(el);
              var ec = el.split(RegExp("(" + eE + ".*?" + eE + ")", "g"));
              return 1 === ec.length
                ? eA.concat(ec[0])
                : eA.concat(
                    ec.filter(Boolean).map(function (eA) {
                      return ew.test(eA) ? JSON.parse(eA.split(eE)[1]) : eA;
                    }),
                  );
            }, []);
      };
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const mod = { exports: {} };
      cache.set(id, mod);
      factories[id](mod, mod.exports, getModule);
      return mod.exports;
    }
    const value = runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit safe-delete module required: " + id);
    return value;
  }
  getModule.r = (o: any) => {
    Object.defineProperty(o, "__esModule", { value: true });
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  getModule.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      if (!Object.hasOwn(o, k))
        Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  getModule.n = (v: any) => (v && v.__esModule ? () => v.default : () => v);
  return { safeDelete: getModule(35568), getModule };
}
