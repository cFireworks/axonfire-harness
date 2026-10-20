#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { createHarness } from "./runtime/create-harness.js";
import { PermissionMode } from "./permissions/permission.js";
import { runStandaloneTeammate } from "./runtime/run-standalone-teammate.js";
import { CommandMessageUtils } from "./commands/command-message-utils.js";

const HELP = `WorkBuddy 5.3.14 harness reconstruction (standalone host, incomplete product coverage)

Usage: npm run cli -- [options]
  -p, --print <prompt>         Run once, stream text, then exit
  --cwd <directory>            Tool working directory (default: current directory)
  --state-dir <directory>      JSONL storage (default: <cwd>/.workbuddy-harness)
  --model <id>                 Product model id/alias or compatible custom model
  --fallback-model <model>     Automatic fallback when overloaded (only works with --print)
  --team-backend <name>        in-process (default) or detached-process (host override)
  --base-url <url>             Explicit Chat Completions base URL
  --web-endpoint <url>         Explicit product WebFetch/WebSearch service URL (host adapter)
  --media-endpoint <url>       Explicit product image/video service URL (host adapter)
  --resume <session-id>        Load a saved transcript
  --max-turns <number>         SDK run turn limit (default: product/environment)
  --permission-mode <mode>     default, plan or bypassPermissions (explicit unrestricted tools)
  --allow-tools <names>        Comma-separated names approved by this CLI host
  --memory-extraction          Enable recovered background memory extraction
  --prompt-vars-file <file>    Version-1 primitive variables; cannot override built-ins
  --plugin-dir <directory>     Load an explicit trusted local plugin (repeatable)
  --builtin-assets <root>      Trusted root containing plugins/workbuddy-builtin
  --settings <json-or-file>    Original CLI settings provider (JSONC supported)
  --setting-sources <list>     user,project,local or none; CLI settings still apply
  --effort <level>             minimal, low, medium, high, xhigh, max
  -h, --help                   Show this help (no credentials/network needed)

Credentials: CODEBUDDY_API_KEY or OPENAI_API_KEY.
Endpoint: --base-url, CODEBUDDY_BASE_URL or OPENAI_BASE_URL (no implicit remote).
Record: CODEBUDDY_RECORD_DIR; replay offline: CODEBUDDY_REPLAY_DIR (no credentials needed).
Recording overwrites recording.jsonl on first use and stores raw requests/responses.
Replay executes recorded tool calls with normal host approval; it is not a dry run.
Web service token: WORKBUDDY_HARNESS_WEB_ACCESS_TOKEN (separate from model key).
Media service token: WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN (separate from model key).
No installed WorkBuddy credentials are read. SDK tracing is disabled by this host.
Local /workflows and /save-workflow work in both print and interactive modes.
Without -p, use interactive /exit, /session, /compact. Non-TTY tools require
--allow-tools or explicit bypassPermissions; default denies unapproved tools.
`;

