import type {
  Model,
  ModelProvider,
  ModelRequest,
  ModelResponse,
  ResponseStreamEvent,
} from "@openai/agents-core";
import {
  ENV_REPLAY_SPEED,
  ENV_REPLAY_STRICT,
  getRecordReplayMode,
  type RecordReplayMode,
} from "./record-replay-config.js";
import type { RecordingStore, RecordingEntry } from "./recording-store.js";
/** Native 9012653..9013585. Request is written before delegation; failed or
 * partially-consumed streams intentionally leave no response entry. */
export class RecordingModel implements Model {
  constructor(
    readonly delegate: Model,
    readonly modelName: string,
    readonly store: RecordingStore,
  ) {}
  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const turnId = this.store.nextTurnId(),
      timestamp = Date.now();
    this.store.writeEntry({
      type: "request",
      turnId,
      modelName: this.modelName,
      timestamp,
      streaming: false,
      request: serializeRequest(request),
    });
    const response = await this.delegate.getResponse(request);
    this.store.writeEntry({
      type: "response",
      turnId,
      modelName: this.modelName,
      timestamp: Date.now(),
      streaming: false,
      response,
    });
    return response;
  }
  async *getStreamedResponse(
    request: ModelRequest,
  ): AsyncIterable<ResponseStreamEvent> {
    const turnId = this.store.nextTurnId(),
      timestamp = Date.now();
    this.store.writeEntry({
      type: "request",
      turnId,
      modelName: this.modelName,
      timestamp,
      streaming: true,
      request: serializeRequest(request),
    });
    const events: { event: ResponseStreamEvent; offsetMs: number }[] = [],
      start = Date.now();
    for await (const event of this.delegate.getStreamedResponse(request)) {
      events.push({ event, offsetMs: Date.now() - start });
      yield event;
    }
    this.store.writeEntry({
      type: "stream_response",
      turnId,
      modelName: this.modelName,
      timestamp: Date.now(),
      streaming: true,
      events,
    });
  }
}
export function serializeRequest(
  request: ModelRequest,
): Omit<ModelRequest, "signal"> {
  const { signal: _signal, ...rest } = request;
  return rest;
}
export class ReplayExhaustedError extends Error {
  constructor(model: string, type: string) {
    super(
      `[ReplayModel] No more recorded responses for model "${model}". Expected a ${type} response. The recording may have fewer turns for this model than the current execution.`,
    );
    this.name = "ReplayExhaustedError";
  }
}
export class ReplayTypeMismatchError extends Error {
  constructor(expected: string, actual: string) {
    super(
      `[ReplayModel] Response type mismatch. Expected "${expected}", got "${actual}". The recording may have been captured with a different streaming mode.`,
    );
    this.name = "ReplayTypeMismatchError";
  }
}
/** Native 9013666..9014705. Strict checks model name only, after consume. */
export class ReplayModel implements Model {
  constructor(
    readonly modelName: string,
    readonly store: RecordingStore,
    readonly env: NodeJS.ProcessEnv = process.env,
  ) {}
  async getResponse(_request: ModelRequest): Promise<ModelResponse> {
    const entry = this.store.consumeNextResponse(this.modelName);
    if (!entry) throw new ReplayExhaustedError(this.modelName, "non-streaming");
    if (entry.type !== "response")
      throw new ReplayTypeMismatchError("response", entry.type);
    this.validateIfStrict(entry);
    return entry.response;
  }
  async *getStreamedResponse(
    _request: ModelRequest,
  ): AsyncIterable<ResponseStreamEvent> {
    const entry = this.store.consumeNextResponse(this.modelName);
    if (!entry) throw new ReplayExhaustedError(this.modelName, "streaming");
    if (entry.type !== "stream_response")
      throw new ReplayTypeMismatchError("stream_response", entry.type);
    this.validateIfStrict(entry);
    const speed = parseFloat(this.env[ENV_REPLAY_SPEED] || "0");
    let previous = 0;
    for (const { event, offsetMs } of entry.events) {
      if (speed > 0) {
        const delay = (offsetMs - previous) / speed;
        if (delay > 1)
          await new Promise((resolve) => setTimeout(resolve, delay));
        previous = offsetMs;
      }
      yield event;
    }
  }
  validateIfStrict(entry: RecordingEntry): void {
    if (
      this.env[ENV_REPLAY_STRICT] &&
      entry.modelName &&
      entry.modelName !== this.modelName
    )
      throw new Error(
        `[ReplayModel] Strict mode: model name mismatch. Expected "${entry.modelName}" (from recording), got "${this.modelName}".`,
      );
  }
}
/** Native 9015846..9016315; explicit constructor replaces product DI. */
export class RecordReplayModelProvider implements ModelProvider {
  readonly mode: RecordReplayMode;
  constructor(
    readonly originalProvider: ModelProvider,
    readonly store: RecordingStore,
    readonly logger: { info(message: string): void } = { info() {} },
    readonly env: NodeJS.ProcessEnv = process.env,
  ) {
    this.mode = getRecordReplayMode(env);
  }
  async getModel(name?: string): Promise<Model> {
    if (this.mode === "passthrough")
      return this.originalProvider.getModel(name);
    const model = name || "unknown";
    if (this.mode === "record") {
      this.logger.info(
        `[RecordReplay] Recording mode: wrapping model "${model}"`,
      );
      return new RecordingModel(
        await this.originalProvider.getModel(name),
        model,
        this.store,
      );
    }
    this.logger.info(
      `[RecordReplay] Replay mode: serving recorded responses for "${model}"`,
    );
    return new ReplayModel(model, this.store, this.env);
  }
}
