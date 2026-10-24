import { createNativeSandboxFinalization } from "../../src/sandbox/native-sandbox-finalization.js";
import { sandboxFinalizationFixture } from "./sandbox-finalization-scenarios.js";
import { createNativeSafeDelete } from "../../src/sandbox/native-safe-delete.js";
import { createNativeSecurityAudit } from "../../src/sandbox/native-security-audit.js";
import { safeDeleteVendorRoot } from "./safe-delete-fixture.js";
import * as nodeModule from "node:module";
import { createNativeSandboxShell } from "../../src/sandbox/native-sandbox-shell.js";
import { sandboxShellFixture } from "./sandbox-shell-fixture.js";
import { createNativeBashSandboxManager } from "../../src/sandbox/native-bash-sandbox-manager.js";
import { createCapturedSettingsConstants } from "../../src/vendor/captured-settings-constants.js";
import { createNativeSandboxRules } from "../../src/sandbox/native-sandbox-rules.js";
import { createNativeSandboxTurnConfig } from "../../src/sandbox/native-sandbox-turn-config.js";
import { createNativeSandboxServices } from "../../src/sandbox/native-sandbox-services.js";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as net from "node:net";
import * as crypto from "node:crypto";
import * as cp from "node:child_process";
import { once, EventEmitter } from "node:events";
import { sandboxCliFixture } from "./sandbox-cli-fixture.js";
import { createNativeSandboxCLI } from "../../src/sandbox/native-sandbox-cli.js";

