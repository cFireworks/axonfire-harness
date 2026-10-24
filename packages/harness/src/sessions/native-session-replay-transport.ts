// @ts-nocheck
// Original Desktop replay request and gateway-secret service; one factory per parent.
import * as crypto from 'node:crypto';
export const REPLAY_TRANSPORT_MAIN_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const REPLAY_TRANSPORT_MAIN_FUNCTIONS=[["requestWorkbuddySessionReplay",5014483,5015514],["raceWithSignal",5015966,5016486],["buildSessionReplayRequestHeaders",5014312,5014482],["parseCliJsonResponse",5015515,5015808],["toScopedSessionReplayPayload",3571713,3572036],["isOwnerReplayHydratablePayload",3572622,3572993]] as const;
export const REPLAY_TRANSPORT_MAIN_VARIABLES=[["REPLAY_HISTORY_LIMIT",5014284,5014310],["GATEWAY_REQUEST_HEADER",5014192,5014238],["GATEWAY_REQUEST_HEADER_VALUE",5014244,5014278]] as const;
export const REPLAY_TRANSPORT_SECRET_SHA256='7ca68692ef59f290ae4968e90f43d08adf72083899b2d852aec03b3aef836415';
export const REPLAY_TRANSPORT_SECRET_FUNCTIONS=[["getGatewaySecret",1603,1742],["gatewaySecretEnv",1845,2013],["gatewaySecretHeaders",2093,2187]] as const;
export const REPLAY_TRANSPORT_SECRET_VARIABLES=[["GATEWAY_AUTH_MODE_ENV",1178,1226],["GATEWAY_PASSWORD_ENV",1232,1283],["GATEWAY_DISABLE_API_DOCS_ENV",1352,1419],["cachedSecret",1425,1437]] as const;
export function createNativeSessionReplayTransport(): any {
let REPLAY_HISTORY_LIMIT = 5e3;
let GATEWAY_REQUEST_HEADER = "X-CodeBuddy-Request";
let GATEWAY_REQUEST_HEADER_VALUE = "1";
async function requestWorkbuddySessionReplay({ runtimeManager, sessionId, fetchFn = fetch, limit = REPLAY_HISTORY_LIMIT, signal, cwd }) {
	const endpoint = signal ? await raceWithSignal(runtimeManager.getHostEndpoint(), signal, `getHostEndpoint aborted for session "${sessionId}"`) : await runtimeManager.getHostEndpoint();
	const params = new URLSearchParams({ limit: String(limit) });
	const trimmedCwd = cwd?.trim();
	if (trimmedCwd) params.set("cwd", trimmedCwd);
	const response = await fetchFn(`${endpoint}/api/v1/sessions/${encodeURIComponent(sessionId)}/replay?${params.toString()}`, {
		headers: buildSessionReplayRequestHeaders(),
		signal
	});
	if (!response.ok) {
		const message = await response.text().catch(() => response.statusText);
		throw new Error(`Failed to fetch session replay for "${sessionId}": HTTP ${response.status}: ${message}`);
	}
	const parsed = await parseCliJsonResponse(response);
	parsed.data.replayTiming = {
		...parsed.data.replayTiming || {},
		bytes: parsed.bytes
	};
	return parsed.data;
}
function raceWithSignal(promise, signal, timeoutMessage) {
	if (signal.aborted) return Promise.reject(signal.reason ?? new Error(timeoutMessage));
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(signal.reason ?? new Error(timeoutMessage));
		signal.addEventListener("abort", onAbort, { once: true });
		promise.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (error) => {
			signal.removeEventListener("abort", onAbort);
			reject(error);
		});
	});
}
function buildSessionReplayRequestHeaders() {
	return {
		[GATEWAY_REQUEST_HEADER]: GATEWAY_REQUEST_HEADER_VALUE,
		...require_gateway_secret.gatewaySecretHeaders()
	};
}
async function parseCliJsonResponse(response) {
	const text = await response.text();
	const bytes = Buffer.byteLength(text, "utf8");
	const data = JSON.parse(text);
	if (data && typeof data === "object" && "data" in data) return {
		data: data.data,
		bytes
	};
	return {
		data,
		bytes
	};
}
function toScopedSessionReplayPayload(event) {
	if (event.type === "sessionUpdate") return {
		sessionId: event.sessionId,
		update: event.update,
		...event._meta ? { _meta: event._meta } : {}
	};
	return {
		type: "extNotification",
		sessionId: event.sessionId,
		method: event.method,
		params: event.params ?? {}
	};
}
function isOwnerReplayHydratablePayload(payload) {
	const payloadType = typeof payload.type === "string" ? payload.type : null;
	if (payloadType === "questionRequest" || payloadType === "permissionRequest" || payloadType === "questionCancelled" || payloadType === "elicitationRequest") return true;
	return Boolean(payload.update && typeof payload.update === "object");
}
let GATEWAY_AUTH_MODE_ENV = "CODEBUDDY_GATEWAY_AUTH";
let GATEWAY_PASSWORD_ENV = "CODEBUDDY_GATEWAY_PASSWORD";
let GATEWAY_DISABLE_API_DOCS_ENV = "CODEBUDDY_GATEWAY_DISABLE_API_DOCS";
let cachedSecret;
function getGatewaySecret() {
	if (!cachedSecret) cachedSecret = (0, crypto.randomBytes)(32).toString("base64url");
	return cachedSecret;
}
function gatewaySecretEnv() {
	return {
		[GATEWAY_AUTH_MODE_ENV]: "password",
		[GATEWAY_PASSWORD_ENV]: getGatewaySecret(),
		[GATEWAY_DISABLE_API_DOCS_ENV]: "1"
	};
}
function gatewaySecretHeaders() {
	return { Authorization: `Bearer ${getGatewaySecret()}` };
}

const require_gateway_secret={getGatewaySecret,gatewaySecretHeaders,gatewaySecretEnv};
return {requestWorkbuddySessionReplay,parseCliJsonResponse,toScopedSessionReplayPayload,isOwnerReplayHydratablePayload,getGatewaySecret,gatewaySecretHeaders,gatewaySecretEnv};
}
