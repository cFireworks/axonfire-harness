// @ts-nocheck
// Complete original Desktop external-link provider and account helpers; explicit host bindings only.
import {URI as URI$1} from 'vscode-uri';import {createNativeAuthenticationRuntime} from './native-authentication.js';
export const DESKTOP_EXTERNAL_LINK_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","names":["ExternalLinkAuthenticationProvider","SIGN_IN_PENDING_TIMEOUT","SIGN_IN_FETCH_INTERVAL","SWITCH_ACCOUNT_RETRY_TIMES","MAX_ACCOUNT_AUTH_RETRIES","globalLoginStepVersion","RESPONSE_CODE_IP_LIMIT","ServerErrorCode","LICENSE_ERROR_CODES","AuthenticationType","Edition","HTTP_HEADER_DOMAIN","AuthErrorCode","TimeoutError","CanceledError","OpenExternalLinkError","SignError","SignIpLimitError","SignLicenseError","UnauthorizedError","SPAN_OPEN_EXTERNAL_LINK","SPAN_GET_AUTH_STATE","SPAN_GET_AUTH_TOKEN","SPAN_GET_ACCOUNT","SPAN_GET_ACCOUNT_LIST"],"regions":[{"from":36825,"to":37444},{"from":2484831,"to":2484870},{"from":2484872,"to":2484919},{"from":2484921,"to":2484960},{"from":2484962,"to":2484995},{"from":2484997,"to":2485040},{"from":2541082,"to":2541114},{"from":2541388,"to":2541595},{"from":2542539,"to":2542901},{"from":2542903,"to":2543054},{"from":2543056,"to":2543211},{"from":2543213,"to":2543390},{"from":2543392,"to":2543539},{"from":2543541,"to":2543698},{"from":2543700,"to":2543853},{"from":2543855,"to":2544018},{"from":2546612,"to":2546741},{"from":2546789,"to":2546870},{"from":2546901,"to":2547052},{"from":2547170,"to":2547369},{"from":2547503,"to":2548971},{"from":2575611,"to":2576001},{"from":2576052,"to":2576179},{"from":2576476,"to":2576689},{"from":2577383,"to":2577419},{"from":2577421,"to":2577450},{"from":2577452,"to":2577483},{"from":2577485,"to":2577514},{"from":2577516,"to":2577543},{"from":2577545,"to":2577576},{"from":2577578,"to":2578105},{"from":2578107,"to":2578244},{"from":2578246,"to":2596603}]} as const;
export function createNativeDesktopExternalLink(runtime:any={}){
const core=runtime.core??createNativeAuthenticationRuntime(runtime).core,import_common$10=core,import_common$14=core;
const process=runtime.process??globalThis.process,Date=runtime.Date??globalThis.Date,console=runtime.console??globalThis.console,setTimeout=runtime.setTimeout??globalThis.setTimeout,clearTimeout=runtime.clearTimeout??globalThis.clearTimeout;
var globalLoginStepCallback,globalLoginSessionId,ExternalLinkAuthenticationProvider,SIGN_IN_PENDING_TIMEOUT,SIGN_IN_FETCH_INTERVAL,SWITCH_ACCOUNT_RETRY_TIMES,MAX_ACCOUNT_AUTH_RETRIES,globalLoginStepVersion,RESPONSE_CODE_IP_LIMIT,ServerErrorCode,LICENSE_ERROR_CODES,AuthenticationType,Edition,HTTP_HEADER_DOMAIN,AuthErrorCode,TimeoutError,CanceledError,OpenExternalLinkError,SignError,SignIpLimitError,SignLicenseError,UnauthorizedError,SPAN_OPEN_EXTERNAL_LINK,SPAN_GET_AUTH_STATE,SPAN_GET_AUTH_TOKEN,SPAN_GET_ACCOUNT,SPAN_GET_ACCOUNT_LIST;
AuthenticationType = /* @__PURE__ */ function(AuthenticationType) {
		/**
		* 自定义 token 登录
		*/
		AuthenticationType["CUSTOM_TOKEN"] = "custom-token";
		/**
		* 微信登录
		*/
		AuthenticationType["WECHAT"] = "wechat";
		/**
		* 通过外部链接登录
		*/
		AuthenticationType["EXTERNAL_LINK"] = "external-link";
		AuthenticationType["EXTERNAL_LINK_V2"] = "external-link-v2";
		/**
		* 通过 IDE 宿主提供
		*/
		AuthenticationType["IDE_HOST"] = "ide-host";
		/**
		* 支持自定义域名登录
		*/
		AuthenticationType["CUSTOM_HOSTNAME"] = "custom-hostname";
		AuthenticationType["CLI_EXTERNAL_LINK"] = "cli-external-link";
		return AuthenticationType;
	}({});
SPAN_GET_AUTH_STATE = "GET_AUTH_STATE";
SPAN_OPEN_EXTERNAL_LINK = "OPEN_EXTERNAL_LINK";
SPAN_GET_AUTH_TOKEN = "GET_AUTH_TOKEN";
SPAN_GET_ACCOUNT = "GET_ACCOUNT";
SPAN_GET_ACCOUNT_LIST = "GET_ACCOUNT_LIST";
HTTP_HEADER_DOMAIN = "X-Domain";
Edition = /* @__PURE__ */ function(Edition) {
		Edition["Pro"] = "pro";
		Edition["Personal"] = "personal";
		Edition["Ultimate"] = "ultimate";
		Edition["Exclusive"] = "exclusive";
		return Edition;
	}({});
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
TimeoutError = class extends import_common$14.CustomError {
		constructor(..._args) {
			super(..._args);
			this.code = AuthErrorCode.Timeout;
		}
	};
CanceledError = class extends import_common$14.CustomError {
		constructor(..._args2) {
			super(..._args2);
			this.code = AuthErrorCode.Canceled;
		}
	};
OpenExternalLinkError = class extends import_common$14.CustomError {
		constructor(..._args3) {
			super(..._args3);
			this.code = AuthErrorCode.OpenExternalLinkFailed;
		}
	};
SignError = class extends import_common$14.CustomError {
		constructor(..._args4) {
			super(..._args4);
			this.code = AuthErrorCode.Sign;
		}
	};
SignIpLimitError = class extends import_common$14.CustomError {
		constructor(..._args5) {
			super(..._args5);
			this.code = AuthErrorCode.IpLimit;
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
function normalizeAccountType(type) {
	return type?.trim().toLowerCase() ?? "";
}
function normalizeAccountAvatar(account) {
	return {
		...account,
		avatarUrl: account.avatarUrl?.trim() || account.avatar_url?.trim() || void 0
	};
}
function createAccountSnapshot(accounts) {
	const allAccounts = accounts.map(normalizeAccountAvatar);
	return {
		allAccounts,
		accounts: allAccounts.filter((account) => account.pluginEnabled)
	};
}
function mergeCurrentAccountDetails(account, accounts) {
	const sameUidAccounts = accounts.filter((item) => item.uid === account.uid);
	const normalizedType = normalizeAccountType(account.type);
	const normalizedEnterpriseId = account.enterpriseId?.trim() ?? "";
	const exactMatches = sameUidAccounts.filter((item) => normalizeAccountType(item.type) === normalizedType && (item.enterpriseId?.trim() ?? "") === normalizedEnterpriseId);
	const enterpriseMatches = normalizedEnterpriseId ? sameUidAccounts.filter((item) => item.enterpriseId?.trim() === normalizedEnterpriseId) : [];
	const lastLoginMatches = !normalizedEnterpriseId ? sameUidAccounts.filter((item) => item.lastLogin && (normalizedType === Edition.Personal ? normalizeAccountType(item.type) === Edition.Personal : normalizeAccountType(item.type) !== Edition.Personal)) : [];
	const matchedAccount = exactMatches.length === 1 ? exactMatches[0] : enterpriseMatches.length === 1 ? enterpriseMatches[0] : lastLoginMatches.length === 1 ? lastLoginMatches[0] : void 0;
	if (!matchedAccount) return normalizeAccountAvatar(account);
	const accountAvatarUrl = normalizeAccountAvatar(account).avatarUrl;
	const matchedAvatarUrl = normalizeAccountAvatar(matchedAccount).avatarUrl;
	return normalizeAccountAvatar({
		...account,
		...matchedAccount,
		uid: account.uid,
		type: account.type,
		enterpriseId: account.enterpriseId ?? matchedAccount.enterpriseId,
		avatarUrl: matchedAvatarUrl || accountAvatarUrl
	});
}
function setLoginStepCallback(callback, onlyIfVersion, loginSessionId) {
	if (callback === void 0 && onlyIfVersion !== void 0 && onlyIfVersion !== globalLoginStepVersion) return globalLoginStepVersion;
	globalLoginStepVersion++;
	globalLoginStepCallback = callback;
	if (callback) globalLoginSessionId = loginSessionId;
	else globalLoginSessionId = void 0;
	return globalLoginStepVersion;
}
function emitLoginStep(version, step, dims) {
	if (version === globalLoginStepVersion) globalLoginStepCallback?.(step, dims);
}
function toSignLicenseError(error) {
	const body = error?.response?.data;
	if (body && typeof body.code === "number" && LICENSE_ERROR_CODES.has(body.code)) return new SignLicenseError(body.code, body.msg ?? "");
}
SIGN_IN_PENDING_TIMEOUT = 300 * 1e3;
SIGN_IN_FETCH_INTERVAL = 1e3;
SWITCH_ACCOUNT_RETRY_TIMES = 1;
MAX_ACCOUNT_AUTH_RETRIES = 5;
globalLoginStepVersion = 0;
RESPONSE_CODE_IP_LIMIT = 10081;
ServerErrorCode = /* @__PURE__ */ function(ServerErrorCode) {
		ServerErrorCode[ServerErrorCode["RetryFetchToken"] = 11217] = "RetryFetchToken";
		ServerErrorCode[ServerErrorCode["RetryFetchAccount"] = 12151] = "RetryFetchAccount";
		ServerErrorCode[ServerErrorCode["LicenseSeatLimit"] = 12005] = "LicenseSeatLimit";
		ServerErrorCode[ServerErrorCode["LicenseExpired"] = 11212] = "LicenseExpired";
		ServerErrorCode[ServerErrorCode["TrialExpired"] = 11216] = "TrialExpired";
		return ServerErrorCode;
	}(ServerErrorCode || {});
LICENSE_ERROR_CODES = new Set([
		ServerErrorCode.LicenseSeatLimit,
		ServerErrorCode.LicenseExpired,
		ServerErrorCode.TrialExpired
	]);
ExternalLinkAuthenticationProvider = class ExternalLinkAuthenticationProvider {
		constructor() {
			this.lastBrowserOpenSuccess = true;
		}
		init() {
			this.logger.setContext("ExternalLinkAuthenticationProvider");
			this.productManager.configuration.subscribe((configuration) => {
				this.configuration = configuration || {};
			});
		}
		async checkNetworkConnectivity() {
			try {
				const platform = this.configuration.authentication?.attributes?.platform ?? this.configuration.platform;
				await this.restOperations.post(`/v2${this.prefixPath}/auth/state?platform=${platform}`, null, { timeout: 5e3 });
				return [null, true];
			} catch (error) {
				let errorMessage = "Unknown error";
				if (error instanceof Error) errorMessage = error.message;
				else if (typeof error === "string") errorMessage = error;
				else if (typeof error === "object" && error !== null && "toString" in error) errorMessage = error.toString();
				const axiosError = error;
				if (axiosError && axiosError.response && axiosError.response.data) {
					const responseData = axiosError.response.data;
					if (responseData && typeof responseData === "object" && "code" in responseData && responseData.code) {
						console.error(`Error with code ${responseData.code}: ${axiosError.message}`);
						return [`Error: ${axiosError.message}`, null];
					}
					this.logger.error(`Error details: ${JSON.stringify(responseData)}`);
				}
				const errorStr = errorMessage.toLowerCase();
				if (errorStr.includes("proxy")) {
					this.logger.error("Proxy connection error detected");
					return [`Network connectivity test failed: ${errorMessage}`, null];
				} else if (errorStr.includes("socket") || errorStr.includes("connect") || errorStr.includes("network") || errorStr.includes("timeout")) {
					this.logger.error(" Network connection error detected");
					return ["Unable to connect to server. Please check your network settings or confirm your network location.\n\n无法连接服务器，请检查您的网络设置，或当前区域暂不支持此服务，请确认您的网络位置", null];
				}
				this.logger.error(`Other error detected, original error: ${errorMessage}`);
				return ["Unable to connect to server. Please check your network settings or confirm your network location.\n\n无法连接服务器，请检查您的网络设置，或当前区域暂不支持此服务，请确认您的网络位置", null];
			}
		}
		async support(ctx) {
			await this.productManager.waitConfiguration();
			const isSupport = this.configuration.authentication?.type === AuthenticationType.EXTERNAL_LINK || this.configuration.authentication?.type === AuthenticationType.EXTERNAL_LINK_V2;
			if (isSupport && !!ctx?.type) await this.productEnvService.switch(ctx?.type);
			return isSupport;
		}
		async getAuthenticationType() {
			return [AuthenticationType.EXTERNAL_LINK, AuthenticationType.EXTERNAL_LINK_V2];
		}
		async createSession(ctx) {
			if (ctx?.type) await this.productEnvService.switch(ctx?.type);
			const startTime = Date.now();
			const stepVersion = globalLoginStepVersion;
			let timer;
			const timeoutPromise = new Promise((_resolve, reject) => {
				timer = setTimeout(() => reject(new TimeoutError()), SIGN_IN_PENDING_TIMEOUT);
			});
			const mainPromise = (async () => {
				try {
					emitLoginStep(stepVersion, "state_request", {});
					const stateStartTime = Date.now();
					const authState = await this.fetchAuthState(ctx);
					emitLoginStep(stepVersion, "state_received", { duration_ms: String(Date.now() - stateStartTime) });
					const openExternalLinkSpan = ctx.traceSpan.startSpan(SPAN_OPEN_EXTERNAL_LINK);
					this.lastBrowserOpenSuccess = true;
					await this.openAuthUrl(authState);
					ctx.browserOpened = this.lastBrowserOpenSuccess;
					emitLoginStep(stepVersion, "browser_open", { outcome: "success" });
					openExternalLinkSpan.markAsSuccessful();
					emitLoginStep(stepVersion, "polling_start", {});
					const pollingStartTime = Date.now();
					const authToken = await this.loopGetToken(authState, startTime, ctx);
					emitLoginStep(stepVersion, "token_received", { duration_ms: String(Date.now() - pollingStartTime) });
					const accountStartTime = Date.now();
					const account = await this.loopGetAccount(authState, authToken, startTime, ctx);
					emitLoginStep(stepVersion, "account_received", { duration_ms: String(Date.now() - accountStartTime) });
					const accountSnapshot = await this.getAccountSnapshot(authToken, ctx);
					const accountWithDetails = this.mergeAccountFromSnapshot(account, accountSnapshot);
					emitLoginStep(stepVersion, "completed", { duration_ms: String(Date.now() - startTime) });
					return {
						account: accountWithDetails,
						auth: authToken,
						...this.toSessionAccountLists(accountSnapshot)
					};
				} catch (error) {
					this.logger.error(`createSession main logic error: ${error}`);
					if (!(error instanceof CanceledError)) {
						const failedStep = this.classifyFailedStep(error, startTime);
						emitLoginStep(stepVersion, "failed", {
							error_kind: failedStep.errorKind,
							failed_step: failedStep.step
						});
					}
					throw error;
				}
			})();
			try {
				const result = await Promise.race([mainPromise, timeoutPromise]);
				if (timer) clearTimeout(timer);
				return result;
			} catch (error) {
				if (timer) clearTimeout(timer);
				if (error instanceof TimeoutError) {
					globalLoginStepCallback?.("polling_timeout", {});
					if (ctx.browserOpened !== true) {
						this.logger.warn("[ExternalLinkAuth] Timeout with browser not opened, reclassify as OpenExternalLinkError");
						throw new OpenExternalLinkError();
					}
				}
				this.logger.error(`createSession error: ${error}`);
				throw error;
			}
		}
		async refreshSession(session, ctx) {
			const shouldRefreshToken = !!session.auth.refreshToken;
			if (!shouldRefreshToken && !this.isWorkbuddyPlatform()) return session;
			try {
				let authToken;
				if (shouldRefreshToken) {
					authToken = (await this.restOperations.post(`/v2${this.prefixPath}/auth/token/refresh`, {}, { headers: {
						...this.enterpriseHeaders(session.auth),
						"X-Refresh-Token": session.auth.refreshToken,
						"X-Auth-Refresh-Source": "plugin",
						...ctx.traceSpan.requestHeaders
					} }) || { data: { data: void 0 } }).data.data;
					if (authToken) {
						authToken.lastRefreshTime = Date.now();
						this.calculateExpiresAt(authToken);
					}
				} else authToken = { ...session.auth };
				if (authToken) {
					const accountSnapshot = await this.getAccountSnapshot(authToken, ctx);
					if (!accountSnapshot.allAccounts.length) {
						const error = new SignError("Failed to refresh session: account list is empty");
						this.logger.error(error);
						throw error;
					}
					const account = this.isWorkbuddyPlatform() ? this.mergeAccountFromSnapshot(session.account, accountSnapshot) : accountSnapshot.accounts.find((item) => item.lastLogin) || accountSnapshot.accounts[0];
					if (!account) {
						const error = new SignError("Failed to refresh session: current account is null");
						this.logger.error(error);
						throw error;
					}
					return {
						...session,
						account,
						auth: authToken,
						...this.toSessionAccountLists(accountSnapshot)
					};
				}
			} catch (error) {
				this.logger.error(`refresh token error: ${error}`);
				if (this.isAuthenticationInvalidError(error)) throw new UnauthorizedError(error);
			}
			throw new SignError("Failed to refresh token");
		}
		async removeSession() {}
		async switchAccount(account, authSession, ctx) {
			const { type, enterpriseId } = account;
			const path = type === Edition.Personal ? `/v2${this.prefixPath}/login/enterprise` : `/v2${this.prefixPath}/login/enterprise/${enterpriseId}`;
			let retryTimes = SWITCH_ACCOUNT_RETRY_TIMES;
			let currentSession = authSession;
			while (retryTimes > 0) {
				retryTimes--;
				try {
					const { data: { data: newAuthToken } } = await this.restOperations.post(path, {}, {
						signal: ctx?.abortController?.signal,
						headers: (() => {
							const headers = {
								...this.enterpriseHeaders(currentSession.auth),
								"X-Refresh-Token": currentSession.auth.refreshToken,
								Authorization: `Bearer ${currentSession.auth.accessToken}`,
								...ctx.traceSpan.requestHeaders
							};
							if (enterpriseId) {
								headers["X-Enterprise-Id"] = enterpriseId;
								headers["X-Tenant-Id"] = enterpriseId;
							}
							return headers;
						})()
					}) || { data: { data: void 0 } };
					if (newAuthToken) {
						newAuthToken.domain = newAuthToken?.domain ?? currentSession.auth?.domain;
						newAuthToken.lastRefreshTime = Date.now();
						this.calculateExpiresAt(newAuthToken);
						const accountSnapshot = await this.getAccountSnapshot(newAuthToken, ctx);
						return {
							account: this.mergeAccountFromSnapshot(account, accountSnapshot),
							auth: newAuthToken,
							...this.toSessionAccountLists(accountSnapshot)
						};
					}
				} catch (error) {
					this.logger.error(`switch account error: ${error}`);
					if (error?.response?.code === 403) {
						currentSession = await this.refreshSession(currentSession, ctx);
						continue;
					}
					if (await this.isIpLimitError(error)) throw new SignIpLimitError();
					break;
				}
			}
			throw new SignError("Failed to switch account");
		}
		async fetchAuthState(ctx) {
			const stateSpan = ctx.traceSpan.startSpan(SPAN_GET_AUTH_STATE);
			const platform = this.configuration.authentication?.attributes?.platform ?? this.configuration.platform;
			try {
				const { data: { data: authState } } = await this.restOperations.post(`/v2${this.prefixPath}/auth/state?platform=${platform}`, {}, {
					headers: {
						...this.enterpriseHeaders(),
						["X-No-Authorization"]: "true",
						["X-No-User-Id"]: "true",
						["X-No-Enterprise-Id"]: "true",
						["X-No-Department-Info"]: "true"
					},
					...ctx.traceSpan.requestHeaders
				}) || { data: { data: void 0 } };
				if (authState) {
					stateSpan.markAsSuccessful();
					return authState;
				}
				const error = new SignError("Failed to fetch auth state");
				stateSpan.markAsFailed(error);
				throw error;
			} catch (error) {
				this.logger.error(`fetch auth state error: ${error}`);
				stateSpan.markAsFailed(error);
				const licenseError = toSignLicenseError(error);
				if (licenseError) throw licenseError;
				throw error;
			}
		}
		async openAuthUrl(authState) {
			const platform = this.configuration.authentication?.attributes?.platform ?? this.configuration.platform;
			const url = new URL(authState.authUrl);
			const launchSchema = process.env.launch_schema;
			if (launchSchema) {
				const whitelist = this.configuration.authentication?.attributes?.launchSchemaWhitelist || [];
				if (whitelist.includes(launchSchema) || !whitelist.length) {
					url.searchParams.append("launch_schema", launchSchema);
					this.logger.info(`Added launch_schema parameter: ${launchSchema}`);
				} else this.logger.info(`launch_schema "${launchSchema}" not in whitelist, skipping`);
			}
			const version = (await this.clientInfoProvider.get()).pluginVersion;
			if (version) url.searchParams.append("version", version);
			if (globalLoginSessionId && platform?.toLowerCase() === "workbuddy") url.searchParams.set("loginSessionId", globalLoginSessionId);
			const finalUrl = url.toString();
			this.lastAuthUrl = finalUrl;
			const subscription = this.externalUriOpener.urlSubject.subscribe((externalUrl) => {
				this.lastAuthUrl = externalUrl;
			});
			const openSuccess = await this.externalUriOpener.open(finalUrl);
			subscription.unsubscribe();
			/**
			* 某些情况下（如用户未设置默认浏览器），点击登录后编辑器可能无法自动打开浏览器，导致登录流程无法继续。
			* 此处将授权地址输出到日志，便于用户手动复制该地址到浏览器中完成登录。
			*/
			this.logger.info(`Opening auth URL: ${finalUrl}`);
			this.logger.info(`[ExternalLinkAuth] externalUriOpener.open returned openSuccess=${openSuccess}`);
			this.lastBrowserOpenSuccess = openSuccess;
			if (!openSuccess) this.logger.warn("[ExternalLinkAuth] browser open failed, keep polling so manual login can still complete");
		}
		async loopGetToken(authState, startTime, ctx) {
			const span = ctx.traceSpan.startSpan(SPAN_GET_AUTH_TOKEN);
			while (Date.now() - startTime < SIGN_IN_PENDING_TIMEOUT) {
				await (0, import_common$10.wait)(SIGN_IN_FETCH_INTERVAL);
				if (ctx.abortController.signal.aborted) {
					span.markAsFailed("Canceled");
					throw new CanceledError();
				}
				try {
					const { data: { data: authToken } } = await this.restOperations.get(`/v2${this.prefixPath}/auth/token?state=${authState.state}`, {
						signal: ctx.abortController.signal,
						headers: {
							...ctx.traceSpan.requestHeaders,
							["X-No-Authorization"]: "true",
							["X-No-User-Id"]: "true",
							["X-No-Enterprise-Id"]: "true",
							["X-No-Department-Info"]: "true"
						}
					}) || { data: { data: void 0 } };
					if (authToken) {
						authToken.lastRefreshTime = Date.now();
						this.calculateExpiresAt(authToken);
						span.markAsSuccessful();
						return authToken;
					}
				} catch (error) {
					if (error?.code === ServerErrorCode.RetryFetchToken) continue;
					this.logger.error(`fetch auth token error: ${error}`);
					span.markAsFailed(error);
					throw error;
				}
			}
			span.markAsFailed("Timeout");
			throw new TimeoutError();
		}
		async loopGetAccount(authState, authToken, startTime, ctx) {
			const span = ctx.traceSpan.startSpan(SPAN_GET_ACCOUNT);
			let authRetryCount = 0;
			while (Date.now() - startTime < SIGN_IN_PENDING_TIMEOUT) {
				await (0, import_common$10.wait)(SIGN_IN_FETCH_INTERVAL);
				if (ctx.abortController.signal.aborted) {
					span.markAsFailed("Canceled");
					throw new CanceledError();
				}
				try {
					const { data: { data: account } } = await this.restOperations.get(`/v2${this.prefixPath}/login/account?state=${authState.state}`, {
						signal: ctx.abortController.signal,
						headers: {
							...this.enterpriseHeaders(authToken),
							Authorization: `Bearer ${authToken.accessToken}`,
							...ctx.traceSpan.requestHeaders,
							["X-No-User-Id"]: "true",
							["X-No-Enterprise-Id"]: "true",
							["X-No-Department-Info"]: "true"
						}
					}) || { data: { data: void 0 } };
					if (account) {
						span.markAsSuccessful();
						return normalizeAccountAvatar(account);
					}
				} catch (error) {
					if (error?.code === ServerErrorCode.RetryFetchAccount) continue;
					const httpStatus = error?.response?.status;
					if ((httpStatus === 401 || httpStatus === 403) && authRetryCount < MAX_ACCOUNT_AUTH_RETRIES) {
						authRetryCount++;
						this.logger.warn(`[loopGetAccount] HTTP ${httpStatus}, retrying (${authRetryCount}/${MAX_ACCOUNT_AUTH_RETRIES})`);
						continue;
					}
					this.logger.error(`fetch auth account error: ${error}`);
					span.markAsFailed(error);
					throw error;
				}
			}
			span.markAsFailed("Timeout");
			throw new TimeoutError();
		}
		mergeAccountFromSnapshot(account, accountSnapshot) {
			return mergeCurrentAccountDetails(account, this.isWorkbuddyPlatform() ? accountSnapshot.allAccounts : accountSnapshot.accounts);
		}
		toSessionAccountLists(accountSnapshot) {
			return {
				accounts: accountSnapshot.accounts,
				...this.isWorkbuddyPlatform() ? { allAccounts: accountSnapshot.allAccounts } : {}
			};
		}
		isWorkbuddyPlatform() {
			return isWorkbuddyAuthenticationPlatform(this.configuration.authentication?.attributes?.platform ?? this.configuration.platform);
		}
		async getAccountSnapshot(authToken, ctx) {
			const span = ctx.traceSpan.startSpan(SPAN_GET_ACCOUNT_LIST);
			try {
				const { data: { data } } = await this.restOperations.get(`/v2${this.prefixPath}/accounts`, {
					signal: ctx.abortController.signal,
					headers: {
						...this.enterpriseHeaders(authToken),
						Authorization: `Bearer ${authToken.accessToken}`,
						...ctx.traceSpan.requestHeaders
					}
				}) || { data: { data: void 0 } };
				if (data?.accounts?.length) {
					span.markAsSuccessful();
					return createAccountSnapshot(data.accounts);
				}
			} catch (error) {
				span.markAsFailed(error);
				this.logger.error(`fetch auth accounts error: ${error}`);
			}
			span.markAsFailed("accounts is empty");
			return createAccountSnapshot([]);
		}
		classifyFailedStep(error, _startTime) {
			if (error instanceof TimeoutError) return {
				step: "polling",
				errorKind: "timeout"
			};
			if (error instanceof CanceledError) return {
				step: "polling",
				errorKind: "canceled"
			};
			if (error instanceof OpenExternalLinkError) return {
				step: "browser_open",
				errorKind: "open_failed"
			};
			return {
				step: "unknown",
				errorKind: error instanceof Error ? error.constructor.name : "unknown"
			};
		}
		enterpriseHeaders(auth) {
			let domain = "";
			try {
				if (auth?.domain) domain = auth.domain;
				else {
					const endpoint = this.configuration.authentication?.endpoint || this.configuration.endpoint || "";
					domain = URI$1.parse(endpoint).authority;
				}
				return { [HTTP_HEADER_DOMAIN]: domain };
			} catch (e) {
				this.logger.warn(`endpoint domain format error: ${e}`);
				return {};
			}
		}
		calculateExpiresAt(authToken) {
			if (!authToken.expiresAt && authToken.expiresIn) authToken.expiresAt = new Date(Date.now() + authToken.expiresIn * 1e3).getTime();
			if (!authToken.refreshExpiresAt && authToken.refreshExpiresIn) authToken.refreshExpiresAt = new Date(Date.now() + authToken.refreshExpiresIn * 1e3).getTime();
		}
		async isIpLimitError(error) {
			try {
				let errorInfo = error?.response?.data;
				if (errorInfo?.code === RESPONSE_CODE_IP_LIMIT) return true;
				errorInfo = JSON.parse(await this.streamToString(errorInfo));
				return errorInfo?.code === RESPONSE_CODE_IP_LIMIT;
			} catch {
				return false;
			}
		}
		async streamToString(stream) {
			const chunks = [];
			return new Promise((resolve, reject) => {
				stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
				stream.on("error", (err) => reject(err));
				stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
			});
		}
		isAuthenticationInvalidError(error) {
			if (error && error.isAxiosError) {
				const status = error.response?.status;
				return status === 401 || status === 403;
			}
			return false;
		}
		get endpoint() {
			return this.configuration.authentication?.endpoint || this.configuration.endpoint || "";
		}
		get prefixPath() {
			return this.configuration.authentication?.attributes?.prefixPath || "";
		}
	};
if(runtime.authenticationApi){({CanceledError,SignLicenseError,UnauthorizedError}=runtime.authenticationApi);}
return {ExternalLinkAuthenticationProvider,SIGN_IN_PENDING_TIMEOUT,SIGN_IN_FETCH_INTERVAL,SWITCH_ACCOUNT_RETRY_TIMES,MAX_ACCOUNT_AUTH_RETRIES,globalLoginStepVersion,RESPONSE_CODE_IP_LIMIT,ServerErrorCode,LICENSE_ERROR_CODES,AuthenticationType,Edition,HTTP_HEADER_DOMAIN,AuthErrorCode,TimeoutError,CanceledError,OpenExternalLinkError,SignError,SignIpLimitError,SignLicenseError,UnauthorizedError,SPAN_OPEN_EXTERNAL_LINK,SPAN_GET_AUTH_STATE,SPAN_GET_AUTH_TOKEN,SPAN_GET_ACCOUNT,SPAN_GET_ACCOUNT_LIST,setLoginStepCallback,emitLoginStep,toSignLicenseError,normalizeAccountType,normalizeAccountAvatar,createAccountSnapshot,mergeCurrentAccountDetails,isWorkbuddyAuthenticationPlatform};
}
