// Owns the reconstructed product process; no product services are substituted.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export async function startNativeProductProcess({
  cwd,
  env = process.env,
  timeout = 15000,
  args = [],
} = {}) {
  const child = spawn(
    process.execPath,
    [
      fileURLToPath(new URL("../cli/native.mjs", import.meta.url)),
      "--serve",
      ...args,
    ],
    {
      cwd,
      env: {
        ...env,
        AXONFIRE_PORT: "0",
        SERVER__PORT: "",
        SERVER__HOST: "127.0.0.1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let exited = false;
  const exit = new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      exited = true;
      resolve({ code, signal });
    });
    child.once("error", () => {
      exited = true;
      resolve({ code: null, signal: null });
    });
  });
  let closePromise;
  function close() {
    return (closePromise ??= (async () => {
      if (!exited) child.kill("SIGTERM");
      const timer = setTimeout(() => {
        if (!exited) child.kill("SIGKILL");
      }, 3000);
      try {
        return await exit;
      } finally {
        clearTimeout(timer);
      }
    })());
  }
  child.stderr.resume(); // Product logs may contain private configuration; never forward them to the browser.
  try {
    const origin = await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(
        () => reject(new Error("Native product startup timed out")),
        timeout,
      );
      const failed = () => {
        clearTimeout(timer);
        reject(new Error("Native product exited before readiness"));
      };
      child.once("error", failed);
      child.once("exit", failed);
      child.stdout.on("data", (chunk) => {
        output = (output + chunk.toString()).slice(-16384);
        const match = output.match(/Endpoint\s+(http:\/\/127\.0\.0\.1:\d+)/);
        if (match) {
          clearTimeout(timer);
          resolve(match[1]);
        }
      });
    });
    return { origin, close, exit };
  } catch (error) {
    await close();
    throw error;
  }
}
