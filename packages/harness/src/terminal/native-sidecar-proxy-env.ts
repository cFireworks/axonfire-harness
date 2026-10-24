// @ts-nocheck
// Original declarations and selected dependency initializers retained verbatim.
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import * as nodeOs from 'node:os';
export const SERVICE_SOURCE={"sources":[{"file":"proxy-env.js","sha256":"bba33b83ef89d9960485bfc5ab300e4782a2cc66c9fe45cb75c892cf95bf799b"}],"segments":[{"file":"proxy-env.js","from":137,"to":203},{"file":"proxy-env.js","from":281,"to":651}],"names":["LOCAL_NO_PROXY_HOSTS","mergeNoProxy"]} as const;
export function createNativeSidecarProxyEnvironment(runtime:any={}):any {
const process=runtime.process ?? globalThis.process, console=runtime.console ?? globalThis.console;

// BEGIN ORIGINAL
var LOCAL_NO_PROXY_HOSTS = [
	"localhost",
	"127.0.0.1",
	"::1"
];
function mergeNoProxy(existing) {
	const values = (existing || "").split(",").map((item) => item.trim()).filter(Boolean);
	const lowerValues = new Set(values.map((item) => item.toLowerCase()));
	for (const host of LOCAL_NO_PROXY_HOSTS) if (!lowerValues.has(host.toLowerCase())) {
		values.push(host);
		lowerValues.add(host.toLowerCase());
	}
	return values.join(",");
}
// END ORIGINAL
return {LOCAL_NO_PROXY_HOSTS,mergeNoProxy};
}
