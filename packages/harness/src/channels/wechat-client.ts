import { Subject } from "rxjs";
import { WechatClientConstants as ey } from "./channel-client-constants.js";
import {
  createWechatClientRuntime,
  type WechatClientRuntime,
} from "./channel-client-services.js";

// Native UTF-16 offsets 9976556..9987096.
export class WechatClient {
  [key: string]: any;
  constructor(
    readonly runtime: WechatClientRuntime = createWechatClientRuntime(),
  ) {
    ((this.clientType = "wechat"),
      (this.instanceId = "default"),
      (this.shouldAutoConnect = !1),
      (this.usesChannelBridge = !0),
      (this.onMessage = new Subject()),
      (this.onStatusChange = new Subject()),
      (this.onQRAuthStateChange = new Subject()),
      (this.api = null),
      (this.credentials = null),
      (this.pollCursor = ""),
      (this.shouldPoll = !1),
      (this.reconnectTimer = null),
      (this.reconnectAttempts = 0),
      (this._status = "disconnected"),
      (this.holderId = `${this.runtime.pid}@${this.runtime.os.hostname()}@${this.runtime.now()}`),
      (this.lastPollActivityAt = 0),
      (this.currentPollAbort = null),
      (this.watchdog = null),
      (this.processedMsgIds = new Set()),
      (this.msgIdQueue = []),
      (this.typingTicket = null));
  }
  get status(): any {
    return this._status;
  }
  init(eA: any, el: any, ec: any, eu?: any): any {
    ((this.logger = eA),
      this.logger.setContext("WechatClient"),
      (this.instanceId = el),
      (this.displayName = ec),
      (this.credentials =
        eu ?? (0, this.runtime.credentialsStore.loadCredentials)(el) ?? null),
      this.logger.info(
        `WechatClient[${el}] initialized, has credentials: ${!!this.credentials}`,
      ));
  }
  async connect(eA?: any): Promise<any> {
    if ("connected" === this._status || "connecting" === this._status)
      return void this.logger.info(`Already ${this._status}`);
    if (
      (this.credentials ||
        (this.credentials =
          (0, this.runtime.credentialsStore.loadCredentials)(this.instanceId) ??
          null),
      !this.credentials)
    ) {
      if (
        (this.logger.info("No credentials found, starting QR code auth..."),
        this.setStatus("connecting"),
        (this.credentials =
          (await (0, this.runtime.credentialsStore.performQrCodeAuth)(
            (eA: any) => this.onQRAuthStateChange.next(eA),
            void 0,
            this.instanceId,
          )) ?? null),
        !this.credentials)
      )
        throw (
          this.setStatus("disconnected"),
          Error("Authentication cancelled")
        );
      if (
        this.credentials.accountId &&
        this.instanceId.startsWith("_pending")
      ) {
        let eA: any = this.credentials.accountId
          .slice(0, 8)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        if (eA) {
          let el: any = this.instanceId;
          ((this.instanceId = eA),
            (this.displayName = `WeChat:${eA}`),
            this.logger.info(`WechatClient instanceId updated: ${el} → ${eA}`),
            (0, this.runtime.credentialsStore.saveCredentials)(
              this.credentials,
              eA,
              `WeChat:${eA}`,
              !0,
            ),
            this.onInstanceIdChanged?.(el, eA));
        }
      }
    }
    ((this.api = this.runtime.createApi(this.credentials)),
      (this.shouldPoll = !0),
      (this.pollCursor = ""),
      (this.reconnectAttempts = 0),
      (this.lastPollActivityAt = this.runtime.now()),
      (this.holderId = `${this.runtime.pid}@${this.runtime.os.hostname()}@${this.runtime.now()}`),
      this.writeLockFile(),
      this.setStatus("connected"),
      this.startWatchdog(),
      this.pollLoop().catch((eA: any) => {
        this.logger.error(`Poll loop error: ${eA.message}`);
      }));
  }
  disconnect(): any {
    if (((this.shouldPoll = !1), this.stopWatchdog(), this.currentPollAbort)) {
      try {
        this.currentPollAbort.abort();
      } catch {}
      this.currentPollAbort = null;
    }
    (this.clearReconnectTimer(),
      this.removeLockFile(),
      (this.api = null),
      this.setStatus("disconnected"));
  }
  clearCredentials(): any {
    this.credentials = null;
  }
  dispose(): any {
    (this.disconnect(),
      this.onMessage.complete(),
      this.onStatusChange.complete());
  }
  async sendReply(eA: any, el: any): Promise<any> {
    if (!this.api) throw Error("WechatClient not connected");
    let ec: any = eA.platformData?.context_token;
    (this.logger.info(
      `sendReply: to_user_id=${eA.userId}, instanceId=${this.instanceId}, text_length=${el.length}, has_context_token=${!!ec}`,
    ),
      await this.api.sendMessage({
        msg: {
          from_user_id: "",
          to_user_id: eA.userId,
          client_id: `cbc-${this.runtime.now()}-${this.runtime.random().toString(36).slice(2, 8)}`,
          message_type: 2,
          message_state: 2,
          context_token: ec || void 0,
          item_list: [
            { type: ey.WechatMessageItemType.TEXT, text_item: { text: el } },
          ],
        },
      }));
  }
  async sendImageReply(eA: any, el: any, ec?: any): Promise<any> {
    if (!this.api) throw Error("WechatClient not connected");
    let eu: any = eA.userId,
      ed: any = eA.platformData?.context_token;
    this.logger.info(`sendImageReply: uploading ${el} to user ${eu}`);
    let ep: any = await (0, this.runtime.media.uploadMedia)(
      this.api,
      el,
      eu,
      1,
    );
    this.logger.info(
      `sendImageReply: uploaded, downloadParam length=${ep.downloadEncryptedQueryParam.length}`,
    );
    let eg: any = [];
    for (let eA of (ec &&
      eg.push({ type: ey.WechatMessageItemType.TEXT, text_item: { text: ec } }),
    eg.push({
      type: ey.WechatMessageItemType.IMAGE,
      image_item: {
        media: {
          encrypt_query_param: ep.downloadEncryptedQueryParam,
          aes_key: Buffer.from(ep.aeskey).toString("base64"),
          encrypt_type: 1,
        },
        mid_size: ep.fileSizeCiphertext,
      },
    }),
    eg))
      await this.api.sendMessage({
        msg: {
          from_user_id: "",
          to_user_id: eu,
          client_id: `cbc-${this.runtime.now()}-${this.runtime.random().toString(36).slice(2, 8)}`,
          message_type: 2,
          message_state: 2,
          context_token: ed || void 0,
          item_list: [eA],
        },
      });
  }
  async sendFileReply(eA: any, el: any, ec?: any): Promise<any> {
    if (!this.api) throw Error("WechatClient not connected");
    let eu: any = eA.userId,
      ed: any = eA.platformData?.context_token,
      ep: any = ec || el.split("/").pop() || "file",
      eg: any = await (0, this.runtime.media.uploadMedia)(this.api, el, eu, 3);
    await this.api.sendMessage({
      msg: {
        from_user_id: "",
        to_user_id: eu,
        client_id: `cbc-${this.runtime.now()}-${this.runtime.random().toString(36).slice(2, 8)}`,
        message_type: 2,
        message_state: 2,
        context_token: ed || void 0,
        item_list: [
          {
            type: ey.WechatMessageItemType.FILE,
            file_item: {
              media: {
                encrypt_query_param: eg.downloadEncryptedQueryParam,
                aes_key: Buffer.from(eg.aeskey).toString("base64"),
                encrypt_type: 1,
              },
              file_name: ep,
              len: String(eg.fileSize),
            },
          },
        ],
      },
    });
  }
  async pollLoop(): Promise<any> {
    for (; this.shouldPoll && this.api; ) {
      if (!this.isLockHolder()) {
        (this.logger.info(
          "Another instance has taken over this connection, yielding",
        ),
          (this.shouldPoll = !1),
          this.setStatus("disconnected", "Yielded to another instance"));
        break;
      }
      let eA: any = new this.runtime.AbortController();
      ((this.currentPollAbort = eA),
        (this.lastPollActivityAt = this.runtime.now()));
      try {
        let el: any = await this.api.getUpdates(this.pollCursor, eA.signal);
        if (
          ((this.lastPollActivityAt = this.runtime.now()),
          el.ret && 0 !== el.ret)
        ) {
          if (el.errcode === ey.ERRCODE_SESSION_TIMEOUT) {
            (this.logger.warn(
              "Session timeout (another instance may have connected), stopping poll",
            ),
              this.setStatus("disconnected", "Session taken over or expired"),
              (this.shouldPoll = !1));
            break;
          }
          (this.logger.warn(
            `getUpdates error: ret=${el.ret}, errcode=${el.errcode}, errmsg=${el.errmsg}`,
          ),
            await this.backoffDelay());
          continue;
        }
        for (let eA of (el.get_updates_buf &&
          (this.pollCursor = el.get_updates_buf),
        el.msgs || []))
          1 === eA.message_type &&
            1 !== eA.message_state &&
            (await this.handleMessage(eA));
        this.reconnectAttempts = 0;
      } catch (eA: any) {
        if (!this.shouldPoll) break;
        (this.logger.error(`Poll error: ${eA.message}`),
          await this.backoffDelay());
      } finally {
        this.currentPollAbort === eA && (this.currentPollAbort = null);
      }
    }
  }
  startWatchdog(): any {
    this.watchdog ||
      ((this.watchdog = this.runtime.createPollWatchdog({
        isActive: () => this.shouldPoll,
        getLastActivityAt: () => this.lastPollActivityAt,
        getCurrentAbort: () => this.currentPollAbort,
        onAborted: () => {
          this.lastPollActivityAt = this.runtime.now();
        },
        logger: this.logger,
      })),
      this.watchdog.start());
  }
  stopWatchdog(): any {
    this.watchdog && (this.watchdog.stop(), (this.watchdog = null));
  }
  async handleMessage(eA: any): Promise<any> {
    let el: any = String(eA.message_id ?? eA.seq ?? this.runtime.now());
    if (this.isDuplicate(el)) return;
    this.recordMsgId(el);
    let { text: ec, mediaFiles: eu } = await this.extractContent(
      eA.item_list || [],
    );
    if (!ec && 0 === eu.length) return;
    let ed: any = eA.from_user_id || "unknown",
      ep: any = `wechat_${this.instanceId}_${eA.session_id || ed}`;
    this.logger.info(
      `Received message ${el} from ${ed}: ${(ec || "").substring(0, 50)}`,
    );
    let eg: any = ec || "";
    for (let eA of eu) ((eg += eg ? "\n" : ""), (eg += `[file: ${eA}]`));
    this.onMessage.next({
      requestId: el,
      prompt: eg,
      replyContext: {
        clientType: this.clientType,
        userId: ed,
        conversationId: ep,
        platformData: {
          context_token: eA.context_token,
          session_id: eA.session_id,
          message_id: eA.message_id,
          mediaFiles: eu,
        },
      },
    });
  }
  async extractContent(eA: any): Promise<any> {
    let el: any = [],
      ec: any = [];
    for (let eu of eA)
      switch (eu.type) {
        case ey.WechatMessageItemType.TEXT:
          eu.text_item?.text && el.push(eu.text_item.text);
          break;
        case ey.WechatMessageItemType.IMAGE:
          if (
            eu.image_item?.media?.encrypt_query_param ||
            eu.image_item?.media?.full_url
          )
            try {
              let eA: any = await (0, this.runtime.media.downloadMedia)(
                eu.image_item.media,
                (0, this.runtime.media.extensionForType)(eu.type),
              );
              ec.push(eA);
            } catch (eA: any) {
              (this.logger.warn(`Failed to download image: ${eA.message}`),
                el.push("[图片下载失败]"));
            }
          else el.push("[图片]");
          break;
        case ey.WechatMessageItemType.VOICE:
          if (
            (this.logger.debug?.(
              `[voice] raw voice_item: ${JSON.stringify(eu.voice_item)}`,
            ),
            eu.voice_item?.text)
          ) {
            let eA: any = eu.voice_item.text.trim();
            if (eA) {
              (this.logger.info(
                `[voice] using STT text (length=${eA.length}): "${eA.substring(0, 100)}"`,
              ),
                el.push(`[语音转文字] ${eA}`));
              break;
            }
          }
          if (
            (this.logger.info(
              "[voice] STT text not present, falling back to silk download",
            ),
            eu.voice_item?.media?.encrypt_query_param ||
              eu.voice_item?.media?.full_url)
          )
            try {
              let eA: any = await (0, this.runtime.media.downloadMedia)(
                eu.voice_item.media,
                (0, this.runtime.media.extensionForType)(eu.type),
              );
              (ec.push(eA),
                el.push(
                  "[语音，未携带转写文本；模型无 silk 解码能力，请提示用户改发文字或转发到企业微信]",
                ));
            } catch (eA: any) {
              (this.logger.warn(`Failed to download voice: ${eA.message}`),
                el.push("[语音下载失败]"));
            }
          else el.push("[语音]");
          break;
        case ey.WechatMessageItemType.FILE:
          if (
            eu.file_item?.media?.encrypt_query_param ||
            eu.file_item?.media?.full_url
          )
            try {
              let eA: any = eu.file_item.file_name
                  ? "." + eu.file_item.file_name.split(".").pop()
                  : (0, this.runtime.media.extensionForType)(eu.type),
                el: any = await (0, this.runtime.media.downloadMedia)(
                  eu.file_item.media,
                  eA,
                );
              ec.push(el);
            } catch (eA: any) {
              (this.logger.warn(`Failed to download file: ${eA.message}`),
                el.push("[文件下载失败]"));
            }
          else el.push("[文件]");
          break;
        case ey.WechatMessageItemType.VIDEO:
          if (
            eu.video_item?.media?.encrypt_query_param ||
            eu.video_item?.media?.full_url
          )
            try {
              let eA: any = await (0, this.runtime.media.downloadMedia)(
                eu.video_item.media,
                (0, this.runtime.media.extensionForType)(eu.type),
              );
              ec.push(eA);
            } catch (eA: any) {
              (this.logger.warn(`Failed to download video: ${eA.message}`),
                el.push("[视频下载失败]"));
            }
          else el.push("[视频]");
      }
    return { text: el.join("\n"), mediaFiles: ec };
  }
  async sendTypingStart(eA: any): Promise<any> {
    if (this.api && this.typingTicket)
      try {
        await this.api.sendTyping({
          ilink_user_id: eA,
          typing_ticket: this.typingTicket,
          status: ey.TYPING_STATUS_START,
        });
      } catch {}
  }
  async sendTypingCancel(eA: any): Promise<any> {
    if (this.api && this.typingTicket)
      try {
        await this.api.sendTyping({
          ilink_user_id: eA,
          typing_ticket: this.typingTicket,
          status: ey.TYPING_STATUS_CANCEL,
        });
      } catch {}
  }
  setStatus(eA: any, el?: any): any {
    ((this._status = eA),
      this.onStatusChange.next({
        status: eA,
        serverUrl: this.credentials?.apiBaseUrl,
        connectedAt: "connected" === eA ? this.runtime.now() : void 0,
        error: el,
      }));
  }
  isDuplicate(eA: any): any {
    return this.processedMsgIds.has(eA);
  }
  recordMsgId(eA: any): any {
    if (
      (this.processedMsgIds.add(eA),
      this.msgIdQueue.push(eA),
      this.msgIdQueue.length > ey.DEFAULT_DEDUP_WINDOW_SIZE)
    ) {
      let eA: any = this.msgIdQueue.shift();
      this.processedMsgIds.delete(eA);
    }
  }
  async backoffDelay(): Promise<any> {
    let eA: any =
      Math.min(
        1e3 * Math.pow(2, this.reconnectAttempts),
        ey.DEFAULT_MAX_RECONNECT_DELAY_MS,
      ) +
      1e3 * this.runtime.random();
    (this.reconnectAttempts++,
      this.logger.info(
        `Backing off for ${Math.round(eA)}ms (attempt ${this.reconnectAttempts})`,
      ),
      await new Promise((el: any) => {
        this.reconnectTimer = this.runtime.setTimeout(el, eA);
      }));
  }
  clearReconnectTimer(): any {
    this.reconnectTimer &&
      (this.runtime.clearTimeout(this.reconnectTimer),
      (this.reconnectTimer = null));
  }
  getLockFilePath(): any {
    return this.runtime.path.join(
      this.runtime.getHomeDir(),
      ey.CREDENTIALS_DIR,
      `${this.instanceId}.lock`,
    );
  }
  writeLockFile(): any {
    try {
      let eA: any = this.runtime.path.join(
        this.runtime.getHomeDir(),
        ey.CREDENTIALS_DIR,
      );
      (this.runtime.fs.existsSync(eA) ||
        this.runtime.fs.mkdirSync(eA, { recursive: !0 }),
        this.runtime.fs.writeFileSync(
          this.getLockFilePath(),
          this.holderId,
          "utf-8",
        ));
    } catch {}
  }
  removeLockFile(): any {
    try {
      let eA: any = this.getLockFilePath();
      this.runtime.fs.existsSync(eA) &&
        this.runtime.fs.readFileSync(eA, "utf-8").trim() === this.holderId &&
        this.runtime.fs.unlinkSync(eA);
    } catch {}
  }
  isLockHolder(): any {
    try {
      return (
        this.runtime.fs.readFileSync(this.getLockFilePath(), "utf-8").trim() ===
        this.holderId
      );
    } catch {
      return !0;
    }
  }
}
