// @ts-nocheck
// Original application authentication/environment overrides and bootstrap storage.
import * as nodeFs from 'node:fs';import {createNativeDesktopAuthentication} from './native-desktop-authentication.js';import {createNativeDesktopProductManager} from '../config/native-desktop-product-manager.js';
export const WORKBUDDY_AUTH_BINDINGS_SOURCE=[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":36825,"to":37444},{"from":2540798,"to":2540854},{"from":2541597,"to":2542086},{"from":2542421,"to":2542511}]},{"file":"cli-product-env.js","sha256":"24f55af8cb6e028e5755d0c9731f037acd0116a82ba80e557ad75a499258d7f2","regions":[{"from":4099,"to":4431},{"from":5256,"to":5322}]},{"file":"module.app-server.js","sha256":"965b5e0124e633fc71dd2a7adc2d777ce1b621631fd30994a03a544e3e23c37d","regions":[{"from":9563,"to":9648},{"from":9649,"to":9744},{"from":9745,"to":10932},{"from":11755,"to":11801},{"from":11802,"to":11890},{"from":11891,"to":12310},{"from":12990,"to":13477},{"from":752307,"to":754245}]}] as const;
export function createNativeWorkbuddyAuthBindings(runtime:any={}){
const process=runtime.process??globalThis.process,fs=runtime.fs??nodeFs;const authenticationApi=runtime.authenticationApi??createNativeDesktopAuthentication(runtime);
var AuthenticationType,AuthenticationStoragePriority,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager,AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY;
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
AuthenticationManager = Symbol("AuthenticationManager");
AuthenticationStoragePriority = /* @__PURE__ */ function(AuthenticationStoragePriority) {
		AuthenticationStoragePriority[AuthenticationStoragePriority["Disabled"] = 0] = "Disabled";
		AuthenticationStoragePriority[AuthenticationStoragePriority["Low"] = 1] = "Low";
		AuthenticationStoragePriority[AuthenticationStoragePriority["Normal"] = 5] = "Normal";
		AuthenticationStoragePriority[AuthenticationStoragePriority["Heigh"] = 9] = "Heigh";
		return AuthenticationStoragePriority;
	}({});
ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT = "CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT";
function readAgentCliProductConfigJsonByKey(key, env = process.env) {
	const inline = env[key];
	if (inline) return inline;
	if (key !== "ACC_PRODUCT_CONFIG_V3") return;
	const filePath = env[AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY];
	if (!filePath) return;
	try {
		return fs.readFileSync(filePath, "utf8");
	} catch {
		return;
	}
}
AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY = "ACC_PRODUCT_CONFIG_PATH";
const require_common$2={...authenticationApi,AuthenticationType,AuthenticationStoragePriority,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager},require_cli_product_env={readAgentCliProductConfigJsonByKey},require_workbuddy_product_config=runtime.productConfig??createNativeDesktopProductManager(runtime).productConfig;
const require_workbuddy_auth_product_coordinator={WorkbuddyAuthProductCoordinator:Symbol('WorkbuddyAuthProductCoordinator')};
const import_common$1={ContainerUtil:{get:(id)=>{if(id===AuthenticationManager){const value=runtime.getAuthenticationManager?.()??runtime.authenticationManager;if(value)return value;}if(id===require_workbuddy_auth_product_coordinator.WorkbuddyAuthProductCoordinator){const value=runtime.getCoordinator?.()??runtime.coordinator;if(value)return value;}throw new Error('Workbuddy authentication dependency is not bound');}}};
var ACC_PRODUCT_CONFIG_ENV_KEYS = ["ACC_PRODUCT_CONFIG_V3", "ACC_PRODUCT_CONFIG_V2"];
var BOOTSTRAP_FILE_STORAGE_PRIORITY = require_common$2.AuthenticationStoragePriority.Heigh + 2;
var WorkbuddyBootstrapAuthenticationStorage = class WorkbuddyBootstrapAuthenticationStorage {
	fileAuthenticationStorage;
	get storeSessionSubject() {
		return this.fileAuthenticationStorage.storeSessionSubject;
	}
	async priority() {
		const authenticationType = this.getBootstrapAuthenticationType();
		if (!authenticationType || authenticationType === require_common$2.AuthenticationType.CUSTOM_TOKEN) return require_common$2.AuthenticationStoragePriority.Disabled;
		return BOOTSTRAP_FILE_STORAGE_PRIORITY;
	}
	async store(session, options) {
		await this.fileAuthenticationStorage.store(session, options);
	}
	async restore() {
		return this.fileAuthenticationStorage.restore();
	}
	async beginLogout() {
		return this.fileAuthenticationStorage.beginLogout();
	}
	async clean(options) {
		return this.fileAuthenticationStorage.clean(options);
	}
	getBootstrapAuthenticationType() {
		for (const key of ACC_PRODUCT_CONFIG_ENV_KEYS) {
			const value = require_cli_product_env.readAgentCliProductConfigJsonByKey(key);
			if (!value) continue;
			try {
				const config = JSON.parse(value);
				if (config.authentication?.type) return config.authentication.type;
			} catch {}
		}
	}
};
var workbuddyAuthSessionSyncer = () => void 0;
function setWorkbuddyAuthSessionSyncer(syncer) {
	workbuddyAuthSessionSyncer = syncer;
}
var WorkbuddyAuthenticationManager = class WorkbuddyAuthenticationManager extends require_common$2.AuthenticationManagerImpl {
	/**
	* 同身份重复触发（token 刷新风暴）的去重不在这一层做——desktop coordinator 的
	* syncResolvedProduct 会用它自己的 getRemoteRefreshKey + TTL 吸收重复触发，
	* 去重与它保护的 /v3/config 拉取保持在同一层，身份维度只维护一份。
	*/
	async syncProductAfterSessionChange(session) {
		if (!session) return;
		await workbuddyAuthSessionSyncer(session);
	}
};
var WorkbuddyUserinfoProvider = class WorkbuddyUserinfoProvider {
	authenticationManager;
	async provide() {
		const session = this.authenticationManager.currentSessionSubject.getValue();
		return {
			userId: session?.account.uid ?? "",
			userName: session?.account.nickname ?? "",
			userNickname: session?.account.nickname ?? "",
			enterpriseId: session?.account.enterpriseId,
			token: session?.auth.accessToken ?? "",
			enterprise: session?.account?.departmentFullName
		};
	}
};
var WorkbuddyProductEnvService = class WorkbuddyProductEnvService {
	logger;
	productManager;
	lastSwitchedEnv;
	init() {
		this.logger.setContext("WorkbuddyProductEnvService");
		const currentEnv = process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
		if (currentEnv) {
			this.lastSwitchedEnv = currentEnv;
			return;
		}
		const resolvedEnv = require_workbuddy_product_config.resolveWorkbuddyProductEnvironmentFromSessionFile();
		if (resolvedEnv) {
			process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT] = resolvedEnv;
			this.lastSwitchedEnv = resolvedEnv;
		}
	}
	async switch(env) {
		if (env) {
			if (env === this.lastSwitchedEnv && process.env["CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT"] === env) return;
			this.lastSwitchedEnv = env;
			process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT] = env;
			return;
		}
		this.lastSwitchedEnv = void 0;
		delete process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
	}
	async switchBySession(session) {
		const coordinator = this.getCoordinator();
		const resolvedEnv = session ? coordinator.resolveEnvironment(session, this.productManager.configuration.getValue()) : void 0;
		await this.switch(resolvedEnv);
		coordinator.publishResolvedSnapshot(session, this.productManager.configuration.getValue(), "product-env-switch");
	}
	async getCurrent() {
		const currentEnv = process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
		if (currentEnv) return currentEnv;
		const session = import_common$1.ContainerUtil.get(require_common$2.AuthenticationManager).currentSessionSubject.getValue();
		return this.getCoordinator().getResolvedSnapshot(this.productManager.configuration.getValue(), session).networkEnvironment;
	}
	getCoordinator() {
		return import_common$1.ContainerUtil.get(require_workbuddy_auth_product_coordinator.WorkbuddyAuthProductCoordinator);
	}
};
return {authenticationApi,AuthenticationType,AuthenticationStoragePriority,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,readAgentCliProductConfigJsonByKey,ACC_PRODUCT_CONFIG_ENV_KEYS,BOOTSTRAP_FILE_STORAGE_PRIORITY,WorkbuddyBootstrapAuthenticationStorage,setWorkbuddyAuthSessionSyncer,WorkbuddyAuthenticationManager,WorkbuddyProductEnvService,WorkbuddyUserinfoProvider};
}
