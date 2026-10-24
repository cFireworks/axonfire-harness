// @ts-nocheck
// Original Desktop authentication manager and dependencies; framework/DI is explicitly bound.
import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators/index.js';
import {createNativeAuthenticationRuntime} from './native-authentication.js';
import {createNativeAuthProductCoordinator} from '../config/native-auth-product-coordinator.js';
export const DESKTOP_AUTHENTICATION_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","names":["SubscriptionManager","AuthenticationManagerImpl","AuthErrorCode","CanceledError","SignLicenseError","UnauthorizedError","NotFoundError","SPAN_LOGIN","SPAN_SWITCH_ACCOUNT","SPAN_STORAGE_SESSION","SPAN_REFRESH_SESSION","Events","UserAuthActionType","HTTP_HEADER_USER_ID","HTTP_HEADER_ENTERPRISE_ID","HTTP_HEADER_TENANT_ID","HTTP_HEADER_DOMAIN","HTTP_HEADER_DEPARTMENT_INFO"],"regions":[{"from":748998,"to":749060},{"from":764410,"to":764454},{"from":877574,"to":880665},{"from":1489323,"to":1497312},{"from":1497800,"to":1497988},{"from":2484681,"to":2484702},{"from":2484704,"to":2484745},{"from":2484747,"to":2484786},{"from":2484788,"to":2484829},{"from":2540906,"to":2540940},{"from":2540942,"to":2540988},{"from":2540990,"to":2541040},{"from":2541042,"to":2541080},{"from":2541082,"to":2541114},{"from":2542539,"to":2542901},{"from":2543056,"to":2543211},{"from":2543700,"to":2543853},{"from":2543855,"to":2544018},{"from":2546612,"to":2546741},{"from":2549898,"to":2572143}]} as const;
export function createNativeDesktopAuthentication(runtime:any={}) {
const console=runtime.console??globalThis.console,Date=runtime.Date??globalThis.Date,Math=runtime.Math??globalThis.Math;
const clearTimeout=runtime.clearTimeout??globalThis.clearTimeout,clearInterval=runtime.clearInterval??globalThis.clearInterval;
const core=runtime.core??createNativeAuthenticationRuntime(runtime).core;
const ProductFeature=runtime.productFeatures??createNativeAuthProductCoordinator(runtime).common.ProductFeature;
const import_common$12=core,import_common$14=core,import_common$57=core,HttpHeaders={},import_common$13={HttpHeaders};
var _AuthenticationManagerImpl,SubscriptionManager,AuthenticationManagerImpl,AuthErrorCode,CanceledError,SignLicenseError,UnauthorizedError,NotFoundError,SPAN_LOGIN,SPAN_SWITCH_ACCOUNT,SPAN_STORAGE_SESSION,SPAN_REFRESH_SESSION,Events,UserAuthActionType,HTTP_HEADER_USER_ID,HTTP_HEADER_ENTERPRISE_ID,HTTP_HEADER_TENANT_ID,HTTP_HEADER_DOMAIN,HTTP_HEADER_DEPARTMENT_INFO;
NotFoundError = class extends import_common$57.CustomError {};
HttpHeaders.AUTHORIZATION = "Authorization";
SubscriptionManager = class {
		constructor() {
			this.subscriptions = /* @__PURE__ */ new Set();
			this.disposables = /* @__PURE__ */ new Set();
			this.timers = /* @__PURE__ */ new Set();
			this.intervals = /* @__PURE__ */ new Set();
			this.isDisposed = false;
		}
		/**
		* 添加RxJS订阅
		*/
		addSubscription(subscription) {
			if (this.isDisposed) {
				subscription.unsubscribe();
				return;
			}
			this.subscriptions.add(subscription);
		}
		/**
		* 添加可销毁的资源
		*/
		addDisposable(disposable) {
			if (this.isDisposed) {
				disposable.dispose();
				return;
			}
			this.disposables.add(disposable);
		}
		/**
		* 添加定时器
		*/
		addTimer(timer) {
			if (this.isDisposed) {
				clearTimeout(timer);
				return;
			}
			this.timers.add(timer);
		}
		/**
		* 添加间隔定时器
		*/
		addInterval(interval) {
			if (this.isDisposed) {
				clearInterval(interval);
				return;
			}
			this.intervals.add(interval);
		}
		/**
		* 移除并取消订阅
		*/
		removeSubscription(subscription) {
			if (this.subscriptions.has(subscription)) {
				this.subscriptions.delete(subscription);
				if (!subscription.closed) subscription.unsubscribe();
			}
		}
		/**
		* 移除并清理定时器
		*/
		removeTimer(timer) {
			if (this.timers.has(timer)) {
				this.timers.delete(timer);
				clearTimeout(timer);
			}
		}
		/**
		* 移除并清理间隔定时器
		*/
		removeInterval(interval) {
			if (this.intervals.has(interval)) {
				this.intervals.delete(interval);
				clearInterval(interval);
			}
		}
		/**
		* 移除并清理可销毁资源
		*/
		removeDisposable(disposable) {
			if (this.disposables.has(disposable)) {
				this.disposables.delete(disposable);
				try {
					disposable.dispose();
				} catch (error) {
					console.warn("[SubscriptionManager] Error disposing resource during removal:", error);
				}
			}
		}
		/**
		* 获取当前管理的资源统计
		*/
		getStats() {
			return {
				subscriptions: this.subscriptions.size,
				disposables: this.disposables.size,
				timers: this.timers.size,
				intervals: this.intervals.size,
				isDisposed: this.isDisposed
			};
		}
		/**
		* 销毁所有管理的资源
		*/
		dispose() {
			if (this.isDisposed) return;
			this.isDisposed = true;
			this.subscriptions.forEach((subscription) => {
				try {
					if (!subscription.closed) subscription.unsubscribe();
				} catch (error) {
					console.warn("[SubscriptionManager] Error disposing subscription:", error);
				}
			});
			this.subscriptions.clear();
			this.timers.forEach((timer) => {
				try {
					clearTimeout(timer);
				} catch (error) {
					console.warn("[SubscriptionManager] Error clearing timer:", error);
				}
			});
			this.timers.clear();
			this.intervals.forEach((interval) => {
				try {
					clearInterval(interval);
				} catch (error) {
					console.warn("[SubscriptionManager] Error clearing interval:", error);
				}
			});
			this.intervals.clear();
			this.disposables.forEach((disposable) => {
				try {
					disposable.dispose();
				} catch (error) {
					console.warn("[SubscriptionManager] Error disposing resource:", error);
				}
			});
			this.disposables.clear();
		}
		/**
		* 检查是否已销毁
		*/
		get disposed() {
			return this.isDisposed;
		}
	};
Events = /* @__PURE__ */ function(Events) {
		Events["UserAuthAction"] = "user_auth_action";
		Events["PluginStatus"] = "plugin_status";
		Events["WorkspaceFileChange"] = "workspace_file_change";
		/** craft 功能使用数据 */
		Events["Craft"] = "craft";
		/** craft 编辑文件操作 */
		Events["CraftEditFile"] = "craft_edit_file";
		/** craft 终端执行操作 */
		Events["CraftTerminalExecution"] = "craft_terminal_execution";
		/** craft 文件应用状态 */
		Events["CraftFileApplyStatus"] = "craft_file_apply_status";
		/** craft 限制调用相关 */
		Events["CraftLimitCall"] = "craft_limit_call";
		/** llm craft request 上报 */
		Events["CraftRequestEvent"] = "craft_request";
		/** craft 按钮点击事件 */
		Events["CraftButtonClick"] = "craft_button_op";
		/** chat 面板上所有的点击事件 */
		Events["ChatClick"] = "chat_click_event";
		/** chat 面板点赞/点踩事件 */
		Events["VoteLikeDislike"] = "vote_like_dislike";
		/** 页面展示 */
		Events["PageExposure"] = "page_show";
		/** 页面点击事件 */
		Events["PageClick"] = "page_button_click";
		/** 页面加载事件 */
		Events["PageLoad"] = "page_load";
		/** Chat Request 开始 */
		Events["ChatRequestSend"] = "chat_request_send";
		/** Chat Request 响应 */
		Events["ChatRequestResponse"] = "chat_request_response";
		/** Chat Prompt 摩擦情绪分析 */
		Events["ChatPromptFrictionAnalysis"] = "chat_prompt_friction_analysis";
		/** Chat Message 开始 */
		Events["ChatMessageSend"] = "chat_message_send";
		/** Chat Message 响应 */
		Events["ChatMessageResponse"] = "chat_message_response";
		/** Chat Message 状态 */
		Events["ChatMessageStatus"] = "chat_message_status";
		/** Chat 工具执行 */
		Events["ChatToolAction"] = "chat_tool_action";
		/** Chat 文件操作 */
		Events["ChatFileAction"] = "chat_file_action";
		/** Chat 用户动作(点赞、点踩等) */
		Events["ChatUserAction"] = "chat_user_action";
		/** Chat Max Token 达到 */
		Events["ChatMaxTokenReached"] = "chat_max_token_reached";
		/** 用户任务失败退费检测事件 */
		Events["UserTaskFailedCreditRefund"] = "user_task_failed_credit_refund";
		/** 文件接收拒绝事件 */
		Events["FileReceivingRejection"] = "craft_file_op";
		/** 代码补全事件 */
		Events["CompletionTrigger"] = "completion_trigger";
		Events["CompletionResponse"] = "completion_response";
		Events["CompletionAction"] = "completion_action";
		Events["CompletionPostAccept"] = "completion_post_accept";
		Events["CompletionModelFileOperation"] = "file_op";
		Events["CommitGenerate"] = "commit_generate";
		Events["CommitGenerateCancel"] = "commit_generate_cancel";
		/** 代码编辑事件 */
		Events["CodeEdit"] = "code_edit";
		/** 文档变更事件 */
		Events["DocumentChange"] = "document_change";
		/**
		* AI 代码变更审计事件（reportScope=change / detailType=codeDiff）。
		* AI 代码真正写入文件成功后立即上报，承载对外协议 v1.0 的 codeDiff 行。
		* 仅在客户开启 ProductFeature.CodeAdoptionRate 且部署层支持时上报。
		*/
		Events["CodeChangeEvent"] = "code_change_event";
		/**
		* 本地 git commit 观察事件，触发后端归因聚合（reportScope=commit / detailType=lineStats）。
		* 端侧仅采集 commit hash + commit diff 的新增/删除行原材料；
		* lineStats 协议对象由后端聚合器组装并写入 ClickHouse。
		*/
		Events["CommitObserved"] = "commit_observed";
		Events["ActivityNotify"] = "activity_notify";
		Events["McpToolCall"] = "mcp_tool_call";
		Events["McpGetPrompt"] = "mcp_get_prompt";
		Events["McpServerAction"] = "mcp_action";
		Events["McpSettingsChange"] = "mcp_settings_change";
		Events["McpSelectPrompt"] = "mcp_select_prompt";
		/** 插件市场操作（添加/删除/更新市场） */
		Events["PluginMarketplaceAction"] = "plugin_marketplace_action";
		/** 插件市场页面曝光 */
		Events["PluginMarketplacePageShow"] = "plugin_marketplace_page_show";
		/** 插件操作（安装/卸载/启用/禁用） */
		Events["PluginAction"] = "plugin_action";
		/** 插件能力调用 */
		Events["PluginCapabilityCall"] = "plugin_capability_call";
		Events["RulesCreate"] = "rules_create";
		Events["CheckPointCreate"] = "checkpoint_create";
		Events["CheckPointRestore"] = "checkpoint_restore";
		Events["CheckPointRevert"] = "checkpoint_revert";
		Events["SkillCreate"] = "skill_create";
		Events["SkillInfo"] = "skill_info";
		/** Skill 操作（安装/卸载/启用/禁用） */
		Events["SkillAction"] = "skill_action";
		Events["IdeLifecycle"] = "ide_lifecycle";
		Events["IdeComponentClick"] = "ide_component_click";
		Events["IdeComponentAddChat"] = "ide_component_add_chat";
		Events["IdeComponentSend"] = "ide_component_send";
		Events["IdeFigmaSend"] = "ide_figma_send";
		Events["IdePictureClick"] = "ide_picture_click";
		Events["IdePictureUpload"] = "ide_picture_upload";
		Events["IdeIntergrationClick"] = "ide_intergration_click";
		Events["IdeIntergrationAuthClick"] = "ide_intergration_auth_click";
		Events["IdeIntergrationAuthResult"] = "ide_intergration_auth_result";
		Events["IdeIntegrationCompletion"] = "ide_integration_completion";
		Events["IdeSandboxCreateLink"] = "ide_sandbox_create_link";
		Events["IdeCommandCreate"] = "ide_command_create";
		Events["WebElementShow"] = "web_element_show";
		Events["WebElementClick"] = "web_element_click";
		Events["IdeBrowserPreviewModify"] = "ide_browser_preview_modify";
		Events["IdeBrowserSizeChange"] = "ide_browser_size_change";
		Events["IdePlanAction"] = "ide_plan_action";
		/** 任务管理：点击 "New Task" 按钮 */
		Events["AgentNewTaskButtonClicked"] = "agent_new_task_button_clicked";
		/** 任务管理：点击分组的 "+" 新建按钮（LOCAL 模式） */
		Events["AgentGroupNewTaskButtonClicked"] = "agent_group_new_task_button_clicked";
		/** 任务管理：点击归档按钮 */
		Events["AgentTaskArchiveClicked"] = "agent_task_archive_clicked";
		/** 任务管理：点击删除按钮 */
		Events["AgentTaskDeleteClicked"] = "agent_task_delete_clicked";
		/** 任务管理：确认归档任务 */
		Events["AgentTaskArchived"] = "agent_task_archived";
		/** 任务管理：删除任务 */
		Events["AgentTaskDeleted"] = "agent_task_deleted";
		/** 任务管理：应用筛选条件 */
		Events["AgentTaskFilterApplied"] = "agent_task_filter_applied";
		/** 任务对话：创建任务（发送第一条消息） */
		Events["AgentTaskCreated"] = "agent_task_created";
		/** 任务执行终态：完成（状态机驱动，issue #46366） */
		Events["AgentTaskCompleted"] = "agent_task_completed";
		/** 任务执行终态：失败/错误/终止（状态机驱动，issue #46366） */
		Events["AgentTaskFailed"] = "agent_task_failed";
		/** Session 无响应超时（NoResponseWatchdog 检测，prompt 发出后超阈值无 backend 活动） */
		Events["SessionNoResponseTimeout"] = "session_no_response_timeout";
		/** 任务对话：切换任务模式（Coding/Working） */
		Events["AgentTaskModeSwitched"] = "agent_task_mode_switched";
		/** 任务对话：点击模板卡片 */
		Events["AgentTemplateClicked"] = "agent_template_clicked";
		/** 任务对话：发起连接器授权 */
		Events["AgentConnectorAuthInitiated"] = "agent_connector_auth_initiated";
		/** 任务对话：发起上传文件 */
		Events["AgentUploadFileClicked"] = "agent_upload_file_clicked";
		/** 任务对话：修改任务标题 */
		Events["AgentTaskTitleEdited"] = "agent_task_title_edited";
		/** 任务对话：打开 Editor 编辑器（仅 LOCAL 模式） */
		Events["AgentEditorOpened"] = "agent_editor_opened";
		/** 产物管理：点击右侧面板的 Artifact 菜单 */
		Events["AgentArtifactTopMenuClicked"] = "agent_artifact_top_menu_clicked";
		/** 产物管理：点击 Artifact 面板的左侧菜单项 */
		Events["AgentArtifactSidebarClicked"] = "agent_artifact_sidebar_clicked";
		/** 产物管理：点击 Artifact 下载按钮 */
		Events["AgentArtifactDownloadClicked"] = "agent_artifact_download_clicked";
		/** 用户成功创建一条带模板的任务（发送第一条消息） */
		Events["AgentTaskCreatedWithTemplate"] = "agent_task_created_with_template";
		/** 用户成功创建一条自动化任务 */
		Events["AutomatedTaskCreateSuc"] = "automated_task_create_suc";
		/** 用户删除/取消一条自动化任务 */
		Events["AutomatedTaskDelete"] = "automated_task_delete";
		/** 自动化任务实际执行 */
		Events["AutomatedTaskExecute"] = "automated_task_execute";
		/** 专家实际使用 */
		Events["ExpertActualUse"] = "expert_actual_use";
		/** 连接器实际调用（Issue #33295） */
		Events["ConnectorInvoke"] = "connector_invoke";
		/** Claw 通道配置操作（添加/修改/删除/启用/禁用） */
		Events["ClawConfigAction"] = "claw_config_action";
		/** Claw 通道连接生命周期（连接/断开/重连/失败） */
		Events["ClawChannelConnection"] = "claw_channel_connection";
		/** Claw 消息上行（来自 IM 平台的消息接收与处理） */
		Events["ClawMessageUpstream"] = "claw_message_upstream";
		/** Claw 消息下行（Agent 回复的投递状态） */
		Events["ClawMessageDownstream"] = "claw_message_downstream";
		/** Desktop 自动更新关键节点（含 mac bundle id 迁移漏斗） */
		Events["AppUpdate"] = "app_update";
		/** 自定义模型调用埋点（走 /llm/data/report，仅自定义模型上报） */
		Events["CustomModelUsage"] = "custom_model_usage";
		return Events;
	}({});
UserAuthActionType = /* @__PURE__ */ function(UserAuthActionType) {
		UserAuthActionType["Login"] = "login";
		UserAuthActionType["Logout"] = "logout";
		return UserAuthActionType;
	}({});
SPAN_LOGIN = "LOGIN";
SPAN_REFRESH_SESSION = "REFRESH_SESSION";
SPAN_SWITCH_ACCOUNT = "SWITCH_ACCOUNT";
SPAN_STORAGE_SESSION = "STORAGE_SESSION";
HTTP_HEADER_USER_ID = "X-User-Id";
HTTP_HEADER_ENTERPRISE_ID = "X-Enterprise-Id";
HTTP_HEADER_DEPARTMENT_INFO = "X-Department-Info";
HTTP_HEADER_TENANT_ID = "X-Tenant-Id";
HTTP_HEADER_DOMAIN = "X-Domain";
AuthErrorCode = {
		OpenExternalLinkFailed: "AUTH_OPEN_EXTERNAL_LINK_FAILED",
		Sign: "AUTH_SIGN_FAILED",
		Timeout: "AUTH_TIMEOUT",
		Canceled: "AUTH_CANCELED",
		IpLimit: "AUTH_IP_LIMIT",
		Unauthorized: "AUTH_UNAUTHORIZED",
		Network: "AUTH_NETWORK_ERROR",
		PermissionDenied: "AUTH_PERMISSION_DENIED",
		License: "AUTH_LICENSE",
		Unknown: "AUTH_UNKNOWN"
	};
CanceledError = class extends import_common$14.CustomError {
		constructor(..._args2) {
			super(..._args2);
			this.code = AuthErrorCode.Canceled;
		}
	};
SignLicenseError = class extends import_common$14.CustomError {
		constructor(code, msg) {
			super(msg);
			this.code = code;
			this.msg = msg;
		}
	};
UnauthorizedError = class extends import_common$14.CustomError {
		constructor(..._args6) {
			super(..._args6);
			this.code = AuthErrorCode.Unauthorized;
		}
	};
function isWorkbuddyAuthenticationPlatform(platform) {
	return platform?.trim().toLowerCase().startsWith("workbuddy") ?? false;
}
AuthenticationManagerImpl = class AuthenticationManagerImpl {
		static {
			_AuthenticationManagerImpl = this;
		}
		constructor() {
			this.authenticationStorages = [];
			this.loggedOut = false;
			this.refreshInFlight = false;
			this.accountSwitchInFlight = false;
			this.loginInFlight = false;
			this.subscriptionManager = new SubscriptionManager();
			this.initializedDeferred = new import_common$12.Deferred();
			this.storageSessionRevision = 0;
			this.loginAttemptRevision = 0;
			this.authOperationRevision = 0;
			this.committedLoginRevision = 0;
			this.sessionPersistenceTail = Promise.resolve();
			this.disposed = false;
			this.initialized = this.initializedDeferred.promise;
			this.currentSessionSubject = new BehaviorSubject(void 0);
			this.authStorageResolved = false;
		}
		static {
			this.MIN_REFRESH_DELAY_MS = 15 * 1e3;
		}
		init() {
			this.logger.setContext("AuthenticationManager");
			this.doInit().catch((error) => {
				this.logger.warn("Failed to initialize authentication session:", error);
			});
		}
		async doInit() {
			const authenticationStorage = await this.getAuthenticationStorage();
			let stateApplicationTail = Promise.resolve();
			let restoringStorageSession = true;
			const storageSessionSubscription = authenticationStorage?.storeSessionSubject.pipe(distinctUntilChanged((prev, curr) => {
				if (!prev?.auth?.accessToken || !curr?.auth?.accessToken) return false;
				return JSON.stringify(prev) === JSON.stringify(curr);
			})).subscribe((value) => {
				if (this.disposed) return;
				const revision = ++this.storageSessionRevision;
				if (!!value?.auth?.accessToken) this.loggedOut = false;
				else if (!restoringStorageSession) {
					this.authOperationRevision++;
					this.loginAttemptRevision++;
					this.loggedOut = true;
					this.loginInFlight = false;
					this.accountSwitchInFlight = false;
					if (this.refreshTokenTimer) {
						this.refreshTokenTimer.cancel();
						this.refreshTokenTimer = void 0;
					}
					this.clearPendingSign();
					this.currentSessionSubject.next(void 0);
				}
				const stateApplication = stateApplicationTail.then(async () => {
					if (this.disposed || revision !== this.storageSessionRevision) return;
					if (value && this.loggedOut) return;
					await this.productEnvService.switchBySession(value);
					if (this.disposed || revision !== this.storageSessionRevision) return;
					if (value) this.currentSessionSubject.next(value);
				});
				stateApplicationTail = stateApplication.catch((error) => {
					this.logger.warn("Failed to apply stored session update:", error);
				});
				stateApplication.then(async () => {
					if (this.disposed || revision !== this.storageSessionRevision || !value) return;
					await this.scheduleRefreshSession(true);
					if (revision !== this.storageSessionRevision) return;
					await this.syncProductAfterSessionChange(value);
				}).catch((error) => {
					this.logger.warn("Failed to finish stored session update:", error);
				});
			});
			if (storageSessionSubscription) this.subscriptionManager.addSubscription(storageSessionSubscription);
			const currentSessionSubscription = this.currentSessionSubject.subscribe((session) => {
				if (session?.account?.uid) this.filePathService?.setCurrentUserId(session?.account?.uid);
			});
			this.subscriptionManager.addSubscription(currentSessionSubscription);
			let initSession;
			try {
				initSession = await authenticationStorage?.restore();
			} finally {
				restoringStorageSession = false;
			}
			if (this.productManager.configuration.getValue()?.productFeatures?.[ProductFeature.SwitchBySession]) await this.productEnvService.switchBySession(initSession);
			this.currentSessionSubject.next(initSession);
			this.initializedDeferred.resolve();
		}
		async checkNetworkConnectivity() {
			const authenticationProvider = await this.getAuthenticationProvider();
			if (typeof authenticationProvider?.checkNetworkConnectivity === "function") return authenticationProvider?.checkNetworkConnectivity?.();
			return [null, true];
		}
		async getLoginUrl() {
			try {
				return (await this.getAuthenticationProvider())?.lastAuthUrl;
			} catch {
				return;
			}
		}
		/**
		* 最近一次登录时浏览器是否成功打开。
		* false 表示浏览器未能自动打开（如无默认浏览器），上层可据此弹「请手动复制链接」
		* 的提示 toast —— 仅作提示，不中断登录轮询。
		*/
		async getLastBrowserOpenSuccess() {
			try {
				return (await this.getAuthenticationProvider())?.lastBrowserOpenSuccess !== false;
			} catch {
				return true;
			}
		}
		cancelLogin() {
			this.logger.info("[AuthenticationManager] cancelLogin called");
			this.loginAttemptRevision++;
			this.clearPendingSign();
			this.loginInFlight = false;
			this.clearLastAuthUrl();
		}
		async clearLastAuthUrl() {
			try {
				const authenticationProvider = await this.getAuthenticationProvider();
				if (authenticationProvider && "lastAuthUrl" in authenticationProvider) authenticationProvider.lastAuthUrl = void 0;
			} catch {}
		}
		async login(ctx) {
			if (this.loginInFlight) {
				this.logger.info("[AuthenticationManager] Login already in progress, cancelling previous one before starting new");
				this.cancelLogin();
			}
			const attemptRevision = ++this.loginAttemptRevision;
			const operationRevision = ++this.authOperationRevision;
			this.loggedOut = false;
			this.loginInFlight = true;
			this.accountSwitchInFlight = false;
			this.clearPendingSign();
			const authenticationProvider = await this.getAuthenticationProvider(ctx);
			if (attemptRevision !== this.loginAttemptRevision || operationRevision !== this.authOperationRevision) return false;
			const traceSpan = this.traceService.startTrace(SPAN_LOGIN);
			this.logger.info(`[${traceSpan.traceId}] Start login...`);
			try {
				this.pendingSignContext = {
					type: ctx?.type,
					abortController: ctx?.abortController ?? new AbortController(),
					traceSpan
				};
				const session = await authenticationProvider.createSession(this.pendingSignContext);
				if (!session) {
					traceSpan.markAsFailed();
					return false;
				}
				if (attemptRevision !== this.loginAttemptRevision || operationRevision !== this.authOperationRevision) {
					traceSpan.markAsFailed();
					this.logger.info("[AuthenticationManager] Discard login: a newer auth operation won");
					return false;
				}
				session.auth.lastRefreshTime = Date.now();
				let loginCommitted = false;
				await this.storeSession(session, traceSpan, void 0, {
					beforeStore: () => {
						if (attemptRevision !== this.loginAttemptRevision || operationRevision !== this.authOperationRevision) return false;
						this.loggedOut = false;
						return true;
					},
					afterStore: () => {
						if (attemptRevision !== this.loginAttemptRevision || operationRevision !== this.authOperationRevision || this.loggedOut) return;
						this.committedLoginRevision++;
						loginCommitted = true;
					}
				});
				if (!loginCommitted || attemptRevision !== this.loginAttemptRevision || operationRevision !== this.authOperationRevision || this.loggedOut) {
					traceSpan.markAsFailed();
					this.logger.info("[AuthenticationManager] Login was superseded by a concurrent logout");
					return false;
				}
				traceSpan.markAsSuccessful();
				this.eventService.report(Events.UserAuthAction, {
					userId: session.account?.uid || "",
					username: session.account?.nickname || "",
					userNickname: session.account?.nickname || "",
					enterpriseId: session.account?.enterpriseId || "",
					action: UserAuthActionType.Login,
					actionAt: Date.now()
				});
				this.currentSessionSubject.next(session);
				this.notifier.info("Successfully signed in.");
				return true;
			} catch (err) {
				traceSpan.markAsFailed(err);
				this.logger.error(`sign in error: ${err}`);
				if (!(err instanceof CanceledError)) if (err instanceof SignLicenseError) this.notifier.error(err.msg);
				else this.notifier.error("Login failed: {0}", [String(err)]);
				if (ctx?.errorHandler) ctx.errorHandler(err);
				return false;
			} finally {
				if (attemptRevision === this.loginAttemptRevision) this.loginInFlight = false;
			}
		}
		async logout() {
			this.authOperationRevision++;
			const committedLoginRevision = this.committedLoginRevision;
			const currentSession = this.currentSessionSubject.getValue();
			this.loggedOut = true;
			this.loginInFlight = false;
			this.accountSwitchInFlight = false;
			if (this.refreshTokenTimer) {
				this.refreshTokenTimer.cancel();
				this.refreshTokenTimer = void 0;
			}
			this.clearPendingSign();
			const authenticationStorage = await this.getAuthenticationStorage();
			this.eventService.report(Events.UserAuthAction, {
				userId: currentSession?.account?.uid || "",
				username: currentSession?.account?.nickname || "",
				userNickname: currentSession?.account?.nickname || "",
				enterpriseId: currentSession?.account?.enterpriseId || "",
				action: UserAuthActionType.Logout,
				actionAt: Date.now()
			});
			let logoutToken;
			if (authenticationStorage?.beginLogout) await this.runSessionPersistence(async () => {
				if (committedLoginRevision !== this.committedLoginRevision) return;
				logoutToken = await authenticationStorage.beginLogout?.();
			});
			if (currentSession && committedLoginRevision === this.committedLoginRevision) try {
				await (await this.getAuthenticationProvider()).removeSession(currentSession);
			} catch (error) {
				this.logger.warn("remove session error:", error);
			}
			if (await this.runSessionPersistence(async () => {
				if (committedLoginRevision !== this.committedLoginRevision) return false;
				return await authenticationStorage?.clean({ logoutToken }) !== false;
			})) {
				this.loggedOut = true;
				this.currentSessionSubject.next(void 0);
			}
		}
		async refreshSession() {
			await this.scheduleRefreshSession(true);
		}
		async switchAccount(account) {
			const currentSession = this.currentSessionSubject.getValue();
			if (!currentSession || this.loggedOut) return;
			const operationRevision = ++this.authOperationRevision;
			const storageRevision = this.storageSessionRevision;
			const currentUid = currentSession.account?.uid;
			this.accountSwitchInFlight = true;
			this.clearPendingSign();
			const traceSpan = this.traceService.startTrace(SPAN_SWITCH_ACCOUNT);
			this.logger.info(`[${traceSpan.traceId}] Start switch account...`);
			const pendingSignContext = {
				abortController: new AbortController(),
				traceSpan
			};
			this.pendingSignContext = pendingSignContext;
			try {
				const newSession = await (await this.getAuthenticationProvider()).switchAccount(account, currentSession, pendingSignContext);
				if (newSession) {
					if (operationRevision !== this.authOperationRevision || storageRevision !== this.storageSessionRevision || this.loggedOut) {
						traceSpan.markAsFailed();
						return;
					}
					if (!await this.storeSession(newSession, traceSpan, { preserveLogoutMarker: true }, { beforeStore: () => !this.disposed && !this.loggedOut && operationRevision === this.authOperationRevision && storageRevision === this.storageSessionRevision && currentUid === this.currentSessionSubject.getValue()?.account?.uid }) || operationRevision !== this.authOperationRevision || this.loggedOut) {
						traceSpan.markAsFailed();
						return;
					}
					traceSpan.markAsSuccessful();
				} else traceSpan.markAsFailed();
			} finally {
				if (operationRevision === this.authOperationRevision) this.accountSwitchInFlight = false;
				if (this.pendingSignContext === pendingSignContext) this.pendingSignContext = void 0;
			}
		}
		async waitAuthSession() {
			return new Promise((resolve) => {
				const subscription = this.currentSessionSubject.subscribe((authSession) => {
					if (authSession) {
						resolve(authSession);
						setTimeout(() => {
							subscription.unsubscribe();
						}, 0);
					}
				});
			});
		}
		/**
		* 构建认证头部信息
		* @param withAccessToken 是否包含访问令牌，默认为true
		* @param withDepartmentInfo 是否包含部门信息，默认为false
		* @param needRefreshToken 是否需要刷新令牌，默认为false
		* @returns 认证头部信息对象
		*/
		buildAuthHeaders(withAccessToken, withDepartmentInfo, needRefreshToken) {
			const currentSession = this.currentSessionSubject.getValue();
			if (!currentSession) return {};
			const { account, auth } = currentSession;
			const headers = {};
			if (account?.uid) headers[HTTP_HEADER_USER_ID] = account.uid;
			if (withAccessToken && auth?.accessToken) headers[import_common$13.HttpHeaders.AUTHORIZATION] = `Bearer ${auth.accessToken}`;
			if (account?.enterpriseId) {
				headers[HTTP_HEADER_ENTERPRISE_ID] = account.enterpriseId;
				headers[HTTP_HEADER_TENANT_ID] = account.enterpriseId;
			}
			if (auth?.domain) headers[HTTP_HEADER_DOMAIN] = auth.domain;
			if (withDepartmentInfo && account?.departmentFullName) headers[HTTP_HEADER_DEPARTMENT_INFO] = account.departmentFullName;
			if (needRefreshToken && auth?.refreshToken) headers["X-Refresh-Token"] = auth.refreshToken;
			return headers;
		}
		clearPendingSign() {
			if (this.pendingSignContext) {
				this.pendingSignContext.abortController.abort();
				this.pendingSignContext = void 0;
			}
		}
		async storeSession(session, traceSpan, options, lifecycle) {
			return this.runSessionPersistence(async () => {
				if (lifecycle?.beforeStore?.() === false) return false;
				const storageSessionSpan = traceSpan.startSpan(SPAN_STORAGE_SESSION);
				try {
					await (await this.getAuthenticationStorage())?.store(session, options);
					lifecycle?.afterStore?.();
					storageSessionSpan.markAsSuccessful();
					return true;
				} catch (err) {
					storageSessionSpan.markAsFailed(err);
					throw err;
				}
			});
		}
		runSessionPersistence(operation) {
			const result = this.sessionPersistenceTail.then(operation, operation);
			this.sessionPersistenceTail = result.then(() => void 0, () => void 0);
			return result;
		}
		/**
		* 旧版 WorkBuddy 会话没有 allAccounts，必须绕过“30 秒内已刷新”的保护执行一次元数据自愈。
		* 新快照写入后该条件自动失效，不会让每次冷启动都额外请求 console/accounts。
		*/
		shouldRecoverWorkbuddyAccountMetadata(session) {
			const configuration = this.productManager.configuration.getValue();
			return isWorkbuddyAuthenticationPlatform(configuration?.authentication?.attributes?.platform ?? configuration?.platform) && !session.allAccounts?.length;
		}
		async scheduleRefreshSession(immediately, retryTimes = 5) {
			if (this.refreshTokenTimer) {
				this.refreshTokenTimer.cancel();
				this.refreshTokenTimer = void 0;
			}
			retryTimes--;
			let session = this.currentSessionSubject.getValue();
			if (!session) return;
			if (immediately) {
				const lastRefreshTime = session.auth.lastRefreshTime || 0;
				if (Date.now() - lastRefreshTime < 30 * 1e3 && !this.shouldRecoverWorkbuddyAccountMetadata(session)) return;
			}
			if (!immediately) {
				const expiresAt = session.auth.expiresAt || 0;
				/**
				* 24小时刷新一次 token
				* 如果过期时间小于一天，则五分钟刷新
				*/
				let interval = 1440 * 60 * 1e3 + Math.floor(Math.random() * 10 * 60 * 1e3) - 300 * 1e3;
				if (expiresAt - 1440 * 60 * 1e3 < Date.now()) interval = 300 * 1e3 + Math.floor(Math.random() * 60 * 1e3);
				/**
				* 根据上一次刷新时间决定下一次刷新时间
				*/
				let delay = interval;
				const lastRefreshTime = session.auth.lastRefreshTime || 0;
				if (lastRefreshTime + interval < Date.now()) delay = 0;
				else delay = lastRefreshTime + interval - Date.now();
				if (delay === 0) {
					delay = _AuthenticationManagerImpl.MIN_REFRESH_DELAY_MS;
					this.logger.info(`[AuthenticationManager] Delay immediate refresh to fixed minimum: ${delay}ms`);
				}
				delay = Math.max(delay, _AuthenticationManagerImpl.MIN_REFRESH_DELAY_MS);
				const timer = (0, import_common$12.timeout)(delay);
				this.refreshTokenTimer = timer;
				try {
					await timer;
				} catch (e) {
					if (e instanceof import_common$12.CancellationError) return;
					this.logger.warn(`Token refresh timer error: ${e}`);
					return;
				}
			}
			session = this.currentSessionSubject.getValue();
			if (!session || this.loggedOut) return;
			if (this.accountSwitchInFlight) {
				this.logger.info("[AuthenticationManager] Skip refresh: account switch is in flight");
				return;
			}
			if (this.refreshInFlight) {
				this.logger.info("[AuthenticationManager] Skip refresh: refresh already in flight");
				return;
			}
			const refreshRevision = this.storageSessionRevision;
			const refreshOperationRevision = this.authOperationRevision;
			const refreshUid = session.account?.uid;
			const traceSpan = this.traceService.startTrace(SPAN_REFRESH_SESSION);
			this.logger.info(`[${traceSpan.traceId}] Start refresh session...`);
			let shouldRetry = false;
			let retryDelay = 0;
			this.refreshInFlight = true;
			try {
				const authenticationProvider = await this.getAuthenticationProvider();
				if (this.accountSwitchInFlight || refreshOperationRevision !== this.authOperationRevision) {
					this.logger.info("[AuthenticationManager] Discard refresh: account operation started before refresh request");
					return;
				}
				this.clearPendingSign();
				this.pendingSignContext = {
					abortController: new AbortController(),
					traceSpan
				};
				const refreshedSession = await authenticationProvider.refreshSession(session, this.pendingSignContext);
				if (this.loggedOut || refreshRevision !== this.storageSessionRevision) {
					this.logger.info("[AuthenticationManager] Discard refresh: session changed while refresh was in flight");
					return;
				}
				if (refreshedSession) {
					const currentUid = this.currentSessionSubject.getValue()?.account?.uid;
					const refreshedUid = refreshedSession.account?.uid;
					if (currentUid && refreshedUid && currentUid !== refreshedUid) {
						this.logger.warn(`Discarded refresh result: uid "${refreshedUid}" does not match current uid "${currentUid}"`);
						traceSpan.markAsFailed();
						return;
					}
					if (session?.account?.idp && !refreshedSession.account?.idp) {
						refreshedSession.account.idp = session.account.idp;
						this.logger.info(`Preserved idp field from original session: ${session.account.idp}`);
					}
					refreshedSession.auth.lastRefreshTime = Date.now();
					if (!await this.storeSession(refreshedSession, traceSpan, { preserveLogoutMarker: true }, { beforeStore: () => !this.disposed && !this.loggedOut && refreshRevision === this.storageSessionRevision && refreshOperationRevision === this.authOperationRevision && refreshUid === this.currentSessionSubject.getValue()?.account?.uid }) || this.disposed || this.loggedOut) {
						traceSpan.markAsFailed();
						this.logger.info("[AuthenticationManager] Discard refresh: session changed before persistence");
						return;
					}
					traceSpan.markAsSuccessful();
				} else {
					traceSpan.markAsFailed();
					this.logger.warn("refresh session error");
					if (retryTimes > 0 && !this.loggedOut) {
						const retryAttempt = 5 - retryTimes;
						retryDelay = Math.min(5e3 * Math.pow(2, Math.max(0, retryAttempt - 1)), 6e4);
						shouldRetry = true;
					}
				}
			} catch (error) {
				traceSpan.markAsFailed(error);
				this.logger.warn("refresh session error:", error);
				if (!(error instanceof UnauthorizedError) && retryTimes > 0 && !this.loggedOut) {
					const retryAttempt = 5 - retryTimes;
					retryDelay = Math.min(5e3 * Math.pow(2, Math.max(0, retryAttempt - 1)), 6e4);
					shouldRetry = true;
				}
			} finally {
				this.refreshInFlight = false;
			}
			if (shouldRetry) {
				this.logger.info(`[AuthenticationManager] Retry refresh in ${retryDelay}ms`);
				await (0, import_common$12.wait)(retryDelay);
				if (this.loggedOut) return;
				this.scheduleRefreshSession(immediately, retryTimes).catch((error) => {
					this.logger.warn("retry refresh session error:", error);
				});
			}
		}
		async setAuthenticationProvider(authenticationType) {
			let authenticationProvider = void 0;
			for (const provider of this.authenticationProvider.get()) if ((await provider.getAuthenticationType()).includes(authenticationType)) {
				authenticationProvider = provider;
				break;
			}
			if (!authenticationProvider) {
				const error = new NotFoundError("No available Authentication Provider found");
				this.logger.error(error);
				throw error;
			}
			this.customAuthenticationProvider = authenticationProvider;
		}
		async clearAuthenticationProvider() {
			this.customAuthenticationProvider = void 0;
		}
		async getAuthenticationProvider(ctx) {
			if (this.customAuthenticationProvider) return this.customAuthenticationProvider;
			let authenticationProvider = void 0;
			for (const provider of this.authenticationProvider.get()) if (await provider.support(ctx)) {
				authenticationProvider = provider;
				break;
			}
			if (!authenticationProvider) {
				const error = new NotFoundError("No available Authentication Provider found");
				this.logger.error(error);
				throw error;
			}
			return authenticationProvider;
		}
		async getAuthenticationStorage() {
			if (this.authStorageResolved) return this.cachedAuthStorage;
			const authenticationStorage = (await import_common$12.Prioritizeable.prioritizeAll(this.authenticationStorages, async (item) => {
				try {
					return await item.priority();
				} catch {
					return 0;
				}
			})).filter((p) => p.priority > 0).map((p) => p.value)[0];
			if (!authenticationStorage) {
				const error = new NotFoundError("No available Authentication Storage found");
				this.logger.error(error);
				throw error;
			}
			this.cachedAuthStorage = authenticationStorage;
			this.authStorageResolved = true;
			return authenticationStorage;
		}
		async syncProductAfterSessionChange(session) {
			if (!session) return;
			await this.productManager.sync(true);
		}
		/**
		* 清理所有资源，防止内存泄漏
		*/
		dispose() {
			if (this.disposed) return;
			this.disposed = true;
			this.loggedOut = true;
			this.loginInFlight = false;
			this.accountSwitchInFlight = false;
			this.authOperationRevision++;
			this.loginAttemptRevision++;
			this.storageSessionRevision++;
			this.clearPendingSign();
			if (this.refreshTokenTimer) {
				this.refreshTokenTimer.cancel();
				this.refreshTokenTimer = void 0;
			}
			this.subscriptionManager.dispose();
			try {
				this.currentSessionSubject.complete();
			} catch (error) {
				this.logger.warn("Error completing currentSessionSubject:", error);
			}
			this.logger.info("AuthenticationManager disposed successfully");
		}
	};
return {AuthenticationManagerImpl,SubscriptionManager,CanceledError,SignLicenseError,UnauthorizedError,NotFoundError,AuthErrorCode,isWorkbuddyAuthenticationPlatform};
}
