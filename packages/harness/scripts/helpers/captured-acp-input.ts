import { createHash } from "node:crypto";
import * as crypto from "node:crypto";
import * as path from "node:path";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { ToolNames } from "../../src/tools/tool-names.js";
import {
  ACP_INPUT_SHA256,
  ACP_INPUT_FACTORIES,
  ACP_VISIBLE_TODO_FUNCTION,
} from "../../src/protocol/captured-acp-modules.js";
import {
  ACP_INPUT_RENDERER_METHODS,
  ACP_PROMPT_TIMESTAMP_FUNCTION,
} from "../../src/protocol/native-acp-input-renderer.js";
import {
  SESSION_PROMPT_SHA256,
  SESSION_PROMPT_METHODS,
  SESSION_PROMPT_FUNCTIONS,
} from "../../src/sessions/native-session-prompt.js";
export function loadCapturedAcpInput(cli: string, initialize: string) {
  for (const [source, sha] of [
    [cli, ACP_INPUT_SHA256],
    [initialize, SESSION_PROMPT_SHA256],
  ])
    if (createHash("sha256").update(source!).digest("hex") !== sha)
      throw Error("ACP source sample hash");
  function factory(
    file: string,
    name: string,
    source: string,
    rows: readonly (readonly any[])[],
    kinds: "modules" | "methods",
    functions: readonly (readonly any[])[],
    deps: any = {},
  ) {
    let output = emittedPrompt(file);
    const t: any = parse(output, {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
      edits: any[] = [];
    for (const n of t.body) {
      if (n.type === "ImportDeclaration")
        edits.push({ start: n.start, end: n.end, text: "" });
      if (n.type === "ExportNamedDeclaration")
        edits.push({ start: n.start, end: n.declaration.start, text: "" });
    }
    for (const n of nodesOf(t)) {
      const key =
        kinds === "modules" && n.type === "Property" && n.method
          ? n.key.value
          : kinds === "methods" && n.type === "MethodDefinition"
            ? n.key.name
            : undefined;
      const row = rows.find((r) => r[0] === key);
      if (row)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(row[1], row[2]),
        });
      const fn =
        n.type === "FunctionDeclaration" &&
        functions.find((r) => r[0] === n.id?.name);
      if (fn)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(fn[1], fn[2]),
        });
    }
    for (const e of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, e.start) + e.text + output.slice(e.end);
    return Function(
      ...Object.keys(deps),
      output + "\nreturn " + name,
    )(...Object.values(deps));
  }
  return {
    modules: factory(
      "protocol/captured-acp-modules",
      "createCapturedAcpModules",
      cli,
      ACP_INPUT_FACTORIES,
      "modules",
      [ACP_VISIBLE_TODO_FUNCTION],
      { path, crypto, ToolNames },
    ),
    renderer: factory(
      "protocol/native-acp-input-renderer",
      "createNativeAcpInputRenderer",
      cli,
      ACP_INPUT_RENDERER_METHODS,
      "methods",
      [ACP_PROMPT_TIMESTAMP_FUNCTION],
    ),
    session: factory(
      "sessions/native-session-prompt",
      "createNativeSessionPrompt",
      initialize,
      SESSION_PROMPT_METHODS,
      "methods",
      SESSION_PROMPT_FUNCTIONS,
      { realCrypto: crypto },
    ),
  };
}
