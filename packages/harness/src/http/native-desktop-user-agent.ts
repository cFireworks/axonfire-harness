// @ts-nocheck
// Complete original User-Agent interceptor and original header constants.
export const DESKTOP_USER_AGENT_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":771660,"to":771698},{"from":1020488,"to":1020541},{"from":1025036,"to":1026102}]} as const;
export function createNativeDesktopUserAgent(){
const HttpHeaders={},import_common$31={HttpHeaders};var UserAgentHttpInterceptor,SkipUserAgentMergeHeader;
HttpHeaders.USER_AGENT = "User-Agent";
SkipUserAgentMergeHeader = "X-Skip-User-Agent-Merge";
UserAgentHttpInterceptor = class UserAgentHttpInterceptor {
		initialize() {
			this.restOperations.interceptors.request.use(async (config) => {
				if (!config.headers) config.headers = {};
				if (config.headers["X-Skip-User-Agent-Merge"]) {
					delete config.headers[SkipUserAgentMergeHeader];
					return config;
				}
				config.headers[import_common$31.HttpHeaders.USER_AGENT] = await this.buildUserAgent(`${config.headers[import_common$31.HttpHeaders.USER_AGENT] || ""}`);
				return config;
			});
		}
		async buildUserAgent(additionalValue = "") {
			const userAgentInfo = additionalValue ? [additionalValue] : [];
			const clientInfo = await this.clientInfoProvider.get() || {};
			if (clientInfo.productName) userAgentInfo.unshift(`${clientInfo.productName}/${clientInfo.productVersion || "unknown"}`);
			if (clientInfo.platform) userAgentInfo.unshift(`${clientInfo.platform}/${clientInfo.platformVersion || "unknown"}`);
			if (clientInfo.userAgentExtension) userAgentInfo.push(clientInfo.userAgentExtension);
			return userAgentInfo.join(" ");
		}
	};
return {UserAgentHttpInterceptor,SkipUserAgentMergeHeader,HttpHeaders};
}
