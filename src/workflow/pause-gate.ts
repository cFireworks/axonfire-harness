/** Native 8902629..8903230; an unpaused gate ignores an already-aborted signal. */
export class PauseGate {
  private paused = false;
  private readonly waiters: Array<() => void> = [];
  isPaused(): boolean { return this.paused; }
  pause(): boolean { if (this.paused) return false; this.paused = true; return true; }
  resume(): boolean { if (!this.paused) return false; this.paused = false; for (const waiter of this.waiters.splice(0)) try { waiter(); } catch {} return true; }
  async waitIfPaused(signal?: AbortSignal): Promise<void> { if (!this.paused) return; if (signal?.aborted) throw new Error("aborted"); await new Promise<void>((resolve, reject) => { const onAbort = () => { const index = this.waiters.indexOf(wakeup); if (index >= 0) this.waiters.splice(index, 1); reject(new Error("aborted")); }, wakeup = () => { signal?.removeEventListener("abort", onAbort); resolve(); }; signal?.addEventListener("abort", onAbort, { once: true }); this.waiters.push(wakeup); }); }
}
