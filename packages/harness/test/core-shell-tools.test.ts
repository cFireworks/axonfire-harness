import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { HarnessSession } from "../src/sessions/session.js";
import {
  CoreShellTools,
  DEFAULT_BASH_MAX_TIMEOUT_MS,
  DEFAULT_BASH_TIMEOUT_MS,
  bashParameters,
  powershellParameters,
} from "../src/tools/core-shell-tools.js";

test("Bash and PowerShell schemas preserve recovered defaults and fields", () => {
  const bash = bashParameters.parse({ command: "pwd" });
  assert.equal(bash.command, "pwd");
  assert.equal(bash.run_in_background, undefined);
  assert.deepEqual(Object.keys(bashParameters.shape), [
    "command",
    "timeout",
    "description",
    "run_in_background",
    "dangerouslyDisableSandbox",
  ]);
  assert.deepEqual(Object.keys(powershellParameters.shape), [
    "command",
    "timeout",
    "description",
    "run_in_background",
    "dangerouslyDisableSandbox",
  ]);
  assert.equal(DEFAULT_BASH_TIMEOUT_MS, 120_000);
  assert.equal(DEFAULT_BASH_MAX_TIMEOUT_MS, 600_000);
});

test("Bash foreground result matches observable WorkBuddy envelope", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-bash-"));
  const session = new HarnessSession("shell-session", {
    conversationRequestId: "conversation-1",
  });
  const tools = new CoreShellTools({ workDir: directory });
  const result = await tools.bash(
    {
      command:
        'printf "%s|%s|%s" "$CODEBUDDY_PROJECT_DIR" "$CODEBUDDY_SESSION_ID" "$CODEBUDDY_CONVERSATION_REQUEST_ID"',
      timeout: 2_000,
    },
    session,
  );
  assert.match(result.content, /^Command: printf/);
  assert.match(result.content, new RegExp(`${directory}\\|shell-session\\|conversation-1`));
  assert.match(result.content, /Stderr: \(empty\)/);
  assert.match(result.content, /Exit Code: 0/);
  assert.equal(result.rawResponse?.tool_error_code, "Success");
});

test("Bash nonzero exit produces structured error metadata", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-bash-error-"));
  const tools = new CoreShellTools({ workDir: directory });
  const result = await tools.bash(
    { command: "echo failed >&2; exit 7", timeout: 2_000 },
    new HarnessSession("error-session"),
  );
  assert.match(result.content, /Stderr: failed/);
  assert.match(result.content, /Exit Code: 7/);
  assert.equal(result.rawResponse?.is_error, true);
  assert.equal(
    result.rawResponse?.tool_error_code,
    "ExecuteCommandExitCodeError",
  );
});

test("Bash explicit background task can be inspected and completes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-bash-bg-"));
  const tools = new CoreShellTools({ workDir: directory });
  const result = await tools.bash(
    {
      command: "sleep 0.03; echo background-finished",
      run_in_background: true,
    },
    new HarnessSession("bg-session"),
  );
  assert.match(result.content, /run_in_background=true/);
  const id = result.content.match(/task_id: ([A-Za-z0-9]{6})/)?.[1];
  assert.ok(id);
  assert.equal(tools.backgroundTasks.get(id)!.status, "running");
  await waitForBackgroundTask(tools, id);
  const output = tools.backgroundTasks.output(id);
  assert.match(output.content, /Status: completed/);
  assert.match(output.content, /background-finished/);
});

test("Bash foreground timeout promotes eligible command without killing it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-bash-timeout-"));
  const tools = new CoreShellTools({ workDir: directory });
  const result = await tools.bash(
    { command: "printf start; sleep 0.04; printf done", timeout: 5 },
    new HarnessSession("timeout-session"),
  );
  assert.match(result.content, /Auto-backgrounded after hitting foreground timeout/);
  const id = result.content.match(/task_id: ([A-Za-z0-9]{6})/)?.[1];
  assert.ok(id);
  await waitForBackgroundTask(tools, id);
  assert.match(tools.backgroundTasks.output(id).content, /startdone/);
});

async function waitForBackgroundTask(tools: CoreShellTools, id: string): Promise<void> {
  // Process startup may exceed 80ms under the full suite's concurrent load.
  // Wait for the task's actual completion, without changing runtime timers.
  const deadline = Date.now() + 5_000;
  while (tools.backgroundTasks.get(id)!.status === "running") {
    if (Date.now() >= deadline) {
      await tools.backgroundTasks.kill(id);
      assert.fail(`Background fixture ${id} did not finish within 5 seconds`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

test("print mode blocks background and non-Windows rejects PowerShell", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-shell-policy-"));
  const tools = new CoreShellTools({ workDir: directory });
  const session = new HarnessSession("print-session", {
    options: { print: true },
  });
  const blocked = await tools.bash(
    { command: "echo no", run_in_background: true },
    session,
  );
  assert.match(blocked.content, /not supported in print mode/);
  assert.equal(
    blocked.rawResponse?.tool_error_code,
    "ExecuteCommandBackgroundUnsupportedError",
  );
  if (process.platform !== "win32") {
    const powershell = await tools.powerShell(
      { command: "Get-Location" },
      new HarnessSession("ps-session"),
    );
    assert.match(powershell.content, /only available on Windows/);
  }
});
