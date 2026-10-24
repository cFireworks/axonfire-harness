// @ts-nocheck
// Original Desktop authentication and endpoint interceptor declarations and initializers.
export const DESKTOP_PRODUCT_INTERCEPTORS_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","names":["DeploymentType","PRODUCT","HTTP_HEADER_USER_ID","HTTP_HEADER_ENTERPRISE_ID","HTTP_HEADER_DEPARTMENT_INFO","HTTP_HEADER_TENANT_ID","HTTP_HEADER_DOMAIN","HTTP_HEADER_SKIP_AUTH_INTERCEPTOR","PRODUCT_REQUEST_PATHS","WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV","productEndpointOverride","_earlyEnvOverride","ProductEndpointHttpInterceptor","LOGOUT_BYPASS_PATHS","LOGOUT_BYPASS_PATH_PATTERNS","AuthenticationHttpInterceptor"],"regions":[{"from":35791,"to":36016},{"from":750366,"to":750388},{"from":764410,"to":764454},{"from":1005520,"to":1005606},{"from":1005607,"to":1005681},{"from":1006111,"to":1006228},{"from":1006230,"to":1006302},{"from":1006304,"to":1006356},{"from":1006358,"to":1006471},{"from":1006473,"to":1006561},{"from":1006563,"to":1007667},{"from":2540906,"to":2540940},{"from":2540942,"to":2540988},{"from":2540990,"to":2541040},{"from":2541042,"to":2541080},{"from":2541082,"to":2541114},{"from":2541324,"to":2541386},{"from":2610658,"to":2610796},{"from":2610798,"to":2610962},{"from":2610964,"to":2615792}]} as const;
export function createNativeDesktopProductInterceptors(runtime:any={}) {
const process=runtime.process??{env:runtime.env??globalThis.process.env};
const ProductManager=Symbol('ProductManager'),import_common$35={ContainerUtil:{get:(key)=>{if(key!==ProductManager||!runtime.productManager)throw Error('Desktop interceptor requires productManager');return runtime.productManager;}}};
const HttpHeaders={},import_common$7={HttpHeaders};var DeploymentType,PRODUCT,HTTP_HEADER_USER_ID,HTTP_HEADER_ENTERPRISE_ID,HTTP_HEADER_DEPARTMENT_INFO,HTTP_HEADER_TENANT_ID,HTTP_HEADER_DOMAIN,HTTP_HEADER_SKIP_AUTH_INTERCEPTOR,PRODUCT_REQUEST_PATHS,WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV,productEndpointOverride,_earlyEnvOverride,ProductEndpointHttpInterceptor,LOGOUT_BYPASS_PATHS,LOGOUT_BYPASS_PATH_PATTERNS,AuthenticationHttpInterceptor;
DeploymentType = /* @__PURE__ */ function(DeploymentType) {
		DeploymentType["SaaS"] = "SaaS";
		DeploymentType["CloudHosted"] = "Cloud-Hosted";
		DeploymentType["SelfHosted"] = "Self-Hosted";
		return DeploymentType;
	}({});
PRODUCT = "X-Product";
HttpHeaders.AUTHORIZATION = "Authorization";
function setProductEndpointOverride(override) {
	productEndpointOverride = override;
}
function getProductEndpointOverride() {
	return productEndpointOverride;
}
PRODUCT_REQUEST_PATHS = [
		"/v2/config",
		"/v3/config",
		"/config/models",
		"/config/agents",
		"git.woa.com"
	];
WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV = "WORKBUDDY_DEV_ENDPOINT_OVERRIDE";
productEndpointOverride = { resolve: () => void 0 };
_earlyEnvOverride = typeof process !== "undefined" ? process.env?.[WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV] : void 0;
if (_earlyEnvOverride) setProductEndpointOverride({ resolve: () => _earlyEnvOverride });
ProductEndpointHttpInterceptor = class ProductEndpointHttpInterceptor {
		initialize() {
			const envOverride = process.env?.[WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV];
			if (envOverride && !productEndpointOverride.resolve()) setProductEndpointOverride({ resolve: () => envOverride });
			this.restOperations.interceptors.request.use(async (config) => {
				const productManager = import_common$35.ContainerUtil.get(ProductManager);
				if (PRODUCT_REQUEST_PATHS.find((item) => config.url?.includes(item))) {
					if (!config.baseURL) config.baseURL = productManager.getEndpoint();
				} else {
					await productManager.waitConfiguration();
					config.baseURL = productManager.getEndpoint();
				}
				const overrideEndpoint = productEndpointOverride.resolve();
				if (overrideEndpoint) config.baseURL = overrideEndpoint;
				if (!config.headers) config.headers = {};
				if (!config.headers["X-Product"]) config.headers[PRODUCT] = productManager.getCurrentConfiguration()?.deploymentType ?? productManager.configuration.getValue()?.deploymentType ?? DeploymentType.SaaS;
				return config;
			});
		}
	};
HTTP_HEADER_USER_ID = "X-User-Id";
HTTP_HEADER_ENTERPRISE_ID = "X-Enterprise-Id";
HTTP_HEADER_DEPARTMENT_INFO = "X-Department-Info";
HTTP_HEADER_TENANT_ID = "X-Tenant-Id";
HTTP_HEADER_DOMAIN = "X-Domain";
HTTP_HEADER_SKIP_AUTH_INTERCEPTOR = "X-Skip-Auth-Interceptor";
LOGOUT_BYPASS_PATHS = [
		"/api/memory/profile",
		"/api/memory/search",
		"/api/memory/clear_profile",
		"/api/memory/update_profile"
	];
LOGOUT_BYPASS_PATH_PATTERNS = [/^\/v2\/enterprises\/[^/]+\/member-custom-model-policy\/user-check$/, /^\/v2\/enterprises\/[^/]+\/skill-upload-policy\/user-check$/];
AuthenticationHttpInterceptor = class AuthenticationHttpInterceptor {
		initialize() {
			this.restOperations.interceptors.request.use((config) => {
				if (!config.headers) config.headers = {};
				if (config.headers["X-Skip-Auth-Interceptor"]) {
					delete config.headers[HTTP_HEADER_SKIP_AUTH_INTERCEPTOR];
					return config;
				}
				const currentSession = this.authenticationManager.currentSessionSubject.getValue();
				if (currentSession) {
					const { account, auth } = currentSession;
					if (!config.headers[import_common$7.HttpHeaders.AUTHORIZATION] && auth.accessToken && !config.headers["X-No-Authorization"]) config.headers[import_common$7.HttpHeaders.AUTHORIZATION] = `Bearer ${auth.accessToken}`;
					if (!config.headers["X-User-Id"] && account?.uid && !config.headers["X-No-User-Id"]) config.headers[HTTP_HEADER_USER_ID] = account.uid;
					if (!config.headers["X-Enterprise-Id"] && account?.enterpriseId && !config.headers["X-No-Enterprise-Id"]) config.headers[HTTP_HEADER_ENTERPRISE_ID] = account.enterpriseId;
					if (!config.headers["X-Department-Info"] && account?.departmentFullName && !config.headers["X-No-Department-Info"]) config.headers[HTTP_HEADER_DEPARTMENT_INFO] = account.departmentFullName;
					if (!config.headers["X-Tenant-Id"] && account?.enterpriseId) config.headers[HTTP_HEADER_TENANT_ID] = account.enterpriseId;
					if (!config.headers["X-Domain"] && auth.domain) config.headers[HTTP_HEADER_DOMAIN] = auth.domain;
				}
				return config;
			});
			this.restOperations.interceptors.response.use(async (response) => {
				const res = response?.data;
				try {
					if (res?.code === 401 && response.config.headers?.Authorization) this.checkToLogout(`${response.config.headers.Authorization}`, response.config.baseURL, response.config.url);
				} catch {
					this.logger.warn("Failed to get response code");
				}
				return response;
			}, (error) => {
				if (error.response?.status === 401 && error.response.config.headers?.Authorization) this.checkToLogout(`${error.response.config.headers.Authorization}`, error.response.config.baseURL, error.response.config.url);
				return Promise.reject(error);
			});
		}
		checkToLogout(requestAuthorization, baseURl, url) {
			const requestAuthToken = `${requestAuthorization}`.substring(7);
			const currentAuthToken = this.authenticationManager.currentSessionSubject.getValue()?.auth?.accessToken;
			if (requestAuthToken && requestAuthToken === currentAuthToken) {
				const currentEndpoint = this.productManager.getEndpoint();
				if (currentEndpoint && !this.isEndpointMatch(currentEndpoint, baseURl, url)) {
					this.logger.warn(`401 ignored (endpoint mismatch): request baseURL=${baseURl}, url=${url}, current endpoint=${currentEndpoint}`);
					return;
				}
				const endpointOverride = getProductEndpointOverride().resolve();
				if (endpointOverride && baseURl && !this.isEndpointMatch(endpointOverride, baseURl, url)) {
					this.logger.warn(`401 ignored (endpoint override mismatch): request baseURL=${baseURl}, override=${endpointOverride}`);
					return;
				}
				if (this.isLogoutWhitelistedPath(url, baseURl)) {
					this.logger.warn(`401 ignored (path whitelisted): request baseURL=${baseURl}, url=${url}`);
					return;
				}
				this.logger.warn(`[AuthInterceptor] triggering logout: baseURL=${baseURl}, url=${url}, currentEndpoint=${currentEndpoint}`);
				this.notifier.warn("Session expired. You have been automatically logged out.");
				this.authenticationManager.logout();
			}
		}
		/**
		* 判断当前请求 url 的 path 是否落在登出白名单内。
		*
		* 仅按 url path 维度匹配，不做子串匹配，避免 `/api/memory/profile-extra`
		* 这类前缀近似的路径被错误命中。绝对 URL 用 `new URL().pathname`，相对路径
		* 直接以 `?` 之前的部分作为 path；解析失败一律保守返回 false（仍走原 logout 流程）。
		*
		* 匹配两类白名单：`LOGOUT_BYPASS_PATHS`（字面量精确匹配）与
		* `LOGOUT_BYPASS_PATH_PATTERNS`（含动态段的正则匹配）。源自 ADR-005 / issue-65830。
		*/
		isLogoutWhitelistedPath(url, _baseURL) {
			if (!url) return false;
			try {
				let path;
				if (/^https?:\/\//i.test(url)) path = new URL(url).pathname;
				else {
					const queryIdx = url.indexOf("?");
					path = queryIdx >= 0 ? url.slice(0, queryIdx) : url;
				}
				return LOGOUT_BYPASS_PATHS.includes(path) || LOGOUT_BYPASS_PATH_PATTERNS.some((pattern) => pattern.test(path));
			} catch {
				return false;
			}
		}
		/**
		* 判断请求目标是否匹配产品 endpoint。
		*
		* 注意：ProductEndpointHttpInterceptor 会给所有经过 restOperations 的请求注入
		* baseURL = 产品 endpoint，因此 baseURL 不能作为可靠的判断依据。
		* 当 url 是完整的绝对 URL 时（自定义模型场景），应优先用 url 判断实际请求目标。
		*
		* 返回 true 表示匹配（即请求指向产品自身的服务端），false 表示不匹配（即请求指向外部服务）。
		*/
		isEndpointMatch(currentEndpoint, baseURl, url) {
			if (url && /^https?:\/\//i.test(url)) return url.startsWith(currentEndpoint) || currentEndpoint.startsWith(url);
			if (baseURl) return baseURl.startsWith(currentEndpoint) || currentEndpoint.startsWith(baseURl);
			return true;
		}
	};
return {AuthenticationHttpInterceptor,ProductEndpointHttpInterceptor,getProductEndpointOverride,setProductEndpointOverride};
}
