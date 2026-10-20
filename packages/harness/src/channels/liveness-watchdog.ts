import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
const eu = 30000,
  ed = 90000;
export const DEFAULT_LIVENESS_CHECK_INTERVAL_MS = eu,
  DEFAULT_LIVENESS_STUCK_MS = ed;
export class LivenessWatchdog {
  [key: string]: any;
  constructor(
    eA: any,
    el: any = {},
    readonly runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
  ) {
    ((this.deps = eA),
      (this.timer = null),
      (this.intervalMs = el.intervalMs ?? eu),
      (this.stuckMs = el.stuckMs ?? ed));
  }
  start(): any {
    this.timer ||
      (this.timer = this.runtime.setInterval(
        () => this.tick(),
        this.intervalMs,
      ));
  }
  stop(): any {
    this.timer && (this.runtime.clearInterval(this.timer), (this.timer = null));
  }
  tick(): any {
    try {
      if (!this.deps.isActive()) return;
      let eA: any = this.runtime.now() - this.deps.getLastActivityAt();
      if (eA > this.stuckMs) {
        this.deps.logger.warn(
          `[${this.deps.label}] liveness stuck for ${eA}ms (likely macOS sleep/App Nap), triggering recovery`,
        );
        try {
          this.deps.onStuck(eA);
        } catch (eA: any) {
          this.deps.logger.warn(
            `[${this.deps.label}] onStuck threw: ${eA?.message ?? eA}`,
          );
        }
      }
    } catch (eA: any) {
      this.deps.logger.warn(
        `[${this.deps.label}] tick threw: ${eA?.message ?? eA}`,
      );
    }
  }
}
