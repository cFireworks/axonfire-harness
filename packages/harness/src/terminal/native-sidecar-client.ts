// @ts-nocheck
// Complete original client; module bootstrap has no client-side protocol behavior.
import * as nodeNet from 'node:net';
import * as nodeEvents from 'node:events';
import {createNativeSidecarEnvironment} from './native-sidecar-environment.js';
export const SIDECAR_CLIENT_SOURCE={"file":"cli-prewarm-pool.js","sha256":"ecb7ff634b205288b5ea236519f01292a0a2d02802e1bded03d382532ec3f296","from":1267,"to":6399,"names":["log","logError","SidecarClient"]} as const;
export function createNativeSidecarClient(runtime:any={}):any {
const net=runtime.net ?? nodeNet;
const node_events=nodeEvents;
const require_cli_process_env=runtime.environment ?? createNativeSidecarEnvironment();
const console=runtime.console ?? globalThis.console;
function log(...args) {
	console.log("[Sidecar:Client]", ...args);
}
function logError(...args) {
	console.error("[Sidecar:Client]", ...args);
}
var SidecarClient = class {
	socket = null;
	socketPath;
	nextId = 1;
	pending = /* @__PURE__ */ new Map();
	notificationHandler = null;
	closeHandler = null;
	buffer = "";
	constructor(socketPath) {
		this.socketPath = socketPath ?? require_cli_process_env.controlSocketPath();
	}
	get isConnected() {
		return this.socket !== null;
	}
	connect() {
		return new Promise((resolve, reject) => {
			const socket = net.createConnection(this.socketPath);
			socket.on("connect", () => {
				this.socket = socket;
				this.setupDataHandler(socket);
				log("Connected to", this.socketPath);
				resolve();
			});
			socket.on("error", (err) => {
				if (!this.socket) reject(err);
				else {
					logError("Socket error:", err.message);
					this.rejectAllPending(/* @__PURE__ */ new Error(`Socket error: ${err.message}`));
				}
			});
			socket.on("close", () => {
				const wasConnected = this.socket !== null;
				this.socket = null;
				this.rejectAllPending(/* @__PURE__ */ new Error("Socket closed"));
				if (wasConnected) {
					log("Socket closed:", this.socketPath);
					const handler = this.closeHandler;
					if (handler) try {
						handler();
					} catch (err) {
						logError("closeHandler threw:", err);
					}
				}
			});
		});
	}
	onClose(handler) {
		this.closeHandler = handler;
	}
	setupDataHandler(socket) {
		socket.on("data", (chunk) => {
			this.buffer += chunk.toString("utf-8");
			let newlineIdx;
			while ((newlineIdx = this.buffer.indexOf("\n")) !== -1) {
				const line = this.buffer.slice(0, newlineIdx).trim();
				this.buffer = this.buffer.slice(newlineIdx + 1);
				if (line.length > 0) this.handleMessage(line);
			}
		});
	}
	handleMessage(raw) {
		let msg;
		try {
			msg = JSON.parse(raw);
		} catch {
			logError("Failed to parse message:", raw);
			return;
		}
		if (!("id" in msg) || msg.id === void 0) {
			const notif = msg;
			if (this.notificationHandler) this.notificationHandler(notif.method, notif.params);
			return;
		}
		const resp = msg;
		const pending = this.pending.get(resp.id);
		if (!pending) {
			logError("Received response for unknown id:", resp.id);
			return;
		}
		this.pending.delete(resp.id);
		clearTimeout(pending.timer);
		if (resp.error) {
			const err = new Error(resp.error.message);
			err.code = resp.error.code;
			err.data = resp.error.data;
			pending.reject(err);
		} else pending.resolve(resp.result);
	}
	sendRequest(method, params, timeoutMs = require_cli_process_env.RPC_TIMEOUT_MS) {
		return new Promise((resolve, reject) => {
			if (!this.socket) {
				reject(/* @__PURE__ */ new Error("Not connected"));
				return;
			}
			const id = this.nextId++;
			const req = {
				jsonrpc: "2.0",
				id,
				method,
				params
			};
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(/* @__PURE__ */ new Error(`RPC timeout: ${method} (${timeoutMs}ms)`));
			}, timeoutMs);
			this.pending.set(id, {
				resolve,
				reject,
				timer
			});
			try {
				this.socket.write(`${JSON.stringify(req)}\n`);
			} catch (err) {
				this.pending.delete(id);
				clearTimeout(timer);
				reject(err);
			}
		});
	}
	onNotification(handler) {
		this.notificationHandler = handler;
	}
	async ping() {
		return await this.sendRequest("sidecar.ping");
	}
	async createSession(params) {
		return await this.sendRequest("session.create", params, require_cli_process_env.SESSION_CREATE_RPC_TIMEOUT_MS);
	}
	async reconnectSession(sessionId, cols, rows) {
		return await this.sendRequest("session.reconnect", {
			sessionId,
			cols,
			rows
		}, require_cli_process_env.SESSION_LIFECYCLE_RPC_TIMEOUT_MS);
	}
	async resizeSession(sessionId, cols, rows) {
		await this.sendRequest("session.resize", {
			sessionId,
			cols,
			rows
		});
	}
	async killSession(sessionId) {
		await this.sendRequest("session.kill", { sessionId });
	}
	async listSessions() {
		return await this.sendRequest("session.list");
	}
	async captureSession(sessionId, lines) {
		return (await this.sendRequest("session.capture", {
			sessionId,
			lines
		})).text;
	}
	/**
	* 请求 sidecar 优雅退出并等控制 socket 真正关闭。sidecar 先 ack 再异步收尾
	* （见 server.ts 的 sidecar.shutdown 分支），所以 RPC 用默认超时即可。
	* AbortSignal.timeout 的定时器不阻止进程退出。
	*
	* @returns 控制 socket 是否在超时前关闭（false = sidecar 可能仍在收尾）。
	*/
	async shutdown() {
		await this.sendRequest("sidecar.shutdown");
		const socket = this.socket;
		if (!socket) return true;
		return (0, node_events.once)(socket, "close", { signal: AbortSignal.timeout(require_cli_process_env.SIDECAR_GRACEFUL_EXIT_TIMEOUT_MS) }).then(() => true, () => false);
	}
	attachDataSocket(sessionId) {
		return net.createConnection(require_cli_process_env.dataSocketPath(sessionId));
	}
	dispose() {
		this.rejectAllPending(/* @__PURE__ */ new Error("Client disposed"));
		if (this.socket) {
			this.socket.destroy();
			this.socket = null;
		}
	}
	rejectAllPending(err) {
		for (const [, pending] of this.pending) {
			clearTimeout(pending.timer);
			pending.reject(err);
		}
		this.pending.clear();
	}
};
//#endregion

return {SidecarClient};
}