export async function main(args = process.argv.slice(2)): Promise<void> {
  const { values } = parseArgs({ args, options: {
    print: { type: "string", short: "p" }, help: { type: "boolean", short: "h" },
    cwd: { type: "string" }, "state-dir": { type: "string" }, model: { type: "string" }, "fallback-model": { type: "string" }, "base-url": { type: "string" }, "web-endpoint": { type: "string" }, "media-endpoint": { type: "string" },
    resume: { type: "string" }, "max-turns": { type: "string" }, "permission-mode": { type: "string" },
    "allow-tools": { type: "string" }, "memory-extraction": { type: "boolean" }, "prompt-vars-file": { type: "string" }, "plugin-dir": { type: "string", multiple: true }, "builtin-assets":{type:"string"},
    "team-backend": { type: "string" }, serve: { type: "boolean" }, "teammate-mode": { type: "boolean" },
    settings:{type:"string"},"setting-sources":{type:"string"},effort:{type:"string"},
    "team-name": { type: "string" }, "agent-name": { type: "string" }, "agent-type": { type: "string" }, "agent-color": { type: "string" },
    "parent-session-id": { type: "string" }, "leader-endpoint": { type: "string" },
    "dangerously-skip-permissions": { type: "boolean", short: "y" },
  } });
  if (values.help) { process.stdout.write(HELP); return; }
  const apiKey = process.env.CODEBUDDY_API_KEY ?? process.env.OPENAI_API_KEY;
  const baseURL = values["base-url"] ?? process.env.CODEBUDDY_BASE_URL ?? process.env.OPENAI_BASE_URL;
  const model = values.model ?? process.env.CODEBUDDY_MODEL;
  const fallbackModel=values["fallback-model"];
  const nativePlugins=values['plugin-dir']||values['builtin-assets']?{...(values['plugin-dir']?{directories:values['plugin-dir']}:{}),...(values['builtin-assets']?{builtinSeed:{assetsRoot:resolve(values['builtin-assets'])}}:{})}:undefined;
  const webEndpoint = values["web-endpoint"], webAccessToken = process.env.WORKBUDDY_HARNESS_WEB_ACCESS_TOKEN;
  const mediaEndpoint = values["media-endpoint"], mediaAccessToken = process.env.WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN;
  if (mediaEndpoint && !["http:", "https:"].includes(new URL(mediaEndpoint).protocol)) throw new Error("--media-endpoint must use HTTP or HTTPS");
  if (webEndpoint && !["http:", "https:"].includes(new URL(webEndpoint).protocol)) throw new Error("--web-endpoint must use HTTP or HTTPS");
  if (values["teammate-mode"]) {
    await runStandaloneTeammate(args, { workDir: resolve(values.cwd ?? process.cwd()),
      ...(nativePlugins?{nativePlugins}:{}),
      nativeSettings:{cliOptions:{...(values.settings!==undefined?{settings:values.settings}:{}),...(values["setting-sources"]!==undefined?{settingSources:values["setting-sources"]}:{}),...(values.effort!==undefined?{effort:values.effort}:{})}},
      ...(mediaEndpoint || mediaAccessToken ? { mediaTools: { ...(mediaEndpoint ? { endpoint: mediaEndpoint } : {}), ...(mediaAccessToken ? { accessToken: mediaAccessToken } : {}) } } : {}),
      ...(webEndpoint || webAccessToken ? { webTools: { ...(webEndpoint ? { endpoint: webEndpoint } : {}), ...(webAccessToken ? { accessToken: webAccessToken } : {}) } } : {}),
      ...(values["state-dir"] ? { stateDir: resolve(values["state-dir"]) } : {}),
      ...(apiKey ? { apiKey } : {}), ...(baseURL ? { baseURL } : {}), ...(model ? { model } : {}), logger: { warn: (message) => process.stderr.write(`${message}\n`) },
    }); return;
  }
  if (values.serve) throw new Error("Standalone --serve only implements --teammate-mode, not the full product Gateway");
  const teamBackend = values["team-backend"];
  if (teamBackend !== undefined && teamBackend !== "in-process" && teamBackend !== "detached-process") throw new Error("--team-backend must be in-process or detached-process");
  if (values.print === undefined && !process.stdin.isTTY) throw new Error("Interactive mode requires a TTY; use -p <prompt>.");
  const mode = values["permission-mode"];
  if (mode !== undefined && mode !== PermissionMode.Default && mode !== PermissionMode.Plan && mode !== PermissionMode.BypassPermissions) throw new Error("Standalone host currently supports permission modes default, plan and bypassPermissions only.");
  const maxTurns = values["max-turns"] === undefined ? undefined : Number(values["max-turns"]);
  if (maxTurns !== undefined && (!Number.isInteger(maxTurns) || maxTurns <= 0)) throw new Error("--max-turns must be a positive integer");
  const allowed = new Set((values["allow-tools"] ?? "").split(",").map((name) => name.trim()).filter(Boolean));
  let readline: ReturnType<typeof createInterface> | undefined;
  let approvals: Promise<unknown> = Promise.resolve();
  const runtime = await createHarness({
    workDir: resolve(values.cwd ?? process.cwd()),
    nativeSettings:{cliOptions:{...(values.settings!==undefined?{settings:values.settings}:{}),...(values["setting-sources"]!==undefined?{settingSources:values["setting-sources"]}:{}),...(values.effort!==undefined?{effort:values.effort}:{})}},
    ...(nativePlugins?{nativePlugins}:{}),
    ...(mediaEndpoint || mediaAccessToken ? { mediaTools: { ...(mediaEndpoint ? { endpoint: mediaEndpoint } : {}), ...(mediaAccessToken ? { accessToken: mediaAccessToken } : {}) } } : {}),
    ...(values["state-dir"] ? { stateDir: resolve(values["state-dir"]) } : {}),
    ...(apiKey ? { apiKey } : {}), ...(baseURL ? { baseURL } : {}), ...(model ? { model } : {}),
    ...(fallbackModel!==undefined?{fallbackModel}:{}),
    ...(teamBackend ? { teamBackend } : {}),
    ...(webEndpoint || webAccessToken ? { webTools: { ...(webEndpoint ? { endpoint: webEndpoint } : {}), ...(webAccessToken ? { accessToken: webAccessToken } : {}) } } : {}),
    memoryExtraction: values["memory-extraction"] === true,
    onScheduledOutput: (output) => { if (output) process.stdout.write(`\n${output}\n`); },
    ...(values["prompt-vars-file"] ? { promptVarsFile: values["prompt-vars-file"] } : {}),
    logger: { warn: (message) => process.stderr.write(`${message}\n`), info: (message) => process.stderr.write(`${message}\n`) },
    approveTool(name, input, session) {
      if (allowed.has(name)) return true;
      if (!readline) { process.stderr.write(`Permission denied for ${name}; use --allow-tools for explicit approval.\n`); return false; }
      const inputReader = readline;
      const decision = approvals.then(async () => {
        session.abortSignal.throwIfAborted();
        const answer = await inputReader.question(`Allow ${name} ${JSON.stringify(input)}? [y/N] `, { signal: session.abortSignal });
        return /^y(?:es)?$/i.test(answer.trim());
      });
      approvals = decision.catch(() => undefined);
      return decision;
    },
    askUserQuestion(input, session) {
      const reader = readline;
      if (!reader) return undefined;
      const decision = approvals.then(async () => {
        const answers: Record<string, string> = {};
        for (const question of input.questions) {
          session.abortSignal.throwIfAborted();
          process.stderr.write(`${question.header}: ${question.question}\n`);
          question.options.forEach((option, index) => process.stderr.write(`  ${index + 1}. ${option.label} — ${option.description}\n`));
          const value = (await reader.question("Answer (number or free text; /skip, /done, /chat): ", { signal: session.abortSignal })).trim();
          if (value === "/skip" || value === "/done" || value === "/chat") return { _action: value === "/skip" ? "skip_question" : value === "/done" ? "skip_interview" : "chat_about_this" };
          const positions = question.multiSelect ? value.split(",").map((part) => Number(part.trim())) : [Number(value)];
          answers[question.question] = value && positions.every((position) => Number.isInteger(position) && position > 0 && position <= question.options.length)
            ? positions.map((position) => question.options[position - 1]!.label).join(", ") : value;
        }
        return answers;
      });
      approvals = decision.catch(() => undefined);
      return decision;
    },
  });
  if (process.stdin.isTTY && values.print === undefined) readline = createInterface({ input: process.stdin, output: process.stderr,history:(await runtime.inputHistory.getHistoryForProject()).map((item:any)=>item.display).reverse() });
  let current: AbortController | undefined;
  const cancel = () => { if (current) current.abort(); else readline?.close(); };
  process.on("SIGINT", cancel);
  readline?.on("SIGINT", cancel);
  try {
    const session = await runtime.openSession(values.resume, { print: values.print !== undefined, ...(mode ? { permissionMode: mode as PermissionMode } : {}) });
    process.stderr.write(`Session: ${session.id}\n`);
    const run = async (prompt: string) => {
      const command = runtime.commandManager.parseCommand(prompt);
      if (command && !runtime.commandManager.isOverriddenByCustom(command.name)) {
        const start = session.history.length;
        await runtime.sessions.run(session, () => runtime.commandManager.executeLocalCommand({ ...command, session }));
        await runtime.sessions.flushHistory(session);
        for (const item of session.history.slice(start)) if (item.type === "message" && item.role === "user") {
          const content = typeof item.content === "string" ? item.content : item.content.filter((part) => part.type === "input_text").map((part) => part.text).join("\n");
          const output = CommandMessageUtils.parseOutput(content); if (output !== undefined) process.stdout.write(`${output.text}\n`);
        }
        return;
      }
      current = new AbortController();
      let streamed = false;
      try {
        const answer = await runtime.prompt(session, prompt, { signal: current.signal,
          ...(maxTurns !== undefined ? { maxTurns } : {}),
          onText: (text) => { streamed = true; process.stdout.write(text); },
        });
        if (!streamed && answer) process.stdout.write(answer);
        process.stdout.write("\n");
      } finally { current = undefined; }
    };
    if (values.print !== undefined) { await run(values.print); return; }
    while (readline) {
      let line: string;
      try { line = (await readline.question("> ")).trim(); } catch { break; }
      if (!line) continue;
      try {await runtime.inputHistory.addHistory({display:line,pastedContents:{}});} catch(error) {process.stderr.write(`Failed to save input history: ${String(error)}\n`);}
      if (line === "/exit" || line === "/quit") break;
      if (line === "/session") { process.stderr.write(`${session.id}\n`); continue; }
      if (line === "/compact") {
        await runtime.compact(session);
        process.stderr.write("Compaction settled.\n"); continue;
      }
      try { await run(line); }
      catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); }
    }
  } finally {
    process.removeListener("SIGINT", cancel);
    readline?.close();
    await runtime.close();
  }
}

main().catch((error) => {
  process.stderr.write(`Harness error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
