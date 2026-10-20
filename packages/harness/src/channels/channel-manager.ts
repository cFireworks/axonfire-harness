import { Subject } from "rxjs";
import * as eC from "./channel-constants.js";
import { noopChannelLogger } from "./channel-runtime.js";
const eB = { Subject };
// extracted from codebuddy.js UTF-16 offsets 7360067..7363197; search term: "get enabled(){return this._enabled}"
export class ChannelManagerImpl {
  [key: string]: any;
  constructor(
    readonly logger: any = noopChannelLogger,
    readonly settingsManager?: any,
  ) {
    ((this._enabled = !0),
      (this.channelServers = new Map()),
      (this.eventSubject = new eB.Subject()),
      (this.channelServersSubject = new eB.Subject()),
      (this.sessionEventQueues = new Map()),
      (this.developmentChannels = new Set()));
  }
  get enabled(): any {
    return this._enabled;
  }
  registerChannel(eA: any, el: any, ec: any, eu?: any): any {
    if (!this._enabled)
      return void this.logger.debug(
        `[Channel] Channels disabled, skipping registration of "${eA}"`,
      );
    let ed: any = ec?.experimental;
    if (!ed?.[eC.CHANNEL_CAPABILITY_KEY]) return;
    if (this.allowedChannels && !this.allowedChannels.has(eA))
      return void this.logger.info(
        `[Channel] Channel "${eA}" not in allowed list, skipping`,
      );
    let ep: any = !!ed?.[eC.CHANNEL_PERMISSION_CAPABILITY_KEY],
      eg: any = {
        serverName: eA,
        hasPermissionRelay: ep,
        mcpSession: el,
        instructions: eu,
      };
    (this.channelServers.set(eA, eg),
      this.logger.info(
        `[Channel] Registered channel server: ${eA}, permissionRelay: ${ep}`,
      ),
      this.channelServersSubject.next(this.channelServers));
  }
  unregisterChannel(eA: any): any {
    this.channelServers.has(eA) &&
      (this.channelServers.delete(eA),
      this.logger.info(`[Channel] Unregistered channel server: ${eA}`),
      this.channelServersSubject.next(this.channelServers));
  }
  isChannel(eA: any): any {
    return this.channelServers.has(eA);
  }
  getPermissionRelayChannels(): any {
    return Array.from(this.channelServers.values()).filter(
      (eA: any) => eA.hasPermissionRelay,
    );
  }
  broadcastPermissionRequest(eA: any): any {
    let el: any = this.getPermissionRelayChannels();
    if (0 !== el.length)
      for (let ec of el)
        try {
          (ec.mcpSession.notification({
            method: eC.CHANNEL_PERMISSION_REQUEST_METHOD,
            params: {
              request_id: eA.requestId,
              tool_name: eA.toolName,
              description: eA.description,
              input_preview: eA.inputPreview,
            },
          }),
            this.logger.debug(
              `[Channel] Sent permission request ${eA.requestId} to ${ec.serverName}`,
            ));
        } catch (eA: any) {
          this.logger.warn(
            `[Channel] Failed to send permission request to ${ec.serverName}:`,
            eA,
          );
        }
  }
  enqueueEventForSession(eA: any, el: any): any {
    (this.sessionEventQueues.has(eA) || this.sessionEventQueues.set(eA, []),
      this.sessionEventQueues.get(eA).push(el),
      this.logger.debug(
        `[Channel] Enqueued event for session ${eA}, queue size: ${this.sessionEventQueues.get(eA).length}`,
      ));
  }
  consumeEventsForSession(eA: any): any {
    let el: any = this.sessionEventQueues.get(eA) || [];
    return (
      this.sessionEventQueues.delete(eA),
      el.length > 0 &&
        this.logger.debug(
          `[Channel] Consumed ${el.length} events for session ${eA}`,
        ),
      el
    );
  }
  configureFromSessionOptions(eA: any): any {
    (this.settingsManager &&
      this.settingsManager
        .get("channelsEnabled")
        .then((eA: any) => {
          !1 === eA &&
            ((this._enabled = !1),
            this.logger.info(
              "[Channel] Channels disabled via settings (channelsEnabled: false)",
            ));
        })
        .catch(() => {}),
      eA.channels &&
        ((this.allowedChannels = new Set(
          eA.channels
            .split(",")
            .map((eA: any) => eA.trim())
            .filter(Boolean)
            .map((eA: any) => {
              let el: any = eA.indexOf(":");
              if (el >= 0) {
                let ec: any = eA.substring(el + 1),
                  eu: any = ec.indexOf("@");
                return eu >= 0 ? ec.substring(0, eu) : ec;
              }
              return eA;
            }),
        )),
        this.logger.info(
          `[Channel] Configured allowed channels: ${Array.from(this.allowedChannels).join(", ")}`,
        )),
      eA.dangerouslyLoadDevelopmentChannels &&
        ((this.developmentChannels = new Set(
          eA.dangerouslyLoadDevelopmentChannels
            .split(",")
            .map((eA: any) => eA.trim())
            .filter(Boolean),
        )),
        this.logger.info(
          `[Channel] Development channels (allowlist bypassed): ${Array.from(this.developmentChannels).join(", ")}`,
        )));
  }
  shouldBypassAllowlist(eA: any): any {
    return this.developmentChannels.has(eA);
  }
}
