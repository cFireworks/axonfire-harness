import { parse } from "acorn";
import { createHash } from "node:crypto";
import { runInNewContext, createContext, runInContext } from "node:vm";
import * as path from "node:path";
import { user } from "@openai/agents-core";
import {
  NativeHistoryInputUtils,
  NativeHistorySummaryUtils,
} from "../../src/sessions/input-processor-utils.js";
import {
  CUSTOM_INPUT_ITEM_TYPES,
  getActiveAgentOnlyHistory,
} from "../../src/sessions/history-utils.js";
import { TRUNCATION_RETRY_MARKER } from "../../src/runner/history-repair.js";
import { CompactType } from "../../src/context/compact-config.js";
import {
  MediaContentErrorType,
  TEXTUAL_TOOL_CALL_RETRY_MARKER,
} from "../../src/responses/response-interceptor-runtime.js";
export const responseClassEvidence = [
  ["ContextTruncationInterceptor", 11097159, "rI", ""],
  ["finishReasonErrorInterceptor", 11102390, "rv", "tp"],
  ["TextualToolCallInterceptor", 11107081, "rQ", "tg"],
  ["TruncatedToolCallInterceptor", 11111362, "rD", ""],
  ["QueuedMessagesCleanupInterceptor", 11112796, "rT", ""],
  ["MediaContentErrorInterceptor", 11113694, "rR", "tf"],
  ["FallbackModelErrorInterceptor", 11127506, "rk", ""],
  ["ModelPermissionErrorInterceptor", 11130150, "rx", ""],
] as const;
/** Isolated source evaluation: no application/module bootstrap, credentials or external I/O. */
export function loadCapturedHistoryResponse(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const nodes: any[] = [];
  function visit(n: any) {
    if (!n || typeof n !== "object") return;
    nodes.push(n);
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  }
  visit(parse(source, { ecmaVersion: "latest" }));
  const indexed = new Map<string, any[]>(),
    cache = new Map<string, any>();
  for (const type of [
    "ClassExpression",
    "ClassDeclaration",
    "FunctionExpression",
    "CallExpression",
    "AssignmentExpression",
  ])
    indexed.set(
      type,
      nodes.filter((n) => n.type === type),
    );
  const owner = (p: number, types: string[]) => {
      const key = types.join(",") + ":" + p;
      if (cache.has(key)) return cache.get(key);
      const found = types
        .flatMap((type) => indexed.get(type) ?? [])
        .filter((n) => n.start <= p && n.end > p)
        .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
      cache.set(key, found);
      return found;
    },
    cls = (p: number) => owner(p, ["ClassExpression", "ClassDeclaration"]),
    fn = (p: number) => owner(p, ["FunctionExpression"]),
    text = (n: any) => source.slice(n.start, n.end);
  return {
    history(runtime: any) {
      const C = runInNewContext("(" + text(cls(11139264)) + ")", {
        AS: path,
        AB: {
          PathUtils: {
            getHomeDir: runtime.getHomeDir,
            getWorkDir: runtime.getWorkDir,
          },
        },
        t3: { INPUT_HISTORY_STORAGE_FILE: "history.jsonl" },
        Av: runtime.fs,
        Date: { now: runtime.now },
        setTimeout: runtime.setTimeout,
        clearTimeout: runtime.clearTimeout,
      });
      return Object.assign(new C(), runtime);
    },
    utilities(
      generateUUUID: () => string,
      getCurrentConfiguration: () => any = () => ({}),
    ) {
      const context = createContext({
        URL,
        Error,
        SyntaxError,
        JSON,
        Set,
        Map,
        Buffer,
        ep: { ContainerUtil: { get: () => ({ getCurrentConfiguration }) } },
        eg: { ProductManager: Symbol("ProductManager") },
        eu: undefined,
        ed: undefined,
        eC: undefined,
        ey: undefined,
        ew: undefined,
        eB: undefined,
        e_: undefined,
        eI: undefined,
        NativeHistoryInputUtils,
        euIds: { generateUUUID },
        sdk: { user, CUSTOM_INPUT_ITEM_TYPES: [...CUSTOM_INPUT_ITEM_TYPES] },
      });
      runInContext(
        "var eu={};(" +
          text(
            owner(source.indexOf("CraftRateTPDLimit=6004"), ["CallExpression"])
              .callee,
          ) +
          ")(eu);",
        context,
      );
      const prefix = source.slice(
        source.indexOf("let eC=eu.CraftRateLimit", 13070000),
        source.indexOf("!function(eA)", 13071000),
      );
      // Native enum + constants + full ErrorUtils namespace; unused presentation methods stay unevaluated.
      runInContext(
        prefix +
          "var nativeErrors={};(" +
          text(fn(13079680)) +
          ")(nativeErrors);",
        context,
      );
      const nativeErrors = runInContext("nativeErrors", context);
      const input = cls(13266130),
        names = [
          "createUserMessage",
          "createAssistantMessage",
          "createErrorRecoveryInput",
          "isCustomInputItem",
        ];
      const InputItemUtils = runInNewContext(
        "(class InputItemUtils extends NativeHistoryInputUtils{" +
          names
            .map((name) =>
              text(input.body.body.find((n: any) => n.key?.name === name)),
            )
            .join("\n") +
          "})",
        {
          NativeHistoryInputUtils,
          eu: { generateUUUID },
          eg: { user, CUSTOM_INPUT_ITEM_TYPES: [...CUSTOM_INPUT_ITEM_TYPES] },
        },
      );
      const TokenUtils = runInNewContext("(" + text(cls(13228300)) + ")");
      TokenUtils._IMAGE_CONTENT_TYPES = new Set([
        "image_url",
        "image",
        "input_image",
        "image_blob_ref",
      ]);
      const HistoryTruncateUtils: any = {};
      runInNewContext("(" + text(fn(13231718)) + ")(ed)", {
        ed: HistoryTruncateUtils,
        TokenUtils,
        ex: { InputItemUtils },
        tn: "[earlier conversation truncated to fit context limit]",
      });
      const PtlErrorUtils: any = {};
      runInNewContext("(" + text(fn(13254628)) + ")(ew)", {
        ew: PtlErrorUtils,
      });
      return {
        InputItemUtils,
        ErrorUtils: nativeErrors,
        TokenUtils,
        HistoryTruncateUtils,
        PtlErrorUtils,
        ServerErrorCode: runInContext("eu", context),
        SummaryUtils: NativeHistorySummaryUtils,
        HistoryUtils: { getActiveAgentOnlyHistory },
        SessionUtils: {
          isSubAgent: (s: any) => !!s.storeId && s.storeId !== s.id,
        },
        PTL_RETRY_MARKER:
          "[earlier conversation truncated to fit context limit]",
        MAX_PTL_RETRIES: 3,
      };
    },
    response(name: string, runtime: any, env: NodeJS.ProcessEnv = {}) {
      const entry = responseClassEvidence.find((v) => v[0] === name);
      if (!entry) throw Error(name);
      const Cnode = cls(entry[1]),
        context: any = {
          AB: runtime.utilities,
          A2: {
            AgentService: "service",
            AgentManager: "manager",
            AgentNames: { COMPACT: "compact" },
          },
          A4: { CompactType },
          t5: {
            ContainerUtil: {
              get: (key: string) =>
                key === "service"
                  ? runtime.getAgentService()
                  : runtime.getAgentManager(),
            },
          },
          r_: { TRUNCATION_RETRY_MARKER },
          rS: TEXTUAL_TOOL_CALL_RETRY_MARKER,
          tk: MediaContentErrorType,
          rB: path,
          rM: 11136,
          process: { env },
          URL,
          Error,
          JSON,
          Set,
          Map,
        };
      const C = runInNewContext("(" + text(Cnode) + ")", context);
      context[entry[2]] = C;
      if (entry[3]) context[entry[3]] = C;
      const assignments = indexed
        .get("AssignmentExpression")!
        .filter(
          (n) =>
            n.start >= Cnode.end &&
            n.start < Cnode.end + 2500 &&
            n.left.type === "MemberExpression" &&
            n.left.object.name === entry[2],
        );
      for (const n of assignments) runInNewContext(text(n), context);
      return Object.assign(new C(), runtime);
    },
    bindingOrder() {
      const autoBind = nodes.find(
          (n) =>
            n.type === "FunctionDeclaration" &&
            n.id?.name === "autoBind" &&
            n.start < 60000,
        ),
        registration: any[] = [],
        resolved: any[] = [];
      // applyComponentDecorator pushes entries in evaluation order; autoBind reverses that array.
      for (const v of responseClassEvidence)
        registration.push({ name: v[0], rebind: false });
      const f = runInNewContext("(" + text(autoBind) + ")", {
        Reflect: {
          getMetadata: (key: string) =>
            key === "components" ? registration : [],
          defineMetadata() {},
        },
        ed: {
          METADATA_KEY: { component: "components", constantValue: "constants" },
        },
        eu: {
          ContainerModule: class {
            constructor(callback: any) {
              callback();
            }
          },
        },
        resolve: (value: any) => resolved.push(value.name),
        resolveConstant() {},
      });
      f();
      return resolved;
    },
  };
}
