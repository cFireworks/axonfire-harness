// @ts-nocheck
// Complete captured module factories, including original DI registration statements.
export const LOCAL_SHELL_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const LOCAL_SHELL_MODULES = [
  [43522, 11221415, 11279768],
  [35179, 11304325, 11305622],
  [38590, 11321664, 11323009],
] as const;
export const LEGACY_SHELL_RANGE = [7338044, 7338572] as const;
/** The caller supplies original parent namespaces, DI decorators and runtime boundaries. */
export function createNativeLocalShell(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit local shell process boundary required");
  const process = runtime.process,
    Buffer = runtime.Buffer ?? globalThis.Buffer,
    Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math,
    Reflect = runtime.Reflect ?? globalThis.Reflect;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const factories = {
    43522(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          ShellSnapshotServiceImpl: () => ez,
          OutputSpiller: () => OutputSpiller,
          resolveBashTimeoutFromEnv: () => eB.resolveBashTimeoutFromEnv,
          MAX_SHELL_OUTPUT_LENGTH: () => eB.MAX_SHELL_OUTPUT_LENGTH,
          SNAPSHOT_DIR_NAME: () => eL.SNAPSHOT_DIR_NAME,
          generateSnapshotFileName: () => eL.generateSnapshotFileName,
          DEFAULT_BASH_TIMEOUT_MS: () => eB.DEFAULT_BASH_TIMEOUT_MS,
          RESOLVED_BASH_MAX_TIMEOUT_MS: () => eB.RESOLVED_BASH_MAX_TIMEOUT_MS,
          SNAPSHOT_MAX_BUFFER: () => eL.SNAPSHOT_MAX_BUFFER,
          wrapPowerShellCommandWithSafeDelete: () =>
            wrapPowerShellCommandWithSafeDelete,
          WindowsProcessUtils: () => eG.WindowsProcessUtils,
          LocalShellService: () => eB.LocalShellService,
          RESOLVED_BASH_DEFAULT_TIMEOUT_MS: () =>
            eB.RESOLVED_BASH_DEFAULT_TIMEOUT_MS,
          MAX_BASH_OUTPUT_LENGTH_CAP: () => eB.MAX_BASH_OUTPUT_LENGTH_CAP,
          DEFAULT_BASH_ASSISTANT_BUDGET_MS: () =>
            eB.DEFAULT_BASH_ASSISTANT_BUDGET_MS,
          serializeTerminalToObject: () => eU.serializeTerminalToObject,
          DEFAULT_BASH_MAX_TIMEOUT_MS: () => eB.DEFAULT_BASH_MAX_TIMEOUT_MS,
          ShellSnapshotService: () => eL.ShellSnapshotService,
          DelegatingShellService: () => e_,
          ShellService: () => eB.ShellService,
          TruncateBuffer: () => ej.TruncateBuffer,
          ShellServiceImpl: () => eJ,
          ColorMode: () => eU.ColorMode,
          getShellConfigFile: () => eL.getShellConfigFile,
          RESOLVED_BASH_ASSISTANT_BUDGET_MS: () =>
            eB.RESOLVED_BASH_ASSISTANT_BUDGET_MS,
          getSnapshotDirectory: () => eL.getSnapshotDirectory,
          SNAPSHOT_CREATION_TIMEOUT_MS: () => eL.SNAPSHOT_CREATION_TIMEOUT_MS,
          resolveWindowsHideOption: () => resolveWindowsHideOption,
          DEFAULT_BASH_MAX_OUTPUT_LENGTH: () =>
            eB.DEFAULT_BASH_MAX_OUTPUT_LENGTH,
        }));
      var eu,
        ed,
        ep,
        eg,
        eh,
        ef,
        em = ec(80699),
        eE = ec(70857),
        eC = ec(20852),
        ey = ec(57126),
        ew = ec(74674),
        eB = ec(19702),
        __decorate = function (eA, el, ec, eu) {
          var ed,
            ep = arguments.length,
            eg =
              ep < 3
                ? el
                : null === eu
                  ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                  : eu;
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.decorate
          )
            eg = Reflect.decorate(eA, el, ec, eu);
          else
            for (var eh = eA.length - 1; eh >= 0; eh--)
              (ed = eA[eh]) &&
                (eg =
                  (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                  eg);
          return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
        },
        __metadata = function (eA, el) {
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.metadata
          )
            return Reflect.metadata(eA, el);
        };
      let e_ = class {
        async execute(eA) {
          let el = await this.resolveBackend(),
            { delegate: ec, target: eu } = this.pickDelegate(el);
          this.logger.info?.(
            `[DelegatingShellService] execute → ${eu} | cmd="${eA.command}" cwd="${eA.cwd ?? ""}" timeout=${eA.timeout ?? "none"} usePty=${eA.usePty ?? !0}`,
          );
          let ed = Date.now();
          try {
            let el = await ec.execute(eA);
            return (
              this.logger.info?.(
                `[DelegatingShellService] execute OK → ${eu} | handleId=${el.id} pid=${el.pid} elapsed=${Date.now() - ed}ms`,
              ),
              el
            );
          } catch (eA) {
            throw (
              this.logger.error?.(
                `[DelegatingShellService] execute FAILED → ${eu} | elapsed=${Date.now() - ed}ms`,
                eA,
              ),
              eA
            );
          }
        }
        async disposeAll() {
          await Promise.allSettled([
            this.localShellService.disposeAll(),
            this.sandboxShellService.disposeAll(),
            this.legacySandboxShellService.disposeAll(),
          ]);
        }
        getActiveHandleCount() {
          return (
            this.localShellService.getActiveHandleCount() +
            this.sandboxShellService.getActiveHandleCount() +
            this.legacySandboxShellService.getActiveHandleCount()
          );
        }
        async resolveBackend() {
          let eA = !1;
          try {
            let el = await this.bashSandboxManager.getConfig();
            eA = !!el?.enabled;
          } catch {
            return "off";
          }
          return eA
            ? "linux" === eE.platform()
              ? "legacy"
              : "sandbox-cli"
            : "off";
        }
        pickDelegate(eA) {
          switch (eA) {
            case "sandbox-cli":
              return {
                delegate: this.sandboxShellService,
                target: "SandboxShellService",
              };
            case "legacy":
              return {
                delegate: this.legacySandboxShellService,
                target: "LegacySandboxShellService",
              };
            default:
              return {
                delegate: this.localShellService,
                target: "LocalShellService",
              };
          }
        }
      };
      (__decorate(
        [
          (0, em.Autowired)(eB.LocalShellService),
          __metadata("design:type", Object),
        ],
        e_.prototype,
        "localShellService",
        void 0,
      ),
        __decorate(
          [
            (0, em.Autowired)(ew.SandboxShellService),
            __metadata("design:type", Object),
          ],
          e_.prototype,
          "sandboxShellService",
          void 0,
        ),
        __decorate(
          [
            (0, em.Autowired)(ey.LegacySandboxShellService),
            __metadata("design:type", Object),
          ],
          e_.prototype,
          "legacySandboxShellService",
          void 0,
        ),
        __decorate(
          [
            (0, em.Autowired)(eC.BashSandboxManager),
            __metadata("design:type", Object),
          ],
          e_.prototype,
          "bashSandboxManager",
          void 0,
        ),
        __decorate(
          [
            (0, em.Autowired)(em.Logger),
            __metadata(
              "design:type",
              "function" == typeof (eu = void 0 !== em.Logger && em.Logger)
                ? eu
                : Object,
            ),
          ],
          e_.prototype,
          "logger",
          void 0,
        ),
        (e_ = __decorate([(0, em.Component)(eB.ShellService)], e_)));
      var eI = ec(79896),
        ev = ec.n(eI);
      let OutputSpiller = class OutputSpiller {
        constructor(eA) {
          ((this.filePath = eA),
            (this._totalBytes = 0),
            (this._closed = !1),
            (this._hasError = !1));
          const el = eA.substring(0, eA.lastIndexOf("/"));
          (el && (0, eI.mkdirSync)(el, { recursive: !0 }),
            (this.stream = (0, eI.createWriteStream)(eA, {
              encoding: "utf-8",
            })),
            this.stream.on("error", () => {
              this._hasError = !0;
            }));
        }
        push(eA) {
          this._closed ||
            this._hasError ||
            !this.stream ||
            (this.stream.write(eA),
            (this._totalBytes += Buffer.byteLength(eA, "utf-8")));
        }
        async close() {
          if (this._closed || !this.stream) return;
          this._closed = !0;
          let eA = this.stream;
          return (
            (this.stream = void 0),
            new Promise((el) => {
              let ec = !1,
                done = () => {
                  ec || ((ec = !0), el());
                };
              (eA.once("close", done), eA.once("error", done));
              try {
                eA.end(done);
              } catch {
                done();
              }
            })
          );
        }
        get totalBytes() {
          return this._totalBytes;
        }
        get hasError() {
          return this._hasError;
        }
        get isClosed() {
          return this._closed;
        }
        async cleanup() {
          try {
            await this.close();
          } catch {}
          try {
            (0, eI.unlinkSync)(this.filePath);
          } catch {}
        }
      };
      var eS = ec(79814),
        eQ = ec(62922),
        eD = ec(35317),
        eT = ec(16928),
        eR = ec.n(eT),
        ek = ec(38736),
        eM = ec.n(ek),
        ex = ec(35151);
      let eO = `
if (-not (Get-Variable -Name CODEBUDDY_SAFE_DELETE_PS_READY -Scope Global -ErrorAction SilentlyContinue)) {
    $Global:CODEBUDDY_SAFE_DELETE_PS_READY = $true

    Add-Type -AssemblyName Microsoft.VisualBasic | Out-Null

    function New-SafeDeleteFailClosedMessage {
        param(
            [AllowEmptyString()] [string]$Target,
            [string]$Reason,
            [AllowEmptyString()] [string]$Detail = ''
        )

        $payload = [ordered]@{
            target = $Target
            reason = $Reason
        }
        if ($Detail) {
            $payload['detail'] = $Detail
        }
        return '[safe-delete][SAFE_DELETE_FAIL_CLOSED] ' + ($payload | ConvertTo-Json -Compress)
    }

    function Write-SafeDeleteReport {
        param([string]$Target)

        $reportPath = $env:CODEBUDDY_SAFE_DELETE_REPORT_PATH
        if (-not $reportPath) {
            return
        }

        try {
            $payload = [ordered]@{
                operation = 'trash'
                runtime = 'powershell'
                path = $Target
                timestamp = [int64](([DateTime]::UtcNow - [DateTime]'1970-01-01T00:00:00Z').TotalMilliseconds)
            }
            $line = ($payload | ConvertTo-Json -Compress)
            $utf8 = New-Object System.Text.UTF8Encoding -ArgumentList $false
            [System.IO.File]::AppendAllText($reportPath, $line + [Environment]::NewLine, $utf8)
        } catch {
            # Reporting is best-effort and must never change delete semantics.
        }
    }

    function Get-SafeDeleteComparablePath {
        param([string]$Path)

        $fullPath = [System.IO.Path]::GetFullPath($Path)
        try {
            $info = $null
            if ([System.IO.Directory]::Exists($fullPath)) {
                $info = [System.IO.DirectoryInfo]::new($fullPath)
            } elseif ([System.IO.File]::Exists($fullPath)) {
                $info = [System.IO.FileInfo]::new($fullPath)
            }
            if ($null -ne $info) {
                $linkTarget = $null
                try {
                    $linkTarget = $info.ResolveLinkTarget($true)
                } catch {
                    $linkTarget = $null
                }
                if ($null -ne $linkTarget) {
                    $fullPath = [string]$linkTarget.FullName
                } else {
                    $fullPath = [string]$info.FullName
                }
            }
        } catch {
            # Fall back to GetFullPath when final target resolution is unavailable.
        }

        return $fullPath.TrimEnd(
            [System.IO.Path]::DirectorySeparatorChar,
            [System.IO.Path]::AltDirectorySeparatorChar
        )
    }

    function Test-SafeDeleteTempRootAllowed {
        param([string]$Path)

        try {
            if (-not $Path) {
                return $false
            }
            $fullPath = Get-SafeDeleteComparablePath $Path
            $rootPath = Get-SafeDeleteComparablePath ([System.IO.Path]::GetPathRoot($fullPath))
            if ($fullPath -eq $rootPath) {
                return $false
            }
            return [System.IO.Directory]::Exists($fullPath)
        } catch {
            return $false
        }
    }

    function Test-SafeDeleteUnderOsTemp {
        param([string]$Target)

        try {
            if (-not (Test-SafeDeleteTempRootAllowed ([System.IO.Path]::GetTempPath()))) {
                return $false
            }
            $tmpPath = Get-SafeDeleteComparablePath ([System.IO.Path]::GetTempPath())
            $targetPath = Get-SafeDeleteComparablePath $Target
            if ($targetPath.Length -le $tmpPath.Length) {
                return $false
            }
            if (-not $targetPath.StartsWith($tmpPath, [System.StringComparison]::OrdinalIgnoreCase)) {
                return $false
            }
            $separator = $targetPath.Substring($tmpPath.Length, 1)
            if (($separator -ne [System.IO.Path]::DirectorySeparatorChar) -and ($separator -ne [System.IO.Path]::AltDirectorySeparatorChar)) {
                return $false
            }
            return $true
        } catch {
            return $false
        }
    }

    function Invoke-SafeDeleteBulkGuard {
        param([string[]]$Targets)

        if (-not $env:CODEBUDDY_SAFE_DELETE_BULK_GUARD -or
            -not $env:CODEBUDDY_NODE_BIN -or
            -not $env:CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR -or
            -not $env:CODEBUDDY_TOOL_CALL_ID) {
            return
        }
        if (-not $Targets -or $Targets.Count -eq 0) {
            return
        }

        $guardArgs = New-Object System.Collections.Generic.List[string]
        $guardArgs.Add('check')
        foreach ($target in $Targets) {
            $guardArgs.Add('--target')
            $guardArgs.Add($target)
        }

        $previousNodeOptions = $env:NODE_OPTIONS
        try {
            $env:NODE_OPTIONS = ''
            $output = & $env:CODEBUDDY_NODE_BIN $env:CODEBUDDY_SAFE_DELETE_BULK_GUARD $guardArgs.ToArray() 2>&1
            $exitCode = $LASTEXITCODE
        } finally {
            $env:NODE_OPTIONS = $previousNodeOptions
        }

        if ($exitCode -ne 0) {
            $trimmedOutput = ($output | Out-String).TrimEnd()
            if ($trimmedOutput) {
                # PTY 路径下 stderr 可能丢失，额外写到 stdout 保障 orchestrator 可见 marker。
                [Console]::Out.WriteLine($trimmedOutput)
                [Console]::Error.WriteLine($trimmedOutput)
                # 直接抛出 guard 原始 marker，确保 orchestrator 能从命令输出中命中
                # SAFE_DELETE_BULK_CONFIRM_REQUIRED / SAFE_DELETE_BULK_REJECTED。
                throw $trimmedOutput
            }
            throw '[safe-delete][SAFE_DELETE_BULK_GUARD_ERROR] bulk delete guard blocked deletion'
        }
    }

    function global:Remove-Item {
        [CmdletBinding()]
        param([Parameter(ValueFromRemainingArguments = $true)] [object[]]$RawArgs)

        $force = $false
        $recursive = $false
        $allowDir = $false
        $interactive = $false
        $whatIf = $false
        $confirm = $false
        $afterDoubleDash = $false
        $pendingPathMode = $null
        $pendingSwitchMode = $null
        $targetSpecs = New-Object System.Collections.Generic.List[object]

        foreach ($raw in $RawArgs) {
            $arg = [string]$raw

            if ($null -ne $pendingSwitchMode) {
                if ($arg -match '^(?i)(\\$?true|1)$') {
                    if ($pendingSwitchMode -eq 'force') { $force = $true }
                    elseif ($pendingSwitchMode -eq 'recurse') { $recursive = $true }
                    elseif ($pendingSwitchMode -eq 'whatif') { $whatIf = $true }
                    elseif ($pendingSwitchMode -eq 'confirm') { $confirm = $true }
                    $pendingSwitchMode = $null
                    continue
                }
                if ($arg -match '^(?i)(\\$?false|0)$') {
                    if ($pendingSwitchMode -eq 'force') { $force = $false }
                    elseif ($pendingSwitchMode -eq 'recurse') { $recursive = $false }
                    elseif ($pendingSwitchMode -eq 'whatif') { $whatIf = $false }
                    elseif ($pendingSwitchMode -eq 'confirm') { $confirm = $false }
                    $pendingSwitchMode = $null
                    continue
                }
                throw 'Remove-Item: invalid boolean value for -' + $pendingSwitchMode + ': ' + $arg
            }

            if ($null -ne $pendingPathMode) {
                $targetSpecs.Add([pscustomobject]@{
                    Value = $arg
                    IsLiteral = ($pendingPathMode -eq 'literal')
                })
                $pendingPathMode = $null
                continue
            }

            if (-not $afterDoubleDash) {
                if ($arg -eq '--') { $afterDoubleDash = $true; continue }

                if ($arg -match '^(?i)-Path:(.+)$') {
                    $targetSpecs.Add([pscustomobject]@{ Value = $Matches[1]; IsLiteral = $false })
                    continue
                }
                if ($arg -match '^(?i)-LiteralPath:(.+)$') {
                    $targetSpecs.Add([pscustomobject]@{ Value = $Matches[1]; IsLiteral = $true })
                    continue
                }

                if ($arg -match '^(?i)-Path$') { $pendingPathMode = 'path'; continue }
                if ($arg -match '^(?i)-LiteralPath$') { $pendingPathMode = 'literal'; continue }
                if ($arg -match '^(?i)-f$|^(?i)--force$|^(?i)-Force$') { $force = $true; continue }
                if ($arg -match '^(?i)-r$|^(?i)-R$|^(?i)--recursive$|^(?i)-Recurse$') { $recursive = $true; continue }
                if ($arg -match '^(?i)-d$|^(?i)--dir$|^(?i)--directory$') { $allowDir = $true; continue }
                if ($arg -match '^(?i)-i$|^(?i)-I$|^(?i)--interactive(?:=.*)?$') { $interactive = $true; continue }
                if ($arg -match '^(?i)-WhatIf$') { $whatIf = $true; continue }
                if ($arg -match '^(?i)-Confirm$') { $confirm = $true; continue }

                if ($arg -match '^(?i)-Force:(\\$?true|1)$') { $force = $true; continue }
                if ($arg -match '^(?i)-Force:(\\$?false|0)$') { $force = $false; continue }
                if ($arg -match '^(?i)-Recurse:(\\$?true|1)$') { $recursive = $true; continue }
                if ($arg -match '^(?i)-Recurse:(\\$?false|0)$') { $recursive = $false; continue }
                if ($arg -match '^(?i)-WhatIf:(\\$?true|1)$') { $whatIf = $true; continue }
                if ($arg -match '^(?i)-WhatIf:(\\$?false|0)$') { $whatIf = $false; continue }
                if ($arg -match '^(?i)-Confirm:(\\$?true|1)$') { $confirm = $true; continue }
                if ($arg -match '^(?i)-Confirm:(\\$?false|0)$') { $confirm = $false; continue }
                if ($arg -match '^(?i)-Force:$') { $pendingSwitchMode = 'force'; continue }
                if ($arg -match '^(?i)-Recurse:$') { $pendingSwitchMode = 'recurse'; continue }
                if ($arg -match '^(?i)-WhatIf:$') { $pendingSwitchMode = 'whatif'; continue }
                if ($arg -match '^(?i)-Confirm:$') { $pendingSwitchMode = 'confirm'; continue }

                # 仅支持 rm 风格短参数组合：-rf/-fr/-di 等
                if ($arg -match '^-[fFrRdDiI]{2,}$') {
                    if ($arg -match '[fF]') { $force = $true }
                    if ($arg -match '[rR]') { $recursive = $true }
                    if ($arg -match '[dD]') { $allowDir = $true }
                    if ($arg -match '[iI]') { $interactive = $true }
                    continue
                }

                if ($arg.StartsWith('-')) {
                    throw 'Remove-Item: unsupported option in safe-delete wrapper: ' + $arg
                }
            }

            $targetSpecs.Add([pscustomobject]@{ Value = $arg; IsLiteral = $false })
        }

        if ($null -ne $pendingPathMode) {
            throw 'Remove-Item: missing value for -Path/-LiteralPath'
        }
        if ($null -ne $pendingSwitchMode) {
            throw 'Remove-Item: missing boolean value for -' + $pendingSwitchMode + ':'
        }

        if ($targetSpecs.Count -eq 0 -and $MyInvocation.ExpectingInput) {
            $pipelinePathSeen = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
            foreach ($pipedItem in $input) {
                if ($null -eq $pipedItem) { continue }

                $candidatePath = ''
                if ($pipedItem -is [string]) {
                    $candidatePath = [string]$pipedItem
                } elseif ($pipedItem -is [System.IO.FileSystemInfo]) {
                    $candidatePath = [string]$pipedItem.FullName
                } elseif ($pipedItem -is [System.Management.Automation.PathInfo]) {
                    $candidatePath = [string]$pipedItem.Path
                } elseif ($pipedItem.PSObject.Properties['FullName']) {
                    $candidatePath = [string]$pipedItem.FullName
                } elseif ($pipedItem.PSObject.Properties['Path']) {
                    $candidatePath = [string]$pipedItem.Path
                } else {
                    $candidatePath = [string]$pipedItem
                }

                if (-not [string]::IsNullOrWhiteSpace($candidatePath) -and $pipelinePathSeen.Add($candidatePath)) {
                    $targetSpecs.Add([pscustomobject]@{
                        Value = $candidatePath
                        IsLiteral = $true
                    })
                }
            }
        }

        if ($interactive) {
            throw (New-SafeDeleteFailClosedMessage '' 'interactive-not-supported')
        }

        if ($targetSpecs.Count -eq 0) {
            throw 'Remove-Item: missing path operand'
        }

        $trashBin = $env:CODEBUDDY_SAFE_DELETE_TRASH_BIN
        if (-not $trashBin -and $env:GENIE_TRASH_DIR) {
            $arch = if (($env:PROCESSOR_ARCHITECTURE -as [string]) -match 'ARM64') { 'arm64' } else { 'x64' }
            $trashBin = Join-Path -Path $env:GENIE_TRASH_DIR -ChildPath ('win32-' + $arch + '.exe')
        }

        $safeDeleteTargets = New-Object System.Collections.Generic.List[string]
        $safeDeleteItems = New-Object System.Collections.Generic.List[object]

        foreach ($targetSpec in $targetSpecs) {
            if ($targetSpec.IsLiteral) {
                $resolvedItems = @(Microsoft.PowerShell.Management\\Resolve-Path -LiteralPath $targetSpec.Value -ErrorAction SilentlyContinue)
            } else {
                $resolvedItems = @(Microsoft.PowerShell.Management\\Resolve-Path -Path $targetSpec.Value -ErrorAction SilentlyContinue)
            }

            if ($resolvedItems.Count -eq 0) {
                if ($force) { continue }
                throw (New-SafeDeleteFailClosedMessage $targetSpec.Value 'path-not-found')
            }

            foreach ($resolved in $resolvedItems) {
                $resolvedPath = [string]$resolved.Path
                $providerName = [string]$resolved.Provider.Name

                # 仅对 FileSystem 走 safe-delete；其他 provider 透传内置 Remove-Item
                if ($providerName -ne 'FileSystem' -or $whatIf) {
                    $delegateArgs = @{
                        LiteralPath = $resolvedPath
                        ErrorAction = 'Stop'
                    }
                    if ($force) { $delegateArgs['Force'] = $true }
                    if ($recursive) { $delegateArgs['Recurse'] = $true }
                    if ($whatIf) { $delegateArgs['WhatIf'] = $true }
                    if ($confirm) { $delegateArgs['Confirm'] = $true }
                    Microsoft.PowerShell.Management\\Remove-Item @delegateArgs
                    continue
                }

                $isDir = Microsoft.PowerShell.Management\\Test-Path -LiteralPath $resolvedPath -PathType Container
                $safeDeleteTargets.Add($resolvedPath)
                $safeDeleteItems.Add([pscustomobject]@{
                    TargetSpec = $targetSpec.Value
                    ResolvedPath = $resolvedPath
                    IsDir = $isDir
                })
            }
        }

        $guardedSafeDeleteTargets = New-Object System.Collections.Generic.List[string]
        $guardedSafeDeleteItems = New-Object System.Collections.Generic.List[object]

        foreach ($item in $safeDeleteItems) {
            $resolvedPath = [string]$item.ResolvedPath

            if (Test-SafeDeleteUnderOsTemp $resolvedPath) {
                $tmpDelegateArgs = @{
                    LiteralPath = $resolvedPath
                    ErrorAction = 'Stop'
                }
                if ($force) { $tmpDelegateArgs['Force'] = $true }
                if ($recursive) { $tmpDelegateArgs['Recurse'] = $true }
                Microsoft.PowerShell.Management\\Remove-Item @tmpDelegateArgs
                continue
            }

            $guardedSafeDeleteTargets.Add($resolvedPath)
            $guardedSafeDeleteItems.Add($item)
        }

        Invoke-SafeDeleteBulkGuard -Targets $guardedSafeDeleteTargets.ToArray()

        foreach ($item in $guardedSafeDeleteItems) {
            $targetValue = [string]$item.TargetSpec
            $resolvedPath = [string]$item.ResolvedPath
            $isDir = [bool]$item.IsDir

            try {
                if ($confirm) {
                    throw (New-SafeDeleteFailClosedMessage $targetValue 'confirm-not-supported')
                }

                if ($isDir -and -not $recursive -and -not $allowDir) {
                    $children = @(Microsoft.PowerShell.Management\\Get-ChildItem -LiteralPath $resolvedPath -Force -ErrorAction Stop)
                    if ($children.Count -gt 0) {
                        throw (New-SafeDeleteFailClosedMessage $targetValue 'non-empty-directory')
                    }
                }

                $movedByBinary = $false
                if ($trashBin -and (Microsoft.PowerShell.Management\\Test-Path -LiteralPath $trashBin -PathType Leaf)) {
                    & $trashBin $resolvedPath *> $null
                    if (($LASTEXITCODE -eq 0) -and -not (Microsoft.PowerShell.Management\\Test-Path -LiteralPath $resolvedPath)) {
                        $movedByBinary = $true
                    }
                }

                if (-not $movedByBinary) {
                    if ($isDir) {
                        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory(
                            $resolvedPath,
                            [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs,
                            [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin
                        )
                    } else {
                        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
                            $resolvedPath,
                            [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs,
                            [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin
                        )
                    }
                }

                if (Microsoft.PowerShell.Management\\Test-Path -LiteralPath $resolvedPath) {
                    throw 'target still exists after recycle operation: ' + $resolvedPath
                }
                Write-SafeDeleteReport $resolvedPath
            } catch {
                throw (New-SafeDeleteFailClosedMessage $targetValue 'trash-failed' $_.Exception.Message)
            }
        }
    }

    foreach ($aliasName in @('ri', 'rm', 'del', 'erase', 'rmdir', 'unlink')) {
        try {
            Set-Alias -Name $aliasName -Value Remove-Item -Scope Global -Force -ErrorAction Stop
        } catch {
            # Built-in alias may have AllScope; ignore and keep existing mapping.
        }
    }
}
`.trim(),
        eN = [
          "CODEBUDDY_SAFE_DELETE_BULK_GUARD",
          "CODEBUDDY_NODE_BIN",
          "CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR",
          "CODEBUDDY_TOOL_CALL_ID",
          "CODEBUDDY_SESSION_ID",
          "CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD",
        ];
      function escapePowerShellSingleQuoted(eA) {
        return Array.from(eA)
          .filter((eA) => {
            let el = eA.charCodeAt(0);
            return el > 31 && 127 !== el;
          })
          .join("")
          .replace(/'/g, "''");
      }
      function buildInlineBulkGuardEnvPrelude(eA) {
        if (!eA) return "";
        let el = [];
        for (let ec of eN) {
          let eu = eA[ec];
          eu && el.push(`$env:${ec} = '${escapePowerShellSingleQuoted(eu)}'`);
        }
        return el.join("\n");
      }
      function wrapPowerShellCommandWithSafeDelete(eA, el) {
        let ec = eA.trim();
        if (!ec || el?.enabled === !1) return ec;
        let eu = /\b(remove-item|ri|rm|del|erase|unlink|rmdir)\b/i.test(ec)
            ? buildInlineBulkGuardEnvPrelude(el?.inlineEnv)
            : "",
          ed = eu
            ? `${eu}
`
            : "";
        return `${ed}${eO}
${ec}`;
      }
      var eP = ec(35568),
        eL = ec(35179),
        eF = ec(6453),
        eU = ec(2752),
        ej = ec(83044),
        eG = ec(38590),
        shell_service_decorate = function (eA, el, ec, eu) {
          var ed,
            ep = arguments.length,
            eg =
              ep < 3
                ? el
                : null === eu
                  ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                  : eu;
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.decorate
          )
            eg = Reflect.decorate(eA, el, ec, eu);
          else
            for (var eh = eA.length - 1; eh >= 0; eh--)
              (ed = eA[eh]) &&
                (eg =
                  (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                  eg);
          return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
        },
        shell_service_metadata = function (eA, el) {
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.metadata
          )
            return Reflect.metadata(eA, el);
        };
      let eH = 200,
        eK = 2e3,
        e$ = [
          "bash: cannot set terminal process group",
          "bash: no job control in this shell",
        ],
        eY = {
          CTRL_A: "\x01",
          CTRL_B: "\x02",
          CTRL_C: "\x03",
          CTRL_D: "\x04",
          CTRL_E: "\x05",
          CTRL_F: "\x06",
          CTRL_G: "\x07",
          CTRL_H: "\b",
          CTRL_I: "	",
          CTRL_J: "\n",
          CTRL_K: "\v",
          CTRL_L: "\f",
          CTRL_M: "\r",
          CTRL_N: "\x0e",
          CTRL_O: "\x0f",
          CTRL_P: "\x10",
          CTRL_Q: "\x11",
          CTRL_R: "\x12",
          CTRL_S: "\x13",
          CTRL_T: "\x14",
          CTRL_U: "\x15",
          CTRL_V: "\x16",
          CTRL_W: "\x17",
          CTRL_X: "\x18",
          CTRL_Y: "\x19",
          CTRL_Z: "\x1a",
          ENTER: "\r",
          TAB: "	",
          ESCAPE: "\x1b",
          BACKSPACE: "",
          DELETE: "\x1b[3~",
          UP: "\x1b[A",
          DOWN: "\x1b[B",
          RIGHT: "\x1b[C",
          LEFT: "\x1b[D",
          HOME: "\x1b[H",
          END: "\x1b[F",
          PAGE_UP: "\x1b[5~",
          PAGE_DOWN: "\x1b[6~",
        };
      function resolveWindowsHideOption(eA) {
        return eA ? { windowsHide: !0 } : {};
      }
      let eJ = class {
        constructor() {
          this.activeHandles = new Set();
        }
        init() {
          (this.logger.setContext("ShellService"),
            this.scheduleSnapshotWarmup());
        }
        scheduleSnapshotWarmup() {
          if (!this.snapshotService) return;
          let eA = eK;
          this.logger.info?.(`Shell snapshot warmup scheduled in ${eA}ms`);
          let el = setTimeout(() => {
            try {
              if ("1" === process.env.CODEBUDDY_DISABLE_SHELL_SNAPSHOT)
                return void this.logger.info?.(
                  "Shell snapshot warmup disabled by CODEBUDDY_DISABLE_SHELL_SNAPSHOT=1",
                );
              if (
                (0, eF.isWindows)() &&
                !(0, eF.isGitBashAvailable)() &&
                "1" !== process.env.CODEBUDDY_ENABLE_SHELL_SNAPSHOT
              )
                return void this.logger.info?.(
                  "Shell snapshot warmup skipped on Windows (Git Bash not found, shell falls back to PowerShell). Set CODEBUDDY_ENABLE_SHELL_SNAPSHOT=1 to force-enable.",
                );
              this.snapshotService?.warmup();
            } catch (eA) {
              this.logger.warn?.(
                `Shell snapshot warmup threw: ${eA instanceof Error ? eA.message : eA}`,
              );
            }
          }, eA);
          el.unref?.();
        }
        async execute(eA) {
          let el,
            ec,
            eu = Date.now(),
            ed =
              this.workspace.workspaceFolders?.[0]?.uri?.fsPath ||
              process.cwd(),
            ep = eR().resolve(ed, eA.cwd || "");
          if (
            (this.logger.info?.(
              `[ShellService] execute | cmd="${eA.command.slice(0, 200)}" | cwd="${ep}" | usePty=${!1 !== eA.usePty} | timeout=${eA.timeout ?? "none"}`,
            ),
            !this.isValidDirectory(ep))
          )
            throw (
              this.logger.error?.(`[ShellService] invalid cwd: ${ep}`),
              Error(
                `Working directory does not exist or is not accessible: ${ep}`,
              )
            );
          await this.ensureSnapshot();
          let eg = await (0, eP.resolveSafeDeleteRuntimeConfig)(
              this.settingsManager,
              this.logger,
              "ShellService",
            ),
            eh = eA.cols || process.stdout.columns || 80,
            ef = eA.rows || process.stdout.rows || 30,
            em = !1 !== eA.usePty && !eA.rawCommand,
            eE = em ? await (0, eF.getPty)() : null;
          if (
            (this.logger.info?.(
              `[ShellService] getPty result: ${eE ? eE.name : "null"}${!em ? " (PTY disabled)" : ""}`,
            ),
            eE)
          )
            try {
              ((el = this.createPtyHandle(eA, ep, eh, ef, eE.module, eg)),
                (ec = "PTY"));
            } catch (eu) {
              (this.logger.error?.(
                `[ShellService] PTY execution failed, falling back to child_process: ${eu}`,
              ),
                (el = this.createChildProcessHandle(eA, ep, eg)),
                (ec = "ChildProcess(fallback)"));
            }
          else
            (this.logger.warn?.(
              "[ShellService] PTY not available, using child_process fallback",
            ),
              (el = this.createChildProcessHandle(eA, ep, eg)),
              (ec = "ChildProcess"));
          return (
            this.logger.info?.(
              `[ShellService] execute OK | pid=${el.pid} | mode=${ec} | elapsed=${Date.now() - eu}ms`,
            ),
            this.activeHandles.add(el),
            el.onExit(() => {
              this.activeHandles.delete(el);
            }),
            el
          );
        }
        async disposeAll() {
          let eA = Array.from(this.activeHandles);
          (this.activeHandles.clear(),
            await Promise.allSettled(
              eA.map((eA) => {
                try {
                  eA.dispose();
                } catch {}
                return eA.wait().catch(() => {});
              }),
            ));
        }
        getActiveHandleCount() {
          return this.activeHandles.size;
        }
        createChildProcessHandle(eA, el, ec) {
          let eu,
            ed,
            ep,
            eg = {};
          if (eA.rawCommand) {
            let ec = (0, eF.parseCommandLine)(eA.command);
            ((eu = ec.exe),
              (ed = ec.args),
              (ep = eA.command),
              (eg = this.readEnvFileAsVars()),
              this.logger.info?.(
                `[ShellService] createChildProcessHandle(raw) | exe=${eu} | argc=${ed.length} | cwd=${el}`,
              ));
          } else {
            let eg = (0, eF.getShellConfiguration)();
            ((eu = eg.executable),
              (ep = (0, eF.ensureShoptDisabled)(
                this.formatCommand(eA.command, eg.shell, ec.enabled),
                eg.shell,
              )),
              (ed = [...eg.argsPrefix, ep]),
              this.logger.info?.(
                `[ShellService] createChildProcessHandle | executable=${eu} | cwd=${el}`,
              ));
          }
          let eh = eA.stdoutFd ?? "pipe",
            ef = eA.stderrFd ?? "pipe",
            em = (0, eP.buildSafeDeleteEnv)(eA.env, {
              enabled: ec.enabled,
              bulkThreshold: ec.bulkThreshold,
              toolCallId: eA.toolCallId,
            }),
            eE = {
              ...process.env,
              ...eg,
              ...em,
              GIT_PAGER: "cat",
              HGPAGER: "cat",
              AWS_PAGER: "",
              SYSTEMD_PAGER: "cat",
              PAGER: "cat",
              MANPAGER: "cat",
              ...((0, eF.isWindows)()
                ? {
                    LANG: "C.UTF-8",
                    LC_ALL: "C.UTF-8",
                    LESSCHARSET: "utf-8",
                    GIT_TERMINAL_PROMPT: "0",
                    TERM: "dumb",
                    MSYS: "winsymlinks:nativestrict",
                    MSYS_NO_PATHCONV: "1",
                    MSYS2_ARG_CONV_EXCL: "*",
                    PYTHONIOENCODING: "utf-8",
                    PYTHONUTF8: "1",
                  }
                : {}),
            };
          (0, eP.logSafeDeleteInjection)(
            this.logger,
            "shell-child-process",
            eE,
            ec.enabled,
          );
          let eC = (0, eD.spawn)(eu, ed, {
            stdio: ["ignore", eh, ef],
            cwd: el,
            detached: !(0, eF.isWindows)(),
            env: eE,
            ...resolveWindowsHideOption((0, eF.isWindows)()),
          });
          return (
            this.logger.info?.(
              `[ShellService] ChildProcess spawned | pid=${eC.pid} | exe=${eu} | rawCommand=${!!eA.rawCommand} | windowsHide=${(0, eF.isWindows)()}`,
            ),
            new ChildProcessExecutionHandleImpl(
              eC,
              eA.command,
              ep,
              eA.onOutput,
              eA.abortSignal,
              eA.timeout,
              this.logger,
              eA.onTimeout,
              em[eP.SAFE_DELETE_REPORT_ENV],
            )
          );
        }
        createPtyHandle(eA, el, ec, eu, ed, ep) {
          if (eA.rawCommand)
            return (
              this.logger.warn?.(
                "[ShellService] createPtyHandle called with rawCommand=true; falling back to ChildProcess",
              ),
              this.createChildProcessHandle(eA, el, ep)
            );
          let {
              executable: eg,
              argsPrefix: eh,
              shell: ef,
            } = (0, eF.getShellConfiguration)(),
            em = [
              ...eh,
              (0, eF.ensureShoptDisabled)(
                this.formatCommand(eA.command, ef, ep.enabled),
                ef,
              ),
            ];
          this.logger.info?.(
            `[ShellService] createPtyHandle | executable=${eg} | cwd=${el}`,
          );
          let eE = (0, eF.listOpenFds)(),
            eC = (0, eP.buildSafeDeleteEnv)(eA.env, {
              enabled: ep.enabled,
              bulkThreshold: ep.bulkThreshold,
              toolCallId: eA.toolCallId,
            }),
            ey = {
              ...process.env,
              ...eC,
              TERM: "xterm-256color",
              PAGER: "cat",
              GIT_PAGER: "cat",
              HGPAGER: "cat",
              AWS_PAGER: "",
              SYSTEMD_PAGER: "cat",
              MANPAGER: "cat",
            };
          (0, eP.logSafeDeleteInjection)(
            this.logger,
            "shell-pty",
            ey,
            ep.enabled,
          );
          let ew = ed.spawn(eg, em, {
            cwd: el,
            name: "xterm",
            cols: ec,
            rows: eu,
            env: ey,
            handleFlowControl: !0,
          });
          this.logger.info?.(`[ShellService] PTY spawned | pid=${ew.pid}`);
          let eB = ew._fd,
            e_ = (0, eF.listOpenFds)(),
            eI = (0, eF.findLeakedPtmxFd)(eE, e_, eB);
          return new ShellExecutionHandleImpl(
            ew,
            new eQ.Terminal({
              allowProposedApi: !0,
              logLevel: "off",
              cols: ec,
              rows: eu,
            }),
            eA.command,
            eA.onOutput,
            eA.abortSignal,
            eA.timeout,
            this.logger,
            eI,
            eA.onTimeout,
            eC[eP.SAFE_DELETE_REPORT_ENV],
          );
        }
        async ensureSnapshot() {
          if ("1" === process.env.CODEBUDDY_DISABLE_SHELL_SNAPSHOT)
            return void this.logger.info?.(
              "Shell snapshot skipped by CODEBUDDY_DISABLE_SHELL_SNAPSHOT=1",
            );
          if (
            (0, eF.isWindows)() &&
            !(0, eF.isGitBashAvailable)() &&
            "1" !== process.env.CODEBUDDY_ENABLE_SHELL_SNAPSHOT
          )
            return void this.logger.info?.(
              "Shell snapshot skipped on Windows (Git Bash not found)",
            );
          if (!this.snapshotService)
            return void this.logger.info?.(
              "Shell snapshot service unavailable, skipping snapshot",
            );
          let eA = Date.now();
          this.logger.info?.("Shell snapshot ensure started");
          try {
            if (
              this.cachedSnapshotPath &&
              ev().existsSync(this.cachedSnapshotPath)
            ) {
              let el = Date.now() - eA;
              this.logger.info?.(
                `Shell snapshot cache hit. path=${this.cachedSnapshotPath}, elapsedMs=${el}`,
              );
              return;
            }
            let el = await this.snapshotService.getSnapshot(),
              ec = Date.now() - eA;
            el
              ? ((this.cachedSnapshotPath = el),
                this.logger.info?.(
                  `Shell snapshot ready. path=${el}, elapsedMs=${ec}`,
                ))
              : this.logger.warn?.(
                  `Shell snapshot unavailable after ensure. elapsedMs=${ec}`,
                );
          } catch (ec) {
            let el = Date.now() - eA;
            this.logger.warn?.(
              `Failed to create shell snapshot. elapsedMs=${el}, error=${ec}`,
            );
          }
        }
        formatCommand(eA, el, ec = !0) {
          return "powershell" === el
            ? this.formatCommandPowerShell(eA, ec)
            : this.formatCommandPosix(eA, el);
        }
        formatCommandPosix(eA, el) {
          eA = eA.trim();
          let ec = [];
          this.cachedSnapshotPath &&
            ev().existsSync(this.cachedSnapshotPath) &&
            ec.push(`. ${(0, eF.escapePathForShell)(this.cachedSnapshotPath)}`);
          let eu = (0, eP.buildSafeDeletePosixBootstrap)(el);
          eu && ec.push(eu);
          let ed = process.env.WORKBUDDY_EXTRA_PATHS;
          if (ed) {
            let eA = "win32" === process.platform ? ";" : ":",
              el = ed
                .split(eA)
                .filter(Boolean)
                .map((eA) => (0, eF.escapePathForShell)(eA));
            if (el.length > 0) {
              let eA = `export PATH=${el.join(":")}:"$PATH"`;
              ec.push(eA);
            }
          }
          let ep = process.env.CODEBUDDY_ENV_FILE;
          if (ep)
            try {
              if (ev().existsSync(ep)) {
                let eA = ev().readFileSync(ep, "utf8").trim();
                eA && ec.push(eA);
              }
            } catch (eA) {
              this.logger.debug?.(`Failed to read ENV_FILE ${ep}: ${eA}`);
            }
          let eg = (0, eP.buildSafeDeletePosixBootstrap)(el);
          eg && ec.push(eg);
          let eh = eA.replace(/'/g, "'\\''");
          ec.push(`eval '${eh}'`);
          let ef = ec.join(" && "),
            em = process.env.CODEBUDDY_CODE_SHELL_PREFIX;
          if (em) {
            let eA = ef.replace(/'/g, "'\\''");
            ef = `${em} '${eA}'`;
          }
          return ef;
        }
        formatCommandPowerShell(eA, el) {
          eA = eA.trim();
          let ec = [],
            eu = process.env.WORKBUDDY_EXTRA_PATHS;
          if (eu) {
            let eA = eu.split(";").filter(Boolean);
            if (eA.length > 0) {
              let el = eA.map((eA) => `'${eA.replace(/'/g, "''")}'`).join(", "),
                eu = `$env:PATH = (@(${el}) + $env:PATH.Split(';')) -join ';'`;
              ec.push(eu);
            }
          }
          return (
            ec.push(wrapPowerShellCommandWithSafeDelete(eA, { enabled: el })),
            ec.join("; ")
          );
        }
        readEnvFileAsVars() {
          let eA = process.env.CODEBUDDY_ENV_FILE;
          if (!eA) return {};
          try {
            if (!ev().existsSync(eA)) return {};
            let el = ev().readFileSync(eA, "utf8");
            return (0, eF.parseEnvFile)(el);
          } catch (el) {
            return (
              this.logger.debug?.(
                `Failed to read ENV_FILE ${eA} for rawCommand: ${el}`,
              ),
              {}
            );
          }
        }
        isValidDirectory(eA) {
          try {
            return ev().statSync(eA).isDirectory();
          } catch {
            return !1;
          }
        }
      };
      (shell_service_decorate(
        [
          (0, em.Autowired)(eS.Workspace),
          shell_service_metadata(
            "design:type",
            "function" == typeof (ed = void 0 !== eS.Workspace && eS.Workspace)
              ? ed
              : Object,
          ),
        ],
        eJ.prototype,
        "workspace",
        void 0,
      ),
        shell_service_decorate(
          [
            (0, em.Autowired)(em.Logger),
            shell_service_metadata(
              "design:type",
              "function" == typeof (ep = void 0 !== em.Logger && em.Logger)
                ? ep
                : Object,
            ),
          ],
          eJ.prototype,
          "logger",
          void 0,
        ),
        shell_service_decorate(
          [
            (0, em.Autowired)(ex.SettingsManager),
            shell_service_metadata(
              "design:type",
              "function" ==
                typeof (eg =
                  void 0 !== ex.SettingsManager && ex.SettingsManager)
                ? eg
                : Object,
            ),
          ],
          eJ.prototype,
          "settingsManager",
          void 0,
        ),
        shell_service_decorate(
          [
            (0, em.Autowired)(eL.ShellSnapshotService),
            (0, em.Optional)(),
            shell_service_metadata(
              "design:type",
              "function" ==
                typeof (eh =
                  void 0 !== eL.ShellSnapshotService && eL.ShellSnapshotService)
                ? eh
                : Object,
            ),
          ],
          eJ.prototype,
          "snapshotService",
          void 0,
        ),
        shell_service_decorate(
          [
            (0, em.PostConstruct)(),
            shell_service_metadata("design:type", Function),
            shell_service_metadata("design:paramtypes", []),
            shell_service_metadata("design:returntype", void 0),
          ],
          eJ.prototype,
          "init",
          null,
        ),
        (eJ = shell_service_decorate(
          [(0, em.Component)(eB.LocalShellService)],
          eJ,
        )));
      let ShellExecutionHandleImpl = class ShellExecutionHandleImpl {
        constructor(eA, el, ec, eu, ed, ep, eg, eh, ef, eE) {
          ((this.ptyProcess = eA),
            (this.headlessTerminal = el),
            (this.command = ec),
            (this.onOutput = eu),
            (this.abortSignal = ed),
            (this.logger = eg),
            (this.extraPtmxFd = eh),
            (this.onTimeout = ef),
            (this.safeDeleteReportPath = eE),
            (this._disposed = !1),
            (this._exited = !1),
            (this._interrupted = !1),
            (this._result = null),
            (this._onData = new em.Emitter()),
            (this._onExit = new em.Emitter()),
            (this._onAlternateBuffer = new em.Emitter()),
            (this.onData = this._onData.event),
            (this.onExit = this._onExit.event),
            (this.onAlternateBuffer = this._onAlternateBuffer.event),
            (this.stdoutBuf = new ej.TruncateBuffer()),
            (this.isStreamingRawContent = !0),
            (this.sniffedBytes = 0),
            (this.MAX_SNIFF_SIZE = 4096),
            (this.isWriting = !1),
            (this.renderTimeout = null),
            (this.timeoutTimer = null),
            (this._usedAlternateBuffer = !1),
            (this._exitPromise = new Promise((eA) => {
              this._exitResolve = eA;
            })),
            this.headlessTerminal.scrollToTop(),
            this.abortSignal &&
              (this.abortSignal.aborted
                ? ((this._interrupted = !0),
                  this.kill().catch((eA) => {
                    this.logger?.debug?.(
                      `kill() failed in initial abort handler: ${eA?.message || eA}`,
                    );
                  }))
                : this.abortSignal.addEventListener(
                    "abort",
                    () => {
                      ((this._interrupted = !0),
                        this.kill().catch((eA) => {
                          this.logger?.debug?.(
                            `kill() failed in abort handler: ${eA?.message || eA}`,
                          );
                        }));
                    },
                    { once: !0 },
                  )),
            ep &&
              ep > 0 &&
              (this.timeoutTimer = setTimeout(() => {
                let eA = !1;
                if (this.onTimeout)
                  try {
                    eA = !0 === this.onTimeout();
                  } catch (eA) {
                    this.logger?.debug?.(
                      `onTimeout callback threw: ${eA?.message || eA}`,
                    );
                  }
                eA
                  ? this.logger?.info?.(
                      `Command timed out after ${ep}ms — handed off to caller (no SIGTERM)`,
                    )
                  : ((this._interrupted = !0),
                    this.logger?.debug?.(`Command timed out after ${ep}ms`),
                    this.kill().catch((eA) => {
                      this.logger?.debug?.(
                        `kill() failed in timeout handler: ${eA?.message || eA}`,
                      );
                    }));
              }, ep)),
            this.ptyProcess.onData((eA) => {
              this._disposed || this.handleOutput(Buffer.from(eA, "utf-8"));
            }),
            this.ptyProcess.onExit(({ exitCode: eA, signal: el }) => {
              (this.logger?.info?.(
                `[ShellHandle:PTY] exited | pid=${this.ptyProcess.pid} | exitCode=${eA ?? "null"} | signal=${el ?? "none"}`,
              ),
                (this._exited = !0),
                this.timeoutTimer &&
                  (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
                this.render(!0),
                (this._result = (0, eP.attachSafeDeleteReportEvents)(
                  {
                    stdout: this.stdoutBuf.toString(!0),
                    stderr: "",
                    exitCode: eA ?? null,
                    signal: el ? this.signalNumberToName(el) : null,
                    interrupted: this._interrupted,
                  },
                  this.safeDeleteReportPath,
                  this.logger,
                )),
                this._onExit.fire(this._result),
                this._exitResolve(this._result));
            }),
            this.headlessTerminal.onScroll(() => {
              this.isWriting || this.render();
            }));
        }
        get id() {
          return String(this.ptyProcess.pid);
        }
        get pid() {
          return this.ptyProcess.pid;
        }
        get isAlive() {
          if (this._exited) return !1;
          try {
            return (process.kill(this.ptyProcess.pid, 0), !0);
          } catch {
            return !1;
          }
        }
        write(eA) {
          !this._disposed && this.isAlive && this.ptyProcess.write(eA);
        }
        sendKey(eA) {
          let el = eY[eA];
          el && this.write(el);
        }
        resize(eA, el) {
          if (!this._disposed && this.isAlive)
            try {
              (this.ptyProcess.resize(eA, el),
                this.headlessTerminal.resize(eA, el));
            } catch {}
        }
        async kill(eA = "SIGTERM") {
          if (!this._disposed && this.isAlive) {
            try {
              if ((0, eF.isWindows)())
                this.ptyProcess.pid
                  ? await eG.WindowsProcessUtils.killProcessTree(
                      this.ptyProcess.pid,
                    )
                  : this.ptyProcess.kill();
              else
                try {
                  (process.kill(-this.ptyProcess.pid, eA),
                    await new Promise((eA) => setTimeout(eA, eH)),
                    this.isAlive &&
                      process.kill(-this.ptyProcess.pid, "SIGKILL"));
                } catch {
                  (this.ptyProcess.kill(eA),
                    await new Promise((eA) => setTimeout(eA, eH)),
                    this.isAlive && this.ptyProcess.kill("SIGKILL"));
                }
            } catch {
              try {
                this.ptyProcess.kill();
              } catch {}
            } finally {
              if (void 0 !== this.extraPtmxFd)
                try {
                  (ev().closeSync(this.extraPtmxFd),
                    (this.extraPtmxFd = void 0));
                } catch {}
            }
            if (
              (await new Promise((eA) => setTimeout(eA, 500)),
              !this._exited && !this.isAlive)
            ) {
              this._exited = !0;
              let el = (0, eP.attachSafeDeleteReportEvents)(
                {
                  stdout: this.stdoutBuf.toString(!0),
                  stderr: "",
                  exitCode: null,
                  signal: eA,
                  interrupted: this._interrupted,
                },
                this.safeDeleteReportPath,
                this.logger,
              );
              (this._onExit.fire(el),
                this._exitResolve(el),
                this.logger?.debug?.(
                  "PTY onExit did not fire after kill, resolved _exitPromise manually",
                ));
            }
          }
        }
        getScreen() {
          let eA = this.headlessTerminal.buffer.active,
            el = [];
          for (let ec = 0; ec < this.headlessTerminal.rows; ec++) {
            let eu = eA.getLine(eA.viewportY + ec);
            el.push(eu ? eu.translateToString(!0) : "");
          }
          for (; el.length > 0 && "" === el[el.length - 1].trim(); ) el.pop();
          return eM()(el.join("\n"));
        }
        getColorScreen() {
          return (0, eU.serializeTerminalToObject)(this.headlessTerminal);
        }
        usedAlternateBuffer() {
          return this._usedAlternateBuffer;
        }
        wait() {
          return this._exitPromise;
        }
        dispose() {
          if (
            !this._disposed &&
            ((this._disposed = !0),
            this.timeoutTimer &&
              (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
            this.renderTimeout &&
              (clearTimeout(this.renderTimeout), (this.renderTimeout = null)),
            this.kill().catch((eA) => {
              this.logger?.debug?.(
                `PTY kill() failed during dispose: ${eA?.message || eA}`,
              );
            }),
            this._onData.dispose(),
            this._onExit.dispose(),
            this._onAlternateBuffer.dispose(),
            this.headlessTerminal.dispose(),
            void 0 !== this.extraPtmxFd)
          )
            try {
              (ev().closeSync(this.extraPtmxFd), (this.extraPtmxFd = void 0));
            } catch {}
        }
        handleOutput(eA) {
          let el = (0, eF.decodeBuffer)(eA);
          if (
            (this.isStreamingRawContent &&
              this.sniffedBytes < this.MAX_SNIFF_SIZE &&
              ((this.sniffedBytes += eA.length),
              (0, eF.isBinary)(eA) && (this.isStreamingRawContent = !1)),
            this.isStreamingRawContent)
          ) {
            if (0 === el.length) return;
            !this._usedAlternateBuffer &&
              (el.includes("\x1b[?1049h") || el.includes("\x1b[?47h")) &&
              ((this._usedAlternateBuffer = !0),
              this._onAlternateBuffer.fire());
            let eA = e$.reduce(
                (eA, el) => (eA.includes(el) ? eA.replace(el, "") : eA),
                el,
              ),
              ec = eM()(eA);
            (this.stdoutBuf.push(ec),
              this._onData.fire(ec),
              this.onOutput &&
                ec &&
                this.onOutput({
                  type: "stdout",
                  data: ec,
                  timestamp: Date.now(),
                }),
              (this.isWriting = !0),
              this.headlessTerminal.write(eA, () => {
                (this.render(), (this.isWriting = !1));
              }));
          }
        }
        render(eA = !1) {
          if (eA) {
            (this.renderTimeout &&
              (clearTimeout(this.renderTimeout), (this.renderTimeout = null)),
              this.renderFn());
            return;
          }
          this.renderTimeout ||
            (this.renderTimeout = setTimeout(() => {
              (this.renderFn(), (this.renderTimeout = null));
            }, 68));
        }
        renderFn() {}
        signalNumberToName(eA) {
          return (
            {
              1: "SIGHUP",
              2: "SIGINT",
              3: "SIGQUIT",
              6: "SIGABRT",
              9: "SIGKILL",
              14: "SIGALRM",
              15: "SIGTERM",
            }[eA] || null
          );
        }
      };
      let ChildProcessExecutionHandleImpl = class ChildProcessExecutionHandleImpl {
        constructor(eA, el, ec, eu, ed, ep, eg, eh, ef) {
          ((this.shellProcess = eA),
            (this.command = el),
            (this.guardedCommand = ec),
            (this.onOutput = eu),
            (this.abortSignal = ed),
            (this.logger = eg),
            (this.onTimeout = eh),
            (this.safeDeleteReportPath = ef),
            (this._disposed = !1),
            (this._exited = !1),
            (this._interrupted = !1),
            (this._result = null),
            (this._onData = new em.Emitter()),
            (this._onExit = new em.Emitter()),
            (this._onAlternateBuffer = new em.Emitter()),
            (this.onData = this._onData.event),
            (this.onExit = this._onExit.event),
            (this.onAlternateBuffer = this._onAlternateBuffer.event),
            (this.stdoutBuf = new ej.TruncateBuffer()),
            (this.stderrBuf = new ej.TruncateBuffer()),
            (this.pendingStdoutTail = Buffer.alloc(0)),
            (this.pendingStderrTail = Buffer.alloc(0)),
            (this.timeoutTimer = null),
            (this._exitPromise = new Promise((eA) => {
              this._exitResolve = eA;
            })),
            this.abortSignal &&
              (this.abortSignal.aborted
                ? ((this._interrupted = !0),
                  this.kill().catch((eA) => {
                    this.logger?.debug?.(
                      `kill() failed in initial abort handler: ${eA?.message || eA}`,
                    );
                  }))
                : this.abortSignal.addEventListener(
                    "abort",
                    () => {
                      ((this._interrupted = !0),
                        this.kill().catch((eA) => {
                          this.logger?.debug?.(
                            `kill() failed in abort handler: ${eA?.message || eA}`,
                          );
                        }));
                    },
                    { once: !0 },
                  )),
            ep &&
              ep > 0 &&
              (this.timeoutTimer = setTimeout(() => {
                let eA = !1;
                if (this.onTimeout)
                  try {
                    eA = !0 === this.onTimeout();
                  } catch (eA) {
                    this.logger?.debug?.(
                      `onTimeout callback threw: ${eA?.message || eA}`,
                    );
                  }
                eA
                  ? this.logger?.info?.(
                      `Command timed out after ${ep}ms — handed off to caller (no SIGTERM)`,
                    )
                  : ((this._interrupted = !0),
                    this.logger?.debug?.(`Command timed out after ${ep}ms`),
                    this.kill().catch((eA) => {
                      this.logger?.debug?.(
                        `kill() failed in timeout handler: ${eA?.message || eA}`,
                      );
                    }));
              }, ep)),
            this.shellProcess.once("error", (eA) => {
              let el = eA.message.replace(this.guardedCommand, this.command);
              this.logger?.error?.(`Shell process error: ${el}`);
            }),
            this.shellProcess.stdout?.on("data", (eA) => {
              this._exited || this.handleOutput(eA, "stdout");
            }),
            this.shellProcess.stderr?.on("data", (eA) => {
              if (this._exited) return;
              let el = this.decodeBuffer(eA);
              e$.some((eA) => el.includes(eA)) ||
                this.handleOutput(eA, "stderr");
            }),
            this.shellProcess.once("exit", (eA, el) => {
              if (
                (this.logger?.info?.(
                  `[ShellHandle:ChildProcess] exited | pid=${this.shellProcess.pid} | exitCode=${eA ?? "null"} | signal=${el ?? "none"}`,
                ),
                !this._exited)
              ) {
                ((this._exited = !0),
                  this.flushPendingTails(),
                  this.timeoutTimer &&
                    (clearTimeout(this.timeoutTimer),
                    (this.timeoutTimer = null)),
                  (this._result = (0, eP.attachSafeDeleteReportEvents)(
                    {
                      stdout: this.stdoutBuf.toString(!0),
                      stderr: this.stderrBuf.toString(!0),
                      exitCode: eA,
                      signal: el,
                      interrupted: this._interrupted,
                    },
                    this.safeDeleteReportPath,
                    this.logger,
                  )),
                  this._onExit.fire(this._result),
                  this._exitResolve(this._result));
                try {
                  this.shellProcess.unref?.();
                } catch {}
              }
            }));
        }
        get id() {
          return String(this.shellProcess.pid || 0);
        }
        get pid() {
          return this.shellProcess.pid || 0;
        }
        get isAlive() {
          if (this._exited || !this.shellProcess.pid) return !1;
          try {
            return (process.kill(this.shellProcess.pid, 0), !0);
          } catch {
            return !1;
          }
        }
        write(eA) {
          !this._disposed &&
            this.isAlive &&
            this.shellProcess.stdin &&
            this.shellProcess.stdin.write(eA);
        }
        sendKey(eA) {
          let el = eY[eA];
          el && this.write(el);
        }
        resize(eA, el) {}
        async kill(eA = "SIGTERM") {
          if (!this._disposed && this.isAlive) {
            try {
              (this.shellProcess.stdout?.pause(),
                this.shellProcess.stderr?.pause());
            } catch {}
            try {
              if ((0, eF.isWindows)())
                this.shellProcess.pid
                  ? eG.WindowsProcessUtils.killProcessTreeSync(
                      this.shellProcess.pid,
                    )
                  : this.shellProcess.kill();
              else
                try {
                  this.shellProcess.pid &&
                    (process.kill(-this.shellProcess.pid, eA),
                    await new Promise((eA) => setTimeout(eA, eH)),
                    this.isAlive &&
                      process.kill(-this.shellProcess.pid, "SIGKILL"));
                } catch {
                  try {
                    this.shellProcess.kill("SIGKILL");
                  } catch {}
                }
            } catch {}
            if (
              (await new Promise((eA) => setTimeout(eA, 500)),
              !this._exited && !this.isAlive)
            ) {
              this._exited = !0;
              let el = (0, eP.attachSafeDeleteReportEvents)(
                {
                  stdout: this.stdoutBuf.toString(!0),
                  stderr: this.stderrBuf.toString(!0),
                  exitCode: null,
                  signal: eA,
                  interrupted: this._interrupted,
                },
                this.safeDeleteReportPath,
                this.logger,
              );
              (this._onExit.fire(el),
                this._exitResolve(el),
                this.logger?.debug?.(
                  "Child process exit event did not fire after kill, resolved _exitPromise manually",
                ));
            }
          }
        }
        getScreen() {
          return this.stdoutBuf.toString(!0);
        }
        getColorScreen() {
          return this.stdoutBuf
            .toString(!0)
            .split("\n")
            .map((eA) => [
              {
                text: eA,
                bold: !1,
                italic: !1,
                underline: !1,
                dim: !1,
                inverse: !1,
                fg: "",
                bg: "",
              },
            ]);
        }
        usedAlternateBuffer() {
          return !1;
        }
        wait() {
          return this._exitPromise;
        }
        dispose() {
          this._disposed ||
            ((this._disposed = !0),
            this.timeoutTimer &&
              (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
            this.kill().catch(() => {}),
            this._onData.dispose(),
            this._onExit.dispose(),
            this._onAlternateBuffer.dispose());
        }
        handleOutput(eA, el) {
          let ec = eA,
            eu =
              "stdout" === el ? this.pendingStdoutTail : this.pendingStderrTail;
          eu.length > 0 && (ec = Buffer.concat([eu, eA]));
          let { ready: ed, pending: ep } = (0, eF.splitPendingUtf8Tail)(ec);
          if (
            ("stdout" === el
              ? (this.pendingStdoutTail = ep)
              : (this.pendingStderrTail = ep),
            0 === (ec = ed).length)
          )
            return;
          let eg = this.decodeBuffer(ec),
            eh = eM()(eg);
          ("stdout" === el ? this.stdoutBuf.push(eh) : this.stderrBuf.push(eh),
            this._onData.fire(eh),
            this.onOutput &&
              this.onOutput({ type: el, data: eh, timestamp: Date.now() }));
        }
        flushPendingTails() {
          for (let eA of ["stdout", "stderr"]) {
            let el =
              "stdout" === eA ? this.pendingStdoutTail : this.pendingStderrTail;
            if (0 === el.length) continue;
            "stdout" === eA
              ? (this.pendingStdoutTail = Buffer.alloc(0))
              : (this.pendingStderrTail = Buffer.alloc(0));
            let ec = this.decodeBuffer(el),
              eu = eM()(ec);
            ("stdout" === eA
              ? this.stdoutBuf.push(eu)
              : this.stderrBuf.push(eu),
              this._onData.fire(eu),
              this.onOutput &&
                this.onOutput({ type: eA, data: eu, timestamp: Date.now() }));
          }
        }
        decodeBuffer(eA) {
          return (0, eF.decodeBuffer)(eA);
        }
      };
      var shell_snapshot_service_decorate = function (eA, el, ec, eu) {
          var ed,
            ep = arguments.length,
            eg =
              ep < 3
                ? el
                : null === eu
                  ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                  : eu;
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.decorate
          )
            eg = Reflect.decorate(eA, el, ec, eu);
          else
            for (var eh = eA.length - 1; eh >= 0; eh--)
              (ed = eA[eh]) &&
                (eg =
                  (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                  eg);
          return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
        },
        shell_snapshot_service_metadata = function (eA, el) {
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.metadata
          )
            return Reflect.metadata(eA, el);
        };
      let ez = class {
        constructor() {
          this.creationFailed = !1;
        }
        init() {
          this.logger.setContext("ShellSnapshotService");
        }
        warmup() {
          this.cachedSnapshot ||
            this.creatingPromise ||
            this.creationFailed ||
            (this.logger.info?.("Shell snapshot warmup started"),
            (this.creatingPromise = this.createSnapshot()),
            this.creatingPromise
              .then((eA) => {
                eA
                  ? this.logger.info?.(
                      "Shell snapshot warmup completed successfully",
                    )
                  : this.logger.info?.(
                      "Shell snapshot warmup completed (no snapshot)",
                    );
              })
              .catch((eA) => {
                let el = eA instanceof Error ? eA.message : String(eA);
                (this.logger.error?.(`Shell snapshot warmup failed: ${el}`),
                  eA instanceof Error &&
                    eA.stack &&
                    this.logger.debug?.(
                      `Shell snapshot warmup stack: ${eA.stack}`,
                    ));
              })
              .finally(() => {
                this.creatingPromise = void 0;
              }));
        }
        async getSnapshot() {
          if (this.cachedSnapshot)
            if (
              !this.cachedSnapshot.snapshotFilePath ||
              ev().existsSync(this.cachedSnapshot.snapshotFilePath)
            )
              return this.cachedSnapshot.snapshotFilePath;
            else
              (this.logger.debug?.("Snapshot file missing, recreating..."),
                (this.cachedSnapshot = void 0),
                (this.creationFailed = !1));
          if (this.creationFailed)
            return void this.logger.debug?.(
              "Snapshot creation previously failed, skipping",
            );
          if (this.creatingPromise) return this.creatingPromise;
          this.creatingPromise = this.createSnapshot();
          try {
            return await this.creatingPromise;
          } finally {
            this.creatingPromise = void 0;
          }
        }
        clearCache() {
          if (
            (this.cleanupCallback &&
              (this.cleanupCallback(), (this.cleanupCallback = void 0)),
            this.cachedSnapshot?.snapshotFilePath)
          )
            try {
              ev().existsSync(this.cachedSnapshot.snapshotFilePath) &&
                (ev().unlinkSync(this.cachedSnapshot.snapshotFilePath),
                this.logger.debug?.(
                  `Cleaned up snapshot: ${this.cachedSnapshot.snapshotFilePath}`,
                ));
            } catch (eA) {
              this.logger.warn?.(`Failed to cleanup snapshot: ${eA}`);
            }
          ((this.cachedSnapshot = void 0), (this.creationFailed = !1));
        }
        async createSnapshot() {
          let { executable: eA, shell: el } = (0, eF.getShellConfiguration)();
          if (!(0, eF.isSnapshotSupportedShell)(el)) {
            (this.logger.info?.(
              `Shell type '${el}' (${eA}) does not support snapshot creation. Snapshot feature requires a POSIX-compatible shell (bash, zsh, or sh). You can set CODEBUDDY_CODE_SHELL=bash or CODEBUDDY_CODE_SHELL=zsh to override.`,
            ),
              (this.creationFailed = !0));
            return;
          }
          this.logger.debug?.(`Creating shell snapshot for ${el} (${eA})`);
          let ec = (0, eL.getShellConfigFile)(eA);
          (this.logger.debug?.(
            `Looking for shell config file: ${ec.configPath}`,
          ),
            ec.exists ||
              ((0, eF.isWindows)()
                ? this.logger.info?.(
                    'Shell config file not found. To enable full shell environment support, create one of: ~/.bash_profile, ~/.bashrc, or ~/.profile and add your PATH configuration (e.g., export PATH="$HOME/.cargo/bin:$PATH")',
                  )
                : this.logger.info?.(
                    `Shell config file not found: ${ec.configPath}, creating snapshot with defaults only`,
                  )));
          let eu = (0, eL.getSnapshotDirectory)(),
            ed = (0, eL.generateSnapshotFileName)(el),
            ep = eR().join(eu, ed);
          try {
            ev().mkdirSync(eu, { recursive: !0 });
          } catch (eA) {
            (this.logger.error?.(
              `Failed to create snapshot directory '${eu}': ${eA}`,
            ),
              (this.creationFailed = !0));
            return;
          }
          this.logger.debug?.(`Snapshots directory: ${eu}`);
          let eg = await this.generateSnapshotScript(eA, ep, ec);
          (this.logger.debug?.(`Creating snapshot at: ${ep}`),
            this.logger.debug?.(`Shell binary exists: ${ev().existsSync(eA)}`),
            this.logger.debug?.(
              `Execution timeout: ${eL.SNAPSHOT_CREATION_TIMEOUT_MS}ms`,
            ));
          try {
            if (
              (await this.executeSnapshotScript(eA, eg), ev().existsSync(ep))
            ) {
              await this.validateSnapshot(eA, ep);
              let el = ev().statSync(ep);
              return (
                this.logger.info?.(
                  `Shell snapshot created successfully (${el.size} bytes)`,
                ),
                (this.cachedSnapshot = { binShell: eA, snapshotFilePath: ep }),
                this.registerCleanupCallback(ep),
                ep
              );
            }
            (this.logger.error?.(
              `Shell snapshot file not found after creation: ${ep}`,
            ),
              (this.creationFailed = !0));
            return;
          } catch (el) {
            let eA = el instanceof Error ? el.message : String(el);
            (eA.includes("Snapshot validation")
              ? this.logger.error?.(`Shell snapshot validation failed: ${eA}`)
              : this.logger.error?.(`Shell snapshot creation failed: ${eA}`),
              this.cleanupPartialSnapshot(ep),
              (this.creationFailed = !0));
            return;
          }
        }
        cleanupPartialSnapshot(eA) {
          try {
            ev().existsSync(eA) &&
              (ev().unlinkSync(eA),
              this.logger.debug?.(`Cleaned up partial snapshot: ${eA}`));
          } catch (el) {
            this.logger.warn?.(
              `Failed to cleanup partial snapshot '${eA}': ${el}`,
            );
          }
        }
        async generateSnapshotScript(eA, el, ec) {
          let eu = (0, eF.isWindows)()
              ? (0, eF.windowsPathToUnix)(ec.configPath)
              : ec.configPath,
            ed = this.generateEnvironmentExportScript(ec.shellType),
            ep = this.generateToolConfigScript(),
            eg = (0, eF.escapePathForShell)(el);
          return `SNAPSHOT_FILE=${eg}
${ec.exists ? `. "${eu}" < /dev/null` : "# No user config file to source"}
# First, remove any existing snapshot file and create a fresh one
# Using rm + > instead of >| for better Windows Git Bash compatibility
rm -f "$SNAPSHOT_FILE" 2>/dev/null || true
echo "# Shell environment snapshot" > "$SNAPSHOT_FILE"
# When this file is sourced, we first unalias to avoid conflicts
# This is necessary because aliases get "frozen" inside function definitions at definition time,
# which can cause unexpected behavior when functions use commands that conflict with aliases
echo "# Unset all aliases to avoid conflicts with functions" >> "$SNAPSHOT_FILE"
echo "unalias -a 2>/dev/null || true" >> "$SNAPSHOT_FILE"
${ed}
${ep}
# Exit silently on success, only report errors
if [ ! -f "$SNAPSHOT_FILE" ]; then
  echo "Error: Snapshot file was not created at $SNAPSHOT_FILE" >&2
  exit 1
fi
`;
        }
        generateEnvironmentExportScript(eA) {
          switch (eA) {
            case "zsh":
              return this.generateZshEnvironmentExportScript();
            case "bash":
              return this.generateBashEnvironmentExportScript();
            case "sh":
              return this.generatePosixShEnvironmentExportScript();
            default:
              return "";
          }
        }
        generateZshEnvironmentExportScript() {
          let eA = "^_[^_]";
          return `
echo "# Functions" >> "$SNAPSHOT_FILE"
# Force autoload all functions first
typeset -f > /dev/null 2>&1
# Filter completion functions (single underscore prefix like _xxx)
# Keep double-underscore helpers (e.g. __zsh_like_cd, __git_xxx)
typeset +f | grep -vE '${eA}' | while read func; do
  typeset -f "$func" >> "$SNAPSHOT_FILE"
done

echo "# Shell Options" >> "$SNAPSHOT_FILE"
setopt | sed 's/^/setopt /' | head -n 1000 >> "$SNAPSHOT_FILE"
${this.generateAliasExportScript()}
`;
        }
        generateBashEnvironmentExportScript() {
          let eA = "^_[^_]";
          return `
echo "# Functions" >> "$SNAPSHOT_FILE"
# Force autoload all functions first
declare -f > /dev/null 2>&1
# Filter completion functions (single underscore prefix like _xxx)
# Keep double-underscore helpers (e.g. __zsh_like_cd, __git_xxx)
declare -F | cut -d' ' -f3 | grep -vE '${eA}' | while read func; do
  # Encode the function to base64, preserving all special characters
  encoded_func=$(declare -f "$func" | base64)
  # Write the function definition to the snapshot
  echo "eval \\"\\$(echo '$encoded_func' | base64 -d)\\"" >> "$SNAPSHOT_FILE"
done

echo "# Shell Options" >> "$SNAPSHOT_FILE"
shopt -p | head -n 1000 >> "$SNAPSHOT_FILE"
set -o | awk '$2 == "on" { print "set -o " $1 }' | head -n 1000 >> "$SNAPSHOT_FILE"
echo "shopt -s expand_aliases" >> "$SNAPSHOT_FILE"
${this.generateAliasExportScript()}
`;
        }
        generatePosixShEnvironmentExportScript() {
          return `
echo "# Environment" >> "$SNAPSHOT_FILE"
# Export only stable variables. Skip shell-managed dynamic state.
export -p | grep -vE '^export (PWD|OLDPWD|SHLVL|_)=' | head -n 2000 >> "$SNAPSHOT_FILE"
`;
        }
        generateAliasExportScript() {
          return `
echo "# Aliases" >> "$SNAPSHOT_FILE"
# Filter out winpty aliases on Windows to avoid "stdin is not a tty" errors
# Git Bash automatically creates aliases like "alias node='winpty node.exe'" for
# programs that need Win32 Console in mintty, but winpty fails when there's no TTY
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
  alias | grep -v "='winpty " | sed 's/^alias //g' | sed 's/^/alias -- /' | head -n 1000 >> "$SNAPSHOT_FILE"
else
  alias | sed 's/^alias //g' | sed 's/^/alias -- /' | head -n 1000 >> "$SNAPSHOT_FILE"
fi
`;
        }
        generateToolConfigScript() {
          return `
# Add PATH to the file
# Use the shell's own $PATH which is already in the correct format
# (Git Bash on Windows auto-converts Windows PATH to Unix format)
echo "export PATH=\\"$PATH\\"" >> "$SNAPSHOT_FILE"
`;
        }
        validateSnapshot(eA, el) {
          return new Promise((ec, eu) => {
            let ed = `. ${(0, eF.escapePathForShell)(el)}`;
            (0, eD.execFile)(
              eA,
              ["-c", ed],
              {
                env: {
                  ...(process.env.CODEBUDDY_CODE_DONT_INHERIT_ENV
                    ? {}
                    : process.env),
                  SHELL: eA,
                  GIT_EDITOR: "true",
                  CODEBUDDY: "1",
                  ...((0, eF.isWindows)()
                    ? { LANG: "C.UTF-8", LC_ALL: "C.UTF-8" }
                    : {}),
                },
                timeout: eL.SNAPSHOT_CREATION_TIMEOUT_MS,
                maxBuffer: eL.SNAPSHOT_MAX_BUFFER,
                encoding: "utf8",
                windowsHide: !0,
              },
              (eA, el, ed) => {
                eA
                  ? eu(Error(`Snapshot validation failed: ${eA.message}`))
                  : el.trim() || ed.trim()
                    ? eu(
                        Error(
                          `Snapshot validation must be silent. stdout=${el.trim() || "<empty>"}, stderr=${ed.trim() || "<empty>"}`,
                        ),
                      )
                    : ec();
              },
            );
          });
        }
        executeSnapshotScript(eA, el) {
          return new Promise((ec, eu) => {
            let ed = Date.now();
            this.logger.info?.(
              `Snapshot script exec start. shellPath=${eA}, timeoutMs=${eL.SNAPSHOT_CREATION_TIMEOUT_MS}, maxBuffer=${eL.SNAPSHOT_MAX_BUFFER}`,
            );
            let ep = (0, eD.execFile)(
              eA,
              ["-c", "-l", el],
              {
                env: {
                  ...(process.env.CODEBUDDY_CODE_DONT_INHERIT_ENV
                    ? {}
                    : process.env),
                  SHELL: eA,
                  GIT_EDITOR: "true",
                  CODEBUDDY: "1",
                  ...((0, eF.isWindows)()
                    ? { LANG: "C.UTF-8", LC_ALL: "C.UTF-8" }
                    : {}),
                },
                timeout: eL.SNAPSHOT_CREATION_TIMEOUT_MS,
                maxBuffer: eL.SNAPSHOT_MAX_BUFFER,
                encoding: "utf8",
                windowsHide: !0,
              },
              (el, ep, eg) => {
                let eh = Date.now() - ed,
                  ef = ep?.length || 0,
                  em = eg?.length || 0;
                el
                  ? (this.logger.error?.(
                      `Shell snapshot creation failed: ${el.message}`,
                    ),
                    this.logger.debug?.("Error details:"),
                    this.logger.debug?.(`  - Error code: ${el.code}`),
                    this.logger.debug?.(`  - Shell path: ${eA}`),
                    ep &&
                      this.logger.debug?.(
                        `stdout output (${ep.length} chars): ${ep}`,
                      ),
                    eg &&
                      this.logger.debug?.(
                        `stderr output (${eg.length} chars): ${eg}`,
                      ),
                    eu(el))
                  : (this.logger.info?.(
                      `Snapshot script exec finished. shellPath=${eA}, elapsedMs=${eh}, stdoutLen=${ef}, stderrLen=${em}`,
                    ),
                    eg?.trim() &&
                      this.logger.warn?.(
                        `Shell snapshot script produced stderr: ${eg.trim().slice(0, 500)}`,
                      ),
                    ep?.trim() &&
                      this.logger.debug?.(
                        `Shell snapshot script produced stdout: ${ep.trim().slice(0, 500)}`,
                      ),
                    ec());
              },
            );
            (this.logger.info?.(
              `Snapshot child process started. pid=${ep.pid ?? "unknown"}`,
            ),
              ep.unref?.());
          });
        }
        registerCleanupCallback(eA) {
          if (this.cleanupCallback) return;
          let cleanup = () => {
            try {
              ev().existsSync(eA) &&
                (ev().unlinkSync(eA),
                this.logger.debug?.(`Cleaned up session snapshot: ${eA}`));
            } catch (eA) {
              this.logger.debug?.(`Error cleaning up session snapshot: ${eA}`);
            }
          };
          (process.on("exit", cleanup),
            (this.cleanupCallback = () => {
              process.removeListener("exit", cleanup);
            }));
        }
      };
      (shell_snapshot_service_decorate(
        [
          (0, em.Autowired)(em.Logger),
          shell_snapshot_service_metadata(
            "design:type",
            "function" == typeof (ef = void 0 !== em.Logger && em.Logger)
              ? ef
              : Object,
          ),
        ],
        ez.prototype,
        "logger",
        void 0,
      ),
        shell_snapshot_service_decorate(
          [
            (0, em.PostConstruct)(),
            shell_snapshot_service_metadata("design:type", Function),
            shell_snapshot_service_metadata("design:paramtypes", []),
            shell_snapshot_service_metadata("design:returntype", void 0),
          ],
          ez.prototype,
          "init",
          null,
        ),
        (ez = shell_snapshot_service_decorate(
          [(0, em.Component)(eL.ShellSnapshotService)],
          ez,
        )));
    },
    35179(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          SNAPSHOT_CREATION_TIMEOUT_MS: () => eE,
          SNAPSHOT_DIR_NAME: () => ey,
          SNAPSHOT_MAX_BUFFER: () => eC,
          ShellSnapshotService: () => ew,
          generateSnapshotFileName: () => generateSnapshotFileName,
          getShellConfigFile: () => getShellConfigFile,
          getSnapshotDirectory: () => getSnapshotDirectory,
        }));
      var eu = ec(79896),
        ed = ec.n(eu),
        ep = ec(70857),
        eg = ec.n(ep),
        eh = ec(16928),
        ef = ec.n(eh),
        em = ec(44237);
      let eE = 1e4,
        eC = 1048576,
        ey = "shell-snapshots",
        ew = Symbol("ShellSnapshotService");
      function getShellConfigFile(eA) {
        let el;
        if (
          ((el =
            ("win32" === eg().platform() &&
              (process.env.HOME || process.env.USERPROFILE)) ||
            eg().homedir()),
          eA.includes("zsh"))
        ) {
          let eA = ef().join(el, ".zshrc");
          return {
            shellType: "zsh",
            configPath: eA,
            exists: ed().existsSync(eA),
          };
        }
        if (eA.includes("bash")) {
          for (let eA of [".bash_profile", ".bashrc", ".profile"]) {
            let ec = ef().join(el, eA);
            if (ed().existsSync(ec))
              return { shellType: "bash", configPath: ec, exists: !0 };
          }
          return {
            shellType: "bash",
            configPath: ef().join(el, ".bashrc"),
            exists: !1,
          };
        }
        let ec = ef().join(el, ".profile");
        return { shellType: "sh", configPath: ec, exists: ed().existsSync(ec) };
      }
      function getSnapshotDirectory(eA) {
        let el = eA || em.PathUtils.getHomeDir();
        return ef().join(el, ey);
      }
      function generateSnapshotFileName(eA) {
        let el = Date.now(),
          ec = Math.random().toString(36).substring(2, 8);
        return `snapshot-${eA}-${el}-${ec}.sh`;
      }
    },
    38590(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { WindowsProcessUtils: () => WindowsProcessUtils }));
      var eu = ec(35317);
      let WindowsProcessUtils = class WindowsProcessUtils {
        static killProcessTree(eA) {
          return new Promise((el, ec) => {
            let ed = (0, eu.spawn)(
              "taskkill",
              ["/pid", String(eA), "/f", "/t"],
              { stdio: "ignore", windowsHide: !0 },
            );
            (ed.on("exit", (eA) => {
              el();
            }),
              ed.on("error", (eA) => {
                ec(Error(`Failed to execute taskkill: ${eA.message}`));
              }));
          });
        }
        static killProcessTreeSync(eA) {
          try {
            (0, eu.execFileSync)("taskkill", ["/pid", String(eA), "/f", "/t"], {
              stdio: "ignore",
              windowsHide: !0,
              timeout: 5e3,
            });
          } catch {}
        }
        static isProcessAlive(eA) {
          try {
            return (0, eu.execFileSync)(
              "tasklist",
              ["/FI", `PID eq ${eA}`, "/NH", "/FO", "CSV"],
              {
                encoding: "utf8",
                stdio: ["ignore", "pipe", "pipe"],
                windowsHide: !0,
                timeout: 5e3,
              },
            ).includes(`"${eA}"`);
          } catch {
            return !1;
          }
        }
        static getChildProcesses(eA) {
          try {
            return (0, eu.execFileSync)(
              "wmic",
              [
                "process",
                "where",
                `ParentProcessId=${eA}`,
                "get",
                "ProcessId",
                "/format:csv",
              ],
              {
                encoding: "utf8",
                stdio: ["ignore", "pipe", "pipe"],
                windowsHide: !0,
                timeout: 5e3,
              },
            )
              .split("\n")
              .slice(1)
              .map((eA) => {
                let el = eA.trim().split(",");
                return el.length >= 2 ? parseInt(el[el.length - 1], 10) : NaN;
              })
              .filter((eA) => !isNaN(eA) && eA > 0);
          } catch {
            return [];
          }
        }
        static getDescendantProcesses(eA) {
          let el = [],
            ec = [eA];
          for (; ec.length > 0; ) {
            let eA = ec.shift();
            for (let eu of this.getChildProcesses(eA))
              el.includes(eu) || (el.push(eu), ec.push(eu));
          }
          return el;
        }
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
      throw Error("Explicit local shell parent module required: " + id);
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
  let nH = class {
    async execute(eA) {
      let el = await this.bashSandboxManager.wrapCommand(eA.command);
      return el === eA.command
        ? (this.logger.info?.(
            "[LegacySandboxShellService] wrapCommand returned original command (sandbox disabled or deps missing) → direct local execution",
          ),
          this.localShellService.execute(eA))
        : (this.logger.info?.(
            `[LegacySandboxShellService] executing wrapped command | original="${eA.command}" | wrapped="${el}"`,
          ),
          this.localShellService.execute({ ...eA, command: el }));
    }
    async disposeAll() {}
    getActiveHandleCount() {
      return 0;
    }
  };
  return { ...getModule(43522), LegacySandboxShellServiceImpl: nH, getModule };
}
