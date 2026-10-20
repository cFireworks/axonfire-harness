import { noopChannelLogger } from "./channel-runtime.js";
const eQ = "abcdefghijkmnopqrstuvwxyz",
  eD = 5;
// extracted from codebuddy.js UTF-16 offsets 7366430..7367715; search term: "this.toolCallToRequestId=new Map"
export class ChannelPermissionAdapterImpl {
  [key: string]: any;
  constructor(
    readonly channelManager: any,
    readonly logger: any = noopChannelLogger,
    readonly runtime = { random: Math.random, now: Date.now },
  ) {
    ((this.pendingRequests = new Map()),
      (this.toolCallToRequestId = new Map()));
  }
  generateRequestId(): any {
    let eA: any = "";
    for (let el: any = 0; el < eD; el++)
      eA += eQ.charAt(Math.floor(this.runtime.random() * eQ.length));
    return eA;
  }
  createPermissionRequest(eA: any, el: any, ec: any, eu: any): any {
    if (0 === this.channelManager.getPermissionRelayChannels().length)
      return new Promise(() => {});
    let ed: any = this.generateRequestId();
    return new Promise((ep: any) => {
      let eg: any = {
        requestId: ed,
        toolCallId: eA,
        resolve: ep,
        createdAt: this.runtime.now(),
      };
      (this.pendingRequests.set(ed, eg), this.toolCallToRequestId.set(eA, ed));
      let eh: any = {
        requestId: ed,
        toolName: el,
        description: ec,
        inputPreview: eu,
      };
      (this.channelManager.broadcastPermissionRequest(eh),
        this.logger.debug(
          `[Channel] Created permission request ${ed} for tool ${el}`,
        ));
    });
  }
  handlePermissionResponse(eA: any): any {
    let el: any = this.pendingRequests.get(eA.requestId);
    el
      ? (this.logger.info(
          `[Channel] Received permission response: ${eA.requestId} -> ${eA.behavior}`,
        ),
        el.resolve(eA.behavior),
        this.pendingRequests.delete(eA.requestId),
        this.toolCallToRequestId.delete(el.toolCallId))
      : this.logger.debug(
          `[Channel] Received response for unknown request: ${eA.requestId}`,
        );
  }
  cancelRequest(eA: any): any {
    let el: any = this.toolCallToRequestId.get(eA);
    el &&
      (this.pendingRequests.delete(el),
      this.toolCallToRequestId.delete(eA),
      this.logger.debug(`[Channel] Cancelled permission request ${el}`));
  }
}
