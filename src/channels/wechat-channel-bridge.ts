import { user } from "@openai/agents";
import { ToolNames } from "../tools/tool-names.js";
import { CommandMessageUtils } from "../commands/command-message-utils.js";
import * as constants from "./channel-constants.js";
import { stripAtMention, escapeXmlAttr } from "./channel-constants.js";
import type { ChannelBridgeRuntime } from "./channel-runtime.js";
const eQ = "wechat",
  eD = 1000,
  eT = constants.WECHAT_CHANNEL_INSTRUCTIONS,
  eB = constants,
  ev = { ToolNames },
  ey = { user };
// extracted from codebuddy.js UTF-16 offsets 9955951..9970590; search term: "this.chatClientMap=new Map"
export class WechatChannelBridge {
  [key: string]: any;
  constructor(readonly runtime: ChannelBridgeRuntime) {
    Object.assign(this, runtime);
    ((this.chatClientMap = new Map()),
      (this.pendingPermissionRequests = new Map()),
      (this.subscribedClients = new Set()),
      (this.connectedCount = 0),
      (this.isWaking = !1));
  }
  initialize(): any {
    this.logger.setContext("WechatChannelBridge");
    try {
      for (let eA of this.clientFactory.getAll()) this.subscribeToClient(eA);
    } catch {}
    this.subscribeToAskInterruptions();
  }
  subscribeToClient(eA: any): any {
    let el: any = `${eA.clientType}:${eA.instanceId}`;
    if (this.subscribedClients.has(el)) return;
    this.subscribedClients.add(el);
    let ec: any = eA.onInstanceIdChanged;
    ((eA.onInstanceIdChanged = (el: any, eu: any) => {
      ec?.(el, eu);
      let ed: any = `${eA.clientType}:${el}`,
        ep: any = `${eA.clientType}:${eu}`;
      (this.subscribedClients.delete(ed), this.subscribedClients.add(ep));
    }),
      eA.onMessage.subscribe((el: any) => {
        this.handleWechatMessage(el, eA);
      }),
      eA.onStatusChange.subscribe((eA: any) => {
        "connected" === eA.status
          ? (this.connectedCount++,
            1 === this.connectedCount && this.registerAsChannel(),
            this.refreshAgentToolsAfterConnection())
          : "disconnected" === eA.status &&
            ((this.connectedCount = Math.max(0, this.connectedCount - 1)),
            0 === this.connectedCount &&
              this.channelManager.unregisterChannel(eQ));
      }),
      this.logger.info(`[WechatBridge] Subscribed to client ${el}`));
  }
  registerAsChannel(): any {
    let eA: any = {
        notification: async (eA: any) => {
          eA.method === eB.CHANNEL_PERMISSION_REQUEST_METHOD &&
            (await this.sendPermissionRequestToUser(eA.params));
        },
      },
      el: any = {
        experimental: { "claude/channel": {}, "claude/channel/permission": {} },
      };
    (this.channelManager.registerChannel(eQ, eA, el, eT),
      this.logger.info("[WechatBridge] Registered as internal channel"));
  }
  async refreshAgentToolsAfterConnection(): Promise<any> {
    try {
      let eA: any = await this.agentManager.getAll();
      (this.logger.info(
        `[WechatBridge] Refreshing tools for ${eA.length} agents after WeChat connection`,
      ),
        await Promise.all(
          eA.map((eA: any) =>
            this.agentManager.refreshAgentTools(eA.name).catch((el: any) => {
              this.logger.warn(
                `[WechatBridge] Failed to refresh tools for ${eA.name}: ${el?.message}`,
              );
            }),
          ),
        ));
    } catch (eA: any) {
      this.logger.error(
        `[WechatBridge] Failed to refresh agent tools: ${eA instanceof Error ? eA.message : String(eA)}`,
      );
    }
  }
  getPlanSummary(): any {
    try {
      let eA: any =
        this.sessionManager.getCurrent() ||
        this.sessionManager.sessionSubject?.getValue();
      if (!eA) return;
      let el: any = this.planStorageService.syncRead(eA);
      if (!el) return;
      let ec: any = el.split("\n"),
        eu: any = [];
      for (let eA of ec) {
        let el: any = eA.trim();
        if (
          el &&
          ((el.startsWith("#") ||
            el.startsWith("-") ||
            el.startsWith("*") ||
            /^\d+\./.test(el)) &&
            eu.push(el),
          eu.length >= 10)
        )
          break;
      }
      return eu.length > 0 ? eu.join("\n") : el.slice(0, 500);
    } catch {
      return;
    }
  }
  formatPermissionMessage(eA: any, el: any): any {
    let ec: any,
      eu: any = el;
    eu.startsWith('"') &&
      ((eu = eu.slice(1)).endsWith('"') && (eu = eu.slice(0, -1)),
      (eu = eu.replace(/\\"/g, '"').replace(/\\\\/g, "\\")));
    try {
      let eA: any = JSON.parse(eu);
      eA && "object" == typeof eA && !Array.isArray(eA) && (ec = eA);
    } catch {}
    let get: any = (eA: any) => {
        if (ec && "string" == typeof ec[eA]) return ec[eA];
        let el: any = RegExp(`"${eA}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`),
          ed: any = eu.match(el);
        return ed?.[1]
          ?.replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
      },
      ed: any = get("description"),
      ep: any = {
        Bash: { key: "command", verb: "我想运行" },
        Write: { key: "file_path", verb: "我想写文件" },
        Read: { key: "file_path", verb: "我想读文件" },
        Edit: { key: "file_path", verb: "我想编辑" },
        MultiEdit: { key: "file_path", verb: "我想编辑" },
        NotebookEdit: { key: "notebook_path", verb: "我想编辑笔记本" },
        Glob: { key: "pattern", verb: "我想查找本地文件" },
        Grep: { key: "pattern", verb: "我想在代码中搜索" },
        WebFetch: { key: "url", verb: "我想从网站获取内容" },
        WebSearch: { key: "query", verb: "我想搜索网络" },
        Agent: { key: "prompt", verb: "我想启动代理执行任务" },
        ImageGen: { key: "prompt", verb: "我想生成图片" },
        ImageEdit: { key: "prompt", verb: "我想编辑图片" },
        Skill: { key: "skill", verb: "我想运行自定义技能" },
        LSP: { key: "command", verb: "我想进行代码智能分析" },
        EnterWorktree: { key: "branch", verb: "我想进入工作树" },
        LeaveWorktree: { key: "action", verb: "我想返回主工作目录" },
        CronCreate: { key: "prompt", verb: "我想创建定时任务" },
        CronDelete: { key: "id", verb: "我想删除定时任务" },
        TeamCreate: { key: "team_name", verb: "我想创建团队" },
        DeferExecuteTool: { key: "toolName", verb: "我想执行" },
      },
      eg: any = ep[eA];
    if ("DeferExecuteTool" === eA) {
      let eA: any = get("toolName");
      if (eA) {
        let el: any = ep[eA];
        if (el) {
          let eA: any = ec?.params?.[el.key] ?? get(el.key);
          if (eA) return `${el.verb} ${eA}`;
        }
        return `我想使用 ${eA}`;
      }
    }
    if ("ExitPlanMode" === eA) {
      let eA: any = this.getPlanSummary();
      return eA
        ? `${eA}

开始执行这个计划吗？`
        : "计划已就绪，开始执行吗？";
    }
    if (eg) {
      let eA: any = get(eg.key);
      if (eA)
        return ed
          ? `${ed}
${eg.verb} ${eA}`
          : `${eg.verb} ${eA}`;
      if (ed) return `${ed}`;
    }
    if (ec) {
      let el: any = new Set([
          "content",
          "old_string",
          "new_string",
          "edits",
          "image",
          "params",
          "data",
          "body",
          "source",
        ]),
        eu: any = Object.entries(ec)
          .filter(([eA, ec]: any) => !el.has(eA) && null != ec)
          .filter(
            ([, eA]: any) =>
              "string" == typeof eA ||
              "number" == typeof eA ||
              "boolean" == typeof eA,
          )
          .filter(([, eA]: any) => String(eA).length <= 120)
          .map(([eA, el]: any) => `${eA}: ${String(el)}`);
      if (eu.length > 0)
        return `我想使用 ${eA}
${eu.join("\n")}`;
    }
    return `我想使用 ${eA}`;
  }
  async sendPermissionRequestToUser(eA: any): Promise<any> {
    if (eA.tool_name === ev.ToolNames.ASK_USER_QUESTION) return;
    if (!this.lastReplyContext)
      return void this.logger.warn(
        "[WechatBridge] No last reply context, cannot send permission request",
      );
    this.pendingPermissionRequests.set(eA.request_id, eA.tool_name);
    let el: any = this.formatPermissionMessage(eA.tool_name, eA.input_preview),
      ec: any = "ExitPlanMode" === eA.tool_name,
      eu: any = ec
        ? "(y=执行 | n=继续规划 | q=退出计划模式)"
        : "(y=允许 | n=拒绝 | a=总是允许)",
      ed: any = ec
        ? `${el}
${eu}`
        : `${el}
可以吗？${eu}`;
    try {
      (await this.sendReply(
        this.lastReplyContext.chatId,
        ed,
        this.lastReplyContext.contextToken,
      ),
        this.logger.info(
          `[WechatBridge] Sent permission request ${eA.request_id} for tool ${eA.tool_name}`,
        ));
    } catch (el: any) {
      (this.logger.error(
        `[WechatBridge] Failed to send permission request: ${el.message}`,
      ),
        this.pendingPermissionRequests.delete(eA.request_id));
    }
  }
  subscribeToAskInterruptions(): any {
    let trySubscribe: any = () => {
      let eA: any =
        this.sessionManager.getCurrent() ||
        this.sessionManager.sessionSubject?.getValue();
      eA && this.subscribeToSessionInterruptions(eA);
    };
    (this.sessionManager.sessionSubject?.subscribe((eA: any) => {
      eA && this.subscribeToSessionInterruptions(eA);
    }),
      trySubscribe());
  }
  subscribeToSessionInterruptions(eA: any): any {
    this.subscribedSessionId !== eA.id &&
      ((this.subscribedSessionId = eA.id),
      eA.interruptionSubject?.subscribe((eA: any) => {
        eA &&
          this.clientFactory
            .getAll()
            .some((eA: any) => "connected" === eA.status) &&
          this.lastReplyContext &&
          ("name" in eA.rawItem ? eA.rawItem.name : void 0) ===
            ev.ToolNames.ASK_USER_QUESTION &&
          this.handleAskUserQuestion(eA);
      }));
  }
  handleAskUserQuestion(eA: any): any {
    try {
      let el: any = eA.rawItem.arguments;
      if ("string" == typeof el)
        try {
          el = JSON.parse(el);
        } catch {}
      if (!el?.questions?.length)
        return void this.logger.warn(
          "[WechatBridge] AskUserQuestion has no questions",
        );
      (this.askService.setAsk(eA),
        (this.pendingAsk = {
          item: eA,
          questions: el.questions,
          answers: {},
          currentIndex: 0,
        }),
        this.sendCurrentQuestion());
    } catch (eA: any) {
      this.logger.error(
        `[WechatBridge] Failed to handle AskUserQuestion: ${eA.message}`,
      );
    }
  }
  sendCurrentQuestion(): any {
    if (!this.pendingAsk || !this.lastReplyContext) return;
    let { questions: eA, currentIndex: el } = this.pendingAsk,
      ec: any = eA[el],
      eu: any = [];
    (eu.push(`❓ ${ec.question}`),
      ec.options.forEach((eA: any, el: any) => {
        eu.push(`${el + 1}. ${eA.label} - ${eA.description}`);
      }),
      eu.push("\n回复编号选择，或直接输入你的答案"),
      eA.length > 1 &&
        eu.push(`
(${el + 1}/${eA.length})`),
      this.sendReply(
        this.lastReplyContext.chatId,
        eu.join("\n"),
        this.lastReplyContext.contextToken,
      ).catch((eA: any) => {
        this.logger.error(
          `[WechatBridge] Failed to send question: ${eA.message}`,
        );
      }));
  }
  tryHandleAskReply(eA: any): any {
    let el: any;
    if (!this.pendingAsk) return !1;
    let {
        questions: ec,
        currentIndex: eu,
        answers: ed,
        item: ep,
      } = this.pendingAsk,
      eg: any = ec[eu],
      eh: any = eA.trim(),
      ef: any = parseInt(eh, 10);
    if (
      ((el =
        ef >= 1 && ef <= eg.options.length ? eg.options[ef - 1].label : eh),
      (ed[eg.question] = el),
      this.pendingAsk.currentIndex++,
      this.pendingAsk.currentIndex < ec.length)
    )
      this.sendCurrentQuestion();
    else {
      this.logger.info(
        `[WechatBridge] AskUserQuestion completed with ${Object.keys(ed).length} answers`,
      );
      let eA: any =
        ("function_call" === ep.rawItem.type && ep.rawItem.callId) ||
        ep.rawItem.id;
      (this.askService.doneAsk(ed, eA),
        this.interruptionService.approve(ep),
        (this.pendingAsk = void 0));
    }
    return !0;
  }
  tryHandlePermissionReply(eA: any): any {
    let el: any;
    if (0 === this.pendingPermissionRequests.size) return !1;
    let ec: any = eA.trim().toLowerCase(),
      eu: any = ["y", "yes", "allow", "ok", "好", "允许", "同意", "确认"],
      ed: any = ["a", "always", "记住", "别再问"],
      ep: any = ["n", "no", "deny", "reject", "不", "拒绝", "取消"],
      eg: any = ["q", "quit", "退出"],
      [eh, ef] = this.pendingPermissionRequests.entries().next().value,
      em: any = "ExitPlanMode" === ef;
    if (eu.includes(ec)) el = "allow";
    else if (!em && ed.includes(ec)) el = "allow_always";
    else if (em && eg.includes(ec)) el = "deny_and_exit_plan";
    else {
      if (!ep.includes(ec))
        return (
          this.pendingPermissionRequests.delete(eh),
          this.logger.info(
            `[WechatBridge] Permission reply (unrecognized -> deny + forward): ${eh}`,
          ),
          this.channelPermissionAdapter.handlePermissionResponse({
            requestId: eh,
            behavior: "deny",
          }),
          "deny_and_forward"
        );
      el = "deny";
    }
    return (
      this.pendingPermissionRequests.delete(eh),
      this.logger.info(`[WechatBridge] Permission reply: ${eh} -> ${el}`),
      this.channelPermissionAdapter.handlePermissionResponse({
        requestId: eh,
        behavior: el,
      }),
      "consumed"
    );
  }
  handleWechatMessage(eA: any, el: any): any {
    let ec: any = eA.replyContext.conversationId;
    if (
      (el && this.chatClientMap.set(ec, el),
      (this.lastReplyContext = {
        chatId: ec,
        contextToken: eA.replyContext.platformData?.context_token
          ? String(eA.replyContext.platformData.context_token)
          : void 0,
        sourceClient: el,
      }),
      this.tryHandleAskReply(eA.prompt))
    )
      return;
    let eu: any = this.tryHandlePermissionReply(eA.prompt);
    if ("consumed" === eu) return;
    if ("deny_and_forward" === eu)
      return void this.runtime.setTimeout(() => {
        try {
          let el: any = {
            serverName: eQ,
            content: eA.prompt,
            meta: {
              chat_id: eA.replyContext.conversationId,
              sender: eA.replyContext.userId,
              user: eA.replyContext.userId,
              ...(eA.replyContext.platformData?.context_token
                ? {
                    context_token: String(
                      eA.replyContext.platformData.context_token,
                    ),
                  }
                : {}),
            },
            timestamp: this.runtime.now(),
          };
          (this.channelManager.eventSubject.next(el),
            this.injectAndWakeAgent(el));
        } catch (eA: any) {
          this.logger.error(
            `[WechatBridge] Failed to forward message after deny: ${eA.message}`,
          );
        }
      }, eD);
    if (this.tryHandleSuggestionApprovalReply(eA.prompt)) return;
    let ed: any = {
      chat_id: eA.replyContext.conversationId,
      sender: eA.replyContext.userId,
      user: eA.replyContext.userId,
    };
    eA.replyContext.platformData?.context_token &&
      (ed.context_token = String(eA.replyContext.platformData.context_token));
    let ep: any = eA.replyContext.platformData?.mediaFiles;
    ep &&
      ep.length > 0 &&
      ((ed.file_path = ep[0]), ep.length > 1 && (ed.file_paths = ep.join(",")));
    let eg: any = {
      serverName: eQ,
      content: eA.prompt,
      meta: ed,
      timestamp: this.runtime.now(),
    };
    (this.channelManager.eventSubject.next(eg), this.injectAndWakeAgent(eg));
  }
  isMainAgentRunning(eA: any): any {
    return this.stateMachine.isBusyForQueue(eA);
  }
  injectAndWakeAgent(eA: any): any {
    try {
      let el: any =
        this.sessionManager.getCurrent() ||
        this.sessionManager.sessionSubject?.getValue();
      if (!el)
        return void this.logger.warn(
          "[WechatBridge] No session available, discarding message",
        );
      (el.meta || (el.meta = {}),
        (el.meta.isChannelSession = !0),
        (el.meta.channelId = eQ),
        (el.meta.channelChatId = eA.meta?.chat_id),
        (el.meta.channelChattype = eA.meta?.chattype),
        el.meta.channelChatId ||
          this.logger.warn(
            "[WechatBridge] No chat_id in event meta, prompt suggestion approval will be skipped",
          ));
      let ec: any = /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        eu: any = [`source="${escapeXmlAttr(eQ)}"`];
      for (let [el, ed] of Object.entries(eA.meta || {}))
        ec.test(el) &&
          "source" !== el &&
          eu.push(`${el}="${escapeXmlAttr(String(ed))}"`);
      let ed: any = `<channel ${eu.join(" ")}>
${eA.content}
</channel>`,
        ep: any = (0, ey.user)(ed);
      this.isMainAgentRunning(el) || this.isWaking
        ? (this.logger.info(
            `[WechatBridge] Agent busy (status=${this.stateMachine.getSnapshot(el).status}, waking=${this.isWaking}), enqueueing message`,
          ),
          this.messageQueueManager.enqueueMessage(el, ep))
        : (this.logger.debug("[WechatBridge] Waking agent for channel message"),
          this.runAgentWithMessage(el, ep));
    } catch (eA: any) {
      this.logger.error(
        `[WechatBridge] Failed to inject message: ${eA.message}`,
      );
    }
  }
  runAgentWithMessage(eA: any, el: any): any {
    ((this.isWaking = !0),
      (async () => {
        try {
          let ed: any = await Promise.resolve().then(
            () => this.runtime.agentService,
          );
          (this.sessionManager.setCurrent(eA),
            this.stateMachine.forceIdle(eA, "wechat-channel-wake-before-run"),
            await this.sessionManager.run(eA, async () => {
              await ed.run(await this.agentManager.getDefault(), [el], {
                context: eA,
              });
            }));
        } catch (eA: any) {
          this.logger.error(
            `[WechatBridge] Error running agent: ${eA.message}`,
          );
        } finally {
          this.isWaking = !1;
        }
      })());
  }
  async sendPromptSuggestionAndWaitForApproval(
    eA: any,
    el: any,
    ec: any,
  ): Promise<any> {
    this.pendingSuggestionApproval &&
      (this.pendingSuggestionApproval.resolve(!1),
      (this.pendingSuggestionApproval = void 0));
    try {
      let ec: any = `下一步建议：${eA}
继续执行吗？(y/n)`;
      await this.sendReply(el, ec);
    } catch (eA: any) {
      return (
        this.logger.warn(
          `[WechatBridge] Failed to send suggestion: ${eA.message}`,
        ),
        !1
      );
    }
    return new Promise((eA: any) => {
      this.pendingSuggestionApproval = { resolve: eA, sessionId: ec };
    });
  }
  tryHandleSuggestionApprovalReply(eA: any): any {
    if (!this.pendingSuggestionApproval) return !1;
    let el: any =
      this.sessionManager.getCurrent() ||
      this.sessionManager.sessionSubject?.getValue();
    if (el && el.id !== this.pendingSuggestionApproval.sessionId)
      return (this.resolvePendingSuggestionApproval(!1), !1);
    let ec: any = eA.trim().toLowerCase(),
      eu: any = ["n", "no", "不", "拒绝", "算了", "跳过"];
    return ["y", "yes", "确认", "好", "可以", "行", "执行"].includes(ec)
      ? (this.logger.info("[WechatBridge] Prompt suggestion approved by user"),
        this.resolvePendingSuggestionApproval(!0),
        !0)
      : eu.includes(ec)
        ? (this.logger.info(
            "[WechatBridge] Prompt suggestion rejected by user",
          ),
          this.resolvePendingSuggestionApproval(!1),
          !0)
        : (this.logger.info(
            "[WechatBridge] Prompt suggestion skipped (unrecognized input)",
          ),
          this.resolvePendingSuggestionApproval(!1),
          !1);
  }
  resolvePendingSuggestionApproval(eA: any): any {
    this.pendingSuggestionApproval &&
      (this.pendingSuggestionApproval.resolve(eA),
      (this.pendingSuggestionApproval = void 0));
  }
  async sendReply(eA: any, el: any, ec?: any): Promise<any> {
    let eu: any = this.resolveClient(eA),
      ed: any = this.buildReplyContext(eA, ec);
    (this.logger.info(
      `[WechatBridge] sendReply: chatId=${eA}, resolved_userId=${ed.userId}, client_instanceId=${eu.instanceId}`,
    ),
      await eu.sendReply(ed, el));
  }
  async sendImageReply(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any = this.resolveClient(eA);
    await ed.sendImageReply(this.buildReplyContext(eA, eu), el, ec);
  }
  async sendFileReply(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any = this.resolveClient(eA);
    await ed.sendFileReply(this.buildReplyContext(eA, eu), el, ec);
  }
  resolveClient(eA: any): any {
    let el: any = this.chatClientMap.get(eA);
    if (el && "connected" === el.status) return el;
    if (this.lastReplyContext?.sourceClient?.status === "connected")
      return this.lastReplyContext.sourceClient;
    let ec: any = this.clientFactory.getAll();
    for (let eA of ec) if ("connected" === eA.status) return eA;
    let eu: any = ec.map((eA: any) => eA.instanceId),
      ed: any = ec.filter((eA: any) => "connected" === eA.status).length;
    throw Error(
      [
        "No WeChat client is connected.",
        `Total instances: ${ec.length}`,
        `Connected instances: ${ed}`,
        0 === ed ? "Please connect at least one WeChat bot first." : "",
        `Chat ID provided: "${eA}"`,
        eu.length > 0
          ? `Available instance IDs: ${eu.join(", ")}`
          : "No instances available",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  parseChatId(eA: any): any {
    let el: any = eA.replace(/^wechat_/, ""),
      ec: any = el.indexOf("_");
    if (ec > 0) {
      let eu: any = el.substring(0, ec);
      if (this.clientFactory.get(eu))
        return { instanceId: eu, userId: el.substring(ec + 1) };
      this.logger.warn(
        `[WechatBridge] parseChatId: instanceId "${eu}" not found in factory, falling back to legacy format. chatId="${eA}"`,
      );
    }
    return { userId: el };
  }
  buildReplyContext(eA: any, el: any): any {
    return {
      clientType: "wechat",
      userId: this.parseChatId(eA).userId,
      conversationId: eA,
      platformData: { context_token: el },
    };
  }
}
