// @ts-nocheck
// Full inert modified ACP SDK factory from the fixed CLI, attributed by its manifest to @agentclientprotocol/sdk 0.25.0.
// OpenAI SDK is never copied here. Zod remains the locked npm dependency; no application bootstrap executes.
import { getAcpZodRuntime } from "./acp-zod-runtime.js";
export const ACP_SDK_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_SDK_FACTORY = [38113, 16626928, 16678668] as const;
export const ACP_SDK_ZOD_FACTORY = [25223, 20942794, 21162646] as const;
export const ACP_SDK_ZOD_VERSION = "4.0.0";
export const ACP_SDK_ZOD_DEPENDENCY = "zod3@3.25.67/v4";
export function createCapturedAcpSdk(runtime: any = {}) {
  const console = runtime.console ?? globalThis.console;
  const TextEncoder = runtime.TextEncoder ?? globalThis.TextEncoder,
    TextDecoder = runtime.TextDecoder ?? globalThis.TextDecoder;
  const ReadableStream = runtime.ReadableStream ?? globalThis.ReadableStream,
    WritableStream = runtime.WritableStream ?? globalThis.WritableStream,
    AbortController = runtime.AbortController ?? globalThis.AbortController;
  const factories = {
    38113(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          ClientSideConnection: () => ClientSideConnection,
          TerminalHandle: () => TerminalHandle,
          PROTOCOL_VERSION: () => eg,
          ndJsonStream: () => ndJsonStream,
          RequestError: () => RequestError,
          AGENT_METHODS: () => ed,
          AgentSideConnection: () => AgentSideConnection,
          CLIENT_METHODS: () => ep,
        }));
      var eu = ec(25223);
      let ed = {
          authenticate: "authenticate",
          document_did_change: "document/didChange",
          document_did_close: "document/didClose",
          document_did_focus: "document/didFocus",
          document_did_open: "document/didOpen",
          document_did_save: "document/didSave",
          initialize: "initialize",
          logout: "logout",
          mcp_message: "mcp/message",
          nes_accept: "nes/accept",
          nes_close: "nes/close",
          nes_reject: "nes/reject",
          nes_start: "nes/start",
          nes_suggest: "nes/suggest",
          providers_disable: "providers/disable",
          providers_list: "providers/list",
          providers_set: "providers/set",
          session_cancel: "session/cancel",
          session_close: "session/close",
          session_delete: "session/delete",
          session_fork: "session/fork",
          session_list: "session/list",
          session_load: "session/load",
          session_new: "session/new",
          session_prompt: "session/prompt",
          session_resume: "session/resume",
          session_set_config_option: "session/set_config_option",
          session_set_mode: "session/set_mode",
        },
        ep = {
          elicitation_complete: "elicitation/complete",
          elicitation_create: "elicitation/create",
          fs_read_text_file: "fs/read_text_file",
          fs_write_text_file: "fs/write_text_file",
          mcp_connect: "mcp/connect",
          mcp_disconnect: "mcp/disconnect",
          mcp_message: "mcp/message",
          session_request_permission: "session/request_permission",
          session_update: "session/update",
          terminal_create: "terminal/create",
          terminal_kill: "terminal/kill",
          terminal_output: "terminal/output",
          terminal_release: "terminal/release",
          terminal_wait_for_exit: "terminal/wait_for_exit",
        },
        eg = 1,
        eh = Symbol("skippedItem");
      function defaultOnError(eA, el) {
        return eA.catch(el);
      }
      function requiredDefaultOnError(eA, el) {
        let ec = eA.catch(el);
        return eu.z.unknown().transform((eA, el) =>
          void 0 !== eA
            ? ec.parse(eA)
            : (el.addIssue({
                code: "custom",
                message: "Required value is missing",
              }),
              eu.z.NEVER),
        );
      }
      function vecSkipError(eA) {
        return eu.z
          .array(eA.catch(eh))
          .transform((eA) => eA.filter((eA) => eA !== eh));
      }
      let ef = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          terminal: eu.z.boolean().optional().default(!1),
        }),
        em = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          label: eu.z.string().nullish(),
          name: eu.z.string(),
          optional: eu.z.boolean().optional().default(!1),
          secret: eu.z.boolean().optional().default(!0),
        }),
        eE = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          description: eu.z.string().nullish(),
          id: eu.z.string(),
          name: eu.z.string(),
        }),
        eC = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          description: eu.z.string().nullish(),
          id: eu.z.string(),
          link: eu.z.string().nullish(),
          name: eu.z.string(),
          vars: eu.z.array(em),
        }),
        ey = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          args: eu.z.array(eu.z.string()).optional(),
          description: eu.z.string().nullish(),
          env: eu.z.record(eu.z.string(), eu.z.string()).optional(),
          id: eu.z.string(),
          name: eu.z.string(),
        }),
        ew = eu.z.union([
          eC.and(eu.z.object({ type: eu.z.literal("env_var") })),
          ey.and(eu.z.object({ type: eu.z.literal("terminal") })),
          eE,
        ]),
        eB = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          methodId: eu.z.string(),
        }),
        e_ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        eI = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          blob: eu.z.string(),
          mimeType: eu.z.string().nullish(),
          uri: eu.z.string(),
        }),
        ev = eu.z.object({
          default: eu.z.boolean().nullish(),
          description: eu.z.string().nullish(),
          title: eu.z.string().nullish(),
        }),
        eS = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        eQ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        eD = eu.z.object({ amount: eu.z.number(), currency: eu.z.string() }),
        eT = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          terminalId: eu.z.string(),
        }),
        eR = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        ek = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          newText: eu.z.string(),
          oldText: eu.z.string().nullish(),
          path: eu.z.string(),
        }),
        eM = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          id: eu.z.string(),
        }),
        ex = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        eO = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        eN = eu.z.union([
          eu.z.string(),
          eu.z.number(),
          eu.z.number(),
          eu.z.boolean(),
          eu.z.array(eu.z.string()),
        ]),
        eP = eu.z.object({ content: eu.z.record(eu.z.string(), eN).nullish() }),
        eL = eu.z.intersection(
          eu.z.union([
            eP.and(eu.z.object({ action: eu.z.literal("accept") })),
            eu.z.object({ action: eu.z.literal("decline") }),
            eu.z.object({ action: eu.z.literal("cancel") }),
          ]),
          eu.z.object({
            _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          }),
        ),
        eF = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        eU = eu.z.string(),
        ej = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          elicitationId: eU,
        }),
        eG = eu.z.literal("object"),
        eH = eu.z.literal("string"),
        eK = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        e$ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          form: defaultOnError(eF.nullish(), () => void 0),
          url: defaultOnError(eK.nullish(), () => void 0),
        }),
        eY = eu.z.object({ const: eu.z.string(), title: eu.z.string() }),
        eJ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          name: eu.z.string(),
          value: eu.z.string(),
        }),
        ez = eu.z.union([
          eu.z.literal(-32700),
          eu.z.literal(-32600),
          eu.z.literal(-32601),
          eu.z.literal(-32602),
          eu.z.literal(-32603),
          eu.z.literal(-32800),
          eu.z.literal(-32e3),
          eu.z.literal(-32002),
          eu.z.literal(-32042),
          eu.z
            .number()
            .int()
            .min(-0x80000000, {
              message: "Invalid value: Expected int32 to be >= -2147483648",
            })
            .max(0x7fffffff, {
              message: "Invalid value: Expected int32 to be <= 2147483647",
            }),
        ]),
        eW = eu.z.object({
          code: ez,
          data: eu.z.unknown().optional(),
          message: eu.z.string(),
        }),
        eV = eu.z.unknown(),
        eZ = eu.z.unknown(),
        eX = eu.z.unknown(),
        e0 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          readTextFile: eu.z.boolean().optional().default(!1),
          writeTextFile: eu.z.boolean().optional().default(!1),
        }),
        e1 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          name: eu.z.string(),
          value: eu.z.string(),
        }),
        e2 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          name: eu.z.string(),
          title: eu.z.string().nullish(),
          version: eu.z.string(),
        }),
        e3 = eu.z.object({
          default: eu.z.number().nullish(),
          description: eu.z.string().nullish(),
          maximum: eu.z.number().nullish(),
          minimum: eu.z.number().nullish(),
          title: eu.z.string().nullish(),
        }),
        e4 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        e8 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        e5 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          cursor: eu.z.string().nullish(),
          cwd: eu.z.string().nullish(),
        }),
        e6 = eu.z.union([
          eu.z.literal("anthropic"),
          eu.z.literal("openai"),
          eu.z.literal("azure"),
          eu.z.literal("vertex"),
          eu.z.literal("bedrock"),
          eu.z.string(),
        ]),
        e9 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        e7 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          logout: defaultOnError(e9.nullish(), () => void 0),
        }),
        tn = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tl = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tc = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          acp: eu.z.boolean().optional().default(!1),
          http: eu.z.boolean().optional().default(!1),
          sse: eu.z.boolean().optional().default(!1),
        }),
        tu = eu.z.string(),
        td = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          connectionId: tu,
        }),
        tp = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          connectionId: tu,
        }),
        tg = eu.z.string(),
        tf = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          acpId: tg,
        }),
        tm = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          id: tg,
          name: eu.z.string(),
        }),
        tE = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          headers: eu.z.array(e1),
          name: eu.z.string(),
          url: eu.z.string(),
        }),
        tC = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          headers: eu.z.array(e1),
          name: eu.z.string(),
          url: eu.z.string(),
        }),
        ty = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          args: eu.z.array(eu.z.string()),
          command: eu.z.string(),
          env: eu.z.array(eJ),
          name: eu.z.string(),
        }),
        tw = eu.z.union([
          tE.and(eu.z.object({ type: eu.z.literal("http") })),
          tC.and(eu.z.object({ type: eu.z.literal("sse") })),
          tm.and(eu.z.object({ type: eu.z.literal("acp") })),
          ty,
        ]),
        tB = eu.z.string(),
        t_ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          connectionId: tu,
          method: eu.z.string(),
          params: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tI = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          connectionId: tu,
          method: eu.z.string(),
          params: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tv = eu.z.unknown(),
        tS = eu.z.union([
          eu.z.literal("error"),
          eu.z.literal("warning"),
          eu.z.literal("information"),
          eu.z.literal("hint"),
        ]),
        tQ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tD = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tT = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tR = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tk = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tM = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          maxCount: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
        }),
        tx = eu.z.object({ diff: eu.z.string(), uri: eu.z.string() }),
        tO = eu.z.object({
          endLine: eu.z.number().int().gte(0).max(0xffffffff, {
            message: "Invalid value: Expected uint32 to be <= 4294967295",
          }),
          startLine: eu.z.number().int().gte(0).max(0xffffffff, {
            message: "Invalid value: Expected uint32 to be <= 4294967295",
          }),
          text: eu.z.string(),
        }),
        tN = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tP = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tL = eu.z.object({
          languageId: eu.z.string(),
          text: eu.z.string(),
          uri: eu.z.string(),
        }),
        tF = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          maxCount: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
        }),
        tU = eu.z.union([
          eu.z.literal("rejected"),
          eu.z.literal("ignored"),
          eu.z.literal("replaced"),
          eu.z.literal("cancelled"),
        ]),
        tj = eu.z.object({ excerpts: eu.z.array(tO), uri: eu.z.string() }),
        tG = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tH = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tK = eu.z.object({
          name: eu.z.string(),
          owner: eu.z.string(),
          remoteUrl: eu.z.string(),
        }),
        t$ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        tY = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          jump: defaultOnError(tN.nullish(), () => void 0),
          rename: defaultOnError(tH.nullish(), () => void 0),
          searchAndReplace: defaultOnError(t$.nullish(), () => void 0),
        }),
        tJ = eu.z.object({
          id: eu.z.string(),
          isRegex: eu.z.boolean().nullish(),
          replace: eu.z.string(),
          search: eu.z.string(),
          uri: eu.z.string(),
        }),
        tq = eu.z.union([
          eu.z.literal("automatic"),
          eu.z.literal("diagnostic"),
          eu.z.literal("manual"),
        ]),
        tz = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          maxCount: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
        }),
        tW = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          diagnostics: defaultOnError(tQ.nullish(), () => void 0),
          editHistory: defaultOnError(tM.nullish(), () => void 0),
          openFiles: defaultOnError(tP.nullish(), () => void 0),
          recentFiles: defaultOnError(tF.nullish(), () => void 0),
          relatedSnippets: defaultOnError(tG.nullish(), () => void 0),
          userActions: defaultOnError(tz.nullish(), () => void 0),
        }),
        tV = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          additionalDirectories: eu.z.array(eu.z.string()).optional(),
          cwd: eu.z.string(),
          mcpServers: eu.z.array(tw),
        }),
        tZ = eu.z.object({
          default: eu.z.number().nullish(),
          description: eu.z.string().nullish(),
          maximum: eu.z.number().nullish(),
          minimum: eu.z.number().nullish(),
          title: eu.z.string().nullish(),
        }),
        tX = eu.z.string(),
        t0 = eu.z.union([
          eu.z.literal("allow_once"),
          eu.z.literal("allow_always"),
          eu.z.literal("reject_once"),
          eu.z.literal("reject_always"),
        ]),
        t1 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          kind: t0,
          name: eu.z.string(),
          optionId: tX,
        }),
        t2 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        t3 = eu.z.union([
          eu.z.literal("high"),
          eu.z.literal("medium"),
          eu.z.literal("low"),
        ]),
        t4 = eu.z.union([
          eu.z.literal("pending"),
          eu.z.literal("in_progress"),
          eu.z.literal("completed"),
        ]),
        t8 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: eu.z.string(),
          priority: t3,
          status: t4,
        }),
        t5 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          entries: requiredDefaultOnError(vecSkipError(t8), () => []),
        }),
        t6 = eu.z.string(),
        t9 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          id: t6,
          uri: eu.z.string(),
        }),
        t7 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          entries: requiredDefaultOnError(vecSkipError(t8), () => []),
          id: t6,
        }),
        An = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: eu.z.string(),
          id: t6,
        }),
        Al = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          id: t6,
        }),
        Ac = eu.z.union([
          t7.and(eu.z.object({ type: eu.z.literal("items") })),
          t9.and(eu.z.object({ type: eu.z.literal("file") })),
          An.and(eu.z.object({ type: eu.z.literal("markdown") })),
        ]),
        Au = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          plan: Ac,
        }),
        Ad = eu.z.object({
          character: eu.z.number().int().gte(0).max(0xffffffff, {
            message: "Invalid value: Expected uint32 to be <= 4294967295",
          }),
          line: eu.z.number().int().gte(0).max(0xffffffff, {
            message: "Invalid value: Expected uint32 to be <= 4294967295",
          }),
        }),
        Ap = eu.z.object({
          id: eu.z.string(),
          position: Ad,
          uri: eu.z.string(),
        }),
        Ag = eu.z.object({
          id: eu.z.string(),
          newName: eu.z.string(),
          position: Ad,
          uri: eu.z.string(),
        }),
        Ah = eu.z.object({
          action: eu.z.string(),
          position: Ad,
          timestampMs: eu.z.number(),
          uri: eu.z.string(),
        }),
        Af = eu.z.union([
          eu.z.literal("utf-16"),
          eu.z.literal("utf-32"),
          eu.z.literal("utf-8"),
        ]),
        Am = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          auth: ef.optional().default({ terminal: !1 }),
          elicitation: defaultOnError(e$.nullish(), () => void 0),
          fs: e0.optional().default({ readTextFile: !1, writeTextFile: !1 }),
          nes: defaultOnError(tY.nullish(), () => void 0),
          plan: defaultOnError(t2.nullish(), () => void 0),
          positionEncodings: defaultOnError(
            vecSkipError(Af).optional(),
            () => [],
          ),
          terminal: eu.z.boolean().optional().default(!1),
        }),
        AE = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          audio: eu.z.boolean().optional().default(!1),
          embeddedContext: eu.z.boolean().optional().default(!1),
          image: eu.z.boolean().optional().default(!1),
        }),
        AC = eu.z.number().int().gte(0).lte(65535),
        Ay = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          clientCapabilities: Am.optional().default({
            auth: { terminal: !1 },
            fs: { readTextFile: !1, writeTextFile: !1 },
            terminal: !1,
          }),
          clientInfo: defaultOnError(e2.nullish(), () => void 0),
          protocolVersion: AC,
        }),
        Aw = eu.z.object({ apiType: e6, baseUrl: eu.z.string() }),
        AB = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          current: Aw.nullish(),
          id: eu.z.string(),
          required: eu.z.boolean(),
          supported: requiredDefaultOnError(vecSkipError(e6), () => []),
        }),
        A_ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          providers: requiredDefaultOnError(vecSkipError(AB), () => []),
        }),
        AI = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        Av = eu.z.object({ end: Ad, start: Ad }),
        AS = eu.z.object({
          message: eu.z.string(),
          range: Av,
          severity: tS,
          uri: eu.z.string(),
        }),
        AQ = eu.z.object({
          languageId: eu.z.string(),
          lastFocusedMs: defaultOnError(eu.z.number().nullish(), () => void 0),
          uri: eu.z.string(),
          visibleRange: defaultOnError(Av.nullish(), () => void 0),
        }),
        AD = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          diagnostics: defaultOnError(vecSkipError(AS).nullish(), () => void 0),
          editHistory: defaultOnError(vecSkipError(tx).nullish(), () => void 0),
          openFiles: defaultOnError(vecSkipError(AQ).nullish(), () => void 0),
          recentFiles: defaultOnError(vecSkipError(tL).nullish(), () => void 0),
          relatedSnippets: defaultOnError(
            vecSkipError(tj).nullish(),
            () => void 0,
          ),
          userActions: defaultOnError(vecSkipError(Ah).nullish(), () => void 0),
        }),
        AT = eu.z.object({ newText: eu.z.string(), range: Av }),
        AR = eu.z.object({
          cursorPosition: defaultOnError(Ad.nullish(), () => void 0),
          edits: eu.z.array(AT),
          id: eu.z.string(),
          uri: eu.z.string(),
        }),
        Ak = eu.z.union([
          AR.and(eu.z.object({ kind: eu.z.literal("edit") })),
          Ap.and(eu.z.object({ kind: eu.z.literal("jump") })),
          Ag.and(eu.z.object({ kind: eu.z.literal("rename") })),
          tJ.and(eu.z.object({ kind: eu.z.literal("searchAndReplace") })),
        ]),
        AM = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: eu.z.string(),
        }),
        Ax = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        AO = eu.z.union([eu.z.number(), eu.z.string()]).nullable();
      eu.z.object({
        _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        requestId: AO,
      });
      let AN = eu.z.object({ requestId: AO }),
        AP = eu.z.enum(["assistant", "user"]),
        AL = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          audience: defaultOnError(vecSkipError(AP).nullish(), () => void 0),
          lastModified: eu.z.string().nullish(),
          priority: eu.z.number().nullish(),
        }),
        AF = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          annotations: defaultOnError(AL.nullish(), () => void 0),
          data: eu.z.string(),
          mimeType: eu.z.string(),
        }),
        AU = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          annotations: defaultOnError(AL.nullish(), () => void 0),
          data: eu.z.string(),
          mimeType: eu.z.string(),
          uri: eu.z.string().nullish(),
        }),
        Aj = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          annotations: defaultOnError(AL.nullish(), () => void 0),
          description: eu.z.string().nullish(),
          mimeType: eu.z.string().nullish(),
          name: eu.z.string(),
          size: eu.z.number().nullish(),
          title: eu.z.string().nullish(),
          uri: eu.z.string(),
        }),
        AG = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          optionId: tX,
        }),
        AH = eu.z.union([
          eu.z.object({ outcome: eu.z.literal("cancelled") }),
          AG.and(eu.z.object({ outcome: eu.z.literal("selected") })),
        ]),
        AK = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          outcome: AH,
        }),
        A$ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        AY = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        AJ = eu.z.object({ currentValue: eu.z.boolean() }),
        Aq = eu.z.string(),
        Az = eu.z.string(),
        AW = eu.z.union([
          eu.z.literal("mode"),
          eu.z.literal("model"),
          eu.z.literal("thought_level"),
          eu.z.string(),
        ]),
        AV = eu.z.string(),
        AZ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          description: eu.z.string().nullish(),
          name: eu.z.string(),
          value: AV,
        }),
        AX = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          group: Aq,
          name: eu.z.string(),
          options: eu.z.array(AZ),
        }),
        A0 = eu.z.union([eu.z.array(AZ), eu.z.array(AX)]),
        A1 = eu.z.object({ currentValue: AV, options: A0 }),
        A2 = eu.z.intersection(
          eu.z.union([
            A1.and(eu.z.object({ type: eu.z.literal("select") })),
            AJ.and(eu.z.object({ type: eu.z.literal("boolean") })),
          ]),
          eu.z.object({
            _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
            category: defaultOnError(AW.nullish(), () => void 0),
            description: eu.z.string().nullish(),
            id: Az,
            name: eu.z.string(),
          }),
        ),
        A3 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          configOptions: requiredDefaultOnError(vecSkipError(A2), () => []),
        }),
        A4 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        A8 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        A5 = eu.z.string(),
        A6 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          id: eu.z.string(),
          sessionId: A5,
        }),
        A9 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
        }),
        A7 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
        }),
        rn = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
        }),
        ra = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          args: eu.z.array(eu.z.string()).optional(),
          command: eu.z.string(),
          cwd: eu.z.string().nullish(),
          env: eu.z.array(eJ).optional(),
          outputByteLimit: eu.z.number().nullish(),
          sessionId: A5,
        }),
        rl = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
        }),
        rc = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          uri: eu.z.string(),
        }),
        rd = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          position: Ad,
          sessionId: A5,
          uri: eu.z.string(),
          version: eu.z.number(),
          visibleRange: Av,
        }),
        rp = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          languageId: eu.z.string(),
          sessionId: A5,
          text: eu.z.string(),
          uri: eu.z.string(),
          version: eu.z.number(),
        }),
        rg = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          uri: eu.z.string(),
        }),
        rh = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          additionalDirectories: eu.z.array(eu.z.string()).optional(),
          cwd: eu.z.string(),
          mcpServers: eu.z.array(tw).optional(),
          sessionId: A5,
        }),
        rf = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          terminalId: eu.z.string(),
        }),
        rm = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          additionalDirectories: eu.z.array(eu.z.string()).optional(),
          cwd: eu.z.string(),
          mcpServers: eu.z.array(tw),
          sessionId: A5,
        }),
        rE = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          limit: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          line: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          path: eu.z.string(),
          sessionId: A5,
        }),
        rC = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          id: eu.z.string(),
          reason: defaultOnError(tU.nullish(), () => void 0),
          sessionId: A5,
        }),
        ry = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          terminalId: eu.z.string(),
        }),
        rw = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          additionalDirectories: eu.z.array(eu.z.string()).optional(),
          cwd: eu.z.string(),
          mcpServers: eu.z.array(tw).optional(),
          sessionId: A5,
        }),
        rB = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          additionalDirectories: eu.z.array(eu.z.string()).optional(),
          cwd: eu.z.string(),
          sessionId: A5,
          title: defaultOnError(eu.z.string().nullish(), () => void 0),
          updatedAt: defaultOnError(eu.z.string().nullish(), () => void 0),
        }),
        r_ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          nextCursor: eu.z.string().nullish(),
          sessions: requiredDefaultOnError(vecSkipError(rB), () => []),
        }),
        rI = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          title: eu.z.string().nullish(),
          updatedAt: eu.z.string().nullish(),
        }),
        rv = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        rS = eu.z.string(),
        rQ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          currentModeId: rS,
        }),
        rD = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          description: eu.z.string().nullish(),
          id: rS,
          name: eu.z.string(),
        }),
        rT = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          availableModes: requiredDefaultOnError(vecSkipError(rD), () => []),
          currentModeId: rS,
        }),
        rR = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          configOptions: defaultOnError(
            vecSkipError(A2).nullish(),
            () => void 0,
          ),
          modes: defaultOnError(rT.nullish(), () => void 0),
          sessionId: A5,
        }),
        rk = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          configOptions: defaultOnError(
            vecSkipError(A2).nullish(),
            () => void 0,
          ),
          modes: defaultOnError(rT.nullish(), () => void 0),
        }),
        rM = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          configOptions: defaultOnError(
            vecSkipError(A2).nullish(),
            () => void 0,
          ),
          modes: defaultOnError(rT.nullish(), () => void 0),
          sessionId: A5,
        }),
        rx = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          configOptions: defaultOnError(
            vecSkipError(A2).nullish(),
            () => void 0,
          ),
          modes: defaultOnError(rT.nullish(), () => void 0),
        }),
        rO = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        rN = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          additionalDirectories: defaultOnError(A$.nullish(), () => void 0),
          close: defaultOnError(AY.nullish(), () => void 0),
          delete: defaultOnError(A4.nullish(), () => void 0),
          fork: defaultOnError(A8.nullish(), () => void 0),
          list: defaultOnError(rv.nullish(), () => void 0),
          resume: defaultOnError(rO.nullish(), () => void 0),
        }),
        rP = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          apiType: e6,
          baseUrl: eu.z.string(),
          headers: eu.z.record(eu.z.string(), eu.z.string()).optional(),
          id: eu.z.string(),
        }),
        rL = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        rF = eu.z.intersection(
          eu.z.union([
            eu.z.object({
              type: eu.z.literal("boolean"),
              value: eu.z.boolean(),
            }),
            eu.z.object({ value: AV }),
          ]),
          eu.z.object({
            _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
            configId: Az,
            sessionId: A5,
          }),
        ),
        rU = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          configOptions: requiredDefaultOnError(vecSkipError(A2), () => []),
        }),
        rj = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          modeId: rS,
          sessionId: A5,
        }),
        rG = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        }),
        rH = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
        }),
        rK = eu.z.union([
          eu.z.literal("end_turn"),
          eu.z.literal("max_tokens"),
          eu.z.literal("max_turn_requests"),
          eu.z.literal("refusal"),
          eu.z.literal("cancelled"),
        ]),
        r$ = eu.z.union([
          eu.z.literal("email"),
          eu.z.literal("uri"),
          eu.z.literal("date"),
          eu.z.literal("date-time"),
        ]),
        rY = eu.z.object({
          default: eu.z.string().nullish(),
          description: eu.z.string().nullish(),
          enum: eu.z.array(eu.z.string()).nullish(),
          format: r$.nullish(),
          maxLength: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          minLength: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          oneOf: eu.z.array(eY).nullish(),
          pattern: eu.z.string().nullish(),
          title: eu.z.string().nullish(),
        }),
        rJ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          context: defaultOnError(AD.nullish(), () => void 0),
          position: Ad,
          selection: defaultOnError(Av.nullish(), () => void 0),
          sessionId: A5,
          triggerKind: tq,
          uri: eu.z.string(),
          version: eu.z.number(),
        }),
        rq = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          suggestions: requiredDefaultOnError(vecSkipError(Ak), () => []),
        }),
        rz = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          terminalId: eu.z.string(),
        }),
        rW = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          exitCode: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          signal: eu.z.string().nullish(),
        }),
        rV = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          terminalId: eu.z.string(),
        }),
        rZ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          exitStatus: rW.nullish(),
          output: eu.z.string(),
          truncated: eu.z.boolean(),
        }),
        rX = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          annotations: defaultOnError(AL.nullish(), () => void 0),
          text: eu.z.string(),
        }),
        r0 = eu.z.object({ range: Av.nullish(), text: eu.z.string() }),
        r1 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          contentChanges: eu.z.array(r0),
          sessionId: A5,
          uri: eu.z.string(),
          version: eu.z.number(),
        });
      eu.z.object({
        method: eu.z.string(),
        params: eu.z.union([A9, rp, r1, rc, rg, rd, A6, rC, t_, eV]).nullish(),
      });
      let r2 = eu.z.union([eu.z.literal("full"), eu.z.literal("incremental")]),
        r3 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          syncKind: r2,
        }),
        r4 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          didChange: defaultOnError(r3.nullish(), () => void 0),
          didClose: defaultOnError(tD.nullish(), () => void 0),
          didFocus: defaultOnError(tT.nullish(), () => void 0),
          didOpen: defaultOnError(tR.nullish(), () => void 0),
          didSave: defaultOnError(tk.nullish(), () => void 0),
        }),
        r8 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          document: defaultOnError(r4.nullish(), () => void 0),
        }),
        r5 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          context: defaultOnError(tW.nullish(), () => void 0),
          events: defaultOnError(r8.nullish(), () => void 0),
        }),
        r6 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          auth: e7.optional().default({}),
          loadSession: eu.z.boolean().optional().default(!1),
          mcpCapabilities: tc
            .optional()
            .default({ acp: !1, http: !1, sse: !1 }),
          nes: defaultOnError(r5.nullish(), () => void 0),
          positionEncoding: defaultOnError(Af.nullish(), () => void 0),
          promptCapabilities: AE.optional().default({
            audio: !1,
            embeddedContext: !1,
            image: !1,
          }),
          providers: defaultOnError(AI.nullish(), () => void 0),
          sessionCapabilities: rN.optional().default({}),
        }),
        r9 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          agentCapabilities: r6.optional().default({
            auth: {},
            loadSession: !1,
            mcpCapabilities: { acp: !1, http: !1, sse: !1 },
            promptCapabilities: { audio: !1, embeddedContext: !1, image: !1 },
            sessionCapabilities: {},
          }),
          agentInfo: defaultOnError(e2.nullish(), () => void 0),
          authMethods: defaultOnError(
            vecSkipError(ew).optional().default([]),
            () => [],
          ),
          protocolVersion: AC,
        }),
        r7 = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          mimeType: eu.z.string().nullish(),
          text: eu.z.string(),
          uri: eu.z.string(),
        }),
        ne = eu.z.union([r7, eI]),
        nc = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          annotations: defaultOnError(AL.nullish(), () => void 0),
          resource: ne,
        }),
        nu = eu.z.union([
          rX.and(eu.z.object({ type: eu.z.literal("text") })),
          AU.and(eu.z.object({ type: eu.z.literal("image") })),
          AF.and(eu.z.object({ type: eu.z.literal("audio") })),
          Aj.and(eu.z.object({ type: eu.z.literal("resource_link") })),
          nc.and(eu.z.object({ type: eu.z.literal("resource") })),
        ]),
        nd = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: nu,
        }),
        np = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: nu,
          messageId: tB.nullish(),
        }),
        ng = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          prompt: eu.z.array(nu),
          sessionId: A5,
        }),
        nh = eu.z.object({ anyOf: eu.z.array(eY) }),
        nf = eu.z.union([
          nd.and(eu.z.object({ type: eu.z.literal("content") })),
          ek.and(eu.z.object({ type: eu.z.literal("diff") })),
          rz.and(eu.z.object({ type: eu.z.literal("terminal") })),
        ]),
        nm = eu.z.string(),
        nE = eu.z.object({ sessionId: A5, toolCallId: nm.nullish() }),
        nC = eu.z.intersection(
          eu.z.union([nE, AN]),
          eu.z.object({ elicitationId: eU, url: eu.z.string().url() }),
        ),
        ny = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          line: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          path: eu.z.string(),
        }),
        nw = eu.z.union([
          eu.z.literal("pending"),
          eu.z.literal("in_progress"),
          eu.z.literal("completed"),
          eu.z.literal("failed"),
        ]),
        nB = eu.z.union([
          eu.z.literal("read"),
          eu.z.literal("edit"),
          eu.z.literal("delete"),
          eu.z.literal("move"),
          eu.z.literal("search"),
          eu.z.literal("execute"),
          eu.z.literal("think"),
          eu.z.literal("fetch"),
          eu.z.literal("switch_mode"),
          eu.z.literal("other"),
        ]),
        n_ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: defaultOnError(vecSkipError(nf).optional(), () => []),
          kind: nB.optional(),
          locations: defaultOnError(vecSkipError(ny).optional(), () => []),
          rawInput: eu.z.unknown().optional(),
          rawOutput: eu.z.unknown().optional(),
          status: nw.optional(),
          title: eu.z.string(),
          toolCallId: nm,
        }),
        nI = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          content: defaultOnError(vecSkipError(nf).nullish(), () => void 0),
          kind: defaultOnError(nB.nullish(), () => void 0),
          locations: defaultOnError(vecSkipError(ny).nullish(), () => void 0),
          rawInput: eu.z.unknown().optional(),
          rawOutput: eu.z.unknown().optional(),
          status: defaultOnError(nw.nullish(), () => void 0),
          title: eu.z.string().nullish(),
          toolCallId: nm,
        }),
        nv = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          options: eu.z.array(t1),
          sessionId: A5,
          toolCall: nI,
        }),
        nS = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          hint: eu.z.string(),
        }),
        nQ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          description: eu.z.string(),
          input: defaultOnError(nS.nullish(), () => void 0),
          name: eu.z.string(),
        }),
        nD = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          availableCommands: requiredDefaultOnError(vecSkipError(nQ), () => []),
        }),
        nT = eu.z.object({ enum: eu.z.array(eu.z.string()), type: eH }),
        nR = eu.z.union([nT, nh]),
        nk = eu.z.object({
          default: eu.z.array(eu.z.string()).nullish(),
          description: eu.z.string().nullish(),
          items: nR,
          maxItems: eu.z.number().nullish(),
          minItems: eu.z.number().nullish(),
          title: eu.z.string().nullish(),
        }),
        nM = eu.z.union([
          rY.and(eu.z.object({ type: eu.z.literal("string") })),
          tZ.and(eu.z.object({ type: eu.z.literal("number") })),
          e3.and(eu.z.object({ type: eu.z.literal("integer") })),
          ev.and(eu.z.object({ type: eu.z.literal("boolean") })),
          nk.and(eu.z.object({ type: eu.z.literal("array") })),
        ]),
        nx = eu.z.object({
          description: eu.z.string().nullish(),
          properties: eu.z.record(eu.z.string(), nM).optional().default({}),
          required: eu.z.array(eu.z.string()).nullish(),
          title: eu.z.string().nullish(),
          type: eG.optional().default("object"),
        }),
        nO = eu.z.intersection(
          eu.z.union([nE, AN]),
          eu.z.object({ requestedSchema: nx }),
        ),
        nN = eu.z.intersection(
          eu.z.union([
            nO.and(eu.z.object({ mode: eu.z.literal("form") })),
            nC.and(eu.z.object({ mode: eu.z.literal("url") })),
          ]),
          eu.z.object({
            _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
            message: eu.z.string(),
          }),
        ),
        nP = eu.z.object({
          cachedReadTokens: eu.z.number().nullish(),
          cachedWriteTokens: eu.z.number().nullish(),
          inputTokens: eu.z.number(),
          outputTokens: eu.z.number(),
          thoughtTokens: eu.z.number().nullish(),
          totalTokens: eu.z.number(),
        }),
        nL = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          stopReason: rK,
          usage: defaultOnError(nP.nullish(), () => void 0),
        });
      eu.z.union([
        eu.z.object({
          id: AO,
          result: eu.z.union([
            r9,
            e_,
            A_,
            rL,
            ex,
            tl,
            rM,
            rk,
            r_,
            eR,
            rR,
            rx,
            eQ,
            rG,
            rU,
            nL,
            rH,
            rq,
            eS,
            eX,
            tv,
          ]),
        }),
        eu.z.object({ error: eW, id: AO }),
      ]);
      let nF = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          cost: defaultOnError(eD.nullish(), () => void 0),
          size: eu.z.number(),
          used: eu.z.number(),
        }),
        nU = eu.z.union([
          np.and(
            eu.z.object({ sessionUpdate: eu.z.literal("user_message_chunk") }),
          ),
          np.and(
            eu.z.object({ sessionUpdate: eu.z.literal("agent_message_chunk") }),
          ),
          np.and(
            eu.z.object({ sessionUpdate: eu.z.literal("agent_thought_chunk") }),
          ),
          n_.and(eu.z.object({ sessionUpdate: eu.z.literal("tool_call") })),
          nI.and(
            eu.z.object({ sessionUpdate: eu.z.literal("tool_call_update") }),
          ),
          t5.and(eu.z.object({ sessionUpdate: eu.z.literal("plan") })),
          Au.and(eu.z.object({ sessionUpdate: eu.z.literal("plan_update") })),
          Al.and(eu.z.object({ sessionUpdate: eu.z.literal("plan_removed") })),
          nD.and(
            eu.z.object({
              sessionUpdate: eu.z.literal("available_commands_update"),
            }),
          ),
          rQ.and(
            eu.z.object({ sessionUpdate: eu.z.literal("current_mode_update") }),
          ),
          A3.and(
            eu.z.object({
              sessionUpdate: eu.z.literal("config_option_update"),
            }),
          ),
          rI.and(
            eu.z.object({ sessionUpdate: eu.z.literal("session_info_update") }),
          ),
          nF.and(eu.z.object({ sessionUpdate: eu.z.literal("usage_update") })),
        ]),
        nj = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          update: nU,
        });
      eu.z.object({
        method: eu.z.string(),
        params: eu.z.union([nj, ej, t_, eV]).nullish(),
      });
      let nG = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          sessionId: A5,
          terminalId: eu.z.string(),
        }),
        nH = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          exitCode: eu.z
            .number()
            .int()
            .gte(0)
            .max(0xffffffff, {
              message: "Invalid value: Expected uint32 to be <= 4294967295",
            })
            .nullish(),
          signal: eu.z.string().nullish(),
        }),
        nK = eu.z.object({ name: eu.z.string(), uri: eu.z.string() }),
        n$ = eu.z.object({
          _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
          repository: defaultOnError(tK.nullish(), () => void 0),
          workspaceFolders: defaultOnError(
            vecSkipError(nK).nullish(),
            () => void 0,
          ),
          workspaceUri: eu.z.string().nullish(),
        });
      eu.z.object({
        id: AO,
        method: eu.z.string(),
        params: eu.z
          .union([
            Ay,
            eB,
            e8,
            rP,
            eM,
            tn,
            tV,
            rm,
            e5,
            rl,
            rh,
            rw,
            rn,
            rj,
            rF,
            ng,
            n$,
            rJ,
            A7,
            tI,
            eZ,
          ])
          .nullish(),
      });
      let nY = eu.z.object({
        _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
        content: eu.z.string(),
        path: eu.z.string(),
        sessionId: A5,
      });
      eu.z.object({
        id: AO,
        method: eu.z.string(),
        params: eu.z
          .union([nY, rE, nv, ra, rV, ry, nG, rf, nN, tf, tI, tp, eZ])
          .nullish(),
      });
      let nJ = eu.z.object({
        _meta: eu.z.record(eu.z.string(), eu.z.unknown()).nullish(),
      });
      function ndJsonStream(eA, el) {
        let ec = new TextEncoder(),
          eu = new TextDecoder();
        return {
          readable: new ReadableStream({
            async start(eA) {
              let ec = "",
                ed = el.getReader();
              try {
                for (;;) {
                  let { value: el, done: ep } = await ed.read();
                  if (ep) {
                    ec += eu.decode();
                    break;
                  }
                  if (!el) continue;
                  let eg = (ec += eu.decode(el, { stream: !0 })).split("\n");
                  for (let el of ((ec = eg.pop() || ""), eg)) {
                    let ec = el.trim();
                    if (ec)
                      try {
                        let el = JSON.parse(ec);
                        eA.enqueue(el);
                      } catch (eA) {
                        console.error("Failed to parse JSON message:", ec, eA);
                      }
                  }
                }
                let el = ec.trim();
                if (el)
                  try {
                    let ec = JSON.parse(el);
                    eA.enqueue(ec);
                  } catch (eA) {
                    console.error("Failed to parse JSON message:", el, eA);
                  }
              } catch (el) {
                eA.error(el);
                return;
              } finally {
                ed.releaseLock();
              }
              eA.close();
            },
          }),
          writable: new WritableStream({
            async write(el) {
              let eu = JSON.stringify(el) + "\n",
                ed = eA.getWriter();
              try {
                await ed.write(ec.encode(eu));
              } finally {
                ed.releaseLock();
              }
            },
          }),
        };
      }
      function emptyObjectResponse(eA) {
        return eA ?? {};
      }
      function rejectedPromise(eA) {
        let el = Promise.reject(eA);
        return (el.catch(() => {}), el);
      }
      eu.z.union([
        eu.z.object({
          id: AO,
          result: eu.z.union([
            nJ,
            AM,
            AK,
            eT,
            rZ,
            Ax,
            nH,
            e4,
            eL,
            td,
            eO,
            eX,
            tv,
          ]),
        }),
        eu.z.object({ error: eW, id: AO }),
      ]);
      let AgentSideConnection = class AgentSideConnection {
        connection;
        constructor(eA, el) {
          const ec = eA(this),
            requestHandler = async (eA, el) => {
              switch (eA) {
                case ed.initialize: {
                  let eA = Ay.parse(el);
                  return ec.initialize(eA);
                }
                case ed.session_new: {
                  let eA = tV.parse(el);
                  return ec.newSession(eA);
                }
                case ed.session_load: {
                  if (!ec.loadSession) throw RequestError.methodNotFound(eA);
                  let eu = rm.parse(el);
                  return ec.loadSession(eu);
                }
                case ed.session_list: {
                  if (!ec.listSessions) throw RequestError.methodNotFound(eA);
                  let eu = e5.parse(el);
                  return ec.listSessions(eu);
                }
                case ed.session_delete: {
                  if (!ec.deleteSession) throw RequestError.methodNotFound(eA);
                  let eu = rl.parse(el);
                  return (await ec.deleteSession(eu)) ?? {};
                }
                case ed.session_fork: {
                  if (!ec.unstable_forkSession)
                    throw RequestError.methodNotFound(eA);
                  let eu = rh.parse(el);
                  return ec.unstable_forkSession(eu);
                }
                case ed.session_resume: {
                  if (!ec.resumeSession) throw RequestError.methodNotFound(eA);
                  let eu = rw.parse(el);
                  return ec.resumeSession(eu);
                }
                case ed.session_close: {
                  if (!ec.closeSession) throw RequestError.methodNotFound(eA);
                  let eu = rn.parse(el);
                  return (await ec.closeSession(eu)) ?? {};
                }
                case ed.session_set_mode: {
                  if (!ec.setSessionMode) throw RequestError.methodNotFound(eA);
                  let eu = rj.parse(el);
                  return (await ec.setSessionMode(eu)) ?? {};
                }
                case ed.authenticate: {
                  let eA = eB.parse(el);
                  return (await ec.authenticate(eA)) ?? {};
                }
                case ed.providers_list: {
                  if (!ec.unstable_listProviders)
                    throw RequestError.methodNotFound(eA);
                  let eu = e8.parse(el);
                  return ec.unstable_listProviders(eu);
                }
                case ed.providers_set: {
                  if (!ec.unstable_setProvider)
                    throw RequestError.methodNotFound(eA);
                  let eu = rP.parse(el);
                  return (await ec.unstable_setProvider(eu)) ?? {};
                }
                case ed.providers_disable: {
                  if (!ec.unstable_disableProvider)
                    throw RequestError.methodNotFound(eA);
                  let eu = eM.parse(el);
                  return (await ec.unstable_disableProvider(eu)) ?? {};
                }
                case ed.logout: {
                  if (!ec.logout) throw RequestError.methodNotFound(eA);
                  let eu = tn.parse(el);
                  return (await ec.logout(eu)) ?? {};
                }
                case ed.session_prompt: {
                  let eA = ng.parse(el);
                  return ec.prompt(eA);
                }
                case ed.session_set_config_option: {
                  if (!ec.setSessionConfigOption)
                    throw RequestError.methodNotFound(eA);
                  let eu = rF.parse(el);
                  return ec.setSessionConfigOption(eu);
                }
                case ed.nes_start: {
                  if (!ec.unstable_startNes)
                    throw RequestError.methodNotFound(eA);
                  let eu = n$.parse(el);
                  return ec.unstable_startNes(eu);
                }
                case ed.nes_suggest: {
                  if (!ec.unstable_suggestNes)
                    throw RequestError.methodNotFound(eA);
                  let eu = rJ.parse(el);
                  return ec.unstable_suggestNes(eu);
                }
                case ed.nes_close: {
                  if (!ec.unstable_closeNes)
                    throw RequestError.methodNotFound(eA);
                  let eu = A7.parse(el);
                  return (await ec.unstable_closeNes(eu)) ?? {};
                }
                default:
                  if (ec.extMethod) return ec.extMethod(eA, el);
                  throw RequestError.methodNotFound(eA);
              }
            },
            notificationHandler = async (eA, el) => {
              switch (eA) {
                case ed.session_cancel: {
                  let eA = A9.parse(el);
                  return ec.cancel(eA);
                }
                case ed.document_did_open: {
                  if (!ec.unstable_didOpenDocument) return;
                  let eA = rp.parse(el);
                  return ec.unstable_didOpenDocument(eA);
                }
                case ed.document_did_change: {
                  if (!ec.unstable_didChangeDocument) return;
                  let eA = r1.parse(el);
                  return ec.unstable_didChangeDocument(eA);
                }
                case ed.document_did_close: {
                  if (!ec.unstable_didCloseDocument) return;
                  let eA = rc.parse(el);
                  return ec.unstable_didCloseDocument(eA);
                }
                case ed.document_did_save: {
                  if (!ec.unstable_didSaveDocument) return;
                  let eA = rg.parse(el);
                  return ec.unstable_didSaveDocument(eA);
                }
                case ed.document_did_focus: {
                  if (!ec.unstable_didFocusDocument) return;
                  let eA = rd.parse(el);
                  return ec.unstable_didFocusDocument(eA);
                }
                case ed.nes_accept: {
                  if (!ec.unstable_acceptNes) return;
                  let eA = A6.parse(el);
                  return ec.unstable_acceptNes(eA);
                }
                case ed.nes_reject: {
                  if (!ec.unstable_rejectNes) return;
                  let eA = rC.parse(el);
                  return ec.unstable_rejectNes(eA);
                }
                default:
                  if (ec.extNotification) return ec.extNotification(eA, el);
                  throw RequestError.methodNotFound(eA);
              }
            };
          this.connection = new Connection(
            requestHandler,
            notificationHandler,
            el,
          );
        }
        sessionUpdate(eA) {
          return this.connection.sendNotification(ep.session_update, eA);
        }
        requestPermission(eA) {
          return this.connection.sendRequest(ep.session_request_permission, eA);
        }
        readTextFile(eA) {
          return this.connection.sendRequest(ep.fs_read_text_file, eA);
        }
        writeTextFile(eA) {
          return this.connection.sendRequest(
            ep.fs_write_text_file,
            eA,
            emptyObjectResponse,
          );
        }
        createTerminal(eA) {
          return this.connection.sendRequest(
            ep.terminal_create,
            eA,
            (el) =>
              new TerminalHandle(el.terminalId, eA.sessionId, this.connection),
          );
        }
        unstable_createElicitation(eA) {
          return this.connection.sendRequest(ep.elicitation_create, eA);
        }
        unstable_completeElicitation(eA) {
          return this.connection.sendNotification(ep.elicitation_complete, eA);
        }
        extMethod(eA, el) {
          return this.connection.sendRequest(eA, el);
        }
        extNotification(eA, el) {
          return this.connection.sendNotification(eA, el);
        }
        get signal() {
          return this.connection.signal;
        }
        get closed() {
          return this.connection.closed;
        }
      };
      let TerminalHandle = class TerminalHandle {
        id;
        sessionId;
        connection;
        constructor(eA, el, ec) {
          ((this.id = eA), (this.sessionId = el), (this.connection = ec));
        }
        currentOutput() {
          return this.connection.sendRequest(ep.terminal_output, {
            sessionId: this.sessionId,
            terminalId: this.id,
          });
        }
        waitForExit() {
          return this.connection.sendRequest(ep.terminal_wait_for_exit, {
            sessionId: this.sessionId,
            terminalId: this.id,
          });
        }
        kill() {
          return this.connection.sendRequest(
            ep.terminal_kill,
            { sessionId: this.sessionId, terminalId: this.id },
            emptyObjectResponse,
          );
        }
        release() {
          return this.connection.sendRequest(
            ep.terminal_release,
            { sessionId: this.sessionId, terminalId: this.id },
            emptyObjectResponse,
          );
        }
        async [Symbol.asyncDispose]() {
          await this.release();
        }
      };
      let ClientSideConnection = class ClientSideConnection {
        connection;
        constructor(eA, el) {
          const ec = eA(this),
            requestHandler = async (eA, el) => {
              switch (eA) {
                case ep.fs_write_text_file: {
                  let eA = nY.parse(el);
                  return (await ec.writeTextFile?.(eA)) ?? {};
                }
                case ep.fs_read_text_file: {
                  let eA = rE.parse(el);
                  return ec.readTextFile?.(eA);
                }
                case ep.session_request_permission: {
                  let eA = nv.parse(el);
                  return ec.requestPermission(eA);
                }
                case ep.terminal_create: {
                  let eA = ra.parse(el);
                  return ec.createTerminal?.(eA);
                }
                case ep.terminal_output: {
                  let eA = rV.parse(el);
                  return ec.terminalOutput?.(eA);
                }
                case ep.terminal_release: {
                  let eA = ry.parse(el);
                  return (await ec.releaseTerminal?.(eA)) ?? {};
                }
                case ep.terminal_wait_for_exit: {
                  let eA = nG.parse(el);
                  return ec.waitForTerminalExit?.(eA);
                }
                case ep.terminal_kill: {
                  let eA = rf.parse(el);
                  return (await ec.killTerminal?.(eA)) ?? {};
                }
                case ep.elicitation_create: {
                  if (!ec.unstable_createElicitation)
                    throw RequestError.methodNotFound(eA);
                  let eu = nN.parse(el);
                  return ec.unstable_createElicitation(eu);
                }
                default:
                  if (ec.extMethod) return ec.extMethod(eA, el);
                  throw RequestError.methodNotFound(eA);
              }
            },
            notificationHandler = async (eA, el) => {
              switch (eA) {
                case ep.session_update: {
                  let eA = nj.parse(el);
                  return ec.sessionUpdate(eA);
                }
                case ep.elicitation_complete: {
                  if (!ec.unstable_completeElicitation) return;
                  let eA = ej.parse(el);
                  return ec.unstable_completeElicitation(eA);
                }
                default:
                  if (ec.extNotification) return ec.extNotification(eA, el);
                  throw RequestError.methodNotFound(eA);
              }
            };
          this.connection = new Connection(
            requestHandler,
            notificationHandler,
            el,
          );
        }
        initialize(eA) {
          return this.connection.sendRequest(ed.initialize, eA);
        }
        newSession(eA) {
          return this.connection.sendRequest(ed.session_new, eA);
        }
        loadSession(eA) {
          return this.connection.sendRequest(
            ed.session_load,
            eA,
            emptyObjectResponse,
          );
        }
        unstable_forkSession(eA) {
          return this.connection.sendRequest(ed.session_fork, eA);
        }
        listSessions(eA) {
          return this.connection.sendRequest(ed.session_list, eA);
        }
        deleteSession(eA) {
          return this.connection.sendRequest(
            ed.session_delete,
            eA,
            emptyObjectResponse,
          );
        }
        resumeSession(eA) {
          return this.connection.sendRequest(ed.session_resume, eA);
        }
        closeSession(eA) {
          return this.connection.sendRequest(ed.session_close, eA);
        }
        setSessionMode(eA) {
          return this.connection.sendRequest(
            ed.session_set_mode,
            eA,
            emptyObjectResponse,
          );
        }
        setSessionConfigOption(eA) {
          return this.connection.sendRequest(ed.session_set_config_option, eA);
        }
        authenticate(eA) {
          return this.connection.sendRequest(
            ed.authenticate,
            eA,
            emptyObjectResponse,
          );
        }
        unstable_listProviders(eA) {
          return this.connection.sendRequest(ed.providers_list, eA);
        }
        unstable_setProvider(eA) {
          return this.connection.sendRequest(
            ed.providers_set,
            eA,
            emptyObjectResponse,
          );
        }
        unstable_disableProvider(eA) {
          return this.connection.sendRequest(
            ed.providers_disable,
            eA,
            emptyObjectResponse,
          );
        }
        logout(eA) {
          return this.connection.sendRequest(
            ed.logout,
            eA,
            emptyObjectResponse,
          );
        }
        prompt(eA) {
          return this.connection.sendRequest(ed.session_prompt, eA);
        }
        cancel(eA) {
          return this.connection.sendNotification(ed.session_cancel, eA);
        }
        unstable_startNes(eA) {
          return this.connection.sendRequest(ed.nes_start, eA);
        }
        unstable_suggestNes(eA) {
          return this.connection.sendRequest(ed.nes_suggest, eA);
        }
        unstable_closeNes(eA) {
          return this.connection.sendRequest(
            ed.nes_close,
            eA,
            emptyObjectResponse,
          );
        }
        unstable_didOpenDocument(eA) {
          return this.connection.sendNotification(ed.document_did_open, eA);
        }
        unstable_didChangeDocument(eA) {
          return this.connection.sendNotification(ed.document_did_change, eA);
        }
        unstable_didCloseDocument(eA) {
          return this.connection.sendNotification(ed.document_did_close, eA);
        }
        unstable_didSaveDocument(eA) {
          return this.connection.sendNotification(ed.document_did_save, eA);
        }
        unstable_didFocusDocument(eA) {
          return this.connection.sendNotification(ed.document_did_focus, eA);
        }
        unstable_acceptNes(eA) {
          return this.connection.sendNotification(ed.nes_accept, eA);
        }
        unstable_rejectNes(eA) {
          return this.connection.sendNotification(ed.nes_reject, eA);
        }
        extMethod(eA, el) {
          return this.connection.sendRequest(eA, el);
        }
        extNotification(eA, el) {
          return this.connection.sendNotification(eA, el);
        }
        get signal() {
          return this.connection.signal;
        }
        get closed() {
          return this.connection.closed;
        }
      };
      let Connection = class Connection {
        pendingResponses = new Map();
        nextRequestId = 0;
        requestHandler;
        notificationHandler;
        stream;
        writeQueue = Promise.resolve();
        abortController = new AbortController();
        closedPromise;
        constructor(eA, el, ec) {
          ((this.requestHandler = eA),
            (this.notificationHandler = el),
            (this.stream = ec),
            (this.closedPromise = new Promise((eA) => {
              this.abortController.signal.addEventListener("abort", () => eA());
            })),
            this.receive());
        }
        get signal() {
          return this.abortController.signal;
        }
        get closed() {
          return this.closedPromise;
        }
        async receive() {
          let eA;
          try {
            let eA = this.stream.readable.getReader();
            try {
              for (; !this.abortController.signal.aborted; ) {
                let { value: el, done: ec } = await eA.read();
                if (ec) break;
                if (el)
                  try {
                    this.processMessage(el);
                  } catch (eA) {
                    (console.error(
                      "Unexpected error during message processing:",
                      el,
                      eA,
                    ),
                      "id" in el &&
                        void 0 !== el.id &&
                        this.sendMessage({
                          jsonrpc: "2.0",
                          id: el.id,
                          error: { code: -32700, message: "Parse error" },
                        }));
                  }
              }
            } finally {
              eA.releaseLock();
            }
          } catch (el) {
            eA = el;
          } finally {
            this.close(eA);
          }
        }
        close(eA) {
          if (this.abortController.signal.aborted) return;
          let el = eA ?? Error("ACP connection closed");
          for (let eA of this.pendingResponses.values()) eA.reject(el);
          (this.pendingResponses.clear(), this.abortController.abort(el));
        }
        async processMessage(eA) {
          if ("method" in eA && "id" in eA) {
            let el = await this.tryCallRequestHandler(eA.method, eA.params);
            ("error" in el &&
              console.error("Error handling request", eA, el.error),
              await this.sendMessage({ jsonrpc: "2.0", id: eA.id, ...el }));
          } else if ("method" in eA) {
            let el = await this.tryCallNotificationHandler(
              eA.method,
              eA.params,
            );
            "error" in el &&
              console.error("Error handling notification", eA, el.error);
          } else
            "id" in eA
              ? this.handleResponse(eA)
              : console.error("Invalid message", { message: eA });
        }
        async tryCallRequestHandler(eA, el) {
          try {
            return { result: (await this.requestHandler(eA, el)) ?? null };
          } catch (el) {
            let eA;
            if (el instanceof RequestError) return el.toResult();
            if (el instanceof eu.z.ZodError)
              return RequestError.invalidParams(el.format()).toResult();
            el instanceof Error
              ? (eA = el.message)
              : "object" == typeof el &&
                null != el &&
                "message" in el &&
                "string" == typeof el.message &&
                (eA = el.message);
            try {
              return RequestError.internalError(
                eA ? JSON.parse(eA) : {},
              ).toResult();
            } catch {
              return RequestError.internalError({ details: eA }).toResult();
            }
          }
        }
        async tryCallNotificationHandler(eA, el) {
          try {
            return (await this.notificationHandler(eA, el), { result: null });
          } catch (el) {
            let eA;
            if (el instanceof RequestError) return el.toResult();
            if (el instanceof eu.z.ZodError)
              return RequestError.invalidParams(el.format()).toResult();
            el instanceof Error
              ? (eA = el.message)
              : "object" == typeof el &&
                null != el &&
                "message" in el &&
                "string" == typeof el.message &&
                (eA = el.message);
            try {
              return RequestError.internalError(
                eA ? JSON.parse(eA) : {},
              ).toResult();
            } catch {
              return RequestError.internalError({ details: eA }).toResult();
            }
          }
        }
        handleResponse(eA) {
          let el = this.pendingResponses.get(eA.id);
          if (el) {
            if ("result" in eA) el.resolve(eA.result);
            else if ("error" in eA) {
              let { code: ec, message: eu, data: ed } = eA.error;
              el.reject(new RequestError(ec, eu, ed));
            }
            this.pendingResponses.delete(eA.id);
          } else console.error("Got response to unknown request", eA.id);
        }
        sendRequest(eA, el, ec) {
          if (this.abortController.signal.aborted)
            return rejectedPromise(this.closedReason());
          let eu = this.nextRequestId++,
            ed = new Promise((eA, el) => {
              this.pendingResponses.set(eu, {
                resolve: (eu) => {
                  try {
                    eA(ec ? ec(eu) : eu);
                  } catch (eA) {
                    el(eA);
                  }
                },
                reject: el,
              });
            });
          return (
            ed.catch(() => {}),
            this.sendMessage({
              jsonrpc: "2.0",
              id: eu,
              method: eA,
              params: el,
            }),
            ed
          );
        }
        sendNotification(eA, el) {
          return this.abortController.signal.aborted
            ? rejectedPromise(this.closedReason())
            : this.sendMessage({ jsonrpc: "2.0", method: eA, params: el });
        }
        closedReason() {
          return (
            this.abortController.signal.reason ?? Error("ACP connection closed")
          );
        }
        async sendMessage(eA) {
          return (
            (this.writeQueue = this.writeQueue
              .then(async () => {
                let el = this.stream.writable.getWriter();
                try {
                  await el.write(eA);
                } finally {
                  el.releaseLock();
                }
              })
              .catch((eA) => {
                this.close(eA);
              })),
            this.writeQueue
          );
        }
      };
      let RequestError = class RequestError extends Error {
        code;
        data;
        constructor(eA, el, ec) {
          (super(el),
            (this.code = eA),
            (this.name = "RequestError"),
            (this.data = ec));
        }
        static parseError(eA, el) {
          return new RequestError(
            -32700,
            `Parse error${el ? `: ${el}` : ""}`,
            eA,
          );
        }
        static invalidRequest(eA, el) {
          return new RequestError(
            -32600,
            `Invalid request${el ? `: ${el}` : ""}`,
            eA,
          );
        }
        static methodNotFound(eA) {
          return new RequestError(-32601, `"Method not found": ${eA}`, {
            method: eA,
          });
        }
        static invalidParams(eA, el) {
          return new RequestError(
            -32602,
            `Invalid params${el ? `: ${el}` : ""}`,
            eA,
          );
        }
        static internalError(eA, el) {
          return new RequestError(
            -32603,
            `Internal error${el ? `: ${el}` : ""}`,
            eA,
          );
        }
        static authRequired(eA, el) {
          return new RequestError(
            -32e3,
            `Authentication required${el ? `: ${el}` : ""}`,
            eA,
          );
        }
        static resourceNotFound(eA) {
          return new RequestError(
            -32002,
            `Resource not found${eA ? `: ${eA}` : ""}`,
            eA && { uri: eA },
          );
        }
        toResult() {
          return {
            error: { code: this.code, message: this.message, data: this.data },
          };
        }
        toErrorResponse() {
          return { code: this.code, message: this.message, data: this.data };
        }
      };
    },
  };
  const implementation = runtime.zod ?? getAcpZodRuntime();
  if (
    implementation.core?.version &&
    [
      implementation.core.version.major,
      implementation.core.version.minor,
      implementation.core.version.patch,
    ].join(".") !== ACP_SDK_ZOD_VERSION
  )
    throw Error("Captured ACP SDK requires Zod " + ACP_SDK_ZOD_VERSION);
  const load: any = (id: number) => {
    if (id === 25223) return implementation;
    throw Error("Unexpected captured ACP SDK dependency: " + id);
  };
  load.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  load.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      if (!Object.hasOwn(exports, key))
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: defs[key],
        });
  };
  const module = { exports: {} };
  factories[38113](module, module.exports, load);
  return module.exports as any;
}
