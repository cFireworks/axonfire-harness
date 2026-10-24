// Browser-facing shape over original ACP/REST services, without a second agent loop.
import { startNativeProductProcess } from "./native-process.mjs";
import { connectNativeAcp } from "./native-acp-client.mjs";

export async function createNativeWebRuntime(options) {
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
  const native = await startNativeProductProcess({
    cwd: options.workDir,
    args,
    env: {
      ...(options.env ?? process.env),
      ...(options.stateDir ? { AXONFIRE_STATE_DIR: options.stateDir } : {}),
    },
  });
  let client,
    active,
    closing = false;
  const abort = new AbortController();
  const commands = new Map();
  async function rest(path) {
    const response = await fetch(native.origin + path, {
      headers: { "x-codebuddy-request": "1" },
      signal: abort.signal,
    });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error("Native session request failed");
    return (await response.json()).data;
  }
  try {
    client = await connectNativeAcp(native.origin, {
      clientCapabilities: { _meta: { "codebuddy.ai": { question: true } } },
      onNotification(message) {
        if (
          message.method === "session/update" &&
          message.params?.update?.sessionUpdate === "available_commands_update"
        )
          commands.set(
            message.params.sessionId,
            new Set(
              message.params.update.availableCommands.map(
                (command) => command.name,
              ),
            ),
          );
      },
      async onRequest(method, params) {
        if (method !== "session/request_permission")
          throw new Error("Unsupported native client method");
        if (!active || active.session.id !== params.sessionId)
          return { outcome: { outcome: "cancelled" } };
        const session = active.session;
        const name =
          params.toolCall?._meta?.["codebuddy.ai/toolName"] ?? "Tool";
        const input = params.toolCall?.rawInput ?? {};
        if (name === "AskUserQuestion") {
          const answers = await options.askUserQuestion?.(input, session);
          if (session.abortSignal.aborted)
            return { outcome: { outcome: "cancelled" } };
          const answered = answers && Object.keys(answers).length > 0;
          await client.request("_codebuddy.ai/resolveInterruption", {
            sessionId: session.id,
            toolCallId: params.toolCall.toolCallId,
            decision: answered ? "allow" : "deny",
            answers: answers ?? {},
          });
          return {
            outcome: {
              outcome: "selected",
              optionId: answered ? "allow" : "reject",
            },
          };
        }
        const meta = params.toolCall?._meta;
        const context = meta?.["codebuddy.ai/sandboxIntercept"] === true
          ? {
              sandbox: true,
              bypass: meta["codebuddy.ai/bypassHint"] === true,
              target: typeof meta["codebuddy.ai/target"] === "string"
                ? meta["codebuddy.ai/target"] : undefined,
            }
          : undefined;
        const approved = await options.approveTool?.(name, input, session, context);
        if (session.abortSignal.aborted)
          return { outcome: { outcome: "cancelled" } };
        const option =
          params.options?.find(
            (option) =>
              option.kind ===
              (approved === true ? "allow_once" : "reject_once"),
          ) ??
          params.options?.find((option) =>
            (approved === true
              ? ["allow_once", "allow"]
              : ["deny", "reject"]
            ).includes(option.optionId),
          );
        return option
          ? { outcome: { outcome: "selected", optionId: option.optionId } }
          : { outcome: { outcome: "cancelled" } };
      },
    });
  } catch (error) {
    await native.close();
    throw error;
  }
  async function prompt(session, text, { signal = abort.signal, onText } = {}) {
    if (closing || active)
      throw new Error("Native runtime is unavailable or busy");
    signal = AbortSignal.any([signal, abort.signal]);
    signal.throwIfAborted();
    session.abortSignal = signal;
    active = { session };
    let output = "",
      cancellation;
    const cancel = () => {
      cancellation ??= client
        .notify("session/cancel", { sessionId: session.id })
        .catch(() => {});
    };
    signal.addEventListener("abort", cancel, { once: true });
    try {
      const result = await client.request(
        "session/prompt",
        { sessionId: session.id, prompt: [{ type: "text", text }] },
        {
          onMessage(message) {
            const update = message.params?.update;
            if (
              message.method === "session/update" &&
              update?.sessionUpdate === "agent_message_chunk" &&
              update.content?.type === "text"
            ) {
              output += update.content.text;
              onText?.(update.content.text);
            }
          },
        },
      );
      if (result.stopReason !== "end_turn")
        throw new Error("Native turn did not complete");
      return output;
    } finally {
      signal.removeEventListener("abort", cancel);
      await cancellation;
      active = undefined;
    }
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
      const result = await client.request(id ? "session/load" : "session/new", {
        ...(id ? { sessionId: id } : {}),
        cwd: options.workDir,
        mcpServers: [],
      });
      return { id: id ?? result.sessionId, abortSignal: abort.signal };
    },
    prompt,
    compact(session, options) {
      if (!commands.get(session.id)?.has("compact"))
        throw new Error("Native session does not advertise a compact command");
      return prompt(session, "/compact", options);
    },
    async close() {
      if (closing) return;
      closing = true;
      abort.abort();
      if (active)
        await client
          .notify("session/cancel", { sessionId: active.session.id })
          .catch(() => {});
      try {
        await client.close().catch(() => {});
      } finally {
        await native.close();
      }
    },
  };
}
