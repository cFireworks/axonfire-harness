import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { createWebHost } from "./server.mjs";

export async function main(args) {
  const { values } = parseArgs({
    args,
    options: {
      demo: { type: "boolean" },
      port: { type: "string" },
      cwd: { type: "string" },
      "plugin-dir": { type: "string", multiple: true },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    console.log(
      "axonfire web [--demo] [--port 3080] [--cwd /path] [--plugin-dir /trusted/plugin]\nLocal-only Web host. Explicit plugins may contain executable Hooks. Model credentials stay in server environment / .env.",
    );
    return;
  }
  const port = Number(values.port ?? process.env.AXONFIRE_PORT ?? 3080);
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error("Invalid port");
  const demo = values.demo === true;
  const apiKey = process.env.CODEBUDDY_API_KEY ?? process.env.OPENAI_API_KEY;
  const baseURL = process.env.CODEBUDDY_BASE_URL ?? process.env.OPENAI_BASE_URL;
  const model = process.env.CODEBUDDY_MODEL;
  const workDir = resolve(
    values.cwd ?? process.env.AXONFIRE_WORK_DIR ?? process.cwd(),
  );
  const harness = {
    workDir,
    ...(values["plugin-dir"] ? { nativePlugins: { directories: values["plugin-dir"] } } : {}),
    stateDir: resolve(
      process.env.AXONFIRE_STATE_DIR ??
        resolve(workDir, ".axonfire", demo ? "demo" : "live"),
    ),
    ...(apiKey ? { apiKey } : {}),
    ...(baseURL ? { baseURL } : {}),
    ...(model ? { model } : {}),
  };
  if (demo) {
    // Deterministic, offline model. Still runs through the real SDK and recovered harness.
    const { Usage } = await import("@openai/agents-core");
    harness.recordReplayEnv = {};
    harness.modelProvider = {
      getModel: () => ({
        async getResponse() {
          return { output: [], usage: new Usage() };
        },
        async *getStreamedResponse() {
          const text =
            "离线演示已运行：此消息经过真实 Agents SDK 与还原 harness。演示不调用远端模型，也不执行工具。配置 .env 后重启 npm start，即可使用自己的模型。";
          yield { type: "response_started" };
          for (const delta of text.match(/.{1,8}/gu) ?? []) {
            yield { type: "output_text_delta", delta };
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
          yield {
            type: "response_done",
            response: {
              id: "demo",
              usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
              output: [
                {
                  type: "message",
                  role: "assistant",
                  id: "demo-message",
                  status: "completed",
                  content: [{ type: "output_text", text }],
                },
              ],
            },
          };
        },
      }),
    };
  }
  const host = await createWebHost({
    harness,
    demo,
    configured: demo || Boolean(apiKey && baseURL),
    model,
  });
  console.log(
    `Axonfire ${demo ? "offline demo" : "local Web"}: ${await host.listen(port)}`,
  );
  console.log(
    "Tools require individual browser approval. This server is not for network/public deployment.",
  );
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    await host.close();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}
