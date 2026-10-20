import { parse } from "acorn";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { RunResultUtils } from "../../src/agents/run-result-utils.js";
import { ModelErrorUtils } from "../../src/models/model-error-utils.js";
import { SessionRunEventType } from "../../src/sessions/run-state-types.js";
import { NativeHistoryInputUtils } from "../../src/sessions/input-processor-utils.js";
export function loadCapturedSessionResult(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const classes: any[] = [],
    functions: any[] = [];
  function visit(n: any) {
    if (!n || typeof n !== "object") return;
    if (["ClassDeclaration", "ClassExpression"].includes(n.type))
      classes.push(n);
    if (n.type === "FunctionDeclaration") functions.push(n);
    for (const [key, value] of Object.entries(n))
      if (!["start", "end"].includes(key)) {
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") visit(value);
      }
  }
  visit(parse(source, { ecmaVersion: "latest" }));
  const owner = (p: number) =>
    classes
      .filter((c) => c.start <= p && c.end > p)
      .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
  const selected = (p: number, names: string[]) =>
    names
      .map((name) => {
        const method = owner(p).body.body.find(
          (m: any) => m.key?.name === name,
        );
        if (!method) throw Error("source method missing: " + name);
        return source.slice(method.start, method.end);
      })
      .join("\n");
  const draft = source.slice(10949890, 10954861),
    iterator = functions.find((n) => n.id?.name === "createAbortableIterator");
  if (!iterator || !draft.startsWith("class AbortedStreamDraftStore"))
    throw Error("source boundaries");
  const constant = source.slice(
    source.indexOf("let A_=(()=>{", 10954861),
    iterator.start,
  );
  const managerMethods = selected(10964174, [
    "resetIdleTimer",
    "emitSessionStart",
    "initRunResultHandler",
    "handleRunResult",
    "handleStreamRunResult",
    "handleContentFilteredResponse",
    "handleNonStreamRunResult",
  ]);
  const inputMethods = selected(13270300, [
    "isContentFilterCandidateUserMessage",
    "findLatestContentFilterCandidateUserMessageId",
    "isContentFilterNoticeItem",
    "createContentFilterNoticeMessage",
  ]);
  return {
    draft(generateUUUID: () => string): any {
      return runInNewContext(`(${draft})`, { t5: { generateUUUID } });
    },
    iterator(runtime: any): any {
      return runInNewContext(
        `(()=>{${constant}${source.slice(iterator.start, iterator.end)};return {createAbortableIterator,abortGraceMs:A_}})()`,
        {
          process: { env: runtime.env },
          setTimeout: runtime.setTimeout,
          clearTimeout: runtime.clearTimeout,
        },
      );
    },
    input(generateUUUID: () => string): any {
      return runInNewContext(
        `(class InputItemUtils extends NativeHistoryInputUtils { static CONTENT_FILTER_NOTICE_TEXT="This topic is currently outside the scope of my capabilities, so I'm unable to discuss it further.";${inputMethods}})`,
        {
          NativeHistoryInputUtils,
          eu: { generateUUUID },
          ep: { AgentNames: { COMPACT: "compact" } },
        },
      );
    },
    lifecycle: class CapturedSessionResult {
      constructor(runtime: any, dependencies: any) {
        const Original = runInNewContext(
          `(class SessionManager {${managerMethods}})`,
          {
            Date: { now: runtime.now },
            setTimeout: runtime.setTimeout,
            clearTimeout: runtime.clearTimeout,
            AbortedStreamDraftStore: class {
              constructor() {
                return runtime.createDraftStore();
              }
            },
            createAbortableIterator: runtime.createAbortableIterator,
            AB: {
              RunResultUtils,
              ErrorUtils: {
                ...ModelErrorUtils,
                mapMessageErrorCode: runtime.mapMessageErrorCode,
              },
              InputItemUtils: runtime.inputItemUtils,
            },
            t4: { SessionRunEventType },
            Ah: { NotificationType: { IDLE_PROMPT: "idle_prompt" } },
          },
        );
        Object.assign(this, dependencies, {
          runtime,
          resultSubscriptions: new Map(),
          idleTimers: new Map(),
          inflightSessionStarts: new WeakMap(),
        });
        Object.setPrototypeOf(this, Original.prototype);
      }
    },
  };
}