/** Real child/socket boundary with an explicitly owned protocol peer, not the sandbox binary. */
export async function sandboxCliProcessScenario(
  factory = createNativeSandboxCLI,
  ruleFactory?: typeof createNativeSandboxRules,
  bashFactory?: typeof createNativeBashSandboxManager,
  ownedRoot?: string,
  shellFactory?: typeof createNativeSandboxShell,
  safeFactory = createNativeSafeDelete,
  auditFactory = createNativeSecurityAudit,
  finalizationFactory?: typeof createNativeSandboxFinalization,
) {
  const root =
    ownedRoot ?? fs.mkdtempSync(path.join(os.tmpdir(), "axonfire-sandbox-"));
  fs.mkdirSync(root, { recursive: true });
  const executable = path.join(root, "peer.cjs"),
    journal = path.join(root, "requests.jsonl");
  fs.writeFileSync(
    executable,
    `#!${process.execPath}\n` +
      String.raw`
const fs=require('node:fs'),net=require('node:net'),path=require('node:path');
const config=JSON.parse(process.argv[process.argv.indexOf('--config')+1]);
const address='/tmp/'+config.ipcAddress+'.sock',sockets=new Set();
const server=net.createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));let pending='';socket.on('data',chunk=>{pending+=chunk;let at;while((at=pending.indexOf('\n'))>=0){const line=pending.slice(0,at);pending=pending.slice(at+1);if(!line)continue;const m=JSON.parse(line);fs.appendFileSync(path.join(process.cwd(),'requests.jsonl'),JSON.stringify({command:m.command,data:m.data})+'\n');let data={echo:m.data};if(m.command==='RunExecutable')data={processId:'owned-process',pid:4242};if(m.command==='OpenSession')data={workingDir:process.cwd()+'/projection'};if(m.command==='QueryFileChanges')data={changes:[{relativePath:'.codebuddy/settings.json',changeType:'modified'},{relativePath:'src/file.ts',changeType:'modified'}]};if(m.command==='SyncFileChanges')data={totalChanges:m.data.paths.length,changes:m.data.paths.map(relativePath=>({relativePath,changeType:'modified'}))};socket.write(JSON.stringify({...m,success:true,data})+'\n');if(m.command==='ProcessWrite')setTimeout(()=>{for(const event of [{command:'ProcessOutput',data:{processId:'owned-process',stream:'stdout',data:Buffer.from('owned shell output').toString('base64')}},{command:'ProcessExit',data:{processId:'owned-process',exitCode:0,fileBlockRecords:[],networkBlockRecords:[{host:'blocked.example',port:443,scheme:'https',actionMask:1}]}}])socket.write(JSON.stringify({sessionId:m.sessionId,messageId:'reverse-'+event.command,...event})+'\n');},10);}});});
function stop(){for(const socket of sockets)socket.destroy();server.close(()=>{try{fs.unlinkSync(address)}catch{}process.exit(0)});}
process.on('SIGTERM',stop);server.listen(address,()=>process.stdout.write('owned-peer-ready\n'));
`,
    { mode: 0o700 },
  );
  const timers = new Set<any>(),
    immediates = new Set<any>(),
    children: cp.ChildProcess[] = [],
    pids = new Set<number>();
  const proc: any = Object.assign(new EventEmitter(), {
    title: "owned-node",
    argv: [],
    versions: process.versions,
    stdout: { columns: 80, rows: 24 },
    env: { SANDBOX_CLI_PATH: executable, PATH: process.env.PATH },
    platform: process.platform,
    arch: process.arch,
    execPath: process.execPath,
    pid: process.pid,
    cwd: () => root,
  });
  const seed = sandboxCliFixture();
  const parentConfig = createNativeSandboxTurnConfig();
  const sharedConfig = new parentConfig.SandboxTurnConfigImpl();
  const runtime = {
    ...seed.runtime,
    process: proc,
    Date,
    Math,
    setTimeout(callback: any, ms: number) {
      const h = setTimeout(() => {
        timers.delete(h);
        callback();
      }, ms);
      timers.add(h);
      return h;
    },
    clearTimeout(h: any) {
      timers.delete(h);
      clearTimeout(h);
    },
    setImmediate(callback: any) {
      const h = setImmediate(() => {
        immediates.delete(h);
        callback();
      });
      immediates.add(h);
      return h;
    },
    modules: {
      ...seed.runtime.modules,
      41695: parentConfig,
      70857: {
        homedir: () => root,
        platform: () => process.platform,
        tmpdir: () => path.join(root, "tmp"),
      },
      73024: fs,
      24618: createCapturedSettingsConstants(process.platform),
      16928: {
        ...path,
        resolve: (...parts: string[]) => path.resolve(root, ...parts),
      },
      93039: {
        PathUtils: {
          getHomeDir: () => root,
          getProjectHomeDir: () => path.join(root, "project"),
        },
      },
      69278: net,
      79896: fs,
      54601: crypto,
      35317: {
        spawn(exe: string, args: string[], opts: any) {
          assert.equal(exe, executable);
          const child = cp.spawn(exe, args, { ...opts, cwd: root });
          children.push(child);
          return child;
        },
      },
      44237: {
        PathUtils: { getRootPathSync: () => root, isBunCompiled: () => false },
      },
      80588: {
        registerSandboxCliPid: (p: number) => pids.add(p),
        unregisterSandboxCliPid: (p: number) => pids.delete(p),
      },
    },
  };
  let securityAudit: any;
  if (shellFactory) {
    const shellSeed = sandboxShellFixture(shellFactory);
    const mods: any = runtime.modules;
    for (const id of [80699, 93130, 23238, 5516])
      mods[id] = shellSeed.runtime.modules[id];
    mods[6453] = shellSeed.native.getModule(6453);
    fs.cpSync(
      path.join(safeDeleteVendorRoot, "shim"),
      path.join(root, "vendor", "shim"),
      { recursive: true },
    );
    proc.env.CODEBUDDY_HOST = "workbuddy-desktop";
    proc.env.CODEBUDDY_ENABLE_SECURITY_AUDIT = "1";
    mods[73339] = nodeModule;
    mods[44237].PathUtils.getHomeDir = () => root;
    mods[44237].PathUtils.getWorkDir = () => root;
    mods[35568] = safeFactory({
      ...runtime,
      __filename: path.join(root, "entry.cjs"),
      __dirname: root,
      Date: { now: () => 1000 },
      Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    }).safeDelete;
    class AuditDate extends Date {
      static now() {
        return 1000;
      }
    }
    securityAudit = mods[48973] = auditFactory({ ...runtime, Date: AuditDate });
  }
  if (finalizationFactory) {
    const parents = sandboxFinalizationFixture().runtime.modules;
    Object.assign(runtime.modules, {
      78213: parents[78213],
      99006: parents[99006],
      59255: parents[59255],
    });
  }
  const shellResults: any[] = [];
  const logger = { info() {}, warn() {}, error() {}, debug() {} };
  const services = createNativeSandboxServices({
    runtime,
    logger,
    sourceFactory: factory,
    ...(finalizationFactory
      ? { finalization: { sourceFactory: finalizationFactory } }
      : {}),
    ...(shellFactory
      ? {
          shell: {
            sourceFactory: shellFactory,
            workspace: { workspaceFolders: [{ uri: { fsPath: root } }] },
            sessionManager: {
              sessionSubject: { value: { id: "owned-session" } },
            },
            settingsManager: {
              list: async () => ({
                sandbox: { safeDeleteRuntimeEnabled: true },
              }),
            },
            localShellService: {
              execute: async () => {
                throw Error("Unexpected local fallback");
              },
            },
          },
        }
      : {}),
    turnConfig: sharedConfig,
    ...(bashFactory
      ? {
          bash: {
            sourceFactory: bashFactory,
            settingsManager: {
              list: async () => ({
                sandbox: {
                  network: { denyAll: true, allowedDomains: ["example.com"] },
                  filesystem: { allowWrite: ["."] },
                },
              }),
            },
          },
          rules: { ...(ruleFactory ? { sourceFactory: ruleFactory } : {}) },
        }
      : ruleFactory
        ? {
            rules: {
              sourceFactory: ruleFactory,
              bashSandboxManager: {
                getConfig: async () => ({
                  filesystem: { allowWrite: ["."] },
                  network: { denyAll: true, allowedDomains: ["example.com"] },
                }),
              },
            },
          }
        : {}),
  });
  const { client, processManager: manager, lifecycle }: any = services;
  if (bashFactory) {
    Object.assign(sharedConfig, { useSandboxCLI: true });
    assert.equal(services.bashManager.sandboxTurnConfig, sharedConfig);
    assert.equal(services.ruleSync.bashSandboxManager, services.bashManager);
    assert.equal((await services.bashManager.getConfig()).enabled, true);
  }
  assert.equal(services.namespaces.get(41695), parentConfig);
  assert.equal(
    services.bindings.get(parentConfig.SandboxTurnConfig),
    sharedConfig,
  );
  assert.equal(
    services.bindings.get(services.protocol.SandboxCLILifecycle),
    lifecycle,
  );
  assert.equal(
    services.namespaces.get(74674),
    services.native.getModule(74674),
  );
  async function executeOwnedShell(pty: boolean) {
    if (!services.shellService) return;
    assert.equal(services.shellService.lifecycle, lifecycle);
    assert.equal(services.shellService.turnConfig, sharedConfig);
    assert.equal(
      services.bindings.get(
        services.protocol.getModule(74674).SandboxShellService,
      ),
      services.shellService,
    );
    const handle = await services.shellService.execute({
      command: "owned-peer-command",
      rawCommand: true,
      usePty: pty,
    });
    try {
      handle.write("deliver-owned-output");
      const result = await handle.wait();
      assert.equal(result.stdout, "owned shell output");
      assert.equal(result.exitCode, 0);
      assert.equal(services.shellService.getActiveHandleCount(), 0);
      shellResults.push({ pty, result });
    } finally {
      handle.dispose();
    }
  }
  try {
    const start = Date.now();
    await lifecycle.ensureReady({
      sessionId: "owned-session",
      appHomeDir: root,
      autoProjection: true,
    });
    assert.ok(
      Date.now() - start >= 450,
      "original 500ms startup gate retained",
    );
    assert.equal(lifecycle.getReadyGeneration(), 1);
    if (services.ruleSync) {
      assert.equal(services.ruleSync.turnConfig, sharedConfig);
      await services.ruleSync.syncRulesOnTurnStart("owned-session", "default");
    }
    assert.equal(lifecycle.isProjectionActive(), true);
    assert.equal(client.isConnected(), true);
    assert.equal(manager.isRunning(), true);
    assert.equal(pids.size, 1);
    assert.deepEqual(
      await client.sendRequest("owned-session", "Echo", { answer: 42 }),
      { echo: { answer: 42 } },
    );
    await executeOwnedShell(false);
    // A real abrupt child termination exercises client disconnect and original lifecycle restart.
    const first = children[0]!;
    const exited = once(first, "close");
    first.kill("SIGKILL");
    await exited;
    await new Promise<void>((r) => setImmediate(r));
    await lifecycle.ensureAlive();
    assert.equal(children.length, 2);
    assert.equal(lifecycle.getReadyGeneration(), 2);
    if (services.ruleSync) {
      Object.assign(sharedConfig, { permissionMode: "fullAccess" });
      await services.ruleSync.syncRulesOnTurnStart("owned-session");
    }
    assert.equal(manager.isRunning(), true);
    await executeOwnedShell(true);
    await services.shellService?.disposeAll();
    if (finalizationFactory) {
      Object.assign(sharedConfig, {
        enableProjection: true,
        enableVersionControl: true,
        enableFileBackup: true,
      });
      const session = {
        id: "owned-session",
        history: { message: "owned finalization" },
        phaseSubject: { next() {} },
      };
      assert.equal(services.hooks.length, 3);
      for (const hook of services.hooks)
        assert.equal(hook.sandboxLifecycle, lifecycle);
      await services.hooks[0].execute({ session });
      await services.hooks[1].execute({ session });
      await services.hooks[2].execute({ session, reason: "shutdown" });
      assert.equal(manager.isRunning(), true);
      await services.hooks[2].execute({ session, reason: "clear" });
    } else await lifecycle.stop();
    assert.equal(pids.size, 0);
    assert.equal(client.isConnected(), false);
    assert.equal(manager.isRunning(), false);
    assert.equal(proc.listenerCount("exit"), 0);
    const requests = fs
      .readFileSync(journal, "utf8")
      .trim()
      .split("\n")
      .map((s) => JSON.parse(s));
    const ruleRequests = requests.filter(
      (x) => x.command === "SetFileRules" || x.command === "SetNetworkRules",
    );
    if (ruleFactory) {
      assert.equal(ruleRequests.length, 4);
      assert.deepEqual(
        ruleRequests[1].data.rules.map((r: any) => r.endpoint),
        ["example.com", "*.example.com", "*"],
      );
      assert.deepEqual(ruleRequests[3].data.rules, []);
    }
    if (services.shellService) {
      const runs = requests.filter((x) => x.command === "RunExecutable");
      assert.equal(runs.length, 2);
      for (const run of runs) {
        assert.match(run.data.env.NODE_OPTIONS, /genie-safe-delete.cjs/);
        assert.equal(run.data.env.CODEBUDDY_SAFE_DELETE_SANDBOX, "1");
      }
      assert.equal(
        securityAudit.readSecurityAuditLogForTest().entries.length,
        2,
      );
    }
    if (finalizationFactory) {
      assert.equal(
        requests.filter((x) => x.command === "CommitFileChanges").length,
        1,
      );
      assert.equal(
        requests.filter((x) => x.command === "CommitModifyBackup").length,
        1,
      );
    }
    const sync = requests.find((x) => x.command === "SyncFileChanges");
    assert.deepEqual(sync.data.paths, [
      ".codebuddy/settings.json",
      "src/file.ts",
    ]);
    return {
      shellResults,
      auditEntries: securityAudit?.readSecurityAuditLogForTest().entries ?? [],
      shellRequests: requests.filter(
        (x) => x.command === "RunExecutable" || x.command === "ProcessWrite",
      ),
      generations: lifecycle.getReadyGeneration(),
      processes: children.length,
      commands: requests.map((x) => x.command),
      rules: ruleRequests,
      synced: sync.data.paths,
      closed: !client.isConnected() && !manager.isRunning(),
    };
  } finally {
    await services.shellService?.disposeAll();
    await client.disconnect();
    await manager.stop();
    for (const child of children)
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, "close");
        child.kill("SIGKILL");
        await exited;
      }
    for (const timer of timers) clearTimeout(timer);
    for (const immediate of immediates) clearImmediate(immediate);
    // The killed owned peer may leave its random socket; recover addresses from the process args.
    for (const child of children) {
      const args = child.spawnargs;
      const at = args.indexOf("--config");
      if (at >= 0) {
        const addr = JSON.parse(args[at + 1]!).ipcAddress;
        try {
          fs.unlinkSync("/tmp/" + addr + ".sock");
        } catch {}
      }
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
}
