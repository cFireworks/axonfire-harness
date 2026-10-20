import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
import { LivenessWatchdog } from "./liveness-watchdog.js";
export class PollWatchdog {
  [key: string]: any;
  constructor(
    eA: any,
    el: any = {},
    readonly runtime: ChannelClientIoRuntime = createChannelClientIoRuntime(),
  ) {
    this.inner = new LivenessWatchdog(
      {
        isActive: () => eA.isActive(),
        getLastActivityAt: () => eA.getLastActivityAt(),
        onStuck: () => {
          let el: any = eA.getCurrentAbort();
          if (el)
            try {
              el.abort();
            } catch {}
          eA.onAborted();
        },
        logger: eA.logger,
        label: "wechat-poll",
      },
      el,
      this.runtime,
    );
  }
  start(): any {
    this.inner.start();
  }
  stop(): any {
    this.inner.stop();
  }
  tick(): any {
    this.inner.tick();
  }
}
