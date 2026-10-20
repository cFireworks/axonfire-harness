const configured = process.env.BASH_MAX_OUTPUT_LENGTH == null ? undefined : Number(process.env.BASH_MAX_OUTPUT_LENGTH);
const maximum = configured !== undefined && Number.isFinite(configured) && configured > 0 ? Math.min(Math.floor(configured), 150000) : 30000;
/** Native 11320355..113217xx. Limits count UTF-16 units, despite "bytes" text. */
export class TruncateBuffer {
  private headBuf = ""; private tailBuf = ""; private truncatedBytes = 0; private totalLines = 0;
  readonly headLimit: number; readonly tailLimit: number;
  constructor(head = Math.floor(0.2 * maximum), tail = maximum - Math.floor(0.2 * maximum)) { this.headLimit = Math.max(0, head | 0); this.tailLimit = Math.max(0, tail | 0); }
  push(text: string): void { if (!text) return; this.totalLines += (text.match(/\r\n|\r|\n/g) || []).length; if (this.headBuf.length < this.headLimit) { const available = this.headLimit - this.headBuf.length; if (text.length <= available) this.headBuf += text; else { this.headBuf += text.slice(0, available); this.tailBuf += text.slice(available); if (this.tailBuf.length > this.tailLimit) { this.truncatedBytes += this.tailBuf.length - this.tailLimit; this.tailBuf = this.tailBuf.slice(-this.tailLimit); } } } else { this.tailBuf += text; if (this.tailBuf.length > this.tailLimit) { this.truncatedBytes += this.tailBuf.length - this.tailLimit; this.tailBuf = this.tailBuf.slice(-this.tailLimit); } } }
  toString(withMarker = true): string { return withMarker && this.truncatedBytes > 0 ? `${this.headBuf}\n... [truncated ${this.truncatedBytes} bytes] ...\n${this.tailBuf}` : this.headBuf + this.tailBuf; }
  isEmpty(): boolean { return this.headBuf === "" && this.tailBuf === ""; }
  getHead(): string { return this.headBuf; } getTail(): string { return this.tailBuf; } getTruncatedBytes(): number { return this.truncatedBytes; } getTotalLines(): number { return this.totalLines; }
  clear(): void { this.headBuf = ""; this.tailBuf = ""; this.truncatedBytes = 0; this.totalLines = 0; }
}
