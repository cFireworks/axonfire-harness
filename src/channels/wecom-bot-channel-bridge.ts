import { user } from "@openai/agents";
import { ToolNames } from "../tools/tool-names.js";
import { CommandMessageUtils } from "../commands/command-message-utils.js";
import * as constants from "./channel-constants.js";
import { stripAtMention, escapeXmlAttr } from "./channel-constants.js";
import type { ChannelBridgeRuntime } from "./channel-runtime.js";
const eR = "wecom",
  ek = 1000,
  eM = constants.WECOM_CHANNEL_INSTRUCTIONS,
  e_ = constants,
  eQ = { ToolNames },
  ew = { user },
  eD = { CommandMessageUtils };
// extracted from codebuddy.js UTF-16 offsets 9995529..10011968; search term: "this.chatRoutes=new Map"
export class WecomBotChannelBridge {
  [key: string]: any;
  constructor(readonly runtime: ChannelBridgeRuntime) {
    Object.assign(this, runtime);
    ((this.chatRoutes = new Map()),
      (this.pendingPermissionRequests = new Map()),
      (this.subscribedClients = new Set()),
      (this.connectedCount = 0),
      (this.isWaking = !1));
  }
  initialize(): any {
    this.logger.setContext("WecomBotChannelBridge");
    try {
      for (let eA of this.clientFactory.getAll()) this.subscribeToClient(eA);
    } catch {}
    this.subscribeToAskInterruptions();
  }
  subscribeToClient(eA: any): any {
    let el: any = `${eA.clientType}:${eA.instanceId}`;
    this.subscribedClients.has(el) ||
      (this.subscribedClients.add(el),
      eA.onMessage.subscribe((eA: any) => {
        this.handleWecomMessage(eA).catch((eA: any) => {
          this.logger
            .error(`[WecomBridge] handleWecomMessage threw: ${eA?.message}
${eA?.stack}`);
        });
      }),
      eA.onStatusChange.subscribe((eA: any) => {
        "connected" === eA.status
          ? (this.connectedCount++,
            1 === this.connectedCount && this.registerAsChannel(),
            this.refreshAgentToolsAfterConnection())
          : "disconnected" === eA.status &&
            ((this.connectedCount = Math.max(0, this.connectedCount - 1)),
            0 === this.connectedCount &&
              this.channelManager.unregisterChannel(eR));
      }),
      this.logger.info(`[WecomBridge] Subscribed to client ${el}`));
  }
  registerAsChannel(): any {
    let eA: any = {
        notification: async (eA: any) => {
          eA.method === e_.CHANNEL_PERMISSION_REQUEST_METHOD &&
            (await this.sendPermissionRequestToUser(eA.params));
        },
      },
      el: any = {
        experimental: { "claude/channel": {}, "claude/channel/permission": {} },
      };
    (this.channelManager.registerChannel(eR, eA, el, eM),
      this.logger.info("[WecomBridge] Registered as internal channel"));
  }
  async refreshAgentToolsAfterConnection(): Promise<any> {
    try {
      let eA: any = await this.agentManager.getAll(),
        el: any = "WeComReply";
      for (let ec of (this.logger.info(
        `[WecomBridge] Refreshing tools for ${eA.length} agents after WeCom connection`,
      ),
      eA))
        try {
          let eA: any = await this.agentManager.getAgentConfig(ec.name);
          (eA?.tools &&
            !eA.tools.includes(el) &&
            (eA.tools.push(el),
            this.logger.info(
              `[WecomBridge] Injected ${el} into agent ${ec.name} config`,
            )),
            await this.agentManager.refreshAgentTools(ec.name));
        } catch (eA: any) {
          this.logger.warn(
            `[WecomBridge] Failed to refresh tools for ${ec.name}: ${eA?.message}`,
          );
        }
    } catch (eA: any) {
      this.logger.error(
        `[WecomBridge] Failed to refresh agent tools: ${eA instanceof Error ? eA.message : String(eA)}`,
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
    if (eA.tool_name === eQ.ToolNames.ASK_USER_QUESTION) return;
    if (!this.lastReplyContext)
      return void this.logger.warn(
        "[WecomBridge] No last reply context, cannot send permission request",
      );
    this.pendingPermissionRequests.set(eA.request_id, eA.tool_name);
    let el: any = this.formatPermissionMessage(eA.tool_name, eA.input_preview),
      ec: any = "ExitPlanMode" === eA.tool_name,
      eu: any = ec
        ? "(y=执行 | n=继续规划 | q=退出计划模式)"
        : "(y=允许 | n=拒绝 | a=总是允许)",
      ed: any =
        "group" === this.lastReplyContext?.platformData?.chattype
          ? "[请回复确认] "
          : "",
      ep: any = ec
        ? `${ed}${el}
${eu}`
        : `${ed}${el}
可以吗？${eu}`;
    try {
      (await this.doSendReply(this.lastReplyContext.chatId, ep),
        this.logger.info(
          `[WecomBridge] Sent permission request ${eA.request_id} for tool ${eA.tool_name}`,
        ));
    } catch (el: any) {
      (this.logger.error(
        `[WecomBridge] Failed to send permission request: ${el.message}`,
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
    (this.interruptionSubscription &&
      (this.interruptionSubscription.unsubscribe(),
      (this.interruptionSubscription = void 0)),
      (this.interruptionSubscription = eA.interruptionSubject?.subscribe(
        (eA: any) => {
          eA &&
            this.clientFactory
              .getAll()
              .some((eA: any) => "connected" === eA.status) &&
            this.lastReplyContext &&
            ("name" in eA.rawItem ? eA.rawItem.name : void 0) ===
              eQ.ToolNames.ASK_USER_QUESTION &&
            this.handleAskUserQuestion(eA);
        },
      )));
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
          "[WecomBridge] AskUserQuestion has no questions",
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
        `[WecomBridge] Failed to handle AskUserQuestion: ${eA.message}`,
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
      this.doSendReply(this.lastReplyContext.chatId, eu.join("\n")).catch(
        (eA: any) => {
          this.logger.error(
            `[WecomBridge] Failed to send question: ${eA.message}`,
          );
        },
      ));
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
      eh: any = stripAtMention(eA),
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
        `[WecomBridge] AskUserQuestion completed with ${Object.keys(ed).length} answers`,
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
    let ec: any = stripAtMention(eA).toLowerCase(),
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
            `[WecomBridge] Permission reply (unrecognized -> deny + forward): ${eh}`,
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
      this.logger.info(`[WecomBridge] Permission reply: ${eh} -> ${el}`),
      this.channelPermissionAdapter.handlePermissionResponse({
        requestId: eh,
        behavior: el,
      }),
      "consumed"
    );
  }
  async handleWecomMessage(eA: any): Promise<any> {
    let el: any = eA.replyContext.conversationId,
      ec: any = eA.replyContext.platformData?.instanceId ?? "",
      eu: any = eA.replyContext.platformData ?? {};
    if (
      (this.chatRoutes.set(el, { instanceId: ec, platformData: eu }),
      (this.lastReplyContext = {
        chatId: el,
        platformData: eu,
        instanceId: ec,
      }),
      this.tryHandleAskReply(eA.prompt))
    )
      return;
    let ed: any = this.tryHandlePermissionReply(eA.prompt);
    if ("consumed" === ed) return;
    if ("deny_and_forward" === ed)
      return void this.runtime.setTimeout(() => {
        try {
          let el: any = {
              chat_id: eA.replyContext.conversationId,
              sender: eA.replyContext.userId,
              user: eA.replyContext.userId,
            },
            ec: any = eA.replyContext.platformData?.chattype;
          ec && (el.chattype = String(ec));
          let eu: any = {
            serverName: eR,
            content: eA.prompt,
            meta: el,
            timestamp: this.runtime.now(),
          };
          (this.channelManager.eventSubject.next(eu),
            this.injectAndWakeAgent(eu));
        } catch (eA: any) {
          this.logger.error(
            `[WecomBridge] Failed to forward message after deny: ${eA.message}`,
          );
        }
      }, ek);
    if (
      this.tryHandleSuggestionApprovalReply(eA.prompt) ||
      (await this.tryHandleLocalCommand(eA.prompt, el))
    )
      return;
    let ep: any = {
        chat_id: eA.replyContext.conversationId,
        sender: eA.replyContext.userId,
        user: eA.replyContext.userId,
      },
      eg: any = eA.replyContext.platformData?.chattype;
    eg && (ep.chattype = String(eg));
    let eh: any = eA.replyContext.platformData?.mediaFiles;
    eh &&
      eh.length > 0 &&
      ((ep.file_path = eh[0]), eh.length > 1 && (ep.file_paths = eh.join(",")));
    let ef: any = {
      serverName: eR,
      content: eA.prompt,
      meta: ep,
      timestamp: this.runtime.now(),
    };
    (this.channelManager.eventSubject.next(ef), this.injectAndWakeAgent(ef));
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
          "[WecomBridge] No session available, discarding message",
        );
      (el.meta || (el.meta = {}),
        (el.meta.isChannelSession = !0),
        (el.meta.channelId = eR),
        (el.meta.channelChatId = eA.meta?.chat_id),
        (el.meta.channelChattype = eA.meta?.chattype),
        el.meta.channelChatId ||
          this.logger.warn(
            "[WecomBridge] No chat_id in event meta, prompt suggestion approval will be skipped",
          ));
      let ec: any = /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        eu: any = [`source="${escapeXmlAttr(eR)}"`];
      for (let [el, ed] of Object.entries(eA.meta || {}))
        ec.test(el) &&
          "source" !== el &&
          eu.push(`${el}="${escapeXmlAttr(String(ed))}"`);
      let ed: any = `<channel ${eu.join(" ")}>
${eA.content}
</channel>`,
        ep: any = (0, ew.user)(ed);
      this.isMainAgentRunning(el) || this.isWaking
        ? (this.logger.info(
            `[WecomBridge] Agent busy (status=${this.stateMachine.getSnapshot(el).status}, waking=${this.isWaking}), enqueueing message`,
          ),
          this.messageQueueManager.enqueueMessage(el, ep))
        : (this.logger.debug("[WecomBridge] Waking agent for channel message"),
          this.runAgentWithMessage(el, ep));
    } catch (eA: any) {
      this.logger.error(
        `[WecomBridge] Failed to inject message: ${eA.message}`,
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
            this.stateMachine.forceIdle(eA, "wecom-channel-wake-before-run"),
            await this.sessionManager.run(eA, async () => {
              await ed.run(await this.agentManager.getDefault(), [el], {
                context: eA,
              });
            }));
        } catch (eA: any) {
          this.logger.error(`[WecomBridge] Error running agent: ${eA.message}`);
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
      await this.doSendReply(el, ec);
    } catch (eA: any) {
      return (
        this.logger.warn(
          `[WecomBridge] Failed to send suggestion: ${eA.message}`,
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
    let ec: any = stripAtMention(eA).toLowerCase(),
      eu: any = ["n", "no", "不", "拒绝", "算了", "跳过"];
    return ["y", "yes", "确认", "好", "可以", "行", "执行"].includes(ec)
      ? (this.logger.info("[WecomBridge] Prompt suggestion approved by user"),
        this.resolvePendingSuggestionApproval(!0),
        !0)
      : eu.includes(ec)
        ? (this.logger.info("[WecomBridge] Prompt suggestion rejected by user"),
          this.resolvePendingSuggestionApproval(!1),
          !0)
        : (this.logger.info(
            "[WecomBridge] Prompt suggestion skipped (unrecognized input)",
          ),
          this.resolvePendingSuggestionApproval(!1),
          !1);
  }
  resolvePendingSuggestionApproval(eA: any): any {
    this.pendingSuggestionApproval &&
      (this.pendingSuggestionApproval.resolve(eA),
      (this.pendingSuggestionApproval = void 0));
  }
  async tryHandleLocalCommand(eA: any, el: any): Promise<any> {
    let ec: any,
      eu: any = (eA || "").trim();
    if (!eu.startsWith("/")) return !1;
    let ed: any = this.commandManager.parseCommand(eu);
    if (
      !ed ||
      this.commandManager.isOverriddenByCustom(ed.name) ||
      !this.commandManager.isLocalCommand(ed.name)
    )
      return !1;
    if (
      new Set([
        "/stats",
        "/rewind",
        "/theme",
        "/vim",
        "/keybindings",
        "/hooks",
        "/permissions",
        "/mcp",
        "/ide",
        "/plugin",
        "/sandbox",
        "/export",
        "/resume",
        "/rename",
        "/agents",
        "/memory",
        "/terminal-setup",
        "/output-style",
        "/login",
        "/logout",
        "/upgrade",
        "/install-github-app",
        "/migrate-installer",
        "/reload-plugins",
        "/plugin-validate",
        "/feedback",
        "/release-notes",
        "/add-dir",
      ]).has(ed.name)
    )
      return (
        this.logger.info(
          `[tryHandleLocalCommand] ${ed.name} is TUI-only, replying hint`,
        ),
        await this.sendReply(el, `命令 ${ed.name} 仅在终端 TUI 中可用。`),
        !0
      );
    let ep: any =
      this.sessionManager.getCurrent() ||
      this.sessionManager.sessionSubject?.getValue();
    if (!ep)
      return (
        this.logger.warn(
          `[tryHandleLocalCommand] No session available, falling back to agent path for ${ed.name}`,
        ),
        !1
      );
    this.logger.info(
      `[tryHandleLocalCommand] Executing ${ed.name} on session ${ep.id}`,
    );
    let eg: any = [],
      eh: any = ep.combineSubject.subscribe((eA: any) => {
        if ("input" !== eA.type) return;
        let el: any = eA.data;
        if (el?.role !== "user") return;
        let ec: any = el.content,
          eu: any = [];
        if ("string" == typeof ec) eu.push(ec);
        else if (Array.isArray(ec))
          for (let eA of ec)
            (eA?.type === "input_text" || eA?.type === "text") &&
              eA?.text &&
              eu.push(eA.text);
        for (let eA of eu) {
          if (eD.CommandMessageUtils.isSystemInternalMessage(eA)) continue;
          let el: any = eD.CommandMessageUtils.parseOutput(eA);
          el && el.text.trim() && eg.push(el.text);
        }
      });
    try {
      (await this.commandManager.executeLocalCommand({
        name: ed.name,
        session: ep,
        args: ed.args,
      }),
        await this.commandManager.finalizeCommandExecution(ep),
        (ec =
          eg
            .map((eA: any) => eA.trim())
            .filter(Boolean)
            .join("\n\n") || `✓ 已执行 ${ed.name}`));
    } catch (eA: any) {
      (this.logger.error(
        `[tryHandleLocalCommand] executeLocalCommand failed for ${ed.name}: ${eA?.message}`,
      ),
        (ec = `执行 ${ed.name} 失败: ${eA?.message || String(eA)}`));
    } finally {
      eh.unsubscribe();
    }
    try {
      await this.sendReply(el, ec);
    } catch (eA: any) {
      this.logger.error(
        `[tryHandleLocalCommand] sendReply failed: ${eA?.message}`,
      );
    }
    return !0;
  }
  async sendReply(eA: any, el: any): Promise<any> {
    await this.doSendReply(eA, el);
  }
  async doSendReply(eA: any, el: any): Promise<any> {
    let { client: ec, platformData: eu } = this.resolveClientForChat(eA);
    await ec.sendAsyncReply(
      {
        clientType: "wecom",
        userId: String(eu.chatid ?? ""),
        conversationId: eA,
        platformData: eu,
      },
      el,
    );
  }
  resolveClientForChat(eA: any): any {
    let el: any =
        this.chatRoutes.get(eA) ??
        (this.lastReplyContext
          ? {
              instanceId: this.lastReplyContext.instanceId ?? "default",
              platformData: this.lastReplyContext.platformData ?? {},
            }
          : void 0),
      ec: any = el?.platformData ?? {};
    if (!ec.chatid && eA.startsWith("wecom_")) {
      let el: any = eA.slice(6).split("_");
      if (el.length >= 2) {
        let eA: any = el[0],
          eu: any = eA !== el.slice(1).join("_");
        ((ec = { ...ec, chatid: eA, chattype: eu ? "group" : "single" }),
          this.logger.warn(
            `[WecomBridge] platformData.chatid was missing; extracted from chatId string: chatid=${eA}, chattype=${eu ? "group" : "single"}`,
          ));
      } else
        this.logger.warn(
          `[WecomBridge] platformData.chatid is missing and chatId "${eA}" could not be parsed (unexpected format)`,
        );
    }
    let eu: any = el?.instanceId ?? "",
      ed: any = this.clientFactory.get(eu);
    if (!ed || "connected" !== ed.status) {
      let eA: any = this.clientFactory
        .getAll()
        .find((eA: any) => "connected" === eA.status);
      if (eA) return { client: eA, platformData: ec };
      throw Error(`WeCom client (${eu}) is not connected`);
    }
    return { client: ed, platformData: ec };
  }
}
