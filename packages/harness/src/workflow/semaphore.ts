export class Semaphore {
  private available: number;
  private readonly waiters: Array<() => void> = [];
  constructor(readonly capacity: number) { if (!Number.isInteger(capacity) || capacity <= 0) throw new Error(`Semaphore capacity must be a positive integer, got ${capacity}`); this.available = capacity; }
  get availableSlots(): number { return this.available; }
  get queueLength(): number { return this.waiters.length; }
  tryAcquire(): boolean { if (this.available > 0) { this.available--; return true; } return false; }
  async acquire(): Promise<() => void> { if (this.available > 0) { this.available--; return this.makeReleaseOnce(); } return new Promise((resolve) => { this.waiters.push(() => resolve(this.makeReleaseOnce())); }); }
  drain(): void { while (this.waiters.length > 0) { const waiter = this.waiters.shift()!; this.available++; waiter(); } }
  makeReleaseOnce(): () => void { let released = false; return () => { if (released) return; released = true; const waiter = this.waiters.shift(); if (waiter) waiter(); else this.available++; }; }
}
