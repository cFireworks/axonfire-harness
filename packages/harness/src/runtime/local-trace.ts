import { NoopTrace } from "@openai/agents-core";
/** SDK 0.5.2 clones its AsyncLocal trace context; inherited NoopTrace.clone returns a normal Trace.
 * Preserve the no-op identity across SDK clone/continuation boundaries without mutating global processors. */
export class LocalNoopTrace extends NoopTrace {
  override clone(): LocalNoopTrace {
    return new LocalNoopTrace();
  }
}
