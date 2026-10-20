import vm from "node:vm";
import { WorkflowConcurrencyConstants as Constants } from "./subagent-types.js";
import { WorkflowAbortedError, WorkflowSandboxError } from "./workflow-errors.js";
import { WorkflowRuntimePrelude } from "./workflow-runtime-prelude.js";
import { toJsonSafe } from "./workflow-sandbox.js";
import type { WorkflowExecution } from "./workflow-execution.js";
import type { CompiledWorkflow, WorkflowRunRequest } from "./workflow-types.js";
export type NestedWorkflowRequest = { name: string; compiled: CompiledWorkflow; args?: unknown; parentRequest: WorkflowRunRequest; parentExecution: WorkflowExecution };
/** Native 8871665..8873121. Nested phase ignores name and unconditionally calls
 * body; nested timers are ordinary timers, not the root abort-aware wrapper. */
export class NestedWorkflowRunner {
  constructor(readonly prelude = new WorkflowRuntimePrelude()) {}
  async run(request: NestedWorkflowRequest): Promise<unknown> { if (request.parentRequest.abortController.signal.aborted) throw new WorkflowAbortedError("parent-aborted-before-nested"); const globals = this.composeNestedSandbox(request), context = vm.createContext(globals, { name: `workflow-${request.parentRequest.runId}/nested:${request.name}`, codeGeneration: { strings: false, wasm: false } }); new vm.Script(this.prelude.build(0), { filename: "<nested-prelude>" }).runInContext(context, { timeout: Constants.SCRIPT_SYNC_TIMEOUT_MS }); let result; try { result = request.compiled.script.runInContext(context, { timeout: Constants.SCRIPT_SYNC_TIMEOUT_MS, breakOnSigint: true }); } catch (error) { throw new WorkflowSandboxError(`Nested workflow "${request.name}" threw: ${(error as any).message}`, { cause: error }); } return this.awaitTopLevel(result); }
  composeNestedSandbox(request: NestedWorkflowRequest): Record<string, unknown> { const prefix = `[${request.name}]`, parentLog = request.parentExecution.hooks.log, log = (...values: unknown[]) => parentLog(prefix, ...values), console = { log, warn: log, error: log, info: log, debug: log }; return { agent: request.parentExecution.hooks.agent, parallel: request.parentExecution.hooks.parallel, pipeline: request.parentExecution.hooks.pipeline, phase: (_name: unknown, el: () => unknown) => el(), log, args: this.toJsonSafe(request.args), console, setTimeout: (callback: () => void, delay: number) => setTimeout(callback, Math.max(0, Math.min(delay, 60000))), clearTimeout: (handle: ReturnType<typeof setTimeout>) => clearTimeout(handle), Promise, Symbol, Map, Set, JSON, RegExp, Number, Boolean, String, Array, Object, Error }; }
  async awaitTopLevel(value: any): Promise<any> { return value && typeof value.then === "function" ? await value : value; }
  toJsonSafe(value: unknown): any { return toJsonSafe(value); }
}
