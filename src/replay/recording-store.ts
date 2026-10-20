import {
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  ENV_RECORD_DIR,
  ENV_REPLAY_DIR,
  REPLAY_ENV_KEYS,
} from "./record-replay-config.js";
export const RecordingStore = Symbol("RecordingStore");
export type RecordingEntry = { type: string; [key: string]: any };
export interface RecordingStore {
  nextTurnId(): number;
  writeEntry(entry: RecordingEntry): void;
  consumeNextResponse(model: string): RecordingEntry | undefined;
  peekNextResponse(model: string): RecordingEntry | undefined;
  getResponseCount(): number;
  getRecordedModelNames(): string[];
  close(): void;
}
/** Native 9009857..9012563. Synchronous JSONL; first recording truncates file.
 * No redaction/locking/validation beyond the sample. env is explicit host DI. */
export class RecordingStoreImpl implements RecordingStore {
  turnCounter = 0;
  recordFilePath: string | null = null;
  readonly modelQueues = new Map<string, RecordingEntry[]>();
  readonly modelQueueIndex = new Map<string, number>();
  totalResponseCount = 0;
  initialized = false;
  constructor(readonly env: NodeJS.ProcessEnv = process.env) {}
  ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    const record = this.env[ENV_RECORD_DIR],
      replay = this.env[ENV_REPLAY_DIR];
    if (record) this.initRecordMode(record);
    else if (replay) this.initReplayMode(replay);
  }
  initRecordMode(directory: string): void {
    mkdirSync(directory, { recursive: true });
    this.recordFilePath = join(directory, "recording.jsonl");
    const replayEnv: NodeJS.ProcessEnv = {};
    for (const key of REPLAY_ENV_KEYS)
      if (this.env[key]) replayEnv[key] = this.env[key];
    const metadata = {
      type: "metadata",
      version: 1,
      createdAt: new Date().toISOString(),
      replayEnv: Object.keys(replayEnv).length > 0 ? replayEnv : undefined,
    };
    writeFileSync(
      this.recordFilePath,
      JSON.stringify(metadata) + "\n",
      "utf-8",
    );
  }
  initReplayMode(directory: string): void {
    const file = join(directory, "recording.jsonl");
    if (!existsSync(file))
      throw new Error(`[RecordingStore] Recording file not found: ${file}`);
    const entries: RecordingEntry[] = readFileSync(file, "utf-8")
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line)),
      metadata = entries.find((entry) => entry.type === "metadata");
    if (metadata?.replayEnv)
      for (const [key, value] of Object.entries(metadata.replayEnv))
        if (!this.env[key]) this.env[key] = value as string;
    const models = new Map<any, string>();
    for (const entry of entries)
      if (entry.type === "request" && entry.modelName)
        models.set(entry.turnId, entry.modelName);
    for (const entry of entries) {
      if (entry.type !== "response" && entry.type !== "stream_response")
        continue;
      const name = entry.modelName || models.get(entry.turnId) || "unknown";
      entry.modelName = name;
      let queue = this.modelQueues.get(name);
      if (!queue) {
        queue = [];
        this.modelQueues.set(name, queue);
        this.modelQueueIndex.set(name, 0);
      }
      queue.push(entry);
      this.totalResponseCount++;
    }
  }
  nextTurnId(): number {
    return this.turnCounter++;
  }
  writeEntry(entry: RecordingEntry): void {
    this.ensureInitialized();
    if (this.recordFilePath)
      appendFileSync(
        this.recordFilePath,
        JSON.stringify(entry) + "\n",
        "utf-8",
      );
  }
  consumeNextResponse(model: string): RecordingEntry | undefined {
    this.ensureInitialized();
    const response = this.consumeFromQueue(model);
    if (response) return response;
    if (!this.modelQueues.has(model)) {
      const fallback = this.findFallbackQueue(model);
      if (fallback) return this.consumeFromQueue(fallback);
    }
  }
  peekNextResponse(model: string): RecordingEntry | undefined {
    this.ensureInitialized();
    const response = this.peekFromQueue(model);
    return (
      response ||
      (this.modelQueues.has(model)
        ? undefined
        : this.peekFromQueue(this.findFallbackQueue(model)))
    );
  }
  getResponseCount(): number {
    this.ensureInitialized();
    return this.totalResponseCount;
  }
  getRecordedModelNames(): string[] {
    this.ensureInitialized();
    return Array.from(this.modelQueues.keys());
  }
  close(): void {
    this.recordFilePath = null;
  }
  consumeFromQueue(model: string | undefined): RecordingEntry | undefined {
    if (!model) return;
    const queue = this.modelQueues.get(model);
    if (!queue) return;
    const index = this.modelQueueIndex.get(model) || 0;
    if (index < queue.length) {
      this.modelQueueIndex.set(model, index + 1);
      return queue[index];
    }
  }
  peekFromQueue(model: string | undefined): RecordingEntry | undefined {
    if (!model) return;
    const queue = this.modelQueues.get(model);
    if (!queue) return;
    const index = this.modelQueueIndex.get(model) || 0;
    if (index < queue.length) return queue[index];
  }
  findFallbackQueue(model: string): string | undefined {
    let selected: string | undefined,
      maximum = 0;
    for (const [name, queue] of this.modelQueues) {
      if (name === model) continue;
      const remaining = queue.length - (this.modelQueueIndex.get(name) || 0);
      if (remaining > maximum) {
        maximum = remaining;
        selected = name;
      }
    }
    return selected;
  }
}
