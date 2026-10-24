import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installNativeProcessLifecycle } from "../../src/runtime/native-process-lifecycle.js";
import { createNativeSafeExit } from "../../src/runtime/native-safe-exit.js";
/** Real owned Node process receives SIGTERM; no installed application is launched. */
export async function processLifecycleChild(
  factory = installNativeProcessLifecycle,
  safeFactory = createNativeSafeExit,
) {
  const root = mkdtempSync(join(tmpdir(), "axonfire-exit-")),
    entry = join(root, "child.mjs"),
    journal = join(root, "calls.json");
  let fixture = new URL("./process-lifecycle-scenarios.js", import.meta.url);
  if (!existsSync(fixture))
    fixture = new URL("./process-lifecycle-scenarios.ts", import.meta.url);
  writeFileSync(
    entry,
    `import {processLifecycleFixture} from ${JSON.stringify(fixture.href)};
 import fs from 'node:fs';
 // Preserve the naming helper emitted by tsx when serializing its functions.
 const __name=(target,value)=>Object.defineProperty(target,'name',{value,configurable:true});
 const f=processLifecycleFixture();
 const runtime={...f.runtime,process,console,setTimeout,clearTimeout,setInterval,clearInterval,Date};
 runtime.modules[36648]=(${safeFactory.toString()})(runtime);
 (${factory.toString()})(runtime);
 process.on('exit',()=>fs.writeFileSync(${JSON.stringify(journal)},JSON.stringify(f.calls)));
 setInterval(()=>{},1000);process.stdout.write('owned-ready\\n');`,
  );
  const child = spawn(process.execPath, ["--import", "tsx", entry], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr!.on("data", (x) => (stderr += x));
  const closed = once(child, "close");
  let timeout: any;
  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        let output = "";
        child.stdout!.on("data", (x) => {
          output += x;
          if (output.includes("owned-ready\n")) resolve();
        });
        child.once("exit", () =>
          reject(Error("Child exited before readiness: " + stderr)),
        );
      }),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(Error("Child readiness timeout: " + stderr)),
          10000,
        );
      }),
    ]);
    clearTimeout(timeout);
    child.kill("SIGTERM");
    const [code, signal] = await Promise.race([
      closed,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(Error("Child exit timeout: " + stderr)),
          10000,
        );
      }),
    ]);
    clearTimeout(timeout);
    assert.equal(code, 0, stderr);
    assert.equal(signal, null);
    const calls = JSON.parse(readFileSync(journal, "utf8"));
    assert.deepEqual(
      calls.map((x: any) => x[0]),
      [
        "store",
        "logs",
        "telemetry.flush",
        "snapshot",
        "shell",
        "pty",
        "child",
        "poller.stop",
        "members.destroy",
        "team.delete",
        "team.cleanup",
        "session.end",
        "telemetry.shutdown",
        "kill",
        "logs",
      ],
    );
    return { code, signal, calls };
  } finally {
    clearTimeout(timeout);
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
      await closed;
    }
    rmSync(root, { recursive: true, force: true });
  }
}
