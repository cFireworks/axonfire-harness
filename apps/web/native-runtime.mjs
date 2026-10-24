// Browser interface over the complete original SessionManager and code backend.
import { join, delimiter } from "node:path";
import { realpath } from "node:fs/promises";
import * as os from "node:os";
import { randomUUID } from "node:crypto";
import { startNativeOwnedRuntime } from "./native-owned-runtime.mjs";
import { createNativeSessionManager } from "@axonfire/harness/sessions/native-session-manager.js";
import { createNativeCodeSessionBackend } from "@axonfire/harness/terminal/native-code-session-backend.js";

export async function createNativeWebRuntime(options) {
  const workDir = await realpath(options.workDir);
  const args = [];
  const cli = options.nativeSettings?.cliOptions ?? {};
  for (const [key, flag] of [
    ["settings", "--settings"],
    ["settingSources", "--setting-sources"],
    ["effort", "--effort"],
  ])
    if (cli[key] !== undefined) args.push(flag, String(cli[key]));
  if (options.nativePlugins?.directories?.length)
    args.push("--plugin-dir", ...options.nativePlugins.directories);
  if (options.nativePlugins?.builtinSeed)
    throw new Error(
      "Native Web requires product-managed resource configuration",
    );
  const native = await startNativeOwnedRuntime({
    cwd: workDir,
    hosted: true,
    env: {
      ...(options.env ?? process.env),
      ...(options.stateDir ? { AXONFIRE_STATE_DIR: options.stateDir } : {}),
    },
  });
  try {
    return composeNativeWebRuntime(options, native, args, workDir);
  } catch (error) {
    await native.close();
    throw error;
  }
}

