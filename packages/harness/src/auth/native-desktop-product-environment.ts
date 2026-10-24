// @ts-nocheck
// Original Desktop environment selection and synchronization; explicit container binding only.
export const DESKTOP_PRODUCT_ENVIRONMENT_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":2540798,"to":2540854},{"from":2542088,"to":2542419},{"from":2542421,"to":2542511},{"from":2720953,"to":2723020}]} as const;
export function createNativeDesktopProductEnvironment(runtime:any={}){
const process=runtime.process??globalThis.process;var ProductEnvServiceImpl,ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager;
const import_common={ContainerUtil:{get:(id)=>{if(id===AuthenticationManager&&runtime.authenticationManager)return runtime.authenticationManager;throw new Error('Desktop authentication manager is not bound');}}};
AuthenticationManager = Symbol("AuthenticationManager");
ProductEnviroment = /* @__PURE__ */ function(ProductEnviroment) {
		ProductEnviroment["External"] = "external";
		ProductEnviroment["Internal"] = "internal";
		ProductEnviroment["IOA"] = "iOA";
		ProductEnviroment["Selfhosted"] = "selfhosted";
		ProductEnviroment["Cloudhosted"] = "cloudhosted";
		return ProductEnviroment;
	}({});
ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT = "CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT";
ProductEnvServiceImpl = class ProductEnvServiceImpl {
		async switch(env) {
			process.env[ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT] = env || "";
			await this.productManager.sync();
		}
		async switchBySession(session) {
			if (!session) return;
			const enviroment = await this.resolveEnvBySession(session);
			await this.switch(enviroment);
		}
		async getCurrent() {
			if (process.env["CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT"]) return process.env[ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
			const product = await this.productManager.waitConfiguration();
			if (product.networkEnvironment) return product.networkEnvironment;
			const session = import_common.ContainerUtil.get(AuthenticationManager).currentSessionSubject.getValue();
			return this.resolveEnvBySession(session);
		}
		async resolveEnvBySession(session) {
			if (!session) return;
			const product = await this.productManager.waitConfiguration();
			if (this.isDomain(product.authentication?.attributes?.internalDomain, session.auth.domain)) return ProductEnviroment.Internal;
			else if (this.isDomain(product.authentication?.attributes?.iOADomain, session.auth.domain)) return ProductEnviroment.IOA;
			else if (this.isDomain(product.authentication?.attributes?.cloudHostedDomain, session.auth.domain)) return ProductEnviroment.Cloudhosted;
			else if (this.isDomain(product.authentication?.attributes?.externalDomain, session.auth.domain)) return ProductEnviroment.External;
			else if (session.auth.domain) return ProductEnviroment.Selfhosted;
		}
		isDomain(configDomain, currentDomain) {
			if (!configDomain || !currentDomain) return false;
			if (Array.isArray(configDomain)) return configDomain.some((domain) => this.matchDomain(domain, currentDomain));
			return this.matchDomain(configDomain, currentDomain);
		}
		matchDomain(pattern, domain) {
			if (pattern === domain) return true;
			if (!pattern.includes("*")) return false;
			const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]*");
			return new RegExp(`^${regexPattern}$`).test(domain);
		}
	};
return {ProductEnvServiceImpl,ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager};
}
