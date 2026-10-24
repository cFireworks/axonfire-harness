// @ts-nocheck
// Complete original Desktop TerminalProxy with pinned ws and Node socket bindings.
import * as nodeNet from 'node:net';
import WebSocket, { WebSocketServer } from 'ws-native';
export const TERMINAL_PROXY_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const TERMINAL_PROXY_FUNCTIONS=[["extractSessionId",5016679,5016782],["extractToken",5016783,5016942]] as const;
export const TERMINAL_PROXY_VARIABLES=[["TAG$2",5016576,5016601],["DEFAULT_LOGGER",5016607,5016631],["PTY_PATH_RE",5016637,5016677],["TerminalProxy",5016947,5019967]] as const;
export function createNativeTerminalProxy(runtime:any={}):any {
const net=runtime.net ?? nodeNet;
const console=runtime.console ?? globalThis.console;
const import_websocket={default:runtime.WebSocket ?? WebSocket};
const import_websocket_server={default:runtime.WebSocketServer ?? WebSocketServer};
function extractSessionId(url) {
	if (!url) return;
	return PTY_PATH_RE.exec(url.split("?")[0])?.[1];
}
function extractToken(url) {
	if (!url) return;
	try {
		return new URL(url, "http://localhost").searchParams.get("token") ?? void 0;
	} catch {
		return;
	}
}
const TAG$2 = "[TerminalProxy]";
const DEFAULT_LOGGER = console;
const PTY_PATH_RE = /^\/pty\/([a-zA-Z0-9_-]+)/;
const TerminalProxy = class {
	wss;
	logger;
	/**
	* Expected token for authenticating upgrade requests.
	* Set via `start()` -- if empty, token validation is skipped.
	*/
	expectedToken = "";
	constructor(options) {
		this.options = options;
		this.logger = options.logger ?? DEFAULT_LOGGER;
	}
	/**
	* Attach to an existing HTTP server and handle WebSocket upgrades
	* for paths matching `/pty/{sessionId}`.
	*
	* @param server  The HTTP server to hook into.
	* @param token   A shared secret the renderer must supply as `?token=`.
	*/
	start(server, token) {
		this.expectedToken = token;
		this.wss = new import_websocket_server.default({ noServer: true });
		server.on("upgrade", (req, socket, head) => {
			const sessionId = extractSessionId(req.url);
			if (!sessionId) return;
			if (this.expectedToken) {
				if (extractToken(req.url) !== this.expectedToken) {
					this.logger.warn(`${TAG$2} Rejected upgrade for session ${sessionId}: bad token`);
					socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
					socket.destroy();
					return;
				}
			}
			this.wss.handleUpgrade(req, socket, head, (ws) => {
				this.handleUpgrade(sessionId, ws);
			});
		});
		this.logger.log(`${TAG$2} Started -- listening for /pty/{sessionId} upgrades`);
	}
	/**
	* Bridge a single WebSocket to the sidecar data socket for `sessionId`.
	*/
	handleUpgrade(sessionId, ws) {
		const sockPath = this.options.resolveDataSocketPath(sessionId);
		this.logger.log(`${TAG$2} Connecting to data socket: ${sockPath}`);
		const dataSocket = net.createConnection(sockPath);
		dataSocket.on("data", (chunk) => {
			if (ws.readyState === import_websocket.default.OPEN) ws.send(chunk);
		});
		dataSocket.on("error", (err) => {
			this.logger.error(`${TAG$2} Data socket error [${sessionId}]:`, err.message);
			ws.close(1011, "data socket error");
		});
		dataSocket.on("close", () => {
			this.logger.log(`${TAG$2} Data socket closed [${sessionId}]`);
			if (ws.readyState === import_websocket.default.OPEN || ws.readyState === import_websocket.default.CONNECTING) ws.close(1e3, "data socket closed");
		});
		ws.on("message", (data) => {
			if (!dataSocket.writable) return;
			if (Buffer.isBuffer(data)) dataSocket.write(data);
			else if (data instanceof ArrayBuffer) dataSocket.write(Buffer.from(data));
			else if (Array.isArray(data)) dataSocket.write(Buffer.concat(data));
			else dataSocket.write(Buffer.from(String(data), "utf-8"));
		});
		ws.on("close", () => {
			this.logger.log(`${TAG$2} WebSocket closed [${sessionId}]`);
			if (!dataSocket.destroyed) dataSocket.destroy();
		});
		ws.on("error", (err) => {
			this.logger.error(`${TAG$2} WebSocket error [${sessionId}]:`, err.message);
			if (!dataSocket.destroyed) dataSocket.destroy();
		});
	}
	/**
	* Tear down the WebSocket server and close all active connections.
	*/
	stop() {
		if (this.wss) {
			for (const client of this.wss.clients) client.close(1001, "server shutting down");
			this.wss.close();
			this.wss = void 0;
			this.logger.log(`${TAG$2} Stopped`);
		}
	}
};
return {TerminalProxy,extractSessionId,extractToken};
}