export function composeNativeWebRuntime(options, native, args, workDir) {
  const logger = { log() {}, debug() {}, info() {}, warn() {}, error() {} };
  const scopedProcess = Object.create(process);
  scopedProcess.env = native.cliEnv;
  const original = createNativeCodeSessionBackend({
    process: scopedProcess,
    os: { ...os, homedir: () => native.cliEnv.HOME ?? os.homedir() },
    gateway: native.gateway,
    console: logger,
  });
  // User CLI options belong to this host's launch boundary; original backend arguments stay intact.
  const runtimeManager = new Proxy(native.manager, {
    get(target, key) {
      if (key === "createSession")
        return (params) =>
          target.createSession({ ...params, args: [...params.args, ...args] });
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const pool =
    native.prewarmPool &&
    new Proxy(native.prewarmPool, {
      get(target, key) {
        if (key === "tryAcquire")
          return (...params) => {
            const lease = target.tryAcquire(...params);
            if (!lease) return lease;
            return {
              ...lease,
              activate: (params) =>
                lease.activate({ ...params, args: [...params.args, ...args] }),
            };
          };
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  const backend = new original.CodeBuddyCodeBackend(runtimeManager, {
    logger,
    cliPrewarmPool: pool,
    processExecPath: process.execPath,
    resolveCliPath: () => native.cliPath,
    getConfigDir: () => native.configRoot,
    getUserDataDir: () => join(native.configRoot, "app"),
    getSystemLocale: () => "en-US",
    // This browser host has product-managed resources, not an installed Desktop asset tree.
    // Keep the original managed-env builder while forwarding the configured CLI environment.
    buildEnv:
      native.buildSessionEnv ??
      ((extra) =>
        native.buildAgentCliRuntimeEnv({
          configDir: native.configRoot,
          builtinSkillsDir: native.cliEnv.CODEBUDDY_BUILTIN_SKILLS_DIR ?? "",
          processEnv: native.cliEnv,
          pathDelimiter: delimiter,
          extra: { ...native.cliEnv, ...extra },
        })),
  });
  const { SessionManager } = createNativeSessionManager({ console: logger });
  const controller = new SessionManager();
  controller.initialize({
    createBackend: (params) => backend.create(params),
    logger,
    // Preserve explicit browser/product configuration. Desktop mode defaults are not browser options.
    runtimeConfigResolver: {
      resolveConfig: ({ desiredConfig }) => ({ ...desiredConfig }),
    },
  });
  native.accountHost?.bindHostedCliRuntime({
    runtimeManager: native.manager,
    prewarmPool: native.prewarmPool,
    sessionManager: controller,
    agentBackend: backend,
  });
  let active,
    closing = false,
    closePromise;
  const abort = new AbortController();
  const commands = new Map();
  const interactions = new Map();
  async function rest(path) {
    const endpoint = await native.manager.getHostEndpoint();
    const url = new URL(path, new URL(endpoint).origin);
    url.searchParams.set("cwd", workDir);
    const response = await fetch(url, {
      headers: { "x-codebuddy-request": "1", ...native.requestHeaders },
      signal: abort.signal,
    });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error("Native session request failed");
    return (await response.json()).data;
  }
  async function answerInput(event, session) {
    if (event.type === "elicitationRequest") {
      const answer = await options.elicit?.(event.request, session);
      if (session.abortSignal.aborted) return;
      await controller.respondElicitation(
        session.id,
        event.elicitationId,
        answer?.action ?? "cancel",
        answer?.content,
      );
      return;
    }
    const permission = event.type === "permissionRequest";
    const params = event.request;
    const name = permission
      ? (params.toolCall?._meta?.["codebuddy.ai/toolName"] ?? "Tool")
      : "AskUserQuestion";
    const input = permission ? (params.toolCall?.rawInput ?? {}) : params;
    if (name === "AskUserQuestion") {
      const toolCallId = permission
        ? params.toolCall.toolCallId
        : event.toolCallId;
      const answers = await options.askUserQuestion?.(input, session);
      if (session.abortSignal.aborted) return;
      if (answers && Object.keys(answers).length)
        await controller.answerQuestion(session.id, toolCallId, answers);
      else
        await controller.cancelQuestion(
          session.id,
          toolCallId,
          "User skipped question",
        );
      return;
    }
    const meta = params.toolCall?._meta;
    const context =
      meta?.["codebuddy.ai/sandboxIntercept"] === true
        ? {
            sandbox: true,
            bypass: meta["codebuddy.ai/bypassHint"] === true,
            target:
              typeof meta["codebuddy.ai/target"] === "string"
                ? meta["codebuddy.ai/target"]
                : undefined,
          }
        : undefined;
    const approved = await options.approveTool?.(name, input, session, context);
    if (session.abortSignal.aborted) return;
    const option =
      params.options?.find(
        (option) =>
          option.kind === (approved === true ? "allow_once" : "reject_once"),
      ) ??
      params.options?.find((option) =>
        (approved === true
          ? ["allow_once", "allow"]
          : ["deny", "reject"]
        ).includes(option.optionId),
      );
    if (option)
      await controller.respondToPermission(
        session.id,
        event.requestId,
        option.optionId,
      );
    else
      await controller.rejectPermission(
        session.id,
        event.requestId,
        "No matching permission option",
      );
  }
  controller.setEventSink((channel, event) => {
    if (channel !== "session:event:" + event.sessionId) return;
    const update = event.update;
    if (update?.sessionUpdate === "available_commands_update")
      commands.set(
        event.sessionId,
        new Set(update.availableCommands.map((command) => command.name)),
      );
    if (!active || event.sessionId !== active.session.id) return;
    if (
      update?.sessionUpdate === "agent_message_chunk" &&
      update.content?.type === "text"
    ) {
      active.output += update.content.text;
      active.onText?.(update.content.text);
    }
    if (
      !["permissionRequest", "questionRequest", "elicitationRequest"].includes(
        event.type,
      )
    )
      return;
    const session = active.session;
    const key =
      session.id +
      ":" +
      (event.type === "elicitationRequest" ? "elicitation:" : "") +
      (event.elicitationId ??
        event.toolCallId ??
        event.request?.toolCall?.toolCallId ??
        event.requestId);
    if (interactions.has(key)) return;
    const pending = answerInput(event, session)
      .catch(async () => {
        if (!session.abortSignal.aborted)
          await controller
            .cancel(session.id, { sessionId: session.id })
            .catch(() => {});
      })
      .finally(() => interactions.delete(key));
    interactions.set(key, pending);
  });
  function prompt(session, text, { signal = abort.signal, onText } = {}) {
    if (closing || active)
      throw new Error("Native runtime is unavailable or busy");
    signal = AbortSignal.any([signal, abort.signal]);
    signal.throwIfAborted();
    session.abortSignal = signal;
    const turn = { session, onText, output: "", done: undefined };
    active = turn;
    let cancellation;
    const cancel = () => {
      cancellation ??= controller
        .cancel(session.id, { sessionId: session.id })
        .catch(() => {});
    };
    signal.addEventListener("abort", cancel, { once: true });
    turn.done = (async () => {
      try {
        const result = await controller.prompt(session.id, [
          { type: "text", text },
        ]);
        if (result.stopReason !== "end_turn")
          throw new Error("Native turn did not complete");
        return turn.output;
      } finally {
        signal.removeEventListener("abort", cancel);
        await cancellation;
        if (active === turn) active = undefined;
      }
    })();
    return turn.done;
  }
  return {
    store: {
      async getAll() {
        return (await rest("/api/v1/sessions"))?.sessions ?? [];
      },
      async get(id) {
        const data = await rest(
          `/api/v1/sessions/${encodeURIComponent(id)}/history`,
        );
        if (!data) return undefined;
        return {
          id,
          history: (data.requests ?? []).flatMap((item) => [
            ...(item.userInput
              ? [{ type: "message", role: "user", content: item.userInput }]
              : []),
            ...(item.finalReply
              ? [
                  {
                    type: "message",
                    role: "assistant",
                    content: item.finalReply,
                  },
                ]
              : []),
          ]),
        };
      },
    },
    async openSession(id) {
      if (closing || active)
        throw new Error("Native runtime is unavailable or busy");
      if (!id || !controller.sessions.has(id)) {
        const session = await controller.startSession(
          {
            sessionId: id ?? randomUUID(),
            cwd: workDir,
            config: { permissionMode: "default" },
          },
          id ? "load" : "new",
        );
        id = session.sessionId;
      }
      return { id, abortSignal: abort.signal };
    },
    prompt,
    compact(session, options) {
      if (!commands.get(session.id)?.has("compact"))
        throw new Error("Native session does not advertise a compact command");
      return prompt(session, "/compact", options);
    },
    close() {
      return (closePromise ??= (async () => {
        closing = true;
        const keepAlive = setInterval(() => {}, 1000);
        try {
          abort.abort();
          if (active) {
            await controller
              .cancel(active.session.id, { sessionId: active.session.id })
              .catch(() => {});
            await active?.done?.catch(() => {});
          }
          for (const id of [...controller.sessions.keys()])
            await controller.destroySession(id).catch(() => {});
          await Promise.allSettled([...interactions.values()]);
          await native.close();
        } finally {
          clearInterval(keepAlive);
        }
      })());
    },
  };
}
