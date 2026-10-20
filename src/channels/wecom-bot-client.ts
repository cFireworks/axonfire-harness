import { Subject } from "rxjs";
import { WecomClientConstants as eB } from "./channel-client-constants.js";
import {
  createWecomClientRuntime,
  type WecomClientRuntime,
} from "./channel-client-services.js";
const e_ = 1;
// Native UTF-16 offsets 10020791..10036952.
export class WecomBotClient {
  [key: string]: any;
  constructor(
    readonly runtime: WecomClientRuntime = createWecomClientRuntime(),
  ) {
    ((this.clientType = "wecom"),
      (this.instanceId = "default"),
      (this.shouldAutoConnect = !1),
      (this.usesChannelBridge = !0),
      (this.onMessage = new Subject()),
      (this.onStatusChange = new Subject()),
      (this.onQRAuthStateChange = new Subject()),
      (this.ws = null),
      (this.heartbeatTimer = null),
      (this.reconnectTimer = null),
      (this.reconnectAttempts = 0),
      (this._status = "disconnected"),
      (this.shouldReconnect = !0),
      (this.lastWsActivityAt = 0),
      (this.watchdog = null),
      (this.processedMsgIds = new Set()),
      (this.msgIdQueue = []),
      (this.pendingResponses = new Map()),
      (this.credentials = null));
  }
  get status(): any {
    return this._status;
  }
  init(eA: any, el: any, ec: any, eu?: any): any {
    ((this.logger = eA),
      (this.instanceId = el),
      (this.displayName = ec),
      (this.credentials =
        eu ??
        (0, this.runtime.credentialsStore.resolveWecomCredentials)(el) ??
        null),
      this.logger.setContext(`WecomBotClient:${el}`),
      this.logger.info(
        `WecomBotClient[${el}] initialized, has credentials: ${!!this.credentials}`,
      ));
  }
  configureInstance(eA: any, el: any, ec?: any): any {
    ((this.instanceId = eA),
      (this.displayName = el),
      ec && (this.credentials = ec),
      this.logger && this.logger.setContext(`WecomBotClient:${eA}`));
  }
  isConfigured(): any {
    return !!this.credentials?.botId && !!this.credentials?.secret;
  }
  async connect(eA?: any): Promise<any> {
    if ("connected" === this._status || "connecting" === this._status)
      return void this.logger.info(`Already ${this._status}`);
    if (
      (this.isConfigured() ||
        (this.credentials =
          (0, this.runtime.credentialsStore.resolveWecomCredentials)(
            this.instanceId,
          ) ?? null),
      !this.isConfigured() &&
        ((this.credentials = await this.promptForCredentials()),
        !this.isConfigured()))
    )
      throw (
        this.setStatus("disconnected"),
        Error("WeCom configuration cancelled — no Bot ID / Secret provided")
      );
    this.shouldReconnect = !0;
    try {
      await this.doConnect();
    } catch (eA: any) {
      throw ((this.shouldReconnect = !1), this.setStatus("disconnected"), eA);
    }
  }
  async promptForCredentials(): Promise<any> {
    this.setStatus("connecting");
    let eA: any = `_${this.instanceId.toUpperCase()}`,
      el: any = this.runtime.path.join(
        this.runtime.getHomeDir(),
        "channels",
        "wecom",
        "instances.json",
      ),
      ec: any = `企业微信 AI Bot 配置 (${this.instanceId})

请通过以下任一方式配置后等待自动连接：

方式一：环境变量
  export ${eB.ENV_KEY_WECOM_BOT_ID}${eA}=<Bot ID>
  export ${eB.ENV_KEY_WECOM_BOT_SECRET}${eA}=<Bot Secret>

方式二：配置文件 ${el}
  { "botId": "...", "secret": "..." }

获取 Bot ID / Secret：
  企业微信管理后台 → 应用管理 → AI 助手 → 创建/选择 Bot

文档: https://developer.work.weixin.qq.com/document/path/101463`;
    this.onQRAuthStateChange.next({
      type: "qr_ready",
      message: ec,
      qrText: ec,
    });
    let eu: any = 18e4,
      ed: any = 3e3,
      eg: any = this.runtime.now() + eu;
    for (; this.runtime.now() < eg; ) {
      await new Promise((eA: any) => this.runtime.setTimeout(eA, ed));
      let eA: any = (0, this.runtime.credentialsStore.resolveWecomCredentials)(
        this.instanceId,
      );
      if (eA?.botId && eA?.secret)
        return (
          (0, this.runtime.credentialsStore.saveWecomCredentials)(
            eA,
            this.instanceId,
          ),
          this.onQRAuthStateChange.next({
            type: "confirmed",
            message: "凭证已配置，正在连接...",
          }),
          eA
        );
    }
    return (
      this.onQRAuthStateChange.next({
        type: "expired",
        message: "配置超时。请配置好凭证后重新连接。",
      }),
      null
    );
  }
  disconnect(): any {
    if (
      ((this.shouldReconnect = !1),
      this.stopHeartbeat(),
      this.stopWatchdog(),
      this.clearReconnectTimer(),
      this.ws)
    ) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.setStatus("disconnected");
  }
  clearCredentials(): any {
    this.credentials = null;
  }
  dispose(): any {
    (this.disconnect(),
      this.onMessage.complete(),
      this.onStatusChange.complete(),
      this.onQRAuthStateChange.complete());
  }
  async sendReply(eA: any, el: any): Promise<any> {
    let ec: any = eA.platformData?.reqId;
    if (!ec) throw Error("Cannot send reply: missing reqId in platformData");
    if (!this.ws || this.ws.readyState !== e_)
      throw Error(
        `Cannot send reply: WebSocket not available (readyState: ${this.ws?.readyState ?? "null"})`,
      );
    this.sendFrame({
      cmd: "aibot_respond_msg",
      headers: { req_id: ec },
      body: {
        msgtype: "stream",
        stream: {
          id: (0, this.runtime.crypto.randomUUID)(),
          finish: !0,
          content: el,
        },
      },
    });
  }
  async sendStreamChunk(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any = eA.platformData?.reqId;
    ed &&
      this.ws &&
      this.ws.readyState === e_ &&
      this.sendFrame({
        cmd: "aibot_respond_msg",
        headers: { req_id: ed },
        body: {
          msgtype: "stream",
          stream: { id: ec, finish: eu, content: el },
        },
      });
  }
  async sendAsyncReply(eA: any, el: any): Promise<any> {
    let ec: any = eA.platformData?.chatid,
      ed: any = eA.platformData?.chattype,
      ep: any = "single" === ed ? 1 : 2;
    if (!ec)
      throw Error(
        `Cannot send async reply: missing chatid in platformData (keys: ${Object.keys(eA.platformData ?? {})}, chattype: ${ed})`,
      );
    if (!this.ws || this.ws.readyState !== e_)
      throw Error(
        `Cannot send async reply: WebSocket not available (readyState: ${this.ws?.readyState ?? "null"})`,
      );
    (this.logger.info(
      `Sending async reply via aibot_send_msg: chatid=${ec}, chat_type=${ep}, content length: ${el.length}`,
    ),
      this.sendFrame({
        cmd: "aibot_send_msg",
        headers: { req_id: (0, this.runtime.crypto.randomUUID)() },
        body: {
          chatid: ec,
          chat_type: ep,
          msgtype: "markdown",
          markdown: { content: el },
        },
      }));
  }
  sendFrameWithResponse(eA: any, el: any = 3e4): any {
    return new Promise((ec: any, eu: any) => {
      let ed: any = eA.headers.req_id,
        ep: any = this.runtime.setTimeout(() => {
          (this.pendingResponses.delete(ed),
            eu(Error(`Request ${eA.cmd} timed out after ${el}ms`)));
        }, el);
      (this.pendingResponses.set(ed, { resolve: ec, reject: eu, timer: ep }),
        this.sendFrame(eA));
    });
  }
  async uploadMedia(eA: any, el: any): Promise<any> {
    let { type: ec, filename: ed } = el,
      ep: any = eA.length,
      eg: any = 524288,
      eh: any = Math.ceil(ep / 524288);
    if (eh > 100)
      throw Error(`File too large: ${eh} chunks exceeds maximum of 100`);
    let ef: any = (0, this.runtime.crypto.createHash)("md5")
      .update(eA)
      .digest("hex");
    this.logger.info(
      `[Upload] Starting: type=${ec}, filename=${ed}, size=${ep}, chunks=${eh}`,
    );
    let em: any = (0, this.runtime.crypto.randomUUID)(),
      eE: any = await this.sendFrameWithResponse({
        cmd: "aibot_upload_media_init",
        headers: { req_id: em },
        body: {
          type: ec,
          filename: ed,
          total_size: ep,
          total_chunks: eh,
          md5: ef,
        },
      }),
      eC: any = eE.body?.upload_id;
    if (!eC)
      throw Error(
        `Upload init failed: no upload_id. Response: ${JSON.stringify(eE)}`,
      );
    this.logger.info(`[Upload] Init success: upload_id=${eC}`);
    for (let el: any = 0; el < eh; el++) {
      let ec: any,
        ed: any = el * eg,
        ef: any = Math.min(ed + eg, ep),
        em: any = eA.subarray(ed, ef),
        eE: any = em.toString("base64");
      for (let eA: any = 0; eA < 3; eA++)
        try {
          let eA: any = (0, this.runtime.crypto.randomUUID)();
          (await this.sendFrameWithResponse({
            cmd: "aibot_upload_media_chunk",
            headers: { req_id: eA },
            body: { upload_id: eC, chunk_index: el, base64_data: eE },
          }),
            this.logger.info(
              `[Upload] Chunk ${el + 1}/${eh} uploaded (${em.length} bytes)`,
            ),
            (ec = void 0));
          break;
        } catch (el: any) {
          ((ec = el),
            eA < 2 &&
              (await new Promise((el: any) =>
                this.runtime.setTimeout(el, 500 * (eA + 1)),
              )));
        }
      if (ec)
        throw Error(
          `Chunk ${el} upload failed after 3 attempts: ${ec.message}`,
        );
    }
    let ey: any = (0, this.runtime.crypto.randomUUID)(),
      ew: any = await this.sendFrameWithResponse({
        cmd: "aibot_upload_media_finish",
        headers: { req_id: ey },
        body: { upload_id: eC },
      }),
      eB: any = ew.body?.media_id;
    if (!eB)
      throw Error(
        `Upload finish failed: no media_id. Response: ${JSON.stringify(ew)}`,
      );
    return (
      this.logger.info(`[Upload] Complete: media_id=${eB}`),
      { media_id: eB, type: ew.body?.type ?? ec }
    );
  }
  async sendMediaMessage(eA: any, el: any, ec: any, ed: any = 1): Promise<any> {
    if (!this.ws || this.ws.readyState !== e_)
      throw Error("Cannot send media message: WebSocket not open");
    (this.logger.info(
      `[SendMedia] Sending ${el} to chatId=${eA}, media_id=${ec}`,
    ),
      this.sendFrame({
        cmd: "aibot_send_msg",
        headers: { req_id: (0, this.runtime.crypto.randomUUID)() },
        body: {
          chatid: eA,
          chat_type: ed,
          msgtype: el,
          [el]: { media_id: ec },
        },
      }));
  }
  async doConnect(): Promise<any> {
    if (!this.credentials?.botId || !this.credentials?.secret)
      throw Error("Cannot connect: missing Bot ID or Secret");
    let eA: any = this.credentials.wsUrl || "wss://openws.work.weixin.qq.com";
    (this.setStatus("connecting"),
      this.logger.info(`Connecting to WeChat Work AI Bot: ${eA}`));
    let el: any = await this.runtime.media.resolveWebSocketCtor(this.logger);
    return new Promise((ec: any, eu: any) => {
      let ed: any = !1;
      try {
        let ep: any = new el(eA);
        ((this.ws = ep),
          (ep.onopen = () => {
            (this.logger.info("WebSocket connected, sending subscribe frame"),
              this.sendSubscribe());
          }),
          (ep.onmessage = (eA: any) => {
            this.lastWsActivityAt = this.runtime.now();
            try {
              let el: any =
                  "string" == typeof eA.data ? eA.data : eA.data.toString(),
                eu: any = JSON.parse(el);
              this.handleFrame(eu, () => {
                ed || ((ed = !0), ec());
              });
            } catch (eA: any) {
              this.logger.error(
                `Failed to parse WebSocket message: ${eA.message}`,
              );
            }
          }),
          (ep.onclose = (eA: any) => {
            (this.logger.info(`WebSocket closed: ${eA.code} ${eA.reason}`),
              (this.ws = null),
              this.stopHeartbeat(),
              this.stopWatchdog(),
              this.rejectAllPendingResponses("WebSocket closed"),
              this.setStatus("disconnected"),
              ed || ((ed = !0), eu(Error(`WebSocket closed: ${eA.code}`))),
              this.shouldReconnect && this.scheduleReconnect());
          }),
          (ep.onerror = (eA: any) => {
            let el: any = eA.message || "WebSocket error";
            (this.logger.error(`WebSocket error: ${el}`),
              this.setStatus("error", el),
              ed || ((ed = !0), eu(Error(el))));
          }),
          this.runtime.setTimeout(() => {
            ed || ((ed = !0), eu(Error("Connection timeout")));
          }, 3e4));
      } catch (eA: any) {
        (this.logger.error(`Failed to create WebSocket: ${eA.message}`),
          this.setStatus("error", eA.message),
          ed || ((ed = !0), eu(eA)));
      }
    });
  }
  sendSubscribe(): any {
    this.sendFrame({
      cmd: "aibot_subscribe",
      headers: { req_id: (0, this.runtime.crypto.randomUUID)() },
      body: { bot_id: this.credentials.botId, secret: this.credentials.secret },
    });
  }
  handleFrame(eA: any, el?: any): any {
    if ("errcode" in eA) {
      let ec: any = eA,
        eu: any = ec.headers?.req_id;
      if (eu && this.pendingResponses.has(eu)) {
        let eA: any = this.pendingResponses.get(eu);
        (this.pendingResponses.delete(eu),
          this.runtime.clearTimeout(eA.timer),
          0 === ec.errcode
            ? eA.resolve(ec)
            : eA.reject(Error(`WeCom error ${ec.errcode}: ${ec.errmsg}`)));
        return;
      }
      "connecting" === this._status
        ? 0 === ec.errcode
          ? (this.logger.info("Subscribe successful"),
            this.setStatus("connected"),
            (this.reconnectAttempts = 0),
            this.startHeartbeat(),
            el?.())
          : (this.logger.error(`Subscribe failed: ${ec.errcode} ${ec.errmsg}`),
            this.setStatus("error", ec.errmsg))
        : 0 !== ec.errcode &&
          this.logger.warn(`Response error: ${ec.errcode} ${ec.errmsg}`);
      return;
    }
    let ec: any = eA,
      eu: any = ec.headers?.req_id;
    if (eu && this.pendingResponses.has(eu)) {
      let eA: any = this.pendingResponses.get(eu);
      (this.pendingResponses.delete(eu),
        this.runtime.clearTimeout(eA.timer),
        eA.resolve({ ...ec, errcode: 0, errmsg: "ok" }));
      return;
    }
    switch (ec.cmd) {
      case "aibot_msg_callback":
        this.handleMsgCallback(ec);
        break;
      case "aibot_event_callback":
        this.handleEventCallback(ec);
        break;
      case "ping":
        break;
      default:
        this.logger.info(`Received unknown cmd: ${ec.cmd}`);
    }
  }
  handleMsgCallback(eA: any): any {
    let { body: el, headers: ec } = eA,
      eu: any = el.msgid;
    this.isDuplicate(eu)
      ? this.logger.info(`Duplicate message ignored: ${eu}`)
      : (this.recordMsgId(eu),
        this.extractContent(el)
          .then(({ text: eA, mediaFiles: ed }: any) => {
            if (!eA && 0 === ed.length)
              return void this.logger.warn(
                `No text content in message: ${eu}, msgtype: ${el.msgtype}`,
              );
            let ep: any = eA || "";
            for (let eA of ed)
              ((ep += ep ? "\n" : ""), (ep += `[file: ${eA}]`));
            (this.logger.info(
              `Received message ${eu} from ${el.from.userid}: ${ep.substring(0, 50)}...`,
            ),
              this.logger.info(
                `onMessage observers: ${this.onMessage.observers.length}, closed: ${this.onMessage.closed}`,
              ));
            let eg: any = "group" === el.chattype ? el.chatid : el.from.userid,
              eh: any = `wecom_${eg}_${el.from.userid}`;
            this.onMessage.next({
              requestId: eu,
              prompt: ep,
              replyContext: {
                clientType: this.clientType,
                userId: el.from.userid,
                conversationId: eh,
                platformData: {
                  reqId: ec.req_id,
                  chatid: eg,
                  chattype: el.chattype,
                  aibotid: el.aibotid,
                  msgid: eu,
                  instanceId: this.instanceId,
                  mediaFiles: ed,
                },
              },
            });
          })
          .catch((eA: any) => {
            this.logger.error(
              `Failed to extract content from message ${eu}: ${eA.message}`,
            );
          }));
  }
  handleEventCallback(eA: any): any {
    let { body: el } = eA,
      ec: any = el.event?.eventtype;
    switch ((this.logger.info(`Received event: ${ec}`), ec)) {
      case "enter_chat":
        this.handleEnterChat(eA);
        break;
      case "disconnected_event":
        (this.logger.info(
          "Received disconnected_event (another instance connected), disabling auto-reconnect",
        ),
          (this.shouldReconnect = !1));
        break;
      case "feedback_event":
        this.logger.info("Received feedback event");
        break;
      case "template_card_event":
        this.logger.info("Received template card event");
        break;
      default:
        this.logger.info(`Unhandled event type: ${ec}`);
    }
  }
  handleEnterChat(eA: any): any {
    let { headers: el, body: ec } = eA,
      eu: any = el.req_id,
      ed: any =
        "group" === ec.chattype
          ? "大家好！我是 CodeBuddy AI 助手。在群里 @我 即可提问。"
          : "你好！我是 CodeBuddy AI 助手，有什么可以帮你的？";
    this.sendFrame({
      cmd: "aibot_respond_welcome_msg",
      headers: { req_id: eu },
      body: { msgtype: "text", text: { content: ed } },
    });
  }
  startHeartbeat(): any {
    (this.stopHeartbeat(),
      (this.heartbeatTimer = this.runtime.setInterval(() => {
        this.ws &&
          this.ws.readyState === e_ &&
          this.sendFrame({
            cmd: "ping",
            headers: { req_id: (0, this.runtime.crypto.randomUUID)() },
            body: {},
          });
      }, eB.DEFAULT_HEARTBEAT_INTERVAL_MS)),
      (this.lastWsActivityAt = this.runtime.now()),
      this.startWatchdog());
  }
  stopHeartbeat(): any {
    this.heartbeatTimer &&
      (this.runtime.clearInterval(this.heartbeatTimer),
      (this.heartbeatTimer = null));
  }
  startWatchdog(): any {
    this.watchdog ||
      ((this.watchdog = this.runtime.createWatchdog({
        isActive: () => null !== this.ws && "connected" === this._status,
        getLastActivityAt: () => this.lastWsActivityAt,
        onStuck: () => {
          if (this.ws)
            try {
              this.ws.close(4001, "watchdog: stale");
            } catch (eA: any) {
              this.logger.warn(
                `watchdog ws.close failed: ${eA?.message ?? eA}`,
              );
            }
          this.lastWsActivityAt = this.runtime.now();
        },
        logger: this.logger,
        label: `wecom-ws:${this.instanceId}`,
      })),
      this.watchdog.start());
  }
  stopWatchdog(): any {
    this.watchdog && (this.watchdog.stop(), (this.watchdog = null));
  }
  scheduleReconnect(): any {
    this.clearReconnectTimer();
    let eA: any = Math.min(
        1e3 * Math.pow(2, this.reconnectAttempts),
        eB.DEFAULT_MAX_RECONNECT_DELAY_MS,
      ),
      el: any = this.runtime.random() * eA * 0.3,
      ec: any = eA + el;
    (this.logger.info(
      `Scheduling reconnect in ${Math.round(ec)}ms (attempt ${this.reconnectAttempts + 1})`,
    ),
      (this.reconnectTimer = this.runtime.setTimeout(async () => {
        this.reconnectAttempts++;
        try {
          await this.doConnect();
        } catch (eA: any) {
          (this.logger.error(`Reconnect failed: ${eA.message}`),
            this.shouldReconnect && this.scheduleReconnect());
        }
      }, ec)));
  }
  clearReconnectTimer(): any {
    this.reconnectTimer &&
      (this.runtime.clearTimeout(this.reconnectTimer),
      (this.reconnectTimer = null));
  }
  isDuplicate(eA: any): any {
    return this.processedMsgIds.has(eA);
  }
  recordMsgId(eA: any): any {
    for (
      this.processedMsgIds.add(eA), this.msgIdQueue.push(eA);
      this.msgIdQueue.length > eB.DEFAULT_DEDUP_WINDOW_SIZE;

    ) {
      let eA: any = this.msgIdQueue.shift();
      eA && this.processedMsgIds.delete(eA);
    }
  }
  async extractContent(eA: any): Promise<any> {
    let el: any = [];
    switch (eA.msgtype) {
      case "text":
        return { text: eA.text?.content || "", mediaFiles: el };
      case "mixed": {
        this.logger.info(
          `[mixed-diag] raw mixed body: ${JSON.stringify(eA.mixed)}`,
        );
        let ec: any = eA.mixed?.msg_item;
        if (!Array.isArray(ec) || 0 === ec.length)
          return {
            text: "[mixed 消息结构缺失或 msg_item 为空]",
            mediaFiles: el,
          };
        let eu: any = [],
          ed: any = {},
          ep: any = 0,
          eg: any = 0;
        for (let eA of ec) {
          let ec: any = eA?.msgtype;
          switch (ec) {
            case "text":
              eA.text?.content && eu.push(eA.text.content);
              break;
            case "image":
              if (eA.image?.url)
                try {
                  let ec: any = await this.runtime.media.downloadWecomBotMedia(
                    eA.image.url,
                    eA.image.aeskey,
                    ".jpg",
                  );
                  (el.push(ec), ep++, (ed.image = (ed.image || 0) + 1));
                } catch (eA: any) {
                  (this.logger.warn(
                    `[mixed] failed to download image: ${eA.message}`,
                  ),
                    eg++);
                }
              break;
            case "voice": {
              let ec: any = eA.voice,
                eh: any = ec?.text || ec?.recognition || ec?.content;
              if (eh && eh.trim()) eu.push(`[语音转文字] ${eh.trim()}`);
              else if (ec?.url)
                try {
                  let eA: any = await this.runtime.media.downloadWecomBotMedia(
                    ec.url,
                    ec.aeskey || "",
                    ".silk",
                  );
                  (el.push(eA), ep++, (ed.voice = (ed.voice || 0) + 1));
                } catch (eA: any) {
                  (this.logger.warn(
                    `[mixed] failed to download voice: ${eA.message}`,
                  ),
                    eg++);
                }
              break;
            }
            case "file":
              if (eA.file?.url)
                try {
                  let ec: any = eA.file.filename
                      ? "." + (eA.file.filename.split(".").pop() || "bin")
                      : ".bin",
                    eu: any = await this.runtime.media.downloadWecomBotMedia(
                      eA.file.url,
                      eA.file.aeskey,
                      ec,
                    );
                  (el.push(eu), ep++, (ed.file = (ed.file || 0) + 1));
                } catch (eA: any) {
                  (this.logger.warn(
                    `[mixed] failed to download file: ${eA.message}`,
                  ),
                    eg++);
                }
              break;
            default:
              this.logger.warn(`[mixed] unknown sub-item msgtype: ${ec}`);
          }
        }
        let eh: any = {
            image: "图片",
            voice: "语音",
            video: "视频",
            file: "文件",
          },
          ef: any = Object.entries(ed);
        if (ef.length > 0) {
          let eA: any = ef
            .map(([eA, el]: any) => `${el} 个${eh[eA] || eA}`)
            .join("、");
          eu.push(
            `[本条消息附带了 ${eA}，已下载到本地（见下方 file 路径），可直接 Read 处理]`,
          );
        }
        return (
          eg > 0 && eu.push(`[注意：有 ${eg} 个媒体下载失败]`),
          this.logger.info(
            `[mixed] processed ${ec.length} sub-items, text parts=${eu.length}, media downloaded=${ep}, failed=${eg}`,
          ),
          {
            text: eu.length > 0 ? eu.join("\n") : "[mixed 消息但无可抽取内容]",
            mediaFiles: el,
          }
        );
      }
      case "image":
        if (eA.image?.url)
          try {
            let ec: any = await this.runtime.media.downloadWecomBotMedia(
              eA.image.url,
              eA.image.aeskey,
              ".jpg",
            );
            el.push(ec);
          } catch (eA: any) {
            this.logger.warn(`Failed to download image: ${eA.message}`);
          }
        return { text: "", mediaFiles: el };
      case "voice": {
        this.logger.info(
          `[voice-diag] raw voice body: ${JSON.stringify(eA.voice)}`,
        );
        let ec: any = eA.voice,
          eu: any = ec?.text || ec?.recognition || ec?.content;
        if (eu && eu.trim())
          return (
            this.logger.info(
              `[voice] using STT text (length=${eu.length}): "${eu.substring(0, 100)}"`,
            ),
            { text: `[语音转文字] ${eu.trim()}`, mediaFiles: el }
          );
        if (eA.voice?.url)
          try {
            let ec: any = await this.runtime.media.downloadWecomBotMedia(
              eA.voice.url,
              eA.voice.aeskey,
              ".silk",
            );
            el.push(ec);
          } catch (eA: any) {
            this.logger.warn(`Failed to download voice: ${eA.message}`);
          }
        return {
          text: "[语音消息，企业微信群 Bot 未携带转写文本；模型无 silk 解码能力，请提示用户改发文字或转发到其他渠道]",
          mediaFiles: el,
        };
      }
      case "file":
        if (eA.file?.url)
          try {
            let ec: any = eA.file.filename
                ? "." + (eA.file.filename.split(".").pop() || "bin")
                : ".bin",
              eu: any = await this.runtime.media.downloadWecomBotMedia(
                eA.file.url,
                eA.file.aeskey,
                ec,
              );
            el.push(eu);
          } catch (eA: any) {
            this.logger.warn(`Failed to download file: ${eA.message}`);
          }
        return { text: "", mediaFiles: el };
      default:
        return {
          text: `[${eA.msgtype} message received, text extraction not supported]`,
          mediaFiles: el,
        };
    }
  }
  rejectAllPendingResponses(eA: any): any {
    for (let [, el] of this.pendingResponses)
      (this.runtime.clearTimeout(el.timer), el.reject(Error(eA)));
    this.pendingResponses.clear();
  }
  sendFrame(eA: any): any {
    this.ws && this.ws.readyState === e_
      ? this.ws.send(JSON.stringify(eA))
      : this.logger.warn(
          `Cannot send frame (cmd: ${eA.cmd}): WebSocket not open`,
        );
  }
  setStatus(eA: any, el?: any): any {
    this._status !== eA &&
      ((this._status = eA),
      this.logger.info(`Status changed to: ${eA}`),
      this.onStatusChange.next({
        status: eA,
        error: el,
        connectedAt: "connected" === eA ? this.runtime.now() : void 0,
      }));
  }
}
